'use client';

import { forwardRef, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import Navigation from './Navigation';

const mobileMenuVariants: Variants = {
  hidden: {
    x: '-100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 30, stiffness: 200 },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

interface MobileMenuProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = forwardRef<HTMLDivElement, MobileMenuProps>(
  ({ className, isOpen, onClose }, ref) => {
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-[60] bg-void-950/60"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.div
              ref={ref}
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
              className={cn(
                'fixed inset-y-0 left-0 z-[70] w-[80vw] max-w-sm',
                'bg-void-900/95 backdrop-blur-xl',
                'flex flex-col',
                className
              )}
            >
              <div className="flex items-center justify-between border-b border-void-700 px-6 py-4">
                <span className="font-display text-heading-md tracking-[0.2em] text-ivory-50">
                  AETHER
                </span>
                <button
                  onClick={onClose}
                  aria-label="Close menu"
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-md',
                    'text-ivory-400 transition-colors duration-300 ease-glacial',
                    'hover:text-ivory-50',
                    'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 focus:ring-offset-void-900'
                  )}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 px-6 py-8">
                <Navigation
                  orientation="vertical"
                  onLinkClick={onClose}
                />
              </div>

              <div className="border-t border-void-700 px-6 py-4">
                <p className="font-mono text-mono-sm text-ivory-400">
                  A digital art experience
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
);
MobileMenu.displayName = 'MobileMenu';
export default MobileMenu;
