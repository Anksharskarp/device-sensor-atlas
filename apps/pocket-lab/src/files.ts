import { Directory, File, Paths } from "expo-file-system";
import { channelCsv, parseRun, serializeRun } from "@sensor-atlas/core";
import type { Run } from "@sensor-atlas/core";

function runDirectory() {
  const dir = new Directory(Paths.document, "runs");
  dir.create({ idempotent: true });
  return dir;
}

export function savedRuns() {
  return runDirectory().list()
    .filter((entry): entry is File => entry instanceof File && entry.name.endsWith(".json"))
    .sort((a, b) => b.name.localeCompare(a.name));
}

export async function saveRun(run: Run) {
  const dir = runDirectory();
  const name = new Date().toISOString().replaceAll(":", "-") + "-" + Math.random().toString(36).slice(2, 8);
  const pending = new File(dir, name + ".part");
  pending.create();
  try {
    await pending.write(serializeRun(run));
    const complete = new File(dir, name + ".json");
    await pending.move(complete);
    return complete;
  } catch (error) {
    if (pending.exists) pending.delete();
    throw error;
  }
}

export async function openRun(file: File) {
  return parseRun(await file.text());
}

export async function exportCsv(run: Run, key: string) {
  const label = key.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48);
  const file = new File(Paths.cache, label + "-" + Date.now() + ".csv");
  file.create();
  await file.write(channelCsv(run, key));
  return file;
}
