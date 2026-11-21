import { project } from './config.mjs';
import { instrument } from './pendulum.mjs';
import { postList } from './posts/index.mjs';

export function home(run) {
  return `<section class="hero">
<p class="eyebrow">Open-source instruments for React Native</p>
<h1>Your phone is a<br>lab instrument.</h1>
<p class="lead">Record a sensor, inspect its trace, and measure what happened. Bring the same instrument into your own app.</p>
<div class="actions"><a class="button primary" href="docs/">Get started</a><a class="button" href="#experiment">Try the pendulum</a></div>
</section>
${instrument(run.samples.rotation)}
<section class="section embed"><div>
<p class="eyebrow">The SDK</p><h2>Bring your own sensor.</h2>
<p>Feed a timestamp and a value from your sensor callback. The instrument keeps the readings and gives your app a meter, a plot, and collection controls.</p>
<a href="docs/">Read the integration guide</a>
</div>
<figure class="code-window"><figcaption>Gyroscope.tsx</figcaption><pre><code><span class="keyword">import</span> { createInstrument } <span class="keyword">from</span> <span class="literal">'@sensor-atlas/core'</span>;
<span class="keyword">import</span> { InstrumentPanel } <span class="keyword">from</span> <span class="literal">'@sensor-atlas/react-native'</span>;

<span class="keyword">const</span> lab = createInstrument({
  channels: {
    rotation: { quantity: <span class="literal">'angularVelocity'</span>,
      unit: <span class="literal">'rad/s'</span>, clock: <span class="literal">'phone'</span> },
  },
});

<span class="keyword">export function</span> onSample(t: number, value: number) {
  lab.write(<span class="literal">'rotation'</span>, { t, value });
}

<span class="keyword">export function</span> Gyroscope() {
  <span class="keyword">return</span> &lt;InstrumentPanel instrument={lab} /&gt;;
}</code></pre></figure></section>
<section class="section"><header class="section-title"><p class="eyebrow">${project.author}</p><h2>Development journal</h2></header>${postList('journal/')}</section>`;
}
