A phone receives a packet containing a sensor value and a timestamp of 4.20 seconds. Four seconds after what? The answer might be the start of a run, the last time the probe booted, or the moment its driver opened a connection.

For one probe, an unknown starting point often poses little trouble. Two peaks at 4.20 and 5.40 seconds are 1.20 seconds apart on that clock. A second probe creates a different problem. Its reading at 4.20 seconds might have occurred minutes later, even if the device reports the same units and the same nominal sample rate.

A Sensor Atlas channel names its clock alongside its physical quantity and unit. A source with its own timestamps can forward them in seconds. An integration that timestamps packets on arrival can identify the phone as the clock and record receipt timing. Packet delivery then becomes part of what the horizontal axis measures.

This distinction matters for replay. Given one saved channel, I can recover the period from the peaks without knowing when the experiment happened. To compare the timing of an event on two devices, I also need a relationship between their clocks. Writing down the clock when the channel is bound gives the next person a place to start.
