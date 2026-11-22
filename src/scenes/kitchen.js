// The kitchen — its own isometric dollhouse room next to Olivia's room.
// Fridge with snacks, soup on the stove, running water, a dining table and lots of cozy detail.
import { room, roomShell, isoItem, at, shades, proj, isoDef, wallDef } from '../iso.js';
import { svg, text, starPath, food } from './common.js';

const R = room({ cols: 8, rows: 7, ox: 768, oy: 372, wallH: 300 });
R.charScale = 0.6;

const WOOD = '#C99A6C', WOOD_L = '#E2C29C', WOOD_D = '#8B6450', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', TURQ = '#3CC7B8', SKY = '#9CC8EE', SUN = '#F5DE7A', CORAL = '#E58F6A', LEAF = '#6DBE7A';
const CAB = '#8CD2C8', TOP = '#EFE6D6';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4"';
const P = (gx, gy, z = 0) => proj(R, gx, gy, z);
const poly = (arr) => arr.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ');
const kick = (fw) => `<rect x="0" y="76" width="${fw * 64}" height="8" fill="#3E3252" opacity=".22"/>`;
const knob = (x, y, c = '#B58456') => `<circle cx="${x}" cy="${y}" r="2.6" fill="${c}" ${line}/>`;

// ---------- background ----------
const bg = (w) => {
  const [lx] = P(0, R.rows), [rx] = P(R.cols, 0), [, fy] = P(R.cols, R.rows);
  return svg(1600, 900, `
  <defs>
    <radialGradient id="kitchen-bd" cx="50%" cy="55%" r="70%"><stop offset="0" stop-color="#F7F3EA"/><stop offset="1" stop-color="#DCE6EC"/></radialGradient>
    <pattern id="kitchen-wl" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="matrix(1,-0.5,0,1,0,0)">
      <rect width="44" height="44" fill="#F6F0DC"/><path d="M22 0 V44" stroke="#EFE5C8" stroke-width="10"/><circle cx="22" cy="22" r="3.2" fill="#9EDDD4"/><circle cx="0" cy="0" r="2.4" fill="#F3D98A"/><circle cx="44" cy="44" r="2.4" fill="#F3D98A"/></pattern>
    <pattern id="kitchen-wr" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,0,1,0,0)">
      <rect width="44" height="44" fill="#EEE6CD"/><path d="M22 0 V44" stroke="#E7DCBE" stroke-width="10"/><circle cx="22" cy="22" r="3.2" fill="#93D2C9"/><circle cx="0" cy="0" r="2.4" fill="#EBD27F"/><circle cx="44" cy="44" r="2.4" fill="#EBD27F"/></pattern>
    <pattern id="kitchen-floor" width="1" height="1" patternUnits="userSpaceOnUse" patternTransform="matrix(64,32,-64,32,${R.ox},${R.oy})">
      <rect width="1" height="1" fill="#F3EDE0"/><rect width=".5" height=".5" fill="#CFE2F1"/><rect x=".5" y=".5" width=".5" height=".5" fill="#CFE2F1"/></pattern>
    <pattern id="kitchen-tile" width="18" height="13" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,0,1,0,0)">
      <rect width="18" height="13" fill="#E6F5F2"/><path d="M0 0.5 H18 M0.5 0 V13" stroke="#BFDDD8" stroke-width="1.4"/></pattern>
    <linearGradient id="kitchen-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".6"/><stop offset="1" stop-color="#FFF6DA" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#kitchen-bd)"/>
  <ellipse cx="${(lx + rx) / 2}" cy="${fy + 6}" rx="560" ry="46" fill="#3E3252" opacity=".10"/>
  ${roomShell(R, { floor: '#F3EDE0', wallL: '#F6F0DC', wallR: '#EEE6CD', wallPatternL: 'kitchen-wl', wallPatternR: 'kitchen-wr', floorPattern: 'kitchen-floor' })}
  <polygon points="${poly([P(1.4, 0, 84), P(6.25, 0, 84), P(6.25, 0, 168), P(1.4, 0, 168)])}" fill="url(#kitchen-tile)" ${line}/>
  <polygon points="${poly([P(3.9, 1.05), P(5.5, 1.05), P(6.7, 3.7), P(5.1, 3.7)])}" fill="url(#kitchen-light)" opacity="${w.weather === 'sun' ? 1 : 0.35}"/>`);
};

