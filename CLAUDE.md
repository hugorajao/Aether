# CLAUDE.md — Aether Project Instructions

Read `aether-claude-code-prompt.md` for the full project specification before beginning any work. That document is the source of truth for architecture, design, and implementation details. This file contains the persistent rules you must follow in every session.

## What This Is

Aether is a production-grade AI art gallery built with Next.js 14. It houses 12 algorithmically generated p5.js artworks, accepts community-uploaded AI art, and features a streaming AI docent powered by the Anthropic API. The design system is called **Void Canvas** — dark, reverent, museum-grade.

## Non-Negotiable Stack Decisions

- **Next.js 14** with App Router (`app/` directory)
- **TypeScript** in strict mode — no `any` except p5.js escape hatches
- **Tailwind CSS** with custom Void Canvas tokens defined in `tailwind.config.ts`
- **shadcn/ui** for base components, themed to Void Canvas
- **Framer Motion** for all animation (the “Glacial” motion system)
- **p5.js in instance mode only** — `new p5(sketch, container)`, never global mode
- **Zustand** for state (single store, slices pattern)
- **Drizzle ORM + SQLite** via better-sqlite3 — NOT Prisma
- **sharp** for image processing (thumbnails, color extraction, EXIF stripping)
- **Anthropic SDK** for the AI docent (claude-sonnet-4-20250514, streaming)

Do NOT introduce: Prisma, NextAuth, Redux, React Query, Firebase, Supabase, Docker, or any external image hosting.

## Design System Quick Reference

**Fonts** (via `next/font/google`):

- Display/headings: Playfair Display
- Body/UI: DM Sans
- Mono/metadata: JetBrains Mono

**Colors** — dark-first palette:

- Surfaces: `void-950` (#09090B) through `void-600` (#3F3F49)
- Text: `ivory-50` (#FAFAF9) through `ivory-400` (#A8A89C)
- Accent: `amber` (#D4A054) — used sparingly for highlights, focus rings, active states

**Motion** — all animations use the “Glacial” system: slow, deliberate, ease `[0.22, 1, 0.36, 1]`. Respect `prefers-reduced-motion` everywhere.

**Atmosphere effects**: CSS grain overlay (opacity 0.03), ambient glow behind artworks (dominant color extraction), vignette in immersive mode, backdrop-blur on navigation.

## Architecture Rules

- All generative pieces live in `lib/generative/pieces/[name].ts` and export a `GenerativePiece` interface
- `lib/generative/pieces/index.ts` is the registry — it exports all pieces by ID
- Database schema is in `db/schema.ts`, connection in `db/index.ts`
- API routes go in `app/api/` — RESTful, streaming for docent
- Components are organized: `components/layout/`, `components/gallery/`, `components/generative/`, `components/docent/`, `components/submit/`, `components/shared/`, `components/ui/` (shadcn)
- All custom components use `forwardRef` and accept `className`
- Every page has a loading skeleton via Suspense boundaries

## p5.js — Critical Rules

1. **Always instance mode.** Every sketch is a function that receives `p` and calls `p.createCanvas()`, `p.background()`, etc.
1. **Always use seeded randomness.** Call `p.randomSeed(seed)` and `p.noiseSeed(seed)` in setup.
1. **Always clean up on unmount.** Call `p.remove()` when the React component unmounts.
1. **Dynamic imports.** Each piece’s sketch code is loaded via `next/dynamic` — don’t bundle all 12 into a single chunk.
1. **Performance target:** 30+ fps on M1 MacBook Air. Use `requestAnimationFrame`, throttle parameter updates.

## The 12 Permanent Pieces

1. Erosion Memory — flow field particle system
1. Harmonic Lattice — sinusoidal grid interference
1. Chromatic Drift — animated Voronoi tessellation
1. Mycelial Network — space colonization branching
1. Frequency Domain — radial FFT visualization
1. Accretion — diffusion-limited aggregation
1. Sine Cartography — topographic contour lines
1. Swarm Intelligence — boids flocking
1. Penrose Tiling — aperiodic P3 subdivision
1. Reaction-Diffusion — Gray-Scott model
1. Strange Attractor — Lorenz system projection
1. Recursive Breath — animated recursive tree with wind

Each must be algorithmically complete, visually distinct, and genuinely beautiful. No placeholders.

## Accessibility — Always

- Semantic HTML: `<main>`, `<nav>`, `<article>`, `<figure>`, `<figcaption>`
- Skip links on every page
- Focus visible rings in amber
- 44px minimum touch targets
- ARIA live regions for streaming content and dynamic updates
- `prefers-reduced-motion` disables parallax, replaces animations, pauses canvases
- All images have descriptive alt text
- Focus trapping in modals and immersive mode

## Startup Sequence

```bash
npm install
cp .env.example .env        # Add ANTHROPIC_API_KEY
npx tsx scripts/seed.ts      # Creates DB, seeds data, generates thumbnails
npm run dev                  # localhost:3000
```

The seed script must be idempotent. Running it twice should not create duplicates.

## When Editing Existing Code

- Run `npm run build` after significant changes to catch type errors
- Don’t modify shadcn/ui component internals — override via className or CSS variables
- Keep the Zustand store in a single file with slices — don’t split into multiple stores
- If adding a new generative piece: create the file in `lib/generative/pieces/`, register it in `index.ts`, add a DB entry in the seed script

## Quality Bar

No TODOs, no placeholders, no “implement later” comments. Every file ships complete. The generative artworks should reward close attention. The animations should feel inevitable. The gallery should feel like a place.
