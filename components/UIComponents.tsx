
import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Search, Check, X, Upload, File, CheckCircle, AlertCircle } from 'lucide-react';

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
const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const ENG_MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ENG_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  lang?: 'th' | 'en';
  isBirthDate?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  label, 
  value, 
  onChange, 
  error, 
  className = '', 
  disabled = false,
  lang = 'th',
  isBirthDate = false,
  min,
  max
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format date display for input box
  const formatDisplay = (val: string) => {
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length !== 3) return val;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return val;

    if (lang === 'th') {
      const bYear = y + 543;
      const mName = THAI_MONTHS_SHORT[m - 1] || '';
      return `${d} ${mName} ${bYear}`;
    } else {
      const mName = ENG_MONTHS_SHORT[m - 1] || '';
      return `${d} ${mName} ${y}`;
    }
  };

  // Determine initial view date
  const getInitialViewDate = () => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      if (y && m) return new Date(y, m - 1, d || 1);
    }
    const today = new Date();
    // For fresh grad birthdate default to ~22 years ago
    if (isBirthDate) {
      return new Date(today.getFullYear() - 22, 0, 1);
    }
    return today;
  };

  const [viewDate, setViewDate] = useState(getInitialViewDate);

  // Update viewDate when value or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setViewDate(getInitialViewDate());
    }
  }, [isOpen, value]);

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

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay(); // 0 = Sunday

  const handleDateClick = (day: number) => {
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

  const handleMonthSelect = (monthIndex: number) => {
    setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
  };

  const handleYearSelect = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
  };

  // Generate Year Options:
  // For birthdate: 1950 up to current year, descending so younger candidates find their year fast
  // For standard: 1950 to 2040
  const currentYear = new Date().getFullYear();
  const years = isBirthDate
    ? Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i)
    : Array.from({ length: 91 }, (_, i) => 1950 + i);

  const months = lang === 'th' ? THAI_MONTHS_FULL : ENG_MONTHS_FULL;
  const weekdays = lang === 'th' 
    ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="relative group">
        {/* Native Mobile Date Picker (Transparent overlay on mobile/tablet for smooth wheel scroll) */}
        {!disabled && (
          <input
            type="date"
            className="sm:hidden absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
            value={value || ''}
            min={min}
            max={max}
            onChange={(e) => {
              if (e.target.value) {
                onChange(e.target.value);
              }
            }}
          />
        )}

        {/* Display Input Box */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`block w-full rounded-lg border bg-white text-gray-900 shadow-sm sm:text-sm py-3 px-3 pl-10 pr-10 cursor-pointer transition-colors ${
            error ? 'border-red-500' : 'border-gray-300 group-hover:border-indigo-400'
          } ${isOpen ? 'ring-2 ring-indigo-500 border-indigo-500' : ''} ${
            disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
          }`}
        >
          {value ? (
            <span className="font-medium text-gray-900">{formatDisplay(value)}</span>
          ) : (
            <span className="text-gray-400">
              {lang === 'th' ? 'เลือกวันที่...' : 'Select date...'}
            </span>
          )}
        </div>
        <CalendarIcon className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
        <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none transition-transform duration-200" />
      </div>

      {/* Desktop & Fallback Popover Calendar */}
      {isOpen && (
        <div className="hidden sm:block absolute z-50 mt-1.5 p-4 bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 left-0 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header with explicit Month & Year Selectors */}
          <div className="flex items-center justify-between gap-1 mb-3 pb-2 border-b border-gray-100">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); changeMonth(-1); }}
              className="p-1.5 hover:bg-gray-100 active:bg-gray-200 rounded-lg text-gray-600 transition-colors"
              title={lang === 'th' ? 'เดือนก่อนหน้า' : 'Previous Month'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 flex-1 justify-center">
              {/* Explicit Month Select */}
              <div className="relative">
                <select
                  value={viewDate.getMonth()}
                  onChange={(e) => handleMonthSelect(parseInt(e.target.value, 10))}
                  onClick={(e) => e.stopPropagation()}
                  className="appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-semibold rounded-lg py-1.5 pl-2.5 pr-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  {months.map((m, idx) => (
                    <option key={m} value={idx}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2 top-2.5 pointer-events-none" />
              </div>

              {/* Explicit Year Select */}
              <div className="relative">
                <select
                  value={viewDate.getFullYear()}
                  onChange={(e) => handleYearSelect(parseInt(e.target.value, 10))}
                  onClick={(e) => e.stopPropagation()}
                  className="appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-semibold rounded-lg py-1.5 pl-2.5 pr-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {lang === 'th' ? `${y + 543} (${y})` : y}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); changeMonth(1); }}
              className="p-1.5 hover:bg-gray-100 active:bg-gray-200 rounded-lg text-gray-600 transition-colors"
              title={lang === 'th' ? 'เดือนถัดไป' : 'Next Month'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekdays Header */}
          <div className="grid grid-cols-7 mb-1.5">
            {weekdays.map((d) => (
              <div key={d} className="text-xs text-center text-gray-400 font-semibold py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              const currentIso = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = value === currentIso;

              const today = new Date();
              const isToday =
                day === today.getDate() &&
                viewDate.getMonth() === today.getMonth() &&
                viewDate.getFullYear() === today.getFullYear();

              return (
                <button
                  key={day}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDateClick(day);
                  }}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-150 ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200 scale-105'
                      : 'hover:bg-indigo-50 text-gray-700'
                  } ${isToday && !isSelected ? 'text-indigo-600 font-bold border border-indigo-200' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today / Quick Action Footer */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const now = new Date();
                const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                onChange(iso);
                setIsOpen(false);
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
            >
              {lang === 'th' ? 'วันนี้' : 'Today'}
            </button>
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                {lang === 'th' ? 'ล้างค่า' : 'Clear'}
              </button>
            )}
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

// --- SearchableSelect ---
export interface SearchableSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  keywords?: string[];
}

