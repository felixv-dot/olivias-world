// Toy Workshop — isometric dollhouse version: tap the toy machine and a toy rolls out on the conveyor belt; drop a toy
// on the wrapping table to wrap it as a present; a little train shuttles along its track; build your own robot at the workbench.
import { room, roomShell, isoItem, at, shades, proj, isoDef, wallDef } from '../iso.js';
import { INK, svg, text, starPath, pine, NPC_WINTER } from './common.js';
import { darker, lighter } from '../avatar.js';
import { CLIMATES } from '../ui.js';

const R = room({ cols: 9, rows: 8, ox: 768, oy: 312, wallH: 280 });
R.charScale = 0.6;

const WOOD_D = '#8B6450', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', SKY = '#9CC8EE', SUN = '#F5DE7A';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4"';
const pp = (arr) => arr.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ');
const P = (u, v, z, fn, w = 0.1, d = 0.1) => ({ svg: fn(...at(u, v, z)), u, v, z, w, d });
const shadow = (cx, cy, rx, ry = 10, op = 0.14) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${INK}" opacity="${op}"/>`;
const bump = (it, cls) => { it.el.classList.remove(cls); void it.el.offsetWidth; it.el.classList.add(cls); };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const gear = (cx, cy, r, teeth, fill, cls = '') => {
  let d = '';
  for (let i = 0; i < teeth * 2; i++) {
    const a0 = (i / (teeth * 2)) * Math.PI * 2, a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2, rr = i % 2 ? r * 0.84 : r;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a0) * rr).toFixed(1)} ${(cy + Math.sin(a0) * rr).toFixed(1)} L${(cx + Math.cos(a1) * rr).toFixed(1)} ${(cy + Math.sin(a1) * rr).toFixed(1)} `;
  }
  return `<g class="wx-gear ${cls}"><path d="${d}Z" fill="${fill}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="none" stroke="${darker(fill, 0.25)}" stroke-width="1.6"/>
    ${[0, 1, 2].map((k) => { const a = (k / 3) * Math.PI * 2; return `<circle cx="${(cx + Math.cos(a) * r * 0.42).toFixed(1)}" cy="${(cy + Math.sin(a) * r * 0.42).toFixed(1)}" r="${(r * 0.12).toFixed(1)}" fill="${darker(fill, 0.3)}"/>`; }).join('')}
    <circle cx="${cx}" cy="${cy}" r="${r * 0.18}" fill="#FBF7EF" stroke="${INK}" stroke-width="1.2"/></g>`;
};
// Smoothly move an iso item to a new floor spot (used for the conveyor belt).
const slide = (api, it, gx, gy, ms = 900) => {
  void it.el.offsetWidth;
  it.el.style.transition = `left ${ms}ms cubic-bezier(.3,.7,.4,1), top ${ms}ms cubic-bezier(.3,.7,.4,1)`;
  it.gx = gx; it.gy = gy; api.place(it);
  api.later(() => { it.el.style.transition = ''; }, ms + 60);
};

// ---------- background: backdrop + workshop shell (board walls, plank floor) ----------
const boards = (c, d) => `<rect width="44" height="200" fill="${c}"/><path d="M0.5 0 V200" stroke="${d}" stroke-width="2.5"/><path d="M14 0 Q18 60 13 120 T16 200" stroke="${d}" stroke-opacity=".35" stroke-width="1.2" fill="none"/><circle cx="28" cy="90" r="3" fill="none" stroke="${d}" stroke-opacity=".5" stroke-width="1.2"/>`;
const bg = ({ weather }) => {
  const snow = weather !== 'clear';
  const [lx] = proj(R, 0, R.rows), [rx] = proj(R, R.cols, 0), [, fy] = proj(R, R.cols, R.rows);
  return svg(1600, 900, `
  <defs>
    <radialGradient id="ws-bd" cx="50%" cy="55%" r="70%"><stop offset="0" stop-color="#F2F5FB"/><stop offset="1" stop-color="#D2DAEC"/></radialGradient>
    <pattern id="ws-wl" width="44" height="200" patternUnits="userSpaceOnUse" patternTransform="matrix(1,-0.5,0,1,0,0)">${boards('#D8E2EF', '#B9C7DA')}</pattern>
    <pattern id="ws-wr" width="44" height="200" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,0,1,0,0)">${boards('#CCD8E8', '#AEBDD2')}</pattern>
    <linearGradient id="ws-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".6"/><stop offset="1" stop-color="#FFF6DA" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#ws-bd)"/>
  ${snow ? `<g fill="#fff" opacity=".9">${Array.from({ length: 64 }, (_, i) => `<circle cx="${(i * 89 + 57) % 1600}" cy="${(i * 67 + 11) % 900}" r="${2 + (i % 3)}"/>`).join('')}</g>` : '<circle cx="1440" cy="110" r="120" fill="#FFF6D2" opacity=".35"/><circle cx="1440" cy="110" r="54" fill="#FFF3C4" opacity=".9"/>'}
  <ellipse cx="${(lx + rx) / 2}" cy="${fy + 6}" rx="580" ry="46" fill="#3E3252" opacity=".10"/>
  ${roomShell(R, { floor: '#CDA27A', floorLines: 'planks', wallL: '#D8E2EF', wallR: '#CCD8E8', wallPatternL: 'ws-wl', wallPatternR: 'ws-wr', base: '#B99B74' })}
  <polygon points="${pp([proj(R, 2.9, 0.05), proj(R, 5.0, 0.05), proj(R, 6.6, 3.0), proj(R, 4.5, 3.0)])}" fill="url(#ws-light)" opacity="${snow ? 0.4 : 1}"/>`);
};
// ---------- toys ----------
const TOYS = {
  teddy: { w: 96, h: 104, name: 'a teddy bear', text: 'A teddy! So soft! 🧸', art: `<defs><radialGradient id="ws-g-fur" cx=".45" cy=".35" r=".7"><stop offset="0" stop-color="#E2B98E"/><stop offset="1" stop-color="#B98A5E"/></radialGradient></defs>
    ${shadow(48, 100, 36, 4)}<circle cx="24" cy="18" r="12" fill="url(#ws-g-fur)" stroke="${INK}" stroke-width="2"/><circle cx="72" cy="18" r="12" fill="url(#ws-g-fur)" stroke="${INK}" stroke-width="2"/>
    <circle cx="24" cy="18" r="5" fill="#F3D9BC"/><circle cx="72" cy="18" r="5" fill="#F3D9BC"/>
    <ellipse cx="48" cy="72" rx="28" ry="26" fill="url(#ws-g-fur)" stroke="${INK}" stroke-width="2"/><ellipse cx="48" cy="76" rx="15" ry="14" fill="#F3D9BC"/>
    <ellipse cx="20" cy="70" rx="9" ry="14" fill="url(#ws-g-fur)" stroke="${INK}" stroke-width="2" transform="rotate(20 20 70)"/><ellipse cx="76" cy="70" rx="9" ry="14" fill="url(#ws-g-fur)" stroke="${INK}" stroke-width="2" transform="rotate(-20 76 70)"/>
    <ellipse cx="32" cy="96" rx="11" ry="7" fill="url(#ws-g-fur)" stroke="${INK}" stroke-width="2"/><ellipse cx="64" cy="96" rx="11" ry="7" fill="url(#ws-g-fur)" stroke="${INK}" stroke-width="2"/>
    <circle cx="48" cy="34" r="22" fill="url(#ws-g-fur)" stroke="${INK}" stroke-width="2"/><ellipse cx="48" cy="42" rx="10" ry="8" fill="#F3D9BC"/>
    <circle cx="40" cy="31" r="2.6" fill="${INK}"/><circle cx="56" cy="31" r="2.6" fill="${INK}"/><ellipse cx="48" cy="39" rx="3.5" ry="2.5" fill="${INK}"/>
    <path d="M34 52 Q48 60 62 52 L60 58 Q48 64 36 58 Z" fill="#9EDDD4" stroke="${INK}" stroke-width="1.6"/>` },
  robot: { w: 84, h: 110, name: 'a robot', text: 'Beep boop! A robot! 🤖', art: `<defs><linearGradient id="ws-g-metal" x1="0" x2="1"><stop offset="0" stop-color="#8FA6C6"/><stop offset=".35" stop-color="#E4ECF6"/><stop offset="1" stop-color="#8395B4"/></linearGradient></defs>
    ${shadow(42, 106, 32, 4)}<path d="M42 4 V14" stroke="${INK}" stroke-width="2"/><circle cx="42" cy="4" r="4" fill="#F5DE7A" stroke="${INK}" stroke-width="1.6"/>
    <rect x="20" y="14" width="44" height="32" rx="8" fill="url(#ws-g-metal)" stroke="${INK}" stroke-width="2"/><rect x="26" y="24" width="32" height="10" rx="5" fill="#2E3A5A"/><rect x="29" y="27" width="26" height="4" rx="2" fill="#7FF0D2"/>
    <rect x="14" y="50" width="56" height="40" rx="8" fill="url(#ws-g-metal)" stroke="${INK}" stroke-width="2"/><circle cx="32" cy="66" r="5" fill="#B79CF0" stroke="${INK}" stroke-width="1.4"/><rect x="42" y="62" width="18" height="4" rx="2" fill="#9EDDD4"/><rect x="42" y="70" width="12" height="4" rx="2" fill="#F5DE7A"/>
    <path d="M14 58 H4 V78 M70 58 H80 V78" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="4" cy="80" r="4" fill="#AEB8C8" stroke="${INK}" stroke-width="1.4"/><circle cx="80" cy="80" r="4" fill="#AEB8C8" stroke="${INK}" stroke-width="1.4"/>
    <rect x="22" y="90" width="14" height="14" rx="3" fill="#6E7FA0" stroke="${INK}" stroke-width="1.6"/><rect x="48" y="90" width="14" height="14" rx="3" fill="#6E7FA0" stroke="${INK}" stroke-width="1.6"/>` },
  rocket: { w: 70, h: 116, name: 'a rocket', text: 'To the stars! 🚀', art: `<defs><linearGradient id="ws-g-rocket" x1="0" x2="1"><stop offset="0" stop-color="#C9C3E2"/><stop offset=".35" stop-color="#FFFFFF"/><stop offset="1" stop-color="#B4ACD6"/></linearGradient></defs>
    ${shadow(35, 112, 26, 4)}<path d="M14 74 L2 100 L18 96 Z M56 74 L68 100 L52 96 Z" fill="#7A64B0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M35 4 Q60 28 56 84 Q35 92 14 84 Q10 28 35 4 Z" fill="url(#ws-g-rocket)" stroke="${INK}" stroke-width="2"/>
    <path d="M35 4 Q48 16 53 30 Q35 36 17 30 Q22 16 35 4 Z" fill="#3CC7B8" stroke="${INK}" stroke-width="2"/>
    <circle cx="35" cy="52" r="11" fill="#AFD6F7" stroke="${INK}" stroke-width="2.4"/><path d="M29 48 Q32 44 37 44" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M22 86 H48 L44 96 H26 Z" fill="#AEB8C8" stroke="${INK}" stroke-width="1.8"/><path d="M30 98 Q35 112 40 98 Z" fill="#F5DE7A"/>` },
  doll: { w: 66, h: 104, name: 'a little doll', text: 'A sweet little doll! 🪆', art: `<defs><linearGradient id="ws-g-doll" x1="0" x2="1"><stop offset="0" stop-color="#8E78C8"/><stop offset=".35" stop-color="#C9B8F2"/><stop offset="1" stop-color="#8471BA"/></linearGradient></defs>
    ${shadow(33, 100, 28, 4)}<path d="M33 30 Q62 34 60 70 Q60 98 33 98 Q6 98 6 70 Q4 34 33 30 Z" fill="url(#ws-g-doll)" stroke="${INK}" stroke-width="2"/>
    <path d="M14 70 Q33 80 52 70" stroke="#F5DE7A" stroke-width="5" fill="none" stroke-linecap="round"/><g fill="#FBF7EF">${[[22, 84], [33, 88], [44, 84]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>
    <path d="M33 4 Q54 4 54 26 Q54 44 33 44 Q12 44 12 26 Q12 4 33 4 Z" fill="#9EDDD4" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="33" cy="27" rx="13" ry="12" fill="#F6E1CC" stroke="${INK}" stroke-width="1.6"/><path d="M21 22 Q33 12 45 22" fill="#8B6450"/>
    <circle cx="28" cy="28" r="1.8" fill="${INK}"/><circle cx="38" cy="28" r="1.8" fill="${INK}"/><path d="M30 33 Q33 35 36 33" stroke="${INK}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M14 52 Q12 40 20 34" stroke="#fff" stroke-width="3" opacity=".4" fill="none" stroke-linecap="round"/>` },
  train: { w: 110, h: 76, name: 'a toy train', text: 'Choo choo! A train! 🚂', art: `<defs><linearGradient id="ws-g-train" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FD3CB"/><stop offset="1" stop-color="#3E9C94"/></linearGradient></defs>
    ${shadow(55, 72, 48, 4)}<rect x="10" y="30" width="62" height="28" rx="6" fill="url(#ws-g-train)" stroke="${INK}" stroke-width="2"/>
    <rect x="62" y="10" width="40" height="48" rx="6" fill="#B79CF0" stroke="${INK}" stroke-width="2"/><rect x="70" y="18" width="24" height="16" rx="4" fill="#FFF3C2" stroke="${INK}" stroke-width="1.6"/>
    <rect x="58" y="4" width="48" height="10" rx="4" fill="#7A64B0" stroke="${INK}" stroke-width="1.8"/><rect x="20" y="12" width="14" height="20" rx="3" fill="#4D5C9A" stroke="${INK}" stroke-width="1.8"/>
    <path d="M2 56 L10 46 V58 Z" fill="#F5DE7A" stroke="${INK}" stroke-width="1.6"/>
    ${[26, 54, 84].map((x) => `<circle cx="${x}" cy="62" r="10" fill="#4D5C9A" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="62" r="3.5" fill="#F5DE7A"/>`).join('')}` },
};
const TOY_KINDS = Object.keys(TOYS);

