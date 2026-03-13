import type p5 from 'p5';
import type { GenerativePiece } from './types';

const strangeAttractor: GenerativePiece = {
  id: 'strange-attractor',
  title: 'Strange Attractor',
  artistStatement:
    'Deterministic chaos. Every point on this trajectory is exactly predictable, yet the shape it traces is indistinguishable from randomness. The butterfly effect is not a metaphor — it is this curve.',
  algorithm: 'Lorenz attractor integration with perspective projection and velocity-mapped color',
  year: 2024,
  defaultSeed: 1111,
  parameters: [
    { key: 'sigma', label: 'Sigma (σ)', min: 5, max: 20, step: 0.5, default: 10, description: 'Prandtl number — controls the rate of convective overturning' },
    { key: 'rho', label: 'Rho (ρ)', min: 20, max: 40, step: 0.5, default: 28, description: 'Rayleigh number — controls the temperature difference driving convection' },
    { key: 'beta', label: 'Beta (β)', min: 1, max: 5, step: 0.1, default: 2.667, description: 'Geometric factor of the convection cell' },
    { key: 'rotationSpeed', label: 'Rotation Speed', min: 0.001, max: 0.01, step: 0.001, default: 0.003, description: 'Angular velocity of the Y-axis rotation' },
    { key: 'projectionScale', label: 'Projection Scale', min: 5, max: 15, step: 0.5, default: 10, description: 'Zoom factor for the projected view' },
    { key: 'trailDensity', label: 'Trail Density', min: 100, max: 1000, step: 50, default: 500, description: 'Number of integration steps computed per frame' },
    { key: 'colorVelocity', label: 'Color Velocity', min: 0.5, max: 3.0, step: 0.1, default: 1.5, description: 'How strongly velocity maps to color brightness' },
  ],
  dominantColor: '#6D28D9',
  colorPalette: ['#1A0533', '#3B0764', '#6D28D9', '#06B6D4', '#ECFEFF'],
  tags: ['Lorenz', 'attractor', 'chaos', '3D'],

  sketch(p: p5, params: Record<string, number>, seed: number): void {
    // Lorenz trajectory points stored as a ring buffer
    const MAX_POINTS = 60000;
    let pointsX: Float32Array;
    let pointsY: Float32Array;
    let pointsZ: Float32Array;
    let pointsV: Float32Array; // velocity magnitude
    let pointCount = 0;
    let writeIdx = 0;

    // Current position on the attractor
    let cx: number, cy: number, cz: number;

    // Trail buffer for accumulation
    let trailBuffer: p5.Graphics;

    // Palette RGB
    const palette = [
      [26, 5, 51],    // #1A0533
      [59, 7, 100],   // #3B0764
      [109, 40, 217], // #6D28D9
      [6, 182, 212],  // #06B6D4
      [236, 254, 255],// #ECFEFF
    ];

    function colorFromVelocity(v: number, colorVel: number): [number, number, number] {
      // Map velocity to 0..1 range with gamma
      const t = Math.min(1, Math.pow(v * 0.02 * colorVel, 0.6));
      const palIdx = t * (palette.length - 1);
      const ci0 = Math.floor(palIdx);
      const ci1 = Math.min(ci0 + 1, palette.length - 1);
      const f = palIdx - ci0;
      return [
        palette[ci0][0] + (palette[ci1][0] - palette[ci0][0]) * f,
        palette[ci0][1] + (palette[ci1][1] - palette[ci0][1]) * f,
        palette[ci0][2] + (palette[ci1][2] - palette[ci0][2]) * f,
      ];
    }

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.randomSeed(seed);
      p.noiseSeed(seed);
      p.colorMode(p.RGB, 255);
      p.background(26, 5, 51);

      trailBuffer = p.createGraphics(p.width, p.height);
      trailBuffer.colorMode(p.RGB, 255);
      trailBuffer.background(26, 5, 51);

      pointsX = new Float32Array(MAX_POINTS);
      pointsY = new Float32Array(MAX_POINTS);
      pointsZ = new Float32Array(MAX_POINTS);
      pointsV = new Float32Array(MAX_POINTS);

      // Start near the attractor (perturbed by seed)
      cx = 0.1 + p.random(-0.01, 0.01);
      cy = 0.0 + p.random(-0.01, 0.01);
      cz = 0.0 + p.random(-0.01, 0.01);
      pointCount = 0;
      writeIdx = 0;
    };

    p.draw = () => {
      const sigma = params.sigma ?? 10;
      const rho = params.rho ?? 28;
      const beta = params.beta ?? 2.667;
      const rotSpeed = params.rotationSpeed ?? 0.003;
      const projScale = params.projectionScale ?? 10;
      const density = Math.floor(params.trailDensity ?? 500);
      const colorVel = params.colorVelocity ?? 1.5;

      const dt = 0.005;

      // Integrate more points
      for (let i = 0; i < density; i++) {
        const dx = sigma * (cy - cx);
        const dy = cx * (rho - cz) - cy;
        const dz = cx * cy - beta * cz;

        cx += dx * dt;
        cy += dy * dt;
        cz += dz * dt;

        const vel = Math.sqrt(dx * dx + dy * dy + dz * dz);

        pointsX[writeIdx] = cx;
        pointsY[writeIdx] = cy;
        pointsZ[writeIdx] = cz;
        pointsV[writeIdx] = vel;
        writeIdx = (writeIdx + 1) % MAX_POINTS;
        if (pointCount < MAX_POINTS) pointCount++;
      }

      // Clear and redraw all points with current rotation
      const angle = p.frameCount * rotSpeed;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Slow fade
      trailBuffer.noStroke();
      trailBuffer.fill(26, 5, 51, 15);
      trailBuffer.rect(0, 0, p.width, p.height);

      const halfW = p.width / 2;
      const halfH = p.height / 2;
      const scale = projScale;

      // Draw the newest points as line segments
      trailBuffer.strokeWeight(1);
      const startIdx = pointCount < density ? 0 : (writeIdx - density + MAX_POINTS) % MAX_POINTS;

      for (let i = 0; i < Math.min(density, pointCount) - 1; i++) {
        const idx0 = (startIdx + i) % MAX_POINTS;
        const idx1 = (startIdx + i + 1) % MAX_POINTS;

        // Rotate around Y axis
        const x0 = pointsX[idx0] * cosA + pointsZ[idx0] * sinA;
        const z0 = -pointsX[idx0] * sinA + pointsZ[idx0] * cosA;
        const y0 = pointsY[idx0];

        const x1 = pointsX[idx1] * cosA + pointsZ[idx1] * sinA;
        const z1 = -pointsX[idx1] * sinA + pointsZ[idx1] * cosA;
        const y1 = pointsY[idx1];

        // Simple perspective
        const perspective0 = 200 / (200 + z0);
        const perspective1 = 200 / (200 + z1);

        const sx0 = halfW + x0 * scale * perspective0;
        const sy0 = halfH - y0 * scale * perspective0 + 50; // shift down since attractor is above z=0
        const sx1 = halfW + x1 * scale * perspective1;
        const sy1 = halfH - y1 * scale * perspective1 + 50;

        const vel = pointsV[idx0];
        const [r, g, b] = colorFromVelocity(vel, colorVel);
        const alpha = 80 + 120 * Math.min(1, vel * 0.015 * colorVel);

        trailBuffer.stroke(r, g, b, alpha);
        trailBuffer.line(sx0, sy0, sx1, sy1);
      }

      p.image(trailBuffer, 0, 0);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      trailBuffer.remove();
      trailBuffer = p.createGraphics(p.width, p.height);
      trailBuffer.colorMode(p.RGB, 255);
      trailBuffer.background(26, 5, 51);
    };
  },
};

export default strangeAttractor;
