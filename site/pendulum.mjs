const width = 720;
const height = 204;
const xDivisions = 6;
const subdivisions = 4;

function grid() {
  const lines = [];
  const steps = xDivisions * subdivisions;
  for (let column = 0; column <= steps; column++) {
    const x = width * column / steps;
    const weight = column % subdivisions === 0 ? 'major' : 'minor';
    lines.push(`<line class="${weight}" x1="${x}" x2="${x}" y1="0" y2="${height}"/>`);
  }
  for (let row = 0; row <= 8; row++) {
    const y = height * row / 8;
    const weight = row === 4 ? 'major' : 'minor';
    lines.push(`<line class="${weight}" x1="0" x2="${width}" y1="${y}" y2="${y}"/>`);
  }
  return lines.join('');
}

export function instrument(run) {
  const samples = run.samples.rotation;
  const unit = run.channels.rotation.unit;
  const first = samples[0].t;
  const duration = samples.at(-1).t - first;
  const peak = Math.max(...samples.map(sample => Math.abs(sample.value)));
  const limit = Math.max(0.5, Math.ceil(peak * 2) / 2);
  const x = t => (t - first) / duration * width;
  const y = value => (1 - value / limit) * height / 2;
  const points = samples.map(({t, value}) => [x(t).toFixed(2), y(value).toFixed(2)].join(','));

  const ticks = Array.from({ length: xDivisions + 1 }, (_, i) => {
    const t = first + duration * i / xDivisions;
    return `<span>${Number(t.toFixed(2))}</span>`;
  });
  const cursors = [0.1, 0.8].map(fraction => Math.round((samples.length - 1) * fraction));
  const markers = cursors.map((index, cursor) => {
    const sample = samples[index];
    return `<g data-cursor="${cursor}">
      <line x1="${x(sample.t)}" x2="${x(sample.t)}" y1="0" y2="${height}"/>
      <circle cx="${x(sample.t)}" cy="${y(sample.value)}" r="4.5"/>
    </g>`;
  });
  const controls = cursors.map((index, cursor) => {
    const id = `cursor-${cursor}`;
    return `<label class="cursor-input" for="${id}">
      <span>Cursor ${cursor === 0 ? 'A' : 'B'}</span>
      <output for="${id}">${samples[index].t.toFixed(2)} s</output>
      <input id="${id}" type="range" min="0" max="${samples.length - 1}" value="${index}" step="1">
    </label>`;
  });
  const elapsed = samples[cursors[1]].t - samples[cursors[0]].t;
  const data = samples.map(({ t, value }) => [t, value]);

  return `<section class="instrument-wrap" id="experiment" aria-labelledby="experiment-title">
  <div class="instrument">
    <header class="instrument-head">
      <div><span class="scope-icon" aria-hidden="true">∿</span><h2 id="experiment-title">Pendulum</h2></div>
      <span>Synthetic replay</span>
    </header>
    <div class="instrument-body">
      <figure class="scope">
        <figcaption>Angular velocity <span>(${unit})</span></figcaption>
        <div class="graph">
          <div class="y-ticks" aria-hidden="true"><span>+${limit}</span><span>0</span><span>−${limit}</span></div>
          <svg id="trace" role="img" aria-label="Angular velocity over ${duration.toFixed(1)} seconds"
              viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" data-limit="${limit}">
            <g aria-hidden="true">${grid()}</g>
            <polyline class="signal" points="${points.join(' ')}"/>
            ${markers.join('')}
          </svg>
          <div class="x-ticks" aria-hidden="true">${ticks.join('')}</div>
        </div>
        <p class="axis-name">Time (s)</p>
      </figure>
      <div class="inspector">
        <h3>Cursor interval</h3>
        <p class="reading"><output id="elapsed">${elapsed.toFixed(2)}</output> <span>s</span></p>
        <div class="cursor-controls">${controls.join('')}</div>
      </div>
    </div>
    <div class="instrument-foot"><span>${samples.length} samples</span><span>${duration.toFixed(2)} s window</span></div>
  </div>
  <p class="demo-hint">Drag the cursors to measure the time between two peaks.</p>
  <script id="sample-data" type="application/json">${JSON.stringify(data)}</script>
</section>`;
}
