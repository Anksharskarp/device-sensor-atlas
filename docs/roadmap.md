# Development roadmap

The next release should let a developer install both SDKs in a fresh app, attach an existing sensor callback and reproduce a measurement from a saved run. A good first contribution is a recording and its expected result. It gives the next person something concrete to build against.

## Starting point

The two SDK packages are prepared as `0.1.0-alpha.2`. Core handles manual, timed and threshold capture, pre-trigger history, replay, segmented samples and numerical integration. Pocket Lab measures period, static tilt and watt-hours, records external scalar probes over WebSocket, and saves session JSON and per-channel CSV. The browser workbench inspects recordings and compares oscillation periods. A [standalone Node consumer](integration.md#install-core-in-a-node-project) type-checks the packed core declarations and reproduces a 2 V·s integral from a binary probe frame. CI also installs packed artifacts in an isolated Expo app and exports both mobile bundles.

The [irregular flow fixture and hand calculation](custom-instruments.md#reproduce-an-interrupted-flow-reading) exercise a custom volume report with a ten-second gap. The reproducible result is 0.600 L over nine covered seconds.

The first npm publication, signed phone builds and hardware performance measurements are release work. The [original brief](../sensor-atlas-plan.md) sets the long-term targets. Track implementation in [GitHub Issues](https://github.com/Anksharskarp/device-sensor-atlas/issues) and link a merged change or a benchmark before marking a target complete.

## Next up: public alpha

| Work item | First contribution | Acceptance |
| --- | --- | --- |
| Fresh-app installation | Pack the candidate commit and install the tarballs in a separate minimal Expo app and a bare React Native app. Document the peer versions, native install steps and one sensor callback. | Another developer can build the app, feed a known signal and recover the expected result using only the public imports. Repeat against npm after publication. |
| Accessible inspection | Browser cursors expose the acquired time, value and unit at each keyboard step. Check the remaining segment, trigger and export controls at large text sizes and with a keyboard. Track native screen-reader trials with the device work. | A user can select either endpoint, step one acquired sample and read the time, value and unit without dragging a marker. |
| First npm prerelease | Confirm scope ownership, rehearse from a clean checkout, then follow the [SDK release guide](releases.md). | Both packages resolve at the same exact version from npm, a fresh consumer bundles, and the GitHub prerelease links to the artifacts and install instructions. |

## Next milestone: recordings that survive interruptions

1. **Recover a partial recording.** Start in [Pocket Lab storage](../apps/pocket-lab/src/files.ts). Today the app writes a completed run through a temporary file. Add an appendable capture writer with bounded chunks, a session identifier and a finalization step. Keep the exported session readable by the current reader. First test the writer with an interruption between chunks. Then connect it to collection and add recovery on launch. Accept when killing the writer mid-chunk restores every completed chunk once, identifies the last reliable time and leaves a previously saved run readable. Test low storage and retry.
2. **Explain missing samples.** Extend source diagnostics with sequence counters when a source supplies them. Distinguish a reported transport loss, a rejected timestamp and an explicit disconnect. Add a recording fixture with a missing sequence number and a clock reset. Accept when live inspection and replay agree about both breaks and a measurement spanning one reports only covered time. Keep quantities from independent clocks on separate timelines until an alignment is supplied.
3. **Annotate and compare runs.** The browser already aligns oscillations at the first rising crossing. Add a named marker tied to a channel, segment and source time, then persist it and align two runs by selected markers. Introduce the reader and migration fixtures before the editor. Accept when two runs can be aligned, saved and reopened with their source times intact, and incompatible units or clocks receive an explanation.
4. **Record calibration.** Start with one zero-offset probe. Store the raw value, unit, calibration parameters and the time at which they apply. Derive the corrected reading at inspection. Accept when a reader can reproduce both raw and corrected results after export and when an older uncalibrated file still opens.

Recovery can start immediately. Agree on the session representation before merging changes that persist diagnostics, markers or calibration. Update the schema, reader fixtures and [session guide](sessions.md) together.

## Field trials and beta

The device work can proceed once a signed preview build is available. Keep one row per trial with the app commit, phone model, OS, source and firmware, requested and observed rates, run length, interruptions, expected result and measured result. Attach a shareable recording and the steps to reproduce it.

- **Measure ten swings.** On an iPhone and an Android phone, collect a short and a long pendulum run. Check motion permission denial, retry, freeze while collecting, cursor placement, backgrounding, save, offline reopen and CSV sharing. Have a second person compare the periods using the files alone.
- **Measure capacity.** Feed four scalar channels at 100 samples/s each for ten foreground minutes. That gives 240,000 expected samples. Use a numbered source and count emitted, accepted and saved readings per channel. Record peak memory, p95 frame time and p95 ingestion-to-visible latency, with the method used to timestamp display. The brief proposes zero SDK drops and p95 display latency below 100 ms. Publish the actual results for each named phone, including misses.
- **Check first use.** Ask three makers to answer “How did the period change?” and two developers to embed the panel around their own data source. Record where each gets stuck, change the interface or guide, then repeat the failed step. Add tested combinations to a compatibility table with evidence from each trial.

## Stable release and independent instruments

Choose an instrument with a different physical quantity and a useful result. A timing gate is one candidate. An independent author can package a threshold-to-threshold transit-time measurement, a fixture with two known event times and a React Native report. A second developer should be able to install it, connect an existing source and reproduce the interval without changing Atlas. Use that exercise to settle what belongs in a preset API.

Before calling the SDK stable, publish the tested compatibility table, format migration policy, recovery results and performance measurements. Document the supported public imports and how long a saved format will remain readable. Version Pocket Lab separately from the SDK. Use the [app distribution guide](pocket-lab-distribution.md) for tester and store releases.

## Maintaining the backlog

Use one issue per independently testable outcome. Name the package or app surface, record the current behavior, list dependencies and finish with a result someone else can check. An issue that needs a physical device should name the device or source needed. At release time, move unfinished issues to the next milestone, link the shipped work from the release notes and refresh the starting point above.
