// Winter Market — an isometric snowy diorama (Unpacking-style): three wooden stalls round a cobbled plaza.
// Knitwear stall (try on puffer jackets, grab beanies/scarves/earmuffs), gingerbread stall (decorate your own cookie),
// cocoa & gifts stall (cocoa pot, snow globe), a gift crate hiding a star, a reindeer and Juno.
import { room, groundShell, floorPoly, isoItem, at, shades, proj, isoDef } from '../iso.js';
import { INK, svg, text, starPath, wearable, food, NPC_WINTER } from './common.js';
import { CLIMATES } from '../ui.js';

const R = room({ cols: 10, rows: 8, ox: 736, oy: 248, wallH: 0 });
R.charScale = 0.55;

const WOOD = '#C99A6C', WOOD_L = '#E2C29C', WOOD_D = '#A87A5A', BARK = '#8B6450', CREAM = '#FBF7EF', SNOW = '#F8FAFF';
const LILAC = '#B79CF0', TEAL = '#7FCFC4', SKY = '#9CC8EE', SUN = '#F5DE7A', PINE = '#4E9B7A', IRON = '#5E5A86', GINGER = '#C98A52';
const PAL = [LILAC, TEAL, SUN, SKY];
const BULBS = [SUN, '#9EDDD4', '#C9B8F2', '#8FC3F0', '#FFFFFF'];
const LN = 'stroke="#3E3252" stroke-opacity=".55" stroke-width="1.6" stroke-linejoin="round"';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4"';
const f1 = (n) => +n.toFixed(1);
const P = (a) => a.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ');
const XY = ([x, y]) => `${f1(x)} ${f1(y)}`;

// ---------- tiny drawing kit (drawn in order, so every part sits exactly where we want it) ----------
function box({ u = 0, v = 0, z = 0, w, d, h, top, left, right, topDecor = '', leftDecor = '', rightDecor = '' }) {
  const bx = (u - v) * 64, by = (u + v) * 32 - z;
  const B = [bx, by], Rr = [bx + w * 64, by + w * 32], F = [bx + (w - d) * 64, by + (w + d) * 32], L = [bx - d * 64, by + d * 32];
  const up = ([x, y]) => [x, y - h];
  let s = '';
  if (h > 0) {
    s += `<polygon points="${P([L, F, up(F), up(L)])}" fill="${left}" ${LN}/>`;
    if (leftDecor) s += `<g transform="matrix(1,0.5,0,1,${f1(L[0])},${f1(L[1] - h)})">${leftDecor}</g>`;
    s += `<polygon points="${P([F, Rr, up(Rr), up(F)])}" fill="${right}" ${LN}/>`;
    if (rightDecor) s += `<g transform="matrix(1,-0.5,0,1,${f1(F[0])},${f1(F[1] - h)})">${rightDecor}</g>`;
  }
  s += `<polygon points="${P([up(B), up(Rr), up(F), up(L)])}" fill="${top}" ${LN}/>`;
  if (topDecor) s += `<g transform="matrix(64,32,-64,32,${f1(B[0])},${f1(B[1] - h)})">${topDecor}</g>`;
  return s;
}
// Upright cylinder standing at (cx, cy) in item pixels.
function cyl(cx, cy, rx, h, col, top = shades(col).top) {
  const ry = rx / 2, t = cy - h;
  return `<path d="M${f1(cx - rx)} ${f1(t)} V${f1(cy)} A${rx} ${ry} 0 0 0 ${f1(cx + rx)} ${f1(cy)} V${f1(t)} Z" fill="${col}" ${LN}/>
    <path d="M${f1(cx + rx * 0.35)} ${f1(t + ry * 0.94)} V${f1(cy + ry * 0.94)} A${rx} ${ry} 0 0 0 ${f1(cx + rx)} ${f1(cy)} V${f1(t)} A${rx} ${ry} 0 0 1 ${f1(cx + rx * 0.35)} ${f1(t + ry * 0.94)} Z" fill="#3E3252" opacity=".12"/>
    <ellipse cx="${f1(cx)}" cy="${f1(t)}" rx="${rx}" ry="${ry}" fill="${top}" ${LN}/>`;
}
const item = (fw, fd, h, body) => isoItem(fw, fd, h, [{ svg: body, u: 0, v: 0, w: 0, d: 0 }]);
const planeL = (u, v, z, body) => { const [x, y] = at(u, v, z); return `<g transform="matrix(1,0.5,0,1,${f1(x)},${f1(y)})">${body}</g>`; };
const planeR = (u, v, z, body) => { const [x, y] = at(u, v, z); return `<g transform="matrix(1,-0.5,0,1,${f1(x)},${f1(y)})">${body}</g>`; };
const shadow = (cx, cy, rx, ry = rx / 2.4) => `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${rx}" ry="${f1(ry)}" fill="#3E3252" opacity=".13"/>`;
const flake = (x, y, r, col) => `<path d="M${x - r} ${y}H${x + r}M${f1(x - r / 2)} ${f1(y - r * 0.87)}L${f1(x + r / 2)} ${f1(y + r * 0.87)}M${f1(x - r / 2)} ${f1(y + r * 0.87)}L${f1(x + r / 2)} ${f1(y - r * 0.87)}" stroke="${col}" stroke-width="2" stroke-linecap="round"/>`;
const zig = (x0, x1, y, a, step) => { let d = `M${x0} ${y}`; for (let x = x0 + step, k = 1; x <= x1; x += step, k++) d += ` L${f1(x)} ${k % 2 ? y - a : y}`; return d; };
const bulb = (x, y, c) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="9" fill="${c}" opacity=".38"/><rect x="${f1(x - 2)}" y="${f1(y - 7)}" width="4" height="3" fill="${IRON}"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="3.6" ry="5" fill="${c}" ${line}/>`;

// A snowy pine (also the decorated market tree) drawn round a trunk foot at (cx, cy).
function tree(cx, cy, s, deco = false) {
  let o = `<rect x="${f1(cx - 7 * s)}" y="${f1(cy - 36 * s)}" width="${f1(14 * s)}" height="${f1(36 * s)}" fill="${BARK}" ${LN}/>`;
  for (let k = 0; k < 4; k++) {
    const yb = cy - (28 + k * 40) * s, hw = (70 - k * 14) * s, ht = 66 * s;
    o += `<path d="M${f1(cx - hw)} ${f1(yb)} Q${f1(cx)} ${f1(yb + 16 * s)} ${f1(cx + hw)} ${f1(yb)} L${f1(cx)} ${f1(yb - ht)} Z" fill="${PINE}" ${LN}/>
      <path d="M${f1(cx)} ${f1(yb - ht)} L${f1(cx + hw)} ${f1(yb)} Q${f1(cx + hw / 2)} ${f1(yb + 11 * s)} ${f1(cx)} ${f1(yb + 8 * s)} Z" fill="#1F4A3A" opacity=".2"/>
      <path d="M${f1(cx - hw * 0.94)} ${f1(yb - 2 * s)} Q${f1(cx - hw * 0.5)} ${f1(yb + 11 * s)} ${f1(cx)} ${f1(yb + 6 * s)} Q${f1(cx + hw * 0.45)} ${f1(yb + 11 * s)} ${f1(cx + hw * 0.75)} ${f1(yb - 3 * s)} Q${f1(cx + hw * 0.3)} ${f1(yb - 11 * s)} ${f1(cx)} ${f1(yb - 7 * s)} Q${f1(cx - hw * 0.5)} ${f1(yb - 13 * s)} ${f1(cx - hw * 0.94)} ${f1(yb - 2 * s)} Z" fill="${SNOW}"/>`;
    if (deco) {
      o += `<path d="M${f1(cx - hw * 0.7)} ${f1(yb - 24 * s)} Q${f1(cx)} ${f1(yb - 8 * s)} ${f1(cx + hw * 0.62)} ${f1(yb - 28 * s)}" stroke="${SUN}" stroke-width="${f1(2.6 * s)}" fill="none"/>`;
      [-0.6, 0.05, 0.55].forEach((t, i) => { o += `<circle cx="${f1(cx + hw * t)}" cy="${f1(yb + (i === 1 ? 7 : 3) * s)}" r="${f1(5.5 * s)}" fill="${PAL[(i + k) % 4]}" ${line}/>`; });
    }
  }
  const ap = cy - 214 * s;
  o += `<path d="M${f1(cx - 9 * s)} ${f1(ap + 14 * s)} Q${f1(cx)} ${f1(ap - 4 * s)} ${f1(cx + 9 * s)} ${f1(ap + 14 * s)} Q${f1(cx)} ${f1(ap + 9 * s)} ${f1(cx - 9 * s)} ${f1(ap + 14 * s)} Z" fill="${SNOW}"/>`;
  if (deco) o += starPath(f1(cx), f1(ap - 6 * s), f1(15 * s), SUN, LN);
  return o;
}

// ---------- background: dusk sky, little town, floating snow slab, cobbled plaza ----------
const house = (x, y, w, h, col, roof, lit, smoke) => `<g transform="translate(${x} ${y})">
  <rect x="0" y="${-h}" width="${w}" height="${h}" fill="${col}"/>
  ${smoke ? `<path class="steam" d="M${w * 0.74} ${-h - w * 0.5} q-6 -10 0 -20 q6 -10 0 -20" stroke="#fff" stroke-opacity=".55" stroke-width="5" fill="none" stroke-linecap="round"/>` : ''}
  <rect x="${w * 0.66}" y="${-h - w * 0.44}" width="${w * 0.14}" height="${w * 0.3}" fill="${col}"/>
  <path d="M-6 ${-h + 2} L${w / 2} ${-h - w * 0.52} L${w + 6} ${-h + 2} Z" fill="${roof}"/>
  <path d="M-6 ${-h + 2} L${w / 2} ${-h - w * 0.52} L${w + 6} ${-h + 2}" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
  ${[0.22, 0.6].map((t) => `<rect x="${w * t}" y="${-h * 0.72}" width="${w * 0.18}" height="${h * 0.3}" rx="2" fill="${lit ? '#FFE9A0' : '#C9C3E6'}"/>${lit ? `<circle cx="${w * t + w * 0.09}" cy="${-h * 0.57}" r="${w * 0.2}" fill="#FFE9A0" opacity=".25"/>` : ''}`).join('')}
