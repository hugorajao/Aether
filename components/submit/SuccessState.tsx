'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glacialEase } from '@/lib/motion';

interface SuccessStateProps {
  artworkSlug: string;
  className?: string;
}

const SuccessState = forwardRef<HTMLDivElement, SuccessStateProps>(
  ({ artworkSlug, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-16 text-center',
          className
        )}
      >
        {/* Animated check */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 200,
            delay: 0.1,
          }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              damping: 12,
              stiffness: 300,
              delay: 0.3,
            }}
          >
            <Check className="h-10 w-10 text-success" strokeWidth={2.5} />
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.4,
            ease: glacialEase,
          }}
        >
          <h3 className="font-display text-heading-lg text-ivory-50">
            Your art has been added to the collection
          </h3>
          <p className="mt-2 font-body text-body-md text-ivory-400">
            Thank you for contributing to Aether.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.6,
            ease: glacialEase,
          }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href={`/collection/${artworkSlug}`}
            className={cn(
              'inline-flex h-11 items-center justify-center rounded-lg bg-amber px-6',
              'font-body text-body-md font-medium text-void-950',
              'transition-colors duration-300 ease-glacial hover:bg-amber-light',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-void-950'
            )}
          >
            View Your Piece
          </Link>
          <button
            onClick={() => window.location.reload()}
            className={cn(
              'inline-flex h-11 items-center justify-center rounded-lg border border-void-700 px-6',
              'font-body text-body-md text-ivory-200',
              'transition-colors duration-300 ease-glacial hover:bg-void-800',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-void-950'
            )}
          >
            Submit Another
          </button>
        </motion.div>
      </div>
    );
  }
);
SuccessState.displayName = 'SuccessState';

export default SuccessState;
