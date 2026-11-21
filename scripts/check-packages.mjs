import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const app = join(root, "apps/pocket-lab");
const consumer = mkdtempSync(join(tmpdir(), "atlas-consumer-"));
const env = { ...process.env, CI: "1", EXPO_NO_TELEMETRY: "1" };

function npm(cwd, ...args) {
  execFileSync(process.execPath, [process.env.npm_execpath, ...args], { cwd, env, stdio: "inherit" });
}

try {
  npm(root, "run", "build");
  npm(root, "pack", "-w", "@sensor-atlas/core", "-w", "@sensor-atlas/react-native", "--pack-destination", consumer);
  const manifest = JSON.parse(readFileSync(join(app, "package.json"), "utf8"));
  const tarballs = readdirSync(consumer);
  for (const name of ["core", "react-native"]) {
    const file = tarballs.find(file => file.startsWith("sensor-atlas-" + name + "-") && file.endsWith(".tgz"));
    if (!file) throw new Error("Missing tarball for " + name);
    manifest.dependencies["@sensor-atlas/" + name] = "file:./" + file;
  }
  const workspace = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  manifest.devDependencies.typescript = workspace.devDependencies.typescript;
  writeFileSync(join(consumer, "package.json"), JSON.stringify(manifest));
  for (const file of ["index.js", "App.tsx", "app.json", "tsconfig.json", "src"]) {
    cpSync(join(app, file), join(consumer, file), { recursive: true });
  }
  npm(consumer, "install", "--prefer-offline", "--no-audit", "--no-fund");
  npm(consumer, "run", "check");
  npm(consumer, "exec", "--", "expo", "export", "--platform", "ios", "--platform", "android", "--max-workers", "2");
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
