// Sunny Planet island map: tap a place to go there.
import { INK, O, svg, label, text, sky, starPath } from './common.js';

const mapBg = (w) => {
  const sun = w.weather === 'sun';
  return svg(1600, 900, `
  ${sky(w, 900, 'mapSky')}
  <rect y="470" width="1600" height="430" fill="${sun ? '#7FD3E0' : '#8AAAB8'}"/>
  <g class="waves" stroke="#fff" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round">
    <path d="M40 520 q30 -14 60 0 t60 0 M1420 560 q30 -14 60 0 t60 0 M60 860 q30 -14 60 0 t60 0 M1440 860 q30 -14 60 0 t60 0"/></g>
  <g class="drift" style="animation-duration:40s"><g transform="translate(1440 470)"><path ${O} d="M0 30 H80 L66 48 H14 Z" fill="#fff"/><path ${O} d="M40 28 V-30 L72 22 Z" fill="#C9B8F2"/></g></g>
  <path ${O} d="M60 610 C60 430 400 336 800 340 C1220 344 1546 430 1540 612 C1534 806 1160 878 800 876 C420 874 60 810 60 610 Z" fill="${sun ? '#F7E3A9' : '#E3D3A8'}" style="stroke-width:4"/>
  <path d="M130 590 C150 450 470 380 800 386 C1130 392 1460 460 1470 600 C1470 700 1300 760 800 770 C380 772 130 700 130 590 Z" fill="${sun ? '#A8DE9A' : '#97C68E'}"/>
  <g fill="${sun ? '#93D08A' : '#86B87E'}">${Array.from({ length: 26 }, (_, i) => `<ellipse cx="${200 + ((i * 197) % 1200)}" cy="${420 + ((i * 113) % 330)}" rx="${18 + (i % 3) * 6}" ry="7"/>`).join('')}</g>
  <g stroke="#EBCB86" stroke-width="20" stroke-linecap="round" stroke-dasharray="2 34" fill="none">
    <path d="M240 520 Q500 560 800 520 Q1100 490 1130 520"/><path d="M360 560 Q560 640 760 640 Q1000 640 1180 660"/></g>
  <g transform="translate(10 520)"><path d="M40 160 Q50 80 34 20" stroke="#8B6450" stroke-width="14" fill="none" stroke-linecap="round"/>
    <path d="M34 22 Q0 0 -30 20 M34 22 Q70 -6 100 16 M34 22 Q14 -24 -10 -30 M34 22 Q60 -26 84 -24" stroke="#4E9B5A" stroke-width="16" fill="none" stroke-linecap="round"/></g>
  <g transform="translate(1490 520)"><path d="M40 160 Q30 80 46 20" stroke="#8B6450" stroke-width="14" fill="none" stroke-linecap="round"/>
    <path d="M46 22 Q10 -2 -20 16 M46 22 Q80 0 110 20 M46 22 Q30 -24 4 -30 M46 22 Q70 -26 94 -20" stroke="#4E9B5A" stroke-width="16" fill="none" stroke-linecap="round"/></g>`);
};

const home = () => svg(300, 300, `
  <rect ${O} x="196" y="46" width="32" height="60" fill="#F7E7A1"/>
  <rect ${O} x="50" y="118" width="200" height="132" rx="10" fill="#C9B8F2"/>
  <path ${O} d="M26 132 L150 26 L274 132 Z" fill="#3CC7B8" style="stroke-width:3"/>
  <circle ${O} cx="150" cy="90" r="18" fill="#BFE6FF"/>
  <rect ${O} x="128" y="168" width="44" height="82" rx="20" fill="#7A64B0"/><circle cx="162" cy="212" r="4" fill="#F5DE7A"/>
  <rect ${O} x="70" y="150" width="42" height="42" rx="6" fill="#BFE6FF"/><path class="ln" stroke-width="2.4" d="M91 150 V192 M70 171 H112"/>
  <rect ${O} x="188" y="150" width="42" height="42" rx="6" fill="#BFE6FF"/><path class="ln" stroke-width="2.4" d="M209 150 V192 M188 171 H230"/>
  <ellipse cx="80" cy="250" rx="34" ry="12" fill="#6DBE7A"/><ellipse cx="226" cy="250" rx="30" ry="11" fill="#6DBE7A"/>
  ${label(150, 280, 'Home', 140)}`);

