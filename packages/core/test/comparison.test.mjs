import assert from "node:assert/strict";
import test from "node:test";
import { comparePeriods, createPendulumRun } from "../dist/index.js";

const pick = run => ({ run, channel: "rotation", segment: 0 });

test("compare periods across clock origins without resampling the traces", () => {
  const a = createPendulumRun();
  const b = createPendulumRun();
  b.samples.rotation = b.samples.rotation.map(s => ({ ...s, t: 300 + s.t * 1.5 }));
  const before = JSON.stringify(b);
  const comparison = comparePeriods(pick(a), pick(b));
  assert.ok(Math.abs(comparison.changePercent - 50) < 1e-8);
  assert.ok(Math.abs(comparison.differenceSeconds - 0.6) < 1e-8);
  assert.ok(comparison.trial.origin > 300);
  assert.equal(JSON.stringify(b), before);
});

test("reject unmeasurable segments and mixed units", () => {
  const a = createPendulumRun();
  const b = createPendulumRun();
  b.channels.rotation.unit = "deg/s";
  assert.throws(() => comparePeriods(pick(a), pick(b)), /same quantity and unit/);
  assert.throws(() => comparePeriods(pick(a), { ...pick(a), segment: 4 }), /crossings/);
});
