import React from 'react';

const variantClasses = {
  success: 'bg-success-soft text-success border-success/20',
  warning: 'bg-warning-soft text-warning-hover border-warning/25',
  error: 'bg-error-soft text-error border-error/20',
  primary: 'bg-primary-soft text-primary-active border-primary/20',
  secondary: 'bg-secondary-soft text-secondary border-secondary/20',
  neutral: 'bg-slate-100 text-text-secondary border-slate-200',
};

const statusMap = {
  Approved: { variant: 'success', label: 'อนุมัติแล้ว' },
  Pending: { variant: 'warning', label: 'รออนุมัติ' },
  Rejected: { variant: 'error', label: 'ถูกปฏิเสธ' },
  Draft: { variant: 'neutral', label: 'ร่าง' },
  Published: { variant: 'success', label: 'เผยแพร่แล้ว' },
};

export function Badge({ children, variant = 'neutral', status, withDot = false, className = '' }) {
  let targetVariant = variant;
  let label = children;

  if (status && statusMap[status]) {
    targetVariant = statusMap[status].variant;
    label = children || statusMap[status].label;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-meta font-medium border whitespace-nowrap ${
        variantClasses[targetVariant] || variantClasses.neutral
      } ${className}`}
    >
      {withDot && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" aria-hidden="true" />}
      {label}
    </span>
  );
}

export default Badge;
