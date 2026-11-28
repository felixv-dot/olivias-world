// Fun Fair — one big isometric diorama: Ferris wheel, carousel, high striker, cotton candy and popcorn carts,
// balloons, a "hit the cans" booth (mini-game), a photo booth and strings of lights.
import { room, groundShell, floorPoly, isoItem, at, shades, proj, isoDef } from '../iso.js';
import { svg, text, wearable, NPC } from './common.js';

const R = room({ cols: 12, rows: 10, ox: 736, oy: 116, wallH: 0 });
R.charScale = 0.55;

const HW = 64, HH = 32;
const INK = '#4A3B5C';
const WOOD = '#C99A6C', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', TURQ = '#3CC7B8', SKY = '#9CC8EE', SUN = '#F5DE7A', CORAL = '#E58F6A', NAVY = '#4D5C9A';
const PASTEL = ['#B79CF0', '#3CC7B8', '#8FC3F0', '#F5DE7A', '#E58F6A'];
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4" stroke-linejoin="round"';
const f = (n) => n.toFixed(1);
const P = (arr) => arr.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
const A = (u, v, z = 0) => at(u, v, z);

function box({ u = 0, v = 0, z = 0, w, d, h, c, tl = '', ll = '', rl = '', ln = true }) {
  const bx = (u - v) * HW, by = (u + v) * HH - z;
  const B = [bx, by], Rr = [bx + w * HW, by + w * HH], F = [bx + (w - d) * HW, by + (w + d) * HH], L = [bx - d * HW, by + d * HH];
  const up = ([x, y]) => [x, y - h];
  const s = ln ? line : '';
  let o = '';
  if (h > 0) {
    o += `<polygon points="${P([L, F, up(F), up(L)])}" fill="${c.left}" ${s}/>`;
    if (ll) o += `<g transform="matrix(1,0.5,0,1,${f(L[0])},${f(L[1] - h)})">${ll}</g>`;
    o += `<polygon points="${P([F, Rr, up(Rr), up(F)])}" fill="${c.right}" ${s}/>`;
    if (rl) o += `<g transform="matrix(1,-0.5,0,1,${f(F[0])},${f(F[1] - h)})">${rl}</g>`;
  }
  o += `<polygon points="${P([up(B), up(Rr), up(F), up(L)])}" fill="${c.top}" ${s}/>`;
  if (tl) o += `<g transform="matrix(${HW},${HH},${-HW},${HH},${f(B[0])},${f(B[1] - h)})">${tl}</g>`;
  return o;
}
function cyl(u, v, z, r, h, c, top = true) {
  const [x, y] = A(u, v, z), rx = r * 90.5, ry = r * 45.25;
  return `<path d="M${f(x - rx)} ${f(y - h)} V${f(y)} A${f(rx)} ${f(ry)} 0 0 0 ${f(x + rx)} ${f(y)} V${f(y - h)} Z" fill="${c.left}" ${line}/>
    <path d="M${f(x)} ${f(y - h + ry)} V${f(y + ry)} A${f(rx)} ${f(ry)} 0 0 0 ${f(x + rx)} ${f(y)} V${f(y - h)} A${f(rx)} ${f(ry)} 0 0 1 ${f(x)} ${f(y - h + ry)} Z" fill="${c.right}" opacity=".55"/>
    ${top ? `<ellipse cx="${f(x)}" cy="${f(y - h)}" rx="${f(rx)}" ry="${f(ry)}" fill="${c.top}" ${line}/>` : ''}`;
}
const quad = (pts, fill, extra = line) => `<polygon points="${P(pts.map(([u, v, z]) => A(u, v, z)))}" fill="${fill}" ${extra}/>`;
const seg = (a, b, col, wdt) => `<path d="M${A(...a).map(f).join(' ')} L${A(...b).map(f).join(' ')}" stroke="${col}" stroke-width="${wdt}" stroke-linecap="round"/>`;
const shadow = (u, v, r, o = 0.13) => { const [x, y] = A(u, v); return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r * 90.5)}" ry="${f(r * 45.25)}" fill="#3E3252" opacity="${o}"/>`; };
const thru = (s) => s.replace('<g transform', '<g pointer-events="visiblePainted" transform');
const I = (id, gx, gy, fw, fd, build, extra = {}) => {
  const d = isoDef(id, gx, gy, fw, fd, build, extra);
  if (extra.thru) d.art = (it, api) => thru(build(it, api).svg);
  return d;
};
// A cone roof (or parasol): segments sorted back-to-front so the near ones cover the far ones.
function cone(cx, cy, rx, ry, h, cols, n = 12) {
  return Array.from({ length: n }, (_, i) => {
    const a1 = (i / n) * Math.PI * 2, a2 = ((i + 1) / n) * Math.PI * 2;
    const p1 = [cx + Math.cos(a1) * rx, cy + Math.sin(a1) * ry], p2 = [cx + Math.cos(a2) * rx, cy + Math.sin(a2) * ry];
    return { s: Math.sin((a1 + a2) / 2), d: `<polygon points="${P([[cx, cy - h], p1, p2])}" fill="${cols[i % cols.length]}" ${line}/>` };
  }).sort((a, b) => a.s - b.s).map((o) => o.d).join('');
}

