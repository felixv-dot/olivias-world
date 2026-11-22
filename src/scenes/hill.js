// Snow Hill — isometric diorama: a floating snowy slab with a sled ramp. Ride the sled down the slope,
// build a snowman (stages saved), throw snowballs at friends, shake the big pine for a star, an igloo, a bunny.
import { room, groundShell, isoItem, at, shades, proj, isoDef } from '../iso.js';
import { svg, text, winterSky, mountains, wearable, NPC_WINTER } from './common.js';
import { CLIMATES } from '../ui.js';

const R = room({ cols: 12, rows: 9, ox: 704, oy: 150, wallH: 0 });
R.charScale = 0.55;
const DEPTH = 44;

const WOOD = '#C99A6C', WOOD_L = '#E2C29C', WOOD_D = '#A97B52', LILAC = '#B79CF0', TEAL = '#7FCFC4', SUN = '#F5DE7A', CORAL = '#E58F6A', SNOW = '#F7F9FE', LIGHT = '#FFF2B0';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4" stroke-linejoin="round"';
const thin = 'stroke="#3E3252" stroke-opacity=".45" stroke-width="1.1" stroke-linejoin="round"';
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const f1 = (n) => n.toFixed(1);
const P = (p) => p.map(f1).join(',');

// ---------- helpers ----------
const raw = (p) => { const s = isoItem(1, 1, 0, [p]).svg; return s.slice(s.indexOf('>', s.indexOf('<g ')) + 1, s.lastIndexOf('</g>')); };
const B = raw;
const item = (fw, fd, H, ...layers) => isoItem(fw, fd, H, [{ svg: layers.join(''), w: fw, d: fd }]);
const inBg = (gx, gy, it, gz = 0) => { const [sx, sy] = proj(R, gx, gy, gz); return it.svg.replace('width="100%" height="100%"', `x="${f1(sx - it.ax)}" y="${f1(sy - it.ay)}" width="${f1(it.w)}" height="${f1(it.h)}"`); };
const shadow = (u, v, rx, ry, op = 0.12) => { const [x, y] = at(u, v); return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="#3E3252" opacity="${op}"/>`; };
const gline = (pts, gz = 0) => 'M' + pts.map(([a, b]) => proj(R, a, b, gz).map(f1).join(' ')).join(' L');

// ---------- the sled ramp ----------
const RAMP = { gx: 0.5, gy: 0.25, len: 6, d: 2.2, H: 140, flat: 0.9 };
const rampH = (u) => (u <= RAMP.flat ? RAMP.H : u >= RAMP.len ? 0 : (RAMP.H * (1 + Math.cos((Math.PI * (u - RAMP.flat)) / (RAMP.len - RAMP.flat)))) / 2);
const rampSlope = (u) => (rampH(u - 0.05) - rampH(u + 0.05)) / 0.1; // px drop per tile
const SLED_GY = RAMP.gy + RAMP.d / 2 - 0.28;
const SLED_TOP = RAMP.gx + 0.05, SLED_END = 8.4;

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
  (() => { const [x, y] = at(0.25, 0.25, 166); return `<circle cx="${f1(x)}" cy="${f1(y)}" r="62" fill="url(#hl-glow)"/>`; })());
const moundArt = (s = 1) => item(1 * s, 0.8 * s, 34 * s, (() => {
  const [x, y] = at(0.5 * s, 0.4 * s);
  return `<path d="M${f1(x - 56 * s)} ${f1(y + 6)} Q${f1(x - 50 * s)} ${f1(y - 22 * s)} ${f1(x - 18 * s)} ${f1(y - 24 * s)} Q${f1(x + 4)} ${f1(y - 38 * s)} ${f1(x + 26 * s)} ${f1(y - 20 * s)} Q${f1(x + 54 * s)} ${f1(y - 16 * s)} ${f1(x + 56 * s)} ${f1(y + 6)} Q${f1(x)} ${f1(y + 22 * s)} ${f1(x - 56 * s)} ${f1(y + 6)} Z" fill="#FFFFFF" ${line}/>
    <path d="M${f1(x + 10 * s)} ${f1(y - 18 * s)} Q${f1(x + 40 * s)} ${f1(y - 10 * s)} ${f1(x + 48 * s)} ${f1(y + 6)} Q${f1(x + 20 * s)} ${f1(y + 14 * s)} ${f1(x + 4)} ${f1(y + 10 * s)} Z" fill="#E1E3F4"/>`;
})());
const fenceArt = (len) => {
  const posts = Array.from({ length: Math.round(len) + 1 }, (_, i) => Math.min(len - 0.1, i));
  return item(len, 0.12, 60,
    ...posts.map((u) => B({ u, v: 0.01, w: 0.1, d: 0.1, h: 40, ...shades(WOOD_D) })),
    B({ u: 0, v: 0.03, w: len, d: 0.05, z: 12, h: 6, ...shades(WOOD) }),
    B({ u: 0, v: 0.03, w: len, d: 0.05, z: 28, h: 6, ...shades(WOOD) }),
    ...posts.map((u) => B({ u: u - 0.01, v: 0, w: 0.12, d: 0.12, z: 40, h: 5, ...shades('#FFFFFF', 0.4) })));
};

const rampArt = () => {
  const { len, d, H } = RAMP;
  const us = Array.from({ length: 41 }, (_, i) => (len * i) / 40);
  const top = [...us.map((u) => at(u, 0, rampH(u))), ...us.slice().reverse().map((u) => at(u, d, rampH(u)))];
  const side = [...us.map((u) => at(u, d, rampH(u))), at(len, d, 0), at(0, d, 0)];
  const strata = [0.3, 0.62].map((f) => `<path d="M${us.filter((u) => rampH(u) > H * f * 1.02).map((u) => P(at(u, d, rampH(u) * f))).join(' L')}" fill="none" stroke="#C9CCE8" stroke-width="2.5" stroke-linecap="round"/>`).join('');
  const track = (v) => `<path d="M${us.filter((u) => u > 0.3).map((u) => P(at(u, v, rampH(u)))).join(' L')}" fill="none" stroke="#D8DEF2" stroke-width="4" stroke-linecap="round"/>`;
  const flag = (u, c) => { const b = at(u, d - 0.06, rampH(u)), t = [b[0], b[1] - 46]; return `<path d="M${P(b)} L${P(t)}" stroke="#6E6496" stroke-width="2.6" stroke-linecap="round"/><path d="M${P(t)} l20 7 l-20 8 z" fill="${c}" ${thin}/>`; };
  const stairs = Array.from({ length: 7 }, (_, i) => { const u = 0.3 + i * 0.32; return B({ u: u, v: d - 0.02, w: 0.26, d: 0.18, z: rampH(u) - 10 - i * 0, h: 6, ...shades(WOOD) }); });
  return item(len, d, H + 70,
    `<polygon points="${[at(0, d, 0), at(len, d, 0), at(len + 0.4, d + 0.25, 0), at(0.2, d + 0.35, 0)].map(P).join(' ')}" fill="#3E3252" opacity=".07"/>`,
    `<polygon points="${side.map(P).join(' ')}" fill="#DCDFF2" ${line}/>`, strata,
    ...[[0.5, 0.18], [1.3, 0.4], [2.2, 0.15]].map(([u, f]) => { const [x, y] = at(u, d, rampH(u) * f); return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="11" ry="7" fill="#B9B3D8" ${thin}/>`; }),
    `<polygon points="${top.map(P).join(' ')}" fill="#FCFDFF" ${line}/>`,
    `<polygon points="${[at(0, 0, H), at(RAMP.flat, 0, H), at(RAMP.flat, d, H), at(0, d, H)].map(P).join(' ')}" fill="#F1F2FB"/>`,
    track(d / 2 - 0.12), track(d / 2 + 0.16),
    ...[[1.6, 0.5], [2.8, 1.7], [3.9, 0.4], [4.8, 1.9], [1.1, 1.8]].map(([u, v]) => { const [x, y] = at(u, v, rampH(u)); return `<path d="M${f1(x)} ${f1(y - 4)} l2 4 l-2 4 l-2 -4 z" fill="#CFE6F7"/>`; }),
    stairs.join(''),
    flag(1.9, LILAC), flag(3.1, TEAL), flag(4.3, SUN),
    // start gate on the platform
    B({ u: 0.08, v: 0.2, w: 0.08, d: 0.08, z: H, h: 46, ...shades(WOOD_D) }), B({ u: 0.08, v: d - 0.3, w: 0.08, d: 0.08, z: H, h: 46, ...shades(WOOD_D) }),
    B({ u: 0.06, v: 0.18, w: 0.12, d: d - 0.36, z: H + 40, h: 12, ...shades(CORAL), leftDecor: '', rightDecor: `${text((d - 0.36) * 32, 10, 'START', 10, '#FFFFFF')}` }),
    B({ u: 0.05, v: 0.17, w: 0.14, d: d - 0.34, z: H + 52, h: 4, ...shades('#FFFFFF', 0.4) }));
};

