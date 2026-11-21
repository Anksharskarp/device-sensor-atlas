import assert from "node:assert/strict";
import test from "node:test";
import { traceEnvelope } from "../dist/index.js";

test("an impulse and dip survive even in the same pixel", () => {
  const trace = [0, 4, 0, -2, 0, 0].map((value, t) => ({ t, value, segment: 0 }));
  trace.push({ t: 2, value: 40, segment: 1 });
  assert.deepEqual(traceEnvelope(trace, 0, 0, 5, 1).map(s => s.t), [0, 1, 3, 5]);
});