// ---------- background: sky + floating plaza ----------
const bg = (w) => {
  const sun = w.weather === 'sun';
  const top = sun ? '#BFE0F4' : '#A6AFC2', bot = sun ? '#FFF1D6' : '#CDD4DF';
  const cl = (x, y, s, col, dur) => `<g class="drift" style="animation-duration:${dur}s"><g transform="translate(${x} ${y}) scale(${s})" fill="${col}"><ellipse cx="60" cy="44" rx="60" ry="22"/><ellipse cx="100" cy="30" rx="44" ry="30"/><ellipse cx="150" cy="42" rx="52" ry="24"/><ellipse cx="104" cy="52" rx="90" ry="16" opacity=".8"/></g></g>`;
  const c = sun ? '#FFFFFF' : '#E3E6EE';
  const [mx, my] = proj(R, 6.4, 5.4);
  const grassL = floorPoly(R, [[0, 0], [0.55, 0], [0.55, R.rows], [0, R.rows]], `fill="${sun ? '#A8DE9A' : '#97C68E'}"`);
  const grassR = floorPoly(R, [[0, 0], [R.cols, 0], [R.cols, 0.55], [0, 0.55]], `fill="${sun ? '#A8DE9A' : '#97C68E'}"`);
  const curb = floorPoly(R, [[0.55, 0.55], [R.cols, 0.55], [R.cols, 0.68], [0.68, 0.68], [0.68, R.rows], [0.55, R.rows]], 'fill="#E2D9CC"');
  const shrubs = [...Array.from({ length: 9 }, (_, i) => [0.28, 0.9 + i * 1.0]), ...Array.from({ length: 11 }, (_, i) => [0.9 + i * 1.0, 0.28])].map(([g, v], i) => {
    const [x, y] = proj(R, g, v);
    return `<circle cx="${f(x - 8)}" cy="${f(y - 8)}" r="10" fill="#6DBE7A" ${line}/><circle cx="${f(x + 6)}" cy="${f(y - 10)}" r="9" fill="#5AAE6A" ${line}/><circle cx="${f(x)}" cy="${f(y - 15)}" r="9" fill="#8FD39A" ${line}/>${i % 3 === 0 ? `<circle cx="${f(x + 2)}" cy="${f(y - 19)}" r="3" fill="${PASTEL[i % 5]}"/>` : ''}`;
  }).join('');
  const puddles = sun ? '' : [[4, 4], [8, 6.4], [3, 8.4], [9.6, 3.8]].map(([g, v]) => { const [x, y] = proj(R, g, v); return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="40" ry="12" fill="#B8C2D6" opacity=".7"/><ellipse cx="${f(x - 10)}" cy="${f(y - 2)}" rx="16" ry="3" fill="#fff" opacity=".5"/>`; }).join('');
  const confetti = Array.from({ length: 40 }, (_, i) => { const [x, y] = proj(R, 1 + ((i * 2.71) % 10.6), 1 + ((i * 1.97) % 8.7)); return `<rect x="${f(x)}" y="${f(y)}" width="5" height="3" rx="1" fill="${PASTEL[i % 5]}" opacity=".7" transform="rotate(${(i * 47) % 180} ${f(x)} ${f(y)})"/>`; }).join('');
  return svg(1600, 900, `
  <defs><linearGradient id="funfair-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient>
    <radialGradient id="funfair-sun"><stop offset="0" stop-color="#FFF6D0"/><stop offset=".5" stop-color="#FFEBA8" stop-opacity=".55"/><stop offset="1" stop-color="#FFEBA8" stop-opacity="0"/></radialGradient>
    <pattern id="funfair-tiles" width="1" height="1" patternUnits="userSpaceOnUse" patternTransform="matrix(64,32,-64,32,${R.ox},${R.oy})">
      <rect width="1" height="1" fill="none"/><path d="M0 .5 H1 M.5 0 V1" stroke="#000" stroke-opacity=".07" stroke-width=".025"/><rect x=".5" y="0" width=".5" height=".5" fill="#fff" opacity=".12"/></pattern></defs>
  <rect width="1600" height="900" fill="url(#funfair-sky)"/>
  ${sun ? '<circle cx="1420" cy="110" r="170" fill="url(#funfair-sun)"/><circle cx="1420" cy="110" r="50" fill="#FFF6D0"/>' : ''}
  ${w.rainbow ? `<g fill="none" stroke-width="20" opacity=".65" stroke-linecap="round">${PASTEL.slice().reverse().map((col, i) => `<path d="M${180 + i * 20} 640 A${620 - i * 20} ${480 - i * 20} 0 0 1 ${1420 - i * 20} 640" stroke="${col}"/>`).join('')}</g>` : ''}
  ${cl(60, 60, 1.1, c, 90)}${cl(1060, 30, 0.8, c, 110)}${cl(1240, 200, 0.6, c, 100)}
  ${sun ? '' : `${cl(420, 100, 1.3, '#B9C0CF', 70)}${cl(1180, 120, 1.1, '#B9C0CF', 75)}`}
  <g fill="${sun ? '#CFE7D2' : '#B6C4BA'}" opacity=".8">${Array.from({ length: 16 }, (_, i) => `<ellipse cx="${i * 110 - 20}" cy="${884 + Math.sin(i * 1.7) * 12}" rx="${70 + (i % 3) * 14}" ry="${46 + (i % 2) * 12}"/>`).join('')}</g>
  ${groundShell(R, { top: sun ? '#ECE5DA' : '#C9C6CF', pattern: 'funfair-tiles', sideL: '#D9CDBE', sideR: '#C4B6A6', layer: '#A89684', depth: 44 })}
  ${grassL}${grassR}${curb}
  <ellipse cx="${f(mx)}" cy="${f(my)}" rx="${f(2.2 * 90.5)}" ry="${f(2.2 * 45.25)}" fill="${sun ? '#E2D6F5' : '#C2BDD2'}" ${line}/>
  <ellipse cx="${f(mx)}" cy="${f(my)}" rx="${f(1.7 * 90.5)}" ry="${f(1.7 * 45.25)}" fill="none" stroke="${sun ? '#9EDDD4' : '#9DB8B6'}" stroke-width="10"/>
  <ellipse cx="${f(mx)}" cy="${f(my)}" rx="${f(0.9 * 90.5)}" ry="${f(0.9 * 45.25)}" fill="${sun ? '#FBF0C4' : '#D8D3C4'}" ${line}/>
  <g transform="translate(${f(mx)} ${f(my)}) scale(1 .5)"><path d="M0 -46 L10 -12 L46 0 L10 12 L0 46 L-10 12 L-46 0 L-10 -12 Z" fill="${LILAC}" opacity=".8"/></g>
  ${confetti}${puddles}${shrubs}`);
};

// ---------- Ferris wheel (in a vertical plane along gy) ----------
const WR = 148, WZ = 172, WX = 160; // radius, hub height, hub position along the plane (px from the front end)
const plane = (u, body) => { const [ox, oy] = A(u, 5, 0); return `<g transform="matrix(1,-0.5,0,1,${f(ox)},${f(oy)})">${body}</g>`; };
const ferrisArt = () => {
  const spokes = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return `M0 0 L${f(Math.cos(a) * WR)} ${f(Math.sin(a) * WR)}`; }).join(' ');
  const zig = Array.from({ length: 16 }, (_, i) => {
    const a1 = (i / 16) * Math.PI * 2, a2 = ((i + 1) / 16) * Math.PI * 2;
    return `M${f(Math.cos(a1) * WR)} ${f(Math.sin(a1) * WR)} L${f(Math.cos(a2) * WR * 0.62)} ${f(Math.sin(a2) * WR * 0.62)}`;
  }).join(' ');
  const bulbs = Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return `<circle cx="${f(Math.cos(a) * (WR - 5))}" cy="${f(Math.sin(a) * (WR - 5))}" r="3" fill="${i % 2 ? '#FFF3B0' : CREAM}"/>`; }).join('');
  const rim = (front) => `<g transform="translate(${WX} ${-WZ})"><g class="sx-wheel" style="transform-origin:0px 0px">
      <circle r="${WR}" fill="#fff" fill-opacity="0"/>
      <circle r="${WR}" fill="none" stroke="${front ? LILAC : '#9A8FC0'}" stroke-width="${front ? 11 : 8}"/><circle r="${WR}" fill="none" stroke="#fff" stroke-width="${front ? 3 : 2}" opacity=".6"/>
      <circle r="${WR}" fill="none" stroke="#3E3252" stroke-width="1.2" opacity=".35"/>
      <circle r="${WR * 0.62}" fill="none" stroke="${front ? TEAL : '#8FBFB8'}" stroke-width="5"/>
      <path d="${spokes}" stroke="${front ? '#A99FCC' : '#9A8FC0'}" stroke-width="3"/>
      ${front ? `<path d="${zig}" stroke="#C9C0E2" stroke-width="2"/>${bulbs}` : ''}
    </g></g>`;
  const cabins = `<g transform="translate(${WX} ${-WZ})"><g class="sx-wheel" style="transform-origin:0px 0px">
    ${Array.from({ length: 8 }, (_, k) => {
      const a = (k / 8) * Math.PI * 2, px = Math.cos(a) * WR, py = Math.sin(a) * WR, c = PASTEL[k % 5];
      return `<g class="sx-cab"><path d="M${f(px)} ${f(py)} V${f(py + 12)}" stroke="#7A7090" stroke-width="2.4"/>
        <path d="M${f(px - 22)} ${f(py + 20)} Q${f(px)} ${f(py + 4)} ${f(px + 22)} ${f(py + 20)} Z" fill="${c}" ${line}/>
        <rect x="${f(px - 18)}" y="${f(py + 20)}" width="36" height="28" rx="7" fill="${CREAM}" ${line}/>
        <rect x="${f(px - 13)}" y="${f(py + 24)}" width="26" height="11" rx="3" fill="#CFE6F5"/>
        <path d="M${f(px - 18)} ${f(py + 41)} H${f(px + 18)}" stroke="${c}" stroke-width="4"/></g>`;
    }).join('')}</g></g>`;
  const legs = (front) => `<path d="M30 0 L${WX} ${-WZ} L290 0" fill="none" stroke="#3E3252" stroke-width="${front ? 13 : 11}" stroke-linecap="round" opacity=".45"/>
    <path d="M30 0 L${WX} ${-WZ} L290 0" fill="none" stroke="${front ? '#8E83B6' : '#7A6FA6'}" stroke-width="${front ? 10 : 8}" stroke-linecap="round"/>
    <path d="M78 -64 H242 M110 -104 H210" stroke="${front ? '#A99FCC' : '#8E83B6'}" stroke-width="4"/>`;
  const [h0x, h0y] = A(0.3, 2.5, WZ), [h1x, h1y] = A(1.12, 2.5, WZ);
  const kiosk = box({ u: 0.15, v: 3.75, w: 1.1, d: 0.6, h: 54, c: shades(NAVY),
    ll: `<rect x="8" y="8" width="${1.1 * 64 - 16}" height="20" rx="4" fill="#CFE6F5"/>${text(1.1 * 32, 44, 'TICKETS', 10, SUN)}` }) + box({ u: 0.1, v: 3.7, z: 54, w: 1.2, d: 0.7, h: 6, c: shades(SUN) });
  return isoItem(1.4, 5, 250, [{ w: 1.4, d: 5, svg: `
    ${shadow(0.7, 2.5, 1.5, 0.12)}
    ${box({ u: 0, v: 1.2, w: 1.4, d: 2.6, h: 14, c: shades('#E2DCEF'), tl: '<path d="M0 .6 H1.4 M0 1.3 H1.4 M0 2 H1.4" stroke="#fff" stroke-width=".03"/>' })}
    ${plane(0.3, legs(false))}
    ${plane(0.3, rim(false))}
    <path d="M${f(h0x)} ${f(h0y)} L${f(h1x)} ${f(h1y)}" stroke="#8E83B6" stroke-width="12" stroke-linecap="round"/>
    ${plane(0.72, cabins)}
    ${plane(1.12, rim(true))}
    <circle cx="${f(h1x)}" cy="${f(h1y)}" r="15" fill="#E8C766" ${line}/><circle cx="${f(h1x)}" cy="${f(h1y)}" r="6" fill="${LILAC}" ${line}/>
    ${plane(1.12, legs(true))}
    ${kiosk}` }]);
};

// ---------- carousel ----------
const horse = (cx, cy, sx, s, body, mane, saddle, delay) => `<g transform="translate(${f(cx)} ${f(cy)}) scale(${f(sx * s)} ${f(s)})"><g class="sx-horse" style="animation-delay:${delay}s">
  <path d="M-42 -6 Q-72 -2 -70 30 Q-60 14 -46 8 Z" fill="${mane}" stroke="${INK}" stroke-width="2"/>
  <path d="M30 10 L46 28 L42 44 M20 14 L26 46 M-30 10 L-44 38 M-20 14 L-26 46" stroke="${INK}" stroke-width="13" stroke-linecap="round" fill="none"/>
  <path d="M30 10 L46 28 L42 44 M20 14 L26 46 M-30 10 L-44 38 M-20 14 L-26 46" stroke="${body}" stroke-width="9" stroke-linecap="round" fill="none"/>
  <ellipse cx="0" cy="0" rx="48" ry="23" fill="${body}" stroke="${INK}" stroke-width="2.4"/>
  <path d="M26 -12 Q36 -42 52 -56 Q60 -64 72 -58 L86 -44 Q90 -38 82 -36 L66 -40 Q58 -24 42 8 Z" fill="${body}" stroke="${INK}" stroke-width="2.4"/>
  <path d="M28 -14 Q36 -42 52 -56 Q56 -62 62 -62 Q50 -48 44 -32 Q40 -20 36 -8 Z" fill="${mane}" stroke="${INK}" stroke-width="1.6"/>
  <path d="M-18 -18 Q0 -26 18 -18 L16 4 Q0 8 -16 4 Z" fill="${saddle}" stroke="${INK}" stroke-width="2"/></g></g>`;
const carouselArt = () => {
  const [cx, cy] = A(1.6, 1.6);
  const r = 1.5, rx = r * 90.5, ry = r * 45.25, pr = 1.02;
  const roofZ = 214, bandH = 24;
  const poles = Array.from({ length: 6 }, (_, k) => {
    const a = (k / 6) * Math.PI * 2 + 0.5, px = cx + Math.cos(a) * pr * 90.5, py = cy + Math.sin(a) * pr * 45.25;
    const cols = [['#FBF7EF', '#D6B36A', TURQ], ['#AFD6F7', LILAC, CORAL], ['#D9CCF6', TURQ, SUN]][k % 3];
    const pole = `<path d="M${f(px)} ${f(py - 18)} V${f(py - roofZ + 10)}" stroke="#B88F4A" stroke-width="5"/><path d="M${f(px)} ${f(py - 18)} V${f(py - roofZ + 10)}" stroke="#F6E2A8" stroke-width="1.6"/>`;
    return { s: Math.sin(a), d: `${pole}${horse(px, py - 78, Math.sin(a) >= 0 ? -1 : 1, 0.5, cols[0], cols[1], cols[2], -(k * 0.18).toFixed(2))}` };
  }).sort((p, q) => p.s - q.s);
  const back = poles.filter((p) => p.s < 0).map((p) => p.d).join(''), front = poles.filter((p) => p.s >= 0).map((p) => p.d).join('');
  const bandTop = cy - roofZ, bandBot = bandTop + bandH, RX = 1.62 * 90.5, RY = 1.62 * 45.25;
  const band = `M${f(cx - RX)} ${f(bandTop)} A${f(RX)} ${f(RY)} 0 0 0 ${f(cx + RX)} ${f(bandTop)} V${f(bandBot)} A${f(RX)} ${f(RY)} 0 0 1 ${f(cx - RX)} ${f(bandBot)} Z`;
  const arcPt = (t, y) => [cx - Math.cos(t * Math.PI) * RX, y + Math.sin(t * Math.PI) * RY];
  const scallops = Array.from({ length: 12 }, (_, i) => {
    const [x1, y1] = arcPt(i / 12, bandBot), [x2, y2] = arcPt((i + 1) / 12, bandBot);
    return `<path d="M${f(x1)} ${f(y1)} Q${f((x1 + x2) / 2)} ${f((y1 + y2) / 2 + 16)} ${f(x2)} ${f(y2)} Z" fill="${i % 2 ? CREAM : '#9EDDD4'}" ${line}/>`;
  }).join('');
  const bulbPts = Array.from({ length: 11 }, (_, i) => arcPt((i + 0.5) / 11, bandTop + bandH / 2));
  return isoItem(3.2, 3.2, 230, [{ w: 3.2, d: 3.2, svg: `
    <defs><clipPath id="funfair-bandclip"><path d="${band}"/></clipPath>
      <radialGradient id="funfair-bglow"><stop offset="0" stop-color="#FFF3B0" stop-opacity=".9"/><stop offset="1" stop-color="#FFF3B0" stop-opacity="0"/></radialGradient></defs>
    ${shadow(1.6, 1.6, 1.62, 0.14)}
    ${cyl(1.6, 1.6, 0, r, 18, shades('#E9E1F2'))}
    <ellipse cx="${f(cx)}" cy="${f(cy - 18)}" rx="${f(rx - 10)}" ry="${f(ry - 5)}" fill="none" stroke="#D6B36A" stroke-width="3"/>
    ${box({ u: 1.3, v: 3.0, w: 0.6, d: 0.3, h: 9, c: shades('#E2DCEF') })}
    ${back}
    ${cyl(1.6, 1.6, 18, 0.3, roofZ - 18, shades('#8FC3F0'), false)}
    ${[40, 84, 128].map((z) => `<rect x="${f(cx - 14)}" y="${f(cy - 18 - z - 30)}" width="28" height="34" rx="6" fill="#E9F4FB" ${line} opacity=".9"/>`).join('')}
    ${front}
    ${cone(cx, bandTop, RX, RY, 80, [LILAC, CREAM], 14)}
    <path d="${band}" fill="${TURQ}"/>
    <g clip-path="url(#funfair-bandclip)"><g class="sx-band">${Array.from({ length: 22 }, (_, i) => `<path d="M${f(cx - RX - 24 + i * 24)} ${f(bandTop - 10)} l12 0 l-14 ${bandH + RY + 10} l-12 0 Z" fill="#fff" opacity=".22"/>`).join('')}</g></g>
    <path d="${band}" fill="none" ${line}/>
    ${scallops}
    <g class="sx-glow" opacity="0">${bulbPts.map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="12" fill="url(#funfair-bglow)"/>`).join('')}</g>
    ${bulbPts.map(([x, y]) => `<circle class="sx-bulb" cx="${f(x)}" cy="${f(y)}" r="4" fill="${CREAM}" stroke="${INK}" stroke-width="1"/>`).join('')}
    <circle cx="${f(cx)}" cy="${f(bandTop - 84)}" r="9" fill="#E8C766" ${line}/>
    <path d="M${f(cx)} ${f(bandTop - 92)} V${f(bandTop - 116)}" stroke="#3E3252" stroke-width="2"/><path d="M${f(cx)} ${f(bandTop - 116)} l20 6 -20 6 z" fill="${CORAL}" ${line}/>` }]);
};

