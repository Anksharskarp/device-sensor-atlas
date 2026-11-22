import { useEffect, useState } from "react";
import { AppState, Text, View } from "react-native";
import { Gyroscope } from "expo-sensors";
import { createInstrument, type Instrument } from "@sensor-atlas/core";
import { InstrumentPanel, useInstrumentRevision } from "@sensor-atlas/react-native";
import { connectGyroscope, type Axis } from "./gyroscope";

import { SaveRun } from "./SavedRuns";

const channel = { quantity: "angularVelocity", unit: "rad/s", clock: "phone" };

export function createGyroscope() {
  return createInstrument({ channels: {
    x: { ...channel, axis: "x" }, y: { ...channel, axis: "y" }, z: { ...channel, axis: "z" },
  } });
}

export function GyroscopeScreen({ lab }: { lab: Instrument<Axis> }) {
  useInstrumentRevision(lab);
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
    <InstrumentPanel analysis="period" instrument={lab} runName="Gyroscope" />
    <SaveRun run={lab.lastRun} />
  </View>;
}
