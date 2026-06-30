import { MOCK_DETERMINISTIC_SEED } from "../constants/layout";

/** Mulberry32 — fast deterministic PRNG for mock UI (tape lane, demos). */
export function createSeededRandom(seed = MOCK_DETERMINISTIC_SEED): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pickFromPool<T>(rng: () => number, pool: T[]): T {
  return pool[Math.floor(rng() * pool.length)] ?? pool[0]!;
}
