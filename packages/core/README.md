# @sensor-atlas/core

Record timestamped sensor readings in Node.js or React Native. Timestamps are seconds on a named source clock.

```ts
import { createInstrument, measureInterval } from "@sensor-atlas/core";

const lab = createInstrument({
  channels: { voltage: { quantity: "voltage", unit: "V", clock: "board" } },
});
lab.start("Battery");
lab.writeBatch("voltage", [{ t: 0, value: 3.7 }, { t: 1, value: 3.6 }]);
const run = lab.stop();
const stats = measureInterval(run.samples.voltage, 0, 0, 1);
lab.dispose();
```

Arm a rising or falling edge with `lab.arm()` to retain samples before a threshold crossing. Use `measurePeriod` and `comparePeriods` for oscillating channels, or `measureTilt` for two stationary accelerometer positions.

Use `serializeRun` and `parseRun` to store or reopen a session. Use `channelCsv` to export a single channel.

[Sensor Atlas documentation](https://anksharskarp.github.io/device-sensor-atlas/docs/)
