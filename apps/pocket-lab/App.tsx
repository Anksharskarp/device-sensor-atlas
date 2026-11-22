import { useState } from "react";
import { Button, ScrollView, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { PendulumScreen } from "./src/PendulumScreen";
import { createGyroscope, GyroscopeScreen } from "./src/GyroscopeScreen";
import { TiltScreen } from "./src/TiltScreen";
import { SavedRuns } from "./src/SavedRuns";

export default function App() {
  const [gyro] = useState(createGyroscope);
  const [screen, setScreen] = useState<"model" | "gyro" | "tilt" | "files">("model");
  return (
    <SafeAreaProvider><SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text accessibilityRole="header" style={{ fontSize: 30 }}>Pocket Lab</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Button title="Pendulum model" onPress={() => setScreen("model")} />
          <Button title="Gyroscope" onPress={() => setScreen("gyro")} />
          <Button title="Static tilt" onPress={() => setScreen("tilt")} />
          <Button title="Saved runs" onPress={() => setScreen("files")} />
        </View>
        {screen === "gyro" && <GyroscopeScreen lab={gyro} />}
        {screen === "tilt" && <TiltScreen />}
        {screen === "files" && <SavedRuns />}
        {screen === "model" && <PendulumScreen />}
      </ScrollView>
    </SafeAreaView></SafeAreaProvider>
  );
}
