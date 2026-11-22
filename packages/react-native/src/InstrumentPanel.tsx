import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { Text, View } from "react-native";
import type { Instrument, Reading } from "@sensor-atlas/core";
import { Button } from "./Button.js";
import { Meter } from "./Meter.js";
import { SampleInspector } from "./RunInspector.js";
import { ThresholdControls } from "./ThresholdControls.js";
import { TracePlot } from "./TracePlot.js";
import { layout } from "./theme.js";

export function useInstrumentRevision<K extends string>(instrument: Instrument<K>) {
  const subscribe = useCallback((notify: () => void) => {
    const timer = setInterval(notify, 100);
    return () => clearInterval(timer);
  }, []);
  return useSyncExternalStore(subscribe, () => instrument.revision, () => instrument.revision);
}

export function CaptureControls<K extends string>({ instrument, runName, durationSeconds }: {
  instrument: Instrument<K>; runName?: string; durationSeconds?: number;
}) {
  useInstrumentRevision(instrument);
  if (instrument.armed) return <Button label="Disarm" onPress={() => instrument.disarm()} />;
  return <Button label={instrument.collecting ? "Stop" : "Collect"} selected={instrument.collecting}
    onPress={() => instrument.collecting ? instrument.stop() : instrument.start(runName, durationSeconds)} />;
}

export function InstrumentPanel<K extends string>({ instrument, runName, durationSeconds, analysis, threshold = false }: {
  threshold?: boolean;
  analysis?: "period";
  instrument: Instrument<K>; runName?: string; durationSeconds?: number;
}) {
  const revision = useInstrumentRevision(instrument);
  const keys = Object.keys(instrument.channels) as K[];
  const [chosen, choose] = useState(keys[0]);
  const key = keys.includes(chosen) ? chosen : keys[0];
  const [frozen, freeze] = useState<readonly Reading[] | null>(null);
  const [review, setReview] = useState(false);
  const data = useMemo(() => instrument.readings(key), [instrument, key, revision]);
  const { unit, axis } = instrument.channels[key];
  const diagnostics = instrument.diagnostics(key);
  const latest = data[data.length - 1];
  const segment = diagnostics.segment;
  const current = latest?.segment === segment ? latest : undefined;
  const end = current?.t ?? 0;
  const held = review ? instrument.lastRun?.samples[key] : frozen;
  return (
    <View style={layout.panel}>
      {keys.length > 1 && <View style={layout.row}>{keys.map(k => <Button key={k} label={k} selected={k === key}
        onPress={() => { choose(k); freeze(null); }} />)}</View>}
      <Text style={layout.label}>{key}{axis ? " · " + axis + " axis" : ""}</Text>
      <Meter value={current?.value ?? null} unit={unit} />
      <View style={layout.row}>
        <CaptureControls instrument={instrument} runName={runName} durationSeconds={durationSeconds} />
        <Button label={held ? "Return to live" : "Freeze plot"} onPress={() => {
          freeze(held ? null : data);
          setReview(false);
        }} />
        {instrument.lastRun && !review && <Button label="Inspect last run" onPress={() => setReview(true)} />}
      </View>
      {threshold && <ThresholdControls instrument={instrument} channel={key} name={runName} durationSeconds={durationSeconds} />}
      {instrument.endedBy === "limit" && <Text style={layout.label}>Capture stopped at the sample limit.</Text>}
      {held ? <View style={layout.stack}>
        <Text style={layout.label}>{review ? instrument.lastRun?.name : "Frozen history"}</Text>
        <SampleInspector analysis={analysis} key={key} readings={held} unit={unit} />
      </View> : <TracePlot readings={data} segment={segment} start={end - 15} end={end} unit={unit} />}
      <Text style={layout.label}>Live · Segment {segment} · {diagnostics.observedHz?.toFixed(1) ?? "?"} Hz · {diagnostics.outOfOrder} out of order</Text>
    </View>
  );
}