</g>`;

function snowLip() {
  const L = proj(R, 0, R.rows), F = proj(R, R.cols, R.rows), Rr = proj(R, R.cols, 0);
  const band = (A, B) => {
    let s = `<polygon points="${P([A, B, [B[0], B[1] + 10], [A[0], A[1] + 10]])}"/>`;
    const n = Math.round(Math.hypot(B[0] - A[0], B[1] - A[1]) / 24);
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = A[0] + (B[0] - A[0]) * t, y = A[1] + (B[1] - A[1]) * t;
      s += `<circle cx="${f1(x)}" cy="${f1(y + 9)}" r="${6 + ((i * 7) % 5)}"/>`;
      if (i % 3 === 1) s += `<path d="M${f1(x - 3)} ${f1(y + 13)} L${f1(x)} ${f1(y + 24 + (i % 2) * 7)} L${f1(x + 3)} ${f1(y + 13)} Z" fill="#E1ECFA"/>`;
    }
    return s;
  };
  return `<g fill="${SNOW}">${band(L, F)}${band(F, Rr)}</g>`;
}
const drift = (gx, gy, s = 1) => { const [x, y] = proj(R, gx, gy); return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${46 * s}" ry="${18 * s}" fill="#FFFFFF"/><ellipse cx="${f1(x - 10 * s)}" cy="${f1(y - 4 * s)}" rx="${22 * s}" ry="${7 * s}" fill="#fff" opacity=".9"/><path d="M${f1(x - 40 * s)} ${f1(y + 6 * s)} Q${f1(x)} ${f1(y + 18 * s)} ${f1(x + 40 * s)} ${f1(y + 6 * s)}" stroke="#D5DFF2" stroke-width="2" fill="none"/>`; };
const steps = (pts) => pts.map(([gx, gy], i) => { const [x, y] = proj(R, gx, gy); return `<ellipse cx="${f1(x + (i % 2 ? 7 : -7))}" cy="${f1(y)}" rx="5" ry="3" fill="#D3DCEF"/>`; }).join('');

const bg = (w) => {
  const snow = w.weather === 'snow';
  const tile = `patternUnits="userSpaceOnUse" patternTransform="matrix(64,32,-64,32,${R.ox},${R.oy})"`;
  const L = [proj(R, 0, R.rows), proj(R, R.cols, R.rows)];
  const [lgx, lgy] = proj(R, 9.45, 4.8);
  return svg(1600, 900, `
  <defs>
    <linearGradient id="mk-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${snow ? '#8E93B8' : '#6E78C2'}"/><stop offset=".42" stop-color="${snow ? '#B2B2D2' : '#A99BDF'}"/>
      <stop offset=".62" stop-color="${snow ? '#D3D0E4' : '#E9D7B8'}"/><stop offset="1" stop-color="${snow ? '#E4E3EF' : '#F8ECC6'}"/></linearGradient>
    <radialGradient id="mk-sun"><stop offset="0" stop-color="#FFF6CF"/><stop offset=".45" stop-color="#F8E39A" stop-opacity=".55"/><stop offset="1" stop-color="#F8E39A" stop-opacity="0"/></radialGradient>
    <radialGradient id="mk-lamp"><stop offset="0" stop-color="#FFE9A0" stop-opacity=".55"/><stop offset="1" stop-color="#FFE9A0" stop-opacity="0"/></radialGradient>
    <linearGradient id="mk-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${snow ? '#E2E2EE' : '#F3E9D2'}" stop-opacity="0"/><stop offset=".35" stop-color="#E7E1F3"/><stop offset="1" stop-color="#D2C8EC"/></linearGradient>
    <pattern id="mk-cob" width=".5" height=".5" ${tile}>
      <rect width=".5" height=".5" fill="#BDB9D8"/>
      <rect x=".02" y=".02" width=".21" height=".21" rx=".07" fill="#D8D5EC"/><rect x=".27" y=".02" width=".21" height=".21" rx=".07" fill="#CCC8E4"/>
      <rect x=".02" y=".27" width=".21" height=".21" rx=".07" fill="#D1CEE8"/><rect x=".27" y=".27" width=".21" height=".21" rx=".07" fill="#DCDAEE"/>
      <circle cx=".09" cy=".07" r=".03" fill="#fff" opacity=".9"/><circle cx=".38" cy=".35" r=".025" fill="#fff" opacity=".8"/></pattern>
    <pattern id="mk-sn" width="1" height="1" ${tile}>
      <circle cx=".2" cy=".3" r=".028" fill="#C6D3EE"/><circle cx=".72" cy=".62" r=".022" fill="#C6D3EE"/><circle cx=".5" cy=".12" r=".02" fill="#fff"/><circle cx=".86" cy=".2" r=".018" fill="#D6E0F3"/></pattern>
  </defs>
  <rect width="1600" height="900" fill="url(#mk-sky)"/>
  ${snow
    ? `<g fill="#C9C9DD" opacity=".8"><ellipse cx="260" cy="110" rx="260" ry="46"/><ellipse cx="900" cy="70" rx="300" ry="44"/><ellipse cx="1420" cy="140" rx="240" ry="40"/></g>
       <g fill="#DADAE8" opacity=".8"><ellipse cx="420" cy="150" rx="200" ry="30"/><ellipse cx="1180" cy="100" rx="220" ry="30"/></g>`
    : `<circle cx="1330" cy="430" r="230" fill="url(#mk-sun)"/><circle cx="1330" cy="440" r="46" fill="#FFF4C8" opacity=".9"/>
       <g fill="#FFF8D6">${Array.from({ length: 26 }, (_, i) => `<circle class="twinkle-s" style="animation-delay:-${(i % 6) * 0.5}s" cx="${(i * 263) % 1600}" cy="${(i * 71) % 230 + 14}" r="${1 + (i % 3) * 0.7}"/>`).join('')}</g>
       <path d="M210 92 a40 40 0 1 0 34 62 a32 32 0 1 1 -34 -62 z" fill="#FFF6D2"/>`}
  <path d="M-20 520 L120 380 L230 450 L360 330 L520 470 L700 400 L900 470 L1080 350 L1230 440 L1380 340 L1520 430 L1640 380 V620 H-20 Z" fill="${snow ? '#ABACCB' : '#A898D8'}"/>
  <path d="M120 380 L150 410 L132 416 L104 398 Z M360 330 L396 370 L370 378 L336 352 Z M1080 350 L1116 390 L1090 398 L1056 372 Z M1380 340 L1414 378 L1390 386 L1358 362 Z" fill="#fff" opacity=".9"/>
  <path d="M-20 560 Q160 470 360 520 T760 500 T1180 510 T1640 490 V700 H-20 Z" fill="${snow ? '#C4C3DC' : '#C2B5E6'}"/>
  ${house(30, 530, 70, 56, '#D9CFF2', '#9C88D8', true, !snow)}${house(118, 520, 56, 46, '#CFE8EE', '#7FB8C4', true, false)}${house(190, 540, 64, 60, '#F2E9C8', '#B9A06A', !snow, true)}
  ${house(1240, 512, 62, 52, '#CFE8EE', '#7FB8C4', true, !snow)}${house(1320, 524, 74, 62, '#D9CFF2', '#9C88D8', true, true)}${house(1410, 506, 58, 48, '#F2E9C8', '#B9A06A', true, false)}${house(1490, 528, 70, 58, '#DCEAF8', '#8FB2DC', !snow, !snow)}
  <rect y="560" width="1600" height="340" fill="url(#mk-mist)"/>
  <g fill="#fff" opacity=".75"><ellipse cx="120" cy="760" rx="170" ry="40"/><ellipse cx="300" cy="830" rx="150" ry="34"/><ellipse cx="1430" cy="770" rx="180" ry="42"/><ellipse cx="1260" cy="850" rx="150" ry="32"/><ellipse cx="860" cy="890" rx="260" ry="30"/></g>
  ${groundShell(R, { top: '#F1F5FD', pattern: 'mk-sn', sideL: '#B98A5E', sideR: '#A27650', layer: '#8B6450', depth: 46, edge: '#FFFFFF' })}
  ${snowLip()}
  <polyline points="${P(L)}" fill="none" stroke="#fff" stroke-width="2"/>
  ${floorPoly(R, [[1.6, 1.7], [9.0, 1.7], [9.5, 2.2], [9.5, 6.6], [9.0, 7.2], [2.2, 7.2], [1.6, 6.6]], 'fill="#B3AFD0" stroke="#B3AFD0" stroke-width="16" stroke-linejoin="round"')}
  ${floorPoly(R, [[1.6, 1.7], [9.0, 1.7], [9.5, 2.2], [9.5, 6.6], [9.0, 7.2], [2.2, 7.2], [1.6, 6.6]], 'fill="url(#mk-cob)"')}
  ${floorPoly(R, [[4.3, 7.0], [5.6, 7.0], [5.8, 8], [4.2, 8]], 'fill="url(#mk-cob)" stroke="#B3AFD0" stroke-width="4" stroke-linejoin="round"')}
  ${floorPoly(R, [[9.3, 3.5], [10, 3.4], [10, 4.7], [9.3, 4.6]], 'fill="url(#mk-cob)" stroke="#B3AFD0" stroke-width="4" stroke-linejoin="round"')}
  <ellipse cx="${f1(lgx)}" cy="${f1(lgy)}" rx="150" ry="70" fill="url(#mk-lamp)"/>
  ${drift(0.6, 1.2, 1.1)}${drift(4.7, 0.4, 0.8)}${drift(9.4, 1.3, 0.9)}${drift(0.5, 4.4, 0.8)}${drift(1.2, 7.6, 1)}${drift(9.6, 7.6, 1)}${drift(7.2, 7.7, 0.7)}${drift(2.0, 1.75, 0.6)}${drift(9.2, 2.1, 0.6)}${drift(1.75, 7.0, 0.6)}
  ${steps([[3.4, 7.9], [3.5, 7.6], [3.7, 7.35], [6.3, 7.85], [6.5, 7.55], [6.8, 7.3]])}`);
};

