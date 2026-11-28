// 🛍️ Shop catalog for the player's own room: furniture & decor, wallpapers and floors.
// Art follows Olivia's room (src/scenes/room.js): smooth isometric boxes, soft ink lines, lilac / turquoise / sky / sun palette.
import { isoItem, at, shades } from './iso.js';
import { starPath } from './scenes/common.js';

const WOOD = '#C99A6C', WOOD_L = '#E2C29C', WOOD_D = '#B58456', CREAM = '#FBF7EF', LILAC = '#B79CF0', LILAC_L = '#C9B8F2', LILAC_D = '#8E7CC3',
  TEAL = '#7FCFC4', TEAL_D = '#3CC7B8', SKY = '#9CC8EE', SUN = '#F5DE7A', GREEN = '#6DBE7A', GREEN_D = '#4E9B5A', PLUM = '#5E4E7E', INKC = '#3E3252';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4"';
const LINE_J = `${line} stroke-linejoin="round"`;

// ---------- drawing kit ----------
// A box part (see iso.js boxPart). u,v = offset on the footprint (tiles), z = height above floor (px).
const B = (u, v, z, w, d, h, col, more = {}, k = 1) => ({ u, v, z, w, d, h, ...shades(col, k), ...more });
// One box part rendered on its own, so layers can be painted in an explicit back-to-front order.
const boxSvg = (p) => {
  const r = isoItem(1, 1, 0, [p]);
  const pre = `translate(${r.ax} ${r.ay})">`;
  return r.svg.slice(r.svg.indexOf(pre) + pre.length, -'</g></svg>'.length);
};
// An item from layers painted in the given order (box parts or raw SVG strings; falsy entries are skipped).
const build = (fw, fd, height, layers) => isoItem(fw, fd, height, [{
  svg: layers.filter(Boolean).map((l) => (typeof l === 'string' ? l : boxSvg(l))).join(''), u: 0, v: 0, w: 0, d: 0,
}]);
// Flat art on a front-left face plane (v = const; x runs along u) or a front-right one (u = const; x runs from v toward the back).
const faceL = (u, v, ztop, body) => { const [x, y] = at(u, v, ztop); return `<g transform="matrix(1,0.5,0,1,${x},${y})">${body}</g>`; };
const faceR = (u, v, ztop, body) => { const [x, y] = at(u, v, ztop); return `<g transform="matrix(1,-0.5,0,1,${x},${y})">${body}</g>`; };
// A round thing (pot, cup, lamp base): base centre (cx, cy) on screen, bottom radius rb, top radius rt, height h.
function frustum(cx, cy, rb, rt, h, col, { k = 1, top = true, topFill } = {}) {
  const s = shades(col, k), yt = cy - h;
  return `<path d="M${cx - rb} ${cy} A${rb} ${rb / 2} 0 0 0 ${cx} ${cy + rb / 2} L${cx} ${yt + rt / 2} A${rt} ${rt / 2} 0 0 1 ${cx - rt} ${yt} Z" fill="${s.left}"/>
    <path d="M${cx} ${cy + rb / 2} A${rb} ${rb / 2} 0 0 0 ${cx + rb} ${cy} L${cx + rt} ${yt} A${rt} ${rt / 2} 0 0 1 ${cx} ${yt + rt / 2} Z" fill="${s.right}"/>
    <path d="M${cx - rb} ${cy} A${rb} ${rb / 2} 0 0 0 ${cx + rb} ${cy} L${cx + rt} ${yt} M${cx - rt} ${yt} L${cx - rb} ${cy}" fill="none" ${LINE_J}/>
    ${top ? `<ellipse cx="${cx}" cy="${yt}" rx="${rt}" ry="${rt / 2}" fill="${topFill || s.top}" ${line}/>` : ''}`;
}
const legs4 = (u0, v0, u1, v1, s, h, col, z = 0) => [B(u0, v0, z, s, s, h, col), B(u1, v0, z, s, s, h, col), B(u0, v1, z, s, s, h, col), B(u1, v1, z, s, s, h, col)];
const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx / 2.2}" fill="${INKC}" opacity=".12"/>`;
const glow = (cx, cy, r, col = '#FFF3B0', o = 0.3) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" opacity="${o}"/>`;
// A thick outlined stroke (branches, poles, tripod legs).
const stick = (d, col, w = 5) => `<path d="${d}" fill="none" stroke="${INKC}" stroke-opacity=".55" stroke-width="${w + 2.6}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
// A leaf pointing up from (0,0), length l, half-width w.
const leafPath = (l, w) => `M0 0 C${w} ${-l * 0.25} ${w * 1.05} ${-l * 0.8} 0 ${-l} C${-w * 1.05} ${-l * 0.8} ${-w} ${-l * 0.25} 0 0Z`;
const xy = (p) => `${p[0]} ${p[1]}`;
const st = (it, def) => ({ ...def, ...(it && it.data) });
const qb = (p0, p1, p2, t) => [0, 1].map((i) => (1 - t) * (1 - t) * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i]);
const books = (x0, y, seed, n, gap = 15) => Array.from({ length: n }, (_, i) => {
  const hh = 24 + ((i * 7 + seed) % 12), col = [LILAC, TEAL, SUN, SKY, '#E58F6A', LILAC_L, GREEN][(i + seed) % 7];
  return `<rect x="${x0 + i * gap}" y="${y - hh}" width="${gap - 3}" height="${hh}" fill="${col}" ${line}/>`;
}).join('');

// ---------- tap behaviours ----------
const toggle = (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx?.click?.(); };
const toggleOpen = (it, api) => { it.data.open = !it.data.open; api.setArt(it); api.sfx?.click?.(); };
const boing = (it, api) => {
  if (it?.el) { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); }
  api?.sfx?.click?.();
};

// ======================= FURNITURE =======================
function sofa() {
  const body = LILAC, cush = '#CDBDF5';
  return build(2, 1, 96, [
    ...legs4(0.08, 0.08, 1.82, 0.82, 0.1, 8, WOOD_D),
    B(0, 0, 8, 2, 0.3, 84, body, { leftDecor: [26, 64, 102].map((x) => `<circle cx="${x}" cy="16" r="2.6" fill="#8E73D6"/>`).join('') }),
    B(0, 0.3, 8, 0.24, 0.7, 50, body),
    B(0.24, 0.3, 8, 1.52, 0.7, 30, body),
    B(0.26, 0.3, 38, 0.73, 0.68, 14, cush), B(1.01, 0.3, 38, 0.73, 0.68, 14, cush),
    faceL(0.34, 0.42, 76, `<rect width="30" height="26" rx="9" fill="${TEAL}" ${line}/>`),
    faceL(1.28, 0.42, 74, `<rect width="28" height="24" rx="9" fill="${SUN}" ${line}/>${starPath(14, 12, 6, '#fff', 'opacity=".7"')}`),
    B(1.76, 0.3, 8, 0.24, 0.7, 50, body),
  ]);
}
function armchair() {
  const body = TEAL, cush = CREAM;
  return build(1, 1, 96, [
    ...legs4(0.08, 0.08, 0.82, 0.82, 0.1, 8, WOOD_D),
    B(0, 0, 8, 1, 0.3, 84, body, { leftDecor: `<path d="M32 10 V40" stroke="#fff" stroke-opacity=".35" stroke-width="10"/>` }),
    B(0, 0.3, 8, 0.24, 0.7, 50, body),
    B(0.24, 0.3, 8, 0.52, 0.7, 30, body),
    B(0.25, 0.3, 38, 0.5, 0.68, 14, cush, {}, 0.6),
    faceL(0.36, 0.42, 74, `<rect width="22" height="22" rx="8" fill="${LILAC}" ${line}/>`),
    B(0.76, 0.3, 8, 0.24, 0.7, 50, body),
  ]);
}
function bunkbed() {
  const wood = WOOD, sheet = CREAM, pil = '#FFFFFF';
  const p = (u, z) => xy(at(u, 1.03, z));
  let ladder = stick(`M${p(1.42, 0)} L${p(1.42, 168)}`, WOOD_L, 4) + stick(`M${p(1.78, 0)} L${p(1.78, 168)}`, WOOD_L, 4);
  for (let z = 30; z < 160; z += 32) ladder += stick(`M${p(1.42, z)} L${p(1.78, z)}`, WOOD_L, 3.5);
  return build(2, 1, 232, [
    B(0, 0, 0, 0.12, 0.12, 226, wood),
    B(1.88, 0, 0, 0.12, 0.12, 226, wood),
    B(0, 0, 14, 2, 1, 20, wood),
    B(0.06, 0.06, 34, 1.88, 0.88, 12, sheet, {}, 0.6),
    B(0.12, 0.2, 46, 0.42, 0.6, 10, pil, {}, 0.5),
    B(0.75, 0.04, 42, 1.2, 0.92, 8, TEAL, { topDecor: '<path d="M0.3 0 V0.92 M0.7 0 V0.92" stroke="#fff" stroke-opacity=".45" stroke-width=".06"/>' }),
    B(0, 0, 124, 2, 1, 20, wood),
    B(0.06, 0.06, 144, 1.88, 0.88, 12, sheet, {}, 0.6),
    B(0.12, 0.2, 156, 0.42, 0.6, 10, pil, {}, 0.5),
    B(0.75, 0.04, 152, 1.2, 0.92, 8, LILAC, { topDecor: `<g transform="translate(.6 .46) scale(.01)">${starPath(0, 0, 18, SUN)}</g>` }),
    B(0, 0.88, 0, 0.12, 0.12, 226, wood),
    B(0.12, 0.94, 160, 1.22, 0.06, 26, WOOD_L, { leftDecor: `${starPath(40, 13, 7, SUN)}${starPath(78, 13, 7, TEAL)}` }),
    B(1.88, 0.88, 0, 0.12, 0.12, 226, wood),
    ladder,
  ]);
}
function canopyBed() {
  const wood = WOOD_L, fab = LILAC_L;
  const scallops = (len, n) => { let d = `M0 0 H${len} V10`; const s = len / n; for (let i = n; i > 0; i--) d += ` Q${(i - 0.5) * s} 22 ${(i - 1) * s} 10`; return `<path d="${d} Z" fill="${fab}" ${line}/>`; };
  const drape = (u, v, dir) => {
    const [x, yt] = at(u, v, 208), yb = yt + 150, ym = yt + 70;
    return `<path d="M${x} ${yt} L${x + dir * 26} ${yt + dir * 13} Q${x + dir * 9} ${ym - 14} ${x + dir * 5} ${ym} Q${x + dir * 16} ${yb - 20} ${x + dir * 22} ${yb} L${x} ${yb} Z" fill="${fab}" opacity=".92" ${line}/>
      <rect x="${x + (dir > 0 ? 0 : -9)}" y="${ym - 3}" width="9" height="6" rx="2" fill="${SUN}" ${line}/>`;
  };
  return build(2, 1.5, 234, [
    B(0, 0, 0, 0.1, 0.1, 222, wood),
    B(0, 0, 0, 0.12, 1.5, 96, WOOD, { rightDecor: `<path d="M8 20 Q48 -4 88 20" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="5"/>${starPath(48, 40, 14, SUN)}` }),
    B(1.9, 0, 0, 0.1, 0.1, 222, wood),
    B(0.12, 0, 0, 1.88, 1.5, 28, WOOD),
    B(0.14, 0.06, 28, 1.8, 1.38, 16, CREAM, {}, 0.6),
    B(0.2, 0.16, 44, 0.42, 0.52, 12, '#FFFFFF', {}, 0.5), B(0.2, 0.8, 44, 0.42, 0.52, 12, '#FFFFFF', {}, 0.5),
    B(0.8, 0.03, 38, 1.2, 1.44, 9, TEAL, { topDecor: '<path d="M0.25 0 V1.44 M0.6 0 V1.44 M0.95 0 V1.44" stroke="#fff" stroke-opacity=".45" stroke-width=".05"/>' }),
    B(0, 1.4, 0, 0.1, 0.1, 222, wood),
    B(-0.02, -0.02, 208, 2.04, 1.54, 10, CREAM, { top: '#EDE6F8' }),
    B(1.9, 1.4, 0, 0.1, 0.1, 222, wood),
    drape(0.05, 1.47, 1), drape(1.95, 1.47, -1),
    faceL(-0.02, 1.52, 206, scallops(2.04 * 64, 8)),
    faceR(2.02, 1.52, 206, scallops(1.54 * 64, 6)),
    drape(2.0, 1.45, 1), drape(2.0, 0.05, -1),
  ]);
}
function coffeeTable() {
  const top = WOOD_L, leg = WOOD_D;
  return build(2, 1, 48, [
    B(0.08, 0.08, 0, 0.1, 0.1, 36, leg),
    B(0.12, 0.12, 8, 1.76, 0.76, 4, shades(top).right),
    B(0.5, 0.25, 12, 0.5, 0.4, 3, SKY), B(0.55, 0.3, 15, 0.45, 0.34, 3, SUN),
    B(1.82, 0.08, 0, 0.1, 0.1, 36, leg), B(0.08, 0.82, 0, 0.1, 0.1, 36, leg), B(1.82, 0.82, 0, 0.1, 0.1, 36, leg),
    B(0, 0, 36, 2, 1, 8, top, { leftDecor: `<path d="M0 4 H128" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>` }),
  ]);
}
function craftTable() {
  const leg = TEAL_D;
  return build(2, 1, 84, [
    ...legs4(0.06, 0.06, 1.84, 0.84, 0.1, 72, leg),
    B(0, 0, 72, 2, 1, 8, CREAM, {
      topDecor: [[0.4, 0.3, 0.1, LILAC], [0.62, 0.45, 0.07, SUN], [1.5, 0.6, 0.09, SKY], [1.3, 0.3, 0.06, TEAL]].map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".85"/>`).join('')
        + '<path d="M0.9 0.7 q.15 -.12 .3 0 t.3 0" fill="none" stroke="#B79CF0" stroke-width=".035" stroke-linecap="round"/>',
      leftDecor: `<path d="M0 8 H128" stroke="${TEAL}" stroke-width="3" opacity=".7"/>`,
    }, 0.6),
  ]);
}
function bookcase() {
  return build(2, 0.5, 200, [
    B(0, 0, 0, 2, 0.5, 196, '#F2EADF', {
      leftDecor: `<rect x="6" y="6" width="116" height="184" rx="2" fill="#DCD0EE"/>
        ${[64, 126, 188].map((y) => `<rect x="5" y="${y}" width="118" height="6" fill="#F2EADF" ${line}/>`).join('')}
        ${books(10, 64, 1, 5)}<path d="M90 64 l18 -28 l6 4 l-16 24 z" fill="${SKY}" ${line}/>
        ${books(10, 126, 4, 3)}<circle cx="72" cy="114" r="11" fill="${SUN}" ${line}/>${starPath(100, 112, 11, TEAL, line)}
        <rect x="12" y="160" width="44" height="28" rx="5" fill="${TEAL}" ${line}/><rect x="66" y="160" width="44" height="28" rx="5" fill="${LILAC}" ${line}/>
        <path d="M20 170 H48 M74 170 H102" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`,
    }),
  ]);
}
function dresser() {
  return build(1.5, 0.75, 100, [
    ...legs4(0.06, 0.06, 1.34, 0.6, 0.1, 8, WOOD_D),
    B(0, 0, 8, 1.5, 0.75, 80, SKY, {
      leftDecor: [8, 32, 56].map((y) => `<rect x="7" y="${y}" width="82" height="20" rx="4" fill="#CFE4F8" ${line}/><circle cx="48" cy="${y + 10}" r="3.5" fill="${SUN}" ${line}/>`).join(''),
    }),
    B(-0.03, -0.03, 88, 1.56, 0.81, 6, CREAM),
  ]);
}
function vanity() {
  const bulbs = Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (0.05 + 0.9 * i / 8); return `<circle cx="${25.6 - Math.cos(a) * 29}" cy="${52 - Math.sin(a) * 50}" r="3" fill="${SUN}" ${line}/>`; }).join('');
  return build(1.5, 0.75, 176, [
    B(0.06, 0.06, 0, 0.08, 0.08, 62, WOOD_D), B(1.36, 0.06, 0, 0.08, 0.08, 62, WOOD_D),
    B(0.06, 0.06, 40, 1.38, 0.62, 22, CREAM, { leftDecor: `<rect x="6" y="4" width="76" height="14" rx="3" fill="none" ${line}/><circle cx="44" cy="11" r="2.8" fill="${SUN}" ${line}/>` }),
    B(0.06, 0.6, 0, 0.08, 0.08, 62, WOOD_D), B(1.36, 0.6, 0, 0.08, 0.08, 62, WOOD_D),
    B(0, 0, 62, 1.5, 0.75, 7, LILAC),
    faceL(0.35, 0.12, 170, `<ellipse cx="25.6" cy="52" rx="25.6" ry="48" fill="${LILAC}" ${line}/><ellipse cx="25.6" cy="54" rx="19" ry="40" fill="#D6EAF7" ${line}/>
      <path d="M14 40 L26 26 M14 54 L32 34" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>${bulbs}${starPath(25.6, 0, 7, SUN, line)}`),
  ]);
}
function gamingChair() {
  const [cx, cy] = at(0.5, 0.5);
  const spokes = Array.from({ length: 5 }, (_, i) => { const a = Math.PI / 2 + i * Math.PI * 2 / 5; return [cx + Math.cos(a) * 34, cy + Math.sin(a) * 17]; });
  return build(1, 1, 140, [
    shadow(cx, cy + 2, 40),
    spokes.filter(([, y]) => y < cy).map(([x, y]) => stick(`M${cx} ${cy - 4} L${x} ${y}`, PLUM, 4) + `<circle cx="${x}" cy="${y + 3}" r="4" fill="${INKC}" opacity=".8"/>`).join(''),
    frustum(cx, cy - 4, 4, 4, 40, PLUM),
    spokes.filter(([, y]) => y >= cy).map(([x, y]) => stick(`M${cx} ${cy - 4} L${x} ${y}`, PLUM, 4) + `<circle cx="${x}" cy="${y + 3}" r="4" fill="${INKC}" opacity=".8"/>`).join(''),
    B(0.15, 0.08, 50, 0.7, 0.14, 84, LILAC, { leftDecor: `<rect x="8" y="0" width="7" height="84" fill="${TEAL}"/><rect x="30" y="0" width="7" height="84" fill="${TEAL}"/><rect x="10" y="8" width="25" height="14" rx="5" fill="${CREAM}" ${line}/>` }),
    B(0.15, 0.22, 44, 0.7, 0.62, 14, LILAC, { topDecor: `<rect x=".1" y=".1" width=".5" height=".42" rx=".06" fill="${TEAL}" opacity=".5"/>` }),
    B(0.08, 0.5, 50, 0.05, 0.05, 14, PLUM), B(0.06, 0.32, 64, 0.09, 0.5, 5, PLUM),
    B(0.87, 0.5, 50, 0.05, 0.05, 14, PLUM), B(0.85, 0.32, 64, 0.09, 0.5, 5, PLUM),
  ]);
}
function piano() {
  const keys = (() => {
    let s = '<rect x=".04" y=".04" width="1.84" height=".22" fill="#fff"/>';
    for (let i = 1; i < 23; i++) s += `<path d="M${0.04 + i * 0.08} .04 V.26" stroke="#3E3252" stroke-opacity=".35" stroke-width=".008"/>`;
    for (let i = 1; i < 23; i++) if (![3, 7, 10, 14, 17, 21].includes(i)) s += `<rect x="${0.04 + i * 0.08 - 0.022}" y=".04" width=".044" height=".13" fill="#3E3252"/>`;
    return s;
  })();
  return build(2, 0.75, 140, [
    B(0, 0, 0, 2, 0.42, 128, LILAC_D, {
      leftDecor: `<rect x="44" y="28" width="40" height="24" rx="2" fill="${CREAM}" ${line}/><path d="M50 36 H78 M50 42 H78" stroke="#3E3252" stroke-opacity=".3" stroke-width="1.5"/>
        <rect x="10" y="74" width="108" height="46" rx="4" fill="none" ${line}/>${starPath(64, 97, 9, SUN)}
        <rect x="52" y="120" width="8" height="5" fill="${SUN}"/><rect x="68" y="120" width="8" height="5" fill="${SUN}"/>`,
    }),
    B(-0.02, -0.02, 128, 2.04, 0.46, 5, '#7A64B0'),
    B(0.08, 0.62, 0, 0.08, 0.08, 62, '#7A64B0'), B(1.84, 0.62, 0, 0.08, 0.08, 62, '#7A64B0'),
    B(0.04, 0.42, 62, 1.92, 0.3, 10, '#7A64B0', { topDecor: keys }),
  ]);
}
function floorCushions() {
  const [cx, cy] = at(0.5, 0.5);
  const tufts = (x, y) => `<path d="M${x - 12} ${y} L${x - 5} ${y} M${x + 5} ${y} L${x + 12} ${y} M${x} ${y - 6} L${x} ${y - 3} M${x} ${y + 3} L${x} ${y + 6}" stroke="#3E3252" stroke-opacity=".3" stroke-width="1.5" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="2.6" fill="#3E3252" opacity=".35"/>`;
  return build(1, 1, 36, [
    shadow(cx, cy + 4, 50),
    frustum(cx, cy + 4, 46, 44, 14, TEAL), tufts(cx, cy - 10),
    frustum(cx + 4, cy - 12, 36, 34, 12, SUN), tufts(cx + 4, cy - 24),
  ]);
}
function beanbag() {
  const [cx, cy] = at(0.5, 0.5);
  return build(1, 1, 70, [`<ellipse cx="${cx}" cy="${cy + 4}" rx="70" ry="30" fill="${INKC}" opacity=".12"/>
    <path d="M${cx - 66} ${cy} C${cx - 70} ${cy - 60} ${cx - 20} ${cy - 76} ${cx + 10} ${cy - 66} C${cx + 60} ${cy - 56} ${cx + 72} ${cy - 18} ${cx + 64} ${cy + 4} C${cx + 40} ${cy + 26} ${cx - 40} ${cy + 26} ${cx - 66} ${cy} Z" fill="${TEAL}" ${line}/>
    <path d="M${cx + 64} ${cy + 4} C${cx + 40} ${cy + 26} ${cx - 40} ${cy + 26} ${cx - 66} ${cy} C${cx - 30} ${cy + 10} ${cx + 30} ${cy + 10} ${cx + 64} ${cy + 4} Z" fill="#3E3252" opacity=".08"/>
    <path d="M${cx - 40} ${cy - 30} Q${cx} ${cy - 10} ${cx + 40} ${cy - 30}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="5" stroke-linecap="round"/>
    ${starPath(cx + 26, cy - 46, 8, '#fff', 'opacity=".7"')}`]);
}

