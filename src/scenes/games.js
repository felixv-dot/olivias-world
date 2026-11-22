// Game Room (isometric dollhouse): real mini-games (Tic-Tac-Toe and Memory) on two game tables,
// an arcade machine, a claw machine, darts on the wall and comfy bean bags.
import { room, roomShell, isoItem, at, shades, proj, isoDef, wallDef } from '../iso.js';
import { svg, text, starPath, stringLights, NPC } from './common.js';

const R = room({ cols: 9, rows: 8, ox: 768, oy: 314, wallH: 280 });
R.charScale = 0.6;

const WOOD = '#C99A6C', WOOD_D = '#B58456', WOOD_L = '#E2C29C', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', TURQ = '#3CC7B8',
  SKY = '#9CC8EE', SUN = '#F5DE7A', CORAL = '#E58F6A', LEAF = '#6DBE7A', NAVY = '#3E3F78', INKY = '#3E3252';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4"';
const P = (a) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const cyl = (cx, cy, rx, h, side, top = side, ln = line) => `<path d="M${cx - rx} ${cy - h} V${cy} A${rx} ${rx / 2} 0 0 0 ${cx + rx} ${cy} V${cy - h} Z" fill="${side}" ${ln}/><ellipse cx="${cx}" cy="${cy - h}" rx="${rx}" ry="${rx / 2}" fill="${top}" ${ln}/>`;
const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx / 2}" fill="${INKY}" opacity=".14"/>`;
// Parts that sit on top of other parts, drawn as one group after them (isoItem sorts parts by footprint only).
const onTop = (parts, key = 99) => { const s = isoItem(1, 0, 0, parts).svg; return { svg: s.slice(s.indexOf('<g'), s.lastIndexOf('</svg>')), u: key, v: 0, w: 0, d: 0 }; };
const moon = (cx, cy, r, col) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/><circle cx="${cx + r * 0.45}" cy="${cy - r * 0.25}" r="${r * 0.8}" fill="${CREAM}"/>`;

// ---------- background ----------
const bg = () => {
  const [lx] = proj(R, 0, R.rows), [rx] = proj(R, R.cols, 0), [, fy] = proj(R, R.cols, R.rows);
  const [gx, gy] = proj(R, 4.4, 4.4);
  return svg(1600, 900, `
  <defs>
    <radialGradient id="games-bd" cx="50%" cy="55%" r="70%"><stop offset="0" stop-color="#EDE8F8"/><stop offset="1" stop-color="#CFC6E8"/></radialGradient>
    <pattern id="games-wl" width="72" height="72" patternUnits="userSpaceOnUse" patternTransform="matrix(1,-0.5,0,1,${R.ox},${R.oy})">
      <rect width="72" height="72" fill="#4A4B86"/>${starPath(36, 30, 6, SUN, 'opacity=".55"')}<circle cx="10" cy="62" r="2.2" fill="#fff" opacity=".5"/><circle cx="60" cy="8" r="1.6" fill="#fff" opacity=".4"/></pattern>
    <pattern id="games-wr" width="72" height="72" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,0,1,${R.ox},${R.oy})">
      <rect width="72" height="72" fill="${NAVY}"/>${starPath(36, 30, 6, SUN, 'opacity=".5"')}<circle cx="10" cy="62" r="2.2" fill="#fff" opacity=".45"/><circle cx="60" cy="8" r="1.6" fill="#fff" opacity=".4"/></pattern>
    <pattern id="games-fl" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,-1,0.5,${R.ox},${R.oy})">
      <rect width="64" height="64" fill="#8D78C2"/><circle cx="32" cy="32" r="18" fill="none" stroke="#9C89CC" stroke-width="5"/><circle cx="0" cy="0" r="5" fill="#9C89CC"/></pattern>
    <radialGradient id="games-glow"><stop offset="0" stop-color="#FFF3B0" stop-opacity=".35"/><stop offset="1" stop-color="#FFF3B0" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#games-bd)"/>
  <ellipse cx="${(lx + rx) / 2}" cy="${fy + 6}" rx="600" ry="46" fill="${INKY}" opacity=".12"/>
  ${roomShell(R, { floor: '#8D78C2', floorLines: 'tiles', wallL: '#4A4B86', wallR: NAVY, floorPattern: 'games-fl', wallPatternL: 'games-wl', wallPatternR: 'games-wr', base: '#2E2A3A' })}
  <ellipse cx="${gx}" cy="${gy}" rx="360" ry="180" fill="url(#games-glow)"/>`);
};

// ---------- furniture ----------
const gameTable = (decor, label) => () => {
  const top = shades(WOOD_L), leg = shades(WOOD_D), felt = shades(TEAL, 0.6);
  return isoItem(1.6, 1.6, 74, [
    ...[[0.1, 0.1], [1.38, 0.1], [0.1, 1.38], [1.38, 1.38]].map(([u, v]) => ({ u, v, w: 0.12, d: 0.12, h: 62, ...leg })),
    onTop([{ u: 0, v: 0, w: 1.6, d: 1.6, z: 62, h: 8, ...top, leftDecor: `${text(51, 7, label, 7, '#7A64B0')}` },
      onTop([{ u: 0.1, v: 0.1, w: 1.4, d: 1.4, z: 70, h: 4, ...felt, topDecor: decor }])]),
  ]);
};
const tttDecor = `<rect x=".25" y=".25" width=".9" height=".9" rx=".06" fill="${CREAM}"/><path d="M.55 .3 V1.1 M.85 .3 V1.1 M.3 .55 H1.1 M.3 .85 H1.1" stroke="${INKY}" stroke-width=".03"/>
  ${starPath(0.4, 0.4, 0.1, SUN)}${starPath(1.0, 1.0, 0.1, SUN)}${moon(0.7, 0.7, 0.09, '#7A64B0')}${moon(1.0, 0.4, 0.09, '#7A64B0')}`;
const memDecor = [0, 1, 2, 3, 4, 5].map((i) => {
  const x = 0.2 + (i % 3) * 0.36, y = 0.3 + Math.floor(i / 3) * 0.46, up = i === 2;
  return `<rect x="${x}" y="${y}" width=".28" height=".38" rx=".04" fill="${up ? '#fff' : LILAC}" stroke="${INKY}" stroke-opacity=".5" stroke-width=".015"/>${up ? starPath(x + 0.14, y + 0.19, 0.08, CORAL) : starPath(x + 0.14, y + 0.19, 0.05, '#fff')}`;
}).join('');

const stool = (col) => () => {
  const [cx, cy] = at(0.25, 0.25);
  return isoItem(0.5, 0.5, 58, [{ svg: `${shadow(cx, cy, 20)}${cyl(cx, cy, 4, 40, '#8B6450')}<path d="M${cx - 14} ${cy - 2} L${cx} ${cy - 30} L${cx + 14} ${cy - 2}" stroke="#8B6450" stroke-width="3" fill="none"/>${cyl(cx, cy - 40, 20, 8, col, shades(col).top)}`, u: 0.25, v: 0.25, w: 0.1, d: 0.1 }]);
};

const gameShelf = () => {
  const c = shades('#EADBC5');
  const boxes = (y, seed) => Array.from({ length: 6 }, (_, i) => {
    const h = 24 + ((i * 5 + seed) % 14), col = [CORAL, TEAL, SUN, LILAC, SKY, '#C9B8F2'][(i + seed) % 6];
    return `<rect x="${8 + i * 21}" y="${y - h}" width="18" height="${h}" fill="${col}" ${line}/><rect x="${11 + i * 21}" y="${y - h + 6}" width="12" height="4" rx="1" fill="#fff" opacity=".7"/>`;
  }).join('');
  const flat = (y) => [[SUN, 0], [TURQ, 1], [LILAC, 2]].map(([col, i]) => `<rect x="10" y="${y - 10 - i * 10}" width="${60 - i * 6}" height="10" fill="${col}" ${line}/>`).join('');
  return isoItem(2.2, 0.55, 190, [
    { u: 0, v: 0, w: 2.2, d: 0.55, h: 190, ...c,
      leftDecor: `<rect x="5" y="6" width="${2.2 * 64 - 10}" height="178" fill="#D9C6AC"/>
        ${[62, 122, 178].map((y) => `<rect x="5" y="${y}" width="${2.2 * 64 - 10}" height="6" fill="#EADBC5" ${line}/>`).join('')}
        ${boxes(62, 1)}${flat(122)}<circle cx="100" cy="108" r="12" fill="${SKY}" ${line}/><path d="M92 108 h16" stroke="#fff" stroke-width="2"/>${boxes(178, 3)}` },
  ]);
};

const arcade = () => {
  const body = shades(LILAC), panel = shades('#9A80D8'), dark = shades('#2E2A3A');
  return isoItem(1, 1.1, 236, [
    { u: 0, v: 0, w: 1, d: 0.78, h: 236, ...body,
      leftDecor: `<rect x="6" y="8" width="52" height="24" rx="5" fill="#2E2A3A"/>${text(32, 25, 'SPACE PETS', 8, SUN)}
        <rect x="5" y="40" width="54" height="64" rx="6" fill="#2E2A3A"/>
        <g class="screen"><rect x="9" y="44" width="46" height="56" rx="4" fill="#3E4A8E"/>${starPath(20, 56, 4, SUN)}${starPath(46, 52, 3, '#fff')}<circle cx="32" cy="80" r="9" fill="${TEAL}"/><ellipse cx="32" cy="80" rx="15" ry="4" fill="none" stroke="${SUN}" stroke-width="2"/><circle cx="44" cy="92" r="2" fill="#fff"/></g>
        <rect x="20" y="170" width="24" height="16" rx="3" fill="#2E2A3A"/><rect x="28" y="174" width="8" height="8" rx="2" fill="${SUN}"/>`,
      rightDecor: `${starPath(25, 60, 12, '#fff', 'opacity=".6"')}${starPath(14, 120, 7, SUN, 'opacity=".8"')}` },
    { u: 0.04, v: 0.78, w: 0.92, d: 0.3, z: 104, h: 16, ...panel,
      topDecor: '' },
    { svg: (() => { const [jx, jy] = at(0.3, 0.92, 120), [ax, ay] = at(0.62, 0.9, 120), [bx, by] = at(0.78, 0.94, 120);
      return `<path d="M${jx} ${jy} V${jy - 16}" stroke="${INKY}" stroke-width="4"/><circle cx="${jx}" cy="${jy - 18}" r="6" fill="${CORAL}" ${line}/><ellipse cx="${ax}" cy="${ay - 2}" rx="6" ry="3.5" fill="${SUN}" ${line}/><ellipse cx="${bx}" cy="${by - 2}" rx="6" ry="3.5" fill="${TEAL}" ${line}/>`; })(), u: 0.5, v: 0.95, w: 0.1, d: 0.1, z: 120 },
    onTop([{ u: -0.03, v: -0.03, w: 1.06, d: 0.84, z: 236, h: 6, ...dark }]),
  ]);
};

const claw = () => {
  const base = shades(TEAL), top = shades(TURQ);
  const prizes = (() => {
    const ball = (u, v, col) => { const [x, y] = at(u, v, 100); return `<circle cx="${x}" cy="${y - 12}" r="12" fill="${col}" ${line}/><path d="M${x - 6} ${y - 17} q4 -4 9 -3" stroke="#fff" stroke-width="2" opacity=".6" fill="none"/>`; };
    const [cx, cy] = at(0.55, 0.5, 196);
    return [[0.25, 0.3, SUN], [0.55, 0.25, LILAC], [0.85, 0.35, SKY], [0.35, 0.65, CORAL], [0.7, 0.7, TEAL], [0.5, 0.5, '#C9B8F2']].map(([u, v, c]) => ball(u, v, c)).join('')
      + `<path d="M${cx} ${cy - 14} V${cy + 26}" stroke="#A9AEC2" stroke-width="2"/><path d="M${cx - 10} ${cy + 40} L${cx - 6} ${cy + 28} H${cx + 6} L${cx + 10} ${cy + 40}" stroke="#A9AEC2" stroke-width="3" fill="none"/>`;
  })();
  return isoItem(1.1, 1, 244, [
    { u: 0, v: 0, w: 1.1, d: 1, h: 100, ...base,
      leftDecor: `<rect x="12" y="20" width="46" height="30" rx="5" fill="#fff" fill-opacity=".3" ${line}/>${text(35, 40, 'PRIZES', 9, '#fff')}<rect x="28" y="70" width="14" height="18" rx="3" fill="#2E2A3A"/>` },
    { svg: prizes, u: 0, v: 0, w: 1.1, d: 1, z: 90 },
    { u: 0, v: 0, w: 1.1, d: 1, z: 100, h: 112, top: '#EAF6FF55', left: '#DDEFFF66', right: '#CFE3F666',
      leftDecor: '<path d="M10 100 L40 10 M24 100 L54 10" stroke="#fff" stroke-width="4" opacity=".7"/>' },
    onTop([{ u: -0.03, v: -0.03, w: 1.16, d: 1.06, z: 212, h: 30, ...top, leftDecor: `${starPath(20, 15, 7, SUN)}${starPath(54, 15, 7, SUN)}${text(37, 20, '★', 12, '#fff')}` }]),
  ]);
};

const beanbag = (col) => () => isoItem(1.1, 1, 80, [{
  svg: (() => { const [cx, cy] = at(0.55, 0.5); return `<ellipse cx="${cx}" cy="${cy + 4}" rx="74" ry="32" fill="${INKY}" opacity=".14"/>
    <path d="M${cx - 70} ${cy} C${cx - 74} ${cy - 62} ${cx - 22} ${cy - 80} ${cx + 10} ${cy - 70} C${cx + 64} ${cy - 60} ${cx + 76} ${cy - 20} ${cx + 68} ${cy + 4} C${cx + 42} ${cy + 28} ${cx - 42} ${cy + 28} ${cx - 70} ${cy} Z" fill="${col}" ${line}/>
    <path d="M${cx - 42} ${cy - 32} Q${cx} ${cy - 12} ${cx + 42} ${cy - 32}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/>`; })(),
  w: 1.1, d: 1,
}]);

