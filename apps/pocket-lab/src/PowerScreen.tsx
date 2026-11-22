import { useState } from "react";
import { Text, View } from "react-native";
import { createInstrument, type Instrument } from "@sensor-atlas/core";
import { powerChannel, powerExample } from "./instruments/power";
import { SocketRecorder } from "./SocketRecorder";

export const createPowerMeter = () => createInstrument({ channels: { load: powerChannel("meter") } });

export function PowerScreen({ lab }: { lab: Instrument<"load"> }) {
  const [example] = useState(powerExample);
  return <View style={{ gap: 14 }}>
    <Text>Open the model or connect a meter that sends timestamped power readings in watts.</Text>
    <SocketRecorder lab={lab} channel="load" source="meter" runName="Power measurement" example={example} />
  </View>;
}
