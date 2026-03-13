import type p5 from 'p5';
import type { GenerativePiece } from './types';

const mycelialNetwork: GenerativePiece = {
  id: 'mycelial-network',
  title: 'Mycelial Network',
  artistStatement:
    'The algorithm knows nothing of biology, yet it produces structures indistinguishable from neural dendrites, river deltas, and fungal mycelia. Space colonization — a simple rule of growing toward the nearest food — generates branching architectures of breathtaking organic complexity. Each node reaches blindly outward, and from that blindness, networks of exquisite order emerge.',
  algorithm: 'Space colonization algorithm with attractor-driven branching and thickness decay',
  year: 2024,
  defaultSeed: 618,
  parameters: [
    { key: 'attractorCount', label: 'Attractor Count', min: 100, max: 1000, step: 50, default: 500, description: 'Number of food sources driving growth' },
    { key: 'branchAngle', label: 'Branch Angle', min: 10, max: 60, step: 5, default: 30, description: 'Maximum branching angle in degrees' },
    { key: 'growthRate', label: 'Growth Rate', min: 1, max: 10, step: 1, default: 5, description: 'Distance grown per step' },
    { key: 'killDistance', label: 'Kill Distance', min: 5, max: 30, step: 1, default: 10, description: 'How close a node must be to consume an attractor' },
    { key: 'influenceRadius', label: 'Influence Radius', min: 30, max: 150, step: 10, default: 80, description: 'Maximum distance an attractor can influence a node' },
    { key: 'thicknessDecay', label: 'Thickness Decay', min: 0.6, max: 0.95, step: 0.05, default: 0.8, description: 'How quickly branches thin at each generation' },
  ],
  dominantColor: '#D4A054',
  colorPalette: ['#1A1008', '#3D2B1F', '#D4A054', '#E8C078', '#FAFAF9'],
  tags: ['space colonization', 'branching', 'organic', 'network'],

  sketch(p: p5, params: Record<string, number>, seed: number): void {
    const palette = {
      bg: [26, 16, 8],
      branch: [
        [61, 43, 31],
        [212, 160, 84],
        [232, 192, 120],
        [250, 250, 249],
      ],
    };

    interface Node {
      x: number;
      y: number;
      parentIdx: number;
      depth: number;
      thickness: number;
      childCount: number;
    }

    interface Attractor {
      x: number;
      y: number;
      active: boolean;
    }

    let nodes: Node[];
    let attractors: Attractor[];
    let growthComplete: boolean;
    let frameBuffer: p5.Graphics;
    let needsRedraw: boolean;

    function initNetwork(): void {
      const count = Math.floor(params.attractorCount ?? 500);
      growthComplete = false;
      needsRedraw = true;

      // Place attractors randomly, biased away from center seed
      attractors = [];
      for (let i = 0; i < count; i++) {
        // Use gaussian-ish distribution for more organic feel
        const angle = p.random(p.TWO_PI);
        const radius = p.random(0.15, 0.48) * Math.min(p.width, p.height);
        attractors.push({
          x: p.width / 2 + Math.cos(angle) * radius + p.random(-50, 50),
          y: p.height / 2 + Math.sin(angle) * radius + p.random(-50, 50),
          active: true,
        });
      }

      // Seed nodes — start from bottom center growing upward, like a root system
      nodes = [];
      const seedX = p.width / 2;
      const seedY = p.height * 0.85;
      nodes.push({
        x: seedX,
        y: seedY,
        parentIdx: -1,
        depth: 0,
        thickness: 8,
        childCount: 0,
      });

      // Add a few initial directional nodes
      for (let i = 0; i < 3; i++) {
        const angle = -p.HALF_PI + p.random(-0.4, 0.4);
        const rate = params.growthRate ?? 5;
        nodes.push({
          x: seedX + Math.cos(angle) * rate * 3,
          y: seedY + Math.sin(angle) * rate * 3,
          parentIdx: 0,
          depth: 1,
          thickness: 7,
          childCount: 0,
        });
        nodes[0].childCount++;
      }
    }

    function growStep(): boolean {
      const killDist = params.killDistance ?? 10;
      const influence = params.influenceRadius ?? 80;
      const rate = params.growthRate ?? 5;
      const decay = params.thicknessDecay ?? 0.8;
      const maxAngle = (params.branchAngle ?? 30) * (Math.PI / 180);
      const killDistSq = killDist * killDist;
      const influenceSq = influence * influence;

      // For each active attractor, find closest node within influence radius
      const nodeInfluences: Map<number, { x: number; y: number; count: number }> = new Map();

      let activeCount = 0;
      for (let a = 0; a < attractors.length; a++) {
        if (!attractors[a].active) continue;
        activeCount++;

        let closestIdx = -1;
        let closestDist = influenceSq;

        for (let n = 0; n < nodes.length; n++) {
          const dx = attractors[a].x - nodes[n].x;
          const dy = attractors[a].y - nodes[n].y;
          const dSq = dx * dx + dy * dy;

          // Kill attractor if too close
          if (dSq < killDistSq) {
            attractors[a].active = false;
            closestIdx = -1;
            break;
          }

          if (dSq < closestDist) {
            closestDist = dSq;
            closestIdx = n;
          }
        }

        if (closestIdx >= 0) {
          const inf = nodeInfluences.get(closestIdx) || { x: 0, y: 0, count: 0 };
          const dx = attractors[a].x - nodes[closestIdx].x;
          const dy = attractors[a].y - nodes[closestIdx].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          inf.x += dx / d;
          inf.y += dy / d;
          inf.count++;
          nodeInfluences.set(closestIdx, inf);
        }
      }

      if (activeCount === 0 || nodeInfluences.size === 0) return false;

      // Grow new nodes
      let grew = false;
      nodeInfluences.forEach((inf, nodeIdx) => {
        if (nodes.length > 8000) return; // Safety cap

        const parent = nodes[nodeIdx];
        let dirX = inf.x / inf.count;
        let dirY = inf.y / inf.count;
        const len = Math.sqrt(dirX * dirX + dirY * dirY);
        if (len === 0) return;
        dirX /= len;
        dirY /= len;

        // Add slight randomness for organic feel
        const jitter = maxAngle * 0.3;
        const angle = Math.atan2(dirY, dirX) + p.random(-jitter, jitter);
        const nx = parent.x + Math.cos(angle) * rate;
        const ny = parent.y + Math.sin(angle) * rate;

        // Check we're not too close to existing nodes
        let tooClose = false;
        for (let n = nodes.length - 1; n >= Math.max(0, nodes.length - 100); n--) {
          const dx = nx - nodes[n].x;
          const dy = ny - nodes[n].y;
          if (dx * dx + dy * dy < (rate * 0.5) * (rate * 0.5)) {
            tooClose = true;
            break;
          }
        }

        if (!tooClose && nx > 0 && nx < p.width && ny > 0 && ny < p.height) {
          nodes.push({
            x: nx,
            y: ny,
            parentIdx: nodeIdx,
            depth: parent.depth + 1,
            thickness: parent.thickness * decay,
            childCount: 0,
          });
          parent.childCount++;
          grew = true;
          needsRedraw = true;
        }
      });

      return grew;
    }

    function drawNetwork(): void {
      frameBuffer.background(palette.bg[0], palette.bg[1], palette.bg[2]);

      // Find max depth for color mapping
      let maxDepth = 1;
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].depth > maxDepth) maxDepth = nodes[i].depth;
      }

      // Draw branches (lines from child to parent)
      for (let i = 1; i < nodes.length; i++) {
        const node = nodes[i];
        const parent = nodes[node.parentIdx];
        const t = Math.min(node.depth / maxDepth, 1);

        // Interpolate color based on depth
        const colorIdx = t * (palette.branch.length - 1);
        const ci0 = Math.floor(colorIdx);
        const ci1 = Math.min(ci0 + 1, palette.branch.length - 1);
        const cf = colorIdx - ci0;

        const r = palette.branch[ci0][0] + (palette.branch[ci1][0] - palette.branch[ci0][0]) * cf;
        const g = palette.branch[ci0][1] + (palette.branch[ci1][1] - palette.branch[ci0][1]) * cf;
        const b = palette.branch[ci0][2] + (palette.branch[ci1][2] - palette.branch[ci0][2]) * cf;

        const thickness = Math.max(node.thickness, 0.5);
        const alpha = 150 + t * 105;

        frameBuffer.strokeWeight(thickness);
        frameBuffer.stroke(r, g, b, alpha);
        frameBuffer.line(parent.x, parent.y, node.x, node.y);
      }

      // Draw node tips (leaf nodes glow)
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.childCount === 0 && node.depth > 2) {
          const t = Math.min(node.depth / maxDepth, 1);
          const glowSize = Math.max(node.thickness * 2, 3);
          frameBuffer.noStroke();
          frameBuffer.fill(232, 192, 120, 60);
          frameBuffer.ellipse(node.x, node.y, glowSize * 2, glowSize * 2);
          frameBuffer.fill(250, 250, 249, 120 + t * 80);
          frameBuffer.ellipse(node.x, node.y, glowSize * 0.6, glowSize * 0.6);
        }
      }
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.randomSeed(seed);
      p.noiseSeed(seed);
      p.colorMode(p.RGB, 255);

      frameBuffer = p.createGraphics(p.width, p.height);
      frameBuffer.colorMode(p.RGB, 255);

      initNetwork();
    };

    p.draw = () => {
      // Grow multiple steps per frame for faster colonization
      if (!growthComplete) {
        const stepsPerFrame = 5;
        for (let i = 0; i < stepsPerFrame; i++) {
          const grew = growStep();
          if (!grew) {
            growthComplete = true;
            needsRedraw = true;
            break;
          }
        }
      }

      if (needsRedraw) {
        drawNetwork();
        needsRedraw = false;
      }

      p.image(frameBuffer, 0, 0);

      // Subtle ambient glow animation even after growth completes
      if (growthComplete) {
        const glowAlpha = (Math.sin(p.frameCount * 0.02) + 1) * 3;
        p.noStroke();
        p.fill(212, 160, 84, glowAlpha);
        // Pulse glow at tip nodes
        for (let i = Math.max(0, nodes.length - 200); i < nodes.length; i++) {
          if (nodes[i].childCount === 0) {
            p.ellipse(nodes[i].x, nodes[i].y, 6, 6);
          }
        }
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      frameBuffer.remove();
      frameBuffer = p.createGraphics(p.width, p.height);
      frameBuffer.colorMode(p.RGB, 255);
      p.randomSeed(seed);
      p.noiseSeed(seed);
      initNetwork();
    };
  },
};

export default mycelialNetwork;
