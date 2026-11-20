// Snowflake Bakery: bake bread, pie and cinnamon rolls in the oven, decorate a cake at the dough table,
// take a pastry from the display case, puff flour out of the sacks, a sleepy cat and the baker Hanna.
import { INK, O, svg, text, starPath, winterWindow, food, NPC_WINTER } from './common.js';
import { darker, lighter } from '../avatar.js';
import { CLIMATES } from '../ui.js';

const O2 = 'class="o" style="stroke-width:2"';
const tag = (x, y, t, w = 180) => `<rect x="${x - w / 2}" y="${y - 19}" width="${w}" height="36" rx="18" fill="#FFFDF7" fill-opacity=".94" stroke="${INK}" stroke-width="2"/>${text(x, y + 7, t, 18, '#7A64B0')}`;
const shadow = (cx, cy, rx, ry = 10, op = 0.14) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${INK}" opacity="${op}"/>`;
const flake = (x, y, r, col = '#fff', sw = 2) => `<g stroke="${col}" stroke-width="${sw}" stroke-linecap="round">${[0, 60, 120].map((a) => {
  const dx = Math.cos((a * Math.PI) / 180) * r, dy = Math.sin((a * Math.PI) / 180) * r;
  return `<path d="M${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)} L${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}"/>`;
}).join('')}</g>`;

// ---------- room ----------
const VP = [800, 250];
const planks = () => {
  let s = '';
  for (let i = -6; i <= 26; i++) {
    const xb = i * 90 - 300, t = (620 - VP[1]) / (900 - VP[1]);
    s += `<path d="M${(VP[0] + (xb - VP[0]) * t).toFixed(1)} 620 L${xb} 900"/>`;
  }
  return s + [648, 682, 724, 776, 838].map((y) => `<path d="M0 ${y} H1600" opacity=".5"/>`).join('');
};

const bg = ({ weather }) => svg(1600, 900, `
  <defs>
    <linearGradient id="bk-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8EFDD"/><stop offset="1" stop-color="#F0E1C4"/></linearGradient>
    <pattern id="bk-plaster" width="90" height="90" patternUnits="userSpaceOnUse"><circle cx="12" cy="20" r="1.4" fill="#E3D0AE"/><circle cx="60" cy="50" r="1.1" fill="#E8D7B9"/><circle cx="34" cy="76" r="1.6" fill="#E5D3B3"/><circle cx="80" cy="12" r="1" fill="#E3D0AE"/></pattern>
    <pattern id="bk-tile" width="64" height="32" patternUnits="userSpaceOnUse"><rect width="64" height="32" fill="#C9DCEA"/>
      <rect x="1.5" y="1.5" width="61" height="13" rx="3" fill="#E6F0F7"/><rect x="-31" y="17.5" width="61" height="13" rx="3" fill="#E1EDF6"/><rect x="33.5" y="17.5" width="61" height="13" rx="3" fill="#E1EDF6"/>
      <path d="M6 5 H30" stroke="#fff" stroke-width="2" opacity=".7"/></pattern>
    <linearGradient id="bk-wain" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ABD3CE"/><stop offset="1" stop-color="#8DBBB6"/></linearGradient>
    <linearGradient id="bk-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BF946D"/><stop offset="1" stop-color="#DDB892"/></linearGradient>
    <linearGradient id="bk-contact" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK}" stop-opacity=".3"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient>
    <linearGradient id="bk-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".6"/><stop offset="1" stop-color="#FFF4C8" stop-opacity="0"/></linearGradient>
    <radialGradient id="bk-halo"><stop offset="0" stop-color="#FFF3C2" stop-opacity=".7"/><stop offset="1" stop-color="#FFF3C2" stop-opacity="0"/></radialGradient>
    <radialGradient id="bk-lampglow"><stop offset="0" stop-color="#FFE6A0" stop-opacity=".75"/><stop offset="1" stop-color="#FFE6A0" stop-opacity="0"/></radialGradient>
    <linearGradient id="bk-shade" x1="0" x2="1"><stop offset="0" stop-color="#5FA7A0"/><stop offset=".4" stop-color="#9EDDD4"/><stop offset="1" stop-color="#5FA7A0"/></linearGradient>
    <linearGradient id="bk-shelf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D2A77D"/><stop offset="1" stop-color="#A97E58"/></linearGradient>
    <linearGradient id="bk-jar" x1="0" x2="1"><stop offset="0" stop-color="#DCEBF5" stop-opacity=".9"/><stop offset=".3" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset="1" stop-color="#C9DCEA" stop-opacity=".9"/></linearGradient>
  </defs>
  <rect width="1600" height="620" fill="url(#bk-wall)"/><rect width="1600" height="620" fill="url(#bk-plaster)"/>
  <rect x="24" y="96" width="430" height="524" fill="url(#bk-tile)"/>
  <path d="M24 620 V96 H454 V620" fill="none" stroke="#D8C29C" stroke-width="8"/><path d="M28 100 H450" stroke="#fff" stroke-width="2" opacity=".6"/>
  <rect x="454" y="432" width="1146" height="188" fill="url(#bk-wain)"/>
  ${Array.from({ length: 8 }, (_, i) => `<rect x="${478 + i * 142}" y="454" width="118" height="140" rx="6" fill="none" stroke="#7DAAA5" stroke-width="2.5"/><path d="M${482 + i * 142} 590 V458 H${592 + i * 142}" fill="none" stroke="#fff" stroke-width="2" opacity=".35"/>`).join('')}
  <rect x="454" y="420" width="1146" height="16" rx="4" fill="#F7ECD7" stroke="#CDB690" stroke-width="2"/>
  <g transform="translate(800 48)">${text(0, 0, 'Snowflake Bakery', 34, '#7A64B0')}${flake(-170, -10, 11, '#9EDDD4', 3)}${flake(170, -10, 11, '#9EDDD4', 3)}</g>
  <ellipse cx="790" cy="215" rx="250" ry="180" fill="url(#bk-halo)" opacity="${weather === 'snow' ? 0.55 : 1}"/>
  ${winterWindow(640, 100, 300, 220, weather, '#C9B8F2')}
  <g transform="translate(1150 300)">
    <rect x="0" y="0" width="420" height="16" rx="4" fill="url(#bk-shelf)" stroke="${INK}" stroke-width="2"/>
    <path d="M40 16 L40 42 L66 16 M380 16 L380 42 L354 16" fill="none" stroke="#8B6450" stroke-width="5" stroke-linejoin="round"/>
    ${[[24, 'FLOUR', '#FBF7EF'], [96, 'SUGAR', '#FFFFFF'], [168, '', '#C9B8F2']].map(([x, l, c]) => `<rect x="${x}" y="-66" width="56" height="66" rx="10" fill="url(#bk-jar)" stroke="${INK}" stroke-width="2"/>
      <rect x="${x + 4}" y="-40" width="48" height="36" rx="7" fill="${c}"/>${c === '#C9B8F2' ? `<g fill="#9EDDD4">${[0, 1, 2, 3].map((k) => `<circle cx="${x + 12 + k * 11}" cy="${-20 + (k % 2) * 8}" r="4"/>`).join('')}</g>` : ''}
      <rect x="${x - 2}" y="-76" width="60" height="12" rx="4" fill="#C99772" stroke="${INK}" stroke-width="2"/>
      ${l ? text(x + 28, -46, l, 11, '#7A64B0', 500) : ''}<path d="M${x + 8} -58 V-8" stroke="#fff" stroke-width="3" opacity=".6"/>`).join('')}
    <g transform="translate(250 0)"><ellipse cx="50" cy="-4" rx="46" ry="6" fill="#E7E2EF" stroke="${INK}" stroke-width="2"/><ellipse cx="50" cy="-10" rx="46" ry="6" fill="#F4F1FA" stroke="${INK}" stroke-width="2"/><ellipse cx="50" cy="-16" rx="46" ry="6" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/></g>
    <g transform="translate(352 0)"><path d="M6 0 H54 L44 -10 H16 Z" fill="#E7E2EF" stroke="${INK}" stroke-width="2"/><path d="M14 -10 Q30 -74 46 -10 Z" fill="#E8F2F8" fill-opacity=".7" stroke="${INK}" stroke-width="2"/><circle cx="30" cy="-48" r="4" fill="#C99772"/><path d="M22 -12 Q24 -40 30 -52" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/></g>
  </g>
  ${[1250, 1470].map((x) => `<path d="M${x} 0 V110" stroke="${INK}" stroke-width="2.5"/><circle cx="${x}" cy="170" r="120" fill="url(#bk-lampglow)"/>
    <path d="M${x - 42} 152 Q${x - 38} 110 ${x} 108 Q${x + 38} 110 ${x + 42} 152 Z" fill="url(#bk-shade)" stroke="${INK}" stroke-width="2.5"/>
    <ellipse cx="${x}" cy="152" rx="42" ry="7" fill="#FFF3C2" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="158" r="9" fill="#FFF8DE"/>`).join('')}
  <rect y="620" width="1600" height="280" fill="url(#bk-floor)"/>
  <g stroke="#A47A55" stroke-width="2" opacity=".5" fill="none">${planks()}</g>
  <path d="M650 622 L930 622 L1080 880 L520 880 Z" fill="url(#bk-beam)" opacity="${weather === 'snow' ? 0.45 : 0.9}"/>
  <rect x="0" y="598" width="1600" height="24" fill="#A57F5C"/><path d="M0 600 H1600" stroke="#C9A27C" stroke-width="3"/>
  <rect y="622" width="1600" height="44" fill="url(#bk-contact)"/>`);

