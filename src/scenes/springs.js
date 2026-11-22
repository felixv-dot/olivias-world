// Hot Springs — isometric diorama on one screen: soak in the steaming pool with a capybara and a snow monkey,
// steam in the sauna, grab a towel scarf, sip cocoa, watch the ski lift, sled, throw snowballs, meet a fox.
import { room, groundShell, floorPoly, isoItem, at, shades, proj, isoDef } from '../iso.js';
import { svg, text, winterSky, mountains, food, wearable, NPC_WINTER } from './common.js';
import { CLIMATES } from '../ui.js';

const R = room({ cols: 12, rows: 10, ox: 736, oy: 120, wallH: 0 });
R.charScale = 0.55;
const DEPTH = 40;

const WOOD = '#C99A6C', WOOD_L = '#E2C29C', WOOD_D = '#A97B52', LOG = '#B98A60', LILAC = '#B79CF0', TEAL = '#7FCFC4', SKY = '#9CC8EE', SUN = '#F5DE7A', SNOW = '#F7F9FE', LIGHT = '#FFF2B0', STONE = '#B4B3CC';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4" stroke-linejoin="round"';
const thin = 'stroke="#3E3252" stroke-opacity=".45" stroke-width="1.1" stroke-linejoin="round"';
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const bump = (it, cls) => { it.el.classList.remove(cls); void it.el.offsetWidth; it.el.classList.add(cls); };
const f1 = (n) => n.toFixed(1);
const P = (p) => p.map(f1).join(',');

