// Starry Lookout — an isometric night diorama on a floating snowy hilltop under the northern lights.
// Telescope → connect-the-stars puzzle; campfire toasts marshmallows onto the log seat; the owl sends shooting stars;
// a picnic blanket hides a star; the observatory dome opens.
import { room, groundShell, floorPoly, isoItem, at, shades, proj, isoDef } from '../iso.js';
import { INK, svg, text, starPath, food, NPC_WINTER } from './common.js';
import { CLIMATES } from '../ui.js';

const R = room({ cols: 10, rows: 8, ox: 736, oy: 248, wallH: 0 });
R.charScale = 0.55;

const WOOD = '#C99A6C', WOOD_L = '#E2C29C', WOOD_D = '#A87A5A', BARK = '#8B6450', CREAM = '#FBF7EF', SNOW = '#F4F7FF';
const LILAC = '#B79CF0', TEAL = '#7FCFC4', SKY = '#9CC8EE', SUN = '#F5DE7A', PINE = '#4E8F7A', IRON = '#4F4B7A';
const PAL = [LILAC, TEAL, SUN, SKY];
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
function cyl(cx, cy, rx, h, col, top = shades(col).top) {
  const ry = rx / 2, t = cy - h;
  return `<path d="M${f1(cx - rx)} ${f1(t)} V${f1(cy)} A${rx} ${ry} 0 0 0 ${f1(cx + rx)} ${f1(cy)} V${f1(t)} Z" fill="${col}" ${LN}/>
    <path d="M${f1(cx + rx * 0.35)} ${f1(t + ry * 0.94)} V${f1(cy + ry * 0.94)} A${rx} ${ry} 0 0 0 ${f1(cx + rx)} ${f1(cy)} V${f1(t)} A${rx} ${ry} 0 0 1 ${f1(cx + rx * 0.35)} ${f1(t + ry * 0.94)} Z" fill="#3E3252" opacity=".12"/>
    <ellipse cx="${f1(cx)}" cy="${f1(t)}" rx="${rx}" ry="${ry}" fill="${top}" ${LN}/>`;
}
const item = (fw, fd, h, body) => isoItem(fw, fd, h, [{ svg: body, u: 0, v: 0, w: 0, d: 0 }]);
const planeL = (u, v, z, body) => { const [x, y] = at(u, v, z); return `<g transform="matrix(1,0.5,0,1,${f1(x)},${f1(y)})">${body}</g>`; };
const shadow = (cx, cy, rx, ry = rx / 2.4) => `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${rx}" ry="${f1(ry)}" fill="#1E1A40" opacity=".18"/>`;

function tree(cx, cy, s) {
  let o = `<rect x="${f1(cx - 7 * s)}" y="${f1(cy - 36 * s)}" width="${f1(14 * s)}" height="${f1(36 * s)}" fill="${BARK}" ${LN}/>`;
  for (let k = 0; k < 4; k++) {
    const yb = cy - (28 + k * 40) * s, hw = (70 - k * 14) * s, ht = 66 * s;
    o += `<path d="M${f1(cx - hw)} ${f1(yb)} Q${f1(cx)} ${f1(yb + 16 * s)} ${f1(cx + hw)} ${f1(yb)} L${f1(cx)} ${f1(yb - ht)} Z" fill="${PINE}" ${LN}/>
      <path d="M${f1(cx)} ${f1(yb - ht)} L${f1(cx + hw)} ${f1(yb)} Q${f1(cx + hw / 2)} ${f1(yb + 11 * s)} ${f1(cx)} ${f1(yb + 8 * s)} Z" fill="#1F3A4A" opacity=".25"/>
      <path d="M${f1(cx - hw * 0.94)} ${f1(yb - 2 * s)} Q${f1(cx - hw * 0.5)} ${f1(yb + 11 * s)} ${f1(cx)} ${f1(yb + 6 * s)} Q${f1(cx + hw * 0.45)} ${f1(yb + 11 * s)} ${f1(cx + hw * 0.75)} ${f1(yb - 3 * s)} Q${f1(cx + hw * 0.3)} ${f1(yb - 11 * s)} ${f1(cx)} ${f1(yb - 7 * s)} Q${f1(cx - hw * 0.5)} ${f1(yb - 13 * s)} ${f1(cx - hw * 0.94)} ${f1(yb - 2 * s)} Z" fill="${SNOW}"/>`;
  }
  const ap = cy - 214 * s;
  return o + `<path d="M${f1(cx - 9 * s)} ${f1(ap + 14 * s)} Q${f1(cx)} ${f1(ap - 4 * s)} ${f1(cx + 9 * s)} ${f1(ap + 14 * s)} Q${f1(cx)} ${f1(ap + 9 * s)} ${f1(cx - 9 * s)} ${f1(ap + 14 * s)} Z" fill="${SNOW}"/>`;
}

