// Ice Rink — isometric "diorama seen from above": a floating snowy slab with a turquoise ice rink.
// Drop a character on the ice to glide, tap them on the ice to spin; tap the puck to shoot at the goal
// (3 goals → star); a star hides under the bench; a penguin; a hot cocoa cart.
import { room, groundShell, floorPoly, isoItem, at, shades, proj, isoDef } from '../iso.js';
import { svg, text, winterSky, mountains, food, NPC_WINTER } from './common.js';
import { CLIMATES } from '../ui.js';

const R = room({ cols: 12, rows: 9, ox: 704, oy: 150, wallH: 0 });
R.charScale = 0.55;
const DEPTH = 44;

const WOOD = '#C99A6C', WOOD_L = '#E2C29C', WOOD_D = '#A97B52', LILAC = '#B79CF0', TEAL = '#7FCFC4', SKY = '#9CC8EE', SUN = '#F5DE7A', CORAL = '#E58F6A', NAVY = '#5A5F94', SNOW = '#F7F9FE', LIGHT = '#FFF2B0';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4" stroke-linejoin="round"';
const thin = 'stroke="#3E3252" stroke-opacity=".45" stroke-width="1.1" stroke-linejoin="round"';
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const f1 = (n) => n.toFixed(1);

// ---------- small geometry helpers (grid → screen) ----------
const gp = (gx, gy, gz = 0) => proj(R, gx, gy, gz).map(f1).join(',');
const gpts = (pts, gz = 0) => pts.map(([a, b]) => gp(a, b, gz)).join(' ');
const gline = (pts, gz = 0) => 'M' + pts.map(([a, b]) => proj(R, a, b, gz).map(f1).join(' ')).join(' L');
const rrect = (x0, y0, x1, y1, r, n = 7) => {
  const out = [];
  [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]].forEach(([cx, cy, a0]) => {
    for (let i = 0; i <= n; i++) { const a = ((a0 + (90 * i) / n) * Math.PI) / 180; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  });
  return out;
};
const ring = (cx, cy, r, n = 28, a0 = 0, a1 = 360) => Array.from({ length: n + 1 }, (_, i) => { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
const insidePoly = (poly, x, y) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

// Paint parts in exactly the given order (iso.js sorts parts; here we want full control).
const raw = (p) => { const s = isoItem(1, 1, 0, [p]).svg; return s.slice(s.indexOf('>', s.indexOf('<g ')) + 1, s.lastIndexOf('</g>')); };
const B = raw;
const item = (fw, fd, H, ...layers) => isoItem(fw, fd, H, [{ svg: layers.join(''), w: fw, d: fd }]);
// Place a whole iso prop into the background (for things standing on the back edges).
const inBg = (gx, gy, it, gz = 0) => { const [sx, sy] = proj(R, gx, gy, gz); return it.svg.replace('width="100%" height="100%"', `x="${f1(sx - it.ax)}" y="${f1(sy - it.ay)}" width="${f1(it.w)}" height="${f1(it.h)}"`); };
const shadow = (u, v, rx, ry, op = 0.12) => { const [x, y] = at(u, v); return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="#3E3252" opacity="${op}"/>`; };

// ---------- the ice ----------
const ICE = rrect(2.2, 1.4, 11.0, 7.6, 1.6);
const BOARDS = rrect(1.95, 1.15, 11.25, 7.85, 1.85);
const BOARD_H = 14;
const onIce = (who) => insidePoly(ICE, who.gx + 0.22, who.gy + 0.22);
const iceInset = rrect(2.6, 1.8, 10.6, 7.2, 1.3);

// ---------- props ----------
const pineSvg = (cu, cv, s, z = 0) => {
  const [cx, cy] = at(cu, cv, z);
  const tiers = [[-30, -118, 58], [-84, -162, 45], [-128, -206, 31]];
  return tiers.map(([yb0, yt0, hw0]) => {
    const yb = cy + yb0 * s, yt = cy + yt0 * s, hw = hw0 * s, h = yb - yt, sag = hw * 0.34;
    const body = `M${f1(cx - hw)} ${f1(yb)} Q${f1(cx)} ${f1(yb + sag)} ${f1(cx + hw)} ${f1(yb)} L${f1(cx)} ${f1(yt)} Z`;
    const cap = `M${f1(cx)} ${f1(yt)} L${f1(cx + hw * 0.5)} ${f1(yt + h * 0.5)} Q${f1(cx + hw * 0.32)} ${f1(yt + h * 0.64)} ${f1(cx + hw * 0.14)} ${f1(yt + h * 0.52)} Q${f1(cx)} ${f1(yt + h * 0.68)} ${f1(cx - hw * 0.16)} ${f1(yt + h * 0.53)} Q${f1(cx - hw * 0.34)} ${f1(yt + h * 0.65)} ${f1(cx - hw * 0.5)} ${f1(yt + h * 0.5)} Z`;
    const rim = `M${f1(cx - hw * 0.96)} ${f1(yb - 2)} Q${f1(cx)} ${f1(yb + sag - 2)} ${f1(cx + hw * 0.96)} ${f1(yb - 2)} Q${f1(cx)} ${f1(yb + sag - 9 * s)} ${f1(cx - hw * 0.96)} ${f1(yb - 2)} Z`;
    return `<path d="${body}" fill="#4F927E"/>
      <path d="M${f1(cx)} ${f1(yt)} L${f1(cx - hw)} ${f1(yb)} Q${f1(cx - hw * 0.5)} ${f1(yb + sag * 0.75)} ${f1(cx)} ${f1(yb + sag * 0.5)} Z" fill="#62A98F"/>
      <path d="${body}" fill="none" ${line}/>
      <path d="${rim}" fill="#FFFFFF" opacity=".95"/>
      <path d="${cap}" fill="#FFFFFF" ${thin}/><path d="M${f1(cx)} ${f1(yt + 2)} L${f1(cx + hw * 0.46)} ${f1(yt + h * 0.5)} Q${f1(cx + hw * 0.3)} ${f1(yt + h * 0.6)} ${f1(cx + hw * 0.14)} ${f1(yt + h * 0.5)} Z" fill="#E1E2F4"/>`;
  }).join('');
};
const pineArt = (s = 1) => {
  const fp = 0.8 * s;
  return item(fp, fp, 214 * s, shadow(fp / 2, fp / 2, 52 * s, 24 * s),
    B({ u: fp / 2 - 0.07 * s, v: fp / 2 - 0.07 * s, w: 0.14 * s, d: 0.14 * s, h: 34 * s, ...shades('#9A7052') }),
    pineSvg(fp / 2, fp / 2, s, 4 * s));
};
const lampArt = (glow = true) => item(0.5, 0.5, 200,
  shadow(0.25, 0.25, 26, 12),
  B({ u: 0.1, v: 0.1, w: 0.3, d: 0.3, h: 10, ...shades('#6E6496') }),
  B({ u: 0.21, v: 0.21, w: 0.08, d: 0.08, z: 10, h: 140, ...shades('#6E6496') }),
  B({ u: 0.13, v: 0.13, w: 0.24, d: 0.24, z: 150, h: 4, ...shades('#6E6496') }),
  B({ u: 0.15, v: 0.15, w: 0.2, d: 0.2, z: 154, h: 26, top: LIGHT, left: '#FFF4C4', right: '#F3E3A0' }),
  (() => { const c = [at(0.1, 0.1, 180), at(0.4, 0.1, 180), at(0.4, 0.4, 180), at(0.1, 0.4, 180)], ap = at(0.25, 0.25, 198);
    return `<polygon points="${[c[3], c[2], ap].map((p) => p.map(f1).join(',')).join(' ')}" fill="#6E6496" ${line}/><polygon points="${[c[2], c[1], ap].map((p) => p.map(f1).join(',')).join(' ')}" fill="#5A5180" ${line}/>
      <path d="M${f1(c[3][0])} ${f1(c[3][1])} L${f1(ap[0])} ${f1(ap[1])} L${f1(c[1][0])} ${f1(c[1][1])} Q${f1(ap[0] + 6)} ${f1(ap[1] + 12)} ${f1(ap[0])} ${f1(ap[1] + 8)} Q${f1(ap[0] - 8)} ${f1(ap[1] + 14)} ${f1(c[3][0])} ${f1(c[3][1])} Z" fill="#fff"/>`; })(),
  glow ? (() => { const [x, y] = at(0.25, 0.25, 166); return `<circle cx="${f1(x)}" cy="${f1(y)}" r="62" fill="url(#rk-glow)"/>`; })() : '');
const fenceArt = (len) => {
  const posts = Array.from({ length: Math.round(len) + 1 }, (_, i) => Math.min(len - 0.1, i));
  return item(len, 0.12, 60,
    ...posts.map((u) => B({ u, v: 0.01, w: 0.1, d: 0.1, h: 46, ...shades(WOOD_D) })),
    B({ u: 0, v: 0.03, w: len, d: 0.05, z: 14, h: 7, ...shades(WOOD) }),
    B({ u: 0, v: 0.03, w: len, d: 0.05, z: 32, h: 7, ...shades(WOOD) }),
    ...posts.map((u) => B({ u: u - 0.01, v: 0, w: 0.12, d: 0.12, z: 46, h: 5, ...shades('#FFFFFF', 0.4) })),
    B({ u: 0, v: 0.02, w: len, d: 0.07, z: 39, h: 3, ...shades('#FFFFFF', 0.4) }));
};
const lightPoleArt = () => item(0.2, 0.2, 170,
  B({ u: 0.05, v: 0.05, w: 0.1, d: 0.1, h: 150, ...shades(WOOD_D) }),
  B({ u: 0.03, v: 0.03, w: 0.14, d: 0.14, z: 150, h: 6, ...shades('#FFFFFF', 0.4) }));

const bench = () => item(0.7, 1.8, 100,
  shadow(0.35, 0.9, 74, 30, 0.1),
  B({ u: 0.08, v: 0.06, w: 0.54, d: 1.68, h: 38, ...shades(WOOD_D),
    leftDecor: `${[10, 22].map((y) => `<path d="M2 ${y} H${0.54 * 64 - 2}" stroke="#3E3252" stroke-opacity=".25" stroke-width="1.2"/>`).join('')}`,
    rightDecor: `${[10, 22].map((y) => `<path d="M2 ${y} H${1.68 * 64 - 2}" stroke="#3E3252" stroke-opacity=".25" stroke-width="1.2"/>`).join('')}<rect x="8" y="6" width="${1.68 * 64 - 16}" height="26" rx="3" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>` }),
  B({ u: 0, v: 0, w: 0.7, d: 1.8, z: 38, h: 8, ...shades(WOOD_L),
    topDecor: '<path d="M0.15 0 V1.8 M0.3 0 V1.8 M0.45 0 V1.8" stroke="#3E3252" stroke-opacity=".2" stroke-width=".02"/><ellipse cx=".5" cy="1.45" rx=".14" ry=".22" fill="#fff" opacity=".9"/>' }),
  B({ u: 0, v: 0, w: 0.12, d: 1.8, z: 46, h: 48, ...shades(WOOD),
    rightDecor: `${[12, 28].map((y) => `<path d="M3 ${y} H${1.8 * 64 - 3}" stroke="#3E3252" stroke-opacity=".25" stroke-width="1.2"/>`).join('')}` }),
  B({ u: -0.02, v: -0.02, w: 0.16, d: 1.84, z: 94, h: 6, ...shades('#FFFFFF', 0.4) }));

const cocoaCart = () => {
  const [ux, uy] = at(0.72, 0.55, 162);
  const scallop = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return [ux + Math.cos(a) * 80, uy + Math.sin(a) * 40]; });
  const bulbs = Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * Math.PI; const x = ux + Math.cos(a) * 76, y = uy + Math.sin(a) * 38 + 7; return `<circle cx="${f1(x)}" cy="${f1(y)}" r="6" fill="${LIGHT}" opacity=".45"/><circle cx="${f1(x)}" cy="${f1(y)}" r="3" fill="${[LIGHT, '#BFEDE6', '#DCCBFA'][i % 3]}" ${thin}/>`; }).join('');
  return item(1.4, 1.1, 210,
    shadow(0.7, 0.55, 90, 40),
    B({ u: 0.1, v: 0.1, w: 1.2, d: 0.9, z: 8, h: 62, ...shades('#FBF7EF'),
      leftDecor: `<rect x="6" y="10" width="${1.2 * 64 - 12}" height="26" rx="5" fill="${TEAL}" ${thin}/>${text(1.2 * 32, 28, 'COCOA', 15, '#FFFFFF')}
        <circle cx="16" cy="58" r="13" fill="${NAVY}" ${line}/><circle cx="16" cy="58" r="5" fill="#C9CCE6"/><circle cx="${1.2 * 64 - 16}" cy="58" r="13" fill="${NAVY}" ${line}/><circle cx="${1.2 * 64 - 16}" cy="58" r="5" fill="#C9CCE6"/>`,
      rightDecor: `<path d="M8 42 H${0.9 * 64 - 8}" stroke="${TEAL}" stroke-width="6"/>${[14, 28, 42].map((x) => `<circle cx="${x}" cy="22" r="4" fill="${SUN}"/>`).join('')}` }),
    B({ u: 0, v: 0, w: 1.4, d: 1.1, z: 70, h: 8, ...shades(WOOD_L) }),
    B({ u: 0.66, v: 0.5, w: 0.08, d: 0.08, z: 78, h: 84, ...shades('#8F86B8') }),
    // pot with steam, cups and a marshmallow jar on the counter
    B({ u: 0.15, v: 0.15, w: 0.4, d: 0.4, z: 78, h: 30, ...shades('#8F86B8'), leftDecor: '<path d="M3 8 H23" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>' }),
    (() => { const [x, y] = at(0.35, 0.35, 108); return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="18" ry="8" fill="#8B5A3C" ${thin}/><path class="wx-steam" d="M${f1(x - 6)} ${f1(y - 6)} q-8 -14 0 -26 q8 -12 0 -24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/><path class="wx-steam" style="animation-delay:-2.4s" d="M${f1(x + 7)} ${f1(y - 4)} q-8 -14 0 -26" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>`; })(),
    B({ u: 1.0, v: 0.12, w: 0.24, d: 0.24, z: 78, h: 30, top: '#FFFFFF', left: '#EAF4FA" fill-opacity=".85', right: '#D7E6F2" fill-opacity=".85' }),
    (() => { const [x, y] = at(1.12, 0.24, 92); return [[-6, 0], [5, -3], [0, -10], [6, 6], [-5, 8]].map(([dx, dy]) => `<rect x="${f1(x + dx - 4)}" y="${f1(y + dy - 4)}" width="8" height="8" rx="2.5" fill="#FBF7EF" ${thin}/>`).join(''); })(),
    ...[[0.18, 0.78, LILAC], [0.42, 0.82, TEAL], [1.1, 0.8, SUN]].map(([u, v, c]) => B({ u, v, w: 0.14, d: 0.14, z: 78, h: 18, ...shades(c) })),
    // umbrella
    `<ellipse cx="${f1(ux)}" cy="${f1(uy + 4)}" rx="84" ry="42" fill="#3E3252" opacity=".08"/>`,
    `<path d="M${scallop.map((p) => p.map(f1).join(' ')).join(' L')} Z" fill="#FBF7EF" ${line}/>`,
    `${[0, 2, 4, 6, 8, 10].map((i) => { const a = scallop[i], b = scallop[i + 1]; return `<path d="M${f1(ux)} ${f1(uy - 38)} L${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])} Z" fill="${TEAL}" opacity=".9"/>`; }).join('')}`,
    `<path d="M${scallop.map((p) => `${f1(p[0])} ${f1(p[1])}`).map((p, i) => (i ? 'L' : '') + p).join(' ')} Z" fill="none" ${line}/>`,
    `${scallop.map((p) => `<path d="M${f1(ux)} ${f1(uy - 38)} L${f1(p[0])} ${f1(p[1])}" stroke="#3E3252" stroke-opacity=".25" stroke-width="1"/>`).join('')}`,
    `<path d="M${f1(ux - 50)} ${f1(uy - 26)} Q${f1(ux)} ${f1(uy - 46)} ${f1(ux + 50)} ${f1(uy - 26)} Q${f1(ux)} ${f1(uy - 34)} ${f1(ux - 50)} ${f1(uy - 26)} Z" fill="#fff" opacity=".9"/>`,
    `<circle cx="${f1(ux)}" cy="${f1(uy - 40)}" r="6" fill="${SUN}" ${line}/>`, bulbs);
};

