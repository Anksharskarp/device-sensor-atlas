# Sensor Atlas

Sensor Atlas turns timestamped readings into a handheld instrument. Feed it a phone gyroscope or a stream from your own equipment. The React Native panel gives you a live meter, a strip chart, capture controls and two cursors for measuring a run.

[Try the pendulum](https://anksharskarp.github.io/device-sensor-atlas/) · [Development journal](https://anksharskarp.github.io/device-sensor-atlas/journal/)

## Run Pocket Lab

Use Node.js 24 and npm. From the repository root:

```sh
npm ci
npm run build
npm start -w pocket-lab
```

Open the app in an Expo SDK 58 development build or a matching Expo Go client. Start with the bundled pendulum model. Place cursor A at the first positive peak and B at the last. The ten cycles span 12 seconds, giving an average period of 1.2 seconds. Use **Previous sample** and **Next sample** to place a cursor precisely.

## Embed a panel

Create one instrument per experiment screen. Pass source timestamps in seconds and values in the declared unit.

```tsx
import { useState } from "react";
import { createInstrument } from "@sensor-atlas/core";
import { InstrumentPanel } from "@sensor-atlas/react-native";

export function Experiment() {
  const [lab] = useState(() => createInstrument({
    channels: {
      rotation: { quantity: "angularVelocity", unit: "rad/s", clock: "phone" },
    },
  }));

  // In your source callback:
  // lab.write("rotation", { t: timestampSeconds, value: radiansPerSecond });
  return <InstrumentPanel instrument={lab} runName="Short pendulum" />;
}
```

Tap **Collect**, move the sensor, then tap **Stop**. **Inspect last run** opens the captured samples. **Freeze plot** holds the displayed history while acquisition continues. For setup and subscription cleanup, see the [integration guide](docs/integration.md).

## Packages

| Package | Contents |
| --- | --- |
| [@sensor-atlas/core](packages/core) | Typed channels, bounded history, manual and timed capture, cursor measurements, session JSON and per-channel CSV |
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

The site builds into `site/dist`. The [project plan](sensor-atlas-plan.md) describes later releases and their device acceptance tests.

## License

William Zhang. The [core](packages/core/LICENSE) and [React Native](packages/react-native/LICENSE) packages use the MIT license. The rest of the repository uses the [BSD 3-Clause license](LICENSE).
