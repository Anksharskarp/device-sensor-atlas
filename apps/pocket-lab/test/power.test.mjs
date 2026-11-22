import test from "node:test";
import assert from "node:assert/strict";
import { parseRun, serializeRun } from "@sensor-atlas/core";
import { measureEnergy, powerExample } from "../src/instruments/power.ts";

test("a saved two-minute load cycle delivers 1.25 Wh", () => {
  const { samples } = parseRun(serializeRun(powerExample()));
  assert.deepEqual(measureEnergy(samples.load, 0, 0, 120), { wattHours: 1.25, meanWatts: 37.5, coveredSeconds: 120 });
  assert.equal(measureEnergy(samples.load, 0, 15, 75).wattHours, 1);
  assert.equal(measureEnergy(samples.load, 0, 75, 15).wattHours, 1);
});
