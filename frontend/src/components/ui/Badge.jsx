import React from 'react';

const variantClasses = {
  success: 'bg-success-soft text-success border-success/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
  error: 'bg-error-soft text-error border-error/20',
  primary: 'bg-primary-soft text-primary border-primary/20',
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

export function Badge({ children, variant = 'neutral', status, className = '' }) {
  let targetVariant = variant;
  let label = children;

  if (status && statusMap[status]) {
    targetVariant = statusMap[status].variant;
    label = children || statusMap[status].label;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        variantClasses[targetVariant] || variantClasses.neutral
      } ${className}`}
    >
      {label}
    </span>
  );
}

export default Badge;
