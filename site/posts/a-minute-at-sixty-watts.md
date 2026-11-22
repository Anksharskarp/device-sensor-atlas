A 60 W load running for a minute uses one watt-hour. That made it a convenient first test for the power meter. I added a fifteen-second ramp on either side of the minute and thirty seconds at zero, for a two-minute recording with an answer I could calculate on paper.

Each ramp has the area of a triangle, or 450 watt-seconds. Together they add a quarter of a watt-hour to the plateau. The expected result for the complete run is 1.25 Wh.

I spaced the samples unevenly. An arithmetic average would give a long quiet stretch the same influence as a burst of closely spaced readings. Integrating each pair over its actual time interval gives 37.5 W of mean power across the two minutes.

The power report lives in Pocket Lab. It receives the same cursor selections as the pendulum report, but interprets them in watts and seconds. The test writes the model readings through a real WebSocket connection and checks the watt-hours recovered at the other end. [Inspect the load cycle](../../workbench/inspect/)