// ---------- stalls: back wall with shelves, counter (a surface), posts, striped snowy awning, sign ----------
// side 'L' = the stall stands along the back-right edge and faces you; 'R' = along the back-left edge.
function stall({ side, len, dep, color, title, panel, front }) {
  const Ls = side === 'L';
  const map = (a, d, la, ld) => (Ls ? { u: a, v: d, w: la, d: ld } : { u: d, v: len - a - la, w: ld, d: la });
  const dec = (s) => (Ls ? { leftDecor: s } : { rightDecor: s });
  const pt = (a, d, z) => (Ls ? at(a, d, z) : at(d, len - a, z));
  const face = (a, d, z, body) => { const [x, y] = pt(a, d, z); return `<g transform="matrix(1,${Ls ? 0.5 : -0.5},0,1,${f1(x)},${f1(y)})">${body}</g>`; };
  const W = len * 64, CH = 64, TOP = CH + 8, ZB = 222, DF = dep - 0.32, ZF = 176;
  const zAt = (d) => ZB + (ZF - ZB) * (d + 0.06) / (DF + 0.06);
  const A0 = -0.08, A1 = len + 0.08, n = Math.max(4, Math.round(len / 0.42)), sw = (A1 - A0) / n;
  let s = `<polygon points="${P([pt(-0.12, -0.06, 0), pt(len + 0.18, -0.06, 0), pt(len + 0.18, dep + 0.16, 0), pt(-0.12, dep + 0.16, 0)])}" fill="#3E3252" opacity=".08"/>`;
  s += box({ ...map(0, 0, len, 0.12), h: ZB, ...shades(CREAM, 0.6), ...dec(panel(W, ZB)) });
  s += box({ ...map(0, 0.12, len, dep - 0.12), h: CH, ...shades(WOOD_L), ...dec(front(W, CH)) });
  s += box({ ...map(-0.05, 0.08, len + 0.1, dep - 0.02), z: CH, h: 8, ...shades(WOOD) });
  const pd = DF - 0.16;
  for (const a of [0.02, len - 0.12]) s += box({ ...map(a, pd, 0.1, 0.1), z: TOP, h: f1(zAt(pd + 0.05) - TOP), ...shades(WOOD_D) });
  for (let i = 0; i < n; i++) {
    const a0 = A0 + i * sw;
    s += `<polygon points="${P([pt(a0, -0.06, ZB + 2), pt(a0 + sw, -0.06, ZB + 2), pt(a0 + sw, DF, ZF), pt(a0, DF, ZF)])}" fill="${i % 2 ? CREAM : color}"/>`;
  }
  s += `<polygon points="${P([pt(A0, -0.06, ZB + 2), pt(A1, -0.06, ZB + 2), pt(A1, DF, ZF), pt(A0, DF, ZF)])}" fill="none" ${LN}/>`;
  // snow resting on the awning
  let sn = `M${XY(pt(A0 - 0.02, -0.08, ZB + 6))} L${XY(pt(A1 + 0.02, -0.08, ZB + 6))} L${XY(pt(A1 + 0.02, 0.3, zAt(0.3) + 4))}`;
  for (let i = 10; i > 0; i -= 2) {
    const ac = A0 + (A1 - A0) * (i - 1) / 10, ae = A0 + (A1 - A0) * (i - 2) / 10;
    sn += ` Q${XY(pt(ac, 0.5, zAt(0.5) + 4))} ${XY(pt(ae, 0.3, zAt(0.3) + 4))}`;
  }
  s += `<path d="${sn} Z" fill="${SNOW}" ${LN}/>`;
  // scalloped valance with fairy lights
  let val = '';
  for (let i = 0; i < n; i++) {
    const x0 = i * sw * 64, x1 = x0 + sw * 64, xm = (x0 + x1) / 2;
    val += `<path d="M${f1(x0)} 0 H${f1(x1)} V9 Q${f1(xm)} 25 ${f1(x0)} 9 Z" fill="${i % 2 ? CREAM : color}" ${line}/>`;
  }
  val += `<path d="M0 3 H${f1((A1 - A0) * 64)}" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`;
  for (let i = 0; i < n; i++) val += bulb((i + 0.5) * sw * 64, 29, BULBS[i % 5]);
  s += face(A0, DF, ZF, val);
  // sign on the ridge
  const sgw = Math.min(1.95, len * 0.62) * 64;
  s += face(len / 2 - sgw / 128, 0, ZB + 36, `<path d="M${f1(sgw * 0.25)} 30 V40 M${f1(sgw * 0.75)} 30 V40" stroke="${WOOD_D}" stroke-width="4"/>
    <rect width="${f1(sgw)}" height="30" rx="9" fill="${CREAM}" ${LN}/><rect x="4" y="4" width="${f1(sgw - 8)}" height="22" rx="6" fill="none" stroke="${color}" stroke-width="2.5"/>
    ${text(f1(sgw / 2), 21, title, 15, INK)}<path d="M6 2 Q${f1(sgw / 2)} -7 ${f1(sgw - 6)} 2" stroke="${SNOW}" stroke-width="6" fill="none" stroke-linecap="round"/>`);
  return item(Ls ? len : dep, Ls ? dep : len, ZB + 40, s);
}

