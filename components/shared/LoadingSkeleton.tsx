'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/* ------------------------------------------------------------------ */
/*  TextSkeleton                                                      */
/* ------------------------------------------------------------------ */

interface TextSkeletonProps {
  lines?: number;
  className?: string;
}

export const TextSkeleton = forwardRef<HTMLDivElement, TextSkeletonProps>(
  ({ lines = 3, className }, ref) => (
    <div ref={ref} className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4 rounded', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  )
);
TextSkeleton.displayName = 'TextSkeleton';

/* ------------------------------------------------------------------ */
/*  ArtworkCardSkeleton                                               */
/* ------------------------------------------------------------------ */

interface ArtworkCardSkeletonProps {
  className?: string;
}

export const ArtworkCardSkeleton = forwardRef<
  HTMLDivElement,
  ArtworkCardSkeletonProps
>(({ className }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg overflow-hidden border border-void-800 bg-void-900',
      className
    )}
  >
    {/* Image placeholder */}
    <Skeleton className="aspect-[4/3] w-full rounded-none" />
    {/* Text area */}
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
));
ArtworkCardSkeleton.displayName = 'ArtworkCardSkeleton';

/* ------------------------------------------------------------------ */
/*  ArtworkGridSkeleton                                               */
/* ------------------------------------------------------------------ */

interface ArtworkGridSkeletonProps {
  count?: number;
  className?: string;
}

export const ArtworkGridSkeleton = forwardRef<
  HTMLDivElement,
  ArtworkGridSkeletonProps
>(({ count = 6, className }, ref) => (
  <div
    ref={ref}
    className={cn(
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
      className
    )}
  >
    {Array.from({ length: count }).map((_, i) => (
      <ArtworkCardSkeleton key={i} />
    ))}
  </div>
));
ArtworkGridSkeleton.displayName = 'ArtworkGridSkeleton';

/* ------------------------------------------------------------------ */
/*  DetailSkeleton                                                    */
/* ------------------------------------------------------------------ */

interface DetailSkeletonProps {
  className?: string;
}

export const DetailSkeleton = forwardRef<HTMLDivElement, DetailSkeletonProps>(
  ({ className }, ref) => (
    <div
      ref={ref}
      className={cn(
        'grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12',
        className
      )}
    >
      {/* Left: artwork image */}
      <Skeleton className="aspect-square w-full rounded-lg" />
      {/* Right: details */}
      <div className="space-y-6 py-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="pt-4">
          <TextSkeleton lines={4} />
        </div>
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>
    </div>
  )
);
DetailSkeleton.displayName = 'DetailSkeleton';
