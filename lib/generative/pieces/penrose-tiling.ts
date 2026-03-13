import type p5 from 'p5';
import type { GenerativePiece } from './types';

const penroseTiling: GenerativePiece = {
  id: 'penrose-tiling',
  title: 'Penrose Tiling',
  artistStatement:
    'A pattern that never repeats, yet fills all of space. Roger Penrose proved that order need not require periodicity — that infinity can be structured without repetition. This is the visual proof.',
  algorithm: 'Penrose P3 rhombus tiling via recursive de Bruijn subdivision from an initial star',
  year: 2024,
  defaultSeed: 909,
  parameters: [
    { key: 'subdivisionDepth', label: 'Subdivision Depth', min: 3, max: 7, step: 1, default: 5, description: 'Number of recursive subdivision levels (higher = finer tiles)' },
    { key: 'tileGap', label: 'Tile Gap', min: 0, max: 4, step: 0.5, default: 1.5, description: 'Gap between tiles in pixels' },
    { key: 'colorRotation', label: 'Color Rotation', min: 0, max: 360, step: 5, default: 0, description: 'Hue rotation applied to the tile palette' },
    { key: 'parallaxIntensity', label: 'Parallax Intensity', min: 0, max: 20, step: 1, default: 8, description: 'Mouse-driven parallax displacement depth' },
    { key: 'borderOpacity', label: 'Border Opacity', min: 0.1, max: 1.0, step: 0.05, default: 0.5, description: 'Opacity of tile border lines' },
    { key: 'fillOpacity', label: 'Fill Opacity', min: 0.3, max: 1.0, step: 0.05, default: 0.75, description: 'Opacity of tile fill color' },
  ],
  dominantColor: '#1E3A5F',
  colorPalette: ['#1E3A5F', '#166534', '#991B1B', '#D4A054', '#09090B'],
  tags: ['penrose', 'aperiodic', 'tiling', 'mathematics'],

  sketch(p: p5, params: Record<string, number>, seed: number): void {
    // Penrose P3 tiling using Robinson triangle decomposition
    // Type 0 = thin rhombus half (36-144 triangle)
    // Type 1 = thick rhombus half (72-108 triangle)
    const PHI = (1 + Math.sqrt(5)) / 2;

    interface Triangle {
      type: number; // 0 = thin half, 1 = thick half
      a: [number, number]; // apex
      b: [number, number]; // base left
      c: [number, number]; // base right
      depth: number;
    }

    let triangles: Triangle[] = [];

    // Jewel palette RGB values
    const jewelColors = [
      [30, 58, 95],   // sapphire #1E3A5F
      [22, 101, 52],  // emerald #166534
      [153, 27, 27],  // ruby #991B1B
      [212, 160, 84], // amber #D4A054
    ];

    function subdivide(tri: Triangle): Triangle[] {
      const { type, a, b, c, depth } = tri;

      if (type === 1) {
        // Thick triangle: split into 2 thick + 1 thin
        const p1: [number, number] = [
          a[0] + (b[0] - a[0]) / PHI,
          a[1] + (b[1] - a[1]) / PHI,
        ];
        const p2: [number, number] = [
          b[0] + (c[0] - b[0]) / PHI,
          b[1] + (c[1] - b[1]) / PHI,
        ];
        return [
          { type: 1, a: p2, b: c, c: a, depth: depth + 1 },
          { type: 1, a: p2, b: a, c: p1, depth: depth + 1 },
          { type: 0, a: p1, b: b, c: p2, depth: depth + 1 },
        ];
      } else {
        // Thin triangle: split into 1 thick + 1 thin
        const p1: [number, number] = [
          b[0] + (a[0] - b[0]) / PHI,
          b[1] + (a[1] - b[1]) / PHI,
        ];
        return [
          { type: 0, a: p1, b: c, c: a, depth: depth + 1 },
          { type: 1, a: c, b: p1, c: b, depth: depth + 1 },
        ];
      }
    }

    function generateTiling(): void {
      const depth = Math.floor(params.subdivisionDepth ?? 5);
      const cx = p.width / 2;
      const cy = p.height / 2;
      const size = Math.max(p.width, p.height) * 0.8;

      // Start from a star of 10 thick triangles (forms a decagon)
      triangles = [];
      for (let i = 0; i < 10; i++) {
        const angle1 = (i * 2 * Math.PI) / 10 - Math.PI / 2;
        const angle2 = ((i + 1) * 2 * Math.PI) / 10 - Math.PI / 2;
        const pa: [number, number] = [cx, cy];
        const pb: [number, number] = [cx + Math.cos(angle1) * size, cy + Math.sin(angle1) * size];
        const pc: [number, number] = [cx + Math.cos(angle2) * size, cy + Math.sin(angle2) * size];

        if (i % 2 === 0) {
          triangles.push({ type: 1, a: pa, b: pc, c: pb, depth: 0 });
        } else {
          triangles.push({ type: 1, a: pa, b: pb, c: pc, depth: 0 });
        }
      }

      // Subdivide
      for (let d = 0; d < depth; d++) {
        const next: Triangle[] = [];
        for (let t = 0; t < triangles.length; t++) {
          const sub = subdivide(triangles[t]);
          for (let s = 0; s < sub.length; s++) {
            next.push(sub[s]);
          }
        }
        triangles = next;
      }
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.randomSeed(seed);
      p.noiseSeed(seed);
      p.colorMode(p.RGB, 255);
      generateTiling();
    };

    p.draw = () => {
      p.background(9, 9, 11);

      const gap = params.tileGap ?? 1.5;
      const colorRot = (params.colorRotation ?? 0) / 360;
      const parallax = params.parallaxIntensity ?? 8;
      const borderAlpha = Math.floor((params.borderOpacity ?? 0.5) * 255);
      const fillAlpha = Math.floor((params.fillOpacity ?? 0.75) * 255);

      // Mouse parallax offset
      const mx = (p.mouseX - p.width / 2) / p.width;
      const my = (p.mouseY - p.height / 2) / p.height;

      for (let i = 0; i < triangles.length; i++) {
        const tri = triangles[i];

        // Compute centroid for parallax and color
        const centX = (tri.a[0] + tri.b[0] + tri.c[0]) / 3;
        const centY = (tri.a[1] + tri.b[1] + tri.c[1]) / 3;

        // Parallax based on depth
        const depthFactor = tri.depth / (params.subdivisionDepth ?? 5);
        const px = mx * parallax * depthFactor;
        const py = my * parallax * depthFactor;

        // Color selection based on triangle type and angle
        const angle = Math.atan2(centY - p.height / 2, centX - p.width / 2);
        const normalizedAngle = (angle + Math.PI) / (2 * Math.PI);
        const colorIdx = Math.floor((normalizedAngle + colorRot) * jewelColors.length) % jewelColors.length;
        const color = jewelColors[tri.type === 1 ? colorIdx : (colorIdx + 2) % jewelColors.length];

        // Apply gap: shrink triangle toward centroid
        const ax = centX + (tri.a[0] - centX) * (1 - gap * 0.01) + px;
        const ay = centY + (tri.a[1] - centY) * (1 - gap * 0.01) + py;
        const bx = centX + (tri.b[0] - centX) * (1 - gap * 0.01) + px;
        const by = centY + (tri.b[1] - centY) * (1 - gap * 0.01) + py;
        const cxp = centX + (tri.c[0] - centX) * (1 - gap * 0.01) + px;
        const cyp = centY + (tri.c[1] - centY) * (1 - gap * 0.01) + py;

        // Brightness variation by depth
        const brightness = 0.7 + depthFactor * 0.3;

        p.fill(
          Math.floor(color[0] * brightness),
          Math.floor(color[1] * brightness),
          Math.floor(color[2] * brightness),
          fillAlpha
        );
        p.stroke(200, 200, 200, borderAlpha);
        p.strokeWeight(0.5);
        p.triangle(ax, ay, bx, by, cxp, cyp);
      }

      // Only redraw on mouse movement for performance
      // (Parallax requires continuous drawing, but we keep it)
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      generateTiling();
    };
  },
};

export default penroseTiling;
