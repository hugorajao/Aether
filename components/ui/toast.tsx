'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const GLACIAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const TOAST_DURATION = 5000;

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg',
  {
    variants: {
      variant: {
        default: 'border-void-700 bg-void-850 text-ivory-50',
        destructive: 'border-error/50 bg-error text-ivory-50',
        success: 'border-amber/50 bg-void-850 text-ivory-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type ToastVariant = VariantProps<typeof toastVariants>['variant'];

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue>({
  toasts: [],
  addToast: () => '',
  removeToast: () => {},
});

let toastCount = 0;

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastCount}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {mounted &&
        createPortal(
          <div
            className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]"
            aria-live="polite"
            aria-label="Notifications"
          >
            <AnimatePresence mode="popLayout">
              {toasts.map((toast) => (
                <ToastItem
                  key={toast.id}
                  toast={toast}
                  onDismiss={() => removeToast(toast.id)}
                />
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  React.useEffect(() => {
    const duration = toast.duration ?? TOAST_DURATION;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.35, ease: GLACIAL_EASE }}
      className={cn(toastVariants({ variant: toast.variant }))}
    >
      <div className="grid gap-1">
        {toast.title && (
          <div className="text-body-sm font-semibold">{toast.title}</div>
        )}
        {toast.description && (
          <div className="text-body-sm text-ivory-400">{toast.description}</div>
        )}
      </div>
      <button
        type="button"
        className="absolute right-2 top-2 rounded-md p-1 text-ivory-400 opacity-0 transition-opacity hover:text-ivory-50 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-amber group-hover:opacity-100"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </motion.div>
  );
}

function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const toast = React.useCallback(
    (props: Omit<Toast, 'id'>) => {
      return context.addToast(props);
    },
    [context]
  );

  return {
    toast,
    dismiss: context.removeToast,
    toasts: context.toasts,
  };
}

export { ToastProvider, useToast, toastVariants };
export type { Toast };
