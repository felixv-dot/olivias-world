// Game Room: real mini-games (Tic-Tac-Toe and Memory), an arcade machine, darts and bean bags.
import { INK, O, svg, text, starPath, stringLights, NPC } from './common.js';

const bg = () => svg(1600, 900, `
  <defs>
    <pattern id="gwp" width="90" height="90" patternUnits="userSpaceOnUse"><rect width="90" height="90" fill="#3E3F78"/>${starPath(45, 40, 7, '#F5DE7A', 'opacity=".55"')}<circle cx="12" cy="78" r="2.5" fill="#fff" opacity=".5"/></pattern>
    <pattern id="gfl" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#7A64B0"/><circle cx="40" cy="40" r="20" fill="none" stroke="#8D78C2" stroke-width="5"/></pattern>
  </defs>
  <rect width="1600" height="640" fill="url(#gwp)"/>
  <rect y="640" width="1600" height="260" fill="url(#gfl)"/>
  <rect ${O} x="-10" y="626" width="1620" height="22" fill="#2E2A3A"/>
  <g transform="translate(560 50)"><rect width="480" height="96" rx="24" fill="#2E2A3A" stroke="#F5DE7A" stroke-width="6"/>
    <text x="240" y="66" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="600" font-size="52" fill="#F5DE7A" class="neon">GAME ROOM</text></g>
  ${stringLights(20, 520, 40, 26)}${stringLights(1080, 1580, 40, 26)}
  <g transform="translate(60 230)"><rect ${O} width="420" height="18" rx="5" fill="#C9A57C"/><rect ${O} y="150" width="420" height="18" rx="5" fill="#C9A57C"/>
    ${[['#E58F6A', 20, 70], ['#9EDDD4', 70, 60], ['#F5DE7A', 120, 80], ['#C9B8F2', 190, 64], ['#8FC3F0', 250, 76], ['#E58F6A', 320, 58]].map(([c, x, h]) => `<rect ${O} x="${x}" y="${-h}" width="44" height="${h}" fill="${c}"/><rect x="${x + 8}" y="${-h + 12}" width="28" height="8" rx="3" fill="#fff" opacity=".7"/>`).join('')}
    ${[['#3CC7B8', 30], ['#F5DE7A', 140], ['#B79CF0', 250]].map(([c, x]) => `<rect ${O} x="${x}" y="110" width="100" height="40" rx="4" fill="${c}"/><rect x="${x + 12}" y="122" width="76" height="16" rx="3" fill="#fff" opacity=".6"/>`).join('')}</g>`);

const tableArt = (top) => svg(380, 240, `
  <rect ${O} x="40" y="70" width="20" height="160" rx="6" fill="#C9A57C"/><rect ${O} x="320" y="70" width="20" height="160" rx="6" fill="#C9A57C"/>
  <rect ${O} x="6" y="50" width="368" height="34" rx="10" fill="#E9CBA2"/>
  ${top}`);

