import { useEffect, useState } from "react";
import { AppState, Text, View } from "react-native";
import { Gyroscope } from "expo-sensors";
import { createInstrument } from "@sensor-atlas/core";
import { InstrumentPanel } from "@sensor-atlas/react-native";
import { connectGyroscope } from "./gyroscope";

const channel = { quantity: "angularVelocity", unit: "rad/s", clock: "phone" };

export function GyroscopeScreen() {
  const [lab] = useState(() => createInstrument({ channels: {
    x: { ...channel, axis: "x" }, y: { ...channel, axis: "y" }, z: { ...channel, axis: "z" },
  } }));
  const [error, setError] = useState("");
  useEffect(() => {
    let disconnect: (() => void) | undefined;
    function update(state: string) {
      if (state === "active") {
        if (!disconnect) {
          setError("");
          disconnect = connectGyroscope(Gyroscope, lab, setError);
        }
      } else if (state === "background") {
        disconnect?.();
        disconnect = undefined;
        if (lab.collecting) lab.stop();
      }
    }
    if (AppState.currentState) update(AppState.currentState);
    const listener = AppState.addEventListener("change", update);
    return () => {
      listener.remove();
      disconnect?.();
      if (lab.collecting) lab.stop();
    };
  }, [lab]);
  return <View>
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    <InstrumentPanel instrument={lab} runName="Gyroscope" />
  </View>;
}
