'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/collection', label: 'Collection' },
  { href: '/exhibitions', label: 'Exhibitions' },
  { href: '/generative', label: 'Generative' },
  { href: '/submit', label: 'Submit' },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];
export { NAV_LINKS };

interface NavigationProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  onLinkClick?: () => void;
}

const Navigation = forwardRef<HTMLElement, NavigationProps>(
  ({ className, orientation = 'horizontal', onLinkClick }, ref) => {
    const pathname = usePathname();

    const isActive = (href: string) => {
      if (href === '/') return pathname === '/';
      return pathname.startsWith(href);
    };

    return (
      <nav
        ref={ref}
        id="navigation"
        aria-label="Main navigation"
        className={cn(className)}
      >
        <ul
          className={cn(
            'flex gap-1',
            orientation === 'horizontal'
              ? 'flex-row items-center'
              : 'flex-col items-start gap-4'
          )}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onLinkClick}
                className={cn(
                  'relative px-3 py-2 font-body text-body-sm transition-colors duration-300 ease-glacial',
                  'hover:text-ivory-50 focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 focus:ring-offset-void-900 rounded-sm',
                  orientation === 'vertical' && 'text-display-md font-display',
                  isActive(link.href)
                    ? 'text-ivory-50'
                    : 'text-ivory-400'
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.span
                    layoutId={
                      orientation === 'horizontal'
                        ? 'nav-underline'
                        : 'mobile-nav-underline'
                    }
                    className={cn(
                      'absolute bg-amber',
                      orientation === 'horizontal'
                        ? 'bottom-0 left-3 right-3 h-0.5'
                        : 'bottom-0 left-0 right-0 h-0.5'
                    )}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }
);
Navigation.displayName = 'Navigation';
export default Navigation;
