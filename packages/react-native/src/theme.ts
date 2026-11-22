import { Platform, StyleSheet } from "react-native";
import { instrumentColors as c } from "./tokens.js";

export const { ink, paper, rule } = c;
export const mono = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });
export const layout = StyleSheet.create({
  panel: { backgroundColor: paper, padding: 16, borderRadius: 16, gap: 14 },
  stack: { gap: 9 },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  result: { color: ink, fontSize: 32, letterSpacing: -1.2, fontWeight: "600", fontVariant: ["tabular-nums"] },
  label: { color: ink, fontSize: 16 },
  caption: { color: c.secondary, fontFamily: mono, fontSize: 13, lineHeight: 19 },
  heading: { fontWeight: "600", fontSize: 21, color: ink, letterSpacing: -0.6 },
  axis: { flexDirection: "row", justifyContent: "space-between" },
  button: { backgroundColor: c.inset, paddingHorizontal: 14, minHeight: 44, justifyContent: "center", borderRadius: 8 },
  buttonLabel: { color: ink, fontSize: 15, fontWeight: "600" },
  selected: { backgroundColor: ink },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.72 },
  scope: { backgroundColor: c.field, borderRadius: 12, padding: 14, gap: 10 },
  scaleLabel: { color: c.scale, fontSize: 13, fontFamily: mono },
});