const puzzle = () => {
  const box = shades(SKY);
  return isoItem(0.6, 0.45, 26, [
    { u: 0, v: 0, w: 0.6, d: 0.45, h: 18, ...box, leftDecor: `${text(19, 13, 'PUZZLE', 7, '#fff')}`,
      topDecor: `<path d="M.12 .1 h.14 q0 -.06 .05 -.06 q.05 0 .05 .06 h.14 v.12 q-.06 0 -.06 .05 q0 .05 .06 .05 v.08 h-.38 z" fill="${SUN}" stroke="${INKY}" stroke-opacity=".5" stroke-width=".012"/>` },
  ]);
};

const lamp = (it) => isoItem(0.6, 0.6, 200, [
  { u: 0.1, v: 0.1, w: 0.4, d: 0.4, h: 8, ...shades('#2E2A3A') },
  { u: 0.27, v: 0.27, w: 0.06, d: 0.06, z: 8, h: 150, ...shades('#5E6A8A') },
  { svg: (() => { const [cx, cy] = at(0.3, 0.3, 158); return `${it?.data.on ? `<radialGradient id="games-lampglow"><stop offset="0" stop-color="#FFF3B0" stop-opacity=".55"/><stop offset="1" stop-color="#FFF3B0" stop-opacity="0"/></radialGradient><circle cx="${cx}" cy="${cy}" r="90" fill="url(#games-lampglow)"/>` : ''}<path d="M${cx - 30} ${cy + 10} L${cx - 18} ${cy - 30} H${cx + 18} L${cx + 30} ${cy + 10} Z" fill="${it?.data.on ? '#FFF0A0' : SUN}" ${line}/>`; })(), w: 0.6, d: 0.6, u: 0.3, v: 0.3, z: 200 },
]);

