// Café: coffee machine, blender, pastry case, a barista behind the counter and a friend at a table.
import { INK, O, svg, text, windowArt, stringLights, plantArt, food, NPC } from './common.js';

const bg = (w) => svg(1600, 900, `
  <defs>
    <pattern id="cwp" width="70" height="70" patternUnits="userSpaceOnUse"><rect width="70" height="70" fill="#FBF6E8"/><rect width="34" height="70" fill="#D9F2EE"/></pattern>
    <pattern id="cfl" width="120" height="120" patternUnits="userSpaceOnUse"><rect width="120" height="120" fill="#F4F0FF"/><rect width="60" height="60" fill="#DCD0F7"/><rect x="60" y="60" width="60" height="60" fill="#DCD0F7"/></pattern>
    <pattern id="brick" width="80" height="40" patternUnits="userSpaceOnUse"><rect width="80" height="40" fill="#EBD9C6"/><path d="M0 39 H80 M0 19 H80 M40 0 V19 M0 20 V39 M80 20 V39" stroke="#D9C2AA" stroke-width="3"/></pattern>
  </defs>
  <rect width="1600" height="620" fill="url(#cwp)"/>
  <rect width="760" height="620" fill="url(#brick)"/>
  <rect y="620" width="1600" height="280" fill="url(#cfl)"/>
  <rect ${O} x="-10" y="606" width="1620" height="22" fill="#FBF7EF"/>
  ${windowArt(1250, 130, 270, 220, w.weather, '#F5DE7A')}
  <g transform="translate(810 90)"><rect ${O} width="330" height="250" rx="16" fill="#3E4A5E" style="stroke-width:6;stroke:#C9A57C"/>
    ${text(165, 54, 'MENU', 38, '#fff')}
    <g font-family="Fredoka, sans-serif" fill="#fff" font-size="25" font-weight="500">
      <text x="34" y="100">Coffee</text><text x="250" y="100">2★</text>
      <text x="34" y="138">Smoothie</text><text x="250" y="138">3★</text>
      <text x="34" y="176">Pastries</text><text x="250" y="176">2★</text>
      <text x="34" y="214">Cake</text><text x="250" y="214">4★</text></g>
    <path d="M30 112 H300 M30 150 H300 M30 188 H300" stroke="#fff" stroke-width="1.5" opacity=".2"/></g>
  <g transform="translate(200 60)"><rect ${O} width="360" height="60" rx="14" fill="#3CC7B8"/>${text(180, 42, 'Sunny Café', 34, '#fff')}</g>
  <g transform="translate(40 230)"><rect ${O} width="660" height="16" rx="5" fill="#C9A57C"/>
    ${[30, 90, 150, 210].map((x, i) => `<path ${O} d="M${x} 0 V-36 H${x + 40} V0 Z" fill="#fff"/><path ${O} d="M${x + 40} -26 q12 0 12 10 q0 10 -12 10" fill="none" style="stroke-width:2"/><path d="M${x + 6} -20 H${x + 34}" stroke="${['#B79CF0', '#3CC7B8', '#F5DE7A', '#8FC3F0'][i]}" stroke-width="6"/>`).join('')}
    <rect ${O} x="320" y="-70" width="56" height="70" rx="10" fill="#fff"/><rect x="326" y="-46" width="44" height="40" rx="6" fill="#8B5A3C"/>
    <rect ${O} x="390" y="-60" width="56" height="60" rx="10" fill="#fff"/><rect x="396" y="-38" width="44" height="32" rx="6" fill="#F5DE7A"/>
    <path ${O} d="M520 0 V-40 Q520 -50 530 -50 H600 Q610 -50 610 -40 V0 Z" fill="#9EDDD4"/><path d="M540 -50 Q550 -84 560 -50 M570 -50 Q584 -78 590 -50" stroke="#6DBE7A" stroke-width="6" fill="none"/></g>
  <g transform="translate(1180 470)"><rect ${O} width="400" height="14" rx="5" fill="#C9A57C"/>
    ${[20, 70, 120, 170].map((x, i) => `<rect ${O} x="${x}" y="${-60 + (i % 2) * 10}" width="36" height="${60 - (i % 2) * 10}" fill="${['#C9B8F2', '#F5DE7A', '#9EDDD4', '#8FC3F0'][i]}"/>`).join('')}</g>`);

