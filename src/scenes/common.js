// Shared art + building blocks for Sunny Planet scenes.
import { PRESETS } from '../avatar.js';

export const INK = '#4A3B5C';
export const O = 'class="o"';
export const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" overflow="visible">${body}</svg>`;
export const label = (x, y, text, w = 150) => `<rect ${O} x="${x - w / 2}" y="${y - 26}" width="${w}" height="50" rx="25" fill="#fff" style="stroke-width:3"/>
  <text x="${x}" y="${y + 10}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="600" font-size="31" fill="${INK}">${text}</text>`;
export const text = (x, y, t, size = 24, color = INK, weight = 600) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="${weight}" font-size="${size}" fill="${color}">${t}</text>`;

export function starPath(cx, cy, r, color, extra = '') {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r, a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1);
  }
  return `<path d="${d}Z" fill="${color}" ${extra}/>`;
}

// ---------- sky, clouds, rainbow, window ----------
export function cloud(x, y, s, color, dur) {
  return `<g class="drift" style="animation-duration:${dur}s"><g transform="translate(${x} ${y}) scale(${s})">
    <path ${O} d="M0 46 Q-4 10 36 14 Q52 -16 92 2 Q130 -8 140 30 Q176 30 172 58 Q170 70 156 70 L14 70 Q-6 68 0 46 Z" fill="${color}"/></g></g>`;
}
export function sky({ weather, rainbow }, h = 900, id = 'sky') {
  const sunny = weather === 'sun';
  const c = sunny ? '#FFFFFF' : '#DCE1EA';
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${sunny ? '#A9DCFF' : '#97A5BC'}"/><stop offset="1" stop-color="${sunny ? '#FFF1D6' : '#CDD4DF'}"/></linearGradient>
      <radialGradient id="${id}-sun"><stop offset="0" stop-color="#FFF6C8"/><stop offset=".55" stop-color="#FFE27A" stop-opacity=".6"/><stop offset="1" stop-color="#FFE27A" stop-opacity="0"/></radialGradient></defs>
    <rect width="1600" height="${h}" fill="url(#${id})"/>
    ${sunny ? `<circle cx="1380" cy="130" r="170" fill="url(#${id}-sun)"/><circle cx="1380" cy="130" r="66" fill="#FFE68A"/><circle cx="1380" cy="130" r="52" fill="#FFF3B8"/>` : ''}
    ${rainbow ? `<g fill="none" stroke-width="22" opacity=".7" stroke-linecap="round">
      ${['#E58F6A', '#F5DE7A', '#9EDDD4', '#8FC3F0', '#B79CF0'].map((col, i) => `<path d="M${260 + i * 22} ${h * 0.62} A${540 - i * 22} ${430 - i * 22} 0 0 1 ${1340 - i * 22} ${h * 0.62}" stroke="${col}"/>`).join('')}</g>` : ''}
    ${cloud(160, 90, 1.1, c, 60)}${cloud(760, 60, 0.8, c, 80)}${cloud(1080, 210, 0.6, c, 70)}
    ${sunny ? '' : `${cloud(420, 150, 1.2, '#C4CBD8', 50)}${cloud(1240, 70, 1, '#C4CBD8', 65)}`}`;
}
export function windowArt(x, y, w, h, weather, curtain = '#B79CF0') {
  const sunny = weather === 'sun';
  return `<g transform="translate(${x} ${y})">
    <rect ${O} width="${w}" height="${h}" rx="14" fill="${sunny ? '#BFE6FF' : '#9EADC4'}" style="stroke-width:4"/>
    ${sunny ? `<circle cx="${w * 0.72}" cy="${h * 0.3}" r="${Math.min(w, h) * 0.11}" fill="#FFE68A"/><path d="M${w * 0.12} ${h * 0.64} q20 -26 46 -10 q14 -18 40 -4 q22 0 18 18 z" fill="#fff"/>
      <path d="M0 ${h * 0.82} Q${w * 0.3} ${h * 0.7} ${w * 0.6} ${h * 0.8} T${w} ${h * 0.76} V${h} H0 Z" fill="#A8DE9A" opacity=".8"/>`
    : `<g stroke="#E8EEF7" stroke-width="3" stroke-linecap="round" opacity=".9">${Array.from({ length: 16 }, (_, i) => `<line x1="${(i * 37) % w + 8}" y1="${(i * 53) % (h - 30) + 10}" x2="${(i * 37) % w + 2}" y2="${(i * 53) % (h - 30) + 26}"/>`).join('')}</g>`}
    <path d="M${w / 2} 4 V${h - 4} M4 ${h / 2} H${w - 4}" stroke="#FBF7EF" stroke-width="7"/>
    <rect ${O} x="-12" y="${h - 6}" width="${w + 24}" height="18" rx="6" fill="#FBF7EF"/>
    <path ${O} d="M-30 -14 Q${w * 0.18} ${h * 0.4} -6 ${h + 4} L-30 ${h + 4} Z" fill="${curtain}"/>
    <path ${O} d="M${w + 30} -14 Q${w * 0.82} ${h * 0.4} ${w + 6} ${h + 4} L${w + 30} ${h + 4} Z" fill="${curtain}"/>
    <rect ${O} x="-44" y="-26" width="${w + 88}" height="16" rx="8" fill="#C9A57C"/>
  </g>`;
}
export function stringLights(x1, x2, y, sag, on = true) {
  let bulbs = '';
  const n = Math.round((x2 - x1) / 70);
  const cols = ['#F5DE7A', '#9EDDD4', '#C9B8F2', '#8FC3F0', '#F0B39A'];
  for (let i = 1; i < n; i++) {
    const t = i / n, x = x1 + (x2 - x1) * t, yy = y + Math.sin(t * Math.PI) * sag;
    bulbs += `${on ? `<circle cx="${x}" cy="${yy + 12}" r="16" fill="${cols[i % 5]}" opacity=".35"/>` : ''}<ellipse ${O} cx="${x}" cy="${yy + 12}" rx="7" ry="10" fill="${on ? cols[i % 5] : '#D8D2E6'}" style="stroke-width:2"/>`;
  }
  return `<path d="M${x1} ${y} Q${(x1 + x2) / 2} ${y + sag * 2} ${x2} ${y}" fill="none" stroke="${INK}" stroke-width="2.5"/>${bulbs}`;
}

