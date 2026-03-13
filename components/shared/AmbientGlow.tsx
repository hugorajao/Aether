'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AmbientGlowProps {
  color: string;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

const intensityMap = {
  low: 0.15,
  medium: 0.3,
  high: 0.5,
} as const;

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const AmbientGlow = forwardRef<HTMLDivElement, AmbientGlowProps>(
  ({ color, className, intensity = 'medium' }, ref) => {
    const alpha = intensityMap[intensity];

    return (
      <motion.div
        ref={ref}
        className={cn(
          'absolute inset-0 -z-10 rounded-full blur-3xl',
          className
        )}
        style={
          {
            background: `radial-gradient(ellipse at center, ${hexToRgba(color, alpha)} 0%, ${hexToRgba(color, alpha * 0.4)} 40%, transparent 70%)`,
            '--glow-color': hexToRgba(color, alpha * 0.6),
          } as React.CSSProperties
        }
        animate={{
          boxShadow: [
            '0 0 60px 0px var(--glow-color)',
            '0 0 120px 10px var(--glow-color)',
            '0 0 60px 0px var(--glow-color)',
          ],
          transition: {
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          },
        }}
        aria-hidden="true"
      />
    );
  }
);
AmbientGlow.displayName = 'AmbientGlow';

export default AmbientGlow;