// Is a dropped thing over the wrapping table? (its footprint centre lies on the table)
const onWrap = (i, w) => {
  const cx = i.gx + i.fw / 2, cy = i.gy + i.fd / 2;
  return i.on === w || (cx > w.gx && cx < w.gx + w.fw && cy > w.gy && cy < w.gy + w.fd);
};
// A toy item. `spec` = { w, h, art, text, name }; spec.art is the svg body string. spot = { gx, gy, gz } on the floor grid.
const TK = 0.75; // toys are drawn a bit smaller in the isometric room
function toy(api, spec, spot) {
  const w = spec.w * TK, h = spec.h * TK;
  return api.add({
    id: api.uid('toy'), x: 0, y: 0, w, h, cls: 'food', small: true, data: { spec },
    gx: spot.gx, gy: spot.gy, gz: spot.gz || 0, fw: 0.4, fd: 0.4, ax: w / 2, ay: h - 4,
    art: () => svg(spec.w, spec.h, spec.art),
    onGive: (i, a, who) => { a.remove(i); a.sfx.win(); a.react(who, spec.text, ['🎁', '✨', '💜']); },
    onDrop: (i, a) => {
      const w = a.get('wrap');
      if (!w || !onWrap(i, w)) return;
      a.remove(i);
      a.sfx.wear();
      const n = a.count('gift');
      const g = present(a, spec, { gx: w.gx + 0.2 + (n % 2) * 0.48, gy: w.gy + 0.25 + (Math.floor(n / 2) % 3) * 0.62, gz: w.def.surface });
      a.sparkle(g.x + g.w / 2, g.y + 24, ['🎁', '✨', '🎀']);
      a.bubble(g.x + g.w / 2, g.y - 20, 'All wrapped up! Give it to a friend 🎁');
    },
  }, { spawned: true });
}
const PAPERS = [['#C9B8F2', '#F5DE7A'], ['#9EDDD4', '#FBF7EF'], ['#AFD6F7', '#B79CF0'], ['#F5DE7A', '#3CC7B8']];
function present(api, spec, spot) {
  const [paper, ribbon] = pick(PAPERS);
  return api.add({
    id: api.uid('gift'), x: 0, y: 0, w: 63, h: 60, cls: 'food', small: true,
    gx: spot.gx, gy: spot.gy, gz: spot.gz || 0, fw: 0.4, fd: 0.4, ax: 31.5, ay: 57,
    onGive: (i, a, who) => { a.remove(i); a.sfx.win(); a.react(who, `A present for me?! It's ${spec.name}! 🎁`, ['🎁', '💜', '✨']); },
    onTap: (i, a) => {
      const sp = { gx: i.gx, gy: i.gy, gz: i.gz }, tx = i.x + i.w / 2, ty = i.y;
      a.remove(i); a.sfx.pop(); toy(a, spec, sp); a.sparkle(tx, ty + 30, ['🎀', '✨']); a.bubble(tx, ty - 10, `Unwrapped: ${spec.name}!`);
    },
    art: () => svg(84, 80, `${shadow(42, 76, 36, 4)}
      <rect x="8" y="30" width="68" height="46" rx="5" fill="${paper}" stroke="${INK}" stroke-width="2"/>
      <g fill="#fff" opacity=".55">${[[20, 44], [52, 40], [34, 60], [64, 64], [18, 68]].map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="2.2"/>`).join('')}</g>
      <path d="M8 30 H76 V40 Q42 46 8 40 Z" fill="${darker(paper, 0.12)}" opacity=".5"/>
      <rect x="3" y="22" width="78" height="14" rx="5" fill="${lighter(paper, 0.15)}" stroke="${INK}" stroke-width="2"/>
      <path d="M42 22 V76" stroke="${ribbon}" stroke-width="9"/><path d="M42 22 V76" stroke="${INK}" stroke-width="9" opacity=".08"/>
      <path d="M42 22 C30 2 14 10 26 20 Z M42 22 C54 2 70 10 58 20 Z" fill="${ribbon}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="42" cy="22" r="5" fill="${ribbon}" stroke="${INK}" stroke-width="1.8"/>`),
  }, { spawned: true });
}

