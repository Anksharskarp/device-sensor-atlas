export function instrument(samples) {
  if (samples.length < 2) throw new Error('The pendulum fixture needs at least two samples');
  const first = samples[0].t;
  const last = samples.at(-1).t;
  const peak = Math.max(...samples.map(sample => Math.abs(sample.value)));
  const limit = Math.max(0.5, Math.ceil(peak * 2) / 2);
  const width = 720;
  const height = 204;
  const x = t => (t - first) / (last - first) * width;
  const y = value => (1 - value / limit) * height / 2;
  const points = samples.map(sample => `${x(sample.t).toFixed(2)},${y(sample.value).toFixed(2)}`).join(' ');
  const axes = [...Array(7)].map((_, i) => `<span>${Number((first + (last - first) * i / 6).toFixed(2))}</span>`).join('');
  const verticals = [...Array(25)].map((_, i) => `<line x1="${width * i / 24}" x2="${width * i / 24}" y1="0" y2="${height}" class="${i % 4 === 0 ? 'major' : 'minor'}"/>`).join('');
  const horizontals = [...Array(9)].map((_, i) => `<line x1="0" x2="${width}" y1="${height * i / 8}" y2="${height * i / 8}" class="${i === 4 ? 'major' : 'minor'}"/>`).join('');
  const defaults = [Math.round((samples.length - 1) / 10), Math.round((samples.length - 1) * .8)];
  const cursorLines = defaults.map((i, k) => `<g data-cursor="${k}"><line x1="${x(samples[i].t)}" x2="${x(samples[i].t)}" y1="0" y2="${height}"/><circle cx="${x(samples[i].t)}" cy="${y(samples[i].value)}" r="4.5"/></g>`).join('');
  const inputs = defaults.map((i, k) => `<label class="cursor-input"><span>Cursor ${k ? 'B' : 'A'}</span><output for="cursor-${k}">${(samples[i].t).toFixed(2)} s</output><input id="cursor-${k}" type="range" min="0" max="${samples.length - 1}" value="${i}" step="1"></label>`).join('');
  return `<section class="instrument-wrap" id="experiment" aria-labelledby="experiment-title">
<div class="instrument">
<header class="instrument-head"><div><span class="scope-icon" aria-hidden="true">∿</span><h2 id="experiment-title">Pendulum</h2></div><span>Synthetic replay</span></header>
<div class="instrument-body">
<figure class="scope"><figcaption>Angular velocity <span>(rad/s)</span></figcaption>
<div class="graph"><div class="y-ticks" aria-hidden="true"><span>+${limit}</span><span>0</span><span>−${limit}</span></div>
<svg id="trace" role="img" aria-label="Angular velocity over ${(last - first).toFixed(1)} seconds" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" data-limit="${limit}">
<g aria-hidden="true">${verticals}${horizontals}</g><polyline class="signal" points="${points}"/>${cursorLines}</svg>
<div class="x-ticks" aria-hidden="true">${axes}</div></div><p class="axis-name">Time (s)</p>
</figure>
<div class="inspector"><h3>Cursor interval</h3><p class="reading"><output id="elapsed">${(samples[defaults[1]].t - samples[defaults[0]].t).toFixed(2)}</output> <span>s</span></p>
<div class="cursor-controls">${inputs}</div></div>
</div>
<div class="instrument-foot"><span>${samples.length} samples</span><span>${(last - first).toFixed(2)} s window</span></div></div>
<p class="demo-hint">Drag the cursors to measure the time between two peaks.</p>
<script id="sample-data" type="application/json">${JSON.stringify(samples.map(({t, value}) => [t, value]))}</script></section>`;
}
