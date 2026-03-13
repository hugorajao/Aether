# AETHER — AI Art Gallery & Generative Exhibition Platform

## Claude Code Implementation Prompt

> **Runtime target:** Claude Code, single autonomous session
> **Delivery:** Production-grade Next.js 14 application, fully functional, ready for `npm run dev`
> **Ambition level:** Museum-quality digital art platform with real-time generative art, community uploads, curation AI, and immersive viewing experiences

-----

## 0. PREAMBLE — READ THIS FIRST

You are building **Aether**, a full-stack AI art gallery web application. This is not a template or a demo. This is an immersive, production-grade digital art museum that:

1. **Houses a permanent collection** of 12+ algorithmically generated art pieces created at build time using p5.js and canvas APIs — each with its own artist statement, generative parameters, and seed-based variation system
1. **Accepts community submissions** — users can upload AI-generated artwork (images from Midjourney, DALL-E, Stable Diffusion, etc.) with metadata, provenance tagging, and artist statements
1. **Provides museum-grade viewing experiences** — full-screen immersive mode, zoom, ambient lighting that adapts to the artwork’s palette, and curated exhibition pathways
1. **Features an AI docent** powered by the Anthropic API that can discuss any piece in the collection, explain generative techniques, and guide visitors through exhibitions
1. **Runs entirely client-side for generative pieces** — the p5.js artworks render live in the browser with interactive parameter controls

Read this entire prompt before writing any code. Resolve every ambiguity here — do not improvise architectural decisions.

-----

## 1. TECH STACK — NON-NEGOTIABLE

|Layer           |Technology                                |Version                 |Notes                                                                                                                                                       |
|----------------|------------------------------------------|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Framework       |Next.js (App Router)                      |14.x                    |`app/` directory, RSC where beneficial                                                                                                                      |
|Language        |TypeScript                                |5.x                     |Strict mode, no `any` except escape hatches                                                                                                                 |
|Styling         |Tailwind CSS                              |3.4.x                   |Custom design tokens via `tailwind.config.ts`                                                                                                               |
|Components      |shadcn/ui                                 |Latest                  |Cherry-pick: Dialog, Sheet, Tabs, Tooltip, ScrollArea, Skeleton, DropdownMenu, Badge, Card, Button, Input, Textarea, Label, Separator, Switch, Slider, Toast|
|Animation       |Framer Motion                             |11.x                    |Orchestrated sequences, layout animations, scroll-triggered reveals                                                                                         |
|Generative Art  |p5.js                                     |1.9.x                   |Instance mode only (`new p5(sketch, container)`), never global mode                                                                                         |
|State           |Zustand                                   |4.x                     |Single store with slices pattern                                                                                                                            |
|Database        |SQLite via better-sqlite3                 |—                       |File-based, zero config, `/data/aether.db`                                                                                                                  |
|ORM             |Drizzle ORM                               |Latest                  |Type-safe schema, migrations                                                                                                                                |
|File Storage    |Local filesystem                          |—                       |`/public/uploads/` for user art, `/public/collection/` for permanent pieces                                                                                 |
|AI Docent       |Anthropic API                             |claude-sonnet-4-20250514|Server-side route handler, streaming responses                                                                                                              |
|Image Processing|sharp                                     |Latest                  |Thumbnail generation, dominant color extraction, EXIF stripping                                                                                             |
|Icons           |Lucide React                              |Latest                  |Consistent iconography                                                                                                                                      |
|Fonts           |Google Fonts (self-hosted via `next/font`)|—                       |See Design System §3                                                                                                                                        |

### What NOT to use

- No Prisma (use Drizzle — lighter, faster for SQLite)
- No NextAuth (no user accounts in v1 — anonymous submissions with optional artist name)
- No external image hosting (everything local)
- No Redux, no React Query (Zustand + SWR-style fetch pattern)
- No Firebase, Supabase, or any cloud dependency
- No Docker (runs with `npm run dev` or `npm run build && npm start`)

-----

## 2. DESIGN SYSTEM — “VOID CANVAS”

The aesthetic is **“contemporary art museum meets deep space observatory.”** Think: MoMA’s website redesigned by someone who builds planetariums. Dark, vast, reverent — the art is the light source.

### 2.1 Philosophy

Every pixel of chrome exists to serve the artwork. The UI is the frame, the walls, the lighting — never the subject. Transitions are glacial and deliberate, like walking between rooms in a gallery. White space is not empty — it is the silence between movements.

### 2.2 Color Palette

```typescript
// tailwind.config.ts — extend theme.colors
const colors = {
  // Surfaces — the gallery walls
  void: {
    950: '#09090B',  // Deepest background — the void
    900: '#0C0C10',  // Primary surface
    850: '#111116',  // Elevated surface (cards, panels)
    800: '#18181D',  // Hover states on surfaces
    700: '#27272F',  // Borders, subtle dividers
    600: '#3F3F49',  // Muted text, disabled states
  },

  // Ivory — text and light accents
  ivory: {
    50:  '#FAFAF9',  // Primary text
    100: '#F5F5F0',  // Secondary text
    200: '#E8E8E0',  // Tertiary text
    300: '#D4D4C8',  // Placeholder text
    400: '#A8A89C',  // Caption text
  },

  // Accent — a single, restrained accent color
  // Warm amber — like gallery spotlight tungsten
  amber: {
    DEFAULT: '#D4A054',
    light:   '#E8C078',
    muted:   '#D4A05440', // 25% opacity — for glows
    dim:     '#D4A05420', // 12% opacity — for borders
  },

  // Semantic
  success: '#4ADE80',
  error:   '#F87171',
  info:    '#60A5FA',
};
```

### 2.3 Typography

```typescript
// next/font/google imports
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';

// Display — exhibition titles, hero text, artist names
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

// Body — descriptions, UI labels, navigation
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
});

// Mono — metadata, parameters, seeds, technical details
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400'],
});
```

**Type Scale (rem):**

```
display-xl:  4.5rem / 1.0  / -0.04em  → Playfair 600
display-lg:  3.0rem / 1.1  / -0.03em  → Playfair 500
display-md:  2.0rem / 1.2  / -0.02em  → Playfair 400
heading-lg:  1.5rem / 1.3  / -0.01em  → DM Sans 600
heading-md:  1.25rem/ 1.4  / -0.01em  → DM Sans 500
body-lg:     1.125rem/ 1.6 / 0        → DM Sans 400
body-md:     1.0rem / 1.6  / 0        → DM Sans 400
body-sm:     0.875rem/ 1.5 / 0        → DM Sans 400
caption:     0.75rem / 1.4 / 0.02em   → DM Sans 300
mono-md:     0.875rem/ 1.5 / 0.05em   → JetBrains 400
mono-sm:     0.75rem / 1.4 / 0.05em   → JetBrains 300
```

