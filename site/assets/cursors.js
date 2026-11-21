const trace = document.querySelector('#trace');
const samples = JSON.parse(document.querySelector('#sample-data').textContent);
const inputs = [...document.querySelectorAll('.cursor-input input')];
const [firstTime] = samples[0];
const duration = samples.at(-1)[0] - firstTime;
const { width, height } = trace.viewBox.baseVal;
const limit = Number(trace.dataset.limit);

function drawCursor(index) {
  const input = inputs[index];
  const [time, value] = samples[input.valueAsNumber];
  const x = (time - firstTime) / duration * width;
  const group = trace.querySelector(`[data-cursor="${index}"]`);
  const line = group.querySelector('line');
  line.setAttribute('x1', x);
  line.setAttribute('x2', x);
  const dot = group.querySelector('circle');
  dot.setAttribute('cx', x);
  dot.setAttribute('cy', (1 - value / limit) * height / 2);
  input.parentElement.querySelector('output').value = time.toFixed(2) + ' s';
  input.setAttribute('aria-valuetext', time.toFixed(2) + ' seconds');
  const [a, b] = inputs.map(cursor => samples[cursor.valueAsNumber][0]);
  document.querySelector('#elapsed').value = Math.abs(b - a).toFixed(2);
}

inputs.forEach((input, index) => {
  input.addEventListener('input', () => drawCursor(index));
  drawCursor(index);
});

let drag;
function traceTime(event) {
  const rect = trace.getBoundingClientRect();
  return firstTime + duration * (event.clientX - rect.left) / rect.width;
}

function move(event) {
  if (event.pointerId !== drag?.pointerId) return;
  const time = traceTime(event);
  let best = 0;
  for (let i = 1; i < samples.length; i++) {
    if (Math.abs(samples[i][0] - time) < Math.abs(samples[best][0] - time)) best = i;
  }
  inputs[drag.index].valueAsNumber = best;
  drawCursor(drag.index);
}

trace.addEventListener('pointerdown', event => {
  if (drag || event.button !== 0) return;
  const time = traceTime(event);
  const distances = inputs.map(input => Math.abs(samples[input.valueAsNumber][0] - time));
  drag = { pointerId: event.pointerId, index: distances[0] <= distances[1] ? 0 : 1 };
  trace.setPointerCapture(event.pointerId);
  move(event);
});
trace.addEventListener('pointermove', move);
trace.addEventListener('lostpointercapture', () => { drag = undefined; });
