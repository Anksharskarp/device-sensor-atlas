import assert from "node:assert/strict";
import test from "node:test";
import { setImmediate } from "node:timers/promises";
import { measureTilt } from "@sensor-atlas/core";
import { collectPose, tiltRun } from "../src/accelerometer.ts";

function source() {
  let listener;
  let removals = 0;
  return {
    async isAvailableAsync() { return true; },
    async requestPermissionsAsync() { return { granted: true }; },
    setUpdateInterval(ms) { assert.equal(ms, 20); },
    addListener(callback) { listener = callback; return { remove() { removals++; } }; },
    send(timestamp, x, z) { listener({ timestamp, x, y: 0, z }); },
    removed() { return removals; },
  };
}

test("collect two poses and reproduce the angle from the original samples", async () => {
  const sensor = source();
  const poses = [];
  for (const [x, z] of [[0, -1], [0.5, -Math.sqrt(0.75)]]) {
    const promise = collectPose(sensor, new AbortController().signal);
    await setImmediate();
    sensor.send(0, x, z);
    for (let i = 0; i < 30; i++) sensor.send(i / 50, x, z);
    poses.push(await promise);
  }
  assert.equal(sensor.removed(), 2);
  assert.equal(poses[0].length, 25);
  assert.ok(Math.abs(measureTilt(tiltRun(...poses)).degrees - 30) < 1e-9);
});

test("closing collection releases the accelerometer subscription", async () => {
  const sensor = source();
  const controller = new AbortController();
  const promise = collectPose(sensor, controller.signal);
  await setImmediate();
  controller.abort();
  await assert.rejects(promise, /interrupted/);
  assert.equal(sensor.removed(), 1);
});
