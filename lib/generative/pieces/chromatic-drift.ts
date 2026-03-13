import type p5 from 'p5';
import type { GenerativePiece } from './types';

const chromaticDrift: GenerativePiece = {
  id: 'chromatic-drift',
  title: 'Chromatic Drift',
  artistStatement:
    'Every point in space belongs to its nearest neighbor — this is the Voronoi principle, a partitioning as fundamental as gravity. Here, the neighbors drift under noise currents, and the territories shift in response. Color bleeds across boundaries as cells merge, split, and reform. The result is a living stained-glass window whose pattern never repeats.',
  algorithm: 'Animated Voronoi tessellation with Lloyd relaxation and noise-driven drift',
  year: 2024,
  defaultSeed: 256,
  parameters: [
    { key: 'siteCount', label: 'Site Count', min: 50, max: 500, step: 25, default: 200, description: 'Number of Voronoi cell sites' },
    { key: 'relaxationIterations', label: 'Relaxation', min: 0, max: 5, step: 1, default: 2, description: 'Lloyd relaxation passes per initialization' },
    { key: 'driftSpeed', label: 'Drift Speed', min: 0.1, max: 2.0, step: 0.1, default: 0.8, description: 'Speed of noise-driven site movement' },
    { key: 'hueRotation', label: 'Hue Rotation', min: 0.1, max: 3.0, step: 0.1, default: 1.0, description: 'Speed of color cycling across cells' },
    { key: 'borderGlow', label: 'Border Glow', min: 0.0, max: 1.0, step: 0.1, default: 0.6, description: 'Intensity of glowing cell boundaries' },
    { key: 'cellOpacity', label: 'Cell Opacity', min: 0.3, max: 1.0, step: 0.05, default: 0.85, description: 'Opacity of cell fill colors' },
  ],
  dominantColor: '#FF8800',
  colorPalette: ['#FF0000', '#FF8800', '#FFFF00', '#00FF88', '#0088FF'],
  tags: ['voronoi', 'tessellation', 'color', 'drift'],

  sketch(p: p5, params: Record<string, number>, seed: number): void {
    interface Site {
      x: number;
      y: number;
      hue: number;
      noiseOffX: number;
      noiseOffY: number;
    }

    let sites: Site[];
    let buffer: p5.Graphics;
    const CELL_RES = 4; // Render at 1/4 resolution for performance

    function initSites(): void {
      const count = Math.floor(params.siteCount ?? 200);
      sites = [];
      for (let i = 0; i < count; i++) {
        sites.push({
          x: p.random(p.width),
          y: p.random(p.height),
          hue: p.random(360),
          noiseOffX: p.random(1000),
          noiseOffY: p.random(1000),
        });
      }

      // Lloyd relaxation
      const iterations = Math.floor(params.relaxationIterations ?? 2);
      for (let iter = 0; iter < iterations; iter++) {
        lloydRelax();
      }
    }

    function lloydRelax(): void {
      const bw = Math.ceil(p.width / CELL_RES);
      const bh = Math.ceil(p.height / CELL_RES);
      const sumX: number[] = new Array(sites.length).fill(0);
      const sumY: number[] = new Array(sites.length).fill(0);
      const count: number[] = new Array(sites.length).fill(0);

      // Sample a subset of points for relaxation
      const step = 8;
      for (let by = 0; by < bh; by += step) {
        for (let bx = 0; bx < bw; bx += step) {
          const px = bx * CELL_RES;
          const py = by * CELL_RES;
          let minDist = Infinity;
          let closest = 0;
          for (let s = 0; s < sites.length; s++) {
            const dx = px - sites[s].x;
            const dy = py - sites[s].y;
            const d = dx * dx + dy * dy;
            if (d < minDist) {
              minDist = d;
              closest = s;
            }
          }
          sumX[closest] += px;
          sumY[closest] += py;
          count[closest]++;
        }
      }

      for (let s = 0; s < sites.length; s++) {
        if (count[s] > 0) {
          sites[s].x = p.lerp(sites[s].x, sumX[s] / count[s], 0.5);
          sites[s].y = p.lerp(sites[s].y, sumY[s] / count[s], 0.5);
        }
      }
    }

    function initBuffer(): void {
      if (buffer) buffer.remove();
      buffer = p.createGraphics(
        Math.ceil(p.width / CELL_RES),
        Math.ceil(p.height / CELL_RES)
      );
      buffer.colorMode(p.HSB, 360, 100, 100, 255);
      buffer.noSmooth();
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.randomSeed(seed);
      p.noiseSeed(seed);
      p.colorMode(p.HSB, 360, 100, 100, 255);
      p.noSmooth();

      initBuffer();
      initSites();
    };

    p.draw = () => {
      const driftSpeed = params.driftSpeed ?? 0.8;
      const hueRot = params.hueRotation ?? 1.0;
      const borderGlow = params.borderGlow ?? 0.6;
      const cellOpacity = params.cellOpacity ?? 0.85;
      const time = p.frameCount * 0.01;

      // Update site positions with noise drift
      for (let i = 0; i < sites.length; i++) {
        const s = sites[i];
        const angle = p.noise(s.noiseOffX + time * 0.3, s.noiseOffY + time * 0.3) * p.TWO_PI * 2;
        s.x += Math.cos(angle) * driftSpeed;
        s.y += Math.sin(angle) * driftSpeed;

        // Wrap around edges with margin
        if (s.x < -20) s.x = p.width + 20;
        if (s.x > p.width + 20) s.x = -20;
        if (s.y < -20) s.y = p.height + 20;
        if (s.y > p.height + 20) s.y = -20;

        // Evolve hue
        s.hue = (s.hue + hueRot * 0.2) % 360;
      }

      // Render Voronoi at reduced resolution
      const bw = buffer.width;
      const bh = buffer.height;

      buffer.loadPixels();
      const d = buffer.pixelDensity();
      const bufW = bw * d;
      const bufH = bh * d;
      const pixels = buffer.pixels;

      for (let by = 0; by < bufH; by++) {
        for (let bx = 0; bx < bufW; bx++) {
          const px = (bx / d) * CELL_RES;
          const py = (by / d) * CELL_RES;

          let minDist = Infinity;
          let secondDist = Infinity;
          let closest = 0;

          for (let s = 0; s < sites.length; s++) {
            const dx = px - sites[s].x;
            const dy = py - sites[s].y;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) {
              secondDist = minDist;
              minDist = dist;
              closest = s;
            } else if (dist < secondDist) {
              secondDist = dist;
            }
          }

          const site = sites[closest];
          const distToEdge = Math.sqrt(secondDist) - Math.sqrt(minDist);
          const edgeFactor = Math.max(0, 1 - distToEdge / 8);

          // Cell color: hue from site, saturation and brightness from distance
          const hue = (site.hue + Math.sqrt(minDist) * 0.05 + time * hueRot * 10) % 360;
          const sat = 70 + edgeFactor * 20;
          const bri = edgeFactor > 0.5 && borderGlow > 0
            ? p.lerp(60 + 20 * (1 - Math.sqrt(minDist) / 200), 100, (edgeFactor - 0.5) * 2 * borderGlow)
            : 60 + 20 * (1 - Math.min(Math.sqrt(minDist) / 200, 1));
          const alpha = Math.floor(cellOpacity * 255);

          // Convert HSB to RGB for pixel manipulation
          const c = p.color(hue, sat, bri, alpha);
          const idx = (by * bufW + bx) * 4;
          pixels[idx] = p.red(c);
          pixels[idx + 1] = p.green(c);
          pixels[idx + 2] = p.blue(c);
          pixels[idx + 3] = alpha;
        }
      }

      buffer.updatePixels();

      // Draw scaled buffer to main canvas
      p.background(0);
      p.image(buffer, 0, 0, p.width, p.height);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      initBuffer();
      p.randomSeed(seed);
      p.noiseSeed(seed);
      initSites();
    };
  },
};

export default chromaticDrift;
