import { bench, dimensionPath, pendulum, plotPoint, tracePath } from './assets/apparatus.js';

function suspension() {
  const { pivotX: x, pivotY: y, scale } = bench;
  const radius = scale * Math.max(...bench.lengths);
  const ticks = [];
  for (let degrees = -25; degrees <= 25; degrees += 1) {
    const major = degrees % 5 === 0;
    const a = degrees * Math.PI / 180;
    const h = major ? 7 : 3;
    ticks.push(`<path d="M${x + radius * Math.sin(a)} ${y + radius * Math.cos(a)} l${h * Math.sin(a)} ${h * Math.cos(a)}"/>`);
  }

  return `<g class="bench-stand">
      <path class="bench-base" d="M35 232l12-9h60l14 9v7H35z"/>
      <path d="M35 232h86 M52 239v3h13v-3m28 0v3h13v-3"/>
      <path class="bench-metal" d="M72 10q0-3 4-3t4 3v213q-4 4-8 0z"/>
      <path d="M76 12v208 M64 224q12 6 24 0"/>
      <rect class="bench-metal" x="48" y="14" width="249" height="6" rx="2"/>
      <path class="bench-base" d="M63 10h23v16H63z M86 15h8v6h-8"/>
      <path d="M66 13v10m4-10v10m4-10v10 M94 18h8"/>
      <path class="bench-metal" d="M100 13h4v10h-4z"/>
    </g>
    <path class="bench-rule" d="M196 20l11 13h34l12-13"/>
    <g class="bench-hardware" transform="translate(${x} ${y})">
      <path d="M-17 -15h34v13l-5 5h-24l-5-5z"/>
      <circle cx="-11" cy="-8" r="1.5"/><circle cx="11" cy="-8" r="1.5"/>
      <circle r="4"/>
    </g>
    <path class="bench-datum" d="M${x} ${y + 6}v184"/>
    <g class="bench-ticks">${ticks.join('')}</g>`;
}

function device() {
  return `<rect x="-14.5" y="-27" width="29" height="54" rx="4"/>
    <path d="M-10 -24h20q1.75 0 1.75 2v44q0 2-1.75 2h-20q-1.75 0-1.75-2v-44q0-2 1.75-2z"/>
    <path d="M-3 -21h6 M-3 21h6 M-5 0h10 M0 -5v10"/>
    <circle r="2"/> `;
}

function rig(length) {
  const { pivotX, pivotY, releaseDegrees, scale } = bench;
  const radius = length * scale;
  const bob = device();
  const arm = (angle, ghost) => `<g class="${ghost ? 'bench-ghost' : 'bench-arm'}" ${ghost ? '' : 'data-arm'}
      transform="translate(${pivotX} ${pivotY}) rotate(${-angle})">
    <path data-cord d="M0 0V${radius - 27}"/>
    <g data-phone transform="translate(0 ${radius})">${bob}</g></g>`;

  return `<svg class="bench-rig" viewBox="0 0 448 254" role="img" aria-label="Phone suspended from a pivot, released ten degrees from vertical">
    ${suspension()}
    <g class="bench-dimensions">
      <path data-dimension d="${dimensionPath(radius)}"/>
      <text data-length-label x="137" y="${pivotY + radius / 2}">${Math.round(length * 100)} cm</text>
    </g>
    ${arm(-releaseDegrees, true)}${arm(releaseDegrees, true)}${arm(releaseDegrees, false)}
    <text class="bench-note" x="285" y="76">${releaseDegrees}° release</text>
  </svg>`;
}

function scope(length) {
  const { width, height, duration, limit } = bench.plot;
  const [x, y] = plotPoint(0, 0);
  const grid = [];
  for (let second = 0; second <= duration; second++) {
    const x = width * second / duration;
    grid.push(`<path d="M${x} 0v${height}"/>`);
  }
  const labels = Array.from({ length: duration + 1 }, (_, i) => `<span data-second="${i}">${i}</span>`);
  return `<div class="bench-scope">
    <div class="bench-label">Angular velocity <span>(rad/s)</span></div>
    <div class="bench-scope-grid">
      <div class="bench-y" aria-hidden="true"><span>+${limit}</span><span>0</span><span>−${limit}</span></div>
      <svg class="bench-plot" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img"
          aria-label="Angular velocity in radians per second against time in seconds">
        <g class="bench-grid">${grid.join('')}<path d="M0 0H${width} M0 ${height / 2}H${width} M0 ${height}H${width}"/></g>
        <path class="bench-wave" data-wave d="${tracePath(length, 0)}"/>
        <path class="bench-position" data-position d="M${x} 0v${height}"/>
        <circle class="bench-point" data-point cx="${x}" cy="${y}" r="3.4"/>
      </svg>
      <div class="bench-x" aria-hidden="true">${labels.join('')}</div>
      <span class="bench-x-label">Time (s)</span>
    </div>
  </div>`;
}

export function apparatus() {
  const { initialLength, lengths } = bench;
  const options = lengths.map(length => {
    const cm = Math.round(length * 100);
    return `<label><input type="radio" name="pendulum-length" value="${length}" ${length === initialLength ? 'checked' : ''}><span>${cm} cm</span></label>`;
  });
  return `<figure class="pendulum-bench" id="pendulum-apparatus" aria-labelledby="pendulum-caption">
    <figcaption id="pendulum-caption"><strong>Pendulum simulation</strong>
      <span>Period <output data-period>${pendulum(initialLength, 0).period.toFixed(2)} s</output></span>
    </figcaption>
    ${rig(initialLength)}
    ${scope(initialLength)}
    <div class="bench-controls">
      <fieldset disabled><legend>Length</legend><div>${options.join('')}</div></fieldset>
      <button type="button" data-play disabled>Play</button>
    </div>
  </figure>`;
}
