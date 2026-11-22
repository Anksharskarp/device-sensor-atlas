import type { Run } from "./types.js";

export type Axis = "x" | "y" | "z";
const axes: readonly Axis[] = ["x", "y", "z"];

/** Bind one accelerometer, expressed in g, to its device axes. */
export function gravityAxes(run: Run): Record<Axis, string> | null {
  const binding: Partial<Record<Axis, string>> = {};
  let clock: string | undefined;
  for (const [key, channel] of Object.entries(run.channels)) {
    const axis = channel.axis as Axis;
    if (channel.quantity !== "acceleration" || channel.unit !== "g" || !axes.includes(axis)) continue;
    if (binding[axis] !== undefined || (clock !== undefined && channel.clock !== clock)) return null;
    binding[axis] = key;
    clock = channel.clock;
  }
  return axes.every(axis => binding[axis] !== undefined) ? binding as Record<Axis, string> : null;
}

export function gravityPose(run: Run, segment: number) {
  const binding = gravityAxes(run);
  if (!binding) throw new Error("Choose three acceleration axes in g on the same clock");
  const [x, y, z] = axes.map(axis => run.samples[binding[axis]].filter(s => s.segment === segment));
  const count = x.length;
  if (count < 10 || y.length !== count || z.length !== count) throw new Error("Collect at least ten simultaneous readings on each axis");
  const mean = { x: 0, y: 0, z: 0 };
  for (let i = 0; i < count; i++) {
    if (x[i].t !== y[i].t || x[i].t !== z[i].t) throw new Error("Axis timestamps must match");
    const g = Math.hypot(x[i].value, y[i].value, z[i].value);
    if (Math.abs(g - 1) > 0.1) throw new Error("Acceleration outside 0.9 to 1.1 g. Rest the phone and repeat");
    mean.x += x[i].value / count;
    mean.y += y[i].value / count;
    mean.z += z[i].value / count;
  }
  let sumSquares = 0;
  for (let i = 0; i < count; i++) {
    sumSquares += (x[i].value - mean.x) ** 2 + (y[i].value - mean.y) ** 2 + (z[i].value - mean.z) ** 2;
  }
  const rmsDeviation = Math.sqrt(sumSquares / count);
  if (rmsDeviation > 0.03) throw new Error("The phone moved during collection. Repeat this position");
  return { mean, count, rmsDeviation, durationSeconds: x[count - 1].t - x[0].t };
}

/** Unsigned change in gravity direction between two stationary positions. */
export function measureTilt(run: Run, referenceSegment = 0, trialSegment = 1) {
  if (referenceSegment === trialSegment) throw new Error("Select two different positions");
  const reference = gravityPose(run, referenceSegment);
  const trial = gravityPose(run, trialSegment);
  const a = reference.mean;
  const b = trial.mean;
  const cross = Math.hypot(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
  const dot = a.x * b.x + a.y * b.y + a.z * b.z;
  return { degrees: Math.atan2(cross, dot) * 180 / Math.PI, reference, trial };
}