// ---------- big furniture ----------
const fridge = (it) => {
  const c = shades('#D7EAF6');
  const open = it?.data.open;
  const fw = 1.25 * 64;
  return isoItem(1.25, 1, 270, [
    { u: 0, v: 0, w: 1.25, d: 1, h: 6, ...shades('#9AA9BC') },
    { u: 0, v: 0, w: 1.25, d: 1, z: 6, h: 258, ...c,
      leftDecor: open
        ? `<rect x="4" y="4" width="${fw - 8}" height="250" rx="6" fill="#F4FBFF" ${line}/>
           ${[64, 122, 180].map((y) => `<rect x="6" y="${y}" width="${fw - 12}" height="4" fill="#CFE2F1"/>`).join('')}
           <rect x="10" y="30" width="16" height="32" rx="2" fill="#fff" ${line}/><rect x="10" y="38" width="16" height="10" fill="${SKY}"/>
           <circle cx="42" cy="54" r="9" fill="${CORAL}" ${line}/><circle cx="58" cy="56" r="7" fill="${LEAF}" ${line}/>
           <path d="M12 118 h22 l-3 -16 h-16 z" fill="${LILAC}" ${line}/><path d="M12 102 q11 -14 22 0" fill="#C9B8F2" ${line}/>
           <rect x="44" y="98" width="22" height="20" rx="4" fill="${SUN}" ${line}/>
           <ellipse cx="24" cy="172" rx="14" ry="6" fill="#FBEFB4" ${line}/><rect x="44" y="150" width="18" height="26" rx="3" fill="#E6F5F2" ${line}/>
           <rect x="8" y="196" width="${fw - 16}" height="50" rx="5" fill="#E6F5F2" ${line}/><circle cx="26" cy="214" r="6" fill="${LEAF}"/><circle cx="40" cy="218" r="6" fill="${CORAL}"/><path d="M50 222 l12 -14" stroke="#F0A060" stroke-width="5" stroke-linecap="round"/>`
        : `<path d="M3 92 H${fw - 3}" ${line}/>
           <rect x="${fw - 16}" y="40" width="6" height="40" rx="3" fill="#F7FAFD" ${line}/><rect x="${fw - 16}" y="104" width="6" height="64" rx="3" fill="#F7FAFD" ${line}/>
           <rect x="12" y="116" width="34" height="42" fill="#fff" ${line} transform="rotate(-4 29 137)"/>
           <circle cx="29" cy="132" r="7" fill="${SUN}"/><path d="M16 152 q13 -12 26 0" fill="${LEAF}"/>
           <circle cx="29" cy="114" r="4" fill="${CORAL}" ${line}/>
           <circle cx="20" cy="40" r="5" fill="${LILAC}" ${line}/><circle cx="38" cy="52" r="5" fill="${TURQ}" ${line}/>${starPath(22, 190, 8, SUN, line)}
           <rect x="34" y="176" width="22" height="16" rx="2" fill="#FBEFB4" ${line}/>` },
    { u: -0.02, v: -0.02, w: 1.29, d: 1.04, z: 264, h: 6, ...shades('#BCD4E8') },
  ]);
};

const baseCab = (fw, fd, decor, color = CAB) => [
  { u: 0, v: 0, w: fw, d: fd - 0.06, h: 84, ...shades(color), leftDecor: decor + kick(fw) },
  { u: -0.03, v: 0, w: fw + 0.06, d: fd, z: 84, h: 8, ...shades(TOP), leftDecor: `<path d="M0 7 H${(fw + 0.06) * 64}" stroke="#C9B89C" stroke-width="2"/>` },
];

const counter = () => {
  const w = 1.2 * 64;
  return isoItem(1.2, 0.95, 250, [
    ...baseCab(1.2, 0.95, `<rect x="5" y="6" width="${w - 10}" height="18" rx="3" fill="none" ${line}/>${knob(w / 2, 15)}
      <rect x="5" y="28" width="${w / 2 - 7}" height="40" rx="3" fill="none" ${line}/><rect x="${w / 2 + 2}" y="28" width="${w / 2 - 7}" height="40" rx="3" fill="none" ${line}/>${knob(w / 2 - 6, 40)}${knob(w / 2 + 6, 40)}`),
    { u: 0, v: 0, w: 1.2, d: 0.5, z: 172, h: 74, ...shades('#F3ECDF'),
      leftDecor: `<rect x="5" y="6" width="${w / 2 - 7}" height="62" rx="3" fill="none" ${line}/><rect x="${w / 2 + 2}" y="6" width="${w / 2 - 7}" height="62" rx="3" fill="none" ${line}/>${knob(w / 2 - 6, 56)}${knob(w / 2 + 6, 56)}` },
    { u: -0.02, v: -0.02, w: 1.24, d: 0.54, z: 246, h: 4, ...shades('#E2D6C6') },
  ]);
};

const stove = () => {
  const w = 1.15 * 64;
  const burner = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2E2A3A" stroke="#7A7090" stroke-width=".03"/><circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="none" stroke="#7A7090" stroke-width=".025"/>`;
  return isoItem(1.15, 0.95, 296, [
    { u: 0, v: 0, w: 1.15, d: 0.89, h: 84, ...shades('#F6F1E7'),
      leftDecor: `${kick(1.15)}${[12, 26, 40, 54].map((x) => `<circle cx="${x + 4}" cy="9" r="3.4" fill="#5E5470"/>`).join('')}
        <rect x="6" y="16" width="${w - 12}" height="54" rx="4" fill="#EDE5D6" ${line}/><rect x="13" y="28" width="${w - 26}" height="26" rx="3" fill="#3E3A4A" opacity=".85"/>
        <path d="M17 32 L27 32" stroke="#fff" stroke-opacity=".4" stroke-width="3"/><rect x="16" y="19" width="${w - 32}" height="4" rx="2" fill="#A9AEC2"/>` },
    { u: -0.02, v: 0, w: 1.19, d: 0.95, z: 84, h: 8, ...shades('#5E5470'),
      topDecor: `${burner(0.32, 0.3, 0.17)}${burner(0.86, 0.3, 0.15)}${burner(0.32, 0.7, 0.14)}${burner(0.86, 0.7, 0.18)}` },
    { u: 0, v: 0, w: 1.15, d: 0.1, z: 92, h: 18, ...shades('#F6F1E7') },
    { u: 0.06, v: 0, w: 1.03, d: 0.62, z: 196, h: 28, ...shades('#D7EAF6'), leftDecor: `<path d="M4 22 H${1.03 * 64 - 4}" stroke="#fff" stroke-width="3" opacity=".6"/>` },
    { u: 0.34, v: 0, w: 0.46, d: 0.32, z: 224, h: 72, ...shades('#C9DEEF') },
  ]);
};

