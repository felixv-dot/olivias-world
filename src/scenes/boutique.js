// Boutique (isometric dollhouse): tap clothes on the wall rails and shoes on the shelves to try them on,
// drag glasses and hats onto a character, peek into the fitting room and the shoe box.
import { room, roomShell, isoItem, at, shades, proj, isoDef, wallDef } from '../iso.js';
import { svg, text, starPath, wearable, NPC } from './common.js';

const R = room({ cols: 9, rows: 7, ox: 736, oy: 340, wallH: 296 });
R.charScale = 0.6;

const WOOD = '#C99A6C', WOOD_D = '#B58456', WOOD_L = '#E2C29C', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', TURQ = '#3CC7B8',
  SKY = '#9CC8EE', SUN = '#F5DE7A', CORAL = '#E58F6A', LEAF = '#6DBE7A', GOLD = '#E8C468', INKY = '#3E3252';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4"';
const P = (a) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const cyl = (cx, cy, rx, h, side, top = side, ln = line) => `<path d="M${cx - rx} ${cy - h} V${cy} A${rx} ${rx / 2} 0 0 0 ${cx + rx} ${cy} V${cy - h} Z" fill="${side}" ${ln}/><ellipse cx="${cx}" cy="${cy - h}" rx="${rx}" ry="${rx / 2}" fill="${top}" ${ln}/>`;
const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx / 2}" fill="${INKY}" opacity=".12"/>`;
// Parts that sit on top of other parts, drawn as one group after them (isoItem sorts parts by footprint only).
const onTop = (parts, key = 99) => { const s = isoItem(1, 0, 0, parts).svg; return { svg: s.slice(s.indexOf('<g'), s.lastIndexOf('</svg>')), u: key, v: 0, w: 0, d: 0 }; };
// Flat drawing standing in the plane facing front-left (along u, at depth v), top-left corner at (u, v, z).
const faceL = (u, v, z, body) => { const [x, y] = at(u, v, z); return `<g transform="matrix(1,0.5,0,1,${x},${y})">${body}</g>`; };

// ---------- background ----------
const bg = () => {
  const [lx] = proj(R, 0, R.rows), [rx] = proj(R, R.cols, 0), [, fy] = proj(R, R.cols, R.rows);
  const [cx, cy] = proj(R, 4.4, 4.2);
  return svg(1600, 900, `
  <defs>
    <radialGradient id="boutique-bd" cx="50%" cy="55%" r="70%"><stop offset="0" stop-color="#F7F2FB"/><stop offset="1" stop-color="#E0D6F0"/></radialGradient>
    <pattern id="boutique-wr" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,0,1,${R.ox},${R.oy})">
      <rect width="56" height="56" fill="#EEE7FB"/><rect x="18" width="20" height="56" fill="#E6DCF8"/></pattern>
    <pattern id="boutique-wl" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="matrix(1,-0.5,0,1,${R.ox},${R.oy})">
      <rect width="60" height="60" fill="#E9F4F6"/>${starPath(15, 15, 4, '#CFE6EA')}${starPath(45, 45, 4, '#F2E3B0')}</pattern>
    <radialGradient id="boutique-spot"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6DA" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#boutique-bd)"/>
  <ellipse cx="${(lx + rx) / 2}" cy="${fy + 6}" rx="580" ry="46" fill="${INKY}" opacity=".10"/>
  ${roomShell(R, { floor: '#E9CBA2', floorLines: 'planks', wallL: '#E9F4F6', wallR: '#EEE7FB', wallPatternL: 'boutique-wl', wallPatternR: 'boutique-wr' })}
  <ellipse cx="${cx}" cy="${cy}" rx="330" ry="165" fill="url(#boutique-spot)"/>`);
};