// ---------- shared props ----------
export function plantArt(kind = 'snake') {
  if (kind === 'monstera') {
    return svg(150, 230, `
      <path d="M75 140 Q20 120 14 70 Q50 70 72 128 Z" fill="#5AAE6A" stroke="${INK}" stroke-width="2.6"/>
      <path d="M76 140 Q130 110 138 56 Q100 64 78 128 Z" fill="#4E9B5A" stroke="${INK}" stroke-width="2.6"/>
      <path d="M74 142 Q50 60 78 16 Q104 60 80 142 Z" fill="#6DBE7A" stroke="${INK}" stroke-width="2.6"/>
      <path d="M78 30 V130 M40 84 L72 120 M120 76 L84 118" stroke="#3E8A50" stroke-width="2" opacity=".6"/>
      <path ${O} d="M28 140 H122 L110 224 H40 Z" fill="#FBF7EF"/><path d="M32 170 H118" stroke="#9EDDD4" stroke-width="10"/>`);
  }
  return svg(130, 220, `
    <path d="M65 130 Q30 90 20 40 Q60 70 66 120 Z" fill="#6DBE7A" stroke="${INK}" stroke-width="2.6"/>
    <path d="M66 130 Q100 80 116 30 Q80 60 62 120 Z" fill="#5AAE6A" stroke="${INK}" stroke-width="2.6"/>
    <path d="M64 132 Q60 70 70 10 Q84 70 70 132 Z" fill="#7FCF8A" stroke="${INK}" stroke-width="2.6"/>
    <path ${O} d="M24 128 H106 L96 214 H34 Z" fill="#E58F6A"/>
    <rect ${O} x="18" y="120" width="94" height="22" rx="8" fill="#F0A584"/>`);
}