const sink = () => {
  const w = 1.4 * 64;
  return isoItem(1.4, 0.95, 96, [
    { u: 0, v: 0, w: 1.4, d: 0.89, h: 84, ...shades(CAB),
      leftDecor: `${kick(1.4)}<rect x="5" y="6" width="${w / 2 - 7}" height="62" rx="3" fill="none" ${line}/><rect x="${w / 2 + 2}" y="6" width="${w / 2 - 7}" height="62" rx="3" fill="none" ${line}/>${knob(w / 2 - 6, 18)}${knob(w / 2 + 6, 18)}
        <path d="M14 46 q8 -10 16 0 q8 10 16 0" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none"/>` },
    { u: -0.03, v: 0, w: 1.46, d: 0.95, z: 84, h: 8, ...shades(TOP),
      leftDecor: `<path d="M0 7 H${1.46 * 64}" stroke="#C9B89C" stroke-width="2"/>`,
      topDecor: `<rect x=".3" y=".26" width=".86" height=".56" rx=".08" fill="#DCE8F1" stroke="#3E3252" stroke-opacity=".5" stroke-width=".025"/>
        <rect x=".36" y=".3" width=".74" height=".46" rx=".06" fill="#B9CEDF"/><circle cx=".73" cy=".56" r=".05" fill="#8E94A8"/>
        <path d="M.42 .36 L.6 .36" stroke="#fff" stroke-width=".04" opacity=".7" stroke-linecap="round"/>
        <rect x="1.22" y=".3" width=".16" height=".5" rx=".04" fill="#E9E1D2" stroke="#3E3252" stroke-opacity=".4" stroke-width=".02"/>` },
  ]);
};

const counter2 = () => {
  const w = 64;
  return isoItem(1, 0.95, 96, baseCab(1, 0.95, `${[6, 28, 50].map((y) => `<rect x="5" y="${y}" width="${w - 10}" height="18" rx="3" fill="none" ${line}/>${knob(w / 2, y + 9)}`).join('')}`, '#9CC8EE'));
};

const hutch = () => {
  const d = 1.8 * 64;
  const plates = [10, 34, 58, 82].map((x, i) => `<ellipse cx="${x + 8}" cy="40" rx="10" ry="16" fill="${['#FBF7EF', '#9EDDD4', '#FBF7EF', '#C9B8F2'][i]}" ${line}/><ellipse cx="${x + 8}" cy="40" rx="5" ry="9" fill="none" stroke="#3E3252" stroke-opacity=".2"/>`).join('');
  const cups = [12, 36, 60, 84].map((x, i) => `<path d="M${x} 104 h14 v-12 h-14 z" fill="${[SUN, TEAL, LILAC, SKY][i]}" ${line}/><path d="M${x + 14} 95 q6 0 6 4 q0 4 -6 4" fill="none" ${line}/>`).join('');
  return isoItem(0.8, 1.8, 236, [
    { u: 0, v: 0, w: 0.8, d: 1.8, h: 92, ...shades(LILAC),
      rightDecor: `<rect x="6" y="8" width="${d / 2 - 9}" height="76" rx="4" fill="none" ${line}/><rect x="${d / 2 + 3}" y="8" width="${d / 2 - 9}" height="76" rx="4" fill="none" ${line}/>
        ${knob(d / 2 - 8, 46, '#F5DE7A')}${knob(d / 2 + 8, 46, '#F5DE7A')}${starPath(d / 4, 46, 8, '#D9CCF6')}${starPath((d * 3) / 4, 46, 8, '#D9CCF6')}` },
    { u: -0.03, v: -0.03, w: 0.86, d: 1.86, z: 92, h: 8, ...shades(WOOD_L) },
    { u: 0, v: 0, w: 0.36, d: 1.8, z: 100, h: 130, ...shades('#C9B4F4'),
      rightDecor: `<rect x="5" y="4" width="${d - 10}" height="122" fill="#EFE8FA"/>
        <rect x="5" y="62" width="${d - 10}" height="5" fill="${WOOD_L}" ${line}/><rect x="5" y="108" width="${d - 10}" height="5" fill="${WOOD_L}" ${line}/>
        ${plates}${cups}` },
    { u: -0.03, v: -0.03, w: 0.42, d: 1.86, z: 230, h: 6, ...shades('#A88DE2') },
  ]);
};

const table = () => {
  const leg = shades('#B58456');
  return isoItem(2, 1.4, 80, [
    { u: 0.1, v: 0.1, w: 0.12, d: 0.12, h: 70, ...leg }, { u: 1.78, v: 0.1, w: 0.12, d: 0.12, h: 70, ...leg },
    { u: 0.1, v: 1.18, w: 0.12, d: 0.12, h: 70, ...leg }, { u: 1.78, v: 1.18, w: 0.12, d: 0.12, h: 70, ...leg },
    { u: 0, v: 0, w: 2, d: 1.4, z: 70, h: 10, ...shades(WOOD_L),
      topDecor: '<rect x=".75" y="0" width=".5" height="1.4" fill="#C9B8F2" opacity=".85"/><path d="M.78 0 V1.4 M1.22 0 V1.4" stroke="#fff" stroke-width=".03" stroke-dasharray=".08 .06"/>',
      leftDecor: '<rect x="56" y="0" width="32" height="10" fill="#B79CF0"/>' },
  ]);
};

