// Winter Planet map: a snowy valley with a frozen lake.
import { INK, O, svg, label, text, winterSky, mountains, pine, stringLights, starPath } from './common.js';
import { CLIMATES } from '../ui.js';

const bg = (w) => svg(1600, 900, `
  ${winterSky(w, 900, 'wmap')}
  ${mountains(470, '#D6DCF0')}${mountains(520, '#E4E8F6').replace(/translate/g, '')}
  <path d="M-10 470 Q400 420 800 450 T1620 440 V910 H-10 Z" fill="#F4F8FF"/>
  <path d="M-10 520 Q500 480 900 520 T1620 500" fill="none" stroke="#DDE6F5" stroke-width="30"/>
  <ellipse cx="720" cy="740" rx="420" ry="120" fill="#CFEAF7" stroke="${INK}" stroke-width="3"/>
  <path d="M420 720 Q520 700 600 730 M760 770 Q860 750 960 780 M640 790 L700 780" stroke="#fff" stroke-width="6" fill="none" opacity=".8" stroke-linecap="round"/>
  <g fill="#DCE6F4">${Array.from({ length: 22 }, (_, i) => `<ellipse cx="${80 + ((i * 211) % 1460)}" cy="${500 + ((i * 97) % 380)}" rx="${26 + (i % 3) * 8}" ry="7"/>`).join('')}</g>
  <g stroke="#BFD3EC" stroke-width="16" stroke-linecap="round" stroke-dasharray="2 34" fill="none">
    <path d="M290 520 Q520 560 720 520 Q960 480 1200 460"/><path d="M640 560 Q900 600 1120 640"/></g>
  ${pine(60, 470, 0.9)}${pine(1560, 500, 0.9)}${pine(1000, 380, 0.55)}${pine(440, 430, 0.5)}${pine(1460, 640, 0.7)}${pine(120, 680, 0.75)}`);

const cabin = () => svg(300, 300, `
  <g class="smoke"><circle cx="226" cy="30" r="12" fill="#fff" opacity=".8"/><circle cx="236" cy="12" r="9" fill="#fff" opacity=".6"/></g>
  <rect ${O} x="206" y="50" width="34" height="60" fill="#B98A6A"/>
  <rect ${O} x="46" y="120" width="208" height="132" rx="6" fill="#C99772"/>
  <path d="M46 150 H254 M46 180 H254 M46 210 H254" stroke="#A87A5A" stroke-width="4"/>
  <path ${O} d="M22 136 L150 36 L278 136 Z" fill="#7A64B0" style="stroke-width:3"/>
  <path d="M22 136 L150 36 L278 136 L262 136 L150 54 L38 136 Z" fill="#fff"/>
  <path d="M60 124 Q100 110 150 112 Q200 110 240 124" stroke="#fff" stroke-width="12" stroke-linecap="round" fill="none"/>
  <rect ${O} x="126" y="170" width="48" height="82" rx="20" fill="#7A64B0"/><circle cx="164" cy="214" r="4" fill="#F5DE7A"/>
  <rect ${O} x="66" y="158" width="42" height="40" rx="6" fill="#FFE9A0"/><path class="ln" stroke-width="2.4" d="M87 158 V198 M66 178 H108"/>
  <rect ${O} x="192" y="158" width="42" height="40" rx="6" fill="#FFE9A0"/><path class="ln" stroke-width="2.4" d="M213 158 V198 M192 178 H234"/>
  ${label(150, 280, 'Cabin', 140)}`);

const market = () => svg(320, 300, `
  ${[0, 1].map((i) => `<g transform="translate(${20 + i * 150} 70)">
    <rect ${O} x="10" y="70" width="120" height="100" fill="#FBF7EF"/>
    <path ${O} d="M0 72 L18 20 H122 L140 72 Z" fill="${i ? '#3CC7B8' : '#B79CF0'}"/>
    <path d="M30 20 L22 72 M56 20 L54 72 M84 20 L86 72 M110 20 L118 72" stroke="#fff" stroke-width="10" opacity=".85"/>
    <rect ${O} x="4" y="120" width="132" height="22" rx="6" fill="#C9A57C"/>
    ${i ? '<circle cx="50" cy="108" r="12" fill="#C99772" stroke="#4A3B5C" stroke-width="2"/><circle cx="84" cy="108" r="12" fill="#C99772" stroke="#4A3B5C" stroke-width="2"/>' : '<path d="M40 100 l-10 14 v6 h24 v-6 z" fill="#F5DE7A" stroke="#4A3B5C" stroke-width="2"/><path d="M84 96 q14 0 14 14 h-28 q0 -14 14 -14 z" fill="#9EDDD4" stroke="#4A3B5C" stroke-width="2"/>'}
  </g>`).join('')}
  ${stringLights(20, 300, 60, 16)}
  ${label(160, 278, 'Market', 150)}`);

