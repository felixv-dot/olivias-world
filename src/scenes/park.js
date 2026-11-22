// Park — isometric diorama: grass slab with gravel paths and flower beds, a big tree with a secret nest,
// swings, slide, fountain, picnic, a kite, a puppy, and a star hidden under the bench.
import { room, groundShell, floorPoly, isoItem, at, shades, proj, isoDef } from '../iso.js';
import { svg, food, NPC } from './common.js';

const R = room({ cols: 11, rows: 10, ox: 768, oy: 150, wallH: 0 });
R.charScale = 0.55;

const HW = 64, HH = 32;
const WOOD = '#C99A6C', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', TURQ = '#3CC7B8', SKY = '#9CC8EE', SUN = '#F5DE7A', CORAL = '#E58F6A';
const LEAF = '#6DBE7A', LEAF_D = '#5AAE6A', LEAF_L = '#8FD39A';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4" stroke-linejoin="round"';
const P = (arr) => arr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const A = (u, v, z = 0) => at(u, v, z);

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
function cyl(u, v, z, r, h, c, top = true) {
  const [x, y] = A(u, v, z), rx = r * 90.5, ry = r * 45.25;
  return `<path d="M${x - rx} ${y - h} V${y} A${rx} ${ry} 0 0 0 ${x + rx} ${y} V${y - h} Z" fill="${c.left}" ${line}/>
    <path d="M${x} ${y - h + ry} V${y + ry} A${rx} ${ry} 0 0 0 ${x + rx} ${y} V${y - h} A${rx} ${ry} 0 0 1 ${x} ${y - h + ry} Z" fill="${c.right}" opacity=".55"/>
    ${top ? `<ellipse cx="${x}" cy="${y - h}" rx="${rx}" ry="${ry}" fill="${c.top}" ${line}/>` : ''}`;
}
const quad = (pts, fill, extra = line) => `<polygon points="${P(pts.map(([u, v, z]) => A(u, v, z)))}" fill="${fill}" ${extra}/>`;
const seg = (a, b, col, wdt) => `<path d="M${A(...a).join(' ')} L${A(...b).join(' ')}" stroke="${col}" stroke-width="${wdt}" stroke-linecap="round"/>`;
const shadow = (u, v, r, o = 0.13) => { const [x, y] = A(u, v); return `<ellipse cx="${x}" cy="${y}" rx="${r * 90.5}" ry="${r * 45.25}" fill="#3E3252" opacity="${o}"/>`; };
const thru = (s) => s.replace('<g transform', '<g pointer-events="visiblePainted" transform');
const I = (id, gx, gy, fw, fd, build, extra = {}) => {
  const d = isoDef(id, gx, gy, fw, fd, build, extra);
  if (extra.thru) d.art = (it, api) => thru(build(it, api).svg);
  return d;
};
const blob = (cx, cy, r, fill) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${line}/>`;

// ---------- background: sky + floating grass slab ----------
const PATH = [[11, 3.2], [9.2, 3.4], [7.6, 3.9], [6.4, 4.6], [5.6, 5.6], [5.2, 7.0], [5.4, 8.4], [5.8, 10], [4.4, 10], [4.0, 8.4], [3.9, 6.8], [4.3, 5.2], [5.4, 3.7], [7.0, 2.7], [9.0, 2.2], [11, 2.0]];
const bg = (w) => {
  const sun = w.weather === 'sun';
  const grass = sun ? '#A8DE9A' : '#97C68E';
  const tuft = ([x, y], s = 1, c = '#86C47C') => `<path d="M${x} ${y} l${-4 * s} ${-9 * s} M${x} ${y} l${s} ${-11 * s} M${x} ${y} l${5 * s} ${-8 * s}" stroke="${c}" stroke-width="${2.2 * s}" stroke-linecap="round"/>`;
  const tufts = Array.from({ length: 46 }, (_, i) => [0.3 + ((i * 2.71) % 10.4), 0.3 + ((i * 1.93) % 9.4)]).filter(([g, v]) => !(g > 3.6 && g < 6.2 && v > 4.4) && !(v > 1.8 && v < 3.8 && g > 5));
  const pebbles = Array.from({ length: 26 }, (_, i) => { const t = (i * 0.37) % 1, k = Math.floor((i * 7) % 6); const a = PATH[k], b = PATH[PATH.length - 1 - k]; const g = a[0] + (b[0] - a[0]) * t, v = a[1] + (b[1] - a[1]) * t; const [x, y] = proj(R, g, v); return `<ellipse cx="${x}" cy="${y}" rx="${2 + (i % 3)}" ry="${1.5 + (i % 2)}" fill="${['#D8C9A6', '#FBF3DE', '#CBBB96'][i % 3]}"/>`; }).join('');
  // flower bed along the back-left edge
  const bed = floorPoly(R, [[0.2, 1.2], [1.3, 1.2], [1.3, 5.6], [0.2, 5.6]], `fill="#B88A64" ${line}`);
  const bedRim = floorPoly(R, [[0.1, 1.1], [1.4, 1.1], [1.4, 5.7], [0.1, 5.7]], `fill="none" stroke="#E2D9CC" stroke-width="7"`);
  const bedFlowers = Array.from({ length: 16 }, (_, i) => { const [x, y] = proj(R, 0.45 + (i % 2) * 0.5, 1.5 + i * 0.25); const c = [LILAC, SUN, '#9EDDD4', SKY][i % 4]; return `<path d="M${x} ${y} v-12" stroke="#4E9B5A" stroke-width="2"/><circle cx="${x}" cy="${y - 14}" r="5" fill="${c}" ${line}/><circle cx="${x}" cy="${y - 14}" r="1.8" fill="#fff"/>`; }).join('');
  // low picket fence along the back-right edge
  const posts = Array.from({ length: 16 }, (_, i) => 0.4 + i * 0.6).filter((g) => g < 10.8).map((g) => { const [x, y] = proj(R, g, 0.1); return `<path d="M${x - 4} ${y} V${y - 30} l4 -6 l4 6 V${y} Z" fill="${CREAM}" ${line}/>`; }).join('');
  const [r0x, r0y] = proj(R, 0.4, 0.1), [r1x, r1y] = proj(R, 9.4, 0.1);
  const puddles = sun ? '' : [[5.0, 7.4], [6.6, 4.2], [9.4, 2.8]].map(([g, v]) => { const [x, y] = proj(R, g, v); return `<ellipse cx="${x}" cy="${y}" rx="34" ry="11" fill="#B8C8DA" opacity=".8"/><ellipse cx="${x - 8}" cy="${y - 2}" rx="14" ry="3" fill="#fff" opacity=".5"/>`; }).join('');
  return svg(1600, 900, `
  ${skyBg(w)}
  <defs>
    <pattern id="park-grassp" width="1" height="1" patternUnits="userSpaceOnUse" patternTransform="matrix(64,32,-64,32,${R.ox},${R.oy})">
      <rect width="1" height="1" fill="none"/><rect width=".5" height=".5" fill="#fff" opacity=".05"/><rect x=".5" y=".5" width=".5" height=".5" fill="#fff" opacity=".05"/></pattern>
  </defs>
  ${groundShell(R, { top: grass, pattern: 'park-grassp', sideL: '#B98A5E', sideR: '#A27650', layer: '#8B6450', depth: 44, edge: sun ? '#8FCB82' : '#7FB47A' })}
  ${floorPoly(R, PATH, `fill="${sun ? '#EBDDB8' : '#D3C6A4'}" ${line}`)}
  ${floorPoly(R, PATH.map(([g, v]) => [g + 0.06, v + 0.06]), `fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"`)}
  ${(() => { const [x, y] = proj(R, 6.4, 5.2); return `<ellipse cx="${x}" cy="${y}" rx="${1.45 * 90.5}" ry="${1.45 * 45.25}" fill="${sun ? '#EBDDB8' : '#D3C6A4'}" ${line}/><ellipse cx="${x}" cy="${y}" rx="${1.25 * 90.5}" ry="${1.25 * 45.25}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="3" stroke-dasharray="10 8"/>`; })()}
  ${pebbles}${puddles}
  ${bedRim}${bed}${bedFlowers}
  <path d="M${r0x} ${r0y - 18} L${r1x} ${r1y - 18}" stroke="#E2D9CC" stroke-width="5"/>${posts}
  ${tufts.map(([g, v], i) => tuft(proj(R, g, v), 0.9 + (i % 3) * 0.15, i % 2 ? '#86C47C' : '#94CF88')).join('')}`);
};
// Sky backdrop with soft distant treetops below the slab.
const skyBg = (w) => {
  const sun = w.weather === 'sun';
  const top = sun ? '#A9DCFF' : '#97A5BC', bot = sun ? '#E8F6E6' : '#CDD4DF';
  const c = sun ? '#FFFFFF' : '#DCE1EA';
  const cl = (x, y, s, col, dur) => `<g class="drift" style="animation-duration:${dur}s"><g transform="translate(${x} ${y}) scale(${s})" fill="${col}"><ellipse cx="60" cy="44" rx="60" ry="22"/><ellipse cx="100" cy="30" rx="44" ry="30"/><ellipse cx="150" cy="42" rx="52" ry="24"/></g></g>`;
  return `<defs><linearGradient id="park-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient>
      <radialGradient id="park-sun"><stop offset="0" stop-color="#FFF6C8"/><stop offset=".55" stop-color="#FFE27A" stop-opacity=".55"/><stop offset="1" stop-color="#FFE27A" stop-opacity="0"/></radialGradient></defs>
    <rect width="1600" height="900" fill="url(#park-sky)"/>
    ${sun ? '<circle cx="1390" cy="120" r="160" fill="url(#park-sun)"/><circle cx="1390" cy="120" r="52" fill="#FFF3B8"/>' : ''}
    ${w.rainbow ? `<g fill="none" stroke-width="20" opacity=".65" stroke-linecap="round">${['#E58F6A', '#F5DE7A', '#9EDDD4', '#8FC3F0', '#B79CF0'].map((col, i) => `<path d="M${200 + i * 20} 620 A${600 - i * 20} ${470 - i * 20} 0 0 1 ${1400 - i * 20} 620" stroke="${col}"/>`).join('')}</g>` : ''}
    ${cl(120, 70, 1.1, c, 70)}${cl(1040, 40, 0.8, c, 90)}${cl(560, 120, 0.6, c, 80)}
    ${sun ? '' : `${cl(380, 110, 1.3, '#C4CBD8', 55)}${cl(1200, 90, 1.1, '#C4CBD8', 65)}`}
    <g fill="${sun ? '#C9E8C4' : '#B4C6B8'}" opacity=".8">${Array.from({ length: 16 }, (_, i) => `<ellipse cx="${i * 110 - 20}" cy="${880 + Math.sin(i * 1.9) * 14}" rx="${70 + (i % 3) * 16}" ry="${48 + (i % 2) * 14}"/>`).join('')}</g>`;
};

// ---------- big tree with a nest ----------
const NEST = [1.3, 0.9, 268];
const tree = () => {
  const [x, y] = A(1, 1);
  const bark = '#A87A5A';
  const [nx, ny] = A(...NEST);
  return isoItem(2, 2, 400, [{ w: 2, d: 2, svg: `
    ${shadow(1, 1, 1.25, 0.14)}
    <path d="M${x - 46} ${y + 4} Q${x - 22} ${y - 6} ${x - 20} ${y - 30} L${x + 20} ${y - 30} Q${x + 24} ${y - 6} ${x + 50} ${y + 6} Q${x} ${y + 16} ${x - 46} ${y + 4} Z" fill="#8B6450" ${line}/>
    <path d="M${x - 22} ${y} Q${x - 14} ${y - 120} ${x - 18} ${y - 200} L${x + 22} ${y - 200} Q${x + 14} ${y - 110} ${x + 24} ${y} Z" fill="${bark}" ${line}/>
    <path d="M${x + 8} ${y - 8} Q${x + 4} ${y - 90} ${x + 10} ${y - 190}" stroke="#8B6450" stroke-width="5" fill="none" opacity=".6"/>
    <path d="M${x - 16} ${y - 150} Q${x - 60} ${y - 170} ${x - 84} ${y - 214}" stroke="${bark}" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M${x + 16} ${y - 170} Q${x + 60} ${y - 190} ${x + 70} ${y - 232}" stroke="${bark}" stroke-width="13" fill="none" stroke-linecap="round"/>
    ${blob(x - 96, y - 250, 74, LEAF_D)}${blob(x + 92, y - 262, 70, LEAF_D)}${blob(x - 10, y - 330, 92, LEAF)}
    ${blob(x - 70, y - 300, 64, LEAF)}${blob(x + 62, y - 318, 62, LEAF)}
    ${blob(x - 4, y - 236, 70, LEAF_L)}${blob(x + 44, y - 214, 40, LEAF)}${blob(x - 58, y - 206, 42, LEAF)}
    <circle cx="${nx - 6}" cy="${ny - 9}" r="5" fill="${SKY}" ${line}/><circle cx="${nx + 6}" cy="${ny - 9}" r="5" fill="${SKY}" ${line}/>
    <path d="M${nx - 26} ${ny} Q${nx} ${ny + 18} ${nx + 26} ${ny} Q${nx + 22} ${ny - 10} ${nx} ${ny - 8} Q${nx - 22} ${ny - 10} ${nx - 26} ${ny} Z" fill="#C99772" ${line}/>
    <path d="M${nx - 20} ${ny - 2} l12 8 M${nx - 4} ${ny - 6} l8 12 M${nx + 10} ${ny - 4} l8 8" stroke="#8B6450" stroke-width="2"/>
    <path d="M${nx + 14} ${ny + 8} q10 -2 16 6 q-10 4 -16 -6 Z M${nx - 30} ${ny + 4} q-8 -8 -2 -14 q6 6 2 14 Z" fill="${LEAF}" ${line}/>
    <circle cx="${x - 34}" cy="${y - 370}" r="26" fill="#C3EBC0" opacity=".6"/><circle cx="${x + 70}" cy="${y - 300}" r="16" fill="#C3EBC0" opacity=".5"/>
    ${[[-80, -230], [70, -246], [10, -300], [-30, -360], [100, -290]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="9" fill="${CORAL}" ${line}/>`).join('')}` }]);
};

