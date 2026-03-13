'use client';

import { forwardRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeIn, glacialTransition } from '@/lib/motion';
import { useGalleryStore } from '@/stores/gallery';
import Navigation from './Navigation';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  className?: string;
}

const Header = forwardRef<HTMLElement, HeaderProps>(({ className }, ref) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleDocent = useGalleryStore((state) => state.toggleDocent);

  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleMobileMenuOpen = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  return (
    <>
      <motion.header
        ref={ref}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className={cn(
          'fixed inset-x-0 top-0 z-50',
          'border-b border-void-700/50',
          'bg-void-900/80 backdrop-blur-xl',
          className
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Wordmark */}
          <Link
            href="/"
            className={cn(
              'font-display text-heading-md tracking-[0.2em] text-ivory-50',
              'transition-colors duration-300 ease-glacial hover:text-amber',
              'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 focus:ring-offset-void-900 rounded-sm'
            )}
          >
            AETHER
          </Link>

          {/* Center: Desktop navigation */}
          <Navigation className="hidden md:block" />

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Ask Docent button */}
            <button
              onClick={toggleDocent}
              className={cn(
                'hidden sm:inline-flex items-center gap-2 rounded-md',
                'border border-amber/30 bg-amber-dim px-4 py-2',
                'font-body text-body-sm text-amber',
                'transition-all duration-300 ease-glacial',
                'hover:border-amber/60 hover:bg-amber-muted hover:text-amber-light',
                'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 focus:ring-offset-void-900'
              )}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Ask Docent
            </button>

            {/* Mobile: hamburger */}
            <button
              onClick={handleMobileMenuOpen}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              className={cn(
                'inline-flex h-11 w-11 items-center justify-center rounded-md md:hidden',
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
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={handleMobileMenuClose} />
    </>
  );
});
Header.displayName = 'Header';
export default Header;