const cafe = () => {
  let sc = '';
  for (let i = 0; i < 8; i++) sc += `<path ${O} d="M${30 + i * 30} 112 h30 v24 q-15 22 -30 0 z" fill="${i % 2 ? '#fff' : '#3CC7B8'}" style="stroke-width:2.2"/>`;
  return svg(300, 330, `
    <rect ${O} x="40" y="100" width="220" height="180" rx="10" fill="#FBEFB4"/>${sc}
    <rect ${O} x="80" y="40" width="140" height="54" rx="16" fill="#3CC7B8"/>${text(150, 78, 'Café', 32, '#fff')}
    <rect ${O} x="58" y="168" width="92" height="76" rx="8" fill="#BFE6FF"/>
    <path ${O} d="M86 196 h30 v18 q0 10 -10 10 h-10 q-10 0 -10 -10 z" fill="#fff" style="stroke-width:2"/>
    <rect ${O} x="172" y="168" width="64" height="112" rx="10" fill="#B79CF0"/><circle cx="222" cy="226" r="4" fill="#F5DE7A"/>
    ${label(150, 308, 'Café', 140)}`);
};

const boutique = () => svg(300, 330, `
  <rect ${O} x="36" y="92" width="228" height="188" rx="10" fill="#E6DDFA"/>
  <path ${O} d="M26 96 Q150 30 274 96 Z" fill="#B79CF0"/>
  <rect ${O} x="70" y="56" width="160" height="44" rx="14" fill="#fff"/>${text(150, 87, 'Boutique', 26, '#7A64B0')}
  <path ${O} d="M58 280 V170 Q58 130 98 130 Q138 130 138 170 V280 Z" fill="#BFE6FF"/>
  <path ${O} d="M86 158 h24 l10 16 -8 4 v52 h-28 v-52 l-8 -4 z" fill="#3CC7B8" style="stroke-width:2"/>
  <rect ${O} x="166" y="160" width="72" height="120" rx="10" fill="#7A64B0"/><circle cx="224" cy="222" r="4" fill="#F5DE7A"/>
  ${starPath(150, 112, 9, '#F5DE7A')}
  ${label(150, 308, 'Boutique', 170)}`);

const games = () => svg(300, 330, `
  <rect ${O} x="40" y="96" width="220" height="184" rx="10" fill="#4D5C9A"/>
  <rect ${O} x="62" y="48" width="176" height="56" rx="16" fill="#2E2A3A"/>${text(150, 87, 'Games', 32, '#F5DE7A')}
  <rect ${O} x="60" y="150" width="96" height="80" rx="8" fill="#BFE6FF"/>
  <rect ${O} x="80" y="170" width="34" height="34" rx="6" fill="#fff" transform="rotate(-12 97 187)"/><circle cx="92" cy="182" r="3.5" fill="${INK}"/><circle cx="102" cy="194" r="3.5" fill="${INK}"/>
  <path ${O} d="M128 220 v-26 q0 -8 6 -8 q6 0 6 8 v26 z" fill="#C9B8F2" style="stroke-width:2"/>
  <rect ${O} x="176" y="160" width="62" height="120" rx="10" fill="#F5DE7A"/><circle cx="226" cy="220" r="4" fill="${INK}"/>
  <g fill="#F5DE7A">${[70, 110, 150, 190, 230].map((x) => `<circle cx="${x}" cy="128" r="6"/>`).join('')}</g>
  ${label(150, 308, 'Game Room', 190)}`);

