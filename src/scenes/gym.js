// Gym (isometric dollhouse): treadmill, punching bag, weights, water, a basketball hoop with a score and lockers.
import { room, roomShell, isoItem, at, shades, proj, isoDef, wallDef } from '../iso.js';
import { svg, text, starPath, NPC } from './common.js';

const R = room({ cols: 9, rows: 7, ox: 736, oy: 340, wallH: 296 });
R.charScale = 0.6;

const WOOD = '#C99A6C', WOOD_L = '#E2C29C', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', TURQ = '#3CC7B8',
  SKY = '#9CC8EE', SUN = '#F5DE7A', CORAL = '#E58F6A', LEAF = '#6DBE7A', STEEL = '#6E7BA6', INKY = '#3E3252';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4"';
const P = (a) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const cyl = (cx, cy, rx, h, side, top = side, ln = line) => `<path d="M${cx - rx} ${cy - h} V${cy} A${rx} ${rx / 2} 0 0 0 ${cx + rx} ${cy} V${cy - h} Z" fill="${side}" ${ln}/><ellipse cx="${cx}" cy="${cy - h}" rx="${rx}" ry="${rx / 2}" fill="${top}" ${ln}/>`;
const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx / 2}" fill="${INKY}" opacity=".12"/>`;
// Parts that sit on top of other parts, drawn as one group after them (isoItem sorts parts by footprint only).
const onTop = (parts, key = 99) => { const s = isoItem(1, 0, 0, parts).svg; return { svg: s.slice(s.indexOf('<g'), s.lastIndexOf('</svg>')), u: key, v: 0, w: 0, d: 0 }; };

// The punching bag hangs from a wall bracket at this point (floor tile + height).
const BAG = { gx: 0.6, gy: 2.65, z: 286 };

// ---------- background ----------
const bg = () => {
  const [lx] = proj(R, 0, R.rows), [rx] = proj(R, R.cols, 0), [, fy] = proj(R, R.cols, R.rows);
  const bandL = (z0, z1, fill) => `<polygon points="${P([proj(R, 0, 0, z0), proj(R, 0, R.rows, z0), proj(R, 0, R.rows, z1), proj(R, 0, 0, z1)])}" fill="${fill}"/>`;
  const bandR = (z0, z1, fill) => `<polygon points="${P([proj(R, 0, 0, z0), proj(R, R.cols, 0, z0), proj(R, R.cols, 0, z1), proj(R, 0, 0, z1)])}" fill="${fill}"/>`;
  const [ax, ay] = proj(R, 0, BAG.gy, BAG.z), [bx, by] = proj(R, BAG.gx, BAG.gy, BAG.z);
  return svg(1600, 900, `
  <defs>
    <radialGradient id="gym-bd" cx="50%" cy="55%" r="70%"><stop offset="0" stop-color="#F1F8F6"/><stop offset="1" stop-color="#D3E6E6"/></radialGradient>
    <linearGradient id="gym-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6DA" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#gym-bd)"/>
  <ellipse cx="${(lx + rx) / 2}" cy="${fy + 6}" rx="580" ry="46" fill="${INKY}" opacity=".10"/>
  ${roomShell(R, { floor: '#CFC9E2', floorLines: 'tiles', wallL: '#E2F4F0', wallR: '#DDF0EC' })}
  ${bandL(150, 182, TURQ)}${bandL(140, 148, SUN)}${bandR(150, 182, TURQ)}${bandR(140, 148, SUN)}
  <polygon points="${P([proj(R, 0.6, 0.05), proj(R, 3.0, 0.05), proj(R, 3.6, 2.8), proj(R, 1.2, 2.8)])}" fill="url(#gym-light)"/>
  <rect x="${ax - 8}" y="${ay - 14}" width="16" height="30" rx="3" fill="#5E6A8A" ${line}/>
  <path d="M${ax} ${ay} L${bx} ${by}" stroke="#5E6A8A" stroke-width="7" stroke-linecap="round"/><path d="M${ax} ${ay + 10} L${(ax + bx) / 2} ${(ay + by) / 2}" stroke="#5E6A8A" stroke-width="4"/>
  <circle cx="${bx}" cy="${by + 4}" r="4" fill="none" stroke="#5E6A8A" stroke-width="2.5"/>`);
};

