'use client';

import { forwardRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardReveal, glacialEase } from '@/lib/motion';
import { Badge } from '@/components/ui/badge';

export interface ArtworkCardArtwork {
  id: string;
  slug: string;
  title: string;
  artistName: string;
  type: 'generative' | 'community';
  thumbnailPath: string | null;
  imagePath: string | null;
  dominantColor: string | null;
  medium: string | null;
  aiTool: string | null;
  tags: string | null;
}

interface ArtworkCardProps {
  artwork: ArtworkCardArtwork;
  className?: string;
}

const ArtworkCard = forwardRef<HTMLDivElement, ArtworkCardProps>(
  ({ artwork, className }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const imageSrc = artwork.thumbnailPath || artwork.imagePath;
    const gradientColor = artwork.dominantColor || '#27272F';

    return (
      <motion.div
        ref={ref}
        variants={cardReveal}
        className={cn('group relative overflow-hidden rounded-lg', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={`/collection/${artwork.slug}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-void-950 rounded-lg"
          aria-label={`View ${artwork.title} by ${artwork.artistName}`}
        >
          <motion.div
            className="relative"
            animate={{
              scale: isHovered ? 1.02 : 1,
              boxShadow: isHovered
                ? '0 20px 60px -12px rgba(0, 0, 0, 0.5)'
                : '0 4px 12px -4px rgba(0, 0, 0, 0.2)',
            }}
            transition={{
              duration: 0.5,
              ease: glacialEase,
            }}
          >
            {/* Image or gradient placeholder */}
            {imageSrc ? (
              <div className="relative aspect-[4/3]">
                <Image
                  src={imageSrc}
                  alt={`${artwork.title} by ${artwork.artistName}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className="aspect-[4/3]"
                style={{
                  background: `linear-gradient(135deg, ${gradientColor}, ${gradientColor}88, #09090B)`,
                }}
                role="img"
                aria-label={`Placeholder for ${artwork.title}`}
              />
            )}

            {/* Type badge top-right */}
            <div className="absolute top-3 right-3 z-10">
              {artwork.type === 'generative' ? (
                <Badge variant="default" className="text-mono-sm uppercase tracking-wider">
                  Generative
                </Badge>
              ) : artwork.aiTool ? (
                <Badge variant="secondary" className="text-mono-sm">
                  {artwork.aiTool}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-mono-sm">
                  Community
                </Badge>
              )}
            </div>

            {/* Hover overlay with title + artist */}
            <motion.div
              className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-void-950/90 via-void-950/40 to-transparent p-4"
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{
                duration: 0.4,
                ease: glacialEase,
              }}
              aria-hidden={!isHovered}
            >
              <motion.div
                initial={false}
                animate={{
                  y: isHovered ? 0 : 12,
                  opacity: isHovered ? 1 : 0,
                }}
                transition={{
                  duration: 0.5,
                  ease: glacialEase,
                }}
              >
                <h3 className="font-display text-heading-md text-ivory-50 leading-tight">
                  {artwork.title}
                </h3>
                <p className="mt-1 font-body text-body-sm text-ivory-300">
                  {artwork.artistName}
                </p>
                {artwork.medium && (
                  <p className="mt-1 font-mono text-mono-sm text-amber">
                    {artwork.medium}
                  </p>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </Link>
      </motion.div>
    );
  }
);
ArtworkCard.displayName = 'ArtworkCard';

export default ArtworkCard;
