// Cozy Cabin — isometric dollhouse version: log walls, a crackling fireplace, a decorated tree with presents,
// cocoa from the stove, Grandpa Ole and a sleepy dog.
import { room, roomShell, isoItem, at, shades, proj, isoDef, wallDef } from '../iso.js';
import { svg, text, starPath, stringLights, pine, food, wearable, NPC_WINTER } from './common.js';
import { CLIMATES } from '../ui.js';

const R = room({ cols: 9, rows: 7, ox: 736, oy: 340, wallH: 290 });
R.charScale = 0.6;

const WOOD = '#C99A6C', WOOD_D = '#8B6450', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', SKY = '#9CC8EE', SUN = '#F5DE7A', PINE = '#4E9B7A';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4"';
const pp = (arr) => arr.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ');
const P = (u, v, z, fn, w = 0.1, d = 0.1) => ({ svg: fn(...at(u, v, z)), u, v, z, w, d });
const bump = (it, cls) => { it.el.classList.remove(cls); void it.el.offsetWidth; it.el.classList.add(cls); };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const quad = (p0, p1, p2, t) => [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]];

// rounded stones on a face (W×H px), clipped to the face
const stones = (W, H, col = '#CDD3E3', edge = '#9EA6BE', rowH = 22, bw = 32) => {
  let s = '';
  for (let r = 0; r * rowH < H - 4; r++) {
    for (let x = -(r % 2) * bw / 2; x < W; x += bw) {
      const x0 = Math.max(2, x + 2), x1 = Math.min(W - 2, x + bw - 2), y0 = r * rowH + 2, y1 = Math.min(H - 2, y0 + rowH - 4);
      if (x1 - x0 > 5 && y1 - y0 > 5) s += `<rect x="${x0.toFixed(1)}" y="${y0}" width="${(x1 - x0).toFixed(1)}" height="${y1 - y0}" rx="5" fill="${col}" stroke="${edge}" stroke-width="1.3"/>`;
    }
  }
  return s;
};

// ---------- background: backdrop + log cabin shell ----------
const logs = (c) => `<rect width="240" height="36" fill="${c}"/><path d="M0 34.5 H240" stroke="#A97B52" stroke-width="3"/><path d="M0 3 H240" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>
  <path d="M14 18 Q120 13 226 19" stroke="#B98A5E" stroke-opacity=".45" stroke-width="1.4" fill="none"/><ellipse cx="178" cy="19" rx="7" ry="5" fill="none" stroke="#A97B52" stroke-opacity=".6" stroke-width="1.6"/>`;
const flakes = (n, w, h, seed = 1, op = 0.8) => Array.from({ length: n }, (_, i) => `<circle cx="${((i * 97 + seed * 31) % w).toFixed(0)}" cy="${((i * 61 + seed * 17) % h).toFixed(0)}" r="${2 + ((i + seed) % 3)}" fill="#fff" opacity="${op}"/>`).join('');

const bg = (w) => {
  const snow = w.weather !== 'clear';
  const [lx] = proj(R, 0, R.rows), [rx] = proj(R, R.cols, 0), [, fy] = proj(R, R.cols, R.rows);
  const [fcx, fcy] = proj(R, 1.5, 3.5);
  return svg(1600, 900, `
  <defs>
    <radialGradient id="cb-bd" cx="50%" cy="55%" r="70%"><stop offset="0" stop-color="#F4F6FC"/><stop offset="1" stop-color="#D3D9EE"/></radialGradient>
    <pattern id="cb-wl" width="240" height="36" patternUnits="userSpaceOnUse" patternTransform="matrix(1,-0.5,0,1,0,0)">${logs('#DDB083')}</pattern>
    <pattern id="cb-wr" width="240" height="36" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,0,1,0,0)">${logs('#D2A273')}</pattern>
    <linearGradient id="cb-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".6"/><stop offset="1" stop-color="#FFF6DA" stop-opacity="0"/></linearGradient>
    <radialGradient id="cb-fire"><stop offset="0" stop-color="#FFC27A" stop-opacity=".55"/><stop offset="1" stop-color="#FFC27A" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#cb-bd)"/>
  ${snow ? `<g opacity=".9">${flakes(70, 1600, 900, 3)}</g>` : `<circle cx="1420" cy="120" r="120" fill="#FFF6D2" opacity=".35"/><circle cx="1420" cy="120" r="56" fill="#FFF3C4" opacity=".9"/>`}
  <ellipse cx="${(lx + rx) / 2}" cy="${fy + 6}" rx="580" ry="46" fill="#3E3252" opacity=".10"/>
  ${roomShell(R, { floor: '#C9976A', floorLines: 'planks', wallL: '#DDB083', wallR: '#D2A273', wallPatternL: 'cb-wl', wallPatternR: 'cb-wr', base: '#A87A5A' })}
  <polygon points="${pp([proj(R, 1.85, 0.05), proj(R, 4.05, 0.05), proj(R, 5.8, 3.2), proj(R, 3.6, 3.2)])}" fill="url(#cb-light)" opacity="${snow ? 0.4 : 1}"/>
  <ellipse cx="${fcx}" cy="${fcy}" rx="230" ry="120" fill="url(#cb-fire)"/>`);
};