const rug = () => isoItem(3.2, 3, 4, [{ u: 0, v: 0, w: 3.2, d: 3, h: 0, round: true, top: '#5E5AA0',
  topDecor: `<ellipse cx="1.6" cy="1.5" rx="1.3" ry="1.2" fill="none" stroke="${SUN}" stroke-opacity=".7" stroke-width=".05" stroke-dasharray=".16 .12"/>${starPath(0.7, 0.8, 0.12, SUN)}${starPath(2.5, 1.0, 0.09, '#fff')}${starPath(1.0, 2.3, 0.08, '#fff')}${starPath(2.3, 2.2, 0.12, SUN)}` }]);

// Low TV stand with a game console; the TV faces into the room (towards +u).
const tv = (it) => {
  const stand = shades(WOOD_L), frame = shades('#2E2A3A');
  const on = it?.data.on;
  return isoItem(0.7, 1.7, 150, [
    { u: 0, v: 0, w: 0.7, d: 1.7, h: 46, ...stand,
      rightDecor: `<rect x="8" y="8" width="44" height="30" rx="4" fill="none" ${line}/><rect x="58" y="8" width="44" height="30" rx="4" fill="none" ${line}/><rect x="14" y="20" width="30" height="8" rx="3" fill="#F2F0F8" ${line}/><circle cx="96" cy="23" r="2.5" fill="${WOOD_D}"/>` },
    onTop([{ u: 0.18, v: 0.55, w: 0.2, d: 0.6, z: 46, h: 6, ...frame },
      onTop([{ u: 0.2, v: 0.05, w: 0.06, d: 1.6, z: 52, h: 92, ...frame,
        rightDecor: on
          ? `<rect x="5" y="5" width="92" height="80" rx="3" fill="#3E4A8E"/>${starPath(24, 24, 6, SUN)}${starPath(76, 30, 4, '#fff')}<rect x="40" y="56" width="22" height="14" rx="3" fill="${TEAL}"/><path d="M5 72 H97" stroke="${LEAF}" stroke-width="6"/>${text(51, 46, 'LEVEL 3', 11, '#fff')}`
          : '<rect x="5" y="5" width="92" height="80" rx="3" fill="#2E2A3A"/><path d="M14 16 L40 10" stroke="#fff" stroke-width="4" opacity=".25"/>' }])]),
    { svg: (() => { const [x, y] = at(0.45, 1.35, 46); return `<rect x="${x - 12}" y="${y - 8}" width="24" height="8" rx="2" fill="#F2F0F8" ${line}/><path d="M${x + 10} ${y - 4} q12 6 24 2" fill="none" stroke="${INKY}" stroke-width="1.5"/><ellipse cx="${x + 38}" cy="${y - 2}" rx="9" ry="5" fill="${LILAC}" ${line}/>`; })(), u: 200, v: 0, w: 0, d: 0 },
  ]);
};

