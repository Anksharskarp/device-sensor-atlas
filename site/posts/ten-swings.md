How long does it take a pendulum to complete one swing? With a stopwatch, I would time ten swings and divide by ten. The first Sensor Atlas experiment puts that same measurement on a phone screen.

A gyroscope measures angular velocity. As a pendulum passes through the bottom of its arc, it turns fastest. On the return trip, the sign changes. A positive peak followed by a negative peak covers half a cycle. Two consecutive positive peaks cover a full cycle.

The [cursor exercise](../../experiments/ten-swings/) contains ten cycles of a synthetic signal at 50 samples per second. Put cursor A at 0.00 seconds and cursor B at 12.00 seconds. There are eleven positive peaks, counting the two endpoints, and ten intervals between them. Dividing twelve seconds by ten gives a period of 1.20 seconds.

Now move B one sample to the left. The elapsed time changes by 0.02 seconds. Distributed over ten cycles, that moves the measured period by 0.002 seconds. Make the same cursor error over a single cycle and it changes the result by ten times as much.

The cursor readout keeps the original sample times, so both endpoints can be checked again after saving the run.
