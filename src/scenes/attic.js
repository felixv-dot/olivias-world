// The Secret Attic above Olivia's room — finale of Chapter 1 "The Lost Star Map".
// Isometric "Unpacking" style like room.js. Also exports starMapSvg() for the quest journal.
import { room, roomShell, isoItem, at, shades, proj, isoDef, wallDef } from '../iso.js';
import { svg, text, starPath, stringLights } from './common.js';

const R = room({ cols: 8, rows: 7, ox: 768, oy: 384, wallH: 300 });
R.charScale = 0.6;

const WOOD = '#B9875C', WOOD_L = '#D9B48A', WOOD_D = '#8B5E3C', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', SKY = '#9CC8EE', SUN = '#F5DE7A';
const NIGHT = '#1F2456', GOLD = '#E9C46A', CARD = '#D8B07E';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4"';
const P = (p) => p.map((n) => n.toFixed(1)).join(',');
const pts = (arr) => arr.map(P).join(' ');

// 4-point twinkle star
const twinkle = (cx, cy, r, color, extra = '') => `<path d="M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r} Z" fill="${color}" ${extra}/>`;
// tiny deterministic random
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ======================= THE STAR MAP =======================
// Drawn in a 640×440 box (20px frame around a 600×400 map). Six jigsaw pieces: 3 columns × 2 rows.
const PIECES = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
const PW = 200;
const HSIGN = [1, -1, 1]; // tabs on the horizontal middle edge, per column
const VSIGN = [[-1, 1], [1, -1]]; // tabs on vertical edges x=200, x=400, per row

// one jigsaw edge from p to q (symmetric tab, so reversing = same curve with -sign)
function edge(p, q, sign) {
  const dx = q[0] - p[0], dy = q[1] - p[1];
  const nx = -dy, ny = dx; // normal (length = edge length)
  const m = (t, s) => P([p[0] + dx * t + nx * s * sign, p[1] + dy * t + ny * s * sign]);
  return ` L${m(0.34, 0)} C${m(0.40, 0)} ${m(0.42, -0.03)} ${m(0.39, -0.08)} C${m(0.35, -0.15)} ${m(0.40, -0.22)} ${m(0.5, -0.22)}`
    + ` C${m(0.60, -0.22)} ${m(0.65, -0.15)} ${m(0.61, -0.08)} C${m(0.58, -0.03)} ${m(0.60, 0)} ${m(0.66, 0)} L${P(q)}`;
}
function piecePath(k) {
  const i = k % 3, j = Math.floor(k / 3);
  const x0 = i * PW, y0 = j * PW, x1 = x0 + PW, y1 = y0 + PW;
  const A = [x0, y0], B = [x1, y0], C = [x1, y1], D = [x0, y1];
  let d = `M${P(A)}`;
  d += j > 0 ? edge(A, B, HSIGN[i]) : ` L${P(B)}`;
  d += i < 2 ? edge(B, C, VSIGN[i][j]) : ` L${P(C)}`;
  d += j < 1 ? edge(C, D, -HSIGN[i]) : ` L${P(D)}`;
  d += i > 0 ? edge(D, A, -VSIGN[i - 1][j]) : ` L${P(A)}`;
  return d + ' Z';
}
const PIECE_D = PIECES.map((_, k) => piecePath(k));
// visual centre of each piece (for the "?")
const pieceCenter = (k) => [(k % 3) * PW + PW / 2, Math.floor(k / 3) * PW + PW / 2];

// spiral galaxy arm as an SVG path
function arm(cx, cy, a0, rMax, squash, rot) {
  const cr = Math.cos(rot), sr = Math.sin(rot);
  let d = '';
  for (let r = 6; r <= rMax; r += 3) {
    const th = a0 + r / 34;
    const x = Math.cos(th) * r, y = Math.sin(th) * r * squash;
    d += (d ? 'L' : 'M') + (cx + x * cr - y * sr).toFixed(1) + ' ' + (cy + x * sr + y * cr).toFixed(1);
  }
  return d;
}
function armDots(cx, cy, a0, rMax, squash, rot, rand) {
  const cr = Math.cos(rot), sr = Math.sin(rot);
  let s = '';
  for (let r = 14; r <= rMax; r += 7) {
    const th = a0 + r / 34 + (rand() - 0.5) * 0.25;
    const rr = r + (rand() - 0.5) * 10;
    const x = Math.cos(th) * rr, y = Math.sin(th) * rr * squash;
    const col = ['#FFFFFF', '#FFF6C8', '#CFF3EE', '#E5DBFF'][Math.floor(rand() * 4)];
    s += `<circle cx="${(cx + x * cr - y * sr).toFixed(1)}" cy="${(cy + x * sr + y * cr).toFixed(1)}" r="${(0.8 + rand() * 1.8).toFixed(1)}" fill="${col}"/>`;
  }
  return s;
}

