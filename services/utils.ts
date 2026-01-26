
/**
 * API Utilities - Retry logic, timeout, and helpers
 */

// ============================================================
// Retry Logic
// ============================================================

interface RetryOptions {
    maxRetries?: number;
    delayMs?: number;
    backoffMultiplier?: number;
    shouldRetry?: (error: any) => boolean;
}

const defaultRetryOptions: Required<RetryOptions> = {
    maxRetries: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
    shouldRetry: (error) => {
        // Retry on network errors or 5xx server errors
        if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
            return true;
        }
        const status = error?.status || error?.statusCode;
        return status >= 500 && status < 600;
    }
};

export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...defaultRetryOptions, ...options };
    let lastError: any;
    let delay = opts.delayMs;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === opts.maxRetries || !opts.shouldRetry(error)) {
                throw error;
            }

            console.warn(`Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms`);
            await sleep(delay);
            delay *= opts.backoffMultiplier;
        }
    }

    throw lastError;
}

// ============================================================
// Timeout
// ============================================================

export async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage = 'Request timed out'
): Promise<T> {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(errorMessage));
        }, timeoutMs);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId!);
        return result;
    } catch (error) {
        clearTimeout(timeoutId!);
        throw error;
    }
}

// ============================================================
// Helpers
// ============================================================

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delayMs: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delayMs);
    };
}

export function throttle<T extends (...args: any[]) => any>(
    fn: T,
    limitMs: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => { inThrottle = false; }, limitMs);
        }
    };
}

// ============================================================
// Validation Helpers
// ============================================================

export const validators = {
    email: (value: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },

    phone: (value: string): boolean => {
        // Thai phone format or international
        const phoneRegex = /^(\+66|0)[0-9]{8,9}$/;
        return phoneRegex.test(value.replace(/[-\s]/g, ''));
    },

    thaiId: (value: string): boolean => {
        // Thai National ID: 13 digits with checksum
        if (!/^\d{13}$/.test(value)) return false;

        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(value[i]) * (13 - i);
        }
        const checkDigit = (11 - (sum % 11)) % 10;
        return parseInt(value[12]) === checkDigit;
    },

    uuid: (value: string): boolean => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
    },

    required: (value: any): boolean => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
    },

    minLength: (value: string, min: number): boolean => {
        return value.length >= min;
    },

    maxLength: (value: string, max: number): boolean => {
        return value.length <= max;
    },

    numeric: (value: string): boolean => {
        return /^\d+$/.test(value);
    },

    date: (value: string): boolean => {
        const date = new Date(value);
        return !isNaN(date.getTime());
    }
};

// ============================================================
// Form Validation
// ============================================================

export interface ValidationRule {
    validate: (value: any) => boolean;
    message: string;
}

export interface FieldValidation {
    [fieldName: string]: ValidationRule[];
}

export function validateForm<T extends Record<string, any>>(
    data: T,
    rules: FieldValidation
): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const [field, fieldRules] of Object.entries(rules)) {
        const value = data[field];

        for (const rule of fieldRules) {
            if (!rule.validate(value)) {
                errors[field] = rule.message;
                break; // Stop at first error for each field
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// ============================================================
// Local Storage Helpers (for draft saving)
// ============================================================

const STORAGE_PREFIX = 'novarecruit_';

export const storage = {
    set: <T>(key: string, value: T): void => {
        try {
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
        } catch (error) {
            console.error('Storage set error:', error);
        }
    },

    get: <T>(key: string, defaultValue?: T): T | undefined => {
        try {
            const item = localStorage.getItem(STORAGE_PREFIX + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },

    remove: (key: string): void => {
        try {
            localStorage.removeItem(STORAGE_PREFIX + key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    },

    clear: (): void => {
        try {
            const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
            keys.forEach(k => localStorage.removeItem(k));
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    }
};

// ============================================================
// Date Helpers
// ============================================================

export const dateUtils = {
    formatDate: (date: string | Date, locale: string = 'en-GB'): string => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    },

    formatDateTime: (date: string | Date, locale: string = 'en-GB'): string => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    calculateAge: (birthDate: string): number => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    },

    isValidAge: (birthDate: string, minAge: number = 18, maxAge: number = 65): boolean => {
        const age = dateUtils.calculateAge(birthDate);
        return age >= minAge && age <= maxAge;
    }
};

// ============================================================
// String Helpers
// ============================================================

export const stringUtils = {
    capitalize: (str: string): string => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    truncate: (str: string, maxLength: number, suffix: string = '...'): string => {
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - suffix.length) + suffix;
    },

    slugify: (str: string): string => {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    formatPhoneNumber: (phone: string): string => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    }
};