// ---------- equipment ----------
const treadmill = () => {
  const frame = shades(STEEL), rail = shades('#8E9AC0'), post = shades('#5E6A8A'), consoleC = shades('#4D5C9A');
  const [bx, by] = at(0.45, 0.22, 15);
  const L = 2.05 * 64, D = 0.56 * 64;
  const stripes = Array.from({ length: 14 }, (_, i) => `<path d="M${i * 13} 2 V${D - 2}" stroke="#7A86AE" stroke-width="3"/>`).join('');
  return isoItem(2.6, 1, 150, [
    { u: 0.3, v: 0.12, w: 0.08, d: 0.08, h: 132, ...post }, { u: 0.3, v: 0.8, w: 0.08, d: 0.08, h: 132, ...post },
    { u: 0.18, v: 0.08, w: 0.32, d: 0.84, z: 124, h: 24, ...consoleC,
      rightDecor: `<rect x="6" y="4" width="42" height="16" rx="3" fill="#9EDDD4"/>${text(27, 16, '3.5', 11, INKY)}` },
    { u: 0.3, v: 0.1, w: 2.3, d: 0.8, h: 12, ...frame },
    { svg: `<g transform="matrix(1,0.5,-1,0.5,${bx},${by})"><clipPath id="gym-belt"><rect width="${L}" height="${D}"/></clipPath>
      <rect width="${L}" height="${D}" fill="#3E4A5E"/><g clip-path="url(#gym-belt)"><g class="belt">${stripes}</g></g></g>`, u: 0.45, v: 0.22, w: 2.05, d: 0.56, z: 14 },
    { u: 0.3, v: 0.08, w: 2.3, d: 0.12, z: 0, h: 18, ...rail },
    { u: 0.3, v: 0.8, w: 2.3, d: 0.12, z: 0, h: 18, ...rail, leftDecor: `<path d="M8 6 H140" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>` },
    { u: 0.38, v: 0.12, w: 0.6, d: 0.06, z: 92, h: 6, ...post }, { u: 0.38, v: 0.82, w: 0.6, d: 0.06, z: 92, h: 6, ...post },
  ]);
};

const bag = () => {
  const [hx, hy] = at(0.35, 0.35, BAG.z);
  const [cx, cy] = at(0.35, 0.35, 64);
  const [sx, sy] = at(0.35, 0.35);
  return isoItem(0.7, 0.7, BAG.z - 0.7 * 32, [{ svg: `${shadow(sx, sy, 30)}
    <path d="M${hx} ${hy} V${cy - 166} M${hx} ${cy - 166} L${cx - 18} ${cy - 150} M${hx} ${cy - 166} L${cx + 18} ${cy - 150}" stroke="#5E6A8A" stroke-width="2.5" fill="none"/>
    ${cyl(cx, cy, 26, 150, CORAL, '#EFA383')}
    <path d="M${cx - 26} ${cy - 120} A26 13 0 0 0 ${cx + 26} ${cy - 120} M${cx - 26} ${cy - 30} A26 13 0 0 0 ${cx + 26} ${cy - 30}" fill="none" stroke="#3E4A5E" stroke-width="9" stroke-opacity=".75"/>
    <path d="M${cx - 12} ${cy - 104} Q${cx - 15} ${cy - 76} ${cx - 12} ${cy - 46}" stroke="#fff" stroke-width="6" opacity=".35" stroke-linecap="round" fill="none"/>
    ${starPath(cx + 6, cy - 76, 9, '#fff', 'opacity=".7"')}`, u: 0.35, v: 0.35, w: 0.1, d: 0.1 }]);
};

