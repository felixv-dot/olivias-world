// Cabin: cozy log room with a fireplace, a decorated tree with presents, cocoa and a sleepy dog.
import { INK, O, svg, text, starPath, winterWindow, stringLights, food, wearable, NPC_WINTER } from './common.js';
import { CLIMATES } from '../ui.js';

const bg = (w) => svg(1600, 900, `
  <defs>
    <pattern id="logs" width="200" height="56" patternUnits="userSpaceOnUse"><rect width="200" height="56" fill="#D9A877"/>
      <path d="M0 54 H200" stroke="#B98A5E" stroke-width="5"/><path d="M0 28 Q100 22 200 28" stroke="#C99A6C" stroke-width="2" fill="none"/>
      <circle cx="180" cy="28" r="12" fill="#E8C19A" stroke="#B98A5E" stroke-width="3"/><circle cx="180" cy="28" r="5" fill="none" stroke="#B98A5E" stroke-width="2"/></pattern>
    <pattern id="cfl" width="240" height="60" patternUnits="userSpaceOnUse"><rect width="240" height="60" fill="#A87A5A"/><path d="M0 59 H240 M150 0 V60" stroke="#8B6450" stroke-width="3"/></pattern>
  </defs>
  <rect width="1600" height="640" fill="url(#logs)"/>
  <rect y="640" width="1600" height="260" fill="url(#cfl)"/>
  <rect ${O} x="-10" y="624" width="1620" height="22" fill="#8B6450"/>
  ${winterWindow(560, 110, 300, 230, w.weather, '#B79CF0')}
  <g transform="translate(940 130)"><rect ${O} width="170" height="130" rx="8" fill="#FBF7EF" style="stroke-width:5;stroke:#8B6450"/>
    ${text(85, 54, 'Home', 30, '#7A64B0')}${text(85, 92, 'sweet home', 22, '#3CC7B8', 500)}${starPath(150, 22, 8, '#F5DE7A')}</g>
  <g transform="translate(920 330)"><rect ${O} width="220" height="16" rx="5" fill="#8B6450"/>
    <rect ${O} x="14" y="-58" width="26" height="58" fill="#B79CF0"/><rect ${O} x="42" y="-48" width="22" height="48" fill="#9EDDD4"/><rect ${O} x="66" y="-62" width="26" height="62" fill="#F5DE7A"/>
    <path ${O} d="M150 0 V-26 Q150 -40 168 -40 Q186 -40 186 -26 V0 Z" fill="#FBF7EF"/><path d="M160 -30 Q168 -48 176 -30" stroke="#E58F6A" stroke-width="4" fill="none"/></g>`);

const presentArt = (it) => svg(110, 100, it.data.open
  ? `<rect ${O} x="10" y="40" width="90" height="56" rx="6" fill="${it.data.color}"/><path d="M55 40 V96" stroke="${it.data.ribbon}" stroke-width="10"/>
     <path ${O} d="M4 34 L22 4 L108 18 L96 44 Z" fill="${it.data.color}" style="opacity:.9"/>`
  : `<rect ${O} x="10" y="34" width="90" height="62" rx="6" fill="${it.data.color}"/>
     <rect ${O} x="4" y="24" width="102" height="20" rx="6" fill="${it.data.color}"/>
     <path d="M55 24 V96" stroke="${it.data.ribbon}" stroke-width="10"/>
     <path ${O} d="M55 24 C40 0 20 8 34 22 Z M55 24 C70 0 90 8 76 22 Z" fill="${it.data.ribbon}"/>`);

const present = (id, x, y, color, ribbon, prize) => ({
  id, x, y, w: 110, h: 100, data: { open: false, color, ribbon },
  onTap: (it, api) => {
    if (it.data.open) { api.bubble(it.x + 55, it.y - 6, 'Already opened!'); return; }
    it.data.open = true; api.setArt(it); api.sfx.pop();
    api.sparkle(it.x + 55, it.y + 20, ['🎁', '✨', '❄️']);
    if (prize === 'star') {
      if (!api.starFound('cabin-present')) api.addStar('cabin-present', it.x + 24, it.y - 80, { spawned: true });
      else api.bubble(it.x + 55, it.y - 6, 'A shiny ornament! ✨');
    } else if (prize === 'beanie') { const b = api.add({ ...wearable('beanie', it.x - 10, it.y - 110, api.uid('beanie')) }, { spawned: true }); b.def.wear = ['hat', 'beanie']; api.bubble(it.x + 55, it.y - 6, 'A cozy beanie! Put it on someone 🧶'); }
    else { api.add({ ...wearable('scarf', it.x - 20, it.y - 110, api.uid('scarf')) }, { spawned: true }); api.bubble(it.x + 55, it.y - 6, 'A warm scarf! 🧣'); }
  },
  art: presentArt,
});

