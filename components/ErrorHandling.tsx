
import React from 'react';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { Button } from './UIComponents';

// ============================================================
// Error Boundary Component
// ============================================================
interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onReset?: () => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        this.props.onReset?.();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                        <p className="text-gray-600 mb-6">
                            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
                        </p>
                        <Button onClick={this.handleReset} icon={RefreshCw}>
                            Try Again
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// ============================================================
// Loading States
// ============================================================

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    text,
    className = ''
}) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div className={`${sizes[size]} animate-spin`}>
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
            {text && <span className="text-sm text-gray-500">{text}</span>}
        </div>
    );
};

interface LoadingOverlayProps {
    isLoading: boolean;
    text?: string;
    children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    isLoading,
    text = 'Loading...',
    children
}) => {
    return (
        <div className="relative">
            {children}
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
                    <LoadingSpinner size="lg" text={text} />
                </div>
            )}
        </div>
    );
};

// Skeleton loaders for different content types
export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 1 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
        <div className="p-4 border-b border-gray-100">
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
                </div>
            ))}
        </div>
    </div>
);

// ============================================================
// Empty State
// ============================================================
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action
}) => (
    <div className="text-center py-12 px-4">
        {icon && (
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                {icon}
            </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>}
        {action && (
            <Button onClick={action.onClick} size="sm">
                {action.label}
            </Button>
        )}
    </div>
);

// ============================================================
// Alert Component
// ============================================================
interface AlertProps {
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    onClose?: () => void;
    className?: string;
}

export const Alert: React.FC<AlertProps> = ({
    type,
    title,
    message,
    onClose,
    className = ''
}) => {
    const styles = {
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    return (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${styles[type]} ${className}`}>
            <span className="flex-shrink-0 mt-0.5">{icons[type]}</span>
            <div className="flex-1 min-w-0">
                {title && <h4 className="font-semibold mb-1">{title}</h4>}
                <p className="text-sm">{message}</p>
            </div>
            {onClose && (
                <button onClick={onClose} className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity">
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

// ============================================================
// Toast Notifications (Simple Implementation)
// ============================================================
interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    duration = 3000,
    onClose
}) => {
    React.useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const styles = {
        success: 'bg-emerald-600',
        error: 'bg-red-600',
        info: 'bg-indigo-600'
    };

    return (
        <div className={`fixed bottom-4 right-4 z-[9999] px-6 py-3 rounded-xl text-white shadow-lg ${styles[type]} fade-in-up`}>
            {message}
        </div>
    );
};

// ============================================================
// Confirmation Dialog
// ============================================================
interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'primary';
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'primary',
    onConfirm,
    onCancel,
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onCancel}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 fade-in-up">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Import missing icons
import { CheckCircle, Info, X } from 'lucide-react';