// ---------- windows & wall things ----------
const windowBody = (curtain) => (it, sp, api) => {
  const snow = api?.state.winterWeather !== 'clear';
  const w = sp.len, h = 160;
  return `<rect width="${w}" height="${h}" rx="6" fill="${snow ? '#B7C2DA' : '#BFE3FA'}" ${line}/>
    ${snow ? '' : `<circle cx="${w * 0.76}" cy="38" r="17" fill="#FFF6D2"/><path d="M14 46 q12 -12 26 -4 q10 -10 24 0 q12 0 10 10 z" fill="#fff" opacity=".9"/>`}
    <path d="M0 ${h * 0.68} Q${w * 0.3} ${h * 0.56} ${w * 0.6} ${h * 0.66} T${w} ${h * 0.6} V${h} H0 Z" fill="#fff"/>
    ${pine(w * 0.26, h * 0.32, 0.3)}${pine(w * 0.7, h * 0.4, 0.23)}
    ${snow ? Array.from({ length: 16 }, (_, i) => `<circle cx="${(6 + (i * 41) % (w - 12)).toFixed(1)}" cy="${8 + (i * 59) % (h - 30)}" r="${2 + (i % 3)}" fill="#fff"/>`).join('') : ''}
    <path d="M${w / 2} 0 V${h} M0 ${h / 2} H${w}" stroke="${CREAM}" stroke-width="6"/>
    <rect x="-6" y="${h - 4}" width="${w + 12}" height="12" rx="3" fill="${CREAM}" ${line}/>
    <path d="M-14 -10 Q${w * 0.14} ${h * 0.45} -4 ${h + 2} L-16 ${h + 2} Z" fill="${curtain}" ${line}/>
    <path d="M${w + 14} -10 Q${w * 0.86} ${h * 0.45} ${w + 4} ${h + 2} L${w + 16} ${h + 2} Z" fill="${curtain}" ${line}/>
    <rect x="-22" y="-16" width="${w + 44}" height="9" rx="4" fill="${WOOD_D}" ${line}/>`;
};

