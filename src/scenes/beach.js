// Beach — isometric diorama: sand slab with the sea along the right edge, a sand castle that grows,
// ice cream cart, picnic basket, parasol, lifeguard tower, palms, a crab, a sailboat and dolphins.
import { room, groundShell, floorPoly, isoItem, at, shades, proj, isoDef } from '../iso.js';
import { svg, text, sky, starPath, food, wearable, NPC } from './common.js';

const R = room({ cols: 12, rows: 9, ox: 704, oy: 150, wallH: 0 });
R.charScale = 0.55;

const HW = 64, HH = 32;
const SAND = '#F3DDA4', WOOD = '#C99A6C', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', TURQ = '#3CC7B8', SKY = '#9CC8EE', SUN = '#F5DE7A', CORAL = '#E58F6A';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4" stroke-linejoin="round"';
const P = (arr) => arr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const A = (u, v, z = 0) => at(u, v, z);
// Wearables from common.js are drawn big; scale them to the diorama.
const wear = (kind, id, iso, s = 0.6) => { const d = wearable(kind, 0, 0, id, iso); return { ...d, w: d.w * s, h: d.h * s, ax: d.ax * s, ay: d.ay * s }; };

// A box drawn in item-local coordinates (same faces as the kit's box parts, but in the order we write them).
function box({ u = 0, v = 0, z = 0, w, d, h, c, tl = '', ll = '', rl = '', ln = true }) {
  const bx = (u - v) * HW, by = (u + v) * HH - z;
  const B = [bx, by], Rr = [bx + w * HW, by + w * HH], F = [bx + (w - d) * HW, by + (w + d) * HH], L = [bx - d * HW, by + d * HH];
  const up = ([x, y]) => [x, y - h];
  const s = ln ? line : '';
  let o = '';
  if (h > 0) {
    o += `<polygon points="${P([L, F, up(F), up(L)])}" fill="${c.left}" ${s}/>`;
    if (ll) o += `<g transform="matrix(1,0.5,0,1,${L[0].toFixed(1)},${(L[1] - h).toFixed(1)})">${ll}</g>`;
    o += `<polygon points="${P([F, Rr, up(Rr), up(F)])}" fill="${c.right}" ${s}/>`;
    if (rl) o += `<g transform="matrix(1,-0.5,0,1,${F[0].toFixed(1)},${(F[1] - h).toFixed(1)})">${rl}</g>`;
  }
  o += `<polygon points="${P([up(B), up(Rr), up(F), up(L)])}" fill="${c.top}" ${s}/>`;
  if (tl) o += `<g transform="matrix(${HW},${HH},${-HW},${HH},${B[0].toFixed(1)},${(B[1] - h).toFixed(1)})">${tl}</g>`;
  return o;
}
// Upright cylinder (r in tiles) standing at u,v,z.
function cyl(u, v, z, r, h, c, top = true) {
  const [x, y] = A(u, v, z), rx = r * 90.5, ry = r * 45.25;
  return `<path d="M${x - rx} ${y - h} V${y} A${rx} ${ry} 0 0 0 ${x + rx} ${y} V${y - h} Z" fill="${c.left}" ${line}/>
    <path d="M${x} ${y - h + ry} V${y + ry} A${rx} ${ry} 0 0 0 ${x + rx} ${y} V${y - h} A${rx} ${ry} 0 0 1 ${x} ${y - h + ry} Z" fill="${c.right}" opacity=".55"/>
    ${top ? `<ellipse cx="${x}" cy="${y - h}" rx="${rx}" ry="${ry}" fill="${c.top}" ${line}/>` : ''}`;
}
const quad = (pts, fill, extra = line) => `<polygon points="${P(pts.map(([u, v, z]) => A(u, v, z)))}" fill="${fill}" ${extra}/>`;
const shadow = (u, v, r, o = 0.13) => { const [x, y] = A(u, v); return `<ellipse cx="${x}" cy="${y}" rx="${r * 90.5}" ry="${r * 45.25}" fill="#3E3252" opacity="${o}"/>`; };
// Wrap an item so only its painted shapes catch taps (big props shouldn't block the things behind them).
const thru = (s) => s.replace('<g transform', '<g pointer-events="visiblePainted" transform');
const I = (id, gx, gy, fw, fd, build, extra = {}) => {
  const d = isoDef(id, gx, gy, fw, fd, build, extra);
  if (extra.thru) d.art = (it, api) => thru(build(it, api).svg);
  return d;
};

// ---------- the sea edge ----------
const SEA = 8.4;
const shoreX = (v) => 8.92 + 0.22 * Math.sin(v * 1.25 + 0.4) + 0.1 * Math.sin(v * 3.2);
const SHORE = Array.from({ length: 37 }, (_, i) => [shoreX(i * 0.25), i * 0.25]);