// ---------- build a robot ----------
const ROBOT_COLORS = [['#C9B8F2', 'lilac'], ['#9EDDD4', 'mint'], ['#AFD6F7', 'sky blue'], ['#F5DE7A', 'lemon'], ['#D8DEE8', 'silver']];
function robotBody(r, u) {
  const c = r.color, d = darker(c, 0.22), l = lighter(c, 0.45);
  const m = `url(#${u}m)`;
  const heads = {
    box: `<rect x="62" y="34" width="76" height="56" rx="10" fill="${m}" stroke="${INK}" stroke-width="2.6"/><path d="M100 34 V18" stroke="${INK}" stroke-width="2.6"/><circle cx="100" cy="14" r="6" fill="#F5DE7A" stroke="${INK}" stroke-width="2"/>`,
    dome: `<path d="M58 90 V66 Q58 26 100 26 Q142 26 142 66 V90 Z" fill="${m}" stroke="${INK}" stroke-width="2.6"/><path d="M74 44 Q86 32 104 32" stroke="#fff" stroke-width="4" opacity=".6" fill="none" stroke-linecap="round"/>`,
    round: `<circle cx="100" cy="60" r="34" fill="${m}" stroke="${INK}" stroke-width="2.6"/><path d="M76 34 L66 16 M124 34 L134 16" stroke="${INK}" stroke-width="2.6"/><circle cx="66" cy="14" r="5" fill="#9EDDD4" stroke="${INK}" stroke-width="2"/><circle cx="134" cy="14" r="5" fill="#9EDDD4" stroke="${INK}" stroke-width="2"/>`,
  };
  const visor = `<rect x="72" y="54" width="56" height="16" rx="8" fill="#2E3A5A" stroke="${INK}" stroke-width="2"/><rect x="77" y="58" width="46" height="8" rx="4" fill="#7FF0D2"/><rect x="80" y="59" width="14" height="3" rx="1.5" fill="#fff" opacity=".8"/>`;
  const bodies = {
    box: `<rect x="56" y="96" width="88" height="76" rx="10" fill="${m}" stroke="${INK}" stroke-width="2.6"/><rect x="72" y="110" width="56" height="30" rx="6" fill="${d}" stroke="${INK}" stroke-width="2"/>
      <circle cx="84" cy="125" r="6" fill="#F5DE7A"/><circle cx="100" cy="125" r="6" fill="#9EDDD4"/><circle cx="116" cy="125" r="6" fill="#B79CF0"/><rect x="74" y="150" width="52" height="8" rx="4" fill="${l}"/>`,
    barrel: `<path d="M60 100 Q52 134 60 170 H140 Q148 134 140 100 Z" fill="${m}" stroke="${INK}" stroke-width="2.6"/><path d="M56 120 H144 M56 150 H144" stroke="${d}" stroke-width="4"/>
      <circle cx="100" cy="135" r="11" fill="#FBF7EF" stroke="${INK}" stroke-width="2"/><path d="M100 128 V136 L106 140" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    tv: `<rect x="50" y="96" width="100" height="78" rx="14" fill="${m}" stroke="${INK}" stroke-width="2.6"/><rect x="62" y="106" width="60" height="46" rx="8" fill="#2E3A5A" stroke="${INK}" stroke-width="2"/>
      <path d="M68 136 Q80 116 92 132 T116 126" stroke="#7FF0D2" stroke-width="3" fill="none"/><circle cx="136" cy="116" r="5" fill="#F5DE7A" stroke="${INK}" stroke-width="1.4"/><circle cx="136" cy="134" r="5" fill="#B79CF0" stroke="${INK}" stroke-width="1.4"/>`,
  };
  const arms = {
    pincers: [-1, 1].map((s) => { const x = 100 + s * 50, ex = 100 + s * 72; return `<path d="M${x} 112 L${ex} 120 L${ex} 152" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M${x} 112 L${ex} 120 L${ex} 152" stroke="#AEB8C8" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${ex - 9} 166 L${ex - 6} 152 H${ex + 6} L${ex + 9} 166 M${ex - 9} 166 L${ex - 3} 160 M${ex + 9} 166 L${ex + 3} 160" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`; }).join(''),
    springs: [-1, 1].map((s) => { const x0 = 100 + s * 50; let p = `M${x0} 116`; for (let k = 1; k <= 6; k++) p += ` L${x0 + s * k * 5} ${116 + k * 6 + (k % 2 ? -6 : 6)}`; return `<path d="${p}" stroke="${INK}" stroke-width="3" fill="none" stroke-linejoin="round"/><circle cx="${x0 + s * 34}" cy="${158}" r="10" fill="${l}" stroke="${INK}" stroke-width="2"/>`; }).join(''),
    mitts: [-1, 1].map((s) => { const x = 100 + s * 50; return `<rect x="${s < 0 ? x - 22 : x}" y="104" width="22" height="44" rx="11" fill="${m}" stroke="${INK}" stroke-width="2.4"/><ellipse cx="${x + s * 11}" cy="${156}" rx="14" ry="12" fill="#FBF7EF" stroke="${INK}" stroke-width="2.2"/>`; }).join(''),
  };
  return `<defs><linearGradient id="${u}m" x1="0" x2="1"><stop offset="0" stop-color="${d}"/><stop offset=".32" stop-color="${l}"/><stop offset=".7" stop-color="${c}"/><stop offset="1" stop-color="${d}"/></linearGradient></defs>
    <ellipse cx="100" cy="226" rx="56" ry="8" fill="${INK}" opacity=".14"/>
    <rect x="70" y="172" width="22" height="40" rx="6" fill="${d}" stroke="${INK}" stroke-width="2.2"/><rect x="108" y="172" width="22" height="40" rx="6" fill="${d}" stroke="${INK}" stroke-width="2.2"/>
    <rect x="62" y="206" width="36" height="18" rx="7" fill="#6E7FA0" stroke="${INK}" stroke-width="2.2"/><rect x="102" y="206" width="36" height="18" rx="7" fill="#6E7FA0" stroke="${INK}" stroke-width="2.2"/>
    ${arms[r.arms]}${bodies[r.body]}<rect x="88" y="88" width="24" height="12" rx="3" fill="#AEB8C8" stroke="${INK}" stroke-width="2"/>${heads[r.head]}${visor}`;
}
function robotGame(api, bench) {
  const r = { head: 'dome', body: 'box', arms: 'pincers', color: '#9EDDD4' };
  api.modal((card, close) => {
    card.innerHTML += `<h2>Build a toy robot</h2><div class="ws-robot-holder"></div>
      <div class="opt-row heads"></div><div class="opt-row bodies"></div><div class="opt-row arms"></div><div class="opt-row colors"></div>
      <button class="btn ws-done">Finish 🤖</button>`;
    const holder = card.querySelector('.ws-robot-holder');
    const draw = () => { holder.innerHTML = `<svg class="cookie-preview" viewBox="0 0 200 240" overflow="visible">${robotBody(r, 'wsprev')}</svg>`; };
    const row = (sel, opts, key, isColor) => {
      const el = card.querySelector(sel); el.innerHTML = '';
      opts.forEach(([val, label]) => {
        const b = document.createElement('button');
        b.className = (isColor ? 'dot' : 'chip') + (r[key] === val ? ' on' : '');
        if (isColor) { b.style.background = val; b.setAttribute('aria-label', label); } else b.textContent = label;
        b.onclick = () => { r[key] = val; api.sfx.click(); refresh(); };
        el.append(b);
      });
    };
    const refresh = () => {
      row('.heads', [['dome', 'Dome head'], ['box', 'Box head'], ['round', 'Round head']], 'head');
      row('.bodies', [['box', 'Button body'], ['barrel', 'Barrel body'], ['tv', 'Screen body']], 'body');
      row('.arms', [['pincers', 'Pincers'], ['springs', 'Spring arms'], ['mitts', 'Mittens']], 'arms');
      row('.colors', ROBOT_COLORS, 'color', true);
      draw();
    };
    card.querySelector('.ws-done').onclick = () => {
      const design = { ...r };
      const u = 'wsr' + Math.random().toString(36).slice(2, 8);
      close();
      api.sfx.win();
      const spec = { w: 100, h: 120, name: 'a robot you built', text: 'Wow, you built me a robot! 🤖', art: `<g transform="scale(.5)">${robotBody(design, u)}</g>` };
      const top = bench.def.surface || 0;
      const it = toy(api, spec, { gx: bench.gx + 0.95 + (api.count('toy') % 3) * 0.5, gy: bench.gy + 0.45, gz: top });
      api.sparkle(it.x + it.w / 2, it.y + 40, ['🤖', '✨', '⚙️']);
      api.bubble(it.x + it.w / 2, it.y - 10, 'Your robot is ready! 🤖');
      api.earn(10); if (!api.starFound('workshop-robot')) api.addStar('workshop-robot', 0, 0, { spawned: true, gx: bench.gx + 2.45, gy: bench.gy + 0.55, gz: top });
    };
    refresh();
  });
}

