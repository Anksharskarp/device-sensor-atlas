import type { Run } from "./types.js";

/** A synthetic 50 Hz run with positive peaks 1.2 seconds apart. */
export function createPendulumRun(): Run<"rotation"> {
  const period = 1.2;
  const rate = 50;
  const samples = Array.from({ length: 10 * period * rate + 1 }, (_, i) => {
    const t = i / rate;
    return { t, value: 2 * Math.cos(2 * Math.PI * t / period), segment: 0 };
  });
  return {
    version: 1,
    name: "Pendulum model",
    channels: { rotation: { quantity: "angularVelocity", unit: "rad/s", axis: "z", clock: "model" } },
    samples: { rotation: samples },
  };
}
