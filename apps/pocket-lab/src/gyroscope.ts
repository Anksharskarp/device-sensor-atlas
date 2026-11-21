import type { Instrument } from "@sensor-atlas/core";
import type { Gyroscope } from "expo-sensors";

export const axes = ["x", "y", "z"] as const;
export type Axis = typeof axes[number];

type Sensor = Pick<typeof Gyroscope, "isAvailableAsync" | "requestPermissionsAsync" | "setUpdateInterval" | "addListener">;

export function connectGyroscope(sensor: Sensor, lab: Instrument<Axis>, onError: (message: string) => void) {
  let closed = false;
  let subscription: { remove(): void } | undefined;

  async function connect() {
    const available = await sensor.isAvailableAsync();
    if (closed) return;
    if (!available) throw new Error("This device has no gyroscope.");
    const permission = await sensor.requestPermissionsAsync();
    if (closed) return;
    if (!permission.granted) throw new Error("Motion permission is required to use the gyroscope.");
    sensor.setUpdateInterval(20);
    subscription = sensor.addListener(sample => {
      if (closed) return;
      for (const axis of axes) lab.write(axis, { t: sample.timestamp, value: sample[axis] });
    });
  }
  void connect().catch(error => {
    if (!closed) onError(error instanceof Error ? error.message : String(error));
  });

  return () => {
    if (closed) return;
    closed = true;
    subscription?.remove();
    for (const axis of axes) lab.gap(axis);
  };
}
