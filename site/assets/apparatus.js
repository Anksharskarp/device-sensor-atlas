export const bench = {
  lengths: [0.4, 0.6, 0.8],
  initialLength: 0.6,
  releaseDegrees: 10,
  gravity: 9.81,
  scale: 222,
  pivotX: 224,
  pivotY: 33,
  plot: { width: 400, height: 76, duration: 4, limit: 1 },
};

export function pendulum(length, time) {
  const frequency = Math.sqrt(bench.gravity / length);
  const phase = frequency * time;
  const amplitude = bench.releaseDegrees * Math.PI / 180;
  return {
    angleDegrees: bench.releaseDegrees * Math.cos(phase),
    velocity: -amplitude * frequency * Math.sin(phase),
    period: 2 * Math.PI / frequency,
  };
}

export function plotPoint(time, velocity) {
  const { width, height, duration, limit } = bench.plot;
  return [width * time / duration, height / 2 * (1 - velocity / limit)];
}

export function tracePath(length, start) {
  const { width, duration } = bench.plot;
  const points = [];
  for (let x = 0; x <= width; x += 2) {
    const t = duration * x / width;
    const [, y] = plotPoint(t, pendulum(length, start + t).velocity);
    points.push(`${x} ${y.toFixed(2)}`);
  }
  return 'M' + points.join(' L');
}