const cushion = (col) => () => {
  const [cx, cy] = at(0.35, 0.35);
  return isoItem(0.7, 0.7, 30, [{ svg: `${shadow(cx, cy + 2, 34)}<path d="M${cx - 40} ${cy - 4} Q${cx - 42} ${cy - 22} ${cx} ${cy - 24} Q${cx + 42} ${cy - 22} ${cx + 40} ${cy - 4} Q${cx} ${cy + 18} ${cx - 40} ${cy - 4} Z" fill="${col}" ${line}/>
    <path d="M${cx - 26} ${cy - 12} Q${cx} ${cy - 4} ${cx + 26} ${cy - 12}" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/>${starPath(cx, cy - 10, 5, '#fff')}`, u: 0.35, v: 0.35, w: 0.1, d: 0.1 }]);
};

// ---------- Tic-Tac-Toe vs the computer ----------
function ticTacToe(api, table) {
  api.modal((card) => {
    let b = Array(9).fill(''), over = false;
    card.innerHTML += `<h2>Tic-Tac-Toe</h2><p class="m-status">You are ⭐ — get three in a row!</p><div class="ttt"></div><button class="btn m-again">Play again</button>`;
    const grid = card.querySelector('.ttt'), status = card.querySelector('.m-status');
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    const winner = (p) => lines.some((l) => l.every((i) => b[i] === p));
    const draw = () => { grid.innerHTML = ''; b.forEach((v, i) => { const c = document.createElement('button'); c.className = 'cell'; c.textContent = v; c.onclick = () => play(i); grid.append(c); }); };
    const ai = () => {
      const free = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
      const tryWin = (p) => free.find((i) => { b[i] = p; const w = winner(p); b[i] = ''; return w; });
      let m = tryWin('🌙');
      if (m === undefined) m = tryWin('⭐');
      if (m === undefined && Math.random() < 0.35) m = undefined;
      if (m === undefined && b[4] === '') m = 4;
      if (m === undefined) m = free[Math.floor(Math.random() * free.length)];
      b[m] = '🌙';
    };
    function play(i) {
      if (over || b[i]) return;
      b[i] = '⭐'; api.sfx.click();
      if (winner('⭐')) return end('You win! 🎉', true);
      if (b.every(Boolean)) return end("It's a draw! 🤝");
      ai();
      if (winner('🌙')) return end('The moon wins this time! 🌙');
      if (b.every(Boolean)) return end("It's a draw! 🤝");
      draw();
    }
    function end(msg, won) {
      over = true; draw(); status.textContent = msg;
      if (won) {
        api.sfx.win();
        if (!api.starFound('games-ttt')) { api.addStar('games-ttt', 0, 0, { spawned: true, gx: table.gx + 0.6, gy: table.gy + 0.6, gz: table.def.surface }); status.textContent += ' A star appeared on the table! ⭐'; }
      }
    }
    card.querySelector('.m-again').onclick = () => { b = Array(9).fill(''); over = false; status.textContent = 'You are ⭐ — get three in a row!'; draw(); };
    draw();
  });
}

