import { channelCsv, integrateInterval, measureInterval, traceEnvelope } from './core/index.js';
import { connectSource } from './source.js';

const get = id => document.getElementById(id);
const cursors = [get('cursor-a'), get('cursor-b')];
let selection;
let trace;
let x;
let drawTrace;

function display(number) {
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 5 }).format(number);
}

function measure() {
  if (!trace?.length) return;
  const { run, channel, segment } = selection;
  const { unit, quantity } = run.channels[channel];
  const endpoints = cursors.map(input => trace[Number(input.value)]);
  const [a, b] = endpoints.map(sample => sample.t);
  const area = integrateInterval(trace, segment, a, b, { interpolation: get('interpolation').value });
  const stats = measureInterval(trace, segment, a, b);
  const watts = unit === 'W' && quantity === 'power';
  get('area-label').textContent = watts ? 'Energy' : 'Integral';
  get('area').textContent = area ? display(watts ? area.area / 3600 : area.area) + (watts ? ' Wh' : ' ' + unit + '·s') : 'No interval';
  get('time-mean').textContent = area ? display(area.timeMean) + ' ' + unit : 'No interval';
  get('coverage').textContent = display(area?.coveredSeconds ?? 0) + ' s';
  get('raw-stats').textContent = stats.count + ' samples · Min ' + display(stats.min) + ' · Max ' + display(stats.max) + ' · Sample mean ' + display(stats.sampleMean) + ' ' + unit;
  get('band').setAttribute('x', Math.min(x(a), x(b)));
  get('band').setAttribute('width', Math.abs(x(b) - x(a)));
  endpoints.forEach(({ t, value }, i) => {
    const key = i ? 'b' : 'a';
    get('label-' + key).value = t + ' s · ' + value + ' ' + unit;
    cursors[i].setAttribute('aria-valuetext', t + ' seconds, ' + value + ' ' + unit);
    const marker = document.querySelector('[data-marker="' + key + '"]');
    for (const attr of ['x1', 'x2']) marker.setAttribute(attr, x(t));
  });
}

function show(next) {
  selection = next;
  trace = next?.run.samples[next.channel].filter(s => s.segment === next.segment);
  get('inspect-result').hidden = !trace?.length;
  get('inspection-status').textContent = next && !trace.length ? 'No samples in this channel.' : '';
  if (!trace?.length) return;
  const first = trace[0], last = trace.at(-1);
  const points = trace.length === 1 ? trace : traceEnvelope(trace, next.segment, first.t, last.t, 800);
  let min = first.value, max = min;
  for (const s of points) { min = Math.min(min, s.value); max = Math.max(max, s.value); }
  x = t => first.t === last.t ? 400 : 4 + (t - first.t) / (last.t - first.t) * 792;
  const y = v => min === max ? 90 : 5 + (max - v) / (max - min) * 170;
  drawTrace = () => {
    const vertices = [];
    const hold = get('interpolation').value === 'previous';
    for (const [i, sample] of points.entries()) {
      const time = x(sample.t);
      if (hold && i > 0) vertices.push(time + ',' + y(points[i - 1].value));
      vertices.push(time + ',' + y(sample.value));
    }
    document.querySelector('#single-trace polyline').setAttribute('points', vertices.join(' '));
  };
  drawTrace();
  const dot = document.querySelector('#single-trace circle');
  dot.style.display = trace.length === 1 ? 'inline' : 'none';
  dot.removeAttribute('hidden');
  dot.setAttribute('cx', x(first.t));
  dot.setAttribute('cy', y(first.value));
  get('scope-label').textContent = next.channel + ' · ' + display(min) + ' to ' + display(max) + ' ' + next.run.channels[next.channel].unit;
  get('first-time').textContent = display(first.t) + ' s';
  get('last-time').textContent = display(last.t) + ' s';
  cursors.forEach((input, i) => {
    input.max = trace.length - 1;
    input.value = i ? input.max : 0;
    input.disabled = trace.length === 1;
  });
  measure();
}

for (const input of cursors) input.oninput = measure;
get('interpolation').onchange = () => {
  if (!trace?.length) return;
  drawTrace();
  measure();
};
get('csv').onclick = () => {
  const { run, channel } = selection;
  const url = URL.createObjectURL(new Blob([channelCsv(run, channel)], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = channel + '.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
get('restore').onclick = connectSource(document.querySelector('[data-source]'), 'power.json', show);