// back: which side the backrest is on ('u0' = left, 'v0' = back, 'u1' = right).
const chair = (back, seat) => () => {
  const legs = shades(WOOD_D), s = shades(seat), wood = shades(WOOD);
  const rest = { u0: { u: 0, v: 0, w: 0.12, d: 0.8 }, v0: { u: 0, v: 0, w: 0.8, d: 0.12 }, u1: { u: 0.68, v: 0, w: 0.12, d: 0.8 } }[back];
  return isoItem(0.8, 0.8, 104, [
    ...[[0.1, 0.1], [0.62, 0.1], [0.1, 0.62], [0.62, 0.62]].map(([u, v]) => ({ u, v, w: 0.08, d: 0.08, h: 44, ...legs })),
    { u: 0, v: 0, w: 0.8, d: 0.8, z: 44, h: 8, ...wood },
    { u: 0.08, v: 0.08, w: 0.64, d: 0.64, z: 52, h: 5, ...s },
    { ...rest, z: 52, h: 52, ...wood, [back === 'v0' ? 'leftDecor' : 'rightDecor']: '<rect x="10" y="12" width="30" height="8" rx="3" fill="#fff" opacity=".35"/>' },
  ]);
};

const rug = () => isoItem(4.2, 3, 2, [
  { u: 0, v: 0, w: 4.2, d: 3, h: 0, top: '#BFE3DE',
    topDecor: `<rect x=".12" y=".12" width="3.96" height="2.76" fill="none" stroke="#fff" stroke-width=".06" stroke-dasharray=".2 .12"/>
      ${[0.5, 1.0, 2.0, 2.5].map((y) => `<rect x=".3" y="${y}" width="3.6" height=".18" fill="${y < 1.5 ? '#C9B8F2' : '#F5DE7A'}" opacity=".8"/>`).join('')}` },
]);
const mat = () => isoItem(1.2, 0.55, 2, [{ u: 0, v: 0, w: 1.2, d: 0.55, h: 0, top: '#C9B8F2', topDecor: '<rect x=".08" y=".08" width="1.04" height=".39" fill="none" stroke="#fff" stroke-width=".04"/>' }]);

const plant = () => isoItem(0.8, 0.8, 170, [
  { u: 0.14, v: 0.14, w: 0.52, d: 0.52, h: 44, ...shades('#F3ECDF'), leftDecor: `<path d="M0 14 H34" stroke="${TURQ}" stroke-width="5"/>` },
  { svg: (() => { const [cx, cy] = at(0.4, 0.4, 44); return [[-40, -80, -12], [34, -96, 14], [-4, -122, 0], [-50, -40, -22], [48, -52, 20], [16, -70, 8]].map(([dx, dy, r]) => `<path d="M${cx} ${cy} Q${cx + dx * 0.3} ${cy + dy * 0.6} ${cx + dx} ${cy + dy} Q${cx + dx * 0.9 + r} ${cy + dy * 0.45} ${cx} ${cy} Z" fill="${LEAF}" ${line}/><path d="M${cx} ${cy} Q${cx + dx * 0.4} ${cy + dy * 0.6} ${cx + dx * 0.92} ${cy + dy * 0.96}" stroke="#4E9B5A" stroke-width="1.6" fill="none"/>`).join(''); })(), w: 0.8, d: 0.8, u: 0.4, v: 0.4 },
]);

const veggies = () => isoItem(0.8, 0.65, 70, [
  { u: 0, v: 0, w: 0.8, d: 0.65, h: 34, ...shades(WOOD_L), leftDecor: '<path d="M0 12 H52 M0 24 H52" stroke="#B58456" stroke-width="2"/>', rightDecor: '<path d="M0 12 H42 M0 24 H42" stroke="#B58456" stroke-width="2"/>' },
  { svg: (() => { const [cx, cy] = at(0.4, 0.32, 34); return `<circle cx="${cx - 16}" cy="${cy - 6}" r="10" fill="${CORAL}" ${line}/><circle cx="${cx + 4}" cy="${cy - 10}" r="11" fill="${LEAF}" ${line}/>
      <path d="M${cx + 12} ${cy - 2} l18 -22" stroke="#F0A060" stroke-width="8" stroke-linecap="round"/><path d="M${cx + 30} ${cy - 24} l5 -8 M${cx + 30} ${cy - 24} l9 -3" stroke="${LEAF}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="${cx - 4}" cy="${cy + 4}" r="9" fill="${SUN}" ${line}/>`; })(), w: 0.8, d: 0.65, u: 0.4, v: 0.32, z: 34 },
]);

// ---------- small things on counters and the table ----------
const pot = () => isoItem(0.55, 0.5, 76, [{
  svg: (() => { const [cx, cy] = at(0.27, 0.25); return `
    <g class="steam-big" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"><path d="M${cx - 12} ${cy - 48} q-8 -10 0 -20 q8 -10 0 -20"/><path d="M${cx + 10} ${cy - 50} q-8 -10 0 -20 q8 -10 0 -20"/></g>
    <path d="M${cx - 30} ${cy - 30} V${cy - 4} Q${cx} ${cy + 10} ${cx + 30} ${cy - 4} V${cy - 30} Z" fill="${TURQ}" ${line}/>
    <path d="M${cx - 30} ${cy - 18} Q${cx} ${cy - 4} ${cx + 30} ${cy - 18}" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none"/>
    <rect x="${cx - 40}" y="${cy - 30}" width="12" height="6" rx="3" fill="#2A9C90" ${line}/><rect x="${cx + 28}" y="${cy - 30}" width="12" height="6" rx="3" fill="#2A9C90" ${line}/>
    <ellipse cx="${cx}" cy="${cy - 31}" rx="30" ry="10" fill="#9EDDD4" ${line}/><ellipse cx="${cx}" cy="${cy - 35}" rx="7" ry="3.5" fill="#FBF7EF" ${line}/>`; })(),
  w: 0.55, d: 0.5,
}]);