### 2.4 Spacing System

Use Tailwind’s default scale but with deliberate generosity. Minimum padding on any interactive element: `p-4` (16px). Cards: `p-6` minimum. Section gaps: `gap-12` or `gap-16`. The gallery breathes.

### 2.5 Motion System — “Glacial”

```typescript
// lib/motion.ts
export const glacial = {
  // Page-level orchestration
  stagger: { staggerChildren: 0.12, delayChildren: 0.2 },
  
  // Individual element entrance
  fadeUp: {
    hidden:  { opacity: 0, y: 24, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)',
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
    },
  },
  
  // Gallery card reveal
  cardReveal: {
    hidden:  { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    },
  },
  
  // Image zoom on artwork view
  artworkZoom: {
    initial: { scale: 1.08, opacity: 0 },
    animate: { scale: 1, opacity: 1,
      transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] }
    },
  },
  
  // Sidebar / panel slide
  panelSlide: {
    hidden:  { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1,
      transition: { type: 'spring', damping: 30, stiffness: 200 }
    },
    exit:    { x: '100%', opacity: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    },
  },
  
  // Scroll-triggered parallax factor
  parallax: { offset: ['start end', 'end start'] },
  
  // Ambient glow pulse on generative pieces
  glowPulse: {
    animate: {
      boxShadow: [
        '0 0 60px 0px var(--glow-color)',
        '0 0 120px 10px var(--glow-color)',
        '0 0 60px 0px var(--glow-color)',
      ],
      transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
    },
  },
};
```

### 2.6 Effects & Atmosphere

- **Grain overlay:** Subtle CSS noise texture applied to the `<body>` via a pseudo-element. Opacity 0.03, pointer-events none. Creates gallery-print texture.
- **Ambient glow:** When viewing a single artwork, extract its dominant color (via sharp on upload, stored in DB) and apply a radial gradient glow behind the piece. Use CSS custom properties: `--glow-color: {dominantColor}20;`
- **Vignette:** On the immersive viewer, apply a CSS radial-gradient vignette overlay that darkens edges — cinema effect.
- **Cursor:** Default cursor throughout. On hoverable artwork cards, use `cursor: pointer` with a subtle scale transform — no custom cursors.
- **Backdrop blur:** Navigation and overlay panels use `backdrop-blur-xl` with `bg-void-900/80`.

### 2.7 Component Conventions

- All custom components use `forwardRef` and accept a `className` prop for composition
- shadcn/ui components are themed via CSS variables mapped to Void Canvas tokens
- All interactive elements have visible `:focus-visible` rings in amber
- Minimum touch target: 44×44px
- No component renders without a loading skeleton first (use Suspense boundaries)

-----

## 3. INFORMATION ARCHITECTURE & ROUTES

```
app/
├── (gallery)/
│   ├── page.tsx                    → Landing / Hero Exhibition
│   ├── collection/
│   │   ├── page.tsx                → Full Collection Grid (permanent + community)
│   │   └── [slug]/
│   │       └── page.tsx            → Single Artwork View
│   ├── exhibitions/
│   │   ├── page.tsx                → Curated Exhibition List
│   │   └── [exhibitionSlug]/
│   │       └── page.tsx            → Single Exhibition (narrative walkthrough)
│   ├── generative/
│   │   ├── page.tsx                → Live Generative Art Playground
│   │   └── [pieceId]/
│   │       └── page.tsx            → Single Generative Piece (interactive)
│   ├── submit/
│   │   └── page.tsx                → Community Submission Form
│   └── about/
│       └── page.tsx                → About Aether + Credits
├── api/
│   ├── artworks/
│   │   ├── route.ts                → GET (list), POST (create)
│   │   └── [id]/
│   │       └── route.ts            → GET (single), PATCH (update), DELETE
│   ├── upload/
│   │   └── route.ts                → POST (multipart file upload)
│   ├── exhibitions/
│   │   └── route.ts                → GET (list)
│   ├── docent/
│   │   └── route.ts                → POST (AI docent chat, streaming)
│   └── colors/
│       └── route.ts                → POST (extract dominant colors from image)
├── layout.tsx                      → Root layout, fonts, global providers
├── globals.css                     → Tailwind directives, CSS variables, grain overlay
├── not-found.tsx                   → Custom 404 with ambient animation
└── loading.tsx                     → Global loading skeleton
```

-----

## 4. DATABASE SCHEMA

Use Drizzle ORM with SQLite. Create schema in `db/schema.ts`, run migrations on app boot.

```typescript
// db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const artworks = sqliteTable('artworks', {
  id:              text('id').primaryKey(),           // nanoid
  slug:            text('slug').notNull().unique(),    // URL-safe slug
  title:           text('title').notNull(),
  artistName:      text('artist_name').notNull(),      // "Aether Algorithm" for generated, user-provided for uploads
  artistStatement: text('artist_statement'),            // Artist's description of the piece
  description:     text('description'),                 // Curatorial description
  
  // Classification
  type:            text('type', { enum: ['generative', 'community'] }).notNull(),
  medium:          text('medium'),                      // "Algorithmic / p5.js", "Midjourney v6", "DALL-E 3", etc.
  aiTool:          text('ai_tool'),                     // The AI tool used to generate
  prompt:          text('prompt'),                       // The prompt used (optional, for community pieces)
  tags:            text('tags'),                         // JSON array of strings
  
  // Visual data
  imagePath:       text('image_path'),                  // Relative to /public — for community uploads + generative thumbnails
  thumbnailPath:   text('thumbnail_path'),              // 400px wide thumbnail
  width:           integer('width'),                    // Original image dimensions
  height:          integer('height'),
  dominantColor:   text('dominant_color'),              // Hex string, extracted via sharp
  colorPalette:    text('color_palette'),               // JSON array of 5 hex strings
  aspectRatio:     real('aspect_ratio'),
  fileSizeBytes:   integer('file_size_bytes'),
  
  // Generative-specific
  generativeConfig: text('generative_config'),          // JSON: { algorithm, defaultSeed, parameters }
  
  // Exhibition membership
  exhibitionId:    text('exhibition_id').references(() => exhibitions.id),
  exhibitionOrder: integer('exhibition_order'),
  
  // Metadata
  featured:        integer('featured', { mode: 'boolean' }).default(false),
  createdAt:       text('created_at').notNull(),        // ISO string
  updatedAt:       text('updated_at').notNull(),
});

export const exhibitions = sqliteTable('exhibitions', {
  id:              text('id').primaryKey(),
  slug:            text('slug').notNull().unique(),
  title:           text('title').notNull(),
  subtitle:        text('subtitle'),
  curatorNote:     text('curator_note'),                // Long-form curatorial essay
  coverImagePath:  text('cover_image_path'),
  
  // Theme for ambient styling
  themeColor:      text('theme_color'),                 // Hex — used for ambient lighting in exhibition view
  
  createdAt:       text('created_at').notNull(),
  updatedAt:       text('updated_at').notNull(),
});

export const docentMessages = sqliteTable('docent_messages', {
  id:              text('id').primaryKey(),
  sessionId:       text('session_id').notNull(),        // Anonymous session tracking
  artworkId:       text('artwork_id').references(() => artworks.id),
  role:            text('role', { enum: ['user', 'assistant'] }).notNull(),
  content:         text('content').notNull(),
  createdAt:       text('created_at').notNull(),
});
```