// ---------- the fireplace (fixed, roars when tapped) ----------
const fireplace = () => {
  const stone = shades('#BCC3D6'), mantel = shades(WOOD_D), hearth = shades('#A9A3B8');
  const D = 2.0 * 64, H = 292, fb = H - 10; // firebox floor (y in face coords)
  const stockings = [[14, '#E58F6A'], [38, TEAL], [90, LILAC], [114, SUN]].map(([x, c]) => `<path d="M${x} 150 V172 L${x - 8} 182 Q${x - 11} 192 ${x - 1} 191 L${x + 9} 180 V150 Z" fill="${c}" ${line}/><rect x="${x - 2}" y="150" width="14" height="8" rx="3" fill="#fff" ${line}/>`).join('');
  const face = `${stones(D, H)}
    <path d="M28 ${fb} V${fb - 52} Q28 ${fb - 92} 64 ${fb - 92} Q100 ${fb - 92} 100 ${fb - 52} V${fb} Z" fill="#3E3450" ${line}/>
    <path d="M36 ${fb} V${fb - 50} Q36 ${fb - 82} 64 ${fb - 82} Q92 ${fb - 82} 92 ${fb - 50} V${fb} Z" fill="#4A3E5E"/>
    <path d="M42 ${fb - 6} H86" stroke="${WOOD_D}" stroke-width="9" stroke-linecap="round"/><path d="M46 ${fb - 14} L82 ${fb - 4} M82 ${fb - 14} L46 ${fb - 4}" stroke="#A87A5A" stroke-width="7" stroke-linecap="round"/>
    <g class="flame"><path d="M64 ${fb - 12} C46 ${fb - 20} 50 ${fb - 44} 59 ${fb - 56} C59 ${fb - 44} 66 ${fb - 46} 65 ${fb - 60} C78 ${fb - 48} 82 ${fb - 28} 64 ${fb - 12} Z" fill="#F0A060"/><path d="M64 ${fb - 12} C55 ${fb - 17} 56 ${fb - 30} 62 ${fb - 38} C63 ${fb - 30} 68 ${fb - 32} 67 ${fb - 38} C73 ${fb - 30} 73 ${fb - 18} 64 ${fb - 12} Z" fill="${SUN}"/></g>
    <g class="flame big-flame"><path d="M64 ${fb - 10} C36 ${fb - 20} 40 ${fb - 62} 57 ${fb - 78} C56 ${fb - 60} 68 ${fb - 64} 66 ${fb - 84} C88 ${fb - 62} 92 ${fb - 26} 64 ${fb - 10} Z" fill="#F0A060" opacity=".75"/></g>
    ${stockings}
    <circle cx="64" cy="70" r="26" fill="none" stroke="#5FAE8A" stroke-width="12"/><circle cx="64" cy="70" r="26" fill="none" stroke="${PINE}" stroke-width="4" stroke-dasharray="3 5"/>
    ${[[45, 58], [83, 60], [52, 92], [78, 88]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4" fill="${[SUN, LILAC, TEAL, SUN][i]}"/>`).join('')}<path d="M55 44 l9 7 9 -7 v13 l-9 -6 -9 6 z" fill="${LILAC}" ${line}/>`;
  return isoItem(1.15, 2.4, 292, [
    { u: 0, v: 0.2, w: 0.85, d: 2.0, h: H, ...stone, rightDecor: face, leftDecor: stones(0.85 * 64, H) },
    { u: 0.85, v: 0, w: 0.3, d: 2.4, h: 8, ...hearth },
    { u: 0.7, v: 0.1, w: 0.4, d: 2.2, z: 144, h: 14, ...mantel, rightDecor: `<path d="M4 4 H${2.2 * 64 - 4}" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>` },
  ], () => {
    const [c1x, c1y] = at(0.95, 0.5, 158), [c2x, c2y] = at(0.95, 0.75, 158), [kx, ky] = at(0.92, 1.9, 158), [px, py] = at(0.95, 1.45, 158);
    const candle = (x, y, hh, c) => `<rect x="${x - 4}" y="${y - hh}" width="8" height="${hh}" rx="2" fill="${c}" ${line}/><circle cx="${x}" cy="${y - hh - 7}" r="8" fill="#FFE9A0" opacity=".45"/><path d="M${x} ${y - hh - 12} Q${x + 4} ${y - hh - 6} ${x} ${y - hh - 2} Q${x - 4} ${y - hh - 6} ${x} ${y - hh - 12} Z" fill="#F7C35F"/>`;
    return `${candle(c1x, c1y, 24, CREAM)}${candle(c2x, c2y, 16, SKY)}
      <path d="M${px - 9} ${py} q-2 -14 9 -22 q11 8 9 22 z" fill="#A87A5A" ${line}/><path d="M${px - 6} ${py - 6} h12 M${px - 7} ${py - 12} h14" stroke="#7A5638" stroke-width="2"/>
      <rect x="${kx - 14}" y="${ky - 36}" width="28" height="36" rx="5" fill="${CREAM}" ${line}/><circle cx="${kx}" cy="${ky - 20}" r="10" fill="#fff" ${line}/><path d="M${kx} ${ky - 20} V${ky - 27} M${kx} ${ky - 20} H${kx + 5}" stroke="#3E3252" stroke-width="1.6"/>`;
  });
};

// ---------- the decorated tree (lights on/off) ----------
const tree = (it) => {
  const on = it?.data.on;
  const pot = shades(LILAC);
  const band = `<path d="M0 12 H${0.7 * 64}" stroke="#fff" stroke-opacity=".55" stroke-width="4"/><path d="M0 24 H${0.7 * 64}" stroke="${SUN}" stroke-width="3"/>`;
  return isoItem(1.7, 1.7, 320, [
    { u: 0.5, v: 0.5, w: 0.7, d: 0.7, h: 36, ...pot, leftDecor: band, rightDecor: band },
    P(0.85, 0.85, 36, (cx, cy) => {
      const tiers = [[cy - 12, cy - 112, 106], [cy - 82, cy - 172, 86], [cy - 144, cy - 228, 64], [cy - 202, cy - 272, 42]];
      const cols = [SUN, TEAL, LILAC, SKY, '#F0B39A'];
      let s = `<rect x="${cx - 8}" y="${cy - 26}" width="16" height="24" fill="${WOOD_D}" ${line}/>`;
      tiers.forEach(([yb, yt, hw], i) => {
        s += `<path d="M${cx} ${yt} L${cx + hw} ${yb - 8} Q${cx + hw * 0.5} ${yb + 10} ${cx} ${yb + 4} Q${cx - hw * 0.5} ${yb + 10} ${cx - hw} ${yb - 8} Z" fill="${PINE}" ${line}/>
          <path d="M${cx} ${yt} L${cx - hw} ${yb - 8} Q${cx - hw * 0.5} ${yb + 10} ${cx} ${yb + 4} Z" fill="#5FB08C"/>
          <path d="M${cx - hw * 0.62} ${yb - 4} Q${cx - hw * 0.3} ${yb + 3} ${cx - hw * 0.1} ${yb + 2}" stroke="#7FC6A2" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        const g0 = [cx - hw * 0.82, yb - 22], g1 = [cx, yb - 2 + (i % 2) * 6], g2 = [cx + hw * 0.82, yb - 26];
        s += `<path d="M${g0[0]} ${g0[1]} Q${g1[0]} ${g1[1] + 14} ${g2[0]} ${g2[1]}" stroke="#3E3252" stroke-opacity=".45" stroke-width="1.4" fill="none"/>`;
        [0.15, 0.38, 0.62, 0.85].forEach((t, k) => {
          const [bx, by] = quad(g0, [g1[0], g1[1] + 14], g2, t), c = cols[(i + k) % 5];
          s += `${on ? `<circle cx="${bx}" cy="${by + 4}" r="11" fill="${c}" opacity=".4"/>` : ''}<ellipse cx="${bx}" cy="${by + 4}" rx="4.5" ry="6" fill="${on ? c : '#D8D2E6'}" ${line}/>`;
        });
      });
      [[-46, -50, '#E58F6A'], [40, -60, SUN], [-20, -126, SKY], [30, -118, LILAC], [-8, -196, TEAL], [64, -24, LILAC], [-76, -30, TEAL]].forEach(([dx, dy, c]) => {
        s += `<circle cx="${cx + dx}" cy="${cy + dy}" r="8" fill="${c}" ${line}/><circle cx="${cx + dx - 2.5}" cy="${cy + dy - 2.5}" r="2.4" fill="#fff" opacity=".75"/>`;
      });
      s += `${on ? `<circle cx="${cx}" cy="${cy - 280}" r="34" fill="#FFF3B0" opacity=".45"/>` : ''}${starPath(cx, cy - 282, 21, on ? '#F7D24A' : '#E8DCA0', 'stroke="#3E3252" stroke-opacity=".6" stroke-width="2" stroke-linejoin="round"')}`;
      return s;
    }),
  ]);
};