const kettle = () => isoItem(0.36, 0.36, 66, [{
  svg: (() => { const [cx, cy] = at(0.18, 0.18); return `
    <g class="steam-big" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".85"><path d="M${cx + 30} ${cy - 40} q-6 -8 0 -16 q6 -8 0 -16"/></g>
    <path d="M${cx + 14} ${cy - 16} L${cx + 30} ${cy - 34}" stroke="#3E3252" stroke-opacity=".55" stroke-width="8" stroke-linecap="round"/><path d="M${cx + 14} ${cy - 16} L${cx + 30} ${cy - 34}" stroke="${LILAC}" stroke-width="5" stroke-linecap="round"/>
    <path d="M${cx - 20} ${cy - 4} Q${cx - 22} ${cy - 34} ${cx} ${cy - 36} Q${cx + 22} ${cy - 34} ${cx + 20} ${cy - 4} Q${cx} ${cy + 4} ${cx - 20} ${cy - 4} Z" fill="${LILAC}" ${line}/>
    <path d="M${cx - 12} ${cy - 36} Q${cx} ${cy - 54} ${cx + 12} ${cy - 36}" fill="none" stroke="#5E5470" stroke-width="4" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy - 38}" r="4" fill="${SUN}" ${line}/><path d="M${cx - 14} ${cy - 24} Q${cx - 14} ${cy - 12} ${cx - 8} ${cy - 8}" stroke="#fff" stroke-width="3" opacity=".55" fill="none"/>`; })(),
  w: 0.36, d: 0.36,
}]);

const toaster = (it) => {
  const up = it?.data.up;
  return isoItem(0.46, 0.3, 64, [
    { u: 0, v: 0, w: 0.46, d: 0.3, h: 30, ...shades(SKY),
      topDecor: '<rect x=".06" y=".07" width=".34" height=".05" rx=".02" fill="#3E3A4A"/><rect x=".06" y=".18" width=".34" height=".05" rx=".02" fill="#3E3A4A"/>',
      leftDecor: '<path d="M4 8 H25" stroke="#fff" stroke-width="2.5" opacity=".6"/>', rightDecor: '<rect x="6" y="6" width="5" height="10" rx="2" fill="#5E5470"/>' },
    { svg: (() => { const lift = up ? 18 : 2; const [ax, ay] = at(0.23, 0.095, 30); const [bx, by] = at(0.23, 0.205, 30); return [[ax, ay], [bx, by]].map(([x, y]) => `<path d="M${x - 11} ${y + 3} V${y - lift} q0 -6 6 -6 h10 q6 0 6 6 V${y + 3} Z" fill="#F0C27A" ${line}/><path d="M${x - 7} ${y - lift + 2} h14" stroke="#C9913A" stroke-width="2"/>`).join(''); })(), w: 0.1, d: 0.1, u: 0.23, v: 0.15, z: 30 },
  ]);
};

const faucet = () => isoItem(0.3, 0.24, 70, [{
  svg: (() => { const [cx, cy] = at(0.15, 0.08), [tx, ty] = at(0.15, 0.5, 40); return `
    <ellipse cx="${cx}" cy="${cy}" rx="9" ry="4.5" fill="#C4C9D6" ${line}/>
    <path d="M${cx} ${cy - 2} V${cy - 50} Q${cx} ${cy - 60} ${(cx + tx) / 2} ${cy - 58} Q${tx} ${cy - 56} ${tx} ${ty}" fill="none" stroke="#3E3252" stroke-opacity=".55" stroke-width="9" stroke-linecap="round"/>
    <path d="M${cx} ${cy - 2} V${cy - 50} Q${cx} ${cy - 60} ${(cx + tx) / 2} ${cy - 58} Q${tx} ${cy - 56} ${tx} ${ty}" fill="none" stroke="#E2E6EE" stroke-width="6" stroke-linecap="round"/>
    <rect x="${cx + 4}" y="${cy - 26}" width="14" height="5" rx="2.5" fill="#B9BFCE" ${line}/>
    <g class="water"><path d="M${tx} ${ty + 4} L${tx} ${ty + 40}" stroke="#8FC3F0" stroke-width="5" stroke-linecap="round"/><circle cx="${tx - 8}" cy="${ty + 40}" r="3" fill="#fff" stroke="#BFE6FF"/><circle cx="${tx + 8}" cy="${ty + 38}" r="2.5" fill="#fff" stroke="#BFE6FF"/></g>`; })(),
  w: 0.3, d: 0.24,
}]);

const fruitBowl = () => isoItem(0.46, 0.46, 46, [{
  svg: (() => { const [cx, cy] = at(0.23, 0.23); return `
    <circle cx="${cx - 12}" cy="${cy - 20}" r="10" fill="${CORAL}" ${line}/><circle cx="${cx + 10}" cy="${cy - 22}" r="10" fill="${LEAF}" ${line}/>
    <path d="M${cx - 6} ${cy - 30} Q${cx + 6} ${cy - 44} ${cx + 22} ${cy - 34} Q${cx + 8} ${cy - 30} ${cx - 2} ${cy - 22} Z" fill="${SUN}" ${line}/>
    <circle cx="${cx - 2}" cy="${cy - 26}" r="7" fill="#9A80D8" ${line}/>
    <path d="M${cx - 26} ${cy - 16} Q${cx - 24} ${cy + 4} ${cx} ${cy + 4} Q${cx + 24} ${cy + 4} ${cx + 26} ${cy - 16} Z" fill="#FBF7EF" ${line}/>
    <path d="M${cx - 22} ${cy - 10} Q${cx} ${cy - 2} ${cx + 22} ${cy - 10}" stroke="${TURQ}" stroke-width="3" fill="none"/>`; })(),
  w: 0.46, d: 0.46,
}]);

