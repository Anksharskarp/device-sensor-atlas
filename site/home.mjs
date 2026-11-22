import { comparePeriods } from '@sensor-atlas/core';
import { apparatus } from './apparatus.mjs';
import { exampleLengths, modelRun } from './workbench.mjs';
import { postList } from './posts/index.mjs';

export function home() {
  const selections = exampleLengths.map(length => ({ run: modelRun(length), channel: 'rotation', segment: 0 }));
  const result = comparePeriods(...selections);
  return `<section class="lab-hero" id="experiment">
  <div class="hero-copy">
    <p class="eyebrow">Pocket Lab / Rotational motion</p>
    <h1>The pendulum<br><em>experiment</em></h1>
    <p class="lead">How much longer does a swing take when you double the length of a pendulum? With Sensor Atlas, you can time the motion using a phone’s gyroscope and compare both recordings on the same set of axes.</p>
    <div class="actions"><a class="button primary" href="workbench/">Compare recordings</a><a class="text-action" href="docs/pendulum/">Experiment guide</a></div>
  </div>
  ${apparatus()}
</section>
<section class="results-strip" aria-label="Period measurements from two simulated runs">
  <div><h2>Model results</h2><p>16 seconds at 50 Hz</p></div>
  ${[result.reference, result.trial].map(({measurement}, i) =>
    `<div><span>${Math.round(exampleLengths[i] * 100)} cm suspension</span><strong>${measurement.periodSeconds.toFixed(3)} <small>s</small></strong></div>`).join('')}
  <div><span>Change in period</span><strong>+${result.changePercent.toFixed(1)}<small>%</small></strong></div>
</section>
<section class="section embed"><div>
  <p class="eyebrow">React Native SDK</p><h2>Capturing the<br>start of a swing</h2>
  <p>A threshold trigger lets you set the phone moving without having to reach for the record button. The run includes the lead-up to the crossing, so you can inspect how the motion began.</p>
  <a href="docs/integration/">Connect a sensor</a>
</div>
<figure class="code-window"><figcaption>Gyroscope capture · TypeScript</figcaption><pre><code>lab.arm({
  channel: <span class="literal">"rotation"</span>,
  edge: <span class="literal">"rising"</span>,
  level: 0.5,          <span class="comment">// rad/s</span>
  preSamples: 50,
  durationSeconds: 16,
  name: <span class="literal">"Long pendulum"</span>,
});</code></pre></figure></section>
<section class="section journal"><header class="section-title"><h2>Development journal</h2><a href="journal/">All entries</a></header>${postList('journal/')}</section>`;
}
