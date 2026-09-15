import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, HelpCircle, X } from 'lucide-react';
import { Button } from './Button';

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'ยืนยันการดำเนินการ',
  message = 'คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?',
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  loading = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose?.();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, loading]);

  const variantConfigs = {
    danger: {
      Icon: AlertTriangle,
      iconBg: 'bg-error-soft',
      iconColor: 'text-error',
      confirmButtonVariant: 'danger',
    },
    warning: {
      Icon: AlertCircle,
      iconBg: 'bg-warning-soft',
      iconColor: 'text-warning',
      confirmButtonVariant: 'primary',
    },
    primary: {
      Icon: HelpCircle,
      iconBg: 'bg-primary-soft',
      iconColor: 'text-primary',
      confirmButtonVariant: 'primary',
    },
  };

  const config = variantConfigs[variant] || variantConfigs.danger;
  const { Icon, iconBg, iconColor, confirmButtonVariant } = config;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[1250] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          onClick={() => {
            if (!loading) onClose?.();
          }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-desc"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="bg-surface w-full max-w-sm rounded-md shadow-xl border border-border overflow-hidden p-6 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close icon button */}
            <button
              onClick={onClose}
              disabled={loading}
              aria-label="ปิดหน้าต่าง"
              className="absolute top-3 right-3 p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-slate-100 transition-colors duration-fast cursor-pointer disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Circle */}
            <div
              className={`w-14 h-14 rounded-full ${iconBg} ${iconColor} flex items-center justify-center mx-auto mb-4 shrink-0`}
            >
              <Icon className="w-7 h-7" />
            </div>

            {/* Title */}
            <h3 id="confirm-dialog-title" className="text-h3 text-text-primary font-bold mb-2">
              {title}
            </h3>

            {/* Description / Message */}
            <p id="confirm-dialog-desc" className="text-body-sm text-text-secondary leading-relaxed mb-6">
              {message}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                {cancelText}
              </Button>
              <Button
                variant={confirmButtonVariant}
                size="md"
                onClick={onConfirm}
                loading={loading}
                className="flex-1"
                autoFocus
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'ยืนยัน',
    cancelText: 'ยกเลิก',
    variant: 'danger',
  });

  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialogState({
        isOpen: true,
        title: options.title || 'ยืนยันการดำเนินการ',
        message: options.message || 'คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?',
        confirmText: options.confirmText || 'ยืนยัน',
        cancelText: options.cancelText || 'ยกเลิก',
        variant: options.variant || 'danger',
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  const handleConfirm = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmModal
        isOpen={dialogState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}

export default ConfirmModal;
