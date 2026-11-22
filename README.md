# Sensor Atlas

Sensor Atlas is a React Native SDK for motion experiments. Pocket Lab, the reference app, measures pendulum periods with a gyroscope and the angle between two stationary positions with an accelerometer. Both measurements can be reproduced from a saved session.

[Compare two recordings](https://anksharskarp.github.io/device-sensor-atlas/workbench/) · [Pendulum experiment](docs/pendulum.md) · [Static tilt](docs/tilt.md) · [Development journal](https://anksharskarp.github.io/device-sensor-atlas/journal/)

## Run Pocket Lab

Use Node.js 24 and npm. From the repository root:

```sh
npm ci
npm run build
npm start -w pocket-lab
```

Open the app in an Expo SDK 58 development build or a matching Expo Go client. Start with the bundled pendulum model. Place cursor A at the first positive peak and B at the last. The ten cycles span 12 seconds, giving an average period of 1.2 seconds. Use **Previous sample** and **Next sample** to place a cursor precisely.

Choose **Replay and collect** to feed the same samples through the live panel at their original pace. For a phone reading, choose **Gyroscope**, grant motion access and select an axis.

For a hands-free start, choose **Set threshold trigger**, enter a level in rad/s and arm a rising or falling crossing. **Inspect last run** reports the mean period and cycle range between the cursors.

After collection, tap **Save run**. Under **Saved runs**, open the recording to inspect it, share its JSON or export a channel as CSV. A teammate can use **Import session JSON** to reopen the original readings.

## Embed a panel

Create one instrument per experiment screen. Pass source timestamps in seconds and values in the declared unit.

```tsx
import { useEffect, useState } from "react";
import { createInstrument } from "@sensor-atlas/core";
import { InstrumentPanel } from "@sensor-atlas/react-native";

type Subscribe = (onSample: (seconds: number, radiansPerSecond: number) => void) => () => void;

export function Experiment({ subscribe }: { subscribe: Subscribe }) {
  const [lab] = useState(() => createInstrument({
    channels: {
      rotation: { quantity: "angularVelocity", unit: "rad/s", clock: "phone" },
    },
  }));

  useEffect(() => {
    const unsubscribe = subscribe((t, value) => lab.write("rotation", { t, value }));
    return () => {
      unsubscribe();
      lab.gap("rotation");
      if (lab.collecting) lab.stop();
    };
  }, [lab, subscribe]);

  return <InstrumentPanel instrument={lab} analysis="period" threshold runName="Short pendulum" />;
}
```

Tap **Collect**, move the sensor, then tap **Stop**. **Inspect last run** opens the captured samples. **Freeze plot** holds the displayed history while acquisition continues. For setup and subscription cleanup, see the [integration guide](docs/integration.md).

## Packages

| Package | Contents |
| --- | --- |
| [@sensor-atlas/core](packages/core) | Manual, timed and threshold capture, period comparison, static tilt, session JSON and per-channel CSV |
| [@sensor-atlas/react-native](packages/react-native) | InstrumentPanel, TracePlot, Meter, CaptureControls, TimeCursor and RunInspector |
| [Pocket Lab](apps/pocket-lab) | Expo reference app built with both packages |

Both SDK packages can be packed from this checkout. See [installation and sources](docs/integration.md) and the [recording format](docs/sessions.md).

## Develop

```sh
npm test
npm run build
npm run check -w pocket-lab
npm run site
```

Run `npm run check:packages` to pack the SDKs, install them in an isolated app and bundle Pocket Lab for iOS and Android.

The site builds into `site/dist`. The [project plan](sensor-atlas-plan.md) describes later releases and their device acceptance tests.

## License

Copyright William Zhang. [BSD 3-Clause](LICENSE).
