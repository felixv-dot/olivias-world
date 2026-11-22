// Café (isometric dollhouse): coffee machine, blender and pastry case on the counter, a barista behind it,
// cosy tables by the window and a friend to share a snack with.
import { room, roomShell, isoItem, at, shades, proj, isoDef, wallDef } from '../iso.js';
import { svg, text, starPath, stringLights, food, NPC } from './common.js';

const R = room({ cols: 9, rows: 8, ox: 768, oy: 314, wallH: 280 });
R.charScale = 0.6;

const WOOD = '#C99A6C', WOOD_D = '#B58456', WOOD_L = '#E2C29C', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', TURQ = '#3CC7B8',
  SKY = '#9CC8EE', SUN = '#F5DE7A', CORAL = '#E58F6A', LEAF = '#6DBE7A', INKY = '#3E3252';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4"';
const P = (a) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
// An upright cylinder standing on (cx, cy): side + top ellipse (2:1 like the floor).
const cyl = (cx, cy, rx, h, side, top = side, ln = line) => `<path d="M${cx - rx} ${cy - h} V${cy} A${rx} ${rx / 2} 0 0 0 ${cx + rx} ${cy} V${cy - h} Z" fill="${side}" ${ln}/><ellipse cx="${cx}" cy="${cy - h}" rx="${rx}" ry="${rx / 2}" fill="${top}" ${ln}/>`;
const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx / 2}" fill="${INKY}" opacity=".12"/>`;
// Parts that sit on top of other parts, drawn as one group after them (isoItem sorts parts by footprint only).
const onTop = (parts, key = 99) => { const s = isoItem(1, 0, 0, parts).svg; return { svg: s.slice(s.indexOf('<g'), s.lastIndexOf('</svg>')), u: key, v: 0, w: 0, d: 0 }; };

// ---------- background ----------
const bg = (w) => {
  const sunny = w.weather !== 'rain';
  const [lx] = proj(R, 0, R.rows), [rx] = proj(R, R.cols, 0), [, fy] = proj(R, R.cols, R.rows);
  const wall = (gy, z) => proj(R, 0, gy, z);
  const boards = Array.from({ length: R.rows * 4 - 1 }, (_, i) => { const a = wall((i + 1) / 4, 18), b = wall((i + 1) / 4, 104); return `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`; }).join(' ');
  return svg(1600, 900, `
  <defs>
    <radialGradient id="cafe-bd" cx="50%" cy="55%" r="70%"><stop offset="0" stop-color="#FBF6EC"/><stop offset="1" stop-color="#E7DCEE"/></radialGradient>
    <pattern id="cafe-brick" width="64" height="32" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,0,1,${R.ox},${R.oy})">
      <rect width="64" height="32" fill="#EFDFCC"/><rect x="2" y="2" width="28" height="12" rx="2" fill="#F4E6D5"/><rect x="34" y="18" width="28" height="12" rx="2" fill="#E9D5BF"/>
      <path d="M0 0 H64 M0 16 H64 M32 0 V16 M0 16 V32 M64 16 V32" stroke="#D9C2AA" stroke-width="2.5"/></pattern>
    <pattern id="cafe-stripe" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="matrix(1,-0.5,0,1,${R.ox},${R.oy})">
      <rect width="48" height="48" fill="#E3F5F1"/><rect width="20" height="48" fill="#F3FAF6"/><circle cx="34" cy="24" r="2.4" fill="#BFE6DF"/></pattern>
    <pattern id="cafe-check" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,-1,0.5,${R.ox},${R.oy})">
      <rect width="64" height="64" fill="#F6F2FF"/><rect width="32" height="32" fill="#DED3F6"/><rect x="32" y="32" width="32" height="32" fill="#DED3F6"/></pattern>
    <linearGradient id="cafe-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".6"/><stop offset="1" stop-color="#FFF6DA" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#cafe-bd)"/>
  <ellipse cx="${(lx + rx) / 2}" cy="${fy + 6}" rx="600" ry="46" fill="${INKY}" opacity=".10"/>
  ${roomShell(R, { floor: '#F6F2FF', floorLines: 'tiles', wallL: '#E3F5F1', wallR: '#EFDFCC', floorPattern: 'cafe-check', wallPatternL: 'cafe-stripe', wallPatternR: 'cafe-brick' })}
  <polygon points="${P([wall(0, 18), wall(R.rows, 18), wall(R.rows, 104), wall(0, 104)])}" fill="#FBF6E8" ${line}/>
  <path d="${boards}" stroke="#E2D6C0" stroke-width="2"/>
  <polygon points="${P([wall(0, 104), wall(R.rows, 104), wall(R.rows, 112), wall(0, 112)])}" fill="${WOOD_L}" ${line}/>
  <polygon points="${P([proj(R, 0.05, 2.4), proj(R, 0.05, 4.6), proj(R, 3.4, 5.7), proj(R, 3.4, 3.5)])}" fill="url(#cafe-light)" opacity="${sunny ? 1 : 0.35}"/>
  <polygon points="${P([proj(R, 6.6, 0.05), proj(R, 8.6, 0.05), proj(R, 8.95, 2.4), proj(R, 6.95, 2.4)])}" fill="url(#cafe-light)" opacity="${sunny ? 0.8 : 0.25}"/>`);
};