// ---------- playground ----------
const swing = () => {
  const frame = '#8FC3F0', pd = '#4D5C9A';
  const leg = (u) => `${seg([u, 0.05, 0], [u, 0.5, 190], frame, 9)}${seg([u, 0.95, 0], [u, 0.5, 190], frame, 9)}${seg([u, 0.05, 0], [u, 0.5, 190], '#6FA8DC', 2)}`;
  const seat = (u, col) => {
    const [tx, ty] = A(u, 0.5, 188), [bx, by] = A(u, 0.5, 52);
    return `<g class="ic-seat"><path d="M${tx - 20} ${ty - 10} L${bx - 20} ${by - 10} M${tx + 20} ${ty + 10} L${bx + 20} ${by + 10}" stroke="#3E3252" stroke-width="2.4" opacity=".75"/>
      ${box({ u: u - 0.32, v: 0.36, z: 48, w: 0.64, d: 0.28, h: 6, c: shades(col) })}</g>`;
  };
  return isoItem(2.6, 1, 250, [{ w: 2.6, d: 1, svg: `
    ${shadow(1.3, 0.5, 1.0, 0.1)}
    ${[0.8, 1.8].map((u) => { const [x, y] = A(u, 0.5); return `<ellipse cx="${x}" cy="${y}" rx="34" ry="14" fill="#C9A57C" opacity=".55"/>`; }).join('')}
    ${quad([[0.1, 0.5, 0], [2.5, 0.5, 0], [2.5, 0.5, 196], [0.1, 0.5, 196]], '#fff', 'fill-opacity="0"')}
    ${leg(0.1)}
    ${seat(0.8, SUN)}${seat(1.8, LILAC)}
    ${leg(2.5)}
    ${box({ u: 0.02, v: 0.42, z: 186, w: 2.56, d: 0.16, h: 12, c: shades(pd) })}` }]);
};