// the painted map itself (600×400, no frame)
function mapContent(u, complete) {
  const rand = rng(7);
  const GX = 300, GY = 205, ROT = -0.3;
  const stars = Array.from({ length: 110 }, () => {
    const x = rand() * 600, y = rand() * 400, r = 0.5 + rand() * 1.4;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#fff" opacity="${(0.45 + rand() * 0.55).toFixed(2)}"/>`;
  }).join('');
  const bright = [[40, 40, 6], [175, 160, 5], [250, 30, 4], [370, 20, 5], [575, 180, 6], [560, 25, 4], [30, 230, 5], [175, 385, 5], [420, 380, 6], [590, 390, 4], [215, 240, 4], [455, 230, 5]]
    .map(([x, y, r], i) => starPath(x, y, r, i % 3 ? '#FFF6C8' : '#CFF3EE')).join('');
  const arms = [0, Math.PI].map((a) => arm(GX, GY, a, 124, 0.62, ROT));
  const arms2 = [Math.PI / 2, -Math.PI / 2].map((a) => arm(GX, GY, a, 96, 0.62, ROT));
  const dotted = 'fill="none" stroke-linecap="round" stroke-dasharray="0.1 9"';
  const constel = (ptsArr, links) => `<g>${links.map(([a, b]) => `<line x1="${ptsArr[a][0]}" y1="${ptsArr[a][1]}" x2="${ptsArr[b][0]}" y2="${ptsArr[b][1]}" stroke="#CFE4FA" stroke-width="1.2" opacity=".55"/>`).join('')}${ptsArr.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 2.4 : 3.2}" fill="#fff"/>`).join('')}</g>`;
  return `
    <rect width="600" height="400" fill="url(#${u}-sky)"/>
    <ellipse cx="300" cy="205" rx="290" ry="120" fill="url(#${u}-neb1)" transform="rotate(-17 300 205)"/>
    <circle cx="120" cy="300" r="140" fill="url(#${u}-neb2)"/>
    <circle cx="480" cy="100" r="140" fill="url(#${u}-neb3)"/>
    ${stars}
    <!-- galaxy -->
    <g stroke-linecap="round" fill="none">
      ${arms2.map((d) => `<path d="${d}" stroke="${SKY}" stroke-width="18" opacity=".18"/><path d="${d}" stroke="#EDE6FF" stroke-width="3" opacity=".45"/>`).join('')}
      ${arms.map((d) => `<path d="${d}" stroke="${LILAC}" stroke-width="30" opacity=".16"/>`).join('')}
      ${arms.map((d) => `<path d="${d}" stroke="${TEAL}" stroke-width="15" opacity=".3"/>`).join('')}
      ${arms.map((d) => `<path d="${d}" stroke="#EDE6FF" stroke-width="5" opacity=".7"/>`).join('')}
    </g>
    ${[0, Math.PI, Math.PI / 2, -Math.PI / 2].map((a, i) => armDots(GX, GY, a, i < 2 ? 124 : 96, 0.62, ROT, rand)).join('')}
    <ellipse cx="${GX}" cy="${GY}" rx="70" ry="48" fill="url(#${u}-core)" transform="rotate(-17 ${GX} ${GY})"/>
    <circle cx="${GX}" cy="${GY}" r="9" fill="#FFFBE6"/>
    <!-- dotted travel paths -->
    <g stroke="${SUN}" stroke-width="3.6" ${dotted}>
      <path d="M118 104 Q190 150 ${GX - 14} ${GY - 6}"/>
      <path d="M${GX + 14} ${GY + 8} Q420 300 476 302"/>
      <path d="M118 288 Q200 250 ${GX - 12} ${GY + 10}"/>
      <path d="M${GX + 12} ${GY - 10} Q420 150 500 92"/>
    </g>
    <path d="M${GX} ${GY - 14} Q${GX + 10} 110 396 66" stroke="${complete ? '#FFE680' : SUN}" stroke-width="${complete ? 4.4 : 3.6}" ${dotted} opacity="${complete ? 1 : 0.8}"/>
    <!-- p1: ringed sun-yellow planet + kite constellation -->
    <ellipse cx="95" cy="88" rx="50" ry="13" fill="none" stroke="${TEAL}" stroke-width="5" transform="rotate(-18 95 88)" opacity=".9"/>
    <circle cx="95" cy="88" r="27" fill="url(#${u}-pl1)" ${line}/>
    <path d="M73 76 Q95 70 117 78 M70 92 Q95 86 120 95" stroke="#E2B84E" stroke-width="3" fill="none" opacity=".7"/>
    <path d="M51.6 101.6 Q95 108 140 76" fill="none" stroke="${TEAL}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="86" cy="80" r="6" fill="#fff" opacity=".45"/>
    ${constel([[30, 150], [55, 132], [80, 160], [58, 182]], [[0, 1], [1, 2], [2, 3], [3, 0], [1, 3]])}
    <!-- p2: little constellation + tiny planet -->
    ${constel([[220, 50], [245, 36], [272, 44], [292, 30], [318, 58]], [[0, 1], [1, 2], [2, 3], [2, 4]])}
    <circle cx="230" cy="140" r="9" fill="url(#${u}-pl4)" ${line}/>
    <!-- p3: crescent moon + comet -->
    <path d="M566 41 A25 25 0 1 0 579 74 A21 21 0 0 1 566 41 Z" fill="#FFF3B8"/>
    <circle cx="543" cy="73" r="2.6" fill="#E8D88A"/><circle cx="547" cy="58" r="1.8" fill="#E8D88A"/>
    <path d="M470 160 L560 120 L474 168 Z" fill="url(#${u}-tail)"/>
    <circle cx="470" cy="164" r="7" fill="#FFFBE6"/>
    <circle cx="500" cy="92" r="12" fill="url(#${u}-pl2)" ${line}/>
    <!-- p4: big blue planet with a moon, compass rose -->
    <circle cx="96" cy="290" r="32" fill="url(#${u}-pl4)" ${line}/>
    <path d="M68 278 Q96 270 124 280 M66 298 Q96 290 126 300 M72 314 Q96 308 120 316" stroke="#fff" stroke-width="3.4" fill="none" opacity=".45"/>
    <circle cx="150" cy="258" r="8" fill="#E6E2F4" ${line}/>
    <ellipse cx="96" cy="290" rx="58" ry="20" fill="none" stroke="#E6E2F4" stroke-width="1.4" stroke-dasharray="3 5" opacity=".7"/>
    <g transform="translate(46 356)">
      <circle r="22" fill="none" stroke="${GOLD}" stroke-width="1.6" opacity=".8"/>
      <path d="M0 -26 L5 -5 L26 0 L5 5 L0 26 L-5 5 L-26 0 L-5 -5 Z" fill="${GOLD}"/>
      <path d="M0 -26 L5 -5 L0 0 Z M26 0 L5 5 L0 0 Z M0 26 L-5 5 L0 0 Z M-26 0 L-5 -5 L0 0 Z" fill="#B8913C"/>
      ${text(0, -30, 'N', 12, GOLD)}
    </g>
    <!-- p5: little coral planet + dipper -->
    <circle cx="330" cy="342" r="13" fill="url(#${u}-pl5)" ${line}/>
    ${constel([[226, 330], [250, 346], [276, 342], [298, 362], [270, 380], [244, 376]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 2]])}
    <!-- p6: lilac planet with an orbiting moon -->
    <ellipse cx="500" cy="302" rx="62" ry="22" fill="none" stroke="#CFF3EE" stroke-width="1.6" stroke-dasharray="3 5" opacity=".8" transform="rotate(12 500 302)"/>
    <circle cx="500" cy="302" r="35" fill="url(#${u}-pl3)" ${line}/>
    <path d="M472 290 Q500 282 528 292 M468 310 Q500 302 532 312" stroke="#fff" stroke-width="4" fill="none" opacity=".35"/>
    <circle cx="488" cy="290" r="8" fill="#fff" opacity=".35"/>
    <circle cx="560" cy="318" r="9" fill="url(#${u}-pl2)" ${line}/>
    ${constel([[520, 372], [548, 360], [576, 376]], [[0, 1], [1, 2]])}
    ${bright}
    ${complete ? '' : `<circle cx="402" cy="62" r="16" fill="none" stroke="${SUN}" stroke-width="2" stroke-dasharray="4 4" opacity=".75"/>`}`;
}

function mapDefs(u) {
  const rg = (id, a, b, c) => `<radialGradient id="${u}-${id}" cx="35%" cy="32%" r="75%"><stop offset="0" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;
  const neb = (id, col, o) => `<radialGradient id="${u}-${id}"><stop offset="0" stop-color="${col}" stop-opacity="${o}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>`;
  return `
    <radialGradient id="${u}-sky" gradientUnits="userSpaceOnUse" cx="300" cy="200" r="400"><stop offset="0" stop-color="#3B3C8C"/><stop offset=".55" stop-color="#262A68"/><stop offset="1" stop-color="#181B45"/></radialGradient>
    <radialGradient id="${u}-core"><stop offset="0" stop-color="#FFFBE6"/><stop offset=".3" stop-color="${SUN}" stop-opacity=".9"/><stop offset="1" stop-color="${SUN}" stop-opacity="0"/></radialGradient>
    ${neb('neb1', LILAC, 0.5)}${neb('neb2', TEAL, 0.38)}${neb('neb3', SKY, 0.4)}
    ${rg('pl1', '#FFF4BE', SUN, '#D9B44A')}${rg('pl2', '#D6F4EF', TEAL, '#4FA79C')}${rg('pl3', '#EEE6FF', LILAC, '#7E62C4')}
    ${rg('pl4', '#E2F0FC', SKY, '#5F8FC4')}${rg('pl5', '#FFE0C4', '#F0A584', '#C9734E')}${rg('new', '#FFFFFF', TEAL, '#8A6BD8')}
    <linearGradient id="${u}-tail" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FFFBE6" stop-opacity=".95"/><stop offset="1" stop-color="${SKY}" stop-opacity="0"/></linearGradient>
    <linearGradient id="${u}-wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A97650"/><stop offset=".5" stop-color="#8B5E3C"/><stop offset="1" stop-color="#734B30"/></linearGradient>
    <radialGradient id="${u}-halo"><stop offset="0" stop-color="#FFF3A8" stop-opacity=".95"/><stop offset=".4" stop-color="${SUN}" stop-opacity=".45"/><stop offset="1" stop-color="${SUN}" stop-opacity="0"/></radialGradient>`;
}