// ---------- clothes (hang on the left wall, face out) ----------
const TOPS = [
  { top: 'hoodie', topColor: '#C9B8F2', collar: 'hood', neck: 'none' },
  { top: 'sweater', topColor: '#9EDDD4', collar: 'sailor', collarColor: '#4D5C9A', neck: 'ribbon', neckColor: '#F5DE7A' },
  { top: 'tee', topColor: '#F5DE7A', badge: true },
];
const BOTTOMS = [
  { bottom: 'skirt', bottomColor: '#4D5C9A', socks: 'knee', socksColor: '#FFFFFF' },
  { bottom: 'widePants', bottomColor: '#AFD6F7' },
  { bottom: 'shorts', bottomColor: '#3CC7B8', socks: 'ankle', socksColor: '#FFFFFF' },
];
const SHOES = [
  { shoes: 'boots', shoesColor: '#7A64B0' },
  { shoes: 'sneakers', shoesColor: '#FFFFFF' },
  { shoes: 'boots', shoesColor: '#E58F6A' },
  { shoes: 'sneakers', shoesColor: '#F5DE7A' },
];

// Wall-local drawings: x 0..64, y 0..124 (hook at the top centre on the rail).
const hook = '<path d="M32 12 V6 q0 -6 5 -6 q5 0 4 5" fill="none" stroke="#7A7A8C" stroke-width="2.2"/>';
const topBody = (p) => {
  const sleeves = p.top === 'tee'
    ? `<path d="M14 24 L2 46 L12 52 L16 44 Z M50 24 L62 46 L52 52 L48 44 Z" fill="${p.topColor}" ${line}/>`
    : `<path d="M14 24 L2 72 L11 75 L17 46 Z M50 24 L62 72 L53 75 L47 46 Z" fill="${p.topColor}" ${line}/>`;
  return `${hook}<path d="M6 24 L32 12 L58 24" fill="none" stroke="#7A7A8C" stroke-width="2.5" stroke-linecap="round"/>
    ${sleeves}<path d="M14 22 L32 18 L50 22 L50 110 H14 Z" fill="${p.topColor}" ${line}/>
    ${p.collar === 'hood' ? `<path d="M22 20 Q32 40 42 20 Q38 32 32 33 Q26 32 22 20 Z" fill="#B3A0E4" ${line}/><path d="M28 34 v14 M36 34 v14" stroke="#fff" stroke-width="2"/>` : ''}
    ${p.collar === 'sailor' ? `<path d="M22 20 L32 38 L42 20 L48 24 L32 48 L16 24 Z" fill="${p.collarColor}" ${line}/><path d="M28 44 l4 6 l4 -6" fill="${p.neckColor}"/>` : ''}
    ${p.badge ? `<circle cx="41" cy="62" r="6" fill="#FBF6EC" ${line}/>${starPath(41, 62, 3.5, CORAL)}` : ''}
    <path d="M14 100 H50" stroke="${INKY}" stroke-opacity=".25" stroke-width="2"/>`;
};
const bottomBody = (p) => {
  const clip = `${hook}<path d="M12 16 H52" stroke="#7A7A8C" stroke-width="3" stroke-linecap="round"/><path d="M32 12 L14 16 M32 12 L50 16" stroke="#7A7A8C" stroke-width="1.6"/>`;
  if (p.bottom === 'skirt') return `${clip}<path d="M16 18 H48 L60 82 Q32 92 4 82 Z" fill="${p.bottomColor}" ${line}/><path d="M24 22 L15 84 M32 22 V88 M40 22 L49 84" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>`;
  if (p.bottom === 'widePants') return `${clip}<path d="M16 18 H48 L56 116 H36 L32 46 L28 116 H8 Z" fill="${p.bottomColor}" ${line}/><path d="M16 26 H48" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`;
  return `${clip}<path d="M14 18 H50 L54 64 H35 L32 44 L29 64 H10 Z" fill="${p.bottomColor}" ${line}/><path d="M12 58 H30 M34 58 H52" stroke="${INKY}" stroke-opacity=".3" stroke-width="2"/>`;
};
// Shoe pair standing on a wall shelf: x 0..58, y 0..34 (bottom on the shelf).
const shoeBody = (p) => (p.shoes === 'boots'
  ? `<path d="M4 34 C2 18 10 6 23 6 C35 6 40 16 39 34 Z" fill="${p.shoesColor}" ${line}/><path d="M20 34 C19 18 25 6 35 6 C49 6 55 16 53 34 Z" fill="${p.shoesColor}" ${line}/><path d="M22 14 H34 M38 14 H50" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`
  : `<path d="M3 34 C2 22 9 16 21 17 C31 18 36 26 36 34 Z" fill="${p.shoesColor}" ${line}/><path d="M21 34 C21 26 27 18 37 17 C49 16 55 22 54 34 Z" fill="${p.shoesColor}" ${line}/><path d="M4 31 H54" stroke="#8FC3F0" stroke-width="3"/>`);

