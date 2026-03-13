import type { GenerativePiece } from './types';

import erosionMemory from './erosion-memory';
import harmonicLattice from './harmonic-lattice';
import chromaticDrift from './chromatic-drift';
import mycelialNetwork from './mycelial-network';
import frequencyDomain from './frequency-domain';
import accretion from './accretion';
import sineCartography from './sine-cartography';
import swarmIntelligence from './swarm-intelligence';
import penroseTiling from './penrose-tiling';
import reactionDiffusion from './reaction-diffusion';
import strangeAttractor from './strange-attractor';
import recursiveBreath from './recursive-breath';

export const pieces: Record<string, GenerativePiece> = {
  'erosion-memory': erosionMemory,
  'harmonic-lattice': harmonicLattice,
  'chromatic-drift': chromaticDrift,
  'mycelial-network': mycelialNetwork,
  'frequency-domain': frequencyDomain,
  'accretion': accretion,
  'sine-cartography': sineCartography,
  'swarm-intelligence': swarmIntelligence,
  'penrose-tiling': penroseTiling,
  'reaction-diffusion': reactionDiffusion,
  'strange-attractor': strangeAttractor,
  'recursive-breath': recursiveBreath,
};

export const pieceList: GenerativePiece[] = Object.values(pieces);

export const pieceIds = Object.keys(pieces);

export function getPiece(id: string): GenerativePiece | undefined {
  return pieces[id];
}

export type { GenerativePiece, PieceParameter } from './types';
