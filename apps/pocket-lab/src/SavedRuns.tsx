import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { getDocumentAsync } from "expo-document-picker";
import { shareAsync } from "expo-sharing";
import { File } from "expo-file-system";
import type { Run } from "@sensor-atlas/core";
import { RunInspector } from "@sensor-atlas/react-native";
import { savedRuns, openRun, saveRun, exportCsv } from "./files";

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
  const [opened, setOpened] = useState<{ run: Run; file: File }>();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    try { setFiles(savedRuns()); } catch (error) { setError(String(error)); }
  }, []);
  async function open(file?: File) {
    setBusy(true);
    try {
      if (file) {
        setOpened({ run: await openRun(file), file });
      } else {
        const picked = await getDocumentAsync({ type: "application/json", copyToCacheDirectory: true });
        if (picked.canceled) return;
        const run = await openRun(new File(picked.assets[0].uri));
        const savedFile = await saveRun(run);
        setFiles(savedRuns());
        setOpened({ run, file: savedFile });
      }
      setError("");
    } catch (error) {
      setError(String(error));
    } finally {
      setBusy(false);
    }
  }
  async function share(key?: string) {
    if (!opened || busy) return;
    setBusy(true);
    try {
      const file = key === undefined ? opened.file : await exportCsv(opened.run, key);
      await shareAsync(file.uri, { mimeType: key === undefined ? "application/json" : "text/csv" });
      setError("");
    } catch (error) {
      setError(String(error));
    } finally {
      setBusy(false);
    }
  }
  if (opened) return <View>
    <Button title="Back to saved runs" onPress={() => setOpened(undefined)} />
    <RunInspector run={opened.run} />
    <Button title="Share session JSON" disabled={busy} onPress={() => share()} />
    {Object.keys(opened.run.channels).map(key =>
      <Button key={key} title={"Share " + key + " CSV"} disabled={busy} onPress={() => share(key)} />)}
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
  </View>;
  return <View style={{ gap: 8 }}>
    <Button title="Import session JSON" disabled={busy} onPress={() => open()} />
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    {!files.length && !error && <Text>Save a completed run to reopen it here.</Text>}
    {files.map(file => <Button key={file.uri} title={file.name.replace(/-[a-z0-9]+\.json$/, "")}
      disabled={busy} onPress={() => open(file)} />)}
  </View>;
}