// ---------- background: sky + floating sand slab ----------
const bg = (w) => {
  const sun = w.weather === 'sun';
  const F = proj(R, R.cols, R.rows), Rr = proj(R, R.cols, 0), Ll = proj(R, 0, R.rows);
  const wet = [...SHORE.map(([g, v]) => [g - 0.5, v]), ...SHORE.slice().reverse()];
  const tuft = ([x, y], s = 1, c = '#8FBF6A') => `<path d="M${x} ${y} q${-4 * s} ${-9 * s} ${-10 * s} ${-14 * s} M${x} ${y} q${s} ${-12 * s} ${3 * s} ${-20 * s} M${x} ${y} q${5 * s} ${-8 * s} ${11 * s} ${-12 * s}" stroke="${c}" stroke-width="${2.6 * s}" fill="none" stroke-linecap="round"/>`;
  const dunes = [...Array.from({ length: 14 }, (_, i) => [0.25 + ((i * 7) % 3) * 0.12, 0.6 + i * 0.58]), ...Array.from({ length: 12 }, (_, i) => [0.7 + i * 0.62, 0.22 + ((i * 5) % 3) * 0.1])];
  const fence = Array.from({ length: 11 }, (_, i) => 0.6 + i * 0.6).map((g) => {
    const [x, y] = proj(R, g, 0.12);
    return `<rect x="${x - 3}" y="${y - 34}" width="6" height="34" rx="2" fill="${WOOD}" ${line}/>`;
  }).join('');
  const [f0x, f0y] = proj(R, 0.6, 0.12), [f1x, f1y] = proj(R, 6.6, 0.12);
  const ripples = [[2.2, 5.6], [4.6, 2.0], [6.4, 6.0], [3.4, 8.2], [7.2, 3.6], [1.2, 2.2], [5.4, 8.4]].map(([g, v]) => {
    const [x, y] = proj(R, g, v);
    return `<path d="M${x - 26} ${y} q26 -10 52 0 M${x - 16} ${y + 8} q16 -6 32 0" stroke="#D9BC80" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>`;
  }).join('');
  const starfish = [[6.9, 8.4, '#F0B35A'], [1.6, 4.9, CORAL], [7.6, 1.2, '#F0B35A']].map(([g, v, c]) => { const [x, y] = proj(R, g, v); return `<g transform="translate(${x} ${y}) scale(1 .55)">${starPath(0, 0, 12, c, line)}</g>`; }).join('');
  const pebbles = Array.from({ length: 30 }, (_, i) => { const [x, y] = proj(R, 0.4 + ((i * 2.37) % 7.9), 0.4 + ((i * 1.73) % 8.3)); return `<ellipse cx="${x}" cy="${y}" rx="${2 + (i % 3)}" ry="${1.4 + (i % 2)}" fill="${['#E2C48A', '#FFF6DE', '#D9BC80', '#C9B8F2'][i % 4]}"/>`; }).join('');
  const steps = Array.from({ length: 7 }, (_, i) => { const [x, y] = proj(R, 3.2 + i * 0.72, 7.6 - i * 0.5 + (i % 2) * 0.16); return `<ellipse cx="${x}" cy="${y}" rx="6" ry="3.4" fill="#D9BC80" opacity=".8" transform="rotate(-20 ${x} ${y})"/>`; }).join('');
  const planks = Array.from({ length: 8 }, (_, i) => floorPoly(R, [[1.25, 6.0 + i * 0.38], [2.35, 6.0 + i * 0.38], [2.35, 6.32 + i * 0.38], [1.25, 6.32 + i * 0.38]], `fill="${i % 2 ? '#D9AE7E' : '#E2BC8E'}" ${line}`)).join('');
  return svg(1600, 900, `
  ${sky(w, 900, 'beach-sky')}
  <defs>
    <pattern id="beach-grain" width="1" height="1" patternUnits="userSpaceOnUse" patternTransform="matrix(64,32,-64,32,${R.ox},${R.oy})">
      <circle cx=".22" cy=".3" r=".03" fill="#E0C084"/><circle cx=".7" cy=".62" r=".025" fill="#D9B877"/><circle cx=".48" cy=".88" r=".02" fill="#FFF6DE"/><circle cx=".9" cy=".15" r=".02" fill="#FFF6DE"/></pattern>
  </defs>
  <g class="drift" style="animation-duration:26s"><path d="M300 210 q12 -10 24 0 q12 -10 24 0 M380 180 q9 -8 18 0 q9 -8 18 0 M1180 250 q10 -8 20 0 q10 -8 20 0" stroke="#4A3B5C" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/></g>
  ${groundShell(R, { top: sun ? SAND : '#DCCB9F', pattern: 'beach-grain', sideL: '#E7C98E', sideR: '#D6B376', layer: '#B98A5E', depth: 40 })}
  <polygon points="${P([F, Rr, [Rr[0], Rr[1] + 16], [F[0], F[1] + 16]])}" fill="${sun ? '#6FC9D6' : '#7E9EAE'}" opacity=".92"/>
  <path d="M${F[0]} ${F[1] + 16} L${Rr[0]} ${Rr[1] + 16}" stroke="#fff" stroke-width="2" opacity=".6"/>
  <polygon points="${P([Ll, F, [F[0], F[1] + 12], [Ll[0], Ll[1] + 12]])}" fill="#FFF3D2" opacity=".35"/>
  ${floorPoly(R, wet, `fill="${sun ? '#E6C88C' : '#CDBB90'}" opacity=".9"`)}
  ${planks}
  ${ripples}${pebbles}${steps}${starfish}
  <path d="M${f0x} ${f0y - 26} L${f1x} ${f1y - 26}" stroke="#A9835A" stroke-width="2.4"/>${fence}
  ${dunes.map(([g, v], i) => tuft(proj(R, g, v), 0.9 + (i % 3) * 0.2, i % 2 ? '#8FBF6A' : '#A8CF7E')).join('')}
  ${sun ? '' : `<g fill="#fff" opacity=".18">${[[3, 4], [6, 7], [2, 1.6]].map(([g, v]) => { const [x, y] = proj(R, g, v); return `<ellipse cx="${x}" cy="${y}" rx="46" ry="12"/>`; }).join('')}</g>`}`);
};

// ---------- sea (tap for dolphins) ----------
const seaArt = (it, api) => {
  const rain = api?.state.weather === 'rain';
  const L = ([g, v]) => A(g - SEA, v);
  const water = [...SHORE, [R.cols, R.rows], [R.cols, 0]].map(L);
  const shallow = [...SHORE, ...SHORE.slice().reverse().map(([g, v]) => [Math.min(R.cols, g + 0.9), v])].map(L);
  const foam = SHORE.map(([g, v]) => L([g + 0.04, v]));
  const foam2 = SHORE.map(([g, v]) => L([g + 0.36, v]));
  const crests = [[10.0, 1.4], [11.2, 2.6], [10.4, 4.4], [11.5, 5.4], [9.9, 6.8], [11.0, 8.1], [10.8, 0.6]].map(([g, v]) => { const [x, y] = L([g, v]); return `M${x - 14} ${y} q7 -6 14 0 q7 -6 14 0`; }).join(' ');
  const glints = [[10.6, 2.0], [9.8, 3.4], [11.4, 4.0], [10.2, 7.4], [11.6, 7.0]].map(([g, v]) => { const [x, y] = L([g, v]); return `<ellipse cx="${x}" cy="${y}" rx="9" ry="2.4" fill="#fff" opacity=".55"/>`; }).join('');
  const [rx, ry] = L([11.2, 7.7]);
  const rocks = `<path d="M${rx - 34} ${ry + 6} Q${rx - 30} ${ry - 22} ${rx - 8} ${ry - 24} Q${rx + 14} ${ry - 30} ${rx + 26} ${ry - 8} Q${rx + 30} ${ry + 8} ${rx - 34} ${ry + 6} Z" fill="#B9B3C8" ${line}/>
    <path d="M${rx - 8} ${ry - 24} Q${rx + 4} ${ry - 4} ${rx + 26} ${ry - 8} Q${rx + 30} ${ry + 8} ${rx - 2} ${ry + 6} Z" fill="#9C95AE" opacity=".8"/>
    <path d="M${rx + 18} ${ry + 14} Q${rx + 34} ${ry} ${rx + 52} ${ry + 10} Q${rx + 40} ${ry + 22} ${rx + 18} ${ry + 14} Z" fill="#C9C3D6" ${line}/>
    <path d="M${rx - 24} ${ry + 4} q-4 -14 2 -24 M${rx - 18} ${ry + 4} q4 -12 -2 -20" stroke="#6DBE7A" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="${rx}" cy="${ry + 8}" rx="48" ry="8" fill="none" stroke="#fff" stroke-width="2.4" opacity=".7"/>`;
  const [bx, by] = L([10.1, 6.2]);
  const ring = `<ellipse cx="${bx}" cy="${by}" rx="22" ry="11" fill="${CORAL}" ${line}/><ellipse cx="${bx}" cy="${by}" rx="10" ry="5" fill="${rain ? '#7E9EAE' : '#6FC9D6'}" ${line}/>
    <path d="M${bx - 20} ${by - 4} l8 4 M${bx + 20} ${by - 4} l-8 4 M${bx - 4} ${by + 10} l2 -6 M${bx + 4} ${by - 10} l-2 6" stroke="#fff" stroke-width="5"/>`;
  return isoItem(R.cols - SEA, R.rows, 4, [{ w: 1, d: 1, svg: `
    <polygon points="${P(water)}" fill="${rain ? '#6F8FA3' : '#56BCD0'}" ${line}/>
    <polygon points="${P(shallow)}" fill="${rain ? '#8FAFBE' : '#8EDDE0'}" opacity=".85"/>
    <polyline points="${P(foam2)}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="14 18" stroke-linecap="round" opacity=".6" class="waves"/>
    <polyline points="${P(foam)}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".9"/>
    <g class="waves" style="animation-duration:4s"><path d="${crests}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".75"/></g>
    ${glints}${rocks}${ring}` }]);
};