// ---------- the counter and what stands on it ----------
const counter = () => {
  const body = shades(LILAC), top = shades('#F3EEE6', 0.6), kick = shades('#8E78C8');
  return isoItem(5, 1, 96, [
    { u: 0.04, v: 0.04, w: 4.88, d: 0.86, h: 12, ...kick },
    { u: 0, v: 0, w: 5, d: 0.96, z: 10, h: 78, ...body,
      leftDecor: Array.from({ length: 5 }, (_, i) => `<rect x="${i * 64 + 8}" y="12" width="48" height="54" rx="7" fill="#fff" fill-opacity=".2" ${line}/>`).join('')
        + `<path d="M0 5 H320" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>${starPath(160, 39, 9, SUN)}`,
      rightDecor: `<rect x="8" y="12" width="45" height="54" rx="7" fill="#fff" fill-opacity=".2" ${line}/>` },
    { u: -0.05, v: -0.05, w: 5.1, d: 1.1, z: 88, h: 8, ...top, leftDecor: '<path d="M0 6 H330" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>' },
  ]);
};

// Where a cup stands when it is "under the machine" (offset on the machine's footprint, height on its drip tray).
const SPOT = { u: 0.35, v: 0.26, z: 6 };
const machine = () => {
  const body = shades(TEAL), steel = shades('#C9CFDD'), dark = shades('#5E6A8A');
  const [sx, sy] = at(0.5, 0.4, 70);
  return isoItem(1, 0.6, 130, [
    { u: 0, v: 0, w: 1, d: 0.28, h: 92, ...body,
      rightDecor: `<circle cx="9" cy="40" r="7" fill="#fff" ${line}/><path d="M9 40 l3 -4" stroke="${INKY}" stroke-width="1.5"/>` },
    { u: 0, v: 0, w: 1, d: 0.5, z: 92, h: 36, ...body,
      leftDecor: `<rect x="6" y="8" width="36" height="20" rx="4" fill="#3E4A5E"/>${text(24, 22, 'COFFEE', 9, '#fff')}<circle class="machine-btn" cx="52" cy="18" r="7.5" fill="${SUN}" ${line}/>`,
      topDecor: `<rect x=".12" y=".08" width=".76" height=".3" rx=".04" fill="#E9F7F4"/>` },
    { u: 0.42, v: 0.28, w: 0.16, d: 0.14, z: 70, h: 10, ...dark },
    { u: 0.12, v: 0.28, w: 0.76, d: 0.32, h: 6, ...steel, topDecor: '<path d="M.1 .1 H.66 M.1 .2 H.66" stroke="#8E95AA" stroke-width=".03"/>' },
    { svg: `<rect class="stream" x="${sx - 2.5}" y="${sy}" width="5" height="36" rx="2.5" fill="#8B5A3C"/>`, u: 0.5, v: 0.4, w: 0.1, d: 0.1, z: 1 },
    { svg: (() => { const [cx, cy] = at(0.3, 0.25, 128); const [dx, dy] = at(0.62, 0.25, 128); return cyl(cx, cy, 7, 9, CREAM) + cyl(dx, dy, 7, 9, '#FBEFB4'); })(), u: 0.5, v: 0.3, w: 0.3, d: 0.2, z: 128 },
  ]);
};

const cupArt = (it) => {
  const full = it?.data.full, color = it?.data.color || CREAM;
  const [cx, cy] = at(0.15, 0.15);
  return isoItem(0.3, 0.3, 40, [{ svg: `
    ${full ? `<path class="steam" d="M${cx - 4} ${cy - 30} q-5 -7 0 -14 M${cx + 5} ${cy - 30} q-5 -7 0 -14" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".9"/>` : ''}
    <path d="M${cx + 10} ${cy - 18} q10 0 9 8 q-1 7 -10 6" fill="none" stroke="${INKY}" stroke-opacity=".6" stroke-width="3"/>
    ${cyl(cx, cy, 11, 22, color, full ? '#8B5A3C' : '#EFEAF8')}
    <path d="M${cx - 11} ${cy - 8} A11 5.5 0 0 0 ${cx + 11} ${cy - 8}" fill="none" stroke="${LILAC}" stroke-width="3"/>
    ${full ? `<path d="M${cx - 4} ${cy - 22} q4 -3 8 0" stroke="#F5E3D0" stroke-width="2" fill="none"/>` : ''}`, u: 0.15, v: 0.15, w: 0.1, d: 0.1 }]);
};

const blender = () => {
  const base = shades('#8E78C8');
  const [cx, cy] = at(0.225, 0.225, 30);
  return isoItem(0.45, 0.45, 110, [
    { u: 0.04, v: 0.04, w: 0.37, d: 0.37, h: 30, ...base, leftDecor: `<circle cx="12" cy="15" r="5" fill="${SUN}" ${line}/>` },
    { svg: `<g class="jar"><path d="M${cx - 12} ${cy} L${cx - 17} ${cy - 66} H${cx + 17} L${cx + 12} ${cy} Z" fill="#E8F6FF" fill-opacity=".85" ${line}/>
      <path d="M${cx - 13} ${cy - 6} L${cx - 15.5} ${cy - 38} H${cx + 15.5} L${cx + 13} ${cy - 6} Z" fill="${LILAC}"/>
      <circle cx="${cx - 4}" cy="${cy - 24}" r="3" fill="#fff" opacity=".6"/><path d="M${cx + 8} ${cy - 60} V${cy - 12}" stroke="#fff" stroke-width="3" opacity=".7"/>
      <rect x="${cx - 19}" y="${cy - 74}" width="38" height="10" rx="4" fill="#5E4E8E" ${line}/></g>`, u: 0.225, v: 0.225, w: 0.1, d: 0.1 },
  ]);
};

