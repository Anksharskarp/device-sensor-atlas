import type { Reading } from "./types.js";
import { checkLimit } from "./validation.js";

/** Retain both extrema in time order for every occupied display column. */
export function traceEnvelope(readings: readonly Reading[], segment: number, start: number, end: number, columns: number) {
  checkLimit(columns, "columns");
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new RangeError("Invalid time window");
  const points: Reading[] = [];
  let column = -1;
  let first: Reading | undefined;
  let last: Reading | undefined;
  let min: Reading | undefined;
  let max: Reading | undefined;
  function flush() {
    if (!first || !last || !min || !max) return;
    const ordered = new Set([first, ...(min.t < max.t ? [min, max] : [max, min]), last]);
    points.push(...ordered);
  }
  for (const sample of readings) {
    if (sample.segment !== segment || sample.t < start || sample.t > end) continue;
    const x = Math.min(columns - 1, Math.floor(columns * ((sample.t - start) / (end - start))));
    if (x !== column) {
      flush();
      column = x;
      first = min = max = sample;
    }
    if (sample.value < min!.value) min = sample;
    if (sample.value > max!.value) max = sample;
    last = sample;
  }
  flush();
  return points;
}
