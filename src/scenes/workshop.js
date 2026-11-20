// Toy Workshop: tap the toy machine and a toy rolls out on the conveyor belt; drop a toy on the wrapping
// table to wrap it as a present; a little train shuttles along its track; build your own robot at the workbench.
import { INK, O, svg, text, starPath, winterWindow, NPC_WINTER } from './common.js';
import { darker, lighter } from '../avatar.js';
import { CLIMATES } from '../ui.js';

const O2 = 'class="o" style="stroke-width:2"';
const tag = (x, y, t, w = 180) => `<rect x="${x - w / 2}" y="${y - 19}" width="${w}" height="36" rx="18" fill="#FFFDF7" fill-opacity=".94" stroke="${INK}" stroke-width="2"/>${text(x, y + 7, t, 18, '#3E8F88')}`;
const shadow = (cx, cy, rx, ry = 10, op = 0.14) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${INK}" opacity="${op}"/>`;
const bump = (it, cls) => { it.el.classList.remove(cls); void it.el.offsetWidth; it.el.classList.add(cls); };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const gear = (cx, cy, r, teeth, fill, cls = '') => {
  let d = '';
  for (let i = 0; i < teeth * 2; i++) {
    const a0 = (i / (teeth * 2)) * Math.PI * 2, a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2, rr = i % 2 ? r * 0.84 : r;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a0) * rr).toFixed(1)} ${(cy + Math.sin(a0) * rr).toFixed(1)} L${(cx + Math.cos(a1) * rr).toFixed(1)} ${(cy + Math.sin(a1) * rr).toFixed(1)} `;
  }
  return `<g class="wx-gear ${cls}"><path d="${d}Z" fill="${fill}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="none" stroke="${darker(fill, 0.25)}" stroke-width="2"/>
    ${[0, 1, 2].map((k) => { const a = (k / 3) * Math.PI * 2; return `<circle cx="${(cx + Math.cos(a) * r * 0.42).toFixed(1)}" cy="${(cy + Math.sin(a) * r * 0.42).toFixed(1)}" r="${(r * 0.12).toFixed(1)}" fill="${darker(fill, 0.3)}"/>`; }).join('')}
    <circle cx="${cx}" cy="${cy}" r="${r * 0.18}" fill="#FBF7EF" stroke="${INK}" stroke-width="1.6"/></g>`;
};

// ---------- room ----------
const VP = [800, 240];
const planks = () => {
  let s = '';
  for (let i = -6; i <= 20; i++) {
    const xb = i * 120 - 360, t = (620 - VP[1]) / (900 - VP[1]);
    s += `<path d="M${(VP[0] + (xb - VP[0]) * t).toFixed(1)} 620 L${xb} 900"/>`;
  }
  return s;
};
const trackY = 852;

const bg = ({ weather }) => svg(1600, 900, `
  <defs>
    <linearGradient id="ws-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D3DDEC"/><stop offset="1" stop-color="#C3D0E3"/></linearGradient>
    <pattern id="ws-boards" width="70" height="200" patternUnits="userSpaceOnUse"><rect width="70" height="200" fill="#C8A47E"/><rect x="2" width="66" height="200" fill="#D3B08A"/>
      <path d="M20 0 Q24 60 18 120 T22 200 M48 0 Q44 80 50 140 T46 200" stroke="#BC9670" stroke-width="1.4" fill="none" opacity=".6"/><circle cx="34" cy="90" r="4" fill="none" stroke="#B48C66" stroke-width="1.4"/></pattern>
    <linearGradient id="ws-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A88663"/><stop offset="1" stop-color="#CBA77F"/></linearGradient>
    <linearGradient id="ws-contact" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK}" stop-opacity=".3"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient>
    <radialGradient id="ws-halo"><stop offset="0" stop-color="#FFF3C2" stop-opacity=".6"/><stop offset="1" stop-color="#FFF3C2" stop-opacity="0"/></radialGradient>
    <linearGradient id="ws-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".5"/><stop offset="1" stop-color="#FFF4C8" stop-opacity="0"/></linearGradient>
    <pattern id="ws-peg" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#E2CDAA"/><circle cx="11" cy="11" r="2.4" fill="#B99B74"/></pattern>
    <linearGradient id="ws-rail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6EBF2"/><stop offset="1" stop-color="#A8B2C2"/></linearGradient>
  </defs>
  <rect width="1600" height="620" fill="url(#ws-wall)"/>
  <rect y="400" width="1600" height="220" fill="url(#ws-boards)"/>
  <rect y="390" width="1600" height="14" fill="#E9DCC4" stroke="#B99B74" stroke-width="2"/>
  <path d="M0 0 H1600 V26 H0 Z" fill="#B99B74"/><path d="M0 26 H1600" stroke="#8E6E4E" stroke-width="3"/>
  ${[240, 800, 1360].map((x) => `<rect x="${x - 18}" y="0" width="36" height="40" fill="#A6865F" stroke="${INK}" stroke-width="2"/>`).join('')}
  <path d="M0 40 Q200 70 400 44 Q600 74 800 46 Q1000 74 1200 44 Q1400 72 1600 42" fill="none" stroke="${INK}" stroke-width="2"/>
  ${Array.from({ length: 22 }, (_, i) => { const x = 40 + i * 72, y = 46 + Math.abs(Math.sin(i * 0.78)) * 22; return `<path d="M${x - 9} ${y} L${x} ${y + 22} L${x + 9} ${y} Z" fill="${['#C9B8F2', '#9EDDD4', '#F5DE7A', '#AFD6F7'][i % 4]}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`; }).join('')}
  <ellipse cx="1010" cy="210" rx="230" ry="170" fill="url(#ws-halo)" opacity="${weather === 'snow' ? 0.55 : 1}"/>
  ${winterWindow(890, 110, 240, 200, weather, '#9EDDD4')}
  <rect x="1300" y="276" width="280" height="140" rx="6" fill="url(#ws-peg)" stroke="#A6865F" stroke-width="4"/>
  <g stroke="${INK}" stroke-width="2" stroke-linejoin="round">
    <path d="M1326 300 h40 l6 8 -6 8 h-40 z" fill="#AEB8C8"/><rect x="1328" y="316" width="10" height="60" rx="3" fill="#C99772"/>
    <path d="M1396 296 l14 0 0 80 -14 0 z" fill="#D9B36A"/><path d="M1398 300 h10 M1398 312 h10 M1398 324 h10 M1398 336 h10" stroke="#fff" stroke-width="1.5" opacity=".6"/>
    <path d="M1440 292 h44 v20 l-30 46 h-14 z" fill="#C9D2DE"/><rect x="1446" y="292" width="34" height="20" rx="4" fill="#9EDDD4"/>
    <circle cx="1530" cy="320" r="18" fill="none" stroke="#C99772" stroke-width="5"/><path d="M1530 338 V388" stroke="#7A64B0" stroke-width="6" stroke-linecap="round"/>
  </g>
  <rect y="620" width="1600" height="280" fill="url(#ws-floor)"/>
  <g stroke="#8E6E4E" stroke-width="2" opacity=".45" fill="none">${planks()}</g>
  <path d="M900 622 L1120 622 L1250 880 L760 880 Z" fill="url(#ws-beam)" opacity="${weather === 'snow' ? 0.4 : 0.8}"/>
  <rect y="606" width="1600" height="16" fill="#8E6E4E"/><path d="M0 608 H1600" stroke="#B99B74" stroke-width="2"/>
  <rect y="622" width="1600" height="44" fill="url(#ws-contact)"/>
  <g>${Array.from({ length: 36 }, (_, i) => `<path d="M${50 + i * 32} ${trackY - 6} L${44 + i * 32} ${trackY + 18}" stroke="#8B6450" stroke-width="9" stroke-linecap="round"/>`).join('')}
    <path d="M30 ${trackY - 2} H1200" stroke="url(#ws-rail)" stroke-width="6"/><path d="M26 ${trackY + 12} H1196" stroke="url(#ws-rail)" stroke-width="7"/>
    <path d="M30 ${trackY - 2} H1200 M26 ${trackY + 12} H1196" stroke="${INK}" stroke-width="1" opacity=".35"/>
    <rect x="1196" y="${trackY - 22}" width="20" height="40" rx="4" fill="#C9B8F2" stroke="${INK}" stroke-width="2"/></g>`);

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

// A toy item. `spec` = { w, h, art, text, name }; spec.art is the svg body string.
function toy(api, spec, x, y) {
  return api.add({
    id: api.uid('toy'), x, y, w: spec.w, h: spec.h, cls: 'food', data: { spec },
    art: () => svg(spec.w, spec.h, spec.art),
    onGive: (i, a, who) => { a.remove(i); a.sfx.win(); a.react(who, spec.text, ['🎁', '✨', '💜']); },
    onDrop: (i, a) => {
      const w = a.get('wrap');
      if (!w || !a.inside(a.center(i), w, 10)) return;
      a.remove(i);
      a.sfx.wear();
      const n = a.count('gift');
      const g = present(a, spec, w.x + 70 + (n % 3) * 70, w.y - 36 - Math.floor(n / 3) * 20);
      a.sparkle(g.x + 40, g.y + 30, ['🎁', '✨', '🎀']);
      a.bubble(w.x + 150, w.y - 40, 'All wrapped up! Give it to a friend 🎁');
    },
  }, { spawned: true });
}
const PAPERS = [['#C9B8F2', '#F5DE7A'], ['#9EDDD4', '#FBF7EF'], ['#AFD6F7', '#B79CF0'], ['#F5DE7A', '#3CC7B8']];
function present(api, spec, x, y) {
  const [paper, ribbon] = pick(PAPERS);
  return api.add({
    id: api.uid('gift'), x, y, w: 84, h: 80, cls: 'food',
    onGive: (i, a, who) => { a.remove(i); a.sfx.win(); a.react(who, `A present for me?! It's ${spec.name}! 🎁`, ['🎁', '💜', '✨']); },
    onTap: (i, a) => { const tx = i.x, ty = i.y; a.remove(i); a.sfx.pop(); toy(a, spec, tx, ty); a.sparkle(tx + 40, ty + 30, ['🎀', '✨']); a.bubble(tx + 40, ty - 10, `Unwrapped: ${spec.name}!`); },
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
      const it = toy(api, spec, bench.x + 40 + (api.count('toy') % 3) * 60, bench.y - 90);
      api.sparkle(it.x + 50, it.y + 50, ['🤖', '✨', '⚙️']);
      api.bubble(it.x + 50, it.y - 10, 'Your robot is ready! 🤖');
      if (!api.starFound('workshop-robot')) api.addStar('workshop-robot', bench.x + 200, bench.y - 170, { spawned: true });
    };
    refresh();
  });
}