const knitPanel = (W, H) => {
  let s = `<rect x="5" y="60" width="${W - 10}" height="${H - 64}" fill="#EEE6FB"/><rect x="5" y="118" width="${W - 10}" height="6" fill="${WOOD}" ${line}/>`;
  for (let i = 0; i < Math.floor((W - 20) / 38); i++) {
    const x = 14 + i * 38;
    for (let k = 0; k < 3; k++) s += `<rect x="${x}" y="${110 - k * 7}" width="28" height="8" rx="3" fill="${PAL[(i + k) % 4]}" ${line}/>`;
  }
  for (let i = 0; i < Math.floor((W - 24) / 26); i++) {
    const x = 20 + i * 26;
    s += `<circle cx="${x}" cy="141" r="9" fill="${PAL[(i + 1) % 4]}" ${line}/><path d="M${x - 7} 137 Q${x} 143 ${x + 7} 137 M${x - 6} 144 Q${x} 138 ${x + 6} 145" stroke="#fff" stroke-opacity=".6" stroke-width="1.4" fill="none"/>`;
  }
  return s;
};
const knitFront = (W, H) => `<rect x="5" y="6" width="${W - 10}" height="${H - 12}" rx="5" fill="${LILAC}" ${line}/>
  <path d="${zig(10, W - 10, 18, 6, 8)}" stroke="#fff" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
  <path d="${zig(10, W - 10, 50, 6, 8)}" stroke="#fff" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
  ${Array.from({ length: Math.floor((W - 20) / 50) }, (_, i) => flake(34 + i * 50, 33, 7, '#fff')).join('')}`;

const gingerHouse = (x, y) => `<rect x="${x + 3}" y="${y - 16}" width="24" height="16" fill="${GINGER}" ${line}/><path d="M${x} ${y - 15} L${x + 15} ${y - 28} L${x + 30} ${y - 15} Z" fill="${GINGER}" ${line}/>
  <path d="M${x} ${y - 15} L${x + 15} ${y - 28} L${x + 30} ${y - 15}" stroke="#fff" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  <rect x="${x + 12}" y="${y - 9}" width="6" height="9" rx="2" fill="#fff"/><circle cx="${x + 8}" cy="${y - 11}" r="1.8" fill="${TEAL}"/><circle cx="${x + 22}" cy="${y - 11}" r="1.8" fill="${LILAC}"/>`;
const jar = (x, y) => `<rect x="${x}" y="${y - 24}" width="22" height="24" rx="5" fill="#E9F4FB" ${line}/><rect x="${x + 2}" y="${y - 28}" width="18" height="5" rx="2" fill="${LILAC}" ${line}/>
  ${[0, 1, 2, 3, 4].map((k) => `<circle cx="${x + 5 + ((k * 5) % 14)}" cy="${y - 5 - Math.floor(k / 2) * 6}" r="2.6" fill="${PAL[k % 4]}"/>`).join('')}`;
const gingerPanel = (W, H) => {
  let s = `<rect x="5" y="60" width="${W - 10}" height="${H - 64}" fill="#FFF3D2"/><rect x="5" y="118" width="${W - 10}" height="6" fill="${WOOD}" ${line}/>`;
  for (let i = 0; i < Math.floor((W - 20) / 44); i++) s += i % 2 ? jar(18 + i * 44, 118) : gingerHouse(14 + i * 44, 118);
  s += `<path d="M8 128 Q${W / 2} 136 ${W - 8} 128" stroke="${INK}" stroke-opacity=".5" stroke-width="1.2" fill="none"/>`;
  for (let i = 0; i < Math.floor((W - 24) / 30); i++) {
    const x = 22 + i * 30;
    s += `<circle cx="${x}" cy="142" r="9" fill="${GINGER}" ${line}/><circle cx="${x}" cy="142" r="5.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 2"/>`;
  }
  return s;
};
const gingerFront = (W, H) => {
  let d = `M5 6 H${W - 5} V12`;
  for (let x = W - 5, i = 0; x - 12 >= 4; x -= 12, i++) d += ` Q${x - 6} ${i % 2 ? 26 : 20} ${x - 12} 12`;
  return `<rect x="5" y="6" width="${W - 10}" height="${H - 12}" rx="5" fill="${GINGER}" ${line}/><path d="${d} V6 Z" fill="#fff"/>
    ${Array.from({ length: Math.floor((W - 20) / 18) }, (_, i) => `<circle cx="${16 + i * 18}" cy="${46 + (i % 2) * 4}" r="3.4" fill="${PAL[i % 4]}" ${line}/>`).join('')}`;
};

const mug = (x, y, c) => `<path d="M${x} ${y - 18} H${x + 16} V${y - 3} Q${x + 16} ${y} ${x + 13} ${y} H${x + 3} Q${x} ${y} ${x} ${y - 3} Z" fill="${c}" ${line}/>
  <path d="M${x + 16} ${y - 14} Q${x + 23} ${y - 14} ${x + 22} ${y - 9} Q${x + 21} ${y - 5} ${x + 16} ${y - 6}" fill="none" ${line}/>`;
const giftBox = (x, y, c, r) => `<rect x="${x}" y="${y - 18}" width="20" height="18" fill="${c}" ${line}/><rect x="${x + 8}" y="${y - 18}" width="4" height="18" fill="${r}"/>
  <path d="M${x + 10} ${y - 18} q-7 -7 -8 0 z M${x + 10} ${y - 18} q7 -7 8 0 z" fill="${r}" ${line}/>`;
const cocoaPanel = (W, H) => {
  let s = `<rect x="5" y="60" width="${W - 10}" height="${H - 64}" fill="#E4F5F2"/><rect x="5" y="118" width="${W - 10}" height="6" fill="${WOOD}" ${line}/>`;
  for (let i = 0; i < Math.floor((W - 20) / 34); i++) s += i % 2 ? giftBox(14 + i * 34, 118, PAL[(i + 2) % 4], CREAM) : mug(14 + i * 34, 118, PAL[i % 4]);
  s += `<path d="M8 128 H${W - 8}" stroke="${WOOD_D}" stroke-width="3"/>`;
  for (let i = 0; i < Math.floor((W - 24) / 32); i++) s += `<path d="M${20 + i * 32} 128 v4" stroke="${IRON}" stroke-width="2"/>${mug(13 + i * 32, 150, PAL[(i + 1) % 4])}`;
  return s;
};
const cocoaFront = (W, H) => `<rect x="5" y="6" width="${W - 10}" height="${H - 12}" rx="5" fill="${TEAL}" ${line}/>
  <path d="${Array.from({ length: Math.floor((W - 30) / 18) }, (_, i) => `M${22 + i * 18} 10 L${12 + i * 18} 54`).join(' ')}" stroke="#fff" stroke-opacity=".45" stroke-width="5"/>
  <rect x="${W / 2 - 38}" y="18" width="76" height="28" rx="14" fill="${CREAM}" ${line}/>${text(W / 2, 38, 'COCOA', 15, '#3E8E84')}`;

