// Olivia's room — the first isometric "dollhouse from above" room (Unpacking-style prototype).
import { room, roomShell, isoItem, at, shades, proj, isoDef, wallDef } from '../iso.js';
import { svg, text, starPath, stringLights, wearable } from './common.js';

const R = room({ cols: 8, rows: 7, ox: 768, oy: 384, wallH: 300 });
R.charScale = 0.62;

const WOOD = '#C99A6C', WOOD_L = '#E2C29C', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', SKY = '#9CC8EE', SUN = '#F5DE7A';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4"';

// ---------- background: backdrop + room shell ----------
const bg = (w) => {
  const [lx, ly] = proj(R, 0, R.rows), [rx, ry] = proj(R, R.cols, 0), [fx, fy] = proj(R, R.cols, R.rows);
  return svg(1600, 900, `
  <defs>
    <radialGradient id="rm-bd" cx="50%" cy="55%" r="70%"><stop offset="0" stop-color="#F6F1FB"/><stop offset="1" stop-color="#DCD3EE"/></radialGradient>
    <pattern id="rm-wl" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,0,1,0,0)">
      <rect width="60" height="60" fill="#E6DEF6"/><path d="M30 0 V60" stroke="#DCD2F0" stroke-width="14"/>${starPath(30, 30, 4, '#F3E7B0')}</pattern>
    <pattern id="rm-wr" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="matrix(1,-0.5,0,1,0,0)">
      <rect width="60" height="60" fill="#DDD3F0"/><path d="M30 0 V60" stroke="#D3C8EA" stroke-width="14"/>${starPath(30, 30, 4, '#EEE0A8')}</pattern>
    <linearGradient id="rm-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6DA" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#rm-bd)"/>
  <ellipse cx="${(lx + rx) / 2}" cy="${fy + 6}" rx="560" ry="46" fill="#3E3252" opacity=".10"/>
  ${roomShell(R, { floor: '#DDBA93', floorLines: 'planks', wallL: '#E6DEF6', wallR: '#DDD3F0', wallPatternL: 'rm-wl', wallPatternR: 'rm-wr' })}
  <polygon points="${[proj(R, 2.3, 0.05), proj(R, 4.3, 0.05), proj(R, 6.2, 3.4), proj(R, 4.2, 3.4)].map((p) => p.join(',')).join(' ')}" fill="url(#rm-light)" opacity="${w.weather === 'sun' ? 1 : 0.35}"/>`);
};

