import React from 'react';

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active border-transparent',
  secondary: 'bg-slate-100 text-text-primary hover:bg-slate-200 border-transparent',
  outline: 'bg-transparent text-text-primary hover:bg-slate-50 border-border hover:border-border-strong',
  danger: 'bg-error text-white hover:bg-error-hover active:bg-error-hover/90 border-transparent',
  dangerOutline: 'bg-transparent text-error border-error-soft hover:bg-error-soft',
  ghost: 'bg-transparent text-text-secondary hover:bg-slate-100 hover:text-text-primary border-transparent',
};

const sizeClasses = {
  sm: 'h-[38px] px-3 text-body-sm font-medium rounded-sm',
  md: 'h-11 px-4 text-body font-medium rounded-sm',
  lg: 'h-[52px] px-6 text-body-lg font-medium rounded-sm',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  icon: Icon = null,
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 border transition-all duration-fast ease-enter active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer ${
        variantClasses[variant] || variantClasses.primary
      } ${sizeClasses[size] || sizeClasses.md} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-[18px] h-[18px] border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-[18px] h-[18px] shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export default Button;