// ---------- props ----------
const palm = (s, lean) => () => {
  const H = 270 * s;
  const [x, y] = A(0.5, 0.5);
  const cx = x + lean, cy = y - H;
  const trunk = `<path d="M${x - 11 * s} ${y} Q${x + lean * 0.1} ${y - H * 0.55} ${cx - 6 * s} ${cy} L${cx + 6 * s} ${cy} Q${x + lean * 0.3 + 10 * s} ${y - H * 0.5} ${x + 11 * s} ${y} Z" fill="#B58A5E" ${line}/>
    ${Array.from({ length: 9 }, (_, i) => { const t = (i + 1) / 10, px = x + (cx - x) * t * t * 0.9 + lean * 0.08 * t, py = y - H * t; return `<path d="M${px - 9 * s} ${py + 3} Q${px} ${py - 3} ${px + 9 * s} ${py + 3}" stroke="#8B6450" stroke-width="2" fill="none" opacity=".7"/>`; }).join('')}`;
  const leaf = (a, L, col, droop) => {
    const ex = cx + Math.cos(a) * L, ey = cy + Math.sin(a) * L * 0.6 + droop;
    const mx = cx + Math.cos(a) * L * 0.5, my = cy + Math.sin(a) * L * 0.3 - L * 0.28;
    const nx = -Math.sin(a) * 14 * s, ny = Math.cos(a) * 8 * s;
    return `<path d="M${cx} ${cy} Q${mx + nx} ${my + ny} ${ex} ${ey} Q${mx - nx} ${my - ny + 10 * s} ${cx} ${cy} Z" fill="${col}" ${line}/>
      <path d="M${cx} ${cy} Q${mx} ${my + 4 * s} ${ex} ${ey}" stroke="#3E8A50" stroke-width="1.6" fill="none" opacity=".6"/>`;
  };
  const back = [[-2.6, 100, '#5AAE6A', 24], [-0.5, 104, '#5AAE6A', 30], [-1.6, 84, '#4E9B5A', 6]];
  const front = [[3.4, 110, '#6DBE7A', 40], [0.3, 108, '#6DBE7A', 46], [2.3, 96, '#7FCF8A', 44], [1.3, 70, '#7FCF8A', 30]];
  return isoItem(1, 1, H + 70 * s, [{ w: 1, d: 1, svg: `
    ${shadow(0.5, 0.5, 0.55)}<ellipse cx="${x}" cy="${y}" rx="26" ry="10" fill="#E6C88C"/>
    ${back.map(([a, L, c, d]) => leaf(a, L * s, c, d * s)).join('')}
    ${trunk}
    <circle cx="${cx - 8 * s}" cy="${cy + 8 * s}" r="${9 * s}" fill="#8B6450" ${line}/><circle cx="${cx + 8 * s}" cy="${cy + 10 * s}" r="${9 * s}" fill="#7A5640" ${line}/><circle cx="${cx}" cy="${cy + 16 * s}" r="${8 * s}" fill="#8B6450" ${line}/>
    ${front.map(([a, L, c, d]) => leaf(a, L * s, c, d * s)).join('')}` }]);
};