// The sled is drawn following the slope under it (tilt = px drop per tile along gx).
const sledArt = (it) => {
  const k = it?.data.tilt || 0;
  const A = (u, v, z) => at(u, v, z + (0.5 - u) * k);
  const run = (v) => `<path d="M${P(A(0.08, v, 3))} L${P(A(0.86, v, 3))} Q${P(A(1.02, v, 4))} ${P(A(0.98, v, 18))}" fill="none" stroke="#3E3252" stroke-opacity=".6" stroke-width="5" stroke-linecap="round"/><path d="M${P(A(0.08, v, 3))} L${P(A(0.86, v, 3))} Q${P(A(1.02, v, 4))} ${P(A(0.98, v, 18))}" fill="none" stroke="#B9C3D8" stroke-width="2.6" stroke-linecap="round"/>`;
  const quad = (u0, u1, v0, v1, z, fill) => `<polygon points="${[A(u0, v0, z), A(u1, v0, z), A(u1, v1, z), A(u0, v1, z)].map(P).join(' ')}" fill="${fill}" ${line}/>`;
  const front = (u0, u1, v, z0, z1, fill) => `<polygon points="${[A(u0, v, z0), A(u1, v, z0), A(u1, v, z1), A(u0, v, z1)].map(P).join(' ')}" fill="${fill}" ${line}/>`;
  const slats = [0.24, 0.42, 0.6].map((u) => `<path d="M${P(A(u, 0.06, 16))} L${P(A(u, 0.49, 16))}" stroke="#3E3252" stroke-opacity=".25" stroke-width="1.2"/>`).join('');
  return item(1, 0.55, 50, `<ellipse cx="${f1(at(0.5, 0.28)[0])}" cy="${f1(at(0.5, 0.28)[1] + 2)}" rx="44" ry="17" fill="#3E3252" opacity=".12"/>`,
    run(0.1), `<path d="M${P(A(0.25, 0.1, 3))} L${P(A(0.25, 0.1, 12))} M${P(A(0.7, 0.1, 3))} L${P(A(0.7, 0.1, 12))}" stroke="#8E6745" stroke-width="3"/>`,
    front(0.06, 0.86, 0.49, 10, 16, '#C9653F'), quad(0.06, 0.86, 0.06, 0.49, 16, CORAL), slats,
    quad(0.12, 0.42, 0.1, 0.45, 18, '#FBF7EF'),
    run(0.47), `<path d="M${P(A(0.25, 0.47, 3))} L${P(A(0.25, 0.47, 10))} M${P(A(0.7, 0.47, 3))} L${P(A(0.7, 0.47, 10))}" stroke="#8E6745" stroke-width="3"/>`,
    `<path d="M${P(A(0.92, 0.12, 18))} Q${P(A(1.12, 0.28, 34))} ${P(A(0.92, 0.45, 18))}" fill="none" stroke="#5A5180" stroke-width="2" stroke-linecap="round"/>`);
};

