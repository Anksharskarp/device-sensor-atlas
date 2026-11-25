# Write a measurement component

An instrument starts with a channel, a source that writes timestamped readings, and a calculation in the units of the experiment. A flow meter, for example, can report litres per minute while the experiment asks how much water passed through it.

Give the channel a quantity of `volumeFlow`, a unit of `L/min`, and the clock used by the meter. In the source callback, call `lab.write("flow", { t, value })` with time in seconds. Mark a disconnect or device clock reset with `lab.gap("flow")`.

## Calculate the volume between two cursors

```tsx
import { Text } from "react-native";
import { integrateInterval } from "@sensor-atlas/core";
import { InstrumentPanel, RunInspector, type SelectionProps } from "@sensor-atlas/react-native";

function VolumeReport({ channel, readings, a, b }: SelectionProps) {
  if (channel.quantity !== "volumeFlow" || channel.unit !== "L/min") return null;
  const result = integrateInterval(readings, a.segment, a.t, b.t, {
    interpolation: "linear",
    maxGapSeconds: 4,
  });
  if (!result) return <Text>No covered interval.</Text>;
  return <Text>{(result.area / 60).toFixed(3)} L over {result.coveredSeconds} s</Text>;
}

// In the experiment screen:
<InstrumentPanel instrument={lab} analysis={VolumeReport} />

// When reopening the same experiment:
<RunInspector run={run} analysis={VolumeReport} />
```

Both components pass the channel key, its description, the two cursor readings and the inclusive selection of original samples to the report. The samples belong to one segment and remain in source order even when B precedes A. A selection can contain just one reading. The report can use React hooks and return any React Native view.

Keep the report in your app or export it from an ordinary React package. Pass it to `analysis` wherever you render the experiment. The core package also runs in Node, so a fixture can check the result without a phone. Pocket Lab's [power calculation](../apps/pocket-lab/src/instruments/power.ts) and [report component](../apps/pocket-lab/src/SelectionReport.tsx) use this interface.

## Choose how to integrate

`integrateInterval` accepts any scalar channel. Specify `linear` for straight-line interpolation or `previous` to hold each reading until its successor. The function clips intervals to the requested times, returns area in channel units times seconds, and divides by covered time for the time mean. Use `maxGapSeconds` to skip intervals longer than your source can reliably cover. An empty interval or a single reading gives `null`. Negative readings retain their sign.

For example, a constant 3 L/min over 20 seconds gives 60 L·s/min, or 1 L. For a channel already expressed in L/s, the integral is directly in litres.

## Reproduce an interrupted flow reading

The [flow fixture](../packages/core/test/fixtures/flow-gap-v1.json) contains five readings on the pump clock. For this probe, interpolate linearly across at most four seconds. The first two seconds average 3 L/min, the next three average 6 L/min, and the final four average 3 L/min. The ten seconds from 5 to 15 exceed the limit. The covered volume is (2 × 3 + 3 × 6 + 4 × 3) / 60 = **0.600 L over 9 s**.

From the repository root after building core, run the fixture through the public reader and integrator:

```sh
node --input-type=module <<'JS'
import { readFileSync } from "node:fs";
import { integrateInterval, parseRun } from "@sensor-atlas/core";

const run = parseRun(readFileSync("packages/core/test/fixtures/flow-gap-v1.json", "utf8"));
const result = integrateInterval(run.samples.flow, 0, 0, 19, {
  interpolation: "linear",
  maxGapSeconds: 4,
});
console.log(result.area / 60, "L over", result.coveredSeconds, "s");
JS
```

Open the same run in the custom `RunInspector` above and place the cursors at 0 and 19 seconds to reproduce the result.
