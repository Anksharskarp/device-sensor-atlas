import { Pressable, Text } from "react-native";
import { layout, paper } from "./theme.js";

export function Button({ label, onPress, selected }: {
  label: string;
  onPress: () => void;
  selected?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}
      style={[layout.button, selected && layout.selected]}>
      <Text style={[layout.label, selected && { color: paper }]}>{label}</Text>
    </Pressable>
  );
}
