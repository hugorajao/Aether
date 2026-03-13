'use client';

import { forwardRef, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeIn, glacialEase } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import AmbientGlow from '@/components/shared/AmbientGlow';

interface ImmersiveViewerProps {
  artwork: {
    title: string;
    dominantColor: string | null;
    imagePath: string | null;
    type: string;
  };
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const ImmersiveViewer = forwardRef<HTMLDivElement, ImmersiveViewerProps>(
  ({ artwork, isOpen, onClose, className }, ref) => {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<Element | null>(null);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        // Focus trap
        if (e.key === 'Tab' && containerRef.current) {
          const focusable = containerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }
      },
      [onClose]
    );

    useEffect(() => {
      if (isOpen) {
        previousActiveElement.current = document.activeElement;
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        // Focus the close button after animation starts
        requestAnimationFrame(() => {
          closeButtonRef.current?.focus();
        });

        return () => {
          document.removeEventListener('keydown', handleKeyDown);
          document.body.style.overflow = '';

          // Restore focus
          if (previousActiveElement.current instanceof HTMLElement) {
            previousActiveElement.current.focus();
          }
        };
      }
    }, [isOpen, handleKeyDown]);

    const gradientColor = artwork.dominantColor || '#27272F';

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={(node) => {
              (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={cn(
              'fixed inset-0 z-50 flex items-center justify-center bg-void-950',
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-label={`Immersive view of ${artwork.title}`}
          >
            {/* Vignette overlay */}
            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                background:
                  'radial-gradient(ellipse at center, transparent 50%, rgba(9, 9, 11, 0.6) 80%, rgba(9, 9, 11, 0.95) 100%)',
              }}
              aria-hidden="true"
            />

            {/* Ambient glow */}
            {artwork.dominantColor && (
              <AmbientGlow
                color={artwork.dominantColor}
                intensity="low"
                className="scale-200"
              />
            )}

            {/* Close button */}
            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 z-20 h-12 w-12 rounded-full text-ivory-200 hover:text-ivory-50"
              onClick={onClose}
              aria-label="Close immersive view"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Artwork */}
            <motion.div
              className="relative z-10 flex max-h-[90vh] max-w-[90vw] items-center justify-center"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{
                duration: 0.7,
                ease: glacialEase,
              }}
            >
              {artwork.imagePath ? (
                <Image
                  src={artwork.imagePath}
                  alt={`Immersive view of ${artwork.title}`}
                  width={1920}
                  height={1080}
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                  priority
                />
              ) : (
                <div
                  className="h-[70vh] w-[70vw] rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${gradientColor}, ${gradientColor}88, #09090B)`,
                  }}
                  role="img"
                  aria-label={`Generative artwork: ${artwork.title}`}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
ImmersiveViewer.displayName = 'ImmersiveViewer';

export default ImmersiveViewer;