const rack = () => {
  const frame = shades('#5E6A8A');
  const bell = (u, v, z, col) => { const [x, y] = at(u, v, z); return `<rect x="${x - 12}" y="${y - 4}" width="24" height="4" fill="#B9C4D6" ${line}/><rect x="${x - 16}" y="${y - 12}" width="8" height="12" rx="2" fill="${col}" ${line}/><rect x="${x + 8}" y="${y - 12}" width="8" height="12" rx="2" fill="${col}" ${line}/>`; };
  const plate = (u, v, z, col, r) => { const [x, y] = at(u, v, z); return `<ellipse cx="${x}" cy="${y - r}" rx="${r * 0.55}" ry="${r}" fill="${col}" ${line}/><ellipse cx="${x}" cy="${y - r}" rx="${r * 0.18}" ry="${r * 0.33}" fill="#3E4A5E"/>`; };
  return isoItem(2.2, 0.6, 110, [
    { u: 0, v: 0, w: 0.08, d: 0.6, h: 100, ...frame }, { u: 1.06, v: 0, w: 0.08, d: 0.6, h: 100, ...frame },
    { u: 0, v: 0, w: 2.2, d: 0.6, z: 34, h: 5, ...frame }, { u: 0, v: 0, w: 2.2, d: 0.6, z: 74, h: 5, ...frame },
    { svg: [[0.2, CORAL], [0.55, SUN], [0.9, TEAL], [1.3, LILAC], [1.65, SKY], [1.98, CORAL]].map(([u, c]) => bell(u, 0.32, 39, c)).join('')
      + [[0.25, LILAC, 18], [0.5, TEAL, 16], [0.75, SUN, 13]].map(([u, c, r]) => plate(u, 0.3, 79, c, r)).join('')
      + [[1.4, SKY, 18], [1.62, CORAL, 15], [1.84, LILAC, 12]].map(([u, c, r]) => plate(u, 0.3, 79, c, r)).join(''), u: 1.1, v: 0.3, w: 0.2, d: 0.2, z: 40 },
    { u: 2.12, v: 0, w: 0.08, d: 0.6, h: 100, ...frame },
  ]);
};

const bench = () => {
  const leg = shades('#5E6A8A'), pad = shades(LILAC);
  return isoItem(1.8, 0.5, 46, [
    { u: 0.15, v: 0.1, w: 0.1, d: 0.3, h: 32, ...leg }, { u: 1.55, v: 0.1, w: 0.1, d: 0.3, h: 32, ...leg },
    onTop([{ u: 0, v: 0, w: 1.8, d: 0.5, z: 32, h: 12, ...pad, topDecor: '<path d="M.6 0 V.5 M1.2 0 V.5" stroke="#9A80D8" stroke-width=".02"/>' }]),
  ]);
};

const dumbbell = () => {
  const disc = shades('#4D5C9A');
  return isoItem(0.6, 0.3, 34, [
    { u: 0, v: 0.02, w: 0.14, d: 0.26, h: 26, ...disc },
    { u: 0.14, v: 0.12, w: 0.32, d: 0.06, z: 10, h: 6, ...shades('#B9C4D6') },
    { u: 0.46, v: 0.02, w: 0.14, d: 0.26, h: 26, ...disc },
  ]);
};

const bottle = () => {
  const [cx, cy] = at(0.13, 0.13);
  return isoItem(0.26, 0.26, 66, [{ svg: `${cyl(cx, cy, 11, 48, '#AFD6F7', '#CFE6FA')}
    <path d="M${cx - 11} ${cy - 24} V${cy} A11 5.5 0 0 0 ${cx + 11} ${cy} V${cy - 24} A11 5.5 0 0 1 ${cx - 11} ${cy - 24} Z" fill="#8FC3F0"/>
    <path d="M${cx - 5} ${cy - 42} V${cy - 6}" stroke="#fff" stroke-width="3" opacity=".6"/>${cyl(cx, cy - 48, 6, 9, '#4D5C9A')}`, u: 0.13, v: 0.13, w: 0.1, d: 0.1 }]);
};

