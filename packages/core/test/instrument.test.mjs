import assert from "node:assert/strict";
import test from "node:test";
import { createInstrument } from "../dist/index.js";

const rotation = { quantity: "angularVelocity", unit: "rad/s", clock: "phone" };
const make = () => createInstrument({ channels: { rotation }, historySize: 2 });
const sample = t => ({ t, value: 0 });

test("the history wraps and a reset starts a new segment", () => {
  const lab = make();
  assert.equal(lab.writeBatch("rotation", [1, 2, 2, 0, 3].map(sample)), 3);
  assert.deepEqual(lab.diagnostics("rotation"), { outOfOrder: 2, segment: 0, observedHz: 1 });
  lab.gap("rotation");
  lab.write("rotation", sample(0));
  assert.deepEqual(lab.readings("rotation").map(s => [s.t, s.segment]), [[3, 0], [0, 1]]);
});

test("a malformed batch leaves history intact", () => {
  const lab = make();
  assert.throws(() => lab.writeBatch("rotation", [sample(1), sample(NaN)]), /finite/);
  assert.deepEqual(lab.readings("rotation"), []);
  lab.dispose();
  assert.throws(() => lab.write("rotation", sample(2)), /disposed/);
});