const slide = () => {
  const rail = shades(LILAC), deck = shades('#C9B8F2');
  const ladder = `${seg([0.1, 0.0, 0], [0.1, 0.25, 130], LILAC, 7)}${seg([0.9, 0.0, 0], [0.9, 0.25, 130], LILAC, 7)}
    ${[24, 50, 76, 102].map((z) => seg([0.1, 0.25 * z / 130, z], [0.9, 0.25 * z / 130, z], '#C9B8F2', 5)).join('')}`;
  const chute = [[0.18, 0.8, 120], [0.82, 0.8, 120], [0.82, 2.9, 8], [0.18, 2.9, 8]];
  const lip = [[0.18, 2.9, 8], [0.82, 2.9, 8], [0.82, 3.2, 6], [0.18, 3.2, 6]];
  return isoItem(1, 3.2, 200, [{ w: 1, d: 3.2, svg: `
    ${shadow(0.5, 1.6, 0.9, 0.1)}
    ${ladder}
    ${[[0.1, 0.3], [0.9, 0.3], [0.1, 0.78], [0.9, 0.78]].map(([u, v]) => box({ u: u - 0.05, v: v - 0.05, w: 0.1, d: 0.1, h: 120, c: rail })).join('')}
    ${box({ u: 0.02, v: 0.25, z: 120, w: 0.96, d: 0.6, h: 10, c: deck })}
    ${seg([0.06, 0.28, 130], [0.06, 0.82, 130], LILAC, 4)}${seg([0.06, 0.28, 130], [0.06, 0.28, 168], LILAC, 4)}${seg([0.06, 0.28, 168], [0.94, 0.28, 168], LILAC, 4)}${seg([0.94, 0.28, 168], [0.94, 0.28, 130], LILAC, 4)}
    ${quad([[0.18, 0.8, 104], [0.18, 2.9, 0], [0.18, 2.9, 8], [0.18, 0.8, 120]], '#6CB9AE')}
    ${quad(chute, '#9EDDD4')}${quad(lip, '#9EDDD4')}
    <path d="M${A(0.5, 0.85, 120).join(' ')} L${A(0.5, 2.9, 8).join(' ')}" stroke="#fff" stroke-width="6" opacity=".6" stroke-linecap="round"/>
    ${quad([[0.82, 0.8, 104], [0.82, 2.9, 0], [0.82, 2.9, 8], [0.82, 0.8, 120]], '#5AAEA2')}
    ${seg([0.82, 0.8, 136], [0.82, 2.9, 20], TURQ, 5)}${seg([0.18, 0.8, 136], [0.18, 2.9, 20], TURQ, 5)}` }]);
};