// ---------- background: night sky with aurora, misty valley, floating snowy hilltop ----------
function snowLip() {
  const L = proj(R, 0, R.rows), F = proj(R, R.cols, R.rows), Rr = proj(R, R.cols, 0);
  const band = (A, B) => {
    let s = `<polygon points="${P([A, B, [B[0], B[1] + 10], [A[0], A[1] + 10]])}"/>`;
    const n = Math.round(Math.hypot(B[0] - A[0], B[1] - A[1]) / 24);
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = A[0] + (B[0] - A[0]) * t, y = A[1] + (B[1] - A[1]) * t;
      s += `<circle cx="${f1(x)}" cy="${f1(y + 9)}" r="${6 + ((i * 7) % 5)}"/>`;
      if (i % 3 === 1) s += `<path d="M${f1(x - 3)} ${f1(y + 13)} L${f1(x)} ${f1(y + 24 + (i % 2) * 7)} L${f1(x + 3)} ${f1(y + 13)} Z" fill="#CFDBF2"/>`;
    }
    return s;
  };
  return `<g fill="#E8EDFA">${band(L, F)}${band(F, Rr)}</g>`;
}
function fence() {
  const posts = [];
  for (let g = 0.12; g < R.cols - 0.1; g += 0.9) posts.push([g, 0.12]);
  const right = posts.length;
  for (let g = 1.02; g < R.rows - 0.1; g += 0.9) posts.push([0.12, g]);
  const top = (p, z) => { const [x, y] = proj(R, p[0], p[1]); return [x, y - z]; };
  let rails = '';
  const run = (arr) => arr.slice(1).forEach((p, i) => {
    for (const z of [14, 28]) rails += `<path d="M${XY(top(arr[i], z))} L${XY(top(p, z))}" stroke="${WOOD_D}" stroke-width="4"/>`;
    rails += `<path d="M${XY(top(arr[i], 31))} L${XY(top(p, 31))}" stroke="${SNOW}" stroke-width="2.4" stroke-linecap="round"/>`;
  });
  run(posts.slice(0, right));
  run([posts[0], ...posts.slice(right)]);
  const ps = posts.map(([gx, gy]) => { const [x, y] = proj(R, gx, gy); return `<g transform="translate(${f1(x)} ${f1(y)})">${box({ u: -0.04, v: -0.04, w: 0.08, d: 0.08, h: 36, ...shades(WOOD_D) })}<ellipse cx="0" cy="-37" rx="6" ry="3" fill="${SNOW}"/></g>`; }).join('');
  return ps + rails;
}
const drift = (gx, gy, s = 1) => { const [x, y] = proj(R, gx, gy); return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${46 * s}" ry="${18 * s}" fill="#EDF1FC"/><ellipse cx="${f1(x - 10 * s)}" cy="${f1(y - 4 * s)}" rx="${22 * s}" ry="${7 * s}" fill="#fff" opacity=".8"/><path d="M${f1(x - 40 * s)} ${f1(y + 6 * s)} Q${f1(x)} ${f1(y + 18 * s)} ${f1(x + 40 * s)} ${f1(y + 6 * s)}" stroke="#BCC6E4" stroke-width="2" fill="none"/>`; };
const steps = (pts) => pts.map(([gx, gy], i) => { const [x, y] = proj(R, gx, gy); return `<ellipse cx="${f1(x + (i % 2 ? 7 : -7))}" cy="${f1(y)}" rx="5" ry="3" fill="#B9C2E2"/>`; }).join('');
const pathAttr = 'fill="#C6CEEA" stroke="#C6CEEA" stroke-width="22" stroke-linejoin="round"';

const bg = (w) => {
  const snow = w.weather === 'snow';
  const tile = `patternUnits="userSpaceOnUse" patternTransform="matrix(64,32,-64,32,${R.ox},${R.oy})"`;
  const [fx, fy] = proj(R, 5.0, 4.8), [l1x, l1y] = proj(R, 2.0, 2.7), [l2x, l2y] = proj(R, 9.1, 5.8);
  return svg(1600, 900, `
  <defs>
    <linearGradient id="lk-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${snow ? '#262A55' : '#151840'}"/><stop offset=".55" stop-color="${snow ? '#3E4178' : '#2B2E6E'}"/><stop offset="1" stop-color="${snow ? '#5E5A90' : '#54498E'}"/></linearGradient>
    <linearGradient id="lk-aur1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FF0D2" stop-opacity="0"/><stop offset=".5" stop-color="#7FF0D2" stop-opacity=".6"/><stop offset="1" stop-color="#7FF0D2" stop-opacity="0"/></linearGradient>
    <linearGradient id="lk-aur2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9B8F2" stop-opacity="0"/><stop offset=".5" stop-color="#C9B8F2" stop-opacity=".55"/><stop offset="1" stop-color="#C9B8F2" stop-opacity="0"/></linearGradient>
    <linearGradient id="lk-aur3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC8EE" stop-opacity="0"/><stop offset=".5" stop-color="#9CC8EE" stop-opacity=".45"/><stop offset="1" stop-color="#9CC8EE" stop-opacity="0"/></linearGradient>
    <radialGradient id="lk-moon"><stop offset="0" stop-color="#FFF6D2" stop-opacity=".5"/><stop offset="1" stop-color="#FFF6D2" stop-opacity="0"/></radialGradient>
    <radialGradient id="lk-fire"><stop offset="0" stop-color="#FFC36A" stop-opacity=".55"/><stop offset=".5" stop-color="#FFB86A" stop-opacity=".2"/><stop offset="1" stop-color="#FFB86A" stop-opacity="0"/></radialGradient>
    <radialGradient id="lk-lamp"><stop offset="0" stop-color="#FFE9A0" stop-opacity=".5"/><stop offset="1" stop-color="#FFE9A0" stop-opacity="0"/></radialGradient>
    <linearGradient id="lk-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E64A8" stop-opacity="0"/><stop offset=".4" stop-color="#6E64A8" stop-opacity=".75"/><stop offset="1" stop-color="#8A7FC0"/></linearGradient>
    <pattern id="lk-sn" width="1" height="1" ${tile}>
      <circle cx=".2" cy=".3" r=".028" fill="#B9C5E6"/><circle cx=".72" cy=".62" r=".022" fill="#B9C5E6"/><circle cx=".5" cy=".12" r=".022" fill="#fff"/><circle cx=".86" cy=".2" r=".018" fill="#fff" opacity=".8"/></pattern>
  </defs>
  <rect width="1600" height="900" fill="url(#lk-night)"/>
  <g fill="#FFF8D6" opacity="${snow ? 0.5 : 1}">${Array.from({ length: snow ? 36 : 90 }, (_, i) => `<circle class="twinkle-s" style="animation-delay:-${(i % 7) * 0.4}s" cx="${(i * 233) % 1600}" cy="${(i * 97) % 500}" r="${1 + (i % 3) * 0.8}"/>`).join('')}</g>
  ${snow ? '' : [[310, 60], [720, 120], [1180, 50], [1500, 210], [90, 300]].map(([x, y], i) => `<g class="twinkle-s" style="animation-delay:-${i * 0.6}s">${starPath(x, y, 7, '#FFF3B0')}</g>`).join('')}
  <g opacity="${snow ? 0.45 : 1}">
    <g class="aurora"><path d="M-40 250 Q200 80 480 190 T1000 150 T1640 210 L1640 320 Q1300 250 1000 270 T480 310 T-40 370 Z" fill="url(#lk-aur1)"/></g>
    <g class="aurora2"><path d="M-40 150 Q300 30 600 130 T1200 90 T1640 140 L1640 220 Q1300 170 1200 190 T600 220 T-40 250 Z" fill="url(#lk-aur2)"/></g>
    <g class="aurora"><path d="M-40 350 Q320 240 760 300 T1640 270 L1640 330 Q1200 320 800 350 T-40 410 Z" fill="url(#lk-aur3)"/></g>
  </g>
  <circle cx="200" cy="130" r="120" fill="url(#lk-moon)"/><circle cx="200" cy="130" r="48" fill="#FFF6D2"/><circle cx="184" cy="116" r="9" fill="#F0E6B8"/><circle cx="216" cy="146" r="12" fill="#F0E6B8"/><circle cx="214" cy="110" r="5" fill="#F0E6B8"/>
  ${snow ? `<g fill="#8A8DB8" opacity=".55"><ellipse cx="300" cy="90" rx="280" ry="50"/><ellipse cx="1000" cy="60" rx="320" ry="50"/><ellipse cx="1450" cy="150" rx="240" ry="44"/></g><rect width="1600" height="900" fill="#AEB6CF" opacity=".14"/>` : ''}
  <path d="M-20 540 L130 400 L240 470 L380 350 L540 480 L720 410 L920 480 L1090 370 L1240 450 L1390 360 L1520 440 L1640 390 V640 H-20 Z" fill="#34386F"/>
  <path d="M130 400 L162 432 L142 438 L112 418 Z M380 350 L418 392 L392 400 L356 374 Z M1090 370 L1126 410 L1100 418 L1066 392 Z M1390 360 L1424 398 L1400 406 L1368 382 Z" fill="#B7C0E2" opacity=".85"/>
  <path d="M-20 580 Q180 500 380 545 T780 525 T1200 535 T1640 515 V720 H-20 Z" fill="#43458A"/>
  <g fill="#FFE9A0">${[[60, 596], [92, 606], [130, 590], [1420, 586], [1470, 598], [1520, 580], [1556, 604], [170, 612]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/><circle cx="${x}" cy="${y}" r="8" opacity=".25"/>`).join('')}</g>
  <rect y="560" width="1600" height="340" fill="url(#lk-mist)"/>
  <g fill="#A9A0D6" opacity=".55"><ellipse cx="130" cy="770" rx="180" ry="40"/><ellipse cx="320" cy="850" rx="150" ry="32"/><ellipse cx="1440" cy="780" rx="180" ry="42"/><ellipse cx="1250" cy="860" rx="150" ry="30"/></g>
  ${groundShell(R, { top: '#D9E0F4', pattern: 'lk-sn', sideL: '#8E6E5A', sideR: '#7A5C4C', layer: '#5A4038', depth: 46, edge: '#EEF2FC' })}
  ${snowLip()}
  <ellipse cx="${f1(fx)}" cy="${f1(fy)}" rx="280" ry="140" fill="url(#lk-fire)"/>
  <ellipse cx="${f1(l1x)}" cy="${f1(l1y)}" rx="130" ry="62" fill="url(#lk-lamp)"/><ellipse cx="${f1(l2x)}" cy="${f1(l2y)}" rx="130" ry="62" fill="url(#lk-lamp)"/>
  ${floorPoly(R, [[3.3, 4.8], [4.3, 3.1], [5.7, 3.1], [6.7, 4.0], [6.7, 5.6], [5.7, 6.5], [4.3, 6.5], [3.3, 5.6]], pathAttr)}
  ${floorPoly(R, [[4.4, 6.4], [5.4, 6.4], [5.6, 8], [4.3, 8]], pathAttr)}
  ${floorPoly(R, [[3.4, 2.3], [4.5, 2.3], [5.0, 3.3], [4.0, 3.3]], pathAttr)}
  ${floorPoly(R, [[6.3, 3.6], [8.6, 2.8], [9.2, 3.3], [6.9, 4.5]], pathAttr)}
  ${steps([[5.0, 7.8], [4.95, 7.45], [5.05, 7.1], [4.9, 6.75], [7.3, 3.9], [7.7, 3.7], [8.1, 3.5]])}
  ${fence()}
  ${drift(1.0, 1.0, 0.9)}${drift(5.1, 0.9, 0.7)}${drift(0.6, 3.6, 0.7)}${drift(1.0, 7.4, 1)}${drift(9.5, 7.2, 1)}${drift(9.5, 4.6, 0.7)}${drift(2.5, 7.6, 0.8)}${drift(6.6, 7.6, 0.7)}`);
};

// ---------- connect the stars ----------
const CONSTELLATIONS = [
  { name: 'The Bunny 🐰', pts: [[150, 180], [190, 150], [200, 90], [220, 40], [240, 100], [270, 140], [330, 150], [360, 190], [300, 210], [190, 210]] },
  { name: 'The Big Star ⭐', pts: [[260, 30], [300, 110], [390, 120], [320, 170], [350, 250], [260, 205], [170, 250], [200, 170], [130, 120], [220, 110]] },
  { name: 'The Cat 🐱', pts: [[170, 100], [180, 40], [220, 80], [290, 80], [330, 40], [340, 100], [330, 170], [260, 220], [180, 170]] },
];
function starGame(api) {
  api.modal((card) => {
    let level = 0, next = 0;
    card.innerHTML += `<h2>Connect the stars</h2><p class="m-status">Tap the stars in order: 1, 2, 3…</p><div class="skyhold"></div>`;
    const hold = card.querySelector('.skyhold'), status = card.querySelector('.m-status');
    function draw() {
      const c = CONSTELLATIONS[level];
      const done = next >= c.pts.length;
      const lines = c.pts.slice(0, Math.max(0, next)).map((p, i, a) => (i ? `<line x1="${a[i - 1][0]}" y1="${a[i - 1][1]}" x2="${p[0]}" y2="${p[1]}"/>` : '')).join('')
        + (done ? `<line x1="${c.pts[c.pts.length - 1][0]}" y1="${c.pts[c.pts.length - 1][1]}" x2="${c.pts[0][0]}" y2="${c.pts[0][1]}"/>` : '');
      hold.innerHTML = `<svg class="sky-game" viewBox="0 0 520 280">
        ${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 89) % 520}" cy="${(i * 53) % 280}" r="1.2" fill="#fff" opacity=".5"/>`).join('')}
        <g stroke="#9EDDD4" stroke-width="4" stroke-linecap="round">${lines}</g>
        ${c.pts.map(([x, y], i) => `<g class="sdot" data-i="${i}"><circle cx="${x}" cy="${y}" r="20" fill="transparent"/>
          ${starPath(x, y, i < next ? 13 : 11, i < next ? '#F7D24A' : (i === next ? '#FFFFFF' : '#C9C3E6'))}
          <text x="${x + 14}" y="${y - 12}" font-family="Fredoka, sans-serif" font-size="15" font-weight="600" fill="#FFF3B0">${i < next ? '' : i + 1}</text></g>`).join('')}
        ${done ? `<text x="260" y="268" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="600" font-size="24" fill="#F7D24A">${c.name}</text>` : ''}
      </svg>${done ? `<button class="btn m-next">${level < CONSTELLATIONS.length - 1 ? 'Next constellation ▶' : 'Play again'}</button>` : ''}`;
      hold.querySelectorAll('.sdot').forEach((g) => { g.onclick = () => tap(+g.dataset.i); });
      const nb = hold.querySelector('.m-next');
      if (nb) nb.onclick = () => { level = (level + 1) % CONSTELLATIONS.length; next = 0; status.textContent = 'Tap the stars in order: 1, 2, 3…'; draw(); };
    }
    function tap(i) {
      const c = CONSTELLATIONS[level];
      if (i !== next) { status.textContent = `Find star number ${next + 1}! ✨`; api.sfx.drop(); return; }
      next++; api.sfx.click();
      if (next >= c.pts.length) {
        api.sfx.win(); status.textContent = `You found ${c.name}!`;
        // the prize star lands on the wooden deck, next to the telescope
        api.earn(5); if (level === CONSTELLATIONS.length - 1 && !api.starFound('lookout-sky')) { api.addStar('lookout-sky', 0, 0, { spawned: true, gx: 4.25, gy: 1.5, gz: 14 }); status.textContent += ' A star fell from the sky! ⭐'; }
        else if (level < CONSTELLATIONS.length - 1) status.textContent += ` (${level + 1} of ${CONSTELLATIONS.length})`;
      }
      draw();
    }
    draw();
  });
}

// ---------- props ----------
const observatory = (it) => {
  const open = !!it?.data.open;
  const [cx, cy] = at(1.5, 1.5);
  const by = cy - 158, db = by - 6;
  let s = shadow(cx, cy + 10, 178, 76) + cyl(cx, cy, 150, 18, '#A9B1CF');
  s += box({ u: 2.3, v: 2.3, w: 0.55, d: 0.55, h: 10, ...shades('#A9B1CF'), topDecor: '<ellipse cx=".28" cy=".28" rx=".2" ry=".14" fill="#F4F7FF"/>' });
  s += cyl(cx, cy - 18, 118, 140, '#E3E8F6');
  s += [35, 70, 105].map((k) => `<path d="M${cx - 118} ${cy - 18 - k} A118 59 0 0 0 ${cx + 118} ${cy - 18 - k}" stroke="#C3CBE4" stroke-width="2" fill="none"/>`).join('');
  s += [[-76, -64], [74, -60]].map(([dx, dy]) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="28" fill="#FFE9A0" opacity=".22"/><ellipse cx="${cx + dx}" cy="${cy + dy}" rx="11" ry="15" fill="#FFE9A0" ${LN}/><path d="M${cx + dx} ${cy + dy - 15} V${cy + dy + 15} M${cx + dx - 11} ${cy + dy} H${cx + dx + 11}" stroke="#E3E8F6" stroke-width="2.4"/>`).join('');
  s += `<circle cx="${cx}" cy="${cy + 6}" r="44" fill="#FFE9A0" opacity=".14"/>
    <path d="M${cx - 24} ${cy + 41} V${cy - 18} A24 24 0 0 1 ${cx + 24} ${cy - 18} V${cy + 41} Z" fill="#7A64B0" ${LN}/>
    <path d="M${cx - 8} ${cy + 40} V${cy - 30} M${cx + 8} ${cy + 40} V${cy - 30}" stroke="#5E4E9A" stroke-width="2"/><circle cx="${cx + 15}" cy="${cy + 10}" r="3" fill="${SUN}"/>
    <circle cx="${cx}" cy="${cy - 52}" r="11" fill="none" stroke="#2F6E55" stroke-width="7"/><circle cx="${cx}" cy="${cy - 52}" r="11" fill="none" stroke="#5FAE8A" stroke-width="4.5"/><path d="M${cx - 6} ${cy - 44} l6 5 l6 -5 l-3 9 l-3 -4 l-3 4 z" fill="${LILAC}"/>`;
  s += cyl(cx, by + 4, 124, 10, '#8E7CC8');
  s += `<path d="M${cx - 120} ${db} A120 112 0 0 1 ${cx + 120} ${db} A120 60 0 0 1 ${cx - 120} ${db} Z" fill="#A9C4EC" ${LN}/>
    <path d="M${cx + 30} ${f1(db + 58.1)} Q${cx + 40} ${db - 90} ${cx} ${db - 112} A120 112 0 0 1 ${cx + 120} ${db} A120 60 0 0 1 ${cx + 30} ${f1(db + 58.1)} Z" fill="#3E3252" opacity=".1"/>
    ${[-0.72, -0.38, 0.5, 0.8].map((t) => `<path d="M${f1(cx + 120 * t)} ${f1(db + 60 * Math.sqrt(1 - t * t))} Q${f1(cx + 122 * t)} ${db - 84} ${cx} ${db - 112}" stroke="#86A6DA" stroke-width="2" fill="none"/>`).join('')}`;
  const b1 = [cx + 2.4, db + 60], b2 = [cx + 31.2, f1(db + 57.9)];
  s += `<path d="M${XY(b1)} Q${cx + 3} ${db - 70} ${cx + 1} ${db - 108} L${cx + 9} ${db - 106} Q${cx + 34} ${db - 60} ${XY(b2)} Z" fill="${open ? '#1E2150' : '#8FA8DA'}" ${LN}/>`;
  if (open) {
    s += `<polygon points="${P([[cx + 6, db - 40], [cx + 170, db - 210], [cx + 230, db - 160], [cx + 22, db - 20]])}" fill="#FFF3B0" opacity=".1"/>
      <g fill="#FFF3B0">${[[8, -80], [14, -40], [20, -12], [6, -60]].map(([dx, dy]) => `<circle cx="${cx + dx}" cy="${db + dy}" r="1.6"/>`).join('')}</g>
      <g transform="translate(${cx + 16} ${db - 30}) rotate(-40)"><rect x="-8" y="-9" width="80" height="18" rx="7" fill="${LILAC}" ${LN}/><rect x="64" y="-11" width="14" height="22" rx="4" fill="#9A80D8" ${LN}/><path d="M4 -4 H58" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/></g>`;
  } else {
    s += `<g fill="#6F86BE">${[0.25, 0.45, 0.65].map((t) => `<circle cx="${f1(cx + 5 + 2 * t)}" cy="${f1(db + 60 - 168 * t)}" r="1.8"/><circle cx="${f1(cx + 31 - 20 * t)}" cy="${f1(db + 58 - 166 * t)}" r="1.8"/>`).join('')}</g>`;
  }
  s += `<path d="M${cx - 42} ${db - 100} Q${cx} ${db - 128} ${cx + 42} ${db - 100} Q${cx + 20} ${db - 92} ${cx} ${db - 96} Q${cx - 20} ${db - 90} ${cx - 42} ${db - 100} Z" fill="${SNOW}"/>
    <path d="M${cx} ${db - 112} V${db - 140}" stroke="${IRON}" stroke-width="3"/>${starPath(cx, db - 147, 9, SUN, LN)}`;
  for (let i = 0; i <= 10; i++) {
    const t = -0.92 + i * 0.184, x = cx + 124 * t, y = by + 4 + 62 * Math.sqrt(1 - t * t) + 4, c = PAL[i % 4];
    s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="8" fill="${c}" opacity=".35"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="3" ry="4.2" fill="${c}" ${line}/>`;
  }
  return item(3, 3, 300, s);
};
const deck = () => {
  const lantern = (u, v) => { const [x, y] = at(u, v, 14); return `<circle cx="${f1(x)}" cy="${f1(y - 14)}" r="22" fill="#FFE9A0" opacity=".25"/><rect x="${f1(x - 7)}" y="${f1(y - 24)}" width="14" height="22" rx="3" fill="#FFE9A0" ${LN}/><path d="M${f1(x - 9)} ${f1(y - 24)} L${f1(x)} ${f1(y - 33)} L${f1(x + 9)} ${f1(y - 24)} Z" fill="${IRON}" ${LN}/>`; };
  return item(2.4, 1.8, 50, `${box({ u: 0, v: 0, w: 2.4, d: 1.8, h: 14, ...shades(WOOD),
    topDecor: `<path d="${Array.from({ length: 7 }, (_, i) => `M${f1(0.3 * (i + 1))} 0 V1.8`).join(' ')}" stroke="#8B6450" stroke-opacity=".45" stroke-width=".018"/>
      <ellipse cx=".25" cy=".3" rx=".22" ry=".18" fill="#F4F7FF"/><ellipse cx="2.1" cy=".25" rx=".26" ry=".16" fill="#F4F7FF"/><ellipse cx="2.2" cy="1.5" rx=".18" ry=".22" fill="#F4F7FF" opacity=".9"/>`,
    leftDecor: '<path d="M0 7 H153.6" stroke="#8B6450" stroke-width="1.5"/>', rightDecor: '<path d="M0 7 H115.2" stroke="#8B6450" stroke-width="1.5"/>' })}
    ${lantern(0.18, 1.62)}${lantern(2.22, 1.62)}`);
};
const telescope = () => {
  const [cx, cy] = at(0.45, 0.45, 14), hx = cx, hy = cy - 74;
  const legs = `M${hx} ${hy} L${cx - 30} ${cy + 6} M${hx} ${hy} L${cx + 28} ${cy + 4} M${hx} ${hy} L${cx + 4} ${cy + 16}`;
  return item(0.9, 0.9, 150, `${shadow(cx, cy + 8, 40, 14)}
    <path d="${legs}" stroke="#2A2448" stroke-opacity=".7" stroke-width="8" stroke-linecap="round"/><path d="${legs}" stroke="${IRON}" stroke-width="5" stroke-linecap="round"/>
    <g transform="translate(${hx} ${hy}) rotate(-30)"><rect x="-62" y="-6" width="18" height="12" rx="3" fill="${IRON}" ${LN}/>
      <rect x="-46" y="-12" width="112" height="24" rx="10" fill="${LILAC}" ${LN}/><rect x="0" y="-12" width="6" height="24" fill="${SUN}"/><rect x="34" y="-12" width="6" height="24" fill="${SUN}"/>
      <rect x="58" y="-15" width="18" height="30" rx="6" fill="#9A80D8" ${LN}/><ellipse cx="76" cy="0" rx="4" ry="12" fill="#DDF1FA" ${LN}/>
      <path d="M-34 -6 H52" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/></g>
    <circle cx="${hx}" cy="${hy}" r="8" fill="${SUN}" ${LN}/>
    ${planeL(-0.25, 0.95, 48, `<path d="M8 26 V48 M62 26 V48" stroke="${WOOD_D}" stroke-width="3"/><rect width="70" height="26" rx="6" fill="${CREAM}" ${LN}/>${text(35, 17, 'Tap to look!', 10, '#7A64B0')}<path d="M4 1 H66" stroke="${SNOW}" stroke-width="4" stroke-linecap="round"/>`)}`);
};
const campfire = () => {
  const [cx, cy] = at(0.6, 0.6);
  let back = '', front = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, x = cx + 50 * Math.cos(a), y = cy + 25 * Math.sin(a);
    const st = `<ellipse cx="${f1(x)}" cy="${f1(y - 3)}" rx="11" ry="8" fill="${i % 2 ? '#B9C0D4' : '#A7AECB'}" ${LN}/><ellipse cx="${f1(x - 2)}" cy="${f1(y - 8)}" rx="6" ry="2.6" fill="${SNOW}"/>`;
    if (Math.sin(a) < 0) back += st; else front += st;
  }
  const log = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#2A2448" stroke-opacity=".6" stroke-width="15" stroke-linecap="round"/><path d="M${x1} ${y1} L${x2} ${y2}" stroke="${BARK}" stroke-width="12" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="5" fill="${WOOD_L}"/>`;
  return item(1.2, 1.2, 140, `<circle cx="${cx}" cy="${cy - 24}" r="100" fill="#FFC36A" opacity=".16"/>${back}
    <ellipse cx="${cx}" cy="${cy}" rx="40" ry="19" fill="#4A4470"/><g fill="#F0A060">${[[-16, 4], [10, 8], [20, -2], [-6, -6]].map(([dx, dy]) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="3"/>`).join('')}</g>
    ${log(cx - 34, cy + 8, cx + 30, cy - 12)}${log(cx + 32, cy + 8, cx - 30, cy - 10)}
    <g class="flame"><g transform="translate(${cx - 62} ${f1(cy - 91)}) scale(.62)">
      <path d="M100 140 C50 120 60 60 86 30 C86 60 106 56 102 20 C140 50 150 110 100 140 Z" fill="#F0A060"/>
      <path d="M100 140 C76 128 78 92 94 74 C96 96 110 92 108 76 C124 96 124 126 100 140 Z" fill="${SUN}"/>
      <path d="M100 138 C90 130 90 112 98 104 C100 116 108 116 108 108 C114 120 110 134 100 138 Z" fill="#FFF8DC"/></g></g>
    ${front}
    <g fill="#FFD27A">${[[-14, -96], [12, -112], [-4, -128], [18, -86]].map(([dx, dy], i) => `<circle class="twinkle-s" style="animation-delay:-${i * 0.5}s" cx="${cx + dx}" cy="${cy + dy}" r="2.2"/>`).join('')}</g>`);
};
const logSeat = () => {
  const a = at(0.3, 0.15, 17), b = at(0.3, 1.45, 17);
  const ln = (col, w, dy = 0, extra = '') => `<path d="M${f1(a[0])} ${f1(a[1] + dy)} L${f1(b[0])} ${f1(b[1] + dy)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none" ${extra}/>`;
  return item(0.6, 1.6, 60, `${shadow(...at(0.3, 0.8), 64, 22)}
    ${ln('#4E3A48', 37)}${ln('#A87A5A', 33)}${ln(BARK, 2, 7)}${ln(BARK, 2, -3)}${ln(WOOD, 5, -10)}${ln(SNOW, 6, -15, 'stroke-dasharray="30 18"')}
    <g transform="matrix(1,0.5,0,1,${f1(b[0])},${f1(b[1])})"><circle r="16" fill="${WOOD_L}" ${LN}/><circle r="10" fill="none" stroke="${WOOD}" stroke-width="2"/><circle r="4" fill="none" stroke="${WOOD}" stroke-width="2"/></g>`);
};
const stump = () => {
  const [cx, cy] = at(0.3, 0.3);
  return item(0.6, 0.6, 50, `${shadow(cx, cy + 3, 32, 13)}${cyl(cx, cy, 24, 26, '#A87A5A', WOOD_L)}
    <ellipse cx="${cx}" cy="${cy - 26}" rx="15" ry="7.5" fill="none" stroke="${WOOD}" stroke-width="2"/><ellipse cx="${cx}" cy="${cy - 26}" rx="7" ry="3.5" fill="none" stroke="${WOOD}" stroke-width="2"/>
    <path d="M${cx - 18} ${cy - 30} Q${cx - 6} ${cy - 38} ${cx + 4} ${cy - 34}" stroke="${SNOW}" stroke-width="5" fill="none" stroke-linecap="round"/>`);
};
const blanket = () => {
  let fr = '';
  for (let u = 0.06; u < 2; u += 0.12) { const [x, y] = at(u, 1.5); fr += `M${f1(x)} ${f1(y)} v5 `; }
  for (let v = 0.06; v < 1.5; v += 0.12) { const [x, y] = at(2, v); fr += `M${f1(x)} ${f1(y)} v5 `; }
  return item(2.0, 1.5, 10, `${box({ u: 0, v: 0, w: 2, d: 1.5, h: 3, ...shades(LILAC),
    topDecor: '<path d="M.4 0 V1.5 M.8 0 V1.5 M1.2 0 V1.5 M1.6 0 V1.5" stroke="#fff" stroke-opacity=".45" stroke-width=".1"/><path d="M0 .375 H2 M0 .75 H2 M0 1.125 H2" stroke="#7FCFC4" stroke-opacity=".7" stroke-width=".08"/><rect x=".08" y=".08" width="1.84" height="1.34" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width=".03" stroke-dasharray=".08 .06"/>' })}
    <path d="${fr}" stroke="#9A80D8" stroke-width="2" stroke-linecap="round"/>`);
};
const owlPost = () => {
  const [cx, cy] = at(0.25, 0.25, 150);
  return item(0.5, 0.5, 240, `${shadow(...at(0.25, 0.25), 26, 10)}
    ${box({ u: 0.17, v: 0.17, w: 0.16, d: 0.16, h: 150, ...shades(WOOD_D) })}
    ${planeL(0.33, 0.33, 118, `<path d="M0 0 H70 L82 12 L70 24 H0 Z" fill="${WOOD_L}" ${LN}/>${text(38, 17, 'Lookout', 12, '#7A64B0')}<path d="M2 1 H68" stroke="${SNOW}" stroke-width="4" stroke-linecap="round"/>`)}
    <g transform="translate(${f1(cx - 34)} ${f1(cy - 75.6)}) scale(.62)">
      <ellipse cx="55" cy="74" rx="40" ry="48" fill="#C99772" ${LN}/><ellipse cx="55" cy="86" rx="26" ry="30" fill="#F3D2B8"/>
      <path d="M18 40 L22 12 L40 30 Z M92 40 L88 12 L70 30 Z" fill="#C99772" ${LN}/>
      <circle cx="38" cy="50" r="16" fill="#fff" ${LN}/><circle cx="72" cy="50" r="16" fill="#fff" ${LN}/>
      <circle cx="40" cy="52" r="8" fill="${INK}"/><circle cx="70" cy="52" r="8" fill="${INK}"/><circle cx="42" cy="49" r="3" fill="#fff"/><circle cx="72" cy="49" r="3" fill="#fff"/>
      <path d="M50 64 L60 64 L55 74 Z" fill="#F0A060" ${LN}/>
      <path d="M44 92 l6 6 6 -6 6 6 M44 104 l6 6 6 -6 6 6" stroke="#C99772" stroke-width="2.4" fill="none"/>
      <path d="M40 120 l-4 4 M48 121 l0 5 M62 121 l0 5 M70 120 l4 4" stroke="#F0A060" stroke-width="3" stroke-linecap="round"/></g>`);
};
const lamp = (it) => {
  const on = it?.data.on !== false;
  const [cx, cy] = at(0.2, 0.2, 168);
  return item(0.4, 0.4, 215, `${shadow(...at(0.2, 0.2), 22, 9)}
    ${box({ u: 0.06, v: 0.06, w: 0.28, d: 0.28, h: 12, ...shades(IRON) })}${box({ u: 0.16, v: 0.16, w: 0.08, d: 0.08, z: 12, h: 156, ...shades(IRON) })}
    ${on ? `<circle cx="${cx}" cy="${cy - 18}" r="70" fill="#FFF0A8" opacity=".22"/><circle cx="${cx}" cy="${cy - 18}" r="34" fill="#FFF0A8" opacity=".25"/>` : ''}
    <rect x="${cx - 4}" y="${cy - 2}" width="8" height="6" fill="${IRON}"/>
    <path d="M${cx - 13} ${cy - 2} L${cx - 16} ${cy - 30} H${cx + 16} L${cx + 13} ${cy - 2} Z" fill="${on ? '#FFE9A0' : '#9D98BE'}" ${LN}/>
    <path d="M${cx} ${cy - 2} V${cy - 30}" stroke="${IRON}" stroke-width="2"/>
    <path d="M${cx - 21} ${cy - 30} L${cx} ${cy - 46} L${cx + 21} ${cy - 30} Z" fill="${IRON}" ${LN}/>
    <path d="M${cx - 18} ${cy - 32} Q${cx} ${cy - 50} ${cx + 18} ${cy - 32}" stroke="${SNOW}" stroke-width="5" fill="none" stroke-linecap="round"/>`);
};
const snowman = () => {
  const [cx, cy] = at(0.35, 0.35);
  return item(0.7, 0.7, 150, `${shadow(cx, cy + 2, 40, 15)}
    <circle cx="${cx}" cy="${cy - 30}" r="32" fill="#F4F7FF" ${LN}/><path d="M${cx + 6} ${cy - 60} A32 32 0 0 1 ${cx + 30} ${cy - 18} Q${cx + 14} ${cy - 30} ${cx + 6} ${cy - 60} Z" fill="#B9C5E6" opacity=".6"/>
    <path d="M${cx - 18} ${cy - 76} L${cx - 46} ${cy - 96} M${cx - 38} ${cy - 90} l-4 -10 M${cx + 18} ${cy - 76} L${cx + 46} ${cy - 92} M${cx + 38} ${cy - 88} l6 -9" stroke="${BARK}" stroke-width="4" stroke-linecap="round" fill="none"/>
    <circle cx="${cx}" cy="${cy - 80}" r="24" fill="#F4F7FF" ${LN}/>
    ${[0, 1, 2].map((k) => `<circle cx="${cx}" cy="${cy - 92 + k * 11}" r="3" fill="${IRON}"/>`).join('')}
    <circle cx="${cx}" cy="${cy - 118}" r="18" fill="#F4F7FF" ${LN}/>
    <path d="M${cx - 18} ${cy - 104} Q${cx} ${cy - 96} ${cx + 18} ${cy - 104} L${cx + 18} ${cy - 97} Q${cx} ${cy - 89} ${cx - 18} ${cy - 97} Z" fill="${SUN}" ${LN}/><path d="M${cx + 8} ${cy - 96} l4 22 l-7 0 l-3 -20 z" fill="${SUN}" ${LN}/>
    <path d="M${cx - 17} ${cy - 124} C${cx - 18} ${cy - 150} ${cx + 18} ${cy - 150} ${cx + 17} ${cy - 124} Z" fill="${TEAL}" ${LN}/><rect x="${cx - 19}" y="${cy - 128}" width="38" height="8" rx="4" fill="#5FB3A8" ${LN}/><circle cx="${cx}" cy="${cy - 148}" r="6" fill="${CREAM}" ${LN}/>`);
};
const sled = () => {
  const runner = (v) => `<path d="M${XY(at(0.05, v, 3))} L${XY(at(1.05, v, 3))} Q${XY(at(1.28, v, 3))} ${XY(at(1.2, v, 22))}" stroke="${IRON}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  const [rx, ry] = at(1.12, 0.06, 16), [qx, qy] = at(1.12, 0.44, 16), [kx, ky] = at(1.6, 0.6, 0);
  return item(1.2, 0.5, 40, `${shadow(...at(0.6, 0.25), 60, 16)}${runner(0.08)}
    ${box({ u: 0.1, v: 0.04, w: 0.06, d: 0.42, z: 3, h: 7, ...shades(IRON) })}${box({ u: 0.9, v: 0.04, w: 0.06, d: 0.42, z: 3, h: 7, ...shades(IRON) })}
    ${box({ u: 0.06, v: 0.02, w: 1.04, d: 0.46, z: 10, h: 5, ...shades(WOOD), topDecor: '<path d="M0 .12 H1.04 M0 .23 H1.04 M0 .34 H1.04" stroke="#A87A5A" stroke-width=".02"/><ellipse cx=".3" cy=".18" rx=".2" ry=".1" fill="#F4F7FF"/>' })}
    ${runner(0.42)}
    <path d="M${f1(rx)} ${f1(ry)} Q${f1(kx)} ${f1(ky)} ${f1(qx)} ${f1(qy)}" stroke="${LILAC}" stroke-width="3" fill="none"/>`);
};
const pineItem = (s) => () => { const [cx, cy] = at(0.4, 0.4); return item(0.8, 0.8, 230 * s, `${shadow(cx, cy + 3, 56 * s, 22 * s)}${tree(cx, cy, s)}`); };

