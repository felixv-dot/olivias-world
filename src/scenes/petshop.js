// Pet Shop: adopt a pet from the adoption corner, feed the fish, give treats and toys to your pets.
import { INK, O, svg, text, windowArt, wearable, NPC } from './common.js';
import { renderPet, randomPet } from '../pets.js';
import { putChar, newId } from '../state.js';

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
const OAK = ['#D9B98F', '#D1AF84', '#E0C29B', '#CBA77B'];

// A pet drawn inside an item (nested svg; inline size beats the .avatar 100% rule).
const petPic = (look, x, y, w = 170) => {
  const h = (w * 260) / 300;
  return renderPet(look).replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${f(h)}" style="width:${w}px;height:${f(h)}px;overflow:visible" `);
};

// ---------- room ----------
const bg = (w) => svg(1600, 900, `
  <defs>
    <linearGradient id="petshop-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF5F3"/><stop offset="1" stop-color="#D5E9E6"/></linearGradient>
    <pattern id="petshop-plaster" width="90" height="90" patternUnits="userSpaceOnUse"><circle cx="12" cy="20" r="1.2" fill="#C6DEDA"/><circle cx="58" cy="44" r="1" fill="#C6DEDA"/><circle cx="30" cy="76" r="1.4" fill="#fff"/><circle cx="76" cy="10" r="1.1" fill="#fff"/></pattern>
    <linearGradient id="petshop-panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BBD8D3"/><stop offset="1" stop-color="#A9CBC5"/></linearGradient>
    <linearGradient id="petshop-fshadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK}" stop-opacity=".24"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient>
    <linearGradient id="petshop-floorfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2F52" stop-opacity=".14"/><stop offset=".6" stop-color="#3A2F52" stop-opacity="0"/></linearGradient>
    <linearGradient id="petshop-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6D2" stop-opacity=".5"/><stop offset="1" stop-color="#FFF6D2" stop-opacity="0"/></linearGradient>
    <linearGradient id="petshop-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9A57C"/><stop offset="1" stop-color="#A9835A"/></linearGradient>
    <radialGradient id="petshop-glow"><stop offset="0" stop-color="#FFF4C4" stop-opacity=".7"/><stop offset="1" stop-color="#FFF4C4" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="620" fill="url(#petshop-wall)"/>
  <rect width="1600" height="400" fill="url(#petshop-plaster)"/>
  <rect width="1600" height="22" fill="#F7FBFA"/><rect y="22" width="1600" height="5" fill="#BFD8D4"/>
  <rect y="400" width="1600" height="220" fill="url(#petshop-panel)"/>
  ${Array.from({ length: 58 }, (_, i) => `<path d="M${i * 28} 404 V600" stroke="#93B8B1" stroke-width="2"/><path d="M${i * 28 + 2} 404 V600" stroke="#fff" stroke-width="1" opacity=".35"/>`).join('')}
  <rect y="392" width="1600" height="14" fill="#F7FBFA"/><rect y="406" width="1600" height="5" fill="${INK}" opacity=".08"/>
  <rect y="596" width="1600" height="26" fill="#F7FBFA"/>
  ${perspFloor({ cols: 44, rows: 5, stagger: true, fill: (j, k) => OAK[(j * 7 + k * 3 + 40) % 4], stroke: '#B08B62', sw: 1.2 })}
  <rect y="620" width="1600" height="280" fill="url(#petshop-floorfade)"/>
  <rect y="620" width="1600" height="44" fill="url(#petshop-fshadow)"/>
  ${windowArt(650, 96, 220, 200, w.weather, '#F5DE7A')}
  ${w.weather === 'sun' ? `<path d="M640 322 L880 322 L1000 900 L560 900 Z" fill="url(#petshop-beam)" opacity=".7"/>` : ''}
  <g transform="translate(96 40)">
    <path d="M30 0 V34 M210 0 V34" stroke="${INK}" stroke-width="2"/>
    <rect x="0" y="30" width="240" height="64" rx="10" fill="url(#petshop-wood)" stroke="${INK}" stroke-width="2"/>
    <rect x="8" y="38" width="224" height="48" rx="6" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
    ${text(120, 72, 'Sunny Pets', 30, '#FBF8F0', 600)}
  </g>
  <g transform="translate(430 440)">
    <rect width="666" height="22" rx="3" fill="url(#petshop-wood)" stroke="${INK}" stroke-width="2"/>
    <rect y="22" width="666" height="8" fill="${INK}" opacity=".1"/>
    ${[40, 626].map((x) => `<path d="M${x - 12} 22 H${x + 12} L${x} 70 Z" fill="url(#petshop-wood)" stroke="${INK}" stroke-width="2"/>`).join('')}
    <g transform="translate(333 -2)"><rect x="-104" y="-8" width="208" height="30" rx="4" fill="#FBF8F0" stroke="${INK}" stroke-width="1.6"/>${text(0, 13, 'ADOPT A FRIEND ♡', 15, '#3B8F86', 600)}</g>
  </g>
  <g transform="translate(1224 120)">
    ${[110, 220].map((y) => `<rect x="0" y="${y}" width="360" height="12" rx="2" fill="url(#petshop-wood)" stroke="${INK}" stroke-width="1.6"/><rect x="4" y="${y + 12}" width="352" height="6" fill="${INK}" opacity=".08"/>`).join('')}
    ${[[10, '#C9B8F2'], [70, '#9EDDD4'], [130, '#F5DE7A']].map(([x, c]) => `<path d="M${x} 110 L${x + 4} 40 Q${x + 26} 30 ${x + 48} 40 L${x + 52} 110 Z" fill="${c}" stroke="${INK}" stroke-width="1.6"/><path d="M${x + 8} 48 Q${x + 26} 42 ${x + 44} 48" stroke="${INK}" stroke-width="1.4" fill="none" opacity=".5"/><circle cx="${x + 26}" cy="78" r="10" fill="#fff" opacity=".7"/>`).join('')}
    ${[200, 236, 272, 308].map((x, i) => `<rect x="${x}" y="70" width="30" height="40" rx="4" fill="${['#8FC3F0', '#E58F6A', '#8FC3F0', '#B79CF0'][i]}" stroke="${INK}" stroke-width="1.4"/><rect x="${x}" y="80" width="30" height="12" fill="#fff" opacity=".6"/>`).join('')}
    ${[14, 64, 114, 164].map((x, i) => `<circle cx="${x + 18}" cy="200" r="18" fill="${['#F5DE7A', '#3CC7B8', '#E58F6A', '#B79CF0'][i]}" stroke="${INK}" stroke-width="1.6"/><path d="M${x + 4} 194 Q${x + 18} 206 ${x + 32} 194" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>`).join('')}
    <g transform="translate(220 160)"><rect width="120" height="58" rx="6" fill="#FBF8F0" stroke="${INK}" stroke-width="1.6"/><path d="M14 30 Q30 10 46 30 T78 30 T106 30" stroke="#3CC7B8" stroke-width="5" fill="none" stroke-linecap="round"/></g>
  </g>
  ${[500, 1010].map((x) => `<g transform="translate(${x} 0)"><path d="M0 26 V80" stroke="${INK}" stroke-width="2"/><circle cx="0" cy="130" r="80" fill="url(#petshop-glow)"/>
    <path d="M-30 110 Q-28 82 0 80 Q28 82 30 110 Z" fill="#3CC7B8" stroke="${INK}" stroke-width="2"/><ellipse cx="0" cy="111" rx="16" ry="4" fill="#FFF4C4"/></g>`).join('')}`);

