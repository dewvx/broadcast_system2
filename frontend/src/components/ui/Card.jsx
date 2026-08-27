import React from 'react';

export function Card({ children, className = '', header, footer, padding = 'md', hoverable = false }) {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-surface border border-border rounded-md shadow-sm overflow-hidden ${
        hoverable ? 'transition-all duration-base ease-enter hover:-translate-y-0.5 hover:shadow-md' : ''
      } ${className}`}
    >
      {header && (
        <div className="px-6 py-4 border-b border-border font-semibold text-text-primary text-h3">
          {header}
        </div>
      )}
      <div className={paddingMap[padding] || paddingMap.md}>{children}</div>
      {footer && <div className="px-6 py-4 bg-slate-50 border-t border-border">{footer}</div>}
    </div>
  );
}

export default Card;