// ---------- high striker ----------
const STRIKE_TRAVEL = 206;
const strikerArt = () => {
  const pole = shades('#F3EFF9');
  const stripes = ['#E58F6A', '#F5DE7A', '#B79CF0', '#8FC3F0', '#3CC7B8'];
  const [bx, by] = A(0.4, 0.4, 250), [px, py] = A(0.4, 0.4, 24);
  return isoItem(0.8, 0.8, 280, [{ w: 0.8, d: 0.8, svg: `
    ${shadow(0.4, 0.4, 0.45)}
    ${box({ u: 0.05, v: 0.05, w: 0.7, d: 0.7, h: 16, c: shades(NAVY), ll: `<rect x="6" y="5" width="${0.7 * 64 - 12}" height="6" rx="3" fill="#9EDDD4"/>` })}
    ${box({ u: 0.2, v: 0.5, z: 16, w: 0.4, d: 0.22, h: 6, c: shades('#9EDDD4') })}
    ${box({ u: 0.32, v: 0.32, z: 16, w: 0.16, d: 0.16, h: 228, c: pole,
      ll: `${stripes.map((c, i) => `<rect x="2" y="${4 + i * 45}" width="${0.16 * 64 - 4}" height="42" fill="${c}" opacity=".6"/>`).join('')}${Array.from({ length: 18 }, (_, i) => `<path d="M0 ${10 + i * 12} H${i % 2 ? 4 : 7}" stroke="#3E3252" stroke-width="1.2" opacity=".6"/>`).join('')}` })}
    <path d="M${f(bx - 16)} ${f(by + 4)} Q${f(bx - 16)} ${f(by - 22)} ${f(bx)} ${f(by - 22)} Q${f(bx + 16)} ${f(by - 22)} ${f(bx + 16)} ${f(by + 4)} L${f(bx + 19)} ${f(by + 12)} H${f(bx - 19)} Z" fill="#E8C766" ${line}/>
    <path d="M${f(bx - 8)} ${f(by - 12)} Q${f(bx - 4)} ${f(by - 18)} ${f(bx + 2)} ${f(by - 18)}" stroke="#fff" stroke-width="2.4" fill="none" opacity=".7"/>
    <g class="sx-puck"><rect x="${f(px - 15)}" y="${f(py - 12)}" width="30" height="13" rx="5" fill="${CORAL}" ${line}/><rect x="${f(px - 10)}" y="${f(py - 10)}" width="12" height="3" rx="1.5" fill="#fff" opacity=".5"/></g>
    <g transform="rotate(-22 ${f(px + 30)} ${f(py + 30)})"><rect x="${f(px + 27)}" y="${f(py - 34)}" width="6" height="64" rx="3" fill="${WOOD}" ${line}/><rect x="${f(px + 18)}" y="${f(py - 46)}" width="24" height="16" rx="4" fill="${LILAC}" ${line}/></g>` }]);
};

