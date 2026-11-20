// Small shared UI pieces: elements, top bar, star counter, weather toggle, rain.
import { state, session, save } from './state.js';

export const TOTAL_STARS = 38;
// Phones: fewer particles, and a few layout tweaks.
export const SMALL = Math.min(window.innerWidth, window.innerHeight) < 520;

// Shown on phones held upright, on screens that need landscape.
export function rotateHint() {
  return el('div', 'rotate-hint', '<div class="phone">📱</div><div>Turn your phone sideways to play!</div>');
}

// Weather options per planet: [value, icon, label].
export const CLIMATES = {
  sunny: { key: 'weather', options: [['sun', '☀️', 'Sunny'], ['rain', '🌧️', 'Rainy']] },
  winter: { key: 'winterWeather', options: [['clear', '☀️', 'Clear sky'], ['snow', '❄️', 'Snowing']] },
};

export function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

export function starBadge() {
  return el('div', 'star-badge', `<span>⭐</span><b class="star-count">${state.stars.length}</b>/${TOTAL_STARS}`);
}

export function refreshStars() {
  document.querySelectorAll('.star-count').forEach((n) => { n.textContent = state.stars.length; });
}

export function setWeather(key, w) {
  if (key === 'weather' && state.weather === 'rain' && w === 'sun') session.rainbowUntil = performance.now() + 12000;
  state[key] = w;
  save();
}

export function topBar({ title, onBack, backLabel = 'Back', onWeather, climate = CLIMATES.sunny, onChars }) {
  const bar = el('div', 'topbar');
  const back = el('button', 'tb-btn back', `◀<span class="lbl"> ${backLabel}</span>`);
  back.setAttribute('aria-label', 'Back to ' + backLabel);
  back.onclick = onBack;
  bar.append(back, el('div', 'tb-title', title));
  const right = el('div', 'tb-right');
  const sound = el('button', 'tb-btn icon', state.muted ? '🔇' : '🔊');
  sound.setAttribute('aria-label', 'Sound on or off');
  sound.onclick = () => { state.muted = !state.muted; save(); sound.textContent = state.muted ? '🔇' : '🔊'; };
  if (onChars) {
    const chars = el('button', 'tb-btn chars', '👥<span class="lbl"> Characters</span>');
    chars.setAttribute('aria-label', 'My characters');
    chars.onclick = onChars;
    right.append(chars);
  }
  right.append(sound, starBadge());
  if (onWeather) {
    const w = el('div', 'weather');
    const { key, options } = climate;
    const btns = options.map(([val, icon, label]) => {
      const b = el('button', 'wb' + (state[key] === val ? ' on' : ''), icon);
      b.setAttribute('aria-label', label);
      b.onclick = () => {
        if (state[key] === val) return;
        setWeather(key, val);
        btns.forEach((x, i) => x.classList.toggle('on', options[i][0] === val));
        onWeather(val);
      };
      return b;
    });
    w.append(...btns);
    right.append(w);
  }
  bar.append(right);
  return bar;
}

export function snowLayer() {
  const r = el('div', 'snow');
  for (let i = 0; i < (SMALL ? 40 : 70); i++) {
    const d = el('i');
    const size = 4 + Math.random() * 7;
    d.style.width = d.style.height = size.toFixed(1) + 'px';
    d.style.left = (Math.random() * 104 - 2).toFixed(1) + '%';
    d.style.animationDuration = (4 + Math.random() * 5).toFixed(2) + 's';
    d.style.animationDelay = (-Math.random() * 8).toFixed(2) + 's';
    d.style.opacity = (0.6 + Math.random() * 0.4).toFixed(2);
    r.append(d);
  }
  return r;
}

export function rainLayer() {
  const r = el('div', 'rain');
  for (let i = 0; i < (SMALL ? 45 : 80); i++) {
    const d = el('i');
    d.style.left = (Math.random() * 104 - 2).toFixed(1) + '%';
    d.style.animationDuration = (0.55 + Math.random() * 0.4).toFixed(2) + 's';
    d.style.animationDelay = (-Math.random()).toFixed(2) + 's';
    d.style.opacity = (0.5 + Math.random() * 0.5).toFixed(2);
    r.append(d);
  }
  return r;
}
