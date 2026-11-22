// Art Studio (isometric dollhouse room): paint at the easel (your paintings hang on the gallery wall),
// throw a vase on the pottery wheel, splash the paint tins and admire the sculpture.
import { room, roomShell, isoItem, at, shades, proj, isoDef, wallDef } from '../iso.js';
import { svg, text, starPath, wearable, NPC } from './common.js';

const R = room({ cols: 9, rows: 7, ox: 736, oy: 340, wallH: 290 });
R.charScale = 0.6;

const WOOD = '#C99A6C', WOOD_L = '#E2C29C', WOOD_D = '#8B6450', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', TURQ = '#3CC7B8', SKY = '#9CC8EE', SUN = '#F5DE7A', CORAL = '#E58F6A', LEAF = '#6DBE7A', INKY = '#3E3252';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4"';
const P = (gx, gy, z = 0) => proj(R, gx, gy, z);
const poly = (arr) => arr.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ');
const splat = (x, y, r, c) => `<path d="M${x} ${y - r} Q${x + r * 0.4} ${y - r * 0.4} ${x + r} ${y - r * 0.2} Q${x + r * 0.5} ${y + r * 0.2} ${x + r * 0.7} ${y + r} Q${x} ${y + r * 0.5} ${x - r * 0.6} ${y + r * 0.9} Q${x - r * 0.5} ${y + r * 0.1} ${x - r} ${y - r * 0.3} Q${x - r * 0.4} ${y - r * 0.4} ${x} ${y - r} Z" fill="${c}"/>`;

// ---------- background ----------
const bg = (w) => {
  const [lx] = P(0, R.rows), [rx] = P(R.cols, 0), [, fy] = P(R.cols, R.rows);
  return svg(1600, 900, `
  <defs>
    <radialGradient id="studio-bd" cx="50%" cy="55%" r="70%"><stop offset="0" stop-color="#FAF7F1"/><stop offset="1" stop-color="#E4DDD0"/></radialGradient>
    <pattern id="studio-wl" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="matrix(1,-0.5,0,1,0,0)">
      <rect width="64" height="64" fill="#F6F2EB"/><path d="M0 0.5 H64 M0.5 0 V64" stroke="#ECE5D8" stroke-width="2"/><circle cx="20" cy="40" r="2" fill="#CFEDE8"/><circle cx="48" cy="18" r="1.6" fill="#E8DDFB"/></pattern>
    <pattern id="studio-wr" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,0,1,0,0)">
      <rect width="64" height="64" fill="#EEE8DE"/><path d="M0 0.5 H64 M0.5 0 V64" stroke="#E4DCCD" stroke-width="2"/><circle cx="20" cy="40" r="2" fill="#C5E6E1"/><circle cx="48" cy="18" r="1.6" fill="#E0D4F6"/></pattern>
    <linearGradient id="studio-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".65"/><stop offset="1" stop-color="#FFF6DA" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#studio-bd)"/>
  <ellipse cx="${(lx + rx) / 2}" cy="${fy + 6}" rx="580" ry="46" fill="#3E3252" opacity=".10"/>
  ${roomShell(R, { floor: '#E9DCC4', floorLines: 'planks', wallL: '#F6F2EB', wallR: '#EEE8DE', wallPatternL: 'studio-wl', wallPatternR: 'studio-wr' })}
  ${splat(...P(6.4, 4.6), 9, '#B79CF0')}${splat(...P(1.6, 5.8), 7, '#9EDDD4')}${splat(...P(7.6, 2.8), 6, '#F5DE7A')}
  <polygon points="${poly([P(6.1, 0.05), P(7.6, 0.05), P(8.9, 3.3), P(7.4, 3.3)])}" fill="url(#studio-light)" opacity="${w.weather === 'sun' ? 1 : 0.35}"/>`);
};

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
    const stroke = (a, b) => { g.strokeStyle = color; g.lineWidth = size; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); drawn = true; };
    cv.addEventListener('pointerdown', (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); last = pos(e); dot(last); });
    cv.addEventListener('pointermove', (e) => { if (!last) return; const p = pos(e); stroke(last, p); last = p; });
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
        api.sparkle(gal.x + gal.w * 0.3, gal.y + gal.h * 0.4, ['✨', '🎨', '🖼️']);
        api.bubble(gal.x + gal.w * 0.3, gal.y, 'Your painting is on the wall! 🖼️');
      }
      api.sfx.win();
      const easel = api.get('easel');
      if (!api.starFound('studio-painting')) api.addStar('studio-painting', 0, 0, { spawned: true, gx: (easel?.gx ?? 3.4) + 0.5, gy: (easel?.gy ?? 2.4) + 1.1 });
    };
  });
}

