import type p5 from 'p5';
import type { GenerativePiece } from './types';

const sineCartography: GenerativePiece = {
  id: 'sine-cartography',
  title: 'Sine Cartography',
  artistStatement:
    'Cartography of imaginary lands. These contours describe no real terrain, yet the eye insists on seeing mountains, valleys, ridgelines. We are pattern-recognition machines viewing our own projections.',
  algorithm: 'Layered sine wave displacement with back-to-front contour rendering',
  year: 2024,
  defaultSeed: 707,
  parameters: [
    { key: 'layerCount', label: 'Layer Count', min: 3, max: 12, step: 1, default: 6, description: 'Number of sine layers composited into the height field' },
    { key: 'lineDensity', label: 'Line Density', min: 30, max: 150, step: 5, default: 80, description: 'Number of horizontal contour lines drawn across the canvas' },
    { key: 'amplitude', label: 'Amplitude', min: 20, max: 100, step: 5, default: 50, description: 'Maximum vertical displacement of contour lines' },
    { key: 'frequencySpread', label: 'Frequency Spread', min: 0.5, max: 5.0, step: 0.1, default: 2.0, description: 'Range of frequencies across sine layers' },
    { key: 'rotationRange', label: 'Rotation Range', min: 0, max: 180, step: 5, default: 90, description: 'Angular spread of sine layer orientations in degrees' },
    { key: 'lineWeight', label: 'Line Weight', min: 0.5, max: 3.0, step: 0.1, default: 1.2, description: 'Stroke weight for contour lines' },
  ],
  dominantColor: '#FAFAF9',
  colorPalette: ['#09090B', '#FAFAF9'],
  tags: ['topographic', 'contour', 'sine', 'landscape'],

  sketch(p: p5, params: Record<string, number>, seed: number): void {
    // Precomputed sine layer definitions
    let layers: Array<{
      frequency: number;
      amplitude: number;
      phase: number;
      cosAngle: number;
      sinAngle: number;
    }>;
    let resolution: number;

    function buildLayers(): void {
      const layerCount = Math.floor(params.layerCount ?? 6);
      const freqSpread = params.frequencySpread ?? 2.0;
      const amp = params.amplitude ?? 50;
      const rotRange = (params.rotationRange ?? 90) * (Math.PI / 180);

      layers = [];
      for (let i = 0; i < layerCount; i++) {
        const freq = 0.002 + (i / Math.max(1, layerCount - 1)) * freqSpread * 0.004;
        const angle = -rotRange / 2 + (i / Math.max(1, layerCount - 1)) * rotRange;
        const phase = p.random(0, p.TWO_PI);
        const layerAmp = amp * p.random(0.4, 1.0);
        layers.push({
          frequency: freq,
          amplitude: layerAmp,
          phase,
          cosAngle: Math.cos(angle),
          sinAngle: Math.sin(angle),
        });
      }
    }

    function heightAt(x: number, y: number): number {
      let h = 0;
      for (let i = 0; i < layers.length; i++) {
        const l = layers[i];
        const rotatedCoord = x * l.cosAngle + y * l.sinAngle;
        h += l.amplitude * Math.sin(rotatedCoord * l.frequency + l.phase);
      }
      return h;
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.randomSeed(seed);
      p.noiseSeed(seed);
      p.colorMode(p.RGB, 255);
      resolution = Math.max(2, Math.floor(p.width / 400));
      buildLayers();
      p.noLoop();
    };

    p.draw = () => {
      p.background(9, 9, 11); // void-950

      const lineDensity = Math.floor(params.lineDensity ?? 80);
      const lineWeight = params.lineWeight ?? 1.2;
      const lineSpacing = p.height / (lineDensity + 1);

      p.stroke(250, 250, 249); // ivory-50
      p.strokeWeight(lineWeight);
      p.noFill();

      // xStep determines resolution along each line
      const xStep = resolution;

      // Draw contour lines from back (top) to front (bottom)
      // Each line is a horizontal row displaced by the height function
      // We clip by not drawing segments that would overlap lines in front
      // Strategy: precompute all line positions, then draw back-to-front
      // using a per-column minimum y tracker for occlusion

      const cols = Math.floor(p.width / xStep) + 1;

      // Store y positions for all lines
      const lineYs: Float64Array[] = [];
      for (let i = 0; i < lineDensity; i++) {
        const baseY = lineSpacing * (i + 1);
        const yVals = new Float64Array(cols);
        for (let c = 0; c < cols; c++) {
          const x = c * xStep;
          yVals[c] = baseY + heightAt(x, baseY);
        }
        lineYs.push(yVals);
      }

      // Draw from back (top) to front (bottom)
      // Track the minimum y drawn so far per column for occlusion
      const minY = new Float64Array(cols);
      minY.fill(p.height + 1000);

      for (let i = lineDensity - 1; i >= 0; i--) {
        const yVals = lineYs[i];

        // Draw a filled shape from this line down to occlude lines behind
        // First, draw the fill (background color) to hide what's behind
        p.noStroke();
        p.fill(9, 9, 11);
        p.beginShape();
        for (let c = 0; c < cols; c++) {
          const drawY = Math.min(yVals[c], minY[c]);
          p.vertex(c * xStep, drawY);
        }
        // Close below the canvas
        p.vertex((cols - 1) * xStep, p.height + 100);
        p.vertex(0, p.height + 100);
        p.endShape(p.CLOSE);

        // Now draw the line itself
        p.noFill();
        p.stroke(250, 250, 249);
        p.strokeWeight(lineWeight);
        p.beginShape();
        for (let c = 0; c < cols; c++) {
          const drawY = Math.min(yVals[c], minY[c]);
          p.vertex(c * xStep, drawY);
        }
        p.endShape();

        // Update minY
        for (let c = 0; c < cols; c++) {
          const drawY = Math.min(yVals[c], minY[c]);
          if (drawY < minY[c]) {
            minY[c] = drawY;
          }
        }
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      resolution = Math.max(2, Math.floor(p.width / 400));
      p.redraw();
    };
  },
};

export default sineCartography;