const snowmanArt = (it) => {
  const s = it?.data.stage || 0;
  const [x, y] = at(0.7, 0.7);
  const ball = (cy, r) => `<circle cx="${f1(x)}" cy="${f1(cy)}" r="${r}" fill="url(#hl-ball)" ${line}/><path d="M${f1(x - r * 0.6)} ${f1(cy - r * 0.3)} Q${f1(x - r * 0.4)} ${f1(cy - r * 0.7)} ${f1(x)} ${f1(cy - r * 0.78)}" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`;
  const coal = (cx, cy, r = 3.2) => `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${r}" fill="#3E3A4A"/>`;
  let b = `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="62" ry="24" fill="#E3E5F5"/><ellipse cx="${f1(x - 6)}" cy="${f1(y - 2)}" rx="54" ry="19" fill="#FFFFFF"/>`;
  if (s === 0) {
    b += `<circle cx="${f1(x + 14)}" cy="${f1(y - 12)}" r="13" fill="url(#hl-ball)" ${line}/><path d="M${f1(x - 40)} ${f1(y + 4)} q20 -10 40 0" stroke="#D8DEF2" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M${f1(x - 30)} ${f1(y - 4)} V${f1(y - 54)}" stroke="${WOOD_D}" stroke-width="4"/><rect x="${f1(x - 74)}" y="${f1(y - 86)}" width="88" height="34" rx="10" fill="#FBF7EF" ${line}/>${text(x - 30, y - 64, 'Tap to build ⛄', 11, '#7A64B0')}`;
  }
  if (s >= 1) b += ball(y - 38, 42);
  if (s >= 2) {
    b += `<path d="M${f1(x - 28)} ${f1(y - 100)} L${f1(x - 66)} ${f1(y - 128)} M${f1(x - 56)} ${f1(y - 121)} L${f1(x - 62)} ${f1(y - 138)} M${f1(x + 28)} ${f1(y - 100)} L${f1(x + 64)} ${f1(y - 124)} M${f1(x + 54)} ${f1(y - 118)} L${f1(x + 66)} ${f1(y - 132)}" stroke="#8B6450" stroke-width="4" stroke-linecap="round"/>`;
    b += ball(y - 98, 30) + coal(x, y - 104) + coal(x, y - 90) + coal(x, y - 50, 3.6) + coal(x, y - 34, 3.6);
  }
  if (s >= 3) b += ball(y - 142, 22) + coal(x - 7, y - 148, 2.8) + coal(x + 7, y - 148, 2.8) + `<path d="M${f1(x - 2)} ${f1(y - 142)} L${f1(x + 22)} ${f1(y - 138)} L${f1(x - 2)} ${f1(y - 135)} Z" fill="#F0A060" ${thin}/>`;
  if (s >= 4) {
    b += `<path d="M${f1(x - 26)} ${f1(y - 124)} Q${f1(x)} ${f1(y - 114)} ${f1(x + 26)} ${f1(y - 124)} L${f1(x + 26)} ${f1(y - 114)} Q${f1(x)} ${f1(y - 104)} ${f1(x - 26)} ${f1(y - 114)} Z" fill="${TEAL}" ${thin}/><path d="M${f1(x + 12)} ${f1(y - 112)} l6 26 l-12 2 z" fill="${TEAL}" ${thin}/>`;
    b += `<path d="M${f1(x - 22)} ${f1(y - 156)} C${f1(x - 24)} ${f1(y - 188)} ${f1(x + 24)} ${f1(y - 188)} ${f1(x + 22)} ${f1(y - 156)} Z" fill="${LILAC}" ${thin}/><path d="M${f1(x - 24)} ${f1(y - 158)} Q${f1(x)} ${f1(y - 150)} ${f1(x + 24)} ${f1(y - 158)} L${f1(x + 24)} ${f1(y - 152)} Q${f1(x)} ${f1(y - 144)} ${f1(x - 24)} ${f1(y - 152)} Z" fill="#9A80D8" ${thin}/><circle cx="${f1(x)}" cy="${f1(y - 186)}" r="7" fill="#FBF7EF" ${thin}/>`;
  }
  return item(1.4, 1.4, 200, b);
};

