import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-caption font-semibold transition-colors duration-300 ease-glacial focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 focus:ring-offset-void-950',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-amber text-void-950',
        secondary:
          'border-transparent bg-void-800 text-ivory-50',
        outline:
          'border-void-700 text-ivory-50',
        destructive:
          'border-transparent bg-error text-ivory-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