// ---------- props ----------
const rack = () => {
  let s = shadow(...at(0.18, 1.25), 60, 20);
  s += box({ u: 0.05, v: 0.02, w: 0.28, d: 0.12, h: 6, ...shades(IRON) });
  s += box({ u: 0.15, v: 0.05, w: 0.07, d: 0.07, h: 168, ...shades(WOOD_D) });
  const [x0, y0] = at(0.185, 0.085, 162), [x1, y1] = at(0.185, 2.415, 162);
  s += `<line x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(x1)}" y2="${f1(y1)}" stroke="${WOOD_D}" stroke-width="6" stroke-linecap="round"/>
    <line x1="${f1(x0)}" y1="${f1(y0 - 3)}" x2="${f1(x1)}" y2="${f1(y1 - 3)}" stroke="${SNOW}" stroke-width="2.6" stroke-linecap="round"/>`;
  s += box({ u: 0.05, v: 2.36, w: 0.28, d: 0.12, h: 6, ...shades(IRON) });
  s += box({ u: 0.15, v: 2.38, w: 0.07, d: 0.07, h: 168, ...shades(WOOD_D) });
  s += planeR(0.23, 2.42, 120, `<rect width="44" height="22" rx="6" fill="${CREAM}" ${LN}/>${text(22, 15, 'Try on!', 11, '#7A64B0')}`);
  return item(0.35, 2.5, 180, s);
};
const JACKETS = [
  { top: 'puffer', topColor: '#C9B8F2', neck: 'scarf', neckColor: '#F5DE7A' },
  { top: 'puffer', topColor: '#9EDDD4', neck: 'none' },
  { top: 'puffer', topColor: '#F5DE7A', neck: 'scarf', neckColor: '#4D5C9A' },
];
const jacket = (p) => () => item(0.2, 0.777, 170, planeR(0.035, 0.777, 162, `
  <path d="M23 2 Q23 -6 28 -6 Q32 -6 31 -1" stroke="${INK}" stroke-width="2" fill="none"/><path d="M6 11 L24 3 L42 11" stroke="${INK}" stroke-width="2" fill="none"/>
  <path d="M10 11 L24 7 L38 11 L46 53 L39 55 L36 41 V82 H12 V41 L9 55 L2 53 Z" fill="${p.topColor}" ${LN}/>
  <path d="M12 28 Q24 32 36 28 M12 46 Q24 50 36 46 M12 64 Q24 68 36 64 M24 13 V82" stroke="${INK}" stroke-opacity=".35" stroke-width="1.6" fill="none"/>
  <path d="M17 10 Q24 4 31 10 L32 16 Q24 20 16 16 Z" fill="${p.topColor}" ${LN}/>
  ${p.neck === 'scarf' ? `<path d="M15 15 Q24 21 33 15 L33 21 Q24 27 15 21 Z" fill="${p.neckColor}" ${LN}/><path d="M28 22 L32 42 L26 42 L24 23 Z" fill="${p.neckColor}" ${LN}/>` : ''}
  <path d="M40 30 l6 0 l0 8 l-6 0 z" fill="${CREAM}" ${line}/>`));

