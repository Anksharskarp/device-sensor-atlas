import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import type { GestureResponderEvent } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { traceEnvelope } from "@sensor-atlas/core";
import type { Reading } from "@sensor-atlas/core";
import { ink, layout, rule } from "./theme.js";

export interface TracePlotProps {
  readings: readonly Reading[];
  segment: number;
  start: number;
  end: number;
  unit: string;
  cursors?: readonly number[];
  onCursor?: (time: number) => void;
}

const height = 152;
const inset = 4;

export function TracePlot({ readings, segment, start, end, unit, cursors = [], onCursor }: TracePlotProps) {
  const [width, setWidth] = useState(1);
  const points = useMemo(() => traceEnvelope(readings, segment, start, end, width), [readings, segment, start, end, width]);
  let min = points[0]?.value ?? 0;
  let max = min;
  for (const sample of points) {
    min = Math.min(min, sample.value);
    max = Math.max(max, sample.value);
  }
  const x = (time: number) => inset + (time - start) / (end - start) * Math.max(1, width - 2 * inset);
  const y = (value: number) => max === min ? height / 2 : inset + (max - value) / (max - min) * (height - 2 * inset);
  function touch(event: GestureResponderEvent) {
    const fraction = (event.nativeEvent.locationX - inset) / Math.max(1, width - 2 * inset);
    onCursor?.(start + Math.max(0, Math.min(1, fraction)) * (end - start));
  }
  return (
    <View style={layout.stack}>
      <Text style={layout.label}>{points.length ? min.toFixed(2) + " to " + max.toFixed(2) + " " + unit : "Waiting for samples"}</Text>
      <View onLayout={e => setWidth(Math.max(1, Math.floor(e.nativeEvent.layout.width)))}
        onStartShouldSetResponder={() => !!onCursor} onResponderGrant={touch} onResponderMove={touch}>
        <View pointerEvents="none">
          <Svg width="100%" height={height}>
            <Line x1={0} x2={width} y1={height - 1} y2={height - 1} stroke={rule} />
            {min < 0 && max > 0 && <Line x1={0} x2={width} y1={y(0)} y2={y(0)} stroke={rule} />}
            <Polyline fill="none" stroke={ink} strokeWidth={2} points={points.map(p => x(p.t) + "," + y(p.value)).join(" ")} />
            {points.length === 1 && <Circle cx={x(points[0].t)} cy={y(points[0].value)} r={2} fill={ink} />}
            {cursors.map((t, i) => <Line key={i} x1={x(t)} x2={x(t)} y1={0} y2={height} stroke={ink} strokeDasharray={i ? "2 3" : "7 3"} />)}
          </Svg>
        </View>
      </View>
      <View style={layout.axis}>
        <Text style={layout.label}>{start.toFixed(2)} s</Text><Text style={layout.label}>{end.toFixed(2)} s</Text>
      </View>
    </View>
  );
}
