// Hair Salon (isometric dollhouse room): tap a style card for a new haircut, cycle the colour swatches,
// wash at the sink, spin the chair, blow-dry under the hood dryer and try on bows and clips.
import { room, roomShell, isoItem, at, shades, proj, isoDef, wallDef } from '../iso.js';
import { svg, text, starPath, wearable, NPC } from './common.js';
import { PALETTE } from '../avatar.js';

const R = room({ cols: 9, rows: 7, ox: 736, oy: 340, wallH: 290 });
R.charScale = 0.6;

const WOOD = '#C99A6C', WOOD_L = '#E2C29C', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', TURQ = '#3CC7B8', SKY = '#9CC8EE', SUN = '#F5DE7A', CORAL = '#E58F6A', LEAF = '#6DBE7A', GOLD = '#E3C27A', CHROME = '#D5D9E3', INKY = '#3E3252';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4"';
const P = (gx, gy, z = 0) => proj(R, gx, gy, z);
const poly = (arr) => arr.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ');
const near = (a, b, d) => a && b && Math.hypot(a.gx + a.fw / 2 - (b.gx + b.fw / 2), a.gy + a.fd / 2 - (b.gy + b.fd / 2)) < d;

// ---------- background ----------
const bg = (w) => {
  const [lx] = P(0, R.rows), [rx] = P(R.cols, 0), [, fy] = P(R.cols, R.rows);
  return svg(1600, 900, `
  <defs>
    <radialGradient id="salon-bd" cx="50%" cy="55%" r="70%"><stop offset="0" stop-color="#F7F3FB"/><stop offset="1" stop-color="#DDD6EE"/></radialGradient>
    <pattern id="salon-wl" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="matrix(1,-0.5,0,1,0,0)">
      <rect width="48" height="48" fill="#EEE8F6"/><path d="M0 0 V48 M24 0 V48" stroke="#E5DDF2" stroke-width="3"/><path d="M12 20 l4 4 l-4 4 l-4 -4 z" fill="#CFEDE8"/><path d="M36 44 l3 3 l-3 3 l-3 -3 z" fill="#F3E7B0"/></pattern>
    <pattern id="salon-wr" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,0,1,0,0)">
      <rect width="48" height="48" fill="#E6DEF2"/><path d="M0 0 V48 M24 0 V48" stroke="#DDD3EC" stroke-width="3"/><path d="M12 20 l4 4 l-4 4 l-4 -4 z" fill="#C3E5E0"/><path d="M36 44 l3 3 l-3 3 l-3 -3 z" fill="#EEE0A8"/></pattern>
    <pattern id="salon-floor" width="1" height="1" patternUnits="userSpaceOnUse" patternTransform="matrix(64,32,-64,32,${R.ox},${R.oy})">
      <rect width="1" height="1" fill="#F6F2FA"/><rect width=".5" height=".5" fill="#DCD2EE"/><rect x=".5" y=".5" width=".5" height=".5" fill="#DCD2EE"/></pattern>
    <linearGradient id="salon-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".6"/><stop offset="1" stop-color="#FFF6DA" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#salon-bd)"/>
  <ellipse cx="${(lx + rx) / 2}" cy="${fy + 6}" rx="580" ry="46" fill="#3E3252" opacity=".10"/>
  ${roomShell(R, { floor: '#F6F2FA', wallL: '#EEE8F6', wallR: '#E6DEF2', wallPatternL: 'salon-wl', wallPatternR: 'salon-wr', floorPattern: 'salon-floor', base: '#F3EEF8' })}
  <polygon points="${poly([P(5.7, 0.05), P(7.2, 0.05), P(8.6, 3.2), P(7.1, 3.2)])}" fill="url(#salon-light)" opacity="${w.weather === 'sun' ? 1 : 0.35}"/>`);
};

// ---------- style cards on the left wall (seen from behind: hair shapes only) ----------
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
let tried = new Set();

const cardBody = ([style, name, color], i) => (it, sp) => {
  const s = sp.len / 104;
  return `<g transform="scale(${s.toFixed(3)})">
    <rect x="4" y="6" width="100" height="120" rx="6" fill="${INKY}" opacity=".12"/>
    <rect x="2" y="2" width="100" height="120" rx="6" fill="#fff" stroke="${it.data.on ? TURQ : '#CFC4E2'}" stroke-width="${it.data.on ? 5 : 2}"/>
    <rect x="12" y="10" width="80" height="80" rx="4" fill="#E7F1F5"/>
    <g transform="translate(-3 0)"><path d="M30 98 Q34 82 55 80 Q76 82 80 98 Z" fill="${LILAC}"/><rect x="48" y="66" width="14" height="18" fill="#E9C3A3"/>${HAIR_SHAPES[style](color)}
      <path d="M36 44 Q44 36 56 36" stroke="#fff" stroke-width="4" opacity=".35" fill="none" stroke-linecap="round"/></g>
    ${text(52, 112, name, 13, '#4A3B5C', 600)}
    <rect x="36" y="-4" width="36" height="13" rx="2" fill="${['#9EDDD4', SUN, '#C9B8F2', SKY, '#9EDDD4'][i]}" opacity=".9" transform="rotate(${i % 2 ? 4 : -4} 54 2)"/></g>`;
};
const styleCard = (st, i) => wallDef(R, 'style-' + st[0], 'L', 6.0 - i * 0.92, 252, 0.84, 104, cardBody(st, i), {
  data: { on: false }, cls: 'hanger',
  onTap: (it, api) => {
    const me = api.avatar();
    if (!me) return;
    const [style, , color] = st;
    api.setLook(me, { hairStyle: style, hair: color });
    api.sfx.wear();
    api.react(me, ['Gorgeous! ✨', 'What a look! 💇', 'So chic! 💜'][i % 3], ['✨', '💇', '💜']);
    for (const s of STYLES) { const c = api.get('style-' + s[0]); if (c) { c.data.on = c === it; api.setArt(c); } }
    tried.add(style);
    if (tried.size >= 3 && !api.starFound('salon-style')) {
      api.addStar('salon-style', 0, 0, { spawned: true, gx: 1.3, gy: 4.3 });
      api.bubble(it.x + it.w / 2, it.y, 'Three new looks! A star! ⭐');
    }
  },
});

