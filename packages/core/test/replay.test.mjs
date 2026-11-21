import assert from "node:assert/strict";
import test from "node:test";
import { createReplay } from "../dist/index.js";

test("a late replay tick drains every due sample once and keeps original timestamps", () => {
  const trace = [50, 50.25, 51, 53].map(t => ({ t, value: t, segment: 2 }));
  trace.push({ t: 0, value: -1, segment: 3 });
  const replay = createReplay(trace, 2);
  assert.deepEqual(replay.takeUntil(0), [trace[0]]);
  assert.deepEqual(replay.takeUntil(2), trace.slice(1, 3));
  assert.deepEqual(replay.takeUntil(2), []);
  assert.deepEqual(replay.takeUntil(3), [trace[3]]);
  assert.equal(replay.done, true);
  assert.equal(createReplay(trace, 7).done, true);
});