const mug = (c) => () => isoItem(0.2, 0.2, 28, [{ u: 0, v: 0, w: 0.2, d: 0.2, h: 22, ...shades(c), leftDecor: '<path d="M3 6 H10" stroke="#fff" stroke-width="2" opacity=".6"/>',
  rightDecor: '<path d="M12 5 q7 0 7 6 q0 6 -7 6" fill="none" stroke="#3E3252" stroke-opacity=".55" stroke-width="2"/>' }]);

const cookieJar = () => isoItem(0.32, 0.32, 56, [
  { u: 0.02, v: 0.02, w: 0.28, d: 0.28, h: 34, ...shades('#E8F4FB'), leftDecor: '<circle cx="9" cy="18" r="5" fill="#C99772"/><circle cx="7" cy="17" r="1" fill="#6B4A36"/>', rightDecor: '<circle cx="9" cy="14" r="5" fill="#C99772"/><circle cx="11" cy="24" r="4.5" fill="#D9A97E"/>' },
  { u: 0, v: 0, w: 0.32, d: 0.32, z: 34, h: 6, ...shades(LILAC) },
  { u: 0.12, v: 0.12, w: 0.08, d: 0.08, z: 40, h: 6, ...shades(SUN) },
]);

const board = () => isoItem(0.55, 0.36, 26, [
  { u: 0, v: 0, w: 0.55, d: 0.36, h: 5, ...shades(WOOD_L), topDecor: '<circle cx=".48" cy=".18" r=".035" fill="#B58456"/>' },
  { svg: (() => { const [cx, cy] = at(0.24, 0.18, 5); return `<path d="M${cx - 14} ${cy - 2} l26 -8" stroke="#F0A060" stroke-width="7" stroke-linecap="round"/><path d="M${cx + 12} ${cy - 10} l6 -6 M${cx + 12} ${cy - 10} l8 0" stroke="${LEAF}" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="${cx - 6}" cy="${cy + 6}" r="4" fill="#F0A060" ${line}/><circle cx="${cx + 4}" cy="${cy + 6}" r="4" fill="#F0A060" ${line}/>`; })(), w: 0.4, d: 0.3, u: 0.2, v: 0.15, z: 5 },
]);

// ---------- wall things ----------
const I = isoDef;
const W = (...a) => wallDef(R, ...a);

const windowBody = (it, sp, api) => {
  const sunny = api?.state.weather !== 'rain';
  const w = sp.len, h = 118;
  return `<rect width="${w}" height="${h}" rx="6" fill="${sunny ? '#BFE3FA' : '#9EADC4'}" ${line}/>
    ${sunny ? `<circle cx="${w * 0.72}" cy="34" r="15" fill="#FFF3B8"/><path d="M10 78 q14 -16 32 -6 q10 -12 28 -2 q16 0 12 12 z" fill="#fff"/>` : Array.from({ length: 10 }, (_, i) => `<line x1="${(i * 23) % w + 6}" y1="${(i * 37) % 90 + 8}" x2="${(i * 23) % w + 2}" y2="${(i * 37) % 90 + 22}" stroke="#E8EEF7" stroke-width="2"/>`).join('')}
    <path d="M0 ${h * 0.8} Q${w * 0.3} ${h * 0.7} ${w * 0.6} ${h * 0.78} T${w} ${h * 0.74} V${h} H0 Z" fill="#A8DE9A" opacity=".8"/>
    <path d="M${w / 2} 0 V${h} M0 ${h / 2} H${w}" stroke="#FBF7EF" stroke-width="6"/>
    <rect x="-6" y="${h - 4}" width="${w + 12}" height="12" rx="3" fill="#FBF7EF" ${line}/>
    <path d="M${w * 0.18} ${h - 4} v-12 h12 v12" fill="${CORAL}" ${line}/><path d="M${w * 0.18 + 6} ${h - 16} q-8 -12 0 -18 q8 6 0 18" fill="${LEAF}" ${line}/>
    <path d="M${w * 0.7} ${h - 4} v-10 h12 v10" fill="${TEAL}" ${line}/><circle cx="${w * 0.7 + 6}" cy="${h - 20}" r="7" fill="${LEAF}" ${line}/>
    <path d="M-10 -8 H${w + 10} V${h * 0.36} Q${w * 0.75} ${h * 0.46} ${w / 2} ${h * 0.36} Q${w * 0.25} ${h * 0.46} -10 ${h * 0.36} Z" fill="${TEAL}" ${line}/>
    <path d="M-10 ${h * 0.3} Q${w * 0.25} ${h * 0.4} ${w / 2} ${h * 0.3} Q${w * 0.75} ${h * 0.4} ${w + 10} ${h * 0.3}" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="6 5" opacity=".7"/>
    <rect x="-16" y="-14" width="${w + 32}" height="8" rx="4" fill="${WOOD}" ${line}/>`;
};

const clockBody = (it, sp) => {
  const now = new Date(), hr = (now.getHours() % 12) + now.getMinutes() / 60, mn = now.getMinutes();
  const c = sp.len / 2, r = sp.len / 2;
  const hand = (a, len, wd) => `<path d="M${c} ${r} L${(c + Math.sin(a) * len).toFixed(1)} ${(r - Math.cos(a) * len).toFixed(1)}" stroke="#3E3252" stroke-width="${wd}" stroke-linecap="round"/>`;
  return `<circle cx="${c}" cy="${r}" r="${r}" fill="${SUN}" ${line}/><circle cx="${c}" cy="${r}" r="${r - 5}" fill="#fff"/>
    ${[0, 1, 2, 3].map((i) => `<circle cx="${(c + Math.sin((i * Math.PI) / 2) * (r - 10)).toFixed(1)}" cy="${(r - Math.cos((i * Math.PI) / 2) * (r - 10)).toFixed(1)}" r="2" fill="#B79CF0"/>`).join('')}
    ${hand((hr / 12) * Math.PI * 2, r * 0.45, 3)}${hand((mn / 60) * Math.PI * 2, r * 0.68, 2)}<circle cx="${c}" cy="${r}" r="2.5" fill="${CORAL}"/>`;
};

