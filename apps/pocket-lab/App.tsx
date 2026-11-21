import { useState } from "react";
import { Button, ScrollView, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { createPendulumRun } from "@sensor-atlas/core";
import { RunInspector } from "@sensor-atlas/react-native";

import { GyroscopeScreen } from "./src/GyroscopeScreen";

import { SaveRun, SavedRuns } from "./src/SavedRuns";

export default function App() {
  const [run] = useState(createPendulumRun);
  const [screen, setScreen] = useState<"model" | "gyro" | "files">("model");
  return (
    <SafeAreaProvider><SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text accessibilityRole="header" style={{ fontSize: 30 }}>Pocket Lab</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Button title="Pendulum model" onPress={() => setScreen("model")} />
          <Button title="Gyroscope" onPress={() => setScreen("gyro")} />
          <Button title="Saved runs" onPress={() => setScreen("files")} />
        </View>
        {screen === "gyro" && <GyroscopeScreen />}
        {screen === "files" && <SavedRuns />}
        {screen === "model" && <View><RunInspector run={run} /><SaveRun run={run} /></View>}
      </ScrollView>
    </SafeAreaView></SafeAreaProvider>
  );
}