// Full framed map in 640×440 units. `u` = unique id prefix for this copy (gradients / clip).
function mapBody(pieces, u) {
  const have = new Set((pieces || []).filter((p) => PIECES.includes(p)));
  const complete = have.size === 6;
  const got = PIECES.map((p, k) => (have.has(p) ? k : -1)).filter((k) => k >= 0);
  const missing = PIECES.map((p, k) => (have.has(p) ? -1 : k)).filter((k) => k >= 0);
  const corner = (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="${GOLD}" ${line}/>${starPath(x, y, 6, '#FFF6C8')}`;
  return `
  <defs>${mapDefs(u)}
    ${got.length ? `<clipPath id="${u}-clip">${got.map((k) => `<path d="${PIECE_D[k]}"/>`).join('')}</clipPath>` : ''}
  </defs>
  ${complete ? `<rect x="-26" y="-26" width="692" height="492" rx="40" fill="url(#${u}-halo)"/>
    <rect x="-8" y="-8" width="656" height="456" rx="22" fill="none" stroke="#FFE680" stroke-width="10" opacity=".55"/>` : ''}
  <rect width="640" height="440" rx="16" fill="url(#${u}-wood)" ${line}/>
  <rect x="7" y="7" width="626" height="426" rx="11" fill="none" stroke="${complete ? '#FFE680' : GOLD}" stroke-width="${complete ? 4 : 2.5}"/>
  <g transform="translate(20 20)">
    <rect width="600" height="400" fill="#EEE8F7"/>
    <path d="${Array.from({ length: 19 }, (_, i) => `M${i * 32 + 8} 0 V400`).join(' ')}" stroke="#E2DAF0" stroke-width="1"/>
    ${got.length ? `<g clip-path="url(#${u}-clip)">${mapContent(u, complete)}</g>` : ''}
    ${got.map((k) => `<path d="${PIECE_D[k]}" fill="none" stroke="#0E1030" stroke-opacity="${complete ? 0.18 : 0.35}" stroke-width="1.6"/>`).join('')}
    ${missing.map((k) => { const [cx, cy] = pieceCenter(k); return `<path d="${PIECE_D[k]}" fill="#F7F3FD" fill-opacity=".7" stroke="${LILAC}" stroke-width="3" stroke-dasharray="10 7" stroke-linejoin="round"/>
      <circle cx="${cx}" cy="${cy - 10}" r="34" fill="#fff" opacity=".7"/>${text(cx, cy + 10, '?', 58, LILAC, 700)}`; }).join('')}
    ${complete ? `<circle cx="402" cy="62" r="46" fill="url(#${u}-halo)"/>
      <ellipse cx="402" cy="62" rx="30" ry="8" fill="none" stroke="#FFE680" stroke-width="3.4" transform="rotate(-14 402 62)"/>
      <circle cx="402" cy="62" r="17" fill="url(#${u}-new)" ${line}/>
      <circle cx="396" cy="56" r="5" fill="#fff" opacity=".6"/>
      <path d="M385.3 66.4 Q402 70 419 57.6" fill="none" stroke="#FFE680" stroke-width="3.4" stroke-linecap="round"/>
      <g>${twinkle(428, 36, 13, '#FFFFFF')}${twinkle(428, 36, 7, '#FFE680')}<animate attributeName="opacity" values="1;.35;1" dur="1.6s" repeatCount="indefinite"/></g>
      ${twinkle(376, 40, 6, '#FFF6C8')}${twinkle(430, 86, 5, '#CFF3EE')}` : ''}
  </g>
  <rect x="20" y="20" width="600" height="400" fill="none" stroke="#3E3252" stroke-opacity=".5" stroke-width="2"/>
  ${corner(14, 14)}${corner(626, 14)}${corner(14, 426)}${corner(626, 426)}
  <path d="M232 2 H408 L398 18 L408 34 H232 L242 18 Z" fill="${complete ? SUN : LILAC}" ${line}/>
  ${text(320, 26, 'STAR MAP', 20, complete ? '#7A5A10' : '#FFFFFF', 700)}`;
}

// Standalone star map for the quest journal etc.
let mapCount = 0;
export function starMapSvg(pieces = [], w = 320, h = 220) {
  const u = `at-smj${++mapCount}`;
  return `<svg viewBox="-28 -28 696 496" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${mapBody(pieces, u)}</svg>`;
}

// ======================= BACKGROUND =======================
// Sloped ceiling: wall height at position t along each wall (tiles).
const ROOF = { L: [3.4, 150], R: [4.8, 150] };
const roofH = (side, t) => { const [t0, drop] = ROOF[side], end = side === 'L' ? R.rows : R.cols; return t <= t0 ? R.wallH : R.wallH - ((t - t0) / (end - t0)) * drop; };
const wallPt = (side, t, z) => (side === 'L' ? proj(R, 0, t, z) : proj(R, t, 0, z));

function slopedLights(side, t0, t1, n) {
  const cols = [SUN, '#9EDDD4', '#C9B8F2', '#8FC3F0', '#F7E7A6'];
  const p = (t, sag) => wallPt(side, t, roofH(side, t) - 14 - sag);
  let wire = '', bulbs = '';
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n, sag = Math.sin((i / n) * Math.PI * 3) ** 2 * 10;
    const [x, y] = p(t, sag);
    wire += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    if (i % 2 === 1) bulbs += `<circle cx="${x}" cy="${y + 9}" r="13" fill="${cols[i % 5]}" opacity=".32"/><ellipse cx="${x}" cy="${y + 9}" rx="5" ry="7" fill="${cols[i % 5]}" ${line}/>`;
  }
  return `<path d="${wire}" fill="none" stroke="#4A3B5C" stroke-width="2"/>${bulbs}`;
}

function slopePanel(side) {
  const [t0] = ROOF[side], end = side === 'L' ? R.rows : R.cols;
  const top = (t) => wallPt(side, t, R.wallH), roof = (t) => wallPt(side, t, roofH(side, t));
  const poly = [top(t0), top(end), roof(end)];
  // rafters: bands from the top edge down to the roof line
  const rafters = [0.3, 0.62, 0.9].map((f) => {
    const t = t0 + (end - t0) * f, tw = 0.16;
    return `<polygon points="${pts([top(t), top(t + tw), roof(t + tw), roof(t)])}" fill="${WOOD_D}" ${line}/>`;
  }).join('');
  // the thick sloped beam along the roof line
  const beam = `<polygon points="${pts([roof(t0 - 0.3), roof(end), [roof(end)[0], roof(end)[1] + 16], [roof(t0 - 0.3)[0], roof(t0 - 0.3)[1] + 16]])}" fill="#A57550" ${line}/>
    <polygon points="${pts([roof(t0 - 0.3), roof(end), [roof(end)[0], roof(end)[1] + 4], [roof(t0 - 0.3)[0], roof(t0 - 0.3)[1] + 4]])}" fill="#C79B70"/>`;
  return `<polygon points="${pts(poly)}" fill="#8C6446" ${line}/><polygon points="${pts(poly)}" fill="url(#at-plank-${side})" opacity=".45"/>${rafters}${beam}`;
}

const bg = (w) => {
  const night = w.weather !== 'rain';
  const [lx] = proj(R, 0, R.rows), [rx] = proj(R, R.cols, 0), [, fy] = proj(R, R.cols, R.rows);
  const B = proj(R, 0, 0), Ll = proj(R, 0, R.rows), Rr = proj(R, R.cols, 0);
  const up = ([x, y], h = R.wallH) => [x, y - h];
  const plank = (id, mat, base) => `<pattern id="${id}" width="150" height="56" patternUnits="userSpaceOnUse" patternTransform="${mat}">
      <rect width="150" height="56" fill="${base}"/>
      <path d="M0 0 H150 M0 28 H150" stroke="#7A5134" stroke-opacity=".45" stroke-width="2.2"/>
      <path d="M0 2.5 H150 M0 30.5 H150" stroke="#fff" stroke-opacity=".14" stroke-width="2"/>
      <path d="M96 0 V28 M30 28 V56" stroke="#7A5134" stroke-opacity=".4" stroke-width="2"/>
      <ellipse cx="58" cy="14" rx="5" ry="2.4" fill="none" stroke="#7A5134" stroke-opacity=".35" stroke-width="1.3"/>
      <ellipse cx="118" cy="43" rx="4" ry="2" fill="none" stroke="#7A5134" stroke-opacity=".3" stroke-width="1.2"/>
      <path d="M8 12 Q40 9 80 13 M50 40 Q90 37 140 41" stroke="#7A5134" stroke-opacity=".15" stroke-width="1" fill="none"/></pattern>`;
  const motes = (() => { const r = rng(3); return Array.from({ length: 16 }, () => { const a = 0.2 + r() * 0.6, b = r(); const p1 = proj(R, 0.2 + a * 2.2, 1.0 + b * 1.8 + a * 1.2, 40 + r() * 180); return `<circle cx="${p1[0].toFixed(1)}" cy="${p1[1].toFixed(1)}" r="${(1 + r() * 1.8).toFixed(1)}" fill="#FFFFFF" opacity="${(0.3 + r() * 0.5).toFixed(2)}"/>`; }).join(''); })();
  const backStars = (() => { const r = rng(11); return Array.from({ length: 40 }, () => { const x = r() * 1600, y = r() * 900; return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.8 + r() * 1.6).toFixed(1)}" fill="#fff" opacity="${(0.25 + r() * 0.5).toFixed(2)}"/>`; }).join(''); })();
  return svg(1600, 900, `
  <defs>
    <radialGradient id="at-bd" cx="50%" cy="50%" r="72%"><stop offset="0" stop-color="#4A4382"/><stop offset="1" stop-color="#262350"/></radialGradient>
    ${plank('at-wl', `matrix(1,-0.5,0,1,${R.ox},${R.oy})`, '#D9B48A')}${plank('at-wr', `matrix(1,0.5,0,1,${R.ox},${R.oy})`, '#CBA57C')}
    ${plank('at-plank-L', `matrix(1,-0.5,0,1,${R.ox},${R.oy})`, '#8C6446')}${plank('at-plank-R', `matrix(1,0.5,0,1,${R.ox},${R.oy})`, '#8C6446')}
    <linearGradient id="at-beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E7F0FF" stop-opacity="${night ? 0.42 : 0.18}"/><stop offset="1" stop-color="#E7F0FF" stop-opacity="0"/></linearGradient>
    <radialGradient id="at-pool"><stop offset="0" stop-color="#E7F0FF" stop-opacity="${night ? 0.4 : 0.15}"/><stop offset="1" stop-color="#E7F0FF" stop-opacity="0"/></radialGradient>
    <radialGradient id="at-warm"><stop offset="0" stop-color="#FFE7A8" stop-opacity=".35"/><stop offset="1" stop-color="#FFE7A8" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#at-bd)"/>
  ${backStars}
  ${twinkle(180, 160, 10, '#FFF6C8', 'opacity=".7"')}${twinkle(1420, 220, 12, '#CFF3EE', 'opacity=".7"')}${twinkle(1500, 700, 8, '#E5DBFF', 'opacity=".6"')}${twinkle(110, 640, 9, '#FFF6C8', 'opacity=".6"')}
  <ellipse cx="${(lx + rx) / 2}" cy="${fy + 6}" rx="560" ry="46" fill="#120F2A" opacity=".28"/>
  ${roomShell(R, { floor: '#BF946A', floorLines: 'planks', wallL: '#D9B48A', wallR: '#CBA57C', wallPatternL: 'at-wl', wallPatternR: 'at-wr', base: '#B98A5E' })}
  <!-- corner post and top beams -->
  <polygon points="${pts([[B[0] - 9, B[1] + 4.5], B, [B[0] + 9, B[1] + 4.5], [B[0] + 9, up(B)[1] + 4.5], up(B), [B[0] - 9, up(B)[1] + 4.5]])}" fill="${WOOD}" ${line}/>
  <polygon points="${pts([up(Ll), up(B), [B[0], up(B)[1] + 20], [Ll[0], up(Ll)[1] + 20]])}" fill="${WOOD_D}" ${line}/>
  <polygon points="${pts([up(B), up(Rr), [Rr[0], up(Rr)[1] + 20], [B[0], up(B)[1] + 20]])}" fill="#7E5434" ${line}/>
  ${slopePanel('L')}${slopePanel('R')}
  ${slopedLights('L', 3.0, 6.9, 12)}${slopedLights('R', 4.4, 7.9, 12)}
  <!-- moonlight from the round window -->
  <polygon points="${pts([proj(R, 0, 0.9, 230), proj(R, 0, 2.3, 230), proj(R, 2.9, 4.5), proj(R, 2.9, 2.6)])}" fill="url(#at-beam)"/>
  <ellipse cx="${proj(R, 2.4, 3.4)[0]}" cy="${proj(R, 2.4, 3.4)[1]}" rx="150" ry="70" fill="url(#at-pool)"/>
  ${night ? motes : ''}
  <ellipse cx="${proj(R, 4.6, 3.6)[0]}" cy="${proj(R, 4.6, 3.6)[1]}" rx="260" ry="120" fill="url(#at-warm)"/>`);
};