const kettlebell = (col) => () => {
  const [cx, cy] = at(0.17, 0.17);
  return isoItem(0.34, 0.34, 46, [{ svg: `${shadow(cx, cy, 16)}<path d="M${cx - 9} ${cy - 24} Q${cx - 10} ${cy - 42} ${cx} ${cy - 42} Q${cx + 10} ${cy - 42} ${cx + 9} ${cy - 24}" fill="none" stroke="#4D5C9A" stroke-width="5"/>
    <circle cx="${cx}" cy="${cy - 14}" r="15" fill="${col}" ${line}/><path d="M${cx - 8} ${cy - 20} q4 -5 9 -5" stroke="#fff" stroke-width="3" opacity=".55" fill="none"/>`, u: 0.17, v: 0.17, w: 0.1, d: 0.1 }]);
};

const ball = () => {
  const [cx, cy] = at(0.225, 0.225, 21);
  const [sx, sy] = at(0.225, 0.225);
  return isoItem(0.45, 0.45, 48, [{ svg: `${shadow(sx, sy, 22)}<circle cx="${cx}" cy="${cy}" r="21" fill="#F0A060" ${line}/>
    <path d="M${cx - 21} ${cy} H${cx + 21} M${cx} ${cy - 21} V${cy + 21} M${cx - 14} ${cy - 15} Q${cx - 4} ${cy} ${cx - 14} ${cy + 15} M${cx + 14} ${cy - 15} Q${cx + 4} ${cy} ${cx + 14} ${cy + 15}" stroke="${INKY}" stroke-opacity=".7" stroke-width="1.6" fill="none"/>`, u: 0.225, v: 0.225, w: 0.1, d: 0.1 }]);
};

const gymBall = () => {
  const [cx, cy] = at(0.4, 0.4, 36);
  const [sx, sy] = at(0.4, 0.4);
  return isoItem(0.8, 0.8, 74, [{ svg: `${shadow(sx, sy + 2, 36)}<circle cx="${cx}" cy="${cy}" r="36" fill="${TEAL}" ${line}/>
    <path d="M${cx - 36} ${cy} Q${cx} ${cy + 14} ${cx + 36} ${cy}" stroke="#fff" stroke-width="3" opacity=".5" fill="none"/><path d="M${cx - 20} ${cy - 20} q8 -9 20 -10" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round" fill="none"/>`, u: 0.4, v: 0.4, w: 0.1, d: 0.1 }]);
};

const mat = () => isoItem(2.6, 1.4, 6, [{ u: 0, v: 0, w: 2.6, d: 1.4, h: 6, ...shades('#C9B8F2'),
  topDecor: '<rect x=".12" y=".12" width="2.36" height="1.16" rx=".12" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width=".05"/><path d="M.5 .12 V1.28 M2.1 .12 V1.28" stroke="#fff" stroke-opacity=".6" stroke-width=".07"/>' }]);

const locker = (it) => {
  const open = it?.data.open;
  const body = shades(SKY), door = shades('#AFD6F7'), top = shades('#8FC3F0');
  const dw = (2.2 * 64) / 3;
  const doorArt = (i) => `<rect x="${i * dw + 3}" y="6" width="${dw - 6}" height="200" rx="3" fill="#B7DCF9" ${line}/>
    ${[0, 8, 16].map((y) => `<rect x="${i * dw + 10}" y="${20 + y}" width="${dw - 20}" height="4" rx="2" fill="${INKY}" opacity=".25"/>`).join('')}
    <rect x="${i * dw + dw - 13}" y="100" width="5" height="22" rx="2" fill="#fff" ${line}/>${text(i * dw + dw / 2, 186, String(i + 1), 12, '#5E6A8A')}`;
  const inside = `<rect x="${dw + 3}" y="6" width="${dw - 6}" height="200" rx="3" fill="#3E4A5E"/><path d="M${dw + 6} 70 H${2 * dw - 6}" stroke="#C9C3DD" stroke-width="4"/>
    <path d="M${dw + 16} 78 l-6 10 v54 h${dw - 20} v-54 l-6 -10 z" fill="${SUN}" ${line}/><circle cx="${dw * 1.5}" cy="54" r="9" fill="${CORAL}" ${line}/>`;
  return isoItem(0.8, 2.2, 236, [
    { u: 0, v: 0, w: 0.8, d: 2.2, h: 214, ...body, rightDecor: open ? doorArt(0) + inside + doorArt(2) : doorArt(0) + doorArt(1) + doorArt(2) },
    onTop([{ u: -0.03, v: -0.03, w: 0.86, d: 2.26, z: 214, h: 10, ...top }]),
    ...(open ? [{ u: 0.8, v: 1.45, w: 0.62, d: 0.04, z: 6, h: 200, ...door, leftDecor: '<rect x="10" y="20" width="20" height="4" rx="2" fill="#3E3252" opacity=".25"/><rect x="10" y="28" width="20" height="4" rx="2" fill="#3E3252" opacity=".25"/>' }] : []),
  ]);
};

