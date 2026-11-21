import assert from "node:assert/strict";
import test from "node:test";
import { createInstrument } from "../dist/index.js";
import { bindSocket } from "../../../examples/websocket.ts";

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