const tipJar = () => {
  const [cx, cy] = at(0.15, 0.15);
  return isoItem(0.3, 0.3, 46, [{ svg: `
    ${cyl(cx, cy, 12, 34, '#E8F6FF', '#F4FBFF')}
    <circle cx="${cx - 4}" cy="${cy - 8}" r="5" fill="${SUN}" ${line}/><circle cx="${cx + 5}" cy="${cy - 11}" r="5" fill="${SUN}" ${line}/>
    <rect x="${cx - 10}" y="${cy - 26}" width="20" height="9" rx="2" fill="#fff" ${line}/>${text(cx, cy - 19, 'TIPS', 7)}
    ${cyl(cx, cy - 34, 13, 4, CORAL)}`, u: 0.15, v: 0.15, w: 0.1, d: 0.1 }]);
};

// Standing glass pastry case at the end of the counter.
const pastryCase = () => {
  const base = shades(LILAC);
  const goodies = (z) => {
    const p = (u, v) => at(u, v, z);
    const [a, b] = p(0.3, 0.45), [c, d] = p(0.62, 0.45), [e, f] = p(0.92, 0.5);
    return `<path d="M${a - 13} ${b} Q${a - 14} ${b - 12} ${a} ${b - 13} Q${a + 14} ${b - 12} ${a + 13} ${b} Q${a} ${b - 6} ${a - 13} ${b} Z" fill="#F0C27A" ${line}/>
      <ellipse cx="${c}" cy="${d - 5}" rx="12" ry="7" fill="#F0C27A" ${line}/><ellipse cx="${c}" cy="${d - 7}" rx="10" ry="5" fill="${LILAC}"/><ellipse cx="${c}" cy="${d - 7}" rx="3.5" ry="2" fill="${CREAM}"/>
      <ellipse cx="${e}" cy="${f - 4}" rx="9" ry="5" fill="${TEAL}" ${line}/><rect x="${e - 9}" y="${f - 9}" width="18" height="3" fill="${CREAM}"/><ellipse cx="${e}" cy="${f - 10}" rx="9" ry="5" fill="${TEAL}" ${line}/>`;
  };
  const shelf = [at(0.04, 0.04, 66), at(1.16, 0.04, 66), at(1.16, 0.96, 66), at(0.04, 0.96, 66)];
  return isoItem(1.2, 1, 104, [
    { u: 0, v: 0, w: 1.2, d: 1, h: 40, ...base,
      leftDecor: `<rect x="10" y="9" width="57" height="23" rx="5" fill="#fff" fill-opacity=".25" ${line}/>${text(38, 26, 'FRESH', 12, '#fff')}`,
      rightDecor: `<rect x="8" y="9" width="48" height="23" rx="5" fill="#fff" fill-opacity=".25" ${line}/>` },
    { svg: goodies(40) + `<polygon points="${P(shelf)}" fill="#fff" fill-opacity=".7" ${line}/>` + (() => {
      const [g, h] = at(0.35, 0.5, 66), [i, j] = at(0.8, 0.45, 66);
      return `<path d="M${g - 12} ${h} L${g + 12} ${h} L${g + 9} ${h - 14} Q${g} ${h - 24} ${g - 9} ${h - 14} Z" fill="${SKY}" ${line}/><path d="M${g - 9} ${h - 14} Q${g - 8} ${h - 26} ${g} ${h - 26} Q${g + 8} ${h - 26} ${g + 9} ${h - 14} Z" fill="${CREAM}" ${line}/><circle cx="${g}" cy="${h - 28}" r="3.5" fill="${CORAL}"/>
        <path d="M${i - 16} ${j - 4} L${i + 10} ${j - 14} L${i + 16} ${j - 2} L${i - 10} ${j + 6} Z" fill="#FBEFB4" ${line}/><path d="M${i - 16} ${j - 4} L${i - 10} ${j + 6} L${i - 10} ${j - 2} L${i - 16} ${j - 12} Z" fill="${LILAC}" ${line}/><path d="M${i - 16} ${j - 12} L${i + 10} ${j - 22} L${i + 10} ${j - 14} L${i - 16} ${j - 4} Z" fill="${CREAM}" ${line}/>`;
    })(), u: 0, v: 0, w: 1.2, d: 1, z: 30 },
    { u: 0, v: 0, w: 1.2, d: 1, z: 40, h: 58, top: '#EAF6FF44', left: '#DDEFFF66', right: '#CFE3F677',
      leftDecor: '<path d="M10 52 L34 6 M22 52 L46 6" stroke="#fff" stroke-width="4" opacity=".8"/>',
      rightDecor: '<path d="M8 48 L26 10" stroke="#fff" stroke-width="4" opacity=".7"/>' },
  ]);
};

