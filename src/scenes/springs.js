// Hot Springs (wide, 2400×900): soak in the steaming pool with a capybara and a snow monkey, steam in the sauna,
// grab a towel scarf, sip cocoa, ride along with the ski lift overhead, sled, throw snowballs, meet a fox.
import { INK, svg, text, food, wearable, NPC_WINTER } from './common.js';
import { CLIMATES } from '../ui.js';

const W = 2400;
const tag = (x, y, t, w = 180) => `<rect x="${x - w / 2}" y="${y - 19}" width="${w}" height="36" rx="18" fill="#FFFDF7" fill-opacity=".94" stroke="${INK}" stroke-width="2"/>${text(x, y + 7, t, 18, '#3E8F88')}`;
const shadow = (cx, cy, rx, ry = 10, op = 0.14) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${INK}" opacity="${op}"/>`;
const bump = (it, cls) => { it.el.classList.remove(cls); void it.el.offsetWidth; it.el.classList.add(cls); };
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// ---------- the pool ----------
const POOL = { cx: 1620, cy: 735, rx: 330, ry: 100 };
const inPool = (it) => {
  const x = it.x + it.w / 2, y = it.y + it.h * 0.92;
  return ((x - POOL.cx) / POOL.rx) ** 2 + ((y - POOL.cy) / POOL.ry) ** 2 < 1;
};
const rippleSvg = `<svg viewBox="0 0 200 60" width="200" height="60"><ellipse cx="100" cy="30" rx="90" ry="22" fill="none" stroke="#fff" stroke-width="4" opacity=".8"/><ellipse cx="100" cy="30" rx="56" ry="13" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/></svg>`;
const puffSvg = (tint = '#FFFFFF') => `<svg viewBox="0 0 120 90" width="120" height="90"><path d="M20 70 Q4 66 10 50 Q8 30 30 32 Q38 10 62 16 Q86 8 94 32 Q116 34 110 56 Q114 74 94 72 Z" fill="${tint}" opacity=".9"/></svg>`;

