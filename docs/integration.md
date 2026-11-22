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
npm install /path/to/atlas/dist/sensor-atlas-core-0.1.0-alpha.1.tgz /path/to/atlas/dist/sensor-atlas-react-native-0.1.0-alpha.1.tgz
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

## Numeric WebSocket frames

For a sensor that sends one text frame per reading, carry time and value together:

```json
{"t":12.4,"value":0.731}
```

Copy the [WebSocket adapter](../examples/websocket.ts) into your app. The sender supplies `t` in seconds on the declared clock. If only receipt time is available, timestamp frames on arrival and declare `timestampKind: "receipt"`.

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