// ---------- seating ----------
const bench = () => {
  const wood = shades(WOOD), cushion = shades(TEAL), back = shades('#A6DCD3');
  return isoItem(0.8, 2.4, 110, [
    { u: 0, v: 0, w: 0.8, d: 2.4, h: 40, ...wood,
      rightDecor: [0, 1, 2].map((i) => `<rect x="${8 + i * 50}" y="8" width="42" height="24" rx="4" fill="none" ${line}/>`).join('') },
    { u: 0, v: 0, w: 0.2, d: 2.4, z: 40, h: 64, ...back, rightDecor: `<path d="M0 10 H154" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>` },
    { u: 0.2, v: 0.04, w: 0.58, d: 2.32, z: 40, h: 12, ...cushion, topDecor: '<path d="M0 .78 H.58 M0 1.55 H.58" stroke="#5FAFA4" stroke-width=".03"/>' },
    { svg: (() => { const [a, b] = at(0.42, 0.55, 52), [c, d] = at(0.42, 1.85, 52); return `<path d="M${a - 18} ${b} q-2 -26 18 -28 q20 2 16 28 z" fill="${SUN}" ${line}/><path d="M${c - 18} ${d} q-2 -26 18 -28 q20 2 16 28 z" fill="${LILAC}" ${line}/>${starPath(c - 1, d - 13, 6, '#fff')}`; })(), u: 0.42, v: 1.2, w: 0.2, d: 0.2, z: 52 },
  ]);
};

const table = () => {
  const [cx, cy] = at(0.55, 0.55);
  return isoItem(1.1, 1.1, 78, [{ svg: `${shadow(cx, cy + 2, 40)}
    ${cyl(cx, cy, 26, 5, '#8B6450', '#A07A5E')}${cyl(cx, cy - 5, 5, 67, '#A07A5E')}
    ${cyl(cx, cy - 72, 50, 6, WOOD_L, CREAM)}
    <ellipse cx="${cx}" cy="${cy - 78}" rx="30" ry="15" fill="none" stroke="${TEAL}" stroke-width="3" stroke-dasharray="5 4"/>`, u: 0.55, v: 0.55, w: 0.1, d: 0.1 }]);
};

// Padded café chair with a solid base (so it can hide something underneath). back: which side the backrest is on.
const chair = (color, back) => () => {
  const seat = shades(color), pad = shades(color, 0.5), leg = shades('#8B6450');
  const backPart = { v0: { u: 0, v: 0, w: 0.75, d: 0.16 }, u0: { u: 0, v: 0, w: 0.16, d: 0.75 }, uw: { u: 0.59, v: 0, w: 0.16, d: 0.75 } }[back];
  return isoItem(0.75, 0.75, 96, [
    ...[[0.06, 0.06], [0.6, 0.06], [0.06, 0.6], [0.6, 0.6]].map(([u, v]) => ({ u, v, w: 0.09, d: 0.09, h: 10, ...leg })),
    { u: 0.03, v: 0.03, w: 0.69, d: 0.69, z: 10, h: 32, ...seat, leftDecor: `<path d="M0 6 H44" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>` },
    { u: 0.08, v: 0.08, w: 0.6, d: 0.6, z: 42, h: 6, ...pad },
    { ...backPart, z: 10, h: 82, ...seat, topDecor: '' },
  ]);
};

const rug = () => isoItem(3.2, 3, 4, [{ u: 0, v: 0, w: 3.2, d: 3, h: 0, round: true, top: '#CDEFE9',
  topDecor: '<ellipse cx="1.6" cy="1.5" rx="1.3" ry="1.2" fill="none" stroke="#fff" stroke-width=".07" stroke-dasharray=".2 .14"/><ellipse cx="1.6" cy="1.5" rx=".8" ry=".72" fill="#FBEFB4" opacity=".8"/>' }]);

const plant = () => isoItem(0.85, 0.85, 190, [
  { svg: (() => { const [cx, cy] = at(0.425, 0.425); return shadow(cx, cy + 2, 34) + cyl(cx, cy, 28, 52, CREAM, '#8B6450') + `<path d="M${cx - 28} ${cy - 24} A28 14 0 0 0 ${cx + 28} ${cy - 24}" fill="none" stroke="${TEAL}" stroke-width="8"/>`; })(), u: 0.425, v: 0.425, w: 0.1, d: 0.1 },
  { svg: (() => {
    const [cx, cy] = at(0.425, 0.425, 52);
    const leaf = (dx, dy, s, col) => `<path d="M${cx} ${cy} Q${cx + dx * 0.3} ${cy + dy * 0.5} ${cx + dx} ${cy + dy}" stroke="#4E9B5A" stroke-width="3" fill="none"/>
      <path d="M${cx + dx} ${cy + dy} m${-22 * s} 0 q${-4 * s} ${-26 * s} ${22 * s} ${-30 * s} q${26 * s} ${4 * s} ${22 * s} ${30 * s} q${-6 * s} ${18 * s} ${-22 * s} ${16 * s} q${-16 * s} ${2 * s} ${-22 * s} ${-16 * s} z" fill="${col}" ${line}/>
      <path d="M${cx + dx} ${cy + dy + 14 * s} V${cy + dy - 26 * s} M${cx + dx - 14 * s} ${cy + dy - 8 * s} l${8 * s} 4 M${cx + dx + 14 * s} ${cy + dy - 12 * s} l${-8 * s} 4" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>`;
    return leaf(-40, -60, 1, '#5AAE6A') + leaf(42, -54, 0.95, '#4E9B5A') + leaf(-12, -112, 1.1, LEAF) + leaf(24, -96, 0.9, '#5AAE6A') + leaf(-50, -18, 0.8, LEAF);
  })(), u: 0.425, v: 0.425, w: 0.85, d: 0.85, z: 52 },
]);

