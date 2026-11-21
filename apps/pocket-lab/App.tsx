import { useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { createPendulumRun } from "@sensor-atlas/core";
import { RunInspector } from "@sensor-atlas/react-native";

export default function App() {
  const [run] = useState(createPendulumRun);
  return (
    <SafeAreaProvider><SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView><RunInspector run={run} /></ScrollView>
    </SafeAreaView></SafeAreaProvider>
  );
}
