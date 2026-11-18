// Home: a two-room dollhouse — bedroom on the left, kitchen on the right.
import { INK, O, svg, text, starPath, windowArt, stringLights, plantArt, food } from './common.js';

const bg = (w) => svg(1600, 900, `
  <defs>
    <pattern id="hwp" width="70" height="70" patternUnits="userSpaceOnUse"><rect width="70" height="70" fill="#DED3F7"/><path d="M0 0 V70" stroke="#D2C5F0" stroke-width="18"/>${starPath(35, 30, 6, '#F7E7A1')}</pattern>
    <pattern id="hfl" width="200" height="56" patternUnits="userSpaceOnUse"><rect width="200" height="56" fill="#E9CBA2"/><path d="M0 55 H200 M130 0 V56" stroke="#CFA97E" stroke-width="3"/><path d="M20 20 Q60 16 100 22" stroke="#D9B78F" stroke-width="2" fill="none"/></pattern>
    <pattern id="ktile" width="60" height="40" patternUnits="userSpaceOnUse"><rect width="60" height="40" fill="#E3F6F2"/><path d="M0 39 H60 M30 0 V20 M0 20 H60 M0 0 V20" stroke="#C3E8E1" stroke-width="2"/></pattern>
    <pattern id="kfl" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="#F4F0FF"/><rect width="50" height="50" fill="#DCD0F7"/><rect x="50" y="50" width="50" height="50" fill="#DCD0F7"/></pattern>
  </defs>
  <rect width="870" height="640" fill="url(#hwp)"/>
  <rect x="870" width="730" height="640" fill="#F6F1E4"/>
  <rect x="1070" y="300" width="530" height="220" fill="url(#ktile)"/>
  <rect y="640" width="870" height="260" fill="url(#hfl)"/>
  <rect x="870" y="640" width="730" height="260" fill="url(#kfl)"/>
  <rect ${O} x="-10" y="624" width="890" height="22" fill="#FBF7EF"/><rect ${O} x="870" y="624" width="740" height="22" fill="#FBF7EF"/>
  <rect ${O} x="856" y="-10" width="28" height="920" fill="#FBF7EF" style="stroke-width:3"/>
  ${windowArt(470, 120, 240, 210, w.weather)}
  <g transform="translate(120 110)"><rect ${O} width="200" height="150" rx="8" fill="#2E3266" style="stroke-width:5;stroke:#C9A57C"/>
    <circle cx="100" cy="76" r="34" fill="#B79CF0"/><ellipse cx="100" cy="82" rx="66" ry="13" fill="none" stroke="#3CC7B8" stroke-width="6" transform="rotate(-12 100 82)"/>
    ${starPath(166, 32, 9, '#F7E7A1')}${starPath(30, 116, 6, '#fff')}</g>
  <g transform="translate(130 330)"><rect ${O} width="220" height="16" rx="5" fill="#C9A57C"/>
    <rect ${O} x="14" y="-62" width="24" height="62" fill="#8FC3F0"/><rect ${O} x="40" y="-54" width="22" height="54" fill="#F5DE7A"/><rect ${O} x="64" y="-66" width="26" height="66" fill="#B79CF0"/>
    <rect ${O} x="94" y="-48" width="20" height="48" fill="#3CC7B8" transform="rotate(12 104 -24)"/>
    <path ${O} d="M160 0 V-30 Q160 -40 170 -40 H196 Q206 -40 206 -30 V0 Z" fill="#9EDDD4"/><path d="M170 -40 Q176 -64 183 -40 M186 -40 Q194 -60 198 -40" stroke="#6DBE7A" stroke-width="5" fill="none"/></g>
  ${windowArt(1230, 90, 220, 170, w.weather, '#9EDDD4')}
  <g transform="translate(1520 330)"><circle ${O} r="38" fill="#fff" style="stroke-width:4"/><path class="ln" stroke-width="4" d="M0 -22 V0 L14 8"/>
    <g fill="${INK}">${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<circle cx="${Math.cos(a) * 30}" cy="${Math.sin(a) * 30}" r="2.4"/>`; }).join('')}</g></g>
  <g transform="translate(910 210)"><rect ${O} width="150" height="14" rx="4" fill="#C9A57C"/>
    <rect ${O} x="10" y="-44" width="34" height="44" rx="8" fill="#fff"/><rect x="15" y="-28" width="24" height="24" rx="4" fill="#F0B35A"/>
    <rect ${O} x="56" y="-52" width="34" height="52" rx="8" fill="#fff"/><rect x="61" y="-34" width="24" height="30" rx="4" fill="#E58F6A"/>
    <rect ${O} x="102" y="-40" width="34" height="40" rx="8" fill="#fff"/><rect x="107" y="-26" width="24" height="22" rx="4" fill="#9EDDD4"/></g>
  <rect ${O} x="1070" y="520" width="540" height="232" fill="#C9B8F2"/>
  <path class="ln" stroke-width="2.4" opacity=".45" d="M1190 540 V735 M1320 540 V735 M1450 540 V735"/>
  <g fill="#F5DE7A"><circle cx="1175" cy="640" r="5"/><circle cx="1205" cy="640" r="5"/><circle cx="1305" cy="640" r="5"/><circle cx="1465" cy="640" r="5"/></g>
  <rect ${O} x="1060" y="502" width="560" height="26" rx="6" fill="#FBF7EF"/>
  <rect ${O} x="1340" y="506" width="140" height="18" rx="6" fill="#DCE6EF"/>`);

const lampArt = (it) => svg(90, 150, `
  ${it.data.on ? `<defs><radialGradient id="lg2"><stop offset="0" stop-color="#FFF3B0" stop-opacity=".85"/><stop offset="1" stop-color="#FFF3B0" stop-opacity="0"/></radialGradient></defs><circle cx="45" cy="40" r="150" fill="url(#lg2)"/>` : ''}
  <path ${O} d="M20 10 H70 L84 66 H6 Z" fill="${it.data.on ? '#FFF0A0' : '#F5DE7A'}"/>
  <rect ${O} x="40" y="66" width="10" height="60" fill="#B79CF0"/><ellipse ${O} cx="45" cy="132" rx="30" ry="10" fill="#7A64B0"/>`);

export const HOME = {
  id: 'home', posKey: 'home-v2', title: 'Home 🏠', weather: true, avatar: [500, 470],
  frame: 'linear-gradient(90deg, #DED3F7 54%, #F6F1E4 54%)',
  bg,
  stars: [{ id: 'home-cushion', x: 352, y: 772 }],
  items: [
    { id: 'lights', x: 30, y: 30, w: 800, h: 90, drag: false, data: { on: true },
      onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); },
      art: (it) => svg(800, 90, stringLights(10, 790, 20, 26, it.data.on)) },
    { id: 'rug', x: 140, y: 760, w: 460, h: 120, floor: true, art: () => svg(460, 120, `
      <ellipse ${O} cx="230" cy="60" rx="224" ry="54" fill="#9EDDD4"/><ellipse cx="230" cy="60" rx="180" ry="38" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="14 10"/>
      <ellipse cx="230" cy="60" rx="110" ry="20" fill="#C9B8F2"/>`) },
    { id: 'bed', x: 10, y: 450, w: 400, h: 300, art: () => svg(440, 320, `
      <rect ${O} x="12" y="40" width="110" height="270" rx="34" fill="#3CC7B8"/>${starPath(67, 110, 22, '#FBEFB4')}
      <rect ${O} x="40" y="170" width="390" height="96" rx="24" fill="#fff"/>
      <rect ${O} x="58" y="132" width="116" height="56" rx="26" fill="#C9B8F2"/>
      <path ${O} d="M160 160 H408 Q428 160 426 182 V262 H160 Z" fill="#FBEFB4"/>
      <path d="M180 190 H410 M180 222 H410" stroke="#F0DE90" stroke-width="10"/>
      <rect ${O} x="52" y="262" width="22" height="48" rx="6" fill="#C9A57C"/><rect ${O} x="396" y="262" width="22" height="48" rx="6" fill="#C9A57C"/>`) },
    { id: 'cat', x: 210, y: 528, w: 120, h: 96, cls: 'squish',
      onTap: (it, api) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.sfx.boing(); api.bubble(it.x + 60, it.y - 6, ['Meow! 🐾', 'Purrr...', 'Mrrp? 💜'][Math.floor(Math.random() * 3)]); },
      onGive: null,
      art: () => svg(120, 96, `
        <path d="M100 66 Q122 50 112 30" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M100 66 Q122 50 112 30" fill="none" stroke="#E8E4F2" stroke-width="6" stroke-linecap="round"/>
        <ellipse ${O} cx="66" cy="70" rx="44" ry="24" fill="#E8E4F2"/>
        <path ${O} d="M14 30 L18 4 L36 20 Q46 16 56 20 L72 4 L76 30 Q80 60 46 62 Q10 60 14 30 Z" fill="#E8E4F2"/>
        <path d="M22 12 L24 24 L32 20 Z M66 12 L64 24 L58 20 Z" fill="#F0B39A"/>
        <path class="ln" stroke-width="3" d="M28 36 Q33 32 38 36 M54 36 Q59 32 64 36"/>
        <path d="M44 44 L48 44 L46 47 Z" fill="#F08C7E"/><path class="ln" stroke-width="2" d="M46 47 Q42 52 38 49 M46 47 Q50 52 54 49"/>
        <path class="ln" stroke-width="1.6" opacity=".6" d="M14 42 L-2 40 M14 46 L0 50 M78 42 L94 40 M78 46 L92 50"/>`) },
    { id: 'nightstand', x: 420, y: 610, w: 120, h: 140, art: () => svg(120, 140, `
      <rect ${O} x="6" y="10" width="108" height="110" rx="10" fill="#FBF7EF"/>
      <path class="ln" stroke-width="2.4" d="M6 64 H114"/><circle cx="60" cy="38" r="5" fill="#C9A57C"/><circle cx="60" cy="92" r="5" fill="#C9A57C"/>
      <rect ${O} x="14" y="118" width="12" height="18" rx="3" fill="#C9A57C"/><rect ${O} x="94" y="118" width="12" height="18" rx="3" fill="#C9A57C"/>`) },
    { id: 'lamp', x: 436, y: 472, w: 90, h: 150, data: { on: false }, onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); }, art: lampArt },
    { id: 'wardrobe', x: 620, y: 300, w: 220, h: 450, drag: false, data: { open: false },
      onTap: (it, api) => {
        if (!it.data.open) { it.data.open = true; api.setArt(it); api.bubble(it.x + 110, it.y - 10, 'Tap again to change clothes 👗'); }
        else api.go('editor', { id: api.avatar()?.def.charId, back: ['scene', { id: 'home' }] });
      },
      art: (it) => svg(220, 450, `
        <rect ${O} x="6" y="6" width="208" height="430" rx="14" fill="#FBF7EF" style="stroke-width:3"/>
        ${it.data.open ? `<rect x="18" y="20" width="184" height="404" rx="8" fill="#5E4E7E"/>
          <path d="M26 60 H194" stroke="#C9A57C" stroke-width="6"/>
          ${[['#3CC7B8', 40], ['#F5DE7A', 82], ['#C9B8F2', 124], ['#8FC3F0', 166]].map(([c, x]) => `<path ${O} d="M${x} 62 l-14 18 v110 h28 v-110 z" fill="${c}" style="stroke-width:2"/>`).join('')}
          <rect ${O} x="30" y="330" width="60" height="40" rx="8" fill="#7A64B0"/><rect ${O} x="110" y="330" width="60" height="40" rx="8" fill="#E58F6A"/>
          <path ${O} d="M6 6 L-50 30 V412 L6 436 Z" fill="#E6DDFA"/><path ${O} d="M214 6 L270 30 V412 L214 436 Z" fill="#E6DDFA"/>`
        : `<path class="ln" stroke-width="3" d="M110 10 V432"/><rect ${O} x="88" y="200" width="8" height="50" rx="4" fill="#C9A57C"/><rect ${O} x="124" y="200" width="8" height="50" rx="4" fill="#C9A57C"/>
          ${starPath(56, 90, 16, '#C9B8F2')}${starPath(164, 90, 16, '#9EDDD4')}`}
        <rect ${O} x="0" y="0" width="220" height="20" rx="8" fill="#C9A57C"/>`) },
    { id: 'toybox', x: 600, y: 750, w: 190, h: 150, data: { open: false },
      onTap: (it, api) => {
        it.data.open = !it.data.open; api.setArt(it);
        if (it.data.open) {
          api.sparkle(it.x + 95, it.y + 30, ['🧸', '✨', '🎈', '⭐']);
          if (!api.starFound('home-toybox')) api.addStar('home-toybox', it.x + 64, it.y - 74, { spawned: true });
        }
      },
      art: (it) => svg(210, 170, `
        ${it.data.open ? `<path ${O} d="M8 70 L28 4 L204 4 L202 70 Z" fill="#9A80D8"/>
          <circle ${O} cx="70" cy="58" r="22" fill="#E58F6A"/><rect ${O} x="104" y="36" width="40" height="40" rx="6" fill="#8FC3F0" transform="rotate(-10 124 56)"/>
          <path ${O} d="M160 74 L178 18" style="stroke-width:5"/>${starPath(180, 14, 16, '#F7D24A')}` : ''}
        <rect ${O} x="10" y="66" width="190" height="100" rx="12" fill="#F5DE7A"/>
        ${starPath(60, 116, 18, '#fff')}${starPath(150, 116, 18, '#fff')}
        ${it.data.open ? '' : `<rect ${O} x="2" y="50" width="206" height="28" rx="10" fill="#B79CF0"/>`}`) },
    { id: 'cushion', x: 320, y: 752, w: 150, h: 96, art: () => svg(150, 96, `
      <ellipse ${O} cx="75" cy="52" rx="72" ry="40" fill="#C9B8F2"/><path class="ln" stroke-width="2.4" opacity=".5" d="M20 50 Q75 70 130 50"/>
      <circle ${O} cx="75" cy="50" r="8" fill="#F5DE7A"/>`) },

    // ---- kitchen ----
    { id: 'fridge', x: 890, y: 290, w: 170, h: 462, drag: false, data: { open: false, n: 0 },
      onTap: (it, api) => {
        it.data.open = !it.data.open; api.setArt(it);
        if (it.data.open && api.count('apple') + api.count('milk') + api.count('cupcake') < 3) {
          const kind = ['apple', 'milk', 'cupcake'][it.data.n++ % 3];
          food(api, kind, it.x + 60 + (it.data.n % 3) * 30, it.y + 360);
        }
      },
      art: (it) => svg(170, 462, `
        <rect ${O} x="6" y="6" width="158" height="450" rx="20" fill="#AFD6F7" style="stroke-width:3"/>
        ${it.data.open ? `<rect x="16" y="16" width="138" height="430" rx="12" fill="#F4FBFF"/>
          <path d="M18 130 H152 M18 240 H152 M18 340 H152" stroke="#C3DCEC" stroke-width="6"/>
          <circle ${O} cx="50" cy="110" r="16" fill="#E58F6A"/><rect ${O} x="90" y="70" width="34" height="56" rx="6" fill="#fff"/>
          <rect ${O} x="34" y="196" width="50" height="40" rx="8" fill="#F5DE7A"/><circle ${O} cx="116" cy="220" r="16" fill="#6DBE7A"/>
          <path ${O} d="M164 6 L210 26 V436 L164 456 Z" fill="#8FC3F0"/>`
        : `<path class="ln" stroke-width="3" d="M6 160 H164"/><rect ${O} x="134" y="60" width="12" height="70" rx="5" fill="#fff"/><rect ${O} x="134" y="190" width="12" height="90" rx="5" fill="#fff"/>
          <rect ${O} x="30" y="40" width="70" height="56" rx="6" fill="#FBF7EF" transform="rotate(-4 65 68)"/><path class="ln" stroke-width="2" d="M40 58 H90 M40 72 H80" transform="rotate(-4 65 68)"/>
          <circle ${O} cx="44" cy="220" r="10" fill="#F5DE7A"/><circle ${O} cx="74" cy="250" r="10" fill="#C9B8F2"/>`}`) },
    { id: 'pot', x: 1100, y: 418, w: 140, h: 96, drag: false, data: { busy: false },
      onTap: (it, api) => {
        if (it.data.busy) return;
        if (api.count('soup') >= 2) { api.bubble(it.x + 70, it.y - 20, 'Eat the soup first! 🍲'); return; }
        it.data.busy = true; it.el.classList.add('cooking'); api.sfx.pour();
        api.later(() => { it.data.busy = false; it.el.classList.remove('cooking'); food(api, 'soup', it.x + 160 + api.count('soup') * 20, it.y + 40); api.bubble(it.x + 70, it.y - 20, 'Soup is ready! Give it to someone.'); }, 1400);
      },
      art: () => svg(140, 96, `
        <g class="steam-big"><path class="ln" stroke-width="4" opacity=".55" d="M50 14 Q42 4 50 -8 M70 14 Q62 4 70 -8 M90 14 Q82 4 90 -8"/></g>
        <rect ${O} x="4" y="80" width="132" height="14" rx="6" fill="#4D5C9A"/>
        <path ${O} d="M22 30 H118 V70 Q118 84 104 84 H36 Q22 84 22 70 Z" fill="#E58F6A"/>
        <rect ${O} x="16" y="22" width="108" height="14" rx="6" fill="#F0A584"/><rect ${O} x="60" y="12" width="20" height="10" rx="4" fill="#F0A584"/>
        <path ${O} d="M22 44 H6 M118 44 H134" style="stroke-width:5"/>`) },
    { id: 'faucet', x: 1366, y: 420, w: 90, h: 100, drag: false,
      onTap: (it, api) => { it.el.classList.remove('watering'); void it.el.offsetWidth; it.el.classList.add('watering'); api.sfx.pour(); api.later(() => it.el.classList.remove('watering'), 1500); },
      art: () => svg(90, 100, `
        <rect class="water" x="58" y="38" width="8" height="54" rx="4" fill="#8FC3F0"/>
        <path ${O} d="M20 92 V30 Q20 10 42 10 H62 Q70 10 70 20 V36" fill="none" style="stroke-width:8;stroke:#B9C4D6"/>
        <path ${O} d="M20 92 V30 Q20 10 42 10 H62 Q70 10 70 20 V36" fill="none" style="stroke-width:3"/>
        <circle ${O} cx="20" cy="54" r="9" fill="#E3E9F2"/>`) },
    { id: 'table', x: 1140, y: 690, w: 280, h: 180, art: () => svg(280, 180, `
      <rect ${O} x="30" y="40" width="16" height="130" rx="5" fill="#C9A57C"/><rect ${O} x="234" y="40" width="16" height="130" rx="5" fill="#C9A57C"/>
      <rect ${O} x="6" y="20" width="268" height="30" rx="10" fill="#E9CBA2"/>
      <path d="M40 22 Q140 60 240 22" stroke="#9EDDD4" stroke-width="10" fill="none" opacity=".8"/>`) },
    { id: 'kchair1', x: 1060, y: 680, w: 110, h: 190, art: () => svg(120, 196, `
      <rect ${O} x="18" y="6" width="84" height="96" rx="26" fill="#9EDDD4"/><rect ${O} x="10" y="98" width="100" height="26" rx="10" fill="#9EDDD4"/>
      <rect ${O} x="20" y="122" width="14" height="70" rx="5" fill="#C9A57C"/><rect ${O} x="86" y="122" width="14" height="70" rx="5" fill="#C9A57C"/>`) },
    { id: 'fruit', x: 1230, y: 652, w: 110, h: 70, art: () => svg(110, 70, `
      <circle ${O} cx="36" cy="28" r="16" fill="#E58F6A"/><circle ${O} cx="62" cy="22" r="16" fill="#F5DE7A"/><circle ${O} cx="80" cy="34" r="14" fill="#6DBE7A"/>
      <path ${O} d="M6 36 H104 Q100 66 55 66 Q10 66 6 36 Z" fill="#FBF7EF"/><path d="M14 46 H96" stroke="#C9B8F2" stroke-width="6"/>`) },
    { id: 'kplant', x: 1480, y: 640, w: 120, h: 190, art: () => plantArt('monstera') },
  ],
};
