import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { measureInterval, nearestSample } from "@sensor-atlas/core";
import type { Reading, Run } from "@sensor-atlas/core";
import { Button } from "./Button.js";
import { TracePlot } from "./TracePlot.js";
import { layout } from "./theme.js";

export function TimeCursor({ label, reading, unit, selected, onSelect }: {
  label: string; reading: Reading; unit: string; selected: boolean; onSelect: () => void;
}) {
  return <Button label={label + "  " + reading.t.toFixed(3) + " s  ·  " + reading.value.toFixed(3) + " " + unit}
    selected={selected} onPress={onSelect} />;
}

function CursorSelection({ trace, unit }: { trace: readonly Reading[]; unit: string }) {
  const first = trace[0];
  const last = trace[trace.length - 1];
  const [a, setA] = useState(first);
  const [b, setB] = useState(last);
  const [active, select] = useState<"A" | "B">("A");
  const current = active === "A" ? a : b;
  const move = active === "A" ? setA : setB;
  const stats = useMemo(() => measureInterval(trace, first.segment, a.t, b.t)!, [trace, first.segment, a, b]);
  function step(direction: number) {
    const index = Math.max(0, Math.min(trace.length - 1, trace.indexOf(current) + direction));
    move(trace[index]);
  }
  return (
    <View style={layout.stack}>
      <TracePlot readings={trace} segment={first.segment} start={first.t} end={last.t === first.t ? first.t + 1 : last.t}
        unit={unit} cursors={[a.t, b.t]} onCursor={t => move(nearestSample(trace, first.segment, t)!)} />
      <Text style={layout.label}>Select a cursor, then drag it on the plot.</Text>
      <View style={layout.row}>
        <TimeCursor label="A" reading={a} unit={unit} selected={active === "A"} onSelect={() => select("A")} />
        <TimeCursor label="B" reading={b} unit={unit} selected={active === "B"} onSelect={() => select("B")} />
      </View>
      <View style={layout.row}>
        <Button label="Previous sample" onPress={() => step(-1)} />
        <Button label="Next sample" onPress={() => step(1)} />
      </View>
      <Text style={layout.label}>B − A  {(b.t - a.t).toFixed(3)} s  ·  {stats.deltaValue.toFixed(3)} {unit}</Text>
      <Text style={layout.label}>{stats.count} samples over {stats.coveredSeconds.toFixed(3)} s</Text>
      <Text style={layout.label}>Min {stats.min.toFixed(3)}  ·  Max {stats.max.toFixed(3)}  ·  Sample mean {stats.sampleMean.toFixed(3)} {unit}</Text>
    </View>
  );
}

export function SampleInspector({ readings, unit }: { readings: readonly Reading[]; unit: string }) {
  const segments = useMemo(() => Array.from(new Set(readings.map(s => s.segment))), [readings]);
  const [chosen, choose] = useState<number>();
  const segment = chosen !== undefined && segments.includes(chosen) ? chosen : segments[segments.length - 1];
  const trace = useMemo(() => readings.filter(s => s.segment === segment), [readings, segment]);
  if (!trace.length) return <Text style={layout.label}>No samples in this channel.</Text>;
  return (
    <View style={layout.stack}>
      {segments.length > 1 && <View style={layout.row}>{segments.map(s =>
        <Button key={s} label={"Segment " + s} selected={s === segment} onPress={() => choose(s)} />)}</View>}
      <CursorSelection key={segment} trace={trace} unit={unit} />
    </View>
  );
}

export function RunInspector<K extends string>({ run }: { run: Run<K> }) {
  const keys = Object.keys(run.channels) as K[];
  const [chosen, choose] = useState(keys[0]);
  const key = keys.includes(chosen) ? chosen : keys[0];
  return (
    <View style={layout.panel}>
      <Text accessibilityRole="header" style={layout.label}>{run.name}</Text>
      {keys.length > 1 && <View style={layout.row}>{keys.map(k =>
        <Button key={k} label={k} selected={k === key} onPress={() => choose(k)} />)}</View>}
      <Text style={layout.label}>{key} · {run.channels[key].unit}</Text>
      <SampleInspector key={key} readings={run.samples[key]} unit={run.channels[key].unit} />
    </View>
  );
}