// ---------- the toy machine (with conveyor belt) ----------
const machineArt = () => svg(800, 500, `
  <defs>
    <linearGradient id="ws-body" x1="0" x2="1"><stop offset="0" stop-color="#4E968F"/><stop offset=".25" stop-color="#8FD3CA"/><stop offset=".65" stop-color="#6DB8AF"/><stop offset="1" stop-color="#4A8C86"/></linearGradient>
    <linearGradient id="ws-brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3D99C"/><stop offset="1" stop-color="#C39A52"/></linearGradient>
    <linearGradient id="ws-copper" x1="0" x2="1"><stop offset="0" stop-color="#B9774E"/><stop offset=".4" stop-color="#E7B08A"/><stop offset="1" stop-color="#A8683F"/></linearGradient>
    <linearGradient id="ws-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF2F7"/><stop offset="1" stop-color="#A9B4C4"/></linearGradient>
    <linearGradient id="ws-beltg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A5470"/><stop offset="1" stop-color="#3A3550"/></linearGradient>
    <clipPath id="ws-beltclip"><rect x="300" y="390" width="470" height="22"/></clipPath>
  </defs>
  ${shadow(400, 492, 390, 12, 0.2)}
  <g class="wx-chimney-puff">${[0, 1, 2].map((k) => `<circle class="smoke" style="animation-duration:1.4s;animation-delay:-${k * 0.45}s" cx="${236 + k * 8}" cy="${-6 - k * 18}" r="${10 + k * 4}" fill="#fff" opacity=".85"/>`).join('')}</g>
  <rect x="220" y="0" width="36" height="70" fill="url(#ws-copper)" stroke="${INK}" stroke-width="2.2"/><rect x="212" y="-6" width="52" height="14" rx="5" fill="url(#ws-copper)" stroke="${INK}" stroke-width="2.2"/>
  <path d="M40 30 H170 L150 90 H60 Z" fill="url(#ws-steel)" stroke="${INK}" stroke-width="2.4"/>
  <g transform="translate(70 4)">
    <rect x="0" y="10" width="22" height="22" rx="4" fill="#C9B8F2" stroke="${INK}" stroke-width="1.8" transform="rotate(-12 11 21)"/>
    <circle cx="44" cy="18" r="12" fill="#F5DE7A" stroke="${INK}" stroke-width="1.8"/><rect x="62" y="6" width="18" height="26" rx="4" fill="#AFD6F7" stroke="${INK}" stroke-width="1.8" transform="rotate(14 71 19)"/></g>
  <rect x="20" y="86" width="290" height="380" rx="26" fill="url(#ws-body)" stroke="${INK}" stroke-width="2.6"/>
  <path d="M38 110 V440" stroke="#fff" stroke-width="7" opacity=".22" stroke-linecap="round"/>
  ${[110, 446].map((y) => Array.from({ length: 9 }, (_, i) => `<circle cx="${50 + i * 30}" cy="${y}" r="3.4" fill="url(#ws-brass)" stroke="${INK}" stroke-width="1"/>`).join('')).join('')}
  <circle cx="110" cy="200" r="66" fill="#3A5E62" stroke="${INK}" stroke-width="2.4"/><circle cx="110" cy="200" r="58" fill="#2E4A50"/>
  ${gear(92, 186, 38, 12, '#E9C77E')}${gear(144, 230, 26, 9, '#C9B8F2', 'ccw')}${gear(140, 160, 16, 7, '#9EDDD4', 'ccw')}
  <circle cx="110" cy="200" r="58" fill="none" stroke="url(#ws-brass)" stroke-width="7"/><path d="M70 160 Q90 146 116 146" stroke="#fff" stroke-width="4" opacity=".25" fill="none" stroke-linecap="round"/>
  <circle cx="240" cy="170" r="30" fill="#FBF7EF" stroke="${INK}" stroke-width="2.4"/><circle cx="240" cy="170" r="30" fill="none" stroke="url(#ws-brass)" stroke-width="5"/>
  <path d="M220 182 A24 24 0 0 1 260 182" fill="none" stroke="#9EDDD4" stroke-width="5"/><path d="M240 170 L254 154" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="240" cy="170" r="3.5" fill="${INK}"/>
  ${[210, 240, 270].map((x, i) => `<circle class="wx-lamp" style="animation-delay:-${i * 0.12}s" cx="${x}" cy="226" r="7" fill="${['#F5DE7A', '#9EDDD4', '#C9B8F2'][i]}" stroke="${INK}" stroke-width="1.6"/>`).join('')}
  <rect x="60" y="296" width="210" height="60" rx="12" fill="#4A8C86" stroke="${INK}" stroke-width="2"/>${text(165, 334, 'TOY MAKER', 22, '#FBF7EF')}
  <path d="M290 330 h22 V396 h-22 Z" fill="#3A3550" stroke="${INK}" stroke-width="2.2"/>
  <path d="M0 250 Q-20 250 -20 270 V330" stroke="url(#ws-copper)" stroke-width="12" fill="none"/><path d="M0 250 Q-20 250 -20 270 V330" stroke="${INK}" stroke-width="1.5" fill="none" opacity=".4"/>
  <g transform="translate(296 250)"><rect x="-6" y="-8" width="16" height="44" rx="6" fill="url(#ws-steel)" stroke="${INK}" stroke-width="2"/><path d="M2 0 L30 -40" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M2 0 L30 -40" stroke="#AEB8C8" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="-43" r="11" fill="#B79CF0" stroke="${INK}" stroke-width="2"/></g>
  <rect x="290" y="382" width="490" height="38" rx="19" fill="url(#ws-steel)" stroke="${INK}" stroke-width="2.4"/>
  <rect x="300" y="390" width="470" height="22" fill="url(#ws-beltg)"/>
  <g clip-path="url(#ws-beltclip)"><g class="belt">${Array.from({ length: 22 }, (_, i) => `<rect x="${300 + i * 26}" y="390" width="12" height="22" fill="#6E6888"/>`).join('')}</g></g>
  ${[310, 760].map((x) => `<circle cx="${x}" cy="401" r="15" fill="url(#ws-steel)" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="401" r="4" fill="${INK}"/>`).join('')}
  ${[360, 560, 740].map((x) => `<path d="M${x} 420 L${x - 14} 488 M${x} 420 L${x + 14} 488" stroke="#6E7FA0" stroke-width="7" stroke-linecap="round"/>`).join('')}
  <path d="M340 452 H760" stroke="#6E7FA0" stroke-width="5"/>
  ${tag(165, 270, 'Tap to make a toy', 190)}`);