// ---------- furniture ----------
const bed = () => {
  const wood = shades(WOOD), sheet = shades(CREAM, 0.6), blanket = shades(LILAC), pillow = shades('#FFFFFF', 0.5);
  return isoItem(3, 2, 120, [
    { u: 0, v: 0, w: 3, d: 2, h: 32, ...wood },
    { u: 0.12, v: 0.08, w: 2.8, d: 1.84, z: 32, h: 20, ...sheet },
    { u: 1.05, v: 0.04, w: 1.9, d: 1.92, z: 46, h: 10, ...blanket,
      topDecor: '<path d="M0.3 0 V1.92 M0.8 0 V1.92 M1.3 0 V1.92" stroke="#fff" stroke-opacity=".45" stroke-width=".07"/>',
      leftDecor: `<path d="M0 6 H${1.9 * 64}" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>` },
    { u: 0.22, v: 0.22, w: 0.62, d: 1.5, z: 52, h: 16, ...pillow },
    { u: 0, v: 0, w: 0.18, d: 2, h: 120, ...shades('#B58456'), rightDecor: `${starPath(64, 40, 16, '#F3E7B0')}` },
  ]);
};
const nightstand = () => isoItem(1, 1, 60, [
  { u: 0.05, v: 0.05, w: 0.9, d: 0.9, h: 60, ...shades('#EADBC5'),
    leftDecor: `<rect x="8" y="12" width="42" height="16" rx="3" fill="none" ${line}/><circle cx="29" cy="20" r="2.5" fill="#B58456"/><rect x="8" y="34" width="42" height="16" rx="3" fill="none" ${line}/><circle cx="29" cy="42" r="2.5" fill="#B58456"/>` },
]);
const desk = () => {
  const top = shades(WOOD_L), leg = shades('#B58456');
  return isoItem(2.2, 1, 82, [
    { u: 0.05, v: 0.08, w: 0.12, d: 0.12, h: 72, ...leg }, { u: 0.05, v: 0.8, w: 0.12, d: 0.12, h: 72, ...leg },
    { u: 1.4, v: 0.08, w: 0.7, d: 0.84, h: 72, ...shades('#EADBC5'),
      leftDecor: `<rect x="6" y="10" width="32" height="20" rx="3" fill="none" ${line}/><rect x="6" y="38" width="32" height="20" rx="3" fill="none" ${line}/>` },
    { u: 0, v: 0, w: 2.2, d: 1, z: 72, h: 10, ...top },
  ]);
};
const chair = () => isoItem(0.8, 0.8, 100, [
  { u: 0.1, v: 0.1, w: 0.08, d: 0.08, h: 44, ...shades('#8B6450') }, { u: 0.62, v: 0.1, w: 0.08, d: 0.08, h: 44, ...shades('#8B6450') },
  { u: 0.1, v: 0.62, w: 0.08, d: 0.08, h: 44, ...shades('#8B6450') }, { u: 0.62, v: 0.62, w: 0.08, d: 0.08, h: 44, ...shades('#8B6450') },
  { u: 0, v: 0, w: 0.8, d: 0.8, z: 44, h: 10, ...shades(TEAL) },
  { u: 0, v: 0, w: 0.8, d: 0.12, z: 54, h: 50, ...shades(TEAL) },
]);
const wardrobe = (it) => {
  const c = shades('#F2EADF');
  const open = it?.data.open;
  return isoItem(2, 1, 250, [
    { u: 0, v: 0, w: 2, d: 1, h: 250, ...c,
      leftDecor: open
        ? `<rect x="6" y="14" width="${2 * 64 - 12}" height="226" fill="#5E4E7E"/><path d="M10 40 H${2 * 64 - 10}" stroke="#C9A57C" stroke-width="4"/>
           ${[['#7FCFC4', 20], ['#F5DE7A', 46], ['#B79CF0', 72], ['#9CC8EE', 98]].map(([col, x]) => `<path d="M${x} 42 l-10 14 v80 h20 v-80 z" fill="${col}" ${line}/>`).join('')}`
        : `<path d="M${64} 12 V244" ${line}/><rect x="52" y="110" width="5" height="34" rx="2" fill="#B58456"/><rect x="71" y="110" width="5" height="34" rx="2" fill="#B58456"/>${starPath(32, 60, 10, '#C9B8F2')}${starPath(96, 60, 10, '#9EDDD4')}` },
    { u: -0.04, v: -0.04, w: 2.08, d: 1.08, z: 250, h: 8, ...shades('#E2D6C6') },
  ]);
};
const bookshelf = () => {
  const c = shades('#EADBC5');
  const books = (y, seed) => Array.from({ length: 7 }, (_, i) => {
    const hh = 26 + ((i * 7 + seed) % 12), col = ['#B79CF0', '#7FCFC4', '#F5DE7A', '#9CC8EE', '#E58F6A', '#C9B8F2', '#6DBE7A'][(i + seed) % 7];
    return `<rect x="${8 + i * 15}" y="${y - hh}" width="12" height="${hh}" fill="${col}" ${line}/>`;
  }).join('');
  return isoItem(0.7, 2, 200, [
    { u: 0, v: 0, w: 0.7, d: 2, h: 200, ...c,
      rightDecor: `<rect x="4" y="6" width="${2 * 64 - 8}" height="188" fill="#D9C6AC"/>
        ${[64, 118, 172].map((y) => `<rect x="4" y="${y}" width="${2 * 64 - 8}" height="6" fill="#EADBC5" ${line}/>`).join('')}
        ${books(64, 1)}${books(118, 3)}
        <circle cx="40" cy="160" r="10" fill="#E58F6A" ${line}/><path d="M80 172 v-22 h20 v22" fill="#7FCFC4" ${line}/>` },
  ]);
};
const rug = () => isoItem(3, 2.6, 4, [
  { u: 0, v: 0, w: 3, d: 2.6, h: 0, round: true, top: '#9EDDD4',
    topDecor: '<ellipse cx="1.5" cy="1.3" rx="1.2" ry="1.02" fill="none" stroke="#fff" stroke-width=".06" stroke-dasharray=".18 .12"/><ellipse cx="1.5" cy="1.3" rx=".75" ry=".62" fill="#C9B8F2"/>' },
]);
const beanbag = () => isoItem(1, 1, 70, [{
  svg: (() => { const [cx, cy] = at(0.5, 0.5); return `<ellipse cx="${cx}" cy="${cy + 4}" rx="70" ry="30" fill="#3E3252" opacity=".12"/>
    <path d="M${cx - 66} ${cy} C${cx - 70} ${cy - 60} ${cx - 20} ${cy - 76} ${cx + 10} ${cy - 66} C${cx + 60} ${cy - 56} ${cx + 72} ${cy - 18} ${cx + 64} ${cy + 4} C${cx + 40} ${cy + 26} ${cx - 40} ${cy + 26} ${cx - 66} ${cy} Z" fill="${SUN}" ${line}/>
    <path d="M${cx - 40} ${cy - 30} Q${cx} ${cy - 10} ${cx + 40} ${cy - 30}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="5" stroke-linecap="round"/>`; })(),
  w: 1, d: 1,
}]);
const plant = () => isoItem(0.8, 0.8, 150, [
  { u: 0.12, v: 0.12, w: 0.56, d: 0.56, h: 46, ...shades('#E58F6A') },
  { svg: (() => { const [cx, cy] = at(0.4, 0.4, 46); return [[-34, -70, -10], [30, -80, 14], [-6, -104, 0], [-40, -40, -20], [40, -46, 20]].map(([dx, dy, r]) => `<path d="M${cx} ${cy} Q${cx + dx * 0.4} ${cy + dy * 0.6} ${cx + dx} ${cy + dy} Q${cx + dx * 0.9 + r} ${cy + dy * 0.5} ${cx} ${cy} Z" fill="#6DBE7A" ${line}/>`).join(''); })(), w: 0.8, d: 0.8, u: 0.4, v: 0.4 },
]);
const floorLamp = (it) => isoItem(0.6, 0.6, 210, [
  { u: 0.1, v: 0.1, w: 0.4, d: 0.4, h: 8, ...shades('#7A64B0') },
  { u: 0.27, v: 0.27, w: 0.06, d: 0.06, z: 8, h: 160, ...shades('#7A64B0') },
  { svg: (() => { const [cx, cy] = at(0.3, 0.3, 168); return `${it?.data.on ? `<circle cx="${cx}" cy="${cy}" r="120" fill="#FFF3B0" opacity=".28"/>` : ''}<path d="M${cx - 34} ${cy + 10} L${cx - 20} ${cy - 34} H${cx + 20} L${cx + 34} ${cy + 10} Z" fill="${it?.data.on ? '#FFF0A0' : SUN}" ${line}/>`; })(), w: 0.6, d: 0.6, u: 0.3, v: 0.3, z: 200 },
]);
const toybox = (it) => {
  const c = shades(SUN), lid = shades(LILAC);
  return isoItem(1.1, 0.9, 110, [
    { u: 0, v: 0, w: 1.1, d: 0.9, h: 54, ...c, leftDecor: `${starPath(24, 26, 9, '#fff')}${starPath(50, 26, 9, '#fff')}` },
    ...(it?.data.open
      ? [{ svg: (() => { const [cx, cy] = at(0.55, 0.45, 54); return `<circle cx="${cx - 14}" cy="${cy - 10}" r="14" fill="#E58F6A" ${line}/><rect x="${cx + 2}" y="${cy - 30}" width="22" height="22" rx="4" fill="${SKY}" ${line}/>`; })(), w: 0.1, d: 0.1, u: 0.5, v: 0.45, z: 54 },
         { u: 0, v: -0.02, w: 1.1, d: 0.08, z: 54, h: 50, ...lid }]
      : [{ u: -0.03, v: -0.03, w: 1.16, d: 0.96, z: 54, h: 12, ...lid }]),
  ]);
};