const cabinet = () => {
  const c = shades('#EADBC5'), leg = shades(WOOD_D);
  return isoItem(1.6, 0.7, 76, [
    ...[[0.05, 0.05], [1.45, 0.05], [0.05, 0.55], [1.45, 0.55]].map(([u, v]) => ({ u, v, w: 0.1, d: 0.1, h: 12, ...leg })),
    onTop([{ u: 0, v: 0, w: 1.6, d: 0.7, z: 12, h: 58, ...c,
      leftDecor: `<rect x="6" y="6" width="45" height="46" rx="4" fill="none" ${line}/><rect x="56" y="6" width="45" height="46" rx="4" fill="none" ${line}/>
        <path d="M60 12 v34 M70 12 v34 M80 12 v34 M90 12 v34" stroke="${CORAL}" stroke-width="5"/><circle cx="44" cy="29" r="2.5" fill="${WOOD_D}"/>` },
    { u: -0.03, v: -0.03, w: 1.7, d: 0.8, z: 70, h: 6, ...shades(WOOD) }]),
  ]);
};

const recordPlayer = () => {
  const box = shades('#C99772');
  return isoItem(0.8, 0.55, 60, [
    { u: 0, v: 0, w: 0.8, d: 0.55, h: 16, ...box, leftDecor: `<circle cx="40" cy="8" r="3" fill="${SUN}"/><circle cx="48" cy="8" r="3" fill="${TEAL}"/>`,
      topDecor: '<ellipse cx=".34" cy=".28" rx=".23" ry=".23" fill="#2E2A3A"/><ellipse cx=".34" cy=".28" rx=".14" ry=".14" fill="none" stroke="#555" stroke-width=".015"/><ellipse cx=".34" cy=".28" rx=".06" ry=".06" fill="#F5DE7A"/><path d="M.7 .08 L.66 .3 L.48 .36" stroke="#E2E2EC" stroke-width=".035" fill="none" stroke-linecap="round"/>' },
    { svg: (() => { const [cx, cy] = at(0.4, 0.27, 16); return `<g class="notes">${['♪', '♫', '♪'].map((n, i) => `<text x="${cx - 26 + i * 22}" y="${cy - 26 - (i % 2) * 14}" font-size="24" fill="#7A64B0">${n}</text>`).join('')}</g>`; })(), u: 0.4, v: 0.3, w: 0.4, d: 0.3, z: 20 },
  ]);
};

const easel = () => {
  const slate = shades('#3E4A5E'), wood = shades(WOOD);
  return isoItem(0.7, 0.4, 110, [
    { u: 0.05, v: 0.02, w: 0.06, d: 0.06, h: 100, ...wood }, { u: 0.59, v: 0.02, w: 0.06, d: 0.06, h: 100, ...wood },
    { u: 0, v: 0.2, w: 0.7, d: 0.06, z: 8, h: 96, ...slate,
      leftDecor: `<rect x="2" y="2" width="41" height="92" fill="none" stroke="${WOOD}" stroke-width="4"/>${text(22, 24, 'TODAY', 9, SUN)}${text(22, 44, 'Berry', 9, '#fff', 500)}${text(22, 56, 'smoothie', 8, '#fff', 500)}<path d="M10 68 h24" stroke="#fff" stroke-dasharray="3 3" stroke-width="1.5"/>${starPath(22, 80, 6, SUN)}` },
  ]);
};

const vase = (col) => () => {
  const [cx, cy] = at(0.14, 0.14);
  return isoItem(0.28, 0.28, 60, [{ svg: `${cyl(cx, cy, 9, 20, col, '#E8F6FF')}
    <path d="M${cx} ${cy - 20} L${cx - 8} ${cy - 44} M${cx} ${cy - 20} L${cx + 6} ${cy - 48} M${cx} ${cy - 20} L${cx + 1} ${cy - 38}" stroke="#4E9B5A" stroke-width="2"/>
    <circle cx="${cx - 8}" cy="${cy - 46}" r="6" fill="${SUN}" ${line}/><circle cx="${cx + 6}" cy="${cy - 50}" r="6" fill="${LILAC}" ${line}/><circle cx="${cx + 1}" cy="${cy - 40}" r="5" fill="#fff" ${line}/>`, u: 0.14, v: 0.14, w: 0.1, d: 0.1 }]);
};

const coatRack = () => {
  const [cx, cy] = at(0.25, 0.25);
  return isoItem(0.5, 0.5, 200, [{ svg: `${shadow(cx, cy, 24)}${cyl(cx, cy, 18, 5, WOOD_D)}<rect x="${cx - 3}" y="${cy - 192}" width="6" height="188" fill="${WOOD}" ${line}/>
    <path d="M${cx} ${cy - 178} l-17 -9 M${cx} ${cy - 178} l17 -9 M${cx} ${cy - 150} l-12 -6" stroke="${WOOD_D}" stroke-width="4" stroke-linecap="round"/>
    <path d="M${cx - 15} ${cy - 186} q-14 6 -14 22 l-4 66 h28 l2 -70 q0 -14 -12 -18 z" fill="${SKY}" ${line}/><path d="M${cx - 16} ${cy - 160} v56" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>
    <path d="M${cx + 13} ${cy - 186} q10 30 3 70 l9 3 q8 -36 -3 -74 z" fill="${SUN}" ${line}/><path d="M${cx + 16} ${cy - 120} l2 10 M${cx + 21} ${cy - 118} l1 10" stroke="${SUN}" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy - 194}" r="6" fill="${WOOD}" ${line}/>`, u: 0.25, v: 0.25, w: 0.1, d: 0.1 }]);
};

