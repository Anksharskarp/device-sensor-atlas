import type { Reading } from "./types.js";

export interface PeriodOptions {
  segment: number;
  /** Lower bound for half the 5th-to-95th percentile range, in channel units. */
  minimumAmplitude?: number;
}

export interface PeriodMeasurement {
  crossings: number[];
  cycles: number;
  periodSeconds: number;
  frequencyHz: number;
  shortestSeconds: number;
  longestSeconds: number;
  level: number;
  amplitude: number;
}

/** Time rising midline crossings in one uninterrupted segment. */
export function measurePeriod(readings: readonly Reading[], { segment, minimumAmplitude = 0 }: PeriodOptions): PeriodMeasurement | null {
  if (!Number.isFinite(minimumAmplitude) || minimumAmplitude < 0) throw new RangeError("Invalid minimum amplitude");
  const trace = readings.filter(s => s.segment === segment);
  if (trace.length < 6) return null;
  const values = trace.map(s => s.value).sort((a, b) => a - b);
  const low = values[Math.floor((values.length - 1) * 0.05)];
  const high = values[Math.ceil((values.length - 1) * 0.95)];
  const level = low / 2 + high / 2;
  const amplitude = high / 2 - low / 2;
  if (amplitude <= 0 || amplitude < minimumAmplitude) return null;

  // A crossing must travel through both sides of the band. A brief reversal
  // at the midline cannot count twice.
  const band = amplitude * 0.2;
  let armed = trace[0].value <= level - band;
  let candidate: number | undefined;
  const crossings: number[] = [];
  for (let i = 1; i < trace.length; i++) {
    const a = trace[i - 1];
    const b = trace[i];
    if (b.value <= level - band) {
      armed = true;
      candidate = undefined;
    }
    if (!armed) continue;
    if (a.value < level && b.value >= level) {
      const fraction = (level - a.value) / (b.value - a.value);
      candidate = a.t + fraction * (b.t - a.t);
    }
    if (candidate !== undefined && b.value >= level + band) {
      crossings.push(candidate);
      armed = false;
      candidate = undefined;
    }
  }
  if (crossings.length < 3) return null;
  let shortestSeconds = Infinity;
  let longestSeconds = 0;
  for (let i = 1; i < crossings.length; i++) {
    const interval = crossings[i] - crossings[i - 1];
    shortestSeconds = Math.min(shortestSeconds, interval);
    longestSeconds = Math.max(longestSeconds, interval);
  }
  const cycles = crossings.length - 1;
  const periodSeconds = (crossings[cycles] - crossings[0]) / cycles;
  return { crossings, cycles, periodSeconds, frequencyHz: 1 / periodSeconds, shortestSeconds, longestSeconds, level, amplitude };
}
