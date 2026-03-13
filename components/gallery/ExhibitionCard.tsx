'use client';

import { forwardRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardReveal, glacialEase } from '@/lib/motion';
import { Badge } from '@/components/ui/badge';

interface ExhibitionCardExhibition {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  coverImagePath: string | null;
  themeColor: string | null;
  artworkCount: number;
}

interface ExhibitionCardProps {
  exhibition: ExhibitionCardExhibition;
  className?: string;
}

const ExhibitionCard = forwardRef<HTMLDivElement, ExhibitionCardProps>(
  ({ exhibition, className }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const themeColor = exhibition.themeColor || '#27272F';

    return (
      <motion.div
        ref={ref}
        variants={cardReveal}
        className={cn('group relative w-full overflow-hidden rounded-lg', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={`/exhibitions/${exhibition.slug}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-void-950 rounded-lg"
          aria-label={`View exhibition: ${exhibition.title}`}
        >
          <div className="relative h-[300px] overflow-hidden">
            {/* Background image with parallax */}
            {exhibition.coverImagePath ? (
              <motion.div
                className="absolute inset-0"
                animate={{
                  scale: isHovered ? 1.05 : 1,
                  y: isHovered ? -4 : 0,
                }}
                transition={{
                  duration: 0.8,
                  ease: glacialEase,
                }}
              >
                <Image
                  src={exhibition.coverImagePath}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </motion.div>
            ) : (
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}, ${themeColor}66, #09090B)`,
                }}
                animate={{
                  scale: isHovered ? 1.05 : 1,
                }}
                transition={{
                  duration: 0.8,
                  ease: glacialEase,
                }}
              />
            )}

            {/* Gradient overlay */}
            <div
              className="absolute inset-0 z-10"
              style={{
                background:
                  'linear-gradient(to top, rgba(9, 9, 11, 0.95) 0%, rgba(9, 9, 11, 0.5) 50%, rgba(9, 9, 11, 0.2) 100%)',
              }}
              aria-hidden="true"
            />

            {/* Content overlay */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
              <div className="mb-3">
                <Badge variant="secondary" className="text-mono-sm">
                  {exhibition.artworkCount} artwork{exhibition.artworkCount !== 1 ? 's' : ''}
                </Badge>
              </div>

              <h3 className="font-display text-display-md text-ivory-50">
                {exhibition.title}
              </h3>

              {exhibition.subtitle && (
                <p className="mt-2 max-w-2xl font-body text-body-lg text-ivory-300">
                  {exhibition.subtitle}
                </p>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }
);
ExhibitionCard.displayName = 'ExhibitionCard';

export default ExhibitionCard;
