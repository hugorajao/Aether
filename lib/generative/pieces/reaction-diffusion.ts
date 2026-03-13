import type p5 from 'p5';
import type { GenerativePiece } from './types';

const reactionDiffusion: GenerativePiece = {
  id: 'reaction-diffusion',
  title: 'Reaction-Diffusion',
  artistStatement:
    'Alan Turing proposed that the spots on a leopard and the stripes on a zebrafish arise from the same mathematics. This simulation proves him right — two simple chemicals, interacting, produce the full vocabulary of biological pattern.',
  algorithm: 'Gray-Scott reaction-diffusion model with Laplacian convolution on a discrete grid',
  year: 2024,
  defaultSeed: 1010,
  parameters: [
    { key: 'feedRate', label: 'Feed Rate', min: 0.01, max: 0.08, step: 0.002, default: 0.037, description: 'Rate at which chemical A is replenished (controls pattern type)' },
    { key: 'killRate', label: 'Kill Rate', min: 0.04, max: 0.08, step: 0.002, default: 0.06, description: 'Rate at which chemical B is removed (controls pattern type)' },
    { key: 'diffusionA', label: 'Diffusion A', min: 0.8, max: 1.2, step: 0.05, default: 1.0, description: 'Diffusion rate of chemical A' },
    { key: 'diffusionB', label: 'Diffusion B', min: 0.3, max: 0.6, step: 0.05, default: 0.5, description: 'Diffusion rate of chemical B' },
    { key: 'stepsPerFrame', label: 'Steps Per Frame', min: 2, max: 15, step: 1, default: 8, description: 'Simulation iterations per rendered frame (speed vs performance)' },
    { key: 'colorMapping', label: 'Color Mapping', min: 0.5, max: 3.0, step: 0.1, default: 1.5, description: 'Contrast/gamma of the color mapping curve' },
  ],
  dominantColor: '#8B2252',
  colorPalette: ['#1A0A2E', '#4A1942', '#8B2252', '#FF69B4', '#FFFFFF'],
  tags: ['reaction-diffusion', 'Gray-Scott', 'Turing', 'biological'],

  sketch(p: p5, params: Record<string, number>, seed: number): void {
    const GRID = 200;
    let gridA: Float32Array;
    let gridB: Float32Array;
    let nextA: Float32Array;
    let nextB: Float32Array;
    let img: p5.Image;

    // Palette RGB
    const palette = [
      [26, 10, 46],   // #1A0A2E
      [74, 25, 66],   // #4A1942
      [139, 34, 82],  // #8B2252
      [255, 105, 180],// #FF69B4
      [255, 255, 255],// #FFFFFF
    ];

    function idx(x: number, y: number): number {
      return y * GRID + x;
    }

    function initGrid(): void {
      gridA = new Float32Array(GRID * GRID);
      gridB = new Float32Array(GRID * GRID);
      nextA = new Float32Array(GRID * GRID);
      nextB = new Float32Array(GRID * GRID);

      // Fill with A=1, B=0
      gridA.fill(1);
      gridB.fill(0);

      // Seed random patches of B using the p5 seeded random
      const numSeeds = 12 + Math.floor(p.random(8));
      for (let s = 0; s < numSeeds; s++) {
        const cx = Math.floor(p.random(20, GRID - 20));
        const cy = Math.floor(p.random(20, GRID - 20));
        const radius = Math.floor(p.random(3, 8));
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (dx * dx + dy * dy <= radius * radius) {
              const nx = (cx + dx + GRID) % GRID;
              const ny = (cy + dy + GRID) % GRID;
              gridB[idx(nx, ny)] = 1;
              gridA[idx(nx, ny)] = 0;
            }
          }
        }
      }
    }

    function simulate(): void {
      const f = params.feedRate ?? 0.037;
      const k = params.killRate ?? 0.06;
      const dA = params.diffusionA ?? 1.0;
      const dB = params.diffusionB ?? 0.5;

      for (let y = 0; y < GRID; y++) {
        const ym1 = (y - 1 + GRID) % GRID;
        const yp1 = (y + 1) % GRID;

        for (let x = 0; x < GRID; x++) {
          const xm1 = (x - 1 + GRID) % GRID;
          const xp1 = (x + 1) % GRID;

          const i = idx(x, y);
          const a = gridA[i];
          const b = gridB[i];

          // Laplacian using 3x3 kernel: center=-1, adjacent=0.2, diagonal=0.05
          const lapA =
            gridA[idx(xm1, y)] * 0.2 +
            gridA[idx(xp1, y)] * 0.2 +
            gridA[idx(x, ym1)] * 0.2 +
            gridA[idx(x, yp1)] * 0.2 +
            gridA[idx(xm1, ym1)] * 0.05 +
            gridA[idx(xp1, ym1)] * 0.05 +
            gridA[idx(xm1, yp1)] * 0.05 +
            gridA[idx(xp1, yp1)] * 0.05 +
            a * -1;

          const lapB =
            gridB[idx(xm1, y)] * 0.2 +
            gridB[idx(xp1, y)] * 0.2 +
            gridB[idx(x, ym1)] * 0.2 +
            gridB[idx(x, yp1)] * 0.2 +
            gridB[idx(xm1, ym1)] * 0.05 +
            gridB[idx(xp1, ym1)] * 0.05 +
            gridB[idx(xm1, yp1)] * 0.05 +
            gridB[idx(xp1, yp1)] * 0.05 +
            b * -1;

          const abb = a * b * b;
          nextA[i] = a + (dA * lapA - abb + f * (1 - a));
          nextB[i] = b + (dB * lapB + abb - (k + f) * b);

          // Clamp
          if (nextA[i] < 0) nextA[i] = 0;
          if (nextA[i] > 1) nextA[i] = 1;
          if (nextB[i] < 0) nextB[i] = 0;
          if (nextB[i] > 1) nextB[i] = 1;
        }
      }

      // Swap buffers
      const tmpA = gridA;
      const tmpB = gridB;
      gridA = nextA;
      gridB = nextB;
      nextA = tmpA;
      nextB = tmpB;
    }

    function renderToImage(): void {
      const gamma = params.colorMapping ?? 1.5;
      img.loadPixels();
      const d = img.pixels;

      for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
          const i = idx(x, y);
          // Map: high B → bright, low B → dark
          let val = gridB[i];
          // Apply gamma for contrast
          val = Math.pow(val, 1 / gamma);

          // Map to palette
          const palIdx = val * (palette.length - 1);
          const ci0 = Math.floor(palIdx);
          const ci1 = Math.min(ci0 + 1, palette.length - 1);
          const t = palIdx - ci0;

          const r = palette[ci0][0] + (palette[ci1][0] - palette[ci0][0]) * t;
          const g = palette[ci0][1] + (palette[ci1][1] - palette[ci0][1]) * t;
          const b = palette[ci0][2] + (palette[ci1][2] - palette[ci0][2]) * t;

          const pi = (y * GRID + x) * 4;
          d[pi] = r;
          d[pi + 1] = g;
          d[pi + 2] = b;
          d[pi + 3] = 255;
        }
      }
      img.updatePixels();
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.randomSeed(seed);
      p.noiseSeed(seed);
      p.colorMode(p.RGB, 255);
      p.background(26, 10, 46);

      img = p.createImage(GRID, GRID);
      initGrid();
    };

    p.draw = () => {
      const steps = Math.floor(params.stepsPerFrame ?? 8);
      for (let s = 0; s < steps; s++) {
        simulate();
      }

      renderToImage();

      // Draw the image scaled to fill the canvas, maintaining aspect ratio
      p.background(26, 10, 46);
      const scale = Math.min(p.width / GRID, p.height / GRID);
      const w = GRID * scale;
      const h = GRID * scale;
      const ox = (p.width - w) / 2;
      const oy = (p.height - h) / 2;

      // Disable smoothing for crispy pixels, then re-enable
      p.noSmooth();
      p.image(img, ox, oy, w, h);
      p.smooth();
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  },
};

export default reactionDiffusion;
