import assert from "node:assert/strict";
import test from "node:test";
import { createInstrument } from "../dist/index.js";

const channel = { quantity: "voltage", unit: "V", clock: "board" };
const make = () => createInstrument({ channels: { probe: channel, aux: channel }, historySize: 3, captureLimit: 5 });
const samples = values => values.map((value, t) => ({ value, t }));
const rising = { channel: "probe", edge: "rising", level: 1 };

test("an edge inside a batch retains wrapped prehistory and the crossing exactly once", () => {
  const lab = make();
  lab.arm({ ...rising, preSamples: 3, name: "Tap" });
  lab.writeBatch("probe", samples([-4, -3, -2, 0, 1, 2, 3]));
  assert.equal(lab.endedBy, "limit");
  assert.deepEqual(lab.lastRun.samples.probe.map(s => s.t), [1, 2, 3, 4, 5]);
  assert.deepEqual(lab.lastRun.trigger, { ...rising, t: 4, segment: 0 });
  assert.equal(lab.lastRun.name, "Tap");
  assert.equal(lab.armed, undefined);
});

test("clock resets, other channels and rejected timestamps cannot fire an edge", () => {
  const lab = make();
  lab.write("probe", { t: 90, value: 4 });
  lab.arm({ channel: "probe", edge: "falling", level: 0, preSamples: 2 });
  lab.gap("probe");
  lab.writeBatch("aux", samples([2, -2]));
  lab.writeBatch("probe", samples([-2, 2]));
  lab.write("probe", { t: 0, value: -2 });
  assert.equal(lab.collecting, false);
  lab.write("probe", { t: 2, value: -2 });
  lab.write("aux", { t: 2, value: 3 });
  const run = lab.stop();
  assert.deepEqual(run.samples.probe.map(s => s.t), [0, 1, 2]);
  assert.equal(run.trigger.segment, 1);
  assert.equal(run.samples.aux.length, 1);
});

test("disarming permits a new manual run and invalid settings leave the instrument idle", () => {
  const lab = make();
  for (const override of [{ level: NaN }, { edge: "both" }, { preSamples: 4 }, { durationSeconds: 0 }]) {
    assert.throws(() => lab.arm({ ...rising, ...override }));
    assert.equal(lab.armed, undefined);
  }
  lab.arm(rising);
  assert.throws(() => lab.start());
  lab.disarm();
  lab.start();
  assert.throws(() => lab.arm(rising));
  assert.equal(lab.stop().trigger, undefined);
});

test("a zero-history timed trigger ends when its timer expires", async () => {
  const lab = make();
  lab.arm({ ...rising, preSamples: 0, durationSeconds: 0.001 });
  lab.writeBatch("probe", samples([0, 1]));
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(lab.endedBy, "timer");
  assert.equal(lab.lastRun.samples.probe.length, 1);
});