// ---------- hay bale (a star hides under it) ----------
const hayArt = () => {
  const hay = shades('#E9CF84');
  const straw = (len, n) => Array.from({ length: n }, (_, i) => `<path d="M${4 + i * (len / n)} ${6 + (i % 3) * 4} L${2 + i * (len / n)} ${50 - (i % 2) * 6}" stroke="#C9A24E" stroke-width="1.4" opacity=".7"/>`).join('');
  return isoItem(1.1, 0.8, 70, [{ w: 1.1, d: 0.8, svg: `
    ${shadow(0.55, 0.4, 0.62, 0.14)}
    ${box({ u: 0.03, v: 0.03, w: 1.04, d: 0.74, h: 56, c: hay,
      ll: `${straw(1.04 * 64, 12)}<rect x="18" y="0" width="5" height="56" fill="#A47E52"/><rect x="${1.04 * 64 - 23}" y="0" width="5" height="56" fill="#A47E52"/>`,
      rl: `${straw(0.74 * 64, 8)}`,
      tl: '<path d="M.28 0 V.74 M.76 0 V.74" stroke="#A47E52" stroke-width=".05"/><path d="M.1 .2 l.08 -.06 M.5 .4 l.1 .03 M.9 .5 l-.07 -.07 M.4 .62 l.06 .05" stroke="#C9A24E" stroke-width=".025"/>' })}
    ${[[0.2, 0.2], [0.7, 0.1], [0.95, 0.5]].map(([u, v]) => { const [x, y] = A(u, v, 56); return `<path d="M${f(x)} ${f(y)} l-4 -9 M${f(x + 3)} ${f(y)} l3 -10" stroke="#D9B866" stroke-width="2" stroke-linecap="round"/>`; }).join('')}` }]);
};

// ---------- treat carts ----------
const wheels = (len, y = 50) => [16, len - 16].map((x) => `<circle cx="${x}" cy="${y}" r="15" fill="${CREAM}" ${line}/><circle cx="${x}" cy="${y}" r="10" fill="none" stroke="#B9B0D2" stroke-width="2"/><circle cx="${x}" cy="${y}" r="3.4" fill="${LILAC}"/>`).join('');
const cottonCartArt = () => {
  const body = shades('#B9DCF2'), metal = shades('#C9CDD9');
  const [dx, dy] = A(0.65, 0.5, 82);
  const roof = A(0.65, 0.5, 168);
  return isoItem(1.4, 1.0, 200, [{ w: 1.4, d: 1, svg: `
    ${shadow(0.7, 0.5, 0.75)}
    ${box({ u: 0.1, v: 0.1, z: 20, w: 1.1, d: 0.8, h: 56, c: body,
      ll: `<rect x="6" y="6" width="${1.1 * 64 - 12}" height="22" rx="5" fill="${CREAM}" ${line}/>${text(1.1 * 32, 22, 'Cotton Candy', 9.5, '#7A64B0')}<path d="M0 36 H${1.1 * 64}" stroke="#fff" stroke-width="3" opacity=".6"/>${wheels(1.1 * 64, 54)}`,
      rl: `<rect x="6" y="8" width="${0.8 * 64 - 12}" height="30" rx="5" fill="#fff" opacity=".35"/>` })}
    ${[[0.15, 0.15], [1.15, 0.15]].map(([u, v]) => seg([u, v, 76], [u, v, 150], '#B9B0D2', 4)).join('')}
    ${cyl(0.65, 0.5, 76, 0.32, 22, metal)}
    <path d="M${f(dx - 30)} ${f(dy - 2)} Q${f(dx - 34)} ${f(dy - 34)} ${f(dx - 6)} ${f(dy - 36)} Q${f(dx + 10)} ${f(dy - 52)} ${f(dx + 26)} ${f(dy - 32)} Q${f(dx + 38)} ${f(dy - 18)} ${f(dx + 28)} ${f(dy - 2)} Z" fill="#E6DDFA" ${line}/>
    <path d="M${f(dx - 14)} ${f(dy - 30)} Q${f(dx)} ${f(dy - 42)} ${f(dx + 14)} ${f(dy - 32)}" stroke="#fff" stroke-width="4" fill="none" opacity=".8" stroke-linecap="round"/>
    ${[[0.15, 0.85], [1.15, 0.85]].map(([u, v]) => seg([u, v, 76], [u, v, 150], '#B9B0D2', 4)).join('')}
    ${cone(roof[0], roof[1], 100, 50, 26, [LILAC, CREAM], 10)}
    ${[[0.4, 0.95], [0.9, 0.95]].map(([u, v], i) => { const [x, y] = A(u, v, 76); return `<path d="M${f(x)} ${f(y)} L${f(x - 3)} ${f(y - 30)}" stroke="${CREAM}" stroke-width="3"/><circle cx="${f(x - 3)}" cy="${f(y - 38)}" r="10" fill="${i ? '#AFD6F7' : '#C9B8F2'}" ${line}/>`; }).join('')}` }]);
};
const popcornCartArt = () => {
  const body = shades('#F7E7A6'), glass = { top: '#FFFDF4', left: '#FFF8E1', right: '#F4EBD0' };
  const pts = Array.from({ length: 16 }, (_, i) => [0.18 + ((i * 0.37) % 0.85), 0.18 + ((i * 0.23) % 0.62)]);
  const apex = A(0.6, 0.5, 178), c = [A(0.05, 0.05, 140), A(1.15, 0.05, 140), A(1.15, 0.95, 140), A(0.05, 0.95, 140)];
  return isoItem(1.2, 1.0, 200, [{ w: 1.2, d: 1, svg: `
    ${shadow(0.6, 0.5, 0.68)}
    ${box({ u: 0.1, v: 0.1, z: 20, w: 1.0, d: 0.8, h: 52, c: body,
      ll: `${[0, 1, 2, 3, 4].map((i) => `<rect x="${6 + i * 12}" y="4" width="6" height="44" fill="${CORAL}" opacity=".55"/>`).join('')}${wheels(64, 52)}`,
      rl: `${[0, 1, 2, 3].map((i) => `<rect x="${4 + i * 12}" y="4" width="6" height="44" fill="${CORAL}" opacity=".55"/>`).join('')}` })}
    ${box({ u: 0.15, v: 0.15, z: 72, w: 0.9, d: 0.7, h: 64, c: glass, ln: true })}
    ${pts.map(([u, v], i) => { const [x, y] = A(u, v, 80 + (i % 4) * 6); return `<circle cx="${f(x)}" cy="${f(y)}" r="5.5" fill="#FFF3C8" ${line}/>`; }).join('')}
    ${quad([[0.15, 0.85, 72], [1.05, 0.85, 72], [1.05, 0.85, 136], [0.15, 0.85, 136]], '#fff', 'fill-opacity=".35" stroke="#3E3252" stroke-opacity=".4" stroke-width="1.2"')}
    ${quad([[1.05, 0.85, 72], [1.05, 0.15, 72], [1.05, 0.15, 136], [1.05, 0.85, 136]], '#fff', 'fill-opacity=".25" stroke="#3E3252" stroke-opacity=".4" stroke-width="1.2"')}
    <polygon points="${P([c[3], c[2], apex])}" fill="${CORAL}" ${line}/><polygon points="${P([c[2], c[1], apex])}" fill="#C9745A" ${line}/>
    <g transform="matrix(1,0.5,0,1,${f(A(0.15, 0.95, 140)[0])},${f(A(0.15, 0.95, 140)[1] - 18)})"><rect width="${0.9 * 64}" height="18" rx="4" fill="${CREAM}" ${line}/>${text(0.9 * 32, 13, 'POPCORN', 10, CORAL)}</g>
    <circle cx="${f(apex[0])}" cy="${f(apex[1] - 4)}" r="6" fill="${SUN}" ${line}/>` }]);
};