// ======================= FURNITURE =======================
const chest = (it) => {
  const wood = shades('#A86F45'), band = '#6E4A2E', open = it?.data.open;
  const straps = (w, h) => `<rect x="14" y="0" width="9" height="${h}" fill="${band}" opacity=".85"/><rect x="${w - 23}" y="0" width="9" height="${h}" fill="${band}" opacity=".85"/>
    <path d="M0 4 H${w} M0 ${h - 4} H${w}" stroke="${GOLD}" stroke-width="3" opacity=".8"/>`;
  return isoItem(1.6, 1, 150, [
    { u: 0, v: 0, w: 1.6, d: 1, h: 58, ...wood,
      leftDecor: `${straps(1.6 * 64, 58)}<path d="M8 20 H94 M8 38 H94" stroke="#7A5134" stroke-opacity=".35" stroke-width="1.6"/>${open ? '' : `<rect x="${0.8 * 64 - 9}" y="2" width="18" height="22" rx="3" fill="${GOLD}" ${line}/><circle cx="${0.8 * 64}" cy="11" r="3" fill="#5C3C22"/><rect x="${0.8 * 64 - 1.5}" y="11" width="3" height="7" fill="#5C3C22"/>`}`,
      rightDecor: straps(64, 58),
      topDecor: open ? `<rect x=".07" y=".07" width="1.46" height=".86" fill="#3E2A1E"/><rect x=".07" y=".07" width="1.46" height=".86" fill="#FFD966" opacity=".35"/>
        <path d="M.1 .5 Q.5 .25 .9 .55 Q1.2 .7 1.5 .45 V.9 H.1 Z" fill="${LILAC}"/><path d="M.2 .62 Q.6 .45 1 .66" stroke="#fff" stroke-width=".03" fill="none" opacity=".6"/>` : '' },
    ...(open
      ? [{ u: 0, v: -0.06, w: 1.6, d: 0.12, z: 58, h: 56, ...shades('#9A6440'), leftDecor: straps(1.6 * 64, 56) },
         { svg: (() => { const [cx, cy] = at(0.8, 0.5, 58); return `<radialGradient id="at-chest-glow"><stop offset="0" stop-color="#FFF3A8" stop-opacity=".95"/><stop offset=".5" stop-color="${SUN}" stop-opacity=".45"/><stop offset="1" stop-color="${SUN}" stop-opacity="0"/></radialGradient>
             <path d="M${cx - 50} ${cy} L${cx - 80} ${cy - 110} L${cx - 20} ${cy - 120} Z M${cx + 6} ${cy} L${cx + 10} ${cy - 130} L${cx + 50} ${cy - 120} Z M${cx + 46} ${cy - 4} L${cx + 96} ${cy - 96} L${cx + 120} ${cy - 70} Z" fill="#FFF3A8" opacity=".3"/>
             <ellipse cx="${cx}" cy="${cy - 20}" rx="90" ry="60" fill="url(#at-chest-glow)"/>
             ${twinkle(cx - 30, cy - 50, 7, '#fff')}${twinkle(cx + 34, cy - 70, 5, '#FFF6C8')}${twinkle(cx + 4, cy - 92, 4, '#fff')}`; })(), w: 0.1, d: 0.1, u: 0.8, v: 0.9, z: 60 }]
      : [{ u: -0.03, v: -0.03, w: 1.66, d: 1.06, z: 58, h: 24, ...shades('#9A6440'),
           leftDecor: `${straps(1.66 * 64, 24)}`, rightDecor: straps(1.06 * 64, 24),
           topDecor: '<rect x=".2" y="0" width=".14" height="1.06" fill="#6E4A2E" opacity=".8"/><rect x="1.32" y="0" width=".14" height="1.06" fill="#6E4A2E" opacity=".8"/><path d="M0 .5 H1.66" stroke="#7A5134" stroke-opacity=".3" stroke-width=".02"/>' }]),
  ]);
};

