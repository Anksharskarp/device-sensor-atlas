import { StyleSheet } from "react-native";

export const ink = "#202124";
export const paper = "#ffffff";
export const rule = "#c7c7c7";
export const layout = StyleSheet.create({
  panel: { backgroundColor: paper, padding: 16, gap: 12 },
  stack: { gap: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  label: { color: ink, fontSize: 16 },
  axis: { flexDirection: "row", justifyContent: "space-between" },
  button: { paddingHorizontal: 12, minHeight: 44, justifyContent: "center", borderWidth: 1, borderColor: rule },
  selected: { backgroundColor: ink },
});
