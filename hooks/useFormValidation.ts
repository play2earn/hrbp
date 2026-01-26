
import { useState, useEffect, useCallback, useRef } from 'react';
import { storage, validators, debounce } from '../services/utils';

// ============================================================
// Form Validation Hook
// ============================================================

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
    message: string;
}

export interface FieldRules {
    [fieldName: string]: ValidationRule[];
}

export function useFormValidation<T extends Record<string, any>>(
    data: T,
    rules: FieldRules
) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validateField = useCallback((field: string, value: any): string | null => {
        const fieldRules = rules[field];
        if (!fieldRules) return null;

        for (const rule of fieldRules) {
            if (rule.required && !validators.required(value)) {
                return rule.message;
            }
            if (rule.minLength && !validators.minLength(String(value || ''), rule.minLength)) {
                return rule.message;
            }
            if (rule.maxLength && !validators.maxLength(String(value || ''), rule.maxLength)) {
                return rule.message;
            }
            if (rule.pattern && !rule.pattern.test(String(value || ''))) {
                return rule.message;
            }
            if (rule.custom && !rule.custom(value)) {
                return rule.message;
            }
        }
        return null;
    }, [rules]);

    const validateAll = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        for (const field of Object.keys(rules)) {
            const error = validateField(field, data[field]);
            if (error) {
                newErrors[field] = error;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [data, rules, validateField]);

    const validateFieldOnBlur = useCallback((field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(field, data[field]);
        setErrors(prev => ({
            ...prev,
            [field]: error || ''
        }));
    }, [data, validateField]);

    const clearError = useCallback((field: string) => {
        setErrors(prev => {
            const { [field]: _, ...rest } = prev;
            return rest;
        });
    }, []);

    const clearAllErrors = useCallback(() => {
        setErrors({});
        setTouched({});
    }, []);

    const getFieldError = useCallback((field: string): string | undefined => {
        return touched[field] ? errors[field] : undefined;
    }, [errors, touched]);

    const hasErrors = Object.keys(errors).some(key => errors[key]);

    return {
        errors,
        touched,
        hasErrors,
        validateField,
        validateAll,
        validateFieldOnBlur,
        clearError,
        clearAllErrors,
        getFieldError
    };
}

// ============================================================
// Form Draft Hook (Auto-save to localStorage)
// ============================================================

export interface DraftConfig {
    key: string;
    debounceMs?: number;
    onRestore?: (data: any) => void;
}

export function useFormDraft<T extends Record<string, any>>(
    data: T,
    setData: (data: T) => void,
    config: DraftConfig
) {
    const { key, debounceMs = 2000, onRestore } = config;
    const [hasDraft, setHasDraft] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Check for existing draft on mount
    useEffect(() => {
        const saved = storage.get<{ data: T; timestamp: string }>(key);
        if (saved?.data) {
            setHasDraft(true);
        }
    }, [key]);

    // Debounced save function
    const debouncedSave = useRef(
        debounce((dataToSave: T) => {
            setIsSaving(true);
            storage.set(key, {
                data: dataToSave,
                timestamp: new Date().toISOString()
            });
            setLastSaved(new Date());
            setHasDraft(true);
            setTimeout(() => setIsSaving(false), 500);
        }, debounceMs)
    ).current;

    // Auto-save on data change
    useEffect(() => {
        // Only save if there's meaningful data
        const hasData = Object.values(data).some(v =>
            v !== '' && v !== null && v !== undefined &&
            (typeof v !== 'object' || Object.keys(v).length > 0)
        );

        if (hasData) {
            debouncedSave(data);
        }
    }, [data, debouncedSave]);

    // Restore draft
    const restoreDraft = useCallback(() => {
        const saved = storage.get<{ data: T; timestamp: string }>(key);
        if (saved?.data) {
            setData(saved.data);
            onRestore?.(saved.data);
            return true;
        }
        return false;
    }, [key, setData, onRestore]);

    // Clear draft
    const clearDraft = useCallback(() => {
        storage.remove(key);
        setHasDraft(false);
        setLastSaved(null);
    }, [key]);

    // Get draft info
    const getDraftInfo = useCallback(() => {
        const saved = storage.get<{ data: T; timestamp: string }>(key);
        if (saved) {
            return {
                data: saved.data,
                savedAt: new Date(saved.timestamp)
            };
        }
        return null;
    }, [key]);

    return {
        hasDraft,
        lastSaved,
        isSaving,
        restoreDraft,
        clearDraft,
        getDraftInfo
    };
}

// ============================================================
// Step Validation Rules (for ApplicantForm)
// ============================================================

export const applicationFormRules: Record<number, FieldRules> = {
    // Step 1: Job Interest
    1: {
        businessUnit: [{ required: true, message: 'Please select a Business Unit' }],
        department: [{ required: true, message: 'Please select a Department' }],
        position: [{ required: true, message: 'Please select a Position' }],
        expectedSalary: [{ required: true, message: 'Please enter expected salary' }]
    },
    // Step 2: Personal Info
    2: {
        firstName: [
            { required: true, message: 'First name is required' },
            { minLength: 2, message: 'First name must be at least 2 characters' }
        ],
        lastName: [
            { required: true, message: 'Last name is required' },
            { minLength: 2, message: 'Last name must be at least 2 characters' }
        ],
        dateOfBirth: [{ required: true, message: 'Date of birth is required' }],
        nationalId: [
            {
                custom: (value: string) => !value || validators.thaiId(value),
                message: 'Invalid Thai National ID'
            }
        ]
    },
    // Step 3: Contact Info
    3: {
        phone: [
            { required: true, message: 'Phone number is required' },
            {
                custom: (value: string) => validators.phone(value),
                message: 'Invalid phone number format'
            }
        ],
        email: [
            { required: true, message: 'Email is required' },
            {
                custom: (value: string) => validators.email(value),
                message: 'Invalid email format'
            }
        ],
        registeredAddress: [{ required: true, message: 'Address is required' }],
        registeredProvince: [{ required: true, message: 'Province is required' }]
    },
    // Step 9: Emergency Contact
    9: {
        emergencyContactName: [{ required: true, message: 'Emergency contact name is required' }],
        emergencyContactPhone: [
            { required: true, message: 'Emergency contact phone is required' },
            {
                custom: (value: string) => validators.phone(value),
                message: 'Invalid phone number format'
            }
        ]
    }
};

// ============================================================
// Validation Input Wrapper Component Props
// ============================================================

export interface ValidatedInputProps {
    error?: string;
    touched?: boolean;
}

// Helper to get error class for inputs
export function getInputErrorClass(error?: string): string {
    return error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '';
}