const cake = () => {
  const [cx, cy] = at(0.17, 0.17);
  return isoItem(0.34, 0.34, 36, [{ svg: `${cyl(cx, cy, 16, 3, '#fff', '#FFFFFF')}
    <path d="M${cx - 11} ${cy - 5} L${cx + 7} ${cy + 1} V${cy - 13} L${cx - 11} ${cy - 19} Z" fill="#FBEFB4" ${line}/><path d="M${cx - 11} ${cy - 12} L${cx + 7} ${cy - 6}" stroke="${LILAC}" stroke-width="3"/>
    <path d="M${cx + 7} ${cy + 1} L${cx + 13} ${cy - 5} V${cy - 19} L${cx + 7} ${cy - 13} Z" fill="#F1DE9C" ${line}/>
    <path d="M${cx - 11} ${cy - 19} L${cx + 7} ${cy - 13} L${cx + 13} ${cy - 19} L${cx - 3} ${cy - 25} Z" fill="${LILAC}" ${line}/><circle cx="${cx + 3}" cy="${cy - 22}" r="3.5" fill="${CORAL}" ${line}/>`, u: 0.17, v: 0.17, w: 0.1, d: 0.1 }]);
};

// ---------- wall decor ----------
const windowBody = (it, sp, api) => {
  const sunny = api?.state.weather !== 'rain';
  const w = sp.len, h = sp.h - sp.len * 0.5;
  return `<rect width="${w}" height="${h}" rx="6" fill="${sunny ? '#BFE3FA' : '#9EADC4'}" ${line}/>
    ${sunny ? `<circle cx="${w * 0.7}" cy="${h * 0.28}" r="16" fill="#FFF3B8"/><path d="M14 ${h * 0.66} q16 -18 36 -6 q12 -14 32 -2 q18 0 14 14 z" fill="#fff"/>` : Array.from({ length: 12 }, (_, i) => `<line x1="${(i * 23) % w + 6}" y1="${(i * 37) % (h - 30) + 10}" x2="${(i * 23) % w + 2}" y2="${(i * 37) % (h - 30) + 24}" stroke="#E8EEF7" stroke-width="2"/>`).join('')}
    <path d="M0 ${h * 0.8} Q${w * 0.3} ${h * 0.7} ${w * 0.6} ${h * 0.78} T${w} ${h * 0.74} V${h} H0 Z" fill="#A8DE9A" opacity=".8"/>
    <path d="M${w / 2} 0 V${h} M0 ${h / 2} H${w}" stroke="${CREAM}" stroke-width="6"/>
    <rect x="-6" y="${h - 4}" width="${w + 12}" height="12" rx="3" fill="${CREAM}" ${line}/>
    <path d="M-14 -10 Q${w * 0.14} ${h * 0.45} -4 ${h + 2} L-16 ${h + 2} Z" fill="${SUN}" ${line}/>
    <path d="M${w + 14} -10 Q${w * 0.86} ${h * 0.45} ${w + 4} ${h + 2} L${w + 16} ${h + 2} Z" fill="${SUN}" ${line}/>
    <rect x="-22" y="-16" width="${w + 44}" height="9" rx="4" fill="${WOOD}" ${line}/>`;
};

const menuBody = (it, sp) => {
  const w = sp.len;
  const rows = [['Coffee', '2★'], ['Smoothie', '3★'], ['Pastries', '2★'], ['Cake', '4★']];
  return `<rect width="${w}" height="122" rx="8" fill="#3E4A5E" stroke="${WOOD}" stroke-width="6"/>
    ${text(w / 2, 28, 'MENU', 20, '#fff')}<path d="M18 36 H${w - 18}" stroke="${SUN}" stroke-width="2"/>
    <g font-family="Fredoka, sans-serif" font-size="13" font-weight="500" fill="#fff">${rows.map(([n, p], i) => `<text x="16" y="${56 + i * 18}">${n}</text><text x="${w - 16}" y="${56 + i * 18}" text-anchor="end" fill="${SUN}">${p}</text>`).join('')}</g>`;
};

const shelfBody = (it, sp) => {
  const w = sp.len;
  const mug = (x, y, col) => `<path d="M${x + 14} ${y - 13} q7 0 7 5 q0 5 -7 5" fill="none" stroke="${INKY}" stroke-opacity=".6" stroke-width="2"/><rect x="${x}" y="${y - 18}" width="15" height="18" rx="3" fill="${col}" ${line}/>`;
  const jar = (x, y, col, lid) => `<rect x="${x}" y="${y - 26}" width="20" height="26" rx="4" fill="#E8F6FF" ${line}/><rect x="${x + 2}" y="${y - 16}" width="16" height="14" rx="2" fill="${col}"/><rect x="${x - 1}" y="${y - 31}" width="22" height="6" rx="2" fill="${lid}" ${line}/>`;
  return `<rect y="28" width="${w}" height="6" rx="2" fill="${WOOD}" ${line}/><rect y="66" width="${w}" height="6" rx="2" fill="${WOOD}" ${line}/>
    ${mug(10, 28, CREAM)}${mug(34, 28, LILAC)}${mug(58, 28, TEAL)}${mug(82, 28, SUN)}${mug(106, 28, SKY)}
    ${jar(138, 28, '#8B5A3C', CORAL)}${jar(166, 28, SUN, TEAL)}
    <path d="M10 66 v-8 h46 v8 M14 58 v-7 h38 v7" fill="${CREAM}" ${line}/>
    <rect x="70" y="40" width="30" height="26" rx="3" fill="#C99772" ${line}/>${text(85, 57, 'BEANS', 7, '#fff')}
    <path d="M118 66 v-14 h24 v14" fill="${CORAL}" ${line}/><path d="M124 52 q6 -16 12 0" fill="${LEAF}" ${line}/>
    <rect x="156" y="44" width="12" height="22" rx="3" fill="${TEAL}" ${line}/><rect x="172" y="48" width="12" height="18" rx="3" fill="${LILAC}" ${line}/>`;
};