-----

## 5. THE PERMANENT COLLECTION — 12 GENERATIVE MASTERWORKS

This is the heart of Aether. You must create 12 distinct generative art pieces, each implemented as a self-contained p5.js sketch running in instance mode. These are not demos or experiments — they are finished artworks with the depth and intentionality of a gallery piece.

### 5.1 Implementation Pattern

Each generative piece lives in `lib/generative/pieces/[piece-name].ts` and exports:

```typescript
// lib/generative/pieces/types.ts
export interface GenerativePiece {
  id: string;
  title: string;
  artistStatement: string;
  algorithm: string;          // Human-readable algorithm description
  year: number;
  defaultSeed: number;
  parameters: PieceParameter[];
  sketch: (p: p5, params: Record<string, number>, seed: number) => void;
  dominantColor: string;      // For ambient glow
  colorPalette: string[];
  tags: string[];
}

export interface PieceParameter {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  description: string;
}
```

### 5.2 The Twelve Pieces

Create ALL of the following. Each must be visually distinct, algorithmically sophisticated, and genuinely beautiful. Spend significant effort on each. These are the flagship works.

-----

**Piece 01: “Erosion Memory”**

- *Algorithm:* Particle system where 10,000+ particles follow a multi-octave Perlin noise flow field. Particles have finite lifespans and leave behind fading trails that accumulate into terrain-like density maps. Over time, channels erode deeper — high-traffic paths darken and widen like river systems.
- *Parameters:* particle count, flow scale, turbulence, lifespan, trail opacity, erosion rate
- *Palette:* Deep navy → teal → warm white. The feeling of satellite imagery of river deltas at night.
- *Artist Statement:* “Ten thousand particles seek paths of least resistance. Where they converge, they erode. Where they diverge, silence remains. The piece is never finished — it is always in the process of becoming geography.”

**Piece 02: “Harmonic Lattice”**

- *Algorithm:* A grid of 200×200 points, each oscillating sinusoidally. Phase offsets create interference patterns. Neighboring points are connected by lines whose opacity depends on relative displacement. The result: moiré-like standing wave patterns that shift and breathe.
- *Parameters:* grid density, wave frequency, amplitude, phase drift speed, connection threshold, damping
- *Palette:* Monochrome — pure white on void black. The mathematics speaks for itself.
- *Artist Statement:* “Simple harmonic motion, repeated forty thousand times, creates complexity no equation predicted. This is emergence made visible — the space between predictable and chaotic.”

**Piece 03: “Chromatic Drift”**

- *Algorithm:* Large-scale Voronoi tessellation (500+ sites) with Lloyd’s relaxation. Each cell is colored based on distance from center, neighbor count, and a time-evolving hue rotation. Cell boundaries glow. Sites drift slowly under noise-driven velocity fields — the tessellation constantly reorganizes.
- *Parameters:* site count, relaxation iterations, drift speed, hue rotation speed, border glow intensity, cell opacity
- *Palette:* Full spectrum, HSB-driven. Cells shift through hues over time — a stained glass window in slow motion.
- *Artist Statement:* “Every point in space belongs to its nearest neighbor. As neighbors drift, allegiances shift. The borders between territories glow with the energy of proximity — a political map of particle physics.”

**Piece 04: “Mycelial Network”**

- *Algorithm:* Space colonization algorithm — random attractor points in 2D space, with branching growth nodes that extend toward the nearest attractor, split when close enough, and die when no attractors remain in range. The result: organic branching networks that look like neural tissue, root systems, or mycelial mats.
- *Parameters:* attractor count, branch angle, growth rate, kill distance, influence radius, branch thickness decay
- *Palette:* Warm ivories and golds on deep brown-black. Bioluminescent tips in soft amber.
- *Artist Statement:* “The algorithm knows nothing of biology. It knows only: grow toward resources, branch when necessary, stop when satisfied. That it produces structures indistinguishable from living networks is the deepest compliment to the mathematics of life.”

**Piece 05: “Frequency Domain”**

- *Algorithm:* Real-time 2D FFT visualization. Generate a procedural signal (sum of sine waves with noise-modulated frequencies), compute its frequency spectrum, and render the magnitude as a radial visualization — concentric rings of varying intensity and color, like looking down into a radio telescope’s data.
- *Parameters:* base frequency, harmonic count, noise modulation depth, radial resolution, color mapping curve, symmetry order
- *Palette:* Electric blue → magenta → white hot center. The aesthetic of scientific instrumentation.
- *Artist Statement:* “Every complex signal is a chorus of simple ones. This piece decomposes the visible into the invisible — the frequencies that compose reality, rendered as light.”

**Piece 06: “Accretion”**

- *Algorithm:* Diffusion-limited aggregation (DLA). Start with a seed particle at center. Random walkers approach from edges. When a walker touches the growing structure, it sticks. Over thousands of iterations, coral-like fractal structures emerge. Render with depth-based coloring — newer particles are brighter.
- *Parameters:* walker count per frame, sticking probability, launch radius, color age gradient, particle size, symmetry (none/bilateral/radial)
- *Palette:* Cool grays aging to warm golds at the growth tips. The feeling of mineral crystallization.
- *Artist Statement:* “Growth without intention. Structure without blueprint. Each particle’s random walk ends in permanence — the moment chaos commits to form.”

**Piece 07: “Sine Cartography”**

