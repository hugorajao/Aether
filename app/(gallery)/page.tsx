'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ChevronDown, ArrowRight, Upload } from 'lucide-react';
import { fadeUp, stagger, glacialEase, cardReveal } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import ArtworkCard, { type ArtworkCardArtwork } from '@/components/gallery/ArtworkCard';
import SectionDivider from '@/components/shared/SectionDivider';
import { ArtworkCardSkeleton } from '@/components/shared/LoadingSkeleton';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface ArtworksResponse {
  artworks: ArtworkCardArtwork[];
  nextCursor: string | null;
  total: number;
}

/* -------------------------------------------------------------------------- */
/*  Hero background — animated CSS gradients (SSR-safe, no p5)                */
/* -------------------------------------------------------------------------- */

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base void */}
      <div className="absolute inset-0 bg-void-950" />

      {/* Slow-moving radial gradients */}
      <motion.div
        className="absolute inset-0 opacity-40"
        animate={{
          background: [
            'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(212,160,84,0.08) 0%, transparent 70%)',
            'radial-gradient(ellipse 80% 60% at 70% 60%, rgba(212,160,84,0.06) 0%, transparent 70%)',
            'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(212,160,84,0.08) 0%, transparent 70%)',
            'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(212,160,84,0.08) 0%, transparent 70%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Secondary drift */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle 600px at 60% 50%, rgba(39,39,47,0.6) 0%, transparent 70%)',
            'radial-gradient(circle 600px at 40% 40%, rgba(39,39,47,0.4) 0%, transparent 70%)',
            'radial-gradient(circle 600px at 55% 60%, rgba(39,39,47,0.6) 0%, transparent 70%)',
            'radial-gradient(circle 600px at 60% 50%, rgba(39,39,47,0.6) 0%, transparent 70%)',
          ],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(9,9,11,0.7) 80%, rgba(9,9,11,1) 100%)',
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scroll indicator                                                          */
/* -------------------------------------------------------------------------- */

function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
    >
      <span className="font-mono text-mono-sm text-ivory-400 tracking-widest uppercase">
        Scroll
      </span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: glacialEase,
        }}
      >
        <ChevronDown className="h-5 w-5 text-ivory-400" />
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section wrapper with fade-up on scroll                                    */
/* -------------------------------------------------------------------------- */

function ScrollSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page component                                                            */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  const [featured, setFeatured] = useState<ArtworkCardArtwork[]>([]);
  const [community, setCommunity] = useState<ArtworkCardArtwork[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingCommunity, setLoadingCommunity] = useState(true);

  useEffect(() => {
    fetch('/api/artworks?filter=generative&limit=6')
      .then((res) => res.json())
      .then((data: ArtworksResponse) => {
        setFeatured(data.artworks ?? []);
      })
      .catch(() => setFeatured([]))
      .finally(() => setLoadingFeatured(false));

    fetch('/api/artworks?filter=community&limit=6&sort=newest')
      .then((res) => res.json())
      .then((data: ArtworksResponse) => {
        setCommunity(data.artworks ?? []);
      })
      .catch(() => setCommunity([]))
      .finally(() => setLoadingCommunity(false));
  }, []);

  return (
    <div className="-mt-16">
      {/* ---------------------------------------------------------------- */}
      {/*  Hero                                                            */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6">
        <HeroBackground />

        <motion.div
          className="relative z-10 flex flex-col items-center text-center"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={fadeUp}
            className="font-display text-display-xl tracking-[0.3em] text-ivory-50 uppercase"
          >
            Aether
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-4 font-body text-body-lg font-light text-ivory-200"
          >
            An AI Art Gallery
          </motion.p>

          {/* Animated amber separator */}
          <motion.div
            className="mt-8 h-px w-20 bg-amber"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{
              delay: 1,
              duration: 0.9,
              ease: glacialEase,
            }}
          />

          <motion.div variants={fadeUp} className="mt-8">
            <Link href="/collection">
              <Button
                variant="outline"
                size="lg"
                className="border-amber text-amber font-display italic hover:bg-amber hover:text-void-950 transition-colors duration-500 px-10 py-3 text-body-lg"
              >
                Enter Gallery
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <ScrollIndicator />
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*  Featured Exhibition — Horizontal Scroll Strip                   */}
      {/* ---------------------------------------------------------------- */}
      <ScrollSection className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div variants={fadeUp} className="mb-10">
            <h2 className="font-display text-display-md text-ivory-50">
              Now Showing
            </h2>
            <p className="mt-2 font-body text-body-md text-ivory-400">
              The permanent collection of algorithmically generated artworks
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            {loadingFeatured ? (
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-void-700 scrollbar-track-transparent">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-80 flex-shrink-0">
                    <ArtworkCardSkeleton />
                  </div>
                ))}
              </div>
            ) : featured.length > 0 ? (
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-void-700 scrollbar-track-transparent">
                {featured.map((artwork) => (
                  <div key={artwork.id} className="w-80 flex-shrink-0">
                    <ArtworkCard artwork={artwork} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-12 text-center font-body text-body-md text-ivory-400">
                No generative artworks found. Run the seed script to populate the gallery.
              </p>
            )}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex justify-end">
            <Link
              href="/collection?filter=generative"
              className="group inline-flex items-center gap-2 font-body text-body-sm text-amber hover:text-amber-light transition-colors duration-300"
            >
              View Full Collection
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </ScrollSection>

      <SectionDivider withDot className="mx-auto max-w-7xl px-6" />

      {/* ---------------------------------------------------------------- */}
      {/*  Community Highlights                                            */}
      {/* ---------------------------------------------------------------- */}
      <ScrollSection className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div variants={fadeUp} className="mb-10">
            <h2 className="font-display text-display-md text-ivory-50">
              From the Community
            </h2>
            <p className="mt-2 font-body text-body-md text-ivory-400">
              Recent submissions from artists around the world
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            {loadingCommunity ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ArtworkCardSkeleton key={i} />
                ))}
              </div>
            ) : community.length > 0 ? (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {community.map((artwork) => (
                  <motion.div key={artwork.id} variants={cardReveal}>
                    <ArtworkCard artwork={artwork} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="py-12 text-center font-body text-body-md text-ivory-400">
                No community artworks yet. Be the first to share your work.
              </p>
            )}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex justify-end">
            <Link
              href="/collection?filter=community"
              className="group inline-flex items-center gap-2 font-body text-body-sm text-amber hover:text-amber-light transition-colors duration-300"
            >
              View All
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </ScrollSection>

      <SectionDivider withDot className="mx-auto max-w-7xl px-6" />

      {/* ---------------------------------------------------------------- */}
      {/*  CTA — Share Your Art                                            */}
      {/* ---------------------------------------------------------------- */}
      <ScrollSection className="px-6 py-24">
        <motion.div
          variants={stagger}
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          <motion.div
            variants={fadeUp}
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-void-700 bg-void-900"
          >
            <Upload className="h-7 w-7 text-amber" />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="font-display text-display-md text-ivory-50"
          >
            Share Your Art
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-4 font-body text-body-md text-ivory-300 max-w-lg"
          >
            Created something beautiful with AI? Aether welcomes submissions from
            artists working with Midjourney, DALL-E, Stable Diffusion, and
            beyond. Your work deserves a gallery.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8">
            <Link href="/submit">
              <Button
                variant="outline"
                size="lg"
                className="border-amber text-amber hover:bg-amber hover:text-void-950 transition-colors duration-500 px-8"
              >
                Submit Your Work
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </ScrollSection>

      {/* Bottom spacing */}
      <div className="h-16" />
    </div>
  );
}
