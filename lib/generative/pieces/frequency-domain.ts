import type p5 from 'p5';
import type { GenerativePiece } from './types';

const frequencyDomain: GenerativePiece = {
  id: 'frequency-domain',
  title: 'Frequency Domain',
  artistStatement:
    'Every complex signal is a chorus of simple ones — sine waves stacked and interleaved until their individual voices disappear into the collective. This piece decomposes a procedural signal into its spectral constituents and projects them radially, as if peering down through the barrel of a radio telescope into the deep structure of noise itself.',
  algorithm: 'Procedural harmonic synthesis with radial spectral projection and rotational symmetry',
  year: 2024,
  defaultSeed: 314,
  parameters: [
    { key: 'baseFrequency', label: 'Base Frequency', min: 1, max: 20, step: 1, default: 5, description: 'Fundamental frequency of the signal' },
    { key: 'harmonicCount', label: 'Harmonic Count', min: 3, max: 20, step: 1, default: 12, description: 'Number of harmonic overtones' },
    { key: 'noiseDepth', label: 'Noise Depth', min: 0.0, max: 1.0, step: 0.05, default: 0.4, description: 'Amount of noise modulating the frequencies' },
    { key: 'radialResolution', label: 'Radial Resolution', min: 50, max: 200, step: 10, default: 120, description: 'Number of concentric rings' },
    { key: 'colorCurve', label: 'Color Curve', min: 0.5, max: 3.0, step: 0.1, default: 1.5, description: 'Gamma curve for color intensity mapping' },
    { key: 'symmetryOrder', label: 'Symmetry Order', min: 1, max: 12, step: 1, default: 6, description: 'Rotational symmetry of the visualization' },
  ],
  dominantColor: '#8B5CF6',
  colorPalette: ['#0A0A2A', '#1E3A5F', '#8B5CF6', '#EC4899', '#FFFFFF'],
  tags: ['FFT', 'frequency', 'radial', 'signal'],

  sketch(p: p5, params: Record<string, number>, seed: number): void {
    const palette = [
      [10, 10, 42],    // #0A0A2A deep void
      [30, 58, 95],    // #1E3A5F dark blue
      [139, 92, 246],  // #8B5CF6 violet
      [236, 72, 153],  // #EC4899 magenta
      [255, 255, 255], // white
    ];

    let harmonicPhases: number[];
    let harmonicAmps: number[];
    let harmonicFreqs: number[];

    function initHarmonics(): void {
      const count = Math.floor(params.harmonicCount ?? 12);
      const baseFreq = params.baseFrequency ?? 5;

      harmonicPhases = [];
      harmonicAmps = [];
      harmonicFreqs = [];

      for (let i = 0; i < count; i++) {
        harmonicPhases.push(p.random(p.TWO_PI));
        harmonicAmps.push(1 / (i + 1)); // Harmonic series falloff
        harmonicFreqs.push(baseFreq * (i + 1) + p.random(-0.5, 0.5));
      }
    }

    function getSignal(angle: number, radius: number, time: number): number {
      const noiseDepth = params.noiseDepth ?? 0.4;
      let signal = 0;
      let maxAmp = 0;

      for (let h = 0; h < harmonicFreqs.length; h++) {
        const noiseVal = p.noise(
          Math.cos(angle) * 0.5 + 1,
          Math.sin(angle) * 0.5 + 1,
          time * 0.3 + h * 0.7
        );
        const freqMod = harmonicFreqs[h] + noiseVal * noiseDepth * harmonicFreqs[h];
        const amp = harmonicAmps[h] * (1 + noiseVal * noiseDepth * 0.5);
        signal += Math.sin(angle * freqMod + radius * 0.02 + harmonicPhases[h] + time) * amp;
        maxAmp += amp;
      }

      return signal / maxAmp; // Normalize to [-1, 1]
    }

    function lerpColor(t: number): number[] {
      const gamma = params.colorCurve ?? 1.5;
      const tt = Math.pow(Math.abs(t), gamma);
      const idx = tt * (palette.length - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(i0 + 1, palette.length - 1);
      const f = idx - i0;

      return [
        palette[i0][0] + (palette[i1][0] - palette[i0][0]) * f,
        palette[i0][1] + (palette[i1][1] - palette[i0][1]) * f,
        palette[i0][2] + (palette[i1][2] - palette[i0][2]) * f,
      ];
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.randomSeed(seed);
      p.noiseSeed(seed);
      p.colorMode(p.RGB, 255);

      initHarmonics();
    };

    p.draw = () => {
      p.background(10, 10, 42);

      const cx = p.width / 2;
      const cy = p.height / 2;
      const maxRadius = Math.min(p.width, p.height) * 0.45;
      const rings = Math.floor(params.radialResolution ?? 120);
      const symmetry = Math.floor(params.symmetryOrder ?? 6);
      const time = p.frameCount * 0.02;

      const angularSteps = Math.max(180, rings * 3);
      const angleStep = p.TWO_PI / angularSteps;

      p.noStroke();

      // Draw from outside in for proper layering
      for (let ring = rings - 1; ring >= 0; ring--) {
        const radiusNorm = ring / rings;
        const innerR = (ring / rings) * maxRadius;
        const outerR = ((ring + 1) / rings) * maxRadius;

        for (let a = 0; a < angularSteps; a++) {
          const angle = a * angleStep;

          // Apply symmetry
          const symAngle = (angle % (p.TWO_PI / symmetry)) * symmetry;

          const signal = getSignal(symAngle, innerR, time + radiusNorm * 2);
          const intensity = (signal + 1) / 2; // Map to [0, 1]

          const col = lerpColor(intensity);

          // Fade out near center and edges
          const edgeFade = radiusNorm < 0.05
            ? radiusNorm / 0.05
            : radiusNorm > 0.9
              ? (1 - radiusNorm) / 0.1
              : 1;

          const alpha = intensity * edgeFade * 220 + 20;

          p.fill(col[0], col[1], col[2], alpha);

          // Draw arc segment as a quad
          const a1 = angle;
          const a2 = angle + angleStep;
          p.beginShape();
          p.vertex(cx + Math.cos(a1) * innerR, cy + Math.sin(a1) * innerR);
          p.vertex(cx + Math.cos(a2) * innerR, cy + Math.sin(a2) * innerR);
          p.vertex(cx + Math.cos(a2) * outerR, cy + Math.sin(a2) * outerR);
          p.vertex(cx + Math.cos(a1) * outerR, cy + Math.sin(a1) * outerR);
          p.endShape(p.CLOSE);
        }
      }

      // Central glow
      const glowPulse = (Math.sin(time * 2) + 1) * 0.5;
      const glowSize = maxRadius * 0.08 * (1 + glowPulse * 0.3);
      for (let i = 5; i > 0; i--) {
        const t = i / 5;
        p.fill(255, 255, 255, 30 * t);
        p.ellipse(cx, cy, glowSize * t * 4, glowSize * t * 4);
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  },
};

export default frequencyDomain;
