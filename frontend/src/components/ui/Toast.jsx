import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

let toastId = 0;
let listeners = [];
let toastQueue = [];

function emit() {
  listeners.forEach((listener) => listener([...toastQueue]));
}

function push(message, type = 'success', duration = 3500) {
  const id = ++toastId;
  toastQueue = [...toastQueue, { id, message, type }];
  emit();
  setTimeout(() => dismiss(id), duration);
  return id;
}

function dismiss(id) {
  toastQueue = toastQueue.filter((t) => t.id !== id);
  emit();
}

export const toast = {
  success: (message) => push(message, 'success', 3500),
  error: (message) => push(message, 'error', 4500),
  warning: (message) => push(message, 'warning', 4000),
  info: (message) => push(message, 'info', 3500),
};

const iconMap = {
  success: {
    Icon: CheckCircle2,
    iconColor: 'text-success',
    badgeBg: 'bg-success-soft text-success',
  },
  error: {
    Icon: AlertCircle,
    iconColor: 'text-error',
    badgeBg: 'bg-error-soft text-error',
  },
  warning: {
    Icon: AlertTriangle,
    iconColor: 'text-warning',
    badgeBg: 'bg-warning-soft text-warning',
  },
  info: {
    Icon: Info,
    iconColor: 'text-primary',
    badgeBg: 'bg-primary-soft text-primary',
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState(toastQueue);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[1300] w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map(({ id, message, type }) => {
          const { Icon, badgeBg } = iconMap[type] || iconMap.info;
          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-center gap-3 bg-surface border border-border rounded-md shadow-xl px-4 py-3 mb-2.5 backdrop-blur-xs"
              role="status"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${badgeBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="flex-1 text-body-sm text-text-primary font-medium leading-normal">{message}</p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                aria-label="ปิดการแจ้งเตือน"
                className="p-1.5 -mr-1 rounded-full text-text-muted hover:text-text-primary hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default Toaster;