// ---------- small things (can be placed on furniture) ----------
const smallBox = (fw, fd, h, parts) => isoItem(fw, fd, h, parts);
const laptop = (it) => smallBox(0.5, 0.36, 40, [
  { u: 0, v: 0, w: 0.5, d: 0.36, h: 4, ...shades('#A9AEC2') },
  { u: 0, v: 0, w: 0.5, d: 0.04, z: 4, h: 34, ...shades('#A9AEC2'), leftDecor: it?.data.on ? `<rect x="3" y="3" width="26" height="26" fill="#9CC8EE"/>${starPath(16, 16, 6, '#F5DE7A')}` : '<rect x="3" y="3" width="26" height="26" fill="#3E3A4A"/>' },
]);
const mug = () => smallBox(0.2, 0.2, 26, [{ u: 0, v: 0, w: 0.2, d: 0.2, h: 22, ...shades('#FBF7EF'), leftDecor: '<rect x="2" y="8" width="9" height="5" fill="#B79CF0"/>' }]);
const deskLamp = (it) => isoItem(0.3, 0.3, 90, [
  { u: 0.05, v: 0.05, w: 0.2, d: 0.2, h: 6, ...shades('#3CC7B8') },
  { svg: (() => { const [cx, cy] = at(0.15, 0.15, 6); return `${it?.data.on ? `<circle cx="${cx + 18}" cy="${cy - 60}" r="70" fill="#FFF3B0" opacity=".3"/>` : ''}<path d="M${cx} ${cy} L${cx - 6} ${cy - 46} L${cx + 18} ${cy - 66}" fill="none" stroke="#3E3252" stroke-width="4" stroke-linecap="round"/><path d="M${cx + 6} ${cy - 66} L${cx + 34} ${cy - 76} L${cx + 40} ${cy - 54} Z" fill="${it?.data.on ? '#FFF0A0' : '#3CC7B8'}" ${line}/>`; })(), w: 0.3, d: 0.3, u: 0.15, v: 0.15, z: 90 },
]);
const plushie = () => isoItem(0.4, 0.4, 70, [{
  svg: (() => { const [cx, cy] = at(0.2, 0.2); return `<ellipse cx="${cx - 9}" cy="${cy - 56}" rx="7" ry="16" fill="#FBF7EF" ${line}/><ellipse cx="${cx + 9}" cy="${cy - 56}" rx="7" ry="16" fill="#FBF7EF" ${line}/>
    <ellipse cx="${cx}" cy="${cy - 12}" rx="20" ry="16" fill="#FBF7EF" ${line}/><circle cx="${cx}" cy="${cy - 34}" r="16" fill="#FBF7EF" ${line}/>
    <circle cx="${cx - 6}" cy="${cy - 36}" r="2.2" fill="#3E3252"/><circle cx="${cx + 6}" cy="${cy - 36}" r="2.2" fill="#3E3252"/><path d="M${cx - 3} ${cy - 29} Q${cx} ${cy - 26} ${cx + 3} ${cy - 29}" stroke="#3E3252" fill="none" stroke-width="1.5"/>
    <path d="M${cx - 8} ${cy - 20} L${cx} ${cy - 16} L${cx + 8} ${cy - 20} L${cx + 8} ${cy - 12} L${cx} ${cy - 16} L${cx - 8} ${cy - 12} Z" fill="${TEAL}"/>`; })(), w: 0.4, d: 0.4,
}]);
const books = () => smallBox(0.4, 0.3, 30, [
  { u: 0, v: 0, w: 0.4, d: 0.3, h: 9, ...shades('#E58F6A') },
  { u: 0.02, v: 0.02, w: 0.36, d: 0.26, z: 9, h: 9, ...shades(SKY) },
  { u: 0.04, v: 0.01, w: 0.34, d: 0.27, z: 18, h: 8, ...shades(SUN) },
]);
const succulent = () => isoItem(0.3, 0.3, 50, [
  { u: 0.03, v: 0.03, w: 0.24, d: 0.24, h: 18, ...shades('#FBF7EF') },
  { svg: (() => { const [cx, cy] = at(0.15, 0.15, 18); return `<path d="M${cx} ${cy} Q${cx - 16} ${cy - 18} ${cx - 8} ${cy - 30} Q${cx} ${cy - 16} ${cx} ${cy} Q${cx + 4} ${cy - 30} ${cx + 12} ${cy - 26} Q${cx + 12} ${cy - 10} ${cx} ${cy} Z" fill="#6DBE7A" ${line}/>`; })(), w: 0.3, d: 0.3, u: 0.15, v: 0.15, z: 50 },
]);

