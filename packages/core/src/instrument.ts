import { Series } from "./series.js";
import type { Channel, Reading, Run, Sample } from "./types.js";
import { checkLimit, isChannel, isSample } from "./validation.js";

export interface InstrumentOptions<K extends string> {
  channels: Readonly<Record<K, Channel>>;
  historySize?: number;
  captureLimit?: number;
}

export function createInstrument<K extends string>(options: InstrumentOptions<K>) {
  const historySize = options.historySize ?? 4096;
  checkLimit(historySize, "historySize");
  const captureLimit = options.captureLimit ?? 250_000;
  checkLimit(captureLimit, "captureLimit");
  const keys = Object.keys(options.channels) as K[];
  if (!keys.length) throw new Error("An instrument needs at least one channel");

  const series = new Map<K, Series>();
  const channels = Object.freeze(Object.fromEntries(keys.map(key => {
    const channel = options.channels[key];
    if (!key.trim() || !isChannel(channel)) throw new Error("Invalid channel: " + key);
    series.set(key, new Series(historySize));
    return [key, Object.freeze({ ...channel })];
  }))) as Readonly<Record<K, Channel>>;

  let capture: Record<K, Reading[]> | undefined;
  let revision = 0;
  let count = 0;
  let name = "";
  let lastRun: Run<K> | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let endedBy: "manual" | "timer" | "limit" | undefined;

  function finish(reason: NonNullable<typeof endedBy>): Run<K> {
    if (!capture) throw new Error("No capture in progress");
    clearTimeout(timer);
    for (const key of keys) Object.freeze(capture[key]);
    lastRun = Object.freeze({ version: 1, name, channels, samples: Object.freeze(capture) });
    capture = undefined;
    endedBy = reason;
    revision++;
    return lastRun;
  }

  function start(runName = "Untitled run", durationSeconds?: number) {
    if (!series.size) throw new Error("Instrument disposed");
    if (capture) throw new Error("Capture already in progress");
    if (durationSeconds !== undefined && !(Number.isFinite(durationSeconds)
      && durationSeconds > 0 && durationSeconds * 1000 <= 2_147_483_647)) {
      throw new RangeError("Invalid capture duration");
    }
    name = runName;
    capture = Object.fromEntries(keys.map(k => [k, [] as Reading[]])) as Record<K, Reading[]>;
    count = 0;
    endedBy = undefined;
    revision++;
    if (durationSeconds !== undefined) timer = setTimeout(() => finish("timer"), durationSeconds * 1000);
  }

  function channelSeries(key: K) {
    const stream = series.get(key);
    if (!stream) throw new Error("Unknown or disposed channel: " + key);
    return stream;
  }

  function writeBatch(key: K, samples: readonly Sample[]) {
    const stream = channelSeries(key);
    for (const sample of samples) {
      if (!isSample(sample)) throw new TypeError("Expected finite time and value");
    }
    let accepted = 0;
    for (const sample of samples) {
      const reading = stream.append(sample);
      if (!reading) continue;
      accepted++;
      if (capture) {
        capture[key].push(reading);
        if (++count === captureLimit) finish("limit");
      }
    }
    if (samples.length) revision++;
    return accepted;
  }

  return {
    channels,
    start,
    stop: () => finish("manual"),
    get revision() { return revision; },
    get collecting() { return capture !== undefined; },
    get lastRun() { return lastRun; },
    get endedBy() { return endedBy; },
    writeBatch,
    write: (key: K, sample: Sample) => writeBatch(key, [sample]) === 1,
    gap(key: K) {
      channelSeries(key).gap();
      revision++;
    },
    readings: (key: K) => channelSeries(key).readings(),
    diagnostics: (key: K) => channelSeries(key).diagnostics(),
    dispose() {
      if (capture) finish("manual");
      series.clear();
    },
  };
}

export type Instrument<K extends string = string> = ReturnType<typeof createInstrument<K>>;
