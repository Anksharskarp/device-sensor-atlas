import { useEffect, useState } from "react";
import { AppState, Button, View } from "react-native";
import { createInstrument, createPendulumRun, createReplay } from "@sensor-atlas/core";
import { InstrumentPanel, RunInspector, useInstrumentRevision } from "@sensor-atlas/react-native";
import { SaveRun } from "./SavedRuns";

export function PendulumScreen() {
  const [model] = useState(createPendulumRun);
  const [lab] = useState(() => createInstrument({ channels: model.channels }));
  const [playing, setPlaying] = useState(false);
  const [live, setLive] = useState(false);
  useInstrumentRevision(lab);

  useEffect(() => {
    if (!playing) return;
    const replay = createReplay(model.samples.rotation, 0);
    const started = performance.now();
    function tick() {
      const batch = replay.takeUntil((performance.now() - started) / 1000);
      if (batch.length) lab.writeBatch("rotation", batch);
      if (replay.done) setPlaying(false);
    }
    tick();
    const timer = setInterval(tick, 20);
    const state = AppState.addEventListener("change", next => {
      if (next === "background") setPlaying(false);
    });
    return () => {
      clearInterval(timer);
      state.remove();
      if (lab.collecting) lab.stop();
    };
  }, [playing, model, lab]);

  function play() {
    lab.gap("rotation");
    if (!lab.collecting) lab.start("Pendulum replay");
    setLive(true);
    setPlaying(true);
  }

  return <View style={{ gap: 8 }}>
    <Button title={playing ? "End replay" : "Replay and collect"} onPress={playing ? () => setPlaying(false) : play} />
    {live && !playing && <Button title="Inspect original model" onPress={() => setLive(false)} />}
    {live ? <InstrumentPanel instrument={lab} runName="Pendulum replay" /> : <RunInspector run={model} />}
    <SaveRun run={live ? lab.lastRun : model} />
  </View>;
}