const corkBody = (it, sp) => `<rect width="${sp.len}" height="128" rx="8" fill="#E9D6B8" ${line}/><rect x="6" y="6" width="${sp.len - 12}" height="116" rx="5" fill="#F1E2C8"/>
  ${Array.from({ length: 18 }, (_, i) => `<circle cx="${(i * 47) % (sp.len - 20) + 10}" cy="${(i * 29) % 100 + 14}" r="1.6" fill="#D2B98F"/>`).join('')}
  <rect x="${sp.len / 2 - 70}" y="-24" width="140" height="22" rx="11" fill="${LILAC}" ${line}/>${text(sp.len / 2, -8, 'PICK A LOOK ✂', 13, '#fff', 600)}`;

// ---------- other wall things ----------
const mirrorBody = (it, sp) => {
  const w = sp.len, h = 178, on = it.data.on;
  const bulbs = [[w / 2, 2], [w * 0.2, 16], [w * 0.8, 16], [4, 52], [w - 4, 52], [4, 96], [w - 4, 96], [4, 140], [w - 4, 140]];
  return `<path d="M0 ${h} V${w / 2} A${w / 2} ${w / 2} 0 0 1 ${w} ${w / 2} V${h} Z" fill="${GOLD}" ${line}/>
    <path d="M9 ${h - 6} V${w / 2} A${w / 2 - 9} ${w / 2 - 9} 0 0 1 ${w - 9} ${w / 2} V${h - 6} Z" fill="#D7EAF6"/>
    <path d="M22 ${h * 0.55} L${w * 0.62} 30 M22 ${h * 0.8} L${w - 16} ${h * 0.3}" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".6"/>
    <path d="M9 ${h * 0.78} Q${w / 2} ${h * 0.7} ${w - 9} ${h * 0.78} V${h - 6} H9 Z" fill="#fff" opacity=".18"/>
    ${bulbs.map(([x, y]) => `${on ? `<circle cx="${x}" cy="${y}" r="15" fill="#FFF3B0" opacity=".45"/>` : ''}<circle cx="${x}" cy="${y}" r="6" fill="${on ? '#FFF8D6' : '#F1ECF6'}" ${line}/>`).join('')}`;
};

const shelvesBody = (it, sp) => {
  const w = sp.len;
  const bottle = (x, y, bw, bh, c, cap = CREAM) => `<rect x="${x}" y="${y - bh * 0.78}" width="${bw}" height="${bh * 0.78}" rx="4" fill="${c}" ${line}/><rect x="${x + bw * 0.28}" y="${y - bh}" width="${bw * 0.44}" height="${bh * 0.24}" rx="2" fill="${cap}" ${line}/><rect x="${x + bw * 0.18}" y="${y - bh * 0.5}" width="${bw * 0.64}" height="${bh * 0.2}" fill="#fff" opacity=".7"/>`;
  return `${[54, 118].map((y) => `<rect x="0" y="${y}" width="${w}" height="7" rx="2" fill="${WOOD_L}" ${line}/><path d="M10 ${y + 7} l6 9 M${w - 10} ${y + 7} l-6 9" stroke="${WOOD}" stroke-width="4" stroke-linecap="round"/>`).join('')}
    ${bottle(8, 54, 14, 34, '#9EDDD4')}${bottle(26, 54, 12, 28, '#C9B8F2')}${bottle(42, 54, 16, 40, SUN, '#4A3B5C')}${bottle(62, 54, 12, 26, SKY)}${bottle(78, 54, 14, 36, LILAC)}${bottle(96, 54, 14, 24, CREAM, TURQ)}
    ${bottle(8, 118, 16, 34, LILAC, SUN)}${bottle(28, 118, 12, 26, '#9EDDD4')}<rect x="46" y="96" width="30" height="22" rx="3" fill="${CREAM}" ${line}/><path d="M46 104 h30" stroke="${TURQ}" stroke-width="4"/>${bottle(82, 118, 14, 36, SKY, '#4A3B5C')}${bottle(w - 18, 118, 12, 24, SUN)}`;
};

const windowBody = (it, sp, api) => {
  const sunny = api?.state.weather !== 'rain';
  const w = sp.len, h = 130;
  return `<rect width="${w}" height="${h}" rx="6" fill="${sunny ? '#BFE3FA' : '#9EADC4'}" ${line}/>
    ${sunny ? `<circle cx="${w * 0.7}" cy="36" r="16" fill="#FFF3B8"/><path d="M12 88 q14 -16 32 -6 q10 -12 28 -2 q16 0 12 12 z" fill="#fff"/>` : Array.from({ length: 12 }, (_, i) => `<line x1="${(i * 23) % w + 6}" y1="${(i * 37) % 100 + 8}" x2="${(i * 23) % w + 2}" y2="${(i * 37) % 100 + 22}" stroke="#E8EEF7" stroke-width="2"/>`).join('')}
    <path d="M0 ${h * 0.8} Q${w * 0.3} ${h * 0.7} ${w * 0.6} ${h * 0.78} T${w} ${h * 0.74} V${h} H0 Z" fill="#A8DE9A" opacity=".8"/>
    <path d="M${w / 2} 0 V${h} M0 ${h / 2} H${w}" stroke="#FBF7EF" stroke-width="6"/>
    <rect x="-6" y="${h - 4}" width="${w + 12}" height="12" rx="3" fill="#FBF7EF" ${line}/>
    <path d="M-14 -10 Q${w * 0.14} ${h * 0.45} -4 ${h + 2} L-16 ${h + 2} Z" fill="${TEAL}" ${line}/>
    <path d="M${w + 14} -10 Q${w * 0.86} ${h * 0.45} ${w + 4} ${h + 2} L${w + 16} ${h + 2} Z" fill="${TEAL}" ${line}/>
    <rect x="-22" y="-16" width="${w + 44}" height="9" rx="4" fill="${GOLD}" ${line}/>`;
};

