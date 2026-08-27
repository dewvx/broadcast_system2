import React from 'react';

export function EmptyState({
  icon: Icon = null,
  title = 'ไม่พบข้อมูล',
  description = 'ไม่มีรายการข้อมูลที่จะแสดงในขณะนี้',
  action = null,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-10 sm:p-12 bg-surface rounded-md border border-border ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center text-primary mb-4">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h4 className="text-h3 text-text-primary mb-1.5">{title}</h4>
      {description && <p className="text-body-sm text-text-secondary max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export function LoadingSpinner({ text = 'กำลังโหลดข้อมูล...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-text-muted ${className}`}>
      <div className="w-9 h-9 border-[3px] border-border border-t-primary rounded-full animate-spin mb-3" />
      <p className="text-body-sm font-medium text-text-secondary">{text}</p>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`relative overflow-hidden bg-slate-200/70 rounded-sm ${className}`} aria-hidden="true">
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  );
}

export default EmptyState;
