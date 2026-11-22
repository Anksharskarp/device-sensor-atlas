import type { Reading, Run } from "./types.js";
import { isChannel, isSample } from "./validation.js";

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function parseRun(json: string): Run {
  const data: unknown = JSON.parse(json);
  if (!record(data) || data.version !== 1 || typeof data.name !== "string"
    || !record(data.channels) || !record(data.samples)) throw new TypeError("Invalid v1 run");

  const keys = Object.keys(data.channels);
  if (!keys.length || Object.keys(data.samples).length !== keys.length) throw new TypeError("Invalid channel map");
  for (const key of keys) {
    const samples = data.samples[key];
    if (!key.trim() || !isChannel(data.channels[key]) || !Object.hasOwn(data.samples, key) || !Array.isArray(samples)) {
      throw new TypeError("Invalid channel: " + key);
    }
    let prior: Reading | undefined;
    for (const item of samples) {
      if (!record(item) || !isSample(item) || typeof item.segment !== "number"
        || !Number.isSafeInteger(item.segment) || item.segment < 0) throw new TypeError("Invalid reading in " + key);
      const reading = { t: item.t, value: item.value, segment: item.segment };
      if (prior && (reading.segment < prior.segment || (reading.segment === prior.segment && reading.t <= prior.t))) {
        throw new RangeError("Readings out of order in " + key);
      }
      prior = reading;
    }
  }
  if (data.trigger !== undefined) {
    const event = data.trigger;
    if (!record(event) || typeof event.channel !== "string" || !Object.hasOwn(data.samples, event.channel)
      || (event.edge !== "rising" && event.edge !== "falling") || typeof event.level !== "number"
      || !Number.isFinite(event.level)) throw new TypeError("Invalid trigger");
    const samples = data.samples[event.channel] as Reading[];
    const reading = samples.find(s => s.segment === event.segment && s.t === event.t);
    if (!reading || (event.edge === "rising" ? reading.value < event.level : reading.value > event.level)) {
      throw new TypeError("Trigger does not match a recorded crossing sample");
    }
  }
  return data as unknown as Run;
}

export function serializeRun(run: Run): string {
  return JSON.stringify(run);
}

export function channelCsv<K extends string>(run: Run<K>, key: K): string {
  if (!Object.hasOwn(run.samples, key)) throw new Error("Unknown channel: " + key);
  const rows = run.samples[key].map(s => [s.segment, s.t, s.value].join(","));
  return ["segment,time_s,value", ...rows, ""].join("\r\n");
}