// ======================= DECOR =======================
function rugRound() {
  return build(2, 2, 4, [B(0, 0, 0, 2, 2, 0, LILAC_L, {
    round: true, top: LILAC_L,
    topDecor: `<circle cx="1" cy="1" r=".82" fill="none" stroke="#fff" stroke-width=".05" stroke-dasharray=".14 .1"/><circle cx="1" cy="1" r=".55" fill="${TEAL}"/>
      <circle cx="1" cy="1" r=".3" fill="${SUN}"/>${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<circle cx="${1 + Math.cos(a) * 0.68}" cy="${1 + Math.sin(a) * 0.68}" r=".05" fill="#fff"/>`; }).join('')}`,
  })]);
}
function rugRect() {
  const fringe = (x) => Array.from({ length: 9 }, (_, i) => `<path d="M${x} ${0.15 + i * 0.21} h${x ? 0.1 : -0.1}" stroke="${CREAM}" stroke-width=".035"/>`).join('');
  const diamonds = Array.from({ length: 4 }, (_, i) => `<path d="M${0.75 + i * 0.5} .62 l.18 .38 l-.18 .38 l-.18 -.38 z" fill="${i % 2 ? SUN : LILAC}"/>`).join('');
  return build(3, 2, 4, [B(0, 0, 0, 3, 2, 0, SKY, {
    top: SKY,
    topDecor: `<rect x=".14" y=".14" width="2.72" height="1.72" fill="none" stroke="${CREAM}" stroke-width=".07"/><rect x=".3" y=".3" width="2.4" height="1.4" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width=".03" stroke-dasharray=".1 .08"/>
      ${diamonds}${fringe(0)}${fringe(3)}`,
  })]);
}
function globe() {
  const [cx, cy] = at(0.2, 0.2);
  return build(0.4, 0.4, 62, [
    frustum(cx, cy, 13, 9, 6, WOOD),
    stick(`M${cx} ${cy - 6} V${cy - 18}`, WOOD_D, 3),
    `<circle cx="${cx}" cy="${cy - 40}" r="19" fill="${SKY}" ${line}/>
     <path d="M${cx - 12} ${cy - 50} q6 -6 12 -2 q4 6 -2 9 q-6 2 -4 8 q-6 1 -8 -6 z M${cx + 4} ${cy - 34} q8 -4 11 2 q-2 8 -9 9 q-4 -5 -2 -11z" fill="${GREEN}" ${line}/>
     <path d="M${cx - 10} ${cy - 47} q3 -2 6 0" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none" stroke-linecap="round"/>
     <path d="M${cx - 4} ${cy - 63} A24 24 0 0 1 ${cx - 4} ${cy - 17}" fill="none" stroke="${WOOD_D}" stroke-width="3.5" stroke-linecap="round"/>`,
  ]);
}
function snowGlobe() {
  const [cx, cy] = at(0.15, 0.15);
  return build(0.3, 0.3, 46, [
    `<circle cx="${cx}" cy="${cy - 26}" r="16" fill="#DDF0FB" ${line}/>
     <ellipse cx="${cx}" cy="${cy - 17}" rx="12" ry="4" fill="#fff"/>
     <path d="M${cx} ${cy - 38} l7 14 h-14 z" fill="${GREEN}" ${line}/><rect x="${cx - 1.5}" y="${cy - 24}" width="3" height="4" fill="${WOOD_D}"/>
     ${[[-9, -32], [8, -35], [-5, -40], [10, -24], [-11, -22], [3, -30]].map(([x, y]) => `<circle cx="${cx + x}" cy="${cy + y}" r="1.3" fill="#fff"/>`).join('')}
     <path d="M${cx - 10} ${cy - 34} A12 12 0 0 1 ${cx - 2} ${cy - 39}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`,
    frustum(cx, cy, 15, 12, 10, LILAC),
    starPath(cx, cy - 4, 3.5, SUN),
  ]);
}
function cakeStand() {
  const [cx, cy] = at(0.2, 0.2);
  const drips = `<path d="M${cx - 15} ${cy - 37} A15 7.5 0 0 0 ${cx + 15} ${cy - 37} V${cy - 33} q-3 6 -5 0 q-3 7 -6 1 q-3 8 -6 0 q-3 6 -6 1 q-3 6 -5 -1 Z" fill="${LILAC}" ${line}/>`;
  return build(0.4, 0.4, 56, [
    frustum(cx, cy, 10, 5, 4, CREAM, { k: 0.6 }),
    `<rect x="${cx - 2.5}" y="${cy - 20}" width="5" height="16" fill="${CREAM}" ${line}/>`,
    frustum(cx, cy - 18, 22, 22, 3, CREAM, { k: 0.6 }),
    frustum(cx, cy - 21, 15, 15, 16, '#F7EBD3', { top: false }),
    drips, `<ellipse cx="${cx}" cy="${cy - 37}" rx="15" ry="7.5" fill="${LILAC_L}" ${line}/>`,
    `<rect x="${cx - 2}" y="${cy - 50}" width="4" height="12" rx="1.5" fill="${TEAL}" ${line}/><path d="M${cx} ${cy - 57} q4 4 0 7 q-4 -3 0 -7z" fill="${SUN}" ${line}/>`,
    [[-8, -38], [7, -36], [3, -40]].map(([x, y]) => `<circle cx="${cx + x}" cy="${cy + y}" r="1.4" fill="${SUN}"/>`).join(''),
  ]);
}
function aquarium() {
  const fish = (x, y, c, flip = 1) => `<g transform="translate(${x} ${y}) scale(${flip} 1)"><path d="M7 0 l8 -6 v12 z" fill="${c}" ${line}/><ellipse rx="9" ry="5.5" fill="${c}" ${line}/><circle cx="-4" cy="-1" r="1.2" fill="#3E3252"/></g>`;
  return build(1.5, 0.6, 136, [
    B(0, 0, 0, 1.5, 0.6, 58, WOOD, { leftDecor: `<rect x="6" y="8" width="40" height="42" rx="3" fill="none" ${line}/><rect x="50" y="8" width="40" height="42" rx="3" fill="none" ${line}/><circle cx="40" cy="29" r="2.5" fill="${SUN}"/><circle cx="56" cy="29" r="2.5" fill="${SUN}"/>` }),
    B(0.03, 0.03, 58, 1.44, 0.54, 64, '#BFE8F0', {
      top: '#D9F3F6',
      leftDecor: `<path d="M0 52 Q20 46 46 52 T92 50 V64 H0 Z" fill="${SUN}" opacity=".85"/>
        <path d="M14 56 q-6 -12 0 -22 q6 -10 0 -20" fill="none" stroke="${GREEN}" stroke-width="4" stroke-linecap="round"/><path d="M76 56 q6 -10 0 -18 q-5 -8 1 -16" fill="none" stroke="${GREEN_D}" stroke-width="4" stroke-linecap="round"/>
        ${fish(40, 24, SUN)}${fish(62, 40, LILAC, -1)}${fish(30, 44, TEAL_D, -1)}
        ${[[52, 12, 2.4], [56, 4, 1.6], [24, 16, 1.8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fff" stroke-width="1.2"/>`).join('')}
        <path d="M4 4 L18 4" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>`,
      rightDecor: `<path d="M0 50 Q16 46 34 50 V64 H0 Z" fill="${SUN}" opacity=".7"/>${fish(18, 26, TEAL_D, -1)}`,
    }),
    B(-0.01, -0.01, 122, 1.52, 0.62, 6, LILAC),
  ]);
}
function floorMirror() {
  const arch = (inset, h) => { const w = 51.2 - inset * 2, r = w / 2; return `M${inset} ${h} V${r + inset} A${r} ${r} 0 0 1 ${inset + w} ${r + inset} V${h} Z`; };
  return build(0.8, 0.3, 192, [
    faceL(0, 0.12, 186, `<path d="${arch(0, 186)}" fill="#7A64B0"/>`),
    faceL(0, 0.2, 186, `<path d="${arch(0, 186)}" fill="${LILAC}" ${line}/><path d="${arch(6, 180)}" fill="#D6EAF7" ${line}/>
      <path d="M14 60 L36 36 M14 84 L40 56 M16 150 L30 136" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75"/>${starPath(25.6, 4, 7, SUN, line)}`),
  ]);
}