// ---------- windows & wall things ----------
const windowBody = (it, sp, api) => {
  const snow = api?.state.winterWeather !== 'clear';
  const w = sp.len, h = 140;
  return `<rect width="${w}" height="${h}" rx="6" fill="${snow ? '#B7C2DA' : '#BFE3FA'}" ${line}/>
    ${snow ? '' : `<circle cx="${w * 0.76}" cy="34" r="15" fill="#FFF6D2"/><path d="M12 42 q12 -12 26 -4 q10 -10 24 0 q12 0 10 10 z" fill="#fff" opacity=".9"/>`}
    <path d="M0 ${h * 0.68} Q${w * 0.3} ${h * 0.56} ${w * 0.6} ${h * 0.66} T${w} ${h * 0.6} V${h} H0 Z" fill="#fff"/>
    ${pine(w * 0.25, h * 0.3, 0.28)}${pine(w * 0.7, h * 0.38, 0.22)}
    ${snow ? Array.from({ length: 15 }, (_, i) => `<circle cx="${(6 + (i * 41) % (w - 12)).toFixed(1)}" cy="${8 + (i * 59) % (h - 30)}" r="${2 + (i % 3)}" fill="#fff"/>`).join('') : ''}
    <path d="M${w / 2} 0 V${h} M0 ${h / 2} H${w}" stroke="${CREAM}" stroke-width="6"/>
    <rect x="-6" y="${h - 4}" width="${w + 12}" height="12" rx="3" fill="${CREAM}" ${line}/>
    <path d="M-14 -10 Q${w * 0.14} ${h * 0.45} -4 ${h + 2} L-16 ${h + 2} Z" fill="${TEAL}" ${line}/>
    <path d="M${w + 14} -10 Q${w * 0.86} ${h * 0.45} ${w + 4} ${h + 2} L${w + 16} ${h + 2} Z" fill="${TEAL}" ${line}/>
    <rect x="-22" y="-16" width="${w + 44}" height="9" rx="4" fill="${WOOD_D}" ${line}/>`;
};
const bunting = (it, sp) => {
  const L = sp.len, n = Math.floor(L / 34);
  const cols = ['#C9B8F2', '#9EDDD4', SUN, '#AFD6F7'];
  return `<path d="M0 4 Q${L / 4} 24 ${L / 2} 6 Q${L * 0.75} 24 ${L} 4" fill="none" stroke="#3E3252" stroke-opacity=".6" stroke-width="1.6"/>
    ${Array.from({ length: n }, (_, i) => { const x = 14 + i * 34, y = 6 + Math.abs(Math.sin(((x / L) * 2) * Math.PI)) * 14; return `<path d="M${x - 9} ${y} L${x} ${y + 20} L${x + 9} ${y} Z" fill="${cols[i % 4]}" ${line}/>`; }).join('')}`;
};
const toyShelfBody = (it, sp) => `<g transform="scale(${sp.len / 280})"><defs><linearGradient id="ws-shelfwood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6AC82"/><stop offset="1" stop-color="#A57B55"/></linearGradient></defs>
  <rect x="0" y="0" width="280" height="190" rx="6" fill="#B9946E" stroke="${INK}" stroke-width="2.2"/><rect x="10" y="10" width="260" height="170" fill="#E9DCC4"/>
  <rect x="6" y="88" width="268" height="12" rx="3" fill="url(#ws-shelfwood)" stroke="${INK}" stroke-width="2"/><rect x="6" y="174" width="268" height="12" rx="3" fill="url(#ws-shelfwood)" stroke="${INK}" stroke-width="2"/>
  <g stroke="${INK}" stroke-width="1.8" stroke-linejoin="round">
    <path d="M26 86 H86 L78 74 H34 Z" fill="#AFD6F7"/><path d="M56 74 V30 M56 32 L84 70 H56 Z" fill="#FBF7EF"/><path d="M56 34 L32 66 H56 Z" fill="#C9B8F2"/>
    <rect x="104" y="62" width="24" height="24" rx="3" fill="#F5DE7A"/><rect x="130" y="62" width="24" height="24" rx="3" fill="#9EDDD4"/><rect x="117" y="38" width="24" height="24" rx="3" fill="#C9B8F2"/>
    <path d="M190 86 L180 64 Q200 46 220 64 L210 86 Z" fill="#B79CF0"/><path d="M200 46 V36" stroke-width="3"/><path d="M182 66 H218" stroke="#fff" stroke-width="2"/>
    <circle cx="248" cy="72" r="14" fill="#F5DE7A"/><path d="M234 72 H262 M248 58 V86" stroke="#3CC7B8" stroke-width="3"/>
    <circle cx="40" cy="150" r="14" fill="#C99772"/><circle cx="30" cy="138" r="6" fill="#C99772"/><circle cx="50" cy="138" r="6" fill="#C99772"/><ellipse cx="40" cy="168" rx="16" ry="8" fill="#C99772"/>
    <circle cx="76" cy="160" r="9" fill="#D9AC86"/><ellipse cx="76" cy="172" rx="10" ry="4" fill="#D9AC86"/>
    <rect x="110" y="132" width="50" height="40" rx="6" fill="#9EDDD4"/><path d="M110 148 H160" stroke="#fff" stroke-width="2"/><circle cx="135" cy="126" r="7" fill="#F5DE7A"/>
    <path d="M184 172 L196 120 H232 L244 172 Z" fill="#AFD6F7"/><circle cx="214" cy="146" r="8" fill="#FBF7EF"/></g>
  <path d="M14 14 V176" stroke="#fff" stroke-width="3" opacity=".3"/></g>`;
const pegboard = (it, sp) => {
  const L = sp.len;
  return `<rect width="${L}" height="110" rx="5" fill="#E2CDAA" stroke="#A6865F" stroke-width="4"/>
    ${Array.from({ length: 30 }, (_, i) => `<circle cx="${10 + (i % 10) * ((L - 20) / 9)}" cy="${14 + Math.floor(i / 10) * 40}" r="1.8" fill="#B99B74"/>`).join('')}
    <g stroke="#3E3252" stroke-opacity=".6" stroke-width="1.6" stroke-linejoin="round">
      <path d="M12 18 h28 l4 6 -4 6 h-28 z" fill="#AEB8C8"/><rect x="14" y="30" width="8" height="40" rx="3" fill="#C99772"/>
      <path d="M54 16 l10 0 0 56 -10 0 z" fill="#D9B36A"/><path d="M56 22 h6 M56 32 h6 M56 42 h6 M56 52 h6" stroke="#fff" stroke-width="1.2"/>
      <path d="M78 16 h30 v14 l-20 34 h-10 z" fill="#C9D2DE"/><rect x="82" y="16" width="22" height="14" rx="3" fill="#9EDDD4"/>
      <circle cx="${L - 22}" cy="34" r="12" fill="none" stroke="#C99772" stroke-width="4"/><path d="M${L - 22} 46 V82" stroke="#7A64B0" stroke-width="5" stroke-linecap="round"/>
      ${[[24, LILAC], [50, SUN], [76, TEAL]].map(([x, c]) => `<rect x="${x - 12}" y="80" width="24" height="18" rx="4" fill="${c}"/><circle cx="${x}" cy="89" r="4" fill="${CREAM}"/>`).join('')}
    </g>`;
};
const corkboard = (it, sp) => {
  const L = sp.len;
  return `<rect width="${L}" height="90" rx="5" fill="#D9B48A" stroke="${WOOD_D}" stroke-width="4"/>
    <g transform="rotate(-4 30 44)"><rect x="10" y="12" width="40" height="46" fill="#fff" ${line}/><rect x="20" y="24" width="20" height="16" rx="3" fill="${SKY}"/><rect x="24" y="40" width="12" height="12" fill="${SKY}"/><circle cx="26" cy="30" r="2" fill="#3E3252"/><circle cx="34" cy="30" r="2" fill="#3E3252"/></g>
    <g transform="rotate(5 80 44)"><rect x="60" y="18" width="40" height="44" fill="#FFFBEA" ${line}/>${starPath(80, 40, 12, SUN)}</g>
    ${L > 110 ? `<g transform="rotate(-3 ${L - 30} 44)"><rect x="${L - 50}" y="14" width="38" height="46" fill="#fff" ${line}/><circle cx="${L - 31}" cy="34" r="10" fill="#C99772"/><circle cx="${L - 38}" cy="25" r="4" fill="#C99772"/><circle cx="${L - 24}" cy="25" r="4" fill="#C99772"/></g>` : ''}
    ${[30, 80, L - 31].map((x, i) => `<circle cx="${x}" cy="${i === 1 ? 20 : 15}" r="3.5" fill="${['#E58F6A', TEAL, LILAC][i]}"/>`).join('')}`;
};

