import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const app = join(root, "apps/pocket-lab");
const scratch = mkdtempSync(join(tmpdir(), "atlas-consumer-"));
const consumer = join(scratch, "mobile");
const env = { ...process.env, CI: "1", EXPO_NO_TELEMETRY: "1" };

function npm(cwd, ...args) {
  execFileSync(process.execPath, [process.env.npm_execpath, ...args], { cwd, env, stdio: "inherit" });
}

try {
  mkdirSync(consumer);
  npm(root, "run", "build");
  npm(root, "pack", "-w", "@sensor-atlas/core", "-w", "@sensor-atlas/react-native", "--pack-destination", consumer);
  const manifest = JSON.parse(readFileSync(join(app, "package.json"), "utf8"));
  const core = "@sensor-atlas/core";
  const native = "@sensor-atlas/react-native";
  const version = manifest.dependencies[core];
  assert.equal(manifest.dependencies[native], version, "Pocket Lab must pin both SDKs to the same version");
  const tarballs = readdirSync(consumer);
  for (const name of ["core", "react-native"]) {
    const file = tarballs.find(file => file.startsWith("sensor-atlas-" + name + "-") && file.endsWith(".tgz"));
    if (!file) throw new Error("Missing tarball for " + name);
    manifest.dependencies["@sensor-atlas/" + name] = "file:./" + file;
  }
  const nodeConsumer = join(scratch, "probe");
  mkdirSync(nodeConsumer);
  writeFileSync(join(nodeConsumer, "package.json"), JSON.stringify({ private: true, type: "module" }));
  const coreTarball = manifest.dependencies[core].slice("file:./".length);
  npm(nodeConsumer, "install", "--prefer-offline", "--no-audit", "--no-fund", join(consumer, coreTarball));
  for (const file of ["millivolt-probe.ts", "measure-probe.ts"]) {
    cpSync(join(root, "examples", file), join(nodeConsumer, file));
  }
  writeFileSync(join(nodeConsumer, "tsconfig.json"), JSON.stringify({
    compilerOptions: {
      module: "NodeNext", target: "ES2022", strict: true, noEmit: true, allowImportingTsExtensions: true, types: [],
    },
  }));
  execFileSync(process.execPath, [join(root, "node_modules/typescript/bin/tsc")], { cwd: nodeConsumer, stdio: "inherit" });
  const measurement = execFileSync(process.execPath, ["measure-probe.ts"], { cwd: nodeConsumer, encoding: "utf8" });
  assert.equal(measurement.trim(), "2 V·s over 2 s");

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
    assert.equal(metadata.name, "@sensor-atlas/" + name);
    assert.equal(metadata.version, version, metadata.name + " must match the Pocket Lab pin");
    if (metadata.name === native) {
      assert.equal(metadata.peerDependencies[core], version, "Native must pin the packed core version exactly");
    }
    assert.equal(metadata.license, "BSD-3-Clause");
    assert.equal(readFileSync(join(installed, "LICENSE"), "utf8"), license);
  }
  execFileSync(process.execPath, ["--input-type=module", "--eval", `
    import assert from "node:assert/strict";
    import { bindSocket } from "@sensor-atlas/core/websocket";
    import { createInstrument, createPendulumRun, integrateInterval, measurePeriod, parseRun, serializeRun } from "@sensor-atlas/core";
    const run = parseRun(serializeRun(createPendulumRun()));
    const result = measurePeriod(run.samples.rotation, { segment: 0 });
    assert.equal(result.cycles, 9);
    assert.ok(Math.abs(result.periodSeconds - 1.2) < 1e-6);
    const meter = createInstrument({ channels: { flow: { quantity: "volumeFlow", unit: "L/min", clock: "probe" } } });
    const socket = new EventTarget();
    const detach = bindSocket(socket, meter, "flow", () => assert.fail("Invalid frame"));
    meter.start("Dispensed volume");
    for (const t of [0, 5, 20]) {
      socket.dispatchEvent(new MessageEvent("message", { data: JSON.stringify({ t, value: 3 }) }));
    }
    detach();
    const saved = parseRun(serializeRun(meter.stop()));
    const volume = integrateInterval(saved.samples.flow, 0, 0, 20, { interpolation: "previous" });
    assert.equal(volume.area / 60, 1);
    assert.equal(volume.timeMean, 3);
  `], { cwd: consumer, stdio: "inherit" });
  npm(consumer, "run", "check");
  npm(consumer, "exec", "--", "expo", "export", "--platform", "ios", "--platform", "android", "--max-workers", "2");
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