// ---------- furniture ----------
const fitting = (it) => {
  const open = it?.data.open;
  const panel = shades('#F2EADF'), head = shades(WOOD), cur = shades(LILAC), back = shades('#E6DDFA', 0.5);
  const folds = (len, h) => Array.from({ length: Math.floor(len / 12) }, (_, i) => `<path d="M${6 + i * 12} 4 Q${2 + i * 12} ${h / 2} ${7 + i * 12} ${h - 4}" stroke="#fff" stroke-opacity=".35" stroke-width="2.5" fill="none"/>`).join('');
  const floor = [at(0.1, 0.04), at(2.1, 0.04), at(2.1, 1.8), at(0.1, 1.8)];
  return isoItem(2.2, 1.8, 256, [
    { svg: `<polygon points="${P(floor)}" fill="#F7F2FF" ${line}/>` + (() => { const [cx, cy] = at(1.1, 0.95); return `<ellipse cx="${cx}" cy="${cy}" rx="70" ry="35" fill="${TEAL}" opacity=".5"/>`; })(), u: 0, v: 0, w: 0.5, d: 0.5 },
    { u: 0, v: 0, w: 0.1, d: 1.8, h: 236, ...panel,
      rightDecor: `<path d="M44 52 v-8" stroke="#7A7A8C" stroke-width="3"/><path d="M26 58 L44 46 L62 58 L66 126 H22 Z" fill="${SKY}" ${line}/><path d="M34 64 l10 8 l10 -8" fill="none" stroke="#fff" stroke-width="2"/>
        <rect x="76" y="56" width="26" height="74" rx="12" fill="${GOLD}" ${line}/><rect x="80" y="60" width="18" height="66" rx="9" fill="#D8ECFA"/><path d="M84 76 l8 -8" stroke="#fff" stroke-width="3"/>` },
    { u: 0.1, v: 0, w: 2, d: 0.04, h: 236, ...back },
    { svg: (() => { const [cx, cy] = at(1.2, 1.1); return `${cyl(cx, cy, 6, 34, WOOD_D)}${cyl(cx, cy - 34, 22, 8, WOOD_L, '#EAD6BC')}`; })(), u: 0.9, v: 0.9, w: 0.1, d: 0.1 },
    { u: 0, v: 0, w: 2.2, d: 1.8, z: 236, h: 20, ...head,
      leftDecor: `<rect x="20" y="3" width="101" height="14" rx="5" fill="${CREAM}"/>${text(70, 14, 'FITTING ROOM', 10, '#7A64B0')}${starPath(10, 10, 5, SUN)}${starPath(131, 10, 5, SUN)}` },
    ...(open
      ? [{ u: 0.1, v: 1.68, w: 0.34, d: 0.1, h: 232, ...cur, leftDecor: folds(22, 232) },
        { u: 1.76, v: 1.68, w: 0.34, d: 0.1, h: 232, ...cur, leftDecor: folds(22, 232) }]
      : [{ u: 0.1, v: 1.7, w: 2, d: 0.06, h: 232, ...cur, leftDecor: folds(128, 232) + `<path d="M0 214 H128" stroke="#fff" stroke-opacity=".5" stroke-width="4"/>` }]),
    { u: 2.1, v: 0, w: 0.1, d: 1.8, h: 236, ...panel },
  ]);
};