- *Algorithm:* Topographic contour map generated from layered sine functions with different frequencies, amplitudes, and rotations. Render as parallel horizontal lines displaced vertically by the height function — like a Joy Division album cover generalized to arbitrary terrain. Lines that cross are clipped.
- *Parameters:* layer count, line density, amplitude, frequency spread, rotation range, line weight
- *Palette:* Single color — ivory on void. The constraint forces formal clarity.
- *Artist Statement:* “Cartography of imaginary lands. These contours describe no real terrain, yet the eye insists on seeing mountains, valleys, ridgelines. We are pattern-recognition machines viewing our own projections.”

**Piece 08: “Swarm Intelligence”**

- *Algorithm:* Boids flocking simulation with 3,000+ agents. Three classic rules (separation, alignment, cohesion) plus a fourth: attraction to cursor position. Agents leave short trails. When the swarm splits and reforms, the trails create figure-eight murmuration patterns.
- *Parameters:* agent count, separation radius, alignment strength, cohesion strength, trail length, max speed, perception radius
- *Palette:* Warm white agents on void, with trails that fade through amber to transparent. Predator cursor glows red.
- *Artist Statement:* “No bird knows the shape of the flock. No fish knows the school’s direction. Intelligence emerges from the space between individuals — a democracy of instinct.”

**Piece 09: “Penrose Tiling”**

- *Algorithm:* Aperiodic Penrose P3 tiling (thin and thick rhombi) via subdivision. Start with a star of thick rhombi, subdivide 6+ times. Color each tile based on its orientation and generation depth. Add subtle parallax — tiles at different depths shift with mouse movement.
- *Parameters:* subdivision depth, tile gap, color scheme rotation, parallax intensity, border opacity, tile fill opacity
- *Palette:* Jewel tones — sapphire, emerald, ruby, amber — each assigned to a tile orientation. On void background with thin gold borders.
- *Artist Statement:* “A pattern that never repeats, yet fills all of space. Roger Penrose proved that order need not require periodicity — that infinity can be structured without repetition. This is the visual proof.”

**Piece 10: “Reaction-Diffusion”**

- *Algorithm:* Gray-Scott reaction-diffusion model on a 256×256 grid. Two chemicals: one feeds, one kills. The interplay creates spots, stripes, spirals, and labyrinthine patterns depending on feed/kill rates. Render as a heightmap with the concentration mapped to luminosity.
- *Parameters:* feed rate (F), kill rate (k), diffusion rate A, diffusion rate B, time steps per frame, color mapping
- *Palette:* Biological — deep purples for low concentration, through warm pinks, to bright white at peaks. The look of living tissue under a microscope.
- *Artist Statement:* “Alan Turing proposed that the spots on a leopard and the stripes on a zebrafish arise from the same mathematics. This simulation proves him right — two simple chemicals, interacting, produce the full vocabulary of biological pattern.”

**Piece 11: “Strange Attractor”**

- *Algorithm:* 3D Lorenz attractor (or Rössler, or Chen — pick the most visually striking), projected onto 2D with perspective. Trace 50,000+ points along the attractor’s trajectory with infinitesimal time steps. Render as a continuous line with color mapped to velocity (speed = brightness). Add slow rotation around the Y axis for depth.
- *Parameters:* sigma, rho, beta (or equivalent attractor params), rotation speed, projection scale, trail density, color velocity mapping
- *Palette:* Single hue gradient — deep violet at rest, electric cyan at maximum velocity. On void.
- *Artist Statement:* “Deterministic chaos. Every point on this trajectory is exactly predictable, yet the shape it traces is indistinguishable from randomness. The butterfly effect is not a metaphor — it is this curve.”

**Piece 12: “Recursive Breath”**

- *Algorithm:* Recursive tree with animated growth. Start from a central trunk, branch at each level with slight random variation in angle and length. At maximum depth, leaves pulse with a breathing animation (scale oscillation). Branches have thickness proportional to their depth. Wind simulation: Perlin noise displaces branch angles over time, propagating from root to leaf.
- *Parameters:* max depth, branch angle, length ratio, wind strength, wind scale, breathing speed, trunk thickness
- *Palette:* Dark wood browns for trunk, transitioning through sage greens to luminous chartreuse at the leaf tips.
- *Artist Statement:* “A tree is a recursive data structure that evolution wrote. Each branch is a smaller tree. Each leaf is a terminal node. This algorithm grows a tree the way DNA does — with a simple rule, repeated, varied, and subjected to wind.”

-----

### 5.3 Generative Piece Rendering Component

Create a reusable `<GenerativeCanvas />` component:

```typescript
// components/generative/GenerativeCanvas.tsx
interface GenerativeCanvasProps {
  piece: GenerativePiece;
  seed?: number;
  params?: Record<string, number>;
  className?: string;
  interactive?: boolean;    // Show parameter controls
  autoplay?: boolean;       // Start animating immediately
  onReady?: () => void;     // Callback when first frame renders
}
```

Key requirements:

- Uses p5.js in **instance mode** — NEVER pollute global scope
- Canvas resizes responsively (use ResizeObserver)
- When `interactive` is true, render a floating parameter panel (shadcn Sheet from right edge)
- Seed navigation: prev / next / random / manual input
- “Download PNG” button captures current frame at 2× resolution via `p5.saveCanvas()`
- Performance: use `requestAnimationFrame`, debounce parameter changes, respect `prefers-reduced-motion`
- Cleanup: properly remove p5 instance on unmount (memory leak prevention is critical)

-----

## 6. PAGE-BY-PAGE SPECIFICATIONS

### 6.1 Landing Page — `app/(gallery)/page.tsx`

This is the entrance to the museum.

**Hero Section:**

- Full viewport height
- Background: the most visually striking generative piece (Piece 01 or 03) running live, with a subtle dark gradient overlay from bottom
- Center-aligned content:
  - “AETHER” in `display-xl` Playfair, letter-spacing 0.3em, ivory
  - Subtitle: “An AI Art Gallery” in `body-lg` DM Sans 300, ivory-200
  - Subtle animated separator line (1px, 80px wide, amber, fade in after 1s)
  - “Enter Gallery” button — minimal, outlined, amber border, Playfair italic text, hover fills amber
- Mouse parallax on the generative background (subtle — ±20px max)
- Scroll indicator at bottom: animated chevron, pulses gently

**Featured Exhibition Section** (below fold):

- Full-width horizontal scroll section (or large masonry grid)
- Shows the current “featured exhibition” — 4–6 artworks from the permanent collection in a cinematic horizontal strip
- Each artwork card: image fills card, title overlaid at bottom with gradient scrim, artist name in caption text
- Section title: “Now Showing” in `display-md` Playfair
- Exhibition description in `body-md`, max-width 60ch

**Community Highlights:**