const park = () => svg(320, 280, `
  <ellipse cx="160" cy="200" rx="150" ry="44" fill="#8FD08A"/>
  <rect ${O} x="58" y="110" width="18" height="70" fill="#8B6450"/><circle ${O} cx="67" cy="90" r="52" fill="#6DBE7A"/><circle cx="50" cy="76" r="16" fill="#8FD88A"/>
  <path ${O} d="M150 186 V110 H250 V186" fill="none" style="stroke-width:5"/><path class="ln" stroke-width="2.4" d="M182 110 V160 M220 110 V160"/><rect ${O} x="174" y="158" width="54" height="10" rx="4" fill="#F5DE7A"/>
  <ellipse ${O} cx="250" cy="200" rx="34" ry="12" fill="#9EDDD4"/><path d="M250 196 Q240 170 250 160 Q260 170 250 196" fill="#BFE6FF" stroke="${INK}" stroke-width="2"/>
  ${label(160, 252, 'Park', 130)}`);

const gym = () => svg(300, 300, `
  <rect ${O} x="40" y="86" width="220" height="164" rx="10" fill="#9EDDD4"/>
  <rect ${O} x="30" y="72" width="240" height="30" rx="8" fill="#3CC7B8"/>
  <rect ${O} x="80" y="30" width="140" height="48" rx="14" fill="#fff"/>${text(150, 64, 'Gym', 30, '#2E9C90')}
  <rect ${O} x="62" y="128" width="100" height="72" rx="8" fill="#BFE6FF"/>
  <path ${O} d="M78 164 H146" style="stroke-width:5"/><rect ${O} x="72" y="150" width="12" height="28" rx="3" fill="#4D5C9A"/><rect ${O} x="140" y="150" width="12" height="28" rx="3" fill="#4D5C9A"/>
  <rect ${O} x="182" y="140" width="56" height="110" rx="10" fill="#4D5C9A"/><circle cx="226" cy="196" r="4" fill="#F5DE7A"/>
  ${label(150, 278, 'Gym', 120)}`);

const beach = () => svg(360, 280, `
  <ellipse ${O} cx="180" cy="200" rx="170" ry="54" fill="#FBEBC0"/>
  <g stroke="#7FD3E0" stroke-width="6" fill="none" stroke-linecap="round"><path d="M30 214 q24 -12 48 0 t48 0"/></g>
  <rect ${O} x="190" y="196" width="110" height="34" rx="8" fill="#F5DE7A" transform="rotate(-6 245 213)"/>
  <path d="M176 70 L170 210" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <path ${O} d="M80 92 Q176 0 272 92 Z" fill="#B79CF0" style="stroke-width:3"/>
  <path d="M176 22 L136 92 L160 92 Z M176 22 L200 92 L224 92 Z" fill="#fff" stroke="${INK}" stroke-width="2"/>
  <circle ${O} cx="96" cy="178" r="22" fill="#fff"/><path d="M76 172 Q96 162 116 172" stroke="#3CC7B8" stroke-width="7" fill="none"/>
  ${label(180, 256, 'Beach', 150)}`);

const goTo = (id) => (it, api) => { it.el.classList.add('press'); setTimeout(() => api.go('scene', { id }), 200); };
const place = (id, x, y, w, h, art) => ({ id, x, y, w, h, drag: false, cls: 'place', art, onTap: goTo(id) });

export const MAP = {
  id: 'sunny', title: 'Sunny Planet ☀️', backLabel: 'Galaxy', back: ['galaxy'], weather: true, outdoor: true, noAvatar: true,
  frame: 'linear-gradient(#A9DCFF 50%, #7FD3E0 50%)',
  bg: mapBg,
  items: [
    place('home', 120, 236, 250, 250, home),
    place('boutique', 410, 210, 250, 275, boutique),
    place('cafe', 710, 205, 250, 275, cafe),
    place('games', 1010, 212, 250, 275, games),
    place('park', 200, 520, 320, 280, park),
    place('gym', 600, 540, 280, 280, gym),
    place('beach', 1010, 560, 380, 295, beach),
  ],
};
