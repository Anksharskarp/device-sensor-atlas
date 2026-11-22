# Measure static tilt

Place the phone face up on a level surface. Open **Static tilt** in Pocket Lab and tap **Record reference**. Rest the phone on the slope, keep its orientation along the slope fixed, and tap **Measure second position**. The result is the unsigned change in gravity direction, from 0° to 180°. Turning the phone about the vertical axis alone produces zero tilt.

Each position contributes 25 three-axis accelerometer readings. Tapping **Save run** keeps the original samples in two segments. Open the file from **Saved runs** to recalculate the angle.

```ts
import { measureTilt, parseRun } from "@sensor-atlas/core";

const run = parseRun(sessionJson);
const { degrees, reference, trial } = measureTilt(run);
console.log(degrees, reference.count, trial.rmsDeviation);
```

For your own source, declare three `acceleration` channels in `g` on one clock and label their axes `x`, `y` and `z`. Push all three readings with the same timestamp. Pass the reference and trial segment numbers as the second and third arguments to `measureTilt` if they differ from 0 and 1.

The SDK averages each position and measures the angle between the two mean vectors. A position needs at least ten simultaneous samples. Each vector magnitude must be within 0.1 g of 1 g and the RMS vector deviation from the mean must be at most 0.03 g. These checks catch movement during placement. Sustained acceleration can still bias the angle, which is why both surfaces should be stationary. [Analog Devices, Using an Accelerometer for Inclination Sensing](https://www.analog.com/en/resources/app-notes/an-1057.html) · [Expo Accelerometer](https://docs.expo.dev/versions/latest/sdk/accelerometer/)