- “From the Community” heading
- Grid of 6 most recent community submissions (2 columns on mobile, 3 on desktop)
- Each card: thumbnail, title, artist name, AI tool badge
- “View All →” link to `/collection?filter=community`

**Call to Action:**

- “Share Your Art” section
- Brief copy about what Aether accepts (AI-generated art, any tool, any style)
- Button linking to `/submit`
- Subtle background pattern: scattered dots or fine grid in void-700

### 6.2 Collection Page — `app/(gallery)/collection/page.tsx`

**Filtering & Sorting Toolbar:**

- Sticky top bar below main navigation
- Filter pills: “All” | “Permanent Collection” | “Community” | “Generative” (active state: amber fill)
- Tag filter: horizontal scrollable list of popular tags
- Sort: “Newest” | “Oldest” | “Title A-Z” | “Most Discussed” (dropdown)
- Search: expandable search input (icon click → slides open, Framer Motion)

**Grid Layout:**

- Masonry layout using CSS columns (3 columns desktop, 2 tablet, 1 mobile)
- Artwork cards:
  - Image with lazy loading (`loading="lazy"` + Intersection Observer for animation trigger)
  - On hover: slight scale(1.02), shadow elevation, title + artist overlay fades in from bottom
  - Badge in top-right corner: “GENERATIVE” (amber) or AI tool name (void-700 bg)
  - Click navigates to `/collection/[slug]`
- Infinite scroll with “Loading more…” skeleton row
- If no results: beautiful empty state with generative animation

**Data Fetching:**

- Initial: server-side render first 24 artworks
- Subsequent: client-side fetch in batches of 12 via `/api/artworks?cursor=...&filter=...&sort=...`

### 6.3 Single Artwork View — `app/(gallery)/collection/[slug]/page.tsx`

This is the most important page. It must feel like standing in front of a masterpiece.

**Layout:**

- Two-column on desktop (artwork 60% / details 40%), single column on mobile
- Artwork column:
  - If `type === 'generative'`: render `<GenerativeCanvas />` with interactive controls
  - If `type === 'community'`: render high-resolution image with zoom capability (click to fullscreen, pinch-to-zoom on mobile)
  - Below artwork: “View Immersive” button (opens fullscreen overlay)
  - Ambient glow: extract `dominantColor` from DB, apply as CSS radial gradient behind artwork container

**Details Column (ScrollArea):**

- Title in `display-md` Playfair
- Artist name in `heading-md` DM Sans, with “Aether Algorithm” for generative pieces
- Medium/AI tool in `mono-sm` with amber accent
- Divider
- Artist Statement (if present): in `body-md`, italic Playfair for the first line
- Description: in `body-md` DM Sans
- If generative: “Algorithm” section explaining the approach in `body-sm`
- If community: “Prompt” section (if provided) in `mono-sm` code block
- Tags: row of Badge components
- Metadata footer: dimensions, file size, date added, seed number (for generative)
- Divider
- **AI Docent:** “Ask the Docent” expandable panel (Framer Motion accordion)
  - Chat interface: scrollable message list + input
  - Docent messages use Playfair italic for a “spoken guide” feel
  - Streaming responses from `/api/docent`
  - Context: the docent knows about this specific piece (title, artist statement, algorithm, medium, etc.)

**Immersive Mode:**

- Triggered by “View Immersive” button or keyboard shortcut `F`
- Full-screen overlay: artwork centered, maximum size while maintaining aspect ratio
- Void black background with vignette
- Ambient glow from dominant color, more intense than normal view
- Minimal controls: close button (top-right), next/prev arrows (if viewing within a collection), seed controls (if generative)
- ESC closes. Click outside artwork closes.
- Focus trapped within overlay (accessibility)
- For generative pieces: show floating seed display in bottom-left corner, `mono-sm`

### 6.4 Exhibitions Page — `app/(gallery)/exhibitions/page.tsx`

**Layout:**

- Vertical list of exhibitions, each as a wide card
- Each card:
  - Cover image as background (full card width, 300px height), with gradient overlay
  - Exhibition title in `display-md` Playfair, overlaid
  - Subtitle in `body-lg`
  - “N artworks” badge
  - Hover: parallax shift on background image (subtle)

### 6.5 Single Exhibition — `app/(gallery)/exhibitions/[exhibitionSlug]/page.tsx`

**Narrative Walkthrough Experience:**

- Top hero: cover image, full width, parallax scroll, with title + curator’s note overlaid
- Below: artworks presented as a **vertical scroll narrative** — NOT a grid
- Each artwork section:
  - Full-bleed image or generative canvas (max-height 80vh)
  - Below: title, artist, description — typeset like a magazine spread
  - Generous vertical spacing between pieces (200px+)
  - Alternating alignment: some left-aligned, some centered, some right-aligned (vary the rhythm)
- Ambient lighting shifts between pieces based on each artwork’s dominant color
- Progress indicator: thin vertical line on right edge showing scroll position through the exhibition

### 6.6 Generative Playground — `app/(gallery)/generative/page.tsx`

**Grid of Generative Pieces:**

- All 12 permanent generative works displayed as animated thumbnails
- Each thumbnail: 200×200 canvas running the piece at reduced particle counts (performance mode)
- On hover: canvas scales up slightly, border glows amber
- Click → navigates to `/generative/[pieceId]` for full interactive experience

**The Individual Generative View — `app/(gallery)/generative/[pieceId]/page.tsx`:**

- Full-width canvas (respecting max-width for ultra-wide screens: 1400px)
- Right-side panel (Sheet component, toggleable):
  - Piece info: title, artist statement
  - Seed controls: current seed display, prev/next/random/manual
  - Parameter sliders for each configurable parameter
  - “Recommended Seeds” — 5 pre-selected seeds that showcase the piece’s range
  - “Reset to Defaults” button
  - “Download PNG (2×)” button
  - “Download SVG” button (if applicable)
  - “Share Variation” button — copies a URL with seed + params encoded as query params
- Keyboard shortcuts:
  - `Space` — pause/resume
  - `R` — regenerate with new random seed
  - `S` — save PNG
  - `F` — fullscreen
  - `P` — toggle parameter panel
  - `←/→` — prev/next seed
  - `?` — show shortcut help overlay

### 6.7 Submit Page — `app/(gallery)/submit/page.tsx`

**Form Layout:**

- Single column, centered, max-width 640px
- Generous top padding (feel like entering a submissions office)

**Upload Area:**

- Drag-and-drop zone: dashed border (void-700), 300px tall
- On drag-over: border turns amber, bg becomes `amber-dim`
- Accepted formats: .png, .jpg, .jpeg, .webp — max 20MB
- After upload: show preview thumbnail, file size, dimensions
- Progress bar during upload (amber fill animation)