const fountain = () => {
  const stone = shades('#E3E9F2'), stone2 = shades('#D2DAE6');
  const [x, y] = A(0.9, 0.9, 30), [px, py] = A(0.9, 0.9, 96);
  return isoItem(1.8, 1.8, 200, [{ w: 1.8, d: 1.8, svg: `
    ${shadow(0.9, 0.9, 0.98, 0.12)}
    ${cyl(0.9, 0.9, 0, 0.88, 30, stone2)}
    <ellipse cx="${x}" cy="${y}" rx="${0.74 * 90.5}" ry="${0.74 * 45.25}" fill="#8FC3F0" ${line}/>
    <ellipse cx="${x - 20}" cy="${y - 6}" rx="26" ry="5" fill="#fff" opacity=".45"/><ellipse cx="${x + 30}" cy="${y + 10}" rx="14" ry="3" fill="#fff" opacity=".4"/>
    ${cyl(0.9, 0.9, 30, 0.14, 50, stone)}
    ${cyl(0.9, 0.9, 80, 0.38, 12, stone)}
    <ellipse cx="${px}" cy="${py - 1}" rx="${0.3 * 90.5}" ry="${0.3 * 45.25}" fill="#AFD6F7"/>
    ${cyl(0.9, 0.9, 92, 0.07, 22, stone)}
    <path d="M${px} ${py - 18} q-16 4 -22 22 M${px} ${py - 18} q16 4 22 22" stroke="#AFD6F7" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/>
    <g class="water"><path d="M${px} ${py - 20} Q${px - 40} ${py - 110} ${px - 90} ${py + 50} M${px} ${py - 20} Q${px + 40} ${py - 110} ${px + 90} ${py + 50} M${px} ${py - 20} V${py - 100} M${px} ${py - 20} Q${px - 10} ${py - 96} ${px - 34} ${py + 60} M${px} ${py - 20} Q${px + 10} ${py - 96} ${px + 34} ${py + 60}" stroke="#8FC3F0" stroke-width="6" fill="none" stroke-linecap="round" opacity=".9"/>
      <circle cx="${px}" cy="${py - 104}" r="6" fill="#AFD6F7"/></g>` }]);
};

