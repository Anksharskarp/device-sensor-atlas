import type { Instrument } from "./instrument.js";
import type { Sample } from "./types.js";
import { isSample } from "./validation.js";

export interface SampleSocket {
  addEventListener(type: "message", listener: (event: { data: unknown }) => void): void;
  removeEventListener(type: "message", listener: (event: { data: unknown }) => void): void;
  addEventListener(type: "close", listener: () => void): void;
  removeEventListener(type: "close", listener: () => void): void;
}

function validSamples(samples: readonly unknown[]): samples is readonly Sample[] {
  for (const sample of samples) {
    if (!isSample(sample)) return false;
  }
  return true;
}

/** Convert one source frame to scalar samples with source time in seconds. */
export type FrameDecoder = (data: unknown) => Sample | readonly Sample[];

/** Bind one socket to one channel. Without a decoder, frames carry JSON readings. */
export function bindSocket<K extends string>(
  socket: SampleSocket,
  instrument: Instrument<K>,
  channel: K,
  onInvalid: () => void,
  decode?: FrameDecoder,
) {
  function message(event: { data: unknown }) {
    let frame: unknown;
    try {
      if (decode) frame = decode(event.data);
      else frame = typeof event.data === "string" ? JSON.parse(event.data) : null;
    } catch {
      onInvalid();
      return;
    }
    const samples: unknown[] = Array.isArray(frame) ? frame : [frame];
    if (!samples.length || !validSamples(samples)) {
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
