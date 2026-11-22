// Pet Shop (isometric dollhouse room): adopt a pet from the baskets and pens, feed treats and kibble,
// play with toys, tap the aquarium and the bird cage.
import { room, roomShell, isoItem, at, shades, proj, isoDef, wallDef } from '../iso.js';
import { svg, text, starPath, wearable, NPC } from './common.js';
import { renderPet, randomPet } from '../pets.js';
import { putChar, newId } from '../state.js';

const R = room({ cols: 9, rows: 8, ox: 768, oy: 314, wallH: 280 });
R.charScale = 0.6;

const WOOD = '#C99A6C', WOOD_L = '#E2C29C', WOOD_D = '#8B6450', CREAM = '#FBF7EF', LILAC = '#B79CF0', TEAL = '#7FCFC4', TURQ = '#3CC7B8', SKY = '#9CC8EE', SUN = '#F5DE7A', CORAL = '#E58F6A', LEAF = '#6DBE7A', BRASS = '#E3C27A', INKY = '#3E3252';
const line = 'stroke="#3E3252" stroke-opacity=".5" stroke-width="1.4"';
const P = (gx, gy, z = 0) => proj(R, gx, gy, z);
const poly = (arr) => arr.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ');
const paw = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><ellipse cx="0" cy="3" rx="5" ry="4"/><circle cx="-5" cy="-3" r="2"/><circle cx="-1.8" cy="-6" r="2"/><circle cx="1.8" cy="-6" r="2"/><circle cx="5" cy="-3" r="2"/></g>`;

// A pet drawn inside an item (nested svg; inline size beats the .avatar 100% rule). (x, y) = where its paws touch down.
const petPic = (look, x, y, w = 96) => {
  const h = (w * 260) / 300;
  return renderPet(look).replace('<svg ', `<svg x="${(x - w / 2).toFixed(1)}" y="${(y - h * 0.96).toFixed(1)}" width="${w}" height="${h.toFixed(1)}" style="width:${w}px;height:${h.toFixed(1)}px;overflow:visible" `);
};

// ---------- background ----------
const bg = (w) => {
  const [lx] = P(0, R.rows), [rx] = P(R.cols, 0), [, fy] = P(R.cols, R.rows);
  return svg(1600, 900, `
  <defs>
    <radialGradient id="petshop-bd" cx="50%" cy="55%" r="70%"><stop offset="0" stop-color="#F2FAF8"/><stop offset="1" stop-color="#D3E8E4"/></radialGradient>
    <pattern id="petshop-wl" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="matrix(1,-0.5,0,1,0,0)">
      <rect width="56" height="56" fill="#E2F3EF"/>${paw(14, 16, 0.9, '#CBE9E3')}${paw(42, 44, 0.9, '#F1E6B8')}</pattern>
    <pattern id="petshop-wr" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="matrix(1,0.5,0,1,0,0)">
      <rect width="56" height="56" fill="#D6ECE7"/>${paw(14, 16, 0.9, '#C0E1DA')}${paw(42, 44, 0.9, '#EADDA8')}</pattern>
    <linearGradient id="petshop-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".6"/><stop offset="1" stop-color="#FFF6DA" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#petshop-bd)"/>
  <ellipse cx="${(lx + rx) / 2}" cy="${fy + 6}" rx="580" ry="46" fill="#3E3252" opacity=".10"/>
  ${roomShell(R, { floor: '#E3C9A5', floorLines: 'planks', wallL: '#E2F3EF', wallR: '#D6ECE7', wallPatternL: 'petshop-wl', wallPatternR: 'petshop-wr', base: '#F4EEDF' })}
  <polygon points="${poly([P(4.1, 0.65), P(5.6, 0.65), P(6.9, 3.6), P(5.4, 3.6)])}" fill="url(#petshop-light)" opacity="${w.weather === 'sun' ? 1 : 0.35}"/>`);
};

// ---------- adopting ----------
const NAMES = ['Biscuit', 'Mochi', 'Pepper', 'Luna', 'Clover', 'Maple', 'Pip', 'Hazel', 'Nimbus', 'Juniper', 'Toffee', 'Willow', 'Sprout', 'Pickle', 'Pudding', 'Bean'];
const SOUND = { cat: 'Meow! 🐱', dog: 'Woof! 🐶', bunny: '*hop hop* 🐰', hamster: 'Squeak! 🐹', fox: 'Yip! 🦊' };
const clean = (s) => s.replace(/[<>&"'`]/g, '').trim().slice(0, 14);

function adopt(it, api) {
  const box = it.el.querySelector('svg.avatar');
  if (it.data.adopted) { api.bubble(it.x + it.w / 2, it.y - 6, 'This friend already found a home! 💜'); return; }
  box?.classList.add('happy');
  api.later(() => box?.classList.remove('happy'), 700);
  api.sfx.boing();
  api.bubble(it.x + it.w / 2, it.y - 6, SOUND[it.data.look.type] || '💜');
  api.later(() => api.modal((card, close) => {
    card.innerHTML += `<h2>Adopt ${it.data.name}?</h2>
      <p class="m-status">Give your new friend a name:</p>
      <div class="petshop-preview" style="width:min(34vh,190px);aspect-ratio:300/260;margin:0 auto 6px">${renderPet(it.data.look)}</div>
      <div style="display:flex;justify-content:center;margin:4px 0 12px"><input class="name-input" maxlength="14" style="flex:0 1 220px;text-align:center" aria-label="Pet name"></div>
      <div class="opt-row"><button class="btn adopt">Adopt 💜</button><button class="btn alt nope">Not now</button></div>`;
    const input = card.querySelector('.name-input');
    input.value = it.data.name;
    card.querySelector('.nope').onclick = close;
    card.querySelector('.adopt').onclick = () => {
      const name = clean(input.value) || it.data.name;
      putChar({ id: newId(), name, kind: 'pet', travel: false, look: { ...it.data.look, glasses: 'none', hat: 'none' } });
      it.data.adopted = true;
      api.setArt(it);
      close();
      api.sfx.win();
      api.sparkle(it.x + it.w / 2, it.y + 60, ['💜', '✨', '🐾']);
      api.bubble(it.x + it.w / 2, it.y - 6, `${name} joined your family! Find them in 👥 My characters`);
    };
  }), 350);
}