**Form Fields:**

- **Title** (required): text input, max 100 chars
- **Artist Name** (required): text input, max 60 chars, default “Anonymous”
- **Artist Statement** (optional): textarea, max 2000 chars, with char counter
- **AI Tool Used** (required): select dropdown — “Midjourney”, “DALL-E 3”, “Stable Diffusion”, “Flux”, “Firefly”, “Leonardo AI”, “Claude (Artifacts)”, “Other (specify)”
- **Prompt** (optional): textarea, max 5000 chars — “Share the prompt that created this piece”
- **Tags** (optional): tag input with autocomplete from existing tags, max 5 tags
- **Agreement checkbox**: “I confirm this is AI-generated artwork that I have the right to share”

**Submission Flow:**

1. Client-side validation
1. Upload image to `/api/upload` → returns path + extracted colors
1. Submit metadata to `/api/artworks` (POST)
1. Show success state: green checkmark animation, “Your art has been added to the collection” message, link to view the piece
1. On error: inline error messages, toast notification for server errors

### 6.8 About Page — `app/(gallery)/about/page.tsx`

- Long-form editorial layout, max-width 65ch, centered
- Title: “About Aether” in `display-lg` Playfair
- Sections:
  - What is Aether? (description of the project)
  - The Permanent Collection (how the generative pieces were created)
  - Community Gallery (invitation to submit)
  - The AI Docent (how it works)
  - Technology (brief tech stack credits)
- Interspersed with small generative canvases as section dividers (miniature versions of collection pieces)

-----

## 7. GLOBAL NAVIGATION

**Header:**

- Fixed position, `backdrop-blur-xl`, `bg-void-900/80`
- Left: “AETHER” wordmark in `heading-md` Playfair, letter-spacing 0.2em
- Center (desktop): nav links — “Collection”, “Exhibitions”, “Generative”, “Submit”
- Right: “Ask Docent” button (opens global docent Sheet from right)
- Mobile: hamburger menu (Sheet from left, full links)
- Active link indicator: 2px amber underline, animated with `layoutId`

**Footer:**

- Minimal. `void-950` background.
- Left: “Aether © 2026. A digital art experience.”
- Right: “Built with” + small links to Next.js, p5.js, Anthropic
- Separator: 1px void-700 line, full width

-----

## 8. AI DOCENT — IMPLEMENTATION

### 8.1 API Route — `app/api/docent/route.ts`

```typescript
// Streaming response using Anthropic SDK
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // Uses ANTHROPIC_API_KEY env var

export async function POST(request: Request) {
  const { messages, artworkContext } = await request.json();
  
  const systemPrompt = `You are the Docent of Aether, a distinguished AI art gallery. You are erudite, warm, and deeply knowledgeable about generative art, AI art tools, algorithmic aesthetics, and art history.

Your role:
- Guide visitors through the collection with insight and passion
- Explain the technical processes behind each piece in accessible language
- Draw connections between algorithmic art and art history traditions
- Discuss the philosophical implications of AI-generated art
- Be opinionated but respectful — you have genuine aesthetic preferences

Your personality:
- Speak like a brilliant museum guide who genuinely loves their work
- Use evocative, precise language — never generic or cliché
- Reference specific art movements, artists, and concepts when relevant
- Be conversational, not lecturing — respond to what the visitor actually asks
- Occasional gentle humor is welcome

${artworkContext ? `
CURRENT ARTWORK CONTEXT:
Title: ${artworkContext.title}
Artist: ${artworkContext.artistName}
Medium: ${artworkContext.medium}
Artist Statement: ${artworkContext.artistStatement}
Algorithm/Description: ${artworkContext.description}
Tags: ${artworkContext.tags}
` : 'The visitor is browsing the gallery generally, not looking at a specific piece.'}`;

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    })),
  });

  // Return as ReadableStream for streaming
  return new Response(stream.toReadableStream(), {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

### 8.2 Client-Side Docent Component

```typescript
// components/docent/DocentChat.tsx
interface DocentChatProps {
  artworkContext?: ArtworkContext | null;  // null = general gallery mode
  isOpen: boolean;
  onClose: () => void;
}
```

- Renders inside a shadcn Sheet (right side, 400px wide)
- Message list with auto-scroll
- Streaming: assistant messages render token-by-token with a subtle typing indicator
- Input: text area with shift+enter for newlines, enter to send
- Docent messages styled differently: Playfair italic, slightly larger, with a small “🎨” icon prefix
- “Clear Conversation” button in header
- Persist messages per-session in Zustand store

-----

## 9. MOCK DATA & SEEDING

### 9.1 Seed Script — `scripts/seed.ts`

Run via `npx tsx scripts/seed.ts`. This script:

1. Creates the SQLite database if it doesn’t exist
1. Runs Drizzle migrations
1. Inserts all 12 generative pieces into the `artworks` table with their metadata
1. Creates 3 exhibitions:
- **“Genesis”** — The first 6 pieces (Erosion Memory through Accretion)
- **“Signal & Noise”** — Frequency Domain, Sine Cartography, Harmonic Lattice, Strange Attractor
- **“Living Systems”** — Mycelial Network, Swarm Intelligence, Reaction-Diffusion, Recursive Breath
1. Generates 15 mock community submissions with realistic metadata:
- Titles, artist names, AI tools, statements, prompts, tags
- Use placeholder images: generate them as colored gradient PNGs via sharp (no external downloads)
- Each gradient uses different color combinations — they should look intentional, like color field paintings

### 9.2 Static Thumbnail Generation

For each generative piece, the seed script should:

1. NOT try to run p5.js server-side (it requires a DOM)
1. Instead, generate abstract gradient thumbnails using sharp (each unique, matching the piece’s color palette)
1. Save to `/public/collection/thumbnails/`
1. These thumbnails show in grid views; the actual generative canvas loads on individual piece pages

-----

## 10. API ROUTES — COMPLETE SPECIFICATION

### `GET /api/artworks`

- Query params: `cursor` (pagination), `filter` (all|generative|community), `sort` (newest|oldest|title), `search` (text search on title/artist/tags), `tag` (filter by tag), `limit` (default 24, max 100)
- Returns: `{ artworks: Artwork[], nextCursor: string | null, total: number }`

### `POST /api/artworks`

- Body: artwork metadata (title, artistName, etc.)
- Validates required fields
- Generates slug from title (handle collisions with nanoid suffix)
- Returns: created artwork

### `GET /api/artworks/[id]`

- Returns: full artwork with all fields

### `POST /api/upload`

- Multipart form data with single image file
- Validates: file type (png/jpg/webp), file size (≤20MB)
- Processes with sharp:
  - Strip EXIF data (privacy)
  - Generate thumbnail (400px wide)
  - Extract dominant color and 5-color palette
  - Get dimensions
- Saves originals to `/public/uploads/originals/`
- Saves thumbnails to `/public/uploads/thumbnails/`
- Returns: `{ imagePath, thumbnailPath, width, height, dominantColor, colorPalette, fileSizeBytes }`

### `GET /api/exhibitions`

- Returns all exhibitions with artwork counts

### `POST /api/docent`

- Streaming response (see §8)

### `POST /api/colors`

- Body: `{ imagePath: string }`
- Returns: `{ dominantColor: string, palette: string[] }`

-----

## 11. ZUSTAND STORE

```typescript
// stores/gallery.ts
interface GalleryStore {
  // Navigation
  currentView: 'grid' | 'artwork' | 'exhibition' | 'generative';
  
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
  addDocentMessage: (msg: { role: 'user' | 'assistant'; content: string }) => void;
  clearDocentMessages: () => void;
  setDocentArtworkContext: (ctx: ArtworkContext | null) => void;
  
