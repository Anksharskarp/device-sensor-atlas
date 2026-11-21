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

test("a run outlives the ring and the following capture", () => {
  const lab = make();
  lab.write("rotation", sample(-1));
  lab.start("Short swing");
  lab.writeBatch("rotation", [0, 1, 2, 3].map(sample));
  const first = lab.stop();
  lab.start("Long swing");
  assert.equal(lab.lastRun, first);
  lab.gap("rotation");
  lab.write("rotation", sample(0));
  assert.equal(lab.stop().samples.rotation[0].segment, 1);
  assert.equal(first.samples.rotation.length, 4);
});

test("hitting the capture limit preserves the rest of the live batch", () => {
  const lab = createInstrument({ channels: { rotation }, captureLimit: 2 });
  lab.start();
  lab.writeBatch("rotation", [0, 1, 2].map(sample));
  assert.equal(lab.collecting, false);
  assert.equal(lab.endedBy, "limit");
  assert.equal(lab.lastRun.samples.rotation.length, 2);
  assert.equal(lab.readings("rotation").length, 3);
});

test("a timed run finishes even when the source is idle", async () => {
  const lab = make();
  lab.start("Quiet", 0.001);
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(lab.endedBy, "timer");
  assert.deepEqual(lab.lastRun.samples.rotation, []);
});
