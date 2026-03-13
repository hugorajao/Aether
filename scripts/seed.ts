import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { nanoid } from 'nanoid';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const ROOT = path.resolve(__dirname, '..');
const DB_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DB_DIR, 'aether.db');
const PUBLIC = path.join(ROOT, 'public');
const COLLECTION_THUMBS = path.join(PUBLIC, 'collection', 'thumbnails');
const UPLOAD_ORIGINALS = path.join(PUBLIC, 'uploads', 'originals');
const UPLOAD_THUMBS = path.join(PUBLIC, 'uploads', 'thumbnails');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  Created directory: ${path.relative(ROOT, dir)}`);
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

async function generateGradientImage(
  outputPath: string,
  thumbnailPath: string,
  color1: string,
  color2: string,
  width = 800,
  height = 800,
  thumbnailWidth = 400,
): Promise<number> {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  const buffer = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      const t = (x + y) / (width + height);
      buffer[idx] = Math.round(r1 + (r2 - r1) * t);
      buffer[idx + 1] = Math.round(g1 + (g2 - g1) * t);
      buffer[idx + 2] = Math.round(b1 + (b2 - b1) * t);
    }
  }

  await sharp(buffer, { raw: { width, height, channels: 3 } })
    .png()
    .toFile(outputPath);

  await sharp(outputPath).resize(thumbnailWidth).toFile(thumbnailPath);

  return fs.statSync(outputPath).size;
}

const now = new Date().toISOString();

// ---------------------------------------------------------------------------
// Table creation SQL
// ---------------------------------------------------------------------------
const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS exhibitions (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  curator_note TEXT,
  cover_image_path TEXT,
  theme_color TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS artworks (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  artist_statement TEXT,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('generative', 'community')),
  medium TEXT,
  ai_tool TEXT,
  prompt TEXT,
  tags TEXT,
  image_path TEXT,
  thumbnail_path TEXT,
  width INTEGER,
  height INTEGER,
  dominant_color TEXT,
  color_palette TEXT,
  aspect_ratio REAL,
  file_size_bytes INTEGER,
  generative_config TEXT,
  exhibition_id TEXT REFERENCES exhibitions(id),
  exhibition_order INTEGER,
  featured INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS docent_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  artwork_id TEXT REFERENCES artworks(id),
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_artworks_slug ON artworks(slug);
CREATE INDEX IF NOT EXISTS idx_artworks_type ON artworks(type);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON artworks(created_at);
CREATE INDEX IF NOT EXISTS idx_artworks_exhibition_id ON artworks(exhibition_id);
`;

// ---------------------------------------------------------------------------
// Generative pieces data
// ---------------------------------------------------------------------------
interface PieceData {
  slug: string;
  title: string;
  dominantColor: string;
  palette: string[];
  tags: string[];
  artistStatement: string;
  description: string;
  generativeConfig: Record<string, unknown>;
}