// ---------- presents under the tree ----------
const presentArt = (it) => {
  const { open, color, ribbon } = it?.data || { color: LILAC, ribbon: SUN };
  const box = shades(color), lid = shades(color, 0.6);
  const bandL = `<rect x="${0.27 * 64 - 4}" y="0" width="8" height="40" fill="${ribbon}"/>`;
  return isoItem(0.62, 0.62, 96, [
    { u: 0.04, v: 0.04, w: 0.54, d: 0.54, h: 40, ...box, top: open ? '#5E4E7E' : box.top, leftDecor: bandL, rightDecor: bandL },
    ...(open
      ? [{ u: 0.02, v: -0.04, w: 0.58, d: 0.07, z: 40, h: 40, ...lid, leftDecor: `<rect x="${0.29 * 64 - 4}" y="0" width="8" height="40" fill="${ribbon}"/>` },
         P(0.32, 0.3, 40, (x, y) => `<path d="M${x - 10} ${y - 2} q4 -12 10 -4 q6 -10 10 4 z" fill="#fff" opacity=".8"/>`)]
      : [{ u: 0, v: 0, w: 0.62, d: 0.62, z: 40, h: 10, ...lid, topDecor: `<rect x=".27" y="0" width=".08" height=".62" fill="${ribbon}"/><rect x="0" y=".27" width=".62" height=".08" fill="${ribbon}"/>`,
          leftDecor: `<rect x="${0.31 * 64 - 4}" y="0" width="8" height="10" fill="${ribbon}"/>`, rightDecor: `<rect x="${0.31 * 64 - 4}" y="0" width="8" height="10" fill="${ribbon}"/>` },
         P(0.31, 0.31, 50, (x, y) => `<path d="M${x} ${y} C${x - 18} ${y - 20} ${x - 26} ${y - 4} ${x - 6} ${y + 2} Z M${x} ${y} C${x + 18} ${y - 20} ${x + 26} ${y - 4} ${x + 6} ${y + 2} Z" fill="${ribbon}" ${line}/><circle cx="${x}" cy="${y}" r="4.5" fill="${ribbon}" ${line}/>`)]),
  ]);
};
const present = (id, gx, gy, color, ribbon, prize) => I(id, gx, gy, 0.62, 0.62, presentArt, {
  data: { open: false, color, ribbon },
  onTap: (it, api) => {
    const bx = it.x + it.w / 2;
    if (it.data.open) { api.bubble(bx, it.y - 6, 'Already opened!'); return; }
    it.data.open = true; api.setArt(it); api.sfx.pop();
    api.sparkle(bx, it.y + 30, ['🎁', '✨', '❄️']);
    const spot = { gx: Math.min(R.cols - 0.45, it.gx + 0.1), gy: Math.min(R.rows - 0.45, it.gy + 0.7) };
    if (prize === 'star') {
      if (!api.starFound('cabin-present')) api.addStar('cabin-present', 0, 0, { spawned: true, gx: it.gx + 0.11, gy: it.gy + 0.11, gz: 44 });
      else api.bubble(bx, it.y - 6, 'A shiny ornament! ✨');
    } else if (prize === 'beanie') {
      api.add(wearable('beanie', 0, 0, api.uid('beanie'), spot), { spawned: true });
      api.bubble(bx, it.y - 6, 'A cozy beanie! Put it on someone 🧶');
    } else {
      api.add(wearable('scarf', 0, 0, api.uid('scarf'), spot), { spawned: true });
      api.bubble(bx, it.y - 6, 'A warm scarf! 🧣');
    }
  },
});

// ---------- the iron stove (makes cocoa) ----------
const stove = () => {
  const iron = shades('#4A5468'), leg = shades('#3A4256');
  const door = `<rect x="10" y="18" width="44" height="42" rx="6" fill="#2E2A3A"/><path d="M14 56 Q32 24 50 56 Z" fill="#F0A060"/><path d="M21 56 Q32 36 43 56 Z" fill="${SUN}"/>
    <rect x="10" y="18" width="44" height="42" rx="6" fill="none" ${line}/><path d="M32 18 V60" stroke="#5A6478" stroke-width="3"/><rect x="50" y="34" width="8" height="5" rx="2" fill="#C9A57C"/>
    ${[8, 22, 36, 50].map((x) => `<circle cx="${x + 2}" cy="8" r="2" fill="#7A8498"/>`).join('')}`;
  return isoItem(1.1, 1.0, 292, [
    ...[[0.1, 0.1], [0.85, 0.1], [0.1, 0.75], [0.85, 0.75]].map(([u, v]) => ({ u, v, w: 0.12, d: 0.12, h: 16, ...leg })),
    { u: 0.05, v: 0.05, w: 1.0, d: 0.9, z: 16, h: 94, ...iron, leftDecor: door,
      rightDecor: `${[16, 28, 40].map((y) => `<path d="M12 ${y} H${0.9 * 64 - 12}" stroke="#2E3444" stroke-width="4" stroke-linecap="round"/>`).join('')}` },
    { u: 0, v: 0, w: 1.1, d: 1.0, z: 110, h: 10, ...shades('#3A4256') },
    { u: 0.12, v: 0.12, w: 0.22, d: 0.22, z: 120, h: 172, ...shades('#5A6478') },
    P(0.75, 0.65, 120, (x, y) => `<g class="steam"><path d="M${x - 8} ${y - 44} q-6 -10 0 -20 M${x + 8} ${y - 44} q-6 -10 0 -20" stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".75"/></g>
      <path d="M${x - 24} ${y - 4} V${y - 32} H${x + 24} V${y - 4} Q${x} ${y + 7} ${x - 24} ${y - 4} Z" fill="#E58F6A" ${line}/>
      <path d="M${x - 24} ${y - 22} h-8 M${x + 24} ${y - 22} h8" stroke="#3E3252" stroke-opacity=".6" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="${x}" cy="${y - 32}" rx="24" ry="8" fill="#F0A584" ${line}/><ellipse cx="${x}" cy="${y - 32}" rx="18" ry="5" fill="#8B5A3C"/>
      <rect x="${x - 8}" y="${y - 37}" width="7" height="6" rx="2" fill="#fff"/><rect x="${x + 2}" y="${y - 36}" width="7" height="6" rx="2" fill="${CREAM}"/>`, 0.3, 0.3),
    P(0.35, 0.72, 120, (x, y) => `<path d="M${x - 16} ${y - 2} Q${x - 18} ${y - 26} ${x} ${y - 28} Q${x + 18} ${y - 26} ${x + 16} ${y - 2} Z" fill="${TEAL}" ${line}/>
      <path d="M${x + 15} ${y - 16} q14 -4 16 -14" stroke="#3E3252" stroke-opacity=".6" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M${x - 8} ${y - 30} q8 -12 16 0" stroke="#3E3252" stroke-opacity=".6" stroke-width="3" fill="none"/>`, 0.2, 0.2),
  ]);
};