const tag = (x, y, label, adopted) => `<g transform="translate(${x} ${y})">
  <path d="M0 -12 V0" stroke="#3E3252" stroke-width="1.4"/>
  <path d="M-28 0 H28 L33 10 L28 20 H-28 L-33 10 Z" fill="${adopted ? TURQ : CREAM}" ${line}/>
  <circle cx="-24" cy="10" r="2" fill="#3E3252"/>
  ${text(3, 14.5, adopted ? 'Home ♡' : label, 11, adopted ? '#fff' : '#4A3B5C', 600)}</g>`;

// A round wicker basket with a pet sitting in it.
const basket = (it) => isoItem(1.15, 1.15, 120, [{
  svg: (() => {
    const [cx, cy] = at(0.575, 0.575), top = cy - 34, rx = 54, ry = 27;
    const adopted = it?.data.adopted;
    return `<ellipse cx="${cx}" cy="${cy + 6}" rx="${rx + 6}" ry="${ry - 4}" fill="#3E3252" opacity=".12"/>
      <ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="#A47E52" ${line}/>
      <ellipse cx="${cx}" cy="${top + 3}" rx="${rx - 9}" ry="${ry - 7}" fill="${adopted ? '#D2C3F6' : '#B3A0E4'}"/>
      ${adopted ? `<path d="M${cx - 10} ${top} q10 -10 20 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>${starPath(cx, top - 2, 7, '#fff')}` : petPic(it.data.look, cx, top + 10, 92)}
      <path d="M${cx - rx} ${top} A${rx} ${ry} 0 0 0 ${cx + rx} ${top} V${cy - 4} A${rx} ${ry} 0 0 1 ${cx - rx} ${cy - 4} Z" fill="#D9B98F" ${line}/>
      ${[10, 20].map((d) => `<path d="M${cx - rx + 1} ${top + d} A${rx} ${ry} 0 0 0 ${cx + rx - 1} ${top + d}" stroke="#A47E52" stroke-width="2" fill="none" opacity=".6"/>`).join('')}
      ${Array.from({ length: 9 }, (_, i) => { const t = -0.8 + i * 0.2, x = cx + Math.sin(t) * rx * 0.98, y = top + Math.cos(t) * ry * 0.98; return `<path d="M${x.toFixed(1)} ${y.toFixed(1)} v28" stroke="#A47E52" stroke-width="1.4" opacity=".45"/>`; }).join('')}
      <path d="M${cx - rx} ${top} A${rx} ${ry} 0 0 0 ${cx + rx} ${top}" stroke="#E6CB9F" stroke-width="6" fill="none"/>
      ${tag(cx, cy - 6, it?.data.name || '', adopted)}`;
  })(),
  w: 1.15, d: 1.15,
}]);

// A little fenced pen on the floor with a pet inside.
const pen = (it) => {
  const fw = 1.7, fd = 1.5, fh = 36, rail = shades(CREAM, 0.6);
  const slats = (len) => `${Array.from({ length: Math.floor(len / 11) }, (_, i) => `<path d="M${8 + i * 11} 6 V${fh - 3}" stroke="#D9C8A6" stroke-width="3"/>`).join('')}<path d="M0 6 H${len}" stroke="#E7DCC4" stroke-width="2"/>`;
  const adopted = it?.data.adopted;
  const [mx, my] = at(fw / 2, fd / 2);
  return isoItem(fw, fd, 110, [
    { svg: `<polygon points="${poly([at(0, 0), at(fw, 0), at(fw, fd), at(0, fd)])}" fill="#CDEBE5"/><ellipse cx="${mx}" cy="${my}" rx="70" ry="33" fill="#E0F3EF"/>${paw(mx - 46, my + 12, 1.1, '#B6DED6')}${paw(mx + 40, my - 14, 1.1, '#B6DED6')}`, u: 0, v: 0, w: 0, d: 0 },
    { u: 0, v: 0, w: fw, d: 0.06, h: fh, ...rail, leftDecor: slats(fw * 64) },
    { u: 0, v: 0, w: 0.06, d: fd, h: fh, ...rail, rightDecor: slats(fd * 64) },
    { svg: adopted ? `<path d="M${mx - 12} ${my - 6} q12 -14 24 0 q-12 14 -24 0 Z" fill="${LILAC}" opacity=".7"/>` : `<ellipse cx="${mx}" cy="${my}" rx="34" ry="10" fill="#3E3252" opacity=".1"/>${petPic(it.data.look, mx, my + 4, 100)}`, u: fw / 2, v: fd / 2, w: 0.1, d: 0.1 },
    { u: 0, v: fd - 0.06, w: fw, d: 0.06, h: fh, ...rail, leftDecor: slats(fw * 64) },
    { u: fw - 0.06, v: 0, w: 0.06, d: fd, h: fh, ...rail, rightDecor: slats(fd * 64) },
    ...[[0, 0], [fw - 0.1, 0], [0, fd - 0.1], [fw - 0.1, fd - 0.1]].map(([u, v]) => ({ u, v, w: 0.1, d: 0.1, h: fh + 8, ...shades('#E9DCC2') })),
    { svg: (() => { const [x, y] = at(fw * 0.62, fd, fh + 2); return tag(x, y + 6, it?.data.name || '', adopted); })(), u: fw, v: fd, w: 0.1, d: 0.1 },
  ]);
};

// ---------- furniture ----------
const aquarium = () => {
  const d = 2.22 * 64, h = 106;
  const fish = (x, y, c, c2, s, dur, delay, flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><g class="sx-fishdart"><g class="sx-fish" style="animation-duration:${dur}s;animation-delay:${delay}s">
    <path d="M-14 0 Q-5 -9 8 -6 Q15 -2 16 0 Q15 2 8 6 Q-5 9 -14 0 Z" fill="${c}" stroke="#3E3252" stroke-width="1"/><path d="M-12 0 L-21 -6 L-19 0 L-21 6 Z" fill="${c2}"/>
    <circle cx="9" cy="-1.5" r="1.6" fill="#2A2038"/></g></g></g>`;
  const tank = `<defs><clipPath id="petshop-tankclip"><rect x="0" y="0" width="${d}" height="${h}"/></clipPath></defs>
    <g clip-path="url(#petshop-tankclip)">
      <rect width="${d}" height="${h}" fill="#86D0DC"/><rect width="${d}" height="${h * 0.45}" fill="#B4E5EE" opacity=".6"/>
      <path d="M0 ${h - 14} Q${d * 0.3} ${h - 24} ${d * 0.6} ${h - 16} T${d} ${h - 18} V${h} H0 Z" fill="#F3E3BE"/>
      ${[[18, h - 10, 7, '#A9AEC2'], [34, h - 8, 5, '#C9B8F2'], [d - 24, h - 12, 8, '#9EDDD4'], [d - 46, h - 8, 5, '#B7BCCD']].map(([x, y, r, c]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="${c}" ${line}/>`).join('')}
      <path d="M24 ${h - 12} Q16 ${h - 40} 26 ${h - 58} Q34 ${h - 74} 24 ${h - 90}" stroke="#4E9B5A" stroke-width="6" fill="none" stroke-linecap="round" class="sx-sway" style="transform-box:fill-box;transform-origin:50% 100%"/>
      <path d="M${d - 30} ${h - 14} Q${d - 20} ${h - 40} ${d - 32} ${h - 60} Q${d - 40} ${h - 76} ${d - 30} ${h - 88}" stroke="#5AAE6A" stroke-width="5" fill="none" stroke-linecap="round" class="sx-sway" style="transform-box:fill-box;transform-origin:50% 100%;animation-delay:-1.4s"/>
      <g transform="translate(${d * 0.55} ${h - 42})"><path d="M0 30 V8 Q0 2 6 2 H26 Q32 2 32 8 V30 Z" fill="#C9B8F2" ${line}/><path d="M10 30 V20 Q10 14 16 14 Q22 14 22 20 V30 Z" fill="#4A3B5C" opacity=".6"/><path d="M0 2 V-4 H6 V0 H13 V-4 H19 V0 H26 V-4 H32 V2" fill="#C9B8F2" ${line}/></g>
      ${fish(46, 34, SUN, '#F0B35A', 1.1, 7, 0)}${fish(96, 50, SKY, '#4D5C9A', 0.9, 9, -3, true)}${fish(70, 22, TURQ, '#2A9C90', 0.8, 6, -1.5)}${fish(40, 66, LILAC, '#7A64B0', 1, 8, -4, true)}
      <g class="sx-bub" fill="#fff" fill-opacity=".35" stroke="#fff" stroke-width="1.2">${[[30, 90, 3.5], [36, 74, 2.5], [28, 60, 3], [d - 40, 92, 4], [d - 34, 70, 3], [d * 0.6, 84, 3]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" style="animation-delay:${(i * 0.23).toFixed(2)}s"/>`).join('')}</g>
      <path d="M10 0 L30 ${h} M60 0 L80 ${h} M110 0 L126 ${h}" stroke="#fff" stroke-width="10" opacity=".1"/>
    </g>
    <rect width="${d}" height="${h}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`;
  return isoItem(0.95, 2.3, 214, [
    { u: 0, v: 0, w: 0.95, d: 2.3, h: 82, ...shades('#8E7CC3'),
      rightDecor: `<rect x="6" y="8" width="${2.3 * 32 - 9}" height="66" rx="4" fill="none" ${line}/><rect x="${2.3 * 32 + 3}" y="8" width="${2.3 * 32 - 9}" height="66" rx="4" fill="none" ${line}/>
        <rect x="${2.3 * 32 - 10}" y="30" width="5" height="22" rx="2.5" fill="${BRASS}"/><rect x="${2.3 * 32 + 5}" y="30" width="5" height="22" rx="2.5" fill="${BRASS}"/>${paw(2.3 * 16, 44, 1.6, '#A796D3')}${paw(2.3 * 48, 44, 1.6, '#A796D3')}` },
    { u: -0.02, v: -0.02, w: 0.99, d: 2.34, z: 82, h: 6, ...shades('#6E5C99') },
    { u: 0.04, v: 0.04, w: 0.87, d: 2.22, z: 88, h, top: '#BEE9F0', left: '#93D4DF', right: '#86D0DC', rightDecor: tank,
      leftDecor: `<rect width="${0.87 * 64}" height="${h}" fill="#93D4DF"/><path d="M0 ${h - 12} H${0.87 * 64} V${h} H0 Z" fill="#F3E3BE"/>${fish(26, 40, CORAL, '#C96F4E', 0.8, 8, -2)}`,
      topDecor: '<path d="M.15 .5 q.15 -.08 .3 0 t.3 0 M.15 1.4 q.15 -.08 .3 0 t.3 0" stroke="#fff" stroke-width=".03" fill="none" opacity=".7"/>' },
    { u: 0.02, v: 0.02, w: 0.91, d: 2.26, z: 194, h: 10, ...shades('#5E4E80'), topDecor: '<rect x=".3" y=".4" width=".3" height="1.4" rx=".05" fill="#FFF4C4" opacity=".85"/>' },
  ]);
};

const birdcage = () => isoItem(0.8, 0.8, 256, [
  { u: 0.12, v: 0.12, w: 0.56, d: 0.56, h: 8, round: true, ...shades(BRASS) },
  { u: 0.36, v: 0.36, w: 0.08, d: 0.08, z: 8, h: 132, ...shades(BRASS) },
  { svg: (() => {
    const [cx, cy] = at(0.4, 0.4, 140);
    const bars = [-30, -18, -6, 6, 18, 30].map((dx) => `<path d="M${cx + dx} ${cy - 2} V${cy - 66 + Math.abs(dx) * 0.3} Q${cx + dx * 0.5} ${cy - 100} ${cx} ${cy - 104}" stroke="${BRASS}" stroke-width="2" fill="none"/>`).join('');
    return `<ellipse cx="${cx}" cy="${cy}" rx="38" ry="14" fill="#F0E4C2" ${line}/>
      <path d="M${cx - 38} ${cy - 2} V${cy - 66} Q${cx - 38} ${cy - 104} ${cx} ${cy - 106} Q${cx + 38} ${cy - 104} ${cx + 38} ${cy - 66} V${cy - 2}" fill="#E8F6FB" fill-opacity=".35" stroke="${BRASS}" stroke-width="2.5"/>
      <path d="M${cx - 30} ${cy - 36} H${cx + 26}" stroke="${WOOD}" stroke-width="3" stroke-linecap="round"/>
      <g class="sx-bird"><path d="M${cx - 14} ${cy - 40} Q${cx - 16} ${cy - 58} ${cx - 2} ${cy - 60} Q${cx + 10} ${cy - 60} ${cx + 10} ${cy - 48} Q${cx + 8} ${cy - 38} ${cx - 6} ${cy - 38} Z" fill="${SKY}" ${line}/>
        <path d="M${cx - 12} ${cy - 46} Q${cx - 24} ${cy - 44} ${cx - 26} ${cy - 36} Q${cx - 16} ${cy - 38} ${cx - 10} ${cy - 42} Z" fill="#6FA8DC"/>
        <path d="M${cx + 10} ${cy - 52} L${cx + 17} ${cy - 50} L${cx + 10} ${cy - 47} Z" fill="${SUN}"/><circle cx="${cx + 4}" cy="${cy - 53}" r="1.8" fill="#2A2038"/></g>
      ${bars}<ellipse cx="${cx}" cy="${cy - 2}" rx="38" ry="14" fill="none" stroke="${BRASS}" stroke-width="3"/>
      <circle cx="${cx}" cy="${cy - 108}" r="5" fill="none" stroke="${BRASS}" stroke-width="2.5"/>
      <rect x="${cx + 14}" y="${cy - 20}" width="12" height="7" rx="2" fill="${SUN}" ${line}/>`;
  })(), u: 0.4, v: 0.4, w: 0.2, d: 0.2, z: 140 },
]);

const counter = () => {
  const w = 2.8 * 64;
  return isoItem(2.8, 0.9, 92, [
    { u: 0, v: 0, w: 2.8, d: 0.88, h: 86, ...shades('#E9DCC2'),
      leftDecor: `${Array.from({ length: 16 }, (_, i) => `<path d="M${6 + i * 11} 6 V82" stroke="#D2C2A2" stroke-width="2"/>`).join('')}
        <rect x="${w / 2 - 50}" y="22" width="100" height="40" rx="8" fill="${TURQ}" ${line}/>${text(w / 2, 40, 'SUNNY', 12, '#fff', 600)}${text(w / 2, 55, 'PETS', 12, SUN, 600)}
        ${paw(24, 44, 1.6, '#D2C2A2')}${paw(w - 24, 44, 1.6, '#D2C2A2')}` },
    { u: -0.03, v: -0.02, w: 2.86, d: 0.94, z: 86, h: 6, ...shades(WOOD) },
  ]);
};

const toyShelf = () => {
  const w = 1.7 * 64;
  return isoItem(1.7, 0.6, 96, [
    { u: 0, v: 0, w: 1.7, d: 0.6, h: 56, ...shades(WOOD_L),
      leftDecor: `${[0, 1, 2].map((i) => `<rect x="${5 + i * (w - 10) / 3}" y="6" width="${(w - 10) / 3 - 4}" height="44" rx="3" fill="#C9A57C"/>
        <path d="M${7 + i * (w - 10) / 3} 26 h${(w - 10) / 3 - 8} v22 h-${(w - 10) / 3 - 8} z" fill="${[TEAL, SUN, LILAC][i]}" ${line}/>`).join('')}
        <circle cx="20" cy="22" r="6" fill="${CORAL}" ${line}/><path d="M50 24 h14" stroke="${CREAM}" stroke-width="7" stroke-linecap="round"/><circle cx="88" cy="22" r="6" fill="${SKY}" ${line}/>` },
    { u: -0.02, v: -0.02, w: 1.74, d: 0.64, z: 56, h: 5, ...shades(WOOD) },
    { svg: (() => { const [ax, ay] = at(0.35, 0.3, 61), [bx, by] = at(0.9, 0.3, 61), [cx, cy] = at(1.4, 0.3, 61); return `
      <path d="M${ax - 14} ${ay - 4} h28" stroke="${CREAM}" stroke-width="9" stroke-linecap="round"/><circle cx="${ax - 15}" cy="${ay - 8}" r="5" fill="${CREAM}" ${line}/><circle cx="${ax - 15}" cy="${ay}" r="5" fill="${CREAM}" ${line}/><circle cx="${ax + 15}" cy="${ay - 8}" r="5" fill="${CREAM}" ${line}/><circle cx="${ax + 15}" cy="${ay}" r="5" fill="${CREAM}" ${line}/>
      <circle cx="${bx}" cy="${by - 12}" r="12" fill="#C9D84A" ${line}/><path d="M${bx - 11} ${by - 16} Q${bx} ${by - 10} ${bx + 4} ${by - 2}" stroke="#fff" stroke-width="2" fill="none"/>
      <path d="M${cx - 18} ${cy - 6} q9 -10 18 0 t18 0" stroke="${LILAC}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M${cx - 18} ${cy - 6} q9 -10 18 0 t18 0" stroke="${CREAM}" stroke-width="2" fill="none" stroke-dasharray="3 4"/>`; })(), u: 0.9, v: 0.3, w: 0.1, d: 0.1, z: 61 },
  ]);
};

const sack = () => isoItem(0.7, 0.6, 96, [
  { u: 0, v: 0, w: 0.7, d: 0.6, h: 74, ...shades(TURQ),
    leftDecor: `<rect x="5" y="16" width="35" height="34" rx="4" fill="#fff" opacity=".9"/>${paw(22, 30, 1.1, CORAL)}${text(22.5, 46, 'KIBBLE', 7, '#2A9C90', 600)}`,
    rightDecor: '<path d="M6 10 V68 M32 10 V68" stroke="#fff" stroke-width="2" opacity=".25"/>' },
  { svg: (() => { const [l] = [at(0, 0.6, 74)], r = at(0.7, 0, 74), f = at(0.7, 0.6, 74), b = at(0, 0, 74); return `<path d="M${l[0]} ${l[1]} L${f[0]} ${f[1]} L${r[0]} ${r[1]} L${b[0]} ${b[1]} Z" fill="#2A9C90" ${line}/>
    <path d="M${l[0] + 4} ${l[1] - 2} Q${(l[0] + f[0]) / 2} ${l[1] - 20} ${f[0]} ${f[1] - 4} Q${(f[0] + r[0]) / 2} ${f[1] - 22} ${r[0] - 4} ${r[1] - 2} L${b[0]} ${b[1] - 10} Z" fill="#5AD3C5" ${line}/>
    <path d="M${(l[0] + f[0]) / 2 + 2} ${l[1] - 6} q4 -6 10 -2 q4 -6 8 0" fill="#C99772" ${line}/>`; })(), u: 0.35, v: 0.3, w: 0.1, d: 0.1, z: 74 },
]);

const petBed = () => isoItem(1.3, 1, 34, [{
  svg: (() => { const [cx, cy] = at(0.65, 0.5); return `<ellipse cx="${cx}" cy="${cy}" rx="66" ry="32" fill="${LILAC}" ${line}/><ellipse cx="${cx}" cy="${cy - 10}" rx="62" ry="28" fill="#C9B8F2" ${line}/>
    <ellipse cx="${cx}" cy="${cy - 6}" rx="44" ry="18" fill="#E4DAF8"/><path d="M${cx - 30} ${cy - 8} q30 -12 60 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>${paw(cx + 14, cy - 4, 1, '#C9B8F2')}`; })(),
  w: 1.3, d: 1,
}]);

const catTree = () => {
  const carpet = shades('#D9CDB8'), rope = shades('#C9A57C'), plat = shades('#C9B8F2');
  const ropeDecor = '<path d="M0 6 H13 M0 14 H13 M0 22 H13 M0 30 H13 M0 38 H13 M0 46 H13 M0 54 H13 M0 62 H13 M0 70 H13" stroke="#A47E52" stroke-width="1.6" opacity=".6"/>';
  return isoItem(1, 1, 220, [
    { u: 0, v: 0, w: 1, d: 1, h: 12, ...carpet },
    { u: 0.4, v: 0.4, w: 0.2, d: 0.2, z: 12, h: 78, ...rope, leftDecor: ropeDecor, rightDecor: ropeDecor },
    { u: 0.05, v: 0.05, w: 0.62, d: 0.62, z: 90, h: 10, ...plat },
    { u: 0.4, v: 0.4, w: 0.2, d: 0.2, z: 100, h: 60, ...rope, leftDecor: ropeDecor, rightDecor: ropeDecor },
    { u: 0.33, v: 0.33, w: 0.64, d: 0.64, z: 160, h: 10, ...plat },
    { u: 0.4, v: 0.4, w: 0.5, d: 0.5, z: 170, h: 6, ...shades(TEAL) },
    { svg: (() => { const [x, y] = at(0.97, 0.66, 160); return `<path d="M${x} ${y} V${y + 40}" stroke="#3E3252" stroke-width="1.4"/><circle cx="${x}" cy="${y + 46}" r="7" fill="${CORAL}" ${line}/>`; })(), u: 0.97, v: 0.66, w: 0.05, d: 0.05, z: 120 },
  ]);
};

const plant = (pot) => () => isoItem(0.7, 0.7, 160, [
  { u: 0.12, v: 0.12, w: 0.46, d: 0.46, h: 40, ...shades(pot) },
  { svg: (() => { const [cx, cy] = at(0.35, 0.35, 40); return [[-30, -76, -10], [26, -86, 12], [-4, -112, 0], [-40, -36, -18], [38, -44, 18]].map(([dx, dy, r]) => `<path d="M${cx} ${cy} Q${cx + dx * 0.4} ${cy + dy * 0.6} ${cx + dx} ${cy + dy} Q${cx + dx * 0.9 + r} ${cy + dy * 0.5} ${cx} ${cy} Z" fill="${LEAF}" ${line}/>`).join(''); })(), w: 0.7, d: 0.7, u: 0.35, v: 0.35 },
]);

const rug = () => isoItem(3.4, 2.2, 2, [{ u: 0, v: 0, w: 3.4, d: 2.2, h: 0, round: true, top: '#F4E7B4',
  topDecor: `<ellipse cx="1.7" cy="1.1" rx="1.35" ry=".86" fill="none" stroke="#fff" stroke-width=".05" stroke-dasharray=".16 .1"/>${[[1.0, 0.8], [1.5, 1.3], [2.1, 0.8], [2.6, 1.3]].map(([x, y]) => `<g transform="translate(${x} ${y}) scale(.022)">${paw(0, 0, 1, '#E3C27A')}</g>`).join('')}` }]);

// ---------- small things ----------
const register = () => isoItem(0.5, 0.42, 64, [
  { u: 0, v: 0, w: 0.5, d: 0.42, h: 22, ...shades(LILAC), leftDecor: '<rect x="4" y="5" width="24" height="12" rx="2" fill="#F5DE7A" opacity=".8"/>' },
  { u: 0.02, v: 0.04, w: 0.46, d: 0.26, z: 22, h: 6, ...shades(CREAM, 0.6), topDecor: `${[0, 1, 2, 3].map((i) => `<rect x="${0.04 + i * 0.105}" y=".05" width=".08" height=".07" fill="#C9B8F2"/><rect x="${0.04 + i * 0.105}" y=".15" width=".08" height=".07" fill="${i === 3 ? SUN : '#C9B8F2'}"/>`).join('')}` },
  { u: 0.05, v: 0, w: 0.4, d: 0.06, z: 28, h: 26, ...shades('#5E4E80'), leftDecor: `<rect x="3" y="4" width="19" height="16" rx="2" fill="#9EE6C9"/>${text(12.5, 16, '♡', 10, '#2A9C90', 600)}` },
]);

const treatJar = () => isoItem(0.38, 0.38, 72, [
  { u: 0.02, v: 0.02, w: 0.34, d: 0.34, h: 44, top: '#EAF6FB', left: '#DCEFF7', right: '#C9E3EE',
    leftDecor: '<path d="M4 30 l6 -3 l12 0 l6 3 M4 18 l6 -3 l12 0" stroke="#F0C27A" stroke-width="4" stroke-linecap="round"/>', rightDecor: '<path d="M4 34 l18 -2 M6 22 l14 -3" stroke="#F0C27A" stroke-width="4" stroke-linecap="round"/>' },
  { u: 0, v: 0, w: 0.38, d: 0.38, z: 44, h: 7, ...shades(CORAL) },
  { u: 0.13, v: 0.13, w: 0.12, d: 0.12, z: 51, h: 7, ...shades(CREAM, 0.6) },
]);

const bowl = (it) => isoItem(0.55, 0.45, 34, [{
  svg: (() => { const [cx, cy] = at(0.275, 0.225), full = it?.data.full;
    return `<path d="M${cx - 30} ${cy - 16} L${cx - 24} ${cy} Q${cx} ${cy + 8} ${cx + 24} ${cy} L${cx + 30} ${cy - 16} Z" fill="${TURQ}" ${line}/>
      <path d="M${cx - 26} ${cy - 8} Q${cx} ${cy} ${cx + 26} ${cy - 8}" stroke="#fff" stroke-width="2.5" opacity=".4" fill="none"/>
      <ellipse cx="${cx}" cy="${cy - 16}" rx="30" ry="10" fill="#2A9C90" ${line}/>
      ${full ? `<ellipse cx="${cx}" cy="${cy - 18}" rx="24" ry="7" fill="#C99772"/>${[[-12, -20], [-4, -23], [6, -21], [14, -18], [-2, -16], [8, -15], [-14, -15]].map(([x, y]) => `<circle cx="${cx + x}" cy="${cy + y}" r="3" fill="#A87A5A" stroke="#8B6450" stroke-width=".8"/>`).join('')}` : ''}
      ${paw(cx, cy - 6, 0.6, '#fff')}`;
  })(),
  w: 0.55, d: 0.45,
}]);

const ball = () => isoItem(0.34, 0.34, 40, [{
  svg: (() => { const [cx, cy] = at(0.17, 0.17); return `<ellipse cx="${cx}" cy="${cy + 2}" rx="15" ry="5" fill="#3E3252" opacity=".15"/><circle cx="${cx}" cy="${cy - 14}" r="15" fill="#D7E35E" ${line}/>
    <path d="M${cx - 13} ${cy - 22} Q${cx} ${cy - 14} ${cx - 4} ${cy}" stroke="#fff" stroke-width="2.5" fill="none"/><path d="M${cx + 13} ${cy - 6} Q${cx} ${cy - 14} ${cx + 4} ${cy - 28}" stroke="#fff" stroke-width="2.5" fill="none"/>`; })(),
  w: 0.34, d: 0.34,
}]);

const mouseToy = () => isoItem(0.5, 0.3, 34, [{
  svg: (() => { const [cx, cy] = at(0.25, 0.15); return `<ellipse cx="${cx}" cy="${cy + 2}" rx="24" ry="6" fill="#3E3252" opacity=".15"/>
    <path d="M${cx - 22} ${cy - 4} Q${cx - 34} ${cy - 12} ${cx - 26} ${cy - 22}" stroke="#C9B8F2" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M${cx - 20} ${cy - 2} Q${cx - 18} ${cy - 24} ${cx + 2} ${cy - 24} Q${cx + 18} ${cy - 22} ${cx + 26} ${cy - 4} Q${cx + 20} ${cy + 2} ${cx} ${cy + 2} Q${cx - 16} ${cy + 2} ${cx - 20} ${cy - 2} Z" fill="#A9AEC2" ${line}/>
    <circle cx="${cx + 8}" cy="${cy - 22}" r="6" fill="#C9CDDC" ${line}/><circle cx="${cx + 25}" cy="${cy - 5}" r="2" fill="${CORAL}"/>`; })(),
  w: 0.5, d: 0.3,
}]);

const treatArt = `<path d="M10 12 Q2 6 8 0 Q14 -2 16 6 H48 Q50 -2 56 0 Q62 6 54 12 Q62 18 56 24 Q50 26 48 18 H16 Q14 26 8 24 Q2 18 10 12 Z" transform="translate(0 6)" fill="#F0C27A" stroke="#4A3B5C" stroke-width="2"/><path d="M20 16 H44" stroke="#fff" stroke-width="2.5" opacity=".6" stroke-linecap="round"/>`;

// ---------- wall things ----------
const windowBody = (it, sp, api) => {
  const sunny = api?.state.weather !== 'rain';
  const w = sp.len, h = 120;
  return `<rect width="${w}" height="${h}" rx="6" fill="${sunny ? '#BFE3FA' : '#9EADC4'}" ${line}/>
    ${sunny ? `<circle cx="${w * 0.7}" cy="34" r="15" fill="#FFF3B8"/><path d="M12 82 q14 -16 32 -6 q10 -12 28 -2 q16 0 12 12 z" fill="#fff"/>` : Array.from({ length: 12 }, (_, i) => `<line x1="${(i * 23) % w + 6}" y1="${(i * 37) % 90 + 8}" x2="${(i * 23) % w + 2}" y2="${(i * 37) % 90 + 22}" stroke="#E8EEF7" stroke-width="2"/>`).join('')}
    <path d="M0 ${h * 0.8} Q${w * 0.3} ${h * 0.7} ${w * 0.6} ${h * 0.78} T${w} ${h * 0.74} V${h} H0 Z" fill="#A8DE9A" opacity=".8"/>
    <path d="M${w / 2} 0 V${h} M0 ${h / 2} H${w}" stroke="#FBF7EF" stroke-width="6"/>
    <rect x="-6" y="${h - 4}" width="${w + 12}" height="12" rx="3" fill="#FBF7EF" ${line}/>
    <path d="M-14 -10 Q${w * 0.14} ${h * 0.45} -4 ${h + 2} L-16 ${h + 2} Z" fill="${SUN}" ${line}/>
    <path d="M${w + 14} -10 Q${w * 0.86} ${h * 0.45} ${w + 4} ${h + 2} L${w + 16} ${h + 2} Z" fill="${SUN}" ${line}/>
    <rect x="-22" y="-16" width="${w + 44}" height="9" rx="4" fill="${WOOD}" ${line}/>`;
};

const bannerBody = (it, sp) => {
  const w = sp.len, flags = 9;
  return `<path d="M0 4 Q${w / 2} 22 ${w} 4" stroke="#3E3252" stroke-opacity=".6" stroke-width="1.6" fill="none"/>
    ${Array.from({ length: flags }, (_, i) => { const t = (i + 0.5) / flags, x = t * w, y = 4 + Math.sin(t * Math.PI) * 9; return `<path d="M${(x - 9).toFixed(1)} ${y.toFixed(1)} L${(x + 9).toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${(y + 18).toFixed(1)} Z" fill="${[TURQ, SUN, LILAC, SKY, CORAL][i % 5]}" ${line}/>`; }).join('')}
    <rect x="${w / 2 - 74}" y="34" width="148" height="26" rx="13" fill="#FBF7EF" ${line}/>${text(w / 2, 52, 'ADOPT A FRIEND ♡', 12, '#7A64B0', 600)}`;
};

const shelfBody = (it, sp) => {
  const w = sp.len;
  const bag = (x, y, c, label) => `<path d="M${x} ${y} v-34 q0 -6 4 -8 h24 q4 2 4 8 v34 z" fill="${c}" ${line}/><rect x="${x + 6}" y="${y - 24}" width="20" height="14" rx="2" fill="#fff" opacity=".85"/>${paw(x + 16, y - 16, 0.7, label)}`;
  const can = (x, y, c) => `<rect x="${x}" y="${y - 18}" width="14" height="18" rx="2" fill="${c}" ${line}/><path d="M${x} ${y - 13} h14" stroke="#fff" stroke-width="2" opacity=".6"/>`;
  return `${[56, 120].map((y) => `<rect x="0" y="${y}" width="${w}" height="7" rx="2" fill="${WOOD_L}" ${line}/><path d="M10 ${y + 7} l6 9 M${w - 10} ${y + 7} l-6 9" stroke="${WOOD}" stroke-width="4" stroke-linecap="round"/>`).join('')}
    ${bag(8, 56, TURQ, CORAL)}${bag(44, 56, SUN, TURQ)}${bag(80, 56, LILAC, SUN)}${can(118, 56, CORAL)}${can(134, 56, SKY)}${can(126, 38, '#9EDDD4')}
    ${can(8, 120, LILAC)}${can(24, 120, SUN)}<circle cx="52" cy="111" r="9" fill="#D7E35E" ${line}/><circle cx="72" cy="113" r="7" fill="${CORAL}" ${line}/>
    <path d="M90 120 v-26 h30 v26" fill="#E4F5F2" ${line}/>${text(105, 112, '🐟', 12)}${bag(128, 120, SKY, LILAC)}`;
};

const leashBody = (it, sp) => {
  const w = sp.len;
  return `<rect x="0" y="0" width="${w}" height="12" rx="3" fill="${WOOD}" ${line}/>
    ${[16, 40, 64].map((x, i) => `<circle cx="${x}" cy="6" r="3" fill="${BRASS}"/><path d="M${x} 8 q-10 30 0 50 q8 14 -2 26" stroke="${[TURQ, CORAL, LILAC][i]}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="${x - 2}" cy="86" r="4" fill="${BRASS}" ${line}/>`).join('')}
    <circle cx="${w - 14}" cy="6" r="3" fill="${BRASS}"/><ellipse cx="${w - 14}" cy="26" rx="10" ry="14" fill="none" stroke="${SUN}" stroke-width="5"/><circle cx="${w - 14}" cy="42" r="3.5" fill="${BRASS}" ${line}/>`;
};

const photoBody = (it, sp) => `<rect width="${sp.len}" height="66" rx="4" fill="#FBF7EF" ${line}/><rect x="5" y="5" width="${sp.len - 10}" height="56" rx="2" fill="#D8F0EB"/>
  ${paw(sp.len / 2, 34, 2.2, LILAC)}${text(sp.len / 2, 58, 'Happy pets!', 8, '#7A64B0', 600)}`;

const boing = (it) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); };
const toyGive = (lineTxt) => (it, api, who) => {
  api.sfx.boing();
  api.react(who, who.def.kind === 'pet' ? lineTxt : 'Wanna play? 😄', ['🎾', '💜', '✨']);
  it.gx = Math.max(0, Math.min(R.cols - it.fw, who.gx - 0.55));
  it.gy = Math.max(0, Math.min(R.rows - it.fd, who.gy + 0.3));
  it.gz = 0; it.on = null;
  api.place(it);
};

const I = isoDef;
const W = (...a) => wallDef(R, ...a);
const adoptable = (id, gx, gy, fw, fd, build, look, name) => I(id, gx, gy, fw, fd, build, { drag: false, cls: 'pet-item', data: { look, name, adopted: false }, onTap: adopt });

export const PETSHOP = {
  id: 'petshop', posKey: 'petshop-iso', title: 'Pet Shop 🐾', weather: true, light: 'iso', avatar: [3.0, 5.6],
  frame: '#DCEDEA',
  iso: R,
  bg,
  onWeather: (api) => api.setArt(api.get('window')),
  init: (api) => {
    const b = api.get('pet-new');
    if (b) {
      b.data.look = randomPet();
      b.data.name = NAMES[Math.floor(Math.random() * NAMES.length)];
      api.setArt(b);
    }
  },
  stars: [{ id: 'petshop-sack', gx: 0.4, gy: 4.15 }],
  characters: [
    { id: 'keeper', look: { ...NPC.leo, top: 'sweater', topColor: '#3CC7B8', collar: 'round', neck: 'none', bottom: 'widePants', bottomColor: '#4D5C9A', shoes: 'boots', shoesColor: '#2E2A3A' }, gx: 7.3, gy: 0.45, drag: false,
      say: ['Welcome to Sunny Pets! 🐾', 'Tap a pet to adopt them 💜', 'Treats are in the jar! 🦴', 'Give a toy to your pet 🎾', 'Our fish love visitors! 🐠'] },
  ],
  items: [
    W('banner', 'R', 1.15, 262, 2.8, 62, bannerBody),
    W('window', 'R', 4.15, 258, 1.5, 120, windowBody),
    W('shelf', 'R', 6.1, 262, 2.6, 128, shelfBody, {
      onTap: (it, api) => { api.sfx.tap(); api.bubble(it.x + it.w / 2, it.y, ['Kibble for every pet! 🦴', 'Fish flakes 🐟', 'Squeaky toys! 🎾'][Math.floor(Math.random() * 3)]); } }),
    W('leashes', 'L', 4.5, 236, 1.3, 92, leashBody),
    W('photo', 'L', 6.2, 222, 1.0, 66, photoBody),

    I('rug', 2.3, 4.5, 3.4, 2.2, rug, { floor: true }),
    I('petbed', 0.3, 5.6, 1.3, 1, petBed, { floor: true,
      onTap: (it, api) => { api.bubble(it.x + it.w / 2, it.y, 'A cosy nap spot 💤'); api.sparkle(it.x + it.w / 2, it.y + 30, ['💤', '💜']); } }),
    I('birdcage', 0.12, 0.12, 0.8, 0.8, birdcage, { drag: false,
      onTap: (it, api) => {
        it.el.classList.remove('sx-hopbird'); void it.el.offsetWidth; it.el.classList.add('sx-hopbird');
        api.sfx.tap(); api.later(() => api.sfx.tap(), 140);
        api.bubble(it.x + it.w / 2, it.y + 30, ['Tweet tweet! 🐦', 'Chirp! 🎶', 'Pretty bird! 💙'][Math.floor(Math.random() * 3)]);
      } }),
    I('aquarium', 0.06, 1.25, 0.95, 2.3, aquarium, { drag: false, data: { taps: 0 },
      onTap: (it, api) => {
        it.el.classList.remove('sx-dart'); void it.el.offsetWidth; it.el.classList.add('sx-dart', 'sx-bubbling');
        api.sfx.pour();
        api.later(() => it.el.classList.remove('sx-bubbling'), 2400);
        it.data.taps++;
        if (it.data.taps === 3 && !api.starFound('petshop-tank')) {
          api.addStar('petshop-tank', 0, 0, { spawned: true, gx: it.gx + 0.4, gy: it.gy + 1.0, gz: 120 });
          api.bubble(it.x + it.w / 2, it.y, 'Something shiny in the tank! ⭐');
        } else api.bubble(it.x + it.w / 2, it.y, ['Blub blub! 🐠', 'Look at them swim! 🐟', 'Bubbles! 🫧'][it.data.taps % 3]);
      } }),
    adoptable('pet-cat', 1.25, 0.25, 1.15, 1.15, basket, { type: 'cat', fur: '#A9AEC2', pattern: 'stripes', eyes: '#36A7B5', acc: 'collar', accColor: '#B79CF0', glasses: 'none', hat: 'none' }, 'Nimbus'),
    adoptable('pet-new', 2.7, 0.25, 1.15, 1.15, basket, { type: 'bunny', fur: '#FBF7EF', pattern: 'none', eyes: '#8D6CC9', acc: 'bow', accColor: '#8FC3F0', glasses: 'none', hat: 'none' }, 'Mochi'),
    I('toyshelf', 4.05, 0.08, 1.7, 0.6, toyShelf, { drag: false,
      onTap: (it, api) => { api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y, ['Squeak squeak! 🦴', 'So many toys! 🎾', 'A rope for tug-of-war! 🪢'][Math.floor(Math.random() * 3)]); } }),
    adoptable('pet-dog', 2.1, 2.5, 1.7, 1.5, pen, { type: 'dog', fur: '#F3D9A8', pattern: 'patch', eyes: '#8B6450', acc: 'scarf', accColor: '#3CC7B8', glasses: 'none', hat: 'none' }, 'Biscuit'),
    adoptable('pet-fox', 4.2, 2.5, 1.7, 1.5, pen, { type: 'fox', fur: '#F0A060', pattern: 'socks', eyes: '#4E9B5A', acc: 'none', accColor: '#F5DE7A', glasses: 'none', hat: 'none' }, 'Maple'),
    I('counter', 6.0, 1.3, 2.8, 0.9, counter, { drag: false, surface: 92 }),
    I('cattree', 7.5, 4.5, 1, 1, catTree, {
      onTap: (it, api) => { boing(it); api.sfx.boing(); api.bubble(it.x + it.w / 2, it.y, 'Scratch, climb, nap! 🐱'); } }),
    I('plant1', 8.25, 7.0, 0.7, 0.7, plant(SUN)),
    I('plant2', 0.15, 7.15, 0.7, 0.7, plant(TEAL)),
    I('sack', 0.2, 4.0, 0.7, 0.6, sack, {
      onTap: (it, api) => { api.bubble(it.x + it.w / 2, it.y, 'A big bag of crunchy kibble! 🦴'); } }),

    // small things on the counter, and toys on the floor
    I('treats', 6.2, 1.5, 0.38, 0.38, treatJar, { small: true, gz: 92, drag: false,
      onTap: (it, api) => {
        if (api.count('treat') >= 3) { api.bubble(it.x + it.w / 2, it.y, 'Share those treats first! 🦴'); return; }
        api.sfx.pop();
        const k = 0.75;
        api.add({
          id: api.uid('treat'), w: 64 * k, h: 40 * k, cls: 'food', small: true,
          gx: it.gx + 0.5 + api.count('treat') * 0.34, gy: it.gy + 0.05, gz: it.gz, fw: 0.3, fd: 0.3, ax: 32 * k, ay: 40 * k - 4,
          art: () => svg(64, 40, treatArt),
          onGive: (i, a, who) => a.eat(i, who, who.def.kind === 'pet' ? 'Crunchy treat! 🦴' : 'Hmm... a dog biscuit? 😄', ['🦴', '💜', '✨']),
        }, { spawned: true });
      } }),
    I('register', 8.05, 1.45, 0.5, 0.42, register, { small: true, gz: 92, drag: false,
      onTap: (it, api) => { api.sfx.win(); api.bubble(it.x + it.w / 2, it.y, 'Ding! Thanks for visiting 💜'); api.sparkle(it.x + it.w / 2, it.y + 20, ['✨', '💜']); } }),
    I('bowl', 2.0, 6.5, 0.55, 0.45, bowl, { data: { full: true },
      onTap: (it, api) => {
        if (it.data.full) { api.bubble(it.x + it.w / 2, it.y, 'Drag the bowl to a pet! 🐾'); return; }
        it.data.full = true; api.setArt(it); api.sfx.pour(); api.bubble(it.x + it.w / 2, it.y, 'Filled up! 🥣');
      },
      onGive: (it, api, who) => {
        if (!it.data.full) { api.bubble(who.x + who.w / 2, who.y - 6, 'Empty! Tap the bowl to refill it.'); return; }
        it.data.full = false; api.setArt(it); api.sfx.yum();
        api.react(who, who.def.kind === 'pet' ? 'Yum, kibble! 🥣' : "That's pet food, silly! 😄", ['🦴', '💜', '✨']);
      } }),
    I('ball', 3.2, 6.8, 0.34, 0.34, ball, { onTap: (it, api) => { boing(it); api.sfx.boing(); }, onGive: toyGive('Fetch! 🎾') }),
    I('mouse', 1.1, 6.9, 0.5, 0.3, mouseToy, { onTap: (it, api) => { boing(it); api.sfx.boing(); }, onGive: toyGive('Pounce! 🐭') }),
    (() => { const d = wearable('cap', 0, 0, 'petshop-cap', { gx: 5.1, gy: 6.6 }), k = 0.7; return { ...d, w: d.w * k, h: d.h * k, ax: (d.w * k) / 2, ay: d.h * k - 4 }; })(),
  ],
};
