# Sensor Atlas

Sensor Atlas is a React Native SDK for collecting timestamped readings and measuring physical quantities. Pocket Lab includes a pendulum timer, a static tilt gauge and a wattmeter. Its external probe recorder accepts other scalar sensors over WebSocket. An app can supply its own sensor stream and measurement component while using the same capture, cursor and replay controls.

[Inspect a recording](https://anksharskarp.github.io/device-sensor-atlas/workbench/inspect/) · [Compare periods](https://anksharskarp.github.io/device-sensor-atlas/workbench/) · [Write a measurement component](docs/custom-instruments.md)

## Run Pocket Lab

Use Node.js 24 and npm. From the repository root:

```sh
npm ci
npm run build
npm start -w pocket-lab
```

Open the app in an Expo SDK 58 development build or a matching Expo Go client. Choose **Pendulum timer** to open the bundled model. Place cursor A at the first positive peak and B at the last. The ten cycles span 12 seconds, giving an average period of 1.2 seconds. Use **Previous sample** and **Next sample** to place a cursor precisely.

Choose **Replay and collect** to feed the same samples through the live panel at their original pace. For a phone reading, choose **Gyroscope**, grant motion access and select an axis.

For a hands-free start, choose **Set threshold trigger**, enter a level in rad/s and arm a rising or falling crossing. **Inspect last run** reports the mean period and cycle range between the cursors.

After collection, tap **Save run**. Under **Saved runs**, open the recording to inspect it, share its JSON or export a channel as CSV. A teammate can use **Import session JSON** to reopen the original readings.

| Experiment | Source | Result |
| --- | --- | --- |
| [Pendulum timer](docs/pendulum.md) | Gyroscope or replay | Period, frequency and cycle range |
| [Static tilt](docs/tilt.md) | Three-axis accelerometer | Angle from a stationary reference |
| [Power meter](docs/power.md) | External wattmeter or model load | Watt-hours and time-weighted mean power |

For a different sensor, choose **External probe**, enter its quantity, unit and source clock, then connect its WebSocket address. **Connect and collect** records from the first frame. A voltage probe, for example, can report in volts throughout capture, inspection and CSV export. [Probe setup and frame format](docs/integration.md#external-probe-in-pocket-lab)

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

For a worked custom report, [measure 0.600 L from a saved flow recording](docs/custom-instruments.md#reproduce-an-interrupted-flow-reading).

## Packages

| Package | Contents |
| --- | --- |
| [@sensor-atlas/core](packages/core) | Manual, timed and threshold capture, period comparison, static tilt, numerical integration, WebSocket input, session JSON and per-channel CSV |
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

The site builds into `site/dist`.

## Contribute and release

Start with the [contributor guide](CONTRIBUTING.md) for setup, code and writing conventions, commits and review. The [development roadmap](docs/roadmap.md) lists open work and how to verify each milestone. The [original project brief](sensor-atlas-plan.md) describes the experiments behind it.

Maintainers can follow the [SDK release guide](docs/releases.md) to rehearse, publish and verify a package release. For signed tester builds and store submissions, use the [Pocket Lab distribution guide](docs/pocket-lab-distribution.md).

## License

Copyright William Zhang. [BSD 3-Clause](LICENSE).