// ---------- baked goods ----------
const BAKED = {
  bread: { w: 120, h: 66, text: 'Warm crusty bread! 🍞', art: `<defs><linearGradient id="bk-g-bread" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9B66C"/><stop offset="1" stop-color="#B47240"/></linearGradient></defs>
    ${shadow(60, 61, 54, 5)}<path ${O2} d="M8 50 Q4 18 40 12 Q60 8 80 12 Q116 18 112 50 Q110 60 96 60 H24 Q10 60 8 50 Z" fill="url(#bk-g-bread)"/>
    <path d="M30 22 Q38 34 34 46 M54 18 Q62 32 58 46 M78 20 Q86 34 82 46" stroke="#F6DCA8" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M20 26 Q40 14 62 14" stroke="#fff" stroke-width="3" opacity=".35" fill="none" stroke-linecap="round"/>
    <g fill="#fff" opacity=".75"><circle cx="44" cy="20" r="1.5"/><circle cx="70" cy="24" r="1.2"/><circle cx="92" cy="30" r="1.5"/><circle cx="26" cy="34" r="1.2"/></g>` },
  pie: { w: 116, h: 70, text: 'Blueberry pie, yum! 🥧', art: `<defs><clipPath id="bk-g-pieclip"><ellipse cx="58" cy="30" rx="42" ry="13"/></clipPath>
      <linearGradient id="bk-g-crust" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2CB86"/><stop offset="1" stop-color="#C98E4E"/></linearGradient></defs>
    ${shadow(58, 62, 52, 6)}<path ${O2} d="M6 30 L16 54 Q58 66 100 54 L110 30 Z" fill="#B9C3D0"/><path d="M14 40 Q58 52 102 40" stroke="#fff" stroke-width="3" opacity=".5" fill="none"/>
    <ellipse ${O2} cx="58" cy="30" rx="52" ry="18" fill="url(#bk-g-crust)"/><ellipse cx="58" cy="30" rx="42" ry="13" fill="#5C4E9E"/>
    <g clip-path="url(#bk-g-pieclip)"><g fill="#8A7BC8">${[[40, 26], [62, 34], [76, 24], [50, 36], [30, 32]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</g>
      <g stroke="#E9B970" stroke-width="7" stroke-linecap="round">${[-30, -10, 10, 30].map((d) => `<path d="M${58 + d - 12} 14 L${58 + d + 12} 46"/><path d="M${58 + d + 12} 14 L${58 + d - 12} 46"/>`).join('')}</g></g>
    <g fill="#F7D99C" stroke="#C98E4E" stroke-width="1.2">${Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; return `<circle cx="${(58 + Math.cos(a) * 48).toFixed(1)}" cy="${(30 + Math.sin(a) * 15.5).toFixed(1)}" r="4.2"/>`; }).join('')}</g>` },
  cinnamon: { w: 86, h: 68, text: 'Cinnamon swirl! 😋', art: `<defs><radialGradient id="bk-g-roll" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#F3CF92"/><stop offset="1" stop-color="#C88A4C"/></radialGradient></defs>
    ${shadow(43, 60, 38, 6)}<path ${O2} d="M6 38 Q6 58 43 60 Q80 58 80 38 V34 H6 Z" fill="#C88A4C"/><ellipse ${O2} cx="43" cy="34" rx="37" ry="22" fill="url(#bk-g-roll)"/>
    <path d="M43 34 m-4 0 a4 3 0 1 1 8 0 a9 7 0 1 1 -18 0 a15 11 0 1 1 30 0 a21 15 0 1 1 -42 0 a27 18 0 1 1 54 0" fill="none" stroke="#9A5E33" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M14 26 Q24 40 32 24 Q40 42 50 22 Q58 42 68 26" fill="none" stroke="#FFFDF5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` },
  cookie: { w: 64, h: 64, text: 'Snowflake cookie! ❄️', art: `<defs><radialGradient id="bk-g-cookie" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#E8BC80"/><stop offset="1" stop-color="#B9814A"/></radialGradient></defs>
    ${shadow(32, 58, 26, 4)}<circle ${O2} cx="32" cy="30" r="26" fill="url(#bk-g-cookie)"/>${flake(32, 30, 15, '#FFFDF5', 3.2)}
    <g fill="#FFFDF5"><circle cx="32" cy="30" r="3"/></g><path d="M14 20 Q20 10 32 8" stroke="#fff" stroke-width="2.5" opacity=".35" fill="none" stroke-linecap="round"/>` },
  pretzel: { w: 92, h: 76, text: 'A salty pretzel! 🥨', art: `<defs><linearGradient id="bk-g-pretzel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9844A"/><stop offset="1" stop-color="#8F5530"/></linearGradient></defs>
    ${shadow(46, 70, 38, 5)}<path d="M20 62 Q2 40 18 20 Q36 2 50 28 Q58 46 72 62 M72 62 Q90 40 74 20 Q56 2 42 28 Q34 46 20 62 M14 48 Q46 34 78 48" fill="none" stroke="${INK}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20 62 Q2 40 18 20 Q36 2 50 28 Q58 46 72 62 M72 62 Q90 40 74 20 Q56 2 42 28 Q34 46 20 62 M14 48 Q46 34 78 48" fill="none" stroke="url(#bk-g-pretzel)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 26 Q30 8 44 22" fill="none" stroke="#fff" stroke-width="2.5" opacity=".4" stroke-linecap="round"/>
    <g fill="#fff">${[[16, 36], [30, 14], [62, 14], [78, 34], [46, 42], [24, 56], [70, 56]].map(([x, y]) => `<rect x="${x}" y="${y}" width="3.5" height="3.5" rx="1" transform="rotate(30 ${x} ${y})"/>`).join('')}</g>` },
};
function baked(api, kind, x, y) {
  const f = BAKED[kind];
  return api.add({
    id: api.uid(kind), x, y, w: f.w, h: f.h, cls: 'food',
    art: () => svg(f.w, f.h, f.art),
    onGive: (i, a, who) => a.eat(i, who, f.text, ['✨', '😋', '💜']),
  }, { spawned: true });
}
const OVEN_ORDER = ['bread', 'pie', 'cinnamon'];
const ovenCount = (api) => OVEN_ORDER.reduce((n, k) => n + api.count(k), 0);

