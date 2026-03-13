import type p5 from 'p5';
import type { GenerativePiece } from './types';

const accretion: GenerativePiece = {
  id: 'accretion',
  title: 'Accretion',
  artistStatement:
    'Growth without intention. Structure without blueprint. A single seed sits at the center, and random walkers stumble in from the void. When they touch the growing structure, they freeze in place — and the structure reaches a little further into the darkness. From this simplest of rules, coral-like fractals emerge: branching, reaching, beautiful in their purposelessness.',
  algorithm: 'Diffusion-limited aggregation with grid-based collision, optional symmetry, and depth-based coloring',
  year: 2024,
  defaultSeed: 1618,
  parameters: [
    { key: 'walkersPerFrame', label: 'Walkers Per Frame', min: 1, max: 20, step: 1, default: 10, description: 'Number of random walkers simulated each frame' },
    { key: 'stickingProbability', label: 'Sticking Probability', min: 0.3, max: 1.0, step: 0.05, default: 0.7, description: 'Chance a walker sticks when it touches the structure' },
    { key: 'launchRadius', label: 'Launch Radius', min: 1.0, max: 2.0, step: 0.1, default: 1.3, description: 'Launch distance as multiplier of current structure radius' },
    { key: 'colorGradient', label: 'Color Gradient', min: 0.0, max: 1.0, step: 0.05, default: 0.5, description: 'Blend between depth-based and radial-based coloring' },
    { key: 'particleSize', label: 'Particle Size', min: 1, max: 4, step: 1, default: 2, description: 'Size of each deposited particle' },
    { key: 'symmetry', label: 'Symmetry', min: 1, max: 8, step: 1, default: 1, description: 'Rotational symmetry order (1 = none)' },
  ],
  dominantColor: '#C4A04A',
  colorPalette: ['#2A2A2A', '#4A4A4A', '#8A8A6A', '#C4A04A', '#E8C078'],
  tags: ['DLA', 'aggregation', 'fractal', 'growth'],

  sketch(p: p5, params: Record<string, number>, seed: number): void {
    const palette = [
      [42, 42, 42],
      [74, 74, 74],
      [138, 138, 106],
      [196, 160, 74],
      [232, 192, 120],
    ];

    // Grid for fast collision detection
    let grid: Uint8Array;
    let depthGrid: Float32Array;
    let gridW: number;
    let gridH: number;
    let pSize: number;

    let structureRadius: number;
    let maxRadius: number;
    let totalDeposited: number;
    let maxDeposited: number;
    let growthComplete: boolean;

    let frameBuffer: p5.Graphics;

    function cellIdx(gx: number, gy: number): number {
      return gy * gridW + gx;
    }

    function isOccupied(gx: number, gy: number): boolean {
      if (gx < 0 || gx >= gridW || gy < 0 || gy >= gridH) return false;
      return grid[cellIdx(gx, gy)] === 1;
    }

    function hasNeighbor(gx: number, gy: number): boolean {
      return (
        isOccupied(gx - 1, gy) ||
        isOccupied(gx + 1, gy) ||
        isOccupied(gx, gy - 1) ||
        isOccupied(gx, gy + 1) ||
        isOccupied(gx - 1, gy - 1) ||
        isOccupied(gx + 1, gy - 1) ||
        isOccupied(gx - 1, gy + 1) ||
        isOccupied(gx + 1, gy + 1)
      );
    }

    function deposit(gx: number, gy: number, depth: number): void {
      const sym = Math.floor(params.symmetry ?? 1);
      const cx = gridW / 2;
      const cy = gridH / 2;

      for (let s = 0; s < sym; s++) {
        const angle = (s / sym) * p.TWO_PI;
        const dx = gx - cx;
        const dy = gy - cy;
        const rx = Math.round(dx * Math.cos(angle) - dy * Math.sin(angle) + cx);
        const ry = Math.round(dx * Math.sin(angle) + dy * Math.cos(angle) + cy);

        if (rx >= 0 && rx < gridW && ry >= 0 && ry < gridH) {
          const idx = cellIdx(rx, ry);
          if (grid[idx] === 0) {
            grid[idx] = 1;
            depthGrid[idx] = depth;
            totalDeposited++;

            // Draw to buffer
            const t = Math.min(depth / 500, 1);
            const colorGrad = params.colorGradient ?? 0.5;

            // Mix depth-based and radial-based coloring
            const radialT = Math.sqrt((rx - cx) ** 2 + (ry - cy) ** 2) / maxRadius;
            const blendedT = t * colorGrad + radialT * (1 - colorGrad);
            const ci = blendedT * (palette.length - 1);
            const ci0 = Math.floor(ci);
            const ci1 = Math.min(ci0 + 1, palette.length - 1);
            const cf = ci - ci0;

            const r = palette[ci0][0] + (palette[ci1][0] - palette[ci0][0]) * cf;
            const g = palette[ci0][1] + (palette[ci1][1] - palette[ci0][1]) * cf;
            const b = palette[ci0][2] + (palette[ci1][2] - palette[ci0][2]) * cf;

            frameBuffer.noStroke();
            frameBuffer.fill(r, g, b, 200 + blendedT * 55);
            frameBuffer.rect(rx * pSize, ry * pSize, pSize, pSize);
          }
        }
      }

      // Update structure radius
      const dx = gx - gridW / 2;
      const dy = gy - gridH / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > structureRadius) {
        structureRadius = dist;
      }
    }

    function initDLA(): void {
      pSize = Math.floor(params.particleSize ?? 2);
      gridW = Math.ceil(p.width / pSize);
      gridH = Math.ceil(p.height / pSize);
      grid = new Uint8Array(gridW * gridH);
      depthGrid = new Float32Array(gridW * gridH);

      maxRadius = Math.min(gridW, gridH) * 0.45;
      structureRadius = 2;
      totalDeposited = 0;
      maxDeposited = Math.floor(gridW * gridH * 0.08); // Cap at 8% fill
      growthComplete = false;

      if (frameBuffer) frameBuffer.remove();
      frameBuffer = p.createGraphics(p.width, p.height);
      frameBuffer.colorMode(p.RGB, 255);
      frameBuffer.background(20, 20, 20);

      // Seed particle at center
      const cx = Math.floor(gridW / 2);
      const cy = Math.floor(gridH / 2);
      deposit(cx, cy, 0);
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.randomSeed(seed);
      p.noiseSeed(seed);
      p.colorMode(p.RGB, 255);

      initDLA();
    };

    p.draw = () => {
      if (growthComplete) {
        p.image(frameBuffer, 0, 0);

        // Subtle pulsing glow on the structure
        const pulse = (Math.sin(p.frameCount * 0.03) + 1) * 2;
        p.fill(196, 160, 74, pulse);
        p.noStroke();
        p.ellipse(p.width / 2, p.height / 2, structureRadius * pSize * 1.5, structureRadius * pSize * 1.5);
        return;
      }

      const walkersPerFrame = Math.floor(params.walkersPerFrame ?? 10);
      const stickProb = params.stickingProbability ?? 0.7;
      const launchMult = params.launchRadius ?? 1.3;
      const cx = Math.floor(gridW / 2);
      const cy = Math.floor(gridH / 2);

      // Run multiple walkers per frame
      for (let w = 0; w < walkersPerFrame; w++) {
        if (totalDeposited >= maxDeposited || structureRadius >= maxRadius) {
          growthComplete = true;
          break;
        }

        // Launch walker from circle around structure
        const launchR = structureRadius * launchMult + 5;
        const angle = p.random(p.TWO_PI);
        let wx = Math.round(cx + Math.cos(angle) * launchR);
        let wy = Math.round(cy + Math.sin(angle) * launchR);

        // Walk until stick or abandon
        const maxSteps = Math.floor(maxRadius * 6);
        for (let step = 0; step < maxSteps; step++) {
          // Random walk
          const dir = Math.floor(p.random(4));
          if (dir === 0) wx++;
          else if (dir === 1) wx--;
          else if (dir === 2) wy++;
          else wy--;

          // Abandon if too far
          const distFromCenter = Math.sqrt((wx - cx) ** 2 + (wy - cy) ** 2);
          if (distFromCenter > structureRadius * 2.5 + 20) break;

          // Check bounds
          if (wx < 1 || wx >= gridW - 1 || wy < 1 || wy >= gridH - 1) break;

          // Check for neighbor
          if (hasNeighbor(wx, wy) && !isOccupied(wx, wy)) {
            if (p.random() < stickProb) {
              deposit(wx, wy, totalDeposited);
              break;
            }
          }
        }
      }

      p.image(frameBuffer, 0, 0);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      p.randomSeed(seed);
      p.noiseSeed(seed);
      initDLA();
    };
  },
};

export default accretion;