const mirror = () => {
  const frame = shades(GOLD);
  return isoItem(0.8, 0.3, 214, [
    { u: 0.1, v: 0, w: 0.6, d: 0.1, h: 30, ...shades(WOOD_D) },
    { u: 0, v: 0.1, w: 0.8, d: 0.08, z: 6, h: 206, ...frame,
      leftDecor: `<rect x="4" y="4" width="43" height="198" rx="21" fill="${GOLD}"/><rect x="8" y="8" width="35" height="190" rx="17" fill="#D8ECFA" ${line}/>
        <path d="M16 50 L34 30 M14 80 L38 52" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/>${starPath(25.6, 14, 4, '#fff')}` },
  ]);
};

const desk = () => {
  const body = shades(CREAM, 0.7), top = shades(WOOD_L), reg = shades('#9AA3C2');
  return isoItem(2.2, 0.8, 150, [
    { u: 0, v: 0, w: 2.2, d: 0.8, h: 84, ...body,
      leftDecor: `<rect x="8" y="10" width="125" height="64" rx="8" fill="${LILAC}" fill-opacity=".35" ${line}/>${starPath(70, 42, 12, SUN)}<path d="M8 22 H133" stroke="#fff" stroke-width="3" opacity=".6"/>` },
    onTop([{ u: -0.04, v: -0.04, w: 2.32, d: 0.92, z: 84, h: 8, ...top }, onTop([
    { u: 0.3, v: 0.15, w: 0.5, d: 0.4, z: 92, h: 22, ...reg, leftDecor: '<rect x="4" y="4" width="24" height="5" rx="2" fill="#fff" opacity=".7"/>' },
      onTop([{ u: 0.38, v: 0.15, w: 0.34, d: 0.06, z: 114, h: 22, ...shades('#5E6A8A'), leftDecor: `<rect x="3" y="3" width="16" height="15" rx="2" fill="${TEAL}"/>` }]),
    { svg: (() => { const [cx, cy] = at(1.35, 0.45, 92); return `<path d="M${cx - 18} ${cy} L${cx - 15} ${cy - 34} H${cx + 15} L${cx + 18} ${cy} Z" fill="${TEAL}" ${line}/><path d="M${cx - 8} ${cy - 34} q8 -16 16 0" fill="none" stroke="${INKY}" stroke-opacity=".6" stroke-width="2"/>${starPath(cx, cy - 16, 7, '#fff')}`; })(), u: 1.35, v: 0.45, w: 0.2, d: 0.2, z: 92 },
    { svg: (() => { const [cx, cy] = at(1.9, 0.4, 92); return `${cyl(cx, cy, 9, 22, SKY, '#E8F6FF')}<path d="M${cx} ${cy - 22} L${cx - 9} ${cy - 46} M${cx} ${cy - 22} L${cx + 8} ${cy - 50}" stroke="#4E9B5A" stroke-width="2"/><circle cx="${cx - 9}" cy="${cy - 48}" r="6" fill="${SUN}" ${line}/><circle cx="${cx + 8}" cy="${cy - 52}" r="6" fill="${LILAC}" ${line}/>`; })(), u: 1.9, v: 0.4, w: 0.2, d: 0.2, z: 92 }])]),
  ]);
};

const displayTable = () => {
  const top = shades(CREAM, 0.6), leg = shades(WOOD);
  const stack = (u, v, cols) => cols.map((c, i) => ({ u, v, w: 0.42, d: 0.32, z: 70 + i * 9, h: 9, ...shades(c) }));
  return isoItem(2.2, 1.1, 110, [
    ...[[0.08, 0.08], [2.0, 0.08], [0.08, 0.9], [2.0, 0.9]].map(([u, v]) => ({ u, v, w: 0.12, d: 0.12, h: 62, ...leg })),
    onTop([{ u: 0, v: 0, w: 2.2, d: 1.1, z: 62, h: 8, ...top, leftDecor: '<path d="M0 4 H141" stroke="#E8C468" stroke-width="2"/>' },
      ...stack(1.66, 0.12, [LILAC, TEAL, SUN]),
      ...stack(1.66, 0.6, [SKY, '#C9B8F2'])]),
  ]);
};

