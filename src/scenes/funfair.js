// Fun Fair (wide 2400×900 scene): Ferris wheel, carousel, high striker, sweet treats, balloons,
// a "hit the cans" game booth and a photo booth.
import { INK, O, svg, text, stringLights, wearable, NPC } from './common.js';

const W = 2400;
const f = (n) => n.toFixed(1);

function perspFloor({ y0 = 640, y1 = 900, h = 380, cols = 60, rows = 6, fill, stroke = 'none', sw = 0, stagger = false }) {
  const zf = (y1 - h) / (y0 - h);
  const yAt = (t) => h + (y1 - h) / (zf - ((zf - 1) * t) / rows);
  const vx = W / 2, span = W * 2.6;
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
const softCloud = (x, y, s, c, dur) => `<g class="drift" style="animation-duration:${dur}s"><g transform="translate(${x} ${y}) scale(${s})" fill="${c}">
  <ellipse cx="60" cy="44" rx="60" ry="22"/><ellipse cx="100" cy="30" rx="44" ry="30"/><ellipse cx="150" cy="42" rx="52" ry="24"/><ellipse cx="104" cy="52" rx="90" ry="16" opacity=".8"/></g></g>`;
const STONE_SUN = ['#ECE5DA', '#E2D9CC', '#F1ECE3', '#DAD0C2'];
const STONE_RAIN = ['#C9C6CF', '#BFBBC6', '#D0CDD6', '#B6B2BE'];
const PASTEL = ['#B79CF0', '#3CC7B8', '#8FC3F0', '#F5DE7A', '#E58F6A'];

// ---------- background ----------
const bg = (w) => {
  const sun = w.weather === 'sun';
  return svg(W, 900, `
  <defs>
    <linearGradient id="funfair-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sun ? '#9DCFF2' : '#8E9AB2'}"/><stop offset=".7" stop-color="${sun ? '#DDEFF7' : '#C2C8D6'}"/><stop offset="1" stop-color="${sun ? '#FBF1DC' : '#D2D5DE'}"/></linearGradient>
    <radialGradient id="funfair-sun"><stop offset="0" stop-color="#FFFBE6"/><stop offset=".25" stop-color="#FFF1B8" stop-opacity=".9"/><stop offset="1" stop-color="#FFE9A0" stop-opacity="0"/></radialGradient>
    <linearGradient id="funfair-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sun ? '#A9D89A' : '#93B58C'}"/><stop offset="1" stop-color="${sun ? '#8DC67F' : '#7FA27A'}"/></linearGradient>
    <linearGradient id="funfair-plazafade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2F52" stop-opacity=".16"/><stop offset=".5" stop-color="#3A2F52" stop-opacity="0"/><stop offset="1" stop-color="#3A2F52" stop-opacity=".06"/></linearGradient>
  </defs>
  <rect width="${W}" height="660" fill="url(#funfair-sky)"/>
  ${sun ? `<circle cx="2060" cy="140" r="210" fill="url(#funfair-sun)"/><circle cx="2060" cy="140" r="54" fill="#FFF6D0"/>` : ''}
  ${softCloud(120, 70, 1.2, sun ? '#FFFFFF' : '#E3E6EE', 90)}${softCloud(900, 40, 0.9, sun ? '#FFFFFF' : '#DDE1EA', 110)}${softCloud(1500, 110, 1.1, sun ? '#FFFFFF' : '#E3E6EE', 100)}${softCloud(2180, 60, 0.8, sun ? '#FFFFFF' : '#DDE1EA', 80)}
  ${sun ? '' : `${softCloud(500, 120, 1.4, '#B9C0CF', 70)}${softCloud(1900, 150, 1.3, '#B9C0CF', 75)}`}
  <path d="M0 560 Q200 470 420 520 T860 500 T1300 520 T1760 490 T2200 515 T${W} 500 V640 H0 Z" fill="${sun ? '#BFDDC6' : '#A9BDB0'}" opacity=".8"/>
  <g fill="${sun ? '#9CCBA4' : '#8BA894'}">${Array.from({ length: 34 }, (_, i) => `<ellipse cx="${i * 74 + 20}" cy="${560 + Math.sin(i * 1.7) * 10}" rx="${38 + (i % 3) * 10}" ry="${30 + (i % 4) * 8}"/>`).join('')}</g>
  <g opacity=".55">${[[700, '#C9B8F2'], [1230, '#9EDDD4'], [1820, '#F5DE7A']].map(([x, c]) => `<path d="M${x} 590 L${x + 50} 520 L${x + 100} 590 Z" fill="${c}"/><path d="M${x + 50} 520 V506" stroke="${INK}" stroke-width="2"/><path d="M${x + 50} 506 l14 5 -14 5 z" fill="#E58F6A"/>`).join('')}</g>
  <rect y="580" width="${W}" height="70" fill="url(#funfair-grass)"/>
  ${perspFloor({ stagger: true, fill: (j, k) => (sun ? STONE_SUN : STONE_RAIN)[(j * 5 + k * 3 + 60) % 4], stroke: sun ? '#CBBFAE' : '#A6A1AE', sw: 1.4 })}
  <rect y="640" width="${W}" height="260" fill="url(#funfair-plazafade)"/>
  ${sun ? '' : `<g fill="#fff" opacity=".22">${[[300, 760, 90], [1100, 840, 120], [1650, 720, 70], [2150, 820, 100]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.18}"/>`).join('')}</g>`}
  <g>${[[640, 1220], [1740, 2380]].map(([a, b]) => {
    let flags = '';
    const n = Math.round((b - a) / 46);
    for (let i = 1; i < n; i++) { const t = i / n, x = a + (b - a) * t, y = 250 + Math.sin(t * Math.PI) * 40; flags += `<path d="M${x - 14} ${y} L${x + 14} ${y} L${x} ${y + 26} Z" fill="${PASTEL[i % 5]}" opacity=".9"/>`; }
    return `<path d="M${a} 250 Q${(a + b) / 2} 330 ${b} 250" stroke="${INK}" stroke-width="1.6" fill="none" opacity=".6"/>${flags}`;
  }).join('')}</g>`);
};

// ---------- Ferris wheel ----------
const FW = { cx: 290, cy: 300, r: 250 };
const cabin = (a, c) => {
  const px = FW.cx + Math.cos(a) * FW.r, py = FW.cy + Math.sin(a) * FW.r;
  return `<g class="sx-cab"><path d="M${f(px)} ${f(py)} V${f(py + 18)}" stroke="#7A7090" stroke-width="3"/>
    <path d="M${f(px - 34)} ${f(py + 30)} Q${f(px)} ${f(py + 8)} ${f(px + 34)} ${f(py + 30)} Z" fill="${c}" stroke="${INK}" stroke-width="1.8"/>
    <rect x="${f(px - 28)}" y="${f(py + 30)}" width="56" height="44" rx="10" fill="#FBF8F2" stroke="${INK}" stroke-width="1.8"/>
    <rect x="${f(px - 22)}" y="${f(py + 36)}" width="44" height="18" rx="5" fill="#CFE6F5"/>
    <path d="M${f(px - 28)} ${f(py + 60)} H${f(px + 28)}" stroke="${c}" stroke-width="6"/></g>`;
};
const ferrisArt = () => {
  const spokes = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return `M${FW.cx} ${FW.cy} L${f(FW.cx + Math.cos(a) * FW.r)} ${f(FW.cy + Math.sin(a) * FW.r)}`; }).join(' ');
  const bulbs = Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return `<circle cx="${f(FW.cx + Math.cos(a) * (FW.r - 7))}" cy="${f(FW.cy + Math.sin(a) * (FW.r - 7))}" r="3.4" fill="${i % 2 ? '#FFF3B0' : '#FBF8F2'}"/>`; }).join('');
  const zig = Array.from({ length: 16 }, (_, i) => {
    const a1 = (i / 16) * Math.PI * 2, a2 = ((i + 1) / 16) * Math.PI * 2, rr = FW.r * 0.62;
    return `M${f(FW.cx + Math.cos(a1) * FW.r)} ${f(FW.cy + Math.sin(a1) * FW.r)} L${f(FW.cx + Math.cos(a2) * rr)} ${f(FW.cy + Math.sin(a2) * rr)}`;
  }).join(' ');
  return svg(580, 800, `
    <defs><linearGradient id="funfair-steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBF8F2"/><stop offset=".5" stop-color="#E2DCEF"/><stop offset="1" stop-color="#B9B0D2"/></linearGradient>
      <linearGradient id="funfair-leg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9A8FC0"/><stop offset=".5" stop-color="#D9D2EC"/><stop offset="1" stop-color="#8E83B6"/></linearGradient>
      <radialGradient id="funfair-hub" cx=".35" cy=".35"><stop offset="0" stop-color="#FFF6D0"/><stop offset="1" stop-color="#D6B36A"/></radialGradient></defs>
    ${shadow(290, 786, 230, 14, 0.18)}
    <path d="M290 300 L140 770 M290 300 L440 770" stroke="url(#funfair-leg)" stroke-width="18" stroke-linecap="round"/>
    <path d="M290 300 L140 770 M290 300 L440 770" stroke="${INK}" stroke-width="1.6" opacity=".4"/>
    <path d="M196 600 H384 M228 500 H352 M170 690 H410 M196 600 L352 500 M384 600 L228 500 M170 690 L384 600 M410 690 L196 600" stroke="#B9B0D2" stroke-width="5" opacity=".9"/>
    <g class="sx-wheel" style="transform-origin:${FW.cx}px ${FW.cy}px">
      <circle cx="${FW.cx}" cy="${FW.cy}" r="${FW.r}" fill="none" stroke="url(#funfair-steel)" stroke-width="14"/>
      <circle cx="${FW.cx}" cy="${FW.cy}" r="${FW.r}" fill="none" stroke="${INK}" stroke-width="1.4" opacity=".35"/>
      <circle cx="${FW.cx}" cy="${FW.cy}" r="${FW.r * 0.62}" fill="none" stroke="#D9D2EC" stroke-width="6"/>
      <path d="${spokes}" stroke="#CFC6E4" stroke-width="4"/>
      <path d="${zig}" stroke="#E2DCEF" stroke-width="2.5" opacity=".9"/>
      ${bulbs}
      ${Array.from({ length: 8 }, (_, k) => cabin((k / 8) * Math.PI * 2, PASTEL[k % 5])).join('')}
      <circle cx="${FW.cx}" cy="${FW.cy}" r="28" fill="url(#funfair-hub)" stroke="${INK}" stroke-width="2"/>
      <circle cx="${FW.cx}" cy="${FW.cy}" r="10" fill="#B79CF0" stroke="${INK}" stroke-width="1.6"/>
    </g>
    <path d="M110 770 H470 L486 796 H94 Z" fill="#E2DCEF" stroke="${INK}" stroke-width="2"/>
    <path d="M230 770 L240 740 H340 L350 770" fill="#FBF8F2" stroke="${INK}" stroke-width="2"/>
    <g transform="translate(170 712)"><rect width="66" height="56" rx="6" fill="#4D5C9A" stroke="${INK}" stroke-width="2"/><rect x="8" y="8" width="50" height="22" rx="4" fill="#CFE6F5"/>${text(33, 48, 'TICKETS', 10, '#F5DE7A', 600)}</g>`);
};

// ---------- carousel ----------
const horse = (cx, cy, s, body, mane, saddle, delay) => `<g transform="translate(${cx} ${cy}) scale(${-s} ${s})"><g class="sx-horse" style="animation-delay:${delay}s">
  <path d="M-42 -6 Q-72 -2 -70 30 Q-60 14 -46 8 Z" fill="${mane}" stroke="${INK}" stroke-width="1.6"/>
  <path d="M30 10 L46 28 L42 44 M20 14 L26 46 M-30 10 L-44 38 M-20 14 L-26 46" stroke="${INK}" stroke-width="13" stroke-linecap="round" fill="none"/>
  <path d="M30 10 L46 28 L42 44 M20 14 L26 46 M-30 10 L-44 38 M-20 14 L-26 46" stroke="${body}" stroke-width="9" stroke-linecap="round" fill="none"/>
  <ellipse cx="0" cy="0" rx="48" ry="23" fill="${body}" stroke="${INK}" stroke-width="2"/>
  <path d="M26 -12 Q36 -42 52 -56 Q60 -64 72 -58 L86 -44 Q90 -38 82 -36 L66 -40 Q58 -24 42 8 Z" fill="${body}" stroke="${INK}" stroke-width="2"/>
  <path d="M60 -60 L64 -72 L70 -60 Z" fill="${body}" stroke="${INK}" stroke-width="1.4"/>
  <path d="M28 -14 Q36 -42 52 -56 Q56 -62 62 -62 Q50 -48 44 -32 Q40 -20 36 -8 Z" fill="${mane}" stroke="${INK}" stroke-width="1.2"/>
  <path d="M-18 -18 Q0 -26 18 -18 L16 4 Q0 8 -16 4 Z" fill="${saddle}" stroke="${INK}" stroke-width="1.6"/>
  <path d="M-12 -12 Q0 -16 12 -12" stroke="#fff" stroke-width="2" opacity=".5" fill="none"/>
  <path d="M-4 4 L-6 22 M-10 22 H-2" stroke="#D6B36A" stroke-width="2.4"/>
  <path d="M-30 -8 Q-10 -16 10 -14" stroke="#fff" stroke-width="3" opacity=".35" fill="none" stroke-linecap="round"/></g></g>`;

const carouselArt = () => {
  let roof = '';
  const n = 12;
  for (let i = 0; i < n; i++) {
    const x1 = 14 + (492 * i) / n, x2 = 14 + (492 * (i + 1)) / n;
    roof += `<path d="M260 44 L${f(x1)} 156 L${f(x2)} 156 Z" fill="${i % 2 ? '#FBF7EF' : '#B79CF0'}"/>`;
  }
  const bulbs = (y, on) => Array.from({ length: 13 }, (_, i) => `<circle class="sx-bulb" cx="${30 + i * 38.3}" cy="${y}" r="5" fill="${on ? '#FFF3B0' : '#FBF8F2'}" stroke="${INK}" stroke-width="1"/>`).join('');
  return svg(520, 600, `
    <defs><linearGradient id="funfair-roofshade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${INK}" stop-opacity=".18"/><stop offset=".45" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="${INK}" stop-opacity=".22"/></linearGradient>
      <linearGradient id="funfair-gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B88F4A"/><stop offset=".45" stop-color="#F6E2A8"/><stop offset="1" stop-color="#9C7638"/></linearGradient>
      <linearGradient id="funfair-col" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6E9FC9"/><stop offset=".5" stop-color="#CFE6F5"/><stop offset="1" stop-color="#6E9FC9"/></linearGradient>
      <linearGradient id="funfair-deck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF7EF"/><stop offset="1" stop-color="#E2D9C8"/></linearGradient>
      <clipPath id="funfair-bandclip"><rect x="14" y="156" width="492" height="34"/></clipPath>
      <radialGradient id="funfair-bglow"><stop offset="0" stop-color="#FFF3B0" stop-opacity=".9"/><stop offset="1" stop-color="#FFF3B0" stop-opacity="0"/></radialGradient></defs>
    ${shadow(260, 588, 250, 14, 0.18)}
    <rect x="230" y="186" width="60" height="340" fill="url(#funfair-col)" stroke="${INK}" stroke-width="2"/>
    ${[220, 300, 380, 460].map((y) => `<rect x="236" y="${y}" width="48" height="56" rx="6" fill="#E9F4FB" stroke="${INK}" stroke-width="1.2" opacity=".8"/>`).join('')}
    <path d="M50 186 V530 M130 186 V530 M390 186 V530 M470 186 V530" stroke="url(#funfair-gold)" stroke-width="6"/>
    ${horse(130, 352, 1, '#FBF7EF', '#D6B36A', '#3CC7B8', 0)}
    ${horse(390, 372, 1, '#AFD6F7', '#B79CF0', '#E58F6A', -0.45)}
    <path d="M260 186 V560" stroke="url(#funfair-gold)" stroke-width="7"/>
    ${horse(270, 420, 1.2, '#D9CCF6', '#3CC7B8', '#F5DE7A', -0.25)}
    <path d="M10 530 Q260 500 510 530 L510 570 Q260 600 10 570 Z" fill="url(#funfair-deck)" stroke="${INK}" stroke-width="2"/>
    <path d="M10 530 Q260 560 510 530" stroke="${INK}" stroke-width="1.6" fill="none"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${40 + i * 55} ${548 + Math.abs(i - 4) * -2 + 6} v18" stroke="#D6B36A" stroke-width="3"/>`).join('')}
    <path d="M260 44 L14 156 L506 156 Z" fill="#B79CF0"/>${roof}
    <path d="M260 44 L14 156 L506 156 Z" fill="url(#funfair-roofshade)" stroke="${INK}" stroke-width="2"/>
    <g clip-path="url(#funfair-bandclip)"><rect x="14" y="156" width="492" height="34" fill="#3CC7B8"/>
      <g class="sx-band">${Array.from({ length: 30 }, (_, i) => `<path d="M${i * 24 - 24} 156 l12 0 l-14 34 l-12 0 Z" fill="#fff" opacity=".22"/>`).join('')}</g></g>
    <rect x="14" y="156" width="492" height="34" fill="none" stroke="${INK}" stroke-width="2"/>
    ${Array.from({ length: 13 }, (_, i) => `<path d="M${14 + i * 37.8} 190 a18.9 16 0 0 0 37.8 0 Z" fill="${i % 2 ? '#FBF7EF' : '#9EDDD4'}" stroke="${INK}" stroke-width="1.6"/>`).join('')}
    <g class="sx-glow" opacity="0">${Array.from({ length: 13 }, (_, i) => `<circle cx="${30 + i * 38.3}" cy="173" r="14" fill="url(#funfair-bglow)"/>`).join('')}</g>
    ${bulbs(173, false)}
    <circle cx="260" cy="36" r="12" fill="url(#funfair-gold)" stroke="${INK}" stroke-width="1.6"/>
    <path d="M260 24 V2" stroke="${INK}" stroke-width="2"/><path d="M260 2 L284 9 L260 16 Z" fill="#E58F6A" stroke="${INK}" stroke-width="1.4"/>`);
};

// ---------- treats ----------
const cottonArt = (c1, c2) => svg(70, 120, `
  <defs><radialGradient id="funfair-floss-${c1.slice(1)}" cx=".4" cy=".35"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
  <path d="M35 60 L28 118 H42 Z" fill="#FBF7EF" stroke="${INK}" stroke-width="1.8"/><path d="M31 80 L39 76 M30 96 L40 92" stroke="#3CC7B8" stroke-width="3"/>
  <g fill="url(#funfair-floss-${c1.slice(1)})" stroke="${INK}" stroke-width="1.6"><circle cx="22" cy="40" r="18"/><circle cx="48" cy="40" r="18"/><circle cx="35" cy="24" r="20"/><circle cx="35" cy="50" r="17"/></g>
  <path d="M24 22 Q32 14 42 18" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`);
const popcornArt = () => svg(70, 92, `
  <path d="M8 30 L62 30 L54 90 H16 Z" fill="#FBF7EF" stroke="${INK}" stroke-width="1.8"/>
  <path d="M18 30 L22 90 M33 30 V90 M48 30 L45 90" stroke="#E58F6A" stroke-width="7"/>
  <path d="M8 30 L62 30 L54 90 H16 Z" fill="none" stroke="${INK}" stroke-width="1.8"/>
  <g fill="#FFF8E1" stroke="${INK}" stroke-width="1.3">${[[16, 24], [28, 16], [40, 20], [54, 24], [22, 8], [36, 6], [48, 12], [34, 28]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8"/>`).join('')}</g>
  <g fill="#F5DE7A" opacity=".7">${[[18, 22], [38, 8], [50, 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>`);

function treat(api, kind, x, y) {
  const cotton = kind === 'cotton';
  const n = api.count(kind);
  const cols = [['#C9B8F2', '#9A80D8'], ['#AFD6F7', '#6FA8DC'], ['#9EDDD4', '#3CC7B8']][n % 3];
  return api.add({
    id: api.uid(kind), x, y, w: 70, h: cotton ? 120 : 92, cls: 'food',
    art: () => (cotton ? cottonArt(cols[0], cols[1]) : popcornArt()),
    onGive: (i, a, who) => a.eat(i, who, cotton ? 'Fluffy and sweet! 🍭' : 'Pop pop, yum! 🍿', cotton ? ['🍭', '✨', '💜'] : ['🍿', '✨', '💛']),
  }, { spawned: true });
}

// ---------- balloons ----------
function balloon(api, x, y) {
  const c = PASTEL[api.count('balloon') % 5];
  const gid = 'funfair-bal-' + c.slice(1);
  const it = api.add({
    id: api.uid('balloon'), x, y, w: 80, h: 200, cls: 'sx-balloon',
    onTap: (i, a) => {
      if (i.el.classList.contains('sx-float')) return;
      i.el.classList.add('sx-float'); a.sfx.pop();
      a.bubble(i.x + 40, i.y - 8, 'Up, up and away! 🎈');
      a.later(() => a.remove(i), 2600);
    },
    onGive: (i, a, who) => {
      a.snap(i, who.x + who.w - 40, who.y - 20);
      a.react(who, 'A balloon for me! 🎈', ['🎈', '💜', '✨']);
    },
    art: () => svg(80, 200, `
      <defs><radialGradient id="${gid}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".25" stop-color="${c}"/><stop offset="1" stop-color="${c}"/></radialGradient></defs>
      <path d="M40 92 Q30 120 44 146 Q56 172 38 198" stroke="${INK}" stroke-width="1.6" fill="none"/>
      <path d="M40 4 C70 4 76 34 72 52 C66 76 50 88 40 90 C30 88 14 76 8 52 C4 34 10 4 40 4 Z" fill="url(#${gid})" stroke="${INK}" stroke-width="2"/>
      <path d="M34 90 L46 90 L42 98 H38 Z" fill="${c}" stroke="${INK}" stroke-width="1.4"/>
      <path d="M22 26 Q26 14 38 12" stroke="#fff" stroke-width="4" fill="none" opacity=".75" stroke-linecap="round"/>`),
  }, { spawned: true });
  return it;
}

// ---------- hit the cans (mini-game) ----------
const CANS = [[90, 150], [150, 150], [210, 150], [120, 100], [180, 100], [150, 50]];
const RESTS_ON = { 3: [0, 1], 4: [1, 2], 5: [3, 4] };
function cansGame(api, booth) {
  api.modal((card) => {
    let up, balls, over, mx = 60, dir = 1;
    card.innerHTML += `<h2>Hit the cans!</h2><p class="m-status"></p>
      <svg class="funfair-cans" viewBox="0 0 300 220" style="width:min(320px,74vw);height:auto;display:block;margin:0 auto 8px;border-radius:14px;background:linear-gradient(#EAF4FB,#FBF7EF)"></svg>
      <p class="m-balls" style="font-size:22px;letter-spacing:4px;min-height:30px;margin-bottom:8px"></p>
      <div class="opt-row"><button class="btn throw">Throw! ⚾</button><button class="btn alt again">New game</button></div>`;
    const board = card.querySelector('.funfair-cans'), status = card.querySelector('.m-status'), ballsEl = card.querySelector('.m-balls');
    const canSvg = (x, y, i, down) => {
      const c = PASTEL[i % 5];
      const t = down ? `translate(${x + (i % 2 ? 26 : -26)} 190) rotate(${i % 2 ? 90 : -90})` : `translate(${x} ${y})`;
      return `<g transform="${t}" opacity="${down ? 0.6 : 1}"><rect x="-20" y="-24" width="40" height="48" rx="5" fill="${c}" stroke="${INK}" stroke-width="2"/>
        <rect x="-20" y="-10" width="40" height="18" fill="#FBF7EF" opacity=".85"/><ellipse cx="0" cy="-24" rx="20" ry="4" fill="#E2DFE8" stroke="${INK}" stroke-width="1.6"/>
        <rect x="-14" y="-20" width="4" height="40" rx="2" fill="#fff" opacity=".45"/></g>`;
    };
    const draw = (hit) => {
      board.innerHTML = `<rect x="40" y="176" width="220" height="12" rx="3" fill="#C9A57C" stroke="${INK}" stroke-width="2"/><path d="M60 188 V214 M240 188 V214" stroke="#A9835A" stroke-width="6"/>
        ${CANS.map(([x, y], i) => canSvg(x, y, i, !up[i])).join('')}
        ${hit ? `<circle cx="${hit[0]}" cy="${hit[1]}" r="9" fill="#FBF7EF" stroke="${INK}" stroke-width="2"/><path d="M${hit[0] - 4} ${hit[1] - 6} Q${hit[0] + 2} ${hit[1]} ${hit[0] - 4} ${hit[1] + 6}" stroke="#E58F6A" stroke-width="1.6" fill="none"/>` : ''}
        <g class="aim"><path d="M0 8 L-9 24 H9 Z" fill="#E58F6A" stroke="${INK}" stroke-width="1.6"/><path d="M0 0 V10" stroke="#E58F6A" stroke-width="2" stroke-dasharray="3 3"/></g>`;
      ballsEl.textContent = '⚾'.repeat(balls) || ' ';
      placeAim();
    };
    const placeAim = () => board.querySelector('.aim')?.setAttribute('transform', `translate(${mx.toFixed(1)} 190)`);
    const reset = () => { up = CANS.map(() => true); balls = 5; over = false; status.textContent = 'Tap Throw when the arrow is under a can. Bottom cans topple the ones above!'; draw(); };
    const tick = () => {
      if (!card.isConnected) return;
      if (!over) { mx += dir * 3.2; if (mx > 250) { mx = 250; dir = -1; } if (mx < 50) { mx = 50; dir = 1; } placeAim(); }
      requestAnimationFrame(tick);
    };
    card.querySelector('.throw').onclick = () => {
      if (over || balls <= 0) return;
      balls--;
      api.sfx.boing();
      // the ball hits the highest standing can near the arrow
      const near = CANS.map((p, i) => [i, p]).filter(([i, [x]]) => up[i] && Math.abs(x - mx) <= 22).sort((a, b) => a[1][1] - b[1][1]);
      let hit = null;
      if (near.length) {
        const [i, p] = near[0];
        hit = p; up[i] = false;
        let fell = true;
        while (fell) { fell = false; for (const k in RESTS_ON) if (up[k] && RESTS_ON[k].some((s) => !up[s])) { up[k] = false; fell = true; } }
        api.sfx.pop();
      }
      const left = up.filter(Boolean).length;
      if (!left) {
        over = true; draw(hit); api.sfx.win();
        status.textContent = 'All cans down! You win! 🎉';
        if (!api.starFound('funfair-cans')) { api.addStar('funfair-cans', booth.x + 40, booth.y + 130, { spawned: true }); status.textContent += ' A star appeared at the booth! ⭐'; }
        return;
      }
      if (!balls) { over = true; draw(hit); status.textContent = `${6 - left} cans down — out of balls! Try again 🔄`; return; }
      status.textContent = hit ? ['Nice hit! 🎯', 'Clang! 💥', 'Great throw! ⚾'][Math.floor(Math.random() * 3)] : 'Missed! Watch the arrow 👀';
      draw(hit);
    };
    card.querySelector('.again').onclick = () => { api.sfx.click(); reset(); };
    reset();
    tick();
  });
}

const boothBack = () => svg(290, 340, `
  <defs><linearGradient id="funfair-boothwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9F4FB"/><stop offset="1" stop-color="#CFE3F0"/></linearGradient>
    <linearGradient id="funfair-post" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C9A57C"/><stop offset=".5" stop-color="#E2C49B"/><stop offset="1" stop-color="#A9835A"/></linearGradient></defs>
  <rect x="20" y="70" width="250" height="260" fill="url(#funfair-boothwall)" stroke="${INK}" stroke-width="2"/>
  ${Array.from({ length: 9 }, (_, i) => `<path d="M${46 + i * 26} 72 V328" stroke="#BCD6E8" stroke-width="2"/>`).join('')}
  <rect x="14" y="70" width="14" height="270" fill="url(#funfair-post)" stroke="${INK}" stroke-width="1.6"/><rect x="262" y="70" width="14" height="270" fill="url(#funfair-post)" stroke="${INK}" stroke-width="1.6"/>
  <path d="M0 70 L20 10 H270 L290 70 Z" fill="#FBF7EF" stroke="${INK}" stroke-width="2"/>
  ${Array.from({ length: 7 }, (_, i) => `<path d="M${20 + i * 36} 10 L${8 + i * 39.4} 70 L${26 + i * 39.4} 70 L${38 + i * 36} 10 Z" fill="#3CC7B8"/>`).join('')}
  <path d="M0 70 L20 10 H270 L290 70 Z" fill="none" stroke="${INK}" stroke-width="2"/>
  ${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 36.25} 70 a18 14 0 0 0 36.25 0 Z" fill="${i % 2 ? '#3CC7B8' : '#FBF7EF'}" stroke="${INK}" stroke-width="1.4"/>`).join('')}
  <rect x="30" y="232" width="110" height="10" rx="3" fill="#C9A57C" stroke="${INK}" stroke-width="1.6"/>
  ${CANS.map(([x, y], i) => `<g transform="translate(${20 + x * 0.433} ${232 + (y - 174) * 0.43})"><rect x="-9" y="-11" width="18" height="22" rx="3" fill="${PASTEL[i % 5]}" stroke="${INK}" stroke-width="1.4"/><rect x="-9" y="-4" width="18" height="7" fill="#fff" opacity=".8"/></g>`).join('')}
  ${[[56, 140, '#B79CF0'], [108, 140, '#9EDDD4'], [246, 120, '#F5DE7A']].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><circle r="18" fill="${c}" stroke="${INK}" stroke-width="1.6"/><circle cx="-12" cy="-14" r="7" fill="${c}" stroke="${INK}" stroke-width="1.4"/><circle cx="12" cy="-14" r="7" fill="${c}" stroke="${INK}" stroke-width="1.4"/><ellipse cx="0" cy="6" rx="8" ry="6" fill="#fff" opacity=".6"/></g>`).join('')}`);

const boothCounter = () => svg(310, 180, `
  <defs><linearGradient id="funfair-ctr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2C49B"/><stop offset="1" stop-color="#C29E73"/></linearGradient></defs>
  ${shadow(155, 172, 150, 9, 0.18)}
  <rect x="8" y="22" width="294" height="148" fill="url(#funfair-ctr)" stroke="${INK}" stroke-width="2"/>
  ${Array.from({ length: 6 }, (_, i) => `<path d="M8 ${46 + i * 22} H302" stroke="#A9835A" stroke-width="1.6" opacity=".6"/>`).join('')}
  <path d="M8 22 Q83 60 155 22 Q227 60 302 22" fill="#B79CF0" stroke="${INK}" stroke-width="1.6"/>
  <path d="M40 30 L52 44 M100 34 L110 46 M200 34 L210 46 M262 30 L270 42" stroke="#fff" stroke-width="2" opacity=".4"/>
  <rect x="0" y="8" width="310" height="18" rx="4" fill="#FBF7EF" stroke="${INK}" stroke-width="2"/>
  <g transform="translate(155 108)"><rect x="-104" y="-22" width="208" height="40" rx="8" fill="#4D5C9A" stroke="${INK}" stroke-width="1.8"/>${text(0, 6, 'HIT THE CANS', 20, '#F5DE7A', 600)}</g>
  <g transform="translate(155 150)"><circle r="12" fill="#FBF7EF" stroke="${INK}" stroke-width="1.6"/><circle r="7" fill="#E58F6A"/><circle r="2.5" fill="#FBF7EF"/></g>`);

export const FUNFAIR = {
  id: 'funfair', title: 'Fun Fair 🎡', weather: true, outdoor: true, width: W, avatar: [560, 470],
  frame: (w) => `linear-gradient(${w === 'sun' ? '#BFE0F4' : '#A6AFC2'} 66%, ${w === 'sun' ? '#E6DFD3' : '#C3C0C9'} 66%)`,
  bg,
  stars: [{ id: 'funfair-hay', x: 1204, y: 748 }],
  characters: [
    { id: 'leo', look: { ...NPC.leo, top: 'sweater', topColor: '#4D5C9A', collar: 'round', neck: 'none', hat: 'cap', neckColor: '#3CC7B8', bottom: 'widePants', bottomColor: '#C9A57C' }, x: 2046, y: 394, s: 0.9, z: 30, drag: false,
      say: ['Step right up! Hit the cans! 🥫', 'Five balls, six cans! ⚾', 'Aim for the bottom cans! 🎯'] },
    { id: 'mia', look: { ...NPC.mia, topColor: '#9EDDD4', hat: 'straw', hairAcc: 'none' }, x: 1520, y: 476, s: 0.95,
      say: ["Hi! I'm Mia 💛", 'Have you tried the Ferris wheel? 🎡', 'Cotton candy is my favourite! 🍭', 'Tap the carousel! 🎠'] },
  ],
  items: [
    { id: 'lights1', x: 600, y: 110, w: 620, h: 90, drag: false, data: { on: true },
      onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); },
      art: (it) => svg(620, 90, stringLights(10, 610, 10, 26, it.data.on)) },
    { id: 'lights2', x: 1740, y: 116, w: 650, h: 90, drag: false, data: { on: true },
      onTap: (it, api) => { it.data.on = !it.data.on; api.setArt(it); api.sfx.click(); },
      art: (it) => svg(650, 90, stringLights(10, 640, 10, 26, it.data.on)) },
    { id: 'ferris', x: 30, y: 10, w: 580, h: 800, drag: false,
      onTap: (it, api) => {
        if (it.el.classList.contains('sx-spin')) { api.bubble(it.x + 290, it.y + 40, 'Wheee! 🎡'); return; }
        it.el.classList.add('sx-spin'); api.sfx.win();
        api.bubble(it.x + 290, it.y + 40, 'Up we go! 🎡');
        api.later(() => it.el.classList.remove('sx-spin'), 8100);
      },
      art: ferrisArt },
    { id: 'striker', x: 628, y: 216, w: 100, h: 596, drag: false,
      onTap: (it, api) => {
        if (it.el.classList.contains('sx-strike')) return;
        const s = 0.35 + Math.random() * 0.65;
        it.el.querySelector('.sx-puck')?.style.setProperty('--h', `${-Math.round(s * 462)}px`);
        it.el.classList.add('sx-strike'); api.sfx.boing();
        api.later(() => {
          if (s > 0.9) { api.sfx.win(); api.sparkle(it.x + 50, it.y + 40, ['🔔', '✨', '💪']); api.bubble(it.x + 50, it.y - 8, 'DING! Super strong! 💪'); } else api.bubble(it.x + 50, it.y - 8, s > 0.7 ? 'So close! 💪' : 'Give it another go! 💪');
        }, 520);
        api.later(() => it.el.classList.remove('sx-strike'), 1250);
      },
      art: () => svg(100, 596, `
        <defs><linearGradient id="funfair-pole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E2DCEF"/><stop offset=".5" stop-color="#FBF8F2"/><stop offset="1" stop-color="#B9B0D2"/></linearGradient>
          <radialGradient id="funfair-bell" cx=".35" cy=".3"><stop offset="0" stop-color="#FFF6D0"/><stop offset=".6" stop-color="#E8C766"/><stop offset="1" stop-color="#B88F4A"/></radialGradient></defs>
        ${shadow(50, 588, 46, 7, 0.18)}
        <rect x="34" y="50" width="32" height="500" rx="4" fill="url(#funfair-pole)" stroke="${INK}" stroke-width="2"/>
        ${['#E58F6A', '#F5DE7A', '#B79CF0', '#8FC3F0', '#3CC7B8'].map((c, i) => `<rect x="38" y="${60 + i * 96}" width="24" height="90" rx="2" fill="${c}" opacity=".55"/>`).join('')}
        ${Array.from({ length: 20 }, (_, i) => `<path d="M38 ${70 + i * 24} H${i % 2 ? 48 : 54}" stroke="${INK}" stroke-width="1.4" opacity=".6"/>`).join('')}
        <path d="M30 34 Q30 6 50 6 Q70 6 70 34 L74 46 H26 Z" fill="url(#funfair-bell)" stroke="${INK}" stroke-width="2"/>
        <circle cx="50" cy="50" r="5" fill="#B88F4A" stroke="${INK}" stroke-width="1.4"/>
        <g class="sx-puck"><rect x="28" y="518" width="44" height="22" rx="8" fill="#E58F6A" stroke="${INK}" stroke-width="2"/><rect x="34" y="522" width="20" height="5" rx="2.5" fill="#fff" opacity=".5"/></g>
        <path d="M6 552 H94 L88 582 H12 Z" fill="#4D5C9A" stroke="${INK}" stroke-width="2"/>
        <rect x="26" y="544" width="48" height="12" rx="4" fill="#9EDDD4" stroke="${INK}" stroke-width="1.6"/>
        <g transform="rotate(-24 86 560)"><rect x="82" y="470" width="8" height="92" rx="3" fill="#C9A57C" stroke="${INK}" stroke-width="1.4"/><rect x="70" y="456" width="32" height="22" rx="5" fill="#B79CF0" stroke="${INK}" stroke-width="1.6"/></g>`) },
    { id: 'cotton', x: 752, y: 466, w: 210, h: 346, drag: false,
      onTap: (it, api) => {
        if (api.count('cotton') >= 3) { api.bubble(it.x + 105, it.y - 8, 'Enjoy those first! 🍭'); return; }
        it.el.classList.remove('shake'); void it.el.offsetWidth; it.el.classList.add('shake');
        api.sfx.pour();
        api.later(() => treat(api, 'cotton', it.x + 10 + api.count('cotton') * 64, it.y + 196), 450);
      },
      art: () => svg(210, 346, `
        <defs><linearGradient id="funfair-cartbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE6F5"/><stop offset="1" stop-color="#9CC7E6"/></linearGradient>
          <linearGradient id="funfair-drum" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9AA0B4"/><stop offset=".4" stop-color="#F4F6FA"/><stop offset="1" stop-color="#868CA2"/></linearGradient>
          <radialGradient id="funfair-floss" cx=".5" cy=".6"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#C9B8F2"/></radialGradient></defs>
        ${shadow(105, 338, 100, 9, 0.18)}
        <path d="M24 70 V200 M186 70 V200" stroke="#B9B0D2" stroke-width="6"/>
        <path d="M6 70 Q105 20 204 70 Z" fill="#FBF7EF" stroke="${INK}" stroke-width="2"/>
        ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M105 30 L${6 + i * 33} 70 L${22 + i * 33} 70 Z" fill="#B79CF0" opacity=".85"/>`).join('')}
        <path d="M6 70 Q105 20 204 70" fill="none" stroke="${INK}" stroke-width="2"/>
        ${Array.from({ length: 6 }, (_, i) => `<path d="M${6 + i * 33} 70 a16.5 12 0 0 0 33 0 Z" fill="${i % 2 ? '#B79CF0' : '#FBF7EF'}" stroke="${INK}" stroke-width="1.4"/>`).join('')}
        <path d="M44 160 Q40 120 105 116 Q170 120 166 160 Z" fill="url(#funfair-floss)" stroke="${INK}" stroke-width="1.6"/>
        <path d="M36 150 H174 L166 196 H44 Z" fill="url(#funfair-drum)" stroke="${INK}" stroke-width="2"/>
        <rect x="14" y="196" width="182" height="96" rx="8" fill="url(#funfair-cartbody)" stroke="${INK}" stroke-width="2"/>
        <rect x="28" y="210" width="154" height="40" rx="6" fill="#FBF7EF" stroke="${INK}" stroke-width="1.4"/>${text(105, 237, 'Cotton Candy', 18, '#7A64B0', 600)}
        <path d="M14 262 H196" stroke="#fff" stroke-width="2" opacity=".5"/>
        ${[50, 160].map((x) => `<circle cx="${x}" cy="304" r="30" fill="#FBF7EF" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="304" r="22" fill="none" stroke="#B9B0D2" stroke-width="3"/><path d="M${x - 22} 304 H${x + 22} M${x} 282 V326 M${x - 15} 289 L${x + 15} 319 M${x + 15} 289 L${x - 15} 319" stroke="#B9B0D2" stroke-width="2"/><circle cx="${x}" cy="304" r="5" fill="#B79CF0" stroke="${INK}" stroke-width="1.4"/>`).join('')}`) },
    { id: 'popcorn', x: 976, y: 448, w: 200, h: 364, drag: false,
      onTap: (it, api) => {
        if (api.count('popcorn') >= 3) { api.bubble(it.x + 100, it.y - 8, 'Enjoy those first! 🍿'); return; }
        it.el.classList.remove('shake'); void it.el.offsetWidth; it.el.classList.add('shake');
        [0, 120, 240].forEach((t) => api.later(() => api.sfx.pop(), t));
        api.later(() => treat(api, 'popcorn', it.x + 4 + api.count('popcorn') * 64, it.y + 236), 400);
      },
      art: () => svg(200, 364, `
        <defs><linearGradient id="funfair-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".2" stop-color="#fff" stop-opacity=".1"/><stop offset=".8" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/></linearGradient>
          <linearGradient id="funfair-pbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBEFB4"/><stop offset="1" stop-color="#EBD58A"/></linearGradient></defs>
        ${shadow(100, 356, 96, 9, 0.18)}
        <path d="M24 34 L100 4 L176 34 Z" fill="#E58F6A" stroke="${INK}" stroke-width="2"/>
        <rect x="16" y="30" width="168" height="26" rx="4" fill="#FBF7EF" stroke="${INK}" stroke-width="2"/>${text(100, 50, 'POPCORN', 18, '#E58F6A', 600)}
        <rect x="24" y="56" width="152" height="150" fill="#FFF8E1" fill-opacity=".5" stroke="${INK}" stroke-width="2"/>
        <path d="M28 206 Q40 150 70 160 Q90 130 110 156 Q140 136 172 170 V206 Z" fill="#FFF3C8"/>
        <g fill="#FFF8E1" stroke="${INK}" stroke-width="1.1">${Array.from({ length: 22 }, (_, i) => `<circle cx="${34 + ((i * 37) % 136)}" cy="${176 + ((i * 13) % 26)}" r="${6 + (i % 3)}"/>`).join('')}</g>
        <g transform="translate(100 74)"><path d="M-26 0 H26 L20 30 H-20 Z" fill="#9AA0B4" stroke="${INK}" stroke-width="1.6"/><path d="M0 -10 V0" stroke="${INK}" stroke-width="2"/></g>
        <rect x="24" y="56" width="152" height="150" fill="url(#funfair-glass)"/>
        <path d="M100 56 V206" stroke="${INK}" stroke-width="1.6" opacity=".6"/>
        <rect x="14" y="204" width="172" height="100" rx="6" fill="url(#funfair-pbody)" stroke="${INK}" stroke-width="2"/>
        ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${24 + i * 22}" y="214" width="11" height="80" fill="#E58F6A" opacity=".55"/>`).join('')}
        ${[48, 152].map((x) => `<circle cx="${x}" cy="318" r="28" fill="#FBF7EF" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="318" r="20" fill="none" stroke="#E58F6A" stroke-width="3"/><circle cx="${x}" cy="318" r="5" fill="#F5DE7A" stroke="${INK}" stroke-width="1.4"/>`).join('')}`) },
    { id: 'hay', x: 1170, y: 726, w: 132, h: 100,
      onTap: (it, api) => { api.sparkle(it.x + 66, it.y + 20, ['🌾', '✨']); api.bubble(it.x + 66, it.y - 8, 'A comfy hay bale! 🌾'); },
      art: () => svg(132, 100, `
        <defs><linearGradient id="funfair-hayg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3DD9A"/><stop offset="1" stop-color="#D9B866"/></linearGradient></defs>
        ${shadow(66, 94, 62, 7, 0.18)}
        <rect x="6" y="14" width="120" height="78" rx="10" fill="url(#funfair-hayg)" stroke="${INK}" stroke-width="2"/>
        ${Array.from({ length: 16 }, (_, i) => `<path d="M${12 + i * 7.4} ${18 + (i % 3) * 4} L${10 + i * 7.4} ${86 - (i % 2) * 6}" stroke="#C9A24E" stroke-width="1.6" opacity=".7"/>`).join('')}
        <path d="M40 14 V92 M92 14 V92" stroke="#A47E52" stroke-width="4"/>
        <path d="M14 14 l-4 -8 M30 14 l2 -10 M64 14 l-2 -9 M110 14 l6 -8" stroke="#D9B866" stroke-width="2" stroke-linecap="round"/>`) },
    { id: 'carousel', x: 1210, y: 212, w: 520, h: 600, drag: false,
      onTap: (it, api) => {
        if (it.el.classList.contains('sx-turn')) return;
        it.el.classList.add('sx-turn');
        [0, 300, 600, 900, 1200, 1500].forEach((t) => api.later(() => api.sfx.tap(), t));
        api.bubble(it.x + 260, it.y + 20, 'Round and round! 🎠');
        api.later(() => it.el.classList.remove('sx-turn'), 6000);
      },
      art: carouselArt },
    { id: 'balloons', x: 1752, y: 330, w: 150, h: 482, drag: false,
      onTap: (it, api) => {
        if (api.count('balloon') >= 4) { api.bubble(it.x + 75, it.y - 8, 'Let some balloons fly first! 🎈'); return; }
        balloon(api, it.x - 30 + (api.count('balloon') % 4) * 52, it.y + 150);
      },
      art: () => svg(150, 482, `
        <defs>${PASTEL.map((c) => `<radialGradient id="funfair-sb-${c.slice(1)}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".3" stop-color="${c}"/><stop offset="1" stop-color="${c}"/></radialGradient>`).join('')}</defs>
        ${shadow(75, 474, 66, 8, 0.18)}
        ${[[30, 70], [75, 40], [120, 70], [50, 120], [100, 116], [75, 160], [20, 150], [130, 150]].map(([x, y], i) => `<path d="M${x} ${y + 34} Q${(x + 75) / 2} ${y + 120} 75 ${282}" stroke="${INK}" stroke-width="1.2" fill="none" opacity=".7"/>`).join('')}
        ${[[30, 70], [75, 40], [120, 70], [50, 120], [100, 116], [75, 160], [20, 150], [130, 150]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="27" ry="33" fill="url(#funfair-sb-${PASTEL[i % 5].slice(1)})" stroke="${INK}" stroke-width="1.8"/><path d="M${x - 14} ${y - 14} Q${x - 10} ${y - 24} ${x} ${y - 26}" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`).join('')}
        <path d="M75 282 V440" stroke="#C9A57C" stroke-width="7" stroke-linecap="round"/>
        <path d="M30 440 H120 L112 470 H38 Z" fill="#4D5C9A" stroke="${INK}" stroke-width="2"/>
        <g transform="translate(75 360)"><rect x="-44" y="-18" width="88" height="34" rx="6" fill="#FBF7EF" stroke="${INK}" stroke-width="1.6"/>${text(0, 6, 'BALLOONS', 13, '#7A64B0', 600)}</g>`) },
    { id: 'booth', x: 1920, y: 330, w: 290, h: 340, z: 25, drag: false,
      onTap: (it, api) => cansGame(api, it),
      art: boothBack },
    { id: 'boothCounter', x: 1910, y: 640, w: 310, h: 180, z: 40, drag: false,
      onTap: (it, api) => cansGame(api, api.get('booth')),
      art: boothCounter },
    { ...wearable('sun', 1926, 610, 'funfair-shades'), z: 45 },
    { ...wearable('cap', 2084, 594, 'funfair-cap'), z: 45 },
    { id: 'photobooth', x: 2222, y: 300, w: 172, h: 512, drag: false,
      onTap: (it, api) => {
        if (it.el.classList.contains('sx-snapping')) return;
        it.el.classList.add('sx-snapping');
        api.bubble(it.x + 86, it.y - 8, 'Say cheese! 📸');
        api.later(() => { api.effect(it.x + 86, it.y + 250, 'sx-flash', '', 700); api.sfx.click(); api.avatar()?.anim.happy(); }, 700);
        api.later(() => {
          it.el.classList.remove('sx-snapping');
          if (api.count('photo') >= 2) return;
          const n = api.count('photo');
          api.add({
            id: api.uid('photo'), x: it.x - 80 - n * 60, y: it.y + 300, w: 56, h: 150,
            onTap: (p, a) => { a.sparkle(p.x + 28, p.y + 60, ['📸', '✨', '💜']); a.bubble(p.x + 28, p.y - 8, 'What a lovely photo strip! 📸'); },
            art: () => svg(56, 150, `<rect x="2" y="2" width="52" height="146" rx="3" fill="#FBF7EF" stroke="${INK}" stroke-width="1.8"/>
              ${[0, 1, 2].map((k) => `<rect x="8" y="${8 + k * 46}" width="40" height="40" fill="${['#CFE6F5', '#E6DDFA', '#D5ECE8'][k]}"/>
                <circle cx="28" cy="${30 + k * 46}" r="9" fill="${PASTEL[(n + k) % 5]}"/><path d="M14 ${48 + k * 46} Q28 ${34 + k * 46} 42 ${48 + k * 46} Z" fill="${PASTEL[(n + k + 2) % 5]}"/>
                <path d="M12 ${14 + k * 46} l3 3 -3 3 -3 -3 z" fill="#fff"/>`).join('')}`),
          }, { spawned: true });
        }, 1100);
      },
      art: () => svg(172, 512, `
        <defs><linearGradient id="funfair-boothbody" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#43355A"/><stop offset=".5" stop-color="#5E4E74"/><stop offset="1" stop-color="#3B2E50"/></linearGradient>
          <linearGradient id="funfair-velvet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9A80D8"/><stop offset=".3" stop-color="#C9B8F2"/><stop offset=".6" stop-color="#9A80D8"/><stop offset="1" stop-color="#B79CF0"/></linearGradient></defs>
        ${shadow(86, 504, 84, 8, 0.2)}
        <rect x="6" y="40" width="160" height="460" rx="6" fill="url(#funfair-boothbody)" stroke="${INK}" stroke-width="2"/>
        <rect x="0" y="6" width="172" height="44" rx="6" fill="#F5DE7A" stroke="${INK}" stroke-width="2"/>${text(86, 36, 'PHOTOS', 22, INK, 600)}
        ${Array.from({ length: 9 }, (_, i) => `<circle cx="${12 + i * 18.5}" cy="6" r="4" fill="#FFF3B0" stroke="${INK}" stroke-width="1"/>`).join('')}
        <rect x="76" y="66" width="80" height="380" fill="#2E2448"/>
        <path d="M76 66 H156 V446 Q140 440 132 446 Q118 440 108 446 Q94 440 84 446 Q78 440 76 446 Z" fill="url(#funfair-velvet)" stroke="${INK}" stroke-width="1.6"/>
        <path d="M88 70 Q92 250 86 440 M104 70 Q100 250 106 440 M124 70 Q128 250 122 440 M142 70 Q138 250 144 440" stroke="#7A64B0" stroke-width="2" fill="none" opacity=".6"/>
        <rect x="70" y="60" width="92" height="10" rx="5" fill="#D6B36A" stroke="${INK}" stroke-width="1.4"/>
        <g transform="translate(16 80)"><rect width="50" height="150" rx="3" fill="#FBF7EF" stroke="${INK}" stroke-width="1.4"/>${[0, 1, 2].map((k) => `<rect x="6" y="${6 + k * 47}" width="38" height="41" fill="${['#CFE6F5', '#E6DDFA', '#D5ECE8'][k]}"/><circle cx="25" cy="${26 + k * 47}" r="8" fill="${PASTEL[k + 1]}"/>`).join('')}</g>
        <g transform="translate(22 270)"><rect width="38" height="56" rx="4" fill="#2E2448" stroke="#D6B36A" stroke-width="2"/><rect x="14" y="10" width="10" height="3" rx="1.5" fill="#D6B36A"/><circle cx="19" cy="34" r="8" fill="#3CC7B8" stroke="${INK}" stroke-width="1.4"/></g>
        <rect x="6" y="446" width="160" height="54" fill="#3B2E50" stroke="${INK}" stroke-width="2"/>`) },
    { id: 'bin', x: 14, y: 726, w: 62, h: 92,
      onTap: (it, api) => { api.bubble(it.x + 31, it.y - 8, 'Keep the fair tidy! ♻️'); api.sfx.click(); },
      art: () => svg(62, 92, `
        <defs><linearGradient id="funfair-bin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3CC7B8"/><stop offset=".5" stop-color="#7FDDD2"/><stop offset="1" stop-color="#2A9C90"/></linearGradient></defs>
        ${shadow(31, 88, 28, 5, 0.18)}
        <path d="M8 22 H54 L50 86 H12 Z" fill="url(#funfair-bin)" stroke="${INK}" stroke-width="2"/>
        <path d="M20 30 L22 80 M31 30 V80 M42 30 L40 80" stroke="#fff" stroke-width="2" opacity=".35"/>
        <rect x="4" y="12" width="54" height="12" rx="5" fill="#4D5C9A" stroke="${INK}" stroke-width="2"/>`) },
  ],
};
