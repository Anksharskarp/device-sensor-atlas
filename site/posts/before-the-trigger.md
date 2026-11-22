The part of a swing I want to inspect often starts while my hand is still on the phone. Starting a recording at the first large gyroscope reading would leave out the release. Pocket Lab can now wait for a crossing and keep the readings leading up to it.

For a rising trigger at 0.5 rad/s, one reading must be below 0.5 and the next accepted reading at or above it. A reading exactly on the threshold belongs to the new run. If the sensor disconnects between those readings, the recorder waits for a fresh pair on the same side of the interruption.

I used a five-sample recording limit to check the boundary. With three pre-trigger slots, the input values −4, −3, −2, 0, 1, 2, 3 should produce a run containing −3, −2, 0, 1, 2 when the threshold is 1. The final 3 still goes into the live display. This short sequence exercises the ring wrapping, the trigger firing in the middle of a batch, and the recorder closing while data is still arriving.

The saved session identifies the channel, segment, threshold and source time of the crossing. Reopening the run gives me the same point from which to inspect the release.