const plinth = (h, color) => () => {
  const c = shades(color, 0.8), cap = shades(CREAM, 0.6);
  return isoItem(0.9, 0.9, h + 4, [
    { u: 0.05, v: 0.05, w: 0.8, d: 0.8, h: h - 6, ...c, leftDecor: `<path d="M0 10 H51" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>` },
    onTop([{ u: 0, v: 0, w: 0.9, d: 0.9, z: h - 6, h: 6, ...cap }]),
  ]);
};

const rack = () => {
  const metal = shades('#BFC4D6');
  const dress = (x, col, kind) => kind === 'dress'
    ? `<path d="M${x} 8 l-10 10 l4 10 l-10 46 h32 l-10 -46 l4 -10 z" fill="${col}" ${line}/><path d="M${x} 0 v8" stroke="#7A7A8C" stroke-width="2"/>`
    : `<path d="M${x - 12} 10 h24 l6 34 l-6 2 v24 h-24 v-24 l-6 -2 z" fill="${col}" ${line}/><path d="M${x} 0 v10" stroke="#7A7A8C" stroke-width="2"/>`;
  return isoItem(1.8, 0.5, 170, [
    { u: 0, v: 0.15, w: 0.12, d: 0.2, h: 6, ...metal }, { u: 1.68, v: 0.15, w: 0.12, d: 0.2, h: 6, ...metal },
    { u: 0.04, v: 0.22, w: 0.05, d: 0.05, z: 6, h: 160, ...metal },
    { svg: faceL(0.1, 0.25, 160, `${dress(18, CORAL, 'dress')}${dress(42, TEAL, 'coat')}${dress(68, SUN, 'dress')}${dress(92, LILAC, 'coat')}`), u: 0.9, v: 0.25, w: 0.1, d: 0.1, z: 100 },
    { u: 0, v: 0.22, w: 1.8, d: 0.05, z: 160, h: 5, ...metal },
    { u: 1.71, v: 0.22, w: 0.05, d: 0.05, z: 6, h: 160, ...metal },
  ]);
};

const shoebox = (it) => {
  const box = shades('#C9B8F2'), lid = shades(LILAC);
  return isoItem(0.75, 0.5, 70, [
    { u: 0, v: 0, w: 0.75, d: 0.5, h: 28, ...box, leftDecor: `${starPath(24, 14, 7, '#fff')}` },
    ...(it?.data.open
      ? [{ svg: (() => { const [cx, cy] = at(0.37, 0.25, 28); return `<path d="M${cx - 18} ${cy + 2} Q${cx - 8} ${cy - 14} ${cx + 4} ${cy}" fill="#fff" ${line}/><path d="M${cx - 2} ${cy + 4} Q${cx + 8} ${cy - 12} ${cx + 20} ${cy + 2}" fill="${CREAM}" ${line}/>`; })(), u: 0.37, v: 0.25, w: 0.1, d: 0.1, z: 28 },
        { u: -0.02, v: -0.08, w: 0.79, d: 0.06, z: 28, h: 34, ...lid }]
      : [{ u: -0.03, v: -0.03, w: 0.81, d: 0.56, z: 22, h: 10, ...lid }]),
  ]);
};

const pouf = () => {
  const [cx, cy] = at(0.4, 0.4);
  return isoItem(0.8, 0.8, 50, [{ svg: `${shadow(cx, cy + 2, 40)}${cyl(cx, cy, 36, 30, TEAL, '#B8E8E1')}
    <path d="M${cx - 36} ${cy - 15} A36 18 0 0 0 ${cx + 36} ${cy - 15}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy - 30}" r="3" fill="${INKY}" opacity=".4"/><path d="M${cx - 20} ${cy - 30} H${cx + 20} M${cx} ${cy - 40} V${cy - 20}" stroke="#8FD3C8" stroke-width="2"/>`, u: 0.4, v: 0.4, w: 0.1, d: 0.1 }]);
};