const goalArt = (it) => {
  const n = it?.data.goals || 0;
  const net = (wpx, hpx) => `${Array.from({ length: Math.floor(wpx / 9) }, (_, i) => `<path d="M${(i + 1) * 9} 0 V${hpx}" stroke="#fff" stroke-width="1.3" opacity=".9"/>`).join('')}${Array.from({ length: Math.floor(hpx / 9) }, (_, i) => `<path d="M0 ${(i + 1) * 9} H${wpx}" stroke="#fff" stroke-width="1.3" opacity=".9"/>`).join('')}`;
  const glass = (c) => `${c}" fill-opacity=".38`;
  const [sx, sy] = at(0.8, 0.0, 128);
  return item(1.6, 0.7, 160,
    shadow(0.8, 0.35, 80, 30, 0.1),
    B({ u: 0, v: 0, w: 1.6, d: 0.04, h: 56, top: '#fff', left: glass('#DCE7F7'), right: glass('#C9D6EE'), leftDecor: net(1.6 * 64, 56) }),
    B({ u: 0, v: 0, w: 0.04, d: 0.7, h: 60, top: '#fff', left: glass('#DCE7F7'), right: glass('#C9D6EE'), rightDecor: net(0.7 * 64, 60) }),
    B({ u: 0, v: 0, w: 1.6, d: 0.7, z: 60, h: 0, top: glass('#E4ECF8'), topDecor: Array.from({ length: 9 }, (_, i) => `<path d="M${(i + 1) * 0.16} 0 V0.7 M0 ${((i % 4) + 1) * 0.14} H1.6" stroke="#fff" stroke-width=".015"/>`).join('') }),
    B({ u: 1.56, v: 0, w: 0.04, d: 0.7, h: 60, top: '#fff', left: glass('#DCE7F7'), right: glass('#C9D6EE'), rightDecor: net(0.7 * 64, 60) }),
    B({ u: 0, v: 0.62, w: 0.08, d: 0.08, h: 66, ...shades(CORAL) }),
    B({ u: 1.52, v: 0.62, w: 0.08, d: 0.08, h: 66, ...shades(CORAL) }),
    B({ u: 0, v: 0.62, w: 1.6, d: 0.08, z: 60, h: 7, ...shades(CORAL) }),
    B({ u: 0, v: 0.6, w: 1.6, d: 0.1, z: 0, h: 4, ...shades('#FBF7EF', 0.4) }),
    // score board on a post behind the goal
    B({ u: 0.76, v: 0.0, w: 0.06, d: 0.06, z: 60, h: 46, ...shades('#6E6496') }),
    `<rect x="${f1(sx - 54)}" y="${f1(sy - 36)}" width="108" height="40" rx="10" fill="#FBF7EF" ${line}/><rect x="${f1(sx - 46)}" y="${f1(sy - 30)}" width="92" height="28" rx="7" fill="#3E4470"/>
     ${text(sx - 14, sy - 10, 'GOALS', 13, '#BFEDE6')}${text(sx + 30, sy - 9, String(n), 18, SUN)}
     ${[0, 1, 2].map((i) => `<circle cx="${f1(sx - 18 + i * 18)}" cy="${f1(sy + 12)}" r="5" fill="${i < n % 4 || n >= 3 ? SUN : '#DCD6EC'}" ${thin}/>`).join('')}`);
};
const puckArt = () => item(0.3, 0.3, 14, (() => { const [x, y] = at(0.15, 0.15); return `<ellipse cx="${f1(x)}" cy="${f1(y + 2)}" rx="20" ry="9" fill="#3E3252" opacity=".15"/>
  <path d="M${f1(x - 17)} ${f1(y - 4)} V${f1(y + 1)} A17 8 0 0 0 ${f1(x + 17)} ${f1(y + 1)} V${f1(y - 4)} Z" fill="#2E2A3A" ${line}/><ellipse cx="${f1(x)}" cy="${f1(y - 4)}" rx="17" ry="8" fill="#4A4660" ${line}/><path d="M${f1(x - 9)} ${f1(y - 6)} q6 -3 14 -1" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/>`; })());