const SHAPES = {
  person: 'M70 54 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0 Z M64 86 H136 L176 116 L160 136 L136 120 V160 L162 200 L140 214 L100 172 L60 214 L38 200 L64 160 V120 L40 136 L24 116 Z',
  star: 'M100 14 L126 78 L194 82 L142 126 L160 192 L100 156 L40 192 L58 126 L6 82 L74 78 Z',
  heart: 'M100 190 C40 150 10 110 20 70 C30 30 80 26 100 64 C120 26 170 30 180 70 C190 110 160 150 100 190 Z',
  tree: 'M100 10 L160 90 H128 L180 160 H112 V200 H88 V160 H20 L72 90 H40 Z',
};
const miniCookie = (shape, icing, x, y, s) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s}) translate(-100 -205)">
  <path d="${SHAPES[shape]}" fill="${GINGER}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
  <path d="${SHAPES[shape]}" fill="none" stroke="${icing}" stroke-width="8" stroke-dasharray="12 9" transform="translate(100 112) scale(.84) translate(-100 -112)"/></g>`;
const tray = () => {
  let s = box({ u: 0, v: 0, w: 1.5, d: 0.6, h: 6, ...shades('#DCE6F5', 0.6), topDecor: '<rect x=".06" y=".06" width="1.38" height=".48" rx=".06" fill="#F6F2FF"/>' });
  s += planeL(0.2, 0.08, 82, `<path d="M6 30 L2 76 M58 30 L62 76" stroke="${WOOD_D}" stroke-width="3"/><rect width="64" height="30" rx="5" fill="#4D5C78" stroke="${WOOD}" stroke-width="3"/>
    ${text(32, 13, 'Decorate', 10, '#fff')}${text(32, 25, 'a cookie!', 10, SUN)}`);
  [['person', '#FFFFFF', 0.32], ['star', '#9EDDD4', 0.78], ['heart', '#C9B8F2', 1.22]].forEach(([sh, ic, u]) => { const [x, y] = at(u, 0.36, 6); s += miniCookie(sh, ic, x, y, 0.2); });
  return item(1.5, 0.6, 70, s);
};
const pot = () => {
  const [cx, cy] = at(0.3, 0.3);
  return item(0.6, 0.6, 110, `${shadow(cx, cy + 3, 36, 15)}${cyl(cx, cy, 28, 12, IRON)}
    <path d="M${cx + 24} ${cy - 46} Q${cx + 42} ${cy - 46} ${cx + 40} ${cy - 30} Q${cx + 38} ${cy - 18} ${cx + 24} ${cy - 22}" fill="none" stroke="#3E3252" stroke-opacity=".6" stroke-width="5"/>
    ${cyl(cx, cy - 12, 25, 46, '#8FB4E0')}
    <path d="M${cx - 25} ${cy - 34} A25 12.5 0 0 0 ${cx + 25} ${cy - 34}" stroke="#fff" stroke-width="7" fill="none" opacity=".75"/>
    ${starPath(cx - 4, cy - 23, 6, SUN)}
    <ellipse cx="${cx}" cy="${cy - 58}" rx="20" ry="9" fill="#7A4E36"/>
    <path d="M${cx + 4} ${cy - 58} L${cx + 22} ${cy - 92}" stroke="${WOOD_D}" stroke-width="5" stroke-linecap="round"/>
    <g class="steam"><path d="M${cx - 8} ${cy - 66} q-6 -10 0 -20 q6 -10 0 -20 M${cx + 8} ${cy - 70} q-6 -10 0 -18" stroke="#fff" stroke-opacity=".8" stroke-width="3.4" fill="none" stroke-linecap="round"/></g>`);
};
const globe = () => {
  const [cx, cy] = at(0.175, 0.175);
  return item(0.35, 0.35, 76, `${shadow(cx, cy + 2, 22, 9)}${cyl(cx, cy, 19, 11, '#7A64B0')}
    <circle cx="${cx}" cy="${cy - 34}" r="24" fill="#DDF1FA" fill-opacity=".92" ${LN}/>
    <path d="M${cx - 21} ${cy - 26} Q${cx} ${cy - 34} ${cx + 21} ${cy - 26} Q${cx + 14} ${cy - 13} ${cx} ${cy - 12} Q${cx - 14} ${cy - 13} ${cx - 21} ${cy - 26} Z" fill="#fff"/>
    <path d="M${cx} ${cy - 52} L${cx + 10} ${cy - 34} H${cx + 4} L${cx + 12} ${cy - 24} H${cx - 12} L${cx - 4} ${cy - 34} H${cx - 10} Z" fill="${PINE}" ${line}/>
    <g class="globe-snow" fill="#fff">${Array.from({ length: 12 }, (_, i) => `<circle cx="${cx - 16 + ((i * 11) % 32)}" cy="${cy - 52 + ((i * 7) % 26)}" r="1.8"/>`).join('')}</g>
    <path d="M${cx - 14} ${cy - 48} Q${cx - 8} ${cy - 56} ${cx + 2} ${cy - 57}" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".85"/>`);
};
function lightString(axis, len, startPole) {
  const V = axis === 'v';
  const p0 = [0.075, 0.075], p1 = V ? [0.075, len - 0.075] : [len - 0.075, 0.075];
  const pole = ([u, v], wreath) => {
    let s = box({ u: u - 0.1, v: v - 0.1, w: 0.2, d: 0.2, h: 10, ...shades(IRON) }) + box({ u: u - 0.04, v: v - 0.04, w: 0.08, d: 0.08, z: 10, h: 216, ...shades(IRON) });
    const [x, y] = at(u, v, 226);
    s += `<circle cx="${f1(x)}" cy="${f1(y - 5)}" r="7" fill="${SUN}" ${LN}/><path d="M${f1(x - 6)} ${f1(y - 10)} Q${f1(x)} ${f1(y - 16)} ${f1(x + 6)} ${f1(y - 10)}" stroke="${SNOW}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    if (wreath) { const [wx, wy] = at(u, v, 150); s += `<circle cx="${f1(wx)}" cy="${f1(wy)}" r="12" fill="none" stroke="#2F6E55" stroke-width="9"/><circle cx="${f1(wx)}" cy="${f1(wy)}" r="12" fill="none" stroke="#5FAE8A" stroke-width="6"/>${[0, 1, 2, 3, 4].map((k) => `<circle cx="${f1(wx + 12 * Math.cos(k * 1.3))}" cy="${f1(wy + 12 * Math.sin(k * 1.3))}" r="2.2" fill="${PAL[k % 4]}"/>`).join('')}<path d="M${f1(wx - 9)} ${f1(wy + 8)} l9 6 l9 -6 l-4 12 l-5 -6 l-5 6 z" fill="${LILAC}" ${line}/>`; }
    return s;
  };
  const a = at(...p0, 216), b = at(...p1, 216), c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 76];
  let s = startPole ? pole(p0, true) : '';
  s += `<path d="M${XY(a)} Q${XY(c)} ${XY(b)}" stroke="${INK}" stroke-width="2.2" fill="none"/>`;
  const n = Math.round(len / 0.42);
  for (let i = 1; i < n; i++) {
    const t = i / n, q = (k) => (1 - t) ** 2 * a[k] + 2 * t * (1 - t) * c[k] + t * t * b[k];
    s += bulb(q(0), q(1) + 8, BULBS[i % 5]);
  }
  s += pole(p1, false);
  return item(V ? 0.15 : len, V ? len : 0.15, 250, s);
}
const xmasTree = (it) => {
  const [cx, cy] = at(0.55, 0.55);
  return item(1.1, 1.1, 250, `${shadow(cx, cy + 4, 70, 28)}
    ${box({ u: 0.3, v: 0.3, w: 0.5, d: 0.5, h: 26, ...shades(WOOD), leftDecor: `<rect x="0" y="9" width="32" height="7" fill="${LILAC}"/>`, rightDecor: `<rect x="0" y="9" width="32" height="7" fill="${LILAC}"/>` })}
    ${tree(cx, cy - 22, 0.95, true)}
    ${it?.data.glow ? `<circle cx="${cx}" cy="${cy - 130}" r="110" fill="#FFF3B0" opacity=".2"/>` : ''}
    ${box({ u: 0.65, v: 0.92, w: 0.26, d: 0.22, h: 18, ...shades(TEAL), topDecor: `<path d="M.13 0 V.22" stroke="#fff" stroke-width=".05"/>` })}
    ${box({ u: 0.95, v: 0.6, w: 0.2, d: 0.2, h: 14, ...shades(SUN), topDecor: `<path d="M.1 0 V.2" stroke="#fff" stroke-width=".05"/>` })}`);
};
const lamp = (it) => {
  const on = it?.data.on !== false;
  const [cx, cy] = at(0.2, 0.2, 168);
  return item(0.4, 0.4, 215, `${shadow(...at(0.2, 0.2), 22, 9)}
    ${box({ u: 0.06, v: 0.06, w: 0.28, d: 0.28, h: 12, ...shades(IRON) })}${box({ u: 0.16, v: 0.16, w: 0.08, d: 0.08, z: 12, h: 156, ...shades(IRON) })}
    <path d="M${cx - 4} ${cy + 64} q-10 6 -2 12 q8 4 6 -10" fill="${LILAC}" ${line}/>
    ${on ? `<circle cx="${cx}" cy="${cy - 18}" r="64" fill="#FFF0A8" opacity=".24"/>` : ''}
    <rect x="${cx - 4}" y="${cy - 2}" width="8" height="6" fill="${IRON}"/>
    <path d="M${cx - 13} ${cy - 2} L${cx - 16} ${cy - 30} H${cx + 16} L${cx + 13} ${cy - 2} Z" fill="${on ? '#FFE9A0' : '#D8D2E6'}" ${LN}/>
    <path d="M${cx} ${cy - 2} V${cy - 30}" stroke="${IRON}" stroke-width="2"/>
    <path d="M${cx - 21} ${cy - 30} L${cx} ${cy - 46} L${cx + 21} ${cy - 30} Z" fill="${IRON}" ${LN}/>
    <path d="M${cx - 18} ${cy - 32} Q${cx} ${cy - 50} ${cx + 18} ${cy - 32}" stroke="${SNOW}" stroke-width="5" fill="none" stroke-linecap="round"/>`);
};
const crate = () => {
  const slats = (wpx) => `<path d="M0 20 H${wpx} M0 40 H${wpx}" stroke="${WOOD_D}" stroke-width="2.5"/><path d="M4 4 L${wpx - 4} 56" stroke="${WOOD_D}" stroke-width="5" stroke-opacity=".6"/>`;
  let s = shadow(...at(0.6, 0.5), 84, 32);
  s += box({ u: 0, v: 0, w: 1.2, d: 1.0, h: 60, ...shades('#D9B385'), top: '#F2D27A',
    leftDecor: `${slats(76.8)}<rect x="18" y="22" width="42" height="16" rx="5" fill="${CREAM}" ${line}/>${text(39, 34, 'GIFTS', 11, '#7A64B0')}`,
    rightDecor: slats(64), topDecor: '<path d="M.15 .2 l.2 .1 M.5 .7 l.25 -.1 M.9 .3 l.1 .2 M.3 .8 l.2 .05" stroke="#D8B24E" stroke-width=".04"/>' });
  s += box({ u: 0.2, v: 0.25, w: 0.34, d: 0.3, z: 46, h: 30, ...shades(LILAC), topDecor: '<path d="M.17 0 V.3 M0 .15 H.34" stroke="#fff" stroke-width=".06"/>' });
  s += box({ u: 0.66, v: 0.45, w: 0.3, d: 0.3, z: 46, h: 24, ...shades(TEAL), topDecor: '<path d="M.15 0 V.3 M0 .15 H.3" stroke="#fff" stroke-width=".06"/>' });
  s += box({ u: 0.3, v: 0.62, w: 0.28, d: 0.26, z: 46, h: 20, ...shades(SKY), topDecor: '<path d="M.14 0 V.26 M0 .13 H.28" stroke="#fff" stroke-width=".06"/>' });
  return item(1.2, 1.0, 110, s);
};
const gift = (col, rib) => () => {
  const [bx, by] = at(0.22, 0.22, 30);
  return item(0.45, 0.45, 60, `${shadow(...at(0.22, 0.22), 26, 10)}${box({ u: 0.04, v: 0.04, w: 0.36, d: 0.36, h: 30, ...shades(col),
    leftDecor: `<rect x="9.5" y="0" width="4" height="30" fill="${rib}"/>`, rightDecor: `<rect x="9.5" y="0" width="4" height="30" fill="${rib}"/>`,
    topDecor: `<path d="M.18 0 V.36 M0 .18 H.36" stroke="${rib}" stroke-width=".06"/>` })}
    <path d="M${bx} ${by} q-12 -12 -14 0 q2 6 14 0 z M${bx} ${by} q12 -12 14 0 q-2 6 -14 0 z" fill="${rib}" ${line}/>`);
};
const reindeer = () => {
  const [cx, cy] = at(0.7, 0.3);
  const T = `transform="translate(${f1(cx - 70)} ${f1(cy - 126)}) scale(.7)"`;
  return item(1.4, 0.6, 140, `${shadow(cx + 4, cy + 2, 66, 16)}<g ${T}>
    <path d="M50 22 L42 0 M50 22 L28 8 M47 12 L36 -2 M110 22 L118 0 M110 22 L132 8 M113 12 L124 -2" fill="none" stroke="${BARK}" stroke-width="6" stroke-linecap="round"/>
    <rect x="128" y="146" width="16" height="42" rx="6" fill="#B98762" ${LN}/><rect x="90" y="146" width="16" height="42" rx="6" fill="#B98762" ${LN}/>
    <ellipse cx="116" cy="128" rx="66" ry="38" fill="#C99772" ${LN}/><path d="M166 112 q20 -6 16 10 q-6 6 -14 2" fill="#F3D2B8" ${LN}/>
    <ellipse cx="120" cy="140" rx="40" ry="16" fill="#F3D2B8" opacity=".6"/>
    <rect x="70" y="148" width="16" height="40" rx="6" fill="#C99772" ${LN}/><rect x="150" y="148" width="16" height="40" rx="6" fill="#C99772" ${LN}/>
    <path d="M78 68 Q76 110 98 122 L122 110 Q110 80 104 62 Z" fill="#C99772" ${LN}/>
    <circle cx="80" cy="54" r="34" fill="#D9AC86" ${LN}/><ellipse cx="58" cy="68" rx="18" ry="14" fill="#F3D2B8" ${LN}/><circle cx="44" cy="66" r="9" fill="#E58F6A" ${LN}/>
    <circle cx="80" cy="46" r="4.5" fill="${INK}"/><circle cx="82" cy="44" r="1.5" fill="#fff"/>
    <path d="M100 30 q14 -12 18 2 q-8 6 -18 -2 z" fill="#D9AC86" ${LN}/>
    <path d="M84 98 Q104 112 128 100" stroke="${TEAL}" stroke-width="9" fill="none" stroke-linecap="round"/>
    ${[90, 106, 122].map((x, i) => `<circle cx="${x}" cy="${106 + (i === 1 ? 4 : 0)}" r="6.5" fill="${SUN}" ${LN}/>`).join('')}
    <path d="M70 128 Q116 108 172 124" stroke="${LILAC}" stroke-width="10" fill="none" opacity=".9"/></g>`);
};
const hay = () => item(0.7, 0.5, 40, `${shadow(...at(0.35, 0.25), 44, 14)}${box({ u: 0, v: 0, w: 0.7, d: 0.5, h: 28, ...shades('#E9CF7A'),
  leftDecor: `<path d="M4 8 H40 M8 16 H42 M2 22 H34" stroke="#C9A24E" stroke-width="1.6"/><rect x="12" y="0" width="4" height="28" fill="${TEAL}"/><rect x="30" y="0" width="4" height="28" fill="${TEAL}"/>`,
  rightDecor: '<path d="M4 8 H28 M2 18 H30" stroke="#C9A24E" stroke-width="1.6"/>', topDecor: '<path d="M.1 .1 l.2 .05 M.4 .3 l.2 -.04 M.2 .38 l.15 .02" stroke="#C9A24E" stroke-width=".03"/><path d="M0 .1 H.7" stroke="#fff" stroke-width=".08"/>' })}`);
