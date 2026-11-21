# Recordings and measurements

A v1 run is a UTF-8 JSON object with a name, channel descriptions and a sample array per channel. Each sample retains its source time, value and segment. Channel names in the two maps must match.

```json
{
  "version": 1,
  "name": "Short pendulum",
  "channels": {
    "rotation": { "quantity": "angularVelocity", "unit": "rad/s", "clock": "phone", "axis": "z" }
  },
  "samples": {
    "rotation": [
      { "t": 9.02, "value": 0, "segment": 0 },
      { "t": 9.04, "value": 0.12, "segment": 0 },
      { "t": 0.01, "value": 0.18, "segment": 1 }
    ]
  }
}
```

## Capture

`lab.start("Short pendulum")` begins a manual run. Pass a second argument in seconds for a timed run. `lab.stop()` returns the completed run. After a timer or sample limit ends a run, read `lab.lastRun` and `lab.endedBy`. Timers run on the foreground JavaScript event loop.

The live ring retains 4,096 readings per channel by default. The separate recording retains up to 250,000 accepted readings across all channels. Set `historySize` and `captureLimit` when creating an instrument. At the limit the run closes, and incoming samples continue to update the live ring.

## Time and interruptions

Seconds may start at any finite source time. Within a segment, accepted times increase strictly. Duplicate and older readings count toward `lab.diagnostics(key).outOfOrder`. A malformed batch throws before any part is written.

Call `lab.gap(key)` on disconnect, clock reset or known packet loss. The next reading starts a new segment. A channel with no reading in its current segment has no live value. Observed frequency is the number of intervals divided by the time between the first and last reading of the current segment.

## Cursor readings

`nearestSample(readings, segment, t)` returns the acquired sample closest to the requested time in that segment. At a tie it selects the earlier sample. Beyond either end it selects the endpoint. An empty segment returns `null`.

`measureInterval(readings, segment, a, b)` includes both endpoints. It returns sample count, minimum, maximum, arithmetic sample mean, directed value change and seconds between the first and last included samples. An empty selection returns `null`. Measurements use one segment of one channel. Source clocks can have different origins.

## Save and reopen

```ts
import { channelCsv, parseRun, serializeRun } from "@sensor-atlas/core";

const text = serializeRun(lab.stop());
const run = parseRun(text);
const csv = channelCsv(run, "rotation");
```

Store the JSON string in a file, then pass the reopened run to `<RunInspector run={run} />`. The reader rejects unknown versions, nonfinite samples and timestamps that go backward within a segment. CSV contains `segment,time_s,value`. Keep the JSON alongside the CSV for units and clock metadata.