// ---------- furniture ----------
const armchair = () => {
  const body = shades('#9A80D8'), cushion = shades('#AE98E4'), leg = shades(WOOD_D);
  const throwRug = `<path d="M6 0 V30 L11 38 L16 30 L21 38 L26 30 V0 Z" fill="${TEAL}" ${line}/><path d="M6 9 H26 M6 21 H26" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>`;
  return isoItem(1.3, 1.3, 130, [
    ...[[0.1, 0.1], [1.08, 0.1], [0.1, 1.08], [1.08, 1.08]].map(([u, v]) => ({ u, v, w: 0.12, d: 0.12, h: 12, ...leg })),
    { u: 0.05, v: 0.05, w: 1.2, d: 1.2, z: 12, h: 34, ...body },
    { u: 0.05, v: 0.05, w: 1.2, d: 0.34, z: 46, h: 84, ...body, leftDecor: `<path d="M12 10 Q${0.6 * 64} 0 ${1.2 * 64 - 12} 10" stroke="#fff" stroke-opacity=".35" stroke-width="4" fill="none"/>` },
    { u: 0.3, v: 0.36, w: 0.7, d: 0.82, z: 46, h: 14, ...cushion },
    { u: 0.05, v: 0.3, w: 0.26, d: 0.95, z: 46, h: 34, ...body },
    { u: 0.99, v: 0.3, w: 0.26, d: 0.95, z: 46, h: 34, ...body, rightDecor: throwRug },
    P(0.62, 0.48, 60, (x, y) => `<path d="M${x - 26} ${y + 6} Q${x - 30} ${y - 26} ${x} ${y - 30} Q${x + 30} ${y - 26} ${x + 26} ${y + 6} Q${x} ${y + 14} ${x - 26} ${y + 6} Z" fill="${SUN}" ${line}/>
      <path d="M${x - 14} ${y - 12} Q${x} ${y - 4} ${x + 14} ${y - 12}" stroke="#fff" stroke-opacity=".6" stroke-width="3" fill="none" stroke-linecap="round"/>`, 0.3, 0.3),
  ]);
};
const coffeeTable = () => {
  const top = shades('#D9B48A'), leg = shades(WOOD_D);
  return isoItem(1.4, 0.9, 54, [
    ...[[0.08, 0.08], [1.2, 0.08], [0.08, 0.7], [1.2, 0.7]].map(([u, v]) => ({ u, v, w: 0.12, d: 0.12, h: 42, ...leg })),
    { u: 0.1, v: 0.1, w: 1.2, d: 0.7, z: 14, h: 5, ...shades('#B98A5E') },
    { u: 0, v: 0, w: 1.4, d: 0.9, z: 42, h: 10, ...top, topDecor: '<path d="M.1 .3 H1.3 M.1 .6 H1.3" stroke="#B98A5E" stroke-opacity=".35" stroke-width=".03"/>' },
  ]);
};
const hutch = () => {
  const c = shades('#9CC8EE', 0.8), wood = shades('#EADBC5');
  const plates = (y) => [16, 46, 76].map((x, i) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="12" fill="#fff" ${line}/><ellipse cx="${x}" cy="${y}" rx="7" ry="7" fill="none" stroke="${[SKY, TEAL, LILAC][i]}" stroke-width="3"/>`).join('');
  const jars = (y) => [[14, SUN], [38, '#E58F6A'], [62, TEAL], [86, LILAC]].map(([x, col]) => `<rect x="${x - 8}" y="${y - 22}" width="16" height="22" rx="4" fill="#fff" fill-opacity=".8" ${line}/><rect x="${x - 6}" y="${y - 14}" width="12" height="12" rx="3" fill="${col}"/><rect x="${x - 9}" y="${y - 26}" width="18" height="6" rx="2" fill="${WOOD}" ${line}/>`).join('');
  const D = 1.7 * 64;
  return isoItem(0.75, 1.7, 210, [
    { u: 0, v: 0, w: 0.75, d: 1.7, h: 84, ...wood,
      rightDecor: `<rect x="8" y="10" width="${D / 2 - 12}" height="66" rx="4" fill="none" ${line}/><rect x="${D / 2 + 4}" y="10" width="${D / 2 - 12}" height="66" rx="4" fill="none" ${line}/>
        <circle cx="${D / 2 - 10}" cy="42" r="3" fill="${WOOD_D}"/><circle cx="${D / 2 + 10}" cy="42" r="3" fill="${WOOD_D}"/>${starPath(D / 4, 42, 8, '#C9B8F2')}${starPath(D * 0.75, 42, 8, '#9EDDD4')}` },
    { u: 0, v: 0, w: 0.75, d: 1.7, z: 84, h: 6, ...shades('#D8C6AC') },
    { u: 0, v: 0.05, w: 0.4, d: 1.6, z: 90, h: 112, ...c,
      rightDecor: `<rect x="4" y="4" width="${1.6 * 64 - 8}" height="104" fill="#E6F0F8"/><path d="M4 54 H${1.6 * 64 - 4}" stroke="${WOOD}" stroke-width="5"/>${plates(30)}${jars(100)}` },
    { u: -0.02, v: 0.02, w: 0.46, d: 1.66, z: 202, h: 8, ...wood },
  ]);
};
const dogbed = () => isoItem(1.2, 1.0, 70, [
  { u: 0.05, v: 0.05, w: 1.1, d: 0.9, h: 22, round: true, ...shades(LILAC), top: '#C9B8F2' },
  P(0.6, 0.5, 18, (x, y) => `<ellipse cx="${x}" cy="${y}" rx="52" ry="22" fill="${CREAM}" ${line}/>
    <ellipse cx="${x + 8}" cy="${y - 10}" rx="34" ry="18" fill="#F3E3C8" ${line}/>
    <path class="tail" d="M${x + 38} ${y - 10} Q${x + 58} ${y - 18} ${x + 52} ${y - 34}" stroke="#C99772" stroke-width="7" fill="none" stroke-linecap="round"/>
    <circle cx="${x - 24}" cy="${y - 16}" r="17" fill="#F3E3C8" ${line}/>
    <path d="M${x - 38} ${y - 28} Q${x - 46} ${y - 12} ${x - 36} ${y - 2} Q${x - 30} ${y - 12} ${x - 30} ${y - 24} Z" fill="#C99772" ${line}/>
    <path d="M${x - 28} ${y - 18} q3 -3 6 0 M${x - 18} ${y - 18} q3 -3 6 0" stroke="#3E3252" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <ellipse cx="${x - 22}" cy="${y - 10}" rx="3.5" ry="2.5" fill="#3E3252"/>
    <text x="${x + 18}" y="${y - 36}" font-family="Fredoka, sans-serif" font-size="14" fill="#7A64B0" opacity=".8">z</text><text x="${x + 28}" y="${y - 48}" font-family="Fredoka, sans-serif" font-size="11" fill="#7A64B0" opacity=".6">z</text>`, 0.4, 0.4),
]);
const rug = () => isoItem(3.6, 3.0, 4, [
  { u: 0, v: 0, w: 3.6, d: 3.0, h: 0, round: true, top: '#E9A36B',
    topDecor: `<ellipse cx="1.8" cy="1.5" rx="1.5" ry="1.25" fill="${SUN}"/><ellipse cx="1.8" cy="1.5" rx="1.18" ry=".98" fill="#9EDDD4"/><ellipse cx="1.8" cy="1.5" rx=".82" ry=".68" fill="#C9B8F2"/>
      <ellipse cx="1.8" cy="1.5" rx=".46" ry=".38" fill="${CREAM}"/><ellipse cx="1.8" cy="1.5" rx="1.34" ry="1.11" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width=".04" stroke-dasharray=".14 .1"/>` },
]);
const logBasket = () => isoItem(0.8, 0.8, 90, [
  { u: 0.06, v: 0.06, w: 0.68, d: 0.68, h: 40, ...shades('#C9A57C'),
    leftDecor: `<path d="M0 12 H44 M0 26 H44" stroke="#9E7A56" stroke-width="2"/>`, rightDecor: `<path d="M0 12 H44 M0 26 H44" stroke="#9E7A56" stroke-width="2"/>` },
  P(0.4, 0.4, 40, (x, y) => [[-14, -4], [10, -2], [-2, -16], [-18, -20], [16, -18]].map(([dx, dy]) => `<g transform="translate(${x + dx} ${y + dy}) rotate(-26)"><rect x="-18" y="-7" width="36" height="14" rx="7" fill="#A87A5A" ${line}/><ellipse cx="18" cy="0" rx="5" ry="7" fill="#E8C19A" ${line}/></g>`).join(''), 0.3, 0.3),
]);
const floorLamp = (it) => isoItem(0.6, 0.6, 220, [
  { u: 0.1, v: 0.1, w: 0.4, d: 0.4, h: 8, ...shades(WOOD_D) },
  { u: 0.27, v: 0.27, w: 0.06, d: 0.06, z: 8, h: 166, ...shades(WOOD_D) },
  P(0.3, 0.3, 174, (cx, cy) => `${it?.data.on ? `<circle cx="${cx}" cy="${cy}" r="120" fill="#FFF3B0" opacity=".26"/>` : ''}<path d="M${cx - 34} ${cy + 10} L${cx - 20} ${cy - 34} H${cx + 20} L${cx + 34} ${cy + 10} Z" fill="${it?.data.on ? '#FFF0A0' : TEAL}" ${line}/><path d="M${cx - 30} ${cy + 2} H${cx + 30}" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`, 0.6, 0.6),
]);
const yarn = () => isoItem(0.5, 0.5, 60, [
  { u: 0.05, v: 0.05, w: 0.4, d: 0.4, h: 22, ...shades('#C9A57C'), leftDecor: '<path d="M0 8 H26 M0 15 H26" stroke="#9E7A56" stroke-width="1.6"/>' },
  P(0.25, 0.25, 22, (x, y) => `<circle cx="${x - 8}" cy="${y - 8}" r="11" fill="${TEAL}" ${line}/><circle cx="${x + 8}" cy="${y - 6}" r="10" fill="${SUN}" ${line}/><circle cx="${x}" cy="${y - 18}" r="10" fill="${LILAC}" ${line}/>
    <path d="M${x - 14} ${y - 12} q6 6 12 0 M${x + 3} ${y - 22} q6 6 12 0" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" fill="none"/><path d="M${x + 4} ${y - 30} L${x + 20} ${y - 44} M${x + 8} ${y - 28} L${x + 26} ${y - 38}" stroke="${WOOD_D}" stroke-width="2.4" stroke-linecap="round"/>`, 0.3, 0.3),
]);
const slippers = () => isoItem(0.5, 0.4, 20, [
  P(0.25, 0.2, 0, (x, y) => `<ellipse cx="${x - 9}" cy="${y}" rx="8" ry="14" fill="${SKY}" transform="rotate(-50 ${x - 9} ${y})" ${line}/><ellipse cx="${x + 9}" cy="${y + 4}" rx="8" ry="14" fill="${SKY}" transform="rotate(-50 ${x + 9} ${y + 4})" ${line}/>
    <circle cx="${x - 15}" cy="${y - 4}" r="4" fill="#fff"/><circle cx="${x + 3}" cy="${y}" r="4" fill="#fff"/>`, 0.4, 0.3),
]);

