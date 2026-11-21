import type { Channel, Sample } from "./types.js";

export function isChannel(value: unknown): value is Channel {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<Channel>;
  return [c.quantity, c.unit, c.clock].every(s => typeof s === "string" && s.trim().length > 0)
    && (c.axis === undefined || typeof c.axis === "string")
    && (c.timestampKind === undefined || c.timestampKind === "source" || c.timestampKind === "receipt");
}

export function isSample(value: unknown): value is Sample {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<Sample>;
  return Number.isFinite(s.t) && Number.isFinite(s.value);
}

export function checkLimit(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new RangeError(label + " must be a positive integer");
  }
}