const pansBody = (it, sp) => {
  const w = sp.len;
  return `<rect x="0" y="4" width="${w}" height="5" rx="2.5" fill="#A9AEC2" ${line}/>
    <circle cx="2" cy="6.5" r="4" fill="#8E94A8"/><circle cx="${w - 2}" cy="6.5" r="4" fill="#8E94A8"/>
    <path d="M12 9 V22" stroke="#5E5470" stroke-width="2"/><path d="M12 22 V44" stroke="${WOOD_D}" stroke-width="5" stroke-linecap="round"/><circle cx="12" cy="62" r="18" fill="#5E5470" ${line}/><circle cx="12" cy="62" r="12" fill="#7A7090"/>
    <path d="M38 9 V20" stroke="#5E5470" stroke-width="2"/><path d="M38 20 V58" stroke="#C4C9D6" stroke-width="3"/><ellipse cx="38" cy="64" rx="8" ry="6" fill="#C4C9D6" ${line}/>
    <path d="M54 9 V20" stroke="#5E5470" stroke-width="2"/><path d="M54 20 V44" stroke="${WOOD}" stroke-width="4" stroke-linecap="round"/><path d="M54 44 q-8 6 -6 20 q6 8 12 0 q2 -14 -6 -20 Z" fill="none" stroke="#C4C9D6" stroke-width="2"/><path d="M54 46 V64" stroke="#C4C9D6" stroke-width="1.5"/>
    <path d="M${w - 6} 9 V18" stroke="#5E5470" stroke-width="2"/><path d="M${w - 6} 18 V30" stroke="${CORAL}" stroke-width="4" stroke-linecap="round"/><path d="M${w - 18} 34 h24 q0 22 -12 22 q-12 0 -12 -22 Z" fill="${CORAL}" ${line}/>`;
};

const cookbookBody = (it, sp) => {
  const w = sp.len;
  const books = [[TURQ, 44], [SUN, 38], [LILAC, 46], [CORAL, 36], [SKY, 42], ['#C9B8F2', 40]];
  let x = 8;
  const b = books.map(([c, hh], i) => { const s = `<rect x="${x}" y="${56 - hh}" width="12" height="${hh}" rx="1.5" fill="${c}" ${line}/><path d="M${x + 2} ${62 - hh} h8" stroke="#fff" stroke-width="2" opacity=".6"/>`; x += 13 + (i === 2 ? 1 : 0); return s; }).join('');
  return `${b}<rect x="${x + 2}" y="22" width="30" height="34" rx="2" fill="#FBF7EF" ${line} transform="rotate(14 ${x + 17} 56)"/>${text(x + 16, 44, '🍰', 14)}
    <path d="M${w - 30} 56 v-14 h20 v14" fill="${CORAL}" ${line}/><path d="M${w - 20} 42 q-10 -14 -4 -22 M${w - 20} 42 q10 -14 4 -22 M${w - 20} 42 v-24" stroke="${LEAF}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <rect x="0" y="56" width="${w}" height="8" rx="2" fill="${WOOD}" ${line}/><path d="M12 64 l6 10 M${w - 12} 64 l-6 10" stroke="${WOOD_D}" stroke-width="4" stroke-linecap="round"/>`;
};

const drawingBody = (it, sp) => `<rect width="${sp.len}" height="62" fill="#fff" ${line}/><circle cx="16" cy="16" r="9" fill="${SUN}"/>
  <path d="M${sp.len / 2 - 16} 52 V34 L${sp.len / 2} 20 L${sp.len / 2 + 16} 34 V52 Z" fill="${LILAC}" ${line}/><rect x="${sp.len / 2 - 5}" y="40" width="10" height="12" fill="${TURQ}"/>
  <path d="M4 56 Q${sp.len / 2} 48 ${sp.len - 4} 56" stroke="${LEAF}" stroke-width="4" fill="none"/><rect x="${sp.len / 2 - 8}" y="-5" width="16" height="9" fill="#F5DE7A" opacity=".8"/>`;

const shake = (it) => { it.el.classList.remove('shake'); void it.el.offsetWidth; it.el.classList.add('shake'); };