const posterBody = (it, sp) => `<rect width="${sp.len}" height="96" rx="4" fill="#FBF7EF" ${line}/><rect x="6" y="6" width="${sp.len - 12}" height="84" rx="3" fill="#D9F0EC"/>
  <path d="M${sp.len / 2 - 24} 90 Q${sp.len / 2 - 22} 66 ${sp.len / 2} 64 Q${sp.len / 2 + 22} 66 ${sp.len / 2 + 24} 90 Z" fill="${LILAC}"/>
  <circle cx="${sp.len / 2}" cy="46" r="15" fill="#E9C3A3"/><path d="M${sp.len / 2 - 20} 52 Q${sp.len / 2 - 22} 22 ${sp.len / 2} 24 Q${sp.len / 2 + 24} 22 ${sp.len / 2 + 20} 56 Q${sp.len / 2 + 30} 70 ${sp.len / 2 + 14} 74 Q${sp.len / 2 + 14} 44 ${sp.len / 2} 36 Q${sp.len / 2 - 14} 44 ${sp.len / 2 - 14} 74 Q${sp.len / 2 - 30} 70 ${sp.len / 2 - 20} 52 Z" fill="${TURQ}"/>
  ${starPath(14, 16, 6, SUN)}${starPath(sp.len - 14, 24, 5, '#fff')}`;

const signBody = (it, sp) => `<rect width="${sp.len}" height="34" rx="17" fill="#4A3B5C" ${line}/>${text(sp.len / 2, 22, 'SUNNY SALON', 12, SUN, 600)}`;

// ---------- furniture ----------
const vanity = () => {
  const w = 1.9 * 64;
  return isoItem(1.9, 0.75, 84, [
    { u: 0, v: 0, w: 1.9, d: 0.72, h: 76, ...shades('#F3ECDF'),
      leftDecor: `${[0, 1, 2].map((i) => `<rect x="${5 + i * (w - 10) / 3}" y="8" width="${(w - 10) / 3 - 4}" height="26" rx="3" fill="none" ${line}/><circle cx="${5 + (i + 0.5) * (w - 10) / 3 - 2}" cy="21" r="3" fill="${GOLD}" ${line}/>`).join('')}
        <rect x="5" y="40" width="${w - 14}" height="30" rx="3" fill="#EAE0F6" ${line}/><path d="M12 55 q10 -9 20 0 t20 0 t20 0 t20 0 t20 0" stroke="${LILAC}" stroke-width="3" fill="none"/>` },
    { u: -0.03, v: -0.02, w: 1.96, d: 0.77, z: 76, h: 6, ...shades('#FFFFFF', 0.5) },
  ]);
};

