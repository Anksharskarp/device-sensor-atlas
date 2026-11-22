import { useEffect, useState } from "react";
import { AppState, Text, TextInput, View } from "react-native";
import type { Instrument, Run } from "@sensor-atlas/core";
import { bindSocket } from "@sensor-atlas/core/websocket";
import { ActionButton, instrumentColors, InstrumentPanel, RunInspector, useInstrumentRevision } from "@sensor-atlas/react-native";
import { SelectionReport } from "./SelectionReport";
import { SaveRun } from "./SavedRuns";

interface SocketRecorderProps<K extends string> {
  lab: Instrument<K>;
  channel: K;
  runName: string;
  source: string;
  example?: Run<K>;
  onNewProbe?: () => void;
}

export function SocketRecorder<K extends string>({ lab, channel, runName, source, example, onNewProbe }: SocketRecorderProps<K>) {
  const [showModel, setShowModel] = useState(Boolean(example && !lab.lastRun));
  const [address, setAddress] = useState("");
  const [endpoint, connect] = useState<{ url: string; collect: boolean }>();
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
    const detach = bindSocket(socket, lab, channel, () => setInvalid(count => count + 1));
    function end(message: string) {
      setMessage(message);
      setReady(false);
      connect(undefined);
    }
    socket.onopen = () => {
      if (endpoint.collect) lab.start(runName);
      setReady(true);
      setMessage("Connected.");
    };
    socket.onerror = () => end("Could not reach the source.");
    socket.onclose = () => end("Source disconnected.");
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
  }, [endpoint, lab, channel, runName]);

  function open(collect: boolean) {
    try {
      const url = new URL(address.trim());
      if (!["ws:", "wss:"].includes(url.protocol) || !url.hostname) throw new Error();
      setInvalid(0);
      setShowModel(false);
      setMessage("Connecting…");
      connect({ url: url.href, collect });
    } catch {
      setMessage("Enter a ws:// or wss:// source address.");
    }
  }

  const recording = showModel ? example : lab.lastRun;
  return <View style={{ gap: 14 }}>
    <TextInput accessibilityLabel="WebSocket address" placeholder="wss://host/path"
      autoCapitalize="none" autoCorrect={false} keyboardType="url" value={address} onChangeText={setAddress}
      editable={!endpoint} style={{ padding: 12, backgroundColor: instrumentColors.inset, borderRadius: 8 }} />
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {endpoint
        ? <ActionButton label="Disconnect" onPress={() => { setReady(false); setMessage("Disconnected."); connect(undefined); }} />
        : <ActionButton label={"Connect " + source} onPress={() => open(false)} />}
      {!endpoint && <ActionButton label="Connect and collect" onPress={() => open(true)} />}
      {!endpoint && onNewProbe && <ActionButton label="Change probe" onPress={onNewProbe} />}
      {!endpoint && example && <ActionButton label="Load example" onPress={() => { setShowModel(true); setMessage(""); }} />}
      {!endpoint && showModel && lab.lastRun && <ActionButton label="Last capture" onPress={() => setShowModel(false)} />}
    </View>
    {message ? <Text accessibilityLiveRegion="polite">{message}</Text> : null}
    {invalid > 0 && <Text>{invalid} invalid frames</Text>}
    {ready && endpoint ? <InstrumentPanel instrument={lab} analysis={SelectionReport} threshold runName={runName} />
      : recording && <RunInspector run={recording} analysis={SelectionReport} />}
    {recording && <SaveRun run={recording} />}
  </View>;
}