// ---------- Memory: find the pairs ----------
function memory(api, table) {
  api.modal((card) => {
    const icons = ['☀️', '🌴', '🍦', '🐚', '☕', '🌈'];
    let deck, open, found, moves, lock;
    card.innerHTML += `<h2>Memory</h2><p class="m-status">Find all the pairs!</p><div class="mem"></div><button class="btn m-again">New game</button>`;
    const grid = card.querySelector('.mem'), status = card.querySelector('.m-status');
    function reset() {
      deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
      open = []; found = new Set(); moves = 0; lock = false;
      status.textContent = 'Find all the pairs!';
      draw();
    }
    function draw() {
      grid.innerHTML = '';
      deck.forEach((ic, i) => {
        const c = document.createElement('button');
        const shown = found.has(i) || open.includes(i);
        c.className = 'card' + (shown ? ' up' : '') + (found.has(i) ? ' done' : '');
        c.textContent = shown ? ic : '★';
        c.onclick = () => flip(i);
        grid.append(c);
      });
    }
    function flip(i) {
      if (lock || found.has(i) || open.includes(i)) return;
      open.push(i); api.sfx.click(); draw();
      if (open.length < 2) return;
      moves++;
      const [a, b2] = open;
      if (deck[a] === deck[b2]) {
        found.add(a); found.add(b2); open = []; api.sfx.pop(); draw();
        if (found.size === deck.length) {
          status.textContent = `All pairs in ${moves} moves! 🎉`; api.sfx.win();
          if (!api.starFound('games-memory')) { api.addStar('games-memory', 0, 0, { spawned: true, gx: table.gx + 0.6, gy: table.gy + 0.6, gz: table.def.surface }); status.textContent += ' A star appeared! ⭐'; }
        }
      } else {
        lock = true;
        setTimeout(() => { open = []; lock = false; draw(); }, 800);
      }
    }
    card.querySelector('.m-again').onclick = reset;
    reset();
  });
}

