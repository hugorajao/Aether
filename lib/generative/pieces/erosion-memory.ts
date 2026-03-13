import type p5 from 'p5';
import type { GenerativePiece } from './types';

const erosionMemory: GenerativePiece = {
  id: 'erosion-memory',
  title: 'Erosion Memory',
  artistStatement:
    'Ten thousand particles seek paths of least resistance through a shifting noise field. Over time, their accumulated passages carve channels into the canvas — rivers of light eroding a landscape that exists only in mathematics. The resulting image is a memory of motion: every bright filament records where the flow was strongest, where particles clustered and lingered before dissolving.',
  algorithm: 'Multi-octave Perlin noise flow field with particle trail accumulation',
  year: 2024,
  defaultSeed: 42,
  parameters: [
    { key: 'particleCount', label: 'Particle Count', min: 1000, max: 15000, step: 500, default: 10000, description: 'Number of particles flowing through the field' },
    { key: 'flowScale', label: 'Flow Scale', min: 0.001, max: 0.01, step: 0.001, default: 0.003, description: 'Scale of the noise field — smaller values create broader currents' },
    { key: 'turbulence', label: 'Turbulence Octaves', min: 1, max: 8, step: 1, default: 4, description: 'Number of noise octaves layered for complexity' },
    { key: 'lifespan', label: 'Particle Lifespan', min: 50, max: 500, step: 10, default: 200, description: 'How many frames a particle lives before respawning' },
    { key: 'trailOpacity', label: 'Trail Opacity', min: 1, max: 30, step: 1, default: 8, description: 'Opacity of each particle trail stroke' },
    { key: 'erosionRate', label: 'Erosion Rate', min: 0.1, max: 2.0, step: 0.1, default: 0.8, description: 'How quickly high-traffic paths darken and widen' },
  ],
  dominantColor: '#4ECDC4',
  colorPalette: ['#0A1628', '#0D3B4F', '#1A6B6B', '#4ECDC4', '#F7FFF7'],
  tags: ['flow field', 'particle system', 'erosion', 'generative'],

  sketch(p: p5, params: Record<string, number>, seed: number): void {
    const palette = [
      [10, 22, 40],    // #0A1628
      [13, 59, 79],    // #0D3B4F
      [26, 107, 107],  // #1A6B6B
      [78, 205, 196],  // #4ECDC4
      [247, 255, 247], // #F7FFF7
    ];

    let particles: Array<{
      x: number;
      y: number;
      prevX: number;
      prevY: number;
      age: number;
      maxAge: number;
      colorIndex: number;
      speed: number;
    }>;

    let trailBuffer: p5.Graphics;

    function getFlowAngle(x: number, y: number, time: number): number {
      const scale = params.flowScale ?? 0.003;
      const octaves = params.turbulence ?? 4;
      let angle = 0;
      let amp = 1;
      let freq = scale;
      let totalAmp = 0;

      for (let i = 0; i < octaves; i++) {
        angle += p.noise(x * freq, y * freq, time * 0.3 + i * 100) * amp;
        totalAmp += amp;
        amp *= 0.5;
        freq *= 2;
      }

      return (angle / totalAmp) * p.TWO_PI * 2;
    }

    function createParticle(): {
      x: number;
      y: number;
      prevX: number;
      prevY: number;
      age: number;
      maxAge: number;
      colorIndex: number;
      speed: number;
    } {
      const x = p.random(p.width);
      const y = p.random(p.height);
      const lifespan = params.lifespan ?? 200;
      return {
        x,
        y,
        prevX: x,
        prevY: y,
        age: 0,
        maxAge: lifespan * p.random(0.5, 1.5),
        colorIndex: p.random(1, palette.length - 1),
        speed: p.random(1, 3),
      };
    }

    function initParticles(): void {
      const count = Math.floor(params.particleCount ?? 10000);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(createParticle());
      }
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.randomSeed(seed);
      p.noiseSeed(seed);
      p.colorMode(p.RGB, 255);
      p.background(10, 22, 40);

      trailBuffer = p.createGraphics(p.width, p.height);
      trailBuffer.colorMode(p.RGB, 255);
      trailBuffer.background(10, 22, 40);

      initParticles();
    };

    p.draw = () => {
      const erosionRate = params.erosionRate ?? 0.8;
      const trailOpacity = params.trailOpacity ?? 8;
      const time = p.frameCount * 0.005;

      // Slow background fade for persistence
      trailBuffer.noStroke();
      trailBuffer.fill(10, 22, 40, 1);
      trailBuffer.rect(0, 0, p.width, p.height);

      trailBuffer.strokeWeight(1);

      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        pt.prevX = pt.x;
        pt.prevY = pt.y;

        const angle = getFlowAngle(pt.x, pt.y, time);
        const vx = Math.cos(angle) * pt.speed * erosionRate;
        const vy = Math.sin(angle) * pt.speed * erosionRate;

        pt.x += vx;
        pt.y += vy;
        pt.age++;

        // Aging factor: particles fade in and out
        const lifeFraction = pt.age / pt.maxAge;
        const alpha = lifeFraction < 0.1
          ? p.map(lifeFraction, 0, 0.1, 0, trailOpacity)
          : lifeFraction > 0.8
            ? p.map(lifeFraction, 0.8, 1, trailOpacity, 0)
            : trailOpacity;

        // Interpolate color from palette
        const ci = pt.colorIndex;
        const ci0 = Math.floor(ci);
        const ci1 = Math.min(ci0 + 1, palette.length - 1);
        const t = ci - ci0;
        const r = palette[ci0][0] + (palette[ci1][0] - palette[ci0][0]) * t;
        const g = palette[ci0][1] + (palette[ci1][1] - palette[ci0][1]) * t;
        const b = palette[ci0][2] + (palette[ci1][2] - palette[ci0][2]) * t;

        trailBuffer.stroke(r, g, b, alpha);

        // Only draw if segment is short (avoid wrapping artifacts)
        const dx = pt.x - pt.prevX;
        const dy = pt.y - pt.prevY;
        if (dx * dx + dy * dy < 100) {
          trailBuffer.line(pt.prevX, pt.prevY, pt.x, pt.y);
        }

        // Respawn if dead or off screen
        if (
          pt.age > pt.maxAge ||
          pt.x < 0 || pt.x > p.width ||
          pt.y < 0 || pt.y > p.height
        ) {
          const newPt = createParticle();
          particles[i] = newPt;
        }
      }

      p.image(trailBuffer, 0, 0);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      trailBuffer.remove();
      trailBuffer = p.createGraphics(p.width, p.height);
      trailBuffer.colorMode(p.RGB, 255);
      trailBuffer.background(10, 22, 40);
      initParticles();
    };
  },
};

export default erosionMemory;
