export const SITE_NAME = 'Aether';
export const SITE_DESCRIPTION = 'An AI Art Gallery — housing algorithmically generated masterworks and community-submitted AI art';
export const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const MAX_UPLOAD_SIZE = (Number(process.env.MAX_UPLOAD_SIZE_MB) || 20) * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

export const AI_TOOLS = [
  'Midjourney',
  'DALL-E 3',
  'Stable Diffusion',
  'Flux',
  'Firefly',
  'Leonardo AI',
  'Claude (Artifacts)',
  'Other',
] as const;

export const ITEMS_PER_PAGE = 24;
export const MAX_ITEMS_PER_PAGE = 100;

export const RECOMMENDED_SEEDS: Record<string, number[]> = {
  'erosion-memory': [42, 137, 256, 1024, 7777],
  'harmonic-lattice': [88, 200, 444, 808, 1234],
  'chromatic-drift': [13, 99, 333, 777, 2048],
  'mycelial-network': [7, 64, 256, 512, 9999],
  'frequency-domain': [55, 123, 440, 880, 3333],
  'accretion': [1, 42, 100, 500, 8080],
  'sine-cartography': [21, 144, 377, 610, 987],
  'swarm-intelligence': [33, 150, 500, 1000, 5000],
  'penrose-tiling': [5, 72, 360, 720, 1440],
  'reaction-diffusion': [10, 50, 200, 600, 4000],
  'strange-attractor': [28, 100, 314, 628, 1618],
  'recursive-breath': [12, 60, 180, 365, 2024],
};
