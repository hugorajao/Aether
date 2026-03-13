'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const SkipLinks = forwardRef<HTMLDivElement, { className?: string }>(
  ({ className }, ref) => {
    return (
      <div ref={ref} className={cn(className)}>
        <a
          href="#main-content"
          className={cn(
            'fixed left-4 top-4 z-[100] -translate-y-full rounded-md',
            'bg-amber px-4 py-2 font-body text-body-sm text-void-950',
            'opacity-0 transition-all duration-300 ease-glacial',
            'focus:translate-y-0 focus:opacity-100',
            'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 focus:ring-offset-void-950'
          )}
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className={cn(
            'fixed left-48 top-4 z-[100] -translate-y-full rounded-md',
            'bg-amber px-4 py-2 font-body text-body-sm text-void-950',
            'opacity-0 transition-all duration-300 ease-glacial',
            'focus:translate-y-0 focus:opacity-100',
            'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 focus:ring-offset-void-950'
          )}
        >
          Skip to navigation
        </a>
      </div>
    );
  }
);
SkipLinks.displayName = 'SkipLinks';
export default SkipLinks;