const stickArt = () => item(0.3, 1.4, 30, (() => {
  const a = at(0.15, 0.05, 2), b = at(0.15, 1.12, 2), c = at(0.32, 1.38, 2);
  return `<path d="M${f1(a[0])} ${f1(a[1] + 4)} L${f1(b[0])} ${f1(b[1] + 4)} L${f1(c[0])} ${f1(c[1] + 4)}" stroke="#3E3252" stroke-opacity=".12" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])}" stroke="#3E3252" stroke-opacity=".55" stroke-width="9" stroke-linecap="round"/><path d="M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])}" stroke="${WOOD_L}" stroke-width="6" stroke-linecap="round"/>
  <path d="M${f1(b[0])} ${f1(b[1])} L${f1(c[0])} ${f1(c[1])}" stroke="#3E3252" stroke-opacity=".55" stroke-width="13" stroke-linecap="round"/><path d="M${f1(b[0])} ${f1(b[1])} L${f1(c[0])} ${f1(c[1])}" stroke="${NAVY}" stroke-width="10" stroke-linecap="round"/>
  <path d="M${f1((a[0] * 3 + b[0]) / 4)} ${f1((a[1] * 3 + b[1]) / 4)} L${f1((a[0] * 2 + b[0] * 2) / 4)} ${f1((a[1] * 2 + b[1] * 2) / 4)}" stroke="${TEAL}" stroke-width="6"/>`;
})());
const skatesArt = () => item(0.5, 0.36, 50, ...[[0.04, 0.02], [0.2, 0.18]].map(([u, v]) => {
  const [x, y] = at(u + 0.12, v + 0.08);
  return `<path d="M${f1(x - 14)} ${f1(y + 4)} H${f1(x + 22)}" stroke="#AEB8CC" stroke-width="3" stroke-linecap="round"/><path d="M${f1(x - 10)} ${f1(y + 4)} V${f1(y - 2)} M${f1(x + 16)} ${f1(y + 4)} V${f1(y - 2)}" stroke="#8C95AA" stroke-width="2"/>
    <path d="M${f1(x - 14)} ${f1(y - 2)} V${f1(y - 30)} Q${f1(x - 14)} ${f1(y - 34)} ${f1(x - 8)} ${f1(y - 34)} H${f1(x + 2)} V${f1(y - 16)} Q${f1(x + 20)} ${f1(y - 14)} ${f1(x + 22)} ${f1(y - 2)} Z" fill="#FBF7EF" ${line}/>
    <path d="M${f1(x - 13)} ${f1(y - 30)} H${f1(x + 2)}" stroke="${LILAC}" stroke-width="5"/><path d="M${f1(x - 6)} ${f1(y - 26)} l6 3 m-6 3 l6 3 m-6 3 l6 3" stroke="${LILAC}" stroke-width="1.6"/>`;
}));
const penguinArt = () => item(0.5, 0.5, 96, (() => {
  const [x, y] = at(0.25, 0.25);
  return `<ellipse cx="${f1(x)}" cy="${f1(y + 2)}" rx="28" ry="11" fill="#3E3252" opacity=".13"/>
    <path d="M${f1(x - 16)} ${f1(y - 2)} h12 l-3 5 h-10 z M${f1(x + 4)} ${f1(y - 2)} h12 l-2 5 h-10 z" fill="#F0A060" ${thin}/>
    <path d="M${f1(x - 24)} ${f1(y - 40)} Q${f1(x - 36)} ${f1(y - 22)} ${f1(x - 26)} ${f1(y - 12)} Q${f1(x - 22)} ${f1(y - 26)} ${f1(x - 18)} ${f1(y - 36)} Z M${f1(x + 24)} ${f1(y - 40)} Q${f1(x + 36)} ${f1(y - 22)} ${f1(x + 26)} ${f1(y - 12)} Q${f1(x + 22)} ${f1(y - 26)} ${f1(x + 18)} ${f1(y - 36)} Z" fill="#3E3F5E" ${line}/>
    <ellipse cx="${f1(x)}" cy="${f1(y - 30)}" rx="25" ry="30" fill="#3E3F5E" ${line}/><ellipse cx="${f1(x)}" cy="${f1(y - 25)}" rx="17" ry="23" fill="#FFFFFF"/>
    <circle cx="${f1(x)}" cy="${f1(y - 66)}" r="18" fill="#3E3F5E" ${line}/><ellipse cx="${f1(x)}" cy="${f1(y - 62)}" rx="12" ry="9" fill="#fff"/>
    <circle cx="${f1(x - 5)}" cy="${f1(y - 66)}" r="2.6" fill="#2E2A3A"/><circle cx="${f1(x + 5)}" cy="${f1(y - 66)}" r="2.6" fill="#2E2A3A"/>
    <path d="M${f1(x - 5)} ${f1(y - 60)} L${f1(x + 5)} ${f1(y - 60)} L${f1(x)} ${f1(y - 54)} Z" fill="#F0A060" ${thin}/>
    <path d="M${f1(x - 18)} ${f1(y - 50)} Q${f1(x)} ${f1(y - 42)} ${f1(x + 18)} ${f1(y - 50)} L${f1(x + 18)} ${f1(y - 44)} Q${f1(x)} ${f1(y - 36)} ${f1(x - 18)} ${f1(y - 44)} Z" fill="${CORAL}" ${thin}/><path d="M${f1(x + 8)} ${f1(y - 42)} l4 16 l-8 1 z" fill="${CORAL}" ${thin}/>`;
})());
const moundArt = (s = 1) => item(1 * s, 0.8 * s, 34 * s, (() => {
  const [x, y] = at(0.5 * s, 0.4 * s);
  return `<path d="M${f1(x - 56 * s)} ${f1(y + 6)} Q${f1(x - 50 * s)} ${f1(y - 22 * s)} ${f1(x - 18 * s)} ${f1(y - 24 * s)} Q${f1(x + 4)} ${f1(y - 38 * s)} ${f1(x + 26 * s)} ${f1(y - 20 * s)} Q${f1(x + 54 * s)} ${f1(y - 16 * s)} ${f1(x + 56 * s)} ${f1(y + 6)} Q${f1(x)} ${f1(y + 22 * s)} ${f1(x - 56 * s)} ${f1(y + 6)} Z" fill="#FFFFFF" ${line}/>
    <path d="M${f1(x + 10 * s)} ${f1(y - 18 * s)} Q${f1(x + 40 * s)} ${f1(y - 10 * s)} ${f1(x + 48 * s)} ${f1(y + 6)} Q${f1(x + 20 * s)} ${f1(y + 14 * s)} ${f1(x + 4)} ${f1(y + 10 * s)} Z" fill="#E1E3F4"/>`;
})());
const signArt = () => item(0.3, 1.2, 150,
  B({ u: 0.1, v: 0.1, w: 0.08, d: 0.08, h: 120, ...shades(WOOD_D) }),
  B({ u: 0.1, v: 0.95, w: 0.08, d: 0.08, h: 120, ...shades(WOOD_D) }),
  B({ u: 0.06, v: 0.02, w: 0.06, d: 1.12, z: 78, h: 52, ...shades(WOOD_L), leftDecor: '',
    rightDecor: `<rect x="4" y="4" width="${1.12 * 64 - 8}" height="44" rx="6" fill="${TEAL}" ${thin}/>${text(1.12 * 32, 32, 'ICE RINK', 15, '#FFFFFF')}` }),
  B({ u: 0.04, v: 0, w: 0.1, d: 1.16, z: 130, h: 6, ...shades('#FFFFFF', 0.4) }));