const cottonArt = (c1, c2) => svg(70, 120, `
  <defs><radialGradient id="funfair-floss-${c1.slice(1)}" cx=".4" cy=".35"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
  <path d="M35 60 L28 118 H42 Z" fill="${CREAM}" stroke="${INK}" stroke-width="1.8"/><path d="M31 80 L39 76 M30 96 L40 92" stroke="${TURQ}" stroke-width="3"/>
  <g fill="url(#funfair-floss-${c1.slice(1)})" stroke="${INK}" stroke-width="1.6"><circle cx="22" cy="40" r="18"/><circle cx="48" cy="40" r="18"/><circle cx="35" cy="24" r="20"/><circle cx="35" cy="50" r="17"/></g>
  <path d="M24 22 Q32 14 42 18" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`);
const popcornArt = () => svg(70, 92, `
  <path d="M8 30 L62 30 L54 90 H16 Z" fill="${CREAM}" stroke="${INK}" stroke-width="1.8"/>
  <path d="M18 30 L22 90 M33 30 V90 M48 30 L45 90" stroke="${CORAL}" stroke-width="7"/>
  <path d="M8 30 L62 30 L54 90 H16 Z" fill="none" stroke="${INK}" stroke-width="1.8"/>
  <g fill="#FFF8E1" stroke="${INK}" stroke-width="1.3">${[[16, 24], [28, 16], [40, 20], [54, 24], [22, 8], [36, 6], [48, 12], [34, 28]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8"/>`).join('')}</g>
  <g fill="${SUN}" opacity=".7">${[[18, 22], [38, 8], [50, 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>`);
const wear = (kind, id, iso, s = 0.6) => { const d = wearable(kind, 0, 0, id, iso); return { ...d, w: d.w * s, h: d.h * s, ax: d.ax * s, ay: d.ay * s }; };
const clampG = (gx, gy, fw = 0.3, fd = 0.3) => [Math.max(0, Math.min(R.cols - fw, gx)), Math.max(0, Math.min(R.rows - fd, gy))];

function treat(api, kind, gx, gy) {
  const cotton = kind === 'cotton';
  const n = api.count(kind);
  const cols = [['#C9B8F2', '#9A80D8'], ['#AFD6F7', '#6FA8DC'], ['#9EDDD4', TURQ]][n % 3];
  const [x, y] = clampG(gx, gy);
  return api.add({
    id: api.uid(kind), w: 49, h: cotton ? 84 : 64, cls: 'food', small: true,
    gx: x, gy: y, gz: 0, fw: 0.3, fd: 0.3, ax: 24, ay: cotton ? 82 : 62,
    art: () => (cotton ? cottonArt(cols[0], cols[1]) : popcornArt()),
    onGive: (i, a, who) => a.eat(i, who, cotton ? 'Fluffy and sweet! 🍭' : 'Pop pop, yum! 🍿', cotton ? ['🍭', '✨', '💜'] : ['🍿', '✨', '💛']),
  }, { spawned: true });
}

// ---------- balloons ----------
function balloon(api, gx, gy) {
  const c = PASTEL[api.count('balloon') % 5];
  const gid = 'funfair-bal-' + c.slice(1);
  const [x, y] = clampG(gx, gy, 0.4, 0.4);
  return api.add({
    id: api.uid('balloon'), w: 56, h: 140, cls: 'sx-balloon', small: true,
    gx: x, gy: y, gz: 0, fw: 0.4, fd: 0.4, ax: 27, ay: 138,
    onTap: (i, a) => {
      if (i.el.classList.contains('sx-float')) return;
      i.el.classList.add('sx-float'); a.sfx.pop();
      a.bubble(i.x + i.w / 2, i.y - 8, 'Up, up and away! 🎈');
      a.later(() => a.remove(i), 2600);
    },
    onGive: (i, a, who) => {
      [i.gx, i.gy] = clampG(who.gx + 0.35, who.gy + 0.1, 0.4, 0.4); i.gz = 70; a.place(i);
      a.react(who, 'A balloon for me! 🎈', ['🎈', '💜', '✨']);
    },
    art: () => svg(80, 200, `
      <defs><radialGradient id="${gid}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".25" stop-color="${c}"/><stop offset="1" stop-color="${c}"/></radialGradient></defs>
      <path d="M40 92 Q30 120 44 146 Q56 172 38 198" stroke="${INK}" stroke-width="1.6" fill="none"/>
      <path d="M40 4 C70 4 76 34 72 52 C66 76 50 88 40 90 C30 88 14 76 8 52 C4 34 10 4 40 4 Z" fill="url(#${gid})" stroke="${INK}" stroke-width="2"/>
      <path d="M34 90 L46 90 L42 98 H38 Z" fill="${c}" stroke="${INK}" stroke-width="1.4"/>
      <path d="M22 26 Q26 14 38 12" stroke="#fff" stroke-width="4" fill="none" opacity=".75" stroke-linecap="round"/>`),
  }, { spawned: true });
}
const balloonStandArt = () => {
  const [x, y] = A(0.4, 0.4, 40);
  const tie = [x, y - 120];
  const bs = [[-30, -190], [0, -212], [30, -192], [-18, -164], [18, -166], [0, -146], [-40, -156], [40, -158]];
  return isoItem(0.8, 0.8, 250, [{ w: 0.8, d: 0.8, svg: `
    <defs>${PASTEL.map((c) => `<radialGradient id="funfair-sb-${c.slice(1)}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".3" stop-color="${c}"/><stop offset="1" stop-color="${c}"/></radialGradient>`).join('')}</defs>
    ${shadow(0.4, 0.4, 0.45)}
    ${box({ u: 0.05, v: 0.05, w: 0.7, d: 0.7, h: 40, c: shades(NAVY), ll: `<rect x="4" y="8" width="${0.7 * 64 - 8}" height="18" rx="4" fill="${CREAM}" ${line}/>${text(0.7 * 32, 20.5, 'BALLOONS', 6.6, '#7A64B0')}` })}
    <path d="M${f(x)} ${f(y)} V${f(tie[1])}" stroke="${WOOD}" stroke-width="5" stroke-linecap="round"/>
    ${bs.map(([dx, dy]) => `<path d="M${f(x + dx)} ${f(y + dy + 22)} Q${f(x + dx * 0.4)} ${f(y + dy + 70)} ${f(tie[0])} ${f(tie[1])}" stroke="${INK}" stroke-width="1.1" fill="none" opacity=".7"/>`).join('')}
    ${bs.map(([dx, dy], i) => `<ellipse cx="${f(x + dx)}" cy="${f(y + dy)}" rx="18" ry="22" fill="url(#funfair-sb-${PASTEL[i % 5].slice(1)})" stroke="${INK}" stroke-width="1.6"/><path d="M${f(x + dx - 9)} ${f(y + dy - 9)} Q${f(x + dx - 6)} ${f(y + dy - 16)} ${f(x + dx)} ${f(y + dy - 17)}" stroke="#fff" stroke-width="2.4" fill="none" opacity=".7" stroke-linecap="round"/>`).join('')}` }]);
};

// ---------- hit the cans (mini-game) ----------
const CANS = [[90, 150], [150, 150], [210, 150], [120, 100], [180, 100], [150, 50]];
const RESTS_ON = { 3: [0, 1], 4: [1, 2], 5: [3, 4] };
function cansGame(api) {
  const counter = api.get('boothCounter');
  api.modal((card) => {
    let up, balls, over, mx = 60, dir = 1;
    card.innerHTML += `<h2>Hit the cans!</h2><p class="m-status"></p>
      <svg class="funfair-cans" viewBox="0 0 300 220" style="width:min(320px,74vw);height:auto;display:block;margin:0 auto 8px;border-radius:14px;background:linear-gradient(#EAF4FB,#FBF7EF)"></svg>
      <p class="m-balls" style="font-size:22px;letter-spacing:4px;min-height:30px;margin-bottom:8px"></p>
      <div class="opt-row"><button class="btn throw">Throw! ⚾</button><button class="btn alt again">New game</button></div>`;
    const board = card.querySelector('.funfair-cans'), status = card.querySelector('.m-status'), ballsEl = card.querySelector('.m-balls');
    const canSvg = (x, y, i, down) => {
      const c = PASTEL[i % 5];
      const t = down ? `translate(${x + (i % 2 ? 26 : -26)} 190) rotate(${i % 2 ? 90 : -90})` : `translate(${x} ${y})`;
      return `<g transform="${t}" opacity="${down ? 0.6 : 1}"><rect x="-20" y="-24" width="40" height="48" rx="5" fill="${c}" stroke="${INK}" stroke-width="2"/>
        <rect x="-20" y="-10" width="40" height="18" fill="${CREAM}" opacity=".85"/><ellipse cx="0" cy="-24" rx="20" ry="4" fill="#E2DFE8" stroke="${INK}" stroke-width="1.6"/>
        <rect x="-14" y="-20" width="4" height="40" rx="2" fill="#fff" opacity=".45"/></g>`;
    };
    const draw = (hit) => {
      board.innerHTML = `<rect x="40" y="176" width="220" height="12" rx="3" fill="#C9A57C" stroke="${INK}" stroke-width="2"/><path d="M60 188 V214 M240 188 V214" stroke="#A9835A" stroke-width="6"/>
        ${CANS.map(([x, y], i) => canSvg(x, y, i, !up[i])).join('')}
        ${hit ? `<circle cx="${hit[0]}" cy="${hit[1]}" r="9" fill="${CREAM}" stroke="${INK}" stroke-width="2"/><path d="M${hit[0] - 4} ${hit[1] - 6} Q${hit[0] + 2} ${hit[1]} ${hit[0] - 4} ${hit[1] + 6}" stroke="${CORAL}" stroke-width="1.6" fill="none"/>` : ''}
        <g class="aim"><path d="M0 8 L-9 24 H9 Z" fill="${CORAL}" stroke="${INK}" stroke-width="1.6"/><path d="M0 0 V10" stroke="${CORAL}" stroke-width="2" stroke-dasharray="3 3"/></g>`;
      ballsEl.textContent = '⚾'.repeat(balls) || ' ';
      placeAim();
    };
    const placeAim = () => board.querySelector('.aim')?.setAttribute('transform', `translate(${mx.toFixed(1)} 190)`);
    const reset = () => { up = CANS.map(() => true); balls = 5; over = false; status.textContent = 'Tap Throw when the arrow is under a can. Bottom cans topple the ones above!'; draw(); };
    const tick = () => {
      if (!card.isConnected) return;
      if (!over) { mx += dir * 3.2; if (mx > 250) { mx = 250; dir = -1; } if (mx < 50) { mx = 50; dir = 1; } placeAim(); }
      requestAnimationFrame(tick);
    };
    card.querySelector('.throw').onclick = () => {
      if (over || balls <= 0) return;
      balls--;
      api.sfx.boing();
      // the ball hits the highest standing can near the arrow
      const near = CANS.map((p, i) => [i, p]).filter(([i, [x]]) => up[i] && Math.abs(x - mx) <= 22).sort((a, b) => a[1][1] - b[1][1]);
      let hit = null;
      if (near.length) {
        const [i, p] = near[0];
        hit = p; up[i] = false;
        let fell = true;
        while (fell) { fell = false; for (const k in RESTS_ON) if (up[k] && RESTS_ON[k].some((s) => !up[s])) { up[k] = false; fell = true; } }
        api.sfx.pop();
      }
      const left = up.filter(Boolean).length;
      if (!left) {
        over = true; draw(hit); api.sfx.win();
        status.textContent = 'All cans down! You win! 🎉';
        api.earn(10); if (!api.starFound('funfair-cans')) { api.addStar('funfair-cans', 0, 0, { spawned: true, gx: counter.gx + 1.2, gy: counter.gy + 0.1, gz: COUNTER_H }); status.textContent += ' A star appeared at the booth! ⭐'; }
        return;
      }
      if (!balls) { over = true; draw(hit); status.textContent = `${6 - left} cans down — out of balls! Try again 🔄`; return; }
      status.textContent = hit ? ['Nice hit! 🎯', 'Clang! 💥', 'Great throw! ⚾'][Math.floor(Math.random() * 3)] : 'Missed! Watch the arrow 👀';
      draw(hit);
    };
    card.querySelector('.again').onclick = () => { api.sfx.click(); reset(); };
    reset();
    tick();
  });
}

// ---------- the cans booth: back wall with prizes + awning, and a counter in front ----------
const COUNTER_H = 62;
const boothBackArt = () => {
  const post = shades(WOOD), wall = shades('#DDEBF5');
  const planks = Array.from({ length: 11 }, (_, i) => `<path d="M${10 + i * 16} 0 V150" stroke="#BCD6E8" stroke-width="2"/>`).join('');
  const prizes = [[30, 50, LILAC], [72, 44, '#9EDDD4'], [116, 50, SUN], [156, 46, SKY]].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><circle r="13" fill="${c}" ${line}/><circle cx="-9" cy="-11" r="5" fill="${c}" ${line}/><circle cx="9" cy="-11" r="5" fill="${c}" ${line}/><ellipse cx="0" cy="5" rx="6" ry="4" fill="#fff" opacity=".6"/></g>`).join('');
  const shelf = box({ u: 0.7, v: 0.38, z: 74, w: 1.4, d: 0.3, h: 6, c: shades('#C9A57C') });
  const cans = [[0.95, 0.5, 0], [1.4, 0.5, 0], [1.85, 0.5, 0], [1.17, 0.5, 21], [1.62, 0.5, 21], [1.4, 0.5, 42]].map(([u, v, dz], i) => cyl(u, v, 80 + dz, 0.1, 20, shades(PASTEL[i % 5]))).join('');
  const aw = [[0, 0.2, 226], [2.8, 0.2, 226], [2.8, 1.9, 196], [0, 1.9, 196]];
  const stripes = Array.from({ length: 7 }, (_, i) => quad([[i * 0.4, 0.2, 226], [i * 0.4 + 0.2, 0.2, 226], [i * 0.4 + 0.2, 1.9, 196], [i * 0.4, 1.9, 196]], TURQ, 'stroke="none"')).join('');
  const scal = Array.from({ length: 8 }, (_, i) => { const [x1, y1] = A(i * 0.35, 1.9, 196), [x2, y2] = A((i + 1) * 0.35, 1.9, 196); return `<path d="M${f(x1)} ${f(y1)} Q${f((x1 + x2) / 2)} ${f((y1 + y2) / 2 + 14)} ${f(x2)} ${f(y2)} Z" fill="${i % 2 ? TURQ : CREAM}" ${line}/>`; }).join('');
  return isoItem(2.8, 0.4, 240, [{ w: 2.8, d: 0.4, svg: `
    ${box({ u: 0.1, v: 0.05, w: 2.6, d: 0.12, h: 196, c: wall, ll: `${planks}<rect x="0" y="150" width="${2.6 * 64}" height="46" fill="#C9DDEB"/>${prizes}` })}
    ${shelf}${cans}
    ${box({ u: 0, v: 0.05, w: 0.14, d: 0.14, h: 200, c: post })}${box({ u: 2.66, v: 0.05, w: 0.14, d: 0.14, h: 200, c: post })}
    ${seg([0.07, 0.15, 200], [0.07, 1.9, 194], WOOD, 4)}${seg([2.73, 0.15, 200], [2.73, 1.9, 194], WOOD, 4)}
    ${quad(aw, CREAM)}${stripes}${quad(aw, 'none')}${scal}` }]);
};
const boothCounterArt = () => {
  const wood = shades('#E2C49B');
  return isoItem(2.8, 0.6, 90, [{ w: 2.8, d: 0.6, svg: `
    ${shadow(1.4, 0.3, 1.0, 0.1)}
    ${box({ u: 0.05, v: 0.05, w: 2.7, d: 0.5, h: COUNTER_H - 8, c: wood,
      ll: `${Array.from({ length: 4 }, (_, i) => `<path d="M0 ${12 + i * 11} H${2.7 * 64}" stroke="#A9835A" stroke-width="1.4" opacity=".6"/>`).join('')}
        <path d="M0 0 Q${2.7 * 16} 16 ${2.7 * 32} 0 Q${2.7 * 48} 16 ${2.7 * 64} 0 Z" fill="${LILAC}" ${line}/>
        <rect x="${2.7 * 32 - 52}" y="20" width="104" height="22" rx="6" fill="${NAVY}" ${line}/>${text(2.7 * 32, 36, 'HIT THE CANS', 12, SUN)}`,
      rl: `<path d="M0 0 Q${0.5 * 32} 14 ${0.5 * 64} 0 Z" fill="${LILAC}" ${line}/>` })}
    ${box({ u: 0, v: 0, z: COUNTER_H - 8, w: 2.8, d: 0.6, h: 8, c: shades(CREAM) })}
    ${[[0.5, 0.3], [0.7, 0.32], [0.6, 0.18]].map(([u, v]) => { const [x, y] = A(u, v, COUNTER_H); return `<circle cx="${f(x)}" cy="${f(y - 6)}" r="6" fill="${CREAM}" ${line}/><path d="M${f(x - 3)} ${f(y - 10)} q4 4 0 8" stroke="${CORAL}" stroke-width="1.4" fill="none"/>`; }).join('')}` }]);
};

// ---------- photo booth ----------
const photoboothArt = () => {
  const body = shades('#5E4E74');
  const bulbs = Array.from({ length: 7 }, (_, i) => `<circle cx="${6 + i * 9.4}" cy="-2" r="3" fill="#FFF3B0" stroke="${INK}" stroke-width=".8"/>`).join('');
  return isoItem(1.2, 1.4, 230, [{ w: 1.2, d: 1.4, svg: `
    ${shadow(0.6, 0.7, 0.8)}
    ${box({ u: 0.1, v: 0.1, w: 1.0, d: 1.2, h: 186, c: body,
      ll: `<rect x="6" y="14" width="${64 - 12}" height="160" rx="3" fill="#2E2448"/>
        <path d="M6 14 H58 V174 Q50 168 44 174 Q36 168 30 174 Q22 168 14 174 Q8 168 6 174 Z" fill="#B79CF0" ${line}/>
        <path d="M16 18 Q19 90 15 170 M30 18 Q27 90 31 170 M44 18 Q47 90 43 170" stroke="#7A64B0" stroke-width="2" fill="none" opacity=".6"/>
        <rect x="2" y="8" width="${64 - 4}" height="7" rx="3" fill="#D6B36A"/>`,
      rl: `<g transform="translate(10 30)"><rect width="30" height="88" rx="3" fill="${CREAM}" ${line}/>${[0, 1, 2].map((k) => `<rect x="4" y="${4 + k * 28}" width="22" height="24" fill="${['#CFE6F5', '#E6DDFA', '#D5ECE8'][k]}"/><circle cx="15" cy="${16 + k * 28}" r="6" fill="${PASTEL[k + 1]}"/>`).join('')}</g>
        <g transform="translate(${1.2 * 64 - 32} 120)"><rect width="20" height="30" rx="3" fill="#2E2448" stroke="#D6B36A" stroke-width="1.6"/><circle cx="10" cy="18" r="5" fill="${TURQ}"/></g>` })}
    ${box({ u: 0.05, v: 0.05, z: 186, w: 1.1, d: 1.3, h: 26, c: shades(SUN), ll: `${bulbs}${text(36, 19, 'PHOTOS', 13, INK)}` })}` }]);
};

// ---------- string lights between two posts ----------
const lightsArt = (along) => (it) => {
  const on = it?.data.on !== false;
  const L = 3.4, H = 136;
  const p0 = along === 'gy' ? [0.12, 0.1] : [0.1, 0.12], p1 = along === 'gy' ? [0.12, L - 0.1] : [L - 0.1, 0.12];
  const [ax, ay] = A(p0[0], p0[1], H), [bx, by] = A(p1[0], p1[1], H);
  const mx = (ax + bx) / 2, my = (ay + by) / 2 + 52;
  const pt = (t) => [(1 - t) ** 2 * ax + 2 * (1 - t) * t * mx + t * t * bx, (1 - t) ** 2 * ay + 2 * (1 - t) * t * my + t * t * by];
  const cols = ['#F5DE7A', '#9EDDD4', '#C9B8F2', '#8FC3F0', '#F0B39A'];
  const bulbs = Array.from({ length: 9 }, (_, i) => { const [x, y] = pt((i + 1) / 10); return `${on ? `<circle cx="${f(x)}" cy="${f(y + 8)}" r="12" fill="${cols[i % 5]}" opacity=".35"/>` : ''}<ellipse cx="${f(x)}" cy="${f(y + 8)}" rx="5" ry="7" fill="${on ? cols[i % 5] : '#D8D2E6'}" ${line}/>`; }).join('');
  const flags = Array.from({ length: 8 }, (_, i) => { const [x, y] = pt((i + 0.5) / 8); return `<path d="M${f(x - 8)} ${f(y + 22)} L${f(x + 8)} ${f(y + 22)} L${f(x)} ${f(y + 38)} Z" fill="${PASTEL[i % 5]}" opacity=".9"/>`; }).join('');
  const post = (u, v) => `${cyl(u, v, 0, 0.07, 8, shades(NAVY))}${cyl(u, v, 8, 0.025, H - 4, shades('#7A64B0'))}`;
  const fw = along === 'gy' ? 0.25 : L, fd = along === 'gy' ? L : 0.25;
  return isoItem(fw, fd, H + 20, [{ w: fw, d: fd, svg: `
    ${post(...p0)}
    <path d="M${f(ax)} ${f(ay + 16)} Q${f(mx)} ${f(my + 16)} ${f(bx)} ${f(by + 16)}" stroke="${INK}" stroke-width="1.2" fill="none" opacity=".5"/>${flags}
    <path d="M${f(ax)} ${f(ay)} Q${f(mx)} ${f(my)} ${f(bx)} ${f(by)}" stroke="#fff" stroke-opacity="0" stroke-width="44" fill="none"/>
    <path d="M${f(ax)} ${f(ay)} Q${f(mx)} ${f(my)} ${f(bx)} ${f(by)}" stroke="${INK}" stroke-width="2" fill="none"/>${bulbs}
    ${post(...p1)}
    <circle cx="${f(ax)}" cy="${f(ay)}" r="4" fill="${SUN}" ${line}/><circle cx="${f(bx)}" cy="${f(by)}" r="4" fill="${SUN}" ${line}/>` }]);
};

// ---------- little extras ----------
const binArt = () => isoItem(0.5, 0.5, 70, [{ w: 0.5, d: 0.5, svg: `${shadow(0.25, 0.25, 0.22)}
  ${cyl(0.25, 0.25, 0, 0.16, 44, shades(TURQ))}${cyl(0.25, 0.25, 44, 0.18, 6, shades(NAVY))}
  ${(() => { const [x, y] = A(0.25, 0.25, 22); return `<path d="M${f(x - 6)} ${f(y - 6)} l6 -8 l6 8 M${f(x + 6)} ${f(y + 4)} h-12" stroke="#fff" stroke-width="2.4" fill="none" opacity=".8"/>`; })()}` }]);
const planterArt = (col) => () => {
  const [x, y] = A(0.35, 0.35, 34);
  return isoItem(0.7, 0.7, 90, [{ w: 0.7, d: 0.7, svg: `${shadow(0.35, 0.35, 0.4)}
    ${box({ u: 0.05, v: 0.05, w: 0.6, d: 0.6, h: 34, c: shades(CREAM), ll: `<rect y="10" width="${0.6 * 64}" height="8" fill="${col}"/>`, rl: `<rect y="10" width="${0.6 * 64}" height="8" fill="${col}"/>` })}
    <circle cx="${f(x - 10)}" cy="${f(y - 10)}" r="13" fill="#5AAE6A" ${line}/><circle cx="${f(x + 10)}" cy="${f(y - 12)}" r="12" fill="#6DBE7A" ${line}/><circle cx="${f(x)}" cy="${f(y - 22)}" r="12" fill="#8FD39A" ${line}/>
    ${[[-12, -18, LILAC], [8, -26, SUN], [14, -10, SKY], [-2, -32, '#9EDDD4']].map(([dx, dy, c]) => `<circle cx="${f(x + dx)}" cy="${f(y + dy)}" r="4.4" fill="${c}" ${line}/>`).join('')}` }]);
};

export const FUNFAIR = {
  id: 'funfair', posKey: 'funfair-iso', title: 'Fun Fair 🎡', weather: true, outdoor: true, light: 'outdoor', avatar: [5.6, 3.2],
  frame: (w) => (w === 'sun' ? 'linear-gradient(#BFE0F4, #FFF1D6)' : 'linear-gradient(#A6AFC2, #CDD4DF)'),
  iso: R,
  bg,
  stars: [{ id: 'funfair-hay', gx: 2.75, gy: 1.5 }],
  characters: [
    { id: 'leo', look: { ...NPC.leo, top: 'sweater', topColor: NAVY, collar: 'round', neck: 'none', hat: 'cap', neckColor: TURQ, bottom: 'widePants', bottomColor: '#C9A57C' }, gx: 5.7, gy: 0.7, drag: false,
      say: ['Step right up! Hit the cans! 🥫', 'Five balls, six cans! ⚾', 'Aim for the bottom cans! 🎯'] },
    { id: 'mia', look: { ...NPC.mia, topColor: '#9EDDD4', hat: 'straw', hairAcc: 'none' }, gx: 8.0, gy: 6.0,
      say: ["Hi! I'm Mia 💛", 'Have you tried the Ferris wheel? 🎡', 'Cotton candy is my favourite! 🍭', 'Tap the carousel! 🎠'] },
  ],
  init: (api) => { for (const it of api.items.values()) if (it.def.thru) it.el.style.pointerEvents = 'none'; },
  items: [
    I('lights1', 0.05, 0.9, 0.25, 3.4, lightsArt('gy'), { drag: false, thru: true, zBias: -60, data: { on: true },
      onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); } }),
    I('lights2', 0.9, 0.05, 3.4, 0.25, lightsArt('gx'), { drag: false, thru: true, zBias: -60, data: { on: true },
      onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); } }),
    I('ferris', 0.2, 4.6, 1.4, 5, ferrisArt, { drag: false, thru: true, zBias: -140,
      onTap: (it, api) => {
        if (it.el.classList.contains('sx-spin')) { api.bubble(it.x + it.w / 2, it.y + 60, 'Wheee! 🎡'); return; }
        it.el.classList.add('sx-spin'); api.sfx.win();
        api.bubble(it.x + it.w / 2, it.y + 60, 'Up we go! 🎡');
        api.later(() => it.el.classList.remove('sx-spin'), 8100);
      } }),
    I('striker', 2.6, 3.4, 0.8, 0.8, strikerArt, { drag: false,
      onTap: (it, api) => {
        if (it.el.classList.contains('sx-strike')) return;
        const s = 0.35 + Math.random() * 0.65;
        it.el.querySelector('.sx-puck')?.style.setProperty('--h', `${-Math.round(s * STRIKE_TRAVEL)}px`);
        it.el.classList.add('sx-strike'); api.sfx.boing();
        api.later(() => {
          if (s > 0.9) { api.sfx.win(); api.sparkle(it.x + it.w / 2, it.y + 30, ['🔔', '✨', '💪']); api.bubble(it.x + it.w / 2, it.y + 20, 'DING! Super strong! 💪'); } else api.bubble(it.x + it.w / 2, it.y + 20, s > 0.7 ? 'So close! 💪' : 'Give it another go! 💪');
        }, 520);
        api.later(() => it.el.classList.remove('sx-strike'), 1250);
      } }),
    I('hay', 2.4, 1.3, 1.1, 0.8, hayArt, {
      onTap: (it, api) => { api.sparkle(it.x + it.w / 2, it.y + 30, ['🌾', '✨']); api.bubble(it.x + it.w / 2, it.y + 10, 'A comfy hay bale! 🌾'); } }),
    I('bin', 1.2, 1.2, 0.5, 0.5, binArt, { onTap: (it, api) => { api.bubble(it.x + it.w / 2, it.y, 'Keep the fair tidy! ♻️'); api.sfx.click(); } }),
    I('booth', 4.8, 0.15, 2.8, 0.4, boothBackArt, { drag: false, thru: true, zBias: -40, onTap: (it, api) => cansGame(api) }),
    I('boothCounter', 4.8, 1.4, 2.8, 0.6, boothCounterArt, { drag: false, zBias: -30, surface: COUNTER_H, onTap: (it, api) => cansGame(api) }),
    wear('sun', 'funfair-shades', { gx: 5.1, gy: 1.55, gz: COUNTER_H }),
    wear('cap', 'funfair-cap', { gx: 7.0, gy: 1.5, gz: COUNTER_H }),
    I('carousel', 8.4, 0.4, 3.2, 3.2, carouselArt, { drag: false, thru: true, zBias: -40,
      onTap: (it, api) => {
        if (it.el.classList.contains('sx-turn')) return;
        it.el.classList.add('sx-turn');
        [0, 300, 600, 900, 1200, 1500].forEach((t) => api.later(() => api.sfx.tap(), t));
        api.bubble(it.x + it.w / 2, it.y + 40, 'Round and round! 🎠');
        api.later(() => it.el.classList.remove('sx-turn'), 6000);
      } }),
    I('cotton', 3.6, 7.0, 1.4, 1.0, cottonCartArt, { drag: false, thru: true,
      onTap: (it, api) => {
        if (api.count('cotton') >= 3) { api.bubble(it.x + it.w / 2, it.y + 20, 'Enjoy those first! 🍭'); return; }
        it.el.classList.remove('shake'); void it.el.offsetWidth; it.el.classList.add('shake');
        api.sfx.pour();
        api.later(() => treat(api, 'cotton', it.gx + 0.2 + api.count('cotton') * 0.42, it.gy + 1.2), 450);
      } }),
    I('popcorn', 5.7, 7.6, 1.2, 1.0, popcornCartArt, { drag: false, thru: true,
      onTap: (it, api) => {
        if (api.count('popcorn') >= 3) { api.bubble(it.x + it.w / 2, it.y + 20, 'Enjoy those first! 🍿'); return; }
        it.el.classList.remove('shake'); void it.el.offsetWidth; it.el.classList.add('shake');
        [0, 120, 240].forEach((t) => api.later(() => api.sfx.pop(), t));
        api.later(() => treat(api, 'popcorn', it.gx + 0.15 + api.count('popcorn') * 0.42, it.gy + 1.15), 400);
      } }),
    I('balloons', 11.2, 7.4, 0.8, 0.8, balloonStandArt, { drag: false, thru: true,
      onTap: (it, api) => {
        if (api.count('balloon') >= 4) { api.bubble(it.x + it.w / 2, it.y + 20, 'Let some balloons fly first! 🎈'); return; }
        balloon(api, it.gx - 0.7 + (api.count('balloon') % 4) * 0.4, it.gy + 1.0);
      } }),
    I('photobooth', 10.6, 5.0, 1.2, 1.4, photoboothArt, { drag: false, thru: true,
      onTap: (it, api) => {
        if (it.el.classList.contains('sx-snapping')) return;
        it.el.classList.add('sx-snapping');
        api.bubble(it.x + it.w / 2, it.y + 10, 'Say cheese! 📸');
        api.later(() => { api.effect(it.x + it.w / 2, it.y + it.h * 0.55, 'sx-flash', '', 700); api.sfx.click(); api.avatar()?.anim.happy(); }, 700);
        api.later(() => {
          it.el.classList.remove('sx-snapping');
          if (api.count('photo') >= 2) return;
          const n = api.count('photo');
          const [gx, gy] = clampG(it.gx - 0.5 - n * 0.45, it.gy + 1.5);
          api.add({
            id: api.uid('photo'), w: 34, h: 90, small: true, gx, gy, gz: 0, fw: 0.3, fd: 0.3, ax: 17, ay: 88,
            onTap: (p, a) => { a.sparkle(p.x + p.w / 2, p.y + 40, ['📸', '✨', '💜']); a.bubble(p.x + p.w / 2, p.y - 8, 'What a lovely photo strip! 📸'); },
            art: () => svg(56, 150, `<rect x="2" y="2" width="52" height="146" rx="3" fill="${CREAM}" stroke="${INK}" stroke-width="1.8"/>
              ${[0, 1, 2].map((k) => `<rect x="8" y="${8 + k * 46}" width="40" height="40" fill="${['#CFE6F5', '#E6DDFA', '#D5ECE8'][k]}"/>
                <circle cx="28" cy="${30 + k * 46}" r="9" fill="${PASTEL[(n + k) % 5]}"/><path d="M14 ${48 + k * 46} Q28 ${34 + k * 46} 42 ${48 + k * 46} Z" fill="${PASTEL[(n + k + 2) % 5]}"/>
                <path d="M12 ${14 + k * 46} l3 3 -3 3 -3 -3 z" fill="#fff"/>`).join('')}`),
          }, { spawned: true });
        }, 1100);
      } }),
    I('planter1', 8.4, 8.8, 0.7, 0.7, planterArt(LILAC), { drag: false }),
    I('planter2', 2.4, 9.1, 0.7, 0.7, planterArt(TURQ), { drag: false }),
    I('planter3', 11.1, 4.05, 0.7, 0.7, planterArt(SUN), { drag: false }),
  ],
};