const blanket = () => isoItem(2.2, 1.6, 2, [{ w: 2.2, d: 1.6, svg: box({ u: 0, v: 0, w: 2.2, d: 1.6, h: 0, c: { top: CREAM },
  tl: `${Array.from({ length: 6 }, (_, i) => `<rect x="${0.1 + i * 0.36}" y="0" width=".18" height="1.6" fill="${TEAL}" opacity=".55"/>`).join('')}${Array.from({ length: 4 }, (_, j) => `<rect x="0" y="${0.1 + j * 0.38}" width="2.2" height=".19" fill="${TEAL}" opacity=".45"/>`).join('')}
    <rect x=".04" y=".04" width="2.12" height="1.52" fill="none" stroke="#fff" stroke-width=".03" stroke-dasharray=".08 .06"/>` }) }]);

const basket = () => {
  const wick = shades('#E0B07A');
  const [hx, hy] = A(0.45, 0.3, 34);
  return isoItem(0.9, 0.6, 70, [{ w: 0.9, d: 0.6, svg: `
    ${shadow(0.45, 0.3, 0.5)}
    ${box({ u: 0, v: 0, w: 0.9, d: 0.6, h: 30, c: wick,
      ll: `<path d="M0 10 H${0.9 * 64} M0 20 H${0.9 * 64}" stroke="#C99772" stroke-width="2.4"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${6 + i * 9} 2 V28" stroke="#C99772" stroke-width="1.4" opacity=".6"/>`).join('')}`,
      rl: '<path d="M0 10 H38 M0 20 H38" stroke="#C99772" stroke-width="2.4"/>' })}
    ${box({ u: -0.02, v: -0.02, z: 30, w: 0.94, d: 0.64, h: 5, c: shades('#9EDDD4'),
      tl: `${[0, 1, 2, 3].map((i) => `<rect x="${i * 0.24}" y="0" width=".12" height=".64" fill="#fff" opacity=".6"/>`).join('')}${[0, 1, 2].map((i) => `<rect x="0" y="${i * 0.24}" width=".94" height=".12" fill="#fff" opacity=".4"/>`).join('')}` })}
    <path d="M${hx - 26} ${hy + 6} Q${hx} ${hy - 34} ${hx + 26} ${hy - 6}" stroke="#C99772" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="${hx + 14}" cy="${hy - 6}" r="8" fill="${CORAL}" ${line}/><path d="M${hx + 14} ${hy - 14} q2 -5 6 -6" stroke="#4E9B5A" stroke-width="2" fill="none"/>` }]);
};

// A solid wooden box-bench: the star hidden underneath can't peek through.
const bench = () => {
  const wood = shades(WOOD), iron = shades('#4D5C9A'), seat = shades('#D9AC86');
  const slats = (n, len, gap = 9) => Array.from({ length: n }, (_, i) => `<path d="M0 ${7 + i * gap} H${len}" stroke="#A9835A" stroke-width="1.6" opacity=".7"/>`).join('');
  const board = (z) => box({ u: 0.05, v: 0.06, z, w: 1.9, d: 0.07, h: 10, c: seat });
  const arm = (u) => `<path d="M${A(u, 0.74, 42).join(' ')} Q${A(u, 0.78, 66).join(' ')} ${A(u, 0.5, 66).join(' ')} L${A(u, 0.14, 70).join(' ')}" stroke="#3E3252" stroke-opacity=".45" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M${A(u, 0.74, 42).join(' ')} Q${A(u, 0.78, 66).join(' ')} ${A(u, 0.5, 66).join(' ')} L${A(u, 0.14, 70).join(' ')}" stroke="#4D5C9A" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  return isoItem(2, 0.8, 110, [{ w: 2, d: 0.8, svg: `
    ${shadow(1, 0.45, 0.95, 0.12)}
    ${box({ u: 0.12, v: 0.04, w: 0.08, d: 0.08, h: 96, c: iron })}${box({ u: 1.8, v: 0.04, w: 0.08, d: 0.08, h: 96, c: iron })}
    ${board(42)}${board(58)}${board(74)}
    ${box({ u: 0.04, v: 0.14, w: 1.92, d: 0.62, h: 36, c: wood,
      ll: `${slats(3, 1.92 * 64)}<rect y="30" width="${1.92 * 64}" height="6" fill="#4D5C9A"/>`, rl: `${slats(3, 0.62 * 64)}<rect y="30" width="${0.62 * 64}" height="6" fill="#4D5C9A"/>` })}
    ${box({ u: 0, v: 0.1, z: 36, w: 2, d: 0.72, h: 6, c: seat, tl: '<path d="M0 .26 H2 M0 .5 H2" stroke="#A9835A" stroke-width=".025"/>' })}
    ${arm(0.08)}${arm(1.92)}` }]);
};

const dogArt = () => {
  const [x, y] = A(0.35, 0.35);
  const fur = '#F0C27A', ear = '#C99772';
  return isoItem(0.7, 0.7, 80, [{ w: 0.7, d: 0.7, svg: `
    <ellipse cx="${x}" cy="${y}" rx="38" ry="12" fill="#3E3252" opacity=".13"/>
    <path class="tail" d="M${x + 26} ${y - 34} Q${x + 42} ${y - 50} ${x + 36} ${y - 62}" fill="none" stroke="#3E3252" stroke-width="8" stroke-linecap="round" opacity=".55"/>
    <path class="tail" d="M${x + 26} ${y - 34} Q${x + 42} ${y - 50} ${x + 36} ${y - 62}" fill="none" stroke="${fur}" stroke-width="5" stroke-linecap="round"/>
    <rect x="${x + 10}" y="${y - 22}" width="10" height="22" rx="5" fill="${ear}" ${line}/>
    <ellipse cx="${x + 6}" cy="${y - 30}" rx="28" ry="17" fill="${fur}" ${line}/>
    <rect x="${x - 10}" y="${y - 20}" width="10" height="22" rx="5" fill="${fur}" ${line}/><rect x="${x + 16}" y="${y - 18}" width="10" height="20" rx="5" fill="${fur}" ${line}/>
    <circle cx="${x - 20}" cy="${y - 48}" r="19" fill="${fur}" ${line}/>
    <path d="M${x - 36} ${y - 60} Q${x - 46} ${y - 46} ${x - 38} ${y - 34} Q${x - 30} ${y - 42} ${x - 30} ${y - 54} Z M${x - 8} ${y - 62} Q${x + 2} ${y - 50} ${x - 4} ${y - 38} Q${x - 12} ${y - 44} ${x - 12} ${y - 56} Z" fill="${ear}" ${line}/>
    <circle cx="${x - 26}" cy="${y - 50}" r="2.6" fill="#3E3252"/><circle cx="${x - 14}" cy="${y - 50}" r="2.6" fill="#3E3252"/>
    <ellipse cx="${x - 20}" cy="${y - 42}" rx="4.4" ry="3.2" fill="#3E3252"/>
    <rect x="${x - 34}" y="${y - 34}" width="26" height="6" rx="3" fill="${LILAC}" ${line}/>` }]);
};

const kiteArt = () => {
  const [x, y] = A(0.4, 0.4);
  const kx = x + 34, ky = y - 300;
  return isoItem(0.8, 0.8, 340, [{ w: 0.8, d: 0.8, svg: `
    <ellipse cx="${x}" cy="${y}" rx="8" ry="4" fill="#3E3252" opacity=".18"/><path d="M${x} ${y} v-10" stroke="#8B6450" stroke-width="4" stroke-linecap="round"/>
    <path d="M${x} ${y - 8} Q${x + 40} ${y - 140} ${kx} ${ky + 50}" stroke="#3E3252" stroke-width="1.4" fill="none" opacity=".7"/>
    <path d="M${kx} ${ky - 40} L${kx + 34} ${ky} L${kx} ${ky + 50} L${kx - 34} ${ky} Z" fill="${SUN}" ${line}/>
    <path d="M${kx} ${ky - 40} L${kx + 34} ${ky} L${kx} ${ky} Z M${kx} ${ky} L${kx - 34} ${ky} L${kx} ${ky + 50} Z" fill="${LILAC}"/>
    <path d="M${kx} ${ky - 40} V${ky + 50} M${kx - 34} ${ky} H${kx + 34}" stroke="#3E3252" stroke-width="1.6" opacity=".7"/>
    <path d="M${kx} ${ky + 50} Q${kx - 16} ${ky + 66} ${kx + 4} ${ky + 78} Q${kx + 20} ${ky + 90} ${kx} ${ky + 104}" stroke="#3E3252" stroke-width="1.8" fill="none"/>
    <path d="M${kx - 6} ${ky + 64} l9 4 -9 4 z M${kx - 2} ${ky + 86} l9 4 -9 4 z" fill="#9EDDD4"/>` }]);
};

const flowerArt = (color) => () => {
  const [x, y] = A(0.25, 0.25);
  const heads = [[-10, -40, 1], [10, -32, 0.85], [0, -24, 0.7]];
  return isoItem(0.5, 0.5, 60, [{ w: 0.5, d: 0.5, svg: `
    <ellipse cx="${x}" cy="${y}" rx="20" ry="7" fill="#3E3252" opacity=".12"/>
    ${heads.map(([dx, dy]) => `<path d="M${x} ${y} Q${x + dx * 0.4} ${y + dy * 0.5} ${x + dx} ${y + dy}" stroke="#4E9B5A" stroke-width="2.6" fill="none"/>`).join('')}
    <path d="M${x} ${y} Q${x - 16} ${y - 10} ${x - 18} ${y - 4} Q${x - 8} ${y + 2} ${x} ${y} Z M${x} ${y} Q${x + 14} ${y - 12} ${x + 18} ${y - 6} Q${x + 8} ${y + 2} ${x} ${y} Z" fill="${LEAF}" ${line}/>
    ${heads.map(([dx, dy, s]) => `${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="${x + dx + Math.cos((a * Math.PI) / 180) * 6 * s}" cy="${y + dy + Math.sin((a * Math.PI) / 180) * 4 * s}" rx="${5.5 * s}" ry="${4.4 * s}" fill="${color}" ${line}/>`).join('')}<circle cx="${x + dx}" cy="${y + dy}" r="${3.4 * s}" fill="${SUN}" ${line}/>`).join('')}` }]);
};
const flower = (id, gx, gy, color) => I(id, gx, gy, 0.5, 0.5, flowerArt(color), { small: true, onTap: (it, api) => api.sparkle(it.x + it.w / 2, it.y + 20, ['🌸', '✨', '🌼']) });