  // Immersive mode
  immersiveOpen: boolean;
  immersiveArtworkId: string | null;
  openImmersive: (id: string) => void;
  closeImmersive: () => void;
}
```

-----

## 12. ACCESSIBILITY — NON-NEGOTIABLE REQUIREMENTS

These are not optional enhancements. Every one must be implemented.

1. **Semantic HTML everywhere.** `<main>`, `<nav>`, `<article>`, `<section>`, `<figure>`, `<figcaption>`. Every artwork image has meaningful `alt` text derived from its title + medium.
1. **ARIA live regions** for: docent streaming messages (`aria-live="polite"`), upload progress, filter result counts.
1. **Focus management:** when opening modals/sheets, focus moves to first interactive element. On close, focus returns to trigger element. Focus trap in immersive mode.
1. **Keyboard navigation:** all interactive elements reachable via Tab. Custom keyboard shortcuts (§6.6) must not conflict with screen reader shortcuts. Provide `aria-keyshortcuts` attributes.
1. **Skip links:** “Skip to main content” and “Skip to navigation” links, visible on focus.
1. **Color contrast:** all text meets WCAG AA (4.5:1 for normal text, 3:1 for large text). Test ivory on void backgrounds — they pass.
1. **Motion:** wrap all Framer Motion animations in a `prefers-reduced-motion` check. When reduced motion is preferred: disable parallax, replace animations with instant transitions, pause generative canvases by default.
1. **Touch targets:** 44×44px minimum for all buttons and interactive elements.
1. **Canvas accessibility:** each generative canvas has an `aria-label` describing the piece and a `role="img"`. Parameter changes announced via `aria-live`.
1. **Form accessibility:** all inputs have associated `<label>` elements. Error messages use `aria-describedby`. Required fields have `aria-required="true"`.

-----

## 13. PERFORMANCE REQUIREMENTS

1. **Generative canvas performance:** target 60fps on M1 MacBook Air. Use `requestAnimationFrame`. For heavy simulations (Reaction-Diffusion, DLA), use offscreen computation or reduce grid size dynamically if frame rate drops below 30fps.
1. **Image optimization:** all user-uploaded images served through `next/image` with `sizes` attribute. Thumbnails for grid views, full resolution only on single artwork pages.
1. **Bundle splitting:** each generative piece’s algorithm is a dynamic import (`next/dynamic`). Only load the p5.js sketch code for the piece being viewed.
1. **Lazy loading:** images below the fold use `loading="lazy"`. Generative thumbnails on the playground page use Intersection Observer — only start rendering when visible.
1. **Database queries:** use Drizzle’s query builder with proper WHERE clauses and LIMIT. Add indexes on `slug`, `type`, `createdAt`, `exhibitionId`.

-----

## 14. FILE STRUCTURE — COMPLETE

```
aether/
├── app/
│   ├── (gallery)/
│   │   ├── page.tsx
│   │   ├── collection/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── exhibitions/
│   │   │   ├── page.tsx
│   │   │   └── [exhibitionSlug]/
│   │   │       └── page.tsx
│   │   ├── generative/
│   │   │   ├── page.tsx
│   │   │   └── [pieceId]/
│   │   │       └── page.tsx
│   │   ├── submit/
│   │   │   └── page.tsx
│   │   └── about/
│   │       └── page.tsx
│   ├── api/
│   │   ├── artworks/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── upload/
│   │   │   └── route.ts
│   │   ├── exhibitions/
│   │   │   └── route.ts
│   │   ├── docent/
│   │   │   └── route.ts
│   │   └── colors/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── globals.css
│   ├── not-found.tsx
│   └── loading.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   ├── MobileMenu.tsx
│   │   └── SkipLinks.tsx
│   ├── gallery/
│   │   ├── ArtworkCard.tsx
│   │   ├── ArtworkGrid.tsx
│   │   ├── ArtworkDetail.tsx
│   │   ├── ImmersiveViewer.tsx
│   │   ├── FilterToolbar.tsx
│   │   ├── TagList.tsx
│   │   └── ExhibitionCard.tsx
│   ├── generative/
│   │   ├── GenerativeCanvas.tsx
│   │   ├── ParameterPanel.tsx
│   │   ├── SeedControls.tsx
│   │   └── GenerativeThumbnail.tsx
│   ├── docent/
│   │   ├── DocentChat.tsx
│   │   ├── DocentMessage.tsx
│   │   └── DocentInput.tsx
│   ├── submit/
│   │   ├── UploadDropzone.tsx
│   │   ├── SubmissionForm.tsx
│   │   └── SuccessState.tsx
│   ├── ui/                          ← shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── ... (all shadcn components)
│   └── shared/
│       ├── GrainOverlay.tsx
│       ├── AmbientGlow.tsx
│       ├── SectionDivider.tsx
│       ├── EmptyState.tsx
│       └── LoadingSkeleton.tsx
├── lib/
│   ├── generative/
│   │   ├── pieces/
│   │   │   ├── types.ts
│   │   │   ├── index.ts              ← Registry: exports all pieces by ID
│   │   │   ├── erosion-memory.ts
│   │   │   ├── harmonic-lattice.ts
│   │   │   ├── chromatic-drift.ts
│   │   │   ├── mycelial-network.ts
│   │   │   ├── frequency-domain.ts
│   │   │   ├── accretion.ts
│   │   │   ├── sine-cartography.ts
│   │   │   ├── swarm-intelligence.ts
│   │   │   ├── penrose-tiling.ts
│   │   │   ├── reaction-diffusion.ts
│   │   │   ├── strange-attractor.ts
│   │   │   └── recursive-breath.ts
│   │   └── utils.ts                   ← Shared: seeded RNG, noise helpers, color utils
│   ├── motion.ts                      ← Framer Motion variants (§2.5)
│   ├── utils.ts                       ← General utilities: cn(), formatDate, slugify
│   └── constants.ts                   ← App-wide constants
├── db/
│   ├── index.ts                       ← Database connection + Drizzle instance
│   ├── schema.ts                      ← Full schema (§4)
│   └── migrations/                    ← Auto-generated by Drizzle
├── stores/
│   └── gallery.ts                     ← Zustand store (§11)
├── scripts/
│   └── seed.ts                        ← Database seeding script (§9)
├── public/
│   ├── collection/
│   │   └── thumbnails/                ← Generated gradient thumbnails for permanent pieces
│   └── uploads/
│       ├── originals/                 ← User-uploaded full-res images
│       └── thumbnails/                ← Auto-generated 400px thumbnails
├── data/
│   └── aether.db                      ← SQLite database (git-ignored)
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
├── drizzle.config.ts
├── package.json
├── .env.example                       ← ANTHROPIC_API_KEY=
└── .gitignore
```

-----

## 15. ENVIRONMENT & CONFIGURATION

### `.env.example`

```env
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=file:./data/aether.db
NEXT_PUBLIC_BASE_URL=http://localhost:3000
MAX_UPLOAD_SIZE_MB=20
```

### `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [], // All images are local
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'sharp'],
  },
};
export default nextConfig;
```

### `drizzle.config.ts`

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  driver: 'better-sqlite3',
  dbCredentials: {
    url: './data/aether.db',
  },
} satisfies Config;
```

