# Measure a pendulum period

Secure the phone in a pouch with room to swing clear of the floor. Keep the phone fixed relative to the suspension so its gyroscope rotates with the pendulum. Start with a small displacement and use the same release angle for both trials.

## Record the short and long runs

1. In Pocket Lab, open **Gyroscope**. Move the pendulum gently and select the axis with the clearest alternating signal.
2. Tap **Collect**, release the pendulum and allow at least ten swings. Tap **Stop**, then **Inspect last run**. Use the cursors to exclude the release and the catch.
3. Read the mean period and the shortest and longest cycle. Save the run, lengthen the suspension and repeat on the same axis.
4. Share both JSON files from **Saved runs**. Open them in the [comparison workbench](https://anksharskarp.github.io/device-sensor-atlas/workbench/). Each line starts at its first rising midline crossing. The table retains the original source timestamps.

For a manual check, put A on a positive peak and B on another positive peak several cycles later. Divide the elapsed time by the number of full cycles between them. [Try the cursor exercise](https://anksharskarp.github.io/device-sensor-atlas/experiments/ten-swings/)

## How the SDK counts cycles

`measurePeriod` works on a single segment. The midpoint of the 5th and 95th sample percentiles defines the crossing level. A rising crossing must travel from below to above a band extending 20% of the estimated amplitude on either side of the midpoint. Its time comes from linear interpolation between the two readings bracketing the midpoint.

Three rising crossings yield two complete periods. Partial cycles at either end are excluded. The result reports the elapsed time between the first and last crossings divided by the cycle count, the reciprocal frequency, and the shortest and longest intervals. A wide range is a reason to check the trace for an extra crossing, a missed cycle, or changing motion. Set `minimumAmplitude` in channel units when you know the resting noise floor.

```ts
import { createPendulumRun, measurePeriod } from "@sensor-atlas/core";

const run = createPendulumRun();
const result = measurePeriod(run.samples.rotation, { segment: 0 });
if (result) console.log(result.cycles, result.periodSeconds); // 9, about 1.2
```

The fixture starts and ends at a positive peak. Its ten peak-to-peak periods contain ten rising crossings, giving nine full crossing-to-crossing periods.

## Compare the change

```ts
import { comparePeriods } from "@sensor-atlas/core";

const comparison = comparePeriods(
  { run: shortRun, channel: "z", segment: 0 },
  { run: longRun, channel: "z", segment: 0 },
);
console.log(comparison.differenceSeconds, comparison.changePercent);
```

A simple pendulum at small angles has period *T* = 2π√(*L* / *g*). Doubling the length increases the predicted period by about 41%. The website models a point mass. A suspended phone has a distributed mass, so its measured period also depends on its mounting. [OpenStax, University Physics, §15.4](https://openstax.org/books/university-physics-volume-1/pages/15-4-pendulums)
