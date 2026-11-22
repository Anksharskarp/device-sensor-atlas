import assert from "node:assert/strict";
import test from "node:test";
import { createInstrument, gravityAxes, measureTilt, parseRun, serializeRun } from "../dist/index.js";

function tiltRun(angle) {
  const channels = Object.fromEntries(["x", "y", "z"].map(axis => ["acc" + axis, {
    axis, quantity: "acceleration", unit: "g", clock: "phone",
  }]));
  const lab = createInstrument({ channels });
  const radians = angle * Math.PI / 180;
  lab.start("Two positions");
  for (const [i, xyz] of [[0, 0, -1], [Math.sin(radians), 0, -Math.cos(radians)]].entries()) {
    Object.keys(channels).forEach((key, j) => {
      if (i) lab.gap(key);
      lab.writeBatch(key, Array.from({length: 25}, (_, n) => ({ t: n / 50, value: xyz[j] })));
    });
  }
  return parseRun(serializeRun(lab.stop()));
}

test("reproduce a two-position tilt from the saved axis samples", () => {
  for (const angle of [0, 0.1, 30, 90, 180]) {
    const result = measureTilt(tiltRun(angle));
    assert.ok(Math.abs(result.degrees - angle) < 1e-9);
    assert.equal(result.reference.count, 25);
  }
});

test("reject motion, mismatched clocks and unpaired readings", () => {
  const run = tiltRun(0);
  run.samples.accx[0].t = -1;
  assert.throws(() => measureTilt(run), /timestamps/);
  run.samples.accx[0].t = 0;
  run.samples.accz[0].value = 2;
  assert.throws(() => measureTilt(run), /Acceleration outside/);
  run.samples.accz[0].value = 1;
  assert.throws(() => measureTilt(run), /moved/);
  run.channels.accy.clock = "board";
  assert.equal(gravityAxes(run), null);
});
