# Sensor Atlas
## An open-source React Native SDK for turning a phone into a handheld lab instrument

**Project brief · Proposed API and release targets · Working name**

Open an instrument, see a live reading, tap Collect, do something physical, and measure what happened. Sensor Atlas gives React Native developers that entire interaction as an embeddable component. It also ships a ready-to-use Pocket Lab app, built with the public SDK, so a maker can start experimenting before writing any code.

The design reference is the experience of using a Vernier LabQuest: the instrument gets out of the way between asking a question and taking a measurement. Vernier already offers mobile collection, graphing, and analysis. phyphox already supports configurable phone experiments and Bluetooth devices. PlotJuggler already demonstrates rich live and recorded signal inspection. The opportunity to validate is narrower and useful: **a mobile instrument panel that developers can embed in an existing React Native app and feed from whatever sensor integration they already use.** Compatibility with a particular commercial probe requires a working upstream integration.

References: [Vernier LabQuest manual](https://www.vernier.com/files/manuals/labq3.pdf), [Vernier mobile Graphical Analysis](https://www.vernier.com/til/get-started/go-direct/android), [phyphox](https://phyphox.org/), [PlotJuggler](https://github.com/PlotJuggler/PlotJuggler).

### The first experiment: measure a pendulum

Hang a phone in a secure pouch as a short pendulum. Open the Pendulum instrument and select an axis with a clear gyroscope oscillation. Start collecting, release from a small angle, and stop after ten swings. Drag the first cursor to a positive peak and the second to the positive peak ten cycles later. Divide the elapsed time by ten to measure the average period. Lengthen the pendulum, repeat, and overlay the two runs with their first peaks aligned. The longer pendulum should make the change in period visible before anyone calculates it.

This exercise drives the design. The user needs an immediately legible meter, a Collect button, axes with units, enough history to see ten cycles, precise touch cursors, and a way to preserve a run while collecting the next one. A maker with a wireless gyro can mount the lighter board on the pendulum and leave the phone in hand. The same instrument works after binding its angular-velocity input to the board stream and selecting the corresponding axis. A bundled recording makes the experiment available on a simulator or at a desk.

### The public interface

An app supplies a channel description and pushes timestamped values from its existing sensor callback. Atlas supplies the time-series engine, recorder, inspector, and React Native views. The source owns device access, permissions, sampling configuration, packet decoding, and disconnect notifications. A source can be a built-in phone sensor, an existing vendor SDK, a decoded BLE notification, a WebSocket message from a bench instrument, or a recording.

Proposed TypeScript API, with the instrument created once per experiment screen:

```tsx
const lab = createInstrument({
  channels: {
    rotation: { quantity: "angularVelocity", unit: "rad/s", clock: "phone" },
  },
});

// Called by the app's existing gyroscope subscription for the selected axis.
function onGyroSample(timeSeconds: number, radiansPerSecond: number) {
  lab.write("rotation", { t: timeSeconds, value: radiansPerSecond });
}

function ExperimentScreen() {
  return <InstrumentPanel instrument={lab} />;
}
```

The panel includes collection controls, live meter, plot, and cursor measurements. Also export composable primitives such as TracePlot, Meter, TimeCursor, and CaptureControls for teams with their own interface. Provide a batch-write API for faster sources, an explicit gap event for interruptions, and lifecycle examples showing how to unsubscribe and dispose of the session. Most integrations should fit on one screen of documentation.

### What belongs in the product

| Capability | User-facing behavior | Acceptance test |
| --- | --- | --- |
| Live inspection | Scrolling traces, labeled units, selectable channels, and shared touch cursors. Freeze the viewport while collection continues. | Inspect a peak, return to live, and find the intervening samples in the recording. |
| Capture | Manual start/stop and timed runs first. Add a rising/falling threshold trigger with configurable pre-trigger history and a clearly shown armed state. | Capture a brief tap and inspect the motion immediately preceding it. |
| Measurement | Read the nearest acquired sample at a cursor. Measure elapsed time, value change, min/max, and mean over a selected interval. Report sample count and coverage. | The same selection gives the same numbers during inspection and replay, at every zoom level. |
| Run comparison | Name runs, add event markers, overlay compatible channels, and align runs at a selected marker. Keep original times and units available. | Compare pendulum lengths without editing or resampling either original recording. |
| Sharing | Save locally, reopen a run offline, and export per-channel CSV plus session metadata. Bundle the channel bindings, markers, and instrument settings for replay. | A teammate without the hardware can reopen the run and reproduce a reported measurement. |
| Extensibility | Publish instrument presets, visual panels, and analysis functions as ordinary npm packages. | An independent author publishes a useful instrument using the SDK and an existing data source, with zero changes to Atlas. |

### Engineering decisions that make this an instrument

- **Separate acquisition, display, and recording.** Append incoming batches to bounded buffers. Let the plot request the visible time range at its own refresh rate. Use a min/max envelope per display column to retain short spikes when zoomed out. Cursor readings, interval statistics, and saved runs use original samples. Verify this with an impulse that falls between two display refreshes.
- **Make time and loss visible.** Accept monotonic source timestamps when available. Mark receipt-time-only streams. Track observed rate, out-of-order samples, and known sequence gaps. Preserve disconnects and clock resets as segment boundaries and draw breaks in the plot. Show cross-device timing uncertainty when clocks cannot be aligned. Disable cross-source delay measurements until the user has a defensible alignment.
- **Define measurements precisely.** Store units, selected axis, calibration or zero offset, and the raw reading. Label a sample mean explicitly. For uneven sampling, offer time-weighted means only with a documented interpolation and gap policy. A missing reading must stay distinguishable from a measured zero.
- **Keep collection local and recoverable.** Start with foreground sessions. Write recordings in recoverable chunks. When the app is suspended, storage fills, or capture overruns, preserve completed data and show where reliable coverage ends. Publish a versioned session schema and reader fixtures.
- **Reuse acquisition and rendering infrastructure.** Ship one tested integration recipe for Expo Sensors, one for numeric data arriving over WebSocket, and one replay fixture. Evaluate an existing React Native graphics backend with representative loads before choosing it. Keep BLE pairing, register maps, vendor firmware, and probe compatibility in upstream projects. New core work should benefit instruments across multiple sources.

### Packaging and the contribution model

Publish two BSD-3-Clause npm packages initially. Proposed names are subject to registry availability.

| Package | Public contract |
| --- | --- |
| @sensor-atlas/core | TypeScript channels, batch ingestion, buffers, trigger state, measurement functions, session format, and replay. Runs in Node for reproducible tests. |
| @sensor-atlas/react-native | Embeddable instrument panel, individual views, hooks, and mobile recording integration. Document a fresh bare React Native install and an Expo development build. |

Pocket Lab is the reference app and the easiest way to try the project. Ship it with a pendulum experiment, a general-purpose strip chart, and a recorded example. An instrument preset declares inputs, dimensions, panels, trigger settings, and analysis functions. Device owners can share a short integration recipe; the contribution with the most leverage is a reusable *instrument*: a vibration inspector, a greenhouse trend logger, or a timing gate. Each should ship with a representative trace and expected measurements.

### Roadmap

Planning estimates assume one experienced maintainer with access to a physical iPhone and Android phone. Benchmarks below are proposed release gates, not measured claims.

| Stage | Deliverable | Release gate |
| --- | --- | --- |
| Weeks 1–2: field prototype | Live gyro strip chart, manual capture, two cursors, and a pendulum recording. Try it with three makers and two developers who already receive sensor data in an app. | Makers can answer “How did the period change?” unaided. At least one developer embeds the prototype using an existing sensor callback. Record where either task breaks down. |
| Weeks 3–6: npm alpha | Typed ingestion, reusable panel, local capture/replay, CSV export, and a quick start from a clean app. | Install the packed artifacts in fresh iOS and Android apps. Feed the same panel from a phone sensor, a WebSocket source, and a fixture without editing its plotting or measurement code. |
| Weeks 7–10: instrument beta | Triggered capture, pre-trigger history, run overlays, annotations, and diagnostics. | On named reference phones, test four 100-sample/s scalar channels for ten foreground minutes. Publish loss counts, peak memory, p95 frame time, and p95 ingestion-to-visible latency. Initial targets are zero SDK drops under that load and p95 display latency under 100 ms. |
| Weeks 11–16: stable candidate | Independent instrument package, interruption recovery, documented session schema, compatibility matrix, and migration policy. | A third party publishes an npm instrument preset. A second developer installs it, connects their own source, and reproduces the author's reference measurement from a recording. |

The flagship demo should fit in one minute: **open Pocket Lab, capture a swing, measure its period with two fingers, then open the same run inside a different app built with the npm package.** That demonstrates both reasons for the project to exist: a phone becomes a useful field instrument, and developers can put that instrument in software of their own.
