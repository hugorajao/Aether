'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="range"
        ref={ref}
        className={cn(
          'w-full h-2 rounded-full appearance-none cursor-pointer bg-void-700 transition-colors duration-300 ease-glacial',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:duration-300 [&::-webkit-slider-thumb]:hover:bg-amber-light',
          '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-amber [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-colors [&::-moz-range-thumb]:duration-300 [&::-moz-range-thumb]:hover:bg-amber-light',
          '[&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-void-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-void-950',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
