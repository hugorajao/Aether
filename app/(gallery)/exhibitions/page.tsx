'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeUp, stagger, glacialEase } from '@/lib/motion';
import { Badge } from '@/components/ui/badge';

interface ExhibitionSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  themeColor: string | null;
  coverImagePath: string | null;
  artworkCount: number;
}

export default function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState<ExhibitionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExhibitions() {
      try {
        const res = await fetch('/api/exhibitions');
        if (!res.ok) throw new Error('Failed to load exhibitions');
        const data = await res.json();
        setExhibitions(data.exhibitions ?? data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchExhibitions();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ivory-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="font-body text-body-md text-ivory-400">{error}</p>
      </div>
    );
  }

  return (
    <section className="px-6 py-20 md:px-12 lg:px-20">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-5xl"
      >
        <motion.header variants={fadeUp} className="mb-16">
          <h1 className="font-display text-display-lg text-ivory-50">
            Exhibitions
          </h1>
          <p className="mt-4 max-w-2xl font-body text-body-lg text-ivory-300">
            Curated collections that explore themes at the intersection of
            algorithms, aesthetics, and artificial intelligence.
          </p>
        </motion.header>

        {exhibitions.length === 0 ? (
          <motion.p variants={fadeUp} className="font-body text-body-md text-ivory-400">
            No exhibitions yet. Check back soon.
          </motion.p>
        ) : (
          <div className="flex flex-col gap-8">
            {exhibitions.map((exhibition) => {
              const themeColor = exhibition.themeColor || '#27272F';

              return (
                <motion.div key={exhibition.id} variants={fadeUp}>
                  <Link
                    href={`/exhibitions/${exhibition.slug}`}
                    className={cn(
                      'group relative block w-full overflow-hidden rounded-lg',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber',
                      'focus-visible:ring-offset-2 focus-visible:ring-offset-void-950'
                    )}
                    aria-label={`View exhibition: ${exhibition.title}`}
                  >
                    <div className="relative h-[300px] overflow-hidden">
                      {/* Background gradient */}
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${themeColor}, ${themeColor}55, #09090B)`,
                        }}
                        whileHover={{ scale: 1.03 }}
                        transition={{
                          duration: 0.8,
                          ease: glacialEase,
                        }}
                      />

                      {/* Gradient overlay for readability */}
                      <div
                        className="absolute inset-0 z-10"
                        style={{
                          background:
                            'linear-gradient(to top, rgba(9,9,11,0.92) 0%, rgba(9,9,11,0.4) 50%, rgba(9,9,11,0.15) 100%)',
                        }}
                        aria-hidden="true"
                      />

                      {/* Content */}
                      <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-10">
                        <div className="mb-3">
                          <Badge variant="secondary" className="text-mono-sm">
                            {exhibition.artworkCount} artwork
                            {exhibition.artworkCount !== 1 ? 's' : ''}
                          </Badge>
                        </div>

                        <h2 className="font-display text-display-md text-ivory-50">
                          {exhibition.title}
                        </h2>

                        {exhibition.subtitle && (
                          <p className="mt-2 max-w-2xl font-body text-body-lg text-ivory-300">
                            {exhibition.subtitle}
                          </p>
                        )}

                        <span
                          className={cn(
                            'mt-4 inline-flex items-center gap-2',
                            'font-body text-body-sm text-amber opacity-0',
                            'transition-opacity duration-500 group-hover:opacity-100'
                          )}
                          aria-hidden="true"
                        >
                          Enter Exhibition
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </section>
  );
}