// ---------- food you can give to any character ----------
const FOOD = {
  apple: { w: 60, h: 64, text: 'Crunchy! 🍎', art: `<path ${O} d="M30 18 C10 6 -2 30 8 48 C16 62 26 62 30 58 C34 62 44 62 52 48 C62 30 50 6 30 18 Z" fill="#E58F6A"/><path ${O} d="M30 18 Q32 6 38 2" fill="none"/><path d="M34 10 Q46 2 50 12 Q40 16 34 10 Z" fill="#6DBE7A" stroke="${INK}" stroke-width="2"/><ellipse cx="18" cy="30" rx="5" ry="8" fill="#fff" opacity=".5"/>` },
  milk: { w: 50, h: 84, text: 'Mmm, milk! 🥛', art: `<path ${O} d="M8 26 L25 6 L42 26 V80 H8 Z" fill="#fff"/><path ${O} d="M8 26 H42" style="stroke-width:2"/><rect x="12" y="40" width="26" height="22" rx="4" fill="#8FC3F0"/><circle cx="25" cy="51" r="6" fill="#fff"/>` },
  cupcake: { w: 70, h: 72, text: 'Sweet! 🧁', art: `<path ${O} d="M12 38 H58 L52 70 H18 Z" fill="#8FC3F0"/><path class="ln" stroke-width="2" opacity=".5" d="M24 40 L26 68 M35 40 V68 M46 40 L44 68"/><path ${O} d="M8 40 Q6 22 22 20 Q26 6 40 10 Q56 8 56 22 Q66 26 62 40 Z" fill="#C9B8F2"/><circle ${O} cx="38" cy="8" r="6" fill="#E58F6A"/>` },
  soup: { w: 96, h: 64, text: 'Yummy soup! 🍲', art: `<path class="ln steam" stroke-width="3" opacity=".6" d="M36 14 Q30 7 36 0 M56 14 Q50 7 56 0"/><path ${O} d="M6 22 H90 Q88 60 48 60 Q8 60 6 22 Z" fill="#fff"/><ellipse ${O} cx="48" cy="22" rx="42" ry="9" fill="#F0B35A" style="stroke-width:2"/><circle cx="36" cy="22" r="4" fill="#6DBE7A"/><circle cx="58" cy="21" r="4" fill="#E58F6A"/>` },
  croissant: { w: 96, h: 58, text: 'So flaky! 🥐', art: `<path ${O} d="M6 46 Q4 26 22 20 Q30 4 48 6 Q66 4 74 20 Q92 26 90 46 Q72 36 48 38 Q24 36 6 46 Z" fill="#F0C27A"/><path class="ln" stroke-width="2" opacity=".5" d="M28 22 Q34 30 30 38 M48 10 V36 M68 22 Q62 30 66 38"/>` },
  donut: { w: 74, h: 74, text: 'Donut time! 🍩', art: `<circle ${O} cx="37" cy="37" r="33" fill="#F0C27A"/><path ${O} d="M8 32 Q10 8 37 6 Q64 8 66 32 Q62 50 37 50 Q12 50 8 32 Z" fill="#C9B8F2"/><circle ${O} cx="37" cy="34" r="10" fill="#FBF7EF"/><path d="M20 22 l4 3 M48 16 l4 -2 M54 34 l3 4 M22 40 l-3 3" stroke="#3CC7B8" stroke-width="4" stroke-linecap="round"/>` },
  macaron: { w: 64, h: 50, text: 'Fancy! 💜', art: `<ellipse ${O} cx="32" cy="34" rx="28" ry="12" fill="#9EDDD4"/><rect x="6" y="24" width="52" height="8" fill="#FBF7EF"/><ellipse ${O} cx="32" cy="20" rx="28" ry="13" fill="#9EDDD4"/>` },
  smoothie: { w: 54, h: 100, text: 'Berry smoothie! 🫐', art: `<path ${O} d="M34 4 L28 30" style="stroke-width:4"/><path ${O} d="M8 28 H46 L40 96 H14 Z" fill="#B79CF0"/><path ${O} d="M6 24 H48 V32 H6 Z" fill="#fff"/><circle cx="20" cy="54" r="4" fill="#fff" opacity=".5"/>` },
  sandwich: { w: 96, h: 64, text: 'Tasty sandwich! 🥪', art: `<path ${O} d="M6 50 L48 8 L90 50 Z" fill="#F7E3A9"/><path d="M14 44 L82 44" stroke="#6DBE7A" stroke-width="8"/><path d="M18 38 L78 38" stroke="#E58F6A" stroke-width="6"/><path ${O} d="M6 50 H90 V58 H6 Z" fill="#F0C27A"/>` },
  watermelon: { w: 96, h: 60, text: 'Juicy! 🍉', art: `<path ${O} d="M6 10 H90 Q88 56 48 56 Q8 56 6 10 Z" fill="#6DBE7A"/><path d="M12 12 H84 Q82 48 48 48 Q14 48 12 12 Z" fill="#F08C7E"/><g fill="${INK}"><ellipse cx="34" cy="26" rx="3" ry="5"/><ellipse cx="50" cy="32" rx="3" ry="5"/><ellipse cx="64" cy="24" rx="3" ry="5"/></g>` },
  cocoa: { w: 76, h: 76, text: 'Warm cocoa! ☕', art: `<path class="ln steam" stroke-width="3" opacity=".6" d="M28 18 Q22 10 28 2 M44 18 Q38 10 44 2"/><path ${O} d="M56 34 Q72 34 70 48 Q68 60 56 58" fill="none" style="stroke-width:4"/><path ${O} d="M10 26 H58 V60 Q58 72 46 72 H22 Q10 72 10 60 Z" fill="#B79CF0"/><ellipse ${O} cx="34" cy="26" rx="24" ry="6" fill="#8B5A3C" style="stroke-width:2"/><rect ${O} x="22" y="18" width="12" height="10" rx="3" fill="#fff" style="stroke-width:1.6"/><rect ${O} x="36" y="16" width="12" height="10" rx="3" fill="#FBF7EF" style="stroke-width:1.6" transform="rotate(14 42 21)"/>${'<path d="M14 46 H54" stroke="#fff" stroke-width="4" opacity=".5"/>'}` },
  marshmallow: { w: 120, h: 40, text: 'Toasty marshmallow! 🔥', art: `<path d="M0 24 H80" stroke="#8B6450" stroke-width="5" stroke-linecap="round"/><rect ${O} x="76" y="6" width="36" height="30" rx="10" fill="#F0C27A"/><path d="M80 12 Q94 6 108 12" stroke="#C9913A" stroke-width="4" fill="none"/>` },
  juice: { w: 50, h: 84, text: 'Orange juice! 🧃', art: `<rect ${O} x="6" y="16" width="38" height="64" rx="6" fill="#F5DE7A"/><path ${O} d="M30 16 L36 0" style="stroke-width:4"/><circle cx="25" cy="48" r="11" fill="#F0B35A"/><path d="M20 44 L30 52 M30 44 L20 52" stroke="#fff" stroke-width="2"/>` },
};
export function food(api, kind, x, y) {
  const f = FOOD[kind];
  const it = api.add({
    id: api.uid(kind), x, y, w: f.w, h: f.h, cls: 'food',
    art: () => svg(f.w, f.h, f.art),
    onGive: (i, a, who) => a.eat(i, who, f.text),
  }, { spawned: true });
  return it;
}