const tower = () => {
  const leg = shades('#E2C29C'), wood = shades(CREAM), roofL = CORAL, roofR = '#C9745A';
  const legs = [[0.1, 0.1], [1.0, 0.1], [0.1, 1.0], [1.0, 1.0]];
  const apex = A(0.6, 0.6, 222), c = [A(0.05, 0.05, 186), A(1.15, 0.05, 186), A(1.15, 1.15, 186), A(0.05, 1.15, 186)];
  const [lx, ly] = A(0.45, 1.6), [tx, ty] = A(0.45, 1.15, 112);
  const ladder = `<path d="M${lx - 14} ${ly} L${tx - 14} ${ty} M${lx + 14} ${ly} L${tx + 14} ${ty}" stroke="#A9835A" stroke-width="5" stroke-linecap="round"/>
    ${Array.from({ length: 6 }, (_, i) => { const t = (i + 1) / 7; return `<path d="M${lx - 14 + (tx - lx) * t} ${ly + (ty - ly) * t} h28" stroke="#A9835A" stroke-width="4"/>`; }).join('')}`;
  const [fx, fy] = A(0.6, 0.6, 222);
  return isoItem(1.2, 1.6, 270, [{ w: 1.2, d: 1.6, svg: `
    ${shadow(0.6, 0.7, 0.8)}
    ${legs.slice(0, 2).map(([u, v]) => box({ u, v, w: 0.1, d: 0.1, h: 112, c: leg })).join('')}
    <path d="M${A(0.15, 0.15, 30).join(' ')} L${A(1.05, 0.15, 90).join(' ')} M${A(1.05, 0.15, 30).join(' ')} L${A(1.05, 1.05, 90).join(' ')}" stroke="#C9A57C" stroke-width="4"/>
    ${legs.slice(2).map(([u, v]) => box({ u, v, w: 0.1, d: 0.1, h: 112, c: leg })).join('')}
    ${box({ u: 0, v: 0, z: 112, w: 1.2, d: 1.2, h: 10, c: shades(WOOD) })}
    ${box({ u: 0.15, v: 0.15, z: 122, w: 0.9, d: 0.9, h: 64, c: wood,
      ll: `<rect x="8" y="8" width="${0.9 * 64 - 16}" height="26" rx="4" fill="${SKY}" ${line}/><rect y="44" width="${0.9 * 64}" height="10" fill="${TURQ}"/>`,
      rl: `<rect x="8" y="8" width="${0.9 * 64 - 16}" height="26" rx="4" fill="${SKY}" ${line}/><rect y="44" width="${0.9 * 64}" height="10" fill="${TURQ}"/>` })}
    <polygon points="${P([c[3], c[2], apex])}" fill="${roofL}" ${line}/><polygon points="${P([c[2], c[1], apex])}" fill="${roofR}" ${line}/>
    <path d="M${c[3][0]} ${c[3][1]} L${c[2][0]} ${c[2][1]} L${c[1][0]} ${c[1][1]}" stroke="#fff" stroke-width="3" opacity=".7"/>
    <path d="M${fx} ${fy} V${fy - 34}" stroke="#3E3252" stroke-width="2.4"/><path d="M${fx} ${fy - 34} l22 7 -22 7 z" fill="${SUN}" ${line}/>
    <g transform="matrix(1,0.5,0,1,${A(0.15, 1.2, 112)[0]},${A(0.15, 1.2, 112)[1] - 2})"><rect x="0" y="-16" width="${1.1 * 64}" height="16" rx="3" fill="#fff" ${line}/>${text(1.1 * 32, -4, 'LIFEGUARD', 10, CORAL)}</g>
    <g transform="translate(${A(1.2, 0.75, 70)[0]} ${A(1.2, 0.75, 70)[1]})"><ellipse rx="15" ry="17" fill="${CORAL}" ${line}/><ellipse rx="7" ry="8" fill="#E7C98E"/><path d="M-15 0 h6 M9 0 h6 M0 -17 v6 M0 11 v6" stroke="#fff" stroke-width="4"/></g>
    ${ladder}` }]);
};

const cart = () => {
  const body = shades(CREAM), trim = shades(TEAL);
  const [px, py] = A(0.75, 0.45, 92);
  const tubs = [[0.25, 0.25, '#C9B8F2'], [0.55, 0.25, '#FBEFB4'], [0.85, 0.25, '#9EDDD4'], [1.15, 0.25, '#F0C27A']];
  const canopy = Array.from({ length: 10 }, (_, i) => {
    const a1 = (i / 10) * Math.PI * 2, a2 = ((i + 1) / 10) * Math.PI * 2, rx = 112, ry = 56, cy = py - 108;
    return { s: Math.sin((a1 + a2) / 2), d: `<polygon points="${P([[px, cy - 34], [px + Math.cos(a1) * rx, cy + Math.sin(a1) * ry], [px + Math.cos(a2) * rx, cy + Math.sin(a2) * ry]])}" fill="${i % 2 ? CREAM : TEAL}" ${line}/>` };
  }).sort((a, b) => a.s - b.s).map((o) => o.d).join('');
  const wheels = `<circle cx="22" cy="58" r="17" fill="${LILAC}" ${line}/><circle cx="22" cy="58" r="6" fill="#fff"/><circle cx="${1.5 * 64 - 22}" cy="58" r="17" fill="${LILAC}" ${line}/><circle cx="${1.5 * 64 - 22}" cy="58" r="6" fill="#fff"/>`;
  return isoItem(1.6, 1.0, 240, [{ w: 1.6, d: 1, svg: `
    ${shadow(0.8, 0.5, 0.75)}
    ${box({ u: 0.05, v: 0.05, z: 22, w: 1.5, d: 0.9, h: 58, c: body,
      ll: `<rect y="12" width="${1.5 * 64}" height="12" fill="${LILAC}"/><rect y="30" width="${1.5 * 64}" height="8" fill="${TEAL}"/><rect x="18" y="-26" width="60" height="20" rx="6" fill="${SUN}" ${line}/>${text(48, -11, 'ICE CREAM', 9)}${wheels}`,
      rl: `<rect y="12" width="${0.9 * 64}" height="12" fill="${LILAC}"/><rect y="30" width="${0.9 * 64}" height="8" fill="${TEAL}"/>` })}
    ${box({ u: 0.05, v: 0.05, z: 80, w: 1.5, d: 0.9, h: 6, c: trim })}
    ${tubs.map(([u, v, col]) => { const [x, y] = A(u + 0.05, v + 0.35, 86); return `<ellipse cx="${x}" cy="${y}" rx="15" ry="8" fill="#fff" ${line}/><ellipse cx="${x}" cy="${y - 3}" rx="12" ry="6" fill="${col}"/><circle cx="${x - 3}" cy="${y - 7}" r="4" fill="${col}" ${line}/>`; }).join('')}
    <path d="M${A(1.55, 0.2, 76).join(' ')} L${A(1.9, 0.2, 96).join(' ')} M${A(1.55, 0.8, 76).join(' ')} L${A(1.9, 0.8, 96).join(' ')} M${A(1.9, 0.2, 96).join(' ')} L${A(1.9, 0.8, 96).join(' ')}" stroke="#7A64B0" stroke-width="4" stroke-linecap="round"/>
    <path d="M${px} ${py} V${py - 140}" stroke="#7A64B0" stroke-width="4"/>
    ${canopy}<circle cx="${px}" cy="${py - 144}" r="6" fill="${SUN}" ${line}/>` }]);
};