// ---------- wall decor ----------
const I = isoDef;
const W = (...a) => wallDef(R, ...a);

const DART_R = 46;
const dartBody = (it, sp) => {
  const c = sp.len / 2, cy = 52;
  return `<circle cx="${c}" cy="${cy}" r="${DART_R + 4}" fill="#2E2A3A" ${line}/><circle cx="${c}" cy="${cy}" r="${DART_R - 6}" fill="${CREAM}"/><circle cx="${c}" cy="${cy}" r="${DART_R - 16}" fill="${CORAL}"/>
    <circle cx="${c}" cy="${cy}" r="${DART_R - 25}" fill="${CREAM}"/><circle cx="${c}" cy="${cy}" r="11" fill="${TURQ}"/><circle cx="${c}" cy="${cy}" r="4.5" fill="${CORAL}"/>`;
};

export const GAMES = {
  id: 'games', posKey: 'games-iso', title: 'Game Room 🎲', light: 'iso', avatar: [3.3, 5.7],
  frame: '#DCD3EE',
  iso: R,
  bg,
  characters: [{ id: 'mia2', look: NPC.mia, gx: 3.7, gy: 2.4, say: ['Play Tic-Tac-Toe with me! ⭐', 'I love the Memory game!', 'High score! 👾'] }],
  items: [
    // walls
    W('lights', 'L', 0.2, 276, 7.6, 50, () => stringLights(4, 7.6 * 64 - 4, 6, 14)),
    W('lights2', 'R', 5.4, 276, 3.4, 50, () => stringLights(4, 3.4 * 64 - 4, 6, 12)),
    W('neon', 'R', 2.5, 268, 2.7, 58, (it, sp) => `<rect width="${sp.len}" height="58" rx="16" fill="#2E2A3A" stroke="${SUN}" stroke-width="4"/>
      <text x="${sp.len / 2}" y="40" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="600" font-size="28" fill="${SUN}" class="neon">GAME ROOM</text>`),
    W('scores', 'R', 0.4, 270, 1.8, 66, (it, sp) => `<rect width="${sp.len}" height="66" rx="6" fill="#2E2A3A" stroke="${WOOD}" stroke-width="4"/>${text(sp.len / 2, 20, 'HIGH SCORES', 11, SUN)}
      <g font-family="Fredoka, sans-serif" font-size="10" fill="#fff">${[['Olivia', '999'], ['Mia', '870'], ['Leo', '640']].map(([n, s], i) => `<text x="12" y="${36 + i * 11}">${n}</text><text x="${sp.len - 12}" y="${36 + i * 11}" text-anchor="end" fill="${TEAL}">${s}</text>`).join('')}</g>`),
    W('darts', 'L', 1.0, 236, 1.6, 104, dartBody, {
      onTap: (it, api) => {
        // board point (wall-local) → scene point: the left wall is skewed up towards the back corner
        const len = 1.6 * 64, a = Math.random() * Math.PI * 2, r = Math.random() * (DART_R - 8);
        const bx = len / 2 + Math.cos(a) * r, by = 52 + Math.sin(a) * r;
        const bull = r < 9;
        api.effect(it.x + bx, it.y + by - bx * 0.5 + len * 0.5, 'dart', '<svg viewBox="0 0 40 40" width="40" height="40"><path d="M20 20 L36 4" stroke="#4A3B5C" stroke-width="4" stroke-linecap="round"/><path d="M32 2 L38 8 L34 10 L30 6 Z" fill="#E58F6A"/></svg>', 1600);
        api.bubble(it.x + len / 2, it.y - 10, bull ? 'BULLSEYE! 🎯' : ['Nice throw!', 'Almost!', 'Good one! 🎯'][Math.floor(Math.random() * 3)]);
        if (bull) api.sfx.win();
      } }),
    W('trophies', 'L', 3.3, 210, 2.2, 72, (it, sp) => `<rect y="62" width="${sp.len}" height="7" rx="2" fill="${WOOD}" ${line}/>
      ${[[18, 1], [56, 1.3], [96, 1], [126, 0.8]].map(([x, s]) => `<path d="M${x - 9 * s} ${62 - 34 * s} h${18 * s} q0 ${16 * s} ${-9 * s} ${18 * s} q${-9 * s} ${-2 * s} ${-9 * s} ${-18 * s} z" fill="${SUN}" ${line}/><rect x="${x - 2 * s}" y="${62 - 16 * s}" width="${4 * s}" height="${8 * s}" fill="${SUN}"/><rect x="${x - 7 * s}" y="${62 - 8 * s}" width="${14 * s}" height="${8 * s}" rx="1" fill="${WOOD_D}" ${line}/>`).join('')}`),
    W('poster', 'L', 6.0, 236, 1.2, 96, (it, sp) => `<rect width="${sp.len}" height="96" rx="5" fill="${TURQ}" ${line}/><circle cx="${sp.len / 2}" cy="42" r="20" fill="${LILAC}"/><ellipse cx="${sp.len / 2}" cy="45" rx="34" ry="8" fill="none" stroke="${SUN}" stroke-width="3"/>${starPath(16, 16, 5, '#fff')}${starPath(sp.len - 14, 28, 4, SUN)}${text(sp.len / 2, 86, 'LEVEL UP', 11, '#fff')}`),

    I('rug', 4.2, 3.6, 3.2, 3, rug, { floor: true }),
    I('shelf', 0.3, 0.05, 2.2, 0.55, gameShelf, { drag: false }),
    I('arcade', 5.3, 0.08, 1, 1.1, arcade, { drag: false,
      onTap: (it, api) => { it.el.classList.remove('flash'); void it.el.offsetWidth; it.el.classList.add('flash'); api.sfx.win(); api.bubble(it.x + it.w / 2, it.y - 10, ['High score! 👾', 'Level up! ⬆️', 'Bonus round! 🎮'][Math.floor(Math.random() * 3)]); } }),
    I('claw', 6.7, 0.08, 1.1, 1, claw, { drag: false,
      onTap: (it, api) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.sfx.click(); api.bubble(it.x + it.w / 2, it.y - 10, ['So many prizes! 🧸', 'Almost got one!', 'Grab, grab! ✨'][Math.floor(Math.random() * 3)]); } }),
    I('lamp', 8.3, 4.6, 0.6, 0.6, lamp, { data: { on: true }, onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); } }),
    I('ttt', 1.2, 3.2, 1.6, 1.6, gameTable(tttDecor, 'TIC-TAC-TOE'), { drag: false, surface: 74, onTap: (it, api) => ticTacToe(api, it) }),
    I('memory', 5.0, 4.3, 1.6, 1.6, gameTable(memDecor, 'MEMORY'), { drag: false, surface: 74, onTap: (it, api) => memory(api, it) }),
    I('stool1', 3.0, 3.75, 0.5, 0.5, stool(SUN)),
    I('stool2', 1.75, 5.0, 0.5, 0.5, stool(TEAL)),
    I('stool3', 4.35, 4.85, 0.5, 0.5, stool(CORAL)),
    I('stool4', 6.85, 4.85, 0.5, 0.5, stool(SKY)),
    I('bean1', 7.2, 2.5, 1.1, 1, beanbag(TEAL)),
    I('bean2', 7.4, 6.3, 1.1, 1, beanbag(SUN)),
    I('puzzle', 3.6, 6.7, 0.6, 0.45, puzzle),
    I('tv', 0.05, 5.0, 0.7, 1.7, tv, { drag: false, data: { on: false },
      onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); api.bubble(it.x + it.w / 2, it.y - 10, it.data.on ? 'Game on! 🎮' : 'TV off'); } }),
    I('cush1', 0.95, 5.2, 0.7, 0.7, cushion(LILAC)),
    I('cush2', 1.0, 6.3, 0.7, 0.7, cushion(TURQ)),
  ],
};
