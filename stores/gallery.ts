import { create } from 'zustand';

interface ArtworkContext {
  title: string;
  artistName: string;
  medium?: string;
  artistStatement?: string;
  description?: string;
  tags?: string;
}

interface GalleryStore {
  // Navigation
  currentView: 'grid' | 'artwork' | 'exhibition' | 'generative';
  setCurrentView: (view: GalleryStore['currentView']) => void;

  // Filters
  filter: 'all' | 'generative' | 'community';
  sortBy: 'newest' | 'oldest' | 'title';
  searchQuery: string;
  activeTag: string | null;
  setFilter: (f: GalleryStore['filter']) => void;
  setSortBy: (s: GalleryStore['sortBy']) => void;
  setSearchQuery: (q: string) => void;
  setActiveTag: (t: string | null) => void;

  // Generative piece state
  activeSeed: number;
  activeParams: Record<string, number>;
  isPlaying: boolean;
  setActiveSeed: (seed: number) => void;
  setActiveParams: (params: Record<string, number>) => void;
  togglePlaying: () => void;

  // Docent
  docentOpen: boolean;
  docentMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  docentArtworkContext: ArtworkContext | null;
  toggleDocent: () => void;
  setDocentOpen: (open: boolean) => void;
  addDocentMessage: (msg: { role: 'user' | 'assistant'; content: string }) => void;
  clearDocentMessages: () => void;
  setDocentArtworkContext: (ctx: ArtworkContext | null) => void;

  // Immersive mode
  immersiveOpen: boolean;
  immersiveArtworkId: string | null;
  openImmersive: (id: string) => void;
  closeImmersive: () => void;
}

export const useGalleryStore = create<GalleryStore>((set) => ({
  // Navigation
  currentView: 'grid',
  setCurrentView: (view) => set({ currentView: view }),

  // Filters
  filter: 'all',
  sortBy: 'newest',
  searchQuery: '',
  activeTag: null,
  setFilter: (filter) => set({ filter }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveTag: (activeTag) => set({ activeTag }),

  // Generative
  activeSeed: 42,
  activeParams: {},
  isPlaying: true,
  setActiveSeed: (activeSeed) => set({ activeSeed }),
  setActiveParams: (activeParams) => set({ activeParams }),
  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),

  // Docent
  docentOpen: false,
  docentMessages: [],
  docentArtworkContext: null,
  toggleDocent: () => set((state) => ({ docentOpen: !state.docentOpen })),
  setDocentOpen: (docentOpen) => set({ docentOpen }),
  addDocentMessage: (msg) =>
    set((state) => ({ docentMessages: [...state.docentMessages, msg] })),
  clearDocentMessages: () => set({ docentMessages: [] }),
  setDocentArtworkContext: (docentArtworkContext) => set({ docentArtworkContext }),

  // Immersive
  immersiveOpen: false,
  immersiveArtworkId: null,
  openImmersive: (id) => set({ immersiveOpen: true, immersiveArtworkId: id }),
  closeImmersive: () => set({ immersiveOpen: false, immersiveArtworkId: null }),
}));

export type { ArtworkContext };
