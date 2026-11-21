# @sensor-atlas/react-native

Embed a live meter, strip chart, recorder and cursor controls in a React Native screen. Create the instrument once and feed it from your sensor subscription.

```tsx
import { InstrumentPanel, RunInspector } from "@sensor-atlas/react-native";

<InstrumentPanel instrument={lab} runName="Short pendulum" />
<RunInspector run={savedRun} />
```

The panel uses `@sensor-atlas/core` for acquisition and measurement and `react-native-svg` for plotting. Individual views include Meter, TracePlot, CaptureControls and TimeCursor.

[Installation and source recipes](https://anksharskarp.github.io/device-sensor-atlas/docs/integration/)