const pieces: PieceData[] = [
  {
    slug: 'erosion-memory',
    title: 'Erosion Memory',
    dominantColor: '#0D3B4F',
    palette: ['#0A1628', '#0D3B4F', '#1A6B6B', '#4ECDC4', '#F7FFF7'],
    tags: ['flow field', 'particle system', 'erosion', 'generative'],
    artistStatement:
      'Ten thousand particles seek paths of least resistance. Where they converge, they erode. Where they diverge, silence remains. The piece is never finished \u2014 it is always in the process of becoming geography.',
    description:
      'A flow field particle system where thousands of particles trace paths through a Perlin noise field, gradually eroding the surface they traverse. Over time, channels form \u2014 river-like patterns emerge from pure mathematics. The erosion is cumulative: each frame deepens the paths most traveled, creating a feedback loop between flow and landscape.',
    generativeConfig: {
      particleCount: 10000,
      noiseScale: 0.003,
      erosionRate: 0.02,
      flowStrength: 2.0,
      fadeRate: 0.005,
      year: 2024,
      defaultSeed: 42,
    },
  },
  {
    slug: 'harmonic-lattice',
    title: 'Harmonic Lattice',
    dominantColor: '#FFFFFF',
    palette: ['#FFFFFF', '#E0E0E0', '#808080', '#404040', '#09090B'],
    tags: ['interference', 'wave', 'grid', 'mathematical'],
    artistStatement:
      'Simple harmonic motion, repeated forty thousand times, creates complexity no equation predicted. This is emergence made visible \u2014 the space between predictable and chaotic.',
    description:
      'A grid of 200\u00d7200 points, each oscillating vertically with simple harmonic motion. Multiple wave sources create interference patterns that shift and evolve. The visual effect resembles a vibrating membrane or the surface of disturbed water \u2014 pure mathematical interference rendered as light and shadow.',
    generativeConfig: {
      gridSize: 200,
      waveCount: 5,
      amplitude: 15,
      frequency: 0.05,
      damping: 0.98,
      year: 2024,
      defaultSeed: 42,
    },
  },
  {
    slug: 'chromatic-drift',
    title: 'Chromatic Drift',
    dominantColor: '#FF8800',
    palette: ['#FF0000', '#FF8800', '#FFFF00', '#00FF88', '#0088FF'],
    tags: ['voronoi', 'tessellation', 'color', 'drift'],
    artistStatement:
      'Every point in space belongs to its nearest neighbor. As neighbors drift, allegiances shift. The borders between territories glow with the energy of proximity \u2014 a political map of particle physics.',
    description:
      'An animated Voronoi tessellation where seed points drift slowly across the canvas. Each cell is colored by its seed\u2019s hue, and cell borders glow with interpolated color. As seeds move, cells expand, contract, and reshape \u2014 a continuously evolving stained glass window driven by simple proximity rules.',
    generativeConfig: {
      seedCount: 64,
      driftSpeed: 0.5,
      borderWidth: 2,
      colorMode: 'hue-cycle',
      relaxation: 0.1,
      year: 2024,
      defaultSeed: 42,
    },
  },
  {
    slug: 'mycelial-network',
    title: 'Mycelial Network',
    dominantColor: '#D4A054',
    palette: ['#1A1008', '#3D2B1F', '#D4A054', '#E8C078', '#FAFAF9'],
    tags: ['space colonization', 'branching', 'organic', 'network'],
    artistStatement:
      'The algorithm knows nothing of biology. It knows only: grow toward resources, branch when necessary, stop when satisfied. That it produces structures indistinguishable from living networks is the deepest compliment to the mathematics of life.',
    description:
      'A space colonization algorithm grows branching structures that resemble fungal mycelium. Attractor points scattered across the canvas guide growth \u2014 branches extend toward the nearest food source, splitting when multiple attractors compete. The result is an organic network that looks alive, built entirely from geometric rules.',
    generativeConfig: {
      attractorCount: 500,
      branchLength: 5,
      killDistance: 10,
      influenceDistance: 100,
      maxBranches: 5000,
      year: 2024,
      defaultSeed: 42,
    },
  },
  {
    slug: 'frequency-domain',
    title: 'Frequency Domain',
    dominantColor: '#8B5CF6',
    palette: ['#0A0A2A', '#1E3A5F', '#8B5CF6', '#EC4899', '#FFFFFF'],
    tags: ['FFT', 'frequency', 'radial', 'signal'],
    artistStatement:
      'Every complex signal is a chorus of simple ones. This piece decomposes the visible into the invisible \u2014 the frequencies that compose reality, rendered as light.',
    description:
      'A radial FFT visualization that decomposes procedurally generated signals into their constituent frequencies. Concentric rings represent frequency bands; amplitude maps to brightness and radius. The effect is a pulsing, breathing mandala of pure signal \u2014 the hidden structure beneath apparent complexity.',
    generativeConfig: {
      bands: 128,
      ringCount: 64,
      smoothing: 0.85,
      signalComplexity: 8,
      rotationSpeed: 0.001,
      year: 2024,
      defaultSeed: 42,
    },
  },
  {
    slug: 'accretion',
    title: 'Accretion',
    dominantColor: '#C4A04A',
    palette: ['#2A2A2A', '#4A4A4A', '#8A8A6A', '#C4A04A', '#E8C078'],
    tags: ['DLA', 'aggregation', 'fractal', 'growth'],
    artistStatement:
      'Growth without intention. Structure without blueprint. Each particle\u2019s random walk ends in permanence \u2014 the moment chaos commits to form.',
    description:
      'Diffusion-limited aggregation: particles perform random walks until they contact the growing structure, then stick permanently. The result is a fractal crystal that grows outward from a central seed \u2014 branching, dendritic, and eerily similar to snowflakes, lightning, and mineral deposits. Order from randomness.',
    generativeConfig: {
      particlesPerFrame: 50,
      stickProbability: 1.0,
      launchRadius: 200,
      maxParticles: 20000,
      colorByAge: true,
      year: 2024,
      defaultSeed: 42,
    },
  },
  {
    slug: 'sine-cartography',
    title: 'Sine Cartography',
    dominantColor: '#FAFAF9',
    palette: ['#FAFAF9', '#D4D4C8', '#A8A89C', '#27272F', '#09090B'],
    tags: ['topographic', 'contour', 'sine', 'landscape'],
    artistStatement:
      'Cartography of imaginary lands. These contours describe no real terrain, yet the eye insists on seeing mountains, valleys, ridgelines. We are pattern-recognition machines viewing our own projections.',
    description:
      'Layered sine waves create an elevation map of imaginary terrain. Contour lines are extracted at regular intervals, producing a topographic map of a place that doesn\u2019t exist. The lines shift slowly as the underlying waves evolve \u2014 tectonic motion in a mathematical landscape.',
    generativeConfig: {
      waveCount: 7,
      contourLevels: 20,
      lineWeight: 1.5,
      animationSpeed: 0.002,
      noiseOctaves: 4,
      year: 2024,
      defaultSeed: 42,
    },
  },
  {
    slug: 'swarm-intelligence',
    title: 'Swarm Intelligence',
    dominantColor: '#E8C078',
    palette: ['#FAFAF9', '#E8C078', '#D4A054', '#27272F', '#09090B'],
    tags: ['boids', 'flocking', 'swarm', 'emergence'],
    artistStatement:
      'No bird knows the shape of the flock. No fish knows the school\u2019s direction. Intelligence emerges from the space between individuals \u2014 a democracy of instinct.',
    description:
      'Craig Reynolds\u2019 boids algorithm: separation, alignment, and cohesion. Hundreds of autonomous agents follow three simple rules, and from those rules emerges the hypnotic, coordinated motion of a flock. No leader, no plan \u2014 just local interactions producing global beauty.',
    generativeConfig: {
      boidCount: 300,
      separationWeight: 1.5,
      alignmentWeight: 1.0,
      cohesionWeight: 1.0,
      maxSpeed: 4,
      perceptionRadius: 50,
      year: 2024,
      defaultSeed: 42,
    },
  },
  {
    slug: 'penrose-tiling',
    title: 'Penrose Tiling',
    dominantColor: '#1E3A5F',
    palette: ['#1E3A5F', '#166534', '#991B1B', '#D4A054', '#09090B'],
    tags: ['penrose', 'aperiodic', 'tiling', 'mathematics'],
    artistStatement:
      'A pattern that never repeats, yet fills all of space. Roger Penrose proved that order need not require periodicity \u2014 that infinity can be structured without repetition. This is the visual proof.',
    description:
      'Penrose P3 tiling generated through recursive subdivision of kite and dart shapes. The resulting pattern has five-fold rotational symmetry but never repeats \u2014 an aperiodic tiling that fills the plane with perfect, non-periodic order. Colors map to tile type and subdivision depth.',
    generativeConfig: {
      subdivisions: 7,
      tileType: 'P3',
      strokeWeight: 0.5,
      colorByDepth: true,
      rotationAngle: 0,
      year: 2024,
      defaultSeed: 42,
    },
  },
  {
    slug: 'reaction-diffusion',
    title: 'Reaction-Diffusion',
    dominantColor: '#8B2252',
    palette: ['#1A0A2E', '#4A1942', '#8B2252', '#FF69B4', '#FFFFFF'],
    tags: ['reaction-diffusion', 'Gray-Scott', 'Turing', 'biological'],
    artistStatement:
      'Alan Turing proposed that the spots on a leopard and the stripes on a zebrafish arise from the same mathematics. This simulation proves him right \u2014 two simple chemicals, interacting, produce the full vocabulary of biological pattern.',
    description:
      'A Gray-Scott reaction-diffusion simulation. Two virtual chemicals diffuse across a grid, reacting where they meet. Depending on feed and kill rates, the system produces spots, stripes, worms, and labyrinthine patterns \u2014 the same mathematics that governs biological morphogenesis, rendered in real time.',
    generativeConfig: {
      gridSize: 256,
      feedRate: 0.037,
      killRate: 0.06,
      diffusionA: 1.0,
      diffusionB: 0.5,
      iterations: 10,
      year: 2024,
      defaultSeed: 42,
    },
  },
  {
    slug: 'strange-attractor',
    title: 'Strange Attractor',
    dominantColor: '#6D28D9',
    palette: ['#1A0533', '#3B0764', '#6D28D9', '#06B6D4', '#ECFEFF'],
    tags: ['Lorenz', 'attractor', 'chaos', '3D'],
    artistStatement:
      'Deterministic chaos. Every point on this trajectory is exactly predictable, yet the shape it traces is indistinguishable from randomness. The butterfly effect is not a metaphor \u2014 it is this curve.',
    description:
      'The Lorenz attractor, projected from 3D to 2D with slow rotation. A single point traces the system\u2019s trajectory through phase space, leaving a glowing trail. The classic butterfly shape emerges \u2014 a strange attractor that never intersects itself, never repeats, yet is confined to a bounded region. Deterministic chaos made visible.',
    generativeConfig: {
      sigma: 10,
      rho: 28,
      beta: 8 / 3,
      dt: 0.005,
      trailLength: 5000,
      rotationSpeed: 0.003,
      year: 2024,
      defaultSeed: 42,
    },
  },
  {
    slug: 'recursive-breath',
    title: 'Recursive Breath',
    dominantColor: '#6B8E4E',
    palette: ['#2D1B0E', '#4A3728', '#6B8E4E', '#8FBC5A', '#C8FF00'],
    tags: ['recursive', 'tree', 'fractal', 'organic'],
    artistStatement:
      'A tree is a recursive data structure that evolution wrote. Each branch is a smaller tree. Each leaf is a terminal node. This algorithm grows a tree the way DNA does \u2014 with a simple rule, repeated, varied, and subjected to wind.',
    description:
      'An animated recursive tree that grows from a single trunk, branching at each level with slight random variation. Wind simulated via sine waves bends branches in coordinated motion \u2014 the tree breathes. Branch thickness, color, and angle are all functions of recursion depth, creating a naturalistic fractal form.',
    generativeConfig: {
      maxDepth: 12,
      branchAngle: 25,
      branchRatio: 0.67,
      windStrength: 0.02,
      windFrequency: 0.5,
      leafSize: 4,
      year: 2024,
      defaultSeed: 42,
    },
  },
];

