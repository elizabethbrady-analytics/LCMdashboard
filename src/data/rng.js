// Deterministic PRNG utilities. Same seed → identical data on every load,
// so reviewers always see the same numbers and worked examples.

export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** rng in [min, max) */
export const range = (rng, min, max) => min + rng() * (max - min)

/** Approximately normal via sum of uniforms, clamped */
export function noisy(rng, base, spread) {
  const n = (rng() + rng() + rng()) / 3 // ~normal around 0.5
  return base * (1 + (n - 0.5) * 2 * spread)
}
