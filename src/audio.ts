/** 使用 WebAudio 合成的音效，不加载任何外部文件 */
let ctx: AudioContext | null = null;
let enabled = localStorage.getItem('fl-sound') !== 'off';

export const soundOn = () => enabled;
export function toggleSound() { enabled = !enabled; localStorage.setItem('fl-sound', enabled ? 'on' : 'off'); return enabled; }

function ac(): AudioContext | null {
  if (!enabled) return null;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.15, delay = 0) {
  const c = ac(); if (!c) return;
  const o = c.createOscillator(), gn = c.createGain(), t = c.currentTime + delay;
  o.type = type; o.frequency.setValueAtTime(freq, t);
  gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(gn).connect(c.destination); o.start(t); o.stop(t + dur);
}

function noise(dur: number, vol: number, delay = 0, freq = 1200) {
  const c = ac(); if (!c) return;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(), f = c.createBiquadFilter(), gn = c.createGain(), t = c.currentTime + delay;
  src.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 0.6;
  gn.gain.setValueAtTime(0.001, t); gn.gain.linearRampToValueAtTime(vol, t + dur * 0.25); gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(gn).connect(c.destination); src.start(t);
}

export const sfx = {
  click: () => tone(660, 0.06, 'triangle', 0.08),
  whistle: () => { tone(2300, 0.25, 'square', 0.05); tone(2350, 0.25, 'square', 0.04, 0.3); },
  longWhistle: () => { tone(2300, 0.2, 'square', 0.05); tone(2300, 0.2, 'square', 0.05, 0.25); tone(2300, 0.7, 'square', 0.05, 0.5); },
  goal: () => { noise(2.2, 0.35, 0, 900); [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, 'triangle', 0.1, i * 0.1)); },
  oppGoal: () => { tone(220, 0.4, 'sawtooth', 0.06); tone(165, 0.6, 'sawtooth', 0.06, 0.3); },
  crowd: () => noise(1.2, 0.12, 0, 600),
  miss: () => { noise(0.8, 0.2, 0, 500); tone(300, 0.3, 'sine', 0.06); },
  trophy: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.5, 'triangle', 0.1, i * 0.12)),
};
