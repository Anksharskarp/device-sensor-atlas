import { createInstrument, integrateInterval, type Channel, type Reading, type Run } from "@sensor-atlas/core";

export function powerChannel(clock: string): Channel {
  return { quantity: "power", unit: "W", clock };
}

export function measureEnergy(readings: readonly Reading[], segment: number, a: number, b: number) {
  const result = integrateInterval(readings, segment, a, b, { interpolation: "linear" });
  if (!result) return null;
  return { wattHours: result.area / 3600, meanWatts: result.timeMean, coveredSeconds: result.coveredSeconds };
}

/** A 60 W load ramps up for 15 seconds, holds for a minute, then ramps down. */
export function powerExample(): Run<"load"> {
  const lab = createInstrument({ channels: { load: powerChannel("model") } });
  lab.start("60 W load cycle");
  const times = [0, 2, 8, 15, 21, 36, 40, 70, 75, 79, 85, 90, 100, 120];
  lab.writeBatch("load", times.map(t => ({
    t, value: Math.max(0, Math.min(60, 4 * t, 4 * (90 - t))),
  })));
  return lab.stop();
}
