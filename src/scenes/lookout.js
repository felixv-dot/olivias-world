// Lookout: a starry night with northern lights. Telescope → connect-the-stars puzzle; campfire marshmallows; an owl.
import { INK, O, svg, text, starPath, pine, food, NPC_WINTER } from './common.js';
import { CLIMATES } from '../ui.js';

const bg = (w) => {
  const snow = w.weather === 'snow';
  return svg(1600, 900, `
  <defs><linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B1D4A"/><stop offset=".7" stop-color="#3E3F78"/><stop offset="1" stop-color="#6E5A9E"/></linearGradient>
    <linearGradient id="aur1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FF0D2" stop-opacity="0"/><stop offset=".5" stop-color="#7FF0D2" stop-opacity=".55"/><stop offset="1" stop-color="#7FF0D2" stop-opacity="0"/></linearGradient>
    <linearGradient id="aur2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9B8F2" stop-opacity="0"/><stop offset=".5" stop-color="#C9B8F2" stop-opacity=".5"/><stop offset="1" stop-color="#C9B8F2" stop-opacity="0"/></linearGradient></defs>
  <rect width="1600" height="900" fill="url(#night)"/>
  ${snow ? '' : `<g class="aurora"><path d="M-40 260 Q200 80 480 200 T1000 160 T1640 220 L1640 330 Q1300 260 1000 280 T480 320 T-40 380 Z" fill="url(#aur1)"/></g>
  <g class="aurora2"><path d="M-40 160 Q300 40 600 140 T1200 100 T1640 150 L1640 230 Q1300 180 1200 200 T600 230 T-40 260 Z" fill="url(#aur2)"/></g>`}
  <g fill="#FFF8D6">${Array.from({ length: 70 }, (_, i) => `<circle class="twinkle-s" style="animation-delay:-${(i % 7) * 0.4}s" cx="${(i * 233) % 1600}" cy="${(i * 97) % 440}" r="${1 + (i % 3) * 0.9}"/>`).join('')}</g>
  <circle cx="1380" cy="120" r="56" fill="#FFF6D2"/><circle cx="1404" cy="104" r="50" fill="#1E2050" opacity="${snow ? 0 : 0.0}"/><circle cx="1362" cy="108" r="8" fill="#F0E6B8"/><circle cx="1392" cy="138" r="11" fill="#F0E6B8"/>
  ${snow ? '<rect width="1600" height="900" fill="#AEB6CF" opacity=".25"/>' : ''}
  <path d="M-10 560 Q400 480 800 540 T1620 520 V910 H-10 Z" fill="#D6DDF0"/>
  <g opacity=".9">${pine(100, 330, 1.1, true)}${pine(1460, 320, 1, true)}${pine(1000, 380, 0.55, true)}</g>
  <g transform="translate(1090 330)"><rect ${O} x="20" y="110" width="200" height="150" fill="#E3E9F7"/><path ${O} d="M10 116 Q120 -40 230 116 Z" fill="#8FA4D8"/>
    <path ${O} d="M106 14 L136 14 L146 116 L96 116 Z" fill="#2E3266"/><rect ${O} x="98" y="180" width="44" height="80" rx="16" fill="#4D5C9A"/>
    <rect ${O} x="40" y="150" width="40" height="34" rx="6" fill="#FFE9A0"/><rect ${O} x="160" y="150" width="40" height="34" rx="6" fill="#FFE9A0"/></g>
  <path d="M-10 640 Q600 600 1200 650 T1620 640 V910 H-10 Z" fill="#EEF2FB"/>`);
};