const snowman = () => {
  const [cx, cy] = at(0.35, 0.35);
  return item(0.7, 0.7, 150, `${shadow(cx, cy + 2, 40, 15)}
    <circle cx="${cx}" cy="${cy - 30}" r="32" fill="#FFFFFF" ${LN}/><path d="M${cx + 6} ${cy - 60} A32 32 0 0 1 ${cx + 30} ${cy - 18} Q${cx + 14} ${cy - 30} ${cx + 6} ${cy - 60} Z" fill="#C9D6EE" opacity=".6"/>
    <path d="M${cx - 18} ${cy - 76} L${cx - 46} ${cy - 96} M${cx - 38} ${cy - 90} l-4 -10 M${cx + 18} ${cy - 76} L${cx + 46} ${cy - 92} M${cx + 38} ${cy - 88} l6 -9" stroke="${BARK}" stroke-width="4" stroke-linecap="round" fill="none"/>
    <circle cx="${cx}" cy="${cy - 80}" r="24" fill="#FFFFFF" ${LN}/>
    ${[0, 1, 2].map((k) => `<circle cx="${cx}" cy="${cy - 92 + k * 11}" r="3" fill="#5E5A86"/>`).join('')}
    <circle cx="${cx}" cy="${cy - 118}" r="18" fill="#FFFFFF" ${LN}/>
    <path d="M${cx - 18} ${cy - 104} Q${cx} ${cy - 96} ${cx + 18} ${cy - 104} L${cx + 18} ${cy - 97} Q${cx} ${cy - 89} ${cx - 18} ${cy - 97} Z" fill="${TEAL}" ${LN}/><path d="M${cx + 8} ${cy - 96} l4 22 l-7 0 l-3 -20 z" fill="${TEAL}" ${LN}/>
    <path d="M${cx - 17} ${cy - 124} C${cx - 18} ${cy - 150} ${cx + 18} ${cy - 150} ${cx + 17} ${cy - 124} Z" fill="${LILAC}" ${LN}/><rect x="${cx - 19}" y="${cy - 128}" width="38" height="8" rx="4" fill="#9A80D8" ${LN}/><circle cx="${cx}" cy="${cy - 148}" r="6" fill="${CREAM}" ${LN}/>`);
};
const bench = () => {
  const leg = shades(IRON), wood = shades(WOOD);
  return item(1.3, 0.5, 90, `${shadow(...at(0.65, 0.25), 66, 18)}
    ${box({ u: 0.08, v: 0.04, w: 0.08, d: 0.42, h: 34, ...leg })}${box({ u: 1.14, v: 0.04, w: 0.08, d: 0.42, h: 34, ...leg })}
    ${box({ u: 0.04, v: 0, w: 1.22, d: 0.1, z: 34, h: 44, ...wood, leftDecor: '<path d="M0 14 H78 M0 28 H78" stroke="#A87A5A" stroke-width="2"/>' })}
    ${box({ u: 0, v: 0.08, w: 1.3, d: 0.42, z: 34, h: 6, ...wood, topDecor: '<path d="M0 .14 H1.3 M0 .28 H1.3" stroke="#A87A5A" stroke-width=".02"/><path d="M.05 .03 H.6" stroke="#fff" stroke-width=".05" stroke-linecap="round"/>' })}
    <path d="M${XY(at(0.06, 0.02, 80))} L${XY(at(1.24, 0.02, 80))}" stroke="${SNOW}" stroke-width="5" stroke-linecap="round"/>`);
};
const pineItem = (s) => () => { const [cx, cy] = at(0.4, 0.4); return item(0.8, 0.8, 230 * s, `${shadow(cx, cy + 3, 56 * s, 22 * s)}${tree(cx, cy, s)}`); };

