import type { Instrument } from "./instrument.js";
import { isSample } from "./validation.js";

export interface SampleSocket {
  addEventListener(type: "message", listener: (event: { data: unknown }) => void): void;
  removeEventListener(type: "message", listener: (event: { data: unknown }) => void): void;
  addEventListener(type: "close", listener: () => void): void;
  removeEventListener(type: "close", listener: () => void): void;
}

/** Text frames carry one JSON reading or an array of readings with a source time in seconds and a scalar value. */
export function bindSocket<K extends string>(socket: SampleSocket, instrument: Instrument<K>, channel: K, onInvalid: () => void) {
  function message(event: { data: unknown }) {
    let frame: unknown;
    try {
      frame = typeof event.data === "string" ? JSON.parse(event.data) : null;
    } catch {
      onInvalid();
      return;
    }
    const samples: unknown[] = Array.isArray(frame) ? frame : [frame];
    if (!samples.length || !samples.every(isSample)) {
      onInvalid();
      return;
    }
    instrument.writeBatch(channel, samples);
  }
  let closed = false;
  function disconnect() {
    if (closed) return;
    closed = true;
    socket.removeEventListener("message", message);
    socket.removeEventListener("close", disconnect);
    instrument.gap(channel);
  }
  socket.addEventListener("message", message);
  socket.addEventListener("close", disconnect);
  return disconnect;
}