const trunk = () => {
  const c = shades('#5FA79C'), band = shades('#8B5E3C');
  const brass = (w, h) => `<path d="M0 0 h10 v4 h-6 v6 h-4 Z M${w} 0 h-10 v4 h6 v6 h4 Z M0 ${h} h10 v-4 h-6 v-6 h-4 Z M${w} ${h} h-10 v-4 h6 v-6 h4 Z" fill="${GOLD}"/>`;
  return isoItem(1, 1.5, 80, [
    { u: 0, v: 0, w: 1, d: 1.5, h: 58, ...c,
      leftDecor: `${brass(64, 58)}<rect x="24" y="4" width="16" height="16" rx="2" fill="${GOLD}" ${line}/><path d="M0 30 H64" stroke="#3E3252" stroke-opacity=".25" stroke-width="2"/>`,
      rightDecor: `${brass(96, 58)}<rect x="22" y="0" width="8" height="58" fill="${band.left}"/><rect x="66" y="0" width="8" height="58" fill="${band.left}"/>
        <rect x="34" y="20" width="26" height="18" rx="3" fill="${CREAM}" ${line}/>${starPath(47, 29, 6, LILAC)}` },
    { u: -0.02, v: -0.02, w: 1.04, d: 1.54, z: 58, h: 14, ...shades('#4F968B'),
      topDecor: '<rect x="0" y=".33" width="1.04" height=".12" fill="#8B5E3C"/><rect x="0" y="1.05" width="1.04" height=".12" fill="#8B5E3C"/>' },
  ]);
};

const boxes = () => {
  const b1 = shades(CARD), b2 = shades('#CFA472');
  const dust = '<circle cx=".2" cy=".3" r=".03" fill="#fff" opacity=".5"/><circle cx=".6" cy=".7" r=".025" fill="#fff" opacity=".5"/><circle cx=".9" cy=".2" r=".03" fill="#fff" opacity=".45"/><circle cx="1.1" cy=".6" r=".02" fill="#fff" opacity=".5"/>';
  return isoItem(1.3, 1, 150, [
    { u: 0, v: 0, w: 1.3, d: 1, h: 60, ...b1,
      leftDecor: `<rect x="${0.65 * 64 - 8}" y="0" width="16" height="60" fill="#E8CFA0" opacity=".8"/><rect x="10" y="24" width="34" height="18" rx="2" fill="${CREAM}" ${line}/>${text(27, 38, 'TOYS', 10, '#8B5E3C', 700)}`,
      rightDecor: `<path d="M8 10 l14 0 M8 16 l10 0" stroke="#8B5E3C" stroke-width="2" opacity=".5"/>`,
      topDecor: `<rect x="0" y=".42" width="1.3" height=".16" fill="#E8CFA0" opacity=".8"/>${dust}` },
    { u: 0.15, v: 0.1, w: 0.9, d: 0.75, z: 60, h: 46, ...b2,
      leftDecor: `<path d="M0 6 H${0.9 * 64}" stroke="#E8CFA0" stroke-width="5" opacity=".8"/>${text(0.45 * 64, 32, '★ ★', 12, '#8B5E3C', 700)}`,
      topDecor: `<path d="M0 0 L.9 .75 M.9 0 L0 .75" stroke="#B38A5A" stroke-width=".02" opacity=".7"/>${dust}` },
  ]);
};

const smallBox = () => isoItem(0.9, 0.8, 70, [
  { u: 0, v: 0, w: 0.9, d: 0.8, h: 44, ...shades('#D2AA78'), leftDecor: `<rect x="8" y="10" width="40" height="5" fill="#E8CFA0"/>` },
  { svg: (() => { const a = at(0, 0, 44), b = at(0.9, 0, 44), c = at(0.9, 0.8, 44), d = at(0, 0.8, 44);
    return `<polygon points="${pts([a, b, c, d])}" fill="#5C4030"/>
      <polygon points="${pts([d, c, [c[0] - 8, c[1] + 18], [d[0] - 10, d[1] + 16]])}" fill="#E2BF8C" ${line}/>
      <polygon points="${pts([b, c, [c[0] + 18, c[1] - 4], [b[0] + 18, b[1] - 6]])}" fill="#C79E6C" ${line}/>
      <path d="M${a[0] + 20} ${a[1] + 14} q8 -26 22 -20" stroke="${SKY}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="${a[0] + 40}" cy="${a[1] + 10}" r="9" fill="${SUN}" ${line}/>`; })(), w: 0.9, d: 0.8, u: 0.45, v: 0.4, z: 46 },
]);

const rockingChair = () => {
  const wood = shades('#9A6A44'), leg = shades('#8B5E3C');
  const runner = (v) => { const a = at(-0.12, v, 0), b = at(1.12, v, 0), m = at(0.5, v, -10); return `<path d="M${a[0]} ${a[1] - 10} Q${m[0]} ${m[1] + 16} ${b[0]} ${b[1] - 6}" fill="none" stroke="#6E4A2E" stroke-width="7" stroke-linecap="round"/>`; };
  return isoItem(1, 1, 170, [
    { svg: runner(0.12), u: 0, v: 0.12, w: 1, d: 0.02 },
    { u: 0.18, v: 0.12, w: 0.08, d: 0.08, h: 44, ...leg }, { u: 0.78, v: 0.12, w: 0.08, d: 0.08, h: 44, ...leg },
    { u: 0.12, v: 0.08, w: 0.12, d: 0.84, z: 44, h: 104, ...wood,
      rightDecor: `${[10, 22, 34, 46].map((x) => `<rect x="${x}" y="12" width="5" height="76" rx="2" fill="#7E5434" opacity=".6"/>`).join('')}<path d="M4 8 Q27 -6 50 8" stroke="#7E5434" stroke-width="4" fill="none"/>`,
      topDecor: '' },
    { u: 0.12, v: 0.06, w: 0.86, d: 0.88, z: 44, h: 8, ...wood },
    { u: 0.22, v: 0.12, w: 0.72, d: 0.76, z: 52, h: 10, ...shades(LILAC), topDecor: '<path d="M.1 .38 H.62" stroke="#fff" stroke-width=".04" stroke-dasharray=".06 .05" opacity=".7"/>' },
    { u: 0.14, v: 0.1, w: 0.1, d: 0.6, z: 92, h: 40, ...shades(TEAL),
      rightDecor: `<path d="M0 6 H38 M0 18 H38 M0 30 H38" stroke="#fff" stroke-width="2.5" opacity=".55"/>` },
    { u: 0.18, v: 0.86, w: 0.08, d: 0.08, h: 44, ...leg }, { u: 0.78, v: 0.86, w: 0.08, d: 0.08, h: 44, ...leg },
    { u: 0.2, v: 0.04, w: 0.74, d: 0.08, z: 74, h: 6, ...wood }, { u: 0.2, v: 0.88, w: 0.74, d: 0.08, z: 74, h: 6, ...wood },
    { u: 0.86, v: 0.88, w: 0.06, d: 0.06, z: 52, h: 22, ...leg },
    { svg: runner(0.92), u: 0.5, v: 0.92, w: 1, d: 0.3 },
  ]);
};

