import type { Reading } from "./types.js";

export function nearestSample(readings: readonly Reading[], segment: number, t: number): Reading | null {
  if (!Number.isFinite(t)) throw new RangeError("Invalid cursor time");
  let nearest: Reading | null = null;
  for (const sample of readings) {
    if (sample.segment !== segment) continue;
    if (nearest && Math.abs(sample.t - t) >= Math.abs(nearest.t - t)) break;
    nearest = sample;
  }
  return nearest;
}

export function measureInterval(readings: readonly Reading[], segment: number, a: number, b: number) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new RangeError("Invalid interval");
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  let first: Reading | undefined;
  let last: Reading | undefined;
  let min = Infinity;
  let max = -Infinity;
  let count = 0;
  let mean = 0;
  for (const sample of readings) {
    if (sample.segment !== segment || sample.t < start || sample.t > end) continue;
    first ??= sample;
    last = sample;
    min = Math.min(min, sample.value);
    max = Math.max(max, sample.value);
    count++;
    mean = mean * ((count - 1) / count) + sample.value / count;
  }
  if (!first || !last) return null;
  return {
    count, min, max, sampleMean: mean,
    coveredSeconds: last.t - first.t,
    deltaValue: (b >= a ? 1 : -1) * (last.value - first.value),
  };
}