// ---------- wearables: drag onto a character to put them on ----------
const WEAR = {
  sun: { w: 110, h: 46, key: 'glasses', text: 'Cool shades! 😎', art: `<path ${O} d="M6 8 H50 Q52 40 28 42 Q4 40 6 8 Z M60 8 H104 Q106 40 82 42 Q58 40 60 8 Z" fill="#2E2448" style="stroke-width:3"/><path class="ln" stroke-width="3" d="M50 12 Q55 6 60 12"/><path d="M14 16 L26 12 M68 16 L80 12" stroke="#fff" stroke-width="3" opacity=".6"/>` },
  round: { w: 110, h: 50, key: 'glasses', text: 'Smart look! 🤓', art: `<circle ${O} cx="28" cy="25" r="20" fill="#fff" fill-opacity=".3" style="stroke-width:4"/><circle ${O} cx="82" cy="25" r="20" fill="#fff" fill-opacity=".3" style="stroke-width:4"/><path class="ln" stroke-width="4" d="M48 22 Q55 16 62 22"/>` },
  straw: { w: 150, h: 70, key: 'hat', text: 'Perfect for summer! 👒', art: `<ellipse ${O} cx="75" cy="50" rx="70" ry="16" fill="#EBCB86"/><path ${O} d="M44 50 C42 10 108 10 106 50 Z" fill="#F2D9A0"/><path d="M45 40 Q75 34 105 40 V48 Q75 42 45 48 Z" fill="#B79CF0" stroke="${INK}" stroke-width="2"/>` },
  beanie: { w: 110, h: 100, key: 'hat', text: 'Warm and cozy! 🧶', art: `<path ${O} d="M10 86 C4 20 106 20 100 86 Z" fill="#B79CF0"/><path ${O} d="M6 72 Q55 62 104 72 V94 Q55 84 6 94 Z" fill="#9A80D8"/><circle ${O} cx="55" cy="18" r="16" fill="#FBF7EF"/>` },
  earmuffs: { w: 140, h: 90, key: 'hat', text: 'Toasty ears! 🎧', art: `<path d="M24 64 C14 0 126 0 116 64" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M24 64 C14 0 126 0 116 64" fill="none" stroke="#9EDDD4" stroke-width="7" stroke-linecap="round"/><circle ${O} cx="22" cy="66" r="20" fill="#FBF7EF"/><circle ${O} cx="118" cy="66" r="20" fill="#FBF7EF"/><circle cx="22" cy="66" r="10" fill="#9EDDD4"/><circle cx="118" cy="66" r="10" fill="#9EDDD4"/>` },
  scarf: { w: 140, h: 110, key: 'neck', text: 'Snug as a bug! 🧣', art: `<path ${O} d="M10 20 Q70 50 130 20 L130 44 Q70 74 10 44 Z" fill="#F5DE7A"/><path ${O} d="M90 50 L104 106 L82 108 L74 54 Z" fill="#F5DE7A"/><path d="M20 30 Q70 56 120 30 M92 70 L76 74 M96 90 L80 92" stroke="#fff" stroke-width="5" opacity=".6" fill="none"/>` },
  cap: { w: 130, h: 70, key: 'hat', text: 'Nice cap! 🧢', art: `<path ${O} d="M14 56 C10 6 110 6 106 56 Z" fill="#8FC3F0"/><path ${O} d="M10 54 Q60 44 124 52 Q120 66 64 66 Q14 66 10 54 Z" fill="#6FA8DC"/><circle ${O} cx="60" cy="10" r="5" fill="#8FC3F0"/>` },
};
export function wearable(kind, x, y, id = 'wear-' + kind) {
  const f = WEAR[kind];
  return { id, x, y, w: f.w, h: f.h, cls: 'wearable', wear: [f.key, kind], wearText: f.text, art: () => svg(f.w, f.h, f.art) };
}