const cooler = () => {
  const c = shades(CREAM, 0.7);
  const [cx, cy] = at(0.3, 0.3, 92);
  return isoItem(0.6, 0.6, 160, [
    { u: 0.05, v: 0.05, w: 0.5, d: 0.5, h: 92, ...c,
      leftDecor: `<rect x="6" y="20" width="10" height="8" rx="2" fill="${SKY}" ${line}/><rect x="20" y="20" width="10" height="8" rx="2" fill="${CORAL}" ${line}/><rect x="4" y="60" width="26" height="6" rx="2" fill="#B9C4D6"/>` },
    { svg: `${cyl(cx, cy, 20, 54, '#AFD6F7', '#CFE6FA')}<path d="M${cx - 8} ${cy - 48} V${cy - 8}" stroke="#fff" stroke-width="5" opacity=".6"/><ellipse cx="${cx}" cy="${cy - 30}" rx="20" ry="10" fill="none" stroke="#8FC3F0" stroke-width="2"/>`, u: 0.3, v: 0.3, w: 0.2, d: 0.2, z: 92 },
  ]);
};

const plant = () => isoItem(0.8, 0.8, 170, [
  { svg: (() => { const [cx, cy] = at(0.4, 0.4); return shadow(cx, cy + 2, 32) + cyl(cx, cy, 25, 48, CORAL, '#8B6450') + `<path d="M${cx - 25} ${cy - 40} A25 12.5 0 0 0 ${cx + 25} ${cy - 40}" fill="none" stroke="#F0A584" stroke-width="7"/>`; })(), u: 0.4, v: 0.4, w: 0.1, d: 0.1 },
  { svg: (() => { const [cx, cy] = at(0.4, 0.4, 48); return [[-30, -76, -8], [26, -84, 10], [-4, -112, 0], [-40, -40, -16], [40, -48, 16], [12, -100, 6]].map(([dx, dy, r], i) => `<path d="M${cx} ${cy} Q${cx + dx * 0.4} ${cy + dy * 0.6} ${cx + dx} ${cy + dy} Q${cx + dx * 0.9 + r} ${cy + dy * 0.5} ${cx} ${cy} Z" fill="${i % 2 ? '#5AAE6A' : LEAF}" ${line}/>`).join(''); })(), u: 0.4, v: 0.4, w: 0.8, d: 0.8, z: 48 },
]);

const plyoBox = () => {
  const c = shades(SUN);
  return isoItem(0.8, 0.8, 54, [{ u: 0, v: 0, w: 0.8, d: 0.8, h: 54, ...c,
    leftDecor: `<rect x="8" y="10" width="35" height="34" rx="4" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>${text(25.6, 33, '24', 14, '#C9A23A')}`,
    rightDecor: `<rect x="8" y="10" width="35" height="34" rx="4" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>` }]);
};

