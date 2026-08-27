import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

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
  success: (message) => push(message, 'success'),
  error: (message) => push(message, 'error', 4500),
  info: (message) => push(message, 'info'),
};

const iconMap = {
  success: { Icon: CheckCircle2, classes: 'text-success' },
  error: { Icon: AlertCircle, classes: 'text-error' },
  info: { Icon: Info, classes: 'text-primary' },
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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1300] w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map(({ id, message, type }) => {
          const { Icon, classes } = iconMap[type] || iconMap.info;
          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-center gap-3 bg-surface border border-border rounded-md shadow-lg px-4 py-3 mb-2"
              role="status"
            >
              <Icon className={`w-5 h-5 shrink-0 ${classes}`} />
              <p className="flex-1 text-body-sm text-text-primary font-medium">{message}</p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                aria-label="ปิดการแจ้งเตือน"
                className="p-1 -m-1 rounded-full text-text-muted hover:text-text-primary hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
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