// ---------- helpers ----------
const raw = (p) => { const s = isoItem(1, 1, 0, [p]).svg; return s.slice(s.indexOf('>', s.indexOf('<g ')) + 1, s.lastIndexOf('</g>')); };
const B = raw;
const item = (fw, fd, H, ...layers) => isoItem(fw, fd, H, [{ svg: layers.join(''), w: fw, d: fd }]);
const inBg = (gx, gy, it, gz = 0) => { const [sx, sy] = proj(R, gx, gy, gz); return it.svg.replace('width="100%" height="100%"', `x="${f1(sx - it.ax)}" y="${f1(sy - it.ay)}" width="${f1(it.w)}" height="${f1(it.h)}"`); };
const shadow = (u, v, rx, ry, op = 0.12) => { const [x, y] = at(u, v); return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="#3E3252" opacity="${op}"/>`; };
const gpts = (pts, gz = 0) => pts.map(([a, b]) => P(proj(R, a, b, gz))).join(' ');
const insidePoly = (poly, x, y) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

// ---------- the pool (grid coordinates) ----------
const PC = { gx: 7.1, gy: 5.7 };
const blob = (k, n = 44) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2;
  const r = 1 + 0.07 * Math.sin(3 * a + 0.6) + 0.04 * Math.cos(5 * a);
  return [PC.gx + Math.cos(a) * 2.45 * r * k, PC.gy + Math.sin(a) * 1.95 * r * k];
});
const POOL = blob(1);
const RIM = blob(1.14, 30);
const inPool = (who) => insidePoly(POOL, who.gx + 0.22, who.gy + 0.22);
const POOL_BOX = { gx: 4.4, gy: 3.5, fw: 5.4, fd: 4.4 };

const rippleSvg = `<svg viewBox="0 0 200 60" width="200" height="60"><ellipse cx="100" cy="30" rx="90" ry="22" fill="none" stroke="#fff" stroke-width="4" opacity=".8"/><ellipse cx="100" cy="30" rx="56" ry="13" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/></svg>`;
const puffSvg = (tint = '#FFFFFF') => `<svg viewBox="0 0 120 90" width="120" height="90"><path d="M20 70 Q4 66 10 50 Q8 30 30 32 Q38 10 62 16 Q86 8 94 32 Q116 34 110 56 Q114 74 94 72 Z" fill="${tint}" opacity=".9"/></svg>`;

// ---------- props ----------
const pineSvg = (cu, cv, s, z = 0) => {
  const [cx, cy] = at(cu, cv, z);
  return [[-30, -118, 58], [-84, -162, 45], [-128, -206, 31]].map(([yb0, yt0, hw0]) => {
    const yb = cy + yb0 * s, yt = cy + yt0 * s, hw = hw0 * s, h = yb - yt, sag = hw * 0.34;
    const body = `M${f1(cx - hw)} ${f1(yb)} Q${f1(cx)} ${f1(yb + sag)} ${f1(cx + hw)} ${f1(yb)} L${f1(cx)} ${f1(yt)} Z`;
    const cap = `M${f1(cx)} ${f1(yt)} L${f1(cx + hw * 0.5)} ${f1(yt + h * 0.5)} Q${f1(cx + hw * 0.32)} ${f1(yt + h * 0.64)} ${f1(cx + hw * 0.14)} ${f1(yt + h * 0.52)} Q${f1(cx)} ${f1(yt + h * 0.68)} ${f1(cx - hw * 0.16)} ${f1(yt + h * 0.53)} Q${f1(cx - hw * 0.34)} ${f1(yt + h * 0.65)} ${f1(cx - hw * 0.5)} ${f1(yt + h * 0.5)} Z`;
    const rim = `M${f1(cx - hw * 0.96)} ${f1(yb - 2)} Q${f1(cx)} ${f1(yb + sag - 2)} ${f1(cx + hw * 0.96)} ${f1(yb - 2)} Q${f1(cx)} ${f1(yb + sag - 9 * s)} ${f1(cx - hw * 0.96)} ${f1(yb - 2)} Z`;
    return `<path d="${body}" fill="#4F927E"/>
      <path d="M${f1(cx)} ${f1(yt)} L${f1(cx - hw)} ${f1(yb)} Q${f1(cx - hw * 0.5)} ${f1(yb + sag * 0.75)} ${f1(cx)} ${f1(yb + sag * 0.5)} Z" fill="#62A98F"/>
      <path d="${body}" fill="none" ${line}/><path d="${rim}" fill="#FFFFFF" opacity=".95"/>
      <path d="${cap}" fill="#FFFFFF" ${thin}/><path d="M${f1(cx)} ${f1(yt + 2)} L${f1(cx + hw * 0.46)} ${f1(yt + h * 0.5)} Q${f1(cx + hw * 0.3)} ${f1(yt + h * 0.6)} ${f1(cx + hw * 0.14)} ${f1(yt + h * 0.5)} Z" fill="#E1E2F4"/>`;
  }).join('');
};
const pineArt = (s = 1) => {
  const fp = 0.8 * s;
  return item(fp, fp, 214 * s, shadow(fp / 2, fp / 2, 52 * s, 24 * s),
    B({ u: fp / 2 - 0.07 * s, v: fp / 2 - 0.07 * s, w: 0.14 * s, d: 0.14 * s, h: 34 * s, ...shades('#9A7052') }),
    pineSvg(fp / 2, fp / 2, s, 4 * s));
};
const lampArt = () => item(0.5, 0.5, 200,
  shadow(0.25, 0.25, 26, 12),
  B({ u: 0.1, v: 0.1, w: 0.3, d: 0.3, h: 10, ...shades('#6E6496') }),
  B({ u: 0.21, v: 0.21, w: 0.08, d: 0.08, z: 10, h: 140, ...shades('#6E6496') }),
  B({ u: 0.13, v: 0.13, w: 0.24, d: 0.24, z: 150, h: 4, ...shades('#6E6496') }),
  B({ u: 0.15, v: 0.15, w: 0.2, d: 0.2, z: 154, h: 26, top: LIGHT, left: '#FFF4C4', right: '#F3E3A0' }),
  (() => { const c = [at(0.1, 0.1, 180), at(0.4, 0.1, 180), at(0.4, 0.4, 180), at(0.1, 0.4, 180)], ap = at(0.25, 0.25, 198);
    return `<polygon points="${[c[3], c[2], ap].map(P).join(' ')}" fill="#6E6496" ${line}/><polygon points="${[c[2], c[1], ap].map(P).join(' ')}" fill="#5A5180" ${line}/>
      <path d="M${f1(c[3][0])} ${f1(c[3][1])} L${f1(ap[0])} ${f1(ap[1])} L${f1(c[1][0])} ${f1(c[1][1])} Q${f1(ap[0] + 6)} ${f1(ap[1] + 12)} ${f1(ap[0])} ${f1(ap[1] + 8)} Q${f1(ap[0] - 8)} ${f1(ap[1] + 14)} ${f1(c[3][0])} ${f1(c[3][1])} Z" fill="#fff"/>`; })(),
  (() => { const [x, y] = at(0.25, 0.25, 166); return `<circle cx="${f1(x)}" cy="${f1(y)}" r="62" fill="url(#sp-glow)"/>`; })());
const moundArt = (s = 1) => item(1 * s, 0.8 * s, 34 * s, (() => {
  const [x, y] = at(0.5 * s, 0.4 * s);
  return `<path d="M${f1(x - 56 * s)} ${f1(y + 6)} Q${f1(x - 50 * s)} ${f1(y - 22 * s)} ${f1(x - 18 * s)} ${f1(y - 24 * s)} Q${f1(x + 4)} ${f1(y - 38 * s)} ${f1(x + 26 * s)} ${f1(y - 20 * s)} Q${f1(x + 54 * s)} ${f1(y - 16 * s)} ${f1(x + 56 * s)} ${f1(y + 6)} Q${f1(x)} ${f1(y + 22 * s)} ${f1(x - 56 * s)} ${f1(y + 6)} Z" fill="#FFFFFF" ${line}/>
    <path d="M${f1(x + 10 * s)} ${f1(y - 18 * s)} Q${f1(x + 40 * s)} ${f1(y - 10 * s)} ${f1(x + 48 * s)} ${f1(y + 6)} Q${f1(x + 20 * s)} ${f1(y + 14 * s)} ${f1(x + 4)} ${f1(y + 10 * s)} Z" fill="#E1E3F4"/>`;
})());
const rock = (x, y, r, snow = true) => `<path d="M${f1(x - r)} ${f1(y + r * 0.3)} Q${f1(x - r * 1.02)} ${f1(y - r * 0.55)} ${f1(x - r * 0.1)} ${f1(y - r * 0.6)} Q${f1(x + r)} ${f1(y - r * 0.62)} ${f1(x + r)} ${f1(y + r * 0.25)} Q${f1(x)} ${f1(y + r * 0.62)} ${f1(x - r)} ${f1(y + r * 0.3)} Z" fill="${STONE}" ${thin}/>
  <path d="M${f1(x + r * 0.2)} ${f1(y - r * 0.5)} Q${f1(x + r * 0.95)} ${f1(y - r * 0.45)} ${f1(x + r * 0.95)} ${f1(y + r * 0.22)} Q${f1(x + r * 0.5)} ${f1(y + r * 0.45)} ${f1(x + r * 0.3)} ${f1(y + r * 0.4)} Z" fill="#9B99B8"/>
  ${snow ? `<path d="M${f1(x - r * 0.8)} ${f1(y - r * 0.28)} Q${f1(x - r * 0.4)} ${f1(y - r * 0.72)} ${f1(x + r * 0.5)} ${f1(y - r * 0.5)} Q${f1(x + r * 0.2)} ${f1(y - r * 0.3)} ${f1(x - r * 0.1)} ${f1(y - r * 0.34)} Q${f1(x - r * 0.5)} ${f1(y - r * 0.18)} ${f1(x - r * 0.8)} ${f1(y - r * 0.28)} Z" fill="#FFFFFF"/>` : ''}`;

const saunaArt = (it) => {
  const open = it?.data.open;
  const W = 2.6, D = 2.2, HW = 100, HR = 168;
  const logs = (len) => Array.from({ length: 7 }, (_, i) => `<path d="M0 ${f1(8 + i * 13.5)} H${len}" stroke="#8E6745" stroke-width="1.6" opacity=".55"/><path d="M0 ${f1(13 + i * 13.5)} H${len}" stroke="#E2C29C" stroke-width="2" opacity=".5"/>`).join('');
  const ends = (len) => Array.from({ length: 7 }, (_, i) => `<circle cx="${len - 4}" cy="${f1(8 + i * 13.5)}" r="5" fill="#E2C29C" stroke="#8E6745" stroke-width="1"/>`).join('');
  const door = open
    ? `<rect x="66" y="34" width="38" height="66" rx="4" fill="url(#sp-warm)" ${thin}/><path d="M70 92 H100" stroke="#B9774E" stroke-width="4"/><path d="M104 34 L118 40 V104 L104 100 Z" fill="${WOOD_D}" ${thin}/>`
    : `<rect x="66" y="34" width="38" height="66" rx="4" fill="${WOOD_D}" ${thin}/><path d="M78 36 V98 M91 36 V98" stroke="#7A5A3E" stroke-width="1.6"/><circle cx="85" cy="54" r="8" fill="url(#sp-warm)" ${thin}/><circle cx="98" cy="70" r="2.6" fill="${SUN}"/>`;
  const ridge0 = at(-0.12, D / 2, HR), ridge1 = at(W + 0.12, D / 2, HR), eave0 = at(-0.12, D + 0.2, HW - 8), eave1 = at(W + 0.12, D + 0.2, HW - 8);
  const gable = [at(W, D, HW), at(W, 0, HW), at(W, D / 2, HR)];
  const chim = at(1.9, 0.7, HR - 20);
  return item(W, D, 230,
    shadow(W / 2, D / 2, 150, 66, 0.12),
    B({ u: 0, v: 0, w: W, d: D, h: 8, ...shades('#9C98B8') }),
    B({ u: 0.05, v: 0.05, w: W - 0.1, d: D - 0.1, z: 8, h: HW - 8, ...shades(LOG),
      leftDecor: `${logs((W - 0.1) * 64)}<rect x="22" y="6" width="${(W - 0.1) * 64 - 44}" height="20" rx="5" fill="#FBF7EF" ${thin}/>${text((W - 0.1) * 32, 21, 'SAUNA ♨', 13, '#B9774E')}${door}
        <rect x="16" y="44" width="34" height="28" rx="4" fill="url(#sp-warm)" ${thin}/><path d="M33 44 V72 M16 58 H50" stroke="${WOOD_D}" stroke-width="2.4"/><path d="M14 72 H52" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
      rightDecor: `${logs((D - 0.1) * 64)}${ends((D - 0.1) * 64)}<rect x="44" y="40" width="44" height="30" rx="4" fill="url(#sp-warm)" ${thin}/><path d="M66 40 V70" stroke="${WOOD_D}" stroke-width="2.4"/><path d="M42 70 H90" stroke="#fff" stroke-width="4" stroke-linecap="round"/>` }),
    `<polygon points="${gable.map(P).join(' ')}" fill="#A9794F" ${line}/>`,
    `<path d="M${P(at(W, D * 0.25, HW + 20))} L${P(at(W, D * 0.75, HW + 20))} M${P(at(W, D * 0.36, HW + 40))} L${P(at(W, D * 0.64, HW + 40))}" stroke="#8E6745" stroke-width="1.6" opacity=".6"/>`,
    `<polygon points="${[ridge0, ridge1, eave1, eave0].map(P).join(' ')}" fill="#FFFFFF" ${line}/>`,
    `<polygon points="${[eave0, eave1, at(W + 0.12, D + 0.2, HW - 16), at(-0.12, D + 0.2, HW - 16)].map(P).join(' ')}" fill="#DCE0F2" ${line}/>`,
    `<path d="M${P(at(-0.12, D + 0.2, HW - 16))} ${Array.from({ length: 13 }, (_, i) => { const u = -0.12 + ((W + 0.24) * (i + 0.5)) / 13; const p = at(u, D + 0.2, HW - 16); return `L${f1(p[0])} ${f1(p[1] + 8 + (i % 3) * 4)} L${f1(p[0] + 5)} ${f1(p[1] + 2)}`; }).join(' ')}" fill="none" stroke="#CFEFF6" stroke-width="2.4" stroke-linejoin="round"/>`,
    `<path d="M${P(at(0.3, D * 0.75, HR - 34))} Q${P(at(1.2, D * 0.8, HR - 30))} ${P(at(2.2, D * 0.72, HR - 36))}" fill="none" stroke="#E6E9F7" stroke-width="5" stroke-linecap="round"/>`,
    B({ u: 1.78, v: 0.58, w: 0.26, d: 0.26, z: HR - 40, h: 52, ...shades('#8C87AA') }),
    B({ u: 1.74, v: 0.54, w: 0.34, d: 0.34, z: HR + 12, h: 6, ...shades('#FFFFFF', 0.4) }),
    `<path class="wx-steam" d="M${f1(chim[0])} ${f1(chim[1] - 60)} q-10 -14 0 -26 q10 -12 0 -26" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"/><path class="wx-steam" style="animation-delay:-2.5s" d="M${f1(chim[0] + 6)} ${f1(chim[1] - 60)} q-10 -14 0 -26" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".8"/>`,
    // little porch step + wood pile
    B({ u: 0.85, v: D, w: 0.9, d: 0.32, h: 8, ...shades(WOOD) }),
    ...[0, 1, 2].map((i) => B({ u: 2.0 + (i % 2) * 0.05, v: D + 0.02, w: 0.5, d: 0.16, z: i * 9, h: 9, top: '#E2C29C', left: '#B98A60', right: '#A97B52' })));
};