const pileArt = () => item(1.4, 1.0, 110, (() => {
  const [x, y] = at(0.7, 0.5);
  const balls = [[-26, -10], [6, -16], [32, -6], [-8, -32], [20, -34]].map(([dx, dy]) => `<circle cx="${f1(x + dx)}" cy="${f1(y + dy)}" r="13" fill="url(#hl-ball)" ${thin}/>`).join('');
  return `<ellipse cx="${f1(x)}" cy="${f1(y + 4)}" rx="76" ry="28" fill="#3E3252" opacity=".1"/>
    <path d="M${f1(x - 70)} ${f1(y + 6)} Q${f1(x - 62)} ${f1(y - 30)} ${f1(x - 26)} ${f1(y - 30)} Q${f1(x)} ${f1(y - 52)} ${f1(x + 30)} ${f1(y - 30)} Q${f1(x + 66)} ${f1(y - 26)} ${f1(x + 70)} ${f1(y + 6)} Q${f1(x)} ${f1(y + 26)} ${f1(x - 70)} ${f1(y + 6)} Z" fill="#FFFFFF" ${line}/>
    <path d="M${f1(x + 20)} ${f1(y - 26)} Q${f1(x + 56)} ${f1(y - 18)} ${f1(x + 62)} ${f1(y + 6)} Q${f1(x + 30)} ${f1(y + 16)} ${f1(x + 10)} ${f1(y + 12)} Z" fill="#E1E3F4"/>${balls}
    <path d="M${f1(x + 44)} ${f1(y - 6)} V${f1(y - 70)}" stroke="${WOOD_D}" stroke-width="4"/><rect x="${f1(x + 2)}" y="${f1(y - 96)}" width="86" height="28" rx="9" fill="#FBF7EF" ${line}/>${text(x + 45, y - 77, 'Snowballs', 12, '#4F86C6')}`;
})());

const iglooArt = () => {
  const [cx, cy] = at(1.2, 1.1);
  const rx = 96, ry = 48, H = 104;
  const rings = [26, 52, 78].map((z) => { const r = rx * Math.sqrt(1 - (z / H) ** 2); return { z, r }; });
  const ringPath = ({ z, r }) => `M${f1(cx - r)} ${f1(cy - z)} A${f1(r)} ${f1(r / 2)} 0 0 0 ${f1(cx + r)} ${f1(cy - z)}`;
  const joints = [0, ...rings.map((q) => q.z)].map((z0, i) => {
    const r0 = i === 0 ? rx : rings[i - 1].r, z1 = i < rings.length ? rings[i].z : H * 0.94;
    return Array.from({ length: 5 - i }, (_, k) => { const a = ((k + 0.5 + (i % 2) * 0.5) / (5 - i)) * Math.PI * 0.94 + 0.08; const x = cx + Math.cos(a) * r0 * 0.97, y = cy - z0 + Math.sin(a) * (r0 / 2) * 0.97; return `<path d="M${f1(x)} ${f1(y)} l0 ${f1(-(z1 - z0) * 0.9)}" stroke="#C9D2EC" stroke-width="2"/>`; }).join('');
  }).join('');
  const dome = `M${f1(cx - rx)} ${f1(cy)} C${f1(cx - rx)} ${f1(cy - H * 1.32)} ${f1(cx + rx)} ${f1(cy - H * 1.32)} ${f1(cx + rx)} ${f1(cy)} A${rx} ${ry} 0 0 1 ${f1(cx - rx)} ${f1(cy)} Z`;
  // entrance arch on the front-left of the dome (a face of constant gy → left-face skew)
  const [ex, ey] = at(0.72, 2.08);
  const ent = `<g transform="matrix(1,0.5,0,1,${f1(ex)},${f1(ey)})">
      <path d="M-4 0 V-34 A35 34 0 0 1 66 -34 V0 Z" fill="#FFFFFF" ${line}/><path d="M-4 0 V-34 A35 34 0 0 1 66 -34" fill="none" stroke="#E1E5F5" stroke-width="5" transform="translate(0 6)"/>
      <path d="M10 0 V-30 A21 22 0 0 1 52 -30 V0 Z" fill="#4A5078" ${thin}/><path d="M16 0 V-26 A15 16 0 0 1 32 -38" fill="none" stroke="#6A71A0" stroke-width="3"/>
      <path d="M-4 -20 H10 M52 -20 H66 M2 -44 L12 -38 M60 -44 L50 -38" stroke="#C9D2EC" stroke-width="2"/></g>`;
  return item(2.4, 2.2, 150,
    `<ellipse cx="${f1(cx)}" cy="${f1(cy + 6)}" rx="${rx + 14}" ry="${ry + 8}" fill="#3E3252" opacity=".1"/>`,
    `<path d="${dome}" fill="#F4F7FF" ${line}/>`,
    `<path d="M${f1(cx + rx * 0.2)} ${f1(cy - H * 0.98)} C${f1(cx + rx * 0.85)} ${f1(cy - H * 0.9)} ${f1(cx + rx)} ${f1(cy - H * 0.3)} ${f1(cx + rx)} ${f1(cy)} A${rx} ${ry} 0 0 1 ${f1(cx + rx * 0.3)} ${f1(cy + ry * 0.95)} C${f1(cx + rx * 0.7)} ${f1(cy - H * 0.3)} ${f1(cx + rx * 0.6)} ${f1(cy - H * 0.8)} ${f1(cx + rx * 0.2)} ${f1(cy - H * 0.98)} Z" fill="#DFE4F5"/>`,
    rings.map((q) => `<path d="${ringPath(q)}" fill="none" stroke="#C9D2EC" stroke-width="2.4"/>`).join(''), joints,
    `<path d="M${f1(cx - rx * 0.55)} ${f1(cy - H * 0.72)} Q${f1(cx - rx * 0.3)} ${f1(cy - H * 0.95)} ${f1(cx)} ${f1(cy - H * 0.98)}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`,
    `<path d="${dome}" fill="none" ${line}/>`, ent);
};