const rolledRug = () => isoItem(2.2, 0.5, 50, [{
  svg: (() => {
    const r = 21, a = at(0, 0.25, r), b = at(2.2, 0.25, r);
    const nx = -0.447 * r, ny = 0.894 * r; // perpendicular to the axis on screen
    const stripes = [0.35, 0.7, 1.1, 1.5, 1.85].map((t) => { const c = at(t, 0.25, r); return `<path d="M${c[0] - nx} ${c[1] - ny} Q${c[0] + 6} ${c[1] + 4} ${c[0] + nx} ${c[1] + ny}" stroke="${t === 1.1 ? SUN : LILAC}" stroke-width="${t === 1.1 ? 7 : 5}" fill="none"/>`; }).join('');
    return `<ellipse cx="${(a[0] + b[0]) / 2}" cy="${(a[1] + b[1]) / 2 + r + 2}" rx="90" ry="14" fill="#3E3252" opacity=".12"/>
      <polygon points="${pts([[a[0] - nx, a[1] - ny], [b[0] - nx, b[1] - ny], [b[0] + nx, b[1] + ny], [a[0] + nx, a[1] + ny]])}" fill="#6FC2B6" ${line}/>
      ${stripes}
      <path d="M${a[0] - nx} ${a[1] - ny} L${b[0] - nx} ${b[1] - ny}" stroke="#fff" stroke-opacity=".35" stroke-width="4"/>
      <ellipse cx="${b[0]}" cy="${b[1]}" rx="${r * 0.6}" ry="${r}" transform="rotate(27 ${b[0]} ${b[1]})" fill="#A6E0D7" ${line}/>
      <path d="M${b[0] - 2} ${b[1] - 9} a5 9 0 1 1 -1 14 a3 6 0 1 1 2 -9" fill="none" stroke="#4FA79C" stroke-width="1.8" transform="rotate(27 ${b[0]} ${b[1]})"/>
      <path d="M${b[0] + 6} ${b[1] + 14} l4 6 M${b[0] + 1} ${b[1] + 16} l2 7 M${b[0] + 10} ${b[1] + 9} l5 5" stroke="${CREAM}" stroke-width="2"/>`;
  })(), w: 2.2, d: 0.5,
}]);

const telescope = () => isoItem(0.8, 0.8, 190, [{
  svg: (() => {
    const [px, py] = at(0.4, 0.4, 104);
    const feet = [at(0.05, 0.45), at(0.75, 0.15), at(0.7, 0.8)];
    const legs = feet.map(([x, y]) => `<path d="M${px} ${py} L${x} ${y}" stroke="#6E4A2E" stroke-width="5" stroke-linecap="round"/>`).join('');
    // tube points up-left towards the round window
    const ang = (-118 * Math.PI) / 180, ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux;
    const q = (s, o) => [px + ux * s + vx * o, py + uy * s + vy * o];
    const tube = [q(-34, -8), q(64, -11), q(64, 11), q(-34, 8)];
    const hood = [q(64, -14), q(84, -15), q(84, 15), q(64, 14)];
    const eye = [q(-48, -4), q(-34, -5), q(-34, 5), q(-48, 4)];
    return `<defs><linearGradient id="at-brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F3D27A"/><stop offset=".5" stop-color="#D9A94A"/><stop offset="1" stop-color="#A97A2E"/></linearGradient></defs>
      <ellipse cx="${at(0.4, 0.4)[0]}" cy="${at(0.4, 0.4)[1]}" rx="44" ry="16" fill="#3E3252" opacity=".12"/>
      ${legs}
      <polygon points="${pts(eye)}" fill="#8B5E3C" ${line}/>
      <polygon points="${pts(tube)}" fill="url(#at-brass)" ${line}/>
      <polygon points="${pts(hood)}" fill="#C8963E" ${line}/>
      <path d="M${P(q(10, -10))} L${P(q(10, 10))} M${P(q(40, -10.5))} L${P(q(40, 10.5))}" stroke="#8C6420" stroke-width="3"/>
      <ellipse cx="${q(84, 0)[0]}" cy="${q(84, 0)[1]}" rx="15" ry="6" transform="rotate(${-118 + 90} ${q(84, 0)[0]} ${q(84, 0)[1]})" fill="#2E3266" ${line}/>
      <circle cx="${px}" cy="${py}" r="6" fill="${GOLD}" ${line}/>`;
  })(), w: 0.8, d: 0.8,
}]);

const globe = () => isoItem(0.7, 0.7, 150, [
  { u: 0.04, v: 0.04, w: 0.62, d: 0.62, h: 14, ...shades('#7A64B0') },
  { u: 0.08, v: 0.06, w: 0.56, d: 0.58, z: 14, h: 12, ...shades(TEAL) },
  { u: 0.06, v: 0.1, w: 0.58, d: 0.52, z: 26, h: 12, ...shades('#E58F6A') },
  { svg: (() => {
    const [cx, cy] = at(0.35, 0.35, 38);
    const gy = cy - 50;
    return `<path d="M${cx - 10} ${cy} h20 l-4 -8 h-12 Z" fill="${GOLD}" ${line}/><path d="M${cx} ${cy - 8} V${gy + 30}" stroke="${GOLD}" stroke-width="4"/>
      <circle cx="${cx}" cy="${gy}" r="34" fill="${SKY}" ${line}/>
      <path d="M${cx - 24} ${gy - 16} q10 -8 20 -2 q6 8 -4 14 q-10 4 -8 14 q-8 2 -12 -8 q-4 -10 4 -18 Z M${cx + 8} ${gy + 2} q12 -6 18 4 q2 12 -8 18 q-8 0 -10 -10 Z M${cx + 6} ${gy - 26} q10 -2 14 4 q-6 4 -14 -4 Z" fill="#9EDB8C" ${line}/>
      <ellipse cx="${cx}" cy="${gy}" rx="14" ry="34" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.6"/>
      <path d="M${cx - 34} ${gy} H${cx + 34}" stroke="#fff" stroke-opacity=".45" stroke-width="1.6"/>
      <path d="M${cx - 30} ${gy - 30} A42 42 0 0 1 ${cx + 30} ${gy + 30}" fill="none" stroke="${GOLD}" stroke-width="4" transform="rotate(-20 ${cx} ${gy})"/>
      <circle cx="${cx - 12}" cy="${gy - 14}" r="7" fill="#fff" opacity=".35"/>`;
  })(), w: 0.7, d: 0.7, u: 0.35, v: 0.35, z: 40 },
]);

