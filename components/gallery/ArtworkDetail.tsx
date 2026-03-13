'use client';

import { forwardRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import { cn, formatDate, formatFileSize } from '@/lib/utils';
import { fadeUp, stagger } from '@/lib/motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AmbientGlow from '@/components/shared/AmbientGlow';
import type { Artwork } from '@/db/schema';

interface ArtworkDetailProps {
  artwork: Artwork;
  onImmersiveOpen?: () => void;
  className?: string;
}

const ArtworkDetail = forwardRef<HTMLDivElement, ArtworkDetailProps>(
  ({ artwork, onImmersiveOpen, className }, ref) => {
    const imageSrc = artwork.imagePath || artwork.thumbnailPath;
    const gradientColor = artwork.dominantColor || '#27272F';
    const tags = artwork.tags ? artwork.tags.split(',').map((t) => t.trim()) : [];

    let generativeConfig: Record<string, unknown> | null = null;
    if (artwork.generativeConfig) {
      try {
        generativeConfig = JSON.parse(artwork.generativeConfig);
      } catch {
        generativeConfig = null;
      }
    }

    return (
      <motion.div
        ref={ref}
        variants={stagger}
        initial="hidden"
        animate="visible"
        className={cn(
          'grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr] lg:gap-12',
          className
        )}
      >
        {/* Left column — Artwork image */}
        <motion.div variants={fadeUp} className="relative">
          <div className="relative overflow-hidden rounded-lg">
            {artwork.dominantColor && (
              <AmbientGlow
                color={artwork.dominantColor}
                intensity="high"
                className="scale-150"
              />
            )}

            {imageSrc ? (
              <div className="relative aspect-[4/3]">
                <Image
                  src={imageSrc}
                  alt={`${artwork.title} by ${artwork.artistName}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="rounded-lg object-contain"
                  priority
                />
              </div>
            ) : (
              <div
                className="aspect-[4/3] rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${gradientColor}, ${gradientColor}88, #09090B)`,
                }}
                role="img"
                aria-label={`Generative artwork: ${artwork.title}`}
              />
            )}
          </div>

          {onImmersiveOpen && (
            <Button
              variant="outline"
              size="lg"
              className="mt-4 w-full gap-2"
              onClick={onImmersiveOpen}
            >
              <Maximize2 className="h-4 w-4" />
              View Immersive
            </Button>
          )}
        </motion.div>

        {/* Right column — Details */}
        <motion.div variants={fadeUp} className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="font-display text-display-md text-ivory-50">
              {artwork.title}
            </h1>
            <p className="mt-2 font-body text-heading-md text-ivory-300">
              {artwork.artistName}
            </p>
            {artwork.medium && (
              <p className="mt-1 font-mono text-mono-sm text-amber">
                {artwork.medium}
              </p>
            )}
          </div>

          <Separator />

          {/* Artist Statement */}
          {artwork.artistStatement && (
            <div>
              <h2 className="mb-2 font-body text-body-sm uppercase tracking-wider text-ivory-400">
                Artist Statement
              </h2>
              <div className="text-body-md text-ivory-200">
                {artwork.artistStatement.split('\n').map((line, i) => (
                  <p
                    key={i}
                    className={cn(
                      i === 0 && 'font-display italic text-body-lg text-ivory-100'
                    )}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {artwork.description && (
            <div>
              <h2 className="mb-2 font-body text-body-sm uppercase tracking-wider text-ivory-400">
                Description
              </h2>
              <p className="text-body-md text-ivory-200">
                {artwork.description}
              </p>
            </div>
          )}

          {/* Algorithm section — generative only */}
          {artwork.type === 'generative' && generativeConfig && (
            <div>
              <h2 className="mb-2 font-body text-body-sm uppercase tracking-wider text-ivory-400">
                Algorithm
              </h2>
              <div className="rounded-md bg-void-900 p-4">
                <dl className="space-y-2">
                  {Object.entries(generativeConfig).map(([key, value]) => (
                    <div key={key} className="flex items-baseline justify-between gap-4">
                      <dt className="font-mono text-mono-sm text-ivory-400">
                        {key}
                      </dt>
                      <dd className="font-mono text-mono-sm text-amber text-right">
                        {String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {/* Prompt section — community only */}
          {artwork.type === 'community' && artwork.prompt && (
            <div>
              <h2 className="mb-2 font-body text-body-sm uppercase tracking-wider text-ivory-400">
                Prompt
              </h2>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-void-900 p-4 font-mono text-mono-sm text-ivory-200">
                {artwork.prompt}
              </pre>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <h2 className="mb-2 font-body text-body-sm uppercase tracking-wider text-ivory-400">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Metadata */}
          <div>
            <h2 className="mb-2 font-body text-body-sm uppercase tracking-wider text-ivory-400">
              Details
            </h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              {artwork.width && artwork.height && (
                <>
                  <dt className="font-mono text-mono-sm text-ivory-400">
                    Dimensions
                  </dt>
                  <dd className="font-mono text-mono-sm text-ivory-200 text-right">
                    {artwork.width} &times; {artwork.height}
                  </dd>
                </>
              )}
              {artwork.fileSizeBytes && (
                <>
                  <dt className="font-mono text-mono-sm text-ivory-400">
                    File Size
                  </dt>
                  <dd className="font-mono text-mono-sm text-ivory-200 text-right">
                    {formatFileSize(artwork.fileSizeBytes)}
                  </dd>
                </>
              )}
              {artwork.createdAt && (
                <>
                  <dt className="font-mono text-mono-sm text-ivory-400">
                    Date
                  </dt>
                  <dd className="font-mono text-mono-sm text-ivory-200 text-right">
                    {formatDate(artwork.createdAt)}
                  </dd>
                </>
              )}
              {artwork.type === 'generative' && generativeConfig && 'seed' in generativeConfig && (
                <>
                  <dt className="font-mono text-mono-sm text-ivory-400">
                    Seed
                  </dt>
                  <dd className="font-mono text-mono-sm text-amber text-right">
                    {String(generativeConfig.seed)}
                  </dd>
                </>
              )}
            </dl>
          </div>
        </motion.div>
      </motion.div>
    );
  }
);
ArtworkDetail.displayName = 'ArtworkDetail';

export default ArtworkDetail;
