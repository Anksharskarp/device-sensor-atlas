import type { FrameDecoder } from "@sensor-atlas/core/websocket";

// Each six-byte record holds an unsigned millisecond tick and signed millivolts.
export const decodeMillivolts: FrameDecoder = data => {
  if (!(data instanceof ArrayBuffer) || data.byteLength === 0 || data.byteLength % 6 !== 0) {
    throw new TypeError("Expected complete six-byte probe records");
  }
  const view = new DataView(data);
  const samples = [];
  for (let offset = 0; offset < view.byteLength; offset += 6) {
    samples.push({
      t: view.getUint32(offset, true) / 1000,
      value: view.getInt16(offset + 4, true) / 1000,
    });
  }
  return samples;
};
