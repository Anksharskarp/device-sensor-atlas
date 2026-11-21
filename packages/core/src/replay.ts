import type { Reading } from "./types.js";

/** Read one uninterrupted segment at its original cadence using an elapsed-time clock. */
export function createReplay(readings: readonly Reading[], segment: number) {
  const trace = readings.filter(sample => sample.segment === segment);
  const origin = trace[0]?.t ?? 0;
  let next = 0;
  return {
    get done() { return next === trace.length; },
    takeUntil(elapsedSeconds: number) {
      if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) throw new RangeError("Invalid replay time");
      const from = next;
      while (next < trace.length && trace[next].t - origin <= elapsedSeconds) next++;
      return trace.slice(from, next);
    },
  };
}
