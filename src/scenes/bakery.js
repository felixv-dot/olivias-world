// Snowflake Bakery — isometric dollhouse version: bake bread, pie and cinnamon rolls in the oven, decorate a cake
// at the marble island, take a pastry from the display case, puff flour out of the sacks, a sleepy cat and Hanna the baker.
import { room, roomShell, isoItem, at, shades, proj, isoDef, wallDef } from '../iso.js';
import { INK, svg, text, starPath, pine, food, NPC_WINTER } from './common.js';
import { darker, lighter } from '../avatar.js';
import { CLIMATES } from '../ui.js';

const R = room({ cols: 9, rows: 8, ox: 768, oy: 312, wallH: 280 });
R.charScale = 0.6;

const WOOD = '#C99A6C', WOOD_D = '#8B6450', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', SKY = '#9CC8EE', SUN = '#F5DE7A';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4"';
const O2 = 'class="o" style="stroke-width:2"';
const pp = (arr) => arr.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ');
const P = (u, v, z, fn, w = 0.1, d = 0.1) => ({ svg: fn(...at(u, v, z)), u, v, z, w, d });
const shadow = (cx, cy, rx, ry = 10, op = 0.14) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${INK}" opacity="${op}"/>`;
const flake = (x, y, r, col = '#fff', sw = 2) => `<g stroke="${col}" stroke-width="${sw}" stroke-linecap="round">${[0, 60, 120].map((a) => {
  const dx = Math.cos((a * Math.PI) / 180) * r, dy = Math.sin((a * Math.PI) / 180) * r;
  return `<path d="M${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)} L${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}"/>`;
}).join('')}</g>`;
const bump = (it, cls) => { it.el.classList.remove(cls); void it.el.offsetWidth; it.el.classList.add(cls); };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clampG = (gx, gy, f = 0.3) => ({ gx: Math.max(0, Math.min(R.cols - f, gx)), gy: Math.max(0, Math.min(R.rows - f, gy)) });

// ---------- background: backdrop + bakery shell (plaster walls, tiled band, checker floor) ----------
const bg = ({ weather }) => {
  const snow = weather !== 'clear';
  const [lx] = proj(R, 0, R.rows), [rx] = proj(R, R.cols, 0), [, fy] = proj(R, R.cols, R.rows);
  const band = (side, z0, z1) => side === 'R'
    ? pp([proj(R, 0, 0, z0), proj(R, R.cols, 0, z0), proj(R, R.cols, 0, z1), proj(R, 0, 0, z1)])
    : pp([proj(R, 0, R.rows, z0), proj(R, 0, 0, z0), proj(R, 0, 0, z1), proj(R, 0, R.rows, z1)]);
  return svg(1600, 900, `
  <defs>
    <radialGradient id="bk-bd" cx="50%" cy="55%" r="70%"><stop offset="0" stop-color="#FBF7F0"/><stop offset="1" stop-color="#E6DDEE"/></radialGradient>
    <pattern id="bk-wl" width="90" height="90" patternUnits="userSpaceOnUse" patternTransform="matrix(1,-0.5,0,1,0,0)"><rect width="90" height="90" fill="#F7EEDC"/><circle cx="12" cy="20" r="1.6" fill="#E8D7B9"/><circle cx="60" cy="50" r="1.3" fill="#EADBC0"/><circle cx="34" cy="76" r="1.8" fill="#E5D3B3"/></pattern>
    <pattern id="bk-wr" width="90" height="90" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,0,1,0,0)"><rect width="90" height="90" fill="#F1E6D2"/><circle cx="12" cy="20" r="1.6" fill="#E3D0AE"/><circle cx="60" cy="50" r="1.3" fill="#E5D4B6"/><circle cx="34" cy="76" r="1.8" fill="#E0CCA8"/></pattern>
    <pattern id="bk-tl" width="32" height="24" patternUnits="userSpaceOnUse" patternTransform="matrix(1,-0.5,0,1,0,0)"><rect width="32" height="24" fill="#FFFFFF"/><rect x="1.5" y="1.5" width="29" height="21" rx="3" fill="#D9EAF4"/><path d="M5 5 H16" stroke="#fff" stroke-width="2" opacity=".8"/></pattern>
    <pattern id="bk-tr" width="32" height="24" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,0,1,0,0)"><rect width="32" height="24" fill="#F4F8FB"/><rect x="1.5" y="1.5" width="29" height="21" rx="3" fill="#CFE2EE"/><path d="M5 5 H16" stroke="#fff" stroke-width="2" opacity=".8"/></pattern>
    <pattern id="bk-fl" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="matrix(64,32,-64,32,${R.ox},${R.oy})"><rect width="2" height="2" fill="#F3EADB"/><rect width="1" height="1" fill="#CFE0EC"/><rect x="1" y="1" width="1" height="1" fill="#CFE0EC"/></pattern>
    <linearGradient id="bk-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".6"/><stop offset="1" stop-color="#FFF6DA" stop-opacity="0"/></linearGradient>
    <radialGradient id="bk-warm"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".45"/><stop offset="1" stop-color="#FFD9A0" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bk-bd)"/>
  ${snow ? `<g fill="#fff" opacity=".9">${Array.from({ length: 64 }, (_, i) => `<circle cx="${(i * 97 + 41) % 1600}" cy="${(i * 61 + 23) % 900}" r="${2 + (i % 3)}"/>`).join('')}</g>` : '<circle cx="1440" cy="110" r="120" fill="#FFF6D2" opacity=".35"/><circle cx="1440" cy="110" r="54" fill="#FFF3C4" opacity=".9"/>'}
  <ellipse cx="${(lx + rx) / 2}" cy="${fy + 6}" rx="580" ry="46" fill="#3E3252" opacity=".10"/>
  ${roomShell(R, { floor: '#F3EADB', floorPattern: 'bk-fl', wallL: '#F7EEDC', wallR: '#F1E6D2', wallPatternL: 'bk-wl', wallPatternR: 'bk-wr', base: '#C9A57C' })}
  <polygon points="${band('L', 18, 128)}" fill="url(#bk-tl)"/><polygon points="${band('R', 18, 128)}" fill="url(#bk-tr)"/>
  <polygon points="${band('L', 128, 136)}" fill="#E9D9BE" ${line}/><polygon points="${band('R', 128, 136)}" fill="#E2D0B2" ${line}/>
  <polygon points="${pp([proj(R, 0, R.rows), proj(R, 0, 0), proj(R, R.cols, 0), proj(R, R.cols, 0.6), proj(R, 0.6, 0.6), proj(R, 0.6, R.rows)])}" fill="#3E3252" opacity=".06"/>
  <polygon points="${pp([proj(R, 3.0, 0.05), proj(R, 5.2, 0.05), proj(R, 6.8, 3.0), proj(R, 4.6, 3.0)])}" fill="url(#bk-light)" opacity="${snow ? 0.4 : 1}"/>
  <ellipse cx="${proj(R, 1.9, 1.6)[0]}" cy="${proj(R, 1.9, 1.6)[1]}" rx="190" ry="96" fill="url(#bk-warm)"/>`);
};

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
// In the isometric bakery treats land on a surface: spot = { gx, gy, gz }.
function baked(api, kind, spot) {
  const f = BAKED[kind], k = 0.8;
  return api.add({
    id: api.uid(kind), x: 0, y: 0, w: f.w * k, h: f.h * k, cls: 'food', small: true,
    gx: spot.gx, gy: spot.gy, gz: spot.gz || 0, fw: 0.3, fd: 0.3, ax: (f.w * k) / 2, ay: f.h * k - 4,
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
      const top = table.def.surface || 0;
      const it = api.add({
        id: api.uid('cake'), x: 0, y: 0, w: 96, h: 87, cls: 'food', small: true,
        gx: table.gx + 1.85 - (n % 3) * 0.5, gy: table.gy + 0.5, gz: top, fw: 0.36, fd: 0.36, ax: 48, ay: 83,
        art: () => svg(220, 200, cakeBody(design, u)),
        onGive: (i, a, who) => a.eat(i, who, 'The most beautiful cake! 🎂', ['🎂', '✨', '💜']),
      }, { spawned: true });
      api.sparkle(it.x + 48, it.y + 40, ['✨', '🎂', '⭐']);
      api.bubble(it.x + 48, it.y - 20, 'What a cake! Give it to a friend 🎂');
      api.earn(10); if (!api.starFound('bakery-cake')) api.addStar('bakery-cake', 0, 0, { spawned: true, gx: table.gx + 1.3, gy: table.gy + 0.05, gz: top });
    };
    refresh();
  });
}