// ---------- adoptable pets ----------
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
  <path d="M0 -14 V0" stroke="${INK}" stroke-width="1.4"/>
  <path d="M-34 0 H34 L40 12 L34 24 H-34 L-40 12 Z" fill="${adopted ? '#3CC7B8' : '#FBF8F0'}" stroke="${INK}" stroke-width="1.6"/>
  <circle cx="-30" cy="12" r="2.4" fill="${INK}"/>
  ${text(4, 17, adopted ? 'Home ♡' : label, 13, adopted ? '#fff' : INK, 600)}</g>`;

const basket = (id, x, look, name) => ({
  id, x, y: 262, w: 280, h: 188, drag: false, cls: 'pet-item', data: { look, name, adopted: false },
  onTap: adopt,
  art: (it) => svg(280, 188, `
    <defs><linearGradient id="petshop-wick" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6CB9F"/><stop offset="1" stop-color="#BE976A"/></linearGradient></defs>
    ${shadow(140, 182, 124, 8, 0.18)}
    <ellipse cx="140" cy="112" rx="118" ry="24" fill="#A47E52" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="140" cy="116" rx="104" ry="17" fill="${it.data.adopted ? '#C9B8F2' : '#B3A0E4'}"/>
    ${it.data.adopted ? `<path d="M120 112 Q140 96 160 112" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>` : petPic(it.data.look, 55, -14)}
    <path d="M22 112 Q140 140 258 112 L244 176 Q140 192 36 176 Z" fill="url(#petshop-wick)" stroke="${INK}" stroke-width="2"/>
    ${[128, 144, 160].map((y) => `<path d="M${30 + (y - 112) * 0.2} ${y} Q140 ${y + 24} ${250 - (y - 112) * 0.2} ${y}" stroke="#A47E52" stroke-width="2" fill="none" opacity=".6"/>`).join('')}
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${44 + i * 18} ${120 + Math.abs(i - 5.5) * -1.2 + 12} L${46 + i * 17.4} 178" stroke="#A47E52" stroke-width="1.4" opacity=".4"/>`).join('')}
    <path d="M22 112 Q140 140 258 112" stroke="#D9B98F" stroke-width="8" fill="none"/>
    ${tag(232, 132, name, it.data.adopted)}`),
});

const pen = (id, x, look, name) => ({
  id, x, y: 600, w: 300, h: 222, drag: false, cls: 'pet-item', data: { look, name, adopted: false },
  onTap: adopt,
  art: (it) => svg(300, 222, `
    <defs><linearGradient id="petshop-penw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7EEDC"/><stop offset="1" stop-color="#E2D2B4"/></linearGradient></defs>
    ${shadow(150, 214, 146, 10, 0.18)}
    <path d="M20 60 H280" stroke="#D9C8A6" stroke-width="10" stroke-linecap="round"/>
    <path d="M20 60 H280" stroke="${INK}" stroke-width="1.4" opacity=".5"/>
    <ellipse cx="150" cy="176" rx="124" ry="26" fill="#BFE0DB"/><ellipse cx="150" cy="172" rx="100" ry="18" fill="#D5ECE8"/>
    ${it.data.adopted ? '' : petPic(it.data.look, 65, -6)}
    ${Array.from({ length: 11 }, (_, i) => `<rect x="${14 + i * 27}" y="104" width="10" height="104" rx="4" fill="url(#petshop-penw)" stroke="${INK}" stroke-width="1.6"/>`).join('')}
    <rect x="6" y="110" width="288" height="12" rx="5" fill="url(#petshop-penw)" stroke="${INK}" stroke-width="1.8"/>
    <rect x="6" y="186" width="288" height="12" rx="5" fill="url(#petshop-penw)" stroke="${INK}" stroke-width="1.8"/>
    ${tag(150, 146, name, it.data.adopted)}`),
});

// ---------- small things ----------
const kibbleArt = (full) => `<path d="M8 22 H102 L94 52 Q92 58 84 58 H26 Q18 58 16 52 Z" fill="#3CC7B8" stroke="${INK}" stroke-width="2"/>
  <ellipse cx="55" cy="22" rx="47" ry="10" fill="#2A9C90" stroke="${INK}" stroke-width="2"/>
  ${full ? `<path d="M14 22 Q55 2 96 22 Q55 30 14 22 Z" fill="#C99772"/>${[[32, 16], [46, 12], [60, 14], [74, 17], [40, 20], [66, 21], [54, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#A87A5A" stroke="#8B6450" stroke-width="1"/>`).join('')}` : ''}
  <path d="M20 34 H90" stroke="#fff" stroke-width="3" opacity=".35"/>${text(55, 50, 'PET', 11, '#fff', 600)}`;

