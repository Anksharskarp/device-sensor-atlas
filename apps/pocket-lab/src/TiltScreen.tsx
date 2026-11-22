import { useEffect, useRef, useState } from "react";
import { AppState, Button, Text, View } from "react-native";
import { Accelerometer, type AccelerometerMeasurement } from "expo-sensors";
import { gravityPose, measureTilt, type Run } from "@sensor-atlas/core";
import { collectPose, tiltRun } from "./accelerometer";
import { SaveRun } from "./SavedRuns";

export function TiltScreen() {
  const request = useRef<AbortController | null>(null);
  const [reference, setReference] = useState<AccelerometerMeasurement[]>();
  const [run, setRun] = useState<Run>();
  const [angle, setAngle] = useState<number>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const listener = AppState.addEventListener("change", state => {
      if (state === "background") request.current?.abort();
    });
    return () => {
      listener.remove();
      request.current?.abort();
      request.current = null;
    };
  }, []);

  async function record(position: "reference" | "trial") {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setMessage("Hold the phone still.");
    try {
      const samples = await collectPose(Accelerometer, controller.signal);
      if (request.current !== controller || controller.signal.aborted) return;
      if (position === "reference" || !reference) {
        gravityPose(tiltRun(samples), 0);
        setReference(samples);
        setAngle(undefined);
        setRun(undefined);
        setMessage("Reference recorded. Rest the phone on the second surface.");
      } else {
        const next = tiltRun(reference, samples);
        const result = measureTilt(next);
        setAngle(result.degrees);
        setRun(next);
        setMessage("25 readings per position.");
      }
    } catch (error) {
      if (request.current === controller) setMessage(String(error instanceof Error ? error.message : error));
    } finally {
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  }
  return <View style={{ gap: 12 }}>
    <Text accessibilityRole="header" style={{ fontSize: 24 }}>Static tilt</Text>
    <Text>Place the phone face up on a level reference. Keep the same edge pointing uphill when moving it to the slope.</Text>
    <Button title={reference ? "Retake reference" : "Record reference"} disabled={busy} onPress={() => record("reference")} />
    <Button title="Measure second position" disabled={busy || !reference} onPress={() => record("trial")} />
    {angle !== undefined && <Text style={{ fontSize: 36 }}>Last measurement: {angle.toFixed(1)}°</Text>}
    <Text accessibilityLiveRegion="polite">{message}</Text>
    {run && <SaveRun run={run} />}
  </View>;
}
