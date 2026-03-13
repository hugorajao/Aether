import type p5 from 'p5';
import type { GenerativePiece } from './types';

const harmonicLattice: GenerativePiece = {
  id: 'harmonic-lattice',
  title: 'Harmonic Lattice',
  artistStatement:
    'Simple harmonic motion, repeated forty thousand times across a lattice of points, reveals interference patterns of startling complexity. Phase differences between neighbors create standing waves, moiré ghosts, and rippling symmetries that appear and dissolve like thoughts half-formed. The lattice breathes — an instrument playing itself.',
  algorithm: 'Sinusoidal grid interference with phase-offset oscillation and neighbor connections',
  year: 2024,
  defaultSeed: 137,
  parameters: [
    { key: 'gridDensity', label: 'Grid Density', min: 20, max: 200, step: 5, default: 80, description: 'Number of points per row/column' },
    { key: 'waveFrequency', label: 'Wave Frequency', min: 0.01, max: 0.1, step: 0.005, default: 0.04, description: 'Oscillation frequency of each point' },
    { key: 'amplitude', label: 'Amplitude', min: 5, max: 50, step: 1, default: 20, description: 'Maximum displacement of each point' },
    { key: 'phaseDrift', label: 'Phase Drift', min: 0.001, max: 0.05, step: 0.001, default: 0.015, description: 'How quickly interference patterns evolve' },
    { key: 'connectionThreshold', label: 'Connection Threshold', min: 10, max: 80, step: 5, default: 40, description: 'Maximum distance for drawing connecting lines' },
    { key: 'damping', label: 'Damping', min: 0.9, max: 1.0, step: 0.01, default: 0.98, description: 'Wave energy preservation per frame' },
  ],
  dominantColor: '#FFFFFF',
  colorPalette: ['#FFFFFF', '#E0E0E0', '#808080', '#404040', '#09090B'],
  tags: ['interference', 'wave', 'grid', 'mathematical'],

  sketch(p: p5, params: Record<string, number>, seed: number): void {
    let cols: number;
    let rows: number;
    let spacingX: number;
    let spacingY: number;
    let basePhases: number[];

    function computeGrid(): void {
      const density = Math.floor(params.gridDensity ?? 80);
      const aspect = p.width / p.height;
      if (aspect >= 1) {
        cols = density;
        rows = Math.floor(density / aspect);
      } else {
        rows = density;
        cols = Math.floor(density * aspect);
      }
      cols = Math.max(cols, 4);
      rows = Math.max(rows, 4);
      spacingX = p.width / (cols - 1);
      spacingY = p.height / (rows - 1);
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.randomSeed(seed);
      p.noiseSeed(seed);
      p.colorMode(p.RGB, 255);

      computeGrid();

      // Pre-compute base phase offsets for each grid point using seeded random
      basePhases = [];
      for (let i = 0; i < cols * rows; i++) {
        basePhases.push(p.random(p.TWO_PI));
      }
    };

    p.draw = () => {
      p.background(9, 9, 11);

      const freq = params.waveFrequency ?? 0.04;
      const amp = params.amplitude ?? 20;
      const drift = params.phaseDrift ?? 0.015;
      const threshold = params.connectionThreshold ?? 40;
      const damping = params.damping ?? 0.98;
      const time = p.frameCount * drift;

      // Compute displaced positions
      const positions: Array<{ x: number; y: number; dx: number; dy: number }> = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const baseX = col * spacingX;
          const baseY = row * spacingY;

          // Multiple wave sources create interference
          const phase = basePhases[idx % basePhases.length];
          const distFromCenter = Math.sqrt(
            Math.pow((col - cols / 2) / cols, 2) +
            Math.pow((row - rows / 2) / rows, 2)
          );

          // Radial wave + diagonal wave + spiral wave
          const wave1 = Math.sin(distFromCenter * cols * freq * 2 + time * 3 + phase);
          const wave2 = Math.sin((col + row) * freq * 10 + time * 2.3);
          const wave3 = Math.sin(
            Math.atan2(row - rows / 2, col - cols / 2) * 3 +
            distFromCenter * 20 * freq +
            time * 1.7
          );

          const combined = (wave1 + wave2 * 0.7 + wave3 * 0.5) / 2.2;
          const dampedAmp = amp * Math.pow(damping, distFromCenter * 10);

          const dx = combined * dampedAmp * Math.cos(time + phase);
          const dy = combined * dampedAmp * Math.sin(time * 0.7 + phase);

          positions.push({
            x: baseX + dx,
            y: baseY + dy,
            dx,
            dy,
          });
        }
      }

      // Draw connections between neighbors
      p.strokeWeight(0.5);
      const threshSq = threshold * threshold;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const pt = positions[idx];

          // Check right and bottom neighbors only (avoids double-drawing)
          const neighbors = [
            col < cols - 1 ? idx + 1 : -1,
            row < rows - 1 ? idx + cols : -1,
          ];

          for (const nIdx of neighbors) {
            if (nIdx < 0) continue;
            const nb = positions[nIdx];
            const ddx = pt.x - nb.x;
            const ddy = pt.y - nb.y;
            const dSq = ddx * ddx + ddy * ddy;

            if (dSq < threshSq) {
              // Opacity based on relative displacement difference
              const displacement = Math.sqrt(
                Math.pow(pt.dx - nb.dx, 2) + Math.pow(pt.dy - nb.dy, 2)
              );
              const normalizedDisp = Math.min(displacement / amp, 1);
              const alpha = (1 - Math.sqrt(dSq / threshSq)) * 200;
              const brightness = 100 + normalizedDisp * 155;

              p.stroke(brightness, brightness, brightness, alpha);
              p.line(pt.x, pt.y, nb.x, nb.y);
            }
          }
        }
      }

      // Draw points
      p.noStroke();
      for (let i = 0; i < positions.length; i++) {
        const pt = positions[i];
        const displacement = Math.sqrt(pt.dx * pt.dx + pt.dy * pt.dy);
        const normalizedDisp = Math.min(displacement / amp, 1);
        const brightness = 120 + normalizedDisp * 135;
        const size = 1.5 + normalizedDisp * 2;

        p.fill(brightness, brightness, brightness, 180 + normalizedDisp * 75);
        p.ellipse(pt.x, pt.y, size, size);
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      computeGrid();
      basePhases = [];
      p.randomSeed(seed);
      for (let i = 0; i < cols * rows; i++) {
        basePhases.push(p.random(p.TWO_PI));
      }
    };
  },
};

export default harmonicLattice;
