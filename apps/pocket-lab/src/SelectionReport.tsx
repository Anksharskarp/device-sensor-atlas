import { Text, View } from "react-native";
import { PeriodReport, type SelectionProps } from "@sensor-atlas/react-native";
import { measureEnergy } from "./instruments/power";

export function SelectionReport(props: SelectionProps) {
  const { channel, readings, a, b } = props;
  if (channel.quantity === "angularVelocity") return <PeriodReport {...props} />;
  if (channel.quantity !== "power" || channel.unit !== "W") return null;
  const result = measureEnergy(readings, a.segment, a.t, b.t);
  return <View style={{ gap: 4 }}>
    <Text>Energy between cursors</Text>
    {result ? <>
      <Text style={{ fontSize: 30, fontVariant: ["tabular-nums"] }}>{result.wattHours.toFixed(3)} Wh</Text>
      <Text>{result.meanWatts.toFixed(2)} W time mean over {result.coveredSeconds.toFixed(2)} s</Text>
    </> : <Text>Select two distinct sample times.</Text>}
  </View>;
}
