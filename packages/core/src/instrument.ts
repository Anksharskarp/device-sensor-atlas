import { Series } from "./series.js";
import type { Channel, Sample } from "./types.js";
import { checkLimit, isChannel, isSample } from "./validation.js";

export interface InstrumentOptions<K extends string> {
  channels: Readonly<Record<K, Channel>>;
  historySize?: number;
}

export function createInstrument<K extends string>(options: InstrumentOptions<K>) {
  const historySize = options.historySize ?? 4096;
  checkLimit(historySize, "historySize");
  const keys = Object.keys(options.channels) as K[];
  if (!keys.length) throw new Error("An instrument needs at least one channel");

  const series = new Map<K, Series>();
  const channels = Object.freeze(Object.fromEntries(keys.map(key => {
    const channel = options.channels[key];
    if (!key.trim() || !isChannel(channel)) throw new Error("Invalid channel: " + key);
    series.set(key, new Series(historySize));
    return [key, Object.freeze({ ...channel })];
  }))) as Readonly<Record<K, Channel>>;

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
      if (stream.append(sample)) accepted++;
    }
    return accepted;
  }

  return {
    channels,
    writeBatch,
    write: (key: K, sample: Sample) => writeBatch(key, [sample]) === 1,
    gap: (key: K) => channelSeries(key).gap(),
    readings: (key: K) => channelSeries(key).readings(),
    diagnostics: (key: K) => channelSeries(key).diagnostics(),
    dispose: () => series.clear(),
  };
}

export type Instrument<K extends string = string> = ReturnType<typeof createInstrument<K>>;