// ---------- Tic-Tac-Toe vs the computer ----------
function ticTacToe(api, table) {
  api.modal((card, close) => {
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
        if (!api.starFound('games-ttt')) { api.addStar('games-ttt', table.x + 158, table.y - 60, { spawned: true }); status.textContent += ' A star appeared on the table! ⭐'; }
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
          if (!api.starFound('games-memory')) { api.addStar('games-memory', table.x + 158, table.y - 60, { spawned: true }); status.textContent += ' A star appeared! ⭐'; }
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

const beanbag = (id, x, color) => ({ id, x, y: 720, w: 190, h: 140, art: () => svg(190, 140, `
  <path ${O} d="M14 120 Q0 60 50 40 Q90 0 140 30 Q186 50 178 116 Q100 140 14 120 Z" fill="${color}"/>
  <path d="M60 50 Q90 70 130 46" stroke="#fff" stroke-width="5" fill="none" opacity=".5"/>`) });

export const GAMES = {
  id: 'games', title: 'Game Room 🎲', avatar: [428, 460],
  frame: 'linear-gradient(#3E3F78 70%, #7A64B0 70%)',
  bg,
  characters: [{ id: 'mia2', look: NPC.mia, x: 1290, y: 460, s: 0.95, say: ['Play Tic-Tac-Toe with me! ⭐', 'I love the Memory game!', 'High score! 👾'] }],
  items: [
    { id: 'ttt', x: 30, y: 560, w: 380, h: 240, drag: false,
      onTap: (it, api) => ticTacToe(api, it),
      art: () => tableArt(`<g transform="translate(130 -6)"><rect ${O} width="120" height="64" rx="8" fill="#FBF7EF"/>
        <path d="M40 6 V58 M80 6 V58 M8 24 H112 M8 44 H112" stroke="${INK}" stroke-width="3"/>
        <text x="20" y="21" font-size="16">⭐</text><text x="58" y="41" font-size="16">🌙</text><text x="94" y="60" font-size="14">⭐</text></g>
        ${text(190, 140, 'Tic-Tac-Toe', 26, '#fff')}`) },
    { id: 'memory', x: 610, y: 560, w: 380, h: 240, drag: false,
      onTap: (it, api) => memory(api, it),
      art: () => tableArt(`${[0, 1, 2, 3].map((i) => `<rect ${O} x="${96 + i * 50}" y="${8 + (i % 2) * 6}" width="40" height="52" rx="6" fill="${i === 1 ? '#fff' : '#B79CF0'}" transform="rotate(${(i - 1.5) * 6} ${116 + i * 50} 34)"/>`).join('')}
        <text x="146" y="46" font-size="22">🍦</text>${text(190, 140, 'Memory', 26, '#fff')}`) },
    { id: 'arcade', x: 1040, y: 220, w: 210, h: 520, drag: false,
      onTap: (it, api) => { it.el.classList.remove('flash'); void it.el.offsetWidth; it.el.classList.add('flash'); api.sfx.win(); api.bubble(it.x + 105, it.y - 10, ['High score! 👾', 'Level up! ⬆️', 'Bonus round! 🎮'][Math.floor(Math.random() * 3)]); },
      art: () => svg(210, 520, `
        <path ${O} d="M20 40 Q20 10 50 10 H160 Q190 10 190 40 V510 H20 Z" fill="#B79CF0" style="stroke-width:3"/>
        <rect ${O} x="34" y="24" width="142" height="40" rx="8" fill="#2E2A3A"/>${text(105, 52, 'SPACE PETS', 18, '#F5DE7A')}
        <rect ${O} x="36" y="80" width="138" height="140" rx="10" fill="#2E2A3A"/>
        <g class="screen"><rect x="44" y="88" width="122" height="124" rx="6" fill="#3E4A8E"/>
          ${starPath(70, 120, 7, '#F5DE7A')}${starPath(140, 110, 5, '#fff')}<circle cx="100" cy="170" r="14" fill="#9EDDD4"/><circle cx="95" cy="166" r="2" fill="${INK}"/><circle cx="105" cy="166" r="2" fill="${INK}"/></g>
        <path ${O} d="M20 230 H190 L176 300 H34 Z" fill="#9A80D8"/>
        <path ${O} d="M70 240 V266" style="stroke-width:6"/><circle ${O} cx="70" cy="240" r="10" fill="#E58F6A"/>
        <circle ${O} cx="122" cy="264" r="11" fill="#F5DE7A"/><circle ${O} cx="150" cy="252" r="11" fill="#9EDDD4"/>
        <rect ${O} x="80" y="380" width="50" height="30" rx="6" fill="#2E2A3A"/><rect x="96" y="388" width="18" height="14" rx="3" fill="#F5DE7A"/>`) },
    { id: 'darts', x: 1370, y: 170, w: 170, h: 170, drag: false,
      onTap: (it, api) => {
        const a = Math.random() * Math.PI * 2, r = Math.random() * 60;
        const bull = r < 12;
        api.effect(it.x + 85 + Math.cos(a) * r, it.y + 85 + Math.sin(a) * r, 'dart', '<svg viewBox="0 0 40 40" width="40" height="40"><path d="M20 20 L36 4" stroke="#4A3B5C" stroke-width="4" stroke-linecap="round"/><path d="M32 2 L38 8 L34 10 L30 6 Z" fill="#E58F6A"/></svg>', 1600);
        api.bubble(it.x + 85, it.y - 10, bull ? 'BULLSEYE! 🎯' : ['Nice throw!', 'Almost!', 'Good one! 🎯'][Math.floor(Math.random() * 3)]);
        if (bull) api.sfx.win();
      },
      art: () => svg(170, 170, `
        <circle ${O} cx="85" cy="85" r="80" fill="#2E2A3A" style="stroke-width:3"/>
        <circle cx="85" cy="85" r="66" fill="#FBF7EF"/><circle cx="85" cy="85" r="50" fill="#E58F6A"/>
        <circle cx="85" cy="85" r="34" fill="#FBF7EF"/><circle cx="85" cy="85" r="18" fill="#3CC7B8"/><circle cx="85" cy="85" r="7" fill="#E58F6A"/>`) },
    beanbag('bean1', 1210, '#9EDDD4'),
    beanbag('bean2', 1400, '#F5DE7A'),
    { id: 'puzzle', x: 880, y: 800, w: 120, h: 90, art: () => svg(120, 90, `
      <rect ${O} x="6" y="20" width="108" height="64" rx="6" fill="#8FC3F0"/>
      <path ${O} d="M30 40 h14 q0 -10 8 -10 q8 0 8 10 h14 v14 q-10 0 -10 8 q0 8 10 8 v6 h-44 z" fill="#F5DE7A" style="stroke-width:2"/>
      ${text(60, 16, 'PUZZLE', 14, '#fff')}`) },
  ],
};