const I = isoDef;
const W = (...a) => wallDef(R, ...a);

const CUP_SPOT = (m) => ({ gx: m.gx + SPOT.u, gy: m.gy + SPOT.v, gz: (m.gz || 0) + SPOT.z });
const atMachine = (c, m) => { const s = CUP_SPOT(m); return Math.abs(c.gx - s.gx) < 0.05 && Math.abs(c.gy - s.gy) < 0.05 && Math.abs((c.gz || 0) - s.gz) < 1; };
const cupDef = (id, gx, gy, color) => I(id, gx, gy, 0.3, 0.3, cupArt, {
  small: true, gz: 96, cup: true, zBias: 3, data: { full: false, color },
  onDrop: (it, api) => {
    const m = api.get('machine');
    const cx = it.gx + it.fw / 2, cy = it.gy + it.fd / 2;
    if (it.on?.id === 'counter' && cx > m.gx - 0.15 && cx < m.gx + m.fw + 0.15 && cy > m.gy - 0.1 && cy < m.gy + m.fd + 0.45) {
      Object.assign(it, CUP_SPOT(m));
      api.place(it);
      const pos = api.state.pos[CAFE.posKey];
      if (pos) { pos[it.id] = [+it.gx.toFixed(2), +it.gy.toFixed(2), it.gz]; api.save(); }
      if (!it.data.full) api.bubble(m.x + m.w / 2, m.y - 20, 'Now tap the yellow button!');
    }
  },
  onGive: (it, api, who) => {
    if (!it.data.full) { api.bubble(who.x + who.w / 2, who.y - 6, "It's empty! Fill it at the machine."); return; }
    it.data.full = false; api.setArt(it); api.sfx.yum();
    api.react(who, 'Yummy coffee! ☕', ['💜', '✨', '☕']);
  },
});