export const CABIN = {
  id: 'cabin', title: 'Cozy Cabin 🏡', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, avatar: [690, 470],
  frame: 'linear-gradient(#D9A877 70%, #A87A5A 70%)',
  bg,
  stars: [{ id: 'cabin-chair', x: 540, y: 592 }],
  characters: [{ id: 'grandpa', look: NPC_WINTER.grandpa, x: 900, y: 470, s: 0.97, say: ["Welcome in! I'm Grandpa Ole ❄️", 'Warm your hands by the fire!', 'Someone left presents under the tree... 🎁', 'Cocoa is on the stove!'] }],
  items: [
    { id: 'rug', x: 440, y: 770, w: 520, h: 120, floor: true, art: () => svg(520, 120, `
      <ellipse ${O} cx="260" cy="60" rx="254" ry="54" fill="#E58F6A"/><ellipse cx="260" cy="60" rx="210" ry="40" fill="#F5DE7A"/>
      <ellipse cx="260" cy="60" rx="160" ry="28" fill="#9EDDD4"/><ellipse cx="260" cy="60" rx="100" ry="16" fill="#C9B8F2"/>`) },
    { id: 'fireplace', x: 30, y: 250, w: 380, h: 420, drag: false,
      onTap: (it, api) => { it.el.classList.add('roar'); api.sfx.boing(); api.bubble(it.x + 190, it.y - 10, 'So warm and toasty! 🔥'); api.later(() => it.el.classList.remove('roar'), 2500); },
      art: () => svg(380, 420, `
        <rect ${O} x="20" y="70" width="340" height="340" fill="#B9C0D4"/>
        ${Array.from({ length: 6 }, (_, r) => Array.from({ length: 5 }, (_, c) => `<rect x="${24 + c * 68 + (r % 2) * 34}" y="${76 + r * 56}" width="62" height="50" rx="8" fill="#C9D0E2" stroke="#9EA6BE" stroke-width="2"/>`).join('')).join('')}
        <rect ${O} x="0" y="50" width="380" height="34" rx="6" fill="#8B6450"/>
        <path ${O} d="M90 410 V230 Q90 170 190 170 Q290 170 290 230 V410 Z" fill="#3E3450"/>
        <path d="M120 400 H260" stroke="#8B6450" stroke-width="18" stroke-linecap="round"/><path d="M140 384 L240 400 M240 384 L140 400" stroke="#A87A5A" stroke-width="14" stroke-linecap="round"/>
        <g class="flame"><path d="M190 380 C140 360 150 300 176 270 C176 300 196 296 192 260 C226 290 240 340 190 380 Z" fill="#F0A060"/><path d="M190 380 C164 368 166 330 184 310 C186 334 200 330 198 312 C214 334 216 364 190 380 Z" fill="#F5DE7A"/></g>
        <g class="flame big-flame"><path d="M190 384 C110 360 120 260 168 220 C166 270 200 260 194 210 C250 260 270 340 190 384 Z" fill="#F0A060" opacity=".75"/></g>
        ${[70, 150, 230, 310].map((x, i) => `<path ${O} d="M${x} 84 V108 L${x - 12} 128 Q${x - 18} 146 ${x} 144 L${x + 16} 128 V84 Z" fill="${['#E58F6A', '#3CC7B8', '#B79CF0', '#F5DE7A'][i]}"/><rect ${O} x="${x - 4}" y="84" width="24" height="12" rx="4" fill="#fff"/>`).join('')}
        <rect ${O} x="300" y="4" width="40" height="46" rx="6" fill="#FBF7EF"/>${starPath(320, 26, 12, '#F5DE7A')}`) },
    { id: 'armchair', x: 440, y: 470, w: 260, h: 280, art: () => svg(260, 280, `
      <rect ${O} x="30" y="10" width="200" height="170" rx="50" fill="#7A64B0"/>
      <rect ${O} x="44" y="130" width="172" height="80" rx="24" fill="#9A80D8"/>
      <rect ${O} x="4" y="110" width="60" height="130" rx="28" fill="#7A64B0"/><rect ${O} x="196" y="110" width="60" height="130" rx="28" fill="#7A64B0"/>
      <path ${O} d="M80 60 Q130 40 190 70 L200 180 Q140 150 90 190 Z" fill="#9EDDD4"/><path d="M96 90 L180 96 M98 120 L186 128 M100 150 L188 158" stroke="#fff" stroke-width="6" opacity=".6"/>
      <rect ${O} x="30" y="236" width="18" height="40" rx="5" fill="#8B6450"/><rect ${O} x="212" y="236" width="18" height="40" rx="5" fill="#8B6450"/>`) },
    { id: 'stove', x: 1040, y: 520, w: 170, h: 240, drag: false,
      onTap: (it, api) => {
        if (api.count('cocoa') >= 3) { api.bubble(it.x + 85, it.y - 10, 'Drink the cocoa first! ☕'); return; }
        api.sfx.pour(); food(api, 'cocoa', it.x - 60 - api.count('cocoa') * 50, it.y + 150);
        api.bubble(it.x + 85, it.y - 10, 'Hot cocoa with marshmallows! ☕');
      },
      art: () => svg(170, 240, `
        <g class="steam"><path class="ln" stroke-width="4" opacity=".5" d="M70 30 Q62 18 70 6 M96 30 Q88 18 96 6"/></g>
        <path ${O} d="M40 44 H128 V84 Q128 96 116 96 H52 Q40 96 40 84 Z" fill="#E58F6A"/><path ${O} d="M128 56 Q150 56 150 70" fill="none" style="stroke-width:5"/>
        <rect ${O} x="34" y="36" width="100" height="14" rx="6" fill="#F0A584"/>
        <rect ${O} x="10" y="96" width="150" height="140" rx="12" fill="#3E4A5E"/>
        <rect ${O} x="34" y="130" width="102" height="70" rx="10" fill="#2E2A3A"/><path d="M50 186 Q85 150 120 186" fill="#F0A060" opacity=".85"/>
        <circle cx="40" cy="112" r="6" fill="#F5DE7A"/><circle cx="62" cy="112" r="6" fill="#F5DE7A"/>`) },
    { id: 'tree', x: 1230, y: 150, w: 340, h: 520, drag: false, data: { on: true },
      onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); if (it.data.on) api.sparkle(it.x + 170, it.y + 220, ['✨', '⭐', '❄️']); },
      art: (it) => svg(340, 520, `
        <rect ${O} x="150" y="440" width="40" height="60" fill="#8B6450"/>
        <path ${O} d="M170 30 L270 170 H220 L300 300 H240 L330 450 H10 L100 300 H40 L120 170 H70 Z" fill="#4E9B7A" style="stroke-width:3"/>
        <path d="M110 170 Q170 200 230 170 M70 300 Q170 340 270 300 M40 440 Q170 480 300 440" stroke="#fff" stroke-width="7" fill="none" opacity=".6"/>
        ${[[130, 220, '#E58F6A'], [210, 250, '#F5DE7A'], [110, 360, '#B79CF0'], [240, 380, '#3CC7B8'], [170, 300, '#8FC3F0'], [80, 420, '#F5DE7A'], [260, 430, '#E58F6A'], [170, 130, '#C9B8F2']].map(([x, y, c]) => `<circle ${O} cx="${x}" cy="${y}" r="14" fill="${c}" style="stroke-width:2"/><circle cx="${x - 4}" cy="${y - 4}" r="4" fill="#fff" opacity=".7"/>`).join('')}
        ${stringLights(90, 250, 200, 24, it.data.on).replace(/stroke-width="2.5"/, 'stroke-width="2"')}
        ${stringLights(60, 290, 330, 30, it.data.on)}
        ${starPath(170, 30, 30, it.data.on ? '#F7D24A' : '#E8DCA0', `stroke="${INK}" stroke-width="3"`)}`) },
    present('gift1', 1240, 640, '#B79CF0', '#F5DE7A', 'beanie'),
    present('gift2', 1360, 666, '#3CC7B8', '#FBF7EF', 'star'),
    present('gift3', 1470, 640, '#E58F6A', '#9EDDD4', 'scarf'),
    { id: 'dogbed', x: 760, y: 760, w: 200, h: 120, cls: 'squish',
      onTap: (it, api) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.sfx.boing(); api.bubble(it.x + 100, it.y - 6, ['Zzz... 💤', '*yawn* Woof!', '*snuggles*'][Math.floor(Math.random() * 3)]); },
      art: () => svg(200, 120, `
        <ellipse ${O} cx="100" cy="84" rx="96" ry="32" fill="#C9B8F2"/>
        <ellipse ${O} cx="104" cy="68" rx="56" ry="26" fill="#FBF7EF"/>
        <circle ${O} cx="60" cy="60" r="26" fill="#FBF7EF"/>
        <path ${O} d="M40 44 Q30 62 42 76 Q52 66 52 50 Z" fill="#C99772"/>
        <path class="ln" stroke-width="3" d="M52 60 Q57 56 62 60 M66 60 Q71 56 76 60"/><ellipse cx="64" cy="70" rx="5" ry="3.5" fill="${INK}"/>
        <path d="M150 70 Q170 60 166 46" stroke="${INK}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M150 70 Q170 60 166 46" stroke="#FBF7EF" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path ${O} d="M10 84 Q100 130 190 84 Q186 112 100 116 Q14 112 10 84 Z" fill="#B79CF0"/>`) },
  ],
};