// ---------- gingerbread decorating ----------
function cookieSvg(c, size = 200) {
  const sprinkles = c.sprinkles ? ['#E58F6A', '#9EDDD4', '#F5DE7A', '#B79CF0', '#fff'].map((col, i) => Array.from({ length: 4 }, (_, k) => {
    const x = 50 + ((i * 37 + k * 53) % 100), y = 60 + ((i * 29 + k * 41) % 110);
    return `<rect x="${x}" y="${y}" width="10" height="4" rx="2" fill="${col}" transform="rotate(${(i * 40 + k * 25) % 180} ${x + 5} ${y + 2})"/>`;
  }).join('')).join('') : '';
  const clip = 'mk-ck' + Math.random().toString(36).slice(2, 7);
  return `<svg viewBox="0 0 200 220" width="${size}" height="${size * 1.1}" overflow="visible">
    <defs><clipPath id="${clip}"><path d="${SHAPES[c.shape]}"/></clipPath></defs>
    <path d="${SHAPES[c.shape]}" fill="${GINGER}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <g clip-path="url(#${clip})">${sprinkles}</g>
    <path d="${SHAPES[c.shape]}" fill="none" stroke="${c.icing}" stroke-width="6" stroke-dasharray="10 8" stroke-linejoin="round" transform="translate(100 112) scale(.84) translate(-100 -112)"/>
    ${c.shape === 'person' ? `<circle cx="90" cy="48" r="5" fill="${INK}"/><circle cx="110" cy="48" r="5" fill="${INK}"/><path d="M88 62 Q100 72 112 62" stroke="${c.icing}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="100" cy="104" r="7" fill="${c.icing}"/><circle cx="100" cy="132" r="7" fill="${c.icing}"/>` : ''}
    ${c.shape === 'heart' || c.shape === 'star' ? `<circle cx="100" cy="104" r="12" fill="${c.icing}"/>` : ''}
  </svg>`;
}

function decorate(api, tray) {
  const c = { shape: 'person', icing: '#FFFFFF', sprinkles: true };
  api.modal((card, close) => {
    card.innerHTML += `<h2>Decorate a cookie</h2><div class="cookie-holder"></div>
      <div class="opt-row shapes"></div><div class="opt-row icings"></div><div class="opt-row extra"></div>
      <button class="btn bake">Bake it! 🍪</button>`;
    const holder = card.querySelector('.cookie-holder');
    const draw = () => { holder.innerHTML = cookieSvg(c, 180).replace('<svg', '<svg class="cookie-preview"'); };
    const row = (sel, opts, key, isColor) => {
      const r = card.querySelector(sel); r.innerHTML = '';
      opts.forEach(([val, label]) => {
        const b = document.createElement('button');
        b.className = (isColor ? 'dot' : 'chip') + (c[key] === val ? ' on' : '');
        if (isColor) { b.style.background = val; b.setAttribute('aria-label', 'Icing ' + label); } else b.textContent = label;
        b.onclick = () => { c[key] = val; api.sfx.click(); refresh(); };
        r.append(b);
      });
    };
    const refresh = () => {
      row('.shapes', [['person', '🧑 Person'], ['star', '⭐ Star'], ['heart', '💜 Heart'], ['tree', '🌲 Tree']], 'shape');
      row('.icings', [['#FFFFFF', 'white'], ['#C9B8F2', 'lilac'], ['#9EDDD4', 'mint'], ['#F5DE7A', 'yellow'], ['#8FC3F0', 'blue']], 'icing', true);
      row('.extra', [[true, '✨ Sprinkles'], [false, 'No sprinkles']], 'sprinkles');
      draw();
    };
    card.querySelector('.bake').onclick = () => {
      const design = { ...c };
      close();
      api.sfx.yum();
      const k = api.count('cookie') % 3;
      // fresh cookies land on the gingerbread counter, next to the tray
      const it = api.add({
        id: api.uid('cookie'), w: 60, h: 66, cls: 'food', small: true,
        gx: tray.gx + 1.6 + k * 0.4, gy: tray.gy + 0.15, gz: 72, fw: 0.3, fd: 0.3, ax: 30, ay: 62,
        art: () => cookieSvg(design, 60).replace(/width="60" height="[\d.]+"/, 'width="100%" height="100%"'),
        onGive: (i, a, who) => a.eat(i, who, 'Best cookie ever! 🍪', ['🍪', '✨', '💜']),
      }, { spawned: true });
      api.sparkle(it.x + 30, it.y + 30, ['✨', '🍪', '⭐']);
      api.bubble(it.x + 30, it.y - 10, 'Fresh from the oven! Give it to a friend.');
      api.earn(10); if (!api.starFound('market-cookie')) api.addStar('market-cookie', 0, 0, { spawned: true, gx: tray.gx - 0.38, gy: tray.gy + 0.1, gz: 72 });
    };
    refresh();
  });
}

const I = isoDef;
// Wearables / spawned food from common.js are drawn at flat-scene size; scale them to the diorama.
const mini = (d, k = 0.62) => ({ ...d, w: d.w * k, h: d.h * k, ax: d.ax * k, ay: d.ay * k });
const shrink = (api, it, k) => { it.w *= k; it.h *= k; it.ax *= k; it.ay *= k; it.el.style.width = it.w + 'px'; it.el.style.height = it.h + 'px'; api.place(it); return it; };
const boing = (it) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); };

export const MARKET = {
  id: 'market', posKey: 'market-iso', title: 'Winter Market 🎄', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, outdoor: true,
  light: 'outdoor', iso: R, avatar: [3.4, 3.6],
  frame: (w) => (w === 'snow' ? 'linear-gradient(#8E93B8, #C9C6DE 55%, #D8CFEC)' : 'linear-gradient(#6E78C2, #A99BDF 42%, #E9D7B8 62%, #DCD0EE)'),
  bg,
  stars: [{ id: 'market-crate', gx: 8.7, gy: 6.2 }],
  characters: [{ id: 'juno', look: NPC_WINTER.juno, gx: 6.2, gy: 3.6, say: ['Try on a puffer jacket! 🧥', 'Decorate a gingerbread cookie! 🍪', 'Shake the snow globe ❄️'] }],
  items: [
    // stalls (their counters hold small things)
    I('knit', 1.0, 0.3, 3.2, 1.3, () => stall({ side: 'L', len: 3.2, dep: 1.3, color: LILAC, title: 'Knitwear', panel: knitPanel, front: knitFront }), { drag: false, surface: 72 }),
    I('ginger', 5.1, 0.3, 3.4, 1.3, () => stall({ side: 'L', len: 3.4, dep: 1.3, color: SUN, title: 'Gingerbread', panel: gingerPanel, front: gingerFront }), { drag: false, surface: 72 }),
    I('cocoa', 0.15, 4.5, 1.3, 3.2, () => stall({ side: 'R', len: 3.2, dep: 1.3, color: TEAL, title: 'Cocoa &amp; Gifts', panel: cocoaPanel, front: cocoaFront }), { drag: false, surface: 72 }),

    // puffer jackets on a rack: tap one to try it on
    I('rack', 0.15, 1.75, 0.35, 2.5, rack, { drag: false }),
    ...JACKETS.map((p, i) => I('jacket' + i, 0.3, 1.835 + i * 0.777, 0.2, 0.777, jacket(p), {
      drag: false, cls: 'hanger', zBias: 40,
      onTap: (it, api) => {
        const me = api.avatar();
        if (!me) { api.bubble(it.x + it.w / 2, it.y, 'So puffy! 🧥'); return; }
        api.setLook(me, p); api.sfx.wear(); api.react(me, 'So warm! 🧥', ['❄️', '✨', '💜']);
      },
    })),
    mini(wearable('beanie', 0, 0, 'm-beanie', { gx: 1.25, gy: 0.95, gz: 72 })),
    mini(wearable('earmuffs', 0, 0, 'm-earmuffs', { gx: 2.3, gy: 0.95, gz: 72 })),
    mini(wearable('scarf', 0, 0, 'm-scarf', { gx: 3.35, gy: 0.95, gz: 72 })),

    // gingerbread: tap the tray to decorate a cookie
    I('tray', 5.6, 0.75, 1.5, 0.6, tray, { drag: false, gz: 72, onTap: (it, api) => decorate(api, it) }),

    // cocoa & gifts
    I('cocoapot', 0.55, 6.6, 0.6, 0.6, pot, {
      drag: false, gz: 72,
      onTap: (it, api) => {
        const n = api.count('cocoa');
        if (n >= 3) { api.bubble(it.x + it.w / 2, it.y - 10, 'Drink up first! ☕'); return; }
        api.sfx.pour();
        shrink(api, food(api, 'cocoa', 0, 0, { gx: 0.85, gy: 4.75 + n * 0.55, gz: 72 }), 0.62);
      },
    }),
    I('globe', 0.8, 7.25, 0.35, 0.35, globe, {
      small: true, gz: 72,
      onTap: (it, api) => { it.el.classList.remove('shaking'); void it.el.offsetWidth; it.el.classList.add('shaking'); api.bubble(it.x + it.w / 2, it.y - 6, 'Shake shake! ❄️'); api.later(() => it.el.classList.remove('shaking'), 2200); },
    }),

    // string lights over the plaza, lamp, trees
    I('lightsA', 4.45, 1.95, 0.15, 6.0, () => lightString('v', 6.0, true), { drag: false }),
    I('lightsB', 4.45, 1.95, 5.15, 0.15, () => lightString('u', 5.15, false), { drag: false }),
    I('xmas', 8.2, 2.6, 1.1, 1.1, xmasTree, {
      drag: false, data: { glow: false },
      onTap: (it, api) => { it.data.glow = !it.data.glow; api.setArt(it); api.sfx.click(); if (it.data.glow) { api.sparkle(it.x + it.w / 2, it.y + 60, ['✨', '⭐', '❄️']); api.bubble(it.x + it.w / 2, it.y, 'Merry and bright! ✨'); } },
    }),
    I('lamp', 9.25, 4.6, 0.4, 0.4, lamp, { drag: false, data: { on: true }, onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); } }),
    I('pine1', 0.1, 0.1, 0.8, 0.8, pineItem(0.95), { drag: false }),
    I('pine2', 9.05, 0.25, 0.8, 0.8, pineItem(1), { drag: false }),
    I('pine3', 9.2, 1.35, 0.8, 0.8, pineItem(0.7), { drag: false }),

    // plaza things
    I('bench', 6.5, 6.2, 1.3, 0.5, bench, { surface: 40 }),
    I('snowman', 5.3, 6.85, 0.7, 0.7, snowman, { onTap: (it, api) => { boing(it); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y, '*brrr* ⛄'); } }),
    I('crate', 8.3, 5.9, 1.2, 1.0, crate),
    I('gift1', 7.5, 7.3, 0.45, 0.45, gift(LILAC, CREAM), { small: true }),
    I('gift2', 9.5, 6.05, 0.45, 0.45, gift(TEAL, SUN), { small: true }),
    I('reindeer', 2.2, 6.6, 1.4, 0.6, reindeer, {
      cls: 'squish',
      onTap: (it, api) => { boing(it); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y - 6, ['*jingle jingle* 🔔', 'Hello there! 🦌', '*happy snort*'][Math.floor(Math.random() * 3)]); },
    }),
    I('hay', 3.75, 7.1, 0.7, 0.5, hay),
  ],
};
