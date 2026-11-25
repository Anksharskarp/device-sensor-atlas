# Installation and sources

## Install from a checkout

Use Node.js 24. Build both packages before packing them so the panel can resolve core's declarations.

```sh
npm ci
npm run build
mkdir -p dist
npm pack -w @sensor-atlas/core -w @sensor-atlas/react-native --pack-destination ./dist
```

In an Expo SDK 58 project using React Native 0.88.1 and React 19.3, install the tarballs together. Replace `/path/to/atlas` with the checkout path.

```sh
npx expo install react-native-svg expo-sensors
npm install /path/to/atlas/dist/sensor-atlas-core-0.1.0-alpha.2.tgz /path/to/atlas/dist/sensor-atlas-react-native-0.1.0-alpha.2.tgz
```

For a development build, run `npx expo run:ios` or `npx expo run:android` after adding the sensor module. On iOS, configure the motion permission text with the Expo Sensors config plugin. Pocket Lab includes an [example configuration](../apps/pocket-lab/app.json). [Expo Gyroscope](https://docs.expo.dev/versions/latest/sdk/gyroscope/)

For a bare React Native 0.88.1 app on React 19.3, install `react-native-svg@15.16.0` and the same two tarballs. Run `bundle exec pod install` in the app's `ios` directory and rebuild the native app. Pass readings from your existing source to the panel. [React Native SVG installation](https://github.com/software-mansion/react-native-svg#installation)

## Expo Gyroscope

The gyroscope provides a timestamp in seconds and angular velocity in radians per second on each device axis. Pocket Lab requests motion permission, chooses a 20 ms update interval and removes its subscription on disconnect. The interval is a request. Use the sensor's timestamp for each reading. [Expo Gyroscope](https://docs.expo.dev/versions/latest/sdk/gyroscope/)

```ts
const subscription = Gyroscope.addListener(({ timestamp, z }) => {
  lab.write("rotation", { t: timestamp, value: z });
});

// When the source disconnects:
subscription.remove();
lab.gap("rotation");
```

The [complete adapter](../apps/pocket-lab/src/gyroscope.ts) handles availability, permissions and cleanup during setup. The [experiment screen](../apps/pocket-lab/src/GyroscopeScreen.tsx) stops collection when the app enters the background. When an instrument is retired, remove its source subscriptions and call `lab.dispose()`.

## External probe in Pocket Lab

Open **External probe** and enter the physical quantity, unit and clock name from your source. For a voltmeter, use `voltage`, `V` and the board’s clock name. Select **Use these settings** and enter the WebSocket address.

**Connect probe** starts live inspection. Press **Collect** or arm a threshold when the signal is ready. **Connect and collect** starts recording as soon as the connection opens. Each frame carries one reading or a batch for the selected channel. Disconnecting ends the capture, including when the source closes the socket. Tap **Save run** to keep it for later or share it under **Saved runs**.

For a voltage ramp from 0 V at 0 s to 4 V at 2 s, the linear integral is 4 V·s and the time mean is 2 V. Choose **Hold previous** if the source held 0 V until the second reading. The integral is then zero. The same settings work in the [browser inspector](https://anksharskarp.github.io/device-sensor-atlas/workbench/inspect/).

## Numeric WebSocket frames

For a sensor that sends one text frame per reading, carry time and value together:

```json
{"t":12.4,"value":0.731}
```

A source can also send a nonempty JSON array in acquisition order:

```json
[{"t":12.4,"value":0.731},{"t":12.5,"value":0.744}]
```

One malformed reading rejects the whole frame and calls `onInvalid` once. In a well-formed frame, duplicate and older times follow the instrument’s usual out-of-order policy. A threshold can fire between two readings in the same frame.

Import `bindSocket` from `@sensor-atlas/core/websocket`. See the [probe example](../examples/websocket.ts). The sender supplies `t` in seconds on the declared clock. If only receipt time is available, timestamp frames on arrival and declare `timestampKind: "receipt"`.

```ts
const lab = createInstrument({
  channels: { probe: { quantity: "voltage", unit: "V", clock: "board" } },
});
const disconnect = bindSocket(socket, lab, "probe", () => console.warn("Invalid probe frame"));
```

Closing the socket marks a gap. Call `disconnect()` to detach the adapter early. The app owns the connection and can attach a new socket after reconnecting. [WebSocket message events](https://websockets.spec.whatwg.org/#feedback-from-the-protocol)

## Replay a fixture

```tsx
const run = createPendulumRun();
return <RunInspector run={run} />;
```

The fixture contains ten cycles of a cosine at 50 samples per second. Use the same inspector for a saved run by passing the result of `parseRun(json)`. See [recordings and measurements](sessions.md).
