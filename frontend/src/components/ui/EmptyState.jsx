import React from 'react';

export function EmptyState({
  icon: Icon = null,
  title = 'ไม่พบข้อมูล',
  description = 'ไม่มีรายการข้อมูลที่จะแสดงในขณะนี้',
  action = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-12 bg-surface rounded-md border border-border ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-text-muted mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="text-base font-semibold text-text-primary mb-1">{title}</h4>
      {description && <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export function LoadingSpinner({ text = 'กำลังโหลดข้อมูล...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-text-muted ${className}`}>
      <div className="w-8 h-8 border-3 border-border border-t-primary rounded-full animate-spin mb-3" />
      <p className="text-sm font-medium text-text-secondary">{text}</p>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded-sm ${className}`} />;
}

export default EmptyState;
