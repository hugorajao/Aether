'use client';

import { forwardRef, useEffect, useRef, useState, useCallback } from 'react';
import type p5Type from 'p5';
import { cn } from '@/lib/utils';
import type { GenerativePiece } from '@/lib/generative/pieces/types';

interface GenerativeThumbnailProps {
  piece: GenerativePiece;
  className?: string;
  size?: number;
}

const GenerativeThumbnail = forwardRef<HTMLDivElement, GenerativeThumbnailProps>(
  ({ piece, className, size = 200 }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const p5Ref = useRef<unknown>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Intersection observer: only render when visible
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        { threshold: 0.1 }
      );

      observer.observe(container);

      return () => {
        observer.disconnect();
      };
    }, []);

    // Initialize p5 sketch when visible
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

      containerRef.current.innerHTML = '';

      const p5Module = await import('p5');
      const p5Constructor = p5Module.default;

      if (!containerRef.current) return;

      // Build reduced params for thumbnail performance
      const thumbnailParams = Object.fromEntries(
        piece.parameters.map((param) => [param.key, param.default])
      );

      const instance = new p5Constructor((p: unknown) => {
        piece.sketch(
          p as p5Type,
          thumbnailParams,
          piece.defaultSeed
        );

        // Override createCanvas to enforce thumbnail size
        const originalSetup = (p as { setup?: () => void }).setup;
        (p as { setup: () => void }).setup = () => {
          if (originalSetup) originalSetup.call(p);
          setIsLoaded(true);
        };

        // Respect reduced motion
        const prefersReducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;

        if (prefersReducedMotion) {
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
    }, [piece]);

    useEffect(() => {
      if (isVisible) {
        initSketch();
      } else {
        // Pause or remove when not visible to save resources
        if (p5Ref.current) {
          try {
            (p5Ref.current as { remove: () => void }).remove();
          } catch {
            // ignore cleanup errors
          }
          p5Ref.current = null;
          setIsLoaded(false);
        }
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
    }, [isVisible, initSketch]);

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-lg overflow-hidden',
          'border-2 border-void-700 transition-all duration-500 ease-glacial',
          'hover:border-amber hover:shadow-[0_0_24px_rgba(212,160,84,0.2)]',
          'focus-within:border-amber focus-within:shadow-[0_0_24px_rgba(212,160,84,0.2)]',
          className
        )}
        style={{ width: size, height: size }}
      >
        <div
          ref={containerRef}
          className="w-full h-full [&_canvas]:w-full [&_canvas]:h-full [&_canvas]:object-cover"
          role="img"
          aria-label={`Thumbnail of generative artwork: ${piece.title}`}
        />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-void-950">
            <div className="w-5 h-5 border-2 border-void-700 border-t-amber rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }
);

GenerativeThumbnail.displayName = 'GenerativeThumbnail';
export default GenerativeThumbnail;