export const CAFE = {
  id: 'cafe', posKey: 'cafe-iso', title: 'Sunny Café ☕', weather: true, light: 'iso', avatar: [3.4, 5.6],
  frame: '#EFE6F2',
  iso: R,
  bg,
  onWeather: (api) => { api.setArt(api.get('window')); api.setArt(api.get('window2')); },
  stars: [{ id: 'cafe-plant', gx: 8.3, gy: 2.4 }, { id: 'cafe-chair', gx: 5.85, gy: 3.85 }],
  characters: [
    { id: 'barista', look: NPC.barista, gx: 3.4, gy: 0.5, drag: false, say: ['Welcome to Sunny Café!', 'Try the smoothie! 🫐', 'Pastries are fresh! 🥐'] },
    { id: 'mia', look: NPC.mia, gx: 4.6, gy: 5.0, say: ["Hi! I'm Mia 💛", 'I love this café!', "I'm hungry... 🥐"] },
  ],
  items: [
    // walls
    W('lights', 'L', 0.2, 276, 7.6, 50, (it, sp) => stringLights(4, sp.len - 4, 6, 14, it.data.on), {
      data: { on: true }, onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); } }),
    W('sign', 'R', 0.5, 268, 3.2, 48, (it, sp) => `<rect width="${sp.len}" height="48" rx="14" fill="${TURQ}" ${line}/><rect x="6" y="6" width="${sp.len - 12}" height="36" rx="10" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>${text(sp.len / 2, 33, 'Sunny Café', 24, '#fff')}${starPath(22, 24, 7, SUN)}${starPath(sp.len - 22, 24, 7, SUN)}`),
    W('shelf', 'R', 0.5, 210, 3.0, 74, shelfBody),
    W('menu', 'R', 3.9, 262, 2.2, 122, menuBody),
    W('window2', 'R', 6.6, 250, 2.0, 140, windowBody),
    W('window', 'L', 2.4, 252, 2.2, 140, windowBody),
    W('clock', 'L', 0.8, 236, 0.6, 38, (it, sp) => `<ellipse cx="${sp.len / 2}" cy="19" rx="${sp.len / 2}" ry="19" fill="#fff" ${line}/><path d="M${sp.len / 2} 19 V7 M${sp.len / 2} 19 H${sp.len / 2 + 10}" stroke="${INKY}" stroke-width="2.5"/>`),
    W('frame1', 'L', 5.3, 236, 0.9, 74, (it, sp) => `<rect width="${sp.len}" height="74" rx="4" fill="${CREAM}" stroke="${WOOD}" stroke-width="5"/><path d="M14 30 H44 V52 Q44 60 36 60 H22 Q14 60 14 52 Z" fill="${CORAL}"/><path d="M44 36 q8 0 8 7 q0 7 -8 7" fill="none" stroke="${CORAL}" stroke-width="3"/><path d="M22 24 q-4 -6 0 -12 M33 24 q-4 -6 0 -12" stroke="${LILAC}" stroke-width="2.5" fill="none"/>`),
    W('frame2', 'L', 6.5, 214, 0.7, 54, (it, sp) => `<rect width="${sp.len}" height="54" rx="4" fill="${SUN}" ${line}/><circle cx="${sp.len / 2}" cy="24" r="12" fill="#fff"/>${text(sp.len / 2, 47, 'hello', 10, '#7A64B0')}`),

    I('rug', 4.4, 3.4, 3.2, 3, rug, { floor: true }),
    // counter + things on it
    I('counter', 0.3, 1.3, 5, 1, counter, { drag: false, surface: 96 }),
    I('machine', 0.5, 1.36, 1, 0.6, machine, { drag: false, gz: 96, cls: 'machine',
      onTap: (it, api) => {
        if (it.el.classList.contains('pouring')) return;
        const c = [...api.items.values()].find((i) => i.def.cup && !i.data.full && atMachine(i, it));
        if (!c) { api.bubble(it.x + it.w / 2, it.y - 20, 'Put a cup under the machine! ☕'); return; }
        it.el.classList.add('pouring'); api.sfx.pour();
        api.later(() => { it.el.classList.remove('pouring'); c.data.full = true; api.setArt(c); api.bubble(it.x + it.w / 2, it.y - 20, 'Coffee is ready!'); }, 1300);
      } }),
    I('blender', 1.7, 1.42, 0.45, 0.45, blender, { drag: false, gz: 96,
      onTap: (it, api) => {
        if (it.el.classList.contains('blending')) return;
        if (api.count('smoothie') >= 2) { api.bubble(it.x + it.w / 2, it.y - 20, 'Drink those first! 🫐'); return; }
        it.el.classList.add('blending'); api.sfx.pour();
        api.later(() => { it.el.classList.remove('blending'); food(api, 'smoothie', 0, 0, { gx: 1.55 + api.count('smoothie') * 0.36, gy: 1.96, gz: 96 }); }, 1200);
      } }),
    I('tipjar', 2.35, 1.75, 0.3, 0.3, tipJar, { drag: false, gz: 96,
      onTap: (it, api) => { api.sparkle(it.x + it.w / 2, it.y, ['⭐', '✨']); api.bubble(it.x + it.w / 2, it.y - 10, 'Thank you! ✨'); api.sfx.star(); } }),
    cupDef('cup1', 2.85, 1.85, CREAM),
    cupDef('cup2', 3.3, 1.85, '#FBEFB4'),
    I('case', 5.45, 1.25, 1.2, 1, pastryCase, { drag: false, data: { n: 0 },
      onTap: (it, api) => {
        if (api.count('croissant') + api.count('donut') + api.count('macaron') >= 3) { api.bubble(it.x + it.w / 2, it.y - 20, 'Enjoy the pastries first! 🥐'); return; }
        const kind = ['croissant', 'donut', 'macaron'][it.data.n++ % 3];
        food(api, kind, 0, 0, { gx: 3.85 + (it.data.n % 3) * 0.42, gy: 1.95, gz: 96 });
      } }),
    // music corner under the right window
    I('cabinet', 6.9, 0.08, 1.6, 0.7, cabinet, { drag: false, surface: 76 }),
    I('music', 7.0, 0.14, 0.8, 0.55, recordPlayer, { drag: false, gz: 76, data: { on: false },
      onTap: (it, api) => { it.data.on = !it.data.on; it.el.classList.toggle('playing', it.data.on); api.sfx.click(); api.bubble(it.x + it.w / 2, it.y - 10, it.data.on ? '♪ Music on ♫' : 'Music off'); } }),
    // seating
    I('bench', 0.05, 2.3, 0.8, 2.4, bench, { drag: false, surface: 52 }),
    I('table1', 1.15, 2.95, 1.1, 1.1, table, { surface: 78 }),
    I('chair1', 2.5, 3.15, 0.75, 0.75, chair(SUN, 'uw')),
    I('table2', 5.5, 4.6, 1.1, 1.1, table, { surface: 78 }),
    I('chair2', 5.65, 3.65, 0.75, 0.75, chair(TEAL, 'v0')),
    I('chair3', 6.85, 4.8, 0.75, 0.75, chair(LILAC, 'uw')),
    I('vase1', 1.55, 3.3, 0.28, 0.28, vase(SKY), { small: true, gz: 78 }),
    I('vase2', 5.95, 4.95, 0.28, 0.28, vase(CORAL), { small: true, gz: 78 }),
    I('cplant', 8.1, 2.2, 0.85, 0.85, plant),
    I('table3', 1.5, 6.1, 1.1, 1.1, table, { surface: 78 }),
    I('chair4', 0.5, 6.25, 0.75, 0.75, chair(SKY, 'u0')),
    I('cake', 1.85, 6.4, 0.34, 0.34, cake, { small: true, gz: 78 }),
    I('coatrack', 0.15, 4.95, 0.5, 0.5, coatRack),
    I('easel', 7.7, 6.4, 0.7, 0.4, easel),
  ],
};