const chair = () => {
  const seat = shades(TURQ), chrome = shades(CHROME, 0.6);
  return isoItem(1, 1, 150, [
    { u: 0.12, v: 0.12, w: 0.76, d: 0.76, h: 8, round: true, ...chrome },
    { u: 0.45, v: 0.45, w: 0.1, d: 0.1, z: 8, h: 40, ...chrome },
    { u: 0.16, v: 0.02, w: 0.68, d: 0.1, z: 20, h: 6, ...chrome },
    { u: 0.16, v: 0.1, w: 0.68, d: 0.8, z: 48, h: 20, ...seat, leftDecor: '<path d="M6 6 H45" stroke="#fff" stroke-width="3" opacity=".4" stroke-linecap="round"/>' },
    { u: 0.04, v: 0.16, w: 0.12, d: 0.62, z: 48, h: 34, ...seat },
    { u: 0.84, v: 0.16, w: 0.12, d: 0.62, z: 48, h: 34, ...seat },
    { u: 0.12, v: 0.8, w: 0.76, d: 0.14, z: 68, h: 78, ...seat,
      leftDecor: `${[[14, 18], [34, 18], [24, 38], [14, 58], [34, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#2A9C90"/>`).join('')}<path d="M14 18 L24 38 L34 18 M14 58 L24 38 L34 58" stroke="#2A9C90" stroke-width="1.2" fill="none" opacity=".6"/>` },
  ]);
};

const sinkStation = () => {
  const cab = shades('#A28FDB'), seat = shades(TURQ);
  return isoItem(1.1, 1.85, 130, [
    { u: 0, v: 0, w: 1.1, d: 0.72, h: 70, ...cab,
      leftDecor: `<rect x="5" y="8" width="${1.1 * 64 - 10}" height="54" rx="4" fill="none" ${line}/><circle cx="${1.1 * 32}" cy="20" r="3" fill="${GOLD}" ${line}/>${starPath(1.1 * 32, 42, 9, '#C9B8F2')}` },
    { u: -0.02, v: -0.02, w: 1.14, d: 0.76, z: 70, h: 6, ...shades('#FFFFFF', 0.5) },
    { svg: (() => {
      const [cx, cy] = at(0.55, 0.38, 76), [bx, by] = at(0.55, 0.06, 76);
      return `<ellipse cx="${cx}" cy="${cy}" rx="34" ry="17" fill="#fff" ${line}/><ellipse cx="${cx}" cy="${cy + 1}" rx="25" ry="11" fill="#C9DCEB"/>
        <path d="M${bx} ${by} V${by - 34} Q${bx} ${by - 44} ${(bx + cx) / 2} ${by - 42} Q${cx + 2} ${by - 40} ${cx + 2} ${cy - 22}" fill="none" stroke="#3E3252" stroke-opacity=".5" stroke-width="7" stroke-linecap="round"/>
        <path d="M${bx} ${by} V${by - 34} Q${bx} ${by - 44} ${(bx + cx) / 2} ${by - 42} Q${cx + 2} ${by - 40} ${cx + 2} ${cy - 22}" fill="none" stroke="#E2E6EE" stroke-width="4.5" stroke-linecap="round"/>
        <g class="water"><path d="M${cx + 2} ${cy - 18} V${cy - 2}" stroke="#8FC3F0" stroke-width="5" stroke-linecap="round"/><circle cx="${cx - 12}" cy="${cy - 4}" r="4" fill="#fff" stroke="#BFE6FF"/><circle cx="${cx + 12}" cy="${cy - 6}" r="3" fill="#fff" stroke="#BFE6FF"/><circle cx="${cx + 4}" cy="${cy - 12}" r="2.5" fill="#fff" stroke="#BFE6FF"/></g>
        <rect x="${bx + 16}" y="${by - 26}" width="12" height="20" rx="3" fill="#C9B8F2" ${line}/><rect x="${bx + 19}" y="${by - 32}" width="6" height="7" rx="1" fill="${CREAM}" ${line}/>`;
    })(), u: 0.55, v: 0.38, w: 0.1, d: 0.1, z: 76 },
    { u: 0.38, v: 1.12, w: 0.36, d: 0.36, h: 30, ...shades(CHROME, 0.6) },
    { u: 0.16, v: 0.8, w: 0.78, d: 1.02, z: 30, h: 18, ...seat, leftDecor: '<path d="M6 6 H44" stroke="#fff" stroke-width="3" opacity=".4" stroke-linecap="round"/>' },
    { u: 0.16, v: 0.72, w: 0.78, d: 0.18, z: 48, h: 40, ...seat },
    { u: 0.04, v: 0.86, w: 0.12, d: 0.9, z: 30, h: 34, ...seat },
    { u: 0.94, v: 0.86, w: 0.12, d: 0.9, z: 30, h: 34, ...seat },
  ]);
};

const dryer = () => {
  const pole = shades(CHROME, 0.6);
  return isoItem(1.1, 1.1, 230, [
    { svg: (() => { const [cx, cy] = at(0.55, 0.55); return `<path d="M${cx - 52} ${cy + 4} L${cx} ${cy - 6} L${cx + 52} ${cy + 4} M${cx - 22} ${cy + 22} L${cx} ${cy - 6} L${cx + 26} ${cy + 22}" stroke="#3E3252" stroke-opacity=".5" stroke-width="8" stroke-linecap="round"/><path d="M${cx - 52} ${cy + 4} L${cx} ${cy - 6} L${cx + 52} ${cy + 4} M${cx - 22} ${cy + 22} L${cx} ${cy - 6} L${cx + 26} ${cy + 22}" stroke="${CHROME}" stroke-width="5" stroke-linecap="round"/>`; })(), u: 0.5, v: 0.5, w: 0.1, d: 0.1 },
    { u: 0.5, v: 0.5, w: 0.1, d: 0.1, h: 150, ...pole },
    { u: 0.44, v: 0.44, w: 0.22, d: 0.22, z: 92, h: 14, ...pole },
    { svg: (() => {
      const [cx, cy] = at(0.55, 0.55, 150);
      return `<path d="M${cx} ${cy + 8} Q${cx + 34} ${cy + 6} ${cx + 30} ${cy - 22}" stroke="${CHROME}" stroke-width="8" fill="none" stroke-linecap="round"/>
        <g transform="rotate(-14 ${cx} ${cy - 30})">
          <path d="M${cx - 50} ${cy - 18} Q${cx - 54} ${cy - 84} ${cx} ${cy - 88} Q${cx + 54} ${cy - 84} ${cx + 50} ${cy - 18} Z" fill="${LILAC}" ${line}/>
          <path d="M${cx - 30} ${cy - 62} Q${cx - 14} ${cy - 76} ${cx + 8} ${cy - 76}" stroke="#fff" stroke-width="6" opacity=".45" fill="none" stroke-linecap="round"/>
          <ellipse cx="${cx}" cy="${cy - 18}" rx="50" ry="15" fill="#4A3B6E" ${line}/>
          <path d="M${cx - 50} ${cy - 18} Q${cx} ${cy + 2} ${cx + 50} ${cy - 18}" stroke="${SUN}" stroke-width="3" fill="none"/>
          <circle cx="${cx + 34}" cy="${cy - 56}" r="6" fill="${SUN}" ${line}/>
          <g class="sx-air" stroke="#BFE6FF" stroke-width="3.5" stroke-linecap="round" fill="none"><path d="M${cx - 26} ${cy - 6} q-5 10 0 20"/><path d="M${cx} ${cy - 2} q-5 10 0 20"/><path d="M${cx + 26} ${cy - 6} q-5 10 0 20"/></g>
        </g>`;
    })(), u: 0.55, v: 0.55, w: 0.2, d: 0.2, z: 150 },
  ]);
};

const nailBar = (it) => {
  const d = 1.6 * 64, pick = it?.data.pick;
  const POL = [LILAC, TURQ, SKY, SUN, CORAL, '#4D5C9A'];
  return isoItem(0.7, 1.6, 130, [
    { u: 0, v: 0, w: 0.7, d: 1.6, h: 78, ...shades('#F7F2FB'),
      rightDecor: `<rect x="6" y="10" width="${d - 12}" height="22" rx="11" fill="${LILAC}"/>${text(d / 2, 26, 'NAIL BAR', 12, '#fff', 600)}
        <rect x="6" y="40" width="${d / 2 - 9}" height="30" rx="3" fill="none" ${line}/><rect x="${d / 2 + 3}" y="40" width="${d / 2 - 9}" height="30" rx="3" fill="none" ${line}/>
        <circle cx="${d / 2 - 10}" cy="55" r="2.6" fill="${GOLD}"/><circle cx="${d / 2 + 10}" cy="55" r="2.6" fill="${GOLD}"/>` },
    { u: -0.02, v: -0.03, w: 0.74, d: 1.66, z: 78, h: 6, ...shades(WOOD_L) },
    { u: 0.06, v: 0.1, w: 0.26, d: 1.4, z: 84, h: 10, ...shades('#EADFF6') },
    { svg: POL.map((c, i) => {
      const on = pick === c, [x, y] = at(0.19, 0.22 + i * 0.23, on ? 104 : 94);
      return `${on ? `<circle cx="${x}" cy="${y - 10}" r="16" fill="#FFF3B0" opacity=".55"/>` : ''}<rect x="${x - 3}" y="${y - 22}" width="6" height="8" rx="1.5" fill="#2E2A3A"/><path d="M${x - 7} ${y - 14} h14 q2 0 2 3 v9 q0 3 -3 3 h-12 q-3 0 -3 -3 v-9 q0 -3 2 -3 z" fill="${c}" ${line}/><rect x="${x - 5}" y="${y - 12}" width="2.4" height="8" rx="1" fill="#fff" opacity=".6"/>`;
    }).join(''), u: 0.2, v: 0.8, w: 0.1, d: 0.1, z: 94 },
    { svg: (() => { const [x, y] = at(0.5, 0.95, 84); return `<ellipse cx="${x}" cy="${y}" rx="20" ry="9" fill="#C9B8F2" ${line}/><path d="M${x - 11} ${y - 2} q11 -6 22 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>`; })(), u: 0.5, v: 0.95, w: 0.2, d: 0.2, z: 84 },
  ]);
};