// ---------- cake decorating ----------
const FROSTINGS = [['#FBF5E6', 'vanilla'], ['#CDBDF0', 'lilac'], ['#A9E2D8', 'mint'], ['#F6E39A', 'lemon'], ['#BFDDF6', 'sky blue'], ['#9B6B52', 'chocolate']];
const TOPPINGS = [['berries', '🫐 Berries'], ['sprinkles', '✨ Sprinkles'], ['candles', '🕯️ Candles'], ['snow', '❄️ Snowflakes'], ['star', '⭐ Star']];
const ANCHOR = {
  round: { cx: 110, cy: 90, rx: 76, ry: 18, side: [[66, 136], [110, 150], [154, 136]] },
  tiered: { cx: 110, cy: 62, rx: 50, ry: 12, side: [[58, 156], [110, 166], [162, 156], [110, 96]] },
  heart: { cx: 110, cy: 88, rx: 52, ry: 22, side: [[66, 146], [110, 166], [154, 146]] },
  log: { cx: 106, cy: 104, rx: 56, ry: 6, side: [[70, 146], [126, 150]] },
};
function cakeBody(c, u) {
  const f = c.frosting, d = darker(f, 0.2), l = lighter(f, 0.4), lt = lighter(f, 0.55);
  const side = `url(#${u}s)`, top = `url(#${u}t)`;
  const drip = (cx, y, rx, ry) => {
    let p = `M${cx - rx} ${y}`;
    const n = 8, at = (x) => y + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
    for (let i = 0; i < n; i++) {
      const x0 = cx - rx + (2 * rx * i) / n, x1 = cx - rx + (2 * rx * (i + 1)) / n, xm = (x0 + x1) / 2;
      p += ` Q${xm.toFixed(1)} ${(at(xm) + 9 + (i % 3) * 6).toFixed(1)} ${x1.toFixed(1)} ${at(x1).toFixed(1)}`;
    }
    return `<path d="${p} A${rx} ${ry} 0 0 1 ${cx - rx} ${y} Z" fill="${l}" stroke="${INK}" stroke-width="2"/>`;
  };
  const tier = (cx, y, rx, h, ry) => `<path d="M${cx - rx} ${y} V${y + h} A${rx} ${ry} 0 0 0 ${cx + rx} ${y + h} V${y} Z" fill="${side}" stroke="${INK}" stroke-width="2.4"/>
    <ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${ry}" fill="${top}" stroke="${INK}" stroke-width="2.4"/>${drip(cx, y, rx, ry)}
    <path d="M${cx - rx * 0.7} ${y + ry * 0.2} Q${cx - rx * 0.3} ${y - ry * 0.6} ${cx + rx * 0.1} ${y - ry * 0.55}" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/>`;
  const HEART = 'M100 190 C40 150 10 110 20 70 C30 30 80 26 100 64 C120 26 170 30 180 70 C190 110 160 150 100 190 Z';
  let body = '';
  if (c.shape === 'round') body = tier(110, 90, 76, 70, 18);
  else if (c.shape === 'tiered') body = tier(110, 118, 82, 46, 17) + tier(110, 62, 50, 46, 12);
  else if (c.shape === 'heart') {
    const g = (dy, fill, stroke) => `<path d="${HEART}" transform="translate(25 ${43 + dy}) scale(.85 .5)" fill="${fill}" ${stroke ? `stroke="${INK}" stroke-width="4.4"` : ''}/>`;
    body = g(40, d, true) + [34, 28, 22, 16, 10, 4].map((k) => g(k, side, false)).join('') + g(0, top, true)
      + `<path d="M58 70 Q64 58 80 58" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/>`;
  } else {
    body = `<path d="M44 100 H170 A24 38 0 0 1 170 176 H44 A24 38 0 0 1 44 100 Z" fill="${side}" stroke="${INK}" stroke-width="2.4"/>
      <path d="M40 116 Q90 108 160 118 M34 140 Q100 132 166 142 M42 160 Q96 154 160 162" stroke="${d}" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>
      <path d="M50 104 Q100 96 160 104" stroke="${lt}" stroke-width="4" fill="none" opacity=".8" stroke-linecap="round"/>
      <ellipse cx="170" cy="138" rx="24" ry="38" fill="#FBF0D8" stroke="${INK}" stroke-width="2.4"/>
      <path d="M170 138 m-3 0 a3 5 0 1 1 6 0 a8 12 0 1 1 -16 0 a13 20 0 1 1 26 0 a18 28 0 1 1 -36 0" fill="none" stroke="${f === '#FBF5E6' ? '#C9A57C' : f}" stroke-width="4" stroke-linecap="round"/>
      <path d="M86 102 V88 A12 5 0 0 1 110 88 V100" fill="${side}" stroke="${INK}" stroke-width="2.2"/><ellipse cx="98" cy="88" rx="12" ry="5" fill="#FBF0D8" stroke="${INK}" stroke-width="2"/>`;
  }
  const a = ANCHOR[c.shape];
  const t = c.tops;
  let deco = '';
  if (t.has('snow')) deco += a.side.map(([x, y]) => flake(x, y, 7, '#FFFFFF', 2.4)).join('');
  if (t.has('berries')) {
    deco += Array.from({ length: 7 }, (_, i) => {
      const ang = Math.PI * (0.08 + (0.84 * i) / 6), x = a.cx + Math.cos(ang) * a.rx * 0.74, y = a.cy + Math.sin(ang) * a.ry * 0.6;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.5" fill="${i % 3 === 1 ? '#6A4C93' : '#4C5FA8'}" stroke="${INK}" stroke-width="1.6"/><circle cx="${(x - 2).toFixed(1)}" cy="${(y - 2).toFixed(1)}" r="1.8" fill="#fff" opacity=".7"/>`;
    }).join('') + `<path d="M${a.cx - 6} ${a.cy + a.ry * 0.2} q8 -12 16 -4 q-8 6 -16 4 z" fill="#7FBF9A" stroke="${INK}" stroke-width="1.4"/>`;
  }
  if (t.has('sprinkles')) {
    const cols = ['#F5DE7A', '#9EDDD4', '#B79CF0', '#8FC3F0', '#FFFFFF'];
    deco += Array.from({ length: 20 }, (_, i) => {
      const ang = (i * 137.5 * Math.PI) / 180, r = Math.sqrt((i + 0.5) / 20) * 0.8;
      const x = a.cx + Math.cos(ang) * a.rx * r, y = a.cy + Math.sin(ang) * Math.max(a.ry, 6) * r;
      return `<rect x="${(x - 4).toFixed(1)}" y="${(y - 1.5).toFixed(1)}" width="8" height="3" rx="1.5" fill="${cols[i % 5]}" transform="rotate(${(i * 47) % 180} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }).join('');
  }
  if (t.has('candles')) {
    deco += [-1, 0, 1].map((k) => {
      const x = a.cx + k * Math.min(26, a.rx * 0.45), y = a.cy - 2 + Math.abs(k) * 2;
      return `<rect x="${x - 4}" y="${y - 34}" width="8" height="34" rx="2" fill="${k ? '#9EDDD4' : '#F6E39A'}" stroke="${INK}" stroke-width="1.6"/>
        <path d="M${x - 4} ${y - 26} l8 -5 M${x - 4} ${y - 16} l8 -5 M${x - 4} ${y - 6} l8 -5" stroke="#fff" stroke-width="2" opacity=".8"/>
        <circle cx="${x}" cy="${y - 44}" r="10" fill="#FFE9A0" opacity=".45"/><path d="M${x} ${y - 52} Q${x + 6} ${y - 42} ${x} ${y - 37} Q${x - 6} ${y - 42} ${x} ${y - 52} Z" fill="#F7C35F" stroke="#E0943E" stroke-width="1.2"/>`;
    }).join('');
  }
  if (t.has('star')) deco += `<path d="M${a.cx} ${a.cy} V${a.cy - 30}" stroke="#C9A35A" stroke-width="3"/>${starPath(a.cx, a.cy - 44, 17, '#F7D24A', `stroke="${INK}" stroke-width="2"`)}<circle cx="${a.cx - 5}" cy="${a.cy - 49}" r="3" fill="#fff" opacity=".8"/>`;
  return `<defs><linearGradient id="${u}s" x1="0" x2="1"><stop offset="0" stop-color="${d}"/><stop offset=".3" stop-color="${l}"/><stop offset=".65" stop-color="${f}"/><stop offset="1" stop-color="${d}"/></linearGradient>
      <linearGradient id="${u}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lt}"/><stop offset="1" stop-color="${f}"/></linearGradient></defs>
    <ellipse cx="110" cy="188" rx="100" ry="10" fill="${INK}" opacity=".12"/>
    <ellipse cx="110" cy="180" rx="98" ry="15" fill="#E9E5F2" stroke="${INK}" stroke-width="2"/><ellipse cx="110" cy="177" rx="84" ry="10" fill="#FFFFFF"/>
    ${body}${deco}`;
}

function cakeGame(api, table) {
  const c = { shape: 'round', frosting: '#CDBDF0', tops: new Set(['berries', 'candles']) };
  api.modal((card, close) => {
    card.innerHTML += `<h2>Decorate a cake</h2><div class="bk-cake-holder"></div>
      <div class="opt-row shapes"></div><div class="opt-row frost"></div><div class="opt-row tops"></div>
      <button class="btn bk-done">Done ✨</button>`;
    const holder = card.querySelector('.bk-cake-holder');
    const draw = () => { holder.innerHTML = `<svg class="cookie-preview" viewBox="0 0 220 200" overflow="visible">${cakeBody(c, 'bkprev')}</svg>`; };
    const row = (sel, opts, isOn, pick, isColor) => {
      const r = card.querySelector(sel); r.innerHTML = '';
      opts.forEach(([val, label]) => {
        const b = document.createElement('button');
        b.className = (isColor ? 'dot' : 'chip') + (isOn(val) ? ' on' : '');
        if (isColor) { b.style.background = val; b.setAttribute('aria-label', label + ' frosting'); } else b.textContent = label;
        b.onclick = () => { pick(val); api.sfx.click(); refresh(); };
        r.append(b);
      });
    };
    const refresh = () => {
      row('.shapes', [['round', '🎂 Round'], ['tiered', '🏰 Two tiers'], ['heart', '💜 Heart'], ['log', '🪵 Winter log']], (v) => c.shape === v, (v) => { c.shape = v; });
      row('.frost', FROSTINGS, (v) => c.frosting === v, (v) => { c.frosting = v; }, true);
      row('.tops', TOPPINGS, (v) => c.tops.has(v), (v) => { if (c.tops.has(v)) c.tops.delete(v); else c.tops.add(v); });
      draw();
    };
    card.querySelector('.bk-done').onclick = () => {
      const design = { ...c, tops: new Set(c.tops) };
      const u = 'bkc' + Math.random().toString(36).slice(2, 8);
      close();
      api.sfx.yum();
      const n = api.count('cake');
      const it = api.add({
        id: api.uid('cake'), x: table.x + 250 - (n % 3) * 70, y: table.y - 62, w: 120, h: 109, cls: 'food',
        art: () => svg(220, 200, cakeBody(design, u)),
        onGive: (i, a, who) => a.eat(i, who, 'The most beautiful cake! 🎂', ['🎂', '✨', '💜']),
      }, { spawned: true });
      api.sparkle(it.x + 60, it.y + 50, ['✨', '🎂', '⭐']);
      api.bubble(it.x + 60, it.y - 20, 'What a cake! Give it to a friend 🎂');
      if (!api.starFound('bakery-cake')) api.addStar('bakery-cake', table.x + 330, table.y - 200, { spawned: true });
    };
    refresh();
  });
}

// ---------- props ----------
const ovenArt = () => svg(380, 470, `
  <defs>
    <linearGradient id="bk-enamel" x1="0" x2="1"><stop offset="0" stop-color="#9C8BC6"/><stop offset=".22" stop-color="#CFC2EC"/><stop offset=".6" stop-color="#B7A8DE"/><stop offset="1" stop-color="#8F7EBB"/></linearGradient>
    <linearGradient id="bk-enamel2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9AADF"/><stop offset="1" stop-color="#9F8ECB"/></linearGradient>
    <linearGradient id="bk-steel" x1="0" x2="1"><stop offset="0" stop-color="#AEB8C8"/><stop offset=".35" stop-color="#F2F5F9"/><stop offset="1" stop-color="#A3AEBF"/></linearGradient>
    <linearGradient id="bk-brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6DEA2"/><stop offset="1" stop-color="#C39A52"/></linearGradient>
    <radialGradient id="bk-ovenglow" cx=".5" cy=".7" r=".7"><stop offset="0" stop-color="#FFD98A"/><stop offset=".55" stop-color="#F3A35A"/><stop offset="1" stop-color="#C8643A" stop-opacity=".2"/></radialGradient>
  </defs>
  <rect x="160" y="-176" width="60" height="226" fill="url(#bk-steel)" stroke="${INK}" stroke-width="2"/>
  ${[-120, -40].map((y) => `<rect x="154" y="${y}" width="72" height="12" rx="4" fill="url(#bk-steel)" stroke="${INK}" stroke-width="2"/>`).join('')}
  ${shadow(190, 462, 180, 12, 0.2)}
  <rect x="30" y="30" width="320" height="70" rx="14" fill="url(#bk-enamel2)" stroke="${INK}" stroke-width="2.4"/>
  ${[96, 284].map((x) => `<circle cx="${x}" cy="65" r="13" fill="url(#bk-brass)" stroke="${INK}" stroke-width="2"/><path d="M${x} 56 V64" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`).join('')}
  <circle cx="190" cy="65" r="24" fill="#FBF7EF" stroke="${INK}" stroke-width="2.4"/>
  <g stroke="#B7A8DE" stroke-width="2">${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<path d="M${(190 + Math.cos(a) * 17).toFixed(1)} ${(65 + Math.sin(a) * 17).toFixed(1)} L${(190 + Math.cos(a) * 21).toFixed(1)} ${(65 + Math.sin(a) * 21).toFixed(1)}"/>`; }).join('')}</g>
  <g class="wx-dial"><circle cx="190" cy="65" r="22" fill="none"/><path d="M190 65 L190 49" stroke="#E0843E" stroke-width="3" stroke-linecap="round"/></g><circle cx="190" cy="65" r="3" fill="${INK}"/>
  <rect x="10" y="98" width="360" height="22" rx="8" fill="url(#bk-steel)" stroke="${INK}" stroke-width="2.4"/>
  <rect x="22" y="118" width="336" height="330" rx="22" fill="url(#bk-enamel)" stroke="${INK}" stroke-width="2.6"/>
  <rect x="52" y="146" width="276" height="206" rx="16" fill="url(#bk-enamel2)" stroke="${INK}" stroke-width="2.2"/>
  <rect x="82" y="186" width="216" height="128" rx="12" fill="#2C2440" stroke="${INK}" stroke-width="2.2"/>
  <rect class="wx-glow" x="84" y="188" width="212" height="124" rx="11" fill="url(#bk-ovenglow)"/>
  <path d="M96 282 H284" stroke="#6E5A7E" stroke-width="3"/>
  <path d="M118 282 Q122 256 150 254 Q178 256 182 282 Z M200 282 Q204 262 232 260 Q262 262 264 282 Z" fill="#7A4A30" opacity=".6"/>
  <path d="M98 300 L150 196 M130 300 L174 212" stroke="#fff" stroke-width="5" opacity=".12" stroke-linecap="round"/>
  <g class="wx-heat"><path class="ln steam" stroke="#fff" stroke-width="3" opacity=".7" d="M140 132 Q132 120 140 108 M190 132 Q182 120 190 108 M240 132 Q232 120 240 108"/></g>
  <rect x="70" y="158" width="240" height="13" rx="6.5" fill="url(#bk-brass)" stroke="${INK}" stroke-width="2"/>
  <rect x="52" y="366" width="276" height="62" rx="12" fill="url(#bk-enamel2)" stroke="${INK}" stroke-width="2.2"/>
  <rect x="160" y="390" width="60" height="10" rx="5" fill="url(#bk-brass)" stroke="${INK}" stroke-width="1.8"/>
  <path d="M40 140 V420" stroke="#fff" stroke-width="6" opacity=".25" stroke-linecap="round"/>
  ${[44, 318].map((x) => `<rect x="${x}" y="446" width="18" height="18" rx="4" fill="url(#bk-brass)" stroke="${INK}" stroke-width="2"/>`).join('')}
  ${tag(300, -2, 'Tap to bake', 150)}`);

const tableArt = () => svg(440, 260, `
  <defs>
    <linearGradient id="bk-marble" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E6E2EE"/></linearGradient>
    <linearGradient id="bk-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6AC82"/><stop offset="1" stop-color="#AD8059"/></linearGradient>
    <radialGradient id="bk-dough" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFF8E8"/><stop offset="1" stop-color="#E8D3AE"/></radialGradient>
  </defs>
  ${shadow(220, 252, 214, 10, 0.18)}
  <path d="M30 40 H410 L436 96 H4 Z" fill="url(#bk-marble)" stroke="${INK}" stroke-width="2.4"/>
  <path d="M70 52 Q120 70 150 60 T240 78 M300 50 Q330 64 380 58 M40 84 Q90 72 120 88" stroke="#CFC6DE" stroke-width="1.6" fill="none"/>
  <rect x="4" y="96" width="432" height="16" rx="3" fill="#DCD6E6" stroke="${INK}" stroke-width="2.2"/>
  <rect x="14" y="112" width="412" height="122" fill="url(#bk-wood)" stroke="${INK}" stroke-width="2.4"/>
  ${[30, 226].map((x) => `<rect x="${x}" y="126" width="184" height="92" rx="6" fill="none" stroke="#8E6745" stroke-width="2.2"/><path d="M${x + 6} 214 V130 H${x + 178}" stroke="#E9C9A2" stroke-width="2" fill="none" opacity=".7"/>`).join('')}
  <g stroke="#9E7450" stroke-width="1.2" opacity=".45" fill="none"><path d="M40 150 Q100 144 160 152 T220 148"/><path d="M240 170 Q300 162 360 172 T420 168"/><path d="M50 196 Q120 190 190 198"/></g>
  ${[20, 404].map((x) => `<rect x="${x}" y="232" width="16" height="22" rx="4" fill="#8E6745" stroke="${INK}" stroke-width="2"/>`).join('')}
  <ellipse cx="300" cy="84" rx="62" ry="10" fill="#fff" opacity=".8"/>
  <ellipse cx="290" cy="72" rx="48" ry="22" fill="url(#bk-dough)" stroke="${INK}" stroke-width="2.2"/><path d="M262 64 Q280 54 300 56" stroke="#fff" stroke-width="3" opacity=".7" fill="none" stroke-linecap="round"/>
  <g fill="#fff" opacity=".9"><circle cx="240" cy="84" r="2"/><circle cx="352" cy="80" r="1.6"/><circle cx="330" cy="90" r="2.2"/><circle cx="250" cy="76" r="1.4"/></g>
  <path d="M370 82 l6 -12 6 12 -12 -7 h12 z" fill="none" stroke="#AEB8C8" stroke-width="2.4" stroke-linejoin="round"/>
  <g transform="translate(390 46)"><path d="M-14 26 H14 L8 20 H-8 Z" fill="#E9E5F2" stroke="${INK}" stroke-width="1.6"/><rect x="-12" y="6" width="24" height="15" rx="3" fill="#CDBDF0" stroke="${INK}" stroke-width="1.6"/><path d="M-12 9 q4 5 8 0 q4 5 8 0 q4 5 8 0" fill="#E8DEFA" stroke="${INK}" stroke-width="1.2"/></g>
  ${tag(220, 176, 'Decorate a cake 🎂', 210)}`);

const sackArt = () => svg(150, 170, `
  <defs><linearGradient id="bk-burlap" x1="0" x2="1"><stop offset="0" stop-color="#D2BE98"/><stop offset=".35" stop-color="#F1E5CC"/><stop offset="1" stop-color="#C8B38C"/></linearGradient>
    <pattern id="bk-weave" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3 H6 M3 0 V6" stroke="#B9A47E" stroke-width=".8" opacity=".55"/></pattern></defs>
  ${shadow(75, 162, 66, 8, 0.18)}
  <path ${O2} d="M22 52 Q10 100 14 140 Q16 162 40 164 H110 Q134 162 136 140 Q140 100 128 52 Z" fill="url(#bk-burlap)"/>
  <path d="M22 52 Q10 100 14 140 Q16 162 40 164 H110 Q134 162 136 140 Q140 100 128 52 Z" fill="url(#bk-weave)"/>
  <path ${O2} d="M30 54 Q38 30 50 34 Q60 18 75 26 Q92 16 102 34 Q116 30 120 54 Q75 64 30 54 Z" fill="#E8DABD"/>
  <path d="M44 50 Q75 58 106 50" stroke="#8B6450" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M98 52 q10 6 4 16 M98 52 q-2 12 -10 14" stroke="#8B6450" stroke-width="3" fill="none" stroke-linecap="round"/>
  <rect x="40" y="84" width="70" height="46" rx="8" fill="#FBF7EF" fill-opacity=".85" stroke="#7FA9C9" stroke-width="2"/>
  ${text(75, 114, 'FLOUR', 17, '#5E86AE', 600)}<path d="M75 92 V102 M70 95 l5 4 5 -4" stroke="#C9A35A" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M26 70 Q22 110 26 146" stroke="#fff" stroke-width="5" opacity=".3" fill="none" stroke-linecap="round"/>
  <ellipse cx="120" cy="164" rx="22" ry="5" fill="#fff" opacity=".8"/>`);

const puff = (api, x, y, n = 3, tint = '#FFFFFF') => {
  for (let i = 0; i < n; i++) {
    api.later(() => api.effect(x + (i - 1) * 34, y - i * 10, 'wx-puff', `<svg viewBox="0 0 120 90" width="120" height="90"><path d="M20 70 Q4 66 10 50 Q8 30 30 32 Q38 10 62 16 Q86 8 94 32 Q116 34 110 56 Q114 74 94 72 Z" fill="${tint}" opacity=".92"/></svg>`, 1300), i * 120);
  }
};

const bump = (it, cls) => { it.el.classList.remove(cls); void it.el.offsetWidth; it.el.classList.add(cls); };

export const BAKERY = {
  id: 'bakery', title: 'Snowflake Bakery 🥐', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, avatar: [440, 470],
  frame: 'linear-gradient(#F3E6CC 69%, #CBA27A 69%)',
  bg,
  stars: [{ id: 'bakery-sack', x: 82, y: 742 }],
  characters: [{
    id: 'baker', s: 0.97, x: 990, y: 458,
    look: { ...NPC_WINTER.juno, hairStyle: 'bob', hair: '#8B6450', skin: '#E9C3A3', eyes: '#4E9B5A', glasses: 'none', hat: 'none', top: 'sweater', topColor: '#FFFFFF', collar: 'round', neck: 'scarf', neckColor: '#9EDDD4', bottom: 'skirt', bottomColor: '#7A64B0', socks: 'knee', socksColor: '#FBEFB4', shoes: 'boots', shoesColor: '#8B6450' },
    say: ["Welcome! I'm Hanna the baker 🥐", 'Tap the oven to bake something warm!', 'Want to decorate a cake? Try the table 🎂', 'Careful with the flour… poof! ☁️'],
  }],
  items: [
    { id: 'oven', x: 50, y: 170, w: 380, h: 470, drag: false, data: { busy: false, n: 0 },
      onTap: (it, api) => {
        if (it.data.busy) { api.bubble(it.x + 190, it.y + 40, 'Almost ready… ⏲️'); return; }
        if (ovenCount(api) >= 4) { api.bubble(it.x + 190, it.y + 40, 'Share the treats first! 🥐'); return; }
        it.data.busy = true; it.el.classList.add('wx-baking'); api.sfx.click();
        api.bubble(it.x + 190, it.y + 40, 'Into the oven… ⏲️');
        api.later(() => {
          it.el.classList.remove('wx-baking'); it.data.busy = false;
          const kind = OVEN_ORDER[it.data.n++ % OVEN_ORDER.length];
          const k = ovenCount(api);
          const f = baked(api, kind, it.x + 70 + (k % 3) * 90, it.y + 300 + Math.floor(k / 3) * 70);
          api.sfx.win(); api.sparkle(f.x + f.w / 2, f.y + 20, ['✨', '🔥', '💛']);
          api.bubble(it.x + 190, it.y + 40, { bread: 'Fresh bread! 🍞', pie: 'Blueberry pie! 🥧', cinnamon: 'Cinnamon rolls! 😋' }[kind] + ' Give it to a friend');
        }, 2200);
      },
      art: ovenArt },
    { id: 'clock', x: 486, y: 116, w: 96, h: 170, drag: false,
      onTap: (it, api) => { bump(it, 'boing'); api.sfx.click(); api.bubble(it.x + 48, it.y - 6, ['Tick tock… treat o’clock! 🕰️', 'Bong! Time for cinnamon rolls!', 'Tick tock ⏰'][Math.floor(Math.random() * 3)]); },
      art: () => svg(96, 170, `<defs><linearGradient id="bk-clockwood" x1="0" x2="1"><stop offset="0" stop-color="#9E7450"/><stop offset=".4" stop-color="#C99772"/><stop offset="1" stop-color="#8E6745"/></linearGradient></defs>
        <path d="M10 60 Q10 6 48 4 Q86 6 86 60 V160 Q86 166 80 166 H16 Q10 166 10 160 Z" fill="url(#bk-clockwood)" stroke="${INK}" stroke-width="2.2"/>
        <circle cx="48" cy="50" r="30" fill="#FBF7EF" stroke="${INK}" stroke-width="2.2"/><circle cx="48" cy="50" r="25" fill="none" stroke="#E2D8C4" stroke-width="1.5"/>
        <g fill="#7A64B0">${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<circle cx="${(48 + Math.cos(a) * 22).toFixed(1)}" cy="${(50 + Math.sin(a) * 22).toFixed(1)}" r="${i % 3 ? 1.3 : 2.2}"/>`; }).join('')}</g>
        <path d="M48 50 L48 34 M48 50 L60 56" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><circle cx="48" cy="50" r="2.5" fill="${INK}"/>
        <rect x="24" y="90" width="48" height="64" rx="8" fill="#3A3150" stroke="${INK}" stroke-width="2"/>
        <g class="wx-pendulum"><path d="M48 92 V136" stroke="url(#bk-brass)" stroke-width="2.5"/><path d="M48 92 V136" stroke="#D9B36A" stroke-width="2.5"/><circle cx="48" cy="140" r="9" fill="#E9C77E" stroke="${INK}" stroke-width="1.8"/></g>
        <path d="M30 96 L42 148" stroke="#fff" stroke-width="3" opacity=".15"/><path d="M18 30 Q22 14 36 10" stroke="#fff" stroke-width="2.5" opacity=".35" fill="none"/>`) },
    { id: 'herbs', x: 664, y: 250, w: 64, h: 78, art: () => svg(64, 78, `
      <g stroke="#5E9C7E" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M32 46 Q26 26 18 8"/><path d="M32 46 Q34 22 32 2"/><path d="M32 46 Q40 26 48 10"/></g>
      <g fill="#86C2A2">${[[20, 12], [24, 22], [28, 32], [32, 6], [33, 18], [33, 30], [46, 14], [42, 24], [38, 34]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="3.2" ry="6" transform="rotate(${i % 2 ? 30 : -30} ${x} ${y})"/>`).join('')}</g>
      <path d="M12 44 H52 L46 74 H18 Z" fill="#7FC4BC" stroke="${INK}" stroke-width="2"/><rect x="9" y="40" width="46" height="9" rx="3" fill="#A9E2D8" stroke="${INK}" stroke-width="2"/><path d="M20 52 V70" stroke="#fff" stroke-width="3" opacity=".35"/>`) },
    { id: 'cat', x: 840, y: 270, w: 96, h: 56, cls: 'squish',
      onTap: (it, api) => { bump(it, 'boing'); api.sfx.boing(); api.bubble(it.x + 48, it.y - 6, ['Purrr… 💤', '*stretches* Mrrrow?', 'Zzz… warm window…'][Math.floor(Math.random() * 3)]); },
      art: () => svg(96, 56, `<defs><radialGradient id="bk-cat" cx=".45" cy=".35" r=".7"><stop offset="0" stop-color="#C9C3DD"/><stop offset="1" stop-color="#948DB0"/></radialGradient></defs>
        ${shadow(48, 52, 42, 4)}<path class="tail" d="M78 44 Q96 40 90 24" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/><path class="tail" d="M78 44 Q96 40 90 24" stroke="#A9A3C4" stroke-width="5" fill="none" stroke-linecap="round"/>
        <ellipse cx="52" cy="38" rx="34" ry="16" fill="url(#bk-cat)" stroke="${INK}" stroke-width="2"/>
        <path d="M44 24 Q48 34 44 44 M56 23 Q60 34 57 46 M68 26 Q71 36 69 46" stroke="#857EA3" stroke-width="2" fill="none" opacity=".6"/>
        <circle cx="24" cy="36" r="14" fill="url(#bk-cat)" stroke="${INK}" stroke-width="2"/><path d="M14 28 L12 16 L22 24 M30 23 L36 14 L36 27" fill="#A9A3C4" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M17 36 q3 2 6 0 M26 36 q3 2 6 0" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M22 41 l2 1.4 2 -1.4" stroke="${INK}" stroke-width="1.2" fill="none"/>
        <ellipse cx="34" cy="48" rx="9" ry="4" fill="#DAD5EA" stroke="${INK}" stroke-width="1.5"/>`) },
    { id: 'table', x: 600, y: 450, w: 440, h: 260, drag: false,
      onTap: (it, api) => cakeGame(api, it),
      art: tableArt },
    { id: 'jar', x: 612, y: 398, w: 80, h: 110,
      onTap: (it, api) => {
        if (api.count('cookie') >= 3) { api.bubble(it.x + 40, it.y - 6, 'Eat those cookies first! 🍪'); return; }
        bump(it, 'boing'); api.sfx.pop(); baked(api, 'cookie', it.x + 10 + api.count('cookie') * 30, it.y - 60);
        api.bubble(it.x + 40, it.y - 70, 'A snowflake cookie! ❄️');
      },
      art: () => svg(80, 110, `<defs><linearGradient id="bk-glass" x1="0" x2="1"><stop offset="0" stop-color="#CFE3F0" stop-opacity=".85"/><stop offset=".3" stop-color="#FFFFFF" stop-opacity=".7"/><stop offset="1" stop-color="#BBD3E4" stop-opacity=".85"/></linearGradient></defs>
        ${shadow(40, 106, 34, 4)}<path d="M10 34 Q8 30 14 28 H66 Q72 30 70 34 V96 Q70 106 60 106 H20 Q10 106 10 96 Z" fill="url(#bk-glass)" stroke="${INK}" stroke-width="2"/>
        ${[[26, 92], [50, 94], [38, 76], [22, 62], [56, 70], [40, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#D9A86C" stroke="#A8743E" stroke-width="1.4"/><circle cx="${x - 3}" cy="${y - 2}" r="1.8" fill="#7A4A30"/><circle cx="${x + 4}" cy="${y + 3}" r="1.6" fill="#7A4A30"/>`).join('')}
        <path d="M18 40 V96" stroke="#fff" stroke-width="4" opacity=".55" stroke-linecap="round"/>
        <rect x="8" y="16" width="64" height="16" rx="6" fill="#C99772" stroke="${INK}" stroke-width="2"/><ellipse cx="40" cy="14" rx="12" ry="6" fill="#A87A5A" stroke="${INK}" stroke-width="2"/>`) },
    { id: 'mixer', x: 700, y: 372, w: 120, h: 140,
      onTap: (it, api) => { it.el.classList.add('cooking'); api.sfx.pour(); api.bubble(it.x + 60, it.y - 6, 'Whirrr… mixing the batter!'); api.later(() => it.el.classList.remove('cooking'), 1800); },
      art: () => svg(120, 140, `<defs><linearGradient id="bk-mix" x1="0" x2="1"><stop offset="0" stop-color="#5FA7A0"/><stop offset=".35" stop-color="#A9E2D8"/><stop offset="1" stop-color="#4E968F"/></linearGradient></defs>
        ${shadow(60, 136, 50, 5)}<g class="steam-big"><path class="ln" stroke="#fff" stroke-width="3" d="M44 70 q-6 -8 0 -16 M76 70 q-6 -8 0 -16"/></g>
        <rect x="14" y="118" width="92" height="18" rx="7" fill="url(#bk-mix)" stroke="${INK}" stroke-width="2"/>
        <path d="M80 120 V50 Q80 30 64 26 H40 Q16 26 14 46 Q14 62 34 64 H66 V120 Z" fill="url(#bk-mix)" stroke="${INK}" stroke-width="2"/>
        <path d="M44 64 V82" stroke="#AEB8C8" stroke-width="4"/>
        <path d="M22 82 H74 Q72 116 48 118 Q24 116 22 82 Z" fill="url(#bk-steel)" stroke="${INK}" stroke-width="2"/><ellipse cx="48" cy="82" rx="26" ry="5" fill="#FFF5DD" stroke="${INK}" stroke-width="1.6"/>
        <path d="M24 34 Q34 30 50 30" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/><circle cx="72" cy="44" r="4" fill="url(#bk-brass)" stroke="${INK}" stroke-width="1.4"/>`) },
    { id: 'rollingpin', x: 820, y: 528, w: 150, h: 40,
      onTap: (it, api) => { bump(it, 'wx-roll'); api.sfx.drop(); api.bubble(it.x + 75, it.y - 10, 'Roll, roll, roll the dough!'); },
      art: () => svg(150, 40, `<defs><linearGradient id="bk-pin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0D2A8"/><stop offset=".45" stop-color="#E2B888"/><stop offset="1" stop-color="#B8885E"/></linearGradient></defs>
        ${shadow(75, 36, 62, 4)}<rect x="4" y="15" width="26" height="10" rx="5" fill="#C99772" stroke="${INK}" stroke-width="2"/><rect x="120" y="15" width="26" height="10" rx="5" fill="#C99772" stroke="${INK}" stroke-width="2"/>
        <rect x="28" y="6" width="94" height="28" rx="12" fill="url(#bk-pin)" stroke="${INK}" stroke-width="2"/><path d="M36 13 H112" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>
        <g fill="#fff" opacity=".85"><circle cx="58" cy="26" r="1.6"/><circle cx="86" cy="22" r="1.3"/></g>`) },
    { id: 'sack', x: 40, y: 680, w: 150, h: 170,
      onTap: (it, api) => { bump(it, 'shake'); api.sfx.boing(); puff(api, it.x + 75, it.y + 20); api.bubble(it.x + 75, it.y - 30, 'Poof! A flour cloud ☁️'); },
      art: sackArt },
    { id: 'sack2', x: 196, y: 726, w: 120, h: 136,
      onTap: (it, api) => { bump(it, 'shake'); api.sfx.boing(); puff(api, it.x + 60, it.y + 10, 2); api.bubble(it.x + 60, it.y - 30, 'Achoo! 🤧'); },
      art: sackArt },
    { id: 'case', x: 1150, y: 410, w: 420, h: 300, drag: false,
      onTap: (it, api) => {
        const kinds = ['croissant', 'macaron', 'donut'];
        if (kinds.reduce((n, k) => n + api.count(k), 0) >= 3) { api.bubble(it.x + 210, it.y - 10, 'Enjoy those pastries first! 🥐'); return; }
        it.data.n = (it.data.n || 0) + 1;
        const kind = kinds[it.data.n % 3];
        api.sfx.pop(); food(api, kind, it.x + 40 + (it.data.n % 3) * 110, it.y + 200);
        api.bubble(it.x + 210, it.y - 10, { croissant: 'A buttery croissant! 🥐', macaron: 'A mint macaron! 💚', donut: 'A frosted donut! 🍩' }[kind]);
      },
      art: () => svg(420, 300, `<defs>
          <linearGradient id="bk-case-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4F1F9" stop-opacity=".55"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity=".18"/><stop offset="1" stop-color="#CFE3F0" stop-opacity=".5"/></linearGradient>
          <linearGradient id="bk-case-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6AC82"/><stop offset="1" stop-color="#A57B55"/></linearGradient>
          <linearGradient id="bk-case-back" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF5E8"/><stop offset="1" stop-color="#EFE3CB"/></linearGradient></defs>
        ${shadow(210, 294, 206, 9, 0.18)}
        <rect x="10" y="166" width="400" height="128" rx="6" fill="url(#bk-case-wood)" stroke="${INK}" stroke-width="2.4"/>
        ${[24, 156, 288].map((x) => `<rect x="${x}" y="182" width="108" height="96" rx="6" fill="none" stroke="#8E6745" stroke-width="2"/><path d="M${x + 6} 274 V186 H${x + 102}" stroke="#E9C9A2" stroke-width="2" fill="none" opacity=".7"/>`).join('')}
        <rect x="20" y="20" width="380" height="146" fill="url(#bk-case-back)" stroke="${INK}" stroke-width="2"/>
        <path d="M22 70 H398 M22 118 H398" stroke="#C9DCEA" stroke-width="4"/>
        ${[60, 150, 240, 330].map((x, i) => `<g transform="translate(${x - 34} 36) scale(.7)"><path d="M6 46 Q4 26 22 20 Q30 4 48 6 Q66 4 74 20 Q92 26 90 46 Q72 36 48 38 Q24 36 6 46 Z" fill="${i % 2 ? '#E9B970' : '#F0C27A'}" stroke="${INK}" stroke-width="2.4"/><path d="M28 22 Q34 30 30 38 M48 10 V36 M68 22 Q62 30 66 38" stroke="#C98E4E" stroke-width="2" fill="none"/></g>`).join('')}
        ${[50, 92, 134, 196, 238, 280, 330, 372].map((x, i) => { const c = ['#CDBDF0', '#A9E2D8', '#F6E39A', '#BFDDF6'][i % 4]; return `<g transform="translate(${x} 100)"><ellipse cx="0" cy="8" rx="16" ry="7" fill="${c}" stroke="${INK}" stroke-width="1.6"/><rect x="-15" y="0" width="30" height="5" fill="#FBF7EF"/><ellipse cx="0" cy="-1" rx="16" ry="7" fill="${c}" stroke="${INK}" stroke-width="1.6"/></g>`; }).join('')}
        ${[70, 170, 270, 360].map((x, i) => i % 2 ? `<g transform="translate(${x} 146)"><ellipse cx="0" cy="0" rx="26" ry="12" fill="#E2B272" stroke="${INK}" stroke-width="1.8"/><ellipse cx="0" cy="-3" rx="20" ry="8" fill="#CDBDF0"/><ellipse cx="0" cy="-3" rx="6" ry="3" fill="#FBF5E8" stroke="${INK}" stroke-width="1.2"/></g>`
          : `<g transform="translate(${x} 146)"><ellipse cx="0" cy="0" rx="24" ry="12" fill="#D79F5E" stroke="${INK}" stroke-width="1.8"/><path d="M0 0 m-3 0 a3 2 0 1 1 6 0 a8 5 0 1 1 -16 0 a14 9 0 1 1 28 0" fill="none" stroke="#9A5E33" stroke-width="2.2"/></g>`).join('')}
        <rect x="20" y="20" width="380" height="146" fill="url(#bk-case-glass)"/>
        <path d="M60 160 L140 26 M90 160 L160 40 M300 160 L370 40" stroke="#fff" stroke-width="7" opacity=".28" stroke-linecap="round"/>
        <rect x="20" y="20" width="380" height="146" fill="none" stroke="#C9A35A" stroke-width="4"/>
        <rect x="6" y="8" width="408" height="16" rx="5" fill="url(#bk-case-wood)" stroke="${INK}" stroke-width="2.2"/>
        ${tag(210, 228, 'Tap for a pastry', 190)}`) },
    { id: 'basket', x: 1176, y: 338, w: 150, h: 84,
      onTap: (it, api) => {
        if (api.count('pretzel') >= 2) { api.bubble(it.x + 75, it.y - 6, 'One pretzel at a time! 🥨'); return; }
        api.sfx.pop(); baked(api, 'pretzel', it.x + 160 + api.count('pretzel') * 60, it.y - 20);
        api.bubble(it.x + 75, it.y - 6, 'A warm pretzel! 🥨');
      },
      art: () => svg(150, 84, `<defs><linearGradient id="bk-wicker" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6C08A"/><stop offset="1" stop-color="#B98A55"/></linearGradient></defs>
        <g transform="rotate(-14 60 30)"><rect x="20" y="4" width="96" height="20" rx="10" fill="#E2AE68" stroke="${INK}" stroke-width="2"/><path d="M40 8 l6 12 M60 8 l6 12 M80 8 l6 12" stroke="#F6DCA8" stroke-width="3" stroke-linecap="round"/></g>
        <g transform="rotate(10 90 30)"><rect x="40" y="10" width="96" height="18" rx="9" fill="#D99D58" stroke="${INK}" stroke-width="2"/><path d="M62 13 l6 11 M84 13 l6 11 M106 13 l6 11" stroke="#F6DCA8" stroke-width="3" stroke-linecap="round"/></g>
        <path d="M8 34 H142 L130 80 H20 Z" fill="url(#bk-wicker)" stroke="${INK}" stroke-width="2"/>
        <g stroke="#9E7046" stroke-width="1.6" opacity=".7" fill="none">${[46, 58, 70].map((y) => `<path d="M${10 + (y - 34) * 0.25} ${y} H${140 - (y - 34) * 0.25}"/>`).join('')}${Array.from({ length: 9 }, (_, i) => `<path d="M${22 + i * 14} 36 V78"/>`).join('')}</g>
        <rect x="2" y="30" width="146" height="8" rx="3" fill="#C99772" stroke="${INK}" stroke-width="2"/><path d="M20 34 H120" stroke="#fff" stroke-width="2" opacity=".4"/>`) },
    { id: 'bell', x: 1488, y: 360, w: 70, h: 62,
      onTap: (it, api) => { bump(it, 'punch'); api.sfx.click(); api.sparkle(it.x + 35, it.y + 10, ['🔔', '✨']); api.bubble(it.x + 35, it.y - 6, 'Ding! What would you like? ✨'); },
      art: () => svg(70, 62, `${shadow(35, 58, 30, 4)}<rect x="4" y="46" width="62" height="12" rx="4" fill="#C99772" stroke="${INK}" stroke-width="2"/>
        <path d="M10 46 Q10 14 35 14 Q60 14 60 46 Z" fill="url(#bk-brass)" stroke="${INK}" stroke-width="2"/><path d="M30 6 h10 v8 h-10 z" fill="#C39A52" stroke="${INK}" stroke-width="1.8"/>
        <path d="M18 38 Q18 22 32 20" stroke="#fff" stroke-width="3" opacity=".6" fill="none" stroke-linecap="round"/>`) },
  ],
};
