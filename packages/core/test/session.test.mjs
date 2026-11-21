import assert from "node:assert/strict";
import test from "node:test";
import { channelCsv, createPendulumRun, parseRun, serializeRun } from "../dist/index.js";

test("reopening a session preserves every cursor input", () => {
  const run = createPendulumRun();
  assert.deepEqual(parseRun(serializeRun(run)), run);
  const csv = channelCsv(run, "rotation").split("\r\n");
  assert.equal(csv[1], "0,0,2");
  assert.equal(csv.at(-2), "0,12,2");
});

test("the reader validates segments, clocks and the channel map", () => {
  for (const mutate of [
    r => r.version++,
    r => r.channels.rotation.clock = "",
    r => r.samples.other = [],
    r => r.samples.rotation[1].segment = -1,
    r => r.samples.rotation[1].t = 0,
    r => r.samples.rotation[0].segment = 10,
    r => r.samples.rotation[0].value = null,
  ]) {
    const run = createPendulumRun();
    mutate(run);
    assert.throws(() => parseRun(JSON.stringify(run)));
  }
});

test("the v1 reader accepts a recording that begins mid-segment", async () => {
  const { readFile } = await import("node:fs/promises");
  const json = await readFile(new URL("./fixtures/reset-v1.json", import.meta.url), "utf8");
  const run = parseRun(json);
  assert.deepEqual(run.samples.voltage.map(s => s.segment), [1, 2]);
  assert.deepEqual(run.samples.current, []);
});