// ---------- windows & wall things ----------
const windowBody = (it, sp, api) => {
  const snow = api?.state.winterWeather !== 'clear';
  const w = sp.len, h = 150;
  return `<rect width="${w}" height="${h}" rx="6" fill="${snow ? '#B7C2DA' : '#BFE3FA'}" ${line}/>
    ${snow ? '' : `<circle cx="${w * 0.76}" cy="36" r="16" fill="#FFF6D2"/><path d="M12 44 q12 -12 26 -4 q10 -10 24 0 q12 0 10 10 z" fill="#fff" opacity=".9"/>`}
    <path d="M0 ${h * 0.68} Q${w * 0.3} ${h * 0.56} ${w * 0.6} ${h * 0.66} T${w} ${h * 0.6} V${h} H0 Z" fill="#fff"/>
    ${pine(w * 0.24, h * 0.3, 0.3)}${pine(w * 0.72, h * 0.38, 0.24)}
    ${snow ? Array.from({ length: 16 }, (_, i) => `<circle cx="${(6 + (i * 41) % (w - 12)).toFixed(1)}" cy="${8 + (i * 59) % (h - 30)}" r="${2 + (i % 3)}" fill="#fff"/>`).join('') : ''}
    <path d="M${w / 2} 0 V${h} M0 ${h / 2} H${w}" stroke="${CREAM}" stroke-width="6"/>
    <rect x="-6" y="${h - 4}" width="${w + 12}" height="12" rx="3" fill="${CREAM}" ${line}/>
    <path d="M-12 -8 H${w + 12} V14 Q${w * 0.75} 30 ${w / 2} 14 Q${w * 0.25} 30 -12 14 Z" fill="#C9B8F2" ${line}/>
    <path d="M-12 14 Q${w * 0.25} 30 ${w / 2} 14 Q${w * 0.75} 30 ${w + 12} 14" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>`;
};
const breadShelf = (it, sp) => {
  const L = sp.len;
  const loaf = (x, y, c = '#D99A55') => `<path d="M${x - 18} ${y} Q${x - 20} ${y - 18} ${x} ${y - 20} Q${x + 20} ${y - 18} ${x + 18} ${y} Z" fill="${c}" ${line}/><path d="M${x - 8} ${y - 15} l4 8 M${x} ${y - 17} l4 8 M${x + 8} ${y - 15} l4 8" stroke="#F6DCA8" stroke-width="2.5" stroke-linecap="round"/>`;
  const roll = (x, y) => `<ellipse cx="${x}" cy="${y - 7}" rx="10" ry="8" fill="#E2AE68" ${line}/><path d="M${x - 4} ${y - 12} q4 4 8 0" stroke="#F6DCA8" stroke-width="2" fill="none"/>`;
  return `<rect y="46" width="${L}" height="9" rx="2" fill="${WOOD}" ${line}/><rect y="100" width="${L}" height="9" rx="2" fill="${WOOD}" ${line}/>
    ${loaf(24, 46)}${loaf(64, 46, '#C98A48')}${loaf(104, 46)}
    <path d="M${L - 34} 46 L${L - 22} 6 M${L - 26} 46 L${L - 8} 10" stroke="#3E3252" stroke-opacity=".5" stroke-width="9" stroke-linecap="round"/><path d="M${L - 34} 46 L${L - 22} 6 M${L - 26} 46 L${L - 8} 10" stroke="#E2AE68" stroke-width="6" stroke-linecap="round"/>
    ${roll(18, 100)}${roll(40, 100)}${roll(62, 100)}${roll(29, 88)}${roll(51, 88)}
    <rect x="${L - 60}" y="72" width="44" height="28" rx="5" fill="#E6C08A" ${line}/><path d="M${L - 58} 82 H${L - 18} M${L - 58} 91 H${L - 18}" stroke="#B98A55" stroke-width="1.6"/>`;
};
const menuBoard = (it, sp) => {
  const L = sp.len;
  return `<rect width="${L}" height="120" rx="6" fill="#3E4A52" stroke="${WOOD}" stroke-width="7"/>
    ${text(L / 2, 30, 'Snowflake', 17, '#FBF7EF')}${text(L / 2, 50, 'Bakery', 17, SUN)}
    ${flake(18, 22, 7, '#9EDDD4', 2)}${flake(L - 18, 22, 7, '#9EDDD4', 2)}
    <g font-family="Fredoka, sans-serif" font-size="11" fill="#E6EEF2">${[['Bread', '🍞'], ['Pie', '🥧'], ['Cookies', '🍪'], ['Cake', '🎂']].map(([t], i) => `<text x="16" y="${70 + i * 13}">${t}</text><text x="${L - 16}" y="${70 + i * 13}" text-anchor="end">★</text><path d="M${16 + t.length * 6} ${66 + i * 13} H${L - 28}" stroke="#E6EEF2" stroke-width="1" stroke-dasharray="1 3"/>`).join('')}</g>`;
};
const jarShelf = (it, sp) => {
  const L = sp.len;
  return `<rect y="74" width="${L}" height="9" rx="2" fill="${WOOD}" ${line}/><path d="M16 83 L16 98 L30 83 M${L - 16} 83 L${L - 16} 98 L${L - 30} 83" fill="none" stroke="${WOOD_D}" stroke-width="3"/>
    ${[[10, 'FLOUR', CREAM], [44, 'SUGAR', '#FFFFFF'], [78, '', '#C9B8F2']].map(([x, l, c]) => `<rect x="${x}" y="30" width="28" height="44" rx="6" fill="#EAF3F9" ${line}/><rect x="${x + 3}" y="46" width="22" height="25" rx="4" fill="${c}"/>
      ${c === '#C9B8F2' ? `<g fill="#9EDDD4">${[0, 1, 2].map((k) => `<circle cx="${x + 8 + k * 6}" cy="${56 + (k % 2) * 6}" r="2.6"/>`).join('')}</g>` : ''}<rect x="${x - 1}" y="24" width="30" height="8" rx="3" fill="#C99772" ${line}/>
      ${l ? `<text x="${x + 14}" y="44" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="6.5" fill="#7A64B0">${l}</text>` : ''}`).join('')}
    <g transform="translate(${L - 34} 74)"><path d="M-14 0 H14 L8 -6 H-8 Z" fill="#E7E2EF" ${line}/><path d="M-10 -6 Q0 -46 10 -6 Z" fill="#E8F2F8" fill-opacity=".8" ${line}/><circle cx="0" cy="-30" r="3" fill="#C99772"/></g>`;
};
const clockBody = (it, sp) => {
  const L = sp.len, c = L / 2;
  return `<defs><linearGradient id="bk-clockwood" x1="0" x2="1"><stop offset="0" stop-color="#9E7450"/><stop offset=".4" stop-color="#C99772"/><stop offset="1" stop-color="#8E6745"/></linearGradient></defs>
    <path d="M4 40 Q4 2 ${c} 2 Q${L - 4} 2 ${L - 4} 40 V146 Q${L - 4} 150 ${L - 8} 150 H8 Q4 150 4 146 Z" fill="url(#bk-clockwood)" ${line}/>
    <circle cx="${c}" cy="36" r="${c - 9}" fill="${CREAM}" ${line}/>
    <g fill="#7A64B0">${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<circle cx="${(c + Math.cos(a) * (c - 14)).toFixed(1)}" cy="${(36 + Math.sin(a) * (c - 14)).toFixed(1)}" r="${i % 3 ? 1 : 1.8}"/>`; }).join('')}</g>
    <path d="M${c} 36 V24 M${c} 36 L${c + 8} 40" stroke="#3E3252" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="${c - 13}" y="68" width="26" height="72" rx="6" fill="#3A3150" ${line}/>
    <g class="wx-pendulum"><path d="M${c} 70 V124" stroke="#D9B36A" stroke-width="2.5"/><circle cx="${c}" cy="127" r="7" fill="#E9C77E" ${line}/></g>`;
};

// ---------- the oven (fixed, bakes in turns) ----------
const oven = () => {
  const body = shades('#B7A8DE'), steel = shades('#D6DCE6'), copper = shades('#E7B08A'), brass = shades('#E2C27A');
  const D = 1.9 * 64;
  const face = `<defs><radialGradient id="bk-ovenglow" cx=".5" cy=".7" r=".7"><stop offset="0" stop-color="#FFD98A"/><stop offset=".55" stop-color="#F3A35A"/><stop offset="1" stop-color="#C8643A" stop-opacity=".25"/></radialGradient></defs>
    <rect x="6" y="5" width="${D - 12}" height="30" rx="8" fill="#CFC2EC" ${line}/>
    ${[22, D - 22].map((x) => `<circle cx="${x}" cy="20" r="8" fill="#E9C77E" ${line}/><path d="M${x} 14 V19" stroke="#3E3252" stroke-width="2" stroke-linecap="round"/>`).join('')}
    <circle cx="${D / 2}" cy="20" r="13" fill="${CREAM}" ${line}/><g class="wx-dial"><circle cx="${D / 2}" cy="20" r="12" fill="none"/><path d="M${D / 2} 20 V10" stroke="#E0843E" stroke-width="2.6" stroke-linecap="round"/></g>
    <rect x="8" y="42" width="${D - 16}" height="100" rx="10" fill="#C4B6E6" ${line}/>
    <rect x="22" y="48" width="${D - 44}" height="7" rx="3.5" fill="#E9C77E" ${line}/>
    <rect x="20" y="62" width="${D - 40}" height="62" rx="8" fill="#2C2440" ${line}/>
    <rect class="wx-glow" x="22" y="64" width="${D - 44}" height="58" rx="7" fill="url(#bk-ovenglow)"/>
    <path d="M28 110 H${D - 28}" stroke="#6E5A7E" stroke-width="2"/><path d="M38 110 Q40 96 52 95 Q64 96 66 110 Z M72 110 Q74 98 86 97 Q98 98 98 110 Z" fill="#7A4A30" opacity=".6"/>
    <g class="wx-heat"><path class="ln steam" stroke="#fff" stroke-width="2.5" opacity=".8" d="M40 92 Q35 84 40 76 M${D / 2} 92 Q${D / 2 - 5} 84 ${D / 2} 76 M${D - 40} 92 Q${D - 45} 84 ${D - 40} 76"/></g>
    <path d="M28 120 L50 66 M44 120 L62 76" stroke="#fff" stroke-width="4" opacity=".12" stroke-linecap="round"/>
    <rect x="${D / 2 - 18}" y="130" width="36" height="6" rx="3" fill="#E9C77E" ${line}/>`;
  return isoItem(1.3, 2.0, 282, [
    ...[[0.1, 0.12], [1.05, 0.12], [0.1, 1.75], [1.05, 1.75]].map(([u, v]) => ({ u, v, w: 0.14, d: 0.14, h: 10, ...brass })),
    { u: 0.05, v: 0.05, w: 1.2, d: 1.9, z: 10, h: 150, ...body, rightDecor: face,
      leftDecor: `<rect x="8" y="10" width="${1.2 * 64 - 16}" height="130" rx="8" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="3"/>${flake(1.2 * 32, 76, 14, '#fff', 3)}` },
    { u: 0, v: 0, w: 1.3, d: 2.0, z: 160, h: 8, ...steel },
    { u: 0.12, v: 0.82, w: 0.34, d: 0.34, z: 168, h: 114, ...copper, rightDecor: '<path d="M0 30 H22 M0 78 H22" stroke="#B9774E" stroke-width="4"/>' },
    P(0.75, 1.45, 168, (x, y) => `<path d="M${x - 20} ${y - 2} V${y - 26} H${x + 20} V${y - 2} Q${x} ${y + 7} ${x - 20} ${y - 2} Z" fill="#E58F6A" ${line}/><ellipse cx="${x}" cy="${y - 26}" rx="20" ry="7" fill="#F0A584" ${line}/><path d="M${x - 20} ${y - 18} h-7 M${x + 20} ${y - 18} h7" stroke="#3E3252" stroke-opacity=".6" stroke-width="3.5" stroke-linecap="round"/>`, 0.3, 0.3),
    P(0.7, 0.5, 168, (x, y) => `<path d="M${x - 30} ${y - 4} L${x + 2} ${y - 20} L${x + 34} ${y - 4} L${x + 2} ${y + 12} Z" fill="#AEB8C8" ${line}/>${[[-12, -4], [2, -10], [16, -4], [2, 2]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y + dy - 4}" rx="7" ry="5" fill="#E2AE68" ${line}/>`).join('')}`, 0.4, 0.4),
  ]);
};
const counter = () => {
  const cab = shades('#EADBC5'), top = shades('#F2EEF6');
  const D = 2.34 * 64;
  return isoItem(1.1, 2.4, 92, [
    { u: 0.03, v: 0.03, w: 1.04, d: 2.34, h: 82, ...cab,
      rightDecor: [0, 1, 2].map((k) => `<rect x="${6 + k * D / 3}" y="10" width="${D / 3 - 12}" height="64" rx="5" fill="#A9E2D8" ${line}/><circle cx="${D / 3 * (k + 0.5)}" cy="24" r="3" fill="${WOOD_D}"/>`).join('') },
    { u: 0, v: 0, w: 1.1, d: 2.4, z: 82, h: 10, ...top, topDecor: '<path d="M.2 .3 Q.5 .6 .4 1.1 T.7 2 M.8 .2 Q.6 .8 .9 1.4" stroke="#D8D0E4" stroke-width=".03" fill="none"/>' },
  ]);
};
const island = () => {
  const cab = shades('#9CC8EE', 0.8), top = shades('#F7F5FA');
  const W2 = 2.24 * 64, D2 = 1.14 * 64;
  return isoItem(2.4, 1.3, 96, [
    { u: 0.08, v: 0.08, w: 2.24, d: 1.14, h: 74, ...cab,
      leftDecor: [0, 1, 2].map((k) => `<rect x="${6 + k * W2 / 3}" y="8" width="${W2 / 3 - 12}" height="24" rx="4" fill="none" ${line}/><rect x="${W2 / 6 * (2 * k + 1) - 8}" y="18" width="16" height="4" rx="2" fill="${WOOD_D}"/>
        <rect x="${6 + k * W2 / 3}" y="38" width="${W2 / 3 - 12}" height="28" rx="4" fill="none" ${line}/>`).join(''),
      rightDecor: `<rect x="8" y="8" width="${D2 - 16}" height="58" rx="5" fill="none" ${line}/>${flake(D2 / 2, 37, 12, '#fff', 3)}` },
    { u: 0, v: 0, w: 2.4, d: 1.3, z: 74, h: 12, ...top,
      topDecor: '<path d="M.2 .3 Q.7 .5 1 .35 T2 .5 M.3 1 Q.9 .9 1.4 1.1" stroke="#D8D0E4" stroke-width=".025" fill="none"/><g fill="#fff">' + [[0.4, 0.75, 0.05], [0.7, 1.05, 0.04], [0.25, 1.05, 0.03], [0.85, 0.7, 0.03]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('') + '</g><ellipse cx=".5" cy=".95" rx=".32" ry=".2" fill="#fff" opacity=".8"/>' },
    P(0.5, 0.92, 86, (x, y) => `<defs><radialGradient id="bk-dough" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFF8E8"/><stop offset="1" stop-color="#E8D3AE"/></radialGradient></defs>
      <ellipse cx="${x}" cy="${y - 8}" rx="26" ry="14" fill="url(#bk-dough)" ${line}/><path d="M${x - 14} ${y - 14} Q${x - 4} ${y - 20} ${x + 8} ${y - 18}" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`, 0.2, 0.2),
  ]);
};
const caseArt = () => {
  const wood = shades('#D6AC82'), W2 = 3.2 * 64;
  const croissant = (x, y) => `<path d="M${x - 14} ${y} Q${x - 15} ${y - 8} ${x - 7} ${y - 10} Q${x - 3} ${y - 17} ${x + 4} ${y - 15} Q${x + 12} ${y - 14} ${x + 14} ${y} Q${x} ${y - 4} ${x - 14} ${y} Z" fill="#F0C27A" ${line}/>`;
  const mac = (x, y, c) => `<ellipse cx="${x}" cy="${y - 3}" rx="9" ry="5" fill="${c}" ${line}/><rect x="${x - 8}" y="${y - 7}" width="16" height="3" fill="${CREAM}"/><ellipse cx="${x}" cy="${y - 8}" rx="9" ry="5" fill="${c}" ${line}/>`;
  const roll = (x, y) => `<ellipse cx="${x}" cy="${y - 5}" rx="12" ry="7" fill="#D79F5E" ${line}/><path d="M${x} ${y - 5} m-2 0 a2 1.5 0 1 1 4 0 a5 3.5 0 1 1 -10 0 a8 5.5 0 1 1 16 0" fill="none" stroke="#9A5E33" stroke-width="1.6"/>`;
  const donut = (x, y) => `<ellipse cx="${x}" cy="${y - 5}" rx="12" ry="7" fill="#E2B272" ${line}/><ellipse cx="${x}" cy="${y - 7}" rx="9" ry="5" fill="#CDBDF0"/><ellipse cx="${x}" cy="${y - 7}" rx="3" ry="2" fill="${CREAM}" ${line}/>`;
  return isoItem(3.2, 1.0, 120, [
    { u: 0, v: 0, w: 3.2, d: 1.0, h: 58, ...wood,
      leftDecor: [0, 1, 2, 3].map((k) => `<rect x="${6 + k * W2 / 4}" y="10" width="${W2 / 4 - 12}" height="38" rx="5" fill="none" ${line}/>`).join(''),
      rightDecor: `<rect x="6" y="10" width="${64 - 12}" height="38" rx="5" fill="none" ${line}/>` },
    { u: 0.04, v: 0.04, w: 3.12, d: 0.92, z: 58, h: 2, top: '#FBF5E8', left: '#EFE3CB', right: '#E5D6BA' },
    P(1.6, 0.5, 60, () => {
      let s = '';
      for (let i = 0; i < 6; i++) { const [x, y] = at(0.35 + i * 0.5, 0.3, 60); s += croissant(x, y); }
      for (let i = 0; i < 9; i++) { const [x, y] = at(0.3 + i * 0.32, 0.55, 60); s += mac(x, y, ['#CDBDF0', '#A9E2D8', '#F6E39A', '#BFDDF6'][i % 4]); }
      for (let i = 0; i < 6; i++) { const [x, y] = at(0.35 + i * 0.5, 0.8, 60); s += i % 2 ? donut(x, y) : roll(x, y); }
      return s;
    }, 1, 1),
    P(3, 1, 0, () => {
      const g = (u, v, z) => at(u, v, z);
      const top = [g(0.04, 0.04, 104), g(3.16, 0.04, 104), g(3.16, 0.96, 104), g(0.04, 0.96, 104)];
      const front = [g(0.04, 0.96, 58), g(3.16, 0.96, 58), g(3.16, 0.96, 104), g(0.04, 0.96, 104)];
      const side = [g(3.16, 0.96, 58), g(3.16, 0.04, 58), g(3.16, 0.04, 104), g(3.16, 0.96, 104)];
      const [a1, a2] = [g(0.5, 0.96, 62), g(0.9, 0.96, 100)], [b1, b2] = [g(2.2, 0.96, 62), g(2.6, 0.96, 100)];
      return `<polygon points="${pp(front)}" fill="#E4F1F9" fill-opacity=".28" ${line}/><polygon points="${pp(side)}" fill="#CFE3F0" fill-opacity=".35" ${line}/>
        <polygon points="${pp(top)}" fill="#E8F4FB" fill-opacity=".35" ${line}/>
        <path d="M${a1[0]} ${a1[1]} L${a2[0]} ${a2[1]} M${b1[0]} ${b1[1]} L${b2[0]} ${b2[1]}" stroke="#fff" stroke-width="6" opacity=".45" stroke-linecap="round"/>
        <polyline points="${pp([g(0, 1, 104), g(3.2, 1, 104), g(3.2, 0, 104)])}" fill="none" stroke="#C9A35A" stroke-width="4" stroke-linejoin="round"/>`;
    }, 1, 1),
  ]);
};
const bench = () => {
  const wood = shades('#EADBC5'), cush = shades(TEAL);
  return isoItem(2.0, 0.7, 70, [
    { u: 0, v: 0, w: 2.0, d: 0.7, h: 38, ...wood, leftDecor: [0, 1].map((k) => `<rect x="${6 + k * 64}" y="8" width="52" height="22" rx="4" fill="none" ${line}/>`).join('') },
    { u: 0.04, v: 0.04, w: 1.92, d: 0.62, z: 38, h: 10, ...cush, leftDecor: '<path d="M4 4 H118" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-dasharray="4 4"/>' },
    P(1.5, 0.2, 48, (x, y) => `<path d="M${x - 22} ${y + 4} Q${x - 26} ${y - 24} ${x} ${y - 28} Q${x + 26} ${y - 24} ${x + 22} ${y + 4} Q${x} ${y + 12} ${x - 22} ${y + 4} Z" fill="${SUN}" ${line}/>${flake(x, y - 10, 7, '#fff', 2)}`, 0.3, 0.3),
  ]);
};
const proofRack = () => {
  const post = shades('#AEB8C8'), shelf = shades('#D6DCE6');
  const levels = [12, 62, 112, 162];
  return isoItem(1.2, 0.6, 214, [
    ...[[0, 0], [1.12, 0], [0, 0.52], [1.12, 0.52]].map(([u, v]) => ({ u, v, w: 0.08, d: 0.08, h: 210, ...post })),
    ...levels.map((z) => ({ u: 0.02, v: 0.02, w: 1.16, d: 0.56, z, h: 5, ...shelf })),
    { u: 0, v: 0, w: 1.2, d: 0.6, z: 206, h: 6, ...post },
  ], () => levels.map((z, k) => [0.25, 0.6, 0.95].map((u, i) => {
    const [x, y] = at(u, 0.3, z + 5);
    return k % 2 ? `<ellipse cx="${x}" cy="${y - 6}" rx="14" ry="8" fill="${['#E2AE68', '#D99A55', '#E9B970'][i]}" ${line}/><path d="M${x - 6} ${y - 9} l4 5 M${x + 1} ${y - 11} l4 5" stroke="#F6DCA8" stroke-width="2" stroke-linecap="round"/>`
      : `<path d="M${x - 16} ${y - 2} Q${x - 18} ${y - 18} ${x} ${y - 19} Q${x + 18} ${y - 18} ${x + 16} ${y - 2} Z" fill="${['#C98A48', '#E2AE68', '#D99A55'][i]}" ${line}/>`;
  }).join('')).join(''));
};
const cooler = () => {
  const c = shades('#EDE6F7'), W2 = 1.3 * 64;
  const cake = (x, y, col) => `<path d="M${x - 14} ${y} V${y - 14} H${x + 14} V${y} Z" fill="${col}" ${line}/><ellipse cx="${x}" cy="${y - 14}" rx="14" ry="4" fill="${lighter(col, 0.4)}" ${line}/><circle cx="${x}" cy="${y - 20}" r="3" fill="#6A4C93"/>`;
  return isoItem(1.3, 0.8, 214, [
    { u: 0, v: 0, w: 1.3, d: 0.8, h: 206, ...c,
      leftDecor: `<rect x="7" y="10" width="${W2 - 14}" height="150" rx="6" fill="#DDF0F6" ${line}/><rect x="7" y="10" width="${W2 - 14}" height="150" rx="6" fill="#FFF8DA" opacity=".35"/>
        ${[58, 106, 154].map((y) => `<path d="M9 ${y} H${W2 - 9}" stroke="#AEB8C8" stroke-width="3"/>`).join('')}
        ${cake(26, 58, '#CDBDF0')}${cake(58, 58, '#A9E2D8')}${cake(26, 106, '#F6E39A')}${cake(58, 106, '#BFDDF6')}${cake(42, 154, '#CDBDF0')}
        <path d="M14 18 L26 150" stroke="#fff" stroke-width="5" opacity=".4" stroke-linecap="round"/><rect x="${W2 - 18}" y="70" width="5" height="34" rx="2" fill="#AEB8C8"/>
        <rect x="7" y="168" width="${W2 - 14}" height="30" rx="5" fill="none" ${line}/>` },
    { u: -0.02, v: -0.02, w: 1.34, d: 0.84, z: 206, h: 8, ...shades('#D9CFEA') },
  ]);
};
const cafeTable = () => isoItem(0.9, 0.9, 74, [
  { u: 0.3, v: 0.3, w: 0.3, d: 0.3, h: 6, round: true, ...shades(WOOD_D) },
  { u: 0.41, v: 0.41, w: 0.08, d: 0.08, z: 6, h: 60, ...shades(WOOD_D) },
  { u: 0, v: 0, w: 0.9, d: 0.9, z: 64, h: 8, round: true, ...shades('#F2EEF6') },
]);
const stool = (col) => () => isoItem(0.55, 0.55, 58, [
  ...[[0.08, 0.08], [0.39, 0.08], [0.08, 0.39], [0.39, 0.39]].map(([u, v]) => ({ u, v, w: 0.07, d: 0.07, h: 44, ...shades(WOOD_D) })),
  { u: 0, v: 0, w: 0.55, d: 0.55, z: 44, h: 10, round: true, ...shades(col) },
]);
const rugArt = () => isoItem(2.0, 2.0, 4, [
  { u: 0, v: 0, w: 2.0, d: 2.0, h: 0, round: true, top: '#C9B8F2',
    topDecor: `<circle cx="1" cy="1" r=".78" fill="none" stroke="#fff" stroke-width=".05" stroke-dasharray=".14 .1"/><circle cx="1" cy="1" r=".5" fill="#B79CF0"/>` },
]);
const sackArt = (s) => () => isoItem(s, s, 130 * s, [P(s / 2, s / 2, 0, (x, y) => `<g transform="translate(${x} ${y}) scale(${s / 0.9})">
    <ellipse cx="4" cy="2" rx="54" ry="14" fill="#3E3252" opacity=".12"/>
    <path d="M-48 -6 Q-58 -60 -40 -96 Q0 -86 40 -96 Q58 -60 48 -6 Q0 10 -48 -6 Z" fill="#E9DCC0" ${line}/>
    <path d="M-40 -14 Q-48 -56 -34 -88" stroke="#fff" stroke-opacity=".45" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M-44 -30 Q0 -20 44 -30 M-46 -56 Q0 -46 46 -56 M-20 -90 Q-24 -40 -18 -2 M18 -90 Q22 -40 18 -2" stroke="#C8B38C" stroke-width="1.2" fill="none" opacity=".7"/>
    <path d="M-34 -94 Q-30 -118 -16 -110 Q0 -126 16 -110 Q30 -118 34 -94 Q0 -84 -34 -94 Z" fill="#F1E5CC" ${line}/>
    <path d="M-26 -96 Q0 -90 26 -96" stroke="${WOOD_D}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <rect x="-27" y="-70" width="54" height="34" rx="6" fill="${CREAM}" stroke="#7FA9C9" stroke-width="2"/>
    <text x="0" y="-48" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="600" font-size="13" fill="#5E86AE">FLOUR</text>
    <ellipse cx="44" cy="4" rx="18" ry="5" fill="#fff" opacity=".85"/></g>`, s, s)]);

// ---------- small things (sit on the counter, island, bench or case) ----------
const sprite = (fw, fd, h, fn) => () => isoItem(fw, fd, h, [P(fw / 2, fd / 2, 0, fn, fw, fd)]);
const catArt = sprite(0.7, 0.4, 60, (x, y) => `<g transform="translate(${x - 41} ${y - 46}) scale(.85)"><defs><radialGradient id="bk-cat" cx=".45" cy=".35" r=".7"><stop offset="0" stop-color="#C9C3DD"/><stop offset="1" stop-color="#948DB0"/></radialGradient></defs>
  ${shadow(48, 52, 42, 4)}<path class="tail" d="M78 44 Q96 40 90 24" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/><path class="tail" d="M78 44 Q96 40 90 24" stroke="#A9A3C4" stroke-width="5" fill="none" stroke-linecap="round"/>
  <ellipse cx="52" cy="38" rx="34" ry="16" fill="url(#bk-cat)" stroke="${INK}" stroke-width="2"/>
  <path d="M44 24 Q48 34 44 44 M56 23 Q60 34 57 46 M68 26 Q71 36 69 46" stroke="#857EA3" stroke-width="2" fill="none" opacity=".6"/>
  <circle cx="24" cy="36" r="14" fill="url(#bk-cat)" stroke="${INK}" stroke-width="2"/><path d="M14 28 L12 16 L22 24 M30 23 L36 14 L36 27" fill="#A9A3C4" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M17 36 q3 2 6 0 M26 36 q3 2 6 0" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M22 41 l2 1.4 2 -1.4" stroke="${INK}" stroke-width="1.2" fill="none"/>
  <ellipse cx="34" cy="48" rx="9" ry="4" fill="#DAD5EA" stroke="${INK}" stroke-width="1.5"/></g>`);
const herbsArt = sprite(0.35, 0.35, 70, (x, y) => `<g transform="translate(${x - 26} ${y - 60}) scale(.8)">
  <g stroke="#5E9C7E" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M32 46 Q26 26 18 8"/><path d="M32 46 Q34 22 32 2"/><path d="M32 46 Q40 26 48 10"/></g>
  <g fill="#86C2A2">${[[20, 12], [24, 22], [28, 32], [32, 6], [33, 18], [33, 30], [46, 14], [42, 24], [38, 34]].map(([a, b], i) => `<ellipse cx="${a}" cy="${b}" rx="3.2" ry="6" transform="rotate(${i % 2 ? 30 : -30} ${a} ${b})"/>`).join('')}</g>
  <path d="M12 44 H52 L46 74 H18 Z" fill="#7FC4BC" stroke="${INK}" stroke-width="2"/><rect x="9" y="40" width="46" height="9" rx="3" fill="#A9E2D8" stroke="${INK}" stroke-width="2"/><path d="M20 52 V70" stroke="#fff" stroke-width="3" opacity=".35"/></g>`);
const jarArt = sprite(0.35, 0.35, 76, (x, y) => `<g transform="translate(${x - 26} ${y - 69}) scale(.65)"><defs><linearGradient id="bk-glass" x1="0" x2="1"><stop offset="0" stop-color="#CFE3F0" stop-opacity=".85"/><stop offset=".3" stop-color="#FFFFFF" stop-opacity=".7"/><stop offset="1" stop-color="#BBD3E4" stop-opacity=".85"/></linearGradient></defs>
  ${shadow(40, 106, 34, 4)}<path d="M10 34 Q8 30 14 28 H66 Q72 30 70 34 V96 Q70 106 60 106 H20 Q10 106 10 96 Z" fill="url(#bk-glass)" stroke="${INK}" stroke-width="2"/>
  ${[[26, 92], [50, 94], [38, 76], [22, 62], [56, 70], [40, 52]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="11" fill="#D9A86C" stroke="#A8743E" stroke-width="1.4"/><circle cx="${a - 3}" cy="${b - 2}" r="1.8" fill="#7A4A30"/><circle cx="${a + 4}" cy="${b + 3}" r="1.6" fill="#7A4A30"/>`).join('')}
  <path d="M18 40 V96" stroke="#fff" stroke-width="4" opacity=".55" stroke-linecap="round"/>
  <rect x="8" y="16" width="64" height="16" rx="6" fill="#C99772" stroke="${INK}" stroke-width="2"/><ellipse cx="40" cy="14" rx="12" ry="6" fill="#A87A5A" stroke="${INK}" stroke-width="2"/></g>`);
const mixerArt = sprite(0.45, 0.45, 92, (x, y) => `<g transform="translate(${x - 36} ${y - 82}) scale(.6)"><defs><linearGradient id="bk-mix" x1="0" x2="1"><stop offset="0" stop-color="#5FA7A0"/><stop offset=".35" stop-color="#A9E2D8"/><stop offset="1" stop-color="#4E968F"/></linearGradient>
    <linearGradient id="bk-steel" x1="0" x2="1"><stop offset="0" stop-color="#AEB8C8"/><stop offset=".35" stop-color="#F2F5F9"/><stop offset="1" stop-color="#A3AEBF"/></linearGradient></defs>
  ${shadow(60, 136, 50, 5)}<g class="steam-big"><path class="ln" stroke="#fff" stroke-width="3" d="M44 70 q-6 -8 0 -16 M76 70 q-6 -8 0 -16"/></g>
  <rect x="14" y="118" width="92" height="18" rx="7" fill="url(#bk-mix)" stroke="${INK}" stroke-width="2"/>
  <path d="M80 120 V50 Q80 30 64 26 H40 Q16 26 14 46 Q14 62 34 64 H66 V120 Z" fill="url(#bk-mix)" stroke="${INK}" stroke-width="2"/>
  <path d="M44 64 V82" stroke="#AEB8C8" stroke-width="4"/>
  <path d="M22 82 H74 Q72 116 48 118 Q24 116 22 82 Z" fill="url(#bk-steel)" stroke="${INK}" stroke-width="2"/><ellipse cx="48" cy="82" rx="26" ry="5" fill="#FFF5DD" stroke="${INK}" stroke-width="1.6"/>
  <path d="M24 34 Q34 30 50 30" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/><circle cx="72" cy="44" r="4" fill="#E9C77E" stroke="${INK}" stroke-width="1.4"/></g>`);
const pinArt = sprite(0.6, 0.2, 30, (x, y) => `<g transform="translate(${x} ${y}) rotate(26.6) scale(.55) translate(-75 -30)"><defs><linearGradient id="bk-pin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0D2A8"/><stop offset=".45" stop-color="#E2B888"/><stop offset="1" stop-color="#B8885E"/></linearGradient></defs>
  ${shadow(75, 36, 62, 4)}<rect x="4" y="15" width="26" height="10" rx="5" fill="#C99772" stroke="${INK}" stroke-width="2"/><rect x="120" y="15" width="26" height="10" rx="5" fill="#C99772" stroke="${INK}" stroke-width="2"/>
  <rect x="28" y="6" width="94" height="28" rx="12" fill="url(#bk-pin)" stroke="${INK}" stroke-width="2"/><path d="M36 13 H112" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/></g>`);
const basketArt = sprite(0.7, 0.5, 52, (x, y) => `<g transform="translate(${x - 41} ${y - 44}) scale(.55)"><defs><linearGradient id="bk-wicker" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6C08A"/><stop offset="1" stop-color="#B98A55"/></linearGradient></defs>
  <g transform="rotate(-14 60 30)"><rect x="20" y="4" width="96" height="20" rx="10" fill="#E2AE68" stroke="${INK}" stroke-width="2"/><path d="M40 8 l6 12 M60 8 l6 12 M80 8 l6 12" stroke="#F6DCA8" stroke-width="3" stroke-linecap="round"/></g>
  <g transform="rotate(10 90 30)"><rect x="40" y="10" width="96" height="18" rx="9" fill="#D99D58" stroke="${INK}" stroke-width="2"/><path d="M62 13 l6 11 M84 13 l6 11 M106 13 l6 11" stroke="#F6DCA8" stroke-width="3" stroke-linecap="round"/></g>
  <path d="M8 34 H142 L130 80 H20 Z" fill="url(#bk-wicker)" stroke="${INK}" stroke-width="2"/>
  <g stroke="#9E7046" stroke-width="1.6" opacity=".7" fill="none">${[46, 58, 70].map((b) => `<path d="M${10 + (b - 34) * 0.25} ${b} H${140 - (b - 34) * 0.25}"/>`).join('')}${Array.from({ length: 9 }, (_, i) => `<path d="M${22 + i * 14} 36 V78"/>`).join('')}</g>
  <rect x="2" y="30" width="146" height="8" rx="3" fill="#C99772" stroke="${INK}" stroke-width="2"/></g>`);
const bellArt = sprite(0.3, 0.3, 40, (x, y) => `<g transform="translate(${x - 21} ${y - 35}) scale(.6)"><defs><linearGradient id="bk-brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6DEA2"/><stop offset="1" stop-color="#C39A52"/></linearGradient></defs>
  ${shadow(35, 58, 30, 4)}<rect x="4" y="46" width="62" height="12" rx="4" fill="#C99772" stroke="${INK}" stroke-width="2"/>
  <path d="M10 46 Q10 14 35 14 Q60 14 60 46 Z" fill="url(#bk-brass)" stroke="${INK}" stroke-width="2"/><path d="M30 6 h10 v8 h-10 z" fill="#C39A52" stroke="${INK}" stroke-width="1.8"/>
  <path d="M18 38 Q18 22 32 20" stroke="#fff" stroke-width="3" opacity=".6" fill="none" stroke-linecap="round"/></g>`);
const vaseArt = sprite(0.25, 0.25, 50, (x, y) => `<path d="M${x - 7} ${y} Q${x - 10} ${y - 14} ${x - 4} ${y - 20} H${x + 4} Q${x + 10} ${y - 14} ${x + 7} ${y} Z" fill="${SKY}" ${line}/>
  <path d="M${x} ${y - 20} V${y - 38} M${x} ${y - 26} L${x - 8} ${y - 36}" stroke="#5E9C7E" stroke-width="2"/><circle cx="${x}" cy="${y - 40}" r="5" fill="${SUN}" ${line}/><circle cx="${x - 9}" cy="${y - 37}" r="4" fill="${LILAC}" ${line}/>`);

const eggCrate = () => isoItem(0.8, 0.6, 70, [
  { u: 0, v: 0, w: 0.8, d: 0.6, h: 34, ...shades('#D6AC82'), leftDecor: '<path d="M0 11 H51 M0 22 H51" stroke="#A97B52" stroke-width="2"/>', rightDecor: '<path d="M0 11 H38 M0 22 H38" stroke="#A97B52" stroke-width="2"/>' },
  P(0.4, 0.3, 34, () => [0.15, 0.4, 0.65].map((u) => [0.15, 0.42].map((v) => { const [x, y] = at(u, v, 34); return `<ellipse cx="${x}" cy="${y - 6}" rx="6" ry="8" fill="${CREAM}" ${line}/>`; }).join('')).join(''), 0.4, 0.3),
]);
const puff = (api, x, y, n = 3, tint = '#FFFFFF') => {
  for (let i = 0; i < n; i++) {
    api.later(() => api.effect(x + (i - 1) * 34, y - i * 10, 'wx-puff', `<svg viewBox="0 0 120 90" width="120" height="90"><path d="M20 70 Q4 66 10 50 Q8 30 30 32 Q38 10 62 16 Q86 8 94 32 Q116 34 110 56 Q114 74 94 72 Z" fill="${tint}" opacity=".92"/></svg>`, 1300), i * 120);
  }
};

const I = isoDef;
const W = (...a) => wallDef(R, ...a);
const sackTop = (it) => it.y + 20;

export const BAKERY = {
  id: 'bakery', posKey: 'bakery-iso', title: 'Snowflake Bakery 🥐', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, light: 'iso',
  avatar: [3.4, 5.6],
  frame: '#EFE6DA',
  iso: R,
  bg,
  onWeather: (api) => api.setArt(api.get('window')),
  stars: [{ id: 'bakery-sack', gx: 0.6, gy: 6.45 }],
  characters: [{
    id: 'baker', gx: 6.3, gy: 1.75,
    look: { ...NPC_WINTER.juno, hairStyle: 'bob', hair: '#8B6450', skin: '#E9C3A3', eyes: '#4E9B5A', glasses: 'none', hat: 'none', top: 'sweater', topColor: '#FFFFFF', collar: 'round', neck: 'scarf', neckColor: '#9EDDD4', bottom: 'skirt', bottomColor: '#7A64B0', socks: 'knee', socksColor: '#FBEFB4', shoes: 'boots', shoesColor: '#8B6450' },
    say: ["Welcome! I'm Hanna the baker 🥐", 'Tap the oven to bake something warm!', 'Want to decorate a cake? Try the table 🎂', 'Careful with the flour… poof! ☁️'],
  }],
  items: [
    W('window', 'R', 3.0, 248, 2.2, 150, windowBody),
    W('clock', 'R', 5.35, 262, 0.7, 150, clockBody,
      { onTap: (it, api) => { bump(it, 'boing'); api.sfx.click(); api.bubble(it.x + it.w / 2, it.y, pick(['Tick tock… treat o’clock! 🕰️', 'Bong! Time for cinnamon rolls!', 'Tick tock ⏰'])); } }),
    W('jars', 'R', 6.12, 238, 1.38, 100, jarShelf),
    W('breadshelf', 'L', 2.9, 246, 2.3, 110, breadShelf),
    W('menu', 'L', 5.4, 252, 1.9, 120, menuBoard),

    I('rug', 5.9, 5.0, 2.0, 2.0, rugArt, { floor: true }),
    I('oven', 0, 0.55, 1.3, 2.0, oven, { drag: false, data: { busy: false, n: 0 },
      onTap: (it, api) => {
        const bx = it.x + it.w / 2, by = it.y + 80;
        if (it.data.busy) { api.bubble(bx, by, 'Almost ready… ⏲️'); return; }
        if (ovenCount(api) >= 4) { api.bubble(bx, by, 'Share the treats first! 🥐'); return; }
        it.data.busy = true; it.el.classList.add('wx-baking'); api.sfx.click();
        api.bubble(bx, by, 'Into the oven… ⏲️');
        api.later(() => {
          it.el.classList.remove('wx-baking'); it.data.busy = false;
          const kind = OVEN_ORDER[it.data.n++ % OVEN_ORDER.length];
          const k = ovenCount(api), c = api.get('counter');
          const spot = c ? { gx: c.gx + 0.15 + (k % 2) * 0.45, gy: c.gy + 0.2 + Math.floor(k / 2) * 0.55, gz: c.def.surface } : clampG(it.gx + 1.4, it.gy + 0.3 + k * 0.4);
          const f = baked(api, kind, spot);
          api.sfx.win(); api.sparkle(f.x + f.w / 2, f.y + 20, ['✨', '🔥', '💛']);
          api.bubble(bx, by, { bread: 'Fresh bread! 🍞', pie: 'Blueberry pie! 🥧', cinnamon: 'Cinnamon rolls! 😋' }[kind] + ' Give it to a friend');
        }, 2200);
      } }),
    I('counter', 0, 2.75, 1.1, 2.4, counter, { drag: false, surface: 92 }),
    I('rack', 1.55, 0.1, 1.2, 0.6, proofRack),
    I('bench', 3.1, 0.1, 2.0, 0.7, bench, { surface: 48 }),
    I('cooler', 7.55, 0.1, 1.3, 0.8, cooler),
    I('table', 2.6, 3.5, 2.4, 1.3, island, { drag: false, surface: 86, onTap: (it, api) => cakeGame(api, it) }),
    I('case', 5.3, 2.9, 3.2, 1.0, caseArt, { drag: false, surface: 106,
      onTap: (it, api) => {
        const kinds = ['croissant', 'macaron', 'donut'];
        if (kinds.reduce((n, k) => n + api.count(k), 0) >= 3) { api.bubble(it.x + it.w / 2, it.y + 30, 'Enjoy those pastries first! 🥐'); return; }
        it.data.n = (it.data.n || 0) + 1;
        const kind = kinds[it.data.n % 3];
        api.sfx.pop(); food(api, kind, 0, 0, { gx: it.gx + 0.2 + (it.data.n % 3) * 0.55, gy: it.gy + 0.35, gz: it.def.surface });
        api.bubble(it.x + it.w / 2, it.y + 30, { croissant: 'A buttery croissant! 🥐', macaron: 'A mint macaron! 💚', donut: 'A frosted donut! 🍩' }[kind]);
      } }),
    I('sack', 0.35, 6.2, 0.9, 0.9, sackArt(0.9),
      { onTap: (it, api) => { bump(it, 'shake'); api.sfx.boing(); puff(api, it.x + it.w / 2, sackTop(it)); api.bubble(it.x + it.w / 2, it.y - 20, 'Poof! A flour cloud ☁️'); } }),
    I('sack2', 1.4, 6.95, 0.72, 0.72, sackArt(0.72),
      { onTap: (it, api) => { bump(it, 'shake'); api.sfx.boing(); puff(api, it.x + it.w / 2, sackTop(it), 2); api.bubble(it.x + it.w / 2, it.y - 20, 'Achoo! 🤧'); } }),
    I('eggs', 2.2, 7.1, 0.8, 0.6, eggCrate),
    I('cafetable', 6.55, 5.55, 0.9, 0.9, cafeTable, { surface: 72 }),
    I('stool1', 6.0, 6.55, 0.55, 0.55, stool(TEAL)),
    I('stool2', 7.6, 5.75, 0.55, 0.55, stool(SUN)),
    // small things: drag them around and onto the counter, island, bench, case or café table
    I('cat', 3.3, 0.2, 0.7, 0.4, catArt, { small: true, gz: 48, cls: 'squish',
      onTap: (it, api) => { bump(it, 'boing'); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y, pick(['Purrr… 💤', '*stretches* Mrrrow?', 'Zzz… warm window…'])); } }),
    I('herbs', 4.55, 0.25, 0.35, 0.35, herbsArt, { small: true, gz: 48 }),
    I('mixer', 0.3, 4.45, 0.45, 0.45, mixerArt, { small: true, gz: 92,
      onTap: (it, api) => { it.el.classList.add('cooking'); api.sfx.pour(); api.bubble(it.x + it.w / 2, it.y, 'Whirrr… mixing the batter!'); api.later(() => it.el.classList.remove('cooking'), 1800); } }),
    I('jar', 2.75, 3.62, 0.35, 0.35, jarArt, { small: true, gz: 86,
      onTap: (it, api) => {
        const n = api.count('cookie');
        if (n >= 3) { api.bubble(it.x + it.w / 2, it.y, 'Eat those cookies first! 🍪'); return; }
        bump(it, 'boing'); api.sfx.pop(); baked(api, 'cookie', { ...clampG(it.gx + 0.35 + n * 0.3, it.gy + 0.4), gz: it.gz });
        api.bubble(it.x + it.w / 2, it.y - 20, 'A snowflake cookie! ❄️');
      } }),
    I('rollingpin', 3.85, 4.45, 0.6, 0.2, pinArt, { small: true, gz: 86,
      onTap: (it, api) => { bump(it, 'wx-roll'); api.sfx.drop(); api.bubble(it.x + it.w / 2, it.y - 10, 'Roll, roll, roll the dough!'); } }),
    I('basket', 7.2, 3.1, 0.7, 0.5, basketArt, { small: true, gz: 106,
      onTap: (it, api) => {
        const n = api.count('pretzel');
        if (n >= 2) { api.bubble(it.x + it.w / 2, it.y, 'One pretzel at a time! 🥨'); return; }
        api.sfx.pop(); baked(api, 'pretzel', { ...clampG(it.gx + 0.05 + n * 0.38, it.gy + 0.42), gz: it.gz });
        api.bubble(it.x + it.w / 2, it.y, 'A warm pretzel! 🥨');
      } }),
    I('bell', 8.05, 3.25, 0.3, 0.3, bellArt, { small: true, gz: 106,
      onTap: (it, api) => { bump(it, 'punch'); api.sfx.click(); api.sparkle(it.x + it.w / 2, it.y + 10, ['🔔', '✨']); api.bubble(it.x + it.w / 2, it.y, 'Ding! What would you like? ✨'); } }),
    I('vase', 6.88, 5.88, 0.25, 0.25, vaseArt, { small: true, gz: 72 }),
  ],
};
