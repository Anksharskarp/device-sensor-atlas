import { useState } from "react";
import { Button, ScrollView, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { createPendulumRun } from "@sensor-atlas/core";
import { RunInspector } from "@sensor-atlas/react-native";

import { GyroscopeScreen } from "./src/GyroscopeScreen";

export default function App() {
  const [run] = useState(createPendulumRun);
  const [live, setLive] = useState(false);
  return (
    <SafeAreaProvider><SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text accessibilityRole="header" style={{ fontSize: 30 }}>Pocket Lab</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Button title="Pendulum model" onPress={() => setLive(false)} />
          <Button title="Gyroscope" onPress={() => setLive(true)} />
        </View>
        {live ? <GyroscopeScreen /> : <RunInspector run={run} />}
      </ScrollView>
    </SafeAreaView></SafeAreaProvider>
  );
}
