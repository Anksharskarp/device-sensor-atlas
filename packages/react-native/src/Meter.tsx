import { Text, View } from "react-native";
import { layout } from "./theme.js";

export function Meter({ value, unit }: { value: number | null; unit: string }) {
  return <View style={layout.axis}>
    <Text style={[layout.result, { fontSize: 42 }]}>
      {value === null ? "No reading" : <>{value.toFixed(3)} <Text style={layout.heading}>{unit}</Text></>}
    </Text>
  </View>;
}