export const KITCHEN = {
  id: 'kitchen', posKey: 'kitchen-iso', title: 'Kitchen 🍳', weather: true, light: 'iso', avatar: [2.4, 2.6],
  back: ['scene', { id: 'home' }], backLabel: 'Room',
  frame: '#E4ECEF',
  iso: R,
  bg,
  onWeather: (api) => api.setArt(api.get('window')),
  items: [
    W('window', 'R', 3.95, 262, 1.5, 118, windowBody),
    W('pans', 'R', 5.25, 246, 1.05, 90, pansBody, {
      onTap: (it, api) => { shake(it); api.sfx.click(); api.later(() => api.sfx.click(), 120); api.bubble(it.x + it.w / 2, it.y, 'Clink, clank! 🍳'); } }),
    W('clock', 'R', 6.75, 246, 0.6, 38, clockBody, {
      onTap: (it, api) => { api.setArt(it); api.sfx.tap(); api.bubble(it.x + it.w / 2, it.y, ['Tick tock! ⏰', 'Snack o\'clock! 🍎', 'Time for soup! 🍲'][Math.floor(Math.random() * 3)]); } }),
    W('cookbooks', 'L', 3.6, 214, 1.6, 64, cookbookBody, {
      onTap: (it, api) => { api.sfx.tap(); api.bubble(it.x + it.w / 2, it.y, ['Pancakes! 🥞', 'Veggie soup 🥕', 'Banana bread 🍌', 'Berry pie 🫐'][Math.floor(Math.random() * 4)]); } }),
    W('drawing', 'L', 5.5, 232, 0.8, 62, drawingBody),

    I('rug', 2.85, 2.35, 4.2, 3, rug, { floor: true }),
    I('mat', 3.95, 1.15, 1.2, 0.55, mat, { floor: true }),
    I('fridge', 0.1, 0.06, 1.25, 1, fridge, { drag: false, data: { open: false, n: 0 },
      onTap: (it, api) => {
        it.data.open = !it.data.open; api.setArt(it); api.sfx.click();
        if (it.data.open && api.count('apple') + api.count('milk') + api.count('cupcake') < 3) {
          const kind = ['apple', 'milk', 'cupcake'][it.data.n++ % 3];
          food(api, kind, 0, 0, { gx: it.gx + 0.15 + (it.data.n % 3) * 0.35, gy: it.gy + it.fd + 0.3 });
        }
      } }),
    I('counter', 1.45, 0.05, 1.2, 0.95, counter, { drag: false, surface: 92 }),
    I('stove', 2.65, 0.05, 1.15, 0.95, stove, { drag: false, surface: 92 }),
    I('sink', 3.8, 0.05, 1.4, 0.95, sink, { drag: false, surface: 92 }),
    I('counter2', 5.2, 0.05, 1, 0.95, counter2, { drag: false, surface: 92 }),
    I('hutch', 0.05, 1.4, 0.8, 1.8, hutch, { drag: false, surface: 100,
      onTap: (it, api) => { api.sfx.click(); api.bubble(it.x + it.w / 2, it.y, 'Plates and cups for everyone 🍽️'); } }),
    I('veggies', 0.15, 3.7, 0.8, 0.65, veggies, {
      onTap: (it, api) => { api.sparkle(it.x + it.w / 2, it.y + 30, ['🥕', '🍅', '🥦']); api.bubble(it.x + it.w / 2, it.y, 'Fresh veggies! 🥕'); } }),
    I('kplant', 0.15, 5.95, 0.8, 0.8, plant),
    I('table', 3.9, 3.4, 2, 1.4, table, { surface: 80 }),
    I('kchair1', 3.0, 3.7, 0.8, 0.8, chair('u0', SUN)),
    I('kchair2', 4.6, 2.5, 0.8, 0.8, chair('v0', TEAL)),
    I('kchair3', 6.05, 3.7, 0.8, 0.8, chair('u1', LILAC)),

    // small things: they sit on the counters and table, and can be moved around
    I('pot', 2.95, 0.3, 0.55, 0.5, pot, { small: true, gz: 92, drag: false, data: { busy: false },
      onTap: (it, api) => {
        if (it.data.busy) return;
        if (api.count('soup') >= 2) { api.bubble(it.x + it.w / 2, it.y, 'Eat the soup first! 🍲'); return; }
        it.data.busy = true; it.el.classList.add('cooking'); api.sfx.pour();
        api.later(() => {
          it.data.busy = false; it.el.classList.remove('cooking');
          const t = api.get('table');
          food(api, 'soup', 0, 0, t ? { gx: t.gx + 0.35 + api.count('soup') * 0.9, gy: t.gy + 0.75, gz: t.def.surface } : { gx: 3, gy: 1.6 });
          api.bubble(it.x + it.w / 2, it.y - 10, 'Soup is ready! Give it to someone.');
        }, 1400);
      } }),
    I('kettle', 1.62, 0.32, 0.36, 0.36, kettle, { small: true, gz: 92,
      onTap: (it, api) => {
        if (it.el.classList.contains('cooking')) return;
        it.el.classList.add('cooking'); api.sfx.pour();
        api.later(() => { it.el.classList.remove('cooking'); api.sfx.tap(); api.bubble(it.x + it.w / 2, it.y, 'Wheee! Tea time ☕'); }, 1500);
      } }),
    I('toaster', 2.08, 0.3, 0.46, 0.3, toaster, { small: true, gz: 92, data: { up: false },
      onTap: (it, api) => {
        it.data.up = !it.data.up; api.setArt(it);
        if (it.data.up) { api.sfx.pop(); api.bubble(it.x + it.w / 2, it.y, 'Pop! Toast is ready 🍞'); } else api.sfx.click();
      } }),
    I('faucet', 4.37, 0.1, 0.3, 0.24, faucet, { small: true, gz: 92, drag: false,
      onTap: (it, api) => { it.el.classList.remove('watering'); void it.el.offsetWidth; it.el.classList.add('watering'); api.sfx.pour(); api.later(() => it.el.classList.remove('watering'), 1500); } }),
    I('board', 5.3, 0.3, 0.55, 0.36, board, { small: true, gz: 92 }),
    I('cookiejar', 5.8, 0.15, 0.32, 0.32, cookieJar, { small: true, gz: 92,
      onTap: (it, api) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.bubble(it.x + it.w / 2, it.y, 'Only one cookie left... 🍪'); } }),
    I('fruit', 4.75, 3.85, 0.46, 0.46, fruitBowl, { small: true, gz: 80,
      onTap: (it, api) => api.sparkle(it.x + it.w / 2, it.y + 20, ['🍎', '🍌', '🫐']) }),
    I('mug1', 4.3, 3.6, 0.2, 0.2, mug(SKY), { small: true, gz: 80 }),
    I('mug2', 5.5, 4.3, 0.2, 0.2, mug(SUN), { small: true, gz: 80 }),
    I('cups', 0.45, 2.6, 0.2, 0.2, mug(TEAL), { small: true, gz: 100 }),
  ],
};