const lamp = (it) => {
  const on = it?.data.on;
  const [x, y] = A(0.25, 0.25, 150);
  return isoItem(0.5, 0.5, 175, [{ w: 0.5, d: 0.5, svg: `
    ${shadow(0.25, 0.25, 0.2)}
    ${cyl(0.25, 0.25, 0, 0.12, 10, shades('#4D5C9A'))}${cyl(0.25, 0.25, 10, 0.035, 136, shades('#4D5C9A'))}
    ${on ? `<circle cx="${x}" cy="${y - 4}" r="44" fill="#FFF3B0" opacity=".35"/>` : ''}
    <path d="M${x - 14} ${y + 6} L${x - 10} ${y - 18} H${x + 10} L${x + 14} ${y + 6} Z" fill="${on ? '#FFF0A0' : '#E8EEF7'}" ${line}/>
    <path d="M${x - 18} ${y - 18} L${x} ${y - 30} L${x + 18} ${y - 18} Z" fill="#4D5C9A" ${line}/>` }]);
};

const bush = (s) => () => {
  const [x, y] = A(0.4, 0.4);
  return isoItem(0.8, 0.8, 80 * s, [{ w: 0.8, d: 0.8, svg: `${shadow(0.4, 0.4, 0.45)}
    ${blob(x - 18 * s, y - 20 * s, 24 * s, LEAF_D)}${blob(x + 18 * s, y - 22 * s, 22 * s, LEAF_D)}${blob(x, y - 36 * s, 28 * s, LEAF)}${blob(x - 4 * s, y - 14 * s, 20 * s, LEAF_L)}
    <circle cx="${x - 10 * s}" cy="${y - 44 * s}" r="${4 * s}" fill="${LILAC}"/><circle cx="${x + 14 * s}" cy="${y - 30 * s}" r="${4 * s}" fill="${SUN}"/>` }]);
};