// ---------- other characters on the island ----------
const G = PRESETS.girl, B = PRESETS.boy;
export const NPC_WINTER = {};
export const NPC = {
  barista: { ...B, hair: '#8B6450', skin: '#E9C3A3', eyes: '#4E9B5A', top: 'tee', topColor: '#3CC7B8', bottom: 'widePants', bottomColor: '#4D5C9A', hat: 'cap', neckColor: '#FBEFB4' },
  mia: { ...G, hairStyle: 'long', hair: '#F2D27A', skin: '#F3D2B8', eyes: '#4F86C6', hairAcc: 'bow', top: 'sweater', topColor: '#AFD6F7', collar: 'round', neck: 'bow', neckColor: '#B79CF0', badge: false, bottom: 'skirt', bottomColor: '#C9B8F2', socks: 'ankle', shoes: 'sneakers', shoesColor: '#FFFFFF' },
  leo: { ...B, hair: '#2E2A3A', skin: '#9A6B4C', eyes: '#8B6450', top: 'tee', topColor: '#F5DE7A', bottom: 'shorts', bottomColor: '#3CC7B8', socks: 'ankle', shoes: 'sneakers', shoesColor: '#FFFFFF' },
  coach: { ...B, hair: '#E58F6A', skin: '#FCE5D6', eyes: '#36A7B5', top: 'tee', topColor: '#E58F6A', bottom: 'shorts', bottomColor: '#2E2A3A', socks: 'ankle', shoes: 'sneakers', shoesColor: '#FFFFFF', hat: 'cap', neckColor: '#2E2A3A' },
  stylist: { ...G, hairStyle: 'pigtails', hair: '#5FC9C0', skin: '#C99772', eyes: '#8D6CC9', hairAcc: 'none', glasses: 'round', top: 'sweater', topColor: '#FBEFB4', collar: 'round', neck: 'none', neckColor: '#B79CF0', badge: false, bottom: 'widePants', bottomColor: '#7A64B0', shoes: 'boots', shoesColor: '#4D5C9A' },
  nora: { ...G, hairStyle: 'bob', hair: '#2E2A3A', skin: '#E9C3A3', eyes: '#36A7B5', hairAcc: 'star', top: 'hoodie', topColor: '#9EDDD4', collar: 'hood', neck: 'none', neckColor: '#FFFFFF', badge: false, bottom: 'shorts', bottomColor: '#F5DE7A', socks: 'knee', socksColor: '#FFFFFF', shoes: 'sneakers', shoesColor: '#C9B8F2' },
};