const coatRack = () => isoItem(0.6, 0.6, 230, [
  { u: 0.1, v: 0.1, w: 0.4, d: 0.4, h: 8, ...shades(WOOD_D) },
  { u: 0.26, v: 0.26, w: 0.08, d: 0.08, z: 8, h: 200, ...shades(WOOD) },
  P(0.3, 0.3, 200, (x, y) => `<path d="M${x} ${y} l-20 -10 M${x} ${y} l20 -10 M${x} ${y + 4} l-16 12 M${x} ${y + 4} l16 12" stroke="${WOOD_D}" stroke-width="4" stroke-linecap="round"/><circle cx="${x}" cy="${y - 6}" r="6" fill="${WOOD}" ${line}/>
    <path d="M${x + 14} ${y + 14} Q${x + 30} ${y + 20} ${x + 30} ${y + 60} L${x + 26} ${y + 118} H${x - 4} L${x + 2} ${y + 40} Q${x + 2} ${y + 18} ${x + 14} ${y + 14} Z" fill="${SKY}" ${line}/><path d="M${x + 10} ${y + 40} V${y + 112}" stroke="#7FA8D6" stroke-width="2"/>
    <path d="M${x - 14} ${y + 14} q-10 14 -6 50 l10 2 q2 -30 6 -48 z" fill="${SUN}" ${line}/><path d="M${x - 19} ${y + 54} l10 2 M${x - 19} ${y + 46} l10 2" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>
    <path d="M${x - 22} ${y - 8} Q${x - 22} ${y - 34} ${x - 2} ${y - 34} Q${x + 18} ${y - 34} ${x + 18} ${y - 8} Z" fill="${TEAL}" ${line}/><circle cx="${x - 2}" cy="${y - 38}" r="7" fill="${CREAM}" ${line}/>`, 0.6, 0.6),
]);
const boots = () => isoItem(0.5, 0.4, 50, [
  P(0.25, 0.2, 0, (x, y) => [[-10, 0], [10, 6]].map(([dx, dy]) => `<path d="M${x + dx - 8} ${y + dy} V${y + dy - 30} H${x + dx + 6} V${y + dy - 10} Q${x + dx + 18} ${y + dy - 8} ${x + dx + 18} ${y + dy} Z" fill="#7A64B0" ${line}/><rect x="${x + dx - 10}" y="${y + dy - 36}" width="18" height="8" rx="4" fill="${CREAM}" ${line}/>`).join(''), 0.4, 0.3),
]);
const sled = () => {
  const wood = shades('#D9A877'), run = shades(LILAC);
  return isoItem(1.4, 0.6, 50, [
    { u: 0.1, v: 0.05, w: 1.2, d: 0.08, h: 8, ...run }, { u: 0.1, v: 0.47, w: 1.2, d: 0.08, h: 8, ...run },
    ...[0.25, 0.65, 1.05].map((u) => ({ u, v: 0.06, w: 0.06, d: 0.48, z: 8, h: 14, ...shades(WOOD_D) })),
    { u: 0.12, v: 0.02, w: 1.18, d: 0.56, z: 22, h: 7, ...wood, topDecor: '<path d="M.1 .19 H1.1 M.1 .37 H1.1" stroke="#B98A5E" stroke-width=".03"/>' },
    P(1.3, 0.05, 8, (x, y) => `<path d="M${x} ${y} q20 -6 16 -26" stroke="#9A80D8" stroke-width="5" fill="none" stroke-linecap="round"/>`),
    P(1.3, 0.53, 8, (x, y) => `<path d="M${x} ${y} q20 -6 16 -26" stroke="#9A80D8" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M${x + 14} ${y - 24} Q${x + 60} ${y - 40} ${x + 40} ${y - 4}" stroke="${SUN}" stroke-width="3" fill="none"/>`, 0.1, 0.1),
  ]);
};
const mat = () => isoItem(1.3, 1.0, 4, [
  { u: 0, v: 0, w: 1.3, d: 1.0, h: 0, top: TEAL, topDecor: `<rect x=".08" y=".08" width="1.14" height=".84" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width=".04" stroke-dasharray=".1 .06"/>${[0.3, 0.65, 1.0].map((x) => `<path d="M${x} .25 l.08 .25 l-.08 .25 l-.08 -.25 z" fill="${SUN}"/>`).join('')}` },
]);

