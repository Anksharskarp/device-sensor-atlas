import assert from "node:assert/strict";
import test from "node:test";
import { createInstrument } from "../dist/index.js";
import { bindSocket } from "@sensor-atlas/core/websocket";

test("the socket recipe reads numeric frames and marks a single disconnect", () => {
  const lab = createInstrument({ channels: { probe: { quantity: "angle", unit: "rad", clock: "board" } } });
  const socket = new EventTarget();
  let invalid = 0;
  const disconnect = bindSocket(socket, lab, "probe", () => invalid++);
  const send = data => socket.dispatchEvent(new MessageEvent("message", { data }));
  send('{"t":1,"value":0}');
  send('{');
  send('{"t":2,"value":null}');
  socket.dispatchEvent(new Event("close"));
  send('{"t":3,"value":4}');
  disconnect();
  assert.equal(invalid, 2);
  assert.equal(lab.readings("probe").length, 1);
  assert.equal(lab.diagnostics("probe").segment, 1);
});

test("batch frames validate as a unit and preserve threshold and timestamp handling", () => {
  const lab = createInstrument({ channels: { gate: { quantity: "voltage", unit: "V", clock: "board" } } });
  const socket = new EventTarget();
  let invalid = 0;
  const detach = bindSocket(socket, lab, "gate", () => invalid++);
  const send = frame => socket.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(frame) }));
  lab.arm({ channel: "gate", edge: "rising", level: 1, preSamples: 1 });
  send([]);
  send([{ t: 1, value: 0 }, { t: 2, value: null }]);
  assert.equal(invalid, 2);
  assert.deepEqual(lab.readings("gate"), []);
  send([{ t: 1, value: 0 }, { t: 2, value: 2 }, { t: 2, value: 3 }, { t: 4, value: 1 }]);
  const run = lab.stop();
  assert.equal(run.trigger.t, 2);
  assert.deepEqual(run.samples.gate.map(s => [s.t, s.value]), [[1, 0], [2, 2], [4, 1]]);
  assert.equal(lab.diagnostics("gate").outOfOrder, 1);
  assert.equal(invalid, 2);
  detach();
});