const umbrella = () => {
  const [x, y] = A(0.5, 0.5);
  const top = y - 158, rx = 108, ry = 54;
  const segs = Array.from({ length: 10 }, (_, i) => {
    const a1 = (i / 10) * Math.PI * 2, a2 = ((i + 1) / 10) * Math.PI * 2;
    const p1 = [x + Math.cos(a1) * rx, top + Math.sin(a1) * ry], p2 = [x + Math.cos(a2) * rx, top + Math.sin(a2) * ry];
    const scal = Math.sin((a1 + a2) / 2) > 0 ? `<path d="M${p1[0]} ${p1[1]} Q${(p1[0] + p2[0]) / 2} ${(p1[1] + p2[1]) / 2 + 12} ${p2[0]} ${p2[1]}" fill="${i % 2 ? CREAM : LILAC}" ${line}/>` : '';
    return { s: Math.sin((a1 + a2) / 2), d: `<polygon points="${P([[x, top - 36], p1, p2])}" fill="${i % 2 ? CREAM : LILAC}" ${line}/>${scal}` };
  }).sort((a, b) => a.s - b.s).map((o) => o.d).join('');
  return isoItem(1, 1, 200, [{ w: 1, d: 1, svg: `
    <ellipse cx="${x + 24}" cy="${y + 8}" rx="104" ry="46" fill="#3E3252" opacity=".1"/>
    <ellipse cx="${x}" cy="${y}" rx="12" ry="5" fill="#D9BC80"/>
    <path d="M${x} ${y} V${top - 30}" stroke="#7A64B0" stroke-width="5" stroke-linecap="round"/>
    ${segs}<circle cx="${x}" cy="${top - 38}" r="6" fill="${SUN}" ${line}/>` }]);
};

const towel = () => isoItem(1.4, 2.4, 2, [{ w: 1.4, d: 2.4, svg: box({ u: 0, v: 0, w: 1.4, d: 2.4, h: 0, c: { top: '#FBEFB4' },
  tl: `${[0.3, 0.75, 1.65, 2.1].map((v) => `<rect x="0" y="${v}" width="1.4" height=".2" fill="${LILAC}"/>`).join('')}<rect x="0" y="1.12" width="1.4" height=".16" fill="${TEAL}"/>
    <path d="M.08 .04 V2.36 M1.32 .04 V2.36" stroke="#fff" stroke-width=".04" stroke-dasharray=".06 .05"/>` }) }]);