-----

## 16. STARTUP SEQUENCE

When a developer clones the repo and runs it for the first time, this should be the complete flow:

```bash
npm install
cp .env.example .env   # Then add ANTHROPIC_API_KEY
npx tsx scripts/seed.ts  # Creates DB, runs migrations, seeds data + generates thumbnails
npm run dev              # Starts on localhost:3000
```

The seed script MUST be idempotent — running it twice should not create duplicates. Use `INSERT OR REPLACE` or check-before-insert logic.

-----

## 17. ACCEPTANCE CHECKLIST

Before considering this project complete, verify ALL of the following:

### Infrastructure

- [ ] `npm install` succeeds with no errors
- [ ] `npm run build` compiles without TypeScript errors
- [ ] `npm run dev` starts the dev server
- [ ] Seed script creates database and populates all data
- [ ] SQLite database persists between server restarts
- [ ] All 12 generative pieces are registered and have database entries

### Pages

- [ ] Landing page renders with live generative hero background
- [ ] Collection page shows all artworks in masonry grid
- [ ] Collection filters (type, tag, sort, search) all work
- [ ] Single artwork page renders with ambient glow effect
- [ ] Generative artwork pages render live p5.js canvases
- [ ] Exhibition list page shows all 3 exhibitions
- [ ] Single exhibition page shows narrative walkthrough
- [ ] Generative playground shows all 12 pieces as thumbnails
- [ ] Individual generative page has full parameter controls
- [ ] Submit page accepts file uploads with all form fields
- [ ] About page renders with editorial layout
- [ ] 404 page renders with custom design

### Generative Art

- [ ] All 12 pieces render and animate at 30+ fps
- [ ] Seed controls (prev/next/random/manual) work for each piece
- [ ] Parameter sliders update artwork in real-time
- [ ] Download PNG captures current frame
- [ ] Pause/resume works
- [ ] p5 instances are properly cleaned up on unmount (no memory leaks)

### Interactions

- [ ] Immersive viewer opens/closes with ambient glow
- [ ] AI Docent opens from header button
- [ ] AI Docent accepts messages and streams responses
- [ ] AI Docent has context about the current artwork when on a piece page
- [ ] File upload works with drag-and-drop and click-to-browse
- [ ] Upload shows progress and preview
- [ ] Submission form validates and creates new artwork

### Design

- [ ] Void Canvas color palette is applied consistently
- [ ] Playfair Display used for display/heading text
- [ ] DM Sans used for body text
- [ ] JetBrains Mono used for technical/metadata text
- [ ] Grain overlay visible on backgrounds
- [ ] Framer Motion animations are smooth and orchestrated
- [ ] Page transitions feel “glacial” — slow, deliberate, elegant
- [ ] Mobile layout works on 375px width
- [ ] No horizontal overflow on any page

### Accessibility

- [ ] Skip links present and functional
- [ ] All images have alt text
- [ ] Focus indicators visible (amber ring)
- [ ] Keyboard navigation works throughout
- [ ] Touch targets ≥ 44px
- [ ] `prefers-reduced-motion` respected
- [ ] Screen reader can navigate meaningfully

-----

## 18. CRITICAL REMINDERS

1. **This is a single Claude Code session.** You must produce ALL files. Do not leave placeholders, TODOs, or “implement later” comments. Every file must be complete and functional.
1. **The 12 generative pieces are the soul of this project.** Do not shortcut them. Each must be a unique, algorithmically sophisticated, visually beautiful p5.js sketch. They should demonstrate genuine mastery of generative art techniques. If you cut corners here, the entire project fails.
1. **p5.js MUST run in instance mode.** Never use global mode. Every sketch function receives a `p` instance. This prevents collisions when multiple canvases exist on the same page (thumbnails, playground).
1. **Streaming for the docent.** The AI docent must use streaming responses. The UX of watching the docent “speak” token-by-token is essential to the museum guide experience.
1. **The ambient glow effect.** This single detail — artwork pages that glow with the dominant color of the displayed piece — is what elevates Aether from a gallery template to an experience. Do not skip it.
1. **No placeholder images from external URLs.** All thumbnails for permanent collection pieces must be generated by the seed script using sharp. Community mock data also uses generated gradient images.
1. **Type safety.** TypeScript strict mode. No `any` types except where interfacing with p5.js (which has imperfect types). Use Drizzle’s inferred types for database operations.
1. **Test the startup sequence mentally.** Fresh clone → install → seed → dev. If any step would fail, fix it now.

-----

## 19. ONE LAST THING

Make it beautiful. Not “clean.” Not “modern.” Beautiful. The kind of beautiful that makes someone pause, take a breath, and look more closely. Every generative algorithm should reward attention. Every animation should feel inevitable. Every page should feel like a room in a museum that someone spent years designing.

You are not building a web app. You are building a place.

Now build Aether.