const trolley = () => {
  const frame = shades('#5E4E74'), chrome = shades(CHROME, 0.6);
  return isoItem(0.7, 0.6, 128, [
    ...[[0.04, 0.04], [0.6, 0.04], [0.04, 0.5], [0.6, 0.5]].map(([u, v]) => ({ u, v, w: 0.06, d: 0.06, h: 92, ...chrome })),
    { u: 0, v: 0, w: 0.7, d: 0.6, z: 14, h: 6, ...frame },
    { u: 0, v: 0, w: 0.7, d: 0.6, z: 50, h: 22, ...frame, leftDecor: '<rect x="16" y="8" width="14" height="5" rx="2.5" fill="#D5D9E3"/>' },
    { u: -0.02, v: -0.02, w: 0.74, d: 0.64, z: 92, h: 6, ...shades('#7A6A94') },
    { svg: (() => { const [x, y] = at(0.2, 0.3, 98), [bx, by] = at(0.5, 0.25, 98), [cx, cy] = at(0.45, 0.48, 98); return `
      <path d="M${x - 10} ${y - 2} L${x + 8} ${y - 12} M${x - 10} ${y - 12} L${x + 8} ${y - 2}" stroke="${CHROME}" stroke-width="3"/><circle cx="${x - 12}" cy="${y}" r="4" fill="none" stroke="${TURQ}" stroke-width="2.5"/><circle cx="${x - 12}" cy="${y - 12}" r="4" fill="none" stroke="${TURQ}" stroke-width="2.5"/>
      <rect x="${bx - 6}" y="${by - 24}" width="12" height="22" rx="3" fill="${LILAC}" ${line}/><rect x="${bx - 3}" y="${by - 30}" width="6" height="7" rx="1" fill="#2E2A3A"/>
      <rect x="${cx - 16}" y="${cy - 6}" width="28" height="8" rx="4" fill="${SUN}" ${line}/><path d="M${cx - 12} ${cy + 2} v5 M${cx - 6} ${cy + 2} v5 M${cx} ${cy + 2} v5 M${cx + 6} ${cy + 2} v5" stroke="#3E3252" stroke-width="1.4"/>`; })(), u: 0.4, v: 0.3, w: 0.1, d: 0.1, z: 98 },
    { svg: [[0.07, 0.07], [0.63, 0.07], [0.07, 0.53], [0.63, 0.53]].map(([u, v]) => { const [x, y] = at(u, v); return `<circle cx="${x}" cy="${y}" r="5" fill="#2E2A3A"/>`; }).join(''), u: 0.3, v: 0.3, w: 0.05, d: 0.05 },
  ]);
};

const towels = () => isoItem(0.9, 0.8, 84, [
  { u: 0, v: 0, w: 0.9, d: 0.8, h: 48, ...shades('#D9B98F'),
    leftDecor: `${[12, 24, 36].map((y) => `<path d="M0 ${y} H58" stroke="#A47E52" stroke-width="2" opacity=".7"/>`).join('')}${[10, 22, 34, 46].map((x) => `<path d="M${x} 0 V48" stroke="#A47E52" stroke-width="1.4" opacity=".4"/>`).join('')}`,
    rightDecor: `${[12, 24, 36].map((y) => `<path d="M0 ${y} H52" stroke="#A47E52" stroke-width="2" opacity=".7"/>`).join('')}${[10, 22, 34, 46].map((x) => `<path d="M${x} 0 V48" stroke="#A47E52" stroke-width="1.4" opacity=".4"/>`).join('')}` },
  { u: 0.07, v: 0.07, w: 0.76, d: 0.66, z: 48, h: 10, ...shades('#9EDDD4'), leftDecor: '<path d="M0 3 H49" stroke="#fff" stroke-width="2" opacity=".6"/>' },
  { u: 0.1, v: 0.06, w: 0.72, d: 0.66, z: 58, h: 10, ...shades(CREAM, 0.6), leftDecor: `<path d="M0 3 H46" stroke="${LILAC}" stroke-width="2" opacity=".8"/>` },
  { u: 0.06, v: 0.1, w: 0.74, d: 0.62, z: 68, h: 10, ...shades('#C9B8F2'), leftDecor: '<path d="M0 3 H47" stroke="#fff" stroke-width="2" opacity=".6"/>' },
]);

