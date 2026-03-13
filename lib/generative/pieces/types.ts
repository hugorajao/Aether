import type p5 from 'p5';

export interface PieceParameter {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  description: string;
}

export interface GenerativePiece {
  id: string;
  title: string;
  artistStatement: string;
  algorithm: string;
  year: number;
  defaultSeed: number;
  parameters: PieceParameter[];
  sketch: (p: p5, params: Record<string, number>, seed: number) => void;
  dominantColor: string;
  colorPalette: string[];
  tags: string[];
}
