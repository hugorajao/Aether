'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeUp, stagger } from '@/lib/motion';
import { useGalleryStore } from '@/stores/gallery';
import FilterToolbar from '@/components/gallery/FilterToolbar';
import ArtworkGrid from '@/components/gallery/ArtworkGrid';
import EmptyState from '@/components/shared/EmptyState';
import { ArtworkGridSkeleton } from '@/components/shared/LoadingSkeleton';
import type { ArtworkCardArtwork } from '@/components/gallery/ArtworkCard';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface ArtworksResponse {
  artworks: ArtworkCardArtwork[];
  nextCursor: string | null;
  total: number;
}

/* -------------------------------------------------------------------------- */
/*  Collection Page                                                           */
/* -------------------------------------------------------------------------- */

export default function CollectionPage() {
  const searchParams = useSearchParams();

  // Store state
  const filter = useGalleryStore((s) => s.filter);
  const sortBy = useGalleryStore((s) => s.sortBy);
  const searchQuery = useGalleryStore((s) => s.searchQuery);
  const setFilter = useGalleryStore((s) => s.setFilter);
  const setSortBy = useGalleryStore((s) => s.setSortBy);
  const setSearchQuery = useGalleryStore((s) => s.setSearchQuery);

  // Local state
  const [artworks, setArtworks] = useState<ArtworkCardArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Sentinel ref for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Initialize filter from URL query params
  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter === 'generative' || urlFilter === 'community') {
      setFilter(urlFilter);
    }
  }, [searchParams, setFilter]);

  // Fetch artworks
  const fetchArtworks = useCallback(
    async (append = false, cursorParam: string | null = null) => {
      // Cancel any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const params = new URLSearchParams();
        if (filter !== 'all') params.set('filter', filter);
        if (sortBy !== 'newest') params.set('sort', sortBy);
        if (searchQuery) params.set('search', searchQuery);
        if (cursorParam) params.set('cursor', cursorParam);
        params.set('limit', '24');

        const res = await fetch(`/api/artworks?${params.toString()}`, {
          signal: controller.signal,
        });
        const data: ArtworksResponse = await res.json();

        if (append) {
          setArtworks((prev) => [...prev, ...(data.artworks ?? [])]);
        } else {
          setArtworks(data.artworks ?? []);
        }

        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
        setTotal(data.total);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Failed to fetch artworks:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filter, sortBy, searchQuery]
  );

  // Fetch on filter/sort/search changes
  useEffect(() => {
    fetchArtworks(false, null);
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchArtworks]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchArtworks(true, cursor);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, cursor, fetchArtworks]);

  // Debounced search
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleSearchChange = useCallback(
    (q: string) => {
      setSearchQuery(q);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      // The fetchArtworks effect will trigger automatically via dependency
    },
    [setSearchQuery]
  );

  return (
    <div className="min-h-screen">
      {/* Sticky filter toolbar */}
      <FilterToolbar
        filter={filter}
        onFilterChange={(f) => setFilter(f as 'all' | 'generative' | 'community')}
        sortBy={sortBy}
        onSortChange={(s) => setSortBy(s as 'newest' | 'oldest' | 'title')}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Page header */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl px-6 pt-10 pb-2"
      >
        <motion.h1
          variants={fadeUp}
          className="font-display text-display-md text-ivory-50"
        >
          Collection
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-2 font-body text-body-md text-ivory-400"
        >
          {loading ? (
            <span className="inline-block h-5 w-24 animate-pulse rounded bg-void-800" />
          ) : (
            `${total} artwork${total !== 1 ? 's' : ''}`
          )}
        </motion.p>
      </motion.div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <ArtworkGridSkeleton count={12} />
        ) : artworks.length === 0 ? (
          <EmptyState
            icon={<ImageOff />}
            title="No artworks found"
            description={
              searchQuery
                ? `No results for "${searchQuery}". Try a different search term.`
                : 'No artworks match the current filters.'
            }
            action={
              filter !== 'all' || searchQuery
                ? {
                    label: 'Clear Filters',
                    href: '/collection',
                  }
                : undefined
            }
          />
        ) : (
          <>
            <ArtworkGrid artworks={artworks} />

            {/* Loading more indicator */}
            {loadingMore && (
              <div className="mt-8 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-void-700 border-t-amber" />
              </div>
            )}
          </>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-px" aria-hidden="true" />
      </div>
    </div>
  );
}
