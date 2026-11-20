// Art Studio: paint at the easel (your paintings hang on the wall), throw a vase on the pottery wheel, admire the sculptures.
import { INK, O, svg, text, windowArt, wearable, NPC } from './common.js';

const f = (n) => n.toFixed(1);

function perspFloor({ W = 1600, y0 = 620, y1 = 900, h = 330, cols = 30, rows = 6, fill, stroke = 'none', sw = 0, stagger = false }) {
  const zf = (y1 - h) / (y0 - h);
  const yAt = (t) => h + (y1 - h) / (zf - ((zf - 1) * t) / rows);
  const vx = W / 2, span = W * 3.2;
  const xAt = (j, y) => vx + (vx - span / 2 + (span * j) / cols - vx) * ((y - h) / (y1 - h));
  let out = '';
  for (let j = 0; j < cols; j++) {
    const off = stagger && j % 2 ? 0.5 : 0;
    for (let k = -1; k < rows; k++) {
      const ta = Math.max(0, k + off), tb = Math.min(rows, k + 1 + off);
      if (tb <= ta) continue;
      const ya = yAt(ta), yb = yAt(tb);
      out += `<path d="M${f(xAt(j, ya))} ${f(ya)} L${f(xAt(j + 1, ya))} ${f(ya)} L${f(xAt(j + 1, yb))} ${f(yb)} L${f(xAt(j, yb))} ${f(yb)}Z" fill="${fill(j, k)}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
  }
  return out;
}
const shadow = (cx, cy, rx, ry = rx * 0.16, o = 0.16) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${INK}" opacity="${o}"/>`;
const ASH = ['#EADCC4', '#E3D3B8', '#EFE3CE', '#DECDB0'];

// ---------- room ----------
const bg = (w) => svg(1600, 900, `
  <defs>
    <linearGradient id="studio-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8F5F0"/><stop offset="1" stop-color="#ECE6DD"/></linearGradient>
    <pattern id="studio-brick" width="96" height="48" patternUnits="userSpaceOnUse">
      <rect width="96" height="48" fill="none"/>
      <rect x="2" y="2" width="44" height="20" rx="2" fill="#EFE9E0"/><rect x="50" y="2" width="44" height="20" rx="2" fill="#F3EEE6"/>
      <rect x="-22" y="26" width="44" height="20" rx="2" fill="#F2ECE3"/><rect x="26" y="26" width="44" height="20" rx="2" fill="#EDE6DC"/><rect x="74" y="26" width="44" height="20" rx="2" fill="#F2ECE3"/>
    </pattern>
    <linearGradient id="studio-fshadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK}" stop-opacity=".2"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient>
    <linearGradient id="studio-floorfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2F52" stop-opacity=".12"/><stop offset=".6" stop-color="#3A2F52" stop-opacity="0"/></linearGradient>
    <linearGradient id="studio-beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6D2" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6D2" stop-opacity="0"/></linearGradient>
    <linearGradient id="studio-rail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E5470"/><stop offset="1" stop-color="#3B3350"/></linearGradient>
  </defs>
  <rect width="1600" height="620" fill="url(#studio-wall)"/>
  <rect width="1600" height="600" fill="url(#studio-brick)"/>
  <rect width="1600" height="620" fill="url(#studio-wall)" opacity=".35"/>
  <rect width="1600" height="20" fill="#FBF9F6"/><rect y="20" width="1600" height="4" fill="#DED6CA"/>
  <rect y="46" width="1600" height="8" rx="2" fill="url(#studio-rail)"/>
  ${[150, 520, 850, 1180, 1500].map((x) => `<path d="M${x} 54 V70" stroke="#3B3350" stroke-width="3"/><path d="M${x - 14} 70 H${x + 14} L${x + 10} 90 H${x - 10} Z" fill="#3B3350"/><path d="M${x - 10} 90 L${x - 60} 260 H${x + 60} L${x + 10} 90 Z" fill="#FFF6D2" opacity=".18"/>`).join('')}
  <rect y="598" width="1600" height="24" fill="#FBF9F6"/><rect y="598" width="1600" height="3" fill="#E2DACD"/>
  ${perspFloor({ cols: 40, rows: 5, stagger: true, fill: (j, k) => ASH[(j * 5 + k * 3 + 40) % 4], stroke: '#CDB996', sw: 1.1 })}
  ${[[300, 700, '#B79CF0', 10], [860, 860, '#3CC7B8', 14], [1120, 690, '#F5DE7A', 9], [520, 840, '#8FC3F0', 7], [1300, 820, '#E58F6A', 8], [700, 660, '#3CC7B8', 6], [180, 860, '#F5DE7A', 12]].map(([x, y, c, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r * 1.8}" ry="${r * 0.6}" fill="${c}" opacity=".35"/><circle cx="${x + r * 2.4}" cy="${y - 3}" r="${r * 0.3}" fill="${c}" opacity=".35"/>`).join('')}
  <rect y="620" width="1600" height="280" fill="url(#studio-floorfade)"/>
  <rect y="620" width="1600" height="44" fill="url(#studio-fshadow)"/>
  ${windowArt(1210, 120, 290, 230, w.weather, '#C9B8F2')}
  ${w.weather === 'sun' ? `<path d="M1500 372 L1210 372 L860 900 L1440 900 Z" fill="url(#studio-beam)" opacity=".75"/>` : ''}
  <g transform="translate(980 90)"><rect width="190" height="40" rx="4" fill="#3B3350"/>${text(95, 27, 'ATELIER', 19, '#F5DE7A', 600)}</g>
  <g transform="translate(1000 300)">
    <rect width="150" height="190" rx="2" fill="#FBF9F6" stroke="${INK}" stroke-width="1.6"/>
    <path d="M14 20 H136 M14 34 H110 M14 48 H124" stroke="#CFC6DE" stroke-width="3" stroke-linecap="round"/>
    <rect x="14" y="66" width="56" height="44" fill="#9EDDD4" opacity=".7"/><rect x="80" y="66" width="56" height="44" fill="#F5DE7A" opacity=".7"/>
    <rect x="14" y="120" width="56" height="44" fill="#C9B8F2" opacity=".7"/><rect x="80" y="120" width="56" height="44" fill="#8FC3F0" opacity=".7"/>
    <circle cx="75" cy="-4" r="6" fill="#E58F6A" stroke="${INK}" stroke-width="1.4"/>
  </g>`);

// ---------- painting mini-game ----------
const COLORS = [['#B79CF0', 'lilac'], ['#3CC7B8', 'turquoise'], ['#8FC3F0', 'light blue'], ['#F5DE7A', 'light yellow'], ['#E58F6A', 'coral'], ['#6DBE7A', 'green'], ['#4A3B5C', 'ink'], ['#FFFFFF', 'white']];
const SIZES = [['• Thin', 4], ['● Medium', 10], ['⬤ Thick', 22]];
const PW = 320, PH = 220;

function paint(api) {
  api.modal((card, close) => {
    card.innerHTML += `<h2>Paint a picture</h2><p class="m-status">Paint with your finger, then hang it on the wall!</p>
      <canvas class="studio-canvas" style="display:block;margin:0 auto 8px;width:min(${PW}px,72vw);aspect-ratio:${PW}/${PH};height:auto;border-radius:10px;border:3px solid #E1D8F5;background:#fff;touch-action:none;cursor:crosshair"></canvas>
      <div class="opt-row studio-colors"></div><div class="opt-row studio-sizes"></div>
      <div class="opt-row"><button class="btn alt studio-clear">Clear</button><button class="btn studio-hang">Hang it up! 🖼️</button></div>`;
    const status = card.querySelector('.m-status');
    const cv = card.querySelector('canvas');
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    cv.width = Math.round(PW * dpr); cv.height = Math.round(PH * dpr);
    const g = cv.getContext('2d');
    g.scale(dpr, dpr); g.lineCap = 'round'; g.lineJoin = 'round';
    let color = COLORS[0][0], size = SIZES[1][1], drawn = false, last = null;
    const wipe = () => { g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, PW, PH); drawn = false; };
    wipe();
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) * PW) / r.width, ((e.clientY - r.top) * PH) / r.height]; };
    const dot = ([x, y]) => { g.fillStyle = color; g.beginPath(); g.arc(x, y, size / 2, 0, Math.PI * 2); g.fill(); drawn = true; };
    const line = (a, b) => { g.strokeStyle = color; g.lineWidth = size; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); drawn = true; };
    cv.addEventListener('pointerdown', (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); last = pos(e); dot(last); });
    cv.addEventListener('pointermove', (e) => { if (!last) return; const p = pos(e); line(last, p); last = p; });
    const end = () => { last = null; };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);

    const colors = card.querySelector('.studio-colors'), sizes = card.querySelector('.studio-sizes');
    const drawRows = () => {
      colors.innerHTML = ''; sizes.innerHTML = '';
      COLORS.forEach(([c, name]) => {
        const b = document.createElement('button');
        b.className = 'dot' + (c === color ? ' on' : '');
        b.style.background = c;
        b.setAttribute('aria-label', 'Paint colour ' + name);
        b.onclick = () => { color = c; api.sfx.click(); drawRows(); };
        colors.append(b);
      });
      SIZES.forEach(([label, s]) => {
        const b = document.createElement('button');
        b.className = 'chip' + (s === size ? ' on' : '');
        b.textContent = label;
        b.onclick = () => { size = s; api.sfx.click(); drawRows(); };
        sizes.append(b);
      });
    };
    drawRows();
    card.querySelector('.studio-clear').onclick = () => { wipe(); api.sfx.pop(); status.textContent = 'Fresh canvas! ✨'; };
    card.querySelector('.studio-hang').onclick = () => {
      if (!drawn) { status.textContent = 'Paint something first! 🎨'; return; }
      const off = document.createElement('canvas');
      off.width = PW; off.height = PH;
      off.getContext('2d').drawImage(cv, 0, 0, PW, PH);
      const url = off.toDataURL('image/png');
      const prev = Array.isArray(api.state.paintings) ? api.state.paintings : [];
      api.state.paintings = [...prev, url].slice(-3);
      api.save();
      close();
      const gal = api.get('gallery');
      if (gal) {
        api.setArt(gal);
        api.sparkle(gal.x + 170, gal.y + 130, ['✨', '🎨', '🖼️']);
        api.bubble(gal.x + 170, gal.y - 6, 'Your painting is on the wall! 🖼️');
      }
      api.sfx.win();
      if (!api.starFound('studio-painting')) api.addStar('studio-painting', 520, 376, { spawned: true });
    };
  });
}

const okUrl = (u) => typeof u === 'string' && u.startsWith('data:image/') && !/["<>]/.test(u);
const paintingsOf = (api) => (Array.isArray(api.state.paintings) ? api.state.paintings.filter(okUrl) : []);

// A framed picture: newest painting, or an empty mat with a hint.
const framed = (x, y, w, h, url, id, big) => `<g transform="translate(${x} ${y})">
  <rect x="5" y="8" width="${w}" height="${h}" fill="${INK}" opacity=".14"/>
  <rect width="${w}" height="${h}" fill="${big ? 'url(#studio-giltframe)' : '#3B3350'}" stroke="${INK}" stroke-width="2"/>
  <rect x="${big ? 14 : 8}" y="${big ? 14 : 8}" width="${w - (big ? 28 : 16)}" height="${h - (big ? 28 : 16)}" fill="#FBF9F6"/>
  ${url
    ? `<clipPath id="${id}"><rect x="${big ? 30 : 16}" y="${big ? 30 : 16}" width="${w - (big ? 60 : 32)}" height="${h - (big ? 60 : 32)}"/></clipPath>
       <image href="${url}" x="${big ? 30 : 16}" y="${big ? 30 : 16}" width="${w - (big ? 60 : 32)}" height="${h - (big ? 60 : 32)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`
    : `<rect x="${big ? 30 : 16}" y="${big ? 30 : 16}" width="${w - (big ? 60 : 32)}" height="${h - (big ? 60 : 32)}" fill="#F1ECE4"/>
       ${big ? text(w / 2, h / 2 + 6, 'Your art here', 18, '#B5A88F', 500) : ''}`}
  <rect x="${big ? 30 : 16}" y="${big ? 30 : 16}" width="${w - (big ? 60 : 32)}" height="${h - (big ? 60 : 32)}" fill="none" stroke="${INK}" stroke-opacity=".18" stroke-width="2"/></g>`;

// Clay on the pottery wheel at each stage.
const CLAY = [
  'M-30 0 Q-34 -26 -10 -34 Q14 -38 28 -24 Q36 -10 30 0 Z',
  'M-26 0 L-24 -56 Q0 -62 24 -56 L26 0 Z',
  'M-30 0 Q-40 -30 -34 -60 Q0 -66 34 -60 Q40 -30 30 0 Z',
  'M-22 0 Q-46 -26 -30 -58 Q-14 -76 -14 -92 L-18 -100 H18 L14 -92 Q14 -76 30 -58 Q46 -26 22 0 Z',
];
const GLAZE = ['#3CC7B8', '#B79CF0', '#8FC3F0', '#F5DE7A'];

function vaseItem(api, x, y, n) {
  const c = GLAZE[n % GLAZE.length], gid = 'studio-glaze-' + n;
  return api.add({
    id: api.uid('vase'), x, y, w: 80, h: 110,
    onTap: (it, a) => { a.sparkle(it.x + 40, it.y + 40, ['✨', '🏺']); a.bubble(it.x + 40, it.y - 8, 'Handmade with love! 🏺'); },
    art: () => svg(80, 110, `
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c}" stop-opacity=".75"/><stop offset=".35" stop-color="#fff" stop-opacity=".9"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${INK}" stop-opacity=".55"/></linearGradient></defs>
      ${shadow(40, 106, 30, 5, 0.18)}
      <g transform="translate(40 106)"><path d="${CLAY[3]}" fill="${c}" stroke="${INK}" stroke-width="2"/><path d="${CLAY[3]}" fill="url(#${gid})" opacity=".6"/>
      <path d="M-30 -40 Q0 -34 30 -40" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/><ellipse cx="0" cy="-100" rx="18" ry="4" fill="${INK}" opacity=".5"/></g>`),
  }, { spawned: true });
}

export const STUDIO = {
  id: 'studio', title: 'Art Studio 🎨', weather: true, avatar: [410, 470],
  frame: 'linear-gradient(#F3EFE8 69%, #E5D6BC 69%)',
  bg,
  stars: [{ id: 'studio-canvases', x: 78, y: 724 }],
  characters: [
    { id: 'iris', look: { ...NPC.nora, hairStyle: 'long', hair: '#8B6450', hairAcc: 'none', top: 'sweater', topColor: '#FBEFB4', collar: 'round', hat: 'beanie', bottom: 'widePants', bottomColor: '#4D5C9A', socks: 'none', shoes: 'boots', shoesColor: '#4A3B5C' }, x: 1400, y: 470, s: 0.95,
      say: ["Hi, I'm Iris! Tap the easel to paint 🎨", 'Your paintings hang on the wall! 🖼️', 'Tap the pottery wheel a few times 🏺', 'Every artist was first a beginner ✨'] },
  ],
  items: [
    { id: 'supplies', x: 40, y: 110, w: 280, h: 240, drag: false,
      onTap: (it, api) => { api.sparkle(it.x + 140, it.y + 110, ['🖌️', '✨', '🎨']); api.bubble(it.x + 140, it.y - 6, ['Brushes of every size! 🖌️', 'So many paint tubes! 🎨', 'Sketchbooks and charcoal ✏️'][Math.floor(Math.random() * 3)]); },
      art: () => svg(280, 240, `
        <defs><linearGradient id="studio-shelf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9C3A0"/><stop offset="1" stop-color="#B89B74"/></linearGradient>
          <linearGradient id="studio-jarg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E8F6FF" stop-opacity=".6"/><stop offset=".4" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#D2E6F2" stop-opacity=".6"/></linearGradient></defs>
        ${[106, 230].map((y) => `<rect x="0" y="${y}" width="280" height="12" rx="2" fill="url(#studio-shelf)" stroke="${INK}" stroke-width="1.6"/><path d="M30 ${y + 12} L40 ${y + 30} M250 ${y + 12} L240 ${y + 30}" stroke="#3B3350" stroke-width="4" stroke-linecap="round"/>`).join('')}
        <g transform="translate(14 30)">${[['#B79CF0', -10], ['#3CC7B8', -2], ['#F5DE7A', 6], ['#E58F6A', 12]].map(([c, a], i) => `<g transform="rotate(${a} 26 76)"><path d="M${16 + i * 6} 76 V${8 + i * 4}" stroke="#C9A57C" stroke-width="4" stroke-linecap="round"/><path d="M${13 + i * 6} ${10 + i * 4} Q${16 + i * 6} ${-6 + i * 4} ${19 + i * 6} ${10 + i * 4} Z" fill="${c}" stroke="${INK}" stroke-width="1.2"/></g>`).join('')}
          <rect x="4" y="38" width="44" height="38" rx="6" fill="url(#studio-jarg)" stroke="${INK}" stroke-width="1.6"/></g>
        ${[0, 1, 2, 3, 4].map((i) => `<g transform="translate(${80 + i * 18} ${70 + (i % 2) * 4}) rotate(${-8 + i * 4})"><rect width="12" height="34" rx="3" fill="#E2DFE8" stroke="${INK}" stroke-width="1.2"/><rect x="0" y="0" width="12" height="12" rx="2" fill="${COLORS[i][0]}" stroke="${INK}" stroke-width="1"/><rect x="3" y="34" width="6" height="6" fill="#3B3350"/></g>`).join('')}
        <g transform="translate(184 22)">${['#C9B8F2', '#9EDDD4', '#F5DE7A', '#8FC3F0'].map((c, i) => `<rect x="${i * 20}" y="${i % 2 ? 6 : 0}" width="18" height="${84 - (i % 2 ? 6 : 0)}" rx="2" fill="${c}" stroke="${INK}" stroke-width="1.4"/><path d="M${i * 20 + 4} ${20} H${i * 20 + 14}" stroke="#fff" stroke-width="2" opacity=".7"/>`).join('')}</g>
        <g transform="translate(18 158)"><ellipse cx="40" cy="70" rx="40" ry="6" fill="${INK}" opacity=".1"/>${[0, 1, 2].map((i) => `<rect x="${i * 6}" y="${36 + i * 12}" width="84" height="12" rx="2" fill="${['#FBF9F6', '#E5D6BC', '#C9B8F2'][i]}" stroke="${INK}" stroke-width="1.4"/>`).join('')}</g>
        <g transform="translate(130 150)"><path d="M0 80 L18 6 Q40 -2 60 6 L78 80 Z" fill="#9EDDD4" stroke="${INK}" stroke-width="1.6" opacity=".9"/><path d="M14 30 H64" stroke="#fff" stroke-width="2" opacity=".5"/><ellipse cx="39" cy="6" rx="21" ry="4" fill="#7FCBC0" stroke="${INK}" stroke-width="1.4"/></g>
        <g transform="translate(220 170)"><path d="M0 60 Q-6 30 10 22 Q30 16 40 34 Q50 54 34 60 Z" fill="#E5D6BC" stroke="${INK}" stroke-width="1.6"/><circle cx="12" cy="40" r="5" fill="#B79CF0"/><circle cx="24" cy="32" r="4.5" fill="#3CC7B8"/><circle cx="32" cy="46" r="4" fill="#F5DE7A"/><circle cx="18" cy="52" r="4" fill="#E58F6A"/></g>`) },
    { id: 'gallery', x: 344, y: 74, w: 600, h: 290, drag: false,
      onTap: (it, api) => {
        const p = paintingsOf(api);
        if (!p.length) { api.bubble(it.x + 170, it.y - 6, 'Paint at the easel to fill this frame! 🎨'); return; }
        api.sparkle(it.x + 170, it.y + 130, ['✨', '🖼️', '💫']);
        api.bubble(it.x + 170, it.y - 6, ['A true masterpiece! 🖼️', 'Bravo, artist! 👏', 'Beautiful colours! 🎨'][Math.floor(Math.random() * 3)]);
      },
      art: (it, api) => {
        const p = paintingsOf(api);
        const newest = p[p.length - 1], older = p.slice(0, -1).reverse();
        return svg(600, 290, `
          <defs><linearGradient id="studio-giltframe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8CF8E"/><stop offset=".45" stop-color="#F8EBC4"/><stop offset=".55" stop-color="#D2B36C"/><stop offset="1" stop-color="#A9894A"/></linearGradient>
            <radialGradient id="studio-pl"><stop offset="0" stop-color="#FFF6D2" stop-opacity=".7"/><stop offset="1" stop-color="#FFF6D2" stop-opacity="0"/></radialGradient></defs>
          <ellipse cx="170" cy="60" rx="190" ry="90" fill="url(#studio-pl)"/>
          ${framed(0, 26, 340, 250, newest, 'studio-clip-main', true)}
          <g transform="translate(130 6)"><rect width="80" height="12" rx="6" fill="#3B3350"/><path d="M40 12 V24" stroke="#3B3350" stroke-width="4"/></g>
          ${framed(372, 30, 170, 122, older[0], 'studio-clip-o1', false)}
          ${framed(400, 168, 150, 110, older[1], 'studio-clip-o2', false)}`);
      } },
    { id: 'spot', x: 226, y: 380, w: 130, h: 430, data: { on: true },
      onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); },
      art: (it) => svg(130, 430, `
        <defs><linearGradient id="studio-cone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF4C4" stop-opacity=".55"/><stop offset="1" stop-color="#FFF4C4" stop-opacity="0"/></linearGradient></defs>
        ${it.data.on ? `<path d="M100 38 L520 -40 L560 260 L100 64 Z" fill="url(#studio-cone)" pointer-events="none"/>` : ''}
        ${shadow(64, 420, 60, 8, 0.16)}
        <path d="M64 120 L14 418 M64 120 L114 418 M64 120 L64 410" stroke="#3B3350" stroke-width="5" stroke-linecap="round"/>
        <path d="M64 70 V130" stroke="#3B3350" stroke-width="7" stroke-linecap="round"/>
        <g transform="rotate(-12 64 52)"><path d="M30 30 H92 L108 72 H30 Z" fill="#3B3350" stroke="${INK}" stroke-width="2"/><rect x="18" y="34" width="16" height="34" rx="4" fill="#5E5470" stroke="${INK}" stroke-width="1.6"/>
          <ellipse cx="104" cy="51" rx="7" ry="22" fill="${it.data.on ? '#FFF8D6' : '#9A90AC'}" stroke="${INK}" stroke-width="1.6"/></g>`) },
    { id: 'easel', x: 600, y: 320, w: 250, h: 496, drag: false,
      onTap: (it, api) => paint(api),
      art: () => svg(250, 496, `
        <defs><linearGradient id="studio-beech" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C9A57C"/><stop offset=".5" stop-color="#E2C49B"/><stop offset="1" stop-color="#B8936A"/></linearGradient>
          <linearGradient id="studio-linen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F1ECE4"/></linearGradient></defs>
        ${shadow(125, 486, 110, 10, 0.18)}
        <path d="M125 12 L190 490" stroke="#A9835A" stroke-width="12" stroke-linecap="round"/>
        <path d="M125 6 L36 490 M125 6 L214 490" stroke="url(#studio-beech)" stroke-width="14" stroke-linecap="round"/>
        <path d="M125 6 L36 490 M125 6 L214 490" stroke="${INK}" stroke-width="1.4" opacity=".35"/>
        <rect x="112" y="0" width="26" height="40" rx="4" fill="url(#studio-beech)" stroke="${INK}" stroke-width="1.6"/>
        <rect x="18" y="30" width="214" height="176" rx="2" fill="#D9CDB8" stroke="${INK}" stroke-width="2"/>
        <rect x="24" y="26" width="214" height="176" rx="2" fill="url(#studio-linen)" stroke="${INK}" stroke-width="2"/>
        <path d="M54 160 Q90 100 130 130 T214 90" stroke="#9EDDD4" stroke-width="10" fill="none" stroke-linecap="round" opacity=".55"/>
        <circle cx="178" cy="70" r="20" fill="#F5DE7A" opacity=".55"/>
        <path d="M48 76 Q70 60 96 72" stroke="#C9B8F2" stroke-width="6" fill="none" stroke-linecap="round" opacity=".6"/>
        ${text(131, 194, 'tap to paint', 13, '#B5A88F', 500)}
        <rect x="6" y="202" width="238" height="18" rx="4" fill="url(#studio-beech)" stroke="${INK}" stroke-width="2"/>
        <g transform="translate(150 186)"><path d="M0 18 L60 14" stroke="#C9A57C" stroke-width="5" stroke-linecap="round"/><path d="M58 10 Q72 14 58 20 Z" fill="#B79CF0" stroke="${INK}" stroke-width="1.2"/></g>
        <path d="M70 300 H180" stroke="url(#studio-beech)" stroke-width="10" stroke-linecap="round"/>`) },
    { id: 'cart', x: 868, y: 612, w: 128, h: 200,
      onTap: (it, api) => { api.sparkle(it.x + 64, it.y + 20, ['🖌️', '✨']); api.bubble(it.x + 64, it.y - 8, 'Brushes, tubes and a palette! 🖌️'); api.sfx.click(); },
      art: () => svg(128, 200, `
        <defs><linearGradient id="studio-cartg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8FC3F0"/><stop offset=".5" stop-color="#A9D2F4"/><stop offset="1" stop-color="#76AEDF"/></linearGradient></defs>
        ${shadow(64, 194, 56, 7, 0.16)}
        <rect x="10" y="62" width="108" height="118" rx="6" fill="url(#studio-cartg)" stroke="${INK}" stroke-width="2"/>
        ${[96, 136].map((y) => `<path d="M10 ${y} H118" stroke="${INK}" stroke-width="1.6" opacity=".5"/><rect x="50" y="${y - 22}" width="28" height="6" rx="3" fill="#FBF9F6" stroke="${INK}" stroke-width="1"/>`).join('')}
        <rect x="4" y="54" width="120" height="12" rx="4" fill="#FBF9F6" stroke="${INK}" stroke-width="1.8"/>
        <circle cx="24" cy="186" r="8" fill="#3B3350"/><circle cx="104" cy="186" r="8" fill="#3B3350"/>
        <g transform="translate(14 12)"><rect x="0" y="16" width="36" height="28" rx="5" fill="#FBF9F6" stroke="${INK}" stroke-width="1.6"/>
          ${[['#3CC7B8', -12], ['#F5DE7A', 0], ['#E58F6A', 12]].map(([c, a]) => `<g transform="rotate(${a} 18 40)"><path d="M18 40 V0" stroke="#C9A57C" stroke-width="3.5" stroke-linecap="round"/><path d="M15 2 Q18 -10 21 2 Z" fill="${c}" stroke="${INK}" stroke-width="1"/></g>`).join('')}</g>
        <g transform="translate(58 30)"><path d="M0 22 Q-4 6 14 2 Q40 -4 56 10 Q64 22 50 24 Q40 22 38 28 Q34 32 20 30 Q4 30 0 22 Z" fill="#E5D6BC" stroke="${INK}" stroke-width="1.6"/>
          <circle cx="14" cy="14" r="4" fill="#B79CF0"/><circle cx="26" cy="8" r="4" fill="#3CC7B8"/><circle cx="40" cy="10" r="4" fill="#F5DE7A"/><circle cx="48" cy="18" r="3.5" fill="#E58F6A"/></g>`) },
    { id: 'wheel', x: 1010, y: 586, w: 230, h: 226, drag: false, data: { stage: 0, made: 0 },
      onTap: (it, api) => {
        if (it.el.classList.contains('sx-potting')) return;
        it.el.classList.add('sx-potting');
        api.sfx.pour();
        api.later(() => {
          it.el.classList.remove('sx-potting');
          it.data.stage++;
          if (it.data.stage >= CLAY.length) {
            it.data.stage = 0;
            if (api.count('vase') < 3) {
              vaseItem(api, it.x - 60 - api.count('vase') * 24, it.y + 110, it.data.made++);
              api.bubble(it.x + 115, it.y - 8, 'A beautiful vase! Drag it anywhere 🏺');
            } else api.bubble(it.x + 115, it.y - 8, 'What a collection of vases! 🏺');
            api.sfx.win();
          } else api.bubble(it.x + 115, it.y - 8, ['Spin, spin... 🌀', 'It\'s growing! ✨', 'Almost a vase! 🏺'][it.data.stage - 1]);
          api.setArt(it);
        }, 1100);
      },
      art: (it) => svg(230, 226, `
        <defs><linearGradient id="studio-wbody" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5E5470"/><stop offset=".5" stop-color="#7A7090"/><stop offset="1" stop-color="#4A4160"/></linearGradient>
          <linearGradient id="studio-clay" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B07A5A"/><stop offset=".4" stop-color="#D9A37E"/><stop offset="1" stop-color="#9A6648"/></linearGradient>
          <clipPath id="studio-clayclip"><path transform="translate(115 104)" d="${CLAY[it.data.stage]}"/></clipPath></defs>
        ${shadow(115, 218, 106, 9, 0.18)}
        <path d="M44 214 L60 130 H170 L186 214 Z" fill="url(#studio-wbody)" stroke="${INK}" stroke-width="2"/>
        <path d="M20 130 Q20 104 115 102 Q210 104 210 130 Q210 150 115 152 Q20 150 20 130 Z" fill="#E2DFE8" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="115" cy="122" rx="78" ry="16" fill="#C9C3D6"/>
        <ellipse cx="115" cy="112" rx="62" ry="12" fill="#9A90AC" stroke="${INK}" stroke-width="1.6"/>
        <ellipse cx="115" cy="108" rx="62" ry="12" fill="#B9B0C9" stroke="${INK}" stroke-width="1.6"/>
        <path d="M60 170 H170" stroke="#fff" stroke-width="2" opacity=".2"/>
        <g transform="translate(115 104)"><path d="${CLAY[it.data.stage]}" fill="url(#studio-clay)" stroke="${INK}" stroke-width="2"/></g>
        <g clip-path="url(#studio-clayclip)"><g class="sx-grain">${Array.from({ length: 14 }, (_, i) => `<path d="M${70 + i * 8} 0 V110" stroke="#8B5A3C" stroke-width="1.4" opacity=".35"/>`).join('')}</g></g>
        <g transform="translate(115 104)"><path d="M-30 -14 Q0 -8 30 -14" stroke="#fff" stroke-width="2" fill="none" opacity=".35"/></g>`) },
    { id: 'stool', x: 1240, y: 690, w: 110, h: 124,
      onTap: (it, api) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.sfx.boing(); },
      art: () => svg(110, 124, `
        <defs><linearGradient id="studio-stoolg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C9A57C"/><stop offset=".5" stop-color="#E2C49B"/><stop offset="1" stop-color="#B8936A"/></linearGradient></defs>
        ${shadow(55, 118, 48, 6, 0.16)}
        <path d="M22 26 L10 118 M88 26 L100 118 M42 28 L38 112 M68 28 L72 112" stroke="url(#studio-stoolg)" stroke-width="8" stroke-linecap="round"/>
        <path d="M16 80 H94" stroke="#B8936A" stroke-width="5"/>
        <ellipse cx="55" cy="22" rx="50" ry="14" fill="#E2C49B" stroke="${INK}" stroke-width="2"/><ellipse cx="55" cy="18" rx="50" ry="14" fill="url(#studio-stoolg)" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="55" cy="16" rx="30" ry="6" fill="#fff" opacity=".2"/>`) },
    { id: 'sculpture', x: 1218, y: 380, w: 150, h: 300, drag: false,
      onTap: (it, api) => {
        it.el.classList.remove('sx-twirl'); void it.el.offsetWidth; it.el.classList.add('sx-twirl');
        api.bubble(it.x + 75, it.y - 8, ['"Sea Ribbon" — so elegant ✨', 'Art you can walk around! 🗿', 'Made of glazed clay 🌀'][Math.floor(Math.random() * 3)]);
      },
      art: () => svg(150, 300, `
        <defs><linearGradient id="studio-plinth" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#EEE9F2"/><stop offset="1" stop-color="#D9D1E2"/></linearGradient>
          <linearGradient id="studio-ribbon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9EDDD4"/><stop offset=".5" stop-color="#3CC7B8"/><stop offset="1" stop-color="#2A8F85"/></linearGradient></defs>
        <rect x="24" y="140" width="102" height="156" fill="url(#studio-plinth)" stroke="${INK}" stroke-width="2"/>
        <path d="M24 140 L36 128 H138 L126 140 Z" fill="#FBF9F6" stroke="${INK}" stroke-width="2"/><path d="M126 140 L138 128 V284 L126 296 Z" fill="#D9D1E2" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="80" cy="134" rx="30" ry="6" fill="${INK}" opacity=".15"/>
        <path d="M60 132 Q40 100 62 76 Q86 50 70 22 Q96 40 92 70 Q88 96 104 116 Q96 132 80 132 Z" fill="url(#studio-ribbon)" stroke="${INK}" stroke-width="2"/>
        <path d="M66 120 Q54 98 70 80 Q86 62 78 38" stroke="#fff" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>
        <circle cx="94" cy="44" r="10" fill="#F5DE7A" stroke="${INK}" stroke-width="1.8"/><circle cx="91" cy="41" r="3" fill="#fff" opacity=".7"/>`) },
    { id: 'stones', x: 1512, y: 782, w: 80, h: 110,
      onTap: (it, api) => { it.el.classList.remove('shake'); void it.el.offsetWidth; it.el.classList.add('shake'); api.bubble(it.x + 40, it.y - 8, 'Perfectly balanced! 🪨'); },
      art: () => svg(80, 110, `
        <defs><radialGradient id="studio-stone" cx=".35" cy=".3"><stop offset="0" stop-color="#F1ECF6"/><stop offset="1" stop-color="#A9A1BC"/></radialGradient></defs>
        ${shadow(40, 104, 34, 5, 0.16)}
        <ellipse cx="40" cy="88" rx="34" ry="16" fill="url(#studio-stone)" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="42" cy="62" rx="26" ry="13" fill="url(#studio-stone)" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="38" cy="40" rx="18" ry="10" fill="url(#studio-stone)" stroke="${INK}" stroke-width="2"/>
        <circle cx="40" cy="20" r="10" fill="#B79CF0" stroke="${INK}" stroke-width="2"/>`) },
    ...[['#3CC7B8', 'Turquoise'], ['#F5DE7A', 'Sunshine yellow'], ['#B79CF0', 'Lilac']].map(([c, name], i) => ({
      id: 'pot' + i, x: 140 + i * 78, y: 820, w: 70, h: 70,
      onTap: (it, api) => {
        api.effect(it.x + 35, it.y - 10, 'sx-splat', `<svg viewBox="0 0 80 60" width="80" height="60"><path d="M40 8 Q52 0 56 14 Q72 10 68 26 Q80 34 66 42 Q66 58 50 50 Q40 60 30 50 Q14 58 14 42 Q0 34 12 26 Q8 10 24 14 Q28 0 40 8 Z" fill="${c}" opacity=".85"/></svg>`, 900);
        api.bubble(it.x + 35, it.y - 20, `${name} paint! 🎨`); api.sfx.pop();
      },
      art: () => svg(70, 70, `
        <defs><linearGradient id="studio-tin${i}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C4C9D6"/><stop offset=".4" stop-color="#F4F6FA"/><stop offset="1" stop-color="#9AA0B4"/></linearGradient></defs>
        <path d="M10 18 V58 Q10 66 35 66 Q60 66 60 58 V18 Z" fill="url(#studio-tin${i})" stroke="${INK}" stroke-width="2"/>
        <rect x="10" y="30" width="50" height="22" fill="${c}" opacity=".9"/>
        <ellipse cx="35" cy="18" rx="25" ry="7" fill="${c}" stroke="${INK}" stroke-width="2"/>
        <path d="M18 20 Q16 34 20 40 Q24 34 22 22 M48 22 Q50 30 46 34 Q44 28 46 22" fill="${c}"/>
        <path d="M10 18 Q35 -8 60 18" stroke="#7A7090" stroke-width="2" fill="none"/>`),
    })),
    { id: 'canvases', x: 30, y: 640, w: 170, h: 180,
      onTap: (it, api) => { api.bubble(it.x + 85, it.y - 8, 'Blank canvases waiting for ideas ✨'); },
      art: () => svg(170, 180, `
        <defs><linearGradient id="studio-cvs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDE6DC"/></linearGradient></defs>
        ${shadow(85, 174, 80, 7, 0.16)}
        <g transform="rotate(-8 40 176)"><rect x="10" y="10" width="120" height="166" fill="#D9CDB8" stroke="${INK}" stroke-width="2"/><path d="M14 14 L126 172 M126 14 L14 172" stroke="#C9A57C" stroke-width="5" opacity=".6"/></g>
        <g transform="rotate(-3 60 176)"><rect x="24" y="24" width="120" height="152" fill="url(#studio-cvs)" stroke="${INK}" stroke-width="2"/><path d="M40 140 Q70 100 100 120 T136 90" stroke="#8FC3F0" stroke-width="7" fill="none" opacity=".5" stroke-linecap="round"/></g>
        <rect x="44" y="40" width="120" height="138" fill="url(#studio-cvs)" stroke="${INK}" stroke-width="2"/>
        <rect x="44" y="40" width="120" height="8" fill="${INK}" opacity=".06"/>`) },
    wearable('beanie', 1240, 612, 'studio-beret'),
  ],
};