const bunnyArt = () => item(0.4, 0.4, 70, (() => {
  const [x, y] = at(0.2, 0.2);
  return `<ellipse cx="${f1(x)}" cy="${f1(y + 2)}" rx="24" ry="9" fill="#3E3252" opacity=".13"/>
    <ellipse cx="${f1(x - 8)}" cy="${f1(y - 52)}" rx="6" ry="15" fill="#FFFFFF" ${thin}/><ellipse cx="${f1(x + 6)}" cy="${f1(y - 54)}" rx="6" ry="15" fill="#FFFFFF" ${thin}/>
    <ellipse cx="${f1(x - 8)}" cy="${f1(y - 52)}" rx="2.4" ry="9" fill="#F0C2AE"/><ellipse cx="${f1(x + 6)}" cy="${f1(y - 54)}" rx="2.4" ry="9" fill="#F0C2AE"/>
    <ellipse cx="${f1(x + 4)}" cy="${f1(y - 13)}" rx="22" ry="15" fill="#FFFFFF" ${thin}/><circle cx="${f1(x + 24)}" cy="${f1(y - 14)}" r="6" fill="#FFFFFF" ${thin}/>
    <circle cx="${f1(x - 4)}" cy="${f1(y - 32)}" r="13" fill="#FFFFFF" ${thin}/><path d="M${f1(x + 8)} ${f1(y - 16)} q8 2 6 -10" fill="none" stroke="#E1E3F4" stroke-width="3"/>
    <circle cx="${f1(x - 9)}" cy="${f1(y - 34)}" r="2" fill="#3E3252"/><circle cx="${f1(x + 1)}" cy="${f1(y - 34)}" r="2" fill="#3E3252"/><path d="M${f1(x - 5.5)} ${f1(y - 29)} l3 0 l-1.5 2 z" fill="#E58F7E"/>`;
})());
const shovelArt = () => item(0.4, 1.0, 26, (() => {
  const a = at(0.2, 0.05, 2), b = at(0.2, 0.7, 2), c = at(0.2, 0.98, 2);
  return `<path d="M${P(a)} L${P(b)}" stroke="#3E3252" stroke-opacity=".5" stroke-width="7" stroke-linecap="round"/><path d="M${P(a)} L${P(b)}" stroke="${WOOD_L}" stroke-width="4.4" stroke-linecap="round"/>
    <path d="M${f1(a[0] - 6)} ${f1(a[1] + 3)} l12 -6" stroke="#5A5180" stroke-width="4" stroke-linecap="round"/>
    <polygon points="${[at(0.05, 0.68, 2), at(0.35, 0.68, 2), at(0.38, 1.0, 1), at(0.02, 1.0, 1)].map(P).join(' ')}" fill="${TEAL}" ${line}/><path d="M${P(at(0.1, 0.9, 2))} L${P(at(0.3, 0.9, 2))}" stroke="#fff" stroke-width="2" opacity=".6"/>
    <ellipse cx="${f1(c[0])}" cy="${f1(c[1] - 2)}" rx="9" ry="4" fill="#fff"/>`;
})());
const signArt = () => item(1.0, 0.3, 130,
  B({ u: 0.45, v: 0.12, w: 0.08, d: 0.08, h: 110, ...shades(WOOD_D) }),
  B({ u: 0.0, v: 0.08, w: 1.0, d: 0.06, z: 64, h: 40, ...shades(WOOD_L), leftDecor: `<rect x="3" y="4" width="58" height="32" rx="6" fill="${LILAC}" ${thin}/>${text(26, 26, 'SLED RUN', 10, '#FFFFFF')}<path d="M48 14 l8 6 l-8 6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>` }),
  B({ u: -0.02, v: 0.06, w: 1.04, d: 0.1, z: 104, h: 5, ...shades('#FFFFFF', 0.4) }));

const fortArt = () => {
  const joints = (len, off) => Array.from({ length: 6 }, (_, i) => { const x = off + i * 21; return x > 2 && x < len - 2 ? `<path d="M${x} 1 V14" stroke="#C9CEE8" stroke-width="1.6"/>` : ''; }).join('');
  const snowB = { top: '#FFFFFF', left: '#F1F3FB', right: '#DCDFF2' };
  return item(1.6, 0.36, 70, shadow(0.8, 0.2, 80, 20, 0.1),
    B({ u: 0, v: 0.02, w: 1.6, d: 0.32, h: 15, ...snowB, leftDecor: joints(1.6 * 64, 10), rightDecor: '' }),
    B({ u: 0.04, v: 0.04, w: 1.52, d: 0.28, z: 15, h: 15, ...snowB, leftDecor: joints(1.52 * 64, 20) }),
    ...[0.06, 0.62, 1.18].map((u) => B({ u, v: 0.05, w: 0.36, d: 0.26, z: 30, h: 15, ...snowB })),
    `<path d="M${P(at(0.3, 0.36, 18))} Q${P(at(0.8, 0.4, 22))} ${P(at(1.3, 0.36, 18))}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`);
};