// ---------- the toy machine + conveyor belt ----------
const machine = () => {
  const body = shades('#6DB8AF'), base = shades('#4A8C86'), cap = shades('#E2C27A'), copper = shades('#D9976C');
  const FW = 2.2 * 64, RW = 1.3 * 64, H = 200;
  const front = `${[10, H - 10].map((y) => Array.from({ length: 9 }, (_, i) => `<circle cx="${10 + i * 15.2}" cy="${y}" r="2.4" fill="#E9C77E" ${line}/>`).join('')).join('')}
    <circle cx="46" cy="70" r="38" fill="#3A5E62" ${line}/><circle cx="46" cy="70" r="33" fill="#2E4A50"/>
    ${gear(36, 62, 20, 10, '#E9C77E')}${gear(62, 86, 14, 8, '#C9B8F2', 'ccw')}${gear(60, 48, 9, 7, '#9EDDD4', 'ccw')}
    <circle cx="46" cy="70" r="33" fill="none" stroke="#E9C77E" stroke-width="5"/><path d="M22 50 Q32 40 48 40" stroke="#fff" stroke-width="3" opacity=".25" fill="none" stroke-linecap="round"/>
    <circle cx="112" cy="50" r="18" fill="${CREAM}" ${line}/><path d="M100 58 A14 14 0 0 1 124 58" fill="none" stroke="#9EDDD4" stroke-width="4"/><path d="M112 50 L121 40" stroke="#3E3252" stroke-width="2.4" stroke-linecap="round"/><circle cx="112" cy="50" r="2.5" fill="#3E3252"/>
    ${[96, 112, 128].map((x, i) => `<circle class="wx-lamp" style="animation-delay:-${i * 0.12}s" cx="${x}" cy="88" r="5" fill="${[SUN, '#9EDDD4', '#C9B8F2'][i]}" ${line}/>`).join('')}
    <rect x="16" y="116" width="${FW - 32}" height="30" rx="7" fill="#4A8C86" ${line}/>${text(FW / 2, 137, 'TOY MAKER', 15, CREAM)}
    <circle cx="${FW / 2}" cy="172" r="11" fill="${SUN}" ${line}/><circle cx="${FW / 2}" cy="170" r="6" fill="#FFF3B0"/>
    <path d="M10 24 V${H - 24}" stroke="#fff" stroke-width="5" opacity=".2" stroke-linecap="round"/>`;
  const side = `<path d="M${RW / 2} 16 V96" stroke="#D9976C" stroke-width="10"/><circle cx="${RW / 2}" cy="40" r="8" fill="#E9C77E" ${line}/>
    <rect x="10" y="${H - 76}" width="${RW - 20}" height="60" rx="10" fill="#2E3A40" ${line}/><path d="M14 ${H - 68} H${RW - 14}" stroke="#7FA8A2" stroke-width="5"/>
    <path d="M16 ${H - 60} H${RW - 16} M16 ${H - 52} H${RW - 16}" stroke="#3A5E62" stroke-width="3"/>`;
  return isoItem(2.4, 1.5, 300, [
    { u: 0, v: 0, w: 2.4, d: 1.5, h: 16, ...base },
    { u: 0.1, v: 0.1, w: 2.2, d: 1.3, z: 16, h: H, ...body, leftDecor: front, rightDecor: side },
    { u: 0.05, v: 0.05, w: 2.3, d: 1.4, z: 216, h: 10, ...cap },
    { u: 1.65, v: 0.3, w: 0.32, d: 0.32, z: 226, h: 54, ...copper },
    P(0.75, 0.7, 226, (x, y) => `<path d="M${x - 44} ${y - 44} H${x + 44} L${x + 22} ${y} H${x - 22} Z" fill="#E6EBF2" ${line}/>
      <rect x="${x - 34}" y="${y - 60}" width="20" height="20" rx="4" fill="#C9B8F2" transform="rotate(-12 ${x - 24} ${y - 50})" ${line}/>
      <circle cx="${x + 2}" cy="${y - 52}" r="11" fill="${SUN}" ${line}/><rect x="${x + 16}" y="${y - 66}" width="16" height="24" rx="4" fill="#AFD6F7" transform="rotate(14 ${x + 24} ${y - 54})" ${line}/>
      <path d="M${x - 40} ${y - 44} H${x + 40}" stroke="#fff" stroke-width="3" opacity=".7"/>`, 0.4, 0.4),
    P(1.81, 0.46, 280, (x, y) => `<g class="wx-chimney-puff">${[0, 1, 2].map((k) => `<circle class="smoke" style="animation-duration:1.4s;animation-delay:-${k * 0.45}s" cx="${x + k * 6}" cy="${y - 12 - k * 16}" r="${9 + k * 4}" fill="#fff" opacity=".85"/>`).join('')}</g>`, 1, 1),
  ]);
};
const belt = () => {
  const frame = shades('#D6DCE6'), leg = shades('#8E9AB0');
  const L = 2.5 * 64, Wd = 0.6 * 64;
  return isoItem(2.6, 0.8, 72, [
    ...[0.15, 1.25, 2.35].flatMap((u) => [{ u, v: 0.08, w: 0.1, d: 0.1, h: 44, ...leg }, { u, v: 0.62, w: 0.1, d: 0.1, h: 44, ...leg }]),
    { u: 0, v: 0, w: 2.6, d: 0.8, z: 44, h: 16, ...frame,
      leftDecor: `${[8, 2.6 * 64 - 8].map((x) => `<circle cx="${x}" cy="8" r="5" fill="#AEB8C8" ${line}/>`).join('')}<path d="M18 8 H${2.6 * 64 - 18}" stroke="#AEB8C8" stroke-width="2" stroke-dasharray="3 9"/>` },
    P(2.55, 0.1, 60, (x, y) => `<g transform="matrix(-1,-0.5,-1,0.5,${x.toFixed(1)},${y.toFixed(1)})"><defs><clipPath id="ws-beltclip"><rect width="${L}" height="${Wd}"/></clipPath></defs>
      <rect width="${L}" height="${Wd}" fill="#4A4560"/><g clip-path="url(#ws-beltclip)"><g class="belt">${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 26 - 26}" width="12" height="${Wd}" fill="#6E6888"/>`).join('')}</g></g>
      <rect width="${L}" height="${Wd}" fill="none" ${line}/></g>`, 2, 2),
  ]);
};

// ---------- furniture & toys ----------
const wrapTable = () => {
  const top = shades('#EEE8F7'), leg = shades('#8E6E4E');
  return isoItem(1.2, 2.4, 110, [
    { u: 0.25, v: 0.3, w: 0.3, d: 1.7, h: 18, ...shades('#C9B8F2') },
    { u: 0.62, v: 0.4, w: 0.3, d: 1.5, h: 18, ...shades(TEAL) },
    ...[[0.06, 0.08], [1.0, 0.08], [0.06, 2.18], [1.0, 2.18]].map(([u, v]) => ({ u, v, w: 0.14, d: 0.14, h: 66, ...leg })),
    { u: 0, v: 0, w: 1.2, d: 2.4, z: 66, h: 12, ...top, rightDecor: `<path d="M0 7 H${2.4 * 64}" stroke="${LILAC}" stroke-width="4" stroke-dasharray="10 6"/>`,
      topDecor: `<rect x=".22" y=".35" width=".8" height="1.7" rx=".04" fill="#9EDDD4" opacity=".85"/>${[[0.4, 0.6], [0.8, 0.9], [0.5, 1.3], [0.85, 1.6], [0.4, 1.85]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r=".04" fill="#fff"/>`).join('')}` },
  ], () => {
    const [sx, sy] = at(0.35, 0.18, 78), [kx, ky] = at(0.9, 2.2, 78);
    return `<ellipse cx="${sx}" cy="${sy - 7}" rx="13" ry="7" fill="${SUN}" ${line}/><rect x="${sx - 13}" y="${sy - 15}" width="26" height="8" fill="${SUN}"/><ellipse cx="${sx}" cy="${sy - 15}" rx="13" ry="7" fill="#F8E9A8" ${line}/><circle cx="${sx}" cy="${sy - 15}" r="4" fill="${CREAM}" ${line}/>
      <path d="M${sx + 12} ${sy - 10} Q${sx + 30} ${sy + 6} ${sx + 18} ${sy + 18}" stroke="${SUN}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <g transform="translate(${kx} ${ky - 4}) rotate(-20)"><circle cx="-6" cy="0" r="5" fill="none" stroke="#7A64B0" stroke-width="2.6"/><circle cx="6" cy="0" r="5" fill="none" stroke="#7A64B0" stroke-width="2.6"/><path d="M-3 -3 L18 -14 M3 -3 L18 4" stroke="#AEB8C8" stroke-width="2.6" stroke-linecap="round"/></g>`;
  });
};
const workbench = () => {
  const top = shades('#E2BF96'), leg = shades('#8E6E4E');
  return isoItem(3.1, 1.0, 100, [
    { u: 0.35, v: 0.2, w: 0.6, d: 0.5, h: 26, ...shades(LILAC) },
    { u: 1.15, v: 0.25, w: 0.5, d: 0.45, h: 22, ...shades(TEAL) },
    { u: 2.05, v: 0.2, w: 0.7, d: 0.5, h: 28, ...shades('#6E7FA0'), leftDecor: '<rect x="14" y="-6" width="16" height="6" rx="2" fill="none" stroke="#3E3252" stroke-opacity=".6" stroke-width="2"/><path d="M0 12 H45" stroke="#AEB8C8" stroke-width="2"/>' },
    ...[[0.08, 0.08], [2.88, 0.08], [0.08, 0.78], [2.88, 0.78]].map(([u, v]) => ({ u, v, w: 0.14, d: 0.14, h: 68, ...leg })),
    { u: 0, v: 0, w: 3.1, d: 1.0, z: 68, h: 12, ...top,
      leftDecor: `<path d="M8 6 Q60 3 120 7 T196 5" stroke="#B48C66" stroke-width="1.4" fill="none"/>`,
      topDecor: '<path d="M.2 .3 Q1 .25 1.6 .35 T3 .3 M.3 .7 Q1.2 .65 2 .75" stroke="#B48C66" stroke-opacity=".6" stroke-width=".02" fill="none"/>' },
  ], () => {
    const [gx1, gy1] = at(0.6, 0.85, 80), [gx2, gy2] = at(1.95, 0.25, 80);
    return `<g transform="translate(${gx1} ${gy1 - 3}) scale(1 .5)">${gear(0, 0, 11, 8, '#E9C77E')}</g><g transform="translate(${gx2} ${gy2 - 3}) scale(1 .5)">${gear(0, 0, 9, 7, '#AEB8C8')}</g>
      ${[[2.2, 0.85], [2.3, 0.72], [1.6, 0.9]].map(([u, v]) => { const [x, y] = at(u, v, 80); return `<path d="M${x - 5} ${y} q5 -5 10 0 q-5 4 -10 0 z" fill="#E8C9A0" ${line}/>`; }).join('')}`;
  });
};
const crate = () => {
  const c = shades('#DDB78C');
  const slat = (W) => `<path d="M0 22 H${W} M0 46 H${W}" stroke="#9E7A56" stroke-width="3"/><path d="M4 4 L${W - 4} 66 M${W - 4} 4 L4 66" stroke="#A6865F" stroke-width="4" opacity=".6"/>`;
  return isoItem(1.1, 1.0, 110, [
    { u: 0, v: 0, w: 1.1, d: 1.0, h: 70, ...c, leftDecor: `${slat(1.1 * 64)}<rect x="14" y="26" width="42" height="18" rx="4" fill="${CREAM}" opacity=".9"/>${text(35, 40, 'PARTS', 12, '#8E6E4E')}`, rightDecor: slat(64), top: '#7A5E44' },
    P(0.55, 0.5, 70, (x, y) => `<circle cx="${x - 22}" cy="${y - 14}" r="11" fill="${SUN}" ${line}/><rect x="${x - 4}" y="${y - 34}" width="18" height="22" rx="4" fill="#C9B8F2" transform="rotate(12 ${x + 5} ${y - 23})" ${line}/>
      ${gear(x + 26, y - 18, 13, 8, '#AEB8C8')}<path d="M${x - 8} ${y - 4} l10 -30" stroke="#C99772" stroke-width="5" stroke-linecap="round"/>`, 0.5, 0.5),
  ]);
};
const blocks = (it) => {
  const up = it?.data.up ?? true;
  const cube = (u, v, z, col, l) => ({ u, v, z, w: 0.34, d: 0.34, h: 24, ...shades(col),
    leftDecor: `<text x="10.9" y="17" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="600" font-size="14" fill="#fff">${l}</text>`,
    rightDecor: `<rect x="4" y="4" width="13.8" height="16" rx="3" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>` });
  return isoItem(0.8, 0.8, 90, up
    ? [cube(0.05, 0.42, 0, '#7FC4BC', 'A'), cube(0.42, 0.42, 0, '#B79CF0', 'B'), cube(0.24, 0.42, 24, '#E2C26A', 'C'),
       P(0.41, 0.59, 48, (x, y) => `<path d="M${x} ${y - 30} L${x + 20} ${y - 2} L${x} ${y + 9} L${x - 20} ${y - 2} Z" fill="#AFD6F7" ${line}/><path d="M${x} ${y - 30} L${x} ${y + 9} L${x - 20} ${y - 2} Z" fill="#C6E2FA"/>`, 0.2, 0.2)]
    : [cube(0.0, 0.1, 0, '#7FC4BC', 'A'), cube(0.44, 0.24, 0, '#B79CF0', 'B'), cube(0.12, 0.46, 0, '#E2C26A', 'C'),
       P(0.62, 0.66, 0, (x, y) => `<path d="M${x - 14} ${y + 4} L${x + 2} ${y - 18} L${x + 18} ${y} Z" fill="#AFD6F7" ${line}/>`, 0.1, 0.1)]);
};
const jack = (it) => {
  const open = it?.data.open, box = shades('#9EDDD4'), lid = shades('#7FC4BC');
  return isoItem(0.5, 0.5, 110, [
    { u: 0, v: 0, w: 0.5, d: 0.5, h: 34, ...box, leftDecor: starPath(16, 17, 9, SUN, 'stroke="#3E3252" stroke-opacity=".6" stroke-width="1.4"'), rightDecor: '<path d="M26 14 h6 v-10" stroke="#3E3252" stroke-opacity=".7" stroke-width="3" fill="none" stroke-linecap="round"/>' },
    ...(open
      ? [{ u: 0, v: -0.05, w: 0.5, d: 0.06, z: 34, h: 32, ...lid },
         P(0.25, 0.25, 34, (x, y) => `<path d="M${x} ${y} q-10 -5 0 -10 q10 -5 0 -10 q-10 -5 0 -10 q10 -5 0 -10" stroke="#AEB8C8" stroke-width="3.5" fill="none"/>
           <circle cx="${x}" cy="${y - 52}" r="12" fill="${SUN}" ${line}/><path d="M${x - 12} ${y - 56} L${x - 20} ${y - 70} L${x - 6} ${y - 63} L${x} ${y - 78} L${x + 6} ${y - 63} L${x + 20} ${y - 70} L${x + 12} ${y - 56} Z" fill="#B79CF0" ${line}/>
           ${[[-20, -70], [20, -70], [0, -78]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="3.5" fill="#9EDDD4" ${line}/>`).join('')}`, 0.3, 0.3)]
      : [{ u: -0.02, v: -0.02, w: 0.54, d: 0.54, z: 34, h: 7, ...lid }]),
  ]);
};
const musicBox = () => isoItem(0.45, 0.4, 70, [
  { u: 0, v: 0, w: 0.45, d: 0.4, h: 22, ...shades(LILAC), leftDecor: '<path d="M0 8 H29" stroke="#F5DE7A" stroke-width="3"/>', rightDecor: '<path d="M22 12 h4 M26 8 v8" stroke="#3E3252" stroke-opacity=".7" stroke-width="2.4" stroke-linecap="round"/>' },
  { u: -0.02, v: -0.02, w: 0.49, d: 0.44, z: 22, h: 7, ...shades('#C9B8F2') },
  P(0.22, 0.2, 29, (x, y) => `<g class="notes"><text x="${x + 6}" y="${y - 24}" font-size="18" fill="#7A64B0">♪</text><text x="${x - 20}" y="${y - 32}" font-size="16" fill="#3E8F88">♫</text></g>`, 0.1, 0.1),
]);
const sprite = (fw, fd, h, fn) => () => isoItem(fw, fd, h, [P(fw / 2, fd / 2, 0, fn, fw, fd)]);
const hammerArt = sprite(0.6, 0.25, 30, (x, y) => `<g transform="translate(${x} ${y}) rotate(26.6) scale(.55) translate(-62 -30)">${shadow(60, 46, 50, 3)}
  <rect x="10" y="20" width="84" height="12" rx="6" fill="#C99772" stroke="${INK}" stroke-width="2"/><path d="M16 23 H86" stroke="#fff" stroke-width="2" opacity=".4"/>
  <path d="M90 6 H112 Q116 6 116 12 V40 Q116 46 112 46 H90 Z" fill="#D6DCE6" stroke="${INK}" stroke-width="2"/><path d="M90 14 L80 10 V42 L90 38" fill="#AEB8C8" stroke="${INK}" stroke-width="2"/></g>`);
const topArt = sprite(0.4, 0.4, 66, (x, y) => `<g transform="translate(${x - 24.5} ${y - 57}) scale(.7)"><defs><linearGradient id="ws-topg" x1="0" x2="1"><stop offset="0" stop-color="#5FA7A0"/><stop offset=".35" stop-color="#A9E2D8"/><stop offset="1" stop-color="#4E968F"/></linearGradient></defs>
  ${shadow(35, 80, 18, 3)}<path d="M35 2 V18" stroke="#C99772" stroke-width="6" stroke-linecap="round"/>
  <path d="M6 40 Q6 18 35 18 Q64 18 64 40 Q60 58 35 78 Q10 58 6 40 Z" fill="url(#ws-topg)" stroke="${INK}" stroke-width="2"/>
  <path d="M8 38 Q35 50 62 38" stroke="#F5DE7A" stroke-width="5" fill="none"/><path d="M14 52 Q35 60 56 52" stroke="#C9B8F2" stroke-width="4" fill="none"/>
  <path d="M14 30 Q22 22 34 22" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/></g>`);
const horseArt = sprite(1.3, 0.6, 118, (x, y) => `<g transform="translate(${x - 63} ${y - 106}) scale(.7)"><defs><linearGradient id="ws-horse" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4EFFB"/><stop offset="1" stop-color="#D8CFEA"/></linearGradient></defs>
  ${shadow(90, 154, 80, 6)}
  <path d="M6 136 Q90 168 174 136" stroke="#A6865F" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M6 136 Q90 168 174 136" stroke="#D6AC82" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M44 96 L32 140 M64 100 L58 146 M118 100 L122 146 M138 96 L150 140" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M44 96 L32 140 M64 100 L58 146 M118 100 L122 146 M138 96 L150 140" stroke="#E6DEF2" stroke-width="5" stroke-linecap="round"/>
  <path d="M30 70 Q30 52 54 50 H130 Q150 52 150 74 Q150 100 128 104 H52 Q30 100 30 70 Z" fill="url(#ws-horse)" stroke="${INK}" stroke-width="2"/>
  <path d="M150 70 Q170 74 172 94" stroke="#B79CF0" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M50 54 Q42 26 50 12 Q62 2 74 14 L80 50 Z" fill="url(#ws-horse)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M50 12 Q34 16 28 30 Q36 34 44 30" fill="url(#ws-horse)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M60 6 Q76 10 80 30 Q82 44 78 52" stroke="#B79CF0" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="46" cy="22" r="2.4" fill="${INK}"/>
  <path d="M84 50 Q96 62 108 50 V68 H84 Z" fill="#3CC7B8" stroke="${INK}" stroke-width="1.8"/><path d="M40 66 Q60 58 90 60" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/></g>`);
const paintCans = () => isoItem(0.75, 0.4, 70, [
  ...[[0.04, LILAC], [0.28, '#3CC7B8'], [0.52, SUN]].map(([u, c]) => ({ u, v: 0.1, w: 0.2, d: 0.2, h: 24, round: true, ...shades('#D6DCE6'), top: c })),
  P(0.4, 0.2, 24, (x, y) => `<path d="M${x - 2} ${y - 6} L${x + 14} ${y - 36}" stroke="#C99772" stroke-width="4" stroke-linecap="round"/><path d="M${x + 14} ${y - 36} L${x + 18} ${y - 44}" stroke="#7A64B0" stroke-width="6" stroke-linecap="round"/>`, 0.4, 0.3),
]);
const deskLamp = (it) => isoItem(0.35, 0.35, 100, [
  { u: 0.06, v: 0.06, w: 0.23, d: 0.23, h: 6, ...shades('#3E9C94') },
  P(0.17, 0.17, 6, (cx, cy) => `${it?.data.on ? `<path d="M${cx - 30} ${cy - 50} L${cx - 90} ${cy + 26} L${cx + 20} ${cy + 26} Z" fill="#FFF3B0" opacity=".28"/>` : ''}
    <path d="M${cx} ${cy} L${cx + 8} ${cy - 46} L${cx - 14} ${cy - 70}" fill="none" stroke="#3E3252" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M${cx} ${cy} L${cx + 8} ${cy - 46} L${cx - 14} ${cy - 70}" fill="none" stroke="#7FD3CB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${cx + 8}" cy="${cy - 46}" r="3.5" fill="#E9C77E" ${line}/>
    <path d="M${cx - 6} ${cy - 72} L${cx - 34} ${cy - 80} L${cx - 42} ${cy - 56} Z" fill="${it?.data.on ? '#FFF0A0' : '#3CC7B8'}" ${line}/>`, 0.35, 0.35),
]);
const presentPile = () => {
  const box = (u, v, z, w, d, h, c, r) => ({ u, v, z, w, d, h, ...shades(c),
    leftDecor: `<rect x="${w * 32 - 3}" y="0" width="6" height="${h}" fill="${r}"/>`, rightDecor: `<rect x="${d * 32 - 3}" y="0" width="6" height="${h}" fill="${r}"/>`,
    topDecor: `<rect x="${w / 2 - 0.04}" y="0" width=".08" height="${d}" fill="${r}"/><rect x="0" y="${d / 2 - 0.04}" width="${w}" height=".08" fill="${r}"/>` });
  return isoItem(1.2, 1.0, 120, [
    box(0.05, 0.05, 0, 0.6, 0.55, 40, '#C9B8F2', SUN), box(0.65, 0.1, 0, 0.5, 0.5, 34, '#9EDDD4', CREAM), box(0.2, 0.55, 0, 0.45, 0.4, 28, SUN, '#3CC7B8'),
    box(0.15, 0.1, 40, 0.42, 0.4, 30, '#AFD6F7', LILAC),
    P(0.36, 0.3, 70, (x, y) => `<path d="M${x} ${y} C${x - 14} ${y - 16} ${x - 20} ${y - 2} ${x - 4} ${y + 2} Z M${x} ${y} C${x + 14} ${y - 16} ${x + 20} ${y - 2} ${x + 4} ${y + 2} Z" fill="${LILAC}" ${line}/>`, 0.6, 0.6),
  ]);
};
const track = () => isoItem(8.4, 0.8, 20, [
  { u: 0, v: 0, w: 8.4, d: 0.8, h: 0, top: 'none', line: false,
    topDecor: `${Array.from({ length: 33 }, (_, i) => `<rect x="${0.1 + i * 0.25}" y=".06" width=".1" height=".68" rx=".02" fill="#8B6450"/>`).join('')}
      <path d="M0 .22 H8.4 M0 .58 H8.4" stroke="#3E3252" stroke-opacity=".35" stroke-width=".07"/><path d="M0 .22 H8.4 M0 .58 H8.4" stroke="#DCE2EC" stroke-width=".045"/>` },
  { u: 0, v: 0.1, w: 0.12, d: 0.6, h: 18, ...shades('#C9B8F2') },
  { u: 8.28, v: 0.1, w: 0.12, d: 0.6, h: 18, ...shades('#C9B8F2') },
]);
const train = (it) => {
  const dir = it?.data.dir ?? 1; // 1 = chugging towards the front-right, -1 = back
  const U = (u, w) => (dir === 1 ? u : 1.6 - u - w);
  const loco = shades('#B79CF0'), car = shades('#7FCFC4'), dark = shades('#4D5C9A');
  const wheels = (w, y) => [0.22, 0.78].map((t) => `<circle cx="${w * 64 * t}" cy="${y}" r="7" fill="#4D5C9A" ${line}/><circle cx="${w * 64 * t}" cy="${y}" r="2.5" fill="${SUN}"/>`).join('');
  const cabU = dir === 1 ? 0.72 : 1.6 - 0.72 - 0.36, stackU = U(1.32, 0.13);
  return isoItem(1.6, 0.5, 110, [
    { u: U(0.02, 0.62), v: 0.06, w: 0.62, d: 0.38, z: 6, h: 20, ...car, leftDecor: wheels(0.62, 20) },
    P(U(0.02, 0.62) + 0.31, 0.25, 26, (x, y) => `<rect x="${x - 16}" y="${y - 18}" width="14" height="14" rx="3" fill="${SUN}" ${line}/><rect x="${x}" y="${y - 20}" width="14" height="16" rx="3" fill="#C9B8F2" ${line}/><circle cx="${x + 2}" cy="${y - 4}" r="6" fill="#AFD6F7" ${line}/>`, 0.2, 0.2),
    { u: U(0.66, 0.1), v: 0.2, w: 0.1, d: 0.1, z: 10, h: 5, ...dark },
    { u: U(0.72, 0.86), v: 0.04, w: 0.86, d: 0.42, z: 6, h: 24, ...loco, leftDecor: wheels(0.86, 24) },
    { u: cabU, v: 0.04, w: 0.36, d: 0.42, z: 30, h: 28, ...loco, leftDecor: '<rect x="5" y="5" width="13" height="11" rx="2" fill="#FFF3C2" stroke="#3E3252" stroke-opacity=".5" stroke-width="1.2"/>' },
    { u: cabU - 0.03, v: 0.01, w: 0.42, d: 0.48, z: 58, h: 5, ...dark },
    { u: stackU, v: 0.18, w: 0.13, d: 0.13, z: 30, h: 22, ...dark },
    P(stackU + 0.06, 0.24, 52, (x, y) => `<g class="wx-toot-puff"><circle cx="${x}" cy="${y - 12}" r="10" fill="#fff" opacity=".9"/><circle cx="${x - 10}" cy="${y - 24}" r="7" fill="#fff" opacity=".8"/><circle cx="${x + 8}" cy="${y - 28}" r="6" fill="#fff" opacity=".7"/></g>`, 1, 1),
  ]);
};
const rugArt = () => isoItem(3.8, 3.0, 4, [
  { u: 0, v: 0, w: 3.8, d: 3.0, h: 0, top: '#AFD6F7',
    topDecor: `<rect x=".18" y=".18" width="3.44" height="2.64" fill="#C9B8F2"/><rect x=".36" y=".36" width="3.08" height="2.28" fill="#F6E9B0"/>
      ${Array.from({ length: 6 }, (_, i) => `<rect x="${0.56 + i * 0.46}" y=".56" width=".3" height="1.88" fill="${['#9EDDD4', '#C9B8F2', '#AFD6F7'][i % 3]}" opacity=".7"/>`).join('')}
      <rect x=".1" y=".1" width="3.6" height="2.8" fill="none" stroke="#fff" stroke-width=".04" stroke-dasharray=".12 .08"/>` },
]);

const I = isoDef;
const W = (...a) => wallDef(R, ...a);

export const WORKSHOP = {
  id: 'workshop', posKey: 'workshop-iso', title: 'Toy Workshop 🎁', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, light: 'iso',
  avatar: [3.4, 5.5],
  frame: '#DCE3F0',
  iso: R,
  bg,
  onWeather: (api) => api.setArt(api.get('window')),
  // the little train chugs back and forth along its track (moves on the floor grid so it stays depth-sorted)
  init: (api) => {
    const t = api.get('train');
    if (!t) return;
    const lo = 0.35, hi = R.cols - 0.3 - t.fw, step = 0.045, ms = 70;
    t.el.style.transition = `left ${ms}ms linear, top ${ms}ms linear`;
    let pause = 0;
    const tick = () => {
      if (pause > 0) pause--;
      else {
        t.gx += step * t.data.dir;
        if (t.gx >= hi || t.gx <= lo) { t.gx = Math.max(lo, Math.min(hi, t.gx)); t.data.dir *= -1; api.setArt(t); pause = 20; }
        api.place(t);
      }
      api.later(tick, ms);
    };
    api.later(tick, 600);
  },
  stars: [{ id: 'workshop-crate', gx: 0.6, gy: 5.9 }],
  characters: [{
    id: 'toymaker', gx: 6.8, gy: 2.1,
    look: { ...NPC_WINTER.grandpa, hair: '#E8E4F2', topColor: '#3CC7B8', neckColor: '#F5DE7A', bottomColor: '#4D5C9A', hat: 'beanie', shoesColor: '#8B6450' },
    say: ["Hello! I'm Otto, the toymaker 🛠️", 'Tap my machine — what toy will roll out?', 'Wrap a toy on the table, then give it away 🎁', 'Build your own robot at the workbench! 🤖'],
  }],
  items: [
    W('buntR', 'R', 0.1, 278, 8.8, 40, bunting),
    W('buntL', 'L', 0.1, 278, 7.8, 40, bunting),
    W('window', 'R', 2.9, 252, 2.1, 140, windowBody),
    W('shelf', 'R', 5.75, 268, 2.6, 2.6 * 64 * 190 / 280, toyShelfBody, { data: { n: 0 },
      onTap: (it, api) => { it.data.n++; bump(it, 'shake'); api.sfx.click(); api.sparkle(it.x + it.w / 2, it.y + it.h / 2, ['✨', '🧸', '🪀']); api.bubble(it.x + it.w / 2, it.y, ['A wooden sailboat! ⛵', 'Stacking blocks! 🧱', 'A spinning top!', 'A tiny teddy family 🧸'][it.data.n % 4]); } }),
    W('pegboard', 'L', 2.8, 252, 2.0, 110, pegboard),
    W('cork', 'L', 5.3, 240, 1.8, 90, corkboard),

    I('rug', 2.4, 2.4, 3.8, 3.0, rugArt, { floor: true }),
    I('track', 0.3, 7.15, 8.4, 0.8, track, { floor: true, drag: false }),
    I('machine', 0.15, 0.1, 2.4, 1.5, machine, { drag: false, data: { busy: false, n: 0 },
      onTap: (it, api) => {
        if (it.data.busy) return;
        const bx = it.x + it.w / 2, by = it.y + 90;
        if (api.count('toy') >= 6) { api.bubble(bx, by, 'So many toys! Give some away first 🎁'); return; }
        it.data.busy = true;
        const b = api.get('belt');
        it.el.classList.add('wx-run', 'running'); b?.el.classList.add('running'); api.sfx.click(); api.bubble(bx, by, 'Whirr… clank… ⚙️');
        api.later(() => {
          let kind = pick(TOY_KINDS);
          if (kind === it.data.last) kind = TOY_KINDS[(TOY_KINDS.indexOf(kind) + 1) % TOY_KINDS.length];
          it.data.last = kind;
          const spec = TOYS[kind];
          const bg0 = b ? { gx: b.gx + 0.05, gy: b.gy + 0.22, gz: b.def.surface } : { gx: it.gx + it.fw + 0.1, gy: it.gy + 0.6, gz: 0 };
          const t = toy(api, spec, bg0);
          slide(api, t, bg0.gx + 2.05 - (it.data.n++ % 3) * 0.6, bg0.gy);
          api.later(() => { it.el.classList.remove('wx-run', 'running'); b?.el.classList.remove('running'); it.data.busy = false; api.bubble(t.x + t.w / 2, t.y - 10, `Out comes ${spec.name}!`); }, 1000);
        }, 900);
      } }),
    I('belt', 2.55, 0.35, 2.6, 0.8, belt, { drag: false, surface: 60 }),
    I('wrap', 0.1, 2.6, 1.2, 2.4, wrapTable, { drag: false, surface: 78,
      onTap: (it, api) => api.bubble(it.x + it.w / 2, it.y + 30, 'Drop a toy here to wrap it! 🎁') }),
    I('bench', 5.5, 0.15, 3.1, 1.0, workbench, { drag: false, surface: 80, onTap: (it, api) => robotGame(api, it) }),
    I('crate', 0.25, 5.6, 1.1, 1.0, crate,
      { onTap: (it, api) => { bump(it, 'shake'); api.sfx.drop(); api.bubble(it.x + it.w / 2, it.y, 'Rattle rattle… toy parts! ⚙️'); } }),
    I('blocks', 3.0, 3.1, 0.8, 0.8, blocks, { data: { up: true },
      onTap: (it, api) => { it.data.up = !it.data.up; api.setArt(it); api.sfx.drop(); api.bubble(it.x + it.w / 2, it.y, it.data.up ? 'Stacked up high! 🧱' : 'Crash! Tap to stack again'); } }),
    I('jack', 5.0, 3.0, 0.5, 0.5, jack, { data: { open: false },
      onTap: (it, api) => {
        it.data.open = !it.data.open; api.setArt(it);
        if (it.data.open) { bump(it, 'boing'); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y - 20, 'Boing! Surprise! 🎉'); } else { api.sfx.click(); api.bubble(it.x + it.w / 2, it.y, 'Back in the box… click!'); }
      } }),
    I('horse', 6.6, 4.3, 1.3, 0.6, horseArt,
      { onTap: (it, api) => { bump(it, 'wx-rock'); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y, 'Giddy-up! 🐴'); } }),
    I('pile', 7.5, 5.6, 1.2, 1.0, presentPile,
      { onTap: (it, api) => { bump(it, 'boing'); api.sfx.pop(); api.sparkle(it.x + it.w / 2, it.y + 30, ['🎁', '✨', '🎀']); api.bubble(it.x + it.w / 2, it.y, 'Presents for everyone on Winter Planet! 🎁'); } }),
    I('train', 0.4, 7.3, 1.6, 0.5, train, { drag: false, zBias: 10, data: { dir: 1 },
      onTap: (it, api) => { bump(it, 'wx-toot'); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y - 10, pick(['Toot toot! 🚂', 'Choo choo! 🚂', 'All aboard! 🎶'])); } }),
    // small things: drag them around and onto the workbench or the wrapping table
    I('top', 4.4, 4.4, 0.4, 0.4, topArt, { small: true,
      onTap: (it, api) => { bump(it, 'wx-whirl'); api.sfx.pick(); api.bubble(it.x + it.w / 2, it.y, 'Wheee… spin spin! 🌀'); } }),
    I('paint', 1.6, 5.5, 0.75, 0.4, paintCans, { small: true,
      onTap: (it, api) => { api.sfx.pour(); api.sparkle(it.x + it.w / 2, it.y + 20, ['🎨', '💜', '💙', '💛']); api.bubble(it.x + it.w / 2, it.y, 'Splish! Paint for the toys 🎨'); } }),
    I('musicbox', 5.65, 0.3, 0.45, 0.4, musicBox, { small: true, gz: 80,
      onTap: (it, api) => { it.el.classList.add('playing'); api.sfx.star(); api.bubble(it.x + it.w / 2, it.y, '♪ Tinkle-tinkle… ♫'); api.later(() => it.el.classList.remove('playing'), 2400); } }),
    I('hammer', 5.65, 0.82, 0.6, 0.25, hammerArt, { small: true, gz: 80,
      onTap: (it, api) => { bump(it, 'punch'); api.sfx.click(); api.later(() => api.sfx.click(), 180); api.bubble(it.x + it.w / 2, it.y - 10, 'Tap tap tap! 🔨'); } }),
    I('lamp', 8.15, 0.3, 0.35, 0.35, deskLamp, { drag: false, gz: 80, data: { on: true },
      onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); } }),
  ],
};