const rug = () => isoItem(3.8, 3, 4, [{ u: 0, v: 0, w: 3.8, d: 3, h: 0, round: true, top: '#E6DDFA',
  topDecor: '<ellipse cx="1.9" cy="1.5" rx="1.6" ry="1.22" fill="none" stroke="#fff" stroke-width=".07" stroke-dasharray=".2 .14"/><ellipse cx="1.9" cy="1.5" rx="1" ry=".76" fill="#F7F2FF"/>' }]);

const plant = () => isoItem(0.85, 0.85, 200, [
  { svg: (() => { const [cx, cy] = at(0.425, 0.425); return shadow(cx, cy + 2, 34) + cyl(cx, cy, 26, 56, '#F2EADF', '#8B6450') + `<path d="M${cx - 26} ${cy - 40} A26 13 0 0 0 ${cx + 26} ${cy - 40}" fill="none" stroke="${GOLD}" stroke-width="4"/>`; })(), u: 0.425, v: 0.425, w: 0.1, d: 0.1 },
  { svg: (() => {
    const [cx, cy] = at(0.425, 0.425, 56);
    const leaf = (x, y, r, col) => `<path d="M${x} ${y} q${-14} ${-6} ${-12} ${-20} q${12} ${-4} ${14} ${10} q${2} ${10} ${-2} ${10} z" transform="rotate(${r} ${x} ${y})" fill="${col}" ${line}/>`;
    return `<path d="M${cx} ${cy} Q${cx - 4} ${cy - 70} ${cx + 4} ${cy - 140}" stroke="#8B6450" stroke-width="5" fill="none"/>`
      + [[-2, -40, -40], [6, -56, 30], [-4, -76, -20], [6, -92, 40], [-2, -110, -35], [4, -126, 20], [2, -140, 0], [-6, -60, -70], [8, -100, 70]]
        .map(([dx, dy, r], i) => leaf(cx + dx, cy + dy, r, i % 2 ? LEAF : '#5AAE6A')).join('');
  })(), u: 0.425, v: 0.425, w: 0.85, d: 0.85, z: 56 },
]);

const bagBench = () => {
  const seat = shades(LILAC), leg = shades(WOOD_D);
  const bag = (u, v, col, h) => { const [x, y] = at(u, v, 46); const c = shades(col); return `<path d="M${x - 13} ${y} L${x + 9} ${y + 4} V${y - h + 4} L${x - 13} ${y - h} Z" fill="${col}" ${line}/><path d="M${x + 9} ${y + 4} L${x + 17} ${y - 2} V${y - h - 2} L${x + 9} ${y - h + 4} Z" fill="${c.right}" ${line}/><path d="M${x - 13} ${y - h} L${x + 9} ${y - h + 4} L${x + 17} ${y - h - 2} L${x - 5} ${y - h - 6} Z" fill="${c.top}" ${line}/><path d="M${x - 6} ${y - h - 1} q6 -14 12 2" fill="none" stroke="${INKY}" stroke-opacity=".6" stroke-width="2"/>${starPath(x - 2, y - h / 2, 5, '#fff')}`; };
  return isoItem(1.4, 0.55, 90, [
    ...[[0.06, 0.06], [1.24, 0.06], [0.06, 0.39], [1.24, 0.39]].map(([u, v]) => ({ u, v, w: 0.1, d: 0.1, h: 34, ...leg })),
    onTop([{ u: 0, v: 0, w: 1.4, d: 0.55, z: 34, h: 12, ...seat, topDecor: '<path d="M.7 0 V.55" stroke="#9A80D8" stroke-width=".02"/>' }]),
    { svg: bag(0.35, 0.3, TEAL, 34) + bag(0.75, 0.25, SUN, 42) + bag(1.12, 0.32, SKY, 30), u: 100, v: 0, w: 1, d: 1 },
  ]);
};

// ---------- wall decor ----------
const I = isoDef;
const W = (...a) => wallDef(R, ...a);

