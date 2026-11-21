import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import type { File } from "expo-file-system";
import type { Run } from "@sensor-atlas/core";
import { RunInspector } from "@sensor-atlas/react-native";
import { savedRuns, openRun, saveRun } from "./files";

export function SaveRun({ run }: { run?: Run }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  useEffect(() => setStatus(""), [run]);
  async function save() {
    if (!run || busy) return;
    setBusy(true);
    try {
      await saveRun(run);
      setStatus("Saved on this device.");
    } catch (error) {
      setStatus(String(error));
    } finally {
      setBusy(false);
    }
  }
  return <View>
    <Button title="Save run" disabled={busy || !run} onPress={save} />
    {status ? <Text accessibilityLiveRegion="polite">{status}</Text> : null}
  </View>;
}

export function SavedRuns() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState<Run>();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    try { setFiles(savedRuns()); } catch (error) { setError(String(error)); }
  }, []);
  async function open(file: File) {
    setBusy(true);
    try {
      setOpened(await openRun(file));
      setError("");
    } catch (error) {
      setError(String(error));
    } finally {
      setBusy(false);
    }
  }
  if (opened) return <View>
    <Button title="Back to saved runs" onPress={() => setOpened(undefined)} />
    <RunInspector run={opened} />
  </View>;
  return <View style={{ gap: 8 }}>
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    {!files.length && !error && <Text>Save a completed run to reopen it here.</Text>}
    {files.map(file => <Button key={file.uri} title={file.name.replace(/-[a-z0-9]+\.json$/, "")}
      disabled={busy} onPress={() => open(file)} />)}
  </View>;
}
