import { Text, View } from "react-native";

export function Meter({ value, unit }: { value: number | null; unit: string }) {
  return (
    <View>
      <Text style={{ fontSize: 32, fontVariant: ["tabular-nums"] }}>
        {value === null ? "No reading" : value.toFixed(3) + " " + unit}
      </Text>
    </View>
  );
}
