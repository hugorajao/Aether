'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeUp, stagger, cardReveal, glacialEase } from '@/lib/motion';

interface PieceMeta {
  id: string;
  title: string;
  algorithm: string;
  dominantColor: string;
  tags: string[];
}

const PIECE_REGISTRY: PieceMeta[] = [
  { id: 'erosion-memory', title: 'Erosion Memory', algorithm: 'Flow field particle system', dominantColor: '#4ECDC4', tags: ['flow field', 'particles'] },
  { id: 'harmonic-lattice', title: 'Harmonic Lattice', algorithm: 'Sinusoidal grid interference', dominantColor: '#FF6B6B', tags: ['sine', 'grid'] },
  { id: 'chromatic-drift', title: 'Chromatic Drift', algorithm: 'Animated Voronoi tessellation', dominantColor: '#C77DFF', tags: ['voronoi', 'color'] },
  { id: 'mycelial-network', title: 'Mycelial Network', algorithm: 'Space colonization branching', dominantColor: '#80ED99', tags: ['branching', 'organic'] },
  { id: 'frequency-domain', title: 'Frequency Domain', algorithm: 'Radial FFT visualization', dominantColor: '#48BFE3', tags: ['fft', 'radial'] },
  { id: 'accretion', title: 'Accretion', algorithm: 'Diffusion-limited aggregation', dominantColor: '#F9C74F', tags: ['dla', 'growth'] },
  { id: 'sine-cartography', title: 'Sine Cartography', algorithm: 'Topographic contour lines', dominantColor: '#90BE6D', tags: ['contour', 'terrain'] },
  { id: 'swarm-intelligence', title: 'Swarm Intelligence', algorithm: 'Boids flocking simulation', dominantColor: '#F8961E', tags: ['boids', 'flocking'] },
  { id: 'penrose-tiling', title: 'Penrose Tiling', algorithm: 'Aperiodic P3 subdivision', dominantColor: '#577590', tags: ['tiling', 'geometry'] },
  { id: 'reaction-diffusion', title: 'Reaction-Diffusion', algorithm: 'Gray-Scott model', dominantColor: '#43AA8B', tags: ['reaction', 'simulation'] },
  { id: 'strange-attractor', title: 'Strange Attractor', algorithm: 'Lorenz system projection', dominantColor: '#F94144', tags: ['chaos', 'attractor'] },
  { id: 'recursive-breath', title: 'Recursive Breath', algorithm: 'Animated recursive tree with wind', dominantColor: '#277DA1', tags: ['fractal', 'tree'] },
];

function PieceCard({ piece }: { piece: PieceMeta }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div variants={cardReveal}>
      <Link
        href={`/generative/${piece.id}`}
        className={cn(
          'group relative flex flex-col overflow-hidden rounded-lg',
          'border border-void-700 bg-void-900',
          'transition-all duration-500',
          'hover:border-amber/50 hover:shadow-[0_0_30px_-5px_var(--glow-color)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-void-950'
        )}
        style={{ '--glow-color': piece.dominantColor } as React.CSSProperties}
        aria-label={`Open ${piece.title} in generative playground`}
      >
        {/* Thumbnail */}
        <div className="relative aspect-square overflow-hidden bg-void-800">
          {!imgError ? (
            <Image
              src={`/collection/thumbnails/${piece.id}.png`}
              alt={`${piece.title} — ${piece.algorithm}`}
              width={200}
              height={200}
              className={cn(
                'h-full w-full object-cover',
                'transition-transform duration-700',
                'group-hover:scale-105'
              )}
              style={{
                transitionTimingFunction: `cubic-bezier(${glacialEase.join(',')})`,
              }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: `radial-gradient(circle at center, ${piece.dominantColor}33, #09090B)`,
              }}
            >
              <Sparkles className="h-8 w-8 text-ivory-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 p-4">
          <h3 className="font-display text-heading-sm text-ivory-50">
            {piece.title}
          </h3>
          <p className="font-mono text-mono-sm text-ivory-400">
            {piece.algorithm}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function GenerativePlaygroundPage() {
  return (
    <section className="px-6 py-20 md:px-12 lg:px-20">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-6xl"
      >
        <motion.header variants={fadeUp} className="mb-16">
          <h1 className="font-display text-display-lg text-ivory-50">
            Generative Playground
          </h1>
          <p className="mt-4 max-w-2xl font-body text-body-lg text-ivory-300">
            Twelve algorithmically generated artworks, each built from a
            different mathematical system. Every piece is interactive — adjust
            parameters, change seeds, and explore the infinite variations hidden
            within the code.
          </p>
        </motion.header>

        <motion.div
          variants={stagger}
          className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
        >
          {PIECE_REGISTRY.map((piece) => (
            <PieceCard key={piece.id} piece={piece} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