const kioskArt = () => {
  const W = 1.8, D = 1.2;
  const scal = Array.from({ length: 9 }, (_, i) => { const u = (W + 0.1) * (i / 9) - 0.05, u2 = (W + 0.1) * ((i + 1) / 9) - 0.05; const a = at(u, D + 0.1, 172), b = at(u2, D + 0.1, 172), m = at((u + u2) / 2, D + 0.1, 158); return `<path d="M${P(a)} Q${P(m)} ${P(b)} Z" fill="${i % 2 ? '#FBF7EF' : LILAC}" ${thin}/>`; }).join('');
  return item(W, D, 220,
    shadow(W / 2, D / 2, 110, 50, 0.12),
    B({ u: 0, v: 0, w: W, d: 0.16, h: 174, ...shades(WOOD),
      leftDecor: `${[34, 62, 90].map((y, r) => `<path d="M8 ${y} H${W * 64 - 8}" stroke="${WOOD_D}" stroke-width="4"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${14 + i * 17} ${y - 2} v-11 h11 v11 z" fill="${[LILAC, TEAL, SUN, SKY][(i + r) % 4]}" ${thin}/><path d="M${25 + i * 17} ${y - 10} q4 0 4 4 q0 4 -4 4" fill="none" stroke="#3E3252" stroke-opacity=".45" stroke-width="1.2"/>`).join('')}`).join('')}` }),
    B({ u: 0.12, v: 0.16, w: 0.44, d: 0.36, z: 0, h: 62, ...shades('#E8E2F2') }),
    B({ u: 0.18, v: 0.2, w: 0.32, d: 0.26, z: 62, h: 26, ...shades('#8F86B8') }),
    (() => { const [x, y] = at(0.34, 0.33, 88); return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="14" ry="6" fill="#8B5A3C" ${thin}/><path class="wx-steam" d="M${f1(x - 4)} ${f1(y - 6)} q-8 -14 0 -26 q8 -12 0 -24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>`; })(),
    B({ u: 0.06, v: 0.94, w: 0.08, d: 0.08, z: 74, h: 98, ...shades(WOOD_D) }),
    B({ u: W - 0.14, v: 0.94, w: 0.08, d: 0.08, z: 74, h: 98, ...shades(WOOD_D) }),
    B({ u: 0, v: 0.5, w: W, d: 0.6, h: 72, ...shades('#FBF7EF'),
      leftDecor: `${Array.from({ length: 9 }, (_, i) => `<path d="M${10 + i * 12} 4 V68" stroke="#3E3252" stroke-opacity=".1" stroke-width="1.4"/>`).join('')}<rect x="22" y="20" width="${W * 64 - 44}" height="26" rx="8" fill="${TEAL}" ${thin}/>${text(W * 32, 38, 'HOT COCOA', 12, '#FFFFFF')}`,
      rightDecor: `<path d="M6 30 H${0.6 * 64 - 6}" stroke="${TEAL}" stroke-width="5"/>` }),
    B({ u: -0.04, v: 0.46, w: W + 0.08, d: 0.7, z: 72, h: 8, ...shades(WOOD_L) }),
    B({ u: 1.3, v: 0.6, w: 0.22, d: 0.22, z: 80, h: 28, top: '#FFFFFF', left: '#EAF4FA" fill-opacity=".85', right: '#D7E6F2" fill-opacity=".85' }),
    (() => { const [x, y] = at(1.41, 0.71, 94); return [[-5, 0], [5, -3], [0, -9], [5, 6], [-4, 7]].map(([dx, dy]) => `<rect x="${f1(x + dx - 4)}" y="${f1(y + dy - 4)}" width="8" height="8" rx="2.5" fill="#FBF7EF" ${thin}/>`).join(''); })(),
    B({ u: -0.08, v: -0.06, w: W + 0.16, d: D + 0.18, z: 172, h: 10, ...shades(LILAC) }),
    B({ u: -0.06, v: -0.04, w: W + 0.12, d: D + 0.14, z: 182, h: 7, ...shades('#FFFFFF', 0.4), topDecor: '<path d="M.2 .3 Q.9 .1 1.6 .4" stroke="#E1E3F4" stroke-width=".08" fill="none"/>' }),
    scal,
    ...[0.3, 0.75, 1.2, 1.6].map((u, i) => { const [x, y] = at(u, D + 0.1, 160); return `<circle cx="${f1(x)}" cy="${f1(y)}" r="9" fill="${LIGHT}" opacity=".4"/><circle cx="${f1(x)}" cy="${f1(y)}" r="3.5" fill="${[LIGHT, '#BFEDE6', '#DCCBFA', LIGHT][i]}" ${thin}/>`; }));
};

const rackArt = () => {
  const D = 1.8;
  const towel = (v, c, h) => B({ u: 0.36, v, w: 0.05, d: 0.36, z: 96 - h, h, top: c, left: c, right: c, rightDecor: `<path d="M0 ${h - 8} H23" stroke="#fff" stroke-width="3" opacity=".6"/>` });
  return item(0.5, D, 150,
    shadow(0.25, D / 2, 70, 30, 0.1),
    B({ u: 0.18, v: 0.05, w: 0.08, d: 0.08, h: 100, ...shades(WOOD_D) }),
    B({ u: 0.18, v: D - 0.13, w: 0.08, d: 0.08, h: 100, ...shades(WOOD_D) }),
    B({ u: 0.08, v: 0.15, w: 0.34, d: D - 0.3, z: 24, h: 6, ...shades(WOOD) }),
    ...[[0.32, '#9EDDD4'], [0.72, '#C9B8F2'], [1.14, SUN]].map(([v, c]) => B({ u: 0.12, v, w: 0.26, d: 0.26, z: 30, h: 14, ...shades(c) })),
    B({ u: 0.14, v: 0.0, w: 0.22, d: D, z: 96, h: 6, ...shades(WOOD) }),
    towel(0.2, '#9EDDD4', 40), towel(0.66, '#C9B8F2', 34), towel(1.12, SKY, 44),
    B({ u: 0.13, v: -0.01, w: 0.24, d: D + 0.02, z: 102, h: 4, ...shades('#FFFFFF', 0.4) }),
    (() => { const [x, y] = at(0.25, D / 2, 136); return `<rect x="${f1(x - 40)}" y="${f1(y - 16)}" width="80" height="26" rx="9" fill="#FBF7EF" ${thin}/>${text(x, y + 2, 'Towels', 12, '#3E8F88')}<path d="M${f1(x)} ${f1(y + 10)} V${f1(y + 30)}" stroke="${WOOD_D}" stroke-width="3"/>`; })());
};

const stationArt = () => {
  const [wx, wy] = at(0.4, 0.9, 150);
  const spokes = Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<path d="M${f1(wx)} ${f1(wy)} L${f1(wx + Math.cos(a) * 38)} ${f1(wy + Math.sin(a) * 19)}" stroke="#7F89A6" stroke-width="2"/>`; }).join('');
  return item(2.2, 1.8, 230,
    shadow(1.1, 0.9, 120, 54, 0.12),
    B({ u: 0.3, v: 0.75, w: 0.12, d: 0.12, h: 146, ...shades('#7F89A6') }),
    `<ellipse cx="${f1(wx)}" cy="${f1(wy)}" rx="44" ry="22" fill="#AEB8CC" ${line}/><ellipse cx="${f1(wx)}" cy="${f1(wy)}" rx="36" ry="18" fill="#C9D0E0" ${thin}/>${spokes}<ellipse cx="${f1(wx)}" cy="${f1(wy)}" rx="7" ry="4" fill="#5A5180"/>`,
    B({ u: 0.85, v: 0.2, w: 1.3, d: 1.5, h: 120, ...shades('#D9AE86'),
      leftDecor: `${Array.from({ length: 8 }, (_, i) => `<path d="M${8 + i * 10} 4 V116" stroke="#3E3252" stroke-opacity=".1" stroke-width="1.4"/>`).join('')}<rect x="10" y="14" width="${1.3 * 64 - 20}" height="34" rx="5" fill="#FFE9A6" ${thin}/><path d="M${1.3 * 32} 14 V48 M10 31 H${1.3 * 64 - 10}" stroke="${WOOD_D}" stroke-width="2.4"/>
        <rect x="8" y="62" width="${1.3 * 64 - 16}" height="22" rx="7" fill="#FBF7EF" ${thin}/>${text(1.3 * 32, 78, 'SKI LIFT', 11, '#7A64B0')}`,
      rightDecor: `<rect x="24" y="40" width="40" height="76" rx="4" fill="${WOOD_D}" ${thin}/><circle cx="56" cy="80" r="2.6" fill="${SUN}"/><rect x="26" y="10" width="36" height="22" rx="4" fill="#FFE9A6" ${thin}/>` }),
    `<polygon points="${[at(0.75, 1.82, 118), at(2.25, 1.82, 118), at(1.5, 0.95, 176)].map(P).join(' ')}" fill="#7A64B0" ${line}/>`,
    `<polygon points="${[at(2.25, 1.82, 118), at(2.25, 0.08, 118), at(1.5, 0.95, 176)].map(P).join(' ')}" fill="#65529A" ${line}/>`,
    `<path d="M${P(at(0.75, 1.82, 118))} L${P(at(1.5, 0.95, 176))} L${P(at(2.25, 1.82, 118))} Q${P(at(1.9, 1.7, 128))} ${P(at(1.7, 1.75, 122))} Q${P(at(1.4, 1.6, 130))} ${P(at(1.1, 1.72, 124))} Q${P(at(0.9, 1.7, 126))} ${P(at(0.75, 1.82, 118))} Z" fill="#FFFFFF" ${thin}/>`,
    `<path d="M${P(at(2.25, 0.08, 118))} L${P(at(1.5, 0.95, 176))} L${P(at(2.25, 1.82, 118))} Q${P(at(2.1, 1.2, 132))} ${P(at(2.2, 0.8, 126))} Q${P(at(2.0, 0.5, 134))} ${P(at(2.25, 0.08, 118))} Z" fill="#E6E8F6" ${thin}/>`);
};
const skiRackArt = () => {
  const D = 1.4;
  const ski = (v, c, tilt) => { const b = at(0.2, v, 0), t = at(0.12 + tilt, v, 120); return `<path d="M${P(b)} L${P(t)}" stroke="#3E3252" stroke-opacity=".55" stroke-width="10" stroke-linecap="round"/><path d="M${P(b)} L${P(t)}" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`; };
  const pole = (v) => { const b = at(0.25, v, 0), t = at(0.18, v, 100); return `<path d="M${P(b)} L${P(t)}" stroke="#6E6496" stroke-width="2.6"/><ellipse cx="${f1(b[0])}" cy="${f1(b[1] - 10)}" rx="6" ry="3" fill="none" stroke="#6E6496" stroke-width="2"/>`; };
  return item(0.4, D, 140,
    shadow(0.2, D / 2, 54, 26, 0.1),
    B({ u: 0.05, v: 0.05, w: 0.08, d: 0.08, h: 70, ...shades(WOOD_D) }), B({ u: 0.05, v: D - 0.13, w: 0.08, d: 0.08, h: 70, ...shades(WOOD_D) }),
    B({ u: 0.02, v: 0, w: 0.14, d: D, z: 62, h: 8, ...shades(WOOD) }),
    ski(0.2, TEAL, -0.02), ski(0.34, TEAL, 0), ski(0.62, LILAC, 0.02), ski(0.76, LILAC, 0), pole(0.95), pole(1.04), ski(1.2, SUN, 0.03),
    B({ u: 0.0, v: -0.02, w: 0.18, d: D + 0.04, z: 70, h: 4, ...shades('#FFFFFF', 0.4) }));
};
const stoneLanternArt = (it) => {
  const on = it?.data.on;
  return item(0.6, 0.6, 150,
    shadow(0.3, 0.3, 34, 15),
    B({ u: 0.06, v: 0.06, w: 0.48, d: 0.48, h: 12, ...shades(STONE) }),
    B({ u: 0.2, v: 0.2, w: 0.2, d: 0.2, z: 12, h: 52, ...shades(STONE) }),
    B({ u: 0.1, v: 0.1, w: 0.4, d: 0.4, z: 64, h: 8, ...shades(STONE) }),
    B({ u: 0.14, v: 0.14, w: 0.32, d: 0.32, z: 72, h: 30, ...shades(STONE),
      leftDecor: `<rect x="5" y="6" width="10" height="18" rx="2" fill="${on ? '#FFE9A6' : '#6A6F8E'}"/>`, rightDecor: `<rect x="5" y="6" width="10" height="18" rx="2" fill="${on ? '#F6D98A' : '#5C6080'}"/>` }),
    (() => { const c = [at(0.0, 0.0, 102), at(0.6, 0.0, 102), at(0.6, 0.6, 102), at(0.0, 0.6, 102)], ap = at(0.3, 0.3, 126);
      return `<polygon points="${[c[3], c[2], ap].map(P).join(' ')}" fill="${STONE}" ${line}/><polygon points="${[c[2], c[1], ap].map(P).join(' ')}" fill="#9B99B8" ${line}/>
        <path d="M${P(c[3])} L${P(ap)} L${P(c[1])} Q${f1(ap[0] + 10)} ${f1(ap[1] + 16)} ${f1(ap[0] + 2)} ${f1(ap[1] + 12)} Q${f1(ap[0] - 12)} ${f1(ap[1] + 18)} ${P(c[3]).replace(',', ' ')} Z" fill="#FFFFFF"/>
        <circle cx="${f1(ap[0])}" cy="${f1(ap[1] - 5)}" r="6" fill="${STONE}" ${thin}/>`; })(),
    on ? (() => { const [x, y] = at(0.3, 0.3, 88); return `<circle cx="${f1(x)}" cy="${f1(y)}" r="60" fill="url(#sp-glow)"/>`; })() : '');
};
const bucketArt = () => item(0.4, 0.4, 50, (() => {
  const [x, y] = at(0.2, 0.2);
  return `<ellipse cx="${f1(x)}" cy="${f1(y + 2)}" rx="22" ry="9" fill="#3E3252" opacity=".13"/>
    <path d="M${f1(x - 17)} ${f1(y - 30)} L${f1(x - 14)} ${f1(y - 2)} A14 6 0 0 0 ${f1(x + 14)} ${f1(y - 2)} L${f1(x + 17)} ${f1(y - 30)} Z" fill="url(#sp-hinoki)" ${line}/>
    <path d="M${f1(x - 16)} ${f1(y - 22)} A16 6 0 0 0 ${f1(x + 16)} ${f1(y - 22)} M${f1(x - 15)} ${f1(y - 9)} A15 6 0 0 0 ${f1(x + 15)} ${f1(y - 9)}" fill="none" stroke="#7E8AA6" stroke-width="2.4"/>
    <ellipse cx="${f1(x)}" cy="${f1(y - 30)}" rx="17" ry="7" fill="#8FD8D2" ${thin}/><path d="M${f1(x - 6)} ${f1(y - 31)} q6 -3 12 0" stroke="#fff" stroke-width="2" fill="none"/>
    <path d="M${f1(x + 10)} ${f1(y - 34)} L${f1(x + 24)} ${f1(y - 50)}" stroke="#C9A57C" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="${f1(x + 26)}" cy="${f1(y - 53)}" rx="6" ry="4" fill="#E2C29C" ${thin}/>`;
})());
const waterRing = (x, y, rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${f1(rx * 0.38)}" fill="#7FD3CF" opacity=".55"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${f1(rx * 0.38)}" fill="none" stroke="#fff" stroke-width="2.4" opacity=".85"/>`;
const capyArt = () => item(0.9, 0.6, 60, (() => {
  const [x, y] = at(0.45, 0.3);
  return `<path d="M${f1(x - 40)} ${f1(y - 2)} Q${f1(x - 42)} ${f1(y - 30)} ${f1(x - 10)} ${f1(y - 32)} Q${f1(x + 24)} ${f1(y - 34)} ${f1(x + 30)} ${f1(y - 14)} L${f1(x + 30)} ${f1(y - 2)} Z" fill="url(#sp-capy)" ${line}/>
    <path d="M${f1(x + 14)} ${f1(y - 6)} Q${f1(x + 14)} ${f1(y - 36)} ${f1(x + 34)} ${f1(y - 38)} Q${f1(x + 52)} ${f1(y - 36)} ${f1(x + 50)} ${f1(y - 16)} Q${f1(x + 50)} ${f1(y - 6)} ${f1(x + 40)} ${f1(y - 6)} Z" fill="url(#sp-capy)" ${line}/>
    <ellipse cx="${f1(x + 24)}" cy="${f1(y - 38)}" rx="4" ry="3" fill="#8A6649" ${thin}/><circle cx="${f1(x + 38)}" cy="${f1(y - 26)}" r="2" fill="#3E3252"/><path d="M${f1(x + 44)} ${f1(y - 16)} q3 2 6 0" stroke="#3E3252" stroke-width="1.4" fill="none"/>
    <circle cx="${f1(x + 30)}" cy="${f1(y - 44)}" r="7" fill="url(#sp-yuzu)" ${thin}/><path d="M${f1(x + 30)} ${f1(y - 51)} q3 -4 7 -3" stroke="#6DBE7A" stroke-width="2" fill="none"/>
    ${waterRing(x + 4, y - 2, 52)}<path d="M${f1(x - 30)} ${f1(y + 2)} q10 4 20 0 M${f1(x + 10)} ${f1(y + 4)} q10 3 20 0" stroke="#fff" stroke-width="2" opacity=".7" fill="none"/>`;
})());
const monkeyArt = () => item(0.6, 0.6, 70, (() => {
  const [x, y] = at(0.3, 0.3);
  return `<ellipse cx="${f1(x)}" cy="${f1(y - 8)}" rx="26" ry="16" fill="url(#sp-fur)" ${line}/>
    <circle cx="${f1(x)}" cy="${f1(y - 34)}" r="18" fill="url(#sp-fur)" ${line}/><ellipse cx="${f1(x)}" cy="${f1(y - 31)}" rx="12" ry="11" fill="#E9A99A" ${thin}/>
    <circle cx="${f1(x - 18)}" cy="${f1(y - 36)}" r="5" fill="#E9A99A" ${thin}/><circle cx="${f1(x + 18)}" cy="${f1(y - 36)}" r="5" fill="#E9A99A" ${thin}/>
    <circle cx="${f1(x - 4.5)}" cy="${f1(y - 34)}" r="2" fill="#3E3252"/><circle cx="${f1(x + 4.5)}" cy="${f1(y - 34)}" r="2" fill="#3E3252"/><path d="M${f1(x - 3)} ${f1(y - 27)} q3 2 6 0" stroke="#3E3252" stroke-width="1.4" fill="none"/>
    <path d="M${f1(x - 12)} ${f1(y - 50)} q12 -8 24 0 q-4 6 -12 5 q-8 1 -12 -5 z" fill="#F5DE7A" ${thin}/>
    ${waterRing(x, y - 4, 36)}`;
})());
const duckArt = () => item(0.4, 0.4, 44, (() => {
  const [x, y] = at(0.2, 0.2);
  return `${waterRing(x, y - 2, 22)}<path d="M${f1(x - 16)} ${f1(y - 6)} Q${f1(x - 18)} ${f1(y - 20)} ${f1(x - 4)} ${f1(y - 18)} Q${f1(x + 14)} ${f1(y - 20)} ${f1(x + 14)} ${f1(y - 6)} Z" fill="url(#sp-duck)" ${line}/>
    <circle cx="${f1(x + 6)}" cy="${f1(y - 26)}" r="9" fill="url(#sp-duck)" ${line}/><circle cx="${f1(x + 9)}" cy="${f1(y - 28)}" r="1.8" fill="#3E3252"/><path d="M${f1(x + 14)} ${f1(y - 26)} l8 1 l-7 4 z" fill="#F0A060" ${thin}/>`;
})());
const foxArt = () => item(0.6, 0.5, 70, (() => {
  const [x, y] = at(0.3, 0.25);
  return `<ellipse cx="${f1(x)}" cy="${f1(y + 2)}" rx="34" ry="11" fill="#3E3252" opacity=".13"/>
    <path class="tail" d="M${f1(x + 14)} ${f1(y - 12)} Q${f1(x + 44)} ${f1(y - 20)} ${f1(x + 40)} ${f1(y - 44)} Q${f1(x + 30)} ${f1(y - 26)} ${f1(x + 10)} ${f1(y - 22)} Z" fill="url(#sp-fox)" ${line}/>
    <path d="M${f1(x + 36)} ${f1(y - 36)} Q${f1(x + 42)} ${f1(y - 42)} ${f1(x + 40)} ${f1(y - 46)} Q${f1(x + 34)} ${f1(y - 40)} ${f1(x + 32)} ${f1(y - 34)} Z" fill="#FFFFFF"/>
    <ellipse cx="${f1(x + 2)}" cy="${f1(y - 16)}" rx="20" ry="14" fill="url(#sp-fox)" ${line}/><path d="M${f1(x - 8)} ${f1(y - 4)} v5 M${f1(x + 8)} ${f1(y - 4)} v5" stroke="#5A4A5E" stroke-width="4" stroke-linecap="round"/>
    <path d="M${f1(x - 26)} ${f1(y - 44)} L${f1(x - 22)} ${f1(y - 60)} L${f1(x - 12)} ${f1(y - 48)} Z M${f1(x - 4)} ${f1(y - 48)} L${f1(x + 4)} ${f1(y - 60)} L${f1(x + 6)} ${f1(y - 42)} Z" fill="url(#sp-fox)" ${thin}/>
    <path d="M${f1(x - 30)} ${f1(y - 34)} Q${f1(x - 28)} ${f1(y - 50)} ${f1(x - 10)} ${f1(y - 50)} Q${f1(x + 8)} ${f1(y - 48)} ${f1(x + 6)} ${f1(y - 34)} Q${f1(x - 6)} ${f1(y - 22)} ${f1(x - 18)} ${f1(y - 24)} Q${f1(x - 30)} ${f1(y - 26)} ${f1(x - 30)} ${f1(y - 34)} Z" fill="url(#sp-fox)" ${line}/>
    <path d="M${f1(x - 30)} ${f1(y - 32)} Q${f1(x - 18)} ${f1(y - 30)} ${f1(x - 12)} ${f1(y - 24)} Q${f1(x - 22)} ${f1(y - 22)} ${f1(x - 30)} ${f1(y - 32)} Z" fill="#FFFFFF"/>
    <circle cx="${f1(x - 32)}" cy="${f1(y - 33)}" r="2.4" fill="#3E3252"/><circle cx="${f1(x - 18)}" cy="${f1(y - 38)}" r="2" fill="#3E3252"/><circle cx="${f1(x - 6)}" cy="${f1(y - 39)}" r="2" fill="#3E3252"/>`;
})());
const pileArt = () => item(1.4, 1.0, 110, (() => {
  const [x, y] = at(0.7, 0.5);
  const balls = [[-26, -10], [6, -16], [32, -6], [-8, -32], [20, -34]].map(([dx, dy]) => `<circle cx="${f1(x + dx)}" cy="${f1(y + dy)}" r="13" fill="url(#sp-ball)" ${thin}/>`).join('');
  return `<ellipse cx="${f1(x)}" cy="${f1(y + 4)}" rx="76" ry="28" fill="#3E3252" opacity=".1"/>
    <path d="M${f1(x - 70)} ${f1(y + 6)} Q${f1(x - 62)} ${f1(y - 30)} ${f1(x - 26)} ${f1(y - 30)} Q${f1(x)} ${f1(y - 52)} ${f1(x + 30)} ${f1(y - 30)} Q${f1(x + 66)} ${f1(y - 26)} ${f1(x + 70)} ${f1(y + 6)} Q${f1(x)} ${f1(y + 26)} ${f1(x - 70)} ${f1(y + 6)} Z" fill="#FFFFFF" ${line}/>
    <path d="M${f1(x + 20)} ${f1(y - 26)} Q${f1(x + 56)} ${f1(y - 18)} ${f1(x + 62)} ${f1(y + 6)} Q${f1(x + 30)} ${f1(y + 16)} ${f1(x + 10)} ${f1(y + 12)} Z" fill="#E1E3F4"/>${balls}
    <path d="M${f1(x - 44)} ${f1(y - 6)} V${f1(y - 66)}" stroke="${WOOD_D}" stroke-width="4"/><rect x="${f1(x - 88)}" y="${f1(y - 92)}" width="86" height="28" rx="9" fill="#FBF7EF" ${line}/>${text(x - 45, y - 73, 'Snowballs', 12, '#4F86C6')}`;
})());
const sledArt = () => {
  const L = 1.6, D = 0.7;
  return item(L, D, 70,
    shadow(L / 2, D / 2, 90, 30, 0.12),
    `<path d="M${P(at(0.1, 0.08, 4))} L${P(at(L - 0.2, 0.08, 4))} Q${P(at(L + 0.02, 0.08, 6))} ${P(at(L - 0.02, 0.08, 34))}" fill="none" stroke="#3E3252" stroke-opacity=".6" stroke-width="6" stroke-linecap="round"/><path d="M${P(at(0.1, 0.08, 4))} L${P(at(L - 0.2, 0.08, 4))} Q${P(at(L + 0.02, 0.08, 6))} ${P(at(L - 0.02, 0.08, 34))}" fill="none" stroke="#B9C3D8" stroke-width="3" stroke-linecap="round"/>`,
    B({ u: 0.06, v: 0.06, w: L - 0.2, d: D - 0.12, z: 10, h: 12, ...shades(WOOD), leftDecor: `${[0.3, 0.7, 1.1].map((u) => `<path d="M${u * 64} 0 V12" stroke="#3E3252" stroke-opacity=".25" stroke-width="1.2"/>`).join('')}` }),
    B({ u: 0.18, v: 0.1, w: 0.7, d: D - 0.2, z: 22, h: 12, ...shades(LILAC), topDecor: '<path d="M.1 .25 H.6" stroke="#fff" stroke-width=".04" opacity=".6"/>' }),
    B({ u: 0.2, v: 0.12, w: 0.5, d: D - 0.24, z: 34, h: 10, ...shades('#9EDDD4'), leftDecor: '<path d="M0 5 H32" stroke="#fff" stroke-width="2" opacity=".7"/>' }),
    B({ u: 0.22, v: 0.14, w: 0.42, d: D - 0.28, z: 44, h: 4, ...shades('#FFFFFF', 0.4) }),
    `<path d="M${P(at(0.1, D - 0.08, 4))} L${P(at(L - 0.2, D - 0.08, 4))} Q${P(at(L + 0.02, D - 0.08, 6))} ${P(at(L - 0.02, D - 0.08, 34))}" fill="none" stroke="#3E3252" stroke-opacity=".6" stroke-width="6" stroke-linecap="round"/><path d="M${P(at(0.1, D - 0.08, 4))} L${P(at(L - 0.2, D - 0.08, 4))} Q${P(at(L + 0.02, D - 0.08, 6))} ${P(at(L - 0.02, D - 0.08, 34))}" fill="none" stroke="#B9C3D8" stroke-width="3" stroke-linecap="round"/>`,
    `<path d="M${P(at(L - 0.04, 0.1, 34))} Q${P(at(L + 0.3, D / 2, 54))} ${P(at(L - 0.04, D - 0.1, 34))}" fill="none" stroke="#5A5180" stroke-width="2.2" stroke-linecap="round"/>`);
};
const benchArt = () => item(1.6, 0.6, 96,
  shadow(0.8, 0.3, 80, 30, 0.1),
  ...[0.1, 1.4].map((u) => B({ u, v: 0.1, w: 0.1, d: 0.42, h: 34, ...shades(WOOD_D) })),
  B({ u: 0, v: 0.05, w: 1.6, d: 0.55, z: 34, h: 8, ...shades(WOOD_L), topDecor: '<path d="M0 .2 H1.6 M0 .38 H1.6" stroke="#3E3252" stroke-opacity=".2" stroke-width=".02"/>' }),
  B({ u: 0, v: 0, w: 1.6, d: 0.1, z: 42, h: 44, ...shades(WOOD), leftDecor: `${[12, 28].map((y) => `<path d="M3 ${y} H${1.6 * 64 - 3}" stroke="#3E3252" stroke-opacity=".22" stroke-width="1.2"/>`).join('')}` }),
  B({ u: -0.02, v: -0.02, w: 1.64, d: 0.14, z: 86, h: 5, ...shades('#FFFFFF', 0.4) }));
const towelArt = () => item(0.5, 0.36, 40,
  B({ u: 0.02, v: 0.02, w: 0.46, d: 0.32, h: 8, ...shades('#9EDDD4') }),
  B({ u: 0.04, v: 0.03, w: 0.42, d: 0.3, z: 8, h: 8, ...shades('#C9B8F2') }),
  B({ u: 0.06, v: 0.04, w: 0.38, d: 0.28, z: 16, h: 7, ...shades('#FBF7EF'), leftDecor: '<path d="M0 3 H25" stroke="#7FCFC4" stroke-width="2"/>' }));
const poolHit = () => item(POOL_BOX.fw, POOL_BOX.fd, 0, `<polygon points="${POOL.map(([a, b]) => P(at(a - POOL_BOX.gx, b - POOL_BOX.gy))).join(' ')}" fill="#FFFFFF" fill-opacity="0.01" style="pointer-events:visiblePainted"/>`);

// ---------- background ----------
const STATION = { gx: 9.5, gy: 0.3 };
const CABLE = (() => { const a = proj(R, STATION.gx + 0.4, STATION.gy + 0.9, 150); return { x0: a[0], y0: a[1], x1: 1680, y1: -40 }; })();
const bg = (w) => {
  const clear = w.weather === 'clear';
  const B0 = proj(R, 0, 0), Rr = proj(R, R.cols, 0), F = proj(R, R.cols, R.rows), L = proj(R, 0, R.rows);
  const dn = ([x, y]) => [x, y + DEPTH];
  const edgePts = (a, b, n) => Array.from({ length: n }, (_, i) => [a[0] + ((b[0] - a[0]) * (i + 0.5)) / n, a[1] + ((b[1] - a[1]) * (i + 0.5)) / n]);
  const icicles = [...edgePts(dn(L), dn(F), 17), ...edgePts(dn(F), dn(Rr), 17)].map(([x, y], i) => { const l = 8 + ((i * 5) % 4) * 6; return `<path d="M${f1(x - 5)} ${f1(y - 1)} L${f1(x)} ${f1(y + l)} L${f1(x + 5)} ${f1(y - 1)} Z" fill="#DDF3F8" ${thin}/>`; }).join('');
  const lips = [...edgePts(L, F, 10), ...edgePts(F, Rr, 10)].map(([x, y], i) => `<ellipse cx="${f1(x)}" cy="${f1(y + 3)}" rx="${26 + (i % 3) * 8}" ry="${7 + (i % 2) * 3}" fill="#FFFFFF"/>`).join('');
  const { x0, y0, x1, y1 } = CABLE;
  const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
  const off = [10, 8];
  const chair = (i, down) => {
    const col = [LILAC, TEAL, SUN, SKY][i % 4];
    const sx = down ? x0 + off[0] : x0, sy = down ? y0 + off[1] : y0;
    const rider = !down && i % 2 === 0 ? `<path d="M-7 26 Q-7 12 0 10 Q7 12 7 26 Z" fill="${[TEAL, LILAC][i % 2 ? 1 : 0]}"/><circle cx="0" cy="6" r="5.5" fill="#F3D2B8"/><path d="M-6 4 Q0 -4 6 4 Z" fill="${SUN}"/>` : '';
    return `<g class="wx-chair${down ? ' down' : ''}" style="--lx:${f1(ux * (len + 60))}px;--ly:${f1(uy * (len + 60))}px;animation-duration:22s;animation-delay:-${(i * 22) / 5}s"><g transform="translate(${f1(sx)} ${f1(sy)})">
      <path d="M0 0 V20" stroke="#5A5180" stroke-width="2"/>${rider}<path d="M-14 22 H14 V30 H-14 Z" fill="${col}" ${thin}/><path d="M-14 30 V36 H14" fill="none" stroke="#5A5180" stroke-width="2"/></g></g>`;
  };
  const steam = (gx, gy, i) => { const [x, y] = proj(R, gx, gy); return `<path class="wx-steam" style="animation-delay:-${(i * 0.83) % 5}s" d="M${f1(x)} ${f1(y)} q-16 -22 0 -44 q16 -22 0 -46" fill="none" stroke="#FFFFFF" stroke-width="${10 + (i % 3) * 4}" stroke-linecap="round" opacity=".55"/>`; };
  const planks = (a, b, c, d) => `${floorPoly(R, [a, b, c, d], `fill="${WOOD_L}" ${line}`)}${Array.from({ length: 9 }, (_, i) => { const t = (i + 1) / 10; const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], q = [d[0] + (c[0] - d[0]) * t, d[1] + (c[1] - d[1]) * t]; return `<path d="M${P(proj(R, p[0], p[1]))} L${P(proj(R, q[0], q[1]))}" stroke="#B98A60" stroke-width="1.6"/>`; }).join('')}`;
  const stones = (pts) => pts.map(([a, b], i) => { const [x, y] = proj(R, a, b); return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${18 + (i % 2) * 4}" ry="${8 + (i % 2) * 2}" fill="${STONE}" ${thin}/><ellipse cx="${f1(x - 3)}" cy="${f1(y - 2)}" rx="${10 + (i % 2) * 3}" ry="4" fill="#CFCEE0"/>`; }).join('');
  const rimRocks = RIM.map(([a, b], i) => { const [x, y] = proj(R, a, b); const front = b > PC.gy + 0.4 || a > PC.gx + 1.6; return { x, y, r: (front ? 20 : 16) + ((i * 7) % 3) * 4, i }; });
  return svg(1600, 900, `
  <defs>
    <linearGradient id="sp-water" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B4EEE6"/><stop offset=".55" stop-color="#7FD3CF"/><stop offset="1" stop-color="#55B5BA"/></linearGradient>
    <radialGradient id="sp-glow"><stop offset="0" stop-color="#FFF4C2" stop-opacity=".75"/><stop offset="1" stop-color="#FFF4C2" stop-opacity="0"/></radialGradient>
    <radialGradient id="sp-warm"><stop offset="0" stop-color="#FFF1BE"/><stop offset="1" stop-color="#F3C77A"/></radialGradient>
    <radialGradient id="sp-ball" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F1F2FB"/><stop offset="1" stop-color="#D5D8EF"/></radialGradient>
    <linearGradient id="sp-hinoki" x1="0" x2="1"><stop offset="0" stop-color="#C9A57C"/><stop offset=".35" stop-color="#F0DDBF"/><stop offset="1" stop-color="#BF9A70"/></linearGradient>
    <linearGradient id="sp-capy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C79A70"/><stop offset="1" stop-color="#A27A56"/></linearGradient>
    <radialGradient id="sp-yuzu" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#FFF1A8"/><stop offset="1" stop-color="#E8C34E"/></radialGradient>
    <radialGradient id="sp-fur" cx=".45" cy=".35" r=".7"><stop offset="0" stop-color="#E4DCD0"/><stop offset="1" stop-color="#B5AA9A"/></radialGradient>
    <radialGradient id="sp-duck" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFF4B8"/><stop offset="1" stop-color="#EBCB5A"/></radialGradient>
    <linearGradient id="sp-fox" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7A06A"/><stop offset="1" stop-color="#CC8450"/></linearGradient>
    <linearGradient id="sp-fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="${clear ? '#E4EEFB' : '#E1E4EF'}"/></linearGradient>
    <pattern id="sp-snow" width="96" height="48" patternUnits="userSpaceOnUse">
      <ellipse cx="18" cy="12" rx="7" ry="3" fill="#E6E8F6"/><ellipse cx="66" cy="34" rx="9" ry="3.5" fill="#E9EBF7"/><circle cx="44" cy="20" r="1.6" fill="#D9DDF1"/><circle cx="84" cy="8" r="1.2" fill="#D9DDF1"/>
      <path d="M30 40 l2 -4 l2 4 l-2 4 z" fill="#FFFFFF"/></pattern>
    <clipPath id="sp-clip"><polygon points="${gpts(POOL)}"/></clipPath>
  </defs>
  ${winterSky(w, 900, 'sp-sky')}
  ${mountains(470, clear ? '#D3DCF2' : '#CBCFE0', 40)}
  <path d="M-20 540 Q260 470 520 520 T980 490 T1400 510 T1620 470 V900 H-20 Z" fill="${clear ? '#EAF1FB' : '#E3E6F0'}"/>
  ${(() => { const tx = 1500, ty = y0 + (tx - x0) * (uy / ux); return `<path d="M${tx - 14} 440 L${tx - 3} ${f1(ty + 12)} M${tx + 14} 440 L${tx + 3} ${f1(ty + 12)} M${tx - 9} 380 H${tx + 9} M${tx - 6} ${f1(ty + 60)} H${tx + 6}" stroke="#9AA3BC" stroke-width="4" stroke-linecap="round"/><path d="M${tx - 22} ${f1(ty + 12)} H${tx + 30}" stroke="#7F89A6" stroke-width="5" stroke-linecap="round"/>`; })()}
  <path d="M-20 640 Q300 580 620 620 T1220 600 T1620 620 V900 H-20 Z" fill="#F3F6FC"/>
  <rect y="560" width="1600" height="340" fill="url(#sp-fog)"/>
  <path d="M${f1(x0)} ${f1(y0)} L${f1(x1)} ${f1(y1)} M${f1(x0 + off[0])} ${f1(y0 + off[1])} L${f1(x1 + off[0])} ${f1(y1 + off[1])}" stroke="#5A5180" stroke-width="2.2"/>
  ${Array.from({ length: 5 }, (_, i) => chair(i, false) + chair(i, true)).join('')}
  ${groundShell(R, { top: SNOW, pattern: 'sp-snow', sideL: '#E4E8F6', sideR: '#D0D7ED', layer: '#A79BD0', depth: DEPTH, edge: '#FFFFFF' })}
  <polyline points="${[dn(L), dn(F), dn(Rr)].map(P).join(' ')}" fill="none" stroke="#8F84BC" stroke-width="2" opacity=".5"/>
  ${icicles}${lips}
  <polygon points="${[B0, Rr, proj(R, R.cols, 0.5), proj(R, 0.5, 0.5), proj(R, 0.5, R.rows), L].map(P).join(' ')}" fill="#B7BCE0" opacity=".16"/>
  <!-- paths: boardwalk from the sauna, stepping stones from the kiosk and the lift -->
  ${planks([1.2, 4.75], [4.9, 5.15], [4.9, 5.85], [1.2, 5.45])}
  ${stones([[4.5, 2.0], [4.9, 2.6], [5.3, 3.1], [9.0, 2.6], [8.7, 3.1], [8.4, 3.5], [9.8, 8.2], [9.0, 8.4]])}
  <!-- the hot spring: sunken pool with a stone rim and steam -->
  ${floorPoly(R, RIM, `fill="#E2E4F2" ${line}`)}
  <polygon points="${gpts(POOL)}" fill="#5E9AA6" ${line}/>
  <g clip-path="url(#sp-clip)">
    <polygon points="${gpts(POOL, -12)}" fill="url(#sp-water)"/>
    <polygon points="${gpts(blob(0.72), -12)}" fill="#FFFFFF" opacity=".12"/>
    ${[[6.2, 4.6, 0.8], [8.0, 6.4, 1.0], [6.6, 6.9, 0.6], [8.4, 4.9, 0.5]].map(([a, b, r]) => { const [x, y] = proj(R, a, b, -12); return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r * 64)}" ry="${f1(r * 22)}" fill="none" stroke="#FFFFFF" stroke-width="2.4" opacity=".55"/>`; }).join('')}
    ${[[5.6, 5.4], [7.3, 4.4], [8.9, 5.9], [6.9, 6.1], [7.9, 7.0]].map(([a, b], i) => { const [x, y] = proj(R, a, b, -12); return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${3 + (i % 2) * 2}" fill="#FFFFFF" opacity=".7"/>`; }).join('')}
  </g>
  ${rimRocks.map(({ x, y, r }) => rock(x, y, r)).join('')}
  ${[[5.4, 5.2], [6.4, 4.3], [7.6, 4.6], [8.6, 5.4], [6.2, 6.3], [7.5, 6.6], [8.4, 6.8], [5.8, 7.0], [7.0, 5.6]].map(([a, b], i) => steam(a, b, i)).join('')}
  <!-- back edge decor -->
  ${inBg(0.15, 0.6, pineArt(0.5))}${inBg(0.2, 1.4, pineArt(0.6))}${inBg(6.3, 0.1, pineArt(0.55))}${inBg(7.4, 0.15, pineArt(0.45))}
  ${inBg(11.2, 4.6, moundArt(0.7))}${inBg(3.0, 9.2, moundArt(0.6))}${inBg(2.6, 3.4, moundArt(0.5))}
  `);
};

const I = isoDef;

export const SPRINGS = {
  id: 'springs', posKey: 'springs-iso', title: 'Hot Springs ♨️', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, outdoor: true,
  light: 'outdoor', iso: R, avatar: [3.3, 6.7],
  frame: (w) => (w === 'snow' ? '#C9CEDF' : '#BCDDF5'),
  bg,
  stars: [{ id: 'springs-sled', gx: 10.1, gy: 8.95 }],
  characters: [
    { id: 'mia', look: { ...NPC_WINTER.mia, topColor: '#C9B8F2', neckColor: '#9EDDD4' }, gx: 3.2, gy: 2.4, say: ['Hot cocoa and a hot spring — perfect! ☕', 'Drag a friend into the warm water ♨️', 'The capybara loves the hot spring 🍊'] },
    { id: 'nora', look: NPC_WINTER.nora, gx: 9.4, gy: 3.0, say: ['Look, the ski lift! 🚡', 'Want to go sledding? 🛷', 'Snowball fight? ❄️ Tap the snow pile!'] },
  ],
  init: (api) => {
    const pool = api.get('pool'); if (pool) pool.el.style.pointerEvents = 'none'; // only the water itself is tappable
    for (const c of api.characters()) if (inPool(c)) c.el.classList.add('wx-soak');
  },
  onCharacterDrop: (api, who) => {
    if (!inPool(who)) { who.el.classList.remove('wx-soak'); return; }
    who.el.classList.add('wx-soak');
    api.sfx.pour();
    api.effect(who.x + who.w / 2, who.y + who.h * 0.64, 'wx-ripple', rippleSvg, 1400);
    api.react(who, 'Ahhh, so warm! ♨️', ['♨️', '💧', '✨']);
    if (!api.starFound('springs-soak')) api.addStar('springs-soak', 0, 0, { spawned: true, gx: PC.gx + 0.4, gy: PC.gy - 1.2, gz: 120 });
  },
  onCharacterTap: (api, who) => {
    if (!who.el.classList.contains('wx-soak')) return false;
    who.anim.happy(); api.sfx.pop();
    api.effect(who.x + who.w / 2, who.y + who.h * 0.64, 'wx-ripple', rippleSvg, 1400);
    api.bubble(who.x + who.w / 2, who.y - 6, pick(['So relaxing… ♨️', 'Bubble bubble 🫧', 'I could stay here all day!', 'Warm toes! 🦶']));
    return true;
  },
  items: [
    I('pool', POOL_BOX.gx, POOL_BOX.gy, POOL_BOX.fw, POOL_BOX.fd, poolHit, { floor: true, drag: false,
      onTap: (it, api) => {
        api.sfx.pour();
        const a = Math.random() * Math.PI * 2, k = Math.random() * 0.6;
        const [x, y] = proj(R, PC.gx + Math.cos(a) * 2.2 * k, PC.gy + Math.sin(a) * 1.7 * k, -10);
        api.effect(x, y, 'wx-ripple', rippleSvg, 1400);
        api.bubble(proj(R, PC.gx, PC.gy)[0], proj(R, PC.gx, PC.gy)[1] - 150, 'So warm! Drop a friend into the water ♨️');
      } }),
    I('sauna', 0.3, 2.4, 2.6, 2.2, saunaArt, { drag: false, zBias: -40, data: { open: false },
      onTap: (it, api) => {
        if (it.data.open) return;
        it.data.open = true; api.setArt(it); api.sfx.pour();
        const [dx, dy] = at(1.35, 2.2, 60);
        for (let i = 0; i < 4; i++) api.later(() => api.effect(it.x + it.ax + dx + (i % 2 ? 22 : -14), it.y + it.ay + dy - i * 26, 'wx-puff', puffSvg(), 1300), i * 160);
        api.bubble(it.x + it.ax + dx, it.y + 40, pick(['Phew! So steamy in there 🧖', 'Toasty warm sauna! ♨️', 'A puff of steam! ☁️']));
        api.later(() => { it.data.open = false; api.setArt(it); }, 2200);
      } }),
    I('kiosk', 3.7, 0.3, 1.8, 1.2, kioskArt, { drag: false, zBias: -40, surface: 80,
      onTap: (it, api) => {
        const n = api.count('cocoa');
        if (n >= 3) { api.bubble(it.x + it.w / 2, it.y + 30, 'Drink up first! ☕'); return; }
        api.sfx.pour(); food(api, 'cocoa', 0, 0, { gx: it.gx + 0.2 + n * 0.42, gy: it.gy + 0.78, gz: 80 });
        api.bubble(it.x + it.w / 2, it.y + 30, 'One hot cocoa! Give it to a friend ☕');
      } }),
    I('rack', 0.35, 5.9, 0.5, 1.8, rackArt, { drag: false,
      onTap: (it, api) => {
        const n = api.count('scarf');
        if (n >= 2) { api.bubble(it.x + it.w / 2, it.y + 10, 'Try on those towels first! 🧣'); return; }
        api.add({ ...wearable('scarf', 0, 0, api.uid('scarf'), { gx: it.gx + 0.8, gy: it.gy + 0.2 + n * 0.8 }), wearText: 'Fluffy and warm! 🧣' }, { spawned: true });
        api.bubble(it.x + it.w / 2, it.y + 10, 'A fluffy towel scarf! Put it on someone 🧣');
      } }),
    wearable('scarf', 0, 0, 'sp-scarf', { gx: 1.9, gy: 7.3 }),
    wearable('beanie', 0, 0, 'sp-beanie', { gx: 6.4, gy: 2.4 }),
    I('snowpile', 0.6, 8.6, 1.4, 1.0, pileArt, { drag: false,
      onTap: (it, api) => {
        const n = api.count('snowball');
        if (n >= 4) { api.bubble(it.x + it.w / 2, it.y + 10, 'Throw those first! ❄️'); return; }
        api.add({
          id: api.uid('snowball'), w: 46, h: 46, gx: it.gx + 1.5 + (n % 2) * 0.4, gy: it.gy - 0.1 + (n >> 1) * 0.42, gz: 0, fw: 0.3, fd: 0.3, ax: 23, ay: 40, cls: 'food', small: true,
          onGive: (s, a, who) => { a.remove(s); a.sfx.boing(); a.sparkle(who.x + who.w / 2, who.y + 40, ['❄️', '💨', '❄️']); a.react(who, pick(['Splat! 😆', 'Hey! Snowball fight! ❄️', 'Brrr! 😂']), ['❄️', '✨']); },
          art: () => svg(46, 46, `<ellipse cx="23" cy="40" rx="15" ry="5" fill="#3E3252" opacity=".14"/><circle cx="23" cy="24" r="15" fill="url(#sp-ball)" ${line}/><path d="M14 20 Q17 13 24 11" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`),
        }, { spawned: true });
        api.bubble(it.x + it.w / 2, it.y + 10, 'Drag the snowball onto a friend!');
      } }),
    I('fox', 3.0, 8.7, 0.6, 0.5, foxArt, { cls: 'squish',
      onTap: (it, api) => { bump(it, 'hop'); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y - 6, pick(['Yip yip! 🦊', '*sniffs the snow*', 'Is that cocoa I smell?'])); } }),
    I('monkey', 5.3, 4.5, 0.6, 0.6, monkeyArt, { drag: false,
      onTap: (it, api) => { bump(it, 'hop'); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y - 6, pick(['Ook! The water is lovely! 🐒', '*splashes happily*', 'Mmm… warm paws'])); } }),
    I('capybara', 7.6, 4.7, 0.9, 0.6, capyArt, { drag: false, cls: 'wx-float',
      onTap: (it, api) => { bump(it, 'boing'); api.sfx.pop(); api.bubble(it.x + it.w / 2, it.y - 10, pick(['Ahh… so relaxing 🍊', '*blub blub*', 'Capybara spa day ♨️', 'Mmm… a little yuzu on my head 🍊'])); } }),
    I('duck', 6.3, 6.6, 0.4, 0.4, duckArt, { small: true, cls: 'wx-float',
      onTap: (it, api) => { bump(it, 'boing'); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y - 6, 'Squeak! 🦆'); } }),
    I('bucket', 8.9, 7.7, 0.4, 0.4, bucketArt, { small: true,
      onTap: (it, api) => { bump(it, 'boing'); api.sfx.pour(); api.sparkle(it.x + it.w / 2, it.y + 10, ['💧', '💦', '✨']); api.bubble(it.x + it.w / 2, it.y - 10, 'Splash! 💦'); } }),
    I('lantern', 10.2, 4.4, 0.6, 0.6, stoneLanternArt, { drag: false, data: { on: true },
      onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); if (it.data.on) api.sparkle(it.x + it.w / 2, it.y + it.h * 0.4, ['✨', '🏮']); } }),
    I('skirack', 8.1, 0.35, 0.4, 1.4, skiRackArt, { drag: false,
      onTap: (it, api) => { bump(it, 'shake'); api.sfx.drop(); api.bubble(it.x + it.w / 2, it.y, pick(['Skis and poles, ready to go! ⛷️', 'Clack clack! 🎿', 'Ride the lift up the mountain! 🚡'])); } }),
    I('sled', 9.6, 8.75, 1.6, 0.7, sledArt, { data: { busy: false },
      onTap: (it, api) => {
        if (it.data.busy) return;
        it.data.busy = true; api.sfx.pick(); api.bubble(it.x + it.w / 2, it.y - 10, 'Wheeeee! 🛷');
        const home = { gx: it.gx, gy: it.gy }, away = { gx: Math.max(0, it.gx - 2.6), gy: it.gy };
        const go = (from, to, ms, done) => {
          const n = Math.round(ms / 33);
          for (let i = 1; i <= n; i++) api.later(() => {
            if (!it.lifted && api.items.has(it.id)) { const k = i / n, e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2; it.gx = from.gx + (to.gx - from.gx) * e; it.gy = from.gy + (to.gy - from.gy) * e; api.place(it); }
            if (i === n) done();
          }, i * 33);
        };
        go(home, away, 900, () => api.later(() => go(away, home, 1100, () => { it.data.busy = false; }), 500));
      } }),
    I('station', STATION.gx, STATION.gy, 2.2, 1.8, stationArt, { drag: false, zBias: -40,
      onTap: (it, api) => { api.sfx.click(); api.sparkle(it.x + it.w * 0.3, it.y + 40, ['🚡', '✨', '❄️']); api.bubble(it.x + it.w / 2, it.y + it.h * 0.7, 'All aboard the ski lift! 🚡'); } }),
    I('bench', 5.2, 8.7, 1.6, 0.6, benchArt, { surface: 42 }),
    I('towel', 5.35, 8.85, 0.5, 0.36, towelArt, { small: true, gz: 42 }),
    I('lamp', 7.9, 2.2, 0.5, 0.5, lampArt, { drag: false }),
    I('pine1', 11.2, 5.4, 0.56, 0.56, () => pineArt(0.7), { drag: false }),
    I('pine2', 0.2, 9.2, 0.56, 0.56, () => pineArt(0.7), { drag: false }),
    I('pine3', 11.3, 0.2, 0.56, 0.56, () => pineArt(0.7), { drag: false }),
  ],
};