// ---------------------------------------------------------------------------
// Exhibitions data
// ---------------------------------------------------------------------------
interface ExhibitionData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  curatorNote: string;
  themeColor: string;
  pieceSlugs: string[];
}

const exhibitionGenesis: ExhibitionData = {
  id: nanoid(),
  slug: 'genesis',
  title: 'Genesis',
  subtitle: 'The First Six',
  curatorNote:
    'The founding collection of Aether \u2014 six pieces that explore the fundamental forces of algorithmic creation. From the erosive patience of flowing particles to the crystalline certainty of diffusion-limited aggregation, these works map the territory between order and chaos where beauty resides.',
  themeColor: '#0D3B4F',
  pieceSlugs: [
    'erosion-memory',
    'harmonic-lattice',
    'chromatic-drift',
    'mycelial-network',
    'frequency-domain',
    'accretion',
  ],
};

const exhibitionSignal: ExhibitionData = {
  id: nanoid(),
  slug: 'signal-and-noise',
  title: 'Signal & Noise',
  subtitle: 'Mathematics Made Visible',
  curatorNote:
    'Four works united by their allegiance to mathematics. Harmonic interference, frequency decomposition, topographic sine fields, and deterministic chaos \u2014 these pieces translate abstract equations into visual experience. The signal is always there; you just need the right lens.',
  themeColor: '#8B5CF6',
  pieceSlugs: [
    'frequency-domain',
    'sine-cartography',
    'harmonic-lattice',
    'strange-attractor',
  ],
};

