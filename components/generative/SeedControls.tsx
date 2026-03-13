'use client';

import { forwardRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SeedControlsProps {
  seed: number;
  onSeedChange: (seed: number) => void;
  recommendedSeeds?: number[];
  className?: string;
}

const SeedControls = forwardRef<HTMLDivElement, SeedControlsProps>(
  ({ seed, onSeedChange, recommendedSeeds, className }, ref) => {
    const [inputValue, setInputValue] = useState('');

    const handlePrevious = useCallback(() => {
      onSeedChange(seed - 1);
    }, [seed, onSeedChange]);

    const handleNext = useCallback(() => {
      onSeedChange(seed + 1);
    }, [seed, onSeedChange]);

    const handleRandom = useCallback(() => {
      onSeedChange(Math.floor(Math.random() * 10000));
    }, [onSeedChange]);

    const handleManualInput = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          const parsed = parseInt(inputValue, 10);
          if (!isNaN(parsed) && parsed >= 0) {
            onSeedChange(parsed);
            setInputValue('');
          }
        }
      },
      [inputValue, onSeedChange]
    );

    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-3', className)}
        role="group"
        aria-label="Seed controls"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-mono-md text-amber" aria-live="polite">
            Seed: {seed}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            aria-label="Previous seed"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            aria-label="Next seed"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRandom}
            aria-label="Random seed"
          >
            <Shuffle className="h-4 w-4" />
          </Button>

          <div className="relative flex items-center ml-2">
            <Hash className="absolute left-2 h-3.5 w-3.5 text-ivory-400 pointer-events-none" />
            <input
              type="number"
              min={0}
              max={99999}
              placeholder="Go to..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleManualInput}
              className={cn(
                'w-28 h-9 pl-7 pr-2 rounded-md',
                'bg-void-800 border border-void-700 text-ivory-50',
                'font-mono text-mono-sm',
                'placeholder:text-ivory-400',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-void-950',
                'transition-colors duration-300 ease-glacial'
              )}
              aria-label="Enter seed number"
            />
          </div>
        </div>

        {recommendedSeeds && recommendedSeeds.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="font-body text-caption text-ivory-400">
              Recommended seeds
            </span>
            <div className="flex flex-wrap gap-1.5">
              {recommendedSeeds.map((rs) => (
                <button
                  key={rs}
                  onClick={() => onSeedChange(rs)}
                  aria-label={`Use recommended seed ${rs}`}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-1 focus-visible:ring-offset-void-950 rounded-full"
                >
                  <Badge
                    variant={rs === seed ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer font-mono text-mono-sm transition-colors duration-300 ease-glacial',
                      rs === seed
                        ? ''
                        : 'hover:bg-void-800 hover:border-amber hover:text-amber'
                    )}
                  >
                    {rs}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

SeedControls.displayName = 'SeedControls';
export default SeedControls;
