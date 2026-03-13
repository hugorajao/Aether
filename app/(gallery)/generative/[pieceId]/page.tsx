'use client';

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Expand,
  Loader2,
  Pause,
  Play,
  Settings,
  Share2,
  Keyboard,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeUp, panelSlide } from '@/lib/motion';
import { useGalleryStore } from '@/stores/gallery';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import GenerativeCanvas from '@/components/generative/GenerativeCanvas';
import SeedControls from '@/components/generative/SeedControls';
import ParameterPanel from '@/components/generative/ParameterPanel';
import type { GenerativePiece } from '@/lib/generative/pieces/types';

const pieceModules: Record<string, () => Promise<{ default: GenerativePiece }>> = {
  'erosion-memory': () => import('@/lib/generative/pieces/erosion-memory'),
  'harmonic-lattice': () => import('@/lib/generative/pieces/harmonic-lattice'),
  'chromatic-drift': () => import('@/lib/generative/pieces/chromatic-drift'),
  'mycelial-network': () => import('@/lib/generative/pieces/mycelial-network'),
  'frequency-domain': () => import('@/lib/generative/pieces/frequency-domain'),
  'accretion': () => import('@/lib/generative/pieces/accretion'),
  'sine-cartography': () => import('@/lib/generative/pieces/sine-cartography'),
  'swarm-intelligence': () => import('@/lib/generative/pieces/swarm-intelligence'),
  'penrose-tiling': () => import('@/lib/generative/pieces/penrose-tiling'),
  'reaction-diffusion': () => import('@/lib/generative/pieces/reaction-diffusion'),
  'strange-attractor': () => import('@/lib/generative/pieces/strange-attractor'),
  'recursive-breath': () => import('@/lib/generative/pieces/recursive-breath'),
};

const SHORTCUTS = [
  { key: 'Space', description: 'Pause / Resume' },
  { key: 'R', description: 'Random seed' },
  { key: 'S', description: 'Save as PNG' },
  { key: 'F', description: 'Fullscreen' },
  { key: 'P', description: 'Toggle panel' },
  { key: '\u2190 / \u2192', description: 'Previous / Next seed' },
  { key: '?', description: 'Show shortcuts' },
];

