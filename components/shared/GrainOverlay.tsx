'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const GrainOverlay = forwardRef<HTMLDivElement, { className?: string }>(
  ({ className }, ref) => (
    <div
      ref={ref}
      className={cn(
        'fixed inset-0 z-[9999] pointer-events-none opacity-[0.03]',
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
      }}
      aria-hidden="true"
    />
  )
);
GrainOverlay.displayName = 'GrainOverlay';

export default GrainOverlay;