const I = isoDef;
// Spawned food from common.js is drawn at flat-scene size; scale it to the diorama.
const shrink = (api, it, k) => { it.w *= k; it.h *= k; it.ax *= k; it.ay *= k; it.el.style.width = it.w + 'px'; it.el.style.height = it.h + 'px'; api.place(it); return it; };
const boing = (it) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); };
const [bsx, bsy] = proj(R, 7.3, 6.05); // under the middle of the blanket

export const LOOKOUT = {
  id: 'lookout', posKey: 'lookout-iso', light: 'night', title: 'Starry Lookout 🔭', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, outdoor: true,
  iso: R, avatar: [3.9, 3.0],
  frame: 'linear-gradient(#151840, #2B2E6E 55%, #3C3577)',
  bg,
  // screen x/y (not gx/gy) on purpose: z 3 keeps the star under the blanket (floor items sit at z 5)
  stars: [{ id: 'lookout-blanket', x: f1(bsx - 32), y: f1(bsy - 40), z: 3 }],
  characters: [{ id: 'juno', look: NPC_WINTER.juno, gx: 6.6, gy: 4.1, say: ['Look at the northern lights! ✨', 'Try the telescope — connect the stars!', 'Tap the owl... it knows secrets 🦉'] }],
  items: [
    I('deck', 2.4, 0.4, 2.4, 1.8, deck, { floor: true, drag: false }),
    I('blanket', 6.3, 5.3, 2.0, 1.5, blanket, { floor: true }),
    I('telescope', 3.2, 0.7, 0.9, 0.9, telescope, { drag: false, onTap: (it, api) => starGame(api) }),
    I('observatory', 6.6, 0.3, 3, 3, observatory, {
      drag: false, data: { open: false },
      onTap: (it, api) => {
        it.data.open = !it.data.open; api.setArt(it); api.sfx.click();
        if (it.data.open) { api.sparkle(it.x + it.w / 2 + 20, it.y + 60, ['✨', '⭐', '🌙']); api.bubble(it.x + it.w / 2, it.y + 40, 'The dome opens! Try the little telescope 🔭'); }
      },
    }),
    I('campfire', 4.4, 4.2, 1.2, 1.2, campfire, {
      drag: false,
      onTap: (it, api) => {
        if (api.count('marshmallow') >= 2) { api.bubble(it.x + it.w / 2, it.y, 'Eat those first! 🔥'); return; }
        api.sfx.pour(); api.bubble(it.x + it.w / 2, it.y, 'Toasting... 🔥');
        it.el.classList.add('roar'); api.later(() => it.el.classList.remove('roar'), 900);
        api.later(() => {
          // the toasted marshmallow lands on the log seat (wherever it was dragged)
          const log = api.get('log'), n = api.count('marshmallow');
          shrink(api, food(api, 'marshmallow', 0, 0, log ? { gx: log.gx + 0.15, gy: log.gy + 0.2 + n * 0.65, gz: 34 } : { gx: it.gx + 1.3, gy: it.gy + 0.3 + n * 0.5, gz: 0 }), 0.7);
        }, 900);
      },
    }),
    I('log', 2.7, 3.9, 0.6, 1.6, logSeat, { surface: 34 }),
    I('stump', 3.6, 6.0, 0.6, 0.6, stump, { surface: 26 }),
    I('owl', 0.6, 4.2, 0.5, 0.5, owlPost, {
      drag: false, data: { taps: 0 },
      onTap: (it, api) => {
        it.data.taps++;
        boing(it); api.sfx.boing();
        if (it.data.taps % 3 === 0) {
          api.bubble(it.x + it.w / 2, it.y, 'Hoo! Make a wish! 🌠');
          api.effect(1250, 110, 'shooting', `<svg viewBox="0 0 160 40" width="160" height="40"><path d="M10 30 L150 8" stroke="#FFF3B0" stroke-width="4" stroke-linecap="round"/>${starPath(150, 8, 10, '#F7D24A')}</svg>`, 1500);
        } else api.bubble(it.x + it.w / 2, it.y, 'Hoo hoo! 🦉');
      },
    }),
    I('lamp1', 1.8, 2.5, 0.4, 0.4, lamp, { drag: false, data: { on: true }, onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); } }),
    I('lamp2', 8.9, 5.6, 0.4, 0.4, lamp, { drag: false, data: { on: true }, onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); } }),
    I('pine1', 0.2, 0.2, 0.8, 0.8, pineItem(1), { drag: false }),
    I('pine2', 5.3, 0.2, 0.8, 0.8, pineItem(0.8), { drag: false }),
    I('pine3', 9.3, 4.4, 0.7, 0.7, pineItem(0.75), { drag: false }),
    I('pine4', 0.3, 6.7, 0.8, 0.8, pineItem(0.9), { drag: false }),
    I('snowman', 1.6, 6.3, 0.7, 0.7, snowman, { onTap: (it, api) => { boing(it); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y, '*brrr* ⛄'); } }),
    I('sled', 7.0, 7.1, 1.2, 0.5, sled),
  ],
};