// ======================= PLANTS =======================
function monstera() {
  const [cx, cy] = at(0.5, 0.5), by = cy - 48;
  const leaf = (ang, l, w, col) => `<g transform="translate(${cx} ${by + 2}) rotate(${ang})"><path d="M0 0 V${-l * 0.4}" stroke="${GREEN_D}" stroke-width="3.5" stroke-linecap="round"/>
    <g transform="translate(0 ${-l * 0.36})"><path d="${leafPath(l * 0.64, w)}" fill="${col}" ${line}/><path d="M0 -4 V${-l * 0.6}" stroke="${GREEN_D}" stroke-width="1.6" opacity=".7"/>
    ${[0.25, 0.45].map((t) => `<path d="M0 ${-l * 0.64 * t} l${w * 0.9} ${-l * 0.08} M0 ${-l * 0.64 * (t + 0.08)} l${-w * 0.9} ${-l * 0.08}" stroke="${CREAM}" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>`).join('')}</g></g>`;
  return build(1, 1, 170, [
    leaf(-62, 92, 26, '#5AAE6A'), leaf(58, 96, 26, '#5AAE6A'), leaf(-28, 122, 30, GREEN), leaf(24, 128, 30, '#7FCF8A'), leaf(-4, 104, 26, GREEN),
    frustum(cx, cy, 28, 34, 48, CREAM, { top: false }),
    frustum(cx, cy - 30, 32, 34, 10, TEAL, { top: false }),
    `<ellipse cx="${cx}" cy="${by}" rx="34" ry="17" fill="${CREAM}" ${line}/><ellipse cx="${cx}" cy="${by + 1}" rx="28" ry="13" fill="#8B6450"/>`,
    leaf(-40, 70, 22, '#6DBE7A'), leaf(36, 64, 20, '#5AAE6A'),
  ]);
}
function cactusTrio() {
  const pots = [[0.1, LILAC], [0.26, CREAM], [0.42, TEAL]];
  const plant = [
    (x, y) => `<rect x="${x - 4.5}" y="${y - 28}" width="9" height="30" rx="4.5" fill="${GREEN}" ${line}/><path d="M${x + 4} ${y - 14} h5 v-8" fill="none" stroke="${INKC}" stroke-opacity=".5" stroke-width="6" stroke-linecap="round"/><path d="M${x + 4} ${y - 14} h5 v-8" fill="none" stroke="${GREEN}" stroke-width="3.6" stroke-linecap="round"/>`,
    (x, y) => `<circle cx="${x}" cy="${y - 8}" r="8" fill="#5AAE6A" ${line}/><circle cx="${x}" cy="${y - 16}" r="3.4" fill="${SUN}" ${line}/>`,
    (x, y) => `<ellipse cx="${x - 1}" cy="${y - 10}" rx="6" ry="9" fill="${GREEN}" ${line}/><ellipse cx="${x + 5}" cy="${y - 20}" rx="4.5" ry="6.5" fill="#7FCF8A" ${line}/>`,
  ];
  return build(0.52, 0.3, 42, pots.map(([u, c], i) => { const [x, y] = at(u, 0.15); return plant[i](x, y - 10) + frustum(x, y, 5.5, 7.5, 11, c); }));
}
function pothos() {
  const [cx, cy] = at(0.35, 0.35), ty = cy - 88, py = ty - 5, rim = py - 28;
  const leafAt = ([x, y], i, s = 1) => `<path transform="translate(${x} ${y}) rotate(${(i % 2 ? 1 : -1) * 70 + 180}) scale(${s})" d="${leafPath(11, 6)}" fill="${i % 3 ? GREEN : '#5AAE6A'}" ${line}/>`;
  const vine = (p0, p1, p2, n) => `<path d="M${p0} Q${p1} ${p2}" fill="none" stroke="${GREEN_D}" stroke-width="2"/>` + Array.from({ length: n }, (_, i) => leafAt(qb(p0, p1, p2, (i + 1) / n), i)).join('');
  return build(0.7, 0.7, 150, [
    stick(`M${cx + 4} ${ty} L${cx + 6} ${cy - 12}`, WOOD_D, 4),
    stick(`M${cx - 10} ${ty} L${cx - 26} ${cy + 6}`, WOOD, 4), stick(`M${cx + 10} ${ty} L${cx + 26} ${cy + 6}`, WOOD, 4),
    frustum(cx, ty, 24, 24, 5, WOOD),
    vine([cx + 12, rim - 2], [cx + 34, rim + 10], [cx + 38, cy - 40], 6),
    frustum(cx, py, 15, 19, 28, SKY),
    `<ellipse cx="${cx}" cy="${rim + 1}" rx="15" ry="7" fill="#8B6450"/>`,
    [[-20, 0, 1], [-8, -14, 1.1], [8, -12, 1], [18, -4, 0.9], [0, -6, 1.2]].map(([x, y, s], i) => `<path transform="translate(${cx + x * 0.3} ${rim}) rotate(${x * 2.6}) scale(${s})" d="${leafPath(16, 8)}" fill="${i % 2 ? GREEN : '#7FCF8A'}" ${line}/>`).join(''),
    vine([cx - 14, rim + 2], [cx - 40, rim + 8], [cx - 34, cy - 20], 7),
    vine([cx - 2, rim + 8], [cx - 10, rim + 40], [cx - 6, cy - 46], 5),
  ]);
}
function flowerVase() {
  const [cx, cy] = at(0.15, 0.15);
  const daisy = (x, y, c = '#fff') => Array.from({ length: 6 }, (_, i) => `<ellipse cx="${x + Math.cos(i * Math.PI / 3) * 4.5}" cy="${y + Math.sin(i * Math.PI / 3) * 4.5}" rx="3.2" ry="3.2" fill="${c}" ${line}/>`).join('') + `<circle cx="${x}" cy="${y}" r="3" fill="${SUN}" ${line}/>`;
  const tulip = (x, y) => `<path d="M${x - 5} ${y - 6} l2.5 4 l2.5 -5 l2.5 5 l2.5 -4 v5 q0 6 -5 6 q-5 0 -5 -6z" fill="${LILAC}" ${line}/>`;
  return build(0.3, 0.3, 64, [
    `<path d="M${cx} ${cy - 22} Q${cx - 6} ${cy - 40} ${cx - 13} ${cy - 46} M${cx} ${cy - 22} Q${cx + 1} ${cy - 44} ${cx + 1} ${cy - 54} M${cx} ${cy - 22} Q${cx + 8} ${cy - 36} ${cx + 13} ${cy - 44}" fill="none" stroke="${GREEN_D}" stroke-width="2"/>
     <path transform="translate(${cx - 3} ${cy - 30}) rotate(-50)" d="${leafPath(10, 4)}" fill="${GREEN}" ${line}/>`,
    daisy(cx - 13, cy - 47), tulip(cx + 1, cy - 54), daisy(cx + 13, cy - 45, '#E8F4FD'),
    frustum(cx, cy, 8, 5, 14, SKY, { top: false }), frustum(cx, cy - 14, 5, 6, 8, SKY),
    `<path d="M${cx - 6} ${cy - 4} H${cx + 6}" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`,
  ]);
}
function lemonTree() {
  const [cx, cy] = at(0.5, 0.5), top = cy - 150;
  const blobs = [[-30, 12, 30, '#5AAE6A'], [30, 8, 28, '#5AAE6A'], [0, -18, 34, GREEN], [-14, 22, 28, GREEN], [16, 26, 26, '#7FCF8A'], [-4, 6, 22, '#7FCF8A']];
  return build(1, 1, 190, [
    shadow(cx, cy + 4, 34),
    frustum(cx, cy, 26, 32, 40, CREAM, { top: false }), frustum(cx, cy - 26, 30, 32, 8, SUN, { top: false }),
    `<ellipse cx="${cx}" cy="${cy - 40}" rx="32" ry="16" fill="${CREAM}" ${line}/><ellipse cx="${cx}" cy="${cy - 39}" rx="26" ry="12" fill="#8B6450"/>`,
    stick(`M${cx} ${cy - 40} Q${cx - 4} ${cy - 80} ${cx + 2} ${top + 20}`, '#8B6450', 7),
    blobs.map(([x, y, r, c]) => `<circle cx="${cx + x}" cy="${top + y}" r="${r}" fill="${c}" ${line}/>`).join(''),
    [[-30, 20], [22, 18], [6, -18], [-12, -6], [34, 0], [-2, 36], [-38, -4]].map(([x, y]) => `<ellipse cx="${cx + x}" cy="${top + y}" rx="7" ry="5.4" fill="${SUN}" ${line}/><path d="M${cx + x - 3} ${top + y - 2} q2 -1.5 4 0" stroke="#fff" stroke-width="1.4" fill="none" opacity=".8"/>`).join(''),
  ]);
}

