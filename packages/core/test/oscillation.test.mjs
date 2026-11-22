import assert from "node:assert/strict";
import test from "node:test";
import { createPendulumRun, measurePeriod, parseRun, serializeRun } from "../dist/index.js";

test("the pendulum has nine complete crossing intervals and a 1.2 s period", () => {
  const run = parseRun(serializeRun(createPendulumRun()));
  const result = measurePeriod(run.samples.rotation, { segment: 0 });
  assert.equal(result.cycles, 9);
  assert.ok(Math.abs(result.periodSeconds - 1.2) < 1e-6);
  assert.ok(result.longestSeconds - result.shortestSeconds < 1e-6);
});

test("the estimate follows source time with biased, unevenly sampled motion", () => {
  const trace = Array.from({ length: 500 }, (_, i) => {
    const t = 45 + i / 40 + Math.sin(i) * 0.004;
    return { t, value: 11 + 3 * Math.sin(2 * Math.PI * t / 1.75), segment: 3 };
  });
  assert.ok(Math.abs(measurePeriod(trace, { segment: 3 }).periodSeconds - 1.75) < 0.001);
});

test("midline chatter counts once per full excursion", () => {
  const cycle = [-2, -1, 0.05, -0.05, 0.1, 1, 2, 1];
  const trace = Array.from({ length: 32 }, (_, t) => ({ t, value: cycle[t % cycle.length], segment: 0 }));
  assert.equal(measurePeriod(trace, { segment: 0 }).cycles, 3);
});

test("a clock reset, quiet channel or short recording produces no estimate", () => {
  const trace = createPendulumRun().samples.rotation;
  const options = { segment: 0 };
  assert.equal(measurePeriod(trace.slice(0, 80), options), null);
  assert.equal(measurePeriod(trace.map(s => ({ ...s, segment: Math.floor(s.t) })), options), null);
  assert.equal(measurePeriod(trace, { segment: 0, minimumAmplitude: 3 }), null);
  assert.equal(measurePeriod(trace.map(s => ({ ...s, value: 1 })), options), null);
  assert.throws(() => measurePeriod(trace, { segment: 0, minimumAmplitude: -1 }), RangeError);
});