const chair = (col) => () => {
  const wood = '#A9835A';
  const seat = [[0.55, 0.1, 30], [1.5, 0.1, 22], [1.5, 0.7, 22], [0.55, 0.7, 30]];
  const backr = [[0.06, 0.1, 92], [0.55, 0.1, 30], [0.55, 0.7, 30], [0.06, 0.7, 92]];
  const stripes = (pts) => [0, 1, 2, 3, 4].map((k) => {
    const v0 = 0.1 + k * 0.12, v1 = v0 + 0.12;
    const p = pts.map(([u, , z], j) => [u, j === 0 || j === 1 ? v0 : v1, z]);
    return quad([[p[0][0], v0, p[0][2]], [p[1][0], v0, p[1][2]], [p[2][0], v1, p[2][2]], [p[3][0], v1, p[3][2]]], k % 2 ? CREAM : col, 'stroke="none"');
  }).join('');
  const rail = (v) => `<path d="M${A(0.06, v, 92).join(' ')} L${A(0.55, v, 30).join(' ')} L${A(1.55, v, 22).join(' ')} M${A(0.2, v, 0).join(' ')} L${A(0.5, v, 30).join(' ')} M${A(1.45, v, 0).join(' ')} L${A(1.45, v, 22).join(' ')} M${A(0.7, v, 0).join(' ')} L${A(0.7, v, 28).join(' ')}" stroke="${wood}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  return isoItem(1.6, 0.8, 96, [{ w: 1.6, d: 0.8, svg: `
    ${shadow(0.8, 0.45, 0.6)}
    ${rail(0.08)}
    ${stripes(backr)}${quad(backr, 'none')}
    ${stripes(seat)}${quad(seat, 'none')}
    ${rail(0.72)}` }]);
};

const castleArt = (it) => {
  const st = it?.data.stage || 0, sand = shades('#EBCB86'), wet = shades('#DDB874');
  const [cx, cy] = A(0.8, 0.8);
  const merlons = (u0, v0, w, d, z, m = 0.16) => {
    const ps = [];
    for (let k = 0; k * 0.28 <= w - m + 0.01; k++) { ps.push([u0 + k * 0.28, v0]); ps.push([u0 + k * 0.28, v0 + d - m]); }
    for (let k = 1; k * 0.28 < d - m; k++) { ps.push([u0, v0 + k * 0.28]); ps.push([u0 + w - m, v0 + k * 0.28]); }
    return ps.sort((a, b) => a[0] + a[1] - b[0] - b[1]).map(([u, v]) => box({ u, v, z, w: m, d: m, h: 9, c: sand })).join('');
  };
  const tower = (u, v) => `${cyl(u, v, 0, 0.17, 74, sand)}${merlons(u - 0.17, v - 0.17, 0.34, 0.34, 74, 0.11)}`;
  const shells = `${[[0.5, 1.5, '#C9B8F2'], [0.9, 1.5, CREAM], [1.5, 0.6, '#9EDDD4']].map(([u, v, c]) => { const [x, y] = A(u, v, 16); return `<ellipse cx="${x}" cy="${y}" rx="5" ry="4" fill="${c}" ${line}/>`; }).join('')}`;
  let body;
  if (st === 0) {
    body = `<path d="M${cx - 78} ${cy + 4} Q${cx - 66} ${cy - 46} ${cx} ${cy - 50} Q${cx + 66} ${cy - 46} ${cx + 78} ${cy + 4} Q${cx} ${cy + 34} ${cx - 78} ${cy + 4} Z" fill="#EBCB86" ${line}/>
      <path d="M${cx - 40} ${cy - 30} Q${cx} ${cy - 44} ${cx + 30} ${cy - 34}" stroke="#fff" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>
      ${[[-30, -10], [14, -24], [36, -6], [-8, 6]].map(([dx, dy]) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="2.4" fill="#D9B877"/>`).join('')}`;
  } else {
    const back = st >= 3 ? tower(0.2, 0.2) : '';
    const sides = st >= 3 ? `${tower(1.4, 0.2)}${tower(0.2, 1.4)}` : '';
    const front = st >= 3 ? tower(1.4, 1.4) : '';
    const keep = st >= 2 ? `${box({ u: 0.5, v: 0.5, z: 36, w: 0.6, d: 0.6, h: 52, c: sand, ll: '<rect x="13" y="12" width="12" height="18" rx="6" fill="#C9A57C"/>', rl: '<rect x="13" y="12" width="12" height="18" rx="6" fill="#C9A57C"/>' })}${merlons(0.5, 0.5, 0.6, 0.6, 88, 0.14)}` : '';
    const [fx, fy] = A(0.8, 0.8, 97);
    const flag = st >= 3 ? `<path d="M${fx} ${fy} V${fy - 46}" stroke="#3E3252" stroke-width="2.6"/><path d="M${fx} ${fy - 46} L${fx + 30} ${fy - 37} L${fx} ${fy - 28} Z" fill="${LILAC}" ${line}/>` : '';
    body = `${back}${box({ u: 0.15, v: 0.15, w: 1.3, d: 1.3, h: 36, c: sand,
      ll: `<path d="M${1.3 * 32 - 11} 36 V22 a11 11 0 0 1 22 0 V36 Z" fill="#C9A57C" ${line}/>`, rl: '<rect x="20" y="10" width="10" height="10" rx="3" fill="#C9A57C"/>' })}
      ${merlons(0.15, 0.15, 1.3, 1.3, 36)}${sides}${keep}${flag}${shells}${front}`;
  }
  return isoItem(1.6, 1.6, 190, [{ w: 1.6, d: 1.6, svg: `${shadow(0.8, 0.8, 0.85, 0.1)}<ellipse cx="${cx}" cy="${cy + 6}" rx="${0.95 * 90.5}" ry="${0.95 * 45}" fill="${wet.left}" opacity=".45"/>${body}` }]);
};

const bucket = () => {
  const c = shades(TURQ);
  const [x, y] = A(0.25, 0.25, 30);
  const [sx, sy] = A(0.4, 0.15, 0);
  return isoItem(0.5, 0.5, 70, [{ w: 0.5, d: 0.5, svg: `
    ${shadow(0.25, 0.25, 0.22)}
    <path d="M${sx + 4} ${sy} L${sx + 22} ${sy - 58}" stroke="${WOOD}" stroke-width="5" stroke-linecap="round"/><path d="M${sx - 6} ${sy + 4} Q${sx} ${sy - 18} ${sx + 12} ${sy - 12} Q${sx + 14} ${sy + 4} ${sx - 6} ${sy + 4} Z" fill="${SUN}" ${line}/>
    ${cyl(0.25, 0.25, 0, 0.17, 30, c)}
    <ellipse cx="${x}" cy="${y}" rx="${0.13 * 90.5}" ry="${0.13 * 45}" fill="#1F8C82" opacity=".5"/>
    <path d="M${x - 15} ${y} Q${x} ${y - 26} ${x + 15} ${y}" stroke="#3E3252" stroke-width="2" fill="none"/>
    ${starPath(x - 2, y + 18, 6, '#fff')}` }]);
};

const ballArt = () => {
  const [x, y] = A(0.25, 0.25);
  const cy = y - 24, r = 22;
  return isoItem(0.5, 0.5, 50, [{ w: 0.5, d: 0.5, svg: `
    <ellipse cx="${x}" cy="${y}" rx="20" ry="7" fill="#3E3252" opacity=".14"/>
    <circle cx="${x}" cy="${cy}" r="${r}" fill="#fff"/>
    <path d="M${x} ${cy - r} Q${x - 16} ${cy - 6} ${x - 12} ${cy + 19} L${x} ${cy} Z" fill="${SUN}"/><path d="M${x} ${cy - r} Q${x + 16} ${cy - 6} ${x + 12} ${cy + 19} L${x} ${cy} Z" fill="${SKY}"/>
    <path d="M${x - 12} ${cy + 19} Q${x} ${cy + 25} ${x + 12} ${cy + 19} L${x} ${cy} Z" fill="${LILAC}"/>
    <circle cx="${x}" cy="${cy}" r="${r}" fill="none" ${line}/><ellipse cx="${x - 8}" cy="${cy - 11}" rx="5" ry="3" fill="#fff" opacity=".8"/>` }]);
};

const basket = () => {
  const wick = shades('#E0B07A');
  const [hx, hy] = A(0.45, 0.3, 34);
  return isoItem(0.9, 0.6, 70, [{ w: 0.9, d: 0.6, svg: `
    ${shadow(0.45, 0.3, 0.5)}
    ${box({ u: 0, v: 0, w: 0.9, d: 0.6, h: 30, c: wick,
      ll: `<path d="M0 10 H${0.9 * 64} M0 20 H${0.9 * 64}" stroke="#C99772" stroke-width="2.4"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${6 + i * 9} 2 V28" stroke="#C99772" stroke-width="1.4" opacity=".6"/>`).join('')}`,
      rl: '<path d="M0 10 H38 M0 20 H38" stroke="#C99772" stroke-width="2.4"/>' })}
    ${box({ u: -0.02, v: -0.02, z: 30, w: 0.94, d: 0.64, h: 5, c: shades(LILAC),
      tl: `${[0, 1, 2, 3].map((i) => `<rect x="${i * 0.24}" y="0" width=".12" height=".64" fill="#fff" opacity=".6"/>`).join('')}${[0, 1, 2].map((i) => `<rect x="0" y="${i * 0.24}" width=".94" height=".12" fill="#fff" opacity=".4"/>`).join('')}` })}
    <path d="M${hx - 26} ${hy + 6} Q${hx} ${hy - 34} ${hx + 26} ${hy - 6}" stroke="#C99772" stroke-width="5" fill="none" stroke-linecap="round"/>` }]);
};

const crabArt = () => {
  const [x, y] = A(0.25, 0.25);
  const c = '#F08C7E', cy = y - 14;
  return isoItem(0.5, 0.5, 40, [{ w: 0.5, d: 0.5, svg: `
    <ellipse cx="${x}" cy="${y}" rx="22" ry="6" fill="#3E3252" opacity=".13"/>
    <path d="M${x - 12} ${cy + 6} l-10 8 M${x - 8} ${cy + 9} l-6 9 M${x + 12} ${cy + 6} l10 8 M${x + 8} ${cy + 9} l6 9" stroke="#3E3252" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M${x - 16} ${cy - 2} Q${x - 30} ${cy - 10} ${x - 24} ${cy - 20} Q${x - 20} ${cy - 12} ${x - 14} ${cy - 12}" fill="${c}" ${line}/>
    <path d="M${x + 16} ${cy - 2} Q${x + 30} ${cy - 10} ${x + 24} ${cy - 20} Q${x + 20} ${cy - 12} ${x + 14} ${cy - 12}" fill="${c}" ${line}/>
    <ellipse cx="${x}" cy="${cy}" rx="17" ry="11" fill="${c}" ${line}/>
    <path d="M${x - 5} ${cy - 10} V${cy - 17} M${x + 5} ${cy - 10} V${cy - 17}" stroke="#3E3252" stroke-width="2"/>
    <circle cx="${x - 5}" cy="${cy - 19}" r="3.4" fill="#fff" ${line}/><circle cx="${x + 5}" cy="${cy - 19}" r="3.4" fill="#fff" ${line}/>
    <circle cx="${x - 5}" cy="${cy - 19}" r="1.5" fill="#3E3252"/><circle cx="${x + 5}" cy="${cy - 19}" r="1.5" fill="#3E3252"/>` }]);
};

const surfboard = () => {
  const [x, y] = A(0.25, 0.25);
  return isoItem(0.5, 0.5, 170, [{ w: 0.5, d: 0.5, svg: `
    <ellipse cx="${x + 10}" cy="${y + 2}" rx="34" ry="9" fill="#3E3252" opacity=".12"/>
    <g transform="rotate(8 ${x} ${y})">
      <path d="M${x + 4} ${y - 2} Q${x + 30} ${y - 70} ${x + 22} ${y - 128} Q${x + 14} ${y - 166} ${x + 2} ${y - 168} Q${x - 4} ${y - 120} ${x + 4} ${y - 2} Z" fill="#5AB5AC" ${line}/>
      <path d="M${x} ${y} Q${x + 24} ${y - 70} ${x + 16} ${y - 128} Q${x + 8} ${y - 164} ${x - 4} ${y - 166} Q${x - 22} ${y - 120} ${x - 18} ${y - 60} Q${x - 14} ${y - 14} ${x} ${y} Z" fill="${TEAL}" ${line}/>
      <path d="M${x - 2} ${y - 10} Q${x + 4} ${y - 90} ${x - 4} ${y - 160}" stroke="#fff" stroke-width="6" fill="none" opacity=".9"/>
      <path d="M${x - 2} ${y - 10} Q${x + 4} ${y - 90} ${x - 4} ${y - 160}" stroke="${SUN}" stroke-width="2.4" fill="none"/></g>
    <path d="M${x - 22} ${y + 2} Q${x} ${y - 10} ${x + 24} ${y + 2} Q${x} ${y + 10} ${x - 22} ${y + 2} Z" fill="#E6C88C"/>` }]);
};

const shellArt = (it) => {
  const [x, y] = A(0.18, 0.18);
  const open = it?.data.open;
  return isoItem(0.35, 0.35, 30, [{ w: 0.35, d: 0.35, svg: `
    <ellipse cx="${x}" cy="${y + 1}" rx="16" ry="5" fill="#3E3252" opacity=".12"/>
    ${open ? `<path d="M${x - 16} ${y - 2} Q${x} ${y - 30} ${x + 16} ${y - 2} Z" fill="#F6D9C4" ${line}/><path d="M${x - 16} ${y - 2} Q${x} ${y + 8} ${x + 16} ${y - 2} Z" fill="#F0C2A8" ${line}/><circle cx="${x}" cy="${y - 5}" r="5" fill="#fff" ${line}/>`
    : `<path d="M${x - 15} ${y} Q${x} ${y - 26} ${x + 15} ${y} Q${x} ${y + 5} ${x - 15} ${y} Z" fill="${it?.data.color || CREAM}" ${line}/>
       <path d="M${x} ${y - 18} V${y + 2} M${x - 8} ${y - 12} L${x - 6} ${y + 2} M${x + 8} ${y - 12} L${x + 6} ${y + 2}" stroke="#3E3252" stroke-opacity=".35" stroke-width="1.4"/>`}` }]);
};
const shell = (id, gx, gy, color, special) => I(id, gx, gy, 0.35, 0.35, shellArt, {
  small: true, data: { color, open: false, special },
  onTap: (it, api) => {
    if (it.data.special) {
      it.data.open = true; api.setArt(it);
      if (!api.starFound('beach-shell')) api.addStar('beach-shell', 0, 0, { spawned: true, gx: Math.min(R.cols - 0.4, it.gx), gy: Math.min(R.rows - 0.4, it.gy), gz: 34 });
      else api.bubble(it.x + it.w / 2, it.y, 'A pearl! ✨');
    } else api.bubble(it.x + it.w / 2, it.y, ['Shhh... the sea! 🌊', 'Just a shell 🐚', 'So pretty!'][Math.floor(Math.random() * 3)]);
  },
});

const boat = () => {
  const hull = [[0, 0.3, 8], [0.25, 0.05, 16], [1.15, 0.05, 16], [1.4, 0.3, 14], [1.15, 0.55, 16], [0.25, 0.55, 16]];
  const [mx, my] = A(0.7, 0.3, 16);
  return isoItem(1.4, 0.6, 150, [{ w: 1.4, d: 0.6, svg: `<g class="ic-bob">
    <ellipse cx="${A(0.7, 0.3)[0]}" cy="${A(0.7, 0.3)[1] + 4}" rx="70" ry="16" fill="#fff" opacity=".45"/>
    ${quad([[0.25, 0.55, 16], [1.15, 0.55, 16], [1.05, 0.45, 0], [0.32, 0.45, 0]], CREAM)}
    ${quad([[1.15, 0.55, 16], [1.4, 0.3, 14], [1.25, 0.3, 0], [1.05, 0.45, 0]], '#E2D9CC')}
    ${quad(hull, '#C99A6C')}
    <path d="M${A(0.3, 0.55, 12).join(' ')} L${A(1.15, 0.55, 12).join(' ')}" stroke="${TURQ}" stroke-width="3"/>
    <path d="M${mx} ${my} V${my - 120}" stroke="#3E3252" stroke-width="3"/>
    <path d="M${mx + 3} ${my - 116} L${mx + 56} ${my - 14} L${mx + 3} ${my - 8} Z" fill="${LILAC}" ${line}/>
    <path d="M${mx - 3} ${my - 100} L${mx - 42} ${my - 12} L${mx - 3} ${my - 10} Z" fill="#9EDDD4" ${line}/>
    <path d="M${mx} ${my - 120} l16 5 -16 5 z" fill="${SUN}" ${line}/></g>` }]);
};

// ---------- spawned treats ----------
const iceCream = (api, gx, gy) => api.add({
  id: api.uid('icecream'), w: 44, h: 82, cls: 'food', small: true,
  gx: Math.max(0, Math.min(R.cols - 0.3, gx)), gy: Math.max(0, Math.min(R.rows - 0.3, gy)), gz: 0, fw: 0.3, fd: 0.3, ax: 22, ay: 80,
  onGive: (it, a, who) => a.eat(it, who, 'Yum! So cold! 🍦', ['💙', '✨', '🍦']),
  art: () => svg(62, 116, `
    <path d="M12 50 L31 112 L50 50 Z" fill="#F0C27A" ${line}/><path d="M18 62 L40 90 M44 62 L24 90" stroke="#C9913A" stroke-width="2" opacity=".6"/>
    <circle cx="31" cy="44" r="20" fill="#9EDDD4" ${line}/><circle cx="20" cy="30" r="16" fill="#C9B8F2" ${line}/><circle cx="42" cy="28" r="16" fill="#FBEFB4" ${line}/>
    <circle cx="31" cy="10" r="7" fill="${CORAL}" ${line}/>`),
}, { spawned: true });

export const BEACH = {
  id: 'beach', posKey: 'beach-iso', title: 'Beach 🏖️', weather: true, outdoor: true, light: 'outdoor', avatar: [4.6, 3.0],
  frame: (w) => (w === 'sun' ? 'linear-gradient(#A9DCFF, #FFF1D6)' : 'linear-gradient(#97A5BC, #CDD4DF)'),
  iso: R,
  bg,
  onWeather: (api) => api.setArt(api.get('sea')),
  characters: [{ id: 'leo', look: NPC.leo, gx: 3.0, gy: 2.4, say: ["I'm Leo! Let's build a castle! 🏰", 'The water is warm! 🌊', 'I want ice cream... 🍦'] }],
  init: (api) => {
    const c = api.get('castle'); c.data.stage = api.state.castle || 0; api.setArt(c);
    for (const it of api.items.values()) if (it.def.thru) it.el.style.pointerEvents = 'none';
  },
  items: [
    I('sea', SEA, 0, R.cols - SEA, R.rows, seaArt, { floor: true, drag: false, thru: true,
      onTap: (it, api) => {
        const [x, y] = proj(R, 9.8 + Math.random() * 1.8, 0.8 + Math.random() * 7.2);
        api.effect(x, y - 20, 'dolphin', `<svg viewBox="0 0 140 90" width="140" height="90"><path class="o" d="M10 70 Q40 10 100 20 Q120 22 130 34 Q116 34 108 40 Q96 60 70 64 L60 80 L48 66 Q30 70 10 70 Z" fill="#8FC3F0"/><circle cx="104" cy="32" r="3.5" fill="#4A3B5C"/><path class="ln" stroke-width="2" d="M110 40 Q116 42 120 40"/></svg>`, 1300);
        api.later(() => api.sparkle(x + 60, y, ['💧', '💦', '✨']), 900);
        api.sfx.boing();
      } }),
    I('towel', 4.2, 6.4, 1.4, 2.4, towel, { floor: true }),
    I('palm1', 0.3, 7.4, 1, 1, palm(1.1, 34), { drag: false, thru: true,
      onTap: (it, api) => { it.el.classList.remove('shake'); void it.el.offsetWidth; it.el.classList.add('shake'); api.sparkle(it.x + it.w / 2, it.y + 40, ['🍃', '🌴', '✨']); } }),
    I('palm2', 6.9, 0.2, 1, 1, palm(0.92, -26), { drag: false, thru: true,
      onTap: (it, api) => { it.el.classList.remove('shake'); void it.el.offsetWidth; it.el.classList.add('shake'); api.sparkle(it.x + it.w / 2, it.y + 40, ['🍃', '🌴', '✨']); } }),
    I('tower', 7.2, 1.8, 1.2, 1.6, tower, { drag: false, thru: true,
      onTap: (it, api) => api.bubble(it.x + it.w / 2, it.y + 40, ['Swim safe! 🛟', 'All clear on the water! 👀', 'Wave at the lifeguard! 👋'][Math.floor(Math.random() * 3)]) }),
    I('cart', 4.9, 0.4, 1.6, 1.0, cart, { drag: false, thru: true,
      onTap: (it, api) => {
        if (api.count('icecream') >= 2) { api.bubble(it.x + it.w / 2, it.y + 30, 'Give your ice cream to someone!'); return; }
        iceCream(api, it.gx + 0.2 + api.count('icecream') * 0.45, it.gy + 1.35);
        api.bubble(it.x + it.w / 2, it.y + 30, 'Here you go! 🍦');
      } }),
    I('umbrella', 3.7, 8.0, 1, 1, umbrella, { thru: true }),
    I('chair1', 6.0, 7.0, 1.6, 0.8, chair(TEAL), { zBias: -10 }),
    I('castle', 1.4, 3.2, 1.6, 1.6, castleArt, { data: { stage: 0 },
      onTap: (it, api) => {
        it.data.stage = (it.data.stage + 1) % 4; api.state.castle = it.data.stage; api.save(); api.setArt(it);
        api.sparkle(it.x + it.w / 2, it.y + it.h * 0.6, ['✨', '🏖️', '✨']);
        if (it.data.stage === 3) {
          api.bubble(it.x + it.w / 2, it.y + 20, 'A sand castle! 🏰');
          if (!api.starFound('beach-castle')) api.addStar('beach-castle', 0, 0, { spawned: true, gx: it.gx + 0.6, gy: it.gy + 0.6, gz: 140 });
        }
      } }),
    I('bucket', 3.3, 3.6, 0.5, 0.5, bucket),
    I('ball', 6.4, 4.0, 0.5, 0.5, ballArt, { onTap: (it, api) => { it.el.classList.remove('bounce'); void it.el.offsetWidth; it.el.classList.add('bounce'); api.sfx.boing(); } }),
    I('basket', 3.6, 5.0, 0.9, 0.6, basket, { drag: false, data: { n: 0 },
      onTap: (it, api) => {
        if (api.count('sandwich') + api.count('watermelon') + api.count('juice') >= 3) { api.bubble(it.x + it.w / 2, it.y, 'Share the snacks first! 🧺'); return; }
        const kind = ['watermelon', 'sandwich', 'juice'][it.data.n++ % 3];
        food(api, kind, 0, 0, { gx: it.gx + 1.1 + (it.data.n % 3) * 0.4, gy: it.gy + 0.6 });
      } }),
    I('crab', 6.8, 8.3, 0.5, 0.5, crabArt, { cls: 'crab',
      onTap: (it, api) => { api.bubble(it.x + it.w / 2, it.y, 'Snip snap! 🦀'); it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); } }),
    I('surfboard', 7.9, 5.0, 0.5, 0.5, surfboard),
    I('boat', 10.2, 2.6, 1.4, 0.6, boat, { drag: false,
      onTap: (it, api) => { api.bubble(it.x + it.w / 2, it.y + 10, 'Ahoy! ⛵'); it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.sfx.boing(); } }),
    wear('sun', 'wear-sun', { gx: 7.3, gy: 5.7 }),
    wear('straw', 'wear-straw', { gx: 4.7, gy: 7.2 }),
    shell('shell1', 1.2, 2.0, '#F6D9C4'),
    shell('shell2', 5.9, 3.0, '#C9B8F2', true),
    shell('shell3', 8.0, 8.1, '#FBEFB4'),
  ],
};
