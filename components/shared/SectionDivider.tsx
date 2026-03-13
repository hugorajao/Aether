'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SectionDividerProps {
  className?: string;
  withDot?: boolean;
}

const SectionDivider = forwardRef<HTMLDivElement, SectionDividerProps>(
  ({ className, withDot = false }, ref) => (
    <div
      ref={ref}
      className={cn('relative flex items-center w-full py-8', className)}
      role="separator"
    >
      <div className="flex-1 h-px bg-void-700" />
      {withDot && (
        <div className="mx-4 h-1.5 w-1.5 rounded-full bg-amber shrink-0" />
      )}
      <div className="flex-1 h-px bg-void-700" />
    </div>
  )
);
SectionDivider.displayName = 'SectionDivider';

export default SectionDivider;