// ---------- scenery ----------
function spPine(x, y, s = 1, far = false) {
  const g = far ? 'url(#sp-pinefar)' : 'url(#sp-pine)';
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-7" y="150" width="14" height="30" fill="${far ? '#9AA6B8' : '#7E5F48'}"/>
    <path d="M0 0 L46 66 H24 L62 118 H32 L78 164 H-78 L-32 118 H-62 L-24 66 H-46 Z" fill="${g}"/>
    <path d="M0 0 L46 66 H24 L62 118 H32 L78 164 H0 Z" fill="#1E3A40" opacity="${far ? 0.06 : 0.14}"/>
    <path d="M0 0 L20 30 Q8 24 0 32 Q-8 24 -20 30 Z M-30 70 Q-10 80 0 70 Q14 82 30 70 L40 82 Q12 90 0 82 Q-16 90 -42 82 Z M-46 122 Q-20 134 0 122 Q20 136 48 122 L58 136 Q22 146 0 136 Q-24 146 -60 136 Z" fill="#FFFFFF" opacity="${far ? 0.85 : 0.95}"/>
    <path d="M0 32 Q8 24 20 30 L22 34 Q10 30 0 36 Z M0 82 Q12 90 40 82 L42 86 Q14 94 0 86 Z" fill="#C9D8EE" opacity=".8"/></g>`;
}
const cableY = (x, off = 0) => 130 + off + ((54 - 130) * (x + 40)) / 2340;
const chair = (i, down) => {
  const y0 = down ? 148 : 130;
  const seat = ['#C9B8F2', '#9EDDD4', '#F5DE7A', '#AFD6F7'][i % 4];
  const rider = !down && i % 3 === 1 ? `<path d="M-8 30 Q-8 14 0 12 Q8 14 8 30 Z" fill="#7A64B0"/><circle cx="0" cy="8" r="6" fill="#F3D2B8"/><path d="M-6 6 Q0 -2 6 6 Z" fill="#3CC7B8"/>` : '';
  return `<g class="wx-chair${down ? ' down' : ''}" style="animation-delay:-${i * 8}s"><g transform="translate(-40 ${y0})">
    <circle cx="0" cy="0" r="3" fill="${INK}"/><path d="M0 0 V26" stroke="${INK}" stroke-width="2"/>${rider}
    <path d="M-15 24 H15 M-15 24 V36 H15 V24" fill="none" stroke="${INK}" stroke-width="2"/><rect x="-16" y="30" width="32" height="7" rx="3" fill="${seat}" stroke="${INK}" stroke-width="1.6"/></g></g>`;
};

const bg = ({ weather }) => {
  const snow = weather === 'snow';
  const ridge = (pts, y0) => `M-20 ${y0} ` + pts.map(([x, y]) => `L${x} ${y}`).join(' ') + ` L${W + 20} ${y0} Z`;
  const far = [[120, 300], [320, 210], [480, 280], [700, 150], [900, 260], [1080, 190], [1300, 290], [1520, 170], [1760, 260], [1960, 140], [2180, 250], [2340, 200]];
  const caps = far.map(([x, y]) => `<path d="M${x} ${y} L${x + 40} ${y + 48} L${x + 18} ${y + 40} L${x} ${y + 56} L${x - 16} ${y + 38} L${x - 38} ${y + 50} Z" fill="#fff" opacity=".95"/>`).join('');
  return svg(W, 900, `
  <defs>
    <linearGradient id="sp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${snow ? '#AAB3CC' : '#93C7EE'}"/><stop offset="1" stop-color="${snow ? '#DFE3EE' : '#EAF4FD'}"/></linearGradient>
    <radialGradient id="sp-sun"><stop offset="0" stop-color="#FFFBE6"/><stop offset=".5" stop-color="#FFF3C0" stop-opacity=".5"/><stop offset="1" stop-color="#FFF3C0" stop-opacity="0"/></radialGradient>
    <linearGradient id="sp-mtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B7C1E2"/><stop offset="1" stop-color="#D8DEF0"/></linearGradient>
    <linearGradient id="sp-mtn2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2E8F6"/><stop offset="1" stop-color="#F0F4FB"/></linearGradient>
    <linearGradient id="sp-snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6F9FE"/><stop offset="1" stop-color="#E4EBF7"/></linearGradient>
    <linearGradient id="sp-pine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#76B096"/><stop offset="1" stop-color="#3F7A68"/></linearGradient>
    <linearGradient id="sp-pinefar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B3CEC9"/><stop offset="1" stop-color="#93B4B2"/></linearGradient>
  </defs>
  <rect width="${W}" height="900" fill="url(#sp-sky)"/>
  ${snow ? `<g fill="#EEF1F7" opacity=".9">${[[300, 90], [1100, 60], [1800, 110], [2250, 70]].map(([x, y]) => `<g class="drift" style="animation-duration:${70 + (x % 30)}s"><ellipse cx="${x}" cy="${y}" rx="120" ry="34"/><ellipse cx="${x + 70}" cy="${y - 18}" rx="70" ry="30"/><ellipse cx="${x - 60}" cy="${y - 8}" rx="60" ry="24"/></g>`).join('')}</g>`
    : `<circle cx="1930" cy="150" r="170" fill="url(#sp-sun)"/><circle cx="1930" cy="150" r="52" fill="#FFF6D2"/>
       <g fill="#fff" opacity=".85">${[[420, 120], [1240, 80]].map(([x, y]) => `<g class="drift" style="animation-duration:90s"><ellipse cx="${x}" cy="${y}" rx="90" ry="22"/><ellipse cx="${x + 50}" cy="${y - 12}" rx="50" ry="20"/></g>`).join('')}</g>`}
  <path d="${ridge(far, 560)}" fill="url(#sp-mtn)"/>${caps}
  <path d="${ridge([[200, 420], [520, 360], [860, 430], [1180, 350], [1500, 440], [1820, 380], [2120, 430], [2380, 370]], 600)}" fill="url(#sp-mtn2)"/>
  <g>${[140, 210, 290, 360, 2050, 2120, 2200, 2280, 2350, 980, 1050, 1140].map((x, i) => spPine(x, 330 + (i % 3) * 18, 0.42 + (i % 2) * 0.08, true)).join('')}</g>
  <path d="M-40 ${cableY(-40)} L2300 ${cableY(2300)} M-40 ${cableY(-40, 18)} L2300 ${cableY(2300, 18)}" stroke="${INK}" stroke-width="2" fill="none"/>
  ${[260, 900, 1540].map((x) => { const y = cableY(x); return `<path d="M${x - 12} 520 L${x} ${y + 4} L${x + 12} 520" fill="none" stroke="#7E8AA6" stroke-width="7" stroke-linejoin="round"/>
    <path d="M${x - 26} ${y - 2} H${x + 26}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="${x - 20}" cy="${y}" r="4" fill="#AEB8C8" stroke="${INK}" stroke-width="1.4"/><circle cx="${x + 20}" cy="${y + 18}" r="4" fill="#AEB8C8" stroke="${INK}" stroke-width="1.4"/>`; }).join('')}
  ${Array.from({ length: 8 }, (_, i) => chair(i, false) + chair(i, true)).join('')}
  <path d="M-20 560 Q300 520 700 548 T1500 540 T2420 536 V900 H-20 Z" fill="url(#sp-snow)"/>
  <g>${[[30, 380, 0.9], [120, 410, 0.75], [470, 400, 0.7], [560, 420, 0.6], [1180, 420, 0.6], [2000, 400, 0.75], [2120, 380, 0.95], [2250, 410, 0.8], [2360, 390, 0.9]].map(([x, y, s]) => spPine(x, y, s)).join('')}</g>
  <path d="M-20 600 Q400 580 800 600 T1600 596 T2420 590" fill="none" stroke="#FFFFFF" stroke-width="16" opacity=".8"/>
  <path d="M200 770 Q500 730 760 760 T1200 760 M1980 770 Q2160 740 2420 760" fill="none" stroke="#DCE5F3" stroke-width="40" stroke-linecap="round" opacity=".7"/>
  <g fill="#D7E1F1" opacity=".8">${Array.from({ length: 36 }, (_, i) => `<ellipse cx="${(i * 197) % W}" cy="${610 + ((i * 89) % 270)}" rx="${18 + (i % 3) * 10}" ry="5"/>`).join('')}</g>
  <g fill="#fff">${Array.from({ length: 40 }, (_, i) => `<circle class="twinkle-s" style="animation-delay:-${(i % 6) * 0.5}s" cx="${(i * 263) % W}" cy="${620 + ((i * 71) % 260)}" r="1.8"/>`).join('')}</g>`);
};

// ---------- props ----------
const saunaArt = (it) => {
  const open = it.data.open;
  const log = (y, x0 = 40, x1 = 360) => `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="26" rx="13" fill="url(#sp-log)" stroke="${INK}" stroke-width="1.8"/>
    <circle cx="${x0 + 2}" cy="${y + 13}" r="12" fill="#E2C29C" stroke="${INK}" stroke-width="1.6"/><circle cx="${x0 + 2}" cy="${y + 13}" r="6" fill="none" stroke="#B48C66" stroke-width="1.4"/>
    <circle cx="${x1 - 2}" cy="${y + 13}" r="12" fill="#E2C29C" stroke="${INK}" stroke-width="1.6"/><circle cx="${x1 - 2}" cy="${y + 13}" r="6" fill="none" stroke="#B48C66" stroke-width="1.4"/>`;
  return svg(400, 400, `<defs>
      <linearGradient id="sp-log" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9AF84"/><stop offset=".5" stop-color="#C08F65"/><stop offset="1" stop-color="#9C7450"/></linearGradient>
      <linearGradient id="sp-roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DDE6F4"/></linearGradient>
      <radialGradient id="sp-warm"><stop offset="0" stop-color="#FFE6A6"/><stop offset="1" stop-color="#F0A35E"/></radialGradient></defs>
    ${shadow(200, 388, 196, 12, 0.18)}
    <g class="smoke"><circle cx="312" cy="20" r="14" fill="#fff" opacity=".8"/><circle cx="324" cy="-2" r="10" fill="#fff" opacity=".6"/></g>
    <rect x="292" y="40" width="40" height="80" fill="#A7AEC0" stroke="${INK}" stroke-width="2"/><path d="M292 60 H332 M292 82 H332 M312 40 V60 M302 60 V82 M322 82 V104" stroke="#8992A8" stroke-width="2"/><rect x="286" y="34" width="52" height="12" rx="4" fill="#fff" stroke="${INK}" stroke-width="2"/>
    ${[154, 180, 206, 232, 258, 284, 310, 336].map((y) => log(y)).join('')}
    <path d="M6 168 L200 42 L394 168 L370 176 L200 66 L30 176 Z" fill="#7E5F48" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M-2 166 L200 30 L402 166 Q380 186 360 172 Q340 186 316 170 L200 92 L84 170 Q60 186 40 172 Q20 186 -2 166 Z" fill="url(#sp-roof)" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M30 160 L200 50 L370 160" fill="none" stroke="#fff" stroke-width="5" opacity=".8" stroke-linecap="round"/>
    <g fill="#CFE6F6" stroke="${INK}" stroke-width="1.2">${[60, 110, 290, 340].map((x, i) => `<path d="M${x} ${178 - Math.abs(200 - x) * 0.02} l4 ${12 + (i % 2) * 8} l4 ${-(12 + (i % 2) * 8)} z"/>`).join('')}</g>
    <rect x="148" y="196" width="104" height="26" rx="6" fill="#FBF7EF" stroke="${INK}" stroke-width="2"/>${text(200, 216, 'SAUNA', 18, '#7A64B0')}
    <rect x="62" y="236" width="64" height="54" rx="6" fill="url(#sp-warm)" stroke="${INK}" stroke-width="2.2"/><path d="M94 236 V290 M62 263 H126" stroke="#9C7450" stroke-width="4"/>
    <path d="M64 286 Q94 276 124 286 V290 H64 Z" fill="#fff"/>
    <rect x="156" y="230" width="88" height="150" rx="6" fill="${open ? '#F0A35E' : '#8E6745'}" stroke="${INK}" stroke-width="2.2"/>
    ${open ? `<rect x="156" y="230" width="88" height="150" rx="6" fill="url(#sp-warm)" opacity=".9"/><path d="M168 360 H232" stroke="#B9774E" stroke-width="6"/>
      <path d="M156 230 L126 244 V392 L156 380 Z" fill="#A87A5A" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`
    : `<path d="M178 234 V376 M200 234 V376 M222 234 V376" stroke="#7A5A3E" stroke-width="2"/><circle cx="200" cy="268" r="16" fill="url(#sp-warm)" stroke="${INK}" stroke-width="2"/><circle cx="230" cy="310" r="4.5" fill="#E9C77E" stroke="${INK}" stroke-width="1.4"/>`}
    <g transform="translate(310 300)">${[0, 1, 2].map((r) => Array.from({ length: 3 - r }, (_, c) => `<circle cx="${c * 22 + r * 11}" cy="${70 - r * 20}" r="11" fill="#E2C29C" stroke="${INK}" stroke-width="1.6"/><circle cx="${c * 22 + r * 11}" cy="${70 - r * 20}" r="4" fill="none" stroke="#B48C66" stroke-width="1.2"/>`).join('')).join('')}</g>
    <path d="M0 384 Q100 362 200 380 T400 378 V400 H0 Z" fill="#F6F9FE"/>
    ${tag(200, 140 + 0, 'Tap the door', 150)}`);
};

const rackArt = () => svg(210, 200, `<defs><linearGradient id="sp-rackwood" x1="0" x2="1"><stop offset="0" stop-color="#9C7450"/><stop offset=".4" stop-color="#D2A77D"/><stop offset="1" stop-color="#8E6745"/></linearGradient></defs>
  ${shadow(105, 196, 100, 6, 0.16)}
  <rect x="14" y="10" width="14" height="186" rx="5" fill="url(#sp-rackwood)" stroke="${INK}" stroke-width="2"/><rect x="182" y="10" width="14" height="186" rx="5" fill="url(#sp-rackwood)" stroke="${INK}" stroke-width="2"/>
  ${[30, 92].map((y) => `<rect x="10" y="${y}" width="190" height="10" rx="5" fill="url(#sp-rackwood)" stroke="${INK}" stroke-width="2"/>`).join('')}
  ${[[40, '#9EDDD4', 36], [92, '#C9B8F2', 30], [140, '#F5DE7A', 40]].map(([x, c, h]) => `<path d="M${x - 22} 34 H${x + 22} V${34 + h + 30} Q${x} ${40 + h + 34} ${x - 22} ${34 + h + 30} Z" fill="${c}" stroke="${INK}" stroke-width="2"/>
    <path d="M${x - 22} ${50 + h} H${x + 22} M${x - 22} ${56 + h} H${x + 22}" stroke="#fff" stroke-width="3" opacity=".8"/><path d="M${x - 16} 40 V${30 + h}" stroke="#fff" stroke-width="2" opacity=".35"/>
    <path d="M${x - 20} 36 L${x - 20} ${30 + h} M${x - 10} 36 V${32 + h} M${x} 36 V${32 + h} M${x + 10} 36 V${32 + h}" stroke="${INK}" stroke-width=".8" opacity=".15"/>`).join('')}
  <path d="M40 150 H170 L160 194 H50 Z" fill="#DDB78C" stroke="${INK}" stroke-width="2"/><path d="M44 164 H166 M47 178 H163" stroke="#B48C66" stroke-width="2"/>
  ${[[72, '#AFD6F7'], [104, '#FBF7EF'], [136, '#C9B8F2']].map(([x, c]) => `<ellipse cx="${x}" cy="146" rx="15" ry="12" fill="${c}" stroke="${INK}" stroke-width="1.8"/><path d="M${x} 146 m-3 0 a3 3 0 1 1 6 0 a7 6 0 1 1 -14 0" fill="none" stroke="${INK}" stroke-width="1.2" opacity=".4"/>`).join('')}
  ${tag(105, -12, 'Towels', 110)}`);

const kioskArt = () => svg(290, 390, `<defs>
    <linearGradient id="sp-kwood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6AC82"/><stop offset="1" stop-color="#A57B55"/></linearGradient>
    <linearGradient id="sp-pot" x1="0" x2="1"><stop offset="0" stop-color="#8E78C8"/><stop offset=".35" stop-color="#CDBDF0"/><stop offset="1" stop-color="#8471BA"/></linearGradient>
    <radialGradient id="sp-kglow"><stop offset="0" stop-color="#FFE9A6" stop-opacity=".7"/><stop offset="1" stop-color="#FFE9A6" stop-opacity="0"/></radialGradient></defs>
  ${shadow(145, 382, 140, 10, 0.18)}
  <rect x="24" y="100" width="242" height="282" fill="url(#sp-kwood)" stroke="${INK}" stroke-width="2.2"/>
  ${Array.from({ length: 10 }, (_, i) => `<path d="M${24 + i * 24} 100 V382" stroke="#9E7A56" stroke-width="1.6" opacity=".6"/>`).join('')}
  <rect x="42" y="128" width="206" height="110" rx="6" fill="#4A3E5E" stroke="${INK}" stroke-width="2"/><circle cx="145" cy="180" r="110" fill="url(#sp-kglow)"/>
  <path d="M42 140 H248" stroke="#6E5A7E" stroke-width="3"/>
  ${[70, 104, 138].map((x, i) => `<rect x="${x}" y="150" width="22" height="26" rx="4" fill="${['#C9B8F2', '#9EDDD4', '#F5DE7A'][i]}" stroke="${INK}" stroke-width="1.6"/>`).join('')}
  <path d="M10 112 L36 30 H254 L280 112 Z" fill="#FBF7EF" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
  ${[0, 1, 2, 3, 4].map((k) => `<path d="M${58 + k * 44} 30 L${30 + k * 58} 112 H${58 + k * 58} L${80 + k * 44} 30 Z" fill="#B79CF0" opacity=".9"/>`).join('')}
  <path d="M10 112 ${Array.from({ length: 9 }, (_, k) => `Q${10 + k * 30 + 15} 134 ${10 + (k + 1) * 30} 112`).join(' ')}" fill="#C9B8F2" stroke="${INK}" stroke-width="2"/>
  <path d="M40 34 Q145 20 250 34" stroke="#fff" stroke-width="6" opacity=".7" fill="none" stroke-linecap="round"/>
  <path d="M30 30 Q145 -6 260 30" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
  <rect x="80" y="-14" width="130" height="34" rx="10" fill="#FBF7EF" stroke="${INK}" stroke-width="2"/>${text(145, 10, 'HOT COCOA', 18, '#7A64B0')}
  <rect x="10" y="236" width="270" height="22" rx="6" fill="#C9A57C" stroke="${INK}" stroke-width="2"/><path d="M16 240 H274" stroke="#fff" stroke-width="2" opacity=".4"/>
  <g class="steam"><path class="ln" stroke="#fff" stroke-width="4" opacity=".7" d="M196 178 Q188 166 196 154 M216 178 Q208 166 216 154"/></g>
  <path d="M180 186 H232 V226 Q232 238 220 238 H192 Q180 238 180 226 Z" fill="url(#sp-pot)" stroke="${INK}" stroke-width="2"/><rect x="176" y="180" width="60" height="10" rx="4" fill="#AEB8C8" stroke="${INK}" stroke-width="1.6"/>
  ${[60, 96].map((x) => `<path d="M${x} 214 H${x + 24} V232 Q${x + 24} 238 ${x + 18} 238 H${x + 6} Q${x} 238 ${x} 232 Z" fill="#FBF7EF" stroke="${INK}" stroke-width="1.6"/><path d="M${x + 24} 220 q8 0 8 7 q0 6 -8 6" fill="none" stroke="${INK}" stroke-width="1.6"/>`).join('')}
  <rect x="52" y="276" width="186" height="80" rx="8" fill="#3E3450" stroke="#8E6745" stroke-width="5"/>
  ${text(145, 306, 'Cocoa ☕', 22, '#FBF7EF', 500)}${text(145, 336, 'with marshmallows', 15, '#9EDDD4', 500)}
  ${tag(145, 372, 'Tap for cocoa', 160)}`);

const poolArt = () => {
  const { rx, ry } = POOL, cx = 360, cy = 145;
  const rocks = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2 + 0.1, front = Math.sin(a) > 0;
    const x = cx + Math.cos(a) * (rx + 16), y = cy + Math.sin(a) * (ry + 14);
    const r = front ? 30 + (i % 3) * 6 : 20 + (i % 3) * 5;
    return { x, y, r, front, i };
  });
  const rock = ({ x, y, r, i }) => `<g><path d="M${(x - r).toFixed(1)} ${(y + r * 0.35).toFixed(1)} Q${(x - r).toFixed(1)} ${(y - r * 0.6).toFixed(1)} ${(x - r * 0.1).toFixed(1)} ${(y - r * 0.62).toFixed(1)} Q${(x + r).toFixed(1)} ${(y - r * 0.6).toFixed(1)} ${(x + r).toFixed(1)} ${(y + r * 0.3).toFixed(1)} Q${x.toFixed(1)} ${(y + r * 0.62).toFixed(1)} ${(x - r).toFixed(1)} ${(y + r * 0.35).toFixed(1)} Z" fill="url(#sp-rock${i % 2})" stroke="${INK}" stroke-width="1.8"/>
    <path d="M${(x - r * 0.75).toFixed(1)} ${(y - r * 0.3).toFixed(1)} Q${(x - r * 0.1).toFixed(1)} ${(y - r * 0.78).toFixed(1)} ${(x + r * 0.7).toFixed(1)} ${(y - r * 0.32).toFixed(1)} Q${x.toFixed(1)} ${(y - r * 0.42).toFixed(1)} ${(x - r * 0.75).toFixed(1)} ${(y - r * 0.3).toFixed(1)} Z" fill="#fff" opacity=".95"/></g>`;
  return svg(720, 280, `<defs>
      <radialGradient id="sp-water" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#A6EBE2"/><stop offset=".65" stop-color="#6CCBC6"/><stop offset="1" stop-color="#3F9FA6"/></radialGradient>
      <linearGradient id="sp-rock0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C3CADB"/><stop offset="1" stop-color="#8A93AA"/></linearGradient>
      <linearGradient id="sp-rock1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B5B9CF"/><stop offset="1" stop-color="#8189A2"/></linearGradient>
      <linearGradient id="sp-bamboo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9D49A"/><stop offset="1" stop-color="#7FA868"/></linearGradient></defs>
    <ellipse cx="${cx}" cy="${cy + 18}" rx="${rx + 40}" ry="${ry + 34}" fill="${INK}" opacity=".08"/>
    ${rocks.filter((r) => !r.front).map(rock).join('')}
    <ellipse cx="${cx}" cy="${cy}" rx="${rx + 4}" ry="${ry + 4}" fill="#4E8E97" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="${cx}" cy="${cy + 6}" rx="${rx - 4}" ry="${ry - 6}" fill="url(#sp-water)"/>
    <path d="M${cx - rx + 10} ${cy - 10} Q${cx} ${cy - ry - 4} ${cx + rx - 10} ${cy - 10}" stroke="#2F7A82" stroke-width="10" fill="none" opacity=".35"/>
    <g fill="none" stroke="#FFFFFF" stroke-linecap="round" opacity=".45">
      <path d="M${cx - 220} ${cy + 10} q30 -10 60 0 t60 0" stroke-width="3"/><path d="M${cx + 60} ${cy + 40} q30 -10 60 0 t60 0" stroke-width="3"/>
      <path d="M${cx - 120} ${cy + 60} q24 -8 48 0" stroke-width="2.5"/><path d="M${cx + 150} ${cy - 20} q24 -8 48 0" stroke-width="2.5"/>
      <ellipse cx="${cx - 40}" cy="${cy - 30}" rx="120" ry="16" stroke-width="2" opacity=".5"/></g>
    <g fill="#fff" opacity=".7">${[[cx - 160, cy + 30], [cx + 40, cy - 10], [cx + 200, cy + 50], [cx - 60, cy + 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/><circle cx="${x + 10}" cy="${y - 6}" r="2.5"/>`).join('')}</g>
    <g transform="translate(600 30)"><path d="M0 0 L70 -24" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M0 0 L70 -24" stroke="url(#sp-bamboo)" stroke-width="12" stroke-linecap="round"/>
      <path d="M30 -10 l2 -1" stroke="#5E8A4E" stroke-width="12"/><path d="M76 -26 V60" stroke="#7FA868" stroke-width="10"/><path d="M76 -26 V60" stroke="${INK}" stroke-width="1.5" opacity=".4"/>
      <path class="steam" d="M-2 2 Q-10 40 -8 80" stroke="#E9FBFF" stroke-width="5" fill="none" opacity=".9"/><ellipse cx="-8" cy="84" rx="18" ry="5" fill="none" stroke="#fff" stroke-width="2.5" opacity=".7"/></g>
    ${rocks.filter((r) => r.front).map(rock).join('')}
    <g fill="#FFFFFF">${Array.from({ length: 9 }, (_, i) => `<path class="wx-steam" style="animation-delay:-${(i * 0.55).toFixed(2)}s;animation-duration:${4.5 + (i % 3) * 0.8}s" d="M${cx - 260 + i * 64} ${cy + 10 - (i % 2) * 20} q-14 -26 0 -50 q14 -24 0 -50 q10 10 12 26 q2 22 -8 40 q-8 16 -4 34 Z" opacity=".5"/>`).join('')}</g>
    ${tag(cx, 262, 'Drop a friend in! ♨️', 210)}`);
};

const snowball = (api, x, y) => api.add({
  id: api.uid('snowball'), x, y, w: 56, h: 56, cls: 'food',
  onGive: (it, a, who) => { a.remove(it); a.sfx.boing(); a.sparkle(who.x + who.w / 2, who.y + 60, ['❄️', '💨', '❄️']); a.react(who, pick(['Splat! 😆', 'Hey! Snowball fight! ❄️', 'Brrr! 😂']), ['❄️', '✨']); },
  art: () => svg(56, 56, `<defs><radialGradient id="sp-ball" cx=".38" cy=".32" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D3DEF0"/></radialGradient></defs>
    <circle cx="28" cy="28" r="24" fill="url(#sp-ball)" stroke="${INK}" stroke-width="2"/><path d="M14 22 Q20 12 30 10" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`),
}, { spawned: true });

export const SPRINGS = {
  id: 'springs', title: 'Hot Springs ♨️', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, outdoor: true, width: W, avatar: [680, 470],
  frame: (w) => `linear-gradient(${w === 'snow' ? '#B4BCD2' : '#A9D3F2'} 61%, #F1F5FC 61%)`,
  bg,
  stars: [{ id: 'springs-sled', x: 2238, y: 756 }],
  characters: [
    { id: 'mia', look: { ...NPC_WINTER.mia, topColor: '#C9B8F2', neckColor: '#9EDDD4' }, x: 1110, y: 470, s: 0.95, say: ['Hot cocoa and a hot spring — perfect! ☕', 'Drag a friend into the warm water ♨️', 'The capybara loves the hot spring 🍊'] },
    { id: 'nora', look: NPC_WINTER.nora, x: 2010, y: 480, s: 0.95, say: ['Look, the ski lift! 🚡', 'Want to go sledding? 🛷', 'Snowball fight? ❄️ Tap the snow pile!'] },
  ],
  init: (api) => { for (const c of api.characters()) if (inPool(c)) c.el.classList.add('wx-soak'); },
  onCharacterDrop: (api, who) => {
    if (!inPool(who)) { who.el.classList.remove('wx-soak'); return; }
    who.el.classList.add('wx-soak');
    api.sfx.pour();
    api.effect(who.x + who.w / 2, who.y + who.h * 0.64, 'wx-ripple', rippleSvg, 1400);
    api.react(who, 'Ahhh, so warm! ♨️', ['♨️', '💧', '✨']);
    if (!api.starFound('springs-soak')) api.addStar('springs-soak', POOL.cx + 60, POOL.cy - 230, { spawned: true });
  },
  onCharacterTap: (api, who) => {
    if (!who.el.classList.contains('wx-soak')) return false;
    who.anim.happy(); api.sfx.pop();
    api.effect(who.x + who.w / 2, who.y + who.h * 0.64, 'wx-ripple', rippleSvg, 1400);
    api.bubble(who.x + who.w / 2, who.y - 6, pick(['So relaxing… ♨️', 'Bubble bubble 🫧', 'I could stay here all day!', 'Warm toes! 🦶']));
    return true;
  },
  items: [
    { id: 'pool', x: POOL.cx - 360, y: POOL.cy - 145, w: 720, h: 280, floor: true, drag: false,
      onTap: (it, api) => { api.sfx.pour(); api.effect(POOL.cx + (Math.random() - 0.5) * 300, POOL.cy + 10, 'wx-ripple', rippleSvg, 1400); api.bubble(POOL.cx, POOL.cy - 140, 'So warm! Drop a friend into the water ♨️'); },
      art: poolArt },
    { id: 'sauna', x: 30, y: 300, w: 400, h: 400, drag: false, data: { open: false },
      onTap: (it, api) => {
        if (it.data.open) return;
        it.data.open = true; api.setArt(it); api.sfx.pour();
        for (let i = 0; i < 4; i++) api.later(() => api.effect(it.x + 200 + (i % 2 ? 30 : -20), it.y + 300 - i * 30, 'wx-puff', puffSvg(), 1300), i * 160);
        api.bubble(it.x + 200, it.y + 80, pick(['Phew! So steamy in there 🧖', 'Toasty warm sauna! ♨️', 'A puff of steam! ☁️']));
        api.later(() => { it.data.open = false; api.setArt(it); }, 2200);
      },
      art: saunaArt },
    { id: 'snowpile', x: 30, y: 770, w: 170, h: 96, drag: false,
      onTap: (it, api) => {
        if (api.count('snowball') >= 4) { api.bubble(it.x + 85, it.y - 10, 'Throw those first! ❄️'); return; }
        snowball(api, it.x + 180 + api.count('snowball') * 34, it.y + 20);
        api.bubble(it.x + 85, it.y - 10, 'Drag the snowball onto a friend!');
      },
      art: () => svg(170, 96, `<defs><radialGradient id="sp-pile" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D5E0F0"/></radialGradient></defs>
        ${shadow(85, 92, 80, 6)}<path d="M6 92 Q16 34 62 36 Q86 6 118 28 Q160 28 164 92 Z" fill="url(#sp-pile)" stroke="${INK}" stroke-width="2"/>
        ${[[54, 70], [88, 62], [122, 72], [72, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="url(#sp-pile)" stroke="${INK}" stroke-width="1.8"/><path d="M${x - 8} ${y - 6} q4 -6 10 -7" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('')}
        ${tag(85, -14, 'Snowballs', 120)}`) },
    { id: 'fox', x: 220, y: 720, w: 130, h: 110, cls: 'squish',
      onTap: (it, api) => { bump(it, 'hop'); api.sfx.boing(); api.bubble(it.x + 65, it.y - 6, pick(['Yip yip! 🦊', '*sniffs the snow*', 'Is that cocoa I smell?'])); },
      art: () => svg(130, 110, `<defs><linearGradient id="sp-fox" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7A06A"/><stop offset="1" stop-color="#C77C48"/></linearGradient></defs>
        ${shadow(66, 106, 56, 4)}
        <path class="tail" d="M92 84 Q128 80 124 46 Q120 28 106 30 Q114 60 88 70 Z" fill="url(#sp-fox)" stroke="${INK}" stroke-width="2"/><path d="M118 40 Q124 32 116 28 Q106 30 108 40 Z" fill="#FBF7EF"/>
        <path d="M30 64 Q30 46 56 44 H82 Q100 46 98 70 Q96 94 76 96 H48 Q30 94 30 64 Z" fill="url(#sp-fox)" stroke="${INK}" stroke-width="2"/>
        <path d="M44 92 V104 M56 94 V106 M80 94 V106 M90 90 V102" stroke="#5A4050" stroke-width="7" stroke-linecap="round"/>
        <path d="M14 36 L8 8 L28 22 Z M44 22 L54 2 L56 28 Z" fill="url(#sp-fox)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M14 30 L12 16 L22 24 Z M46 24 L52 12 L52 26 Z" fill="#5A4050"/>
        <path d="M8 40 Q14 18 36 18 Q58 20 58 42 Q58 54 44 58 L20 60 Q4 56 8 40 Z" fill="url(#sp-fox)" stroke="${INK}" stroke-width="2"/>
        <path d="M8 44 Q20 50 26 60 L4 56 Q0 48 8 44 Z M58 44 Q50 54 40 58 L60 56 Z" fill="#FBF7EF"/><circle cx="3" cy="52" r="4" fill="${INK}"/>
        <path d="M20 36 q4 3 8 0 M38 36 q4 3 8 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M40 66 Q60 74 80 66 Q66 86 52 84 Q40 80 40 66 Z" fill="#FBF7EF"/>`) },
    { id: 'rack', x: 450, y: 480, w: 210, h: 200, drag: false,
      onTap: (it, api) => {
        if (api.count('scarf') >= 2) { api.bubble(it.x + 105, it.y - 30, 'Try on those towels first! 🧣'); return; }
        api.add({ ...wearable('scarf', it.x + 10 + api.count('scarf') * 70, it.y - 120, api.uid('scarf')), wearText: 'Fluffy and warm! 🧣' }, { spawned: true });
        api.bubble(it.x + 105, it.y - 30, 'A fluffy towel scarf! Put it on someone 🧣');
      },
      art: rackArt },
    wearable('scarf', 460, 450, 'sp-scarf'),
    wearable('beanie', 548, 586, 'sp-beanie'),
    { id: 'kiosk', x: 860, y: 290, w: 290, h: 390, drag: false,
      onTap: (it, api) => {
        if (api.count('cocoa') >= 3) { api.bubble(it.x + 145, it.y - 30, 'Drink up first! ☕'); return; }
        api.sfx.pour(); food(api, 'cocoa', it.x + 30 + api.count('cocoa') * 80, it.y + 156);
        api.bubble(it.x + 145, it.y - 30, 'One hot cocoa! Give it to a friend ☕');
      },
      art: kioskArt },
    { id: 'monkey', x: 1300, y: 578, w: 110, h: 120, drag: false,
      onTap: (it, api) => { bump(it, 'hop'); api.sfx.boing(); api.bubble(it.x + 55, it.y - 6, pick(['Ook! The water is lovely! 🐒', '*splashes happily*', 'Mmm… warm paws'])); },
      art: () => svg(110, 120, `<defs><radialGradient id="sp-fur" cx=".45" cy=".35" r=".7"><stop offset="0" stop-color="#DCD3C6"/><stop offset="1" stop-color="#AFA392"/></radialGradient></defs>
        ${shadow(56, 114, 44, 5)}<ellipse cx="56" cy="84" rx="38" ry="32" fill="url(#sp-fur)" stroke="${INK}" stroke-width="2"/>
        <path d="M26 96 Q16 110 30 116 H48 M86 96 Q96 110 82 116 H64" fill="url(#sp-fur)" stroke="${INK}" stroke-width="2"/>
        <circle cx="56" cy="42" r="30" fill="url(#sp-fur)" stroke="${INK}" stroke-width="2"/><path d="M28 30 Q56 6 84 30" fill="none" stroke="#C9BFB2" stroke-width="6" stroke-linecap="round"/>
        <path d="M38 40 Q38 26 56 26 Q74 26 74 40 Q74 62 56 64 Q38 62 38 40 Z" fill="#EFC6AE" stroke="${INK}" stroke-width="1.8"/>
        <path d="M44 40 q4 3 8 0 M60 40 q4 3 8 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M53 50 h6" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/><path d="M50 56 Q56 59 62 56" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <circle cx="26" cy="42" r="6" fill="#EFC6AE" stroke="${INK}" stroke-width="1.6"/><circle cx="86" cy="42" r="6" fill="#EFC6AE" stroke="${INK}" stroke-width="1.6"/>
        <path d="M30 8 Q56 -6 82 10 Q70 4 56 6 Q42 4 30 8 Z" fill="#fff" opacity=".9"/>`) },
    { id: 'capybara', x: 1520, y: 664, w: 160, h: 100, drag: false, cls: 'wx-float',
      onTap: (it, api) => { bump(it, 'boing'); api.sfx.pop(); api.bubble(it.x + 80, it.y - 10, pick(['Ahh… so relaxing 🍊', '*blub blub*', 'Capybara spa day ♨️', 'Mmm… a little yuzu on my head 🍊'])); },
      art: () => svg(160, 100, `<defs><linearGradient id="sp-capy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C79A70"/><stop offset="1" stop-color="#94704F"/></linearGradient>
          <radialGradient id="sp-yuzu" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#FFF1A8"/><stop offset="1" stop-color="#E8C34E"/></radialGradient></defs>
        <path d="M28 70 Q24 36 66 30 L108 28 Q146 30 144 64 V86 H28 Z" fill="url(#sp-capy)" stroke="${INK}" stroke-width="2"/>
        <path d="M100 30 Q120 10 142 20 Q156 28 152 50 Q150 64 136 66 Q118 66 108 54 Z" fill="url(#sp-capy)" stroke="${INK}" stroke-width="2"/>
        <path d="M104 22 q-2 -10 8 -10 q6 4 2 12 Z" fill="#8A6648" stroke="${INK}" stroke-width="1.6"/>
        <ellipse cx="148" cy="44" rx="6" ry="7" fill="#7A5A40"/><path d="M122 34 q5 3 10 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M44 44 Q80 34 110 40" stroke="#E2BE96" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>
        <circle cx="128" cy="8" r="13" fill="url(#sp-yuzu)" stroke="${INK}" stroke-width="2"/><path d="M128 -5 q4 -6 10 -4 q-4 5 -10 4 Z" fill="#7FBF9A" stroke="${INK}" stroke-width="1.2"/>
        <path d="M0 66 Q20 58 40 66 T80 66 T120 66 T160 66 V100 H0 Z" fill="#6CCBC6" opacity=".85"/>
        <path d="M6 68 Q22 62 38 68 M84 68 Q100 62 116 68" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`) },
    { id: 'duck', x: 1740, y: 744, w: 70, h: 60, cls: 'wx-float',
      onTap: (it, api) => { bump(it, 'boing'); api.sfx.boing(); api.bubble(it.x + 35, it.y - 6, 'Squeak! 🦆'); },
      art: () => svg(70, 60, `<defs><radialGradient id="sp-duck" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFF4B8"/><stop offset="1" stop-color="#EBCB5A"/></radialGradient></defs>
        <path d="M6 36 Q4 54 34 54 Q62 54 64 34 Q50 40 40 34 Q30 28 6 36 Z" fill="url(#sp-duck)" stroke="${INK}" stroke-width="2"/>
        <circle cx="46" cy="22" r="14" fill="url(#sp-duck)" stroke="${INK}" stroke-width="2"/><path d="M58 22 Q70 22 68 28 Q62 30 56 28 Z" fill="#F0A060" stroke="${INK}" stroke-width="1.6"/>
        <circle cx="48" cy="18" r="2.2" fill="${INK}"/><path d="M16 38 Q26 34 34 40" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>
        <path d="M0 50 Q12 46 24 50 T48 50 T70 50" stroke="#fff" stroke-width="2.5" fill="none" opacity=".6"/>`) },
    { id: 'bucket', x: 1590, y: 800, w: 80, h: 72,
      onTap: (it, api) => { bump(it, 'boing'); api.sfx.pour(); api.sparkle(it.x + 40, it.y + 10, ['💧', '💦', '✨']); api.bubble(it.x + 40, it.y - 10, 'Splash! 💦'); },
      art: () => svg(80, 72, `<defs><linearGradient id="sp-hinoki" x1="0" x2="1"><stop offset="0" stop-color="#C9A57C"/><stop offset=".35" stop-color="#F0DDBF"/><stop offset="1" stop-color="#BF9A70"/></linearGradient></defs>
        ${shadow(40, 68, 32, 4)}<path d="M8 22 L14 64 Q40 70 66 64 L72 22 Z" fill="url(#sp-hinoki)" stroke="${INK}" stroke-width="2"/>
        <path d="M24 24 L26 66 M40 24 V68 M56 24 L54 66" stroke="#B48C66" stroke-width="1.4" opacity=".7"/>
        <path d="M10 34 Q40 40 70 34 M12 54 Q40 60 68 54" stroke="#AEB8C8" stroke-width="4" fill="none"/>
        <ellipse cx="40" cy="22" rx="32" ry="8" fill="#6CCBC6" stroke="${INK}" stroke-width="2"/>
        <path d="M18 18 Q30 6 52 12 Q60 16 58 22 Q38 26 18 18 Z" fill="#C9B8F2" stroke="${INK}" stroke-width="1.6"/><path d="M24 16 Q36 10 50 14" stroke="#fff" stroke-width="2" opacity=".7" fill="none"/>`) },
    { id: 'lantern', x: 1900, y: 500, w: 92, h: 190, drag: false, data: { on: true },
      onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); if (it.data.on) api.sparkle(it.x + 46, it.y + 70, ['✨', '🏮']); },
      art: (it) => svg(92, 190, `<defs><linearGradient id="sp-stone" x1="0" x2="1"><stop offset="0" stop-color="#8A93AA"/><stop offset=".4" stop-color="#C7CDDC"/><stop offset="1" stop-color="#7E879E"/></linearGradient>
          <radialGradient id="sp-lglow"><stop offset="0" stop-color="#FFE9A6" stop-opacity=".8"/><stop offset="1" stop-color="#FFE9A6" stop-opacity="0"/></radialGradient></defs>
        ${shadow(46, 186, 38, 5)}${it.data.on ? '<circle cx="46" cy="78" r="70" fill="url(#sp-lglow)"/>' : ''}
        <path d="M14 172 H78 L72 186 H20 Z" fill="url(#sp-stone)" stroke="${INK}" stroke-width="2"/>
        <rect x="34" y="104" width="24" height="68" fill="url(#sp-stone)" stroke="${INK}" stroke-width="2"/>
        <path d="M18 96 H74 L68 106 H24 Z" fill="url(#sp-stone)" stroke="${INK}" stroke-width="2"/>
        <rect x="22" y="58" width="48" height="38" rx="3" fill="url(#sp-stone)" stroke="${INK}" stroke-width="2"/>
        <rect x="32" y="66" width="28" height="24" rx="2" fill="${it.data.on ? '#FFE3A0' : '#4A4560'}" stroke="${INK}" stroke-width="1.6"/>
        <path d="M2 58 Q46 34 90 58 Z" fill="url(#sp-stone)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M0 56 Q46 26 92 56 Q70 46 46 44 Q22 46 0 56 Z" fill="#fff"/><circle cx="46" cy="32" r="8" fill="url(#sp-stone)" stroke="${INK}" stroke-width="2"/><path d="M38 28 Q46 18 54 28 Z" fill="#fff"/>`) },
    { id: 'skirack', x: 2190, y: 360, w: 200, h: 300, drag: false,
      onTap: (it, api) => { bump(it, 'shake'); api.sfx.drop(); api.bubble(it.x + 100, it.y - 10, pick(['Skis and poles, ready to go! ⛷️', 'Clack clack! 🎿', 'Ride the lift up the mountain! 🚡'])); },
      art: () => svg(200, 300, `<defs><linearGradient id="sp-rw" x1="0" x2="1"><stop offset="0" stop-color="#8E6745"/><stop offset=".4" stop-color="#C99772"/><stop offset="1" stop-color="#7E5F42"/></linearGradient></defs>
        ${shadow(100, 294, 96, 7, 0.16)}
        ${[[30, '#9EDDD4', -6], [60, '#9EDDD4', -3], [100, '#C9B8F2', -2], [128, '#C9B8F2', 2], [160, '#F5DE7A', 4]].map(([x, c, r]) => `<g transform="rotate(${r} ${x} 290)"><path d="M${x - 9} 290 V28 Q${x - 9} 4 ${x} 4 Q${x + 9} 4 ${x + 9} 28 V290 Z" fill="${c}" stroke="${INK}" stroke-width="2"/><path d="M${x - 4} 280 V30" stroke="#fff" stroke-width="2.5" opacity=".5"/><rect x="${x - 10}" y="170" width="20" height="16" rx="3" fill="#4D5C9A" stroke="${INK}" stroke-width="1.4"/></g>`).join('')}
        <path d="M182 290 L176 40 M192 290 L190 44" stroke="#AEB8C8" stroke-width="4" stroke-linecap="round"/><circle cx="176" cy="38" r="4" fill="#3CC7B8" stroke="${INK}" stroke-width="1.4"/><circle cx="190" cy="42" r="4" fill="#3CC7B8" stroke="${INK}" stroke-width="1.4"/>
        <rect x="4" y="226" width="192" height="14" rx="4" fill="url(#sp-rw)" stroke="${INK}" stroke-width="2"/><rect x="14" y="238" width="12" height="56" fill="url(#sp-rw)" stroke="${INK}" stroke-width="2"/><rect x="174" y="238" width="12" height="56" fill="url(#sp-rw)" stroke="${INK}" stroke-width="2"/>
        <path d="M4 226 Q100 214 196 226" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>`) },
    { id: 'sled', x: 2180, y: 740, w: 200, h: 90,
      onTap: (it, api) => {
        if (it.el.classList.contains('sledding')) return;
        it.el.style.setProperty('--dx', '-380px'); it.el.style.setProperty('--dy', '40px');
        it.el.classList.add('sledding'); api.sfx.pick(); api.bubble(it.x + 100, it.y - 10, 'Wheeeee! 🛷');
        api.later(() => it.el.classList.remove('sledding'), 2400);
      },
      art: () => svg(200, 90, `<defs><linearGradient id="sp-sledw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2BF96"/><stop offset="1" stop-color="#B48C66"/></linearGradient></defs>
        ${shadow(100, 86, 90, 4)}
        <path d="M14 70 H168 Q196 70 194 44" stroke="${INK}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M14 70 H168 Q196 70 194 44" stroke="#AEB8C8" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M44 52 V70 M140 52 V70" stroke="#8E6745" stroke-width="6"/>
        <rect x="28" y="48" width="140" height="24" rx="4" fill="#A47A55" stroke="${INK}" stroke-width="2"/><path d="M34 54 H162" stroke="#E2BF96" stroke-width="2" opacity=".7"/>
        <rect x="20" y="30" width="156" height="24" rx="6" fill="url(#sp-sledw)" stroke="${INK}" stroke-width="2"/>
        <path d="M54 30 V54 M88 30 V54 M122 30 V54" stroke="#A47A55" stroke-width="2"/>
        <rect x="40" y="18" width="110" height="16" rx="8" fill="#C9B8F2" stroke="${INK}" stroke-width="2"/><path d="M50 22 H140" stroke="#fff" stroke-width="2" opacity=".6"/>
        <path d="M22 40 Q2 30 8 12" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`) },
    { id: 'liftstation', x: 2200, y: 10, w: 200, h: 190, drag: false,
      onTap: (it, api) => { api.sfx.click(); api.sparkle(it.x + 70, it.y + 60, ['🚡', '✨', '❄️']); api.bubble(it.x + 100, it.y + 220, 'All aboard the ski lift! 🚡'); },
      art: () => svg(200, 190, `<defs><linearGradient id="sp-stw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6AC82"/><stop offset="1" stop-color="#A57B55"/></linearGradient></defs>
        <circle cx="70" cy="50" r="22" fill="#AEB8C8" stroke="${INK}" stroke-width="2.2"/><circle cx="70" cy="50" r="7" fill="${INK}"/><path d="M48 50 H92 M70 28 V72" stroke="#8892A8" stroke-width="2"/>
        <rect x="80" y="36" width="116" height="150" fill="url(#sp-stw)" stroke="${INK}" stroke-width="2.2"/>
        <path d="M70 40 L138 -6 L206 40 Z" fill="#7A64B0" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M64 40 L138 -12 L212 40 Q190 50 170 40 Q150 52 130 40 Q110 52 90 40 Q76 48 64 40 Z" fill="#fff" stroke="${INK}" stroke-width="2"/>
        <rect x="100" y="70" width="76" height="46" rx="5" fill="#FFE9A6" stroke="${INK}" stroke-width="2"/><path d="M138 70 V116 M100 93 H176" stroke="#A57B55" stroke-width="3"/>
        <rect x="92" y="130" width="94" height="30" rx="8" fill="#FBF7EF" stroke="${INK}" stroke-width="2"/>${text(139, 151, 'SKI LIFT', 16, '#7A64B0')}`) },
  ],
};
