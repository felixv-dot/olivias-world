// Tiny synthesized sound effects (no audio files needed).
import { state } from './state.js';

let ctx = null;
function tone(freq, dur = 0.12, type = 'sine', vol = 0.06, slide = 1) {
  if (state.muted) return;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide !== 1) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch { /* audio not available */ }
}
const seq = (notes, gap = 90) => notes.forEach(([f, d, ty], i) => setTimeout(() => tone(f, d, ty || 'triangle'), i * gap));

export const sfx = {
  tap: () => tone(700, 0.07, 'triangle', 0.04, 1.25),
  pick: () => tone(420, 0.08, 'sine', 0.04, 1.4),
  drop: () => tone(300, 0.09, 'sine', 0.05, 0.7),
  pop: () => tone(520, 0.12, 'sine', 0.06, 1.8),
  yum: () => seq([[523, 0.1], [659, 0.1], [784, 0.14]], 80),
  star: () => seq([[880, 0.15], [1175, 0.15], [1568, 0.25]], 90),
  wear: () => seq([[660, 0.08], [990, 0.12]], 70),
  win: () => seq([[523, 0.12], [659, 0.12], [784, 0.12], [1046, 0.3]], 110),
  boing: () => tone(220, 0.25, 'sine', 0.07, 2.2),
  pour: () => tone(180, 0.6, 'triangle', 0.03, 0.8),
  click: () => tone(1200, 0.04, 'square', 0.02),
};
