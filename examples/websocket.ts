import type { Instrument } from "@sensor-atlas/core";

/** Text frames carry one JSON object with a source time in seconds and a scalar value. */
export function bindSocket<K extends string>(socket: WebSocket, instrument: Instrument<K>, channel: K, onInvalid: () => void) {
  function message(event: MessageEvent) {
    let sample;
    try {
      sample = typeof event.data === "string" ? JSON.parse(event.data) : null;
    } catch {
      onInvalid();
      return;
    }
    if (!sample || !Number.isFinite(sample.t) || !Number.isFinite(sample.value)) {
      onInvalid();
      return;
    }
    instrument.write(channel, { t: sample.t, value: sample.value });
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