const displayTable = () => {
  const gold = shades(GOLD);
  return isoItem(1.3, 0.8, 74, [
    { u: 0.08, v: 0.08, w: 0.08, d: 0.08, h: 66, ...gold }, { u: 1.14, v: 0.08, w: 0.08, d: 0.08, h: 66, ...gold },
    { u: 0.08, v: 0.64, w: 0.08, d: 0.08, h: 66, ...gold }, { u: 1.14, v: 0.64, w: 0.08, d: 0.08, h: 66, ...gold },
    { u: 0.08, v: 0.08, w: 1.14, d: 0.64, z: 22, h: 4, ...shades('#EADFF6') },
    { u: 0, v: 0, w: 1.3, d: 0.8, z: 66, h: 8, ...shades('#FFFFFF', 0.5), topDecor: '<rect x=".08" y=".08" width="1.14" height=".64" rx=".06" fill="#F1EAFB"/>' },
  ]);
};

const bench = () => {
  const vel = shades('#C3B0F2'), leg = shades(GOLD);
  return isoItem(1.9, 0.85, 110, [
    { u: 0.1, v: 0.08, w: 0.08, d: 0.08, h: 24, ...leg }, { u: 1.72, v: 0.08, w: 0.08, d: 0.08, h: 24, ...leg },
    { u: 0.1, v: 0.68, w: 0.08, d: 0.08, h: 24, ...leg }, { u: 1.72, v: 0.68, w: 0.08, d: 0.08, h: 24, ...leg },
    { u: 0.16, v: 0, w: 1.58, d: 0.22, z: 24, h: 82, ...vel, leftDecor: `${[24, 50, 76].map((x) => `<circle cx="${x}" cy="22" r="3" fill="#9A80D8"/>`).join('')}<path d="M8 10 H92" stroke="#fff" stroke-width="3" opacity=".3" stroke-linecap="round"/>` },
    { u: 0.16, v: 0.22, w: 1.58, d: 0.63, z: 24, h: 24, ...vel, leftDecor: '<path d="M6 8 H95" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/>' },
    { u: 0.2, v: 0.26, w: 0.74, d: 0.55, z: 48, h: 7, ...shades('#D2C3F6') }, { u: 0.96, v: 0.26, w: 0.74, d: 0.55, z: 48, h: 7, ...shades('#D2C3F6') },
    { u: 0, v: 0, w: 0.16, d: 0.85, z: 24, h: 48, ...vel }, { u: 1.74, v: 0, w: 0.16, d: 0.85, z: 24, h: 48, ...vel },
  ]);
};

const sideTable = () => isoItem(0.7, 0.7, 64, [
  { u: 0.3, v: 0.3, w: 0.1, d: 0.1, h: 58, ...shades(GOLD) },
  { u: 0.12, v: 0.12, w: 0.46, d: 0.46, h: 5, round: true, ...shades(GOLD) },
  { u: 0, v: 0, w: 0.7, d: 0.7, z: 58, h: 6, round: true, ...shades('#FFFFFF', 0.5) },
]);

const magazines = () => isoItem(0.42, 0.34, 20, [
  { u: 0, v: 0, w: 0.42, d: 0.32, h: 4, ...shades(TURQ), topDecor: '<rect x=".06" y=".06" width=".18" height=".2" fill="#fff" opacity=".7"/>' },
  { u: 0.03, v: 0.02, w: 0.38, d: 0.3, z: 4, h: 4, ...shades(SUN), topDecor: '<circle cx=".2" cy=".15" r=".08" fill="#C9B8F2"/>' },
]);

const rug = () => isoItem(2.4, 2.2, 2, [{ u: 0, v: 0, w: 2.4, d: 2.2, h: 0, round: true, top: '#BFE7E1',
  topDecor: '<ellipse cx="1.2" cy="1.1" rx=".95" ry=".86" fill="none" stroke="#fff" stroke-width=".06" stroke-dasharray=".16 .1"/><ellipse cx="1.2" cy="1.1" rx=".55" ry=".5" fill="#D7EFEA"/>' }]);

const rug2 = () => isoItem(2.6, 2.4, 2, [{ u: 0, v: 0, w: 2.6, d: 2.4, h: 0, round: true, top: '#E4D9F7',
  topDecor: `<ellipse cx="1.3" cy="1.2" rx="1.02" ry=".94" fill="none" stroke="#fff" stroke-width=".05"/>${[0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2; return `<circle cx="${(1.3 + Math.cos(a) * 0.62).toFixed(2)}" cy="${(1.2 + Math.sin(a) * 0.56).toFixed(2)}" r=".1" fill="${i % 2 ? '#9EDDD4' : '#F5DE7A'}"/>`; }).join('')}` }]);

const pouf = () => isoItem(0.7, 0.7, 50, [{
  svg: (() => { const [cx, cy] = at(0.35, 0.35); return `<path d="M${cx - 38} ${cy - 30} V${cy - 4} A38 18 0 0 0 ${cx + 38} ${cy - 4} V${cy - 30} Z" fill="${SUN}" ${line}/>
    <path d="M${cx - 38} ${cy - 16} A38 18 0 0 0 ${cx + 38} ${cy - 16}" stroke="#fff" stroke-width="3" opacity=".5" fill="none"/>
    <ellipse cx="${cx}" cy="${cy - 30}" rx="38" ry="18" fill="#F8E89C" ${line}/><circle cx="${cx}" cy="${cy - 30}" r="3.5" fill="#E3C27A"/>
    <path d="M${cx - 20} ${cy - 36} L${cx + 20} ${cy - 24} M${cx + 20} ${cy - 36} L${cx - 20} ${cy - 24}" stroke="#E3C27A" stroke-width="1.6"/>`; })(),
  w: 0.7, d: 0.7,
}]);

