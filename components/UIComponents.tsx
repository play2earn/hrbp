
import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon, Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Upload, File, CheckCircle, AlertCircle } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', icon: Icon, isLoading, className = '', ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 focus:ring-indigo-500",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 shadow-sm shadow-slate-200 focus:ring-slate-500",
    outline: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:ring-indigo-500",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-200 focus:ring-red-500",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base"
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
    <input
      className={`block w-full rounded-lg border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-3 border transition-colors ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'hover:border-gray-400'} ${className}`}
      {...props}
    />
    {error && <p className="mt-1.5 text-xs text-red-500 flex items-center">
      <span className="w-1 h-1 rounded-full bg-red-500 mr-1.5"></span>
      {error}
    </p>}
  </div>
);

// --- DatePicker ---
interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  min?: string;
  max?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, error, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse value or default to today
  const dateValue = value ? new Date(value) : null;
  const [viewDate, setViewDate] = useState(dateValue || new Date());

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dateValue) {
      setViewDate(dateValue);
    }
  }, [isOpen]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay(); // 0 = Sunday

  const handleDateClick = (day: number) => {
    // Construct local date string to avoid timezone issues
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const isoDate = `${year}-${month}-${dayStr}`;

    onChange(isoDate);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const changeYear = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
  };

  // Generate Year Options (1950 - 2040)
  const years = Array.from({ length: 91 }, (_, i) => 1950 + i);

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div
        className={`relative cursor-pointer group`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`block w-full rounded-lg border bg-white text-gray-900 shadow-sm sm:text-sm py-3 px-3 pl-10 transition-colors ${error ? 'border-red-500' : 'border-gray-300 group-hover:border-gray-400'} focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500`}>
          {value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : <span className="text-gray-400">Select date...</span>}
        </div>
        <CalendarIcon className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 p-4 bg-white rounded-xl shadow-xl border border-gray-100 w-72 left-0 sm:left-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button type="button" onClick={(e) => { e.stopPropagation(); changeMonth(-1); }} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
            <div className="flex items-center gap-1 font-semibold text-gray-800">
              <span>{viewDate.toLocaleString('default', { month: 'long' })}</span>

              {/* Year Dropdown */}
              <div className="relative ml-1 group">
                <span className="cursor-pointer hover:text-indigo-600 border-b border-dashed border-gray-300 transition-colors">{viewDate.getFullYear()}</span>
                <select
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  value={viewDate.getFullYear()}
                  onChange={(e) => changeYear(parseInt(e.target.value))}
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); changeMonth(1); }} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-xs text-center text-gray-400 font-medium">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              // Reconstruct local ISO for comparison
              const currentIso = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = value === currentIso;

              const today = new Date();
              const isToday = day === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();

              return (
                <button
                  key={day}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDateClick(day); }}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all duration-200
                                ${isSelected ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200' : 'hover:bg-indigo-50 text-gray-700'}
                                ${isToday && !isSelected ? 'text-indigo-600 font-bold border border-indigo-200' : ''}
                            `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// --- TextArea ---
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
    <textarea
      className={`block w-full rounded-lg border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-3 border transition-colors ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'hover:border-gray-400'} ${className}`}
      rows={4}
      {...props}
    />
    {error && <p className="mt-1.5 text-xs text-red-500 flex items-center">
      <span className="w-1 h-1 rounded-full bg-red-500 mr-1.5"></span>
      {error}
    </p>}
  </div>
);

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
    <div className="relative">
      <select
        className={`appearance-none block w-full rounded-lg border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 px-3 border transition-colors pr-10 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'hover:border-gray-400'} ${className}`}
        {...props}
      >
        <option value="" className="text-gray-500">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-gray-900">{opt.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    {error && <p className="mt-1.5 text-xs text-red-500 flex items-center">
      <span className="w-1 h-1 rounded-full bg-red-500 mr-1.5"></span>
      {error}
    </p>}
  </div>
);

// --- FileUpload ---
interface FileUploadProps {
  label: React.ReactNode;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
  value?: string | null;
  onChange: (value: string | null) => void;
  onFileSelect?: (file: File | null) => void; // New prop to handle raw file
  error?: string;
  className?: string;
  uploading?: boolean; // New prop to show external upload state
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label, description, accept, maxSizeMB = 5, value, onChange, onFileSelect, error, className = '', uploading = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isInternalUploading, setIsInternalUploading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBusy = uploading || isInternalUploading;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    setInternalError(null);
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      setInternalError(`File size exceeds ${maxSizeMB}MB limit.`);
      return false;
    }
    return true;
  };

  const handleProcessFile = (file: File) => {
    if (!validateFile(file)) return;

    if (onFileSelect) {
      // If external handler exists, pass file and let parent handle loading state
      onFileSelect(file);
      // We simulate a quick progress bar here just for immediate feedback if parent doesn't handle progress
      // But typically parent controls 'uploading' prop.
    } else {
      // Legacy internal simulation
      setIsInternalUploading(true);
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsInternalUploading(false);
            onChange(file.name);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (onFileSelect) onFileSelect(null);
    setProgress(0);
    setInternalError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>

      {!value && !isBusy ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer
            ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300'}
            ${error || internalError ? 'border-red-300 bg-red-50' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            type="file"
            ref={inputRef}
            className="hidden"
            accept={accept}
            onChange={handleFileSelect}
          />
          <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
            <Upload className={`w-6 h-6 ${isDragging ? 'text-indigo-600' : 'text-indigo-500'}`} />
          </div>
          <p className="text-sm font-medium text-gray-900">
            <span className="text-indigo-600">Click to upload</span> or drag and drop
          </p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
      ) : (
        <div className="relative border rounded-xl p-4 bg-white flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden border">
            {value && (value.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) || value.includes('supabase.co')) ? (
              <img 
                src={value} 
                alt="Preview" 
                className="w-full h-full object-cover" 
                key={value}
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const icon = document.createElement('div');
                    icon.className = 'w-full h-full flex items-center justify-center bg-indigo-100';
                    icon.innerHTML = '<svg class="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';
                    parent.appendChild(icon);
                  }
                }}
              />
            ) : (
              <File className="w-6 h-6 text-indigo-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {value ? (value.split('/').pop()?.split('_').slice(1).join('_') || value) : "Uploading..."}
            </p>

            {isBusy ? (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-indigo-600 h-1.5 rounded-full animate-pulse w-full"></div>
              </div>
            ) : (
              <p className="text-xs text-green-600 flex items-center mt-1">
                <CheckCircle className="w-3 h-3 mr-1" /> Upload Complete
              </p>
            )}
          </div>

          {!isBusy && (
            <button
              onClick={handleRemove}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {(error || internalError) && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center">
          <AlertCircle className="w-3 h-3 mr-1.5" />
          {internalError || error}
        </p>
      )}
    </div>
  );
};

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

import { createPortal } from 'react-dom';

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  if (!isOpen) return null;

  const isFull = size === 'full';

  const sizeClasses = {
    md: 'sm:max-w-lg mt-20 mb-8 mx-4 rounded-xl',
    lg: 'sm:max-w-2xl mt-20 mb-8 mx-4 rounded-xl',
    xl: 'sm:max-w-4xl mt-10 mb-8 mx-4 rounded-xl',
    '2xl': 'sm:max-w-6xl mt-10 mb-8 mx-4 rounded-xl',
    full: 'w-full h-full rounded-none m-0'
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Content */}
      <div
        className={`relative bg-white text-left shadow-2xl flex flex-col transform transition-all duration-200 ${sizeClasses[size]}`}
        style={isFull ? { height: '100vh', width: '100vw', maxWidth: '100%' } : { maxHeight: '90vh' }}
      >
        {/* Header (Sticky Top) */}
        <div className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0 ${isFull ? 'bg-white' : ''}`}>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {isFull && <p className="text-sm text-gray-500 mt-1">Configure your master data settings</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className={isFull ? "max-w-7xl mx-auto" : ""}>
            {children}
          </div>
        </div>

        {/* Footer (Sticky Bottom) */}
        {(footer) && (
          <div className="px-6 py-4 bg-white border-t border-gray-100 flex-shrink-0 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white shadow-sm border border-gray-100 rounded-xl p-4 sm:p-6 md:p-8 ${className}`}>
    {children}
  </div>
);
