'use client';

import {
  forwardRef,
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react';
import { cn } from '@/lib/utils';
import type { GenerativePiece } from '@/lib/generative/pieces/types';

interface GenerativeCanvasProps {
  piece: GenerativePiece;
  seed?: number;
  params?: Record<string, number>;
  className?: string;
  interactive?: boolean;
  autoplay?: boolean;
  onReady?: () => void;
}

const GenerativeCanvas = forwardRef<HTMLDivElement, GenerativeCanvasProps>(
  (
    {
      piece,
      seed,
      params,
      className,
      autoplay = true,
      onReady,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const p5Ref = useRef<unknown>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const activeSeed = seed ?? piece.defaultSeed;
    const activeParams = params ?? Object.fromEntries(
      piece.parameters.map((p) => [p.key, p.default])
    );

    const initSketch = useCallback(async () => {
      if (!containerRef.current) return;

      // Clean up existing instance
      if (p5Ref.current) {
        try {
          (p5Ref.current as { remove: () => void }).remove();
        } catch {
          // ignore cleanup errors
        }
        p5Ref.current = null;
      }

      // Clear container
      containerRef.current.innerHTML = '';

      // Dynamic import p5
      const p5Module = await import('p5');
      const p5Constructor = p5Module.default;

      if (!containerRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const instance = new p5Constructor((p: any) => {
        piece.sketch(p, activeParams, activeSeed);

        // Override setup to handle ready callback
        const originalSetup = (p as { setup?: () => void }).setup;
        (p as { setup: () => void }).setup = () => {
          if (originalSetup) originalSetup.call(p);
          setIsLoaded(true);
          onReady?.();
        };

        if (!autoplay) {
          const originalDraw = (p as { draw?: () => void }).draw;
          let firstFrame = true;
          (p as { draw: () => void }).draw = () => {
            if (originalDraw) originalDraw.call(p);
            if (firstFrame) {
              (p as { noLoop: () => void }).noLoop();
              firstFrame = false;
            }
          };
        }
      }, containerRef.current);

      p5Ref.current = instance;
    }, [piece, activeSeed, activeParams, autoplay, onReady]);

    useEffect(() => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (prefersReducedMotion) {
        // Still init but don't loop
        initSketch().then(() => {
          if (p5Ref.current) {
            (p5Ref.current as { noLoop: () => void }).noLoop();
          }
        });
      } else {
        initSketch();
      }

      return () => {
        if (p5Ref.current) {
          try {
            (p5Ref.current as { remove: () => void }).remove();
          } catch {
            // ignore cleanup errors
          }
          p5Ref.current = null;
        }
      };
    }, [initSketch]);

    return (
      <div ref={ref} className={cn('relative w-full h-full', className)}>
        <div
          ref={containerRef}
          className="w-full h-full [&_canvas]:w-full [&_canvas]:h-full [&_canvas]:object-contain"
          role="img"
          aria-label={`Generative artwork: ${piece.title}. ${piece.algorithm}`}
        />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-void-950">
            <div className="w-8 h-8 border-2 border-void-700 border-t-amber rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }
);

GenerativeCanvas.displayName = 'GenerativeCanvas';
export default GenerativeCanvas;