// Winter outfits for the same friends.
Object.assign(NPC_WINTER, {
  mia: { ...NPC.mia, top: 'puffer', topColor: '#AFD6F7', neck: 'scarf', neckColor: '#F5DE7A', hat: 'beanie', bottom: 'widePants', bottomColor: '#C9B8F2', shoes: 'boots', shoesColor: '#7A64B0' },
  leo: { ...NPC.leo, top: 'puffer', topColor: '#E58F6A', neck: 'scarf', neckColor: '#9EDDD4', hat: 'beanie', bottom: 'widePants', bottomColor: '#4D5C9A', shoes: 'boots', shoesColor: '#2E2A3A' },
  nora: { ...NPC.nora, top: 'puffer', topColor: '#9EDDD4', neck: 'none', neckColor: '#FBEFB4', hat: 'earmuffs', bottom: 'skirt', bottomColor: '#4D5C9A', socks: 'knee', socksColor: '#FBEFB4', shoes: 'boots', shoesColor: '#FFFFFF' },
  juno: { ...NPC.stylist, top: 'sweater', topColor: '#C9B8F2', collar: 'round', neck: 'scarf', neckColor: '#3CC7B8', hat: 'beanie', glasses: 'round' },
  grandpa: { ...NPC.coach, hairStyle: 'fluffy', hair: '#E8E4F2', skin: '#F3D2B8', eyes: '#4F86C6', glasses: 'round', top: 'sweater', topColor: '#E58F6A', collar: 'round', neck: 'scarf', neckColor: '#4E9B5A', hat: 'none', bottom: 'widePants', bottomColor: '#8B6450', shoes: 'boots', shoesColor: '#2E2A3A' },
});