// ---------- background ----------
const bg = (w) => {
  const clear = w.weather === 'clear';
  const B0 = proj(R, 0, 0), Rr = proj(R, R.cols, 0), F = proj(R, R.cols, R.rows), L = proj(R, 0, R.rows);
  const dn = ([x, y]) => [x, y + DEPTH];
  const edgePts = (a, b, n) => Array.from({ length: n }, (_, i) => [a[0] + ((b[0] - a[0]) * (i + 0.5)) / n, a[1] + ((b[1] - a[1]) * (i + 0.5)) / n]);
  const icicles = [...edgePts(dn(L), dn(F), 16), ...edgePts(dn(F), dn(Rr), 18)].map(([x, y], i) => { const l = 8 + ((i * 5) % 4) * 6; return `<path d="M${f1(x - 5)} ${f1(y - 1)} L${f1(x)} ${f1(y + l)} L${f1(x + 5)} ${f1(y - 1)} Z" fill="#DDF3F8" ${thin}/>`; }).join('');
  const lips = [...edgePts(L, F, 9), ...edgePts(F, Rr, 10)].map(([x, y], i) => `<ellipse cx="${f1(x)}" cy="${f1(y + 3)}" rx="${26 + (i % 3) * 8}" ry="${7 + (i % 2) * 3}" fill="#FFFFFF"/>`).join('');
  const hops = (pts) => pts.map(([a, b], i) => { const [x, y] = proj(R, a, b); return `<ellipse cx="${f1(x - 4)}" cy="${f1(y)}" rx="3" ry="2" fill="#C9CDEA"/><ellipse cx="${f1(x + 4)}" cy="${f1(y + 1)}" rx="3" ry="2" fill="#C9CDEA"/><ellipse cx="${f1(x + (i % 2) * 2)}" cy="${f1(y + 7)}" rx="4.5" ry="2.6" fill="#C9CDEA"/>`; }).join('');
  const boots = (pts) => pts.map(([a, b], i) => { const [x, y] = proj(R, a, b); return `<ellipse cx="${f1(x + (i % 2 ? 5 : -5))}" cy="${f1(y)}" rx="4.5" ry="2.4" fill="#C9CDEA" opacity=".85"/>`; }).join('');
  const angel = (gx, gy) => { const [x, y] = proj(R, gx, gy); return `<g transform="translate(${f1(x)} ${f1(y)}) scale(1 .55) rotate(-26)" fill="#E2E5F4">
    <path d="M-8 -8 Q-44 -30 -38 6 Q-24 12 -8 6 Z M8 -8 Q44 -30 38 6 Q24 12 8 6 Z M-7 10 L-22 34 Q0 40 22 34 L7 10 Z"/><ellipse cx="0" cy="0" rx="10" ry="16"/><circle cx="0" cy="-24" r="9"/></g>`; };
  return svg(1600, 900, `
  <defs>
    <radialGradient id="hl-ball" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F1F2FB"/><stop offset="1" stop-color="#D5D8EF"/></radialGradient>
    <radialGradient id="hl-glow"><stop offset="0" stop-color="#FFF4C2" stop-opacity=".75"/><stop offset="1" stop-color="#FFF4C2" stop-opacity="0"/></radialGradient>
    <linearGradient id="hl-fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="${clear ? '#E4EEFB' : '#E1E4EF'}"/></linearGradient>
    <pattern id="hl-snow" width="96" height="48" patternUnits="userSpaceOnUse">
      <ellipse cx="18" cy="12" rx="7" ry="3" fill="#E6E8F6"/><ellipse cx="66" cy="34" rx="9" ry="3.5" fill="#E9EBF7"/><circle cx="44" cy="20" r="1.6" fill="#D9DDF1"/><circle cx="84" cy="8" r="1.2" fill="#D9DDF1"/>
      <path d="M30 40 l2 -4 l2 4 l-2 4 z" fill="#FFFFFF"/></pattern>
  </defs>
  ${winterSky(w, 900, 'hl-sky')}
  ${mountains(480, clear ? '#D3DCF2' : '#CBCFE0', -60)}
  <path d="M-20 560 Q240 480 480 530 T900 500 T1340 530 T1620 490 V900 H-20 Z" fill="${clear ? '#EAF1FB' : '#E3E6F0'}"/>
  <path d="M-20 650 Q300 590 640 630 T1240 610 T1620 630 V900 H-20 Z" fill="#F3F6FC"/>
  <rect y="560" width="1600" height="340" fill="url(#hl-fog)"/>
  ${groundShell(R, { top: SNOW, pattern: 'hl-snow', sideL: '#E4E8F6', sideR: '#D0D7ED', layer: '#A79BD0', depth: DEPTH, edge: '#FFFFFF' })}
  <polyline points="${[dn(L), dn(F), dn(Rr)].map(P).join(' ')}" fill="none" stroke="#8F84BC" stroke-width="2" opacity=".5"/>
  ${icicles}${lips}
  <polygon points="${[B0, Rr, proj(R, R.cols, 0.5), proj(R, 0.5, 0.5), proj(R, 0.5, R.rows), L].map(P).join(' ')}" fill="#B7BCE0" opacity=".16"/>
  <!-- sled tracks on the run-out, footprints, bunny hops -->
  <path d="${gline([[6.3, 1.0], [7.4, 1.04], [8.6, 1.12], [9.4, 1.3]])}" fill="none" stroke="#DCE1F2" stroke-width="5" stroke-linecap="round"/>
  <path d="${gline([[6.3, 1.42], [7.4, 1.46], [8.6, 1.54], [9.4, 1.72]])}" fill="none" stroke="#DCE1F2" stroke-width="5" stroke-linecap="round"/>
  <path d="${gline([[6.3, 1.0], [7.4, 1.04], [8.6, 1.12], [9.4, 1.3]])} ${gline([[6.3, 1.42], [7.4, 1.46], [8.6, 1.54], [9.4, 1.72]])}" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" transform="translate(0 -1.5)"/>
  ${angel(5.4, 8.1)}${angel(7.0, 2.9)}
  ${hops([[3.0, 8.3], [3.2, 7.5], [3.5, 6.8], [3.8, 6.1], [4.1, 5.6]])}
  ${boots([[6.4, 8.4], [6.5, 7.9], [6.8, 7.3], [7.2, 6.8], [7.5, 6.4], [7.8, 6.1]])}
  <!-- back edge -->
  ${inBg(7.0, 0.05, fenceArt(3.0))}
  ${inBg(6.6, 0.0, pineArt(0.55))}${inBg(9.6, 0.05, pineArt(0.5))}
  ${inBg(0.1, 3.0, pineArt(0.6))}${inBg(0.15, 3.8, pineArt(0.5))}
  ${inBg(11.1, 4.0, moundArt(0.8))}${inBg(5.6, 8.1, moundArt(0.7))}${inBg(2.4, 3.2, moundArt(0.6))}
  `);
};