const exhibitionLiving: ExhibitionData = {
  id: nanoid(),
  slug: 'living-systems',
  title: 'Living Systems',
  subtitle: 'When Algorithms Breathe',
  curatorNote:
    'Algorithms that mimic life. Mycelial networks grow toward invisible resources, swarms flock without leaders, chemical reactions paint leopard spots, and recursive trees bend in digital wind. These pieces blur the boundary between simulation and biology.',
  themeColor: '#6B8E4E',
  pieceSlugs: [
    'mycelial-network',
    'swarm-intelligence',
    'reaction-diffusion',
    'recursive-breath',
  ],
};

const exhibitions = [exhibitionGenesis, exhibitionSignal, exhibitionLiving];

// ---------------------------------------------------------------------------
// Community submissions data
// ---------------------------------------------------------------------------
interface CommunitySubmission {
  title: string;
  artistName: string;
  artistStatement: string;
  aiTool: string;
  prompt: string;
  tags: string[];
  color1: string;
  color2: string;
}

const communitySubmissions: CommunitySubmission[] = [
  {
    title: 'Neon Meridian',
    artistName: 'Sable Cortez',
    artistStatement: 'I explore the liminal space between digital noise and human emotion, using AI as a collaborator rather than a tool.',
    aiTool: 'Midjourney v6',
    prompt: 'neon meridian lines crossing over dark water, bioluminescent, cinematic lighting, 8k --ar 1:1',
    tags: ['neon', 'abstract', 'water', 'bioluminescent'],
    color1: '#0A0A2A',
    color2: '#00FFCC',
  },
  {
    title: 'Cathedral of Static',
    artistName: 'Mara Chen',
    artistStatement: 'Static is not the absence of signal \u2014 it is all signals at once. My work finds the sacred in noise.',
    aiTool: 'Stable Diffusion XL',
    prompt: 'vast cathedral interior made of television static, volumetric light through stained glass noise, photorealistic',
    tags: ['architecture', 'static', 'sacred', 'noise'],
    color1: '#1A1A2E',
    color2: '#E0E0E0',
  },
  {
    title: 'Dissolved Portrait #7',
    artistName: 'Theo Vasquez',
    artistStatement: 'Identity is fluid. My dissolved portraits capture the moment a face becomes a landscape.',
    aiTool: 'DALL-E 3',
    prompt: 'portrait dissolving into watercolor landscape, face merging with mountains, double exposure, ethereal',
    tags: ['portrait', 'dissolution', 'watercolor', 'identity'],
    color1: '#4A1942',
    color2: '#F0C27F',
  },
  {
    title: 'Quantum Garden',
    artistName: 'Iris Nakamura',
    artistStatement: 'What would a garden look like if it existed in superposition? My work renders botanical impossibilities.',
    aiTool: 'Midjourney v6',
    prompt: 'impossible botanical garden where flowers exist in quantum superposition, glowing petals, dark background, scientific illustration style',
    tags: ['botanical', 'quantum', 'impossible', 'garden'],
    color1: '#0D1B0E',
    color2: '#FF69B4',
  },
  {
    title: 'Ferrofluid Dreams',
    artistName: 'Alek Petrov',
    artistStatement: 'The aesthetics of magnetic fields fascinate me. My art simulates materials that don\u2019t exist yet.',
    aiTool: 'Stable Diffusion XL',
    prompt: 'macro photography of iridescent ferrofluid forming impossible geometric patterns, studio lighting, hyperrealistic',
    tags: ['ferrofluid', 'macro', 'iridescent', 'material'],
    color1: '#0A0A0A',
    color2: '#8B5CF6',
  },
  {
    title: 'The Weight of Light',
    artistName: 'Lena Okafor',
    artistStatement: 'If photons had mass, how would they pool and flow? This series imagines light as a liquid.',
    aiTool: 'DALL-E 3',
    prompt: 'liquid light pooling in cupped hands, golden viscous photons, dark studio background, volumetric rendering',
    tags: ['light', 'liquid', 'gold', 'hands'],
    color1: '#1A1008',
    color2: '#D4A054',
  },
  {
    title: 'Synthetic Archaeology',
    artistName: 'Jay Morales',
    artistStatement: 'I create artifacts from civilizations that never existed, using AI to excavate imaginary histories.',
    aiTool: 'Midjourney v6',
    prompt: 'ancient artifact from unknown civilization, crystalline technology merged with carved stone, museum photograph, dramatic lighting',
    tags: ['archaeology', 'artifact', 'civilization', 'crystal'],
    color1: '#3D2B1F',
    color2: '#06B6D4',
  },
  {
    title: 'Emotional Topology',
    artistName: 'Priya Sharma',
    artistStatement: 'Emotions have shapes. Anxiety is a M\u00f6bius strip. Joy is a sphere. Grief is a Klein bottle. My work maps the topology of feeling.',
    aiTool: 'Stable Diffusion XL',
    prompt: 'abstract 3D topology representing human emotion, smooth manifold surface, iridescent material, mathematical visualization, dark background',
    tags: ['topology', 'emotion', 'abstract', '3D'],
    color1: '#1E3A5F',
    color2: '#EC4899',
  },
  {
    title: 'Pixel Elegy',
    artistName: 'Marcus Webb',
    artistStatement: 'Every digital image is a requiem for the analog world it replaced. My elegies celebrate what was lost in translation.',
    aiTool: 'DALL-E 3',
    prompt: 'landscape dissolving from photorealistic to pixel art, gradient of resolution, melancholic sunset, the death of analog',
    tags: ['pixel', 'analog', 'landscape', 'elegy'],
    color1: '#FF6B35',
    color2: '#09090B',
  },
  {
    title: 'Coral Algorithm',
    artistName: 'Yuki Tanaka',
    artistStatement: 'Coral reefs are nature\u2019s most complex algorithms. My work reimagines them in impossible colors.',
    aiTool: 'Midjourney v6',
    prompt: 'bioluminescent coral reef in impossible neon colors, underwater macro, fractal branching patterns, dark ocean background',
    tags: ['coral', 'bioluminescent', 'underwater', 'fractal'],
    color1: '#0A1628',
    color2: '#FF0080',
  },
  {
    title: 'Ghost in the Gradient',
    artistName: 'Sam Osei',
    artistStatement: 'Neural networks dream in gradients. This series captures the ghosts that live between training epochs.',
    aiTool: 'Stable Diffusion XL',
    prompt: 'ghostly figure emerging from color gradient, neural network visualization, spectral, liminal, high contrast',
    tags: ['neural', 'ghost', 'gradient', 'spectral'],
    color1: '#2A0A3A',
    color2: '#FAFAF9',
  },
  {
    title: 'Tectonic Lace',
    artistName: 'Elena Ruiz',
    artistStatement: 'Continental drift is the slowest choreography on Earth. I speed it up and render it in lace.',
    aiTool: 'DALL-E 3',
    prompt: 'tectonic plates rendered as delicate lacework, geological forces as textile art, macro photography, dramatic shadows',
    tags: ['tectonic', 'lace', 'geological', 'textile'],
    color1: '#27272F',
    color2: '#C4A04A',
  },
  {
    title: 'Void Bloom',
    artistName: 'Kai Johansson',
    artistStatement: 'Flowers that grow in absolute darkness. My void blooms are botanical studies of impossible life.',
    aiTool: 'Midjourney v6',
    prompt: 'flower blooming in complete darkness, petals made of faint starlight, ultra dark background, barely visible, ethereal beauty',
    tags: ['void', 'bloom', 'dark', 'botanical'],
    color1: '#09090B',
    color2: '#3B0764',
  },
  {
    title: 'Data Patina',
    artistName: 'Robin Achebe',
    artistStatement: 'Digital objects age too. My work applies the patina of time to things that were never meant to decay.',
    aiTool: 'Stable Diffusion XL',
    prompt: 'digital interface corroded with beautiful patina, aged technology, verdigris on pixels, wabi-sabi computing, detailed texture',
    tags: ['patina', 'decay', 'digital', 'wabi-sabi'],
    color1: '#2D4A3E',
    color2: '#8FBC5A',
  },
  {
    title: 'Prismatic Thought',
    artistName: 'Dani Kowalski',
    artistStatement: 'A thought, passed through a prism, refracts into its component emotions. This is what that looks like.',
    aiTool: 'DALL-E 3',
    prompt: 'abstract visualization of a thought being refracted through a glass prism into rainbow components, dark background, photorealistic glass, spectral light',
    tags: ['prism', 'thought', 'refraction', 'spectrum'],
    color1: '#1A1A2E',
    color2: '#FF4500',
  },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
async function seed() {
  console.log('\n\u2728 Aether Seed Script\n');

  // 1. Ensure directories
  console.log('1. Ensuring directories...');
  ensureDir(DB_DIR);
  ensureDir(COLLECTION_THUMBS);
  ensureDir(UPLOAD_ORIGINALS);
  ensureDir(UPLOAD_THUMBS);

  // 2. Open / create database
  console.log('2. Opening database...');
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  console.log(`   Database: ${path.relative(ROOT, DB_PATH)}`);

  // 3. Create tables
  console.log('3. Creating tables...');
  db.exec(CREATE_TABLES);
  console.log('   Tables created (if not existing).');

  // 4. Insert exhibitions
  console.log('4. Inserting exhibitions...');
  const insertExhibition = db.prepare(`
    INSERT OR REPLACE INTO exhibitions (id, slug, title, subtitle, curator_note, cover_image_path, theme_color, created_at, updated_at)
    VALUES (@id, @slug, @title, @subtitle, @curatorNote, @coverImagePath, @themeColor, @createdAt, @updatedAt)
  `);

  // We need stable IDs for exhibitions so re-runs produce the same IDs.
  // Use slug-based deterministic IDs.
  const exhibitionIds: Record<string, string> = {};
  for (const ex of exhibitions) {
    const stableId = `exh_${ex.slug}`;
    exhibitionIds[ex.slug] = stableId;
    insertExhibition.run({
      id: stableId,
      slug: ex.slug,
      title: ex.title,
      subtitle: ex.subtitle,
      curatorNote: ex.curatorNote,
      coverImagePath: null,
      themeColor: ex.themeColor,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`   \u2713 ${ex.title}`);
  }

  // Build a lookup: piece slug -> (exhibitionId, order) for the FIRST exhibition it appears in
  const pieceExhibitionMap: Record<string, { exhibitionId: string; order: number }> = {};
  for (const ex of exhibitions) {
    ex.pieceSlugs.forEach((slug, idx) => {
      if (!pieceExhibitionMap[slug]) {
        pieceExhibitionMap[slug] = {
          exhibitionId: exhibitionIds[ex.slug],
          order: idx + 1,
        };
      }
    });
  }

  // 5. Generate thumbnails for generative pieces & insert artworks
  console.log('5. Generating generative piece thumbnails & inserting artworks...');
  const insertArtwork = db.prepare(`
    INSERT OR REPLACE INTO artworks (
      id, slug, title, artist_name, artist_statement, description, type, medium,
      ai_tool, prompt, tags, image_path, thumbnail_path, width, height,
      dominant_color, color_palette, aspect_ratio, file_size_bytes,
      generative_config, exhibition_id, exhibition_order, featured, created_at, updated_at
    ) VALUES (
      @id, @slug, @title, @artistName, @artistStatement, @description, @type, @medium,
      @aiTool, @prompt, @tags, @imagePath, @thumbnailPath, @width, @height,
      @dominantColor, @colorPalette, @aspectRatio, @fileSizeBytes,
      @generativeConfig, @exhibitionId, @exhibitionOrder, @featured, @createdAt, @updatedAt
    )
  `);

  for (const piece of pieces) {
    const thumbFilename = `${piece.slug}.png`;
    const thumbPath = path.join(COLLECTION_THUMBS, thumbFilename);
    const tempOriginal = path.join(COLLECTION_THUMBS, `${piece.slug}-full.png`);

    const fileSize = await generateGradientImage(
      tempOriginal,
      thumbPath,
      piece.palette[0],
      piece.palette[piece.palette.length - 1],
    );

    // Remove the full-size temp; we only need the thumbnail for generative pieces
    fs.unlinkSync(tempOriginal);

    const exInfo = pieceExhibitionMap[piece.slug];
    const stableId = `gen_${piece.slug}`;

    insertArtwork.run({
      id: stableId,
      slug: piece.slug,
      title: piece.title,
      artistName: 'Aether Algorithm',
      artistStatement: piece.artistStatement,
      description: piece.description,
      type: 'generative',
      medium: 'Algorithmic / p5.js',
      aiTool: null,
      prompt: null,
      tags: JSON.stringify(piece.tags),
      imagePath: null,
      thumbnailPath: `/collection/thumbnails/${thumbFilename}`,
      width: 800,
      height: 800,
      dominantColor: piece.dominantColor,
      colorPalette: JSON.stringify(piece.palette),
      aspectRatio: 1.0,
      fileSizeBytes: fileSize,
      generativeConfig: JSON.stringify(piece.generativeConfig),
      exhibitionId: exInfo?.exhibitionId ?? null,
      exhibitionOrder: exInfo?.order ?? null,
      featured: piece.slug === 'erosion-memory' || piece.slug === 'strange-attractor' ? 1 : 0,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`   \u2713 ${piece.title} (thumbnail generated)`);
  }

  // 6. Generate community submissions
  console.log('6. Generating community submissions...');
  for (let i = 0; i < communitySubmissions.length; i++) {
    const sub = communitySubmissions[i];
    const slug = sub.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const stableId = `com_${slug}`;
    const filename = `${slug}.png`;
    const originalPath = path.join(UPLOAD_ORIGINALS, filename);
    const thumbPath = path.join(UPLOAD_THUMBS, filename);

    const fileSize = await generateGradientImage(
      originalPath,
      thumbPath,
      sub.color1,
      sub.color2,
    );

    // Offset created_at so submissions have different dates
    const createdDate = new Date(Date.now() - (communitySubmissions.length - i) * 86400000);

    insertArtwork.run({
      id: stableId,
      slug,
      title: sub.title,
      artistName: sub.artistName,
      artistStatement: sub.artistStatement,
      description: null,
      type: 'community',
      medium: 'AI-generated image',
      aiTool: sub.aiTool,
      prompt: sub.prompt,
      tags: JSON.stringify(sub.tags),
      imagePath: `/uploads/originals/${filename}`,
      thumbnailPath: `/uploads/thumbnails/${filename}`,
      width: 800,
      height: 800,
      dominantColor: sub.color1,
      colorPalette: JSON.stringify([sub.color1, sub.color2]),
      aspectRatio: 1.0,
      fileSizeBytes: fileSize,
      generativeConfig: null,
      exhibitionId: null,
      exhibitionOrder: null,
      featured: i < 3 ? 1 : 0,
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
    });
    console.log(`   \u2713 ${sub.title} by ${sub.artistName}`);
  }

  // 7. Summary
  const artworkCount = db.prepare('SELECT COUNT(*) as count FROM artworks').get() as { count: number };
  const exhibitionCount = db.prepare('SELECT COUNT(*) as count FROM exhibitions').get() as { count: number };
  const generativeCount = db.prepare("SELECT COUNT(*) as count FROM artworks WHERE type = 'generative'").get() as { count: number };
  const communityCount = db.prepare("SELECT COUNT(*) as count FROM artworks WHERE type = 'community'").get() as { count: number };

  db.close();

  console.log('\n--- Seed Complete ---');
  console.log(`   Exhibitions: ${exhibitionCount.count}`);
  console.log(`   Artworks:    ${artworkCount.count} (${generativeCount.count} generative, ${communityCount.count} community)`);
  console.log(`   Database:    ${path.relative(ROOT, DB_PATH)}`);
  console.log('');
}

seed().catch((err) => {
  console.error('\nSeed failed:', err);
  process.exit(1);
});