const roller = () => {
  const [a, b] = at(0.08, 0.2, 13), [c, d] = at(0.72, 0.2, 13);
  return isoItem(0.8, 0.4, 30, [{ svg: `${shadow((a + c) / 2, (b + d) / 2 + 13, 26)}
    <path d="M${a} ${b - 13} L${c} ${d - 13} L${c} ${d + 13} L${a} ${b + 13} Z" fill="${LILAC}" ${line}/>
    <ellipse cx="${a}" cy="${b}" rx="7" ry="13" fill="#C9B8F2" ${line}/><ellipse cx="${c}" cy="${d}" rx="7" ry="13" fill="#C9B8F2" ${line}/><ellipse cx="${c}" cy="${d}" rx="2.5" ry="5" fill="#9A80D8"/>
    ${[0.25, 0.45, 0.65].map((t) => `<path d="M${a + (c - a) * t} ${b + (d - b) * t - 13} v26" stroke="#9A80D8" stroke-width="2"/>`).join('')}`, u: 0.4, v: 0.2, w: 0.1, d: 0.1 }]);
};

const scale = () => {
  const c = shades('#E8EEF7', 0.5);
  return isoItem(0.5, 0.4, 14, [{ u: 0, v: 0, w: 0.5, d: 0.4, h: 6, ...c, topDecor: '<rect x=".12" y=".08" width=".26" height=".12" rx=".02" fill="#9EDDD4"/><circle cx=".25" cy=".28" r=".04" fill="#5E6A8A"/>' }]);
};

// ---------- wall decor ----------
const I = isoDef;
const W = (...a) => wallDef(R, ...a);

// The hoop: backboard flat on the right wall, rim sticking out (drawn screen-aligned). RIM = rim centre inside the item.
const HOOP_LEN = 1.7 * 64;
const RIM = { x: HOOP_LEN / 2 - 29, y: 84 + HOOP_LEN / 4 + 14 };
const hoopBody = (it, sp) => {
  const w = sp.len;
  const net = Array.from({ length: 6 }, (_, i) => { const x0 = RIM.x - 24 + i * 9.6, x1 = RIM.x - 14 + i * 5.6; return `M${x0} ${RIM.y + 2} L${x1} ${RIM.y + 46}`; }).join(' ');
  return `<rect width="${w}" height="80" rx="6" fill="#fff" ${line}/><rect x="4" y="4" width="${w - 8}" height="72" rx="4" fill="none" stroke="${SKY}" stroke-width="2"/>
    <rect x="${w / 2 - 22}" y="36" width="44" height="34" fill="none" stroke="${CORAL}" stroke-width="3.5"/>
    ${text(w / 2, 26, 'SCORE ' + (it?.data.score || 0), 15, CORAL)}
    <g transform="matrix(1,-0.5,0,1,0,0)">
      <path d="M${w / 2} ${76 + w / 4} L${RIM.x + 10} ${RIM.y - 4}" stroke="#8E9AC0" stroke-width="5"/>
      <path d="${net} M${RIM.x - 20} ${RIM.y + 18} H${RIM.x + 20} M${RIM.x - 16} ${RIM.y + 34} H${RIM.x + 16}" stroke="#fff" stroke-width="2.4"/>
      <path d="${net}" stroke="${INKY}" stroke-opacity=".25" stroke-width="1"/>
      <ellipse cx="${RIM.x}" cy="${RIM.y}" rx="26" ry="10" fill="none" stroke="${CORAL}" stroke-width="5"/>
    </g>`;
};

const windowBody = (it, sp) => {
  const w = sp.len, h = 150;
  return `<rect width="${w}" height="${h}" rx="6" fill="#BFE3FA" ${line}/>
    <circle cx="${w * 0.78}" cy="38" r="16" fill="#FFF3B8"/><path d="M14 64 q16 -18 36 -6 q12 -14 32 -2 q18 0 14 14 z" fill="#fff"/>
    <path d="M0 ${h * 0.78} Q${w * 0.25} ${h * 0.62} ${w * 0.5} ${h * 0.74} T${w} ${h * 0.7} V${h} H0 Z" fill="#A8DE9A"/>
    ${[0.2, 0.62].map((t) => `<rect x="${w * t - 3}" y="${h * 0.6}" width="6" height="${h * 0.2}" fill="#8B6450"/><circle cx="${w * t}" cy="${h * 0.58}" r="14" fill="${LEAF}"/>`).join('')}
    <path d="M${w / 3} 0 V${h} M${(2 * w) / 3} 0 V${h}" stroke="${CREAM}" stroke-width="6"/>
    <rect x="-6" y="${h - 4}" width="${w + 12}" height="12" rx="3" fill="${CREAM}" ${line}/>
    <rect x="-8" y="-10" width="${w + 16}" height="10" rx="3" fill="${CREAM}" ${line}/>`;
};

