// Park: big tree with a secret nest, swings, slide, fountain, picnic, kite and a puppy.
import { INK, O, svg, sky, food, NPC } from './common.js';

const bg = (w) => {
  const sun = w.weather === 'sun';
  return svg(1600, 900, `
  ${sky(w, 560, 'parkSky')}
  <path d="M-10 470 Q300 380 640 440 T1300 420 T1620 440 V560 H-10 Z" fill="${sun ? '#B9E3A8' : '#A2C49A'}"/>
  <g fill="${sun ? '#8FCB8A' : '#7FAE7C'}">
    <circle cx="700" cy="440" r="40"/><circle cx="740" cy="430" r="50"/><circle cx="790" cy="446" r="36"/>
    <circle cx="1240" cy="420" r="46"/><circle cx="1290" cy="430" r="36"/></g>
  <path d="M-10 500 Q400 470 800 500 T1620 490 V910 H-10 Z" fill="${sun ? '#A8DE9A' : '#97C68E'}"/>
  <path ${O} d="M520 910 Q600 720 820 640 Q1040 570 1620 600 V700 Q1100 680 900 740 Q760 790 720 910 Z" fill="${sun ? '#F2DFB2' : '#DDCDA6'}" style="stroke-width:3"/>
  <g stroke="#C9A57C" stroke-width="8" stroke-linecap="round">${Array.from({ length: 17 }, (_, i) => `<line x1="${i * 100}" y1="${500 - Math.sin(i) * 4}" x2="${i * 100}" y2="${560 - Math.sin(i) * 4}"/>`).join('')}
    <path d="M0 515 H1600 M0 545 H1600" stroke-width="6"/></g>
  <g fill="${sun ? '#8FCB8A' : '#86B87E'}">${Array.from({ length: 40 }, (_, i) => `<path d="M${(i * 173) % 1600} ${600 + ((i * 97) % 290)} l6 -16 l6 16 z"/>`).join('')}</g>`);
};

