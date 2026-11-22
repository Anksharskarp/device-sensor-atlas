import { bindSocket } from "@sensor-atlas/core/websocket";
import type { Instrument } from "@sensor-atlas/core";

export function connectProbe(socket: WebSocket, lab: Instrument<"probe">) {
  return bindSocket(socket, lab, "probe", () => console.warn("Invalid probe frame"));
}
