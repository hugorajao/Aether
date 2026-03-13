import type p5 from 'p5';
import type { GenerativePiece } from './types';

const swarmIntelligence: GenerativePiece = {
  id: 'swarm-intelligence',
  title: 'Swarm Intelligence',
  artistStatement:
    'No bird knows the shape of the flock. No fish knows the school\'s direction. Intelligence emerges from the space between individuals — a democracy of instinct.',
  algorithm: 'Boids flocking with spatial hashing, separation/alignment/cohesion/attraction rules, and fading trail buffer',
  year: 2024,
  defaultSeed: 808,
  parameters: [
    { key: 'agentCount', label: 'Agent Count', min: 500, max: 3000, step: 100, default: 2000, description: 'Number of boid agents in the swarm' },
    { key: 'separationRadius', label: 'Separation Radius', min: 10, max: 40, step: 2, default: 20, description: 'Minimum comfortable distance between agents' },
    { key: 'alignmentStrength', label: 'Alignment Strength', min: 0.5, max: 3.0, step: 0.1, default: 1.5, description: 'How strongly agents match neighbors\' heading' },
    { key: 'cohesionStrength', label: 'Cohesion Strength', min: 0.5, max: 3.0, step: 0.1, default: 1.2, description: 'How strongly agents steer toward group center' },
    { key: 'trailLength', label: 'Trail Length', min: 2, max: 20, step: 1, default: 8, description: 'Controls trail persistence via background fade rate' },
    { key: 'maxSpeed', label: 'Max Speed', min: 2, max: 8, step: 0.5, default: 4, description: 'Maximum velocity of each agent' },
    { key: 'perceptionRadius', label: 'Perception Radius', min: 30, max: 100, step: 5, default: 50, description: 'How far each agent can see neighbors' },
  ],
  dominantColor: '#FAFAF9',
  colorPalette: ['#09090B', '#FAFAF9', '#E8C078', '#D4A054'],
  tags: ['boids', 'flocking', 'swarm', 'emergence'],

  sketch(p: p5, params: Record<string, number>, seed: number): void {
    interface Boid {
      x: number;
      y: number;
      vx: number;
      vy: number;
    }

    let boids: Boid[];
    let trailBuffer: p5.Graphics;
    let cellSize: number;

    // Spatial hash grid
    let gridCols: number;
    let gridRows: number;
    let grid: Int32Array; // flat array: each cell stores start index into sortedIndices
    let gridCounts: Int32Array;
    let cellIndices: Int32Array; // which cell each boid belongs to

    function initBoids(): void {
      const count = Math.floor(params.agentCount ?? 2000);
      boids = [];
      for (let i = 0; i < count; i++) {
        const angle = p.random(p.TWO_PI);
        const speed = p.random(1, params.maxSpeed ?? 4);
        boids.push({
          x: p.random(p.width),
          y: p.random(p.height),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        });
      }
    }

    function initGrid(): void {
      cellSize = params.perceptionRadius ?? 50;
      gridCols = Math.ceil(p.width / cellSize) + 1;
      gridRows = Math.ceil(p.height / cellSize) + 1;
      const totalCells = gridCols * gridRows;
      grid = new Int32Array(totalCells);
      gridCounts = new Int32Array(totalCells);
      cellIndices = new Int32Array(boids.length);
    }

    // Rebuild spatial hash each frame
    // Simple counting sort approach
    let sortedBoidIndices: Int32Array;

    function buildSpatialHash(): void {
      const n = boids.length;
      const totalCells = gridCols * gridRows;

      // Reset counts
      for (let i = 0; i < totalCells; i++) gridCounts[i] = 0;

      // Count boids per cell
      for (let i = 0; i < n; i++) {
        const col = Math.max(0, Math.min(gridCols - 1, Math.floor(boids[i].x / cellSize)));
        const row = Math.max(0, Math.min(gridRows - 1, Math.floor(boids[i].y / cellSize)));
        const cell = row * gridCols + col;
        cellIndices[i] = cell;
        gridCounts[cell]++;
      }

      // Prefix sum → offsets
      grid[0] = 0;
      for (let i = 1; i < totalCells; i++) {
        grid[i] = grid[i - 1] + gridCounts[i - 1];
      }

      // Sort boid indices into cells
      if (!sortedBoidIndices || sortedBoidIndices.length < n) {
        sortedBoidIndices = new Int32Array(n);
      }
      // Temp copy of grid offsets to use as write cursors
      const cursors = new Int32Array(totalCells);
      for (let i = 0; i < totalCells; i++) cursors[i] = grid[i];

      for (let i = 0; i < n; i++) {
        const cell = cellIndices[i];
        sortedBoidIndices[cursors[cell]] = i;
        cursors[cell]++;
      }
    }

    function updateBoids(): void {
      const sepRadius = params.separationRadius ?? 20;
      const alignStr = params.alignmentStrength ?? 1.5;
      const cohStr = params.cohesionStrength ?? 1.2;
      const maxSpd = params.maxSpeed ?? 4;
      const percRadius = params.perceptionRadius ?? 50;
      const percRadiusSq = percRadius * percRadius;
      const sepRadiusSq = sepRadius * sepRadius;
      const maxForce = 0.3;

      buildSpatialHash();

      const n = boids.length;

      for (let i = 0; i < n; i++) {
        const b = boids[i];

        let sepX = 0, sepY = 0, sepCount = 0;
        let aliX = 0, aliY = 0, aliCount = 0;
        let cohX = 0, cohY = 0, cohCount = 0;

        // Check surrounding cells
        const col = Math.max(0, Math.min(gridCols - 1, Math.floor(b.x / cellSize)));
        const row = Math.max(0, Math.min(gridRows - 1, Math.floor(b.y / cellSize)));

        const minCol = Math.max(0, col - 1);
        const maxCol = Math.min(gridCols - 1, col + 1);
        const minRow = Math.max(0, row - 1);
        const maxRow = Math.min(gridRows - 1, row + 1);

        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            const cellIdx = r * gridCols + c;
            const start = grid[cellIdx];
            const end = start + gridCounts[cellIdx];

            for (let si = start; si < end; si++) {
              const j = sortedBoidIndices[si];
              if (j === i) continue;

              const other = boids[j];
              const dx = b.x - other.x;
              const dy = b.y - other.y;
              const distSq = dx * dx + dy * dy;

              if (distSq < percRadiusSq && distSq > 0) {
                // Alignment
                aliX += other.vx;
                aliY += other.vy;
                aliCount++;

                // Cohesion
                cohX += other.x;
                cohY += other.y;
                cohCount++;

                // Separation (only within separation radius)
                if (distSq < sepRadiusSq) {
                  const dist = Math.sqrt(distSq);
                  sepX += (dx / dist) / dist;
                  sepY += (dy / dist) / dist;
                  sepCount++;
                }
              }
            }
          }
        }

        let fx = 0, fy = 0;

        // Separation force
        if (sepCount > 0) {
          const mag = Math.sqrt(sepX * sepX + sepY * sepY);
          if (mag > 0) {
            fx += (sepX / mag) * maxSpd * 1.5 - b.vx;
            fy += (sepY / mag) * maxSpd * 1.5 - b.vy;
          }
        }

        // Alignment force
        if (aliCount > 0) {
          aliX /= aliCount;
          aliY /= aliCount;
          const mag = Math.sqrt(aliX * aliX + aliY * aliY);
          if (mag > 0) {
            const steerX = (aliX / mag) * maxSpd - b.vx;
            const steerY = (aliY / mag) * maxSpd - b.vy;
            fx += steerX * alignStr * 0.3;
            fy += steerY * alignStr * 0.3;
          }
        }

        // Cohesion force
        if (cohCount > 0) {
          cohX = cohX / cohCount - b.x;
          cohY = cohY / cohCount - b.y;
          const mag = Math.sqrt(cohX * cohX + cohY * cohY);
          if (mag > 0) {
            const steerX = (cohX / mag) * maxSpd - b.vx;
            const steerY = (cohY / mag) * maxSpd - b.vy;
            fx += steerX * cohStr * 0.3;
            fy += steerY * cohStr * 0.3;
          }
        }

        // Mouse attraction (gentle)
        if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
          const mx = p.mouseX - b.x;
          const my = p.mouseY - b.y;
          const mDist = Math.sqrt(mx * mx + my * my);
          if (mDist > 5 && mDist < 400) {
            fx += (mx / mDist) * 0.15;
            fy += (my / mDist) * 0.15;
          }
        }

        // Clamp force
        const fMag = Math.sqrt(fx * fx + fy * fy);
        if (fMag > maxForce) {
          fx = (fx / fMag) * maxForce;
          fy = (fy / fMag) * maxForce;
        }

        b.vx += fx;
        b.vy += fy;

        // Clamp speed
        const sMag = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (sMag > maxSpd) {
          b.vx = (b.vx / sMag) * maxSpd;
          b.vy = (b.vy / sMag) * maxSpd;
        }

        b.x += b.vx;
        b.y += b.vy;

        // Wrap around edges
        if (b.x < 0) b.x += p.width;
        if (b.x > p.width) b.x -= p.width;
        if (b.y < 0) b.y += p.height;
        if (b.y > p.height) b.y -= p.height;
      }
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.randomSeed(seed);
      p.noiseSeed(seed);
      p.colorMode(p.RGB, 255);
      p.background(9, 9, 11);

      trailBuffer = p.createGraphics(p.width, p.height);
      trailBuffer.colorMode(p.RGB, 255);
      trailBuffer.background(9, 9, 11);

      initBoids();
      initGrid();
    };

    p.draw = () => {
      const trailLength = params.trailLength ?? 8;
      // Fade: shorter trailLength → faster fade
      const fadeAlpha = Math.max(5, Math.floor(80 / trailLength));

      trailBuffer.noStroke();
      trailBuffer.fill(9, 9, 11, fadeAlpha);
      trailBuffer.rect(0, 0, p.width, p.height);

      updateBoids();

      // Draw boids as small points with amber-tinted color
      trailBuffer.noStroke();
      const n = boids.length;
      for (let i = 0; i < n; i++) {
        const b = boids[i];
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        const maxSpd = params.maxSpeed ?? 4;
        const t = Math.min(1, speed / maxSpd);

        // Interpolate from amber to ivory based on speed
        const r = Math.floor(212 + (250 - 212) * t);
        const g = Math.floor(160 + (250 - 160) * t);
        const bv = Math.floor(84 + (249 - 84) * t);

        trailBuffer.fill(r, g, bv, 200);
        trailBuffer.ellipse(b.x, b.y, 2.5, 2.5);
      }

      p.image(trailBuffer, 0, 0);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      trailBuffer.remove();
      trailBuffer = p.createGraphics(p.width, p.height);
      trailBuffer.colorMode(p.RGB, 255);
      trailBuffer.background(9, 9, 11);
      initBoids();
      initGrid();
    };
  },
};

export default swarmIntelligence;
