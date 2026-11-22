import { Pressable, Text } from "react-native";
import { layout, paper } from "./theme.js";

export function Button({ label, onPress, selected, disabled = false }: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected, disabled }} disabled={disabled}
    onPress={onPress} style={({ pressed }) => [layout.button, selected && layout.selected, pressed && layout.pressed, disabled && layout.disabled]}>
    <Text style={[layout.buttonLabel, selected && { color: paper }]}>{label}</Text>
  </Pressable>;
}