const treatArt = `<path d="M10 12 Q2 6 8 0 Q14 -2 16 6 H48 Q50 -2 56 0 Q62 6 54 12 Q62 18 56 24 Q50 26 48 18 H16 Q14 26 8 24 Q2 18 10 12 Z" transform="translate(0 6)" fill="#F0C27A" stroke="${INK}" stroke-width="2"/><path d="M20 16 H44" stroke="#fff" stroke-width="2.5" opacity=".6" stroke-linecap="round"/>`;

const toy = (id, x, y, w, h, body, line) => ({
  id, x, y, w, h,
  onTap: (it, api) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.sfx.boing(); },
  onGive: (it, api, who) => {
    api.sfx.boing();
    api.react(who, who.def.kind === 'pet' ? line : 'Wanna play? 😄', ['🎾', '💜', '✨']);
    api.snap(it, Math.max(10, who.x - w - 6), Math.min(820, who.y + who.h - h));
  },
  art: () => svg(w, h, body),
});

export const PETSHOP = {
  id: 'petshop', title: 'Pet Shop 🐾', weather: true, avatar: [1032, 470],
  frame: 'linear-gradient(#E3F1EF 69%, #D3B48A 69%)',
  bg,
  init: (api) => {
    const b = api.get('pet-new');
    if (b) {
      b.data.look = randomPet();
      b.data.name = NAMES[Math.floor(Math.random() * NAMES.length)];
      api.setArt(b);
    }
  },
  stars: [{ id: 'petshop-sack', x: 368, y: 744 }],
  characters: [
    { id: 'keeper', look: { ...NPC.leo, top: 'sweater', topColor: '#3CC7B8', collar: 'round', neck: 'none', bottom: 'widePants', bottomColor: '#4D5C9A', shoes: 'boots', shoesColor: '#2E2A3A' }, x: 1344, y: 216, s: 0.92, z: 30, drag: false,
      say: ['Welcome to Sunny Pets! 🐾', 'Tap a pet to adopt them 💜', 'Treats are in the jar! 🦴', 'Give a toy to your pet 🎾', 'Our fish love visitors! 🐠'] },
  ],
  items: [
    { id: 'aquarium', x: 30, y: 236, w: 340, h: 576, drag: false, data: { taps: 0 },
      onTap: (it, api) => {
        it.el.classList.remove('sx-dart'); void it.el.offsetWidth; it.el.classList.add('sx-dart', 'sx-bubbling');
        api.sfx.pour();
        api.later(() => it.el.classList.remove('sx-bubbling'), 2400);
        it.data.taps++;
        if (it.data.taps === 3 && !api.starFound('petshop-tank')) {
          api.addStar('petshop-tank', it.x + 220, it.y + 180, { spawned: true });
          api.bubble(it.x + 170, it.y - 6, 'Something shiny in the tank! ⭐');
        } else api.bubble(it.x + 170, it.y - 6, ['Blub blub! 🐠', 'Look at them swim! 🐟', 'Bubbles! 🫧'][it.data.taps % 3]);
      },
      art: () => {
        const fish = (x, y, c, c2, s, dur, delay, flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><g class="sx-fishdart"><g class="sx-fish" style="animation-duration:${dur}s;animation-delay:${delay}s">
          <path d="M-22 0 Q-8 -14 12 -10 Q24 -4 26 0 Q24 4 12 10 Q-8 14 -22 0 Z" fill="${c}" stroke="${INK}" stroke-width="1.4"/>
          <path d="M-20 0 L-34 -10 L-30 0 L-34 10 Z" fill="${c2}" stroke="${INK}" stroke-width="1.2"/>
          <path d="M-4 -11 Q2 -18 8 -10" fill="${c2}"/><path d="M-6 -6 Q-2 0 -6 6 M2 -8 Q6 0 2 8" stroke="${c2}" stroke-width="3" fill="none" opacity=".8"/>
          <circle cx="16" cy="-2" r="2.4" fill="#2A2038"/><circle cx="16.8" cy="-2.8" r=".8" fill="#fff"/></g></g></g>`;
        return svg(340, 576, `
          <defs>
            <linearGradient id="petshop-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE9F2"/><stop offset=".6" stop-color="#7FCBD9"/><stop offset="1" stop-color="#4FA9BB"/></linearGradient>
            <linearGradient id="petshop-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3E3BE"/><stop offset="1" stop-color="#DCC598"/></linearGradient>
            <linearGradient id="petshop-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".12" stop-color="#fff" stop-opacity="0"/><stop offset=".88" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient>
            <linearGradient id="petshop-cab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E4E74"/><stop offset="1" stop-color="#43355A"/></linearGradient>
            <clipPath id="petshop-tankclip"><rect x="16" y="26" width="308" height="226"/></clipPath>
          </defs>
          ${shadow(170, 566, 164, 10, 0.2)}
          <rect x="10" y="276" width="320" height="286" rx="4" fill="url(#petshop-cab)" stroke="${INK}" stroke-width="2"/>
          <rect x="24" y="294" width="138" height="250" rx="3" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2.5"/><rect x="178" y="294" width="138" height="250" rx="3" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2.5"/>
          <rect x="146" y="404" width="6" height="34" rx="3" fill="#D6B36A"/><rect x="188" y="404" width="6" height="34" rx="3" fill="#D6B36A"/>
          <rect x="4" y="262" width="332" height="18" rx="3" fill="#6E5C88" stroke="${INK}" stroke-width="2"/>
          <rect x="12" y="20" width="316" height="244" rx="4" fill="url(#petshop-water)" stroke="${INK}" stroke-width="2.4"/>
          <g clip-path="url(#petshop-tankclip)">
            <path d="M16 70 Q120 54 200 74 T324 64" stroke="#fff" stroke-width="2" fill="none" opacity=".3"/>
            <path d="M40 26 L90 252 M150 26 L190 252 M250 26 L290 252" stroke="#fff" stroke-width="18" opacity=".08"/>
            <path d="M16 222 Q90 206 170 218 T324 212 V252 H16 Z" fill="url(#petshop-sand)"/>
            ${[[40, 234, 14], [70, 240, 9], [262, 230, 16], [296, 238, 10], [190, 240, 8]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="${['#A9AEC2', '#C9B8F2', '#8E94A8', '#B7BCCD', '#9EDDD4'][r % 5]}" stroke="${INK}" stroke-width="1.2"/>`).join('')}
            <g class="sx-sway" style="transform-origin:60px 230px"><path d="M60 230 Q44 190 62 160 Q78 130 60 96" stroke="#4E9B5A" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M60 200 Q80 186 84 168 M58 150 Q40 136 38 118" stroke="#6DBE7A" stroke-width="7" fill="none" stroke-linecap="round"/></g>
            <g class="sx-sway" style="transform-origin:280px 228px;animation-delay:-1.4s"><path d="M280 228 Q296 196 278 164 Q262 136 282 110 Q292 94 284 76" stroke="#5AAE6A" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M278 186 Q256 176 250 156" stroke="#7FCF8A" stroke-width="6" fill="none" stroke-linecap="round"/></g>
            <g transform="translate(150 176)"><path d="M0 56 V10 Q0 0 10 0 H48 Q58 0 58 10 V56 Z" fill="#C9B8F2" stroke="${INK}" stroke-width="1.6"/><path d="M18 56 V36 Q18 26 29 26 Q40 26 40 36 V56 Z" fill="#4A3B5C" opacity=".6"/><path d="M8 8 H50" stroke="#fff" stroke-width="2" opacity=".5"/></g>
            ${fish(110, 100, '#F5DE7A', '#F0B35A', 1.1, 7, 0)}
            ${fish(220, 140, '#8FC3F0', '#4D5C9A', 0.9, 9, -3, true)}
            ${fish(170, 70, '#3CC7B8', '#2A9C90', 0.8, 6, -1.5)}
            ${fish(90, 180, '#B79CF0', '#7A64B0', 1, 8, -4, true)}
            <g class="sx-bub" fill="#fff" fill-opacity=".35" stroke="#fff" stroke-width="1.5">${[[100, 200, 5], [110, 170, 3.5], [96, 140, 4], [240, 210, 6], [250, 160, 4], [236, 120, 3], [180, 190, 4.5]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" style="animation-delay:${(i * 0.23).toFixed(2)}s"/>`).join('')}</g>
          </g>
          <rect x="12" y="20" width="316" height="244" rx="4" fill="url(#petshop-glass)"/>
          <rect x="4" y="8" width="332" height="20" rx="4" fill="#43355A" stroke="${INK}" stroke-width="2"/>
          <rect x="250" y="12" width="60" height="8" rx="4" fill="#FFF4C4" opacity=".9"/>`);
      } },
    basket('pet-cat', 456, { type: 'cat', fur: '#A9AEC2', pattern: 'stripes', eyes: '#36A7B5', acc: 'collar', accColor: '#B79CF0', glasses: 'none', hat: 'none' }, 'Nimbus'),
    basket('pet-new', 790, { type: 'bunny', fur: '#FBF7EF', pattern: 'none', eyes: '#8D6CC9', acc: 'bow', accColor: '#8FC3F0', glasses: 'none', hat: 'none' }, 'Mochi'),
    pen('pet-dog', 440, { type: 'dog', fur: '#F3D9A8', pattern: 'patch', eyes: '#8B6450', acc: 'scarf', accColor: '#3CC7B8', glasses: 'none', hat: 'none' }, 'Biscuit'),
    pen('pet-fox', 752, { type: 'fox', fur: '#F0A060', pattern: 'socks', eyes: '#4E9B5A', acc: 'none', accColor: '#F5DE7A', glasses: 'none', hat: 'none' }, 'Maple'),
    { id: 'counter', x: 1200, y: 466, w: 400, h: 346, z: 40, drag: false,
      art: () => svg(400, 346, `
        <defs><linearGradient id="petshop-ctr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5EEE0"/><stop offset="1" stop-color="#E2D4BA"/></linearGradient>
          <linearGradient id="petshop-ctop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9A57C"/><stop offset="1" stop-color="#A9835A"/></linearGradient></defs>
        ${shadow(200, 336, 196, 10, 0.2)}
        <rect x="8" y="20" width="384" height="314" fill="url(#petshop-ctr)" stroke="${INK}" stroke-width="2"/>
        ${Array.from({ length: 13 }, (_, i) => `<path d="M${22 + i * 29} 30 V326" stroke="#D2C2A2" stroke-width="2"/>`).join('')}
        <rect x="8" y="300" width="384" height="34" fill="#3CC7B8" stroke="${INK}" stroke-width="2"/>
        <g transform="translate(200 160)"><circle r="46" fill="#FBF8F0" stroke="${INK}" stroke-width="2"/>
          <g fill="#3CC7B8"><ellipse cx="0" cy="10" rx="16" ry="13"/><ellipse cx="-17" cy="-8" rx="7" ry="9"/><ellipse cx="-6" cy="-18" rx="7" ry="9"/><ellipse cx="7" cy="-18" rx="7" ry="9"/><ellipse cx="18" cy="-8" rx="7" ry="9"/></g></g>
        <rect x="0" y="0" width="400" height="24" rx="4" fill="url(#petshop-ctop)" stroke="${INK}" stroke-width="2"/>
        <path d="M10 8 H390" stroke="#fff" stroke-width="2" opacity=".3"/>`) },
    { id: 'treats', x: 1216, y: 380, w: 92, h: 100, z: 45, drag: false,
      onTap: (it, api) => {
        if (api.count('treat') >= 3) { api.bubble(it.x + 46, it.y - 8, 'Share those treats first! 🦴'); return; }
        api.sfx.pop();
        api.add({
          id: api.uid('treat'), x: it.x + 100 + api.count('treat') * 44, y: it.y + 52, w: 64, h: 40, cls: 'food',
          art: () => svg(64, 40, treatArt),
          onGive: (i, a, who) => a.eat(i, who, who.def.kind === 'pet' ? 'Crunchy treat! 🦴' : 'Hmm... a dog biscuit? 😄', ['🦴', '💜', '✨']),
        }, { spawned: true });
      },
      art: () => svg(92, 100, `
        <defs><linearGradient id="petshop-jar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E8F6FF" stop-opacity=".7"/><stop offset=".3" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#D2E6F2" stop-opacity=".7"/></linearGradient></defs>
        <rect x="8" y="26" width="76" height="72" rx="14" fill="url(#petshop-jar)" stroke="${INK}" stroke-width="2"/>
        <g transform="translate(16 50) scale(.9)">${treatArt}</g><g transform="translate(24 70) rotate(-14) scale(.8)">${treatArt}</g>
        <rect x="14" y="12" width="64" height="18" rx="5" fill="#B79CF0" stroke="${INK}" stroke-width="2"/><rect x="38" y="4" width="16" height="10" rx="4" fill="#9A80D8" stroke="${INK}" stroke-width="1.6"/>
        <rect x="14" y="34" width="5" height="50" rx="2.5" fill="#fff" opacity=".7"/>`) },
    { id: 'register', x: 1450, y: 366, w: 132, h: 106, z: 45, drag: false,
      onTap: (it, api) => { api.sfx.win(); api.bubble(it.x + 66, it.y - 8, 'Ding! Thanks for visiting 💜'); api.sparkle(it.x + 66, it.y + 20, ['✨', '💜']); },
      art: () => svg(132, 106, `
        <defs><linearGradient id="petshop-reg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E5C88"/><stop offset="1" stop-color="#43355A"/></linearGradient></defs>
        <path d="M10 50 H122 L128 102 H4 Z" fill="url(#petshop-reg)" stroke="${INK}" stroke-width="2"/>
        <rect x="26" y="8" width="80" height="40" rx="5" fill="#2E2A3A" stroke="${INK}" stroke-width="2"/><rect x="32" y="14" width="68" height="20" rx="3" fill="#9EDDD4"/>${text(66, 30, '♡ 0.00', 13, '#2E2A3A', 600)}
        ${Array.from({ length: 8 }, (_, i) => `<rect x="${20 + (i % 4) * 24}" y="${58 + Math.floor(i / 4) * 16}" width="18" height="10" rx="2" fill="${i === 7 ? '#F5DE7A' : '#FBF8F0'}" stroke="${INK}" stroke-width="1"/>`).join('')}`) },
    { id: 'birdcage', x: 1112, y: 28, w: 140, h: 236, drag: false,
      onTap: (it, api) => {
        it.el.classList.remove('sx-hopbird'); void it.el.offsetWidth; it.el.classList.add('sx-hopbird');
        api.sfx.tap(); api.later(() => api.sfx.tap(), 140);
        api.bubble(it.x + 70, it.y + 30, ['Tweet tweet! 🐦', 'Chirp! 🎶', 'Pretty bird! 💙'][Math.floor(Math.random() * 3)]);
      },
      art: () => svg(140, 236, `
        <defs>${'<linearGradient id="petshop-brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B88F4A"/><stop offset=".4" stop-color="#F6E2A8"/><stop offset="1" stop-color="#9C7638"/></linearGradient>'}</defs>
        <path d="M70 0 V30" stroke="${INK}" stroke-width="2"/><circle cx="70" cy="36" r="7" fill="none" stroke="url(#petshop-brass)" stroke-width="3"/>
        <path d="M14 214 V110 Q14 44 70 42 Q126 44 126 110 V214" fill="#fff" fill-opacity=".15" stroke="url(#petshop-brass)" stroke-width="3"/>
        ${[30, 50, 70, 90, 110].map((x) => `<path d="M${x} ${x === 70 ? 42 : 214} V214 M${x} 214 Q${x} 70 70 44" stroke="url(#petshop-brass)" stroke-width="2" fill="none"/>`).join('')}
        <path d="M14 120 H126" stroke="url(#petshop-brass)" stroke-width="2.5"/>
        <path d="M30 168 H110" stroke="#A87A5A" stroke-width="4" stroke-linecap="round"/>
        <g class="sx-bird"><g transform="translate(70 150)">
          <path d="M-18 0 Q-20 -22 0 -26 Q20 -24 18 -4 Q14 14 -2 14 Q-16 14 -18 0 Z" fill="#8FC3F0" stroke="${INK}" stroke-width="1.6"/>
          <path d="M-14 -2 Q-2 -6 8 6 Q-6 12 -14 -2 Z" fill="#4F86C6"/>
          <path d="M16 12 L30 22 L20 8 Z" fill="#4F86C6" stroke="${INK}" stroke-width="1.2"/>
          <path d="M-8 -26 Q-4 -34 2 -26" fill="#F5DE7A"/>
          <circle cx="-6" cy="-14" r="2.6" fill="#2A2038"/><path d="M-16 -12 L-24 -9 L-16 -7 Z" fill="#F0B35A" stroke="${INK}" stroke-width="1"/>
          <path d="M-6 14 V20 M2 14 V20" stroke="#F0B35A" stroke-width="2"/></g></g>
        <ellipse cx="70" cy="216" rx="62" ry="10" fill="#D6B36A" stroke="${INK}" stroke-width="2"/>
        <rect x="8" y="214" width="124" height="16" rx="4" fill="url(#petshop-brass)" stroke="${INK}" stroke-width="2"/>`) },
    { id: 'bowl', x: 1046, y: 818, w: 110, h: 62, data: { full: true },
      onTap: (it, api) => {
        if (it.data.full) { api.bubble(it.x + 55, it.y - 8, 'Drag the bowl to a pet! 🐾'); return; }
        it.data.full = true; api.setArt(it); api.sfx.pour(); api.bubble(it.x + 55, it.y - 8, 'Filled up! 🥣');
      },
      onGive: (it, api, who) => {
        if (!it.data.full) { api.bubble(who.x + who.w / 2, who.y - 6, 'Empty! Tap the bowl to refill it.'); return; }
        it.data.full = false; api.setArt(it); api.sfx.yum();
        api.react(who, who.def.kind === 'pet' ? 'Yum, kibble! 🥣' : "That's pet food, silly! 😄", ['🦴', '💜', '✨']);
      },
      art: (it) => svg(110, 62, kibbleArt(it.data.full)) },
    toy('ball', 1176, 828, 56, 56, `
      <defs><radialGradient id="petshop-ball" cx=".35" cy=".3"><stop offset="0" stop-color="#F7F0A8"/><stop offset="1" stop-color="#C9D84A"/></radialGradient></defs>
      <circle cx="28" cy="28" r="25" fill="url(#petshop-ball)" stroke="${INK}" stroke-width="2"/>
      <path d="M6 18 Q28 30 22 52 M50 38 Q28 26 34 4" stroke="#fff" stroke-width="3.5" fill="none"/>`, 'Fetch! 🎾'),
    toy('mouse', 300, 832, 92, 48, `
      <path d="M8 30 Q-6 22 4 10" stroke="#C9B8F2" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M10 34 Q12 8 46 8 Q74 10 86 34 Q80 42 46 42 Q14 42 10 34 Z" fill="#A9AEC2" stroke="${INK}" stroke-width="2"/>
      <circle cx="62" cy="12" r="9" fill="#C9CDDC" stroke="${INK}" stroke-width="1.8"/><circle cx="62" cy="12" r="4" fill="#E2C2CC"/>
      <circle cx="84" cy="32" r="3" fill="#E58F6A"/><path d="M24 18 Q40 12 54 16" stroke="#fff" stroke-width="2.5" fill="none" opacity=".5"/>`, 'Pounce! 🐭'),
    { id: 'sack', x: 338, y: 680, w: 120, h: 150,
      onTap: (it, api) => { api.bubble(it.x + 60, it.y - 8, 'A big bag of crunchy kibble! 🦴'); },
      art: () => svg(120, 150, `
        <defs><linearGradient id="petshop-sackg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E9DCC0"/><stop offset=".5" stop-color="#F7EEDC"/><stop offset="1" stop-color="#D6C4A0"/></linearGradient></defs>
        ${shadow(60, 144, 54, 7, 0.18)}
        <path d="M18 24 L102 24 Q114 80 106 140 Q60 150 14 140 Q6 80 18 24 Z" fill="url(#petshop-sackg)" stroke="${INK}" stroke-width="2"/>
        <path d="M14 10 Q60 -2 106 10 L102 28 Q60 18 18 28 Z" fill="#D6C4A0" stroke="${INK}" stroke-width="2"/>
        <path d="M20 14 l6 8 M36 10 l4 10 M54 8 l2 10 M72 8 l-2 10 M90 12 l-4 8" stroke="${INK}" stroke-width="1.4" opacity=".5"/>
        <rect x="24" y="52" width="72" height="58" rx="6" fill="#3CC7B8" stroke="${INK}" stroke-width="1.6"/>
        ${text(60, 76, 'KIBBLE', 14, '#fff', 600)}
        <g fill="#fff" transform="translate(60 94) scale(.5)"><ellipse cx="0" cy="8" rx="12" ry="10"/><ellipse cx="-13" cy="-6" rx="5" ry="7"/><ellipse cx="-4" cy="-14" rx="5" ry="7"/><ellipse cx="6" cy="-14" rx="5" ry="7"/><ellipse cx="14" cy="-6" rx="5" ry="7"/></g>`) },
    { id: 'petbed', x: 120, y: 800, w: 200, h: 86, floor: true,
      onTap: (it, api) => { api.bubble(it.x + 100, it.y - 8, 'A cosy nap spot 💤'); api.sparkle(it.x + 100, it.y + 30, ['💤', '💜']); },
      art: () => svg(200, 86, `
        <defs><radialGradient id="petshop-bedin" cx=".5" cy=".4"><stop offset="0" stop-color="#D9CCF6"/><stop offset="1" stop-color="#B3A0E4"/></radialGradient></defs>
        <ellipse cx="100" cy="52" rx="96" ry="32" fill="#8E73CF" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="100" cy="46" rx="74" ry="20" fill="url(#petshop-bedin)" stroke="${INK}" stroke-width="1.6"/>
        <path d="M30 60 Q100 84 170 60" stroke="#fff" stroke-width="3" fill="none" opacity=".35"/>`) },
    wearable('cap', 478, 826, 'petshop-cap'),
  ],
};
