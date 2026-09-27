// Seeded randomness so the demo data is the same on every load.

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = <T,>(r: Rng, items: readonly T[]): T => items[Math.floor(r() * items.length)];

export const int = (r: Rng, min: number, max: number) => min + Math.floor(r() * (max - min + 1));

export function hex(r: Rng, length: number) {
  let out = "";
  for (let i = 0; i < length; i++) out += "0123456789abcdef"[Math.floor(r() * 16)];
  return out;
}

/** Log-normal sample around `median`; `spread` ≈ how many e-folds one σ is. */
export function logNormal(r: Rng, median: number, spread: number) {
  const u = 1 - r();
  const v = r();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return median * Math.exp(spread * z);
}

/** Index into `weights`, chosen proportionally. */
export function weighted(r: Rng, weights: readonly number[], total?: number) {
  const sum = total ?? weights.reduce((a, b) => a + b, 0);
  let x = r() * sum;
  for (let i = 0; i < weights.length; i++) {
    x -= weights[i];
    if (x <= 0) return i;
  }
  return weights.length - 1;
}
