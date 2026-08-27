import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(function Select(
  {
    label,
    options = [],
    error,
    helperText,
    required = false,
    className = '',
    containerClassName = '',
    placeholder,
    children,
    id,
    ...props
  },
  ref
) {
  const selectId = id || (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={selectId} className="block text-body-sm font-medium text-text-primary">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={`w-full min-h-12 pl-3.5 pr-10 text-body bg-surface text-text-primary border rounded-sm transition-colors duration-fast appearance-none focus:outline-none focus:ring-2 ${
            error
              ? 'border-error focus:border-error focus:ring-error/20'
              : 'border-border hover:border-border-strong focus:border-primary focus:ring-primary/25'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDown className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error ? (
        <p className="text-body-sm text-error font-medium" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-body-sm text-text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;
