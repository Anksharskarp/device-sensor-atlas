import { powerExample } from '../apps/pocket-lab/src/instruments/power.ts';
import { apparatus } from './apparatus.mjs';
import { postList } from './posts/index.mjs';

function tiltBench() {
  return `<figure class="mini-bench"><figcaption>Static tilt model <span>Accelerometer</span></figcaption>
    <div class="bench-result"><output id="tilt-result">30.0</output><small>°</small></div>
    <svg class="slope" viewBox="0 0 360 140" role="img" aria-label="Angle of a phone relative to a level surface">
      <path class="datum" d="M20 113H340"/><g id="tilted-phone" transform="rotate(-30 55 113)">
      <path class="track" d="M55 113h235"/><rect x="103" y="97" width="112" height="15" rx="6" class="phone-edge"/>
      </g><circle cx="55" cy="113" r="4" class="bearing"/></svg>
    <label class="bench-slider">Surface angle <input id="slope-angle" disabled type="range" min="0" max="70" value="30" step="1"></label>
  </figure>`;
}

function powerBench() {
  const samples = powerExample().samples.load;
  const points = samples.map(s => (s.t * 3) + ',' + (115 - s.value * 1.5)).join(' ');
  return `<figure class="mini-bench"><figcaption>Load cycle model <span>Wattmeter</span></figcaption>
    <div class="bench-result"><output id="energy-result">1.250</output> <small>Wh</small></div>
    <svg id="energy-graph" viewBox="0 0 360 130" preserveAspectRatio="none" role="img" aria-label="Model power draw over a two-minute load cycle">
      <path class="datum" d="M0 115H360 M0 25H360"/><path id="energy-fill" />
      <polyline points="${points}" id="load-trace" class="track" fill="none"/><line id="energy-cursor" y1="8" y2="115" /></svg>
    <div class="mini-scale"><span>0 s</span><span>60 W peak</span><span>120 s</span></div>
    <label class="bench-slider">Integrate through <output id="end-label">120 s</output><input id="energy-end" disabled type="range" min="1" max="120" value="120" step="1"></label>
  <script type="application/json" id="load-data">${JSON.stringify(samples)}</script></figure>`;
}

const experiments = [
  { id: 'pendulum', name: 'Pendulum timer', title: 'How long is a swing?', description: 'Set the suspension length and watch the angular velocity as the phone passes through vertical. Compare two recordings to see how the period changes.', href: 'workbench/', link: 'Compare recordings', figure: apparatus },
  { id: 'tilt', name: 'Static tilt', title: 'Measure a change in inclination', description: 'Pocket Lab takes two stationary accelerometer readings, each averaged over a short window. The angle between the gravity vectors gives the tilt from the reference surface.', href: 'docs/tilt/', link: 'Static tilt guide', figure: tiltBench },
  { id: 'power', name: 'Power meter', title: 'Where the watt-hours go', description: 'This load rises to 60 watts, holds for a minute, then shuts down. Move the end of the interval to measure the energy delivered during each part of the cycle.', href: 'docs/power/', link: 'Connect a wattmeter', figure: powerBench },
];

export function home() {
  const links = experiments.map(e => `<a id="tab-${e.id}" href="#${e.id}" data-instrument="${e.id}">${e.name}</a>`).join('');
  const panels = experiments.map(e => `<section class="experiment-sheet" id="${e.id}" aria-labelledby="tab-${e.id}">
  <div class="sheet-copy"><h3>${e.title}</h3><p>${e.description}</p><a href="${e.href}">${e.link}</a></div>${e.figure()}</section>`).join('');
  return `<section class="cover">
    <div class="cover-copy"><p class="edition">Sensor Atlas for React Native</p><h1>Pocket Lab</h1>
    <p>Use the gyroscope in your phone to time a pendulum, or connect a bench meter to measure the energy drawn by a circuit. Pocket Lab keeps the original readings so you can return to any part of the experiment.</p>
    <div class="cover-actions"><a class="button cover-primary" href="#experiment">Explore the instruments</a><a href="docs/">SDK documentation</a></div></div>
    <img src="assets/images/pendulum-rig.webp" width="1536" height="1024" fetchpriority="high" alt="Illustration of a phone suspended from a clamp stand over an optical bench">
  </section>
  <section class="section instrument-library" id="experiment"><div class="section-title"><h2>Instrument bench</h2></div>
    <nav class="instrument-tabs" aria-label="Choose an experiment">${links}</nav>${panels}
  </section>
  <section class="section embed"><div><p class="eyebrow">React Native SDK</p><h2>An instrument of your own</h2>
    <p>Supply a channel with units and a clock. The panel handles collection and replay, and your analysis component receives the original samples between the two cursors.</p>
    <a href="docs/custom-instruments/">Write a measurement component</a></div>
    <figure class="code-window"><figcaption>PowerMeter.tsx</figcaption><pre><code>&lt;InstrumentPanel
  instrument={meter}
  runName=<span class="literal">"Bench supply"</span>
  analysis={EnergyReport}
  threshold
/&gt;</code></pre></figure></section>
  <section class="section journal"><header class="section-title"><h2>Development journal</h2><a href="journal/">All entries</a></header>${postList('journal/')}</section>`;
}
