/** A pseudo-random number generator returning floats in `[0, 1)`. */
export type Rng = () => number;

/** Hash a string into a 32-bit seed (xmur3). */
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/** A fast, well-distributed 32-bit PRNG (mulberry32). */
function mulberry32(a: number): Rng {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build a deterministic {@link Rng} from a seed string. The same seed always
 * yields the same sequence — this is what makes {@link configFromSeed}
 * reproducible across machines and runs, like dicebear.
 */
export function createRng(seed: string): Rng {
  const seeder = xmur3(seed);
  return mulberry32(seeder());
}
