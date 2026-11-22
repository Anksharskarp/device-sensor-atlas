import { parseArgs } from "node:util";
import { WebSocketServer, WebSocket } from "ws";
import { createReplay } from "@sensor-atlas/core";
import { powerExample } from "../apps/pocket-lab/src/instruments/power.ts";

export function servePowerExample({ host = "127.0.0.1", port = 8787, speed = 1 } = {}) {
  if (!Number.isFinite(speed) || speed <= 0) throw new Error("Speed must be positive");
  const run = powerExample();
  const server = new WebSocketServer({ host, port });
  server.on("connection", socket => {
    const replay = createReplay(run.samples.load, 0);
    const start = performance.now();
    const timer = setInterval(() => {
      if (socket.readyState !== WebSocket.OPEN) return;
      for (const { t, value } of replay.takeUntil((performance.now() - start) * speed / 1000)) {
        socket.send(JSON.stringify({ t, value }));
      }
      if (replay.done) socket.close(1000, "End of load cycle");
    }, 50);
    socket.once("close", () => clearInterval(timer));
  });
  return server;
}

if (import.meta.main) {
  const { values } = parseArgs({ options: {
    host: { type: "string", default: "127.0.0.1" },
    port: { type: "string", default: "8787" },
  } });
  const server = servePowerExample({ host: values.host, port: Number(values.port) });
  server.once("listening", () => console.log("Model wattmeter listening on " + values.host + ":" + server.address().port));
}
