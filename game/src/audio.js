/** Offline Web Audio — engine, sirens, gun, UI blips. */
let ctx;

export function initAudio() {
  if (ctx) return ctx;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function beep(freq, dur, type = 'sine', gain = 0.04) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g).connect(ctx.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  o.stop(ctx.currentTime + dur);
}

export function playGun() {
  beep(180, 0.08, 'square', 0.05);
  beep(90, 0.12, 'sawtooth', 0.03);
}

export function playSiren() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'triangle';
  o.connect(g).connect(ctx.destination);
  g.gain.value = 0.03;
  o.frequency.setValueAtTime(520, t);
  o.frequency.linearRampToValueAtTime(820, t + 0.35);
  o.frequency.linearRampToValueAtTime(520, t + 0.7);
  o.start(t);
  o.stop(t + 0.75);
}

export function playUi() {
  beep(640, 0.06, 'sine', 0.03);
}

export function playEngine(speed) {
  if (!ctx || Math.random() > 0.92) return;
  beep(50 + speed * 3, 0.05, 'sawtooth', 0.015);
}

export function startRadioBuzz(station) {
  if (!ctx) return;
  const base = 110 + station * 40;
  beep(base, 0.2, 'sine', 0.02);
  beep(base * 1.5, 0.15, 'triangle', 0.015);
}