const I = isoDef;
const W = (...a) => wallDef(R, ...a);

const windowBody = (it, sp, api) => {
  const sunny = api?.state.weather !== 'rain';
  const w = sp.len, h = 150;
  return `<rect width="${w}" height="${h}" rx="6" fill="${sunny ? '#BFE3FA' : '#9EADC4'}" ${line}/>
    ${sunny ? `<circle cx="${w * 0.7}" cy="40" r="18" fill="#FFF3B8"/><path d="M14 104 q16 -18 36 -6 q12 -14 32 -2 q18 0 14 14 z" fill="#fff"/>` : Array.from({ length: 12 }, (_, i) => `<line x1="${(i * 23) % w + 6}" y1="${(i * 37) % 120 + 10}" x2="${(i * 23) % w + 2}" y2="${(i * 37) % 120 + 24}" stroke="#E8EEF7" stroke-width="2"/>`).join('')}
    <path d="M0 ${h * 0.8} Q${w * 0.3} ${h * 0.7} ${w * 0.6} ${h * 0.78} T${w} ${h * 0.74} V${h} H0 Z" fill="#A8DE9A" opacity=".8"/>
    <path d="M${w / 2} 0 V${h} M0 ${h / 2} H${w}" stroke="#FBF7EF" stroke-width="6"/>
    <rect x="-6" y="${h - 4}" width="${w + 12}" height="12" rx="3" fill="#FBF7EF" ${line}/>
    <path d="M-14 -10 Q${w * 0.14} ${h * 0.45} -4 ${h + 2} L-16 ${h + 2} Z" fill="${LILAC}" ${line}/>
    <path d="M${w + 14} -10 Q${w * 0.86} ${h * 0.45} ${w + 4} ${h + 2} L${w + 16} ${h + 2} Z" fill="${LILAC}" ${line}/>
    <rect x="-22" y="-16" width="${w + 44}" height="9" rx="4" fill="${WOOD}" ${line}/>`;
};

