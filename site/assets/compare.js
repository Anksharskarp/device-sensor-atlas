import { comparePeriods, parseRun, traceEnvelope } from './core/index.js';

const fields = [...document.querySelectorAll('[data-source]')];
const selections = [];
const sequences = [0, 0];
const view = document.querySelector('#comparison');
const status = document.querySelector('#comparison-status');
const text = (selector, value) => { document.querySelector(selector).textContent = value; };
const seconds = number => number.toFixed(3) + ' s';

function draw(comparison) {
  const origins = [comparison.reference.origin, comparison.trial.origin];
  const end = Math.min(...selections.map(({run, channel, segment}, index) =>
    run.samples[channel].findLast(s => s.segment === segment).t - origins[index]));
  const traces = selections.map(({run, channel, segment}, index) =>
    traceEnvelope(run.samples[channel], segment, origins[index], origins[index] + end, 800));
  let min = 0;
  let max = 0;
  for (const trace of traces) for (const point of trace) {
    min = Math.min(min, point.value);
    max = Math.max(max, point.value);
  }
  const y = v => 5 + (max - v) / (max - min || 1) * 170;
  const zero = document.querySelector('#zero-line');
  zero.setAttribute('y1', y(0));
  zero.setAttribute('y2', y(0));
  traces.forEach((points, i) => {
    const coords = points.map(p => [(p.t - origins[i]) / end * 800, y(p.value)].join(','));
    document.querySelector('[data-line="' + i + '"]').setAttribute('points', coords.join(' '));
  });
  text('#overlay-legend', 'Reference (solid) and trial (dashed) · ' + min.toFixed(2) + ' to ' + max.toFixed(2) + ' ' + comparison.reference.channel.unit);
  text('#overlay-end', seconds(end));
}

function update() {
  view.hidden = true;
  status.textContent = '';
  if (!selections[0] || !selections[1]) return;
  try {
    const result = comparePeriods(...selections);
    text('#reference-period', seconds(result.reference.measurement.periodSeconds));
    text('#trial-period', seconds(result.trial.measurement.periodSeconds));
    text('#period-change', (result.changePercent > 0 ? '+' : '') + result.changePercent.toFixed(1) + '%');
    const body = document.querySelector('#period-details');
    body.replaceChildren();
    [result.reference, result.trial].forEach(({measurement, origin}, i) => {
      const row = body.insertRow();
      for (const value of [selections[i].run.name, measurement.cycles, seconds(origin), seconds(measurement.shortestSeconds) + ' to ' + seconds(measurement.longestSeconds)]) {
        row.insertCell().textContent = value;
      }
    });
    draw(result);
    view.hidden = false;
  } catch (error) {
    status.textContent = error.message;
  }
}

function chooseChannel(i) {
  const selection = selections[i];
  if (!selection) return;
  selection.channel = fields[i].querySelector('[data-channel]').value;
  const segments = [...new Set(selection.run.samples[selection.channel].map(s => s.segment))];
  const menu = fields[i].querySelector('[data-segment]');
  menu.replaceChildren(...segments.map(n => new Option(String(n), String(n))));
  selection.segment = segments[0];
  update();
}

async function load(i, file) {
  const sequence = ++sequences[i];
  const field = fields[i];
  selections[i] = undefined;
  field.querySelector('[data-name]').textContent = file?.name ?? 'Loading example…';
  field.querySelector('[data-error]').textContent = '';
  field.querySelector('[data-channel]').replaceChildren();
  field.querySelector('[data-segment]').replaceChildren();
  update();
  try {
    let json;
    if (file) json = await file.text();
    else {
      const response = await fetch('model-' + i + '.json');
      if (!response.ok) throw new Error('Could not open the example recording.');
      json = await response.text();
    }
    if (sequence !== sequences[i]) return;
    const run = parseRun(json);
    field.querySelector('[data-name]').textContent = run.name;
    field.querySelector('[data-channel]').replaceChildren(...Object.keys(run.channels).map(key => new Option(key, key)));
    selections[i] = { run };
    chooseChannel(i);
  } catch (error) {
    if (sequence === sequences[i]) field.querySelector('[data-error]').textContent = error.message;
  }
}

fields.forEach((field, i) => {
  field.querySelector('[data-channel]').onchange = () => chooseChannel(i);
  field.querySelector('[data-segment]').onchange = event => {
    if (selections[i]) selections[i].segment = Number(event.target.value);
    update();
  };
  field.querySelector('[data-file]').onchange = event => {
    if (event.target.files[0]) load(i, event.target.files[0]);
  };
  load(i);
});
document.querySelector('#reset-models').onclick = () => fields.forEach((field, i) => {
  field.querySelector('[data-file]').value = '';
  load(i);
});
