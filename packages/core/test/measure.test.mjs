import test from "node:test";
import assert from "node:assert/strict";
import { createPendulumRun, measureInterval, nearestSample } from "../dist/index.js";

const trace = createPendulumRun().samples.rotation;
test("ten periods span twelve seconds between acquired peaks", () => {
  const a = nearestSample(trace, 0, 0.002);
  const b = nearestSample(trace, 0, 11.999);
  assert.equal((b.t - a.t) / 10, 1.2);
  assert.equal(a.value, b.value);
  const stats = measureInterval(trace, 0, a.t, b.t);
  assert.equal(stats.count, 601);
  assert.equal(stats.coveredSeconds, 12);
});

test("a cursor stays in its segment and breaks ties toward the earlier sample", () => {
  const series = [
    { segment: 0, t: 0, value: 0 }, { segment: 0, t: 2, value: 6 },
    { segment: 1, t: 0, value: 42 },
  ];
  assert.equal(nearestSample(series, 0, 1).value, 0);
  assert.equal(nearestSample(series, 2, 1), null);
  assert.equal(measureInterval(series, 0, 0.1, 0.9), null);
  assert.deepEqual(measureInterval(series, 0, 2, 0), {
    count: 2, min: 0, max: 6, sampleMean: 3, coveredSeconds: 2, deltaValue: -6,
  });
});
