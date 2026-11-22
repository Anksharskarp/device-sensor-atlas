import type { Accelerometer, AccelerometerMeasurement } from "expo-sensors";
import { createInstrument, type Axis } from "@sensor-atlas/core";

type Sensor = Pick<typeof Accelerometer, "isAvailableAsync" | "requestPermissionsAsync" | "setUpdateInterval" | "addListener">;

export async function collectPose(sensor: Sensor, signal: AbortSignal): Promise<AccelerometerMeasurement[]> {
  function checkSignal() {
    if (signal.aborted) throw new Error("Collection interrupted");
  }
  checkSignal();
  if (!await sensor.isAvailableAsync()) throw new Error("This device has no accelerometer.");
  checkSignal();
  if (!(await sensor.requestPermissionsAsync()).granted) throw new Error("Motion permission is required.");
  checkSignal();
  const samples: AccelerometerMeasurement[] = [];
  let subscription: { remove(): void } | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cancel: () => void = () => {};
  try {
    return await new Promise<AccelerometerMeasurement[]>((resolve, reject) => {
      cancel = () => reject(new Error("Collection interrupted"));
      signal.addEventListener("abort", cancel);
      timer = setTimeout(() => reject(new Error("Too few accelerometer readings. Try again.")), 3000);
      sensor.setUpdateInterval(20);
      subscription = sensor.addListener(s => {
        if (samples.length >= 25 || signal.aborted) return;
        if (![s.timestamp, s.x, s.y, s.z].every(Number.isFinite)) return;
        if (samples.length && s.timestamp <= samples[samples.length - 1].timestamp) return;
        samples.push(s);
        if (samples.length === 25) resolve(samples);
      });
    });
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", cancel);
    subscription?.remove();
  }
}

export function tiltRun(reference: readonly AccelerometerMeasurement[], trial?: readonly AccelerometerMeasurement[]) {
  const axes: Axis[] = ["x", "y", "z"];
  const channel = (axis: Axis) => ({ axis, quantity: "acceleration", unit: "g", clock: "phone" });
  const lab = createInstrument({ channels: { x: channel("x"), y: channel("y"), z: channel("z") } });
  lab.start("Static tilt");
  for (const axis of axes) {
    lab.writeBatch(axis, reference.map(s => ({ t: s.timestamp, value: s[axis] })));
    if (trial) {
      lab.gap(axis);
      lab.writeBatch(axis, trial.map(s => ({ t: s.timestamp, value: s[axis] })));
    }
  }
  return lab.stop();
}
