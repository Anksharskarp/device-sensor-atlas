import { useEffect, useState } from "react";
import { AppState, Button, Text, TextInput, View } from "react-native";
import { createInstrument, type Instrument } from "@sensor-atlas/core";
import { bindSocket } from "@sensor-atlas/core/websocket";
import { InstrumentPanel, RunInspector, useInstrumentRevision } from "@sensor-atlas/react-native";
import { powerChannel, powerExample } from "./instruments/power";
import { SelectionReport } from "./SelectionReport";
import { SaveRun } from "./SavedRuns";

export const createPowerMeter = () => createInstrument({ channels: { load: powerChannel("meter") } });

export function PowerScreen({ lab }: { lab: Instrument<"load"> }) {
  const [model] = useState(powerExample);
  const [showModel, setShowModel] = useState(!lab.lastRun);
  const [address, setAddress] = useState("");
  const [endpoint, connect] = useState<{ url: string }>();
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [invalid, setInvalid] = useState(0);
  useInstrumentRevision(lab);

  useEffect(() => {
    if (!endpoint) return;
    let socket: WebSocket;
    try {
      socket = new WebSocket(endpoint.url);
    } catch (error) {
      setMessage(String(error));
      connect(undefined);
      return;
    }
    const detach = bindSocket(socket, lab, "load", () => setInvalid(count => count + 1));
    function end(message: string) {
      setMessage(message);
      setReady(false);
      connect(undefined);
    }
    socket.onopen = () => { setReady(true); setMessage("Connected to the meter."); };
    socket.onerror = () => end("Could not reach the meter.");
    socket.onclose = () => end("Meter disconnected.");
    const state = AppState.addEventListener("change", next => {
      if (next === "background") end("Disconnected when Pocket Lab entered the background.");
    });
    return () => {
      state.remove();
      socket.onopen = socket.onerror = socket.onclose = null;
      detach();
      lab.disarm();
      if (lab.collecting) lab.stop();
      socket.close();
    };
  }, [endpoint, lab]);

  function open() {
    try {
      const url = new URL(address.trim());
      if (!["ws:", "wss:"].includes(url.protocol) || !url.hostname) throw new Error();
      setInvalid(0);
      setShowModel(false);
      setMessage("Connecting…");
      connect({ url: url.href });
    } catch {
      setMessage("Enter a ws:// or wss:// meter address.");
    }
  }

  const recording = showModel ? model : lab.lastRun;
  return <View style={{ gap: 14 }}>
    <Text>Open the model or connect a meter that sends timestamped power readings in watts.</Text>
    <TextInput accessibilityLabel="Meter WebSocket address" placeholder="wss://meter.example/power"
      autoCapitalize="none" autoCorrect={false} keyboardType="url" value={address} onChangeText={setAddress}
      editable={!endpoint} style={{ padding: 12, backgroundColor: "#f1f1ee", borderRadius: 8 }} />
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {endpoint
        ? <Button title="Disconnect" onPress={() => { setReady(false); setMessage("Disconnected."); connect(undefined); }} />
        : <Button title="Connect meter" onPress={open} />}
      {!endpoint && <Button title="Load example" onPress={() => { setShowModel(true); setMessage(""); }} />}
      {!endpoint && showModel && lab.lastRun && <Button title="Last capture" onPress={() => setShowModel(false)} />}
    </View>
    {message ? <Text accessibilityLiveRegion="polite">{message}</Text> : null}
    {invalid > 0 && <Text>{invalid} invalid frames</Text>}
    {ready && endpoint ? <InstrumentPanel instrument={lab} analysis={SelectionReport} threshold runName="Power measurement" />
      : recording && <RunInspector run={recording} analysis={SelectionReport} />}
    {recording && <SaveRun run={recording} />}
  </View>;
}
