import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { integrateInterval, type IntegrationOptions } from "@sensor-atlas/core";
import type { SelectionProps } from "./RunInspector.js";
import { Button } from "./Button.js";
import { layout } from "./theme.js";

export function IntegralReport({ readings, a, b, channel }: SelectionProps) {
  const [mode, setMode] = useState<IntegrationOptions["interpolation"]>("linear");
  const result = useMemo(() => integrateInterval(readings, a.segment, a.t, b.t, { interpolation: mode }),
    [readings, a, b, mode]);
  const format = (value: number) => Number(value.toPrecision(5)).toString();
  return <View style={layout.stack}>
    <Text accessibilityRole="header" style={layout.label}>Integral between cursors</Text>
    <View style={layout.row}>
      <Button label="Linear" selected={mode === "linear"} onPress={() => setMode("linear")} />
      <Button label="Hold previous" selected={mode === "previous"} onPress={() => setMode("previous")} />
    </View>
    {result ? <>
      <Text style={layout.result}>{format(result.area)} {channel.unit}·s</Text>
      <Text style={layout.label}>Time mean {format(result.timeMean)} {channel.unit} over {format(result.coveredSeconds)} s</Text>
    </> : <Text style={layout.label}>Select two distinct sample times.</Text>}
  </View>;
}