const lookout = () => svg(260, 320, `
  <path d="M-10 300 Q130 200 270 300 Z" fill="#F4F8FF" stroke="${INK}" stroke-width="3"/>
  <rect ${O} x="70" y="150" width="120" height="110" fill="#E3E9F7"/>
  <path ${O} d="M60 156 Q130 40 200 156 Z" fill="#8FA4D8"/>
  <path ${O} d="M118 70 L142 70 L150 156 L110 156 Z" fill="#2E3266"/>
  <path ${O} d="M150 96 L210 60" style="stroke-width:10;stroke:#4D5C9A"/>
  <rect ${O} x="112" y="200" width="36" height="60" rx="14" fill="#4D5C9A"/>
  ${starPath(60, 50, 10, '#F5DE7A')}${starPath(210, 30, 7, '#F5DE7A')}
  ${label(130, 296, 'Lookout', 150)}`);

const rink = () => svg(400, 280, `
  <ellipse ${O} cx="200" cy="150" rx="190" ry="90" fill="#DDF1FA" style="stroke-width:3"/>
  <path d="M60 140 Q120 110 180 140 T300 140" stroke="#fff" stroke-width="6" fill="none"/>
  <path ${O} d="M10 150 Q200 40 390 150" fill="none" style="stroke-width:8;stroke:#FBF7EF"/>
  ${[40, 110, 200, 290, 360].map((x) => `<path d="M${x} ${x === 200 ? 80 : x < 200 ? 140 - (200 - x) * 0.3 : 140 - (x - 200) * 0.3} v-40" stroke="${INK}" stroke-width="3"/><path d="M${x} ${(x === 200 ? 80 : x < 200 ? 140 - (200 - x) * 0.3 : 140 - (x - 200) * 0.3) - 40} l24 8 -24 8 z" fill="${['#B79CF0', '#3CC7B8', '#F5DE7A', '#3CC7B8', '#B79CF0'][[40, 110, 200, 290, 360].indexOf(x)]}" stroke="${INK}" stroke-width="2"/>`).join('')}
  ${label(200, 254, 'Ice Rink', 160)}`);

const hill = () => svg(400, 330, `
  <path ${O} d="M0 300 Q60 60 200 40 Q300 30 400 300 Z" fill="#F4F8FF" style="stroke-width:3"/>
  <path d="M120 120 Q200 200 300 290 M150 100 Q230 190 330 290" stroke="#DDE6F5" stroke-width="8" fill="none"/>
  ${pine(70, 120, 0.4)}${pine(330, 110, 0.35)}
  <g transform="translate(176 96) rotate(30)"><rect ${O} x="0" y="0" width="80" height="20" rx="10" fill="#E58F6A"/><path class="ln" stroke-width="4" d="M-6 26 H88 Q96 26 96 16"/></g>
  <circle ${O} cx="300" cy="230" r="24" fill="#fff"/><circle ${O} cx="300" cy="190" r="17" fill="#fff"/><path d="M300 190 l14 3 -14 3 z" fill="#F0A060"/>
  ${label(200, 304, 'Snow Hill', 170)}`);

const goTo = (id) => (it, api) => { it.el.classList.add('press'); setTimeout(() => api.go('scene', { id }), 200); };
const place = (id, x, y, w, h, art) => ({ id, x, y, w, h, drag: false, cls: 'place', art, onTap: goTo(id) });

export const WINTER_MAP = {
  id: 'winter', title: 'Winter Planet ❄️', backLabel: 'Galaxy', back: ['galaxy'], weather: CLIMATES.winter, outdoor: true, noAvatar: true,
  frame: (w) => `linear-gradient(${w === 'snow' ? '#B0B8D0' : '#A6D4F4'} 50%, #F4F8FF 50%)`,
  bg,
  items: [
    place('cabin', 130, 250, 280, 280, cabin),
    place('market', 470, 230, 320, 300, market),
    place('lookout', 1180, 130, 260, 320, lookout),
    place('rink', 520, 560, 400, 280, rink),
    place('hill', 1040, 480, 400, 330, hill),
  ],
};