export interface SearchableSelectProps {
  label?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
  emptyAction?: {
    label: string | ((searchQuery: string) => string);
    onClick: (searchQuery: string) => void;
  };
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'เลือกหรือพิมพ์ค้นหา...',
  searchPlaceholder = 'พิมพ์คำค้นหา...',
  error,
  className = '',
  disabled = false,
  clearable = true,
  emptyAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(q) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(q)) ||
      (opt.keywords && opt.keywords.some(k => k && k.toLowerCase().includes(q))) ||
      opt.value.toLowerCase().includes(q)
    );
  }, [options, search]);

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}

      {/* Trigger Button / Display */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-lg border bg-white px-3.5 py-2.5 text-sm shadow-xs transition cursor-pointer select-none ${
          disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'hover:border-indigo-400'
        } ${error ? 'border-red-500 focus:ring-red-500' : isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-300'}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          {selectedOption ? (
            <div className="truncate font-semibold text-gray-900">
              {selectedOption.label}
              {selectedOption.sublabel && (
                <span className="ml-1.5 text-xs text-gray-400 font-normal">
                  ({selectedOption.sublabel})
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {clearable && selectedOption && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
              title="ล้างค่า"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
        </div>
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center">
          <span className="w-1 h-1 rounded-full bg-red-500 mr-1.5"></span>
          {error}
        </p>
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Header */}
          <div className="p-2.5 border-b border-gray-100 bg-gray-50/80 flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-500 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none"
              onClick={(e) => e.stopPropagation()}
            />
            {search && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearch('');
                  searchInputRef.current?.focus();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 text-xs sm:text-sm divide-y divide-gray-50">
            {filteredOptions.length === 0 ? (
              <div className="py-5 px-3 text-center">
                <p className="text-gray-400 text-xs">
                  ไม่พบข้อมูลที่ตรงกับ "{search}"
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearch('');
                      searchInputRef.current?.focus();
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition cursor-pointer"
                  >
                    <span>ล้างคำค้นหา</span>
                  </button>
                  {emptyAction && (
                    <button
                      type="button"
                      onClick={() => {
                        emptyAction.onClick(search.trim());
                        setIsOpen(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-medium transition cursor-pointer"
                    >
                      <span>
                        {typeof emptyAction.label === 'function'
                          ? emptyAction.label(search.trim())
                          : emptyAction.label}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={`${opt.value}-${index}`}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-900 font-bold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{opt.label}</div>
                      {opt.sublabel && (
                        <div className="text-[11px] text-gray-400 font-normal truncate mt-0.5">
                          {opt.sublabel}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- FileUpload ---
interface FileUploadProps {
  label: React.ReactNode;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
  value?: string | null;
  displayName?: string | null;
  onChange: (value: string | null) => void;
  onFileSelect?: (file: File | null) => void; // New prop to handle raw file
  error?: string;
  className?: string;
  uploading?: boolean; // New prop to show external upload state
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label, description, accept, maxSizeMB = 5, value, displayName, onChange, onFileSelect, error, className = '', uploading = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isInternalUploading, setIsInternalUploading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBusy = uploading || isInternalUploading;

  const getFriendlyFileName = (rawValue?: string | null) => {
    if (displayName) return displayName;
    if (!rawValue) return 'Uploading...';
    try {
      const parsed = new URL(rawValue, window.location.origin);
      const key = parsed.searchParams.get('key');
      const url = parsed.searchParams.get('url');
      const path = decodeURIComponent(key || url || parsed.pathname);
      return path.split('/').pop() || 'Uploaded file';
    } catch {
      return rawValue.split('/').pop()?.split('?')[0] || 'Uploaded file';
    }
  };

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
    if (accept) {
      const fileExtension = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
      const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type;
        }
        if (type.endsWith('/*')) {
           return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });

      if (!isAccepted) {
        setInternalError(`Invalid file type. Accepted: ${accept}`);
        return false;
      }
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
              {getFriendlyFileName(value)}
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
  const isFull = size === 'full';

  const sizeClasses = {
    md: 'w-full sm:max-w-lg my-6 mx-4 rounded-2xl',
    lg: 'w-full sm:max-w-2xl my-6 mx-4 rounded-2xl',
    xl: 'w-full sm:max-w-4xl my-6 mx-4 rounded-3xl',
    '2xl': 'w-full sm:max-w-6xl my-6 mx-4 rounded-3xl',
    full: 'w-full h-full rounded-none m-0'
  };

  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      if (originalOverflow !== 'hidden') {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = originalOverflow || '';
        };
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
