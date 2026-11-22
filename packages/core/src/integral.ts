import type { Reading } from "./types.js";

export interface IntegrationOptions {
  interpolation: "linear" | "previous";
  maxGapSeconds?: number;
}

/** Area in channel units times seconds over the covered part of one segment. */
export function integrateInterval(readings: readonly Reading[], segment: number, a: number, b: number, options: IntegrationOptions) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new RangeError("Invalid interval");
  const { interpolation, maxGapSeconds } = options;
  if (interpolation !== "linear" && interpolation !== "previous") throw new RangeError("Unknown interpolation");
  if (maxGapSeconds !== undefined && (!Number.isFinite(maxGapSeconds) || maxGapSeconds <= 0)) {
    throw new RangeError("Invalid maximum gap");
  }
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  let area = 0;
  let coveredSeconds = 0;
  let intervals = 0;
  let previous: Reading | undefined;
  for (const sample of readings) {
    if (sample.segment !== segment) continue;
    const left = previous;
    previous = sample;
    if (!left) continue;
    if (left.t >= end) break;
    const dt = sample.t - left.t;
    const from = Math.max(start, left.t);
    const to = Math.min(end, sample.t);
    if (to <= from || (maxGapSeconds !== undefined && dt > maxGapSeconds)) continue;
    const duration = to - from;
    let average = left.value;
    if (interpolation === "linear") {
      const midpointFraction = ((from - left.t) + duration / 2) / dt;
      average = left.value * (1 - midpointFraction) + sample.value * midpointFraction;
    }
    area += average * duration;
    coveredSeconds += duration;
    intervals++;
  }
  return intervals ? { area, coveredSeconds, intervals, timeMean: area / coveredSeconds } : null;
}