// ---------- motion ----------
function steps(api, it, ms, fn, done) {
  const n = Math.max(2, Math.round(ms / 33));
  let dead = false;
  for (let i = 1; i <= n; i++) {
    api.later(() => {
      if (!dead && (it.lifted || !api.items.has(it.id))) dead = true;
      if (!dead) { fn(i / n); api.place(it); }
      if (i === n) done?.(dead);
    }, i * 33);
  }
}
function setSled(api, it, gx, gz) {
  const ramp = api.get('ramp');
  const u = gx + 0.5 - RAMP.gx;
  it.gx = gx; it.gy = SLED_GY; it.gz = gz;
  it.on = gz > 0.5 && ramp ? ramp : null;
  const tilt = gz > 0.5 && u > RAMP.flat && u < RAMP.len ? Math.round(rampSlope(u) / 4) * 4 : 0;
  if (tilt !== it.data.tilt) { it.data.tilt = tilt; api.setArt(it); }
}
function ride(api, it) {
  if (it.data.busy) return;
  it.data.busy = true;
  const slide = () => {
    api.sfx.pick(); api.bubble(it.x + it.w / 2, it.y - 10, 'Wheeeee! 🛷');
    const u0 = SLED_TOP + 0.5 - RAMP.gx, u1 = RAMP.len - 0.2;
    steps(api, it, 1500, (k) => { const u = u0 + (u1 - u0) * k * k; setSled(api, it, RAMP.gx + u - 0.5, rampH(u)); }, (stopped) => {
      if (stopped) { it.data.busy = false; return; }
      const g0 = it.gx;
      steps(api, it, 900, (k) => setSled(api, it, g0 + (SLED_END - g0) * (1 - (1 - k) ** 2), 0), () => { it.data.busy = false; it.data.tilt = 0; });
    });
  };
  if (Math.abs(it.gx - SLED_TOP) < 0.05 && it.gz > RAMP.H - 1) { slide(); return; }
  api.bubble(it.x + it.w / 2, it.y - 10, 'Up the hill! ⛰️');
  const from = { gx: it.gx, gy: it.gy, gz: it.gz || 0 };
  steps(api, it, 650, (k) => {
    const e = 1 - (1 - k) ** 2;
    setSled(api, it, from.gx + (SLED_TOP - from.gx) * e, from.gz + (RAMP.H - from.gz) * e + Math.sin(k * Math.PI) * 40);
    it.gy = from.gy + (SLED_GY - from.gy) * e;
  }, (stopped) => { if (stopped) it.data.busy = false; else api.later(slide, 250); });
}

const snowball = (api, gx, gy) => api.add({
  id: api.uid('snowball'), w: 46, h: 46, gx, gy, gz: 0, fw: 0.3, fd: 0.3, ax: 23, ay: 40, cls: 'food', small: true,
  onGive: (it, a, who) => { a.remove(it); a.sfx.boing(); a.sparkle(who.x + who.w / 2, who.y + 40, ['❄️', '💨', '❄️']); a.react(who, pick(['Splat! 😆', 'Hey! Snowball fight! ❄️', 'Brrr! 😂']), ['❄️', '✨']); },
  art: () => svg(46, 46, `<ellipse cx="23" cy="40" rx="15" ry="5" fill="#3E3252" opacity=".14"/><circle cx="23" cy="24" r="15" fill="url(#hl-ball)" ${line}/><path d="M14 20 Q17 13 24 11" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`),
}, { spawned: true });

const I = isoDef;

