import assert from "node:assert/strict";
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
  const license = readFileSync(join(root, "LICENSE"), "utf8");
  for (const name of ["core", "react-native"]) {
    const installed = join(consumer, "node_modules", "@sensor-atlas", name);
    const metadata = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"));
    assert.equal(metadata.license, "BSD-3-Clause");
    assert.equal(readFileSync(join(installed, "LICENSE"), "utf8"), license);
  }
  execFileSync(process.execPath, ["--input-type=module", "--eval", `
    import assert from "node:assert/strict";
    import { createPendulumRun, measurePeriod, parseRun, serializeRun } from "@sensor-atlas/core";
    const run = parseRun(serializeRun(createPendulumRun()));
    const result = measurePeriod(run.samples.rotation, { segment: 0 });
    assert.equal(result.cycles, 9);
    assert.ok(Math.abs(result.periodSeconds - 1.2) < 1e-6);
  `], { cwd: consumer, stdio: "inherit" });
  npm(consumer, "run", "check");
  npm(consumer, "exec", "--", "expo", "export", "--platform", "ios", "--platform", "android", "--max-workers", "2");
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
