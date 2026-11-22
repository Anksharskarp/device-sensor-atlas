import type { Reading, Sample } from "./types.js";

export class Series {
  private readonly buffer: Reading[] = [];
  private next = 0;
  private segment = 0;
  private previousTime: number | undefined;
  private firstTime: number | undefined;
  private segmentCount = 0;
  private rejected = 0;

  constructor(private readonly capacity: number) {}

  append(sample: Sample): Reading | undefined {
    if (this.previousTime !== undefined && sample.t <= this.previousTime) {
      this.rejected++;
      return;
    }
    this.firstTime ??= sample.t;
    this.previousTime = sample.t;
    this.segmentCount++;
    const reading = Object.freeze({ t: sample.t, value: sample.value, segment: this.segment });
    this.buffer[this.next] = reading;
    this.next = (this.next + 1) % this.capacity;
    return reading;
  }

  latest() {
    if (this.previousTime === undefined) return undefined;
    return this.buffer[(this.next + this.capacity - 1) % this.capacity];
  }

  gap() {
    this.segment++;
    this.previousTime = undefined;
    this.firstTime = undefined;
    this.segmentCount = 0;
  }

  readings(): Reading[] {
    return this.buffer.slice(this.next).concat(this.buffer.slice(0, this.next));
  }

  diagnostics() {
    const elapsed = (this.previousTime ?? 0) - (this.firstTime ?? 0);
    return {
      outOfOrder: this.rejected,
      segment: this.segment,
      observedHz: elapsed > 0 ? (this.segmentCount - 1) / elapsed : null,
    };
  }
}