const flower = (id, x, y, color) => ({
  id, x, y, w: 64, h: 92,
  onTap: (it, api) => { api.sparkle(it.x + 32, it.y + 20, ['🌸', '✨', '🌼']); },
  art: () => svg(64, 92, `
    <path d="M32 40 V88" stroke="#4E9B5A" stroke-width="5"/><path d="M32 70 Q14 58 10 66 Q20 78 32 74" fill="#6DBE7A" stroke="${INK}" stroke-width="2"/>
    ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="${32 + Math.cos((a * Math.PI) / 180) * 14}" cy="${26 + Math.sin((a * Math.PI) / 180) * 14}" rx="11" ry="11" fill="${color}" stroke="${INK}" stroke-width="2"/>`).join('')}
    <circle ${O} cx="32" cy="26" r="9" fill="#F5DE7A" style="stroke-width:2"/>`),
});

export const PARK = {
  id: 'park', title: 'Park 🌳', weather: true, outdoor: true, avatar: [690, 500],
  frame: 'linear-gradient(#A9DCFF 45%, #A8DE9A 45%)',
  bg,
  stars: [{ id: 'park-bench', x: 1360, y: 716 }],
  characters: [{ id: 'nora', look: NPC.nora, x: 1010, y: 470, s: 0.92, say: ["Hi! I'm Nora 🌼", 'Have you tried the swings?', 'I heard a bird in the big tree! 🐦'] }],
  items: [
    { id: 'tree', x: 10, y: 60, w: 420, h: 640, drag: false, data: { taps: 0 },
      onTap: (it, api) => {
        it.data.taps++;
        it.el.classList.remove('shake'); void it.el.offsetWidth; it.el.classList.add('shake');
        api.sparkle(it.x + 210, it.y + 180, ['🍃', '🍃', '🌿']);
        if (it.data.taps === 3) {
          api.bubble(it.x + 220, it.y + 40, 'Tweet tweet! 🐦');
          if (!api.starFound('park-nest')) api.addStar('park-nest', it.x + 276, it.y + 130, { spawned: true });
        } else if (it.data.taps < 3) api.bubble(it.x + 220, it.y + 40, 'Something is up there...');
      },
      art: () => svg(420, 640, `
        <path ${O} d="M180 640 Q190 480 170 360 L240 360 Q224 480 250 640 Z" fill="#A87A5A"/>
        <path d="M200 380 Q196 470 206 620" stroke="#8B6450" stroke-width="4" fill="none" opacity=".6"/>
        <path ${O} d="M180 420 Q120 400 96 360" fill="none" style="stroke-width:16;stroke:#A87A5A"/>
        <circle ${O} cx="120" cy="250" r="110" fill="#6DBE7A"/><circle ${O} cx="300" cy="240" r="110" fill="#6DBE7A"/>
        <circle ${O} cx="210" cy="150" r="130" fill="#7FCF8A"/><circle ${O} cx="210" cy="300" r="100" fill="#6DBE7A"/>
        <circle cx="160" cy="110" r="30" fill="#A8DE9A" opacity=".7"/><circle cx="290" cy="200" r="20" fill="#A8DE9A" opacity=".6"/>
        <circle ${O} cx="120" cy="300" r="12" fill="#E58F6A"/><circle ${O} cx="300" cy="320" r="12" fill="#E58F6A"/><circle ${O} cx="220" cy="230" r="12" fill="#E58F6A"/>
        <path ${O} d="M276 206 Q306 222 336 206 Q332 230 306 230 Q280 230 276 206 Z" fill="#C99772"/><path class="ln" stroke-width="2" d="M280 212 L296 222 M300 208 L312 228 M322 210 L330 222"/>`) },
    { id: 'swing', x: 430, y: 280, w: 330, h: 420, drag: false,
      onTap: (it, api) => { it.el.classList.remove('swinging'); void it.el.offsetWidth; it.el.classList.add('swinging'); api.bubble(it.x + 165, it.y - 10, 'Wheee! 🎶'); },
      art: () => svg(330, 420, `
        <path ${O} d="M20 410 L70 10 L120 410 M210 410 L260 10 L310 410" fill="none" style="stroke-width:8;stroke:#8FC3F0"/>
        <path ${O} d="M20 410 L70 10 L120 410 M210 410 L260 10 L310 410" fill="none" style="stroke-width:2"/>
        <rect ${O} x="50" y="4" width="230" height="18" rx="8" fill="#4D5C9A"/>
        <g class="seat"><path class="ln" stroke-width="3" d="M130 22 V290 M200 22 V290"/><rect ${O} x="118" y="286" width="94" height="18" rx="6" fill="#F5DE7A"/></g>`) },
    { id: 'slide', x: 1180, y: 290, w: 380, h: 420, drag: false,
      onTap: (it, api) => { api.bubble(it.x + 190, it.y - 10, 'Wheeeee! 🛝'); api.sparkle(it.x + 300, it.y + 360, ['💨', '✨']); api.sfx.boing(); },
      art: () => svg(380, 420, `
        <path ${O} d="M40 410 V60 M110 410 V60" fill="none" style="stroke-width:8;stroke:#C9B8F2"/>
        ${[120, 180, 240, 300, 360].map((y) => `<path d="M40 ${y} H110" stroke="#C9B8F2" stroke-width="7"/>`).join('')}
        <rect ${O} x="24" y="40" width="104" height="26" rx="8" fill="#B79CF0"/>
        <path ${O} d="M110 60 Q170 90 230 230 Q280 360 370 380 L370 410 Q260 400 200 260 Q150 130 110 100 Z" fill="#9EDDD4" style="stroke-width:3"/>
        <path d="M120 74 Q176 110 220 230 Q264 350 360 390" fill="none" stroke="#fff" stroke-width="5" opacity=".7"/>`) },
    { id: 'fountain', x: 790, y: 500, w: 230, h: 220, drag: false,
      onTap: (it, api) => { it.el.classList.add('spray'); api.sfx.pour(); api.later(() => it.el.classList.remove('spray'), 2000); api.later(() => api.sparkle(it.x + 115, it.y + 80, ['💧', '💦']), 300); },
      art: () => svg(230, 220, `
        <g class="water"><path d="M115 110 Q90 30 50 90 M115 110 Q140 30 180 90 M115 110 V10" fill="none" stroke="#8FC3F0" stroke-width="8" stroke-linecap="round" opacity=".9"/></g>
        <ellipse ${O} cx="115" cy="170" rx="110" ry="36" fill="#E3E9F2"/>
        <ellipse cx="115" cy="166" rx="92" ry="24" fill="#8FC3F0"/>
        <path ${O} d="M100 166 V116 H130 V166" fill="#E3E9F2"/><ellipse ${O} cx="115" cy="114" rx="34" ry="10" fill="#E3E9F2"/>
        <path ${O} d="M5 170 V190 Q115 240 225 190 V170" fill="#D2DAE6"/>`) },
    { id: 'blanket', x: 380, y: 760, w: 300, h: 110, floor: true, art: () => svg(300, 110, `
      <path ${O} d="M10 20 H290 L280 104 H20 Z" fill="#fff"/>
      <path d="M50 20 L44 104 M100 20 L98 104 M150 20 V104 M200 20 L202 104 M250 20 L256 104 M14 48 H286 M18 76 H282" stroke="#F08C7E" stroke-width="10" opacity=".55"/>`) },
    { id: 'basket', x: 470, y: 716, w: 120, h: 96, drag: false, data: { n: 0 },
      onTap: (it, api) => {
        if (api.count('sandwich') + api.count('juice') + api.count('apple') >= 3) { api.bubble(it.x + 60, it.y - 10, 'Share the snacks first! 🧺'); return; }
        const kind = ['sandwich', 'juice', 'apple'][it.data.n++ % 3];
        food(api, kind, it.x + 130 + (it.data.n % 3) * 30, it.y + 50);
      },
      art: () => svg(120, 96, `
        <path ${O} d="M24 40 Q60 -10 96 40" fill="none" style="stroke-width:6;stroke:#C99772"/>
        <path ${O} d="M10 36 H110 L98 92 H22 Z" fill="#E0B07A"/><path d="M14 52 H106 M18 70 H102" stroke="#C99772" stroke-width="4"/>
        <path ${O} d="M10 36 H110 V48 H10 Z" fill="#9EDDD4"/>`) },
    { id: 'bench', x: 1260, y: 700, w: 260, h: 140, art: () => svg(260, 140, `
      <rect ${O} x="10" y="10" width="240" height="22" rx="6" fill="#C99772"/><rect ${O} x="10" y="40" width="240" height="22" rx="6" fill="#C99772"/>
      <rect ${O} x="4" y="70" width="252" height="24" rx="6" fill="#D9AC86"/>
      <path ${O} d="M30 94 V136 M230 94 V136 M30 30 V70 M230 30 V70" fill="none" style="stroke-width:8;stroke:#4D5C9A"/>`) },
    { id: 'dog', x: 1080, y: 760, w: 150, h: 120, cls: 'squish',
      onTap: (it, api) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.sfx.boing(); api.bubble(it.x + 75, it.y - 6, ['Woof! 🐶', 'Arf arf!', '*wags tail*'][Math.floor(Math.random() * 3)]); },
      art: () => svg(150, 120, `
        <path class="tail" d="M128 54 Q148 34 140 20" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path class="tail" d="M128 54 Q148 34 140 20" fill="none" stroke="#F0C27A" stroke-width="6" stroke-linecap="round"/>
        <ellipse ${O} cx="90" cy="70" rx="46" ry="28" fill="#F0C27A"/>
        <rect ${O} x="60" y="84" width="16" height="32" rx="7" fill="#F0C27A"/><rect ${O} x="104" y="84" width="16" height="32" rx="7" fill="#F0C27A"/>
        <circle ${O} cx="44" cy="50" r="32" fill="#F0C27A"/>
        <path ${O} d="M20 30 Q6 50 18 70 Q30 60 30 40 Z M64 28 Q80 46 70 66 Q58 56 58 38 Z" fill="#C99772"/>
        <circle cx="34" cy="48" r="4" fill="${INK}"/><circle cx="54" cy="48" r="4" fill="${INK}"/>
        <ellipse cx="44" cy="62" rx="7" ry="5" fill="${INK}"/><path d="M40 70 Q44 80 48 70" fill="#F08C7E" stroke="${INK}" stroke-width="2"/>
        <rect ${O} x="26" y="76" width="40" height="8" rx="4" fill="#B79CF0"/>`) },
    { id: 'kite', x: 860, y: 110, w: 120, h: 190, cls: 'kite',
      onTap: (it, api) => { api.bubble(it.x + 60, it.y - 6, 'Up, up and away! 🪁'); it.el.classList.remove('fly'); void it.el.offsetWidth; it.el.classList.add('fly'); },
      art: () => svg(120, 190, `
        <path ${O} d="M60 4 L110 60 L60 120 L10 60 Z" fill="#F5DE7A"/><path d="M60 4 L60 120 M10 60 L110 60" stroke="${INK}" stroke-width="2"/>
        <path d="M60 4 L110 60 L60 60 Z M60 60 L10 60 L60 120 Z" fill="#B79CF0"/>
        <path class="ln" stroke-width="2.4" d="M60 120 Q40 140 64 156 Q86 170 60 188"/>
        <path d="M54 140 l10 4 -10 4 z M58 166 l10 4 -10 4 z" fill="#9EDDD4"/>`) },
    flower('flower1', 40, 790, '#C9B8F2'),
    flower('flower2', 120, 770, '#9EDDD4'),
    flower('flower3', 200, 800, '#F5DE7A'),
  ],
};
