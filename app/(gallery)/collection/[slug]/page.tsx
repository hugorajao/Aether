'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, MessageCircle, ChevronDown } from 'lucide-react';
import { fadeUp, stagger } from '@/lib/motion';
import { formatDate, formatFileSize } from '@/lib/utils';
import { useGalleryStore } from '@/stores/gallery';
import GenerativeCanvas from '@/components/generative/GenerativeCanvas';
import AmbientGlow from '@/components/shared/AmbientGlow';
import ImmersiveViewer from '@/components/gallery/ImmersiveViewer';
import SeedControls from '@/components/generative/SeedControls';
import ParameterPanel from '@/components/generative/ParameterPanel';
import type { GenerativePiece } from '@/lib/generative/pieces/types';

interface ArtworkData {
  id: string;
  slug: string;
  title: string;
  artistName: string;
  artistStatement: string | null;
  description: string | null;
  type: 'generative' | 'community';
  medium: string | null;
  aiTool: string | null;
  prompt: string | null;
  tags: string | null;
  imagePath: string | null;
  thumbnailPath: string | null;
  width: number | null;
  height: number | null;
  dominantColor: string | null;
  colorPalette: string | null;
  fileSizeBytes: number | null;
  generativeConfig: string | null;
  createdAt: string;
}

export default function SingleArtworkPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [artwork, setArtwork] = useState<ArtworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [piece, setPiece] = useState<GenerativePiece | null>(null);
  const [immersiveOpen, setImmersiveOpen] = useState(false);
  const [docentExpanded, setDocentExpanded] = useState(false);

  const activeSeed = useGalleryStore((s) => s.activeSeed);
  const activeParams = useGalleryStore((s) => s.activeParams);
  const setActiveSeed = useGalleryStore((s) => s.setActiveSeed);
  const setActiveParams = useGalleryStore((s) => s.setActiveParams);
  const setDocentArtworkContext = useGalleryStore((s) => s.setDocentArtworkContext);
  const toggleDocent = useGalleryStore((s) => s.toggleDocent);

  useEffect(() => {
    fetch(`/api/artworks/${slug}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (data.artwork) {
          setArtwork(data.artwork);

          // Set docent context
          setDocentArtworkContext({
            title: data.artwork.title,
            artistName: data.artwork.artistName,
            medium: data.artwork.medium || undefined,
            artistStatement: data.artwork.artistStatement || undefined,
            description: data.artwork.description || undefined,
            tags: data.artwork.tags || undefined,
          });

          // Load generative piece if applicable
          if (data.artwork.type === 'generative' && data.artwork.generativeConfig) {
            try {
              const config = JSON.parse(data.artwork.generativeConfig);
              const pieceId = config.pieceId || data.artwork.slug;
              const mod = await import(`@/lib/generative/pieces/${pieceId}`);
              setPiece(mod.default);

              // Set default params
              const defaultParams: Record<string, number> = {};
              mod.default.parameters.forEach((p: { key: string; default: number }) => {
                defaultParams[p.key] = p.default;
              });
              setActiveParams(defaultParams);
              setActiveSeed(mod.default.defaultSeed);
            } catch {
              // Piece not found
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => {
      setDocentArtworkContext(null);
    };
  }, [slug, setDocentArtworkContext, setActiveParams, setActiveSeed]);

  // Keyboard shortcut for immersive mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          setImmersiveOpen((v) => !v);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-void-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-void-700 border-t-amber rounded-full animate-spin" />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-void-950 flex items-center justify-center">
        <p className="text-ivory-400">Artwork not found</p>
      </div>
    );
  }

  const tags = artwork.tags ? JSON.parse(artwork.tags) as string[] : [];

  return (
    <div className="min-h-screen bg-void-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-5 gap-12"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Artwork Column - 60% */}
          <motion.div variants={fadeUp} className="lg:col-span-3 relative">
            {artwork.dominantColor && (
              <AmbientGlow color={artwork.dominantColor} intensity="medium" className="absolute -inset-8 -z-10" />
            )}

            <div className="relative aspect-square lg:aspect-[4/3] bg-void-900 rounded-lg overflow-hidden">
              {artwork.type === 'generative' && piece ? (
                <GenerativeCanvas
                  piece={piece}
                  seed={activeSeed}
                  params={activeParams}
                  className="w-full h-full"
                />
              ) : artwork.imagePath ? (
                <Image
                  src={artwork.imagePath}
                  alt={artwork.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background: `radial-gradient(circle, ${artwork.dominantColor || '#27272F'}40, #09090B)`,
                  }}
                />
              )}
            </div>

            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => setImmersiveOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-void-700 rounded text-ivory-300 hover:border-amber hover:text-amber transition-colors text-body-sm"
                aria-keyshortcuts="f"
              >
                <Maximize2 className="w-4 h-4" />
                View Immersive
              </button>
            </div>

            {/* Seed/Parameter controls for generative */}
            {artwork.type === 'generative' && piece && (
              <div className="mt-6 space-y-4">
                <SeedControls
                  seed={activeSeed}
                  onSeedChange={setActiveSeed}
                />
                <ParameterPanel
                  parameters={piece.parameters}
                  values={activeParams}
                  onChange={(key, value) =>
                    setActiveParams({ ...activeParams, [key]: value })
                  }
                  onReset={() => {
                    const defaults: Record<string, number> = {};
                    piece.parameters.forEach((p) => {
                      defaults[p.key] = p.default;
                    });
                    setActiveParams(defaults);
                  }}
                />
              </div>
            )}
          </motion.div>

          {/* Details Column - 40% */}
          <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="font-display text-display-md text-ivory-50">
                {artwork.title}
              </h1>
              <p className="font-body text-heading-md text-ivory-200 mt-2">
                {artwork.artistName}
              </p>
              {artwork.medium && (
                <p className="font-mono text-mono-sm text-amber mt-2">
                  {artwork.medium}
                </p>
              )}
            </div>

            <div className="h-px bg-void-700" />

            {artwork.artistStatement && (
              <div>
                <p className="text-body-md text-ivory-200">
                  <span className="font-display italic">
                    {artwork.artistStatement.split('.')[0]}.
                  </span>{' '}
                  {artwork.artistStatement.split('.').slice(1).join('.')}
                </p>
              </div>
            )}

            {artwork.description && (
              <div>
                <h3 className="font-body text-heading-md text-ivory-100 mb-2">
                  {artwork.type === 'generative' ? 'Algorithm' : 'Description'}
                </h3>
                <p className="text-body-sm text-ivory-300">
                  {artwork.description}
                </p>
              </div>
            )}

            {artwork.type === 'community' && artwork.prompt && (
              <div>
                <h3 className="font-body text-heading-md text-ivory-100 mb-2">
                  Prompt
                </h3>
                <pre className="font-mono text-mono-sm text-ivory-300 bg-void-900 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {artwork.prompt}
                </pre>
              </div>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-caption bg-void-800 text-ivory-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="h-px bg-void-700" />

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-caption">
              {artwork.width && artwork.height && (
                <div>
                  <span className="text-ivory-400">Dimensions</span>
                  <p className="font-mono text-mono-sm text-ivory-200">
                    {artwork.width} × {artwork.height}
                  </p>
                </div>
              )}
              {artwork.fileSizeBytes && (
                <div>
                  <span className="text-ivory-400">File Size</span>
                  <p className="font-mono text-mono-sm text-ivory-200">
                    {formatFileSize(artwork.fileSizeBytes)}
                  </p>
                </div>
              )}
              <div>
                <span className="text-ivory-400">Added</span>
                <p className="font-mono text-mono-sm text-ivory-200">
                  {formatDate(artwork.createdAt)}
                </p>
              </div>
              {artwork.type === 'generative' && (
                <div>
                  <span className="text-ivory-400">Seed</span>
                  <p className="font-mono text-mono-sm text-amber">
                    {activeSeed}
                  </p>
                </div>
              )}
            </div>

            <div className="h-px bg-void-700" />

            {/* Ask the Docent */}
            <div>
              <button
                onClick={() => {
                  setDocentExpanded(!docentExpanded);
                  if (!docentExpanded) toggleDocent();
                }}
                className="flex items-center gap-3 w-full py-3 text-left group"
              >
                <MessageCircle className="w-5 h-5 text-amber" />
                <span className="font-display italic text-heading-md text-ivory-100 group-hover:text-amber transition-colors">
                  Ask the Docent
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-ivory-400 ml-auto transition-transform ${
                    docentExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {docentExpanded && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-body-sm text-ivory-400 overflow-hidden"
                  >
                    The Docent is ready to discuss this piece. Click the &quot;Ask Docent&quot;
                    button in the header to start a conversation.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Immersive Viewer */}
      <ImmersiveViewer
        artwork={{
          title: artwork.title,
          dominantColor: artwork.dominantColor,
          imagePath: artwork.imagePath,
          type: artwork.type,
        }}
        isOpen={immersiveOpen}
        onClose={() => setImmersiveOpen(false)}
      />
    </div>
  );
}