const tryOn = (patch, msg) => (it, api) => {
  const me = api.avatar();
  if (!me) return;
  api.setLook(me, patch);
  api.sfx.wear();
  api.react(me, msg, ['✨', '💜', '👗']);
  it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing');
};

const railBody = (it, sp) => `<path d="M6 10 H${sp.len - 6}" stroke="#A9AEC2" stroke-width="5" stroke-linecap="round"/><path d="M6 10 H${sp.len - 6}" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/>
  ${[8, sp.len / 2, sp.len - 8].map((x) => `<rect x="${x - 4}" y="2" width="8" height="16" rx="3" fill="${WOOD}" ${line}/>`).join('')}`;

const shoeShelfBody = (it, sp) => `${[70, 140].map((y) => `<rect x="0" y="${y}" width="${sp.len}" height="8" rx="2" fill="${CREAM}" ${line}/><path d="M12 ${y + 8} l6 12 M${sp.len - 12} ${y + 8} l-6 12" stroke="${WOOD}" stroke-width="4"/>`).join('')}
  ${text(sp.len / 2, 22, 'SHOES', 16, '#7A64B0')}`;

const bunting = (it, sp) => {
  const n = Math.round(sp.len / 34), cols = [LILAC, TEAL, SUN, SKY];
  return `<path d="M0 6 Q${sp.len / 2} 30 ${sp.len} 6" fill="none" stroke="${INKY}" stroke-opacity=".6" stroke-width="2"/>`
    + Array.from({ length: n - 1 }, (_, i) => { const t = (i + 1) / n, x = sp.len * t, y = 6 + Math.sin(t * Math.PI) * 12; return `<path d="M${x - 10} ${y} L${x + 10} ${y} L${x} ${y + 22} Z" fill="${cols[i % 4]}" ${line}/>`; }).join('');
};