export const GYM = {
  id: 'gym', posKey: 'gym-iso', title: 'Sunny Gym 💪', light: 'iso', avatar: [2.6, 3.8],
  frame: '#DCEDEA',
  iso: R,
  bg,
  // Hidden under the mat: drawn below floor items (z 3), so it shows once the mat is dragged away.
  stars: [(() => { const [sx, sy] = proj(R, 4.9, 4.6); return { id: 'gym-mat', x: sx - 32, y: sy - 56, z: 3 }; })()],
  characters: [{ id: 'coach', look: NPC.coach, gx: 6.5, gy: 3.1, say: ["I'm Coach Sam! Let's train! 💪", 'Try the punching bag!', 'Drink water, champ! 💧', 'Can you score 5 baskets? 🏀'] }],
  items: [
    // walls
    W('window', 'R', 0.6, 268, 2.4, 150, windowBody),
    W('poster', 'L', 0.25, 256, 1.45, 108, (it, sp) => `<rect width="${sp.len}" height="108" rx="8" fill="#fff" ${line}/><rect x="6" y="6" width="${sp.len - 12}" height="96" rx="5" fill="none" stroke="${SUN}" stroke-width="3"/>${text(sp.len / 2, 44, 'You can', 18, CORAL)}${text(sp.len / 2, 66, 'do it!', 18, CORAL)}${text(sp.len / 2, 92, 'Sunny Gym', 13, TURQ)}`),
    W('gmirror', 'L', 3.1, 250, 1.2, 160, (it, sp) => `<rect width="${sp.len}" height="160" rx="6" fill="#D8ECFA" stroke="${CREAM}" stroke-width="6"/><path d="M14 60 L50 20 M12 104 L68 40" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".8"/>`),
    W('towels', 'R', 3.5, 214, 2.0, 52, (it, sp) => `<rect y="40" width="${sp.len}" height="7" rx="2" fill="${WOOD}" ${line}/>${[TEAL, SUN, LILAC, SKY, CREAM, TEAL].map((c, i) => `<rect x="${8 + i * 20}" y="${22 - (i % 2) * 6}" width="18" height="${18 + (i % 2) * 6}" rx="8" fill="${c}" ${line}/>`).join('')}`),
    W('clock', 'R', 5.5, 252, 0.55, 36, (it, sp) => `<ellipse cx="${sp.len / 2}" cy="18" rx="${sp.len / 2}" ry="18" fill="#fff" stroke="${TURQ}" stroke-width="3"/><path d="M${sp.len / 2} 18 V7 M${sp.len / 2} 18 H${sp.len / 2 + 9}" stroke="${INKY}" stroke-width="2.5"/>`),
    W('hoop', 'R', 6.2, 266, 1.7, 130, hoopBody, { data: { score: 0 } }),

    I('mat', 3.4, 3.6, 2.6, 1.4, mat, { floor: true }),
    I('treadmill', 0.3, 0.35, 2.6, 1, treadmill, { drag: false,
      onTap: (it, api) => { it.el.classList.add('running'); api.bubble(it.x + it.w / 2, it.y - 10, 'Run, run, run! 🏃'); api.avatar()?.anim.happy(); api.later(() => it.el.classList.remove('running'), 2400); } }),
    I('bag', BAG.gx - 0.35, BAG.gy - 0.35, 0.7, 0.7, bag, { drag: false,
      onTap: (it, api) => { it.el.classList.remove('punch'); void it.el.offsetWidth; it.el.classList.add('punch'); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y + it.h * 0.55, ['POW! 💥', 'Bam! 🥊', 'Strong! 💪'][Math.floor(Math.random() * 3)]); } }),
    I('rack', 3.4, 0.1, 2.2, 0.6, rack, { drag: false }),
    I('bench', 3.6, 1.45, 1.8, 0.5, bench, { drag: false, surface: 44 }),
    I('dumbbell', 3.0, 2.4, 0.6, 0.3, dumbbell, { small: true,
      onGive: (it, api, who) => { api.sfx.boing(); api.react(who, 'Look how strong! 💪', ['💪', '✨', '⭐']); besides(api, it, who); } }),
    I('bottle', 5.0, 1.55, 0.26, 0.26, bottle, { small: true, gz: 44,
      onGive: (it, api, who) => { api.sfx.yum(); api.react(who, 'So refreshing! 💧', ['💧', '✨', '💙']); besides(api, it, who); } }),
    I('kb1', 5.85, 0.95, 0.34, 0.34, kettlebell(LILAC), { small: true }),
    I('kb2', 6.3, 1.05, 0.34, 0.34, kettlebell(TURQ), { small: true }),
    I('locker', 0.05, 4.8, 0.8, 2.2, locker, { drag: false, data: { open: false },
      onTap: (it, api) => {
        it.data.open = !it.data.open; api.setArt(it); api.sfx.click();
        if (it.data.open && !api.starFound('gym-locker')) api.addStar('gym-locker', 0, 0, { spawned: true, gx: it.gx + 0.65, gy: it.gy + 0.9, gz: 80 });
      } }),
    I('cooler', 8.25, 0.15, 0.6, 0.6, cooler, { drag: false,
      onTap: (it, api) => { api.sfx.pour(); api.bubble(it.x + it.w / 2, it.y - 10, 'Glug glug! 💧'); } }),
    I('ball', 6.9, 1.7, 0.45, 0.45, ball, { data: { busy: false },
      onTap: (it, api) => {
        if (it.data.busy) return;
        it.data.busy = true;
        const hoop = api.get('hoop');
        const dx = hoop.x + RIM.x - (it.x + it.ax), dy = hoop.y + RIM.y - 14 - (it.y + it.ay - 21);
        it.el.style.setProperty('--dx', dx + 'px');
        it.el.style.setProperty('--dy', dy + 'px');
        it.el.classList.add('shoot');
        const scored = Math.random() < 0.7;
        api.later(() => {
          if (scored) {
            hoop.data.score++; api.setArt(hoop); api.sfx.win();
            api.bubble(hoop.x + RIM.x, hoop.y + RIM.y + 70, hoop.data.score === 5 ? 'FIVE baskets! Champion! 🏆' : 'Score! 🏀');
            api.sparkle(hoop.x + RIM.x, hoop.y + RIM.y, ['🏀', '✨', '⭐']);
          } else api.bubble(hoop.x + RIM.x, hoop.y + RIM.y + 70, 'So close! Try again!');
        }, 500);
        api.later(() => { it.el.classList.remove('shoot'); it.data.busy = false; }, 1000);
      } }),
    I('gball', 7.3, 4.5, 0.8, 0.8, gymBall, {
      onTap: (it, api) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.sfx.boing(); } }),
    I('gplant', 8.1, 5.6, 0.8, 0.8, plant),
    I('plyo', 1.6, 5.4, 0.8, 0.8, plyoBox, { surface: 54 }),
    I('roller', 2.7, 6.2, 0.8, 0.4, roller, { small: true }),
    I('scale', 1.25, 2.6, 0.5, 0.4, scale),
  ],
};

// After giving something to a character, put it down on the floor right beside them.
function besides(api, it, who) {
  it.gx = Math.max(0, Math.min(R.cols - it.fw, (who.gx ?? 0) + 0.55));
  it.gy = Math.max(0, Math.min(R.rows - it.fd, who.gy ?? 0));
  it.gz = 0; it.on = null;
  api.place(it);
}
