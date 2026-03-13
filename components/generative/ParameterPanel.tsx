'use client';

import { forwardRef, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { PieceParameter } from '@/lib/generative/pieces/types';

interface ParameterPanelProps {
  parameters: PieceParameter[];
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
  onReset: () => void;
  className?: string;
}

const ParameterPanel = forwardRef<HTMLDivElement, ParameterPanelProps>(
  ({ parameters, values, onChange, onReset, className }, ref) => {
    const handleSliderChange = useCallback(
      (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(key, parseFloat(e.target.value));
      },
      [onChange]
    );

    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-5', className)}
        role="group"
        aria-label="Artwork parameters"
      >
        {parameters.map((param) => {
          const currentValue = values[param.key] ?? param.default;

          return (
            <div key={param.key} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor={`param-${param.key}`}
                  className="font-body text-body-sm text-ivory-200"
                >
                  {param.label}
                </label>
                <span className="font-mono text-mono-sm text-amber">
                  {currentValue}
                </span>
              </div>
              {param.description && (
                <p className="text-caption text-ivory-400">
                  {param.description}
                </p>
              )}
              <Slider
                id={`param-${param.key}`}
                min={param.min}
                max={param.max}
                step={param.step}
                value={currentValue}
                onChange={(e) => handleSliderChange(param.key, e)}
                aria-label={`${param.label}: ${currentValue}`}
                aria-valuemin={param.min}
                aria-valuemax={param.max}
                aria-valuenow={currentValue}
              />
              <div className="flex justify-between">
                <span className="font-mono text-mono-sm text-ivory-400">
                  {param.min}
                </span>
                <span className="font-mono text-mono-sm text-ivory-400">
                  {param.max}
                </span>
              </div>
            </div>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="mt-2 self-start gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>
    );
  }
);

ParameterPanel.displayName = 'ParameterPanel';
export default ParameterPanel;
