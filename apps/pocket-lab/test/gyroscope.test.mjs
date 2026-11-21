import assert from "node:assert/strict";
import test from "node:test";
import { setImmediate } from "node:timers/promises";
import { createInstrument } from "@sensor-atlas/core";
import { connectGyroscope } from "../src/gyroscope.ts";

function setup() {
  const c = { clock: "phone", quantity: "angularVelocity", unit: "rad/s" };
  const instrument = createInstrument({ channels: { x: c, y: c, z: c } });
  let callback;
  let removed = 0;
  const sensor = {
    async isAvailableAsync() { return true; },
    async requestPermissionsAsync() { return { granted: true }; },
    setUpdateInterval(ms) { assert.equal(ms, 20); },
    addListener(fn) { callback = fn; return { remove() { removed++; } }; },
  };
  return { instrument, sensor, send: s => callback(s), removed: () => removed };
}

test("the gyro recipe keeps source seconds and closes all axes on disconnect", async () => {
  const source = setup();
  const stop = connectGyroscope(source.sensor, source.instrument, assert.fail);
  await setImmediate();
  source.send({ timestamp: 20.5, x: -1, y: 0, z: 2 });
  assert.deepEqual(source.instrument.readings("z"), [{ t: 20.5, value: 2, segment: 0 }]);
  stop();
  stop();
  assert.equal(source.removed(), 1);
  assert.equal(source.instrument.diagnostics("y").segment, 1);
});

test("leaving before permission resolves prevents a late subscription", async () => {
  const source = setup();
  let resolve;
  source.sensor.requestPermissionsAsync = () => new Promise(done => { resolve = done; });
  source.sensor.addListener = assert.fail;
  const stop = connectGyroscope(source.sensor, source.instrument, assert.fail);
  await setImmediate();
  stop();
  resolve({ granted: true });
  await setImmediate();
});
