import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import type { Instrument } from "@sensor-atlas/core";
import { Button } from "./Button.js";
import { layout } from "./theme.js";

export function ThresholdControls<K extends string>({ instrument, channel, name, durationSeconds }: {
  instrument: Instrument<K>; channel: K; name?: string; durationSeconds?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [edge, setEdge] = useState<"rising" | "falling">("rising");
  const [input, setInput] = useState("1");
  const [error, setError] = useState("");
  const settings = instrument.armed;
  if (settings) return <Text accessibilityLiveRegion="polite" style={layout.label}>
    Armed on {settings.channel} · {settings.edge} through {settings.level} {instrument.channels[settings.channel].unit}
  </Text>;
  if (instrument.collecting) return null;
  function arm() {
    const level = Number(input.trim());
    if (!input.trim() || !Number.isFinite(level)) {
      setError("Enter a numeric threshold.");
      return;
    }
    try {
      instrument.arm({ channel, level, edge, name, durationSeconds });
      setError("");
      setExpanded(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }
  if (!expanded) return <Button label="Set threshold trigger" onPress={() => setExpanded(true)} />;
  return <View style={layout.stack}>
    <Text style={layout.label}>Trigger level on {channel} ({instrument.channels[channel].unit})</Text>
    <TextInput accessibilityLabel="Trigger level" value={input} onChangeText={setInput}
      style={[layout.button, layout.label]} keyboardType="numbers-and-punctuation" />
    <View style={layout.row}>
      <Button label="Rising" selected={edge === "rising"} onPress={() => setEdge("rising")} />
      <Button label="Falling" selected={edge === "falling"} onPress={() => setEdge("falling")} />
      <Button label="Arm" onPress={arm} />
      <Button label="Cancel" onPress={() => setExpanded(false)} />
    </View>
    {error && <Text accessibilityRole="alert" style={layout.label}>{error}</Text>}
  </View>;
}
