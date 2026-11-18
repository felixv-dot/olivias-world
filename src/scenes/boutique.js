// Boutique: tap clothes on the racks to try them on, drag glasses and hats onto a character.
import { INK, O, svg, text, starPath, plantArt, wearable, NPC } from './common.js';

const bg = () => svg(1600, 900, `
  <defs>
    <pattern id="bwp" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#EEE7FB"/><path d="M40 0 V80" stroke="#E4DAF7" stroke-width="30"/></pattern>
    <pattern id="bfl" width="120" height="60" patternUnits="userSpaceOnUse"><rect width="120" height="60" fill="#E9CBA2"/><path d="M0 30 L30 0 M30 60 L60 30 L90 60 M60 0 L90 30 L120 0 M90 30 L120 60" stroke="#D3AF85" stroke-width="3" fill="none"/></pattern>
  </defs>
  <rect width="1600" height="640" fill="url(#bwp)"/>
  <rect y="460" width="1600" height="180" fill="#F7F2FF"/><path d="M0 460 H1600" stroke="${INK}" stroke-width="3"/>
  ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 100 + 14}" y="480" width="72" height="140" rx="8" fill="none" stroke="#E0D6F4" stroke-width="4"/>`).join('')}
  <rect y="640" width="1600" height="260" fill="url(#bfl)"/>
  <rect ${O} x="-10" y="626" width="1620" height="22" fill="#FBF7EF"/>
  <g transform="translate(560 40)"><rect ${O} width="420" height="70" rx="35" fill="#fff" style="stroke-width:3"/>${text(210, 48, 'Sunny Boutique', 38, '#7A64B0')}${starPath(36, 35, 14, '#F5DE7A')}${starPath(384, 35, 14, '#F5DE7A')}</g>
  <g transform="translate(800 120)"><path d="M0 0 V40" stroke="${INK}" stroke-width="3"/><path ${O} d="M-60 40 H60 L40 80 H-40 Z" fill="#F5DE7A"/>
    ${[-48, -24, 0, 24, 48].map((x) => `<path d="M${x} 80 V100" stroke="#F5DE7A" stroke-width="3"/><circle cx="${x}" cy="104" r="5" fill="#FFF3B0" stroke="${INK}" stroke-width="1.5"/>`).join('')}</g>
  ${[40, 450].map((x) => `<g transform="translate(${x} 230)"><path ${O} d="M10 0 H390 M30 0 V400 M370 0 V400" fill="none" style="stroke-width:7;stroke:#C9A57C"/><path ${O} d="M10 0 H390" fill="none" style="stroke-width:2"/>
    <rect ${O} x="10" y="396" width="380" height="16" rx="6" fill="#C9A57C"/></g>`).join('')}
  <g transform="translate(870 240)"><rect ${O} width="250" height="18" rx="5" fill="#C9A57C"/><rect ${O} y="140" width="250" height="18" rx="5" fill="#C9A57C"/></g>
  <g transform="translate(860 560)"><rect ${O} width="270" height="24" rx="8" fill="#FBF7EF"/><rect ${O} x="20" y="24" width="230" height="110" fill="#C9B8F2"/><path class="ln" stroke-width="2.4" opacity=".4" d="M135 30 V130"/></g>`);

const TOPS = [
  { top: 'hoodie', topColor: '#C9B8F2', collar: 'hood', neck: 'none' },
  { top: 'sweater', topColor: '#9EDDD4', collar: 'sailor', collarColor: '#4D5C9A', neck: 'ribbon', neckColor: '#F5DE7A' },
  { top: 'tee', topColor: '#F5DE7A', badge: true },
];
const BOTTOMS = [
  { bottom: 'skirt', bottomColor: '#4D5C9A', socks: 'knee', socksColor: '#FFFFFF' },
  { bottom: 'widePants', bottomColor: '#AFD6F7' },
  { bottom: 'shorts', bottomColor: '#3CC7B8', socks: 'ankle', socksColor: '#FFFFFF' },
];
const SHOES = [
  { shoes: 'boots', shoesColor: '#7A64B0' },
  { shoes: 'sneakers', shoesColor: '#FFFFFF' },
  { shoes: 'boots', shoesColor: '#E58F6A' },
  { shoes: 'sneakers', shoesColor: '#F5DE7A' },
];

const hanger = (body) => `<path class="ln" stroke-width="3" d="M60 4 Q60 -6 68 -6 Q76 -6 74 4 L60 14"/><path class="ln" stroke-width="3" d="M14 34 L60 14 L106 34"/>${body}`;
const topArt = (p) => svg(120, 190, hanger(`
  <path ${O} d="M24 36 L60 30 L96 36 L118 110 L100 116 L92 80 L92 176 H28 L28 80 L20 116 L2 110 Z" fill="${p.topColor}"/>
  ${p.collar === 'hood' ? `<path ${O} d="M40 34 Q60 60 80 34 Q74 52 60 54 Q46 52 40 34 Z" fill="#B3A0E4"/>` : ''}
  ${p.collar === 'sailor' ? `<path ${O} d="M40 34 L60 60 L80 34 L90 40 L60 74 L30 40 Z" fill="${p.collarColor}"/>` : ''}
  ${p.top === 'tee' ? `<path ${O} d="M24 36 L2 70 L20 80 L28 66" fill="${p.topColor}"/><path ${O} d="M96 36 L118 70 L100 80 L92 66" fill="${p.topColor}"/><path d="M28 80 V176 M92 80 V176" stroke="${p.topColor}" stroke-width="3"/>` : ''}
  ${p.badge ? `<circle ${O} cx="76" cy="100" r="9" fill="#FBF6EC" style="stroke-width:2"/>` : ''}
  <path d="M28 160 H92" stroke="${INK}" stroke-width="2" opacity=".3"/>`));
const bottomArt = (p) => svg(120, 190, hanger(p.bottom === 'skirt'
  ? `<path ${O} d="M30 30 H90 L112 130 Q60 146 8 130 Z" fill="${p.bottomColor}"/><path class="ln" stroke-width="2" opacity=".4" d="M44 34 L28 132 M60 34 V138 M76 34 L92 132"/>`
  : p.bottom === 'widePants'
    ? `<path ${O} d="M30 30 H90 L104 182 H66 L60 70 L54 182 H16 Z" fill="${p.bottomColor}"/>`
    : `<path ${O} d="M26 30 H94 L100 96 H64 L60 70 L56 96 H20 Z" fill="${p.bottomColor}"/><path d="M22 90 H58 M62 90 H98" stroke="${INK}" stroke-width="3" opacity=".4"/>`));
const shoeArt = (p) => svg(110, 60, p.shoes === 'boots'
  ? `<path ${O} d="M8 56 C4 30 20 14 46 14 C70 14 80 30 78 56 Z" fill="${p.shoesColor}"/><path ${O} d="M40 56 C38 30 50 14 70 14 C96 14 106 30 102 56 Z" fill="${p.shoesColor}"/>`
  : `<path ${O} d="M6 56 C4 34 18 24 40 26 C60 28 70 42 70 56 Z" fill="${p.shoesColor}"/><path ${O} d="M40 56 C40 42 52 28 72 26 C94 24 106 34 104 56 Z" fill="${p.shoesColor}"/><path d="M8 50 H104" stroke="#8FC3F0" stroke-width="4"/>`);

const tryOn = (patch, text) => (it, api) => {
  const me = api.avatar();
  api.setLook(me, patch);
  api.sfx.wear();
  api.react(me, text, ['✨', '💜', '👗']);
  it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing');
};

export const BOUTIQUE = {
  id: 'boutique', title: 'Sunny Boutique 👗', avatar: [560, 480],
  frame: 'linear-gradient(#EEE7FB 70%, #E9CBA2 70%)',
  bg,
  characters: [{ id: 'stylist', look: NPC.stylist, x: 1130, y: 470, s: 0.95, say: ['Tap any clothes to try them on! ✨', 'Glasses and hats go on the table!', 'That looks amazing on you! 💜'] }],
  items: [
    ...TOPS.map((p, i) => ({ id: 'top' + i, x: 80 + i * 115, y: 238, w: 120, h: 190, drag: false, cls: 'hanger', onTap: tryOn(p, 'New top! ✨'), art: () => topArt(p) })),
    ...BOTTOMS.map((p, i) => ({ id: 'bot' + i, x: 490 + i * 115, y: 238, w: 120, h: 190, drag: false, cls: 'hanger', onTap: tryOn(p, 'Love it! 💜'), art: () => bottomArt(p) })),
    ...SHOES.map((p, i) => ({ id: 'shoe' + i, x: 880 + (i % 2) * 120, y: 180 + Math.floor(i / 2) * 140, w: 110, h: 60, drag: false, cls: 'hanger', onTap: tryOn(p, 'Cute shoes! 👟'), art: () => shoeArt(p) })),
    wearable('sun', 880, 516, 'b-sun'),
    wearable('round', 1000, 512, 'b-round'),
    wearable('straw', 866, 474, 'b-straw'),
    wearable('cap', 1000, 474, 'b-cap'),
    { id: 'mirror', x: 1140, y: 170, w: 170, h: 300, drag: false,
      onTap: (it, api) => { api.sparkle(it.x + 85, it.y + 140, ['✨', '💫', '⭐']); api.bubble(it.x + 85, it.y - 10, 'Looking great! ✨'); api.avatar()?.anim.happy(); },
      art: () => svg(170, 300, `
        <rect ${O} x="6" y="6" width="158" height="288" rx="80" fill="#F5DE7A" style="stroke-width:3"/>
        <rect ${O} x="20" y="20" width="130" height="260" rx="66" fill="#D8ECFA"/>
        <path d="M50 70 L90 40 M44 110 L110 56" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>`) },
    { id: 'fitting', x: 1340, y: 150, w: 250, h: 600, drag: false, data: { open: false },
      onTap: (it, api) => {
        it.data.open = !it.data.open; api.setArt(it); api.sfx.click();
        if (it.data.open && !api.starFound('boutique-fitting')) api.addStar('boutique-fitting', it.x + 94, it.y + 330, { spawned: true });
      },
      art: (it) => svg(250, 600, `
        <rect ${O} x="10" y="30" width="230" height="560" fill="#F7F2FF"/>
        <rect x="24" y="40" width="200" height="540" fill="#E6DDFA"/>
        <circle ${O} cx="125" cy="140" r="16" fill="#C9A57C"/><path class="ln" stroke-width="3" d="M125 156 V190"/>
        <rect ${O} x="0" y="10" width="250" height="26" rx="10" fill="#C9A57C"/>${text(125, 30, 'FITTING ROOM', 17, '#fff')}
        ${it.data.open
          ? `<path ${O} d="M14 36 Q34 300 24 590 H54 Q64 300 44 36 Z" fill="#B79CF0"/><path ${O} d="M236 36 Q216 300 226 590 H196 Q186 300 206 36 Z" fill="#B79CF0"/>`
          : `<path ${O} d="M14 36 H236 V590 H14 Z" fill="#B79CF0"/><path class="ln" stroke-width="2.4" opacity=".4" d="M60 40 Q50 300 64 586 M110 40 Q120 300 106 586 M160 40 Q150 300 164 586 M206 40 Q214 300 204 586"/>`}`) },
    { id: 'shoebox', x: 70, y: 760, w: 150, h: 96, data: { open: false },
      onTap: (it, api) => {
        it.data.open = !it.data.open; api.setArt(it);
        if (it.data.open && !api.starFound('boutique-box')) api.addStar('boutique-box', it.x + 44, it.y - 76, { spawned: true });
      },
      art: (it) => svg(150, 96, `
        ${it.data.open ? `<path ${O} d="M6 40 L20 4 H150 L144 40 Z" fill="#E6DDFA"/><path ${O} d="M20 36 Q50 10 80 36" fill="#FBF7EF"/>` : ''}
        <rect ${O} x="6" y="36" width="138" height="56" rx="6" fill="#C9B8F2"/>
        ${it.data.open ? '' : `<rect ${O} x="0" y="26" width="150" height="20" rx="6" fill="#B79CF0"/>`}
        ${starPath(75, 66, 12, '#fff')}`) },
    { id: 'bplant', x: 1460, y: 700, w: 130, h: 200, art: () => plantArt('monstera') },
    { id: 'pouf', x: 280, y: 780, w: 160, h: 100, art: () => svg(160, 100, `
      <ellipse ${O} cx="80" cy="70" rx="74" ry="26" fill="#9EDDD4"/><rect x="6" y="34" width="148" height="36" fill="#9EDDD4"/>
      <path d="M6 34 V70 M154 34 V70" stroke="${INK}" stroke-width="2.6"/><ellipse ${O} cx="80" cy="34" rx="74" ry="24" fill="#B8E8E1"/><circle cx="80" cy="34" r="5" fill="${INK}" opacity=".4"/>`) },
  ],
};
