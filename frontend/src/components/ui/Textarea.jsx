import React, { forwardRef } from 'react';

export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    required = false,
    className = '',
    containerClassName = '',
    rows = 5,
    id,
    ...props
  },
  ref
) {
  const textareaId = id || (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-body-sm font-medium text-text-primary">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={`w-full min-h-[140px] p-3.5 text-body bg-surface text-text-primary border rounded-sm transition-colors duration-fast placeholder:text-text-muted resize-y focus:outline-none focus:ring-2 ${
          error
            ? 'border-error focus:border-error focus:ring-error/20'
            : 'border-border hover:border-border-strong focus:border-primary focus:ring-primary/25'
        } ${className}`}
        {...props}
      />
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

export default Textarea;
