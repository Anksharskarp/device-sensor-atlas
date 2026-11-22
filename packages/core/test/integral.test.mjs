import assert from "node:assert/strict";
import test from "node:test";
import { integrateInterval } from "../dist/index.js";

const series = [[0, 0], [1, 6], [4, 0]].map(([t, value]) => ({ t, value, segment: 0 }));
const linear = { interpolation: "linear" };

test("linear and held values give different integrals on uneven source timestamps", () => {
  assert.deepEqual(integrateInterval(series, 0, 0, 4, linear), { area: 12, coveredSeconds: 4, intervals: 2, timeMean: 3 });
  assert.equal(integrateInterval(series, 0, 4, 0, { interpolation: "previous" }).area, 18);
  assert.equal(integrateInterval(series, 0, 1.5, 2, linear).area, 2.25);
});

test("only covered time contributes, including when a source resets its clock", () => {
  const trace = [...series, { t: 0, value: -2, segment: 1 }, { t: 1, value: -2, segment: 1 }];
  assert.deepEqual(integrateInterval(trace, 0, -1, 80, { ...linear, maxGapSeconds: 2 }),
    { area: 3, coveredSeconds: 1, intervals: 1, timeMean: 3 });
  assert.equal(integrateInterval(trace, 1, -20, 20, linear).area, -2);
  assert.equal(integrateInterval(trace, 0, 2, 2, linear), null);
  assert.equal(integrateInterval(trace, 0, 4, 5, linear), null);
  assert.throws(() => integrateInterval(trace, 0, 0, 1, { ...linear, maxGapSeconds: 0 }));
});
