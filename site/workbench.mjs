import { bench, pendulum } from './assets/apparatus.js';

export function modelRun(length) {
  const rate = 50;
  const duration = 16;
  const rotation = Array.from({length: duration * rate + 1}, (_, index) => {
    const t = index / rate;
    return { t, value: pendulum(length, t).velocity, segment: 0 };
  });
  return {
    version: 1, name: Math.round(length * 100) + ' cm pendulum model',
    channels: { rotation: { quantity: 'angularVelocity', unit: 'rad/s', clock: 'model', axis: 'z' } },
    samples: { rotation },
  };
}

export const exampleLengths = [bench.lengths[0], bench.lengths.at(-1)];

export function source(label, example) {
  return `<fieldset class="run-source" data-source><legend>${label}</legend>
    <p data-name></p>
    <div class="source-inputs">
      <label>Channel <select data-channel></select></label>
      <label>Segment <select data-segment></select></label>
    </div>
    <label class="file-label">Open session JSON <input type="file" accept=".json,application/json" data-file></label>
    <a href="${example}" download>Download example JSON</a>
    <p data-error role="alert"></p>
  </fieldset>`;
}

export function workbench() {
  return `<section class="section workbench">
    <header class="section-title"><h1>Compare recordings</h1>
    <p class="lead">The two example runs model a 40 cm and an 80 cm pendulum. To compare your own measurements, open two Pocket Lab sessions and select the oscillating axis from each. Files are read in this browser.</p></header>
    <nav class="work-modes" aria-label="Workbench modes"><a aria-current="page" href="./">Compare periods</a><a href="inspect/">Inspect one recording</a></nav>
    <noscript>Enable JavaScript to compare the recordings.</noscript>
    <div class="run-pair">${source('Reference', 'model-0.json')}${source('Trial', 'model-1.json')}</div>
    <button class="button" id="reset-models">Restore examples</button>
    <p role="status" id="comparison-status"></p>
    <section id="comparison" hidden aria-label="Comparison results">
      <dl class="comparison-metrics"><div><dt>Reference period</dt><dd id="reference-period"></dd></div><div><dt>Trial period</dt><dd id="trial-period"></dd></div><div><dt>Period change</dt><dd id="period-change"></dd></div></dl>
      <figure class="alignment"><figcaption id="overlay-legend"></figcaption>
      <svg id="overlay" viewBox="0 0 800 180" preserveAspectRatio="none" role="img" aria-label="Reference and trial aligned at their first rising crossing">
        <line x1="0" x2="800" id="zero-line" stroke="currentColor" opacity=".25"/>
        <polyline data-line="0"/><polyline data-line="1" stroke-dasharray="7 4"/>
      </svg><div class="overlay-axis"><span>0 s</span><span>Time since crossing</span><span id="overlay-end"></span></div></figure>
      <table><caption>Source measurements</caption><thead><tr><th>Run</th><th>Cycles</th><th>First crossing</th><th>Cycle range</th></tr></thead><tbody id="period-details"></tbody></table>
    </section>
    <p class="bench-method"><a href="../docs/pendulum/">How the SDK measures a period</a></p>
  </section>`;
}
