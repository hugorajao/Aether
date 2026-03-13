import type p5 from 'p5';
import type { GenerativePiece } from './types';

const recursiveBreath: GenerativePiece = {
  id: 'recursive-breath',
  title: 'Recursive Breath',
  artistStatement:
    'A tree is a recursive data structure that evolution wrote. Each branch is a smaller tree. Each leaf is a terminal node. This algorithm grows a tree the way DNA does — with a simple rule, repeated, varied, and subjected to wind.',
  algorithm: 'Recursive branching tree with Perlin noise wind displacement and pulsing leaf nodes',
  year: 2024,
  defaultSeed: 1212,
  parameters: [
    { key: 'maxDepth', label: 'Max Depth', min: 6, max: 12, step: 1, default: 9, description: 'Maximum branching recursion depth' },
    { key: 'branchAngle', label: 'Branch Angle', min: 15, max: 45, step: 1, default: 25, description: 'Base angle of each branch split in degrees' },
    { key: 'lengthRatio', label: 'Length Ratio', min: 0.6, max: 0.8, step: 0.01, default: 0.72, description: 'Each branch is this fraction of its parent\'s length' },
    { key: 'windStrength', label: 'Wind Strength', min: 0, max: 60, step: 2, default: 25, description: 'Intensity of Perlin noise wind displacement' },
    { key: 'windScale', label: 'Wind Scale', min: 0.001, max: 0.01, step: 0.001, default: 0.004, description: 'Spatial frequency of the wind noise field' },
    { key: 'breathingSpeed', label: 'Breathing Speed', min: 0.01, max: 0.05, step: 0.005, default: 0.02, description: 'Speed of the leaf pulsing oscillation' },
    { key: 'trunkThickness', label: 'Trunk Thickness', min: 8, max: 20, step: 1, default: 14, description: 'Stroke weight of the main trunk' },
  ],
  dominantColor: '#6B8E4E',
  colorPalette: ['#2D1B0E', '#4A3728', '#6B8E4E', '#8FBC5A', '#C8FF00'],
  tags: ['recursive', 'tree', 'fractal', 'organic'],

  sketch(p: p5, params: Record<string, number>, seed: number): void {
    // Precompute random variations per branch using seeded random
    // We use a deterministic random sequence keyed by depth + branch index
    let branchVariations: Float32Array;
    const MAX_BRANCHES = 8192; // 2^13, enough for depth 12

    function initVariations(): void {
      branchVariations = new Float32Array(MAX_BRANCHES);
      for (let i = 0; i < MAX_BRANCHES; i++) {
        branchVariations[i] = p.random(-1, 1);
      }
    }

    // Palette RGB values
    const trunkColors = [
      [45, 27, 14],   // #2D1B0E deep bark
      [74, 55, 40],   // #4A3728 lighter bark
    ];
    const leafColors = [
      [107, 142, 78], // #6B8E4E sage
      [143, 188, 90], // #8FBC5A green
      [200, 255, 0],  // #C8FF00 chartreuse
    ];

    function drawTree(): void {
      const maxDepth = Math.floor(params.maxDepth ?? 9);
      const baseAngle = (params.branchAngle ?? 25) * (Math.PI / 180);
      const lengthRatio = params.lengthRatio ?? 0.72;
      const windStr = params.windStrength ?? 25;
      const windScl = params.windScale ?? 0.004;
      const breathSpd = params.breathingSpeed ?? 0.02;
      const trunkW = params.trunkThickness ?? 14;
      const time = p.frameCount * 0.01;

      // Start from bottom center
      const startX = p.width / 2;
      const startY = p.height * 0.92;
      const trunkLen = Math.min(p.width, p.height) * 0.22;

      let branchIdx = 0;

      function branch(
        x: number,
        y: number,
        angle: number,
        len: number,
        depth: number,
        thickness: number,
      ): void {
        if (depth > maxDepth || len < 2) return;

        const currentIdx = branchIdx % MAX_BRANCHES;
        branchIdx++;

        // Wind: Perlin noise displacement on angle, increasing with depth
        const windOffset = p.noise(x * windScl, y * windScl, time + depth * 0.3);
        const windAngle = (windOffset - 0.5) * 2 * windStr * (Math.PI / 180) * (depth / maxDepth);

        const currentAngle = angle + windAngle;

        // End point
        const endX = x + Math.cos(currentAngle) * len;
        const endY = y + Math.sin(currentAngle) * len;

        // Color: interpolate from bark to green based on depth
        const depthFrac = depth / maxDepth;
        let r: number, g: number, b: number;

        if (depthFrac < 0.5) {
          // Trunk colors
          const t = depthFrac * 2;
          r = trunkColors[0][0] + (trunkColors[1][0] - trunkColors[0][0]) * t;
          g = trunkColors[0][1] + (trunkColors[1][1] - trunkColors[0][1]) * t;
          b = trunkColors[0][2] + (trunkColors[1][2] - trunkColors[0][2]) * t;
        } else {
          // Transition to leaf colors
          const t = (depthFrac - 0.5) * 2;
          const li = Math.min(Math.floor(t * leafColors.length), leafColors.length - 1);
          const li2 = Math.min(li + 1, leafColors.length - 1);
          const lt = (t * leafColors.length) - li;
          r = leafColors[li][0] + (leafColors[li2][0] - leafColors[li][0]) * lt;
          g = leafColors[li][1] + (leafColors[li2][1] - leafColors[li][1]) * lt;
          b = leafColors[li][2] + (leafColors[li2][2] - leafColors[li][2]) * lt;
        }

        // Draw branch
        p.stroke(r, g, b, 200 + 55 * (1 - depthFrac));
        p.strokeWeight(Math.max(0.5, thickness));
        p.line(x, y, endX, endY);

        // At max depth, draw leaves
        if (depth === maxDepth || len * lengthRatio < 2) {
          // Breathing pulse
          const breathPhase = p.noise(currentIdx * 0.1, time * breathSpd * 10) * p.TWO_PI;
          const pulse = 1 + 0.3 * Math.sin(p.frameCount * breathSpd * 2 + breathPhase);
          const leafSize = Math.max(2, thickness * 2.5 * pulse);

          // Draw a small glowing ellipse
          p.noStroke();
          // Glow
          const glowSize = leafSize * 2;
          p.fill(200, 255, 0, 20);
          p.ellipse(endX, endY, glowSize, glowSize);
          // Core
          const lci = Math.floor(p.noise(currentIdx * 0.2) * leafColors.length);
          const lc = leafColors[Math.min(lci, leafColors.length - 1)];
          p.fill(lc[0], lc[1], lc[2], 180);
          p.ellipse(endX, endY, leafSize, leafSize);
          return;
        }

        // Branch into two (sometimes three) children
        const variation = branchVariations[currentIdx] * 0.3;
        const childLen = len * (lengthRatio + variation * 0.1);
        const childThickness = thickness * 0.68;

        // Left branch
        branch(
          endX, endY,
          currentAngle - baseAngle * (1 + variation * 0.3),
          childLen,
          depth + 1,
          childThickness,
        );

        // Right branch
        branch(
          endX, endY,
          currentAngle + baseAngle * (1 - variation * 0.2),
          childLen * (1 + variation * 0.05),
          depth + 1,
          childThickness,
        );

        // Occasional third branch for fullness (when variation is high enough)
        if (Math.abs(branchVariations[(currentIdx + 1) % MAX_BRANCHES]) > 0.6 && depth < maxDepth - 2) {
          branch(
            endX, endY,
            currentAngle + variation * baseAngle * 0.4,
            childLen * 0.7,
            depth + 1,
            childThickness * 0.6,
          );
        }
      }

      branchIdx = 0;
      branch(startX, startY, -Math.PI / 2, trunkLen, 0, trunkW);
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.randomSeed(seed);
      p.noiseSeed(seed);
      p.colorMode(p.RGB, 255);
      p.background(9, 9, 11);
      initVariations();
    };

    p.draw = () => {
      // Semi-transparent background for subtle ghosting of previous frames
      p.background(9, 9, 11, 230);
      drawTree();
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  },
};

export default recursiveBreath;