const hatch = () => isoItem(2.3, 1.3, 50, [
  { u: 0, v: 0, w: 1.3, d: 1.3, h: 0, top: '#9A6E4A',
    topDecor: `<rect x=".1" y=".1" width="1.1" height="1.1" fill="#24180F"/><rect x=".1" y=".1" width="1.1" height="1.1" fill="url(#at-hatch-glow)"/>` },
  { svg: (() => {
    const g = `<defs><radialGradient id="at-hatch-glow" cx="50%" cy="70%" r="70%"><stop offset="0" stop-color="#FFD98A" stop-opacity=".55"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient></defs>`;
    const rail = (u) => { const a = at(u, 0.22, 40), b = at(u, 1.0, -6); return `<path d="M${P(a)} L${P(b)}" stroke="#8B5E3C" stroke-width="6" stroke-linecap="round"/>`; };
    const rungs = [0.25, 0.45, 0.65, 0.85].map((f) => { const v = 0.22 + 0.78 * f, z = 40 - 46 * f; return `<path d="M${P(at(0.38, v, z))} L${P(at(0.92, v, z))}" stroke="#A57550" stroke-width="5" stroke-linecap="round"/>`; }).join('');
    return g + rungs + rail(0.38) + rail(0.92);
  })(), u: 0.65, v: 0.6, w: 0.1, d: 0.1 },
  { u: 1.34, v: 0.12, w: 0.92, d: 1.06, h: 6, ...shades('#A57550'),
    topDecor: '<path d="M.3 0 V1.06 M.6 0 V1.06" stroke="#7A5134" stroke-width=".02"/><circle cx=".46" cy=".53" r=".12" fill="none" stroke="#5C4A3A" stroke-width=".035"/><rect x="0" y=".16" width=".92" height=".06" fill="#5C4A3A" opacity=".8"/><rect x="0" y=".84" width=".92" height=".06" fill="#5C4A3A" opacity=".8"/>' },
]);

// ---------- small things ----------
const lantern = (lit = true) => () => isoItem(0.36, 0.36, 92, [
  { u: 0.04, v: 0.04, w: 0.28, d: 0.28, h: 8, ...shades('#4A3B5C') },
  { svg: (() => {
    const [cx, cy] = at(0.18, 0.18, 8);
    return `${lit ? `<circle cx="${cx}" cy="${cy - 26}" r="48" fill="#FFE7A0" opacity=".28"/>` : ''}
      <rect x="${cx - 14}" y="${cy - 46}" width="28" height="46" rx="4" fill="${lit ? '#FFE9A6' : '#DCE6F2'}" fill-opacity=".9" ${line}/>
      ${lit ? `<path d="M${cx} ${cy - 34} q-7 10 0 18 q7 -8 0 -18 Z" fill="#F5A64A"/><path d="M${cx} ${cy - 28} q-3 5 0 9 q3 -4 0 -9 Z" fill="#FFF6C8"/>` : ''}
      <path d="M${cx - 14} ${cy - 23} H${cx + 14} M${cx} ${cy - 46} V${cy}" stroke="#4A3B5C" stroke-width="2" opacity=".6"/>
      <path d="M${cx - 17} ${cy - 46} L${cx} ${cy - 60} L${cx + 17} ${cy - 46} Z" fill="#4A3B5C" ${line}/>
      <path d="M${cx - 8} ${cy - 60} Q${cx} ${cy - 78} ${cx + 8} ${cy - 60}" fill="none" stroke="#4A3B5C" stroke-width="3"/>`;
  })(), u: 0.18, v: 0.18, w: 0.36, d: 0.36, z: 10 },
]);
const jar = () => isoItem(0.3, 0.3, 70, [{
  svg: (() => {
    const [cx, cy] = at(0.15, 0.15);
    return `<circle cx="${cx}" cy="${cy - 22}" r="34" fill="#E0FFB0" opacity=".22"/>
      <path d="M${cx - 15} ${cy - 40} Q${cx - 18} ${cy} ${cx - 10} ${cy} H${cx + 10} Q${cx + 18} ${cy} ${cx + 15} ${cy - 40} Z" fill="#DFF3F0" fill-opacity=".75" ${line}/>
      <rect x="${cx - 13}" y="${cy - 48}" width="26" height="9" rx="2" fill="${LILAC}" ${line}/>
      ${[[-6, -12], [5, -22], [-3, -30], [7, -8], [0, -18]].map(([dx, dy], i) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="2.6" fill="#F7F59A"><animate attributeName="opacity" values="1;.2;1" dur="${1.2 + i * 0.3}s" repeatCount="indefinite"/></circle>`).join('')}`;
  })(), w: 0.3, d: 0.3,
}]);
const oldBook = () => isoItem(0.5, 0.4, 20, [
  { u: 0, v: 0, w: 0.5, d: 0.4, h: 5, ...shades('#7A64B0') },
  { svg: (() => { const a = at(0.03, 0.03, 5), b = at(0.25, 0.03, 9), c = at(0.47, 0.03, 5), d = at(0.47, 0.37, 5), e = at(0.25, 0.37, 9), f = at(0.03, 0.37, 5);
    return `<polygon points="${pts([a, b, e, f])}" fill="#FBF3DC" ${line}/><polygon points="${pts([b, c, d, e])}" fill="#F3E8CA" ${line}/>
      ${starPath((b[0] + d[0]) / 2, (b[1] + d[1]) / 2, 5, '#D9B44A')}<path d="M${a[0] + 8} ${a[1] + 8} l14 7 M${a[0] + 4} ${a[1] + 14} l14 7" stroke="#8B7A9C" stroke-width="1.4"/>`; })(), u: 0.25, v: 0.2, w: 0.5, d: 0.4, z: 6 },
]);

// ======================= WALL THINGS =======================
const I = isoDef;
const W = (...a) => wallDef(R, ...a);

const roundWindow = (it, sp, api) => {
  const rain = api?.state?.weather === 'rain';
  const w = sp.len, h = 128, cx = w / 2, cy = h / 2, r = 56;
  const st = (() => { const g = rng(5); return Array.from({ length: rain ? 5 : 18 }, () => `<circle cx="${(cx - r + g() * 2 * r).toFixed(1)}" cy="${(cy - r + g() * 2 * r).toFixed(1)}" r="${(0.8 + g() * 1.4).toFixed(1)}" fill="#fff" opacity="${(0.5 + g() * 0.5).toFixed(2)}"/>`).join(''); })();
  return `<defs><radialGradient id="at-win-sky" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="${rain ? '#56607E' : '#3E4C9A'}"/><stop offset="1" stop-color="${rain ? '#2E3448' : NIGHT}"/></radialGradient>
      <clipPath id="at-win-clip"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs>
    <circle cx="${cx}" cy="${cy}" r="${r + 22}" fill="#E7F0FF" opacity="${rain ? 0.06 : 0.14}"/>
    <g clip-path="url(#at-win-clip)">
      <rect x="0" y="0" width="${w}" height="${h}" fill="url(#at-win-sky)"/>
      ${st}
      ${rain
        ? `<path d="M${cx - 60} ${cy - 10} q14 -20 34 -8 q12 -16 32 -4 q20 -2 18 14 z M${cx - 10} ${cy - 40} q12 -14 28 -6 q14 -8 22 6 z" fill="#7A84A0"/>
           ${Array.from({ length: 10 }, (_, i) => `<line x1="${cx - 50 + i * 11}" y1="${cy + (i % 3) * 10}" x2="${cx - 54 + i * 11}" y2="${cy + 14 + (i % 3) * 10}" stroke="#C9D3E6" stroke-width="2" stroke-linecap="round"/>`).join('')}`
        : `<circle cx="${cx + 20}" cy="${cy - 20}" r="15" fill="#FFF6C8"/><circle cx="${cx + 27}" cy="${cy - 25}" r="13" fill="#34428C"/>
           ${twinkle(cx - 26, cy - 22, 7, '#FFF6C8')}${twinkle(cx - 8, cy + 18, 5, '#CFF3EE')}${twinkle(cx + 30, cy + 22, 4, '#fff')}`}
      <path d="M${cx - r} ${cy + 40} Q${cx - 20} ${cy + 24} ${cx + 10} ${cy + 36} T${cx + r} ${cy + 30} V${cy + r} H${cx - r} Z" fill="#2A2F5E"/>
      <path d="M${cx - 40} ${cy + 46} l8 -18 l8 18 Z M${cx - 22} ${cy + 46} l6 -12 l6 12 Z" fill="#232750"/>
    </g>
    <path d="M${cx} ${cy - r} V${cy + r} M${cx - r} ${cy} H${cx + r}" stroke="${WOOD}" stroke-width="6"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${WOOD_D}" stroke-width="14"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${WOOD_L}" stroke-width="5"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const a = (k / 8) * Math.PI * 2; return `<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r).toFixed(1)}" r="2.4" fill="${GOLD}"/>`; }).join('')}`;
};

const chart = (kind) => (it, sp) => {
  const w = sp.len, h = kind === 'moon' ? 64 : 84;
  const paper = `<path d="M0 2 L${w - 2} 0 L${w} ${h - 12} L${w - 12} ${h} L2 ${h - 2} Z" fill="#F3E6C4" ${line}/><path d="M${w} ${h - 12} L${w - 12} ${h} L${w - 10} ${h - 10} Z" fill="#DCC9A0" ${line}/>`;
  const pin = (x, col) => `<circle cx="${x}" cy="7" r="4.5" fill="${col}" ${line}/>`;
  if (kind === 'moon') {
    return paper + [0, 1, 2, 3, 4].map((i) => { const x = 10 + i * ((w - 20) / 4), y = 34; return `<circle cx="${x}" cy="${y}" r="7" fill="#2E3266"/><circle cx="${x}" cy="${y}" r="7" fill="#FFF3B8" opacity="${[0.15, 0.45, 1, 0.45, 0.15][i]}"/>`; }).join('') + `<path d="M8 52 H${w - 10}" stroke="#B79CF0" stroke-width="1.4" stroke-dasharray="3 3"/>` + pin(w / 2, TEAL);
  }
  if (kind === 'orbit') {
    return paper + `<circle cx="${w / 2}" cy="44" r="8" fill="${SUN}" ${line}/>
      <ellipse cx="${w / 2}" cy="44" rx="${w * 0.28}" ry="14" fill="none" stroke="#8B7A9C" stroke-width="1.2"/><ellipse cx="${w / 2}" cy="44" rx="${w * 0.42}" ry="24" fill="none" stroke="#8B7A9C" stroke-width="1.2"/>
      <circle cx="${w / 2 + w * 0.28}" cy="44" r="4" fill="${TEAL}"/><circle cx="${w / 2 - w * 0.2}" cy="${44 - 22}" r="5" fill="${LILAC}"/>` + pin(10, LILAC) + pin(w - 10, LILAC);
  }
  const st = [[0.2, 0.3], [0.4, 0.22], [0.55, 0.45], [0.78, 0.36], [0.68, 0.72], [0.32, 0.66]].map(([x, y]) => [x * w, y * h]);
  return paper + `<path d="M${st.map((p) => p.join(' ')).join(' L')} Z" fill="none" stroke="#6E79B8" stroke-width="1.2" opacity=".8"/>`
    + st.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 2.6 : 3.4}" fill="#3E4C9A"/>`).join('') + pin(w / 2, '#E58F6A');
};

