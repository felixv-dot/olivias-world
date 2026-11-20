// Hair Salon: tap a style card to get that haircut, cycle the colour swatches, wash, dry and accessorise.
import { INK, O, svg, text, windowArt, wearable, NPC } from './common.js';
import { PALETTE } from '../avatar.js';

const f = (n) => n.toFixed(1);

// Perspective tile floor: rows get deeper towards the wall, columns converge on a vanishing point.
function perspFloor({ W = 1600, y0 = 620, y1 = 900, h = 330, cols = 30, rows = 6, fill, stroke = 'none', sw = 0, stagger = false }) {
  const zf = (y1 - h) / (y0 - h);
  const yAt = (t) => h + (y1 - h) / (zf - ((zf - 1) * t) / rows);
  const vx = W / 2, span = W * 3.2;
  const xAt = (j, y) => vx + (vx - span / 2 + (span * j) / cols - vx) * ((y - h) / (y1 - h));
  let out = '';
  for (let j = 0; j < cols; j++) {
    const off = stagger && j % 2 ? 0.5 : 0;
    for (let k = -1; k < rows; k++) {
      const ta = Math.max(0, k + off), tb = Math.min(rows, k + 1 + off);
      if (tb <= ta) continue;
      const ya = yAt(ta), yb = yAt(tb);
      out += `<path d="M${f(xAt(j, ya))} ${f(ya)} L${f(xAt(j + 1, ya))} ${f(ya)} L${f(xAt(j + 1, yb))} ${f(yb)} L${f(xAt(j, yb))} ${f(yb)}Z" fill="${fill(j, k)}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
  }
  return out;
}

const shadow = (cx, cy, rx, ry = rx * 0.16, o = 0.16) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${INK}" opacity="${o}"/>`;
const chrome = (id) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9AA0B4"/><stop offset=".35" stop-color="#F4F6FA"/><stop offset=".6" stop-color="#C4C9D6"/><stop offset="1" stop-color="#868CA2"/></linearGradient>`;

// ---------- room ----------
const bg = (w) => {
  const sun = w.weather === 'sun';
  return svg(1600, 900, `
  <defs>
    <linearGradient id="salon-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3EEF7"/><stop offset="1" stop-color="#E3DAEE"/></linearGradient>
    <pattern id="salon-stripe" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="2" height="64" fill="#D8CDE8" opacity=".55"/><rect x="31" width="1" height="64" fill="#fff" opacity=".8"/><circle cx="16" cy="32" r="1.6" fill="#CFC2E3" opacity=".7"/><circle cx="48" cy="0" r="1.6" fill="#CFC2E3" opacity=".7"/><circle cx="48" cy="64" r="1.6" fill="#CFC2E3" opacity=".7"/></pattern>
    <linearGradient id="salon-wains" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D7CDE6"/><stop offset="1" stop-color="#C9BDDC"/></linearGradient>
    <linearGradient id="salon-fshadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK}" stop-opacity=".22"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient>
    <linearGradient id="salon-beam" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#FFF6D2" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6D2" stop-opacity="0"/></linearGradient>
    <linearGradient id="salon-floorfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2F52" stop-opacity=".16"/><stop offset=".5" stop-color="#3A2F52" stop-opacity="0"/><stop offset="1" stop-color="#3A2F52" stop-opacity=".08"/></linearGradient>
    <linearGradient id="salon-marble" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#F1EEF6"/><stop offset="1" stop-color="#E2DCEC"/></linearGradient>
    <linearGradient id="salon-oak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9B98F"/><stop offset="1" stop-color="#B8936A"/></linearGradient>
    <linearGradient id="salon-linen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7F1E4"/><stop offset="1" stop-color="#EADFCB"/></linearGradient>
    <linearGradient id="salon-cab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFB0D8"/><stop offset="1" stop-color="#A897C6"/></linearGradient>
    <radialGradient id="salon-glow"><stop offset="0" stop-color="#FFF4C4" stop-opacity=".75"/><stop offset="1" stop-color="#FFF4C4" stop-opacity="0"/></radialGradient>
    ${chrome('salon-brass').replace(/#9AA0B4/, '#B88F4A').replace(/#F4F6FA/, '#F6E2A8').replace(/#C4C9D6/, '#D6B36A').replace(/#868CA2/, '#9C7638')}
  </defs>
  <rect width="1600" height="620" fill="url(#salon-wall)"/>
  <rect width="1600" height="440" fill="url(#salon-stripe)"/>
  <rect width="1600" height="24" fill="#FBF8FD"/><rect y="24" width="1600" height="6" fill="#D2C6E2"/><rect y="30" width="1600" height="10" fill="${INK}" opacity=".05"/>
  <rect y="440" width="1600" height="180" fill="url(#salon-wains)"/>
  ${Array.from({ length: 10 }, (_, i) => `<rect x="${24 + i * 160}" y="468" width="128" height="118" rx="4" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3"/><rect x="${27 + i * 160}" y="471" width="128" height="118" rx="4" fill="none" stroke="${INK}" stroke-opacity=".08" stroke-width="3"/>`).join('')}
  <rect y="432" width="1600" height="14" fill="#FBF8FD"/><rect y="446" width="1600" height="5" fill="${INK}" opacity=".08"/>
  <rect y="596" width="1600" height="26" fill="#FBF8FD"/><rect y="596" width="1600" height="3" fill="#E4DCEE"/>
  ${perspFloor({ fill: (j, k) => ((j + k) % 2 ? '#CFC5DF' : '#F5F0E8'), stroke: '#FFFFFF', sw: 1.2 })}
  <rect y="620" width="1600" height="280" fill="url(#salon-floorfade)"/>
  <rect y="620" width="1600" height="44" fill="url(#salon-fshadow)"/>
  ${windowArt(78, 120, 230, 210, w.weather, '#9EDDD4')}
  ${sun ? `<path d="M90 352 L300 352 L640 900 L210 900 Z" fill="url(#salon-beam)" opacity=".8"/>` : ''}
  <g transform="translate(372 70)">
    <rect x="-6" y="-6" width="400" height="324" rx="6" fill="url(#salon-oak)" stroke="${INK}" stroke-width="2"/>
    <rect width="388" height="312" rx="3" fill="url(#salon-linen)"/>
    ${Array.from({ length: 26 }, (_, i) => `<path d="M0 ${i * 12 + 6} H388" stroke="#D9CBB2" stroke-width=".8" opacity=".5"/>`).join('')}
    ${text(194, 24, 'STYLE BOOK · tap a look', 15, '#8A7660', 600)}
  </g>
  <g transform="translate(380 452)">
    <rect width="384" height="14" rx="3" fill="url(#salon-marble)" stroke="${INK}" stroke-width="2"/>
    <path d="M30 14 L22 196 M354 14 L362 196" stroke="url(#salon-brass)" stroke-width="7" stroke-linecap="round"/>
    <path d="M60 14 L64 150 M324 14 L320 150" stroke="#9C7638" stroke-width="5" stroke-linecap="round" opacity=".7"/>
    <path d="M40 100 H344" stroke="#B88F4A" stroke-width="4" opacity=".7"/>
    ${shadow(192, 200, 190, 10, 0.12)}
  </g>
  <g transform="translate(782 450)">
    ${shadow(175, 196, 180, 12, 0.16)}
    <rect x="10" y="16" width="330" height="176" fill="url(#salon-cab)" stroke="${INK}" stroke-width="2"/>
    <rect x="24" y="30" width="146" height="70" rx="4" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2.5"/><rect x="180" y="30" width="146" height="70" rx="4" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2.5"/>
    <rect x="24" y="108" width="302" height="70" rx="4" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2.5"/>
    <rect x="80" y="62" width="34" height="6" rx="3" fill="url(#salon-brass)"/><rect x="236" y="62" width="34" height="6" rx="3" fill="url(#salon-brass)"/><rect x="158" y="140" width="34" height="6" rx="3" fill="url(#salon-brass)"/>
    <rect width="350" height="18" rx="3" fill="url(#salon-marble)" stroke="${INK}" stroke-width="2"/>
    <path d="M40 8 Q90 2 130 10 M200 6 Q250 12 300 6" stroke="#CFC6DE" stroke-width="1.4" fill="none"/>
    <g transform="translate(36 -46)"><rect x="0" y="12" width="20" height="34" rx="5" fill="#9EDDD4" stroke="${INK}" stroke-width="1.6"/><rect x="5" y="2" width="10" height="12" rx="2" fill="#F5F0E8" stroke="${INK}" stroke-width="1.6"/></g>
    <g transform="translate(278 -40)"><path d="M8 40 Q0 20 12 4 Q24 20 16 40 Z" fill="#6DBE7A" opacity=".9"/><path d="M14 40 Q30 18 40 10 Q34 30 20 40 Z" fill="#5AAE6A"/><rect x="2" y="36" width="30" height="16" rx="4" fill="#FBF8FD" stroke="${INK}" stroke-width="1.6"/></g>
    <path d="M70 -4 h56 l-4 4 h-48 z" fill="${INK}" opacity=".7"/><path d="M76 -4 v-4 M84 -4 v-4 M92 -4 v-4 M100 -4 v-4 M108 -4 v-4 M116 -4 v-4" stroke="${INK}" stroke-width="1.5"/>
  </g>
  ${[1240].map((x) => `<g transform="translate(${x} 0)"><path d="M0 30 V96" stroke="${INK}" stroke-width="2"/><circle cx="0" cy="150" r="90" fill="url(#salon-glow)"/>
    <path d="M-34 126 Q-32 96 0 94 Q32 96 34 126 Z" fill="url(#salon-brass)" stroke="${INK}" stroke-width="2"/><ellipse cx="0" cy="128" rx="18" ry="5" fill="#FFF4C4"/></g>`).join('')}
  <g transform="translate(1330 70)"><rect width="250" height="26" rx="13" fill="${INK}"/>${text(125, 19, 'SUNNY SALON', 15, '#F5DE7A', 600)}</g>`);
};

// ---------- style cards (seen from behind: hair shapes only) ----------
const HAIR_SHAPES = {
  bobBuns: (c) => `<circle cx="34" cy="34" r="13" fill="${c}"/><circle cx="76" cy="34" r="13" fill="${c}"/><path d="M24 62 Q24 34 55 34 Q86 34 86 62 L88 84 Q55 92 22 84 Z" fill="${c}"/>`,
  bob: (c) => `<path d="M22 62 Q22 32 55 32 Q88 32 88 62 L90 88 Q55 96 20 88 Z" fill="${c}"/>`,
  long: (c) => `<path d="M24 60 Q24 32 55 32 Q86 32 86 60 L91 88 Q55 94 19 88 Z" fill="${c}"/><path d="M19 88 Q16 80 24 74 M91 88 Q94 80 86 74" stroke="${c}" stroke-width="5" fill="none"/>`,
  pigtails: (c) => `<path d="M24 50 Q8 64 12 98 Q16 108 24 100 Q22 76 30 60 Z M86 50 Q102 64 98 98 Q94 108 86 100 Q88 76 80 60 Z" fill="${c}"/><path d="M26 64 Q26 34 55 34 Q84 34 84 64 L82 78 Q55 84 28 78 Z" fill="${c}"/><circle cx="28" cy="56" r="4" fill="#3CC7B8"/><circle cx="82" cy="56" r="4" fill="#3CC7B8"/>`,
  fluffy: (c) => `<path d="M26 66 Q18 52 28 44 Q28 30 42 30 Q50 22 62 28 Q78 24 82 38 Q94 44 86 58 Q90 70 82 76 Q55 84 30 76 Q22 72 26 66 Z" fill="${c}"/>`,
};
const STYLES = [
  ['bobBuns', 'Bob + buns', '#A88DE2'],
  ['bob', 'Sleek bob', '#2E2A3A'],
  ['long', 'Long waves', '#F2D27A'],
  ['pigtails', 'Pigtails', '#5FC9C0'],
  ['fluffy', 'Fluffy crop', '#8B6450'],
];
const styleCard = ([style, name, color], i) => ({
  id: 'style-' + style, x: 392 + (i % 3) * 122, y: 104 + Math.floor(i / 3) * 140, w: 108, h: 128, drag: false, cls: 'hanger', data: { on: false },
  onTap: (it, api) => {
    const me = api.avatar();
    if (!me) return;
    api.setLook(me, { hairStyle: style, hair: color });
    api.sfx.wear();
    api.react(me, ['Gorgeous! ✨', 'What a look! 💇', 'So chic! 💜'][i % 3], ['✨', '💇', '💜']);
    for (const s of STYLES) { const c = api.get('style-' + s[0]); if (c) { c.data.on = c === it; api.setArt(c); } }
    tried.add(style);
    if (tried.size >= 3 && !api.starFound('salon-style')) {
      api.addStar('salon-style', 452, 4, { spawned: true });
      api.bubble(484, 100, 'Three new looks! A star! ⭐');
    }
  },
  art: (it) => svg(108, 128, `
    <defs><linearGradient id="salon-card-${style}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F3EEF8"/></linearGradient>
      <linearGradient id="salon-hairsheen-${style}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    <rect x="4" y="6" width="100" height="120" rx="6" fill="${INK}" opacity=".12"/>
    <rect x="2" y="2" width="100" height="120" rx="6" fill="url(#salon-card-${style})" stroke="${it.data.on ? '#3CC7B8' : '#D6CCE4'}" stroke-width="${it.data.on ? 4 : 1.5}"/>
    <rect x="12" y="10" width="80" height="80" rx="4" fill="#E7F1F5"/>
    <g transform="translate(-3 0) scale(1)">
      <path d="M30 98 Q34 82 55 80 Q76 82 80 98 Z" fill="#B79CF0"/>
      <rect x="48" y="66" width="14" height="18" fill="#E9C3A3"/>
      ${HAIR_SHAPES[style](color)}
      ${HAIR_SHAPES[style]('url(#salon-hairsheen-' + style + ')')}
    </g>
    <rect x="12" y="90" width="80" height="2" fill="#fff"/>
    ${text(52, 112, name, 12.5, INK, 600)}
    <rect x="36" y="-4" width="36" height="13" rx="2" fill="${['#9EDDD4', '#F5DE7A', '#C9B8F2', '#8FC3F0', '#9EDDD4'][i]}" opacity=".85" transform="rotate(${(i % 2 ? 4 : -4)} 54 2)"/>`),
});

let tried = new Set();

// Hair colour swatch fan: tap to try the next colour.
const swatchFan = {
  id: 'swatches', x: 636, y: 238, w: 116, h: 132, drag: false, data: { i: -1 },
  onTap: (it, api) => {
    const me = api.avatar();
    it.data.i = (it.data.i + 1) % PALETTE.hair.length;
    api.setArt(it);
    if (!me) return;
    api.setLook(me, { hair: PALETTE.hair[it.data.i] });
    api.sfx.wear();
    api.react(me, ['New colour! 🎨', 'Love this shade! ✨', 'Stunning! 💜'][it.data.i % 3], ['✨', '🎨', '💫']);
  },
  art: (it) => svg(116, 132, `
    <circle cx="58" cy="14" r="9" fill="none" stroke="url(#salon-ring)" stroke-width="4"/>
    <defs>${chrome('salon-ring')}</defs>
    ${PALETTE.hair.map((c, i) => {
      const a = -40 + i * 10, on = i === it.data.i;
      return `<g transform="rotate(${a} 58 18)"><path d="M54 22 Q50 ${on ? 96 : 84} 58 ${on ? 124 : 112} Q66 ${on ? 96 : 84} 62 22 Z" fill="${c}" stroke="${on ? INK : 'rgba(74,59,92,.35)'}" stroke-width="${on ? 2 : 1}"/><path d="M57 26 Q55 70 58 ${on ? 116 : 104}" stroke="#fff" stroke-width="1.4" opacity=".4" fill="none"/></g>`;
    }).join('')}
    <rect x="44" y="18" width="28" height="10" rx="3" fill="#FBF8FD" stroke="${INK}" stroke-width="1.6"/>`),
};

// Hair accessories that work like the boutique wearables.
const hairAcc = (id, value, x, y, wText, w, h, body) => ({ id, x, y, w, h, cls: 'wearable', wear: ['hairAcc', value], wearText: wText, art: () => svg(w, h, body) });

export const SALON = {
  id: 'salon', title: 'Hair Salon 💇', weather: true, avatar: [880, 470],
  frame: 'linear-gradient(#ECE5F3 69%, #D8CFE3 69%)',
  bg,
  init: () => { tried = new Set(); },
  stars: [{ id: 'salon-towels', x: 728, y: 772 }],
  characters: [
    { id: 'juno', look: { ...NPC.stylist, hairStyle: 'long', hair: '#4D5C9A', top: 'sweater', topColor: '#3CC7B8', collar: 'round', bottom: 'widePants', bottomColor: '#4A3B5C', shoes: 'boots', shoesColor: '#2E2A3A' }, x: 1140, y: 470, s: 0.95,
      say: ['Welcome! Pick a look from the style book ✨', 'Try the colour swatches! 🎨', 'Sit down, I\'ll blow-dry your hair 💨', 'Bows and clips are on the table 🎀'] },
  ],
  items: [
    ...STYLES.map(styleCard),
    swatchFan,
    { id: 'mirror', x: 818, y: 64, w: 278, h: 372, drag: false, data: { on: false },
      onTap: (it, api) => {
        it.data.on = !it.data.on; api.setArt(it); api.sfx.click();
        api.sparkle(it.x + 139, it.y + 180, ['✨', '💫', '✨']);
        api.bubble(it.x + 139, it.y - 6, it.data.on ? 'Looking fabulous! ✨' : 'Lights off');
        api.avatar()?.anim.happy();
      },
      art: (it) => svg(278, 372, `
        <defs><linearGradient id="salon-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9F4FB"/><stop offset=".55" stop-color="#CFE3F0"/><stop offset="1" stop-color="#BBD3E6"/></linearGradient>
          ${chrome('salon-mframe').replace(/#9AA0B4/, '#B88F4A').replace(/#F4F6FA/, '#F6E2A8').replace(/#C4C9D6/, '#D6B36A').replace(/#868CA2/, '#9C7638')}
          <radialGradient id="salon-bulb"><stop offset="0" stop-color="#FFFBEA"/><stop offset=".5" stop-color="#FFF0B0" stop-opacity=".7"/><stop offset="1" stop-color="#FFF0B0" stop-opacity="0"/></radialGradient></defs>
        <rect x="10" y="12" width="262" height="356" rx="130" fill="${INK}" opacity=".1"/>
        <rect x="4" y="4" width="262" height="356" rx="130" fill="url(#salon-mframe)" stroke="${INK}" stroke-width="2"/>
        <rect x="18" y="18" width="234" height="328" rx="117" fill="url(#salon-glass)"/>
        <path d="M60 110 L150 40 M54 170 L190 66 M200 300 L236 270" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".55"/>
        <path d="M18 250 Q135 230 252 250 V300 Q252 346 210 346 H60 Q18 346 18 300 Z" fill="#fff" opacity=".12"/>
        ${[[135, 6], [52, 40], [218, 40], [12, 120], [258, 120], [8, 210], [262, 210], [8, 300], [262, 300]].map(([x, y]) => `${it.data.on ? `<circle cx="${x}" cy="${y}" r="26" fill="url(#salon-bulb)"/>` : ''}<circle cx="${x}" cy="${y}" r="9" fill="${it.data.on ? '#FFF8D6' : '#F1ECF6'}" stroke="${INK}" stroke-width="1.6"/>`).join('')}`) },
    { id: 'chair', x: 845, y: 470, w: 220, h: 336,
      onTap: (it, api) => {
        it.el.classList.remove('sx-twirl'); void it.el.offsetWidth; it.el.classList.add('sx-twirl');
        api.sfx.boing(); api.bubble(it.x + 110, it.y - 10, 'Wheee, spin! 💫');
      },
      art: () => svg(220, 336, `
        <defs><linearGradient id="salon-leather" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6ADBCF"/><stop offset=".55" stop-color="#3CC7B8"/><stop offset="1" stop-color="#2A9C90"/></linearGradient>
          ${chrome('salon-steel')}<radialGradient id="salon-basegrad" cx=".5" cy=".3"><stop offset="0" stop-color="#F4F6FA"/><stop offset="1" stop-color="#8E94A8"/></radialGradient></defs>
        ${shadow(110, 322, 96, 12, 0.18)}
        <ellipse cx="110" cy="312" rx="84" ry="16" fill="url(#salon-basegrad)" stroke="${INK}" stroke-width="2"/>
        <rect x="96" y="214" width="28" height="98" rx="4" fill="url(#salon-steel)" stroke="${INK}" stroke-width="2"/>
        <path d="M66 270 H154 L160 282 H60 Z" fill="url(#salon-steel)" stroke="${INK}" stroke-width="2"/>
        <path d="M50 20 Q50 6 66 6 H154 Q170 6 170 20 L176 178 H44 Z" fill="url(#salon-leather)" stroke="${INK}" stroke-width="2"/>
        <path d="M64 24 H156 L160 168 H60 Z" fill="none" stroke="#1F7F75" stroke-width="1.6" opacity=".5"/>
        ${[[84, 54], [136, 54], [110, 90], [84, 126], [136, 126]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#2A9C90" stroke="#1F7F75" stroke-width="1"/>`).join('')}
        <path d="M84 54 L110 90 L136 54 M84 126 L110 90 L136 126" stroke="#1F7F75" stroke-width="1.2" opacity=".5" fill="none"/>
        <path d="M60 14 Q62 90 66 170" stroke="#fff" stroke-width="6" opacity=".25" fill="none" stroke-linecap="round"/>
        <rect x="26" y="168" width="168" height="54" rx="18" fill="url(#salon-leather)" stroke="${INK}" stroke-width="2"/>
        <path d="M40 180 H180" stroke="#fff" stroke-width="4" opacity=".3" stroke-linecap="round"/>
        <rect x="8" y="132" width="34" height="74" rx="12" fill="url(#salon-leather)" stroke="${INK}" stroke-width="2"/><rect x="178" y="132" width="34" height="74" rx="12" fill="url(#salon-leather)" stroke="${INK}" stroke-width="2"/>
        <rect x="8" y="126" width="34" height="12" rx="6" fill="url(#salon-steel)" stroke="${INK}" stroke-width="1.6"/><rect x="178" y="126" width="34" height="12" rx="6" fill="url(#salon-steel)" stroke="${INK}" stroke-width="1.6"/>`) },
    { id: 'dryer', x: 1384, y: 376, w: 200, h: 436, drag: false, cls: 'sx-dryer',
      onTap: (it, api) => {
        if (it.el.classList.contains('sx-blow')) return;
        it.el.classList.add('sx-blow');
        [0, 550, 1100].forEach((t) => api.later(() => api.sfx.pour(), t));
        api.bubble(it.x + 100, it.y - 10, 'Whirrr... 💨');
        api.later(() => {
          it.el.classList.remove('sx-blow');
          const me = api.avatar();
          if (me && Math.abs(me.x + me.w / 2 - (it.x + 100)) < 200) api.react(me, 'Soft and shiny! 💨', ['💨', '✨', '💫']);
          else api.sparkle(it.x + 100, it.y + 80, ['💨', '✨']);
        }, 1800);
      },
      art: () => svg(200, 436, `
        <defs><linearGradient id="salon-hood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9CCF6"/><stop offset=".5" stop-color="#B79CF0"/><stop offset="1" stop-color="#8E73CF"/></linearGradient>
          ${chrome('salon-pole')}<radialGradient id="salon-hoodin" cx=".5" cy=".2" r=".8"><stop offset="0" stop-color="#5B4C78"/><stop offset="1" stop-color="#2E2448"/></radialGradient></defs>
        ${shadow(100, 424, 86, 11, 0.18)}
        <path d="M30 420 L100 396 L170 420 M50 428 L100 396 L150 428" stroke="url(#salon-pole)" stroke-width="9" stroke-linecap="round" fill="none"/>
        <path d="M30 420 L100 396 L170 420" stroke="${INK}" stroke-width="1.5" fill="none" opacity=".5"/>
        <rect x="92" y="150" width="16" height="250" rx="5" fill="url(#salon-pole)" stroke="${INK}" stroke-width="2"/>
        <rect x="84" y="250" width="32" height="16" rx="5" fill="url(#salon-pole)" stroke="${INK}" stroke-width="1.6"/>
        <path d="M100 160 Q150 170 150 120" stroke="url(#salon-pole)" stroke-width="10" fill="none" stroke-linecap="round"/>
        <g transform="rotate(-12 100 80)">
          <path d="M16 112 Q10 18 100 12 Q190 18 184 112 Z" fill="url(#salon-hood)" stroke="${INK}" stroke-width="2"/>
          <path d="M40 40 Q70 22 110 22" stroke="#fff" stroke-width="7" opacity=".45" fill="none" stroke-linecap="round"/>
          <ellipse cx="100" cy="112" rx="84" ry="24" fill="url(#salon-hoodin)" stroke="${INK}" stroke-width="2"/>
          <g class="sx-air" stroke="#BFE6FF" stroke-width="4" stroke-linecap="round" fill="none" opacity=".9"><path d="M60 128 Q54 146 62 164"/><path d="M100 134 Q94 154 102 174"/><path d="M140 128 Q134 146 142 164"/></g>
          <path d="M16 112 Q100 140 184 112" stroke="#F5DE7A" stroke-width="4" fill="none" opacity=".8"/>
          <circle cx="160" cy="58" r="8" fill="#F5DE7A" stroke="${INK}" stroke-width="1.6"/>
        </g>`) },
    { id: 'sink', x: 26, y: 432, w: 340, h: 380, drag: false,
      onTap: (it, api) => {
        if (it.el.classList.contains('spray')) return;
        it.el.classList.add('spray'); api.sfx.pour();
        api.later(() => api.sparkle(it.x + 140, it.y + 90, ['🫧', '💧', '🫧']), 400);
        api.bubble(it.x + 170, it.y - 10, 'Shampoo and rinse! 🫧');
        api.later(() => it.el.classList.remove('spray'), 1800);
      },
      art: () => svg(340, 380, `
        <defs><linearGradient id="salon-porc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DCD6E6"/></linearGradient>
          <linearGradient id="salon-sinkcab" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4A3B5C"/><stop offset=".5" stop-color="#5E4E74"/><stop offset="1" stop-color="#43355A"/></linearGradient>
          <linearGradient id="salon-seat2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6ADBCF"/><stop offset="1" stop-color="#2A9C90"/></linearGradient>${chrome('salon-tap')}</defs>
        ${shadow(170, 364, 160, 14, 0.18)}
        <rect x="20" y="96" width="150" height="262" rx="6" fill="url(#salon-sinkcab)" stroke="${INK}" stroke-width="2"/>
        <path d="M36 120 H154 M36 200 H154" stroke="#fff" stroke-width="1.5" opacity=".15"/>
        <path d="M150 230 Q150 200 180 200 H300 Q326 200 326 226 V260 H150 Z" fill="url(#salon-seat2)" stroke="${INK}" stroke-width="2"/>
        <path d="M160 140 Q160 110 190 112 L210 114 Q224 116 222 132 L214 212 H160 Z" fill="url(#salon-seat2)" stroke="${INK}" stroke-width="2"/>
        <rect x="160" y="258" width="168" height="22" rx="8" fill="#43355A" stroke="${INK}" stroke-width="2"/>
        <path d="M180 280 V356 M308 280 V356" stroke="url(#salon-tap)" stroke-width="10" stroke-linecap="round"/>
        <path d="M6 98 Q4 56 40 50 H150 Q186 56 184 98 Q170 126 95 128 Q20 126 6 98 Z" fill="url(#salon-porc)" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="95" cy="86" rx="72" ry="22" fill="#C9D9E8" stroke="${INK}" stroke-width="1.6"/>
        <path d="M150 80 Q164 66 176 74" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/>
        <path d="M66 86 Q66 100 76 104" stroke="#fff" stroke-width="4" fill="none" opacity=".5"/>
        <path d="M60 52 V22 Q60 8 76 8 H104 Q118 8 118 22 V30" stroke="url(#salon-tap)" stroke-width="9" fill="none" stroke-linecap="round"/>
        <path d="M60 52 V22 Q60 8 76 8 H104 Q118 8 118 22 V30" stroke="${INK}" stroke-width="1.2" fill="none" opacity=".4"/>
        <g class="water"><path d="M118 34 Q120 56 112 80" stroke="#8FC3F0" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="96" cy="74" r="6" fill="#fff" stroke="#BFE6FF" stroke-width="1.5"/><circle cx="80" cy="82" r="4" fill="#fff" stroke="#BFE6FF" stroke-width="1.5"/><circle cx="124" cy="84" r="5" fill="#fff" stroke="#BFE6FF" stroke-width="1.5"/></g>
        <rect x="140" y="30" width="20" height="26" rx="5" fill="#C9B8F2" stroke="${INK}" stroke-width="1.6"/><rect x="145" y="20" width="10" height="12" rx="2" fill="#FBF8FD" stroke="${INK}" stroke-width="1.4"/>`) },
    { id: 'shelves', x: 1330, y: 104, w: 250, h: 250, drag: false,
      onTap: (it, api) => {
        api.sparkle(it.x + 125, it.y + 110, ['🫧', '✨', '🌸']);
        api.bubble(it.x + 125, it.y - 6, ['Lavender shampoo 💜', 'Mint conditioner 🌿', 'Shine serum ✨', 'Sea-salt spray 🌊'][Math.floor(Math.random() * 4)]);
      },
      art: () => {
        const bottle = (x, y, w, h, c, cap = '#FBF8FD', round = false) => `<g transform="translate(${x} ${y})">
          <rect x="0" y="${h * 0.22}" width="${w}" height="${h * 0.78}" rx="${round ? w / 2.4 : 5}" fill="${c}" stroke="${INK}" stroke-width="1.6"/>
          <rect x="${w * 0.28}" y="0" width="${w * 0.44}" height="${h * 0.26}" rx="2" fill="${cap}" stroke="${INK}" stroke-width="1.4"/>
          <rect x="${w * 0.16}" y="${h * 0.45}" width="${w * 0.68}" height="${h * 0.26}" rx="2" fill="#fff" opacity=".7"/>
          <rect x="${w * 0.12}" y="${h * 0.26}" width="3" height="${h * 0.6}" rx="1.5" fill="#fff" opacity=".45"/></g>`;
        return svg(250, 250, `
          <defs><linearGradient id="salon-shelf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2C9A2"/><stop offset="1" stop-color="#C29E73"/></linearGradient></defs>
          ${[80, 166, 246].map((y) => `<rect x="0" y="${y - 10}" width="250" height="12" rx="2" fill="url(#salon-shelf)" stroke="${INK}" stroke-width="1.6"/><rect x="4" y="${y + 2}" width="242" height="8" fill="${INK}" opacity=".07"/>`).join('')}
          ${bottle(14, 18, 30, 52, '#9EDDD4')}${bottle(52, 28, 26, 42, '#C9B8F2')}${bottle(86, 10, 34, 60, '#F5DE7A', '#4A3B5C')}${bottle(130, 30, 24, 40, '#8FC3F0', '#FBF8FD', true)}${bottle(164, 16, 30, 54, '#B79CF0')}${bottle(204, 34, 30, 36, '#FBF8FD', '#3CC7B8', true)}
          ${bottle(16, 106, 36, 50, '#B79CF0', '#F5DE7A')}${bottle(60, 116, 26, 40, '#9EDDD4', '#FBF8FD', true)}
          <g transform="translate(100 120)"><rect width="60" height="36" rx="4" fill="#FBF8FD" stroke="${INK}" stroke-width="1.6"/><path d="M0 12 H60" stroke="#3CC7B8" stroke-width="5"/></g>
          ${bottle(172, 100, 30, 56, '#8FC3F0', '#4A3B5C')}${bottle(208, 118, 28, 38, '#F5DE7A', '#FBF8FD', true)}
          <g transform="translate(20 196)"><path d="M0 40 Q0 0 40 0 Q80 0 80 40 Z" fill="#EDE6F5" stroke="${INK}" stroke-width="1.6"/><path d="M10 40 Q10 10 40 10 Q70 10 70 40" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/></g>
          ${[0, 1, 2].map((i) => `<rect x="${118 + i * 40}" y="${200}" width="32" height="40" rx="3" fill="${['#C9B8F2', '#9EDDD4', '#F5DE7A'][i]}" stroke="${INK}" stroke-width="1.6"/><path d="M${118 + i * 40} 214 h32" stroke="#fff" stroke-width="2" opacity=".6"/>`).join('')}`);
      } },
    { id: 'polish', x: 1150, y: 150, w: 150, h: 190, drag: false, data: { n: 0 },
      onTap: (it, api) => {
        const shades = [['Lilac', '#B79CF0'], ['Turquoise', '#3CC7B8'], ['Sky blue', '#8FC3F0'], ['Lemon', '#F5DE7A'], ['Coral', '#E58F6A'], ['Midnight', '#4D5C9A']];
        const [name, c] = shades[it.data.n++ % shades.length];
        it.data.pick = c; api.setArt(it); api.sfx.click();
        const me = api.avatar();
        if (me) api.react(me, `${name} nails! 💅`, ['💅', '✨', '💫']);
        else api.bubble(it.x + 75, it.y - 6, `${name} nails! 💅`);
      },
      art: (it) => svg(150, 190, `
        <defs><linearGradient id="salon-rack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF8FD"/><stop offset="1" stop-color="#E7E0F0"/></linearGradient></defs>
        <rect x="4" y="6" width="142" height="180" rx="8" fill="${INK}" opacity=".08"/>
        <rect x="0" y="0" width="142" height="180" rx="8" fill="url(#salon-rack)" stroke="${INK}" stroke-width="1.8"/>
        ${text(71, 22, 'NAIL BAR', 13, '#7A64B0', 600)}
        ${[62, 120, 172].map((y) => `<rect x="8" y="${y}" width="126" height="6" rx="2" fill="#D9B98F" stroke="${INK}" stroke-width="1.2"/>`).join('')}
        ${['#B79CF0', '#3CC7B8', '#8FC3F0', '#F5DE7A', '#E58F6A', '#4D5C9A'].map((c, i) => {
          const x = 18 + (i % 3) * 40, y = i < 3 ? 30 : 88, on = it.data.pick === c;
          return `<g transform="translate(${x} ${y - (on ? 6 : 0)})"><rect x="6" y="0" width="12" height="14" rx="2" fill="#2E2A3A"/><path d="M2 14 H22 Q24 14 24 18 V30 Q24 32 22 32 H2 Q0 32 0 30 V18 Q0 14 2 14 Z" fill="${c}" stroke="${INK}" stroke-width="1.4"/><rect x="4" y="17" width="3" height="11" rx="1.5" fill="#fff" opacity=".55"/></g>`;
        }).join('')}
        <g transform="translate(26 134)"><path d="M0 20 Q0 4 20 2 H76 Q96 4 96 20 V30 H0 Z" fill="#F1ECF6" stroke="${INK}" stroke-width="1.4"/>${['#B79CF0', '#3CC7B8', '#F5DE7A', '#E58F6A', '#8FC3F0'].map((c, i) => `<ellipse cx="${14 + i * 17}" cy="18" rx="6" ry="8" fill="${c}"/>`).join('')}</g>`) },
    hairAcc('acc-bow', 'bow', 396, 396, 'A pretty bow! 🎀', 80, 56, `
      <defs><linearGradient id="salon-satin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9CCF6"/><stop offset="1" stop-color="#9A80D8"/></linearGradient></defs>
      <path d="M40 28 C22 4 4 10 6 26 C8 44 26 42 40 32 Z M40 28 C58 4 76 10 74 26 C72 44 54 42 40 32 Z" fill="url(#salon-satin)" stroke="${INK}" stroke-width="2"/>
      <path d="M34 34 L24 54 L34 50 L38 36 Z M46 34 L56 54 L46 50 L42 36 Z" fill="#9A80D8" stroke="${INK}" stroke-width="1.6"/>
      <rect x="33" y="22" width="14" height="14" rx="5" fill="#B79CF0" stroke="${INK}" stroke-width="2"/>
      <path d="M14 20 Q22 16 30 24" stroke="#fff" stroke-width="2.5" opacity=".6" fill="none"/>`),
    hairAcc('acc-star', 'star', 486, 394, 'Star clip! ⭐', 60, 60, `
      <defs><linearGradient id="salon-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF0B0"/><stop offset=".6" stop-color="#F5DE7A"/><stop offset="1" stop-color="#D6B36A"/></linearGradient></defs>
      <path d="M30 4 L37 21 L56 22 L41 34 L46 53 L30 42 L14 53 L19 34 L4 22 L23 21 Z" fill="url(#salon-gold)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M30 12 L33 22 L44 23" stroke="#fff" stroke-width="2.4" fill="none" opacity=".7" stroke-linecap="round"/>`),
    wearable('round', 552, 404, 'salon-glasses'),
    wearable('straw', 616, 384, 'salon-hat'),
    { id: 'trolley', x: 372, y: 636, w: 124, h: 176,
      onTap: (it, api) => { api.sparkle(it.x + 62, it.y + 30, ['✂️', '✨']); api.bubble(it.x + 62, it.y - 8, ['Snip snip! ✂️', 'Brush, brush! 🪮', 'All tools ready! ✨'][Math.floor(Math.random() * 3)]); api.sfx.click(); },
      art: () => svg(124, 176, `
        <defs><linearGradient id="salon-trol" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#43355A"/><stop offset=".5" stop-color="#5E4E74"/><stop offset="1" stop-color="#3B2E50"/></linearGradient>${chrome('salon-trolc')}</defs>
        ${shadow(62, 170, 54, 7, 0.16)}
        <rect x="10" y="34" width="104" height="120" rx="8" fill="url(#salon-trol)" stroke="${INK}" stroke-width="2"/>
        ${[70, 110].map((y) => `<rect x="10" y="${y}" width="104" height="3" fill="#fff" opacity=".15"/><rect x="50" y="${y + 14}" width="24" height="5" rx="2.5" fill="url(#salon-trolc)"/>`).join('')}
        <rect x="4" y="26" width="116" height="12" rx="5" fill="url(#salon-trolc)" stroke="${INK}" stroke-width="1.6"/>
        <circle cx="24" cy="160" r="8" fill="#2E2A3A"/><circle cx="100" cy="160" r="8" fill="#2E2A3A"/>
        <g transform="translate(18 0)"><path d="M6 26 L18 6 M18 26 L6 6" stroke="url(#salon-trolc)" stroke-width="3"/><circle cx="5" cy="28" r="4" fill="none" stroke="#3CC7B8" stroke-width="2.5"/><circle cx="19" cy="28" r="4" fill="none" stroke="#3CC7B8" stroke-width="2.5"/></g>
        <rect x="46" y="6" width="16" height="22" rx="3" fill="#B79CF0" stroke="${INK}" stroke-width="1.4"/><rect x="50" y="0" width="8" height="8" rx="2" fill="#2E2A3A"/>
        <g transform="translate(70 12)"><rect width="36" height="10" rx="5" fill="#F5DE7A" stroke="${INK}" stroke-width="1.4"/><path d="M4 10 V16 M10 10 V16 M16 10 V16 M22 10 V16 M28 10 V16 M34 10 V14" stroke="${INK}" stroke-width="1.4"/></g>`) },
    { id: 'towels', x: 690, y: 742, w: 144, h: 112,
      onTap: (it, api) => { api.sparkle(it.x + 72, it.y + 30, ['🫧', '✨']); api.bubble(it.x + 72, it.y - 8, 'Fluffy fresh towels! 🧺'); },
      art: () => svg(144, 112, `
        <defs><linearGradient id="salon-wicker" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E3C79C"/><stop offset="1" stop-color="#BF9A6B"/></linearGradient></defs>
        ${shadow(72, 106, 66, 7, 0.16)}
        <path d="M22 18 Q72 0 122 18 L118 30 H26 Z" fill="#9EDDD4" stroke="${INK}" stroke-width="1.8"/>
        <path d="M16 30 Q72 12 128 30 L124 44 H20 Z" fill="#F5F0E8" stroke="${INK}" stroke-width="1.8"/>
        <path d="M12 44 Q72 26 132 44 L128 58 H16 Z" fill="#C9B8F2" stroke="${INK}" stroke-width="1.8"/>
        <path d="M8 54 H136 L124 104 H20 Z" fill="url(#salon-wicker)" stroke="${INK}" stroke-width="2"/>
        ${[64, 76, 88].map((y) => `<path d="M${10 + (y - 54) * 0.24} ${y} H${134 - (y - 54) * 0.24}" stroke="#A47E52" stroke-width="2" opacity=".6"/>`).join('')}
        ${Array.from({ length: 9 }, (_, i) => `<path d="M${22 + i * 13} 56 L${26 + i * 12} 102" stroke="#A47E52" stroke-width="1.4" opacity=".45"/>`).join('')}
        <rect x="4" y="50" width="136" height="8" rx="4" fill="#D4B386" stroke="${INK}" stroke-width="1.6"/>`) },
  ],
};
