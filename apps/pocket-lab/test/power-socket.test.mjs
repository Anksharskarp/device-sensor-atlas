import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createInstrument } from "@sensor-atlas/core";
import { bindSocket } from "@sensor-atlas/core/websocket";
import { servePowerExample } from "../../../examples/power-meter.mjs";
import { measureEnergy, powerChannel } from "../src/instruments/power.ts";

test("the example wattmeter streams a complete run through the production adapter", { timeout: 5000 }, async t => {
  const server = servePowerExample({ port: 0, speed: 5000 });
  t.after(() => { for (const client of server.clients) client.terminate(); server.close(); });
  await once(server, "listening");
  const meter = createInstrument({ channels: { load: powerChannel("meter") } });
  meter.start();
  const client = new WebSocket("ws://127.0.0.1:" + server.address().port);
  const detach = bindSocket(client, meter, "load", assert.fail);
  await once(client, "close");
  detach();
  const run = meter.stop();
  assert.equal(run.samples.load.length, 14);
  assert.equal(measureEnergy(run.samples.load, 0, 0, 120).wattHours, 1.25);
  assert.equal(meter.diagnostics("load").segment, 1);
});
