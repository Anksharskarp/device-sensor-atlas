export const bench = {
  lengths: [0.4, 0.6, 0.8],
  initialLength: 0.6,
  releaseDegrees: 10,
  gravity: 9.81,
  scale: 222,
  pivotX: 224,
  pivotY: 33,
  plot: { width: 400, height: 76, duration: 4, limit: 1 },
};

export function pendulum(length, time) {
  const frequency = Math.sqrt(bench.gravity / length);
  const phase = frequency * time;
  const amplitude = bench.releaseDegrees * Math.PI / 180;
  return {
    angleDegrees: bench.releaseDegrees * Math.cos(phase),
    velocity: -amplitude * frequency * Math.sin(phase),
    period: 2 * Math.PI / frequency,
  };
}

export function dimensionPath(radius) {
  const x = bench.pivotX - 96;
  return `M${x} ${bench.pivotY}v${radius}m-5 0h10 M${x - 5} ${bench.pivotY}h10`;
}

export function plotPoint(time, velocity) {
  const { width, height, duration, limit } = bench.plot;
  return [width * time / duration, height / 2 * (1 - velocity / limit)];
}

export function tracePath(length, start) {
  const { width, duration } = bench.plot;
  const points = [];
  for (let x = 0; x <= width; x += 2) {
    const t = duration * x / width;
    const [, y] = plotPoint(t, pendulum(length, start + t).velocity);
    points.push(`${x} ${y.toFixed(2)}`);
  }
  return 'M' + points.join(' L');
}

function connectBench(figure) {
  const find = selector => figure.querySelector(selector);
  const play = find('[data-play]');
  const fieldset = find('fieldset');
  const arm = find('[data-arm]');
  const phones = figure.querySelectorAll('[data-phone]');
  const cords = figure.querySelectorAll('[data-cord]');
  const dimension = find('[data-dimension]');
  const lengthLabel = find('[data-length-label]');
  const period = find('[data-period]');
  const wave = find('[data-wave]');
  const marker = find('[data-position]');
  const dot = find('[data-point]');
  const ticks = figure.querySelectorAll('[data-second]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let length = bench.initialLength;
  let playing = !motion.matches;
  let visible = true;
  let elapsed = 0;
  let frame = null;
  let previous = null;
  let windowStart = null;

  function draw() {
    const { duration, height } = bench.plot;
    const start = Math.floor(elapsed / duration) * duration;
    if (start !== windowStart) {
      windowStart = start;
      wave.setAttribute('d', tracePath(length, start));
      for (const tick of ticks) tick.textContent = start + Number(tick.dataset.second);
    }
    const state = pendulum(length, elapsed);
    const [x, y] = plotPoint(elapsed - start, state.velocity);
    arm.setAttribute('transform', `translate(${bench.pivotX} ${bench.pivotY}) rotate(${-state.angleDegrees})`);
    marker.setAttribute('d', `M${x} 0v${height}`);
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
  }

  function advance(now) {
    if (previous !== null) elapsed += (now - previous) / 1000;
    previous = now;
    draw();
    frame = requestAnimationFrame(advance);
  }

  function updatePlayback() {
    if (frame !== null) cancelAnimationFrame(frame);
    previous = null;
    frame = playing && visible && !document.hidden ? requestAnimationFrame(advance) : null;
    play.textContent = playing ? 'Pause' : 'Play';
    play.toggleAttribute('data-playing', playing);
  }

  play.disabled = false;
  fieldset.disabled = false;
  play.addEventListener('click', () => {
    playing = !playing;
    updatePlayback();
  });
  fieldset.addEventListener('change', event => {
    length = Number(event.target.value);
    const radius = length * bench.scale;
    for (const phone of phones) phone.setAttribute('transform', `translate(0 ${radius})`);
    for (const cord of cords) cord.setAttribute('d', `M0 0V${radius - 27}`);
    lengthLabel.textContent = Math.round(length * 100) + ' cm';
    lengthLabel.setAttribute('y', bench.pivotY + radius / 2);
    dimension.setAttribute('d', dimensionPath(radius));
    period.value = pendulum(length, 0).period.toFixed(2) + ' s';
    windowStart = null;
    elapsed = 0;
    previous = null;
    draw();
  });

  document.addEventListener('visibilitychange', updatePlayback);
  motion.addEventListener('change', () => {
    if (motion.matches) {
      playing = false;
      updatePlayback();
    }
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    });
    observer.observe(figure);
  }
  updatePlayback();
}

if (typeof document !== 'undefined') {
  const figure = document.querySelector('.pendulum-bench');
  if (figure) connectBench(figure);
}
