import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { createInstrument, type Instrument } from "@sensor-atlas/core";
import { ActionButton, instrumentColors } from "@sensor-atlas/react-native";
import { SocketRecorder } from "./SocketRecorder";
import { SaveRun } from "./SavedRuns";

export interface Probe {
  quantity: string;
  lab: Instrument<string>;
}

export function ProbeScreen({ probe, setProbe }: { probe?: Probe; setProbe: (probe: Probe) => void }) {
  const channel = probe && probe.lab.channels[probe.quantity];
  const [editing, edit] = useState(!probe);
  const [quantity, setQuantity] = useState(channel?.quantity ?? "");
  const [unit, setUnit] = useState(channel?.unit ?? "");
  const [clock, setClock] = useState(channel?.clock ?? "");
  function apply() {
    const spec = { quantity: quantity.trim(), unit: unit.trim(), clock: clock.trim() };
    if (!spec.quantity || !spec.unit || !spec.clock) return;
    if (!channel || spec.quantity !== channel.quantity || spec.unit !== channel.unit || spec.clock !== channel.clock) {
      const lab = createInstrument({ channels: { [spec.quantity]: spec } });
      probe?.lab.dispose();
      setProbe({ quantity: spec.quantity, lab });
    }
    edit(false);
  }
  if (editing || !probe) return <View style={{ gap: 12 }}>
    <Text>Describe the readings your probe sends. Pocket Lab stores these units and the source clock with every recording.</Text>
    <Field label="Quantity" hint="voltage" value={quantity} change={setQuantity} />
    <Field label="Unit" hint="V" value={unit} change={setUnit} />
    <Field label="Source clock" hint="bench meter" value={clock} change={setClock} />
    <ActionButton label="Use these settings" disabled={!quantity.trim() || !unit.trim() || !clock.trim()} onPress={apply} />
    {probe && <ActionButton label="Cancel" onPress={() => {
      setQuantity(channel!.quantity); setUnit(channel!.unit); setClock(channel!.clock); edit(false);
    }} />}
    {probe?.lab.lastRun && <View style={{ gap: 6 }}><Text>Save the last capture before replacing this probe.</Text><SaveRun run={probe.lab.lastRun} /></View>}
  </View>;
  return <View style={{ gap: 14 }}>
    <Text>{probe.quantity} · {channel?.unit} · {channel?.clock}</Text>
    <Text>Connect a probe that sends a numeric value and a source timestamp in seconds with each reading.</Text>
    <SocketRecorder lab={probe.lab} channel={probe.quantity} source="probe" runName={probe.quantity} onNewProbe={() => edit(true)} />
  </View>;
}

function Field({ label, hint, value, change }: {
  label: string; hint: string; value: string; change: (value: string) => void;
}) {
  return <View style={{ gap: 4 }}>
    <Text>{label}</Text>
    <TextInput accessibilityLabel={label} placeholder={hint} value={value} onChangeText={change}
      autoCapitalize="none" autoCorrect={false} style={{ padding: 12, backgroundColor: instrumentColors.inset, borderRadius: 8 }} />
  </View>;
}