// ---------- connect the stars ----------
const CONSTELLATIONS = [
  { name: 'The Bunny 🐰', pts: [[150, 180], [190, 150], [200, 90], [220, 40], [240, 100], [270, 140], [330, 150], [360, 190], [300, 210], [190, 210]] },
  { name: 'The Big Star ⭐', pts: [[260, 30], [300, 110], [390, 120], [320, 170], [350, 250], [260, 205], [170, 250], [200, 170], [130, 120], [220, 110]] },
  { name: 'The Cat 🐱', pts: [[170, 100], [180, 40], [220, 80], [290, 80], [330, 40], [340, 100], [330, 170], [260, 220], [180, 170]] },
];
function starGame(api, scope) {
  api.modal((card) => {
    let level = 0, next = 0;
    card.innerHTML += `<h2>Connect the stars</h2><p class="m-status">Tap the stars in order: 1, 2, 3…</p><div class="skyhold"></div>`;
    const hold = card.querySelector('.skyhold'), status = card.querySelector('.m-status');
    function draw() {
      const c = CONSTELLATIONS[level];
      const done = next >= c.pts.length;
      const lines = c.pts.slice(0, Math.max(0, next)).map((p, i, a) => (i ? `<line x1="${a[i - 1][0]}" y1="${a[i - 1][1]}" x2="${p[0]}" y2="${p[1]}"/>` : '')).join('')
        + (done ? `<line x1="${c.pts[c.pts.length - 1][0]}" y1="${c.pts[c.pts.length - 1][1]}" x2="${c.pts[0][0]}" y2="${c.pts[0][1]}"/>` : '');
      hold.innerHTML = `<svg class="sky-game" viewBox="0 0 520 280">
        ${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 89) % 520}" cy="${(i * 53) % 280}" r="1.2" fill="#fff" opacity=".5"/>`).join('')}
        <g stroke="#9EDDD4" stroke-width="4" stroke-linecap="round">${lines}</g>
        ${c.pts.map(([x, y], i) => `<g class="sdot" data-i="${i}"><circle cx="${x}" cy="${y}" r="20" fill="transparent"/>
          ${starPath(x, y, i < next ? 13 : 11, i < next ? '#F7D24A' : (i === next ? '#FFFFFF' : '#C9C3E6'))}
          <text x="${x + 14}" y="${y - 12}" font-family="Fredoka, sans-serif" font-size="15" font-weight="600" fill="#FFF3B0">${i < next ? '' : i + 1}</text></g>`).join('')}
        ${done ? `<text x="260" y="268" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="600" font-size="24" fill="#F7D24A">${c.name}</text>` : ''}
      </svg>${done ? `<button class="btn m-next">${level < CONSTELLATIONS.length - 1 ? 'Next constellation ▶' : 'Play again'}</button>` : ''}`;
      hold.querySelectorAll('.sdot').forEach((g) => { g.onclick = () => tap(+g.dataset.i); });
      const nb = hold.querySelector('.m-next');
      if (nb) nb.onclick = () => { level = (level + 1) % CONSTELLATIONS.length; next = 0; status.textContent = 'Tap the stars in order: 1, 2, 3…'; draw(); };
    }
    function tap(i) {
      const c = CONSTELLATIONS[level];
      if (i !== next) { status.textContent = `Find star number ${next + 1}! ✨`; api.sfx.drop(); return; }
      next++; api.sfx.click();
      if (next >= c.pts.length) {
        api.sfx.win(); status.textContent = `You found ${c.name}!`;
        if (level === CONSTELLATIONS.length - 1 && !api.starFound('lookout-sky')) { api.addStar('lookout-sky', scope.x + 100, scope.y - 80, { spawned: true }); status.textContent += ' A star fell from the sky! ⭐'; }
        else if (level < CONSTELLATIONS.length - 1) status.textContent += ` (${level + 1} of ${CONSTELLATIONS.length})`;
      }
      draw();
    }
    draw();
  });
}

export const LOOKOUT = {
  id: 'lookout', title: 'Starry Lookout 🔭', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, outdoor: true, avatar: [470, 440],
  frame: 'linear-gradient(#1B1D4A 60%, #EEF2FB 60%)',
  bg,
  stars: [{ id: 'lookout-blanket', x: 1060, y: 800, z: 3 }],
  characters: [{ id: 'juno', look: NPC_WINTER.juno, x: 880, y: 470, s: 0.95, say: ['Look at the northern lights! ✨', 'Try the telescope — connect the stars!', 'Tap the owl... it knows secrets 🦉'] }],
  items: [
    { id: 'blanket', x: 940, y: 770, w: 320, h: 100, floor: true, art: () => svg(320, 100, `
      <path ${O} d="M10 16 H310 L298 94 H22 Z" fill="#C9B8F2"/>
      <path d="M60 16 L54 94 M120 16 L118 94 M180 16 L182 94 M240 16 L246 94 M14 44 H306 M18 70 H302" stroke="#fff" stroke-width="8" opacity=".5"/>`) },
    { id: 'telescope', x: 240, y: 340, w: 280, h: 400, drag: false,
      onTap: (it, api) => starGame(api, it),
      art: () => svg(280, 400, `
        <path ${O} d="M140 220 L60 390 M140 220 L220 390 M140 220 V390" fill="none" style="stroke-width:8;stroke:#4D5C9A"/>
        <g transform="rotate(-32 140 200)"><rect ${O} x="40" y="170" width="220" height="56" rx="16" fill="#B79CF0" style="stroke-width:3"/>
          <rect ${O} x="230" y="160" width="40" height="76" rx="10" fill="#9A80D8"/><rect ${O} x="10" y="182" width="36" height="32" rx="8" fill="#4D5C9A"/>
          <path d="M80 182 H210" stroke="#fff" stroke-width="6" opacity=".5"/></g>
        <circle ${O} cx="140" cy="214" r="14" fill="#F5DE7A"/>
        <rect ${O} x="60" y="-8" width="160" height="40" rx="14" fill="#fff"/>${text(140, 20, 'Tap to look!', 20, '#7A64B0')}`) },
    { id: 'campfire', x: 640, y: 690, w: 200, h: 170, drag: false,
      onTap: (it, api) => {
        if (api.count('marshmallow') >= 2) { api.bubble(it.x + 100, it.y - 10, 'Eat those first! 🔥'); return; }
        api.sfx.pour(); api.bubble(it.x + 100, it.y - 10, 'Toasting... 🔥');
        api.later(() => food(api, 'marshmallow', it.x + 190, it.y + 60 + api.count('marshmallow') * 40), 900);
      },
      art: () => svg(200, 170, `
        <g class="flame"><path d="M100 140 C50 120 60 60 86 30 C86 60 106 56 102 20 C140 50 150 110 100 140 Z" fill="#F0A060"/>
          <path d="M100 140 C76 128 78 92 94 74 C96 96 110 92 108 76 C124 96 124 126 100 140 Z" fill="#F5DE7A"/></g>
        <path d="M30 150 L170 130 M30 130 L170 152" stroke="#8B6450" stroke-width="18" stroke-linecap="round"/>
        ${[20, 60, 100, 140, 180].map((x) => `<circle ${O} cx="${x}" cy="160" r="12" fill="#B9C0D4"/>`).join('')}`) },
    { id: 'log', x: 440, y: 760, w: 200, h: 90, art: () => svg(200, 90, `
      <rect ${O} x="10" y="20" width="180" height="56" rx="28" fill="#A87A5A"/><ellipse ${O} cx="182" cy="48" rx="16" ry="28" fill="#D9AC86"/>
      <ellipse cx="182" cy="48" rx="8" ry="16" fill="none" stroke="#A87A5A" stroke-width="2"/><path d="M14 30 Q100 6 180 24" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/>`) },
    { id: 'owl', x: 1440, y: 420, w: 110, h: 130, drag: false, data: { taps: 0 },
      onTap: (it, api) => {
        it.data.taps++;
        it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.sfx.boing();
        if (it.data.taps % 3 === 0) {
          api.bubble(it.x + 55, it.y - 10, 'Hoo! Make a wish! 🌠');
          api.effect(1300, 120, 'shooting', `<svg viewBox="0 0 160 40" width="160" height="40"><path d="M10 30 L150 8" stroke="#FFF3B0" stroke-width="4" stroke-linecap="round"/>${starPath(150, 8, 10, '#F7D24A')}</svg>`, 1500);
        } else api.bubble(it.x + 55, it.y - 10, 'Hoo hoo! 🦉');
      },
      art: () => svg(110, 130, `
        <path d="M0 122 H110" stroke="#8B6450" stroke-width="12" stroke-linecap="round"/>
        <ellipse ${O} cx="55" cy="74" rx="40" ry="48" fill="#C99772"/><ellipse cx="55" cy="86" rx="26" ry="30" fill="#F3D2B8"/>
        <path ${O} d="M18 40 L22 12 L40 30 Z M92 40 L88 12 L70 30 Z" fill="#C99772"/>
        <circle ${O} cx="38" cy="50" r="16" fill="#fff"/><circle ${O} cx="72" cy="50" r="16" fill="#fff"/>
        <circle cx="40" cy="52" r="8" fill="${INK}"/><circle cx="70" cy="52" r="8" fill="${INK}"/><circle cx="42" cy="49" r="3" fill="#fff"/><circle cx="72" cy="49" r="3" fill="#fff"/>
        <path ${O} d="M50 64 L60 64 L55 74 Z" fill="#F0A060" style="stroke-width:2"/>
        <path d="M44 92 l6 6 6 -6 6 6 M44 104 l6 6 6 -6 6 6" stroke="#C99772" stroke-width="2.4" fill="none"/>`) },
  ],
};
