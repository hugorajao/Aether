'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeUp, glacialTransition } from '@/lib/motion';
import { buttonVariants } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
  className?: string;
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className }, ref) => (
    <motion.div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-16',
        className
      )}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={glacialTransition}
    >
      {icon && (
        <div className="mb-6 text-ivory-400 [&_svg]:h-12 [&_svg]:w-12">
          {icon}
        </div>
      )}
      <h3 className="font-display text-xl text-ivory-50 mb-2">{title}</h3>
      <p className="text-ivory-400 font-body text-body-base max-w-md mb-8">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className={buttonVariants({ variant: 'outline' })}
        >
          {action.label}
        </Link>
      )}
    </motion.div>
  )
);
EmptyState.displayName = 'EmptyState';

export default EmptyState;
