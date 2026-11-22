import { createInstrument, measureTilt, integrateInterval } from './core/index.js';

const tabs = [...document.querySelectorAll('[data-instrument]')];
const nav = tabs[0].parentElement;
nav.setAttribute('role', 'tablist');
function select(id) {
  const selected = tabs.find(tab => tab.dataset.instrument === id) ?? tabs[0];
  for (const tab of tabs) {
    const panel = document.getElementById(tab.dataset.instrument);
    const active = tab === selected;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    panel.setAttribute('role', 'tabpanel');
    panel.hidden = !active;
  }
}
for (const [index, tab] of tabs.entries()) {
  tab.onclick = event => {
    event.preventDefault();
    history.replaceState(null, '', tab.hash);
    select(tab.dataset.instrument);
  };
  tab.onkeydown = event => {
    const keys = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
    if (!Object.hasOwn(keys, event.key)) return;
    event.preventDefault();
    const next = tabs[keys[event.key]];
    next.focus();
    next.click();
  };
}
select(location.hash.slice(1));
window.addEventListener('hashchange', () => select(location.hash.slice(1)));

const angle = document.querySelector('#slope-angle');
function drawTilt() {
  const degrees = Number(angle.value);
  const radians = degrees * Math.PI / 180;
  const axes = ['x', 'y', 'z'];
  const lab = createInstrument({ channels: Object.fromEntries(axes.map(axis =>
    [axis, { axis, quantity: 'acceleration', unit: 'g', clock: 'model' }])),
  });
  lab.start();
  for (const [position, values] of [[0, 0, 1], [Math.sin(radians), 0, Math.cos(radians)]].entries()) {
    axes.forEach((axis, index) => {
      if (position) lab.gap(axis);
      lab.writeBatch(axis, Array.from({ length: 25 }, (_, i) => ({ t: i / 50, value: values[index] })));
    });
  }
  document.querySelector('#tilt-result').value = measureTilt(lab.stop()).degrees.toFixed(1);
  document.querySelector('#tilted-phone').setAttribute('transform', 'rotate(-' + degrees + ' 55 113)');
  angle.setAttribute('aria-valuetext', degrees + ' degrees');
}
angle.disabled = false;
angle.oninput = drawTilt;
drawTilt();

const samples = JSON.parse(document.querySelector('#load-data').textContent);
const xy = (t, v) => (t * 3) + ',' + (115 - v * 1.5);
document.querySelector('#load-trace').setAttribute('points', samples.map(s => xy(s.t, s.value)).join(' '));
const end = document.querySelector('#energy-end');
function drawEnergy() {
  const t = Number(end.value);
  const integral = integrateInterval(samples, 0, 0, t, { interpolation: 'linear' });
  document.querySelector('#energy-result').value = (integral.area / 3600).toFixed(3);
  document.querySelector('#end-label').value = t + ' s';
  end.setAttribute('aria-valuetext', t + ' seconds');
  const after = samples.findIndex(s => s.t >= t);
  const a = samples[after - 1], b = samples[after];
  const value = a.value + (b.value - a.value) * (t - a.t) / (b.t - a.t);
  const polygon = samples.slice(0, after).map(s => xy(s.t, s.value));
  polygon.push(xy(t, value), xy(t, 0));
  document.querySelector('#energy-fill').setAttribute('d', 'M' + polygon.join(' L') + ' Z');
  for (const key of ['x1', 'x2']) document.querySelector('#energy-cursor').setAttribute(key, t * 3);
}
end.disabled = false;
end.oninput = drawEnergy;
drawEnergy();