export const WORKSHOP = {
  id: 'workshop', title: 'Toy Workshop 🎁', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, avatar: [360, 474],
  frame: 'linear-gradient(#C8D4E6 69%, #B4916C 69%)',
  bg,
  init: (api) => { api.get('train')?.el.style.setProperty('--run', '900px'); },
  stars: [{ id: 'workshop-crate', x: 92, y: 748 }],
  characters: [{
    id: 'toymaker', s: 0.97, x: 1120, y: 462,
    look: { ...NPC_WINTER.grandpa, hair: '#E8E4F2', topColor: '#3CC7B8', neckColor: '#F5DE7A', bottomColor: '#4D5C9A', hat: 'beanie', shoesColor: '#8B6450' },
    say: ["Hello! I'm Otto, the toymaker 🛠️", 'Tap my machine — what toy will roll out?', 'Wrap a toy on the table, then give it away 🎁', 'Build your own robot at the workbench! 🤖'],
  }],
  items: [
    { id: 'shelf', x: 1300, y: 64, w: 280, h: 190, drag: false, data: { n: 0 },
      onTap: (it, api) => { it.data.n++; bump(it, 'shake'); api.sfx.click(); api.sparkle(it.x + 140, it.y + 90, ['✨', '🧸', '🪀']); api.bubble(it.x + 140, it.y - 6, ['A wooden sailboat! ⛵', 'Stacking blocks! 🧱', 'A spinning top!', 'A tiny teddy family 🧸'][it.data.n % 4]); },
      art: () => svg(280, 190, `<defs><linearGradient id="ws-shelfwood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6AC82"/><stop offset="1" stop-color="#A57B55"/></linearGradient></defs>
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
          <path d="M184 172 L196 120 H232 L244 172 Z" fill="#AFD6F7"/><path d="M196 120 Q214 106 232 120" fill="none"/><circle cx="214" cy="146" r="8" fill="#FBF7EF"/></g>
        <path d="M14 14 V176" stroke="#fff" stroke-width="3" opacity=".3"/>`) },
    { id: 'machine', x: 30, y: 150, w: 800, h: 500, drag: false, data: { busy: false, n: 0 },
      onTap: (it, api) => {
        if (it.data.busy) return;
        if (api.count('toy') >= 6) { api.bubble(it.x + 165, it.y + 60, 'So many toys! Give some away first 🎁'); return; }
        it.data.busy = true;
        it.el.classList.add('wx-run', 'running'); api.sfx.click(); api.bubble(it.x + 165, it.y + 60, 'Whirr… clank… ⚙️');
        api.later(() => {
          let kind = pick(TOY_KINDS);
          if (kind === it.data.last) kind = TOY_KINDS[(TOY_KINDS.indexOf(kind) + 1) % TOY_KINDS.length];
          it.data.last = kind;
          const spec = TOYS[kind];
          const t = toy(api, spec, it.x + 640 - (it.data.n++ % 2) * 100 - spec.w / 2, it.y + 384 - spec.h);
          t.el.style.setProperty('--from', '-300px');
          t.el.classList.add('wx-rollout');
          api.later(() => { it.el.classList.remove('wx-run', 'running'); it.data.busy = false; api.bubble(t.x + spec.w / 2, t.y - 10, `Out comes ${spec.name}!`); }, 1000);
        }, 900);
      },
      art: machineArt },
    { id: 'wrap', x: 860, y: 468, w: 250, h: 230, drag: false,
      onTap: (it, api) => api.bubble(it.x + 125, it.y - 30, 'Drop a toy here to wrap it! 🎁'),
      art: () => svg(250, 230, `<defs><linearGradient id="ws-wraptop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4EFFB"/><stop offset="1" stop-color="#E0D8EE"/></linearGradient>
          <linearGradient id="ws-roll" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2D7FA"/><stop offset=".45" stop-color="#C9B8F2"/><stop offset="1" stop-color="#9F8ACF"/></linearGradient></defs>
        ${shadow(125, 222, 120, 9, 0.18)}
        <path d="M20 40 H230 L246 84 H4 Z" fill="url(#ws-wraptop)" stroke="${INK}" stroke-width="2.4"/>
        <path d="M60 52 L190 50 L198 78 L52 80 Z" fill="#9EDDD4" opacity=".8"/><g fill="#fff" opacity=".8">${[[80, 64], [110, 60], [140, 70], [170, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4"/>`).join('')}</g>
        <rect x="4" y="84" width="242" height="14" rx="3" fill="#C9A57C" stroke="${INK}" stroke-width="2.2"/>
        <path d="M18 98 V214 M232 98 V214" stroke="#8E6E4E" stroke-width="10" stroke-linecap="round"/><path d="M18 170 H232" stroke="#8E6E4E" stroke-width="6"/>
        <rect x="30" y="140" width="190" height="26" rx="13" fill="url(#ws-roll)" stroke="${INK}" stroke-width="2"/><ellipse cx="30" cy="153" rx="6" ry="13" fill="#E9E2FA" stroke="${INK}" stroke-width="2"/>
        <g fill="#fff" opacity=".7">${[60, 100, 140, 180].map((x) => `<circle cx="${x}" cy="150" r="2.4"/>`).join('')}</g>
        <circle cx="200" cy="34" r="16" fill="#F5DE7A" stroke="${INK}" stroke-width="2"/><circle cx="200" cy="34" r="6" fill="#FBF7EF" stroke="${INK}" stroke-width="1.6"/>
        <path d="M188 46 Q170 60 150 56" stroke="#F5DE7A" stroke-width="4" fill="none" stroke-linecap="round"/>
        <g transform="translate(40 30) rotate(-20)"><circle cx="0" cy="0" r="6" fill="none" stroke="#7A64B0" stroke-width="3"/><circle cx="12" cy="0" r="6" fill="none" stroke="#7A64B0" stroke-width="3"/><path d="M4 -4 L30 -18 M8 -4 L30 4" stroke="#AEB8C8" stroke-width="3" stroke-linecap="round"/></g>
        ${tag(125, 120, 'Drop a toy to wrap 🎁', 220)}`) },
    { id: 'bench', x: 1290, y: 430, w: 300, h: 260, drag: false,
      onTap: (it, api) => robotGame(api, it),
      art: () => svg(300, 260, `<defs><linearGradient id="ws-benchtop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2BF96"/><stop offset="1" stop-color="#C49A70"/></linearGradient>
          <linearGradient id="ws-benchleg" x1="0" x2="1"><stop offset="0" stop-color="#8E6E4E"/><stop offset=".4" stop-color="#B99B74"/><stop offset="1" stop-color="#7E5F42"/></linearGradient></defs>
        ${shadow(150, 252, 146, 9, 0.18)}
        <path d="M14 40 H286 L298 80 H2 Z" fill="url(#ws-benchtop)" stroke="${INK}" stroke-width="2.4"/>
        <path d="M30 56 Q90 50 150 58 T280 54 M20 70 Q80 64 160 72" stroke="#B48C66" stroke-width="1.4" fill="none" opacity=".7"/>
        <rect x="2" y="80" width="296" height="18" rx="3" fill="#B48C66" stroke="${INK}" stroke-width="2.2"/>
        <rect x="16" y="98" width="20" height="150" fill="url(#ws-benchleg)" stroke="${INK}" stroke-width="2"/><rect x="264" y="98" width="20" height="150" fill="url(#ws-benchleg)" stroke="${INK}" stroke-width="2"/>
        <rect x="36" y="196" width="228" height="12" fill="#A6865F" stroke="${INK}" stroke-width="2"/>
        <rect x="200" y="156" width="56" height="40" rx="4" fill="#C9B8F2" stroke="${INK}" stroke-width="2"/><rect x="214" y="150" width="28" height="10" rx="3" fill="#9F8ACF" stroke="${INK}" stroke-width="1.6"/>
        <rect x="60" y="164" width="40" height="32" rx="4" fill="#9EDDD4" stroke="${INK}" stroke-width="2"/>
        <g transform="translate(24 10)"><rect x="0" y="14" width="44" height="22" rx="4" fill="#6E7FA0" stroke="${INK}" stroke-width="2"/><rect x="40" y="18" width="20" height="14" rx="3" fill="#AEB8C8" stroke="${INK}" stroke-width="2"/><path d="M14 14 V2 H30 V14" fill="none" stroke="${INK}" stroke-width="2"/></g>
        ${gear(150, 50, 12, 8, '#E9C77E')}${gear(176, 60, 9, 7, '#AEB8C8')}
        <g fill="#E8C9A0">${[[210, 64], [226, 58], [240, 68], [254, 60]].map(([x, y]) => `<path d="M${x} ${y} q6 -6 10 0 q-4 6 -10 0 z"/>`).join('')}</g>
        ${tag(150, 128, 'Build a robot 🤖', 180)}`) },
    { id: 'lamp', x: 1490, y: 326, w: 90, h: 150, drag: false, data: { on: true },
      onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); },
      art: (it) => svg(90, 150, `<defs><radialGradient id="ws-lampglow" cx=".3" cy=".9" r=".7"><stop offset="0" stop-color="#FFE9A6" stop-opacity=".7"/><stop offset="1" stop-color="#FFE9A6" stop-opacity="0"/></radialGradient></defs>
        ${it.data.on ? '<path d="M14 58 L-120 160 L60 160 Z" fill="url(#ws-lampglow)"/>' : ''}
        <ellipse cx="60" cy="146" rx="24" ry="6" fill="#3E9C94" stroke="${INK}" stroke-width="2"/>
        <path d="M60 144 L44 96 L66 56" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M60 144 L44 96 L66 56" stroke="#7FD3CB" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="44" cy="96" r="5" fill="#E9C77E" stroke="${INK}" stroke-width="1.6"/>
        <path d="M66 56 L48 30 L14 54 L28 72 Z" fill="#3CC7B8" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <ellipse cx="21" cy="63" rx="10" ry="6" fill="${it.data.on ? '#FFF6D2' : '#DCD6E6'}" stroke="${INK}" stroke-width="1.6" transform="rotate(-36 21 63)"/>`) },
    { id: 'musicbox', x: 1330, y: 390, w: 90, h: 84,
      onTap: (it, api) => { it.el.classList.add('playing'); api.sfx.star(); api.bubble(it.x + 45, it.y - 6, '♪ Tinkle-tinkle… ♫'); api.later(() => it.el.classList.remove('playing'), 2400); },
      art: () => svg(90, 84, `${shadow(45, 80, 38, 4)}<g class="notes"><text x="58" y="6" font-size="20" fill="#7A64B0">♪</text><text x="20" y="0" font-size="18" fill="#3E8F88">♫</text></g>
        <rect x="8" y="34" width="74" height="44" rx="6" fill="#B79CF0" stroke="${INK}" stroke-width="2"/><path d="M8 50 H82" stroke="#F5DE7A" stroke-width="3"/>
        <path d="M6 34 L14 18 H76 L84 34 Z" fill="#C9B8F2" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><circle cx="45" cy="64" r="6" fill="#F5DE7A" stroke="${INK}" stroke-width="1.6"/>
        <path d="M82 56 h6 M88 50 v12" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M14 40 V72" stroke="#fff" stroke-width="3" opacity=".35"/>`) },
    { id: 'hammer', x: 1420, y: 462, w: 120, h: 50,
      onTap: (it, api) => { bump(it, 'punch'); api.sfx.click(); api.later(() => api.sfx.click(), 180); api.bubble(it.x + 60, it.y - 10, 'Tap tap tap! 🔨'); },
      art: () => svg(120, 50, `${shadow(60, 46, 50, 3)}<rect x="10" y="20" width="84" height="12" rx="6" fill="#C99772" stroke="${INK}" stroke-width="2"/><path d="M16 23 H86" stroke="#fff" stroke-width="2" opacity=".4"/>
        <path d="M90 6 H112 Q116 6 116 12 V40 Q116 46 112 46 H90 Z" fill="url(#ws-steel)" stroke="${INK}" stroke-width="2"/><path d="M90 14 L80 10 V42 L90 38" fill="#AEB8C8" stroke="${INK}" stroke-width="2"/>`) },
    { id: 'train', x: 80, y: trackY - 70, w: 200, h: 84, drag: false, cls: 'wx-train',
      onTap: (it, api) => {
        bump(it, 'wx-toot'); api.sfx.boing();
        let dx = 0;
        try { dx = new DOMMatrixReadOnly(getComputedStyle(it.el).transform).m41 || 0; } catch (e) { dx = 0; }
        api.bubble(it.x + dx + 100, it.y - 30, pick(['Toot toot! 🚂', 'Choo choo! 🚂', 'All aboard! 🎶']));
      },
      art: () => svg(200, 84, `<defs><linearGradient id="ws-loco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9B8F2"/><stop offset="1" stop-color="#8F7BC4"/></linearGradient>
          <linearGradient id="ws-car" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9EDDD4"/><stop offset="1" stop-color="#5FA7A0"/></linearGradient></defs>
        <g class="wx-toot-puff"><circle cx="172" cy="-4" r="12" fill="#fff" opacity=".9"/><circle cx="160" cy="-16" r="9" fill="#fff" opacity=".8"/><circle cx="182" cy="-20" r="7" fill="#fff" opacity=".7"/></g>
        <rect x="6" y="34" width="70" height="34" rx="6" fill="url(#ws-car)" stroke="${INK}" stroke-width="2"/><g fill="#F5DE7A" stroke="${INK}" stroke-width="1.6"><rect x="16" y="22" width="16" height="14" rx="3"/><rect x="38" y="20" width="16" height="16" rx="3" fill="#C9B8F2"/><circle cx="64" cy="28" r="7" fill="#AFD6F7"/></g>
        <path d="M76 56 H92" stroke="${INK}" stroke-width="3"/>
        <rect x="92" y="38" width="62" height="30" rx="6" fill="url(#ws-loco)" stroke="${INK}" stroke-width="2"/>
        <rect x="140" y="12" width="46" height="56" rx="6" fill="url(#ws-loco)" stroke="${INK}" stroke-width="2"/><rect x="148" y="20" width="30" height="18" rx="4" fill="#FFF3C2" stroke="${INK}" stroke-width="1.6"/>
        <rect x="136" y="6" width="54" height="10" rx="4" fill="#7A64B0" stroke="${INK}" stroke-width="1.8"/>
        <path d="M104 38 V18 H120 V38" fill="#4D5C9A" stroke="${INK}" stroke-width="2"/><rect x="100" y="12" width="24" height="8" rx="3" fill="#4D5C9A" stroke="${INK}" stroke-width="1.8"/>
        <path d="M186 60 L198 70 H186 Z" fill="#F5DE7A" stroke="${INK}" stroke-width="1.6"/><path d="M98 46 H150" stroke="#fff" stroke-width="2.5" opacity=".4"/>
        ${[22, 58, 110, 136, 168].map((x) => `<circle cx="${x}" cy="72" r="${x > 100 ? 11 : 9}" fill="#4D5C9A" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="72" r="3.5" fill="#F5DE7A"/>`).join('')}`) },
    { id: 'crate', x: 40, y: 690, w: 170, h: 150,
      onTap: (it, api) => { bump(it, 'shake'); api.sfx.drop(); api.bubble(it.x + 85, it.y - 10, 'Rattle rattle… toy parts! ⚙️'); },
      art: () => svg(170, 150, `<defs><linearGradient id="ws-crate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDB78C"/><stop offset="1" stop-color="#B48C66"/></linearGradient></defs>
        ${shadow(85, 146, 80, 6, 0.18)}
        <g transform="translate(30 0)"><circle cx="20" cy="22" r="12" fill="#F5DE7A" stroke="${INK}" stroke-width="1.8"/><rect x="44" y="6" width="22" height="26" rx="4" fill="#C9B8F2" stroke="${INK}" stroke-width="1.8" transform="rotate(12 55 19)"/>${gear(92, 20, 14, 8, '#AEB8C8')}</g>
        <rect x="6" y="24" width="158" height="120" rx="6" fill="url(#ws-crate)" stroke="${INK}" stroke-width="2.2"/>
        <path d="M6 64 H164 M6 104 H164" stroke="#9E7A56" stroke-width="3"/><path d="M12 30 L158 138 M158 30 L12 138" stroke="#A6865F" stroke-width="5" opacity=".7"/>
        <path d="M10 28 H160" stroke="#fff" stroke-width="2.5" opacity=".35"/>${text(85, 92, 'PARTS', 20, '#FBF7EF')}`) },
    { id: 'blocks', x: 560, y: 704, w: 110, h: 104, data: { up: true },
      onTap: (it, api) => { it.data.up = !it.data.up; api.setArt(it); api.sfx.drop(); api.bubble(it.x + 55, it.y - 10, it.data.up ? 'Stacked up high! 🧱' : 'Crash! Tap to stack again'); },
      art: (it) => {
        const b = (x, y, c, l, r = 0) => `<g transform="rotate(${r} ${x + 18} ${y + 18})"><rect x="${x}" y="${y}" width="36" height="36" rx="5" fill="${c}" stroke="${INK}" stroke-width="2"/>${text(x + 18, y + 26, l, 20, '#FBF7EF')}</g>`;
        return svg(110, 104, `${shadow(55, 100, 50, 4)}${it.data.up
          ? b(16, 64, '#7FC4BC', 'A') + b(54, 64, '#B79CF0', 'B') + b(36, 28, '#E2C26A', 'C') + `<path d="M40 -6 L60 -6 L70 26 H30 Z" fill="#AFD6F7" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`
          : b(4, 64, '#7FC4BC', 'A', -12) + b(40, 66, '#B79CF0', 'B', 8) + b(74, 64, '#E2C26A', 'C', 20) + `<path d="M30 92 L50 72 L74 92 Z" fill="#AFD6F7" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`}`);
      } },
    { id: 'top', x: 820, y: 716, w: 70, h: 84,
      onTap: (it, api) => { bump(it, 'wx-whirl'); api.sfx.pick(); api.bubble(it.x + 35, it.y - 10, 'Wheee… spin spin! 🌀'); },
      art: () => svg(70, 84, `<defs><linearGradient id="ws-topg" x1="0" x2="1"><stop offset="0" stop-color="#5FA7A0"/><stop offset=".35" stop-color="#A9E2D8"/><stop offset="1" stop-color="#4E968F"/></linearGradient></defs>
        ${shadow(35, 80, 18, 3)}<path d="M35 2 V18" stroke="#C99772" stroke-width="6" stroke-linecap="round"/>
        <path d="M6 40 Q6 18 35 18 Q64 18 64 40 Q60 58 35 78 Q10 58 6 40 Z" fill="url(#ws-topg)" stroke="${INK}" stroke-width="2"/>
        <path d="M8 38 Q35 50 62 38" stroke="#F5DE7A" stroke-width="5" fill="none"/><path d="M14 52 Q35 60 56 52" stroke="#C9B8F2" stroke-width="4" fill="none"/>
        <path d="M14 30 Q22 22 34 22" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/>`) },
    { id: 'jack', x: 960, y: 700, w: 92, h: 110, data: { open: false },
      onTap: (it, api) => {
        it.data.open = !it.data.open; api.setArt(it);
        if (it.data.open) { bump(it, 'boing'); api.sfx.boing(); api.bubble(it.x + 46, it.y - 40, 'Boing! Surprise! 🎉'); } else { api.sfx.click(); api.bubble(it.x + 46, it.y - 10, 'Back in the box… click!'); }
      },
      art: (it) => svg(92, 110, `${shadow(46, 106, 40, 4)}
        ${it.data.open ? `<path d="M46 62 q-14 -6 0 -12 q14 -6 0 -12 q-14 -6 0 -12 q14 -6 0 -12" stroke="#AEB8C8" stroke-width="4" fill="none"/>
          <circle cx="46" cy="0" r="16" fill="#F5DE7A" stroke="${INK}" stroke-width="2"/><path d="M30 -6 L20 -22 L36 -14 L46 -30 L56 -14 L72 -22 L62 -6 Z" fill="#B79CF0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="20" cy="-22" r="4" fill="#9EDDD4" stroke="${INK}" stroke-width="1.4"/><circle cx="72" cy="-22" r="4" fill="#9EDDD4" stroke="${INK}" stroke-width="1.4"/><circle cx="46" cy="-30" r="4" fill="#9EDDD4" stroke="${INK}" stroke-width="1.4"/>
          <path d="M4 50 L-4 22 L48 36 L50 52 Z" fill="#9EDDD4" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>` : `<path d="M2 50 H90 L84 36 H8 Z" fill="#7FC4BC" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`}
        <rect x="8" y="50" width="76" height="56" rx="5" fill="#9EDDD4" stroke="${INK}" stroke-width="2"/>${starPath(46, 78, 13, '#F5DE7A', `stroke="${INK}" stroke-width="1.6"`)}
        <path d="M84 70 h6 v-10" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M14 56 V100" stroke="#fff" stroke-width="3" opacity=".35"/>`) },
    { id: 'horse', x: 1400, y: 694, w: 180, h: 160,
      onTap: (it, api) => { bump(it, 'wx-rock'); api.sfx.boing(); api.bubble(it.x + 90, it.y - 10, 'Giddy-up! 🐴'); },
      art: () => svg(180, 160, `<defs><linearGradient id="ws-horse" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4EFFB"/><stop offset="1" stop-color="#D8CFEA"/></linearGradient></defs>
        ${shadow(90, 154, 80, 6)}
        <path d="M6 136 Q90 168 174 136" stroke="#A6865F" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M6 136 Q90 168 174 136" stroke="#D6AC82" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M44 96 L32 140 M64 100 L58 146 M118 100 L122 146 M138 96 L150 140" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M44 96 L32 140 M64 100 L58 146 M118 100 L122 146 M138 96 L150 140" stroke="#E6DEF2" stroke-width="5" stroke-linecap="round"/>
        <path d="M30 70 Q30 52 54 50 H130 Q150 52 150 74 Q150 100 128 104 H52 Q30 100 30 70 Z" fill="url(#ws-horse)" stroke="${INK}" stroke-width="2"/>
        <path d="M150 70 Q170 74 172 94" stroke="#B79CF0" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M50 54 Q42 26 50 12 Q62 2 74 14 L80 50 Z" fill="url(#ws-horse)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M50 12 Q34 16 28 30 Q36 34 44 30" fill="url(#ws-horse)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M60 6 Q76 10 80 30 Q82 44 78 52" stroke="#B79CF0" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="46" cy="22" r="2.4" fill="${INK}"/>
        <path d="M84 50 Q96 62 108 50 V68 H84 Z" fill="#3CC7B8" stroke="${INK}" stroke-width="1.8"/><path d="M40 66 Q60 58 90 60" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/>`) },
    { id: 'paint', x: 1190, y: 776, w: 140, h: 80,
      onTap: (it, api) => { api.sfx.pour(); api.sparkle(it.x + 70, it.y + 10, ['🎨', '💜', '💙', '💛']); api.bubble(it.x + 70, it.y - 10, 'Splish! Paint for the toys 🎨'); },
      art: () => svg(140, 80, `${shadow(70, 76, 64, 4)}
        ${[[24, '#B79CF0'], [70, '#3CC7B8'], [116, '#F5DE7A']].map(([x, c]) => `<path d="M${x - 20} 30 V68 Q${x - 20} 76 ${x - 12} 76 H${x + 12} Q${x + 20} 76 ${x + 20} 68 V30 Z" fill="url(#ws-steel)" stroke="${INK}" stroke-width="2"/>
          <ellipse cx="${x}" cy="30" rx="20" ry="6" fill="${c}" stroke="${INK}" stroke-width="2"/><path d="M${x - 14} 32 Q${x - 16} 46 ${x - 12} 52" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>
          <rect x="${x - 14}" y="44" width="28" height="16" rx="3" fill="${c}" opacity=".85"/>`).join('')}
        <path d="M84 30 L104 -4" stroke="#C99772" stroke-width="5" stroke-linecap="round"/><path d="M104 -4 L110 -14" stroke="#7A64B0" stroke-width="7" stroke-linecap="round"/>`) },
  ],
};