const pondArt = () => {
  const [x, y] = A(0.8, 0.6);
  const [dx, dy] = [x + 22, y - 4];
  return isoItem(1.6, 1.2, 40, [{ w: 1.6, d: 1.2, svg: `
    <ellipse cx="${x}" cy="${y}" rx="${0.78 * 90.5}" ry="${0.6 * 45.25 * 1.3}" fill="#E2D9CC" ${line}/>
    <ellipse cx="${x}" cy="${y + 2}" rx="${0.7 * 90.5}" ry="${0.52 * 45.25 * 1.3}" fill="#8FC3F0" ${line}/>
    <ellipse cx="${x - 30}" cy="${y - 4}" rx="22" ry="4" fill="#fff" opacity=".45"/>
    ${[[-34, 10], [-8, 18], [30, 12]].map(([ox, oy]) => `<path d="M${x + ox} ${y + oy} m-11 0 a11 6 0 1 0 22 0 l-11 -1 z" fill="${LEAF}" ${line}/>`).join('')}
    <circle cx="${x - 8}" cy="${y + 15}" r="3.4" fill="${LILAC}"/>
    <ellipse cx="${dx}" cy="${dy}" rx="13" ry="7" fill="${CREAM}" ${line}/><circle cx="${dx + 9}" cy="${dy - 9}" r="6" fill="${CREAM}" ${line}/><path d="M${dx + 14} ${dy - 9} l6 2 -6 2 z" fill="${SUN}"/><circle cx="${dx + 10}" cy="${dy - 10}" r="1.3" fill="#3E3252"/>
    ${[[-58, -6], [-52, 4], [54, -10]].map(([ox, oy]) => `<path d="M${x + ox} ${y + oy} v-16 M${x + ox + 3} ${y + oy} v-12" stroke="#4E9B5A" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="${x + ox}" cy="${y + oy - 18}" rx="2.6" ry="5" fill="#8B6450"/>`).join('')}` }]);
};

const binArt = () => isoItem(0.5, 0.5, 70, [{ w: 0.5, d: 0.5, svg: `${shadow(0.25, 0.25, 0.22)}
  ${cyl(0.25, 0.25, 0, 0.16, 44, shades(TURQ))}${cyl(0.25, 0.25, 44, 0.18, 6, shades('#4D5C9A'))}
  ${(() => { const [x, y] = A(0.25, 0.25, 22); return `<path d="M${x - 6} ${y - 6} l6 -8 l6 8 M${x + 6} ${y + 4} h-12" stroke="#fff" stroke-width="2.4" fill="none" opacity=".8"/>`; })()}` }]);