const okUrl = (u) => typeof u === 'string' && u.startsWith('data:image/') && !/["<>]/.test(u);
const paintingsOf = (api) => (Array.isArray(api?.state.paintings) ? api.state.paintings.filter(okUrl) : []);

// A framed picture: newest painting, or an empty mat with a hint.
const framed = (x, y, w, h, url, id, big) => {
  const m = big ? 9 : 6, p = big ? 18 : 11;
  return `<g transform="translate(${x} ${y})">
  <rect x="3" y="5" width="${w}" height="${h}" fill="${INKY}" opacity=".14"/>
  <rect width="${w}" height="${h}" fill="${big ? '#E3C27A' : '#3B3350'}" ${line}/>
  ${big ? `<rect x="3" y="3" width="${w - 6}" height="${h - 6}" fill="none" stroke="#F8EBC4" stroke-width="2"/>` : ''}
  <rect x="${m}" y="${m}" width="${w - m * 2}" height="${h - m * 2}" fill="#FBF9F6"/>
  ${url
    ? `<clipPath id="${id}"><rect x="${p}" y="${p}" width="${w - p * 2}" height="${h - p * 2}"/></clipPath>
       <image href="${url}" x="${p}" y="${p}" width="${w - p * 2}" height="${h - p * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`
    : `<rect x="${p}" y="${p}" width="${w - p * 2}" height="${h - p * 2}" fill="#F1ECE4"/>${big ? text(w / 2, h / 2 + 4, 'Your art here', 11, '#B5A88F', 500) : ''}`}
  <rect x="${p}" y="${p}" width="${w - p * 2}" height="${h - p * 2}" fill="none" stroke="${INKY}" stroke-opacity=".18" stroke-width="1.5"/></g>`;
};

const galleryBody = (it, sp, api) => {
  const p = paintingsOf(api);
  const newest = p[p.length - 1], older = p.slice(0, -1).reverse();
  return `<ellipse cx="68" cy="22" rx="80" ry="40" fill="#FFF6D2" opacity=".55"/>
    <rect x="44" y="0" width="48" height="8" rx="4" fill="#3B3350"/><path d="M68 8 V16" stroke="#3B3350" stroke-width="3"/>
    ${framed(4, 18, 128, 100, newest, 'studio-clip-main', true)}
    ${framed(146, 14, 70, 52, older[0], 'studio-clip-o1', false)}
    ${framed(150, 78, 62, 48, older[1], 'studio-clip-o2', false)}`;
};

// ---------- other wall things ----------
const suppliesBody = (it, sp) => {
  const w = sp.len;
  return `${[62, 128].map((y) => `<rect x="0" y="${y}" width="${w}" height="7" rx="2" fill="${WOOD_L}" ${line}/><path d="M10 ${y + 7} l6 9 M${w - 10} ${y + 7} l-6 9" stroke="${WOOD}" stroke-width="4" stroke-linecap="round"/>`).join('')}
    <rect x="8" y="34" width="22" height="28" rx="4" fill="#E8F6FF" fill-opacity=".8" ${line}/>${[[12, LILAC, -8], [18, TURQ, 0], [24, SUN, 8]].map(([x, c, a]) => `<g transform="rotate(${a} ${x} 50)"><path d="M${x} 50 V14" stroke="#C9A57C" stroke-width="2.5" stroke-linecap="round"/><path d="M${x - 2} 16 Q${x} 6 ${x + 2} 16 Z" fill="${c}" ${line}/></g>`).join('')}
    ${[0, 1, 2, 3, 4].map((i) => `<g transform="translate(${38 + i * 9} ${40 + (i % 2) * 2}) rotate(${-8 + i * 4})"><rect width="7" height="20" rx="2" fill="#E2DFE8" ${line}/><rect width="7" height="7" rx="1.5" fill="${COLORS[i][0]}"/></g>`).join('')}
    ${[SUN, '#9EDDD4', '#C9B8F2', SKY].map((c, i) => `<rect x="${w - 46 + i * 10}" y="${i % 2 ? 22 : 18}" width="9" height="${i % 2 ? 40 : 44}" rx="1.5" fill="${c}" ${line}/>`).join('')}
    ${[0, 1, 2].map((i) => `<rect x="${8 + i * 3}" y="${108 + i * 6}" width="40" height="6" rx="1.5" fill="${['#FBF9F6', '#E5D6BC', '#C9B8F2'][i]}" ${line}/>`).join('')}
    <path d="M60 128 L68 98 Q78 94 88 98 L96 128 Z" fill="#9EDDD4" ${line}/><ellipse cx="78" cy="98" rx="10" ry="3" fill="#7FCBC0" ${line}/>
    <path d="M${w - 40} 128 Q${w - 44} 112 ${w - 34} 108 Q${w - 22} 104 ${w - 16} 114 Q${w - 10} 126 ${w - 20} 128 Z" fill="#E5D6BC" ${line}/><circle cx="${w - 32}" cy="118" r="3" fill="${LILAC}"/><circle cx="${w - 24}" cy="113" r="3" fill="${TURQ}"/><circle cx="${w - 20}" cy="121" r="2.6" fill="${CORAL}"/>`;
};

const washiBody = (it, sp) => {
  const w = sp.len;
  const papers = [[14, SKY, 'sun'], [w * 0.36, '#FBF9F6', 'flower'], [w * 0.6, '#FDF3CF', 'heart'], [w * 0.84, '#E9F6F3', 'star']];
  const doodle = (k, x, y) => ({
    sun: `<circle cx="${x}" cy="${y}" r="7" fill="${SUN}"/>`,
    flower: `<circle cx="${x}" cy="${y}" r="3" fill="${SUN}"/>${[0, 1, 2, 3, 4].map((i) => `<circle cx="${(x + Math.cos(i * 1.26) * 7).toFixed(1)}" cy="${(y + Math.sin(i * 1.26) * 7).toFixed(1)}" r="4" fill="${LILAC}"/>`).join('')}`,
    heart: `<path d="M${x} ${y + 7} C${x - 12} ${y - 2} ${x - 6} ${y - 10} ${x} ${y - 3} C${x + 6} ${y - 10} ${x + 12} ${y - 2} ${x} ${y + 7} Z" fill="${CORAL}"/>`,
    star: starPath(x, y, 8, TURQ),
  }[k]);
  return `<path d="M0 6 Q${w / 2} 28 ${w} 6" stroke="#8B6450" stroke-width="1.6" fill="none"/>
    ${papers.map(([x, c, k], i) => { const y = 6 + Math.sin((x / w) * Math.PI) * 22; return `<g transform="rotate(${i % 2 ? 4 : -4} ${x} ${y})"><rect x="${x - 15}" y="${y}" width="30" height="38" fill="${c}" ${line}/>${doodle(k, x, y + 18)}<rect x="${x - 3}" y="${y - 5}" width="6" height="10" rx="1" fill="${WOOD}"/></g>`; }).join('')}`;
};

const colorWheelBody = (it, sp) => {
  const c = sp.len / 2;
  return `<rect width="${sp.len}" height="80" rx="4" fill="#FBF9F6" ${line}/>
    ${[LILAC, SKY, TURQ, LEAF, SUN, CORAL].map((col, i) => { const a0 = (i / 6) * Math.PI * 2, a1 = ((i + 1) / 6) * Math.PI * 2, r = 24; return `<path d="M${c} 40 L${(c + Math.cos(a0) * r).toFixed(1)} ${(40 + Math.sin(a0) * r).toFixed(1)} A${r} ${r} 0 0 1 ${(c + Math.cos(a1) * r).toFixed(1)} ${(40 + Math.sin(a1) * r).toFixed(1)} Z" fill="${col}"/>`; }).join('')}
    <circle cx="${c}" cy="40" r="8" fill="#fff"/>${text(c, 76, 'COLOURS', 7, '#7A64B0', 600)}`;
};

const windowBody = (it, sp, api) => {
  const sunny = api?.state.weather !== 'rain';
  const w = sp.len, h = 146;
  return `<rect width="${w}" height="${h}" rx="6" fill="${sunny ? '#BFE3FA' : '#9EADC4'}" ${line}/>
    ${sunny ? `<circle cx="${w * 0.7}" cy="38" r="16" fill="#FFF3B8"/><path d="M12 96 q14 -16 32 -6 q10 -12 28 -2 q16 0 12 12 z" fill="#fff"/>` : Array.from({ length: 12 }, (_, i) => `<line x1="${(i * 23) % w + 6}" y1="${(i * 37) % 110 + 8}" x2="${(i * 23) % w + 2}" y2="${(i * 37) % 110 + 22}" stroke="#E8EEF7" stroke-width="2"/>`).join('')}
    <path d="M0 ${h * 0.8} Q${w * 0.3} ${h * 0.7} ${w * 0.6} ${h * 0.78} T${w} ${h * 0.74} V${h} H0 Z" fill="#A8DE9A" opacity=".8"/>
    <path d="M${w / 3} 0 V${h} M${(w * 2) / 3} 0 V${h} M0 ${h / 2} H${w}" stroke="#FBF7EF" stroke-width="5"/>
    <rect x="-6" y="${h - 4}" width="${w + 12}" height="12" rx="3" fill="#FBF7EF" ${line}/>
    <path d="M${w * 0.1} ${h - 4} v-10 h12 v10" fill="${CORAL}" ${line}/><path d="M${w * 0.1 + 6} ${h - 14} q-8 -10 0 -16 q8 6 0 16" fill="${LEAF}" ${line}/>`;
};

// ---------- furniture ----------
const worktable = () => {
  const leg = shades(WOOD_D);
  return isoItem(1.8, 0.85, 78, [
    { u: 0.06, v: 0.06, w: 0.1, d: 0.1, h: 70, ...leg }, { u: 1.64, v: 0.06, w: 0.1, d: 0.1, h: 70, ...leg },
    { u: 0.06, v: 0.69, w: 0.1, d: 0.1, h: 70, ...leg }, { u: 1.64, v: 0.69, w: 0.1, d: 0.1, h: 70, ...leg },
    { u: 0.08, v: 0.08, w: 1.64, d: 0.69, z: 20, h: 4, ...shades(WOOD_L) },
    { u: 0, v: 0, w: 1.8, d: 0.85, z: 70, h: 8, ...shades(WOOD),
      topDecor: `<rect x=".08" y=".12" width=".5" height=".38" fill="#FBF9F6" transform="rotate(-6 .3 .3)"/><rect x="1.15" y=".14" width=".5" height=".4" fill="#F4E9FB"/>${splat(0.9, 0.5, 0.07, LILAC)}${splat(1.3, 0.62, 0.05, TURQ)}` },
  ]);
};

const spotLamp = (it) => {
  const on = it?.data.on;
  return isoItem(0.6, 0.6, 210, [
    { svg: (() => { const [cx, cy] = at(0.3, 0.3), [tx, ty] = at(0.3, 0.3, 150); return [[-26, 10], [24, 10], [0, -10]].map(([dx, dy]) => `<path d="M${tx} ${ty} L${cx + dx} ${cy + dy}" stroke="#3B3350" stroke-width="4" stroke-linecap="round"/>`).join('') + `<path d="M${tx} ${ty} L${tx} ${ty - 30}" stroke="#3B3350" stroke-width="5" stroke-linecap="round"/>`; })(), u: 0.3, v: 0.3, w: 0.1, d: 0.1 },
    { svg: (() => { const [hx, hy] = at(0.3, 0.3, 186);
      return `${on ? `<path d="M${hx + 18} ${hy - 6} L${hx + 330} ${hy - 150} L${hx + 360} ${hy + 30} L${hx + 18} ${hy + 6} Z" fill="#FFF4C4" opacity=".28" pointer-events="none"/>` : ''}
        <g transform="rotate(-24 ${hx} ${hy})"><path d="M${hx - 16} ${hy - 14} H${hx + 14} L${hx + 22} ${hy + 14} H${hx - 16} Z" fill="#3B3350" ${line}/><rect x="${hx - 24}" y="${hy - 10}" width="9" height="20" rx="3" fill="#5E5470"/>
        <ellipse cx="${hx + 20}" cy="${hy}" rx="4" ry="13" fill="${on ? '#FFF8D6' : '#9A90AC'}" ${line}/></g>`; })(), u: 0.3, v: 0.3, w: 0.2, d: 0.2, z: 180 },
  ]);
};

const easel = () => {
  const legC = '#C9A57C';
  const leg = (a, b, wd = 7) => `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="#3E3252" stroke-opacity=".5" stroke-width="${wd + 3}" stroke-linecap="round"/><path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="${legC}" stroke-width="${wd}" stroke-linecap="round"/>`;
  const top = at(0.7, 0.3, 214);
  const cw = 1.24 * 64;
  return isoItem(1.4, 0.8, 222, [
    { svg: leg(at(0.7, 0.04), top, 6) + leg(at(0.12, 0.62), top) + leg(at(1.28, 0.62), top) + `<circle cx="${top[0]}" cy="${top[1]}" r="5" fill="${legC}" ${line}/>`, u: 0, v: 0, w: 0, d: 0 },
    { u: 0.06, v: 0.4, w: 1.28, d: 0.08, z: 66, h: 9, ...shades(WOOD_L) },
    { u: 0.08, v: 0.34, w: 1.24, d: 0.06, z: 75, h: 122, top: '#FBF9F6', left: '#FFFFFF', right: '#E5DCCB',
      leftDecor: `<path d="M10 88 Q24 58 42 72 T${cw - 8} 46" stroke="#9EDDD4" stroke-width="7" fill="none" stroke-linecap="round" opacity=".6"/>
        <circle cx="${cw - 20}" cy="26" r="11" fill="${SUN}" opacity=".6"/><path d="M10 32 Q22 24 36 30" stroke="#C9B8F2" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
        ${text(cw / 2, 110, 'tap to paint', 10, '#B5A88F', 500)}` },
    { svg: (() => { const [x, y] = at(1.05, 0.46, 76); return `<path d="M${x - 14} ${y} L${x + 22} ${y - 6}" stroke="#C9A57C" stroke-width="3" stroke-linecap="round"/><path d="M${x + 20} ${y - 9} Q${x + 30} ${y - 6} ${x + 20} ${y - 2} Z" fill="${LILAC}" ${line}/>`; })(), u: 1.05, v: 0.46, w: 0.05, d: 0.05, z: 76 },
  ]);
};

const cart = () => isoItem(0.7, 0.6, 132, [
  { u: 0, v: 0, w: 0.7, d: 0.6, h: 84, ...shades(SKY),
    leftDecor: `${[8, 34, 60].map((y) => `<rect x="4" y="${y}" width="37" height="20" rx="3" fill="none" ${line}/><rect x="16" y="${y + 8}" width="13" height="4" rx="2" fill="#FBF9F6"/>`).join('')}` },
  { u: -0.02, v: -0.02, w: 0.74, d: 0.64, z: 84, h: 6, ...shades(CREAM, 0.6) },
  { svg: [[0.08, 0.08], [0.62, 0.08], [0.08, 0.52], [0.62, 0.52]].map(([u, v]) => { const [x, y] = at(u, v); return `<circle cx="${x}" cy="${y + 2}" r="5" fill="#3B3350"/>`; }).join(''), u: 0.3, v: 0.3, w: 0.01, d: 0.01 },
  { svg: (() => { const [jx, jy] = at(0.2, 0.25, 90), [px, py] = at(0.45, 0.38, 90); return `
    <path d="M${px - 22} ${py} Q${px - 24} ${py - 12} ${px - 6} ${py - 14} Q${px + 16} ${py - 16} ${px + 24} ${py - 6} Q${px + 26} ${py + 2} ${px + 16} ${py + 2} Q${px + 8} ${py} ${px + 6} ${py + 4} Q${px - 10} ${py + 8} ${px - 22} ${py} Z" fill="#E5D6BC" ${line}/>
    <circle cx="${px - 12}" cy="${py - 6}" r="3.5" fill="${LILAC}"/><circle cx="${px - 2}" cy="${py - 9}" r="3.5" fill="${TURQ}"/><circle cx="${px + 9}" cy="${py - 8}" r="3.5" fill="${SUN}"/><circle cx="${px + 15}" cy="${py - 3}" r="3" fill="${CORAL}"/>
    ${[[TURQ, -14], [SUN, 0], [CORAL, 14]].map(([c, a]) => `<g transform="rotate(${a} ${jx} ${jy - 6})"><path d="M${jx} ${jy - 6} V${jy - 38}" stroke="#C9A57C" stroke-width="3" stroke-linecap="round"/><path d="M${jx - 2.5} ${jy - 36} Q${jx} ${jy - 46} ${jx + 2.5} ${jy - 36} Z" fill="${c}" ${line}/></g>`).join('')}
    <path d="M${jx - 10} ${jy - 20} h20 v16 q0 4 -4 4 h-12 q-4 0 -4 -4 z" fill="#FBF9F6" ${line}/>`; })(), u: 0.35, v: 0.3, w: 0.1, d: 0.1, z: 90 },
]);

// Clay on the pottery wheel at each stage (scaled down for the room).
const CLAY = [
  'M-30 0 Q-34 -26 -10 -34 Q14 -38 28 -24 Q36 -10 30 0 Z',
  'M-26 0 L-24 -56 Q0 -62 24 -56 L26 0 Z',
  'M-30 0 Q-40 -30 -34 -60 Q0 -66 34 -60 Q40 -30 30 0 Z',
  'M-22 0 Q-46 -26 -30 -58 Q-14 -76 -14 -92 L-18 -100 H18 L14 -92 Q14 -76 30 -58 Q46 -26 22 0 Z',
];
const GLAZE = ['#3CC7B8', '#B79CF0', '#8FC3F0', '#F5DE7A'];

const wheel = (it) => {
  const stage = it?.data.stage || 0;
  return isoItem(1.1, 1.1, 150, [
    { u: 0.22, v: 0.22, w: 0.66, d: 0.66, h: 48, ...shades('#7A7090'), leftDecor: '<path d="M6 10 H36" stroke="#fff" stroke-width="2" opacity=".25"/>' },
    { u: 0.04, v: 0.04, w: 1.02, d: 1.02, z: 48, h: 10, round: true, ...shades('#E2DFE8', 0.6) },
    { u: 0.26, v: 0.26, w: 0.58, d: 0.58, z: 58, h: 5, round: true, ...shades('#B9B0C9', 0.6) },
    { svg: (() => { const [cx, cy] = at(0.55, 0.55, 63); return `<defs><clipPath id="studio-clayclip"><path transform="translate(${cx} ${cy}) scale(.62)" d="${CLAY[stage]}"/></clipPath></defs>
      <g transform="translate(${cx} ${cy}) scale(.62)"><path d="${CLAY[stage]}" fill="#C98F6A" ${line}/><path d="M-26 -14 Q0 -8 26 -14" stroke="#fff" stroke-width="3" fill="none" opacity=".35"/></g>
      <g clip-path="url(#studio-clayclip)"><g class="sx-grain">${Array.from({ length: 12 }, (_, i) => `<path d="M${cx - 30 + i * 6} ${cy - 70} V${cy}" stroke="#8B5A3C" stroke-width="1.2" opacity=".35"/>`).join('')}</g></g>`; })(), u: 0.55, v: 0.55, w: 0.1, d: 0.1, z: 63 },
    { u: 0.8, v: 0.85, w: 0.22, d: 0.2, h: 8, ...shades('#5E5470') },
  ]);
};

const stool = () => isoItem(0.6, 0.6, 66, [
  ...[[0.08, 0.08], [0.44, 0.08], [0.08, 0.44], [0.44, 0.44]].map(([u, v]) => ({ u, v, w: 0.08, d: 0.08, h: 56, ...shades(WOOD) })),
  { u: 0.1, v: 0.1, w: 0.4, d: 0.4, z: 22, h: 4, ...shades(WOOD) },
  { u: 0.02, v: 0.02, w: 0.56, d: 0.56, z: 56, h: 8, round: true, ...shades(WOOD_L) },
]);

const sculpture = () => isoItem(0.8, 0.8, 250, [
  { u: 0.06, v: 0.06, w: 0.68, d: 0.68, h: 122, ...shades('#F8F6FA', 0.5) },
  { u: 0.02, v: 0.02, w: 0.76, d: 0.76, z: 122, h: 6, ...shades('#E9E4F0', 0.5) },
  { svg: (() => { const [cx, cy] = at(0.4, 0.4, 128); return `<ellipse cx="${cx}" cy="${cy}" rx="22" ry="8" fill="${INKY}" opacity=".12"/>
    <g transform="translate(${cx - 80} ${cy - 132}) scale(1)"><path d="M60 132 Q40 100 62 76 Q86 50 70 22 Q96 40 92 70 Q88 96 104 116 Q96 132 80 132 Z" fill="${TURQ}" ${line}/>
    <path d="M66 120 Q54 98 70 80 Q86 62 78 38" stroke="#fff" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>
    <circle cx="94" cy="44" r="10" fill="${SUN}" ${line}/><circle cx="91" cy="41" r="3" fill="#fff" opacity=".7"/></g>`; })(), u: 0.4, v: 0.4, w: 0.1, d: 0.1, z: 128 },
]);

const stones = () => isoItem(0.5, 0.5, 92, [{
  svg: (() => { const [cx, cy] = at(0.25, 0.25); return `<ellipse cx="${cx}" cy="${cy + 2}" rx="26" ry="8" fill="${INKY}" opacity=".12"/>
    <ellipse cx="${cx}" cy="${cy - 10}" rx="26" ry="12" fill="#C9C3D6" ${line}/><ellipse cx="${cx + 2}" cy="${cy - 30}" rx="20" ry="10" fill="#B9B0C9" ${line}/>
    <ellipse cx="${cx - 1}" cy="${cy - 46}" rx="14" ry="8" fill="#D8D2E3" ${line}/><circle cx="${cx}" cy="${cy - 60}" r="8" fill="${LILAC}" ${line}/>`; })(),
  w: 0.5, d: 0.5,
}]);

const canvases = () => isoItem(0.6, 1.2, 146, [
  { u: 0.04, v: 0.08, w: 0.07, d: 1.04, h: 136, ...shades('#D9CDB8'), rightDecor: '<path d="M4 4 L62 130 M62 4 L4 130" stroke="#C9A57C" stroke-width="4" opacity=".6"/>' },
  { u: 0.2, v: 0.02, w: 0.07, d: 1.12, h: 124, top: '#F3EEE6', left: '#FFFFFF', right: '#F4EFE7', rightDecor: `<path d="M8 100 Q26 70 44 86 T70 60" stroke="${SKY}" stroke-width="6" fill="none" opacity=".6" stroke-linecap="round"/>` },
  { u: 0.38, v: 0.12, w: 0.07, d: 1.0, h: 104, top: '#F3EEE6', left: '#FFFFFF', right: '#F7F3EC', rightDecor: `<rect x="0" y="0" width="64" height="5" fill="${INKY}" opacity=".06"/><circle cx="20" cy="30" r="9" fill="${SUN}" opacity=".5"/>` },
]);

const rug = () => isoItem(3.2, 2.6, 2, [{ u: 0, v: 0, w: 3.2, d: 2.6, h: 0, top: '#F4EEE2',
  topDecor: `<rect x=".05" y=".05" width="3.1" height="2.5" fill="none" stroke="#E2D6C0" stroke-width=".05"/>${splat(0.7, 0.6, 0.18, '#C9B8F2')}${splat(2.4, 0.8, 0.14, '#9EDDD4')}${splat(1.6, 1.9, 0.2, '#F8E59A')}${splat(0.8, 2.0, 0.1, '#F2B79A')}${splat(2.7, 2.1, 0.12, '#B9DAF5')}` }]);

const plant = (pot) => () => isoItem(0.7, 0.7, 160, [
  { u: 0.12, v: 0.12, w: 0.46, d: 0.46, h: 40, ...shades(pot) },
  { svg: (() => { const [cx, cy] = at(0.35, 0.35, 40); return [[-30, -76, -10], [26, -86, 12], [-4, -112, 0], [-40, -36, -18], [38, -44, 18]].map(([dx, dy, r]) => `<path d="M${cx} ${cy} Q${cx + dx * 0.4} ${cy + dy * 0.6} ${cx + dx} ${cy + dy} Q${cx + dx * 0.9 + r} ${cy + dy * 0.5} ${cx} ${cy} Z" fill="${LEAF}" ${line}/>`).join(''); })(), w: 0.7, d: 0.7, u: 0.35, v: 0.35 },
]);

// ---------- small things ----------
const tin = (c) => () => isoItem(0.3, 0.3, 44, [{
  svg: (() => { const [cx, cy] = at(0.15, 0.15); return `<path d="M${cx - 14} ${cy - 24} V${cy - 3} Q${cx} ${cy + 4} ${cx + 14} ${cy - 3} V${cy - 24} Z" fill="#E2E6EE" ${line}/>
    <path d="M${cx - 14} ${cy - 18} V${cy - 9} Q${cx} ${cy - 2} ${cx + 14} ${cy - 9} V${cy - 18} Q${cx} ${cy - 11} ${cx - 14} ${cy - 18} Z" fill="${c}"/>
    <ellipse cx="${cx}" cy="${cy - 24}" rx="14" ry="5" fill="${c}" ${line}/><path d="M${cx - 9} ${cy - 22} q-1 8 1 11 q2 -4 1 -10" fill="${c}"/>
    <path d="M${cx - 14} ${cy - 24} Q${cx} ${cy - 44} ${cx + 14} ${cy - 24}" stroke="#7A7090" stroke-width="1.6" fill="none"/>`; })(),
  w: 0.3, d: 0.3,
}]);

const jar = () => isoItem(0.3, 0.3, 70, [{
  svg: (() => { const [cx, cy] = at(0.15, 0.15); return `${[[TURQ, -14], [SUN, 0], [LILAC, 14]].map(([c, a]) => `<g transform="rotate(${a} ${cx} ${cy - 10})"><path d="M${cx} ${cy - 10} V${cy - 52}" stroke="#C9A57C" stroke-width="3" stroke-linecap="round"/><path d="M${cx - 3} ${cy - 50} Q${cx} ${cy - 62} ${cx + 3} ${cy - 50} Z" fill="${c}" ${line}/></g>`).join('')}
    <path d="M${cx - 11} ${cy - 26} V${cy - 3} Q${cx} ${cy + 3} ${cx + 11} ${cy - 3} V${cy - 26} Z" fill="#E8F6FF" fill-opacity=".85" ${line}/><path d="M${cx - 7} ${cy - 22} V${cy - 6}" stroke="#fff" stroke-width="2" opacity=".8"/>`; })(),
  w: 0.3, d: 0.3,
}]);

const vaseArt = (n) => {
  const c = GLAZE[n % GLAZE.length];
  return svg(56, 76, `<ellipse cx="28" cy="72" rx="20" ry="4" fill="${INKY}" opacity=".16"/>
    <g transform="translate(28 72) scale(.66)"><path d="${CLAY[3]}" fill="${c}" ${line}/><path d="M-30 -40 Q0 -34 30 -40" stroke="#fff" stroke-width="3" fill="none" opacity=".5"/>
    <path d="M-16 -18 Q-26 -36 -14 -54" stroke="#fff" stroke-width="4" fill="none" opacity=".35" stroke-linecap="round"/><ellipse cx="0" cy="-100" rx="18" ry="4" fill="${INKY}" opacity=".5"/></g>`);
};
function vaseItem(api, gx, gy, n) {
  return api.add({
    id: api.uid('vase'), w: 56, h: 76, small: true,
    gx: Math.max(0, Math.min(R.cols - 0.4, gx)), gy: Math.max(0, Math.min(R.rows - 0.4, gy)), gz: 0, fw: 0.4, fd: 0.4, ax: 28, ay: 72,
    onTap: (it, a) => { a.sparkle(it.x + 28, it.y + 30, ['✨', '🏺']); a.bubble(it.x + 28, it.y - 8, 'Handmade with love! 🏺'); },
    art: () => vaseArt(n),
  }, { spawned: true });
}

const I = isoDef;
const W = (...a) => wallDef(R, ...a);

export const STUDIO = {
  id: 'studio', posKey: 'studio-iso', title: 'Art Studio 🎨', weather: true, light: 'iso', avatar: [3.2, 4.0],
  frame: '#ECE6DA',
  iso: R,
  bg,
  onWeather: (api) => api.setArt(api.get('window')),
  stars: [{ id: 'studio-canvases', gx: 0.1, gy: 4.5 }],
  characters: [
    { id: 'iris', look: { ...NPC.nora, hairStyle: 'long', hair: '#8B6450', hairAcc: 'none', top: 'sweater', topColor: '#FBEFB4', collar: 'round', hat: 'beanie', bottom: 'widePants', bottomColor: '#4D5C9A', socks: 'none', shoes: 'boots', shoesColor: '#4A3B5C' }, gx: 5.8, gy: 2.5,
      say: ["Hi, I'm Iris! Tap the easel to paint 🎨", 'Your paintings hang on the wall! 🖼️', 'Tap the pottery wheel a few times 🏺', 'Every artist was first a beginner ✨'] },
  ],
  items: [
    W('supplies', 'R', 0.25, 262, 1.75, 136, suppliesBody, {
      onTap: (it, api) => { api.sparkle(it.x + it.w / 2, it.y + it.h / 2, ['🖌️', '✨', '🎨']); api.bubble(it.x + it.w / 2, it.y, ['Brushes of every size! 🖌️', 'So many paint tubes! 🎨', 'Sketchbooks and charcoal ✏️'][Math.floor(Math.random() * 3)]); } }),
    W('gallery', 'R', 2.35, 268, 3.45, 132, galleryBody, {
      onTap: (it, api) => {
        const p = paintingsOf(api);
        if (!p.length) { api.bubble(it.x + it.w * 0.3, it.y, 'Paint at the easel to fill this frame! 🎨'); return; }
        api.sparkle(it.x + it.w * 0.3, it.y + it.h * 0.4, ['✨', '🖼️', '💫']);
        api.bubble(it.x + it.w * 0.3, it.y, ['A true masterpiece! 🖼️', 'Bravo, artist! 👏', 'Beautiful colours! 🎨'][Math.floor(Math.random() * 3)]);
      } }),
    W('window', 'R', 6.15, 266, 1.6, 146, windowBody),
    W('drawings', 'L', 0.35, 262, 2.6, 70, washiBody),
    W('colorwheel', 'L', 4.35, 246, 1.0, 80, colorWheelBody),

    I('rug', 2.4, 2.0, 3.2, 2.6, rug, { floor: true }),
    I('worktable', 0.2, 0.08, 1.8, 0.85, worktable, { drag: false, surface: 78 }),
    I('plant1', 0.15, 1.3, 0.7, 0.7, plant(TEAL)),
    I('spot', 1.65, 1.35, 0.6, 0.6, spotLamp, { data: { on: true }, onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); } }),
    I('sculpture', 0.15, 2.6, 0.8, 0.8, sculpture, { drag: false,
      onTap: (it, api) => {
        it.el.classList.remove('sx-twirl'); void it.el.offsetWidth; it.el.classList.add('sx-twirl');
        api.bubble(it.x + it.w / 2, it.y, ['"Sea Ribbon" — so elegant ✨', 'Art you can walk around! 🗿', 'Made of glazed clay 🌀'][Math.floor(Math.random() * 3)]);
      } }),
    I('easel', 3.2, 2.35, 1.4, 0.8, easel, { drag: false, onTap: (it, api) => paint(api) }),
    I('cart', 4.85, 2.45, 0.7, 0.6, cart, {
      onTap: (it, api) => { api.sparkle(it.x + it.w / 2, it.y + 20, ['🖌️', '✨']); api.bubble(it.x + it.w / 2, it.y, 'Brushes, tubes and a palette! 🖌️'); api.sfx.click(); } }),
    I('wheel', 6.25, 0.45, 1.1, 1.1, wheel, { drag: false, data: { stage: 0, made: 0 },
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
              vaseItem(api, it.gx - 0.1 + api.count('vase') * 0.5, it.gy + it.fd + 0.25, it.data.made++);
              api.bubble(it.x + it.w / 2, it.y, 'A beautiful vase! Drag it anywhere 🏺');
            } else api.bubble(it.x + it.w / 2, it.y, 'What a collection of vases! 🏺');
            api.sfx.win();
          } else api.bubble(it.x + it.w / 2, it.y, ['Spin, spin... 🌀', 'It\'s growing! ✨', 'Almost a vase! 🏺'][it.data.stage - 1]);
          api.setArt(it);
        }, 1100);
      } }),
    I('stool', 7.6, 0.3, 0.6, 0.6, stool, { surface: 64,
      onTap: (it, api) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.sfx.boing(); } }),
    I('plant2', 8.2, 2.7, 0.7, 0.7, plant(CORAL)),
    I('plant3', 3.6, 6.2, 0.7, 0.7, plant(LILAC)),
    I('canvases', 0.15, 4.3, 0.6, 1.2, canvases, {
      onTap: (it, api) => { api.bubble(it.x + it.w / 2, it.y, 'Blank canvases waiting for ideas ✨'); } }),
    I('stones', 0.35, 6.15, 0.5, 0.5, stones, {
      onTap: (it, api) => { it.el.classList.remove('shake'); void it.el.offsetWidth; it.el.classList.add('shake'); api.bubble(it.x + it.w / 2, it.y, 'Perfectly balanced! 🪨'); } }),

    // small things on the worktable and stool
    ...[['#3CC7B8', 'Turquoise'], ['#F5DE7A', 'Sunshine yellow'], ['#B79CF0', 'Lilac']].map(([c, name], i) => I('pot' + i, 0.45 + i * 0.4, 0.42, 0.3, 0.3, tin(c), {
      small: true, gz: 78,
      onTap: (it, api) => {
        api.effect(it.x + it.w / 2, it.y - 10, 'sx-splat', `<svg viewBox="0 0 80 60" width="80" height="60"><path d="M40 8 Q52 0 56 14 Q72 10 68 26 Q80 34 66 42 Q66 58 50 50 Q40 60 30 50 Q14 58 14 42 Q0 34 12 26 Q8 10 24 14 Q28 0 40 8 Z" fill="${c}" opacity=".85"/></svg>`, 900);
        api.bubble(it.x + it.w / 2, it.y - 20, `${name} paint! 🎨`); api.sfx.pop();
      } })),
    I('brushjar', 1.65, 0.3, 0.3, 0.3, jar, { small: true, gz: 78 }),
    (() => { const d = wearable('beanie', 0, 0, 'studio-beret', { gx: 7.7, gy: 0.4, gz: 64 }), k = 0.7; return { ...d, w: d.w * k, h: d.h * k, ax: (d.w * k) / 2, ay: d.h * k - 4 }; })(),
  ],
};
