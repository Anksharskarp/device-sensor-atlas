import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Svg, { Line, Polyline } from "react-native-svg";
import { createPendulumRun, measurePeriod } from "@sensor-atlas/core";
import { ActionButton, instrumentColors as c } from "@sensor-atlas/react-native";
import { PendulumScreen } from "./src/PendulumScreen";
import { createGyroscope, GyroscopeScreen } from "./src/GyroscopeScreen";
import { TiltScreen } from "./src/TiltScreen";
import { createPowerMeter, PowerScreen } from "./src/PowerScreen";
import { ProbeScreen, type Probe } from "./src/ProbeScreen";
import { SavedRuns } from "./src/SavedRuns";

const screens = {
  home: "Pocket Lab", model: "Pendulum timer", gyro: "Gyroscope", tilt: "Static tilt",
  power: "Power meter", probe: "External probe", files: "Saved runs",
};
type Screen = keyof typeof screens;
const tools = [
  ["gyro", "Capture rotation on the x, y or z axis.", "rad/s"],
  ["tilt", "Measure a slope against a reference surface.", "°"],
  ["power", "Integrate readings from a wattmeter.", "Wh"],
  ["probe", "Record a sensor in its own units.", "WS"],
  ["files", "Reopen, import or share a recording.", "JSON"],
] as const;

const trace = createPendulumRun().samples.rotation;
const result = measurePeriod(trace, { segment: 0 })!;
const points = trace.map(s => (s.t * 30) + "," + (42 - s.value * 18)).join(" ");

function Catalog({ open }: { open: (screen: Screen) => void }) {
  return <View style={{ gap: 18 }}>
    <Pressable accessibilityRole="button" accessibilityLabel="Open the pendulum timer" onPress={() => open("model")}
      style={({ pressed }) => [styles.feature, pressed && styles.pressed]}>
      <Text style={styles.featureLabel}>GYROSCOPE MODEL</Text>
      <Text style={styles.featureTitle}>{screens.model}</Text>
      <Svg width="100%" height={84} viewBox="0 0 360 84" preserveAspectRatio="none" accessible={false}>
        <Line x1={0} x2={360} y1={42} y2={42} stroke={c.grid}/>
        <Polyline points={points} fill="none" stroke={c.signal} strokeWidth={2} />
      </Svg>
      <View style={styles.spread}><Text style={styles.featurePeriod}>{result.periodSeconds.toFixed(3)} s</Text>
        <Text style={styles.featureLabel}>Open experiment</Text></View>
    </Pressable>
    <View style={styles.list}>{tools.map(([id, description, unit]) =>
      <Pressable key={id} accessibilityRole="button" onPress={() => open(id)}
        style={({ pressed }) => [styles.entry, pressed && styles.pressed]}>
        <View style={styles.copy}><Text style={styles.name}>{screens[id]}</Text><Text style={styles.detail}>{description}</Text></View>
        <Text style={styles.unit}>{unit}</Text>
      </Pressable>)}</View>
  </View>;
}

export default function App() {
  const [probe, setProbe] = useState<Probe>();
  const [power] = useState(createPowerMeter);
  const [gyro] = useState(createGyroscope);
  const [screen, setScreen] = useState<Screen>("home");
  return <SafeAreaProvider><SafeAreaView style={styles.page}>
    <ScrollView key={screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.spread}><Text style={styles.brand}>Sensor Atlas</Text>
        {screen !== "home" && <ActionButton label="Instruments" onPress={() => setScreen("home")} />}</View>
      <Text accessibilityRole="header" style={styles.title}>{screens[screen]}</Text>
      {screen === "home" && <Catalog open={setScreen} />}
      {screen === "gyro" && <GyroscopeScreen lab={gyro} />}
      {screen === "tilt" && <TiltScreen />}
      {screen === "power" && <PowerScreen lab={power} />}
      {screen === "probe" && <ProbeScreen probe={probe} setProbe={setProbe} />}
      {screen === "files" && <SavedRuns />}
      {screen === "model" && <PendulumScreen />}
    </ScrollView>
  </SafeAreaView></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: c.canvas },
  content: { width: "100%", maxWidth: 760, alignSelf: "center", padding: 20, gap: 18 },
  spread: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  brand: { color: c.secondary, fontSize: 16, fontWeight: "600" },
  title: { fontSize: 40, fontWeight: "600", letterSpacing: -1.6, color: c.ink },
  feature: { padding: 20, borderRadius: 18, gap: 10, backgroundColor: c.field },
  featureLabel: { color: c.scale, fontSize: 14, letterSpacing: 0.35 },
  featureTitle: { color: c.onField, fontSize: 29, fontWeight: "600", letterSpacing: -1 },
  featurePeriod: { color: c.signal, fontSize: 23, fontVariant: ["tabular-nums"] },
  list: { backgroundColor: c.paper, borderRadius: 16, overflow: "hidden" },
  entry: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, gap: 12,
    borderBottomColor: c.rule, borderBottomWidth: StyleSheet.hairlineWidth },
  copy: { flex: 1, gap: 3 },
  name: { color: c.ink, fontSize: 18, fontWeight: "600" },
  detail: { color: c.secondary, fontSize: 15, lineHeight: 21 },
  unit: { color: c.secondary, fontSize: 14, fontWeight: "600" },
  pressed: { opacity: 0.75 },
});