export default function GenerativePiecePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pieceId = params.pieceId as string;

  const { toast } = useToast();
  const {
    activeSeed,
    activeParams,
    isPlaying,
    setActiveSeed,
    setActiveParams,
    togglePlaying,
  } = useGalleryStore();

  const [piece, setPiece] = useState<GenerativePiece | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Load piece module
  useEffect(() => {
    async function loadPiece() {
      setLoading(true);
      setError(null);

      const loader = pieceModules[pieceId];
      if (!loader) {
        setError(`Unknown piece: ${pieceId}`);
        setLoading(false);
        return;
      }

      try {
        const mod = await loader();
        const loadedPiece = mod.default;
        setPiece(loadedPiece);

        // Initialize seed from URL or piece default
        const urlSeed = searchParams.get('seed');
        if (urlSeed) {
          const parsed = parseInt(urlSeed, 10);
          if (!isNaN(parsed)) setActiveSeed(parsed);
        } else {
          setActiveSeed(loadedPiece.defaultSeed);
        }

        // Initialize params from URL or defaults
        const defaults = Object.fromEntries(
          loadedPiece.parameters.map((p) => [p.key, p.default])
        );
        const urlParams = searchParams.get('params');
        if (urlParams) {
          try {
            const parsed = JSON.parse(urlParams);
            setActiveParams({ ...defaults, ...parsed });
          } catch {
            setActiveParams(defaults);
          }
        } else {
          setActiveParams(defaults);
        }
      } catch {
        setError('Failed to load piece');
      } finally {
        setLoading(false);
      }
    }
    loadPiece();
    // Only run on mount / pieceId change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pieceId]);

  const handleParamChange = useCallback(
    (key: string, value: number) => {
      setActiveParams({ ...activeParams, [key]: value });
    },
    [activeParams, setActiveParams]
  );

  const handleReset = useCallback(() => {
    if (!piece) return;
    const defaults = Object.fromEntries(
      piece.parameters.map((p) => [p.key, p.default])
    );
    setActiveParams(defaults);
    setActiveSeed(piece.defaultSeed);
  }, [piece, setActiveParams, setActiveSeed]);

  const handleShare = useCallback(() => {
    if (!piece) return;
    const url = new URL(window.location.href);
    url.searchParams.set('seed', String(activeSeed));
    url.searchParams.set('params', JSON.stringify(activeParams));
    navigator.clipboard.writeText(url.toString()).then(() => {
      toast({ title: 'Link copied', description: 'Variation URL copied to clipboard.' });
    }).catch(() => {
      toast({ title: 'Copy failed', description: 'Could not copy link.' });
    });
  }, [piece, activeSeed, activeParams, toast]);

  const handleFullscreen = useCallback(() => {
    if (!canvasContainerRef.current) return;
    if (!document.fullscreenElement) {
      canvasContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture if user is in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlaying();
          break;
        case 'r':
        case 'R':
          setActiveSeed(Math.floor(Math.random() * 10000));
          break;
        case 's':
        case 'S':
          toast({ title: 'Save PNG', description: 'PNG download is not yet implemented.' });
          break;
        case 'f':
        case 'F':
          handleFullscreen();
          break;
        case 'p':
        case 'P':
          setPanelOpen((prev) => !prev);
          break;
        case 'ArrowLeft':
          setActiveSeed(activeSeed - 1);
          break;
        case 'ArrowRight':
          setActiveSeed(activeSeed + 1);
          break;
        case '?':
          setShortcutsOpen((prev) => !prev);
          break;
        case 'Escape':
          if (shortcutsOpen) setShortcutsOpen(false);
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSeed, togglePlaying, setActiveSeed, handleFullscreen, shortcutsOpen, toast]);

  // Listen for fullscreen exit
  useEffect(() => {
    function handleFSChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ivory-400" />
      </div>
    );
  }

  if (error || !piece) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="font-body text-body-md text-ivory-400">
          {error || 'Piece not found'}
        </p>
        <Link
          href="/generative"
          className="font-body text-body-sm text-amber hover:underline"
        >
          Back to Generative Playground
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Top bar */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between px-6 py-4 md:px-12"
      >
        <Link
          href="/generative"
          className={cn(
            'inline-flex items-center gap-2 font-body text-body-sm text-ivory-400',
            'transition-colors duration-300 hover:text-ivory-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-sm'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          All Pieces
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={togglePlaying}
            aria-label={isPlaying ? 'Pause animation' : 'Resume animation'}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleFullscreen}
            aria-label="Toggle fullscreen"
          >
            <Expand className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            aria-label="Share variation"
          >
            <Share2 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              toast({
                title: 'Save PNG',
                description: 'PNG download is not yet implemented.',
              })
            }
            aria-label="Download PNG"
          >
            <Download className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShortcutsOpen(true)}
            aria-label="Show keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setPanelOpen(true)}
            aria-label="Open settings panel"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Canvas */}
      <div
        ref={canvasContainerRef}
        className={cn(
          'mx-auto aspect-square max-w-[1400px] px-6 md:px-12',
          isFullscreen && 'fixed inset-0 z-50 max-w-none px-0 bg-void-950'
        )}
      >
        <GenerativeCanvas
          piece={piece}
          seed={activeSeed}
          params={activeParams}
          className="h-full w-full rounded-lg overflow-hidden"
          autoplay={isPlaying}
        />
      </div>

      {/* Piece title below canvas */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mx-auto mt-6 max-w-[1400px] px-6 md:px-12"
      >
        <h1 className="font-display text-heading-lg text-ivory-50">
          {piece.title}
        </h1>
        <p className="mt-1 font-mono text-mono-sm text-ivory-400">
          {piece.algorithm}
        </p>
      </motion.div>

      {/* Settings panel (Sheet) */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent
          side="right"
          className="w-[360px] max-w-[90vw] overflow-y-auto"
        >
          <div className="flex flex-col gap-8 pt-6">
            <div>
              <h2 className="font-display text-heading-md text-ivory-50">
                {piece.title}
              </h2>
              <p className="mt-3 font-body text-body-sm leading-relaxed text-ivory-300">
                {piece.artistStatement}
              </p>
            </div>

            <div className="h-px bg-void-700" aria-hidden="true" />

            <div>
              <h3 className="mb-4 font-body text-body-sm font-medium text-ivory-200">
                Seed
              </h3>
              <SeedControls
                seed={activeSeed}
                onSeedChange={setActiveSeed}
              />
            </div>

            <div className="h-px bg-void-700" aria-hidden="true" />

            <div>
              <h3 className="mb-4 font-body text-body-sm font-medium text-ivory-200">
                Parameters
              </h3>
              <ParameterPanel
                parameters={piece.parameters}
                values={activeParams}
                onChange={handleParamChange}
                onReset={handleReset}
              />
            </div>

            <div className="h-px bg-void-700" aria-hidden="true" />

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share Variation
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast({
                    title: 'Save PNG',
                    description: 'PNG download is not yet implemented.',
                  })
                }
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2"
              >
                Reset to Defaults
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Keyboard shortcuts overlay */}
      <AnimatePresence>
        {shortcutsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-void-950/80 backdrop-blur-sm"
            onClick={() => setShortcutsOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'relative rounded-lg border border-void-700 bg-void-900 p-8',
                'max-w-md w-full mx-6 shadow-2xl'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={cn(
                  'absolute right-4 top-4 rounded-sm text-ivory-400 hover:text-ivory-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber'
                )}
                onClick={() => setShortcutsOpen(false)}
                aria-label="Close shortcuts"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="mb-6 font-display text-heading-md text-ivory-50">
                Keyboard Shortcuts
              </h2>
              <dl className="space-y-3">
                {SHORTCUTS.map((s) => (
                  <div key={s.key} className="flex items-center justify-between">
                    <dt className="font-body text-body-sm text-ivory-300">
                      {s.description}
                    </dt>
                    <dd>
                      <kbd
                        className={cn(
                          'inline-flex min-w-[2rem] items-center justify-center rounded-md',
                          'border border-void-600 bg-void-800 px-2 py-1',
                          'font-mono text-mono-sm text-ivory-200'
                        )}
                      >
                        {s.key}
                      </kbd>
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spacing */}
      <div className="h-20" aria-hidden="true" />
    </div>
  );
}