export const BOUTIQUE = {
  id: 'boutique', posKey: 'boutique-iso', title: 'Sunny Boutique 👗', light: 'iso', avatar: [2.9, 2.5],
  frame: '#EAE2F4',
  iso: R,
  bg,
  characters: [{ id: 'stylist', look: NPC.stylist, gx: 4.9, gy: 2.45, say: ['Tap any clothes to try them on! ✨', 'Glasses and hats are on the tables!', 'That looks amazing on you! 💜'] }],
  items: [
    // left wall: rails with tops and bottoms
    W('bunting', 'L', 0.2, 288, 6.6, 40, bunting),
    W('rail1', 'L', 0.3, 238, 3.3, 20, railBody),
    W('rail2', 'L', 3.6, 238, 3.3, 20, railBody),
    ...TOPS.map((p, i) => W('top' + i, 'L', 0.45 + i * 1.05, 236, 1, 124, () => topBody(p), { cls: 'hanger', onTap: tryOn(p, 'New top! ✨') })),
    ...BOTTOMS.map((p, i) => W('bot' + i, 'L', 3.75 + i * 1.05, 236, 1, 124, () => bottomBody(p), { cls: 'hanger', onTap: tryOn(p, 'Love it! 💜') })),
    // right wall: shoe shelves, sign, pictures
    W('shoeshelf', 'R', 0.3, 268, 2.4, 160, shoeShelfBody),
    ...SHOES.map((p, i) => W('shoe' + i, 'R', 0.45 + (i % 2) * 1.1, 268 - 36 - Math.floor(i / 2) * 70, 0.9, 34, () => shoeBody(p), { cls: 'hanger', onTap: tryOn(p, 'Cute shoes! 👟') })),
    W('sign', 'R', 3.0, 284, 3.2, 54, (it, sp) => `<rect width="${sp.len}" height="54" rx="27" fill="#fff" ${line}/><rect x="5" y="5" width="${sp.len - 10}" height="44" rx="22" fill="none" stroke="${LILAC}" stroke-width="2"/>${text(sp.len / 2, 35, 'Sunny Boutique', 20, '#7A64B0')}${starPath(18, 27, 7, SUN)}${starPath(sp.len - 18, 27, 7, SUN)}`),
    W('sketch1', 'R', 3.25, 214, 0.8, 74, (it, sp) => `<rect width="${sp.len}" height="74" rx="3" fill="#fff" stroke="${GOLD}" stroke-width="4"/><circle cx="${sp.len / 2}" cy="18" r="6" fill="#F3D2B8"/><path d="M${sp.len / 2 - 8} 26 h16 l8 36 h-32 z" fill="${CORAL}"/>`),
    W('sketch2', 'R', 4.35, 214, 0.8, 74, (it, sp) => `<rect width="${sp.len}" height="74" rx="3" fill="#fff" stroke="${GOLD}" stroke-width="4"/><circle cx="${sp.len / 2}" cy="18" r="6" fill="#C99772"/><path d="M${sp.len / 2 - 8} 26 h16 v18 l6 20 h-12 l-2 -14 l-2 14 h-12 l6 -20 z" fill="${TEAL}"/>`),
    W('clock', 'R', 2.72, 214, 0.5, 34, (it, sp) => `<ellipse cx="${sp.len / 2}" cy="18" rx="${sp.len / 2}" ry="18" fill="#fff" stroke="${GOLD}" stroke-width="3"/><path d="M${sp.len / 2} 18 V7 M${sp.len / 2} 18 H${sp.len / 2 + 9}" stroke="${INKY}" stroke-width="2.5"/>`),

    I('rug', 2.6, 2.7, 3.8, 3, rug, { floor: true }),
    I('fitting', 6.8, 0, 2.2, 1.8, fitting, { drag: false, data: { open: false },
      onTap: (it, api) => {
        it.data.open = !it.data.open; api.setArt(it); api.sfx.click();
        if (it.data.open && !api.starFound('boutique-fitting')) api.addStar('boutique-fitting', 0, 0, { spawned: true, gx: it.gx + 0.75, gy: it.gy + 0.9 });
      } }),
    I('mirror', 6.0, 2.0, 0.8, 0.3, mirror, { drag: false,
      onTap: (it, api) => { api.sparkle(it.x + it.w / 2, it.y + it.h / 2, ['✨', '💫', '⭐']); api.bubble(it.x + it.w / 2, it.y - 10, 'Looking great! ✨'); api.avatar()?.anim.happy(); } }),
    I('desk', 3.1, 0.1, 2.2, 0.8, desk, { drag: false }),
    I('display', 3.2, 3.8, 2.2, 1.1, displayTable, { drag: false, surface: 70 }),
    I('plinth1', 1.4, 4.0, 0.9, 0.9, plinth(84, TEAL), { drag: false, surface: 84 }),
    I('plinth2', 6.3, 3.8, 0.9, 0.9, plinth(110, SUN), { drag: false, surface: 110 }),
    wearable('sun', 0, 0, 'b-sun', { gx: 3.45, gy: 4.15, gz: 70 }),
    wearable('round', 0, 0, 'b-round', { gx: 4.35, gy: 4.2, gz: 70 }),
    wearable('straw', 0, 0, 'b-straw', { gx: 1.65, gy: 4.25, gz: 84 }),
    wearable('cap', 0, 0, 'b-cap', { gx: 6.55, gy: 4.05, gz: 110 }),
    I('rack', 0.8, 5.9, 1.8, 0.5, rack, { drag: false }),
    I('shoebox', 3.4, 6.1, 0.75, 0.5, shoebox, { data: { open: false },
      onTap: (it, api) => {
        it.data.open = !it.data.open; api.setArt(it); api.sfx.click();
        if (it.data.open && !api.starFound('boutique-box')) api.addStar('boutique-box', 0, 0, { spawned: true, gx: it.gx + 0.18, gy: it.gy + 0.05, gz: 44 });
      } }),
    I('pouf', 1.5, 2.3, 0.8, 0.8, pouf),
    I('bplant', 8.0, 5.5, 0.85, 0.85, plant),
    I('bags', 5.6, 6.2, 1.4, 0.55, bagBench, { drag: false }),
  ],
};