export const PARK = {
  id: 'park', posKey: 'park-iso', title: 'Park 🌳', weather: true, outdoor: true, light: 'outdoor', avatar: [4.6, 3.4],
  frame: (w) => (w === 'sun' ? 'linear-gradient(#A9DCFF, #E8F6E6)' : 'linear-gradient(#97A5BC, #CDD4DF)'),
  iso: R,
  bg,
  stars: [{ id: 'park-bench', gx: 8.4, gy: 6.8 }],
  characters: [{ id: 'nora', look: NPC.nora, gx: 6.6, gy: 2.0, say: ["Hi! I'm Nora 🌼", 'Have you tried the swings?', 'I heard a bird in the big tree! 🐦'] }],
  init: (api) => { for (const it of api.items.values()) if (it.def.thru) it.el.style.pointerEvents = 'none'; },
  items: [
    I('blanket', 1.8, 6.2, 2.2, 1.6, blanket, { floor: true }),
    I('tree', 0.3, 7.6, 2, 2, tree, { drag: false, thru: true, data: { taps: 0 },
      onTap: (it, api) => {
        it.data.taps++;
        it.el.classList.remove('shake'); void it.el.offsetWidth; it.el.classList.add('shake');
        api.sparkle(it.x + it.w / 2, it.y + 120, ['🍃', '🍃', '🌿']);
        if (it.data.taps === 3) {
          api.bubble(it.x + it.w / 2, it.y + 30, 'Tweet tweet! 🐦');
          if (!api.starFound('park-nest')) api.addStar('park-nest', 0, 0, { spawned: true, gx: it.gx + NEST[0] - 0.2, gy: it.gy + NEST[1] - 0.2, gz: NEST[2] + 26 });
        } else if (it.data.taps < 3) api.bubble(it.x + it.w / 2, it.y + 30, 'Something is up there...');
      } }),
    I('swing', 2.6, 0.4, 2.6, 1, swing, { drag: false, thru: true, zBias: -30,
      onTap: (it, api) => { it.el.classList.remove('swinging'); void it.el.offsetWidth; it.el.classList.add('swinging'); api.bubble(it.x + it.w / 2, it.y + 20, 'Wheee! 🎶'); } }),
    I('slide', 8.6, 0.3, 1, 3.2, slide, { drag: false, thru: true, zBias: -50,
      onTap: (it, api) => { api.bubble(it.x + it.w / 2, it.y + 20, 'Wheeeee! 🛝'); const [x, y] = proj(R, it.gx + 0.5, it.gy + 3.1); api.sparkle(x, y - 20, ['💨', '✨']); api.sfx.boing(); } }),
    I('fountain', 5.5, 4.3, 1.8, 1.8, fountain, { drag: false, thru: true,
      onTap: (it, api) => { it.el.classList.add('spray'); api.sfx.pour(); api.later(() => it.el.classList.remove('spray'), 2000); api.later(() => api.sparkle(it.x + it.w / 2, it.y + 60, ['💧', '💦']), 300); } }),
    I('basket', 2.4, 6.5, 0.9, 0.6, basket, { drag: false, data: { n: 0 },
      onTap: (it, api) => {
        if (api.count('sandwich') + api.count('juice') + api.count('apple') >= 3) { api.bubble(it.x + it.w / 2, it.y, 'Share the snacks first! 🧺'); return; }
        const kind = ['sandwich', 'juice', 'apple'][it.data.n++ % 3];
        food(api, kind, 0, 0, { gx: it.gx + 0.2 + (it.data.n % 3) * 0.45, gy: it.gy + 0.9 });
      } }),
    I('bench', 7.6, 6.4, 2, 0.8, bench, { zBias: -20 }),
    I('dog', 6.2, 7.6, 0.7, 0.7, dogArt, { cls: 'squish',
      onTap: (it, api) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y + 10, ['Woof! 🐶', 'Arf arf!', '*wags tail*'][Math.floor(Math.random() * 3)]); } }),
    I('kite', 9.4, 4.4, 0.8, 0.8, kiteArt, { cls: 'kite',
      onTap: (it, api) => { api.bubble(it.x + it.w / 2 + 30, it.y, 'Up, up and away! 🪁'); it.el.classList.remove('fly'); void it.el.offsetWidth; it.el.classList.add('fly'); } }),
    I('lamp1', 3.4, 4.0, 0.5, 0.5, lamp, { drag: false, data: { on: false }, onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); } }),
    I('lamp2', 7.4, 8.6, 0.5, 0.5, lamp, { drag: false, data: { on: false }, onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); } }),
    I('bush1', 10.0, 7.6, 0.8, 0.8, bush(1.1), { drag: false }),
    I('bush2', 1.6, 0.4, 0.8, 0.8, bush(0.9), { drag: false }),
    I('bush3', 9.6, 9.0, 0.8, 0.8, bush(0.8), { drag: false }),
    I('pond', 2.5, 8.6, 1.6, 1.2, pondArt, { floor: true, drag: false,
      onTap: (it, api) => { api.bubble(it.x + it.w / 2, it.y, ['Quack! 🦆', 'Splish splash! 💦', 'Ducky says hi!'][Math.floor(Math.random() * 3)]); api.sparkle(it.x + it.w / 2, it.y + it.h / 2, ['💧', '✨']); } }),
    I('bin', 6.8, 9.3, 0.5, 0.5, binArt, { drag: false, onTap: (it, api) => { api.bubble(it.x + it.w / 2, it.y, 'Keep the park tidy! ♻️'); api.sfx.click(); } }),
    flower('flower1', 1.7, 2.0, '#C9B8F2'),
    flower('flower2', 1.9, 3.0, '#9EDDD4'),
    flower('flower3', 1.6, 4.0, SUN),
  ],
};
