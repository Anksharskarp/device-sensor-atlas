import { createInstrument, integrateInterval, parseRun, serializeRun } from "@sensor-atlas/core";
import { bindSocket } from "@sensor-atlas/core/websocket";
import { decodeMillivolts } from "./millivolt-probe.ts";

// Two records on the probe clock: −1000 mV at 1000 ms, then 3000 mV at 3000 ms.
const packet = Uint8Array.of(0xe8, 0x03, 0, 0, 0x18, 0xfc, 0xb8, 0x0b, 0, 0, 0xb8, 0x0b);
const lab = createInstrument({ channels: { voltage: { quantity: "voltage", unit: "V", clock: "probe" } } });
const { port1: source, port2: receiver } = new MessageChannel();
const detach = bindSocket(receiver, lab, "voltage", () => { throw new Error("Invalid probe frame"); }, decodeMillivolts);
lab.start("Voltage ramp");
const received = new Promise<void>(resolve => receiver.addEventListener("message", () => resolve(), { once: true }));
receiver.start();
source.postMessage(packet.buffer);
await received;
detach();
source.close();
receiver.close();
const run = parseRun(serializeRun(lab.stop()));
lab.dispose();
const result = integrateInterval(run.samples.voltage, 0, 1, 3, { interpolation: "linear" });
if (!result) throw new Error("Missing voltage interval");
console.log(result.area, "V·s over", result.coveredSeconds, "s");
