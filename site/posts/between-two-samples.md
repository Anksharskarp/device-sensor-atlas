Suppose a sensor sends readings of 0, 6, and 0 at times 0.0, 0.1, and 1.0 seconds. The sample mean is 2. Each of the three readings gets one vote. Shuffle the timestamps and the result stays the same.

Now ask for the average value over the whole second. That question needs a model of the time between readings. If the signal rises and falls along straight lines, the area under the trace is 3 unit-seconds, giving an average of 3 units. If each reading holds until its successor, the signal spends nine tenths of the second at 6, giving an average of 5.4 units. The three recorded values support both calculations.

Sensor Atlas labels the arithmetic average as a sample mean. The interval also has a sample count, two endpoints, and a span in seconds. Those quantities let someone reading an experiment decide whether three observations are enough for the question at hand.

Consider a disconnected probe. Drawing a straight line between the last value before the disconnect and the first value after reconnection quietly chooses a model for everything that happened in between. A break in the trace leaves that interval available for what the experiment actually established: a period without observations.