const plant = (pot) => () => isoItem(0.7, 0.7, 160, [
  { u: 0.12, v: 0.12, w: 0.46, d: 0.46, h: 40, ...shades(pot) },
  { svg: (() => { const [cx, cy] = at(0.35, 0.35, 40); return [[-30, -76, -10], [26, -86, 12], [-4, -112, 0], [-40, -36, -18], [38, -44, 18]].map(([dx, dy, r]) => `<path d="M${cx} ${cy} Q${cx + dx * 0.4} ${cy + dy * 0.6} ${cx + dx} ${cy + dy} Q${cx + dx * 0.9 + r} ${cy + dy * 0.5} ${cx} ${cy} Z" fill="${LEAF}" ${line}/>`).join(''); })(), w: 0.7, d: 0.7, u: 0.35, v: 0.35 },
]);

// ---------- small things ----------
const swatches = (it) => {
  const sel = it?.data.i ?? -1;
  return isoItem(0.5, 0.4, 96, [
    { u: 0.08, v: 0.08, w: 0.34, d: 0.24, h: 8, ...shades('#EADFF6') },
    { svg: (() => {
      const [cx, cy] = at(0.25, 0.2, 8);
      return `${PALETTE.hair.map((c, i) => {
        const a = -48 + i * (96 / Math.max(1, PALETTE.hair.length - 1)), on = i === sel;
        return `<g transform="rotate(${a.toFixed(1)} ${cx} ${cy - 6})"><path d="M${cx - 3} ${cy - 6} Q${cx - 6} ${cy - (on ? 66 : 56)} ${cx} ${cy - (on ? 84 : 72)} Q${cx + 6} ${cy - (on ? 66 : 56)} ${cx + 3} ${cy - 6} Z" fill="${c}" stroke="${on ? INKY : 'rgba(62,50,82,.35)'}" stroke-width="${on ? 1.8 : 1}"/></g>`;
      }).join('')}<circle cx="${cx}" cy="${cy - 6}" r="6" fill="${CHROME}" ${line}/>`;
    })(), u: 0.25, v: 0.2, w: 0.1, d: 0.1, z: 8 },
  ]);
};

// Hair accessories that work like the boutique wearables (scaled to the room).
const hairAcc = (id, value, gx, gy, gz, wText, w, h, k, body) => ({
  id, w: w * k, h: h * k, gx, gy, gz, fw: 0.4, fd: 0.4, ax: (w * k) / 2, ay: h * k - 4, small: true,
  cls: 'wearable', wear: ['hairAcc', value], wearText: wText, art: () => svg(w, h, body),
});
const scaled = (d, k) => ({ ...d, w: d.w * k, h: d.h * k, ax: (d.w * k) / 2, ay: d.h * k - 4 });

const I = isoDef;
const W = (...a) => wallDef(R, ...a);