export const ROOM = {
  id: 'home', posKey: 'room-v1', title: "Olivia's Room 🏠", weather: true, light: 'iso', avatar: [3.6, 3.2],
  frame: '#E6DFF2',
  iso: R,
  bg,
  onWeather: (api) => api.setArt(api.get('window')),
  stars: [{ id: 'home-cushion', gx: 5.7, gy: 4.5 }],
  items: [
    W('lights', 'L', 0.3, 290, 6.4, 50, () => stringLights(4, 6.4 * 64 - 4, 6, 14)),
    W('window', 'R', 2.4, 260, 2.2, 150, windowBody),
    W('frame1', 'L', 4.9, 240, 0.9, 70, (it, sp) => `<rect width="${sp.len}" height="70" rx="4" fill="#2E3266" ${line}/><circle cx="${sp.len / 2}" cy="35" r="16" fill="${LILAC}"/><ellipse cx="${sp.len / 2}" cy="38" rx="28" ry="6" fill="none" stroke="${TEAL}" stroke-width="3"/>${starPath(sp.len - 10, 12, 5, SUN)}`),
    W('frame2', 'L', 6.0, 220, 0.6, 54, (it, sp) => `<rect width="${sp.len}" height="54" rx="4" fill="${CREAM}" ${line}/><path d="M6 44 L${sp.len / 2} 14 L${sp.len - 6} 44 Z" fill="${TEAL}"/>`),
    W('clock', 'R', 5.0, 250, 0.55, 36, (it, sp) => `<ellipse cx="${sp.len / 2}" cy="18" rx="${sp.len / 2}" ry="18" fill="#fff" ${line}/><path d="M${sp.len / 2} 18 V6 M${sp.len / 2} 18 H${sp.len / 2 + 9}" stroke="#3E3252" stroke-width="2.5"/>`),
    W('poster', 'R', 0.55, 250, 1.2, 110, (it, sp) => `<rect width="${sp.len}" height="110" rx="4" fill="${SUN}" ${line}/><circle cx="${sp.len / 2}" cy="48" r="26" fill="${LILAC}"/><ellipse cx="${sp.len / 2}" cy="52" rx="44" ry="10" fill="none" stroke="${TEAL}" stroke-width="4"/>${text(sp.len / 2, 98, 'DREAM', 14, '#7A64B0')}`),
    W('shelf', 'L', 3.0, 190, 1.2, 18, (it, sp) => `<rect y="12" width="${sp.len}" height="8" rx="2" fill="${WOOD}" ${line}/><path d="M14 12 v-16 h14 v16 M40 12 q0 -24 12 -24 q12 0 12 24" fill="${TEAL}" ${line}/>`),

    I('rug', 2.4, 2.2, 3, 2.6, rug, { floor: true }),
    I('bookshelf', 0, 0.9, 0.7, 2, bookshelf),
    I('flamp', 0.1, 0.1, 0.6, 0.6, floorLamp, { data: { on: true }, onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); } }),
    I('bed', 0, 4.6, 3, 2, bed, { surface: 52 }),
    I('nightstand', 0.05, 3.5, 1, 1, nightstand, { surface: 60 }),
    I('desk', 2.4, 0.05, 2.2, 1, desk, { surface: 82 }),
    I('chair', 3.1, 1.2, 0.8, 0.8, chair),
    I('wardrobe', 5.7, 0.05, 2, 1, wardrobe, { drag: false, data: { open: false },
      onTap: (it, api) => {
        if (!it.data.open) { it.data.open = true; api.setArt(it); api.bubble(it.x + it.w / 2, it.y, 'Tap again to change clothes 👗'); }
        else api.go('editor', { id: api.avatar()?.def.charId, back: ['scene', { id: 'home' }] });
      } }),
    I('plant', 7.15, 1.2, 0.8, 0.8, plant),
    I('beanbag', 5.6, 4.4, 1, 1, beanbag),
    I('toybox', 6.6, 5.9, 1.1, 0.9, toybox, { data: { open: false },
      onTap: (it, api) => {
        it.data.open = !it.data.open; api.setArt(it);
        if (it.data.open) {
          api.sparkle(it.x + it.w / 2, it.y + 30, ['🧸', '✨', '🎈', '⭐']);
          if (!api.starFound('home-toybox')) api.addStar('home-toybox', 0, 0, { spawned: true, gx: it.gx + 0.3, gy: it.gy + 0.2, gz: 60 });
        }
      } }),
    // small things: drag them around and onto the bed, desk or nightstand
    I('laptop', 2.9, 0.25, 0.5, 0.36, laptop, { small: true, gz: 82, data: { on: false }, onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); } }),
    I('mug', 4.0, 0.4, 0.2, 0.2, mug, { small: true, gz: 82 }),
    I('desklamp', 2.55, 0.2, 0.3, 0.3, deskLamp, { small: true, gz: 82, data: { on: false }, onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); } }),
    I('plushie', 0.4, 5.4, 0.4, 0.4, plushie, { small: true, gz: 52, onTap: (it, api) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.bubble(it.x + it.w / 2, it.y, '♥'); } }),
    I('books', 0.35, 3.75, 0.4, 0.3, books, { small: true, gz: 60 }),
    I('succulent', 0.6, 3.6, 0.3, 0.3, succulent, { small: true, gz: 60 }),
    wearable('cap', 0, 0, 'room-cap', { gx: 6.2, gy: 3.2 }),
  ],
};
