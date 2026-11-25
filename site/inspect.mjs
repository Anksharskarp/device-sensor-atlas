import { source } from './workbench.mjs';

export function inspect() {
  return `<section class="section workbench"><header class="section-title"><h1>Inspect a recording</h1>
    <p class="lead">Select an interval to measure the signal and its integral. The example contains two minutes of power readings from a model load.</p></header>
    <nav class="work-modes" aria-label="Workbench modes"><a href="../">Compare periods</a><a aria-current="page" href="./">Inspect one recording</a></nav>
    ${source('Recording', 'power.json')}
    <button class="button" id="restore">Restore example</button>
    <noscript>Enable JavaScript to inspect a recording.</noscript>
    <p role="status" id="inspection-status"></p>
    <section id="inspect-result" hidden aria-label="Selected interval">
      <dl class="comparison-metrics"><div><dt id="area-label">Integral</dt><dd id="area"></dd></div><div><dt>Time mean</dt><dd id="time-mean"></dd></div><div><dt>Coverage</dt><dd id="coverage"></dd></div></dl>
      <figure class="alignment"><figcaption id="scope-label"></figcaption>
      <svg id="single-trace" viewBox="0 0 800 180" preserveAspectRatio="none" aria-label="Channel trace with selected time interval" role="img">
        <rect id="band" y="0" height="180"/><polyline fill="none"/><circle r="3" hidden/>
        <line data-marker="a" y1="0" y2="180"/><line data-marker="b" y1="0" y2="180"/>
      </svg><div class="overlay-axis"><span id="first-time"></span><span>Source time</span><span id="last-time"></span></div></figure>
      <div class="interval-controls">${['a','b'].map(k => `<div class="cursor-reading"><label for="cursor-${k}">Cursor ${k.toUpperCase()}</label><output for="cursor-${k}" id="label-${k}"></output><input id="cursor-${k}" type="range" min="0" step="1"></div>`).join('')}
      <label>Interpolation<select id="interpolation"><option value="linear">Linear</option><option value="previous">Hold previous value</option></select></label></div>
      <p id="raw-stats"></p><button class="button" id="csv">Export channel CSV</button>
    </section></section>`;
}