export const SALON = {
  id: 'salon', posKey: 'salon-iso', title: 'Hair Salon 💇', weather: true, light: 'iso', avatar: [3.3, 3.1],
  frame: '#E6DFF2',
  iso: R,
  bg,
  init: () => { tried = new Set(); },
  onWeather: (api) => api.setArt(api.get('window')),
  stars: [{ id: 'salon-towels', gx: 0.55, gy: 5.75 }],
  characters: [
    { id: 'juno', look: { ...NPC.stylist, hairStyle: 'long', hair: '#4D5C9A', top: 'sweater', topColor: '#3CC7B8', collar: 'round', bottom: 'widePants', bottomColor: '#4A3B5C', shoes: 'boots', shoesColor: '#2E2A3A' }, gx: 5.4, gy: 2.35,
      say: ['Welcome! Pick a look from the style cards ✨', 'Try the colour swatches! 🎨', 'Sit under the dryer for a blow-dry 💨', 'Bows and clips are on the table 🎀'] },
  ],
  items: [
    W('corkboard', 'L', 2.1, 262, 4.8, 128, corkBody),
    ...STYLES.map(styleCard),
    W('poster', 'L', 0.95, 258, 1.0, 96, posterBody),
    W('shelves', 'R', 0.35, 264, 1.8, 126, shelvesBody, {
      onTap: (it, api) => {
        api.sparkle(it.x + it.w / 2, it.y + 60, ['🫧', '✨', '🌸']);
        api.bubble(it.x + it.w / 2, it.y, ['Lavender shampoo 💜', 'Mint conditioner 🌿', 'Shine serum ✨', 'Sea-salt spray 🌊'][Math.floor(Math.random() * 4)]);
      } }),
    W('sign', 'R', 2.2, 272, 1.35, 34, signBody),
    W('mirror', 'R', 3.62, 284, 1.66, 178, mirrorBody, { data: { on: false },
      onTap: (it, api) => {
        it.data.on = !it.data.on; api.setArt(it); api.sfx.click();
        api.sparkle(it.x + it.w / 2, it.y + it.h / 2, ['✨', '💫', '✨']);
        api.bubble(it.x + it.w / 2, it.y, it.data.on ? 'Looking fabulous! ✨' : 'Lights off');
        api.avatar()?.anim.happy();
      } }),
    W('window', 'R', 5.75, 262, 1.5, 130, windowBody),

    I('rug', 3.3, 0.85, 2.4, 2.2, rug, { floor: true }),
    I('rug2', 5.3, 3.6, 2.6, 2.4, rug2, { floor: true }),
    I('pouf', 6.25, 4.45, 0.7, 0.7, pouf, { onTap: (it, api) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.sfx.boing(); } }),
    I('polish', 0.05, 2.3, 0.7, 1.6, nailBar, { drag: false, data: { n: 0 },
      onTap: (it, api) => {
        const list = [['Lilac', LILAC], ['Turquoise', TURQ], ['Sky blue', SKY], ['Lemon', SUN], ['Coral', CORAL], ['Midnight', '#4D5C9A']];
        const [name, c] = list[it.data.n++ % list.length];
        it.data.pick = c; api.setArt(it); api.sfx.click();
        const me = api.avatar();
        if (me) api.react(me, `${name} nails! 💅`, ['💅', '✨', '💫']);
        else api.bubble(it.x + it.w / 2, it.y, `${name} nails! 💅`);
      } }),
    I('plant1', 2.45, 0.12, 0.7, 0.7, plant(TEAL)),
    I('vanity', 3.5, 0.05, 1.9, 0.75, vanity, { drag: false, surface: 82 }),
    I('sink', 0.95, 0.05, 1.1, 1.85, sinkStation, { drag: false,
      onTap: (it, api) => {
        if (it.el.classList.contains('spray')) return;
        it.el.classList.add('spray'); api.sfx.pour();
        api.later(() => api.sparkle(it.x + it.w * 0.4, it.y + it.h * 0.45, ['🫧', '💧', '🫧']), 400);
        api.bubble(it.x + it.w / 2, it.y, 'Shampoo and rinse! 🫧');
        api.later(() => it.el.classList.remove('spray'), 1800);
      } }),
    I('dryer', 7.75, 0.3, 1.1, 1.1, dryer, { drag: false, cls: 'sx-dryer',
      onTap: (it, api) => {
        if (it.el.classList.contains('sx-blow')) return;
        it.el.classList.add('sx-blow');
        [0, 550, 1100].forEach((t) => api.later(() => api.sfx.pour(), t));
        api.bubble(it.x + it.w / 2, it.y, 'Whirrr... 💨');
        api.later(() => {
          it.el.classList.remove('sx-blow');
          const me = api.avatar();
          if (near(me, it, 2.2)) api.react(me, 'Soft and shiny! 💨', ['💨', '✨', '💫']);
          else api.sparkle(it.x + it.w / 2, it.y + 50, ['💨', '✨']);
        }, 1800);
      } }),
    I('chair', 4.0, 1.25, 1, 1, chair, {
      onTap: (it, api) => {
        it.el.classList.remove('sx-twirl'); void it.el.offsetWidth; it.el.classList.add('sx-twirl');
        api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y, 'Wheee, spin! 💫');
      } }),
    I('trolley', 2.95, 1.6, 0.7, 0.6, trolley, {
      onTap: (it, api) => { api.sparkle(it.x + it.w / 2, it.y + 20, ['✂️', '✨']); api.bubble(it.x + it.w / 2, it.y, ['Snip snip! ✂️', 'Brush, brush! 🪮', 'All tools ready! ✨'][Math.floor(Math.random() * 3)]); api.sfx.click(); } }),
    I('table', 1.6, 4.5, 1.3, 0.8, displayTable, { surface: 74 }),
    I('bench', 5.6, 0.08, 1.9, 0.85, bench),
    I('sidetable', 6.25, 1.3, 0.7, 0.7, sideTable, { surface: 64 }),
    I('plant2', 0.12, 0.15, 0.7, 0.7, plant('#C9B8F2')),
    I('plant3', 8.2, 1.8, 0.7, 0.7, plant(TEAL)),
    I('towels', 0.25, 5.5, 0.9, 0.8, towels, {
      onTap: (it, api) => { api.sparkle(it.x + it.w / 2, it.y + 20, ['🫧', '✨']); api.bubble(it.x + it.w / 2, it.y, 'Fluffy fresh towels! 🧺'); } }),

    // small things on the vanity and tables
    I('swatches', 3.62, 0.2, 0.5, 0.4, swatches, { small: true, gz: 82, drag: false, data: { i: -1 },
      onTap: (it, api) => {
        const me = api.avatar();
        it.data.i = (it.data.i + 1) % PALETTE.hair.length;
        api.setArt(it);
        if (!me) return;
        api.setLook(me, { hair: PALETTE.hair[it.data.i] });
        api.sfx.wear();
        api.react(me, ['New colour! 🎨', 'Love this shade! ✨', 'Stunning! 💜'][it.data.i % 3], ['✨', '🎨', '💫']);
      } }),
    hairAcc('acc-bow', 'bow', 4.35, 0.25, 82, 'A pretty bow! 🎀', 80, 56, 0.7, `
      <path d="M40 28 C22 4 4 10 6 26 C8 44 26 42 40 32 Z M40 28 C58 4 76 10 74 26 C72 44 54 42 40 32 Z" fill="#B79CF0" stroke="#4A3B5C" stroke-width="2"/>
      <path d="M34 34 L24 54 L34 50 L38 36 Z M46 34 L56 54 L46 50 L42 36 Z" fill="#9A80D8" stroke="#4A3B5C" stroke-width="1.6"/>
      <rect x="33" y="22" width="14" height="14" rx="5" fill="#C9B8F2" stroke="#4A3B5C" stroke-width="2"/>
      <path d="M14 20 Q22 16 30 24" stroke="#fff" stroke-width="2.5" opacity=".6" fill="none"/>`),
    hairAcc('acc-star', 'star', 4.85, 0.2, 82, 'Star clip! ⭐', 60, 60, 0.7, `
      <path d="M30 4 L37 21 L56 22 L41 34 L46 53 L30 42 L14 53 L19 34 L4 22 L23 21 Z" fill="#F5DE7A" stroke="#4A3B5C" stroke-width="2" stroke-linejoin="round"/>
      <path d="M30 12 L33 22 L44 23" stroke="#fff" stroke-width="2.4" fill="none" opacity=".7" stroke-linecap="round"/>`),
    scaled(wearable('round', 0, 0, 'salon-glasses', { gx: 1.75, gy: 4.65, gz: 74 }), 0.7),
    scaled(wearable('straw', 0, 0, 'salon-hat', { gx: 2.3, gy: 4.75, gz: 74 }), 0.7),
    I('magazines', 6.4, 1.45, 0.42, 0.34, magazines, { small: true, gz: 64,
      onTap: (it, api) => api.bubble(it.x + it.w / 2, it.y, ['Top 10 hairstyles! 💇', 'Summer colours 🌈', 'Braids for beginners ✨'][Math.floor(Math.random() * 3)]) }),
  ],
};