// ---------- background: sky, mountains, the snowy slab, ice ----------
const bg = (w) => {
  const clear = w.weather === 'clear';
  const B0 = proj(R, 0, 0), Rr = proj(R, R.cols, 0), F = proj(R, R.cols, R.rows), L = proj(R, 0, R.rows);
  const dn = ([x, y]) => [x, y + DEPTH];
  const edgePts = (a, b, n) => Array.from({ length: n }, (_, i) => [a[0] + ((b[0] - a[0]) * (i + 0.5)) / n, a[1] + ((b[1] - a[1]) * (i + 0.5)) / n]);
  const icicles = [...edgePts(dn(L), dn(F), 16), ...edgePts(dn(F), dn(Rr), 18)].map(([x, y], i) => { const l = 8 + ((i * 7) % 4) * 6; return `<path d="M${f1(x - 5)} ${f1(y - 1)} L${f1(x)} ${f1(y + l)} L${f1(x + 5)} ${f1(y - 1)} Z" fill="#DDF3F8" ${thin}/>`; }).join('');
  const lips = [...edgePts(L, F, 9), ...edgePts(F, Rr, 10)].map(([x, y], i) => `<ellipse cx="${f1(x)}" cy="${f1(y + 3)}" rx="${26 + (i % 3) * 8}" ry="${7 + (i % 2) * 3}" fill="#FFFFFF"/>`).join('');
  const poles = [2.6, 5.6, 8.6, 11.4];
  const polesTop = poles.map((g) => proj(R, g + 0.1, 0.25, 150));
  const lights = polesTop.slice(1).map((p, i) => {
    const a = polesTop[i], sag = 26;
    const bulbs = Array.from({ length: 6 }, (_, k) => { const t = (k + 1) / 7, x = a[0] + (p[0] - a[0]) * t, y = a[1] + (p[1] - a[1]) * t + Math.sin(t * Math.PI) * sag; return `<circle cx="${f1(x)}" cy="${f1(y + 6)}" r="9" fill="${LIGHT}" opacity=".35"/><ellipse cx="${f1(x)}" cy="${f1(y + 6)}" rx="3.6" ry="5" fill="${[LIGHT, '#BFEDE6', '#DCCBFA'][k % 3]}" ${thin}/>`; }).join('');
    return `<path d="M${f1(a[0])} ${f1(a[1])} Q${f1((a[0] + p[0]) / 2)} ${f1((a[1] + p[1]) / 2 + sag * 2)} ${f1(p[0])} ${f1(p[1])}" fill="none" stroke="#5A5180" stroke-width="1.6"/>${bulbs}`;
  }).join('');
  const trail = (cx, cy, rx, ry, rot, a0, a1) => gline(Array.from({ length: 25 }, (_, i) => { const a = ((a0 + ((a1 - a0) * i) / 24) * Math.PI) / 180; const x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; }));
  const steps = (pts) => pts.map(([a, b], i) => { const [x, y] = proj(R, a, b); return `<ellipse cx="${f1(x + (i % 2 ? 5 : -5))}" cy="${f1(y)}" rx="4.5" ry="2.4" fill="#C9CDEA" opacity=".8"/>`; }).join('');
  return svg(1600, 900, `
  <defs>
    <linearGradient id="rk-ice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9F3F6"/><stop offset=".55" stop-color="#B9E6EE"/><stop offset="1" stop-color="#9FD9E5"/></linearGradient>
    <radialGradient id="rk-glow"><stop offset="0" stop-color="#FFF4C2" stop-opacity=".75"/><stop offset="1" stop-color="#FFF4C2" stop-opacity="0"/></radialGradient>
    <linearGradient id="rk-fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="${clear ? '#E4EEFB' : '#E1E4EF'}"/></linearGradient>
    <pattern id="rk-snow" width="96" height="48" patternUnits="userSpaceOnUse">
      <ellipse cx="18" cy="12" rx="7" ry="3" fill="#E6E8F6"/><ellipse cx="66" cy="34" rx="9" ry="3.5" fill="#E9EBF7"/><circle cx="44" cy="20" r="1.6" fill="#D9DDF1"/><circle cx="84" cy="8" r="1.2" fill="#D9DDF1"/>
      <path d="M30 40 l2 -4 l2 4 l-2 4 z" fill="#FFFFFF"/></pattern>
    <clipPath id="rk-clip"><polygon points="${gpts(ICE, BOARD_H)}"/></clipPath>
  </defs>
  ${winterSky(w, 900, 'rk-sky')}
  ${mountains(470, clear ? '#D3DCF2' : '#CBCFE0')}
  <path d="M-20 560 Q200 470 420 520 T860 500 T1300 520 T1620 480 V900 H-20 Z" fill="${clear ? '#EAF1FB' : '#E3E6F0'}"/>
  <path d="M-20 640 Q300 580 620 620 T1200 600 T1620 620 V900 H-20 Z" fill="#F3F6FC"/>
  <rect y="560" width="1600" height="340" fill="url(#rk-fog)"/>
  ${groundShell(R, { top: SNOW, pattern: 'rk-snow', sideL: '#E4E8F6', sideR: '#D0D7ED', layer: '#A79BD0', depth: DEPTH, edge: '#FFFFFF' })}
  <polyline points="${[dn(L), dn(F), dn(Rr)].map((p) => p.map(f1).join(',')).join(' ')}" fill="none" stroke="#8F84BC" stroke-width="2" opacity=".5"/>
  ${icicles}${lips}
  <polygon points="${[B0, Rr, proj(R, R.cols, 0.5), proj(R, 0.5, 0.5), proj(R, 0.5, R.rows), L].map((p) => p.map(f1).join(',')).join(' ')}" fill="#B7BCE0" opacity=".18"/>
  ${steps([[1.0, 7.9], [1.3, 7.5], [1.6, 7.0], [1.7, 6.5], [1.8, 4.6], [1.7, 4.3], [1.4, 2.6], [1.2, 2.1]])}${steps([[11.4, 8.6], [11.5, 8.1], [11.6, 7.4], [11.5, 6.6]])}
  <!-- the rink: boards ring + ice (back boards behind the ice, front boards in front) -->
  <polygon points="${gpts(BOARDS)}" fill="#B9C3E6" ${line}/>
  <polygon points="${gpts(BOARDS, BOARD_H)}" fill="#FBF7EF" ${line}/>
  <polygon points="${gpts(rrect(2.08, 1.28, 11.12, 7.72, 1.72), BOARD_H)}" fill="none" stroke="${LILAC}" stroke-width="3" opacity=".7"/>
  <polygon points="${gpts(ICE, BOARD_H)}" fill="#A9BDE2" ${line}/>
  <g clip-path="url(#rk-clip)">
    ${floorPoly(R, ICE, 'fill="url(#rk-ice)"')}
    ${floorPoly(R, iceInset, 'fill="#FFFFFF" opacity=".16"')}
    <path d="${gline([[6.6, 1.4], [6.6, 7.6]])}" stroke="${LILAC}" stroke-width="5" opacity=".45"/>
    <path d="${gline([[4.3, 1.4], [4.3, 7.6]])} ${gline([[8.9, 1.4], [8.9, 7.6]])}" stroke="${SKY}" stroke-width="4" opacity=".55"/>
    <polygon points="${gpts(ring(6.6, 4.5, 1.05))}" fill="none" stroke="${LILAC}" stroke-width="4" opacity=".5"/>
    <polygon points="${gpts(ring(6.6, 4.5, 0.14))}" fill="${LILAC}" opacity=".55"/>
    <polygon points="${gpts([...ring(8.2, 2.2, 0.85, 14, 0, 180)])}" fill="#C8E2F7" opacity=".7" stroke="#86B7E0" stroke-width="2.5"/>
    ${[[3.4, 3.0], [3.4, 6.0], [9.8, 6.0]].map(([a, b]) => `<polygon points="${gpts(ring(a, b, 0.16))}" fill="${CORAL}" opacity=".45"/><polygon points="${gpts(ring(a, b, 0.5))}" fill="none" stroke="${CORAL}" stroke-width="2" opacity=".35"/>`).join('')}
    <g fill="none" stroke="#FFFFFF" stroke-linecap="round" opacity=".75">
      <path d="${trail(4.6, 5.2, 1.3, 0.7, 0.4, 0, 300)}" stroke-width="2.4"/><path d="${trail(4.7, 5.3, 1.1, 0.55, 0.4, 20, 280)}" stroke-width="1.6"/>
      <path d="${trail(8.6, 5.4, 1.5, 0.8, -0.3, 120, 420)}" stroke-width="2.4"/><path d="${trail(6.9, 3.2, 1.8, 0.5, 0.2, 180, 330)}" stroke-width="2"/>
      <path d="${trail(5.6, 6.5, 2.2, 0.5, 0.05, 190, 350)}" stroke-width="1.8"/>
    </g>
    ${[[2.5, 3.6, 30], [2.6, 5.4, 22], [5.0, 1.55, 34], [9.6, 1.6, 26], [10.8, 4.4, 24], [7.0, 7.45, 30], [3.6, 7.3, 26]].map(([a, b, r]) => { const [x, y] = proj(R, a, b); return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${r}" ry="${r * 0.4}" fill="#FFFFFF" opacity=".7"/>`; }).join('')}
    <path d="M${gp(3.4, 2.6)} L${gp(4.2, 2.2)} L${gp(5.6, 3.6)} L${gp(4.8, 4.0)} Z" fill="#FFFFFF" opacity=".18"/><path d="M${gp(7.4, 5.6)} L${gp(7.9, 5.35)} L${gp(9.1, 6.5)} L${gp(8.6, 6.75)} Z" fill="#FFFFFF" opacity=".18"/>
  </g>
  <!-- back edge: fence, light poles with string lights, pines -->
  ${inBg(0.15, 1.5, pineArt(0.6))}${inBg(0.25, 2.3, pineArt(0.5))}
  ${inBg(2.2, 0.05, fenceArt(9.6))}
  ${poles.map((g) => inBg(g, 0.15, lightPoleArt())).join('')}
  ${lights}
  ${inBg(0.08, 0.5, signArt())}
  ${inBg(0.25, 6.4, moundArt(0.8))}${inBg(11.1, 2.2, moundArt(0.7))}${inBg(5.0, 8.15, moundArt(0.6))}
  `);
};

// ---------- motion helpers ----------
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
function tween(api, it, to, ms, { easing = ease, done } = {}) {
  const from = { gx: it.gx, gy: it.gy, gz: it.gz || 0 };
  const n = Math.max(2, Math.round(ms / 33));
  let dead = false; // stops if someone grabs the item mid-way
  for (let i = 1; i <= n; i++) {
    api.later(() => {
      if (!dead && (it.lifted || !api.items.has(it.id))) dead = true;
      if (!dead) {
        const k = easing(i / n);
        it.gx = from.gx + (to.gx - from.gx) * k;
        it.gy = from.gy + (to.gy - from.gy) * k;
        it.gz = from.gz + ((to.gz ?? from.gz) - from.gz) * k;
        api.place(it);
      }
      if (i === n) done?.(dead);
    }, i * 33);
  }
}
const clampIce = (gx, gy) => {
  let x = gx, y = gy;
  for (let k = 0; k < 12 && !insidePoly(iceInset, x + 0.22, y + 0.22); k++) { x += (6.4 - x) * 0.25; y += (4.3 - y) * 0.25; }
  return [x, y];
};
function glide(api, who) {
  if (who.data.gliding) return;
  who.data.gliding = true;
  const sx = who.gx, sy = who.gy;
  const legs = [[1.5, 0.5], [0.4, -1.0], [-1.0, -0.3], [0, 0]].map(([dx, dy], i, a) => (i === a.length - 1 ? [sx, sy] : clampIce(sx + dx, sy + dy)));
  const go = (i) => {
    if (i >= legs.length) { who.data.gliding = false; return; }
    tween(api, who, { gx: legs[i][0], gy: legs[i][1] }, 520, { done: (stopped) => (stopped ? (who.data.gliding = false) : go(i + 1)) });
  };
  go(0);
}

const I = isoDef;

export const RINK = {
  id: 'rink', posKey: 'rink-iso', title: 'Ice Rink ⛸️', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, outdoor: true,
  light: 'outdoor', iso: R, avatar: [1.3, 7.2],
  frame: (w) => (w === 'snow' ? '#C9CEDF' : '#BCDDF5'),
  bg,
  stars: [{ id: 'rink-bench', gx: 0.95, gy: 5.8 }],
  characters: [{ id: 'leo', look: NPC_WINTER.leo, gx: 8.6, gy: 4.4, say: ['Drag me onto the ice! ⛸️', 'Can you score 3 goals? 🏒', 'Brrr... I need cocoa!'] }],
  onCharacterDrop: (api, who) => {
    if (!onIce(who)) return;
    glide(api, who);
    api.sfx.pick(); api.bubble(who.x + who.w / 2, who.y - 6, 'Wheee! ⛸️');
  },
  onCharacterTap: (api, who) => {
    if (!onIce(who)) return false;
    who.el.classList.remove('spin'); void who.el.offsetWidth; who.el.classList.add('spin');
    who.anim.happy(); api.sfx.wear(); api.bubble(who.x + who.w / 2, who.y - 6, 'Twirl! 💫');
    return true;
  },
  items: [
    I('goal', 7.4, 1.5, 1.6, 0.7, goalArt, { drag: false, data: { goals: 0 } }),
    I('puck', 6.0, 5.2, 0.3, 0.3, puckArt, { small: true, data: { busy: false },
      onTap: (it, api) => {
        if (it.data.busy) return;
        it.data.busy = true;
        const g = api.get('goal');
        const home = { gx: it.gx, gy: it.gy };
        const scored = Math.random() < 0.75;
        const target = scored ? { gx: g.gx + 0.5 + Math.random() * 0.5, gy: g.gy + 0.2 } : { gx: g.gx + (Math.random() < 0.5 ? -0.5 : 1.75), gy: g.gy + 0.55 };
        const dist = Math.hypot(target.gx - it.gx, target.gy - it.gy);
        api.sfx.click();
        tween(api, it, target, Math.max(320, dist * 110), { easing: (t) => 1 - (1 - t) ** 2,
          done: (stopped) => {
            if (stopped) { it.data.busy = false; return; }
            if (scored) {
              g.data.goals++; api.setArt(g); api.sfx.win();
              api.sparkle(g.x + g.w / 2, g.y + g.h * 0.6, ['🏒', '✨', '⭐']);
              api.bubble(g.x + g.w / 2, g.y - 10, g.data.goals === 3 ? 'Hat trick! 🎉' : 'GOAL! 🏒');
              if (g.data.goals === 3 && !api.starFound('rink-goals')) api.addStar('rink-goals', 0, 0, { spawned: true, gx: g.gx + 0.6, gy: g.gy + 1.1 });
            } else api.bubble(g.x + g.w / 2, g.y - 10, 'Missed! Try again!');
            api.later(() => tween(api, it, home, 700, { done: () => { it.data.busy = false; } }), 450);
          } });
      } }),
    I('stick', 6.7, 5.6, 0.3, 1.4, stickArt, { small: true }),
    I('penguin', 4.2, 3.6, 0.5, 0.5, penguinArt, { cls: 'squish',
      onTap: (it, api) => { it.el.classList.remove('waddle'); void it.el.offsetWidth; it.el.classList.add('waddle'); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y - 6, pick(['Honk honk! 🐧', '*slides on tummy*', 'Wanna race?'])); } }),
    I('bench', 0.7, 5.0, 0.7, 1.8, bench, { surface: 46 }),
    I('skates', 0.82, 5.15, 0.5, 0.36, skatesArt, { small: true, gz: 46 }),
    I('cocoacart', 0.3, 3.0, 1.4, 1.1, cocoaCart, { drag: false, surface: 78,
      onTap: (it, api) => {
        if (api.count('cocoa') >= 2) { api.bubble(it.x + it.w / 2, it.y + 20, 'Share the cocoa first! ☕'); return; }
        api.sfx.pour();
        food(api, 'cocoa', 0, 0, { gx: it.gx + 0.62 + api.count('cocoa') * 0.36, gy: it.gy + 0.72, gz: 78 });
        api.bubble(it.x + it.w / 2, it.y + 20, 'One hot cocoa! ☕');
      } }),
    I('lamp1', 1.5, 0.35, 0.5, 0.5, () => lampArt(), { drag: false }),
    I('lamp2', 11.25, 8.2, 0.5, 0.5, () => lampArt(), { drag: false }),
    I('lamp3', 1.55, 8.15, 0.5, 0.5, () => lampArt(), { drag: false }),
    I('pine1', 11.1, 0.3, 0.8, 0.8, () => pineArt(1), { drag: false }),
    I('pine2', 0.2, 7.95, 0.72, 0.72, () => pineArt(0.9), { drag: false }),
    I('pine3', 11.3, 5.5, 0.56, 0.56, () => pineArt(0.7), { drag: false }),
  ],
};