const hangingLantern = (it, sp) => {
  const cx = sp.len / 2;
  return `<path d="M${cx} -4 V30" stroke="#4A3B5C" stroke-width="2" stroke-dasharray="4 2"/>
    <circle cx="${cx}" cy="64" r="44" fill="#FFE7A0" opacity=".25"/>
    <path d="M${cx - 8} 30 Q${cx} 20 ${cx + 8} 30" fill="none" stroke="#4A3B5C" stroke-width="3"/>
    <path d="M${cx - 16} 40 L${cx} 28 L${cx + 16} 40 Z" fill="#4A3B5C" ${line}/>
    <rect x="${cx - 13}" y="40" width="26" height="40" rx="4" fill="#FFE9A6" ${line}/>
    <path d="M${cx} 52 q-6 9 0 16 q6 -7 0 -16 Z" fill="#F5A64A"/><path d="M${cx} 57 q-2.5 4 0 7 q2.5 -3 0 -7 Z" fill="#FFF6C8"/>
    <rect x="${cx - 16}" y="80" width="32" height="7" rx="2" fill="#4A3B5C" ${line}/>`;
};

// ======================= SCENE =======================
export const ATTIC = {
  id: 'attic', posKey: 'attic-iso', title: 'Secret Attic ✨', back: ['scene', { id: 'home' }], backLabel: 'Room',
  weather: true, light: 'iso', iso: R, frame: '#2E2A5A', avatar: [3.7, 3.7],
  bg,
  onWeather: (api) => api.setArt(api.get('window')),
  items: [
    // walls
    W('lights', 'R', 0.15, 300, 4.3, 36, (it, sp) => stringLights(4, sp.len - 4, 2, 6)),
    W('lights2', 'L', 0.15, 298, 3.1, 40, (it, sp) => stringLights(4, sp.len - 4, 4, 8)),
    W('starmap', 'R', 0.55, 242, 4, 176, (it, sp, api) => {
      const s = sp.len / 640, cx = sp.len / 2;
      return `<path d="M${cx - 40} 4 L${cx} -12 L${cx + 40} 4" fill="none" stroke="#4A3B5C" stroke-width="2"/><circle cx="${cx}" cy="-13" r="3.5" fill="${GOLD}" ${line}/>
        <g transform="scale(${s})">${mapBody(api?.state?.story?.pieces || [], 'at-smw')}</g>`;
    }, { drag: false }),
    W('window', 'L', 0.65, 262, 2, 128, roundWindow),
    W('chart1', 'L', 3.05, 214, 0.95, 84, chart('stars')),
    W('chart2', 'L', 4.35, 196, 0.85, 64, chart('moon')),
    W('chart3', 'R', 5.25, 206, 1.0, 84, chart('orbit')),
    W('hanglamp', 'R', 6.55, 214, 0.5, 90, hangingLantern),

    // floor
    I('hatch', 5.5, 5.4, 2.3, 1.3, hatch, { floor: true, drag: false, onTap: (it, api) => { api.sfx.click(); api.go('scene', { id: 'home' }); } }),
    I('chest', 1.6, 0.15, 1.6, 1, chest, { drag: false, data: { open: false },
      onTap: (it, api) => {
        it.data.open = !it.data.open; api.setArt(it); api.sfx.click();
        if (it.data.open) api.bubble(it.x + it.w / 2, it.y, 'Just old blankets… and dust!');
      } }),
    I('boxes', 6.4, 0.1, 1.3, 1, boxes, { surface: 106 }),
    I('box2', 7.0, 2.3, 0.9, 0.8, smallBox),
    I('rug', 3.4, 1.3, 2.2, 0.5, rolledRug),
    I('trunk', 0.08, 3.5, 1, 1.5, trunk, { surface: 72 }),
    I('telescope', 1.2, 1.9, 0.8, 0.8, telescope, {
      onTap: (it, api) => { api.bubble(it.x + it.w / 2, it.y, 'So many stars… one of them is moving! ✨'); api.sparkle(it.x + it.w * 0.3, it.y + 30, ['✨', '⭐', '💫', '🌟']); } }),
    I('rocker', 4.7, 2.7, 1, 1, rockingChair, {
      onTap: (it, api) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.bubble(it.x + it.w / 2, it.y, 'Creak… creak… 🪑'); } }),
    I('globe', 0.3, 5.6, 0.7, 0.7, globe, {
      onTap: (it, api) => { api.sparkle(it.x + it.w / 2, it.y + 40, ['🌍', '✨', '🌏']); api.bubble(it.x + it.w / 2, it.y, 'Round and round the world! 🌍'); } }),
    I('lantern', 5.95, 2.95, 0.36, 0.36, lantern(true), { small: true }),
    I('lantern2', 0.35, 3.9, 0.36, 0.36, lantern(true), { small: true, gz: 72 }),
    I('jar', 6.85, 0.45, 0.3, 0.3, jar, { small: true, gz: 106,
      onTap: (it, api) => api.sparkle(it.x + it.w / 2, it.y + 20, ['✨', '💛', '✨']) }),
    I('book', 3.0, 5.0, 0.5, 0.4, oldBook, { small: true }),
  ],
};
