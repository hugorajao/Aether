'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { stagger, cardReveal } from '@/lib/motion';
import ArtworkCard, { type ArtworkCardArtwork } from './ArtworkCard';

interface ArtworkGridProps {
  artworks: ArtworkCardArtwork[];
  className?: string;
}

const ArtworkGrid = forwardRef<HTMLDivElement, ArtworkGridProps>(
  ({ artworks, className }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={stagger}
        initial="hidden"
        animate="visible"
        className={cn(
          'columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6',
          className
        )}
      >
        {artworks.map((artwork) => (
          <motion.div key={artwork.id} variants={cardReveal} className="break-inside-avoid">
            <ArtworkCard artwork={artwork} />
          </motion.div>
        ))}
      </motion.div>
    );
  }
);
ArtworkGrid.displayName = 'ArtworkGrid';

export default ArtworkGrid;
