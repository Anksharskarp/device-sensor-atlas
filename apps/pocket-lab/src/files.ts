import { Directory, File, Paths } from "expo-file-system";
import { parseRun, serializeRun } from "@sensor-atlas/core";
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
    await pending.move(new File(dir, name + ".json"));
  } catch (error) {
    if (pending.exists) pending.delete();
    throw error;
  }
}

export async function openRun(file: File) {
  return parseRun(await file.text());
}