const counterFront = () => svg(780, 230, `
  <rect ${O} x="0" y="20" width="770" height="208" fill="#B79CF0"/>
  <path class="ln" stroke-width="2.6" opacity=".4" d="M128 40 V210 M256 40 V210 M384 40 V210 M512 40 V210 M640 40 V210"/>
  ${[64, 192, 320, 448, 576, 704].map((x) => `<rect x="${x - 40}" y="60" width="80" height="120" rx="10" fill="#fff" opacity=".18"/>`).join('')}
  <rect ${O} x="-10" y="0" width="790" height="30" rx="8" fill="#FBF7EF"/>`);

const cupArt = (it) => svg(70, 70, `
  ${it.data.full ? '<path class="ln steam" stroke-width="3" opacity=".6" d="M24 16 Q19 9 24 2 M37 16 Q32 9 37 2"/>' : ''}
  <path ${O} d="M52 30 Q67 30 65 42 Q63 54 52 51" fill="none" style="stroke-width:4"/>
  <path ${O} d="M10 22 H52 V52 Q52 64 40 64 H22 Q10 64 10 52 Z" fill="${it.data.color}"/>
  <ellipse ${O} cx="31" cy="22" rx="21" ry="5" fill="${it.data.full ? '#8B5A3C' : '#F4F0FF'}" style="stroke-width:2"/>
  ${it.data.full ? '<path d="M24 22 q7 -4 14 0" stroke="#F5E3D0" stroke-width="2.5" fill="none"/>' : ''}
  <path d="M12 40 H50" stroke="#B79CF0" stroke-width="5"/>`);

const cup = (id, x, color) => ({
  id, x, y: 362, w: 70, h: 70, z: 50, data: { full: false, atMachine: false, color },
  art: cupArt,
  onDrop: (it, api) => {
    const m = api.get('machine');
    const [cx, cy] = api.center(it);
    if (cx > m.x + 30 && cx < m.x + 170 && cy > m.y + 30 && cy < m.y + 210) {
      api.snap(it, m.x + 65, m.y + 82);
      it.data.atMachine = true;
      if (!it.data.full) api.bubble(m.x + 100, m.y - 20, 'Now tap the yellow button!');
    } else it.data.atMachine = false;
  },
  onGive: (it, api, who) => {
    it.data.atMachine = false;
    if (!it.data.full) { api.bubble(who.x + who.w / 2, who.y - 6, "It's empty! Fill it at the machine."); return; }
    it.data.full = false; api.setArt(it); api.sfx.yum();
    api.react(who, 'Yummy coffee! ☕', ['💜', '✨', '☕']);
  },
});

const table = (id, x) => ({ id, x, y: 600, w: 240, h: 210, art: () => svg(240, 210, `
  <rect ${O} x="108" y="50" width="24" height="140" fill="#C9A57C"/>
  <ellipse ${O} cx="120" cy="196" rx="58" ry="12" fill="#C9A57C"/>
  <ellipse ${O} cx="120" cy="44" rx="114" ry="28" fill="#FBF7EF"/>
  <path d="M10 46 Q120 92 230 46" fill="none" stroke="#9EDDD4" stroke-width="8" opacity=".8"/>
  <path ${O} d="M100 30 V8 M100 8 Q90 -6 98 -14 Q110 -6 100 8" fill="#F08C7E" style="stroke-width:2"/>`) });

const chair = (id, x, color) => ({ id, x, y: 640, w: 120, h: 196, art: () => svg(120, 196, `
  <rect ${O} x="18" y="6" width="84" height="96" rx="26" fill="${color}"/>
  <rect ${O} x="30" y="22" width="60" height="18" rx="9" fill="#fff" opacity=".6"/>
  <rect ${O} x="10" y="98" width="100" height="26" rx="10" fill="${color}"/>
  <rect ${O} x="20" y="122" width="14" height="70" rx="5" fill="#C9A57C"/><rect ${O} x="86" y="122" width="14" height="70" rx="5" fill="#C9A57C"/>`) });

