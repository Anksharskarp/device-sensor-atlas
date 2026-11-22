import { measurePeriod } from "./oscillation.js";
import type { Run } from "./types.js";

export interface RunSelection {
  run: Run;
  channel: string;
  segment: number;
}

/** Align the first measured rising crossing of each trace. Source times stay intact. */
export function comparePeriods(reference: RunSelection, trial: RunSelection) {
  function inspect({ run, channel, segment }: RunSelection) {
    if (!Object.hasOwn(run.channels, channel)) throw new Error("Unknown channel: " + channel);
    const measurement = measurePeriod(run.samples[channel], { segment });
    if (!measurement) throw new Error(run.name + " needs at least three rising crossings in one segment");
    return { channel: run.channels[channel], measurement, origin: measurement.crossings[0] };
  }
  const a = inspect(reference);
  const b = inspect(trial);
  if (a.channel.quantity !== b.channel.quantity || a.channel.unit !== b.channel.unit) {
    throw new Error("Choose channels with the same quantity and unit");
  }
  const differenceSeconds = b.measurement.periodSeconds - a.measurement.periodSeconds;
  return {
    reference: a, trial: b, differenceSeconds,
    changePercent: differenceSeconds / a.measurement.periodSeconds * 100,
  };
}