// ======================= LIGHTS =======================
function lavaLamp(it) {
  const { on } = st(it, { on: true });
  const [cx, cy] = at(0.125, 0.125), g0 = cy - 16, g1 = cy - 62;
  return build(0.25, 0.25, 74, [
    on && glow(cx, cy - 40, 34, '#C9F2EC', 0.45),
    `<path d="M${cx - 6} ${g0} Q${cx - 11} ${cy - 40} ${cx - 5} ${g1} H${cx + 5} Q${cx + 11} ${cy - 40} ${cx + 6} ${g0} Z" fill="${on ? TEAL : '#C4E6E1'}" ${line}/>
     <ellipse cx="${cx - 1}" cy="${cy - 26}" rx="4" ry="5" fill="${on ? SUN : '#EFE6C2'}"/><ellipse cx="${cx + 2}" cy="${cy - 42}" rx="3.5" ry="4.5" fill="${on ? LILAC : '#DCD3EE'}"/><circle cx="${cx - 2}" cy="${cy - 53}" r="2.4" fill="${on ? SUN : '#EFE6C2'}"/>
     <path d="M${cx - 5} ${cy - 22} q-2 -12 0 -24" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" fill="none"/>`,
    frustum(cx, cy, 10, 6, 16, LILAC_D),
    frustum(cx, g1, 5, 3, 8, LILAC_D),
  ]);
}
function fairyTree(it) {
  const { on } = st(it, { on: true });
  const [cx, cy] = at(0.5, 0.5), b = cy - 36;
  const br = [[[0, 0], [0, -70], [3, -150]], [[0, -48], [-40, -100], [-54, -134]], [[0, -58], [40, -96], [50, -130]], [[1, -92], [-18, -132], [-24, -160]], [[2, -104], [24, -140], [30, -164]]]
    .map((p) => p.map(([x, y]) => [cx + x, b + y]));
  const cols = [SUN, TEAL, LILAC_L, SKY, '#F0B39A'];
  const bulbs = br.flatMap((p, j) => [0.45, 0.75, 1].map((t, i) => [...qb(...p, t), cols[(i + j * 2) % 5]]));
  return build(1, 1, 190, [
    shadow(cx, cy + 4, 30),
    br.map(([p0, p1, p2]) => stick(`M${p0} Q${p1} ${p2}`, '#F2EADF', 5)).join(''),
    on && bulbs.map(([x, y, c]) => glow(x, y, 9, c, 0.4)).join(''),
    bulbs.map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="${on ? c : '#E5DFEE'}" ${line}/>`).join(''),
    frustum(cx, cy, 22, 26, 36, CREAM, { topFill: '#8B6450' }),
    `<path d="M${cx - 22} ${cy - 18} H${cx + 22}" stroke="${TEAL}" stroke-width="4" opacity=".7"/>`,
  ]);
}
function neonStar(it) {
  const { on } = st(it, { on: true });
  const [cx, cy] = at(0.3, 0.2, 62);
  const star = (stroke, w, extra = '') => starPath(cx, cy, 36, 'none', `stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round" ${extra}`);
  return build(0.6, 0.4, 100, [
    on && glow(cx, cy, 64, SUN, 0.22),
    stick(`M${cx} ${cy + 16} V${at(0.3, 0.2, 12)[1]}`, '#A9AEC2', 3),
    B(0.06, 0.04, 0, 0.48, 0.32, 12, LILAC_D),
    on && star(SUN, 16, 'opacity=".35"'),
    star(INKC, 8.6, 'stroke-opacity=".5"'),
    star(on ? '#FFF6B8' : '#E8E0C4', 6),
  ]);
}
function arcLamp(it) {
  const { on } = st(it, { on: true });
  const [bx, by] = at(0.22, 0.22), [sx] = at(0.8, 0.6), sy = -104;
  return build(0.9, 0.8, 176, [
    on && glow(sx, sy + 14, 62),
    frustum(bx, by, 18, 16, 8, PLUM),
    stick(`M${bx} ${by - 8} C${bx - 8} ${by - 170} ${sx + 4} ${sy - 96} ${sx} ${sy - 24}`, '#7A64B0', 4),
    `<ellipse cx="${sx}" cy="${sy}" rx="26" ry="9" fill="${on ? '#FFF0A0' : '#5FB7AC'}" ${line}/>
     <path d="M${sx - 26} ${sy} Q${sx - 25} ${sy - 28} ${sx} ${sy - 28} Q${sx + 25} ${sy - 28} ${sx + 26} ${sy} A26 9 0 0 1 ${sx - 26} ${sy} Z" fill="${TEAL}" ${line}/>
     <path d="M${sx - 14} ${sy - 18} Q${sx - 4} ${sy - 25} ${sx + 6} ${sy - 24}" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  ]);
}
function mushroomLamp(it) {
  const { on } = st(it, { on: true });
  const [cx, cy] = at(0.15, 0.15);
  return build(0.3, 0.3, 40, [
    on && glow(cx, cy - 22, 30),
    frustum(cx, cy, 7, 5, 18, on ? '#FFF6D0' : CREAM, { top: false }),
    `<path d="M${cx - 19} ${cy - 18} Q${cx - 19} ${cy - 40} ${cx} ${cy - 40} Q${cx + 19} ${cy - 40} ${cx + 19} ${cy - 18} Q${cx} ${cy - 10} ${cx - 19} ${cy - 18} Z" fill="${on ? LILAC_L : LILAC}" ${line}/>
     ${[[-9, -27, 3], [6, -32, 2.6], [11, -22, 2.2], [-2, -21, 2]].map(([x, y, r]) => `<circle cx="${cx + x}" cy="${cy + y}" r="${r}" fill="${CREAM}"/>`).join('')}`,
  ]);
}

// ======================= FUN =======================
function teddy() {
  const [cx, cy] = at(0.2, 0.2), F = WOOD, M = '#F2E3CC';
  return build(0.4, 0.4, 56, [
    `<ellipse cx="${cx}" cy="${cy - 15}" rx="16" ry="15" fill="${F}" ${line}/><ellipse cx="${cx}" cy="${cy - 12}" rx="9" ry="8" fill="${M}"/>
     <ellipse cx="${cx - 17}" cy="${cy - 18}" rx="5.5" ry="8" fill="${F}" ${line} transform="rotate(20 ${cx - 17} ${cy - 18})"/><ellipse cx="${cx + 17}" cy="${cy - 18}" rx="5.5" ry="8" fill="${F}" ${line} transform="rotate(-20 ${cx + 17} ${cy - 18})"/>
     <ellipse cx="${cx - 9}" cy="${cy - 3}" rx="7" ry="5" fill="${F}" ${line}/><ellipse cx="${cx + 9}" cy="${cy - 3}" rx="7" ry="5" fill="${F}" ${line}/>
     <circle cx="${cx - 11}" cy="${cy - 51}" r="6" fill="${F}" ${line}/><circle cx="${cx + 11}" cy="${cy - 51}" r="6" fill="${F}" ${line}/>
     <circle cx="${cx - 11}" cy="${cy - 51}" r="3" fill="${M}"/><circle cx="${cx + 11}" cy="${cy - 51}" r="3" fill="${M}"/>
     <circle cx="${cx}" cy="${cy - 40}" r="14" fill="${F}" ${line}/><ellipse cx="${cx}" cy="${cy - 35}" rx="6.5" ry="5" fill="${M}"/>
     <ellipse cx="${cx}" cy="${cy - 37}" rx="2.4" ry="1.7" fill="${INKC}"/><path d="M${cx - 2} ${cy - 33} Q${cx} ${cy - 31.5} ${cx + 2} ${cy - 33}" stroke="${INKC}" stroke-width="1.2" fill="none"/>
     <circle cx="${cx - 5}" cy="${cy - 43}" r="1.8" fill="${INKC}"/><circle cx="${cx + 5}" cy="${cy - 43}" r="1.8" fill="${INKC}"/>
     <path d="M${cx - 8} ${cy - 28} L${cx} ${cy - 25} L${cx + 8} ${cy - 28} L${cx + 8} ${cy - 21} L${cx} ${cy - 25} L${cx - 8} ${cy - 21} Z" fill="${TEAL}" ${line}/>`,
  ]);
}
function rocket() {
  const [cx, cy] = at(0.4, 0.4), b = cy - 14;
  return build(0.8, 0.8, 140, [
    shadow(cx, cy, 30),
    `<path d="M${cx - 16} ${b - 40} Q${cx - 36} ${b - 18} ${cx - 34} ${cy - 2} L${cx - 16} ${b - 4} Z" fill="${TEAL}" ${line}/>
     <path d="M${cx + 16} ${b - 40} Q${cx + 36} ${b - 18} ${cx + 34} ${cy - 2} L${cx + 16} ${b - 4} Z" fill="${shades(TEAL).right}" ${line}/>
     <path d="M${cx - 10} ${b} L${cx - 7} ${b + 8} H${cx + 7} L${cx + 10} ${b} Z" fill="#A9AEC2" ${line}/>
     <path d="M${cx - 18} ${b} V${b - 90} Q${cx - 18} ${b - 124} ${cx} ${b - 144} Q${cx + 18} ${b - 124} ${cx + 18} ${b - 90} V${b} Z" fill="${CREAM}" ${line}/>
     <path d="M${cx + 4} ${b} V${b - 100} Q${cx + 6} ${b - 124} ${cx} ${b - 144} Q${cx + 18} ${b - 124} ${cx + 18} ${b - 90} V${b} Z" fill="${INKC}" opacity=".07"/>
     <path d="M${cx - 15.5} ${b - 106} Q${cx - 12} ${b - 128} ${cx} ${b - 144} Q${cx + 12} ${b - 128} ${cx + 15.5} ${b - 106} Q${cx} ${b - 100} ${cx - 15.5} ${b - 106} Z" fill="${LILAC}" ${line}/>
     <rect x="${cx - 18}" y="${b - 32}" width="36" height="9" fill="${TEAL}" ${line}/>
     <circle cx="${cx}" cy="${b - 70}" r="11" fill="${SKY}" stroke="${WOOD_L}" stroke-width="3.5"/><circle cx="${cx}" cy="${b - 70}" r="12.8" fill="none" ${line}/>
     <path d="M${cx - 5} ${b - 74} q3 -4 7 -4" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
     <rect x="${cx - 3}" y="${b - 38}" width="6" height="40" rx="2" fill="${shades(TEAL).right}" ${line}/>
     ${starPath(cx - 8, b - 50, 4, SUN)}`,
  ]);
}
function telescope() {
  const [cx, cy] = at(0.5, 0.5), ax = cx, ay = cy - 78;
  return build(1, 1, 116, [
    stick(`M${ax} ${ay} L${cx + 6} ${cy - 16}`, '#7A64B0', 4),
    `<g transform="translate(${ax} ${ay - 6}) rotate(-32)">
      <rect x="-56" y="-5" width="14" height="10" rx="2" fill="${PLUM}" ${line}/>
      <rect x="-44" y="-10" width="86" height="20" rx="5" fill="${SKY}" ${line}/>
      <rect x="40" y="-13" width="18" height="26" rx="4" fill="${LILAC}" ${line}/>
      <rect x="-8" y="-11" width="7" height="22" fill="${SUN}" ${line}/>
      <path d="M-36 -5 H30" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>
      ${starPath(18, 2, 5, '#fff')}</g>`,
    `<circle cx="${ax}" cy="${ay}" r="6" fill="${PLUM}" ${line}/>`,
    stick(`M${ax} ${ay} L${cx - 34} ${cy + 10}`, '#7A64B0', 4), stick(`M${ax} ${ay} L${cx + 34} ${cy + 10}`, '#7A64B0', 4),
  ]);
}
function catTree() {
  const carpet = LILAC_L, [tx, ty] = at(0.4, 0.6, 162);
  const [hx, hy] = at(0.62, 0.95, 82);
  const cat = `<path d="M${tx - 22} ${ty - 6} q-8 -2 -6 -10" fill="none" stroke="${INKC}" stroke-opacity=".5" stroke-width="7.6" stroke-linecap="round"/><path d="M${tx - 22} ${ty - 6} q-8 -2 -6 -10" fill="none" stroke="#F2C48D" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="${tx + 2}" cy="${ty - 10}" rx="22" ry="12" fill="#F2C48D" ${line}/>
    <path d="M${tx - 14} ${ty - 22} l2 -10 l6 7 M${tx - 4} ${ty - 25} l5 -9 l3 9" fill="#F2C48D" ${line}/>
    <circle cx="${tx - 8}" cy="${ty - 16}" r="10" fill="#F2C48D" ${line}/>
    <path d="M${tx - 13} ${ty - 17} q2 2 4 0 M${tx - 6} ${ty - 17} q2 2 4 0" stroke="${INKC}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M${tx + 8} ${ty - 18} q6 -2 10 2" stroke="#D9A066" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <text x="${tx + 22}" y="${ty - 26}" font-family="Fredoka, sans-serif" font-weight="600" font-size="11" fill="#7A64B0">z</text>`;
  const rope = (x, y, h) => Array.from({ length: Math.floor(h / 10) }, (_, i) => `<path d="M${x - 8} ${y - 6 - i * 10} q8 4 16 0" stroke="${WOOD_D}" stroke-width="1.2" fill="none" opacity=".6"/>`).join('');
  const [p1x, p1y] = at(0.5, 0.5, 12), [p2x, p2y] = at(0.35, 0.65, 92);
  return build(1, 1, 172, [
    B(0.05, 0.05, 0, 0.9, 0.9, 12, carpet),
    frustum(p1x, p1y, 9, 9, 70, WOOD_L), rope(p1x, p1y, 70),
    B(0.05, 0.35, 82, 0.6, 0.6, 10, carpet),
    `<path d="M${hx} ${hy} V${hy + 34}" stroke="${INKC}" stroke-opacity=".6" stroke-width="1.4"/><circle cx="${hx}" cy="${hy + 38}" r="5" fill="${SUN}" ${line}/>`,
    frustum(p2x, p2y, 8, 8, 60, WOOD_L), rope(p2x, p2y, 60),
    frustum(tx, ty + 10, 30, 30, 10, carpet),
    `<ellipse cx="${tx}" cy="${ty}" rx="24" ry="12" fill="${shades(carpet).right}"/>`,
    cat,
  ]);
}
function easel() {
  const apex = at(0.5, 0.3, 180), fl = at(0.1, 0.42), fr = at(0.9, 0.42), bk = at(0.5, 0.06);
  return build(1, 0.6, 162, [
    stick(`M${xy(apex)} L${xy(bk)}`, WOOD_D, 4),
    stick(`M${xy(apex)} L${xy(fl)}`, WOOD, 5), stick(`M${xy(apex)} L${xy(fr)}`, WOOD, 5),
    B(0.12, 0.36, 92, 0.76, 0.1, 5, WOOD),
    faceL(0.16, 0.4, 164, `<rect width="43" height="68" rx="2" fill="${CREAM}" ${line}/>
      <rect x="4" y="4" width="35" height="60" fill="#DDEEFB"/><circle cx="30" cy="16" r="6" fill="${SUN}"/>
      ${[[LILAC, 16], [TEAL, 12], [SUN, 8]].map(([c, r]) => `<path d="M${21.5 - r} 52 A${r} ${r} 0 0 1 ${21.5 + r} 52" fill="none" stroke="${c}" stroke-width="4"/>`).join('')}
      <path d="M4 56 Q20 50 39 56 V64 H4 Z" fill="${GREEN}"/>`),
    faceL(0.56, 0.47, 98, `<ellipse cx="10" cy="4" rx="10" ry="4" fill="${WOOD_L}" ${line}/><circle cx="6" cy="3" r="1.6" fill="${LILAC}"/><circle cx="11" cy="2.4" r="1.6" fill="${TEAL_D}"/><circle cx="15" cy="4" r="1.6" fill="${SUN}"/>`),
  ]);
}
function speaker(it) {
  const { on } = st(it, { on: true });
  const [cx, cy] = at(0.3, 0.3, 104);
  const ring = on ? TEAL_D : '#9C93B4';
  return build(0.6, 0.6, 130, [
    B(0.05, 0.05, 0, 0.5, 0.5, 100, PLUM, {
      leftDecor: `<circle cx="16" cy="28" r="10" fill="${INKC}" stroke="${ring}" stroke-width="3"/><circle cx="16" cy="28" r="3.4" fill="${ring}"/>
        <circle cx="16" cy="68" r="13" fill="${INKC}" stroke="${ring}" stroke-width="3"/><circle cx="16" cy="68" r="4.4" fill="${ring}"/>
        <circle cx="16" cy="9" r="2" fill="${on ? SUN : '#9C93B4'}"/>`,
      rightDecor: `<path d="M8 12 V90" stroke="${on ? LILAC : '#7D6E9C'}" stroke-width="3" stroke-linecap="round"/>`,
    }),
    on && `<text x="${cx - 16}" y="${cy - 2}" font-family="Fredoka, sans-serif" font-weight="600" font-size="20" fill="${TEAL_D}" ${line}>♪</text>
      <text x="${cx + 6}" y="${cy - 12}" font-family="Fredoka, sans-serif" font-weight="600" font-size="16" fill="${LILAC}" ${line}>♫</text>`,
  ]);
}
function dollhouse(it) {
  const { open } = st(it, { open: false });
  const H = 80, Z = H + 44;
  const poly = (ps, fill) => `<polygon points="${ps.map((p) => at(...p).join(',')).join(' ')}" fill="${fill}" ${LINE_J}/>`;
  const shingles = [0.25, 0.5, 0.75].map((t) => { const z = H - 2 + (Z - H + 2) * t, v = 0.98 - 0.48 * t; return `<path d="M${xy(at(0.02, v, z))} L${xy(at(0.98, v, z))}" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>`; }).join('');
  const front = open
    ? `<rect x="3" y="3" width="51.6" height="74" fill="#5E4E7E"/><rect x="3" y="38" width="51.6" height="4" fill="${WOOD_L}"/>
       <rect x="6" y="26" width="20" height="8" rx="2" fill="${LILAC}"/><rect x="6" y="22" width="7" height="6" rx="2" fill="#fff"/><circle cx="42" cy="18" r="5" fill="${SUN}"/>
       <rect x="10" y="62" width="18" height="4" fill="${WOOD}"/><rect x="12" y="66" width="2" height="9" fill="${WOOD}"/><rect x="24" y="66" width="2" height="9" fill="${WOOD}"/>
       <rect x="36" y="56" width="12" height="19" rx="3" fill="${TEAL}"/>`
    : `<rect x="7" y="10" width="15" height="15" rx="2" fill="${SKY}" ${line}/><rect x="35" y="10" width="15" height="15" rx="2" fill="${SKY}" ${line}/>
       <path d="M14.5 10 V25 M7 17.5 H22 M42.5 10 V25 M35 17.5 H50" stroke="${CREAM}" stroke-width="2"/>
       <rect x="6" y="25" width="17" height="4" rx="1.5" fill="${GREEN}"/><rect x="34" y="25" width="17" height="4" rx="1.5" fill="${GREEN}"/>
       <path d="M21 80 V54 Q28.8 46 36.6 54 V80 Z" fill="${TEAL}" ${line}/><circle cx="33" cy="66" r="1.8" fill="${SUN}"/>`;
  return build(1, 1, 124, [
    B(0.05, 0.05, 0, 0.9, 0.9, H, CREAM, { leftDecor: front, rightDecor: `<circle cx="28.8" cy="30" r="9" fill="${SKY}" ${line}/><path d="M28.8 21 V39 M19.8 30 H37.8" stroke="${CREAM}" stroke-width="2"/>` }),
    poly([[0.98, 0.02, H - 2], [0.98, 0.5, Z], [0.02, 0.5, Z], [0.02, 0.02, H - 2]], '#9A82DB'),
    poly([[0.95, 0.95, H], [0.95, 0.05, H], [0.95, 0.5, Z - 3]], shades(CREAM).right),
    B(0.62, 0.26, 100, 0.14, 0.14, 34, '#D9CDEA'),
    poly([[0.02, 0.98, H - 2], [0.98, 0.98, H - 2], [0.98, 0.5, Z], [0.02, 0.5, Z]], LILAC),
    shingles,
    starPath(...at(0.5, 0.5, Z + 8), 7, SUN, line),
  ]);
}

export const CATS = [['furniture', 'Furniture', '🛋️'], ['decor', 'Decor', '🖼️'], ['plants', 'Plants', '🪴'], ['lights', 'Lights', '💡'], ['fun', 'Fun', '🧸']];

export const FURNITURE = [
  // furniture
  { id: 'sofa', name: 'Lilac Sofa', cat: 'furniture', price: 180, fw: 2, fd: 1, art: sofa },
  { id: 'armchair', name: 'Comfy Armchair', cat: 'furniture', price: 110, fw: 1, fd: 1, art: armchair },
  { id: 'bunkbed', name: 'Bunk Bed', cat: 'furniture', price: 240, fw: 2, fd: 1, art: bunkbed },
  { id: 'canopy-bed', name: 'Canopy Bed', cat: 'furniture', price: 250, fw: 2, fd: 1.5, art: canopyBed },
  { id: 'coffee-table', name: 'Coffee Table', cat: 'furniture', price: 70, fw: 2, fd: 1, surface: 44, art: coffeeTable },
  { id: 'craft-table', name: 'Craft Table', cat: 'furniture', price: 90, fw: 2, fd: 1, surface: 80, art: craftTable },
  { id: 'bookcase', name: 'Bookcase', cat: 'furniture', price: 130, fw: 2, fd: 0.5, surface: 196, art: bookcase },
  { id: 'dresser', name: 'Sky Dresser', cat: 'furniture', price: 120, fw: 1.5, fd: 0.75, surface: 94, art: dresser },
  { id: 'vanity', name: 'Vanity Mirror', cat: 'furniture', price: 150, fw: 1.5, fd: 0.75, surface: 69, art: vanity },
  { id: 'gaming-chair', name: 'Gaming Chair', cat: 'furniture', price: 120, fw: 1, fd: 1, art: gamingChair },
  { id: 'piano', name: 'Piano', cat: 'furniture', price: 220, fw: 2, fd: 0.75, art: piano, onTap: boing },
  { id: 'floor-cushions', name: 'Floor Cushions', cat: 'furniture', price: 40, fw: 1, fd: 1, art: floorCushions },
  { id: 'beanbag', name: 'Mint Beanbag', cat: 'furniture', price: 60, fw: 1, fd: 1, art: beanbag, onTap: boing },
  // decor
  { id: 'rug-round', name: 'Round Rug', cat: 'decor', price: 60, fw: 2, fd: 2, floor: true, art: rugRound },
  { id: 'rug-rect', name: 'Big Sky Rug', cat: 'decor', price: 80, fw: 3, fd: 2, floor: true, art: rugRect },
  { id: 'globe', name: 'Globe', cat: 'decor', price: 30, fw: 0.4, fd: 0.4, small: true, art: globe },
  { id: 'snow-globe', name: 'Snow Globe', cat: 'decor', price: 25, fw: 0.3, fd: 0.3, small: true, art: snowGlobe, onTap: boing },
  { id: 'cake-stand', name: 'Cake Stand', cat: 'decor', price: 35, fw: 0.4, fd: 0.4, small: true, art: cakeStand },
  { id: 'aquarium', name: 'Aquarium', cat: 'decor', price: 160, fw: 1.5, fd: 0.6, art: aquarium },
  { id: 'floor-mirror', name: 'Tall Mirror', cat: 'decor', price: 70, fw: 0.8, fd: 0.3, art: floorMirror },
  // plants
  { id: 'monstera', name: 'Monstera', cat: 'plants', price: 50, fw: 1, fd: 1, art: monstera },
  { id: 'cactus-trio', name: 'Cactus Trio', cat: 'plants', price: 30, fw: 0.52, fd: 0.3, small: true, art: cactusTrio },
  { id: 'pothos', name: 'Trailing Plant', cat: 'plants', price: 55, fw: 0.7, fd: 0.7, art: pothos },
  { id: 'flower-vase', name: 'Flower Vase', cat: 'plants', price: 25, fw: 0.3, fd: 0.3, small: true, art: flowerVase },
  { id: 'lemon-tree', name: 'Lemon Tree', cat: 'plants', price: 70, fw: 1, fd: 1, art: lemonTree },
  // lights
  { id: 'lava-lamp', name: 'Lava Lamp', cat: 'lights', price: 35, fw: 0.25, fd: 0.25, small: true, data: { on: true }, art: lavaLamp, onTap: toggle },
  { id: 'fairy-tree', name: 'Fairy-Light Tree', cat: 'lights', price: 90, fw: 1, fd: 1, data: { on: true }, art: fairyTree, onTap: toggle },
  { id: 'neon-star', name: 'Neon Star', cat: 'lights', price: 60, fw: 0.6, fd: 0.4, data: { on: true }, art: neonStar, onTap: toggle },
  { id: 'arc-lamp', name: 'Arc Floor Lamp', cat: 'lights', price: 45, fw: 0.9, fd: 0.8, data: { on: true }, art: arcLamp, onTap: toggle },
  { id: 'mushroom-lamp', name: 'Mushroom Lamp', cat: 'lights', price: 30, fw: 0.3, fd: 0.3, small: true, data: { on: true }, art: mushroomLamp, onTap: toggle },
  // fun
  { id: 'teddy', name: 'Teddy Bear', cat: 'fun', price: 30, fw: 0.4, fd: 0.4, small: true, art: teddy, onTap: boing },
  { id: 'rocket', name: 'Toy Rocket', cat: 'fun', price: 90, fw: 0.8, fd: 0.8, art: rocket, onTap: boing },
  { id: 'telescope', name: 'Telescope', cat: 'fun', price: 80, fw: 1, fd: 1, art: telescope },
  { id: 'cat-tree', name: 'Cat Tree', cat: 'fun', price: 120, fw: 1, fd: 1, art: catTree, onTap: boing },
  { id: 'easel', name: 'Art Easel', cat: 'fun', price: 50, fw: 1, fd: 0.6, art: easel },
  { id: 'speaker', name: 'Music Speaker', cat: 'fun', price: 70, fw: 0.6, fd: 0.6, data: { on: true }, art: speaker, onTap: toggle },
  { id: 'dollhouse', name: 'Dollhouse', cat: 'fun', price: 140, fw: 1, fd: 1, data: { open: false }, art: dollhouse, onTap: toggleOpen },
];

// ======================= WALLPAPERS =======================
// Left back wall runs up-right (skew -0.5), right back wall runs down-right (skew +0.5).
const MAT_L = 'matrix(1,-0.5,0,1,0,0)', MAT_R = 'matrix(1,0.5,0,1,0,0)';
const dk = (c, right) => (right ? shades(c, 0.5).right : c);
const pat = (id, w, h, mat, body) => `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse" patternTransform="${mat}">${body}</pattern>`;
const wallpaper = (id, name, price, wallL, wallR, w, h, body) => ({
  id, name, price, wallL, wallR,
  defs: (idL, idR) => pat(idL, w, h, MAT_L, body(wallL, false)) + pat(idR, w, h, MAT_R, body(wallR, true)),
});
const cloudP = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M4 40 Q-2 26 12 24 Q14 8 32 12 Q42 0 58 10 Q74 8 74 24 Q88 26 84 40 Z" fill="${c}"/>`;

export const WALLPAPERS = [
  {
    id: 'default', name: 'Lilac Stars', price: 0, wallL: '#E6DEF6', wallR: '#DDD3F0',
    // identical to the original Olivia's room wallpaper (room.js)
    defs: (idL, idR) => `<pattern id="${idL}" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,0,1,0,0)">
      <rect width="60" height="60" fill="#E6DEF6"/><path d="M30 0 V60" stroke="#DCD2F0" stroke-width="14"/>${starPath(30, 30, 4, '#F3E7B0')}</pattern>
    <pattern id="${idR}" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="matrix(1,-0.5,0,1,0,0)">
      <rect width="60" height="60" fill="#DDD3F0"/><path d="M30 0 V60" stroke="#D3C8EA" stroke-width="14"/>${starPath(30, 30, 4, '#EEE0A8')}</pattern>`,
  },
  wallpaper('mint-stripes', 'Mint Stripes', 60, '#DDF3EE', '#D2ECE6', 48, 48, (bg, r) => `<rect width="48" height="48" fill="${bg}"/><rect x="14" width="20" height="48" fill="${dk('#C3E8DF', r)}"/><path d="M7 0 V48 M41 0 V48" stroke="#FBF7EF" stroke-width="2.5" opacity=".8"/>`),
  wallpaper('sunny-dots', 'Sunny Dots', 70, '#FBF3D3', '#F5EAC4', 44, 44, (bg, r) => `<rect width="44" height="44" fill="${bg}"/><circle cx="11" cy="11" r="5" fill="${dk(SUN, r)}"/><circle cx="33" cy="33" r="5" fill="${dk(SUN, r)}"/><circle cx="33" cy="11" r="2" fill="#fff"/><circle cx="11" cy="33" r="2" fill="#fff"/>`),
  wallpaper('cream-brick', 'Cream Brick', 90, '#F1E6D4', '#E8DCC8', 64, 40, (bg, r) => `<rect width="64" height="40" fill="${dk('#FFFDF8', r)}"/><rect x="2" y="2" width="60" height="16" rx="2" fill="${bg}"/><rect x="-30" y="22" width="60" height="16" rx="2" fill="${bg}"/><rect x="34" y="22" width="60" height="16" rx="2" fill="${bg}"/><path d="M8 7 H22" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`),
  wallpaper('sky-clouds', 'Sky Clouds', 100, '#CFE5F8', '#C3DCF3', 180, 150, (bg, r) => `<rect width="180" height="150" fill="${bg}"/>${cloudP(14, 12, 0.8, dk('#FFFFFF', r))}${cloudP(100, 84, 0.65, dk('#F4F9FE', r))}<circle cx="150" cy="30" r="2.5" fill="#fff"/><circle cx="40" cy="110" r="2" fill="#fff"/>`),
  wallpaper('moon-stars', 'Moons & Stars', 110, '#E3D9F7', '#D9CEF2', 80, 80, (bg, r) => `<rect width="80" height="80" fill="${bg}"/><path d="M24 10 A13 13 0 1 0 34 32 A10 10 0 1 1 24 10 Z" fill="${dk(SUN, r)}"/>${starPath(60, 58, 6, dk('#FBF7EF', r))}${starPath(60, 18, 3.5, dk('#F3E7B0', r))}${starPath(18, 62, 3, dk('#F3E7B0', r))}<circle cx="42" cy="46" r="1.6" fill="#fff"/><circle cx="74" cy="38" r="1.3" fill="#fff"/>`),
  wallpaper('cozy-wood', 'Cozy Wood', 120, '#E2C29C', '#D6B48C', 36, 120, (bg, r) => `<rect width="36" height="120" fill="${bg}"/><path d="M18 0 V120" stroke="#fff" stroke-opacity=".12" stroke-width="12"/><path d="M0 0 V120" stroke="${dk(WOOD_D, r)}" stroke-width="2.5"/><ellipse cx="24" cy="70" rx="2.6" ry="5" fill="none" stroke="${dk(WOOD_D, r)}" stroke-width="1.4" opacity=".6"/><path d="M9 10 Q12 40 9 60" stroke="${dk(WOOD_D, r)}" stroke-width="1" fill="none" opacity=".35"/>`),
  wallpaper('galaxy', 'Galaxy Night', 150, '#3B3570', '#332E63', 120, 120, (bg, r) => `<rect width="120" height="120" fill="${bg}"/>
    ${[[12, 18, 1.6], [48, 8, 1.2], [96, 26, 1.8], [30, 60, 1.2], [70, 50, 1.5], [110, 80, 1.2], [20, 100, 1.8], [60, 104, 1.1], [88, 112, 1.4]].map(([x, y, s]) => `<circle cx="${x}" cy="${y}" r="${s}" fill="#fff" opacity=".9"/>`).join('')}
    ${starPath(84, 74, 5, dk(SUN, r))}${starPath(34, 30, 3.5, dk('#C9B8F2', r))}
    <circle cx="44" cy="86" r="8" fill="${dk(TEAL, r)}"/><ellipse cx="44" cy="86" rx="14" ry="4" fill="none" stroke="${dk(LILAC_L, r)}" stroke-width="2.2" transform="rotate(-18 44 86)"/>`),
];

// ======================= FLOORS =======================
// defs(id, ox, oy): the pattern is laid on the iso floor grid (one 64×64 pattern cell = one floor tile),
// with its origin at the room's back corner (ox, oy) — defaults match Olivia's room.
const floorPat = (w, body) => (id, ox = 768, oy = 384) => `<pattern id="${id}" width="${w}" height="${w}" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,-1,0.5,${ox},${oy})">${body}</pattern>`;

export const FLOORS = [
  { id: 'default', name: 'Honey Planks', price: 0, floor: '#DDBA93', floorLines: 'planks', defs: () => '' },
  { id: 'light-oak', name: 'Light Oak', price: 50, floor: '#ECD6B6', floorLines: 'planks', defs: () => '' },
  { id: 'mint-tiles', name: 'Mint Tiles', price: 70, floor: '#C8EAE2', floorLines: 'tiles', defs: floorPat(64, '<rect width="64" height="64" fill="#C8EAE2"/><rect x="5" y="5" width="54" height="54" rx="5" fill="#D8F2EC"/><circle cx="18" cy="16" r="3" fill="#fff" opacity=".6"/>') },
  { id: 'dark-walnut', name: 'Dark Walnut', price: 90, floor: '#A47A58', floorLines: 'planks', defs: () => '' },
  { id: 'lilac-carpet', name: 'Lilac Carpet', price: 100, floor: '#CFC0EE', floorLines: 'tiles', defs: floorPat(32, '<rect width="32" height="32" fill="#CFC0EE"/><circle cx="8" cy="8" r="1.8" fill="#DCD0F4"/><circle cx="24" cy="22" r="1.6" fill="#C2B1E6"/><circle cx="22" cy="6" r="1.2" fill="#DCD0F4"/>') },
  { id: 'checker', name: 'Cream & Blue Checks', price: 120, floor: '#FBF7EF', floorLines: 'tiles', defs: floorPat(128, '<rect width="128" height="128" fill="#FBF7EF"/><rect x="64" width="64" height="64" fill="#C4DDF4"/><rect y="64" width="64" height="64" fill="#C4DDF4"/>') },
];

// ======================= SHOP THUMBNAILS =======================
let thumbN = 0;
export function thumb(kind, entry) {
  const n = ++thumbN;
  if (kind === 'wallpaper') {
    const idL = `th-w${n}-l`, idR = `th-w${n}-r`, defs = entry.defs(idL, idR);
    const L = '0,230 120,170 120,30 0,90', R = '120,170 240,230 240,90 120,30';
    return `<svg viewBox="0 0 240 240" width="100%" height="100%"><defs>${defs}</defs>
      <polygon points="${L}" fill="${entry.wallL}" ${LINE_J}/>${defs ? `<polygon points="${L}" fill="url(#${idL})"/>` : ''}
      <polygon points="${R}" fill="${entry.wallR}" ${LINE_J}/>${defs ? `<polygon points="${R}" fill="url(#${idR})"/>` : ''}
      <polygon points="0,230 120,170 240,230 240,240 0,240" fill="#DDBA93" ${LINE_J}/>
      <polygon points="0,230 120,170 120,160 0,220" fill="${CREAM}" ${LINE_J}/><polygon points="120,170 240,230 240,220 120,160" fill="#EDE6DA" ${LINE_J}/></svg>`;
  }
  if (kind === 'floor') {
    const id = `th-f${n}`, N = 3, p = (gx, gy) => `${(gx - gy) * 64},${(gx + gy) * 32}`;
    const defs = entry.defs ? entry.defs(id, 0, 0) : '';
    const dia = `${p(0, 0)} ${p(N, 0)} ${p(N, N)} ${p(0, N)}`;
    let lines = '';
    if (entry.floorLines === 'planks') {
      for (let i = 1; i < N * 3; i++) lines += `M${p(i / 3, 0)} L${p(i / 3, N)} `;
      for (let i = 0; i < 14; i++) { const g = ((i * 7) % (N * 3)) / 3, v = ((i * 13) % (N * 2)) / 2; lines += `M${p(g, v)} L${p(g + 1 / 3, v)} `; }
    } else for (let i = 1; i < N; i++) lines += `M${p(i, 0)} L${p(i, N)} M${p(0, i)} L${p(N, i)} `;
    const s = shades(entry.floor);
    return `<svg viewBox="0 0 240 240" width="100%" height="100%"><defs>${defs}</defs><g transform="translate(120 58) scale(.58)">
      <polygon points="${p(0, N)} ${p(N, N)} ${(0)},${N * 64 + 22} ${-N * 64},${N * 32 + 22}" fill="${s.right}" ${LINE_J}/>
      <polygon points="${p(N, N)} ${p(N, 0)} ${N * 64},${N * 32 + 22} 0,${N * 64 + 22}" fill="${shades(entry.floor, 2).right}" ${LINE_J}/>
      <polygon points="${dia}" fill="${entry.floor}" ${LINE_J}/>${defs ? `<polygon points="${dia}" fill="url(#${id})"/>` : ''}
      <path d="${lines.replace(/,/g, ' ')}" stroke="#000" stroke-opacity=".07" stroke-width="2"/>
      <polygon points="${dia}" fill="none" ${LINE_J}/></g></svg>`;
  }
  const a = entry.art();
  return `<svg viewBox="0 0 120 120" width="100%" height="100%">${a.svg.replace('width="100%" height="100%"', 'x="8" y="8" width="104" height="104"')}</svg>`;
}