export const HILL = {
  id: 'hill', posKey: 'hill-iso', title: 'Snow Hill 🛷', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, outdoor: true,
  light: 'outdoor', iso: R, avatar: [5.4, 4.0],
  frame: (w) => (w === 'snow' ? '#C9CEDF' : '#BCDDF5'),
  bg,
  characters: [{ id: 'nora', look: NPC_WINTER.nora, gx: 10.4, gy: 5.2, say: ["Let's build a snowman! ⛄", 'Throw a snowball at me! ❄️', 'The sled is super fast! 🛷'] }],
  init: (api) => {
    const s = api.get('snowman'); s.data.stage = api.state.snowman || 0; api.setArt(s);
    const sled = api.get('sled'); if (sled.gz > 0.5) { sled.on = api.get('ramp'); api.place(sled); }
  },
  items: [
    I('ramp', RAMP.gx, RAMP.gy, RAMP.len, RAMP.d, rampArt, { drag: false, zBias: -122,
      onTap: (it, api) => api.bubble(it.x + it.w * 0.3, it.y + 30, pick(['Tap the sled to ride! 🛷', 'What a big snowy hill! ⛰️'])) }),
    I('sled', SLED_TOP, SLED_GY, 1, 0.55, sledArt, { gz: RAMP.H, data: { tilt: 0, busy: false }, onTap: (it, api) => ride(api, it) }),
    I('snowman', 7.9, 4.8, 1.4, 1.4, snowmanArt, { drag: false, data: { stage: 0 },
      onTap: (it, api) => {
        it.data.stage = (it.data.stage + 1) % 5; api.state.snowman = it.data.stage; api.save(); api.setArt(it);
        api.sparkle(it.x + it.w / 2, it.y + it.h * 0.55, ['❄️', '✨', '⛄']); api.sfx.pop();
        if (it.data.stage === 4) {
          api.bubble(it.x + it.w / 2, it.y, 'A perfect snowman! ⛄');
          if (!api.starFound('hill-snowman')) api.addStar('hill-snowman', 0, 0, { spawned: true, gx: it.gx + 1.5, gy: it.gy + 0.6 });
        } else if (it.data.stage === 0) api.bubble(it.x + it.w / 2, it.y + it.h * 0.5, 'Start again! Tap to roll snow.');
      } }),
    I('pile', 4.4, 6.6, 1.4, 1.0, pileArt, { drag: false,
      onTap: (it, api) => {
        const n = api.count('snowball');
        if (n >= 4) { api.bubble(it.x + it.w / 2, it.y + 10, 'Throw those first! ❄️'); return; }
        snowball(api, it.gx + 1.5 + (n % 2) * 0.42, it.gy + 0.05 + n * 0.24);
        api.bubble(it.x + it.w / 2, it.y + 10, 'Drag the snowball onto a friend!');
      } }),
    I('shovel', 3.7, 6.9, 0.4, 1.0, shovelArt, { small: true }),
    I('bigpine', 10.4, 0.35, 1.44, 1.44, () => pineArt(1.8), { drag: false, data: { shook: false },
      onTap: (it, api) => {
        it.el.classList.remove('shake'); void it.el.offsetWidth; it.el.classList.add('shake');
        api.sparkle(it.x + it.w / 2, it.y + it.h * 0.45, ['❄️', '❄️', '✨']);
        if (!it.data.shook) {
          it.data.shook = true;
          if (!api.starFound('hill-tree')) { api.addStar('hill-tree', 0, 0, { spawned: true, gx: it.gx + 0.2, gy: it.gy + 1.7 }); api.bubble(it.x + it.w / 2, it.y + 30, 'Something fell out! ✨'); }
        } else api.bubble(it.x + it.w / 2, it.y + 30, 'Poof! ❄️');
      } }),
    I('igloo', 0.4, 5.5, 2.4, 2.2, iglooArt, { drag: false, zBias: -30,
      onTap: (it, api) => { api.bubble(it.x + it.w / 2, it.y + 20, pick(['So cozy inside! ❄️', 'An igloo made of snow bricks!', 'Echo... echo... 🗣️'])); api.sparkle(it.x + it.w / 2, it.y + it.h * 0.5, ['❄️', '✨']); } }),
    I('bunny', 4.3, 5.0, 0.4, 0.4, bunnyArt, { cls: 'squish',
      onTap: (it, api) => { it.el.classList.remove('hop'); void it.el.offsetWidth; it.el.classList.add('hop'); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y - 6, '*hop hop* 🐰'); } }),
    I('fort', 2.6, 8.15, 1.6, 0.36, fortArt, { drag: false,
      onTap: (it, api) => { api.sparkle(it.x + it.w / 2, it.y + it.h * 0.4, ['❄️', '🛡️', '✨']); api.bubble(it.x + it.w / 2, it.y, pick(['A snow fort! Hide from snowballs! ❄️', 'Snow bricks, stacked up high!'])); } }),
    I('sign', 6.4, 2.75, 1.0, 0.3, signArt, { drag: false }),
    I('lamp1', 2.6, 4.6, 0.5, 0.5, lampArt, { drag: false }),
    I('lamp2', 9.6, 2.6, 0.5, 0.5, lampArt, { drag: false }),
    I('pine1', 11.1, 2.6, 0.56, 0.56, () => pineArt(0.7), { drag: false }),
    I('pine2', 0.25, 8.15, 0.64, 0.64, () => pineArt(0.8), { drag: false }),
    I('pine3', 11.3, 7.9, 0.48, 0.48, () => pineArt(0.6), { drag: false }),
    wearable('earmuffs', 0, 0, 'hill-earmuffs', { gx: 8.6, gy: 7.6 }),
  ],
};