// ---------- winter scenery ----------
export function winterSky({ weather }, h = 900, id = 'wsky') {
  const clear = weather === 'clear';
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${clear ? '#9FD2F5' : '#AEB6CF'}"/><stop offset="1" stop-color="${clear ? '#EAF4FF' : '#DCE0EC'}"/></linearGradient>
      <radialGradient id="${id}-sun"><stop offset="0" stop-color="#FFFBE6"/><stop offset=".6" stop-color="#FFF3C0" stop-opacity=".5"/><stop offset="1" stop-color="#FFF3C0" stop-opacity="0"/></radialGradient></defs>
    <rect width="1600" height="${h}" fill="url(#${id})"/>
    ${clear ? `<circle cx="1360" cy="120" r="150" fill="url(#${id}-sun)"/><circle cx="1360" cy="120" r="54" fill="#FFF6D2"/>` : `${cloud(200, 80, 1.2, '#E6E9F2', 70)}${cloud(900, 50, 1, '#E6E9F2', 90)}${cloud(1250, 140, 0.9, '#E6E9F2', 60)}`}
    ${clear ? `${cloud(260, 110, 0.8, '#fff', 80)}${cloud(980, 70, 0.6, '#fff', 90)}` : ''}`;
}
export function mountains(y, color = '#D8DDF0') {
  return `<path d="M-20 ${y} L180 ${y - 220} L300 ${y - 130} L460 ${y - 300} L640 ${y - 90} L820 ${y - 250} L1000 ${y - 120} L1180 ${y - 280} L1360 ${y - 110} L1500 ${y - 200} L1640 ${y} Z" fill="${color}"/>
    <path d="M180 ${y - 220} L220 ${y - 170} L200 ${y - 160} L160 ${y - 190} Z M460 ${y - 300} L510 ${y - 240} L470 ${y - 230} L430 ${y - 260} Z M820 ${y - 250} L866 ${y - 196} L826 ${y - 186} L790 ${y - 214} Z M1180 ${y - 280} L1226 ${y - 222} L1186 ${y - 212} L1146 ${y - 246} Z" fill="#fff"/>`;
}
export function pine(x, y, s = 1, snowy = true) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-10" y="150" width="20" height="40" fill="#8B6450" stroke="${INK}" stroke-width="2.6"/>
    <path ${O} d="M0 0 L50 70 H22 L66 130 H30 L80 160 H-80 L-30 130 H-66 L-22 70 H-50 Z" fill="#4E9B7A"/>
    ${snowy ? `<path d="M0 0 L22 32 Q8 26 0 34 Q-8 26 -22 32 Z M-34 70 Q-10 80 0 70 Q14 82 34 70 L44 84 Q14 92 0 84 Q-16 92 -46 84 Z M-50 130 Q-20 142 0 130 Q20 144 52 130 L62 144 Q22 154 0 144 Q-24 154 -64 144 Z" fill="#fff"/>` : ''}
  </g>`;
}
export function winterWindow(x, y, w, h, weather, curtain = '#9EDDD4') {
  const snow = weather === 'snow';
  return `<g transform="translate(${x} ${y})">
    <rect ${O} width="${w}" height="${h}" rx="14" fill="${snow ? '#B8C2D8' : '#BFE3FA'}" style="stroke-width:4"/>
    <path d="M0 ${h * 0.7} Q${w * 0.3} ${h * 0.55} ${w * 0.6} ${h * 0.68} T${w} ${h * 0.62} V${h} H0 Z" fill="#fff"/>
    ${pine(w * 0.25, h * 0.32, 0.32)}${pine(w * 0.72, h * 0.38, 0.26)}
    ${snow ? `<g fill="#fff">${Array.from({ length: 18 }, (_, i) => `<circle cx="${(i * 41) % w + 6}" cy="${(i * 59) % (h - 20) + 8}" r="${2 + (i % 3)}"/>`).join('')}</g>` : `<circle cx="${w * 0.8}" cy="${h * 0.22}" r="${Math.min(w, h) * 0.1}" fill="#FFF6D2"/>`}
    <path d="M${w / 2} 4 V${h - 4} M4 ${h / 2} H${w - 4}" stroke="#FBF7EF" stroke-width="7"/>
    <path d="M6 ${h - 10} Q${w / 2} ${h - 26} ${w - 6} ${h - 10} V${h - 4} H6 Z" fill="#fff"/>
    <rect ${O} x="-12" y="${h - 6}" width="${w + 24}" height="18" rx="6" fill="#FBF7EF"/>
    <path ${O} d="M-30 -14 Q${w * 0.18} ${h * 0.4} -6 ${h + 4} L-30 ${h + 4} Z" fill="${curtain}"/>
    <path ${O} d="M${w + 30} -14 Q${w * 0.82} ${h * 0.4} ${w + 6} ${h + 4} L${w + 30} ${h + 4} Z" fill="${curtain}"/>
    <rect ${O} x="-44" y="-26" width="${w + 88}" height="16" rx="8" fill="#C9A57C"/>
  </g>`;
}
