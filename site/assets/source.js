import { parseRun } from './core/index.js';

export function connectSource(field, example, onChange) {
  const channels = field.querySelector('[data-channel]');
  const segments = field.querySelector('[data-segment]');
  const input = field.querySelector('[data-file]');
  const name = field.querySelector('[data-name]');
  const error = field.querySelector('[data-error]');
  let run;
  let sequence = 0;

  function select() {
    if (run) onChange({ run, channel: channels.value, segment: Number(segments.value) });
  }
  function chooseChannel() {
    const ids = new Set(run.samples[channels.value].map(s => s.segment));
    segments.replaceChildren(...Array.from(ids, n => new Option(String(n), String(n))));
    select();
  }
  async function load(file) {
    const request = ++sequence;
    run = undefined;
    onChange(undefined);
    channels.replaceChildren();
    segments.replaceChildren();
    error.textContent = '';
    name.textContent = file?.name ?? 'Loading example…';
    try {
      let json;
      if (file) json = await file.text();
      else {
        const response = await fetch(example);
        if (!response.ok) throw new Error('Could not open the example recording.');
        json = await response.text();
      }
      if (sequence !== request) return;
      run = parseRun(json);
      name.textContent = run.name;
      channels.replaceChildren(...Object.keys(run.channels).map(key => new Option(key, key)));
      chooseChannel();
    } catch (cause) {
      if (sequence === request) error.textContent = cause.message;
    }
  }
  channels.onchange = chooseChannel;
  segments.onchange = select;
  input.onchange = () => { if (input.files[0]) load(input.files[0]); };
  const reset = () => { input.value = ''; load(); };
  reset();
  return reset;
}
