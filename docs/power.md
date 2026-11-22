# Measure electrical energy

Open **Power meter** in Pocket Lab. The bundled example ramps from 0 to 60 W over 15 seconds, stays at 60 W for one minute, then falls to zero over another 15 seconds. The remaining 30 seconds are idle. Each ramp contributes 0.125 Wh and the plateau contributes 1 Wh. The full two-minute recording gives **1.250 Wh** at a time mean of **37.5 W**.

Move the cursors to 15 s and 75 s to isolate the plateau. The native report uses linear interpolation between power readings. In the [browser inspector](https://anksharskarp.github.io/device-sensor-atlas/workbench/inspect/), you can also hold the previous value to see how the choice of interpolation affects an irregularly sampled meter.

## Connect a meter

Pocket Lab accepts WebSocket text frames containing a source timestamp in seconds and active power in watts.

```json
{"t":15,"value":60}
```

Open **Power meter**, enter your meter’s WebSocket URL and tap **Connect meter**. Tap **Collect** or set a threshold to start on a change in load. Disconnecting closes the current recording. **Save run** preserves the original samples. Open the JSON file in Pocket Lab or the browser inspector to repeat the measurement.

To try the connection without hardware, start the model meter from the repository:

```sh
npm ci
npm run build
npm run meter:example
```

It serves one two-minute cycle per connection at `ws://127.0.0.1:8787`. For an Android Studio emulator, use `ws://10.0.2.2:8787`. For a physical phone, bind the server to the computer’s LAN address with `npm run meter:example -- --host <LAN-IP>` and enter that address on the phone. Use `wss://` for deployed instruments. Some native builds restrict plain-text connections. [React Native networking](https://reactnative.dev/docs/network)

## Read the result in your code

Integrate watts over source seconds and divide by 3,600 to obtain watt-hours. The report only integrates within the selected segment, so disconnects can be inspected separately. The meter supplies the electrical readings. [Measurement component](custom-instruments.md) · [EIA, Measuring electricity](https://www.eia.gov/energyexplained/electricity/measuring-electricity.php)