const I = isoDef;
const W = (...a) => wallDef(R, ...a);

export const CABIN = {
  id: 'cabin', posKey: 'cabin-iso', title: 'Cozy Cabin 🏡', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, light: 'iso',
  avatar: [3.9, 4.7],
  frame: '#DCE1F1',
  iso: R,
  bg,
  onWeather: (api) => api.setArt(api.get('window')),
  stars: [{ id: 'cabin-chair', gx: 2.62, gy: 1.85 }],
  characters: [{ id: 'grandpa', look: NPC_WINTER.grandpa, gx: 5.7, gy: 3.7, say: ["Welcome in! I'm Grandpa Ole ❄️", 'Warm your hands by the fire!', 'Someone left presents under the tree... 🎁', 'Cocoa is on the stove!'] }],
  items: [
    W('lights', 'R', 0.2, 286, 6.6, 40, (it, sp) => stringLights(4, sp.len - 4, 6, 14)),
    W('lightsL', 'L', 0.3, 286, 6.4, 40, (it, sp) => stringLights(4, sp.len - 4, 6, 12)),
    W('window', 'R', 1.85, 252, 2.2, 160, windowBody(LILAC)),
    W('clock', 'R', 0.2, 250, 0.5, 40, (it, sp) => `<ellipse cx="${sp.len / 2}" cy="20" rx="${sp.len / 2}" ry="20" fill="${CREAM}" ${line}/><ellipse cx="${sp.len / 2}" cy="20" rx="${sp.len / 2 - 5}" ry="15" fill="none" stroke="${WOOD}" stroke-width="2"/><path d="M${sp.len / 2} 20 V8 M${sp.len / 2} 20 H${sp.len / 2 + 9}" stroke="#3E3252" stroke-width="2.5"/>`,
      { onTap: (it, api) => { bump(it, 'boing'); api.sfx.click(); api.bubble(it.x + it.w / 2, it.y, 'Tick tock… cocoa o’clock! ☕'); } }),
    W('frame1', 'R', 0.85, 246, 0.75, 64, (it, sp) => `<rect width="${sp.len}" height="64" rx="4" fill="${WOOD_D}" ${line}/><rect x="5" y="5" width="${sp.len - 10}" height="54" fill="#CFE4F6"/><path d="M5 50 L18 26 L28 38 L38 20 L${sp.len - 5} 50 Z" fill="#fff"/><path d="M5 59 V50 H${sp.len - 5} V59 Z" fill="${TEAL}"/>`),
    W('frame2', 'R', 0.3, 170, 0.55, 50, (it, sp) => `<rect width="${sp.len}" height="50" rx="4" fill="${CREAM}" ${line}/><g transform="translate(${sp.len / 2} 25)"><path d="M-12 0 H12 M-6 -10 L6 10 M6 -10 L-6 10" stroke="${SKY}" stroke-width="3" stroke-linecap="round"/></g>`),
    W('sign', 'L', 5.0, 252, 1.5, 84, (it, sp) => `<rect width="${sp.len}" height="84" rx="6" fill="${CREAM}" stroke="${WOOD_D}" stroke-width="5"/>${text(sp.len / 2, 38, 'Home', 24, '#7A64B0')}${text(sp.len / 2, 66, 'sweet home', 16, '#3E9C94', 500)}${starPath(sp.len - 14, 14, 6, SUN)}`),
    W('shelf', 'L', 5.0, 150, 1.5, 66, (it, sp) => `<rect y="56" width="${sp.len}" height="9" rx="2" fill="${WOOD_D}" ${line}/>
      <rect x="10" y="10" width="16" height="46" fill="${LILAC}" ${line}/><rect x="27" y="18" width="13" height="38" fill="${TEAL}" ${line}/><rect x="41" y="8" width="16" height="48" fill="${SUN}" ${line}/>
      <path d="M68 56 V34 Q68 24 80 24 Q92 24 92 34 V56 Z" fill="${CREAM}" ${line}/><path d="M74 30 Q80 18 86 30" stroke="#E58F6A" stroke-width="3" fill="none"/>`),

    I('rug', 2.3, 2.4, 3.6, 3.0, rug, { floor: true }),
    I('hutch', 0.05, 0.15, 0.75, 1.7, hutch),
    I('fireplace', 0, 2.3, 1.15, 2.4, fireplace, { drag: false,
      onTap: (it, api) => { it.el.classList.add('roar'); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y + 40, 'So warm and toasty! 🔥'); api.later(() => it.el.classList.remove('roar'), 2500); } }),
    I('logs', 0.15, 5.05, 0.8, 0.8, logBasket),
    I('flamp', 4.25, 0.2, 0.6, 0.6, floorLamp, { data: { on: true }, onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); } }),
    I('armchair', 2.0, 1.2, 1.3, 1.3, armchair),
    I('table', 4.3, 1.75, 1.4, 0.9, coffeeTable, { surface: 52 }),
    I('stove', 5.0, 0.15, 1.1, 1.0, stove, { drag: false,
      onTap: (it, api) => {
        const n = api.count('cocoa');
        if (n >= 3) { api.bubble(it.x + it.w / 2, it.y + 60, 'Drink the cocoa first! ☕'); return; }
        api.sfx.pour();
        const t = api.get('table');
        food(api, 'cocoa', 0, 0, t ? { gx: t.gx + 0.12 + n * 0.42, gy: t.gy + 0.3, gz: t.def.surface } : { gx: it.gx + 0.1 + n * 0.35, gy: it.gy + 1.15 });
        api.bubble(it.x + it.w / 2, it.y + 60, 'Hot cocoa with marshmallows! ☕');
      } }),
    I('tree', 7.0, 0.2, 1.7, 1.7, tree, { drag: false, data: { on: true },
      onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); if (it.data.on) api.sparkle(it.x + it.w / 2, it.y + it.h * 0.4, ['✨', '⭐', '❄️']); } }),
    present('gift1', 6.3, 2.15, LILAC, SUN, 'beanie'),
    present('gift2', 7.35, 2.35, TEAL, CREAM, 'star'),
    present('gift3', 8.25, 1.95, '#E9A36B', '#9EDDD4', 'scarf'),
    I('dogbed', 1.35, 3.0, 1.2, 1.0, dogbed, { cls: 'squish',
      onTap: (it, api) => { bump(it, 'boing'); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y, pick(['Zzz... 💤', '*yawn* Woof!', '*snuggles*'])); } }),
    I('mat', 6.5, 5.7, 1.3, 1.0, mat, { floor: true }),
    I('rack', 8.25, 5.6, 0.6, 0.6, coatRack),
    I('sled', 4.3, 6.1, 1.4, 0.6, sled),
    // small things: drag them around and onto the coffee table
    I('yarn', 3.4, 2.75, 0.5, 0.5, yarn, { small: true }),
    I('slippers', 1.9, 2.75, 0.5, 0.4, slippers, { small: true }),
    I('boots', 6.95, 6.0, 0.5, 0.4, boots, { small: true }),
  ],
};