export const CAFE = {
  id: 'cafe', posKey: 'cafe-v2', title: 'Sunny Café ☕', weather: true, avatar: [900, 470],
  frame: 'linear-gradient(#FBF6E8 62%, #E6DDFA 62%)',
  bg,
  stars: [{ id: 'cafe-plant', x: 1490, y: 770 }, { id: 'cafe-chair', x: 1170, y: 726 }],
  characters: [
    { id: 'barista', look: NPC.barista, x: 452, y: 196, s: 0.92, z: 30, drag: false, say: ['Welcome to Sunny Café!', 'Try the smoothie! 🫐', 'Pastries are fresh! 🥐'] },
    { id: 'mia', look: NPC.mia, x: 1250, y: 470, z: 59, say: ['Hi! I\'m Mia 💛', 'I love this café!', "I'm hungry... 🥐"] },
  ],
  items: [
    { id: 'lights', x: 760, y: 0, w: 840, h: 90, drag: false, data: { on: true },
      onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); },
      art: (it) => svg(840, 90, stringLights(10, 830, 14, 30, it.data.on)) },
    { id: 'counter', x: 0, y: 420, w: 780, h: 230, z: 40, drag: false, art: counterFront },
    { id: 'machine', x: 20, y: 254, w: 200, h: 170, z: 45, drag: false, cls: 'machine',
      onTap: (it, api) => {
        if (it.el.classList.contains('pouring')) return;
        const c = [...api.items.values()].find((i) => i.data.atMachine && !i.data.full);
        if (!c) { api.bubble(it.x + 100, it.y - 20, 'Put a cup under the machine! ☕'); return; }
        it.el.classList.add('pouring'); api.sfx.pour();
        api.later(() => { it.el.classList.remove('pouring'); c.data.full = true; api.setArt(c); api.bubble(it.x + 100, it.y - 20, 'Coffee is ready!'); }, 1300);
      },
      art: () => svg(200, 170, `
        <rect ${O} x="22" y="60" width="22" height="94" fill="#5E6DAE"/><rect ${O} x="156" y="60" width="22" height="94" fill="#5E6DAE"/>
        <rect ${O} x="14" y="8" width="172" height="66" rx="20" fill="#4D5C9A"/>${text(80, 50, 'COFFEE', 22, '#fff')}
        <circle ${O} class="machine-btn" cx="152" cy="41" r="15" fill="#F5DE7A"/>
        <rect ${O} x="40" y="70" width="120" height="26" fill="#5E6DAE"/>
        <rect ${O} x="84" y="90" width="32" height="16" rx="4" fill="#2E2A3A"/>
        <rect class="stream" x="96" y="106" width="8" height="46" rx="4" fill="#8B5A3C"/>
        <rect ${O} x="14" y="150" width="172" height="16" rx="6" fill="#C9B8F2"/>`) },
    { id: 'blender', x: 236, y: 300, w: 90, h: 124, z: 45, drag: false,
      onTap: (it, api) => {
        if (it.el.classList.contains('blending')) return;
        if (api.count('smoothie') >= 2) { api.bubble(it.x + 45, it.y - 20, 'Drink those first! 🫐'); return; }
        it.el.classList.add('blending'); api.sfx.pour();
        api.later(() => { it.el.classList.remove('blending'); food(api, 'smoothie', it.x + 100 + api.count('smoothie') * 30, it.y + 22); }, 1200);
      },
      art: () => svg(90, 124, `<g class="jar"><path ${O} d="M16 10 H74 L66 80 H24 Z" fill="#E8F6FF" fill-opacity=".8"/><path d="M22 46 H68 L64 78 H26 Z" fill="#B79CF0"/><rect ${O} x="12" y="2" width="66" height="14" rx="5" fill="#4D5C9A"/></g>
        <rect ${O} x="14" y="80" width="62" height="40" rx="8" fill="#4D5C9A"/><circle ${O} cx="45" cy="100" r="8" fill="#F5DE7A"/>`) },
    cup('cup1', 344, '#fff'),
    cup('cup2', 410, '#FBEFB4'),
    { id: 'case', x: 606, y: 300, w: 170, h: 130, z: 46, drag: false, data: { n: 0 },
      onTap: (it, api) => {
        if (api.count('croissant') + api.count('donut') + api.count('macaron') >= 3) { api.bubble(it.x + 85, it.y - 20, 'Enjoy the pastries first! 🥐'); return; }
        const kind = ['croissant', 'donut', 'macaron'][it.data.n++ % 3];
        food(api, kind, 600 + (it.data.n % 3) * 60, 372);
      },
      art: () => svg(170, 130, `
        <rect ${O} x="6" y="10" width="158" height="112" rx="12" fill="#E8F6FF" fill-opacity=".7"/>
        <path d="M14 66 H156" stroke="${INK}" stroke-width="2.4"/>
        <path ${O} d="M24 56 Q24 40 38 38 Q46 28 56 38 Q70 40 68 56 Z" fill="#F0C27A" style="stroke-width:2"/>
        <circle ${O} cx="100" cy="46" r="14" fill="#C9B8F2" style="stroke-width:2"/><circle cx="100" cy="46" r="5" fill="#FBF7EF"/>
        <ellipse ${O} cx="138" cy="50" rx="14" ry="8" fill="#9EDDD4" style="stroke-width:2"/>
        <ellipse ${O} cx="44" cy="102" rx="16" ry="9" fill="#F5DE7A" style="stroke-width:2"/><circle ${O} cx="88" cy="100" r="13" fill="#E58F6A" style="stroke-width:2"/>
        <path ${O} d="M116 110 L124 86 L148 90 L148 110 Z" fill="#FBEFB4" style="stroke-width:2"/>
        <path d="M20 18 L40 40" stroke="#fff" stroke-width="5" opacity=".7"/>`) },
    { id: 'tipjar', x: 538, y: 362, w: 60, h: 70, z: 46, drag: false,
      onTap: (it, api) => { api.sparkle(it.x + 30, it.y, ['⭐', '✨']); api.bubble(it.x + 30, it.y - 10, 'Thank you! ✨'); api.sfx.star(); },
      art: () => svg(60, 70, `<path ${O} d="M8 14 H52 V60 Q52 68 44 68 H16 Q8 68 8 60 Z" fill="#E8F6FF" fill-opacity=".8"/>${'<circle cx="22" cy="54" r="7" fill="#F5DE7A" stroke="#4A3B5C" stroke-width="2"/><circle cx="36" cy="50" r="7" fill="#F5DE7A" stroke="#4A3B5C" stroke-width="2"/>'}<rect ${O} x="4" y="6" width="52" height="12" rx="4" fill="#fff"/>${text(30, 40, 'TIPS', 13)}`) },
    table('table1', 800),
    table('table2', 1150),
    chair('chair1', 700, '#9EDDD4'),
    chair('chair2', 1130, '#F5DE7A'),
    chair('chair3', 1390, '#C9B8F2'),
    { id: 'music', x: 1420, y: 352, w: 150, h: 120, drag: false, data: { on: false },
      onTap: (it, api) => { it.data.on = !it.data.on; it.el.classList.toggle('playing', it.data.on); api.bubble(it.x + 75, it.y - 10, it.data.on ? '♪ Music on ♫' : 'Music off'); },
      art: () => svg(150, 120, `
        <g class="notes">${['♪', '♫', '♪'].map((n, i) => `<text x="${30 + i * 40}" y="${10 - i * 6}" font-size="28" fill="#7A64B0">${n}</text>`).join('')}</g>
        <rect ${O} x="6" y="40" width="138" height="76" rx="10" fill="#C99772"/>
        <ellipse ${O} cx="70" cy="62" rx="50" ry="14" fill="#2E2A3A"/><ellipse cx="70" cy="62" rx="16" ry="5" fill="#F5DE7A"/>
        <path ${O} d="M128 48 L110 66" style="stroke-width:4"/>`) },
    { id: 'cplant', x: 1450, y: 630, w: 140, h: 220, art: () => plantArt('monstera') },
  ],
};
