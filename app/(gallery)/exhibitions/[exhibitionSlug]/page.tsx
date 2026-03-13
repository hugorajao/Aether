'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeUp, stagger, glacialEase } from '@/lib/motion';

interface ExhibitionArtwork {
  id: string;
  slug: string;
  title: string;
  artistName: string;
  description: string | null;
  artistStatement: string | null;
  type: 'generative' | 'community';
  imagePath: string | null;
  thumbnailPath: string | null;
  dominantColor: string | null;
  medium: string | null;
}

interface ExhibitionData {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  curatorNote: string | null;
  themeColor: string | null;
  artworks: ExhibitionArtwork[];
}

const ALIGNMENTS = ['center', 'left', 'right'] as const;

function ArtworkSection({
  artwork,
  index,
}: {
  artwork: ExhibitionArtwork;
  index: number;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const alignment = ALIGNMENTS[index % ALIGNMENTS.length];

  const textAlignment = {
    center: 'mx-auto text-center max-w-2xl',
    left: 'mr-auto text-left max-w-2xl',
    right: 'ml-auto text-right max-w-2xl',
  }[alignment];

  return (
    <motion.section
      ref={sectionRef}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="py-24 md:py-32"
      style={
        {
          '--glow-color': artwork.dominantColor || '#3F3F49',
        } as React.CSSProperties
      }
    >
      {/* Full-bleed image */}
      {artwork.imagePath ? (
        <figure className="relative mx-auto max-h-[80vh] overflow-hidden rounded-lg">
          <Image
            src={artwork.imagePath}
            alt={`${artwork.title} by ${artwork.artistName}`}
            width={1400}
            height={900}
            className="h-auto max-h-[80vh] w-full object-contain"
            sizes="100vw"
          />
        </figure>
      ) : artwork.type === 'generative' ? (
        <div
          className={cn(
            'relative mx-auto flex aspect-square max-h-[80vh] max-w-3xl items-center justify-center',
            'rounded-lg border border-void-700 bg-void-900'
          )}
        >
          <p className="font-mono text-mono-md text-ivory-400">
            Generative piece — view in{' '}
            <Link
              href={`/generative/${artwork.slug}`}
              className="text-amber underline underline-offset-4 hover:text-amber-light"
            >
              playground
            </Link>
          </p>
        </div>
      ) : null}

      {/* Magazine-style text */}
      <div className={cn('mt-10 px-6 md:px-12', textAlignment)}>
        <h2 className="font-display text-heading-lg text-ivory-50">
          {artwork.title}
        </h2>
        <p className="mt-2 font-body text-body-sm text-ivory-400">
          {artwork.artistName}
          {artwork.medium && <span className="ml-2">— {artwork.medium}</span>}
        </p>

        {artwork.description && (
          <p className="mt-6 font-body text-body-md leading-relaxed text-ivory-200">
            {artwork.description}
          </p>
        )}

        {artwork.artistStatement && (
          <blockquote
            className={cn(
              'mt-6 border-amber/30 font-body text-body-md italic leading-relaxed text-ivory-300',
              alignment === 'right' ? 'border-r-2 pr-6' : 'border-l-2 pl-6'
            )}
          >
            {artwork.artistStatement}
          </blockquote>
        )}
      </div>
    </motion.section>
  );
}

function ProgressIndicator() {
  const { scrollYProgress } = useScroll();
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      className="fixed right-4 top-1/4 z-40 hidden h-1/2 w-[2px] overflow-hidden rounded-full bg-void-700 md:block"
      aria-hidden="true"
    >
      <motion.div
        className="h-full w-full origin-top bg-amber"
        style={{ scaleY }}
      />
    </div>
  );
}

export default function ExhibitionPage() {
  const params = useParams();
  const slug = params.exhibitionSlug as string;
  const [exhibition, setExhibition] = useState<ExhibitionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExhibition = useCallback(async () => {
    try {
      const res = await fetch(`/api/exhibitions/${slug}`);
      if (!res.ok) throw new Error('Exhibition not found');
      const data = await res.json();
      setExhibition(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchExhibition();
  }, [fetchExhibition]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ivory-400" />
      </div>
    );
  }

  if (error || !exhibition) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="font-body text-body-md text-ivory-400">
          {error || 'Exhibition not found'}
        </p>
        <Link
          href="/exhibitions"
          className="font-body text-body-sm text-amber hover:underline"
        >
          Back to exhibitions
        </Link>
      </div>
    );
  }

  const themeColor = exhibition.themeColor || '#27272F';

  return (
    <article>
      <ProgressIndicator />

      {/* Hero section */}
      <header
        className="relative flex min-h-[50vh] items-end"
        style={{
          background: `linear-gradient(180deg, ${themeColor}44 0%, ${themeColor}22 40%, #09090B 100%)`,
        }}
      >
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-16 pt-32 md:px-12">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp}>
              <Link
                href="/exhibitions"
                className={cn(
                  'mb-8 inline-flex items-center gap-2 font-body text-body-sm text-ivory-400',
                  'transition-colors duration-300 hover:text-ivory-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber',
                  'focus-visible:ring-offset-2 focus-visible:ring-offset-void-950 rounded-sm'
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                All Exhibitions
              </Link>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-display-lg text-ivory-50 md:text-display-xl"
            >
              {exhibition.title}
            </motion.h1>

            {exhibition.subtitle && (
              <motion.p
                variants={fadeUp}
                className="mt-4 max-w-3xl font-body text-body-lg text-ivory-300"
              >
                {exhibition.subtitle}
              </motion.p>
            )}

            {exhibition.curatorNote && (
              <motion.blockquote
                variants={fadeUp}
                className="mt-8 max-w-2xl border-l-2 border-amber/30 pl-6 font-body text-body-md italic leading-relaxed text-ivory-300"
              >
                {exhibition.curatorNote}
              </motion.blockquote>
            )}
          </motion.div>
        </div>
      </header>

      {/* Artworks — vertical narrative scroll */}
      <div className="mx-auto max-w-5xl px-6 md:px-12">
        {exhibition.artworks.length === 0 ? (
          <p className="py-20 text-center font-body text-body-md text-ivory-400">
            This exhibition is being prepared. Check back soon.
          </p>
        ) : (
          <div className="divide-y divide-void-800">
            {exhibition.artworks.map((artwork, i) => (
              <ArtworkSection key={artwork.id} artwork={artwork} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Footer spacing */}
      <div className="h-32" aria-hidden="true" />
    </article>
  );
}
