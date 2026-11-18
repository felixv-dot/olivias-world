// Winter Market: knitwear stall (try on puffer jackets, grab beanies/scarves/earmuffs),
// gingerbread stall (decorate your own cookie), cocoa + snow globe stall.
import { INK, O, svg, text, starPath, stringLights, winterSky, pine, wearable, food, NPC_WINTER } from './common.js';
import { CLIMATES } from '../ui.js';

const stall = (x, color, title) => `<g transform="translate(${x} 250)">
  <rect ${O} x="20" y="110" width="440" height="230" fill="#FBF7EF"/>
  <path ${O} d="M0 114 L30 30 H450 L480 114 Z" fill="${color}" style="stroke-width:3"/>
  ${[70, 140, 210, 280, 350, 420].map((sx) => `<path d="M${sx} 30 L${sx - 10 + (sx - 240) * 0.1} 114" stroke="#fff" stroke-width="18" opacity=".85"/>`).join('')}
  <path d="M0 114 Q40 136 80 114 Q120 136 160 114 Q200 136 240 114 Q280 136 320 114 Q360 136 400 114 Q440 136 480 114" fill="${color}" stroke="${INK}" stroke-width="3"/>
  <path d="M30 30 Q240 0 450 30" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/>
  <rect ${O} x="140" y="-22" width="200" height="48" rx="14" fill="#fff"/>${text(240, 10, title, 26, INK)}
  <rect ${O} x="10" y="300" width="460" height="40" rx="8" fill="#C9A57C"/>
  <path class="ln" stroke-width="2.4" opacity=".4" d="M10 320 H470"/></g>`;

const bg = (w) => svg(1600, 900, `
  ${winterSky(w, 700, 'mkt')}
  <g opacity=".85">${[60, 300, 1180, 1420].map((x, i) => `<g transform="translate(${x} 210)"><rect ${O} width="160" height="200" fill="${['#C9B8F2', '#9EDDD4', '#F5DE7A', '#AFD6F7'][i]}"/><path ${O} d="M-14 6 L80 -70 L174 6 Z" fill="#fff"/><rect ${O} x="30" y="60" width="40" height="50" fill="#FFE9A0"/><rect ${O} x="92" y="60" width="40" height="50" fill="#FFE9A0"/></g>`).join('')}</g>
  ${pine(560, 250, 0.6)}${pine(1040, 240, 0.55)}
  <rect y="590" width="1600" height="310" fill="#E3E8F4"/>
  <g fill="#D3DAEA">${Array.from({ length: 48 }, (_, i) => `<rect x="${(i % 12) * 140 + (Math.floor(i / 12) % 2) * 70}" y="${610 + Math.floor(i / 12) * 72}" width="120" height="56" rx="16"/>`).join('')}</g>
  <path d="M-10 600 Q400 584 800 600 T1620 596 V620 Q800 640 -10 620 Z" fill="#fff"/>
  ${stall(20, '#B79CF0', 'Knitwear')}${stall(560, '#E58F6A', 'Gingerbread')}${stall(1100, '#3CC7B8', 'Cocoa & Gifts')}
  ${stringLights(0, 800, 40, 40)}${stringLights(800, 1600, 40, 40)}`);

// ---------- puffer jackets you can try on ----------
const JACKETS = [
  { top: 'puffer', topColor: '#C9B8F2', neck: 'scarf', neckColor: '#F5DE7A' },
  { top: 'puffer', topColor: '#9EDDD4', neck: 'none' },
  { top: 'puffer', topColor: '#F5DE7A', neck: 'scarf', neckColor: '#4D5C9A' },
];
const jacketArt = (p) => svg(110, 170, `<path class="ln" stroke-width="3" d="M55 4 Q55 -6 63 -6 Q71 -6 69 4 L55 14 M12 32 L55 14 L98 32"/>
  <path ${O} d="M20 34 L55 26 L90 34 L108 120 L90 124 L84 92 L84 164 H26 L26 92 L20 124 L2 120 Z" fill="${p.topColor}"/>
  <path d="M26 70 Q55 78 84 70 M26 110 Q55 118 84 110 M55 34 V164" stroke="${INK}" stroke-width="2" opacity=".35" fill="none"/>
  <path ${O} d="M38 30 Q55 20 72 30 L74 44 Q55 52 36 44 Z" fill="${p.topColor}"/>`);

// ---------- gingerbread decorating ----------
const SHAPES = {
  person: 'M70 54 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0 Z M64 86 H136 L176 116 L160 136 L136 120 V160 L162 200 L140 214 L100 172 L60 214 L38 200 L64 160 V120 L40 136 L24 116 Z',
  star: 'M100 14 L126 78 L194 82 L142 126 L160 192 L100 156 L40 192 L58 126 L6 82 L74 78 Z',
  heart: 'M100 190 C40 150 10 110 20 70 C30 30 80 26 100 64 C120 26 170 30 180 70 C190 110 160 150 100 190 Z',
  tree: 'M100 10 L160 90 H128 L180 160 H112 V200 H88 V160 H20 L72 90 H40 Z',
};
function cookieSvg(c, size = 200) {
  const sprinkles = c.sprinkles ? ['#E58F6A', '#9EDDD4', '#F5DE7A', '#B79CF0', '#fff'].map((col, i) => Array.from({ length: 4 }, (_, k) => {
    const x = 50 + ((i * 37 + k * 53) % 100), y = 60 + ((i * 29 + k * 41) % 110);
    return `<rect x="${x}" y="${y}" width="10" height="4" rx="2" fill="${col}" transform="rotate(${(i * 40 + k * 25) % 180} ${x + 5} ${y + 2})"/>`;
  }).join('')).join('') : '';
  const clip = 'ck' + Math.random().toString(36).slice(2, 7);
  return `<svg viewBox="0 0 200 220" width="${size}" height="${size * 1.1}" overflow="visible">
    <defs><clipPath id="${clip}"><path d="${SHAPES[c.shape]}"/></clipPath></defs>
    <path d="${SHAPES[c.shape]}" fill="#C98A52" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <g clip-path="url(#${clip})">${sprinkles}</g>
    <path d="${SHAPES[c.shape]}" fill="none" stroke="${c.icing}" stroke-width="6" stroke-dasharray="10 8" stroke-linejoin="round" transform="translate(100 112) scale(.84) translate(-100 -112)"/>
    ${c.shape === 'person' ? `<circle cx="90" cy="48" r="5" fill="${INK}"/><circle cx="110" cy="48" r="5" fill="${INK}"/><path d="M88 62 Q100 72 112 62" stroke="${c.icing}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="100" cy="104" r="7" fill="${c.icing}"/><circle cx="100" cy="132" r="7" fill="${c.icing}"/>` : ''}
    ${c.shape === 'heart' || c.shape === 'star' ? `<circle cx="100" cy="104" r="12" fill="${c.icing}"/>` : ''}
  </svg>`;
}

function decorate(api, tray) {
  const c = { shape: 'person', icing: '#FFFFFF', sprinkles: true };
  api.modal((card, close) => {
    card.innerHTML += `<h2>Decorate a cookie</h2><div class="cookie-holder"></div>
      <div class="opt-row shapes"></div><div class="opt-row icings"></div><div class="opt-row extra"></div>
      <button class="btn bake">Bake it! 🍪</button>`;
    const holder = card.querySelector('.cookie-holder');
    const draw = () => { holder.innerHTML = cookieSvg(c, 180).replace('<svg', '<svg class="cookie-preview"'); };
    const row = (sel, opts, key, isColor) => {
      const r = card.querySelector(sel); r.innerHTML = '';
      opts.forEach(([val, label]) => {
        const b = document.createElement('button');
        b.className = (isColor ? 'dot' : 'chip') + (c[key] === val ? ' on' : '');
        if (isColor) { b.style.background = val; b.setAttribute('aria-label', 'Icing ' + label); } else b.textContent = label;
        b.onclick = () => { c[key] = val; api.sfx.click(); refresh(); };
        r.append(b);
      });
    };
    const refresh = () => {
      row('.shapes', [['person', '🧑 Person'], ['star', '⭐ Star'], ['heart', '💜 Heart'], ['tree', '🌲 Tree']], 'shape');
      row('.icings', [['#FFFFFF', 'white'], ['#C9B8F2', 'lilac'], ['#9EDDD4', 'mint'], ['#F5DE7A', 'yellow'], ['#8FC3F0', 'blue']], 'icing', true);
      row('.extra', [[true, '✨ Sprinkles'], [false, 'No sprinkles']], 'sprinkles');
      draw();
    };
    card.querySelector('.bake').onclick = () => {
      const design = { ...c };
      close();
      api.sfx.yum();
      const it = api.add({
        id: api.uid('cookie'), x: tray.x + 60 + api.count('cookie') * 40, y: tray.y - 90, w: 90, h: 99, cls: 'food',
        art: () => cookieSvg(design, 90).replace(/width="90" height="[\d.]+"/, 'width="100%" height="100%"'),
        onGive: (i, a, who) => a.eat(i, who, 'Best cookie ever! 🍪', ['🍪', '✨', '💜']),
      }, { spawned: true });
      api.sparkle(it.x + 45, it.y + 40, ['✨', '🍪', '⭐']);
      api.bubble(it.x + 45, it.y - 10, 'Fresh from the oven! Give it to a friend.');
      if (!api.starFound('market-cookie')) api.addStar('market-cookie', tray.x + 260, tray.y - 120, { spawned: true });
    };
    refresh();
  });
}

export const MARKET = {
  id: 'market', title: 'Winter Market 🎄', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, outdoor: true, avatar: [440, 500],
  frame: (w) => `linear-gradient(${w === 'snow' ? '#B0B8D0' : '#A6D4F4'} 64%, #E3E8F4 64%)`,
  bg,
  stars: [{ id: 'market-crate', x: 1430, y: 760 }],
  characters: [{ id: 'juno', look: NPC_WINTER.juno, x: 1000, y: 490, s: 0.95, say: ['Try on a puffer jacket! 🧥', 'Decorate a gingerbread cookie! 🍪', 'Shake the snow globe ❄️'] }],
  items: [
    ...JACKETS.map((p, i) => ({
      id: 'jacket' + i, x: 70 + i * 130, y: 380, w: 110, h: 170, drag: false, cls: 'hanger',
      onTap: (it, api) => { const me = api.avatar(); api.setLook(me, p); api.sfx.wear(); api.react(me, 'So warm! 🧥', ['❄️', '✨', '💜']); },
      art: () => jacketArt(p),
    })),
    wearable('beanie', 80, 456, 'm-beanie'),
    wearable('earmuffs', 220, 470, 'm-earmuffs'),
    wearable('scarf', 360, 446, 'm-scarf'),
    { id: 'tray', x: 640, y: 450, w: 320, h: 110, drag: false,
      onTap: (it, api) => decorate(api, it),
      art: () => svg(320, 110, `<rect ${O} x="4" y="40" width="312" height="66" rx="12" fill="#E8EEF7"/>
        <g transform="translate(20 6) scale(.42)">${cookieSvg({ shape: 'person', icing: '#FFFFFF', sprinkles: false }, 200).replace(/<\/?svg[^>]*>/g, '')}</g>
        <g transform="translate(120 14) scale(.38)">${cookieSvg({ shape: 'star', icing: '#9EDDD4', sprinkles: true }, 200).replace(/<\/?svg[^>]*>/g, '')}</g>
        <g transform="translate(212 12) scale(.38)">${cookieSvg({ shape: 'heart', icing: '#C9B8F2', sprinkles: false }, 200).replace(/<\/?svg[^>]*>/g, '')}</g>
        <rect ${O} x="80" y="-30" width="160" height="32" rx="12" fill="#fff"/>${text(160, -7, 'Tap to decorate!', 18, '#E58F6A')}`) },
    { id: 'cocoapot', x: 1150, y: 400, w: 150, h: 160, drag: false,
      onTap: (it, api) => {
        if (api.count('cocoa') >= 3) { api.bubble(it.x + 75, it.y - 10, 'Drink up first! ☕'); return; }
        api.sfx.pour(); food(api, 'cocoa', it.x + 160 + api.count('cocoa') * 70, it.y + 80);
      },
      art: () => svg(150, 160, `<g class="steam"><path class="ln" stroke-width="4" opacity=".5" d="M60 26 Q52 14 60 2 M86 26 Q78 14 86 2"/></g>
        <path ${O} d="M24 40 H126 V130 Q126 152 104 152 H46 Q24 152 24 130 Z" fill="#8FA4D8"/>
        <rect ${O} x="16" y="32" width="118" height="16" rx="6" fill="#AFC0E8"/><path ${O} d="M126 70 Q150 70 148 100 Q146 120 126 118" fill="none" style="stroke-width:6"/>
        ${text(75, 104, 'COCOA', 20, '#fff')}`) },
    { id: 'globe', x: 1420, y: 440, w: 110, h: 120,
      onTap: (it, api) => { it.el.classList.remove('shaking'); void it.el.offsetWidth; it.el.classList.add('shaking'); api.bubble(it.x + 55, it.y - 6, 'Shake shake! ❄️'); api.later(() => it.el.classList.remove('shaking'), 2200); },
      art: () => svg(110, 120, `<circle ${O} cx="55" cy="54" r="48" fill="#DDF1FA" fill-opacity=".9"/>
        ${pine(55, 30, 0.28)}<path d="M14 72 Q55 60 96 72 Q90 96 55 100 Q20 96 14 72 Z" fill="#fff"/>
        <g class="globe-snow" fill="#fff">${Array.from({ length: 14 }, (_, i) => `<circle cx="${20 + ((i * 23) % 70)}" cy="${18 + ((i * 17) % 50)}" r="2.6"/>`).join('')}</g>
        <path d="M30 26 Q40 14 56 12" stroke="#fff" stroke-width="5" fill="none" opacity=".8"/>
        <path ${O} d="M14 96 H96 L104 118 H6 Z" fill="#7A64B0"/>`) },
    { id: 'crate', x: 1390, y: 700, w: 180, h: 150, art: () => svg(180, 150, `
      <rect ${O} x="6" y="20" width="168" height="124" rx="6" fill="#C9A57C"/>
      <path d="M6 62 H174 M6 102 H174" stroke="#A87A5A" stroke-width="4"/><path ${O} d="M10 24 L170 140 M170 24 L10 140" style="stroke-width:3;stroke:#A87A5A"/>
      <path d="M6 20 Q90 0 174 20" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round"/>
      ${text(90, 92, 'GIFTS', 22, '#fff')}`) },
    { id: 'reindeer', x: 120, y: 690, w: 190, h: 190, cls: 'squish',
      onTap: (it, api) => { it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); api.sfx.boing(); api.bubble(it.x + 95, it.y - 6, ['*jingle jingle* 🔔', 'Hello there! 🦌', '*happy snort*'][Math.floor(Math.random() * 3)]); },
      art: () => svg(190, 190, `
        <path ${O} d="M50 20 L44 0 M50 20 L30 8 M50 20 L58 2 M110 20 L116 0 M110 20 L130 8 M110 20 L102 2" fill="none" style="stroke-width:5;stroke:#8B6450"/>
        <ellipse ${O} cx="110" cy="130" rx="64" ry="38" fill="#C99772"/>
        <rect ${O} x="70" y="150" width="16" height="38" rx="6" fill="#C99772"/><rect ${O} x="140" y="150" width="16" height="38" rx="6" fill="#C99772"/>
        <path ${O} d="M80 70 Q80 110 100 120 L120 110 Q110 80 104 64 Z" fill="#C99772"/>
        <circle ${O} cx="80" cy="56" r="34" fill="#D9AC86"/><ellipse ${O} cx="60" cy="70" rx="18" ry="14" fill="#F3D2B8"/><circle ${O} cx="46" cy="70" r="9" fill="#E58F6A"/>
        <circle cx="80" cy="48" r="4.5" fill="${INK}"/><circle cx="100" cy="48" r="4.5" fill="${INK}"/>
        <rect ${O} x="86" y="98" width="40" height="10" rx="5" fill="#3CC7B8"/><circle ${O} cx="106" cy="114" r="8" fill="#F5DE7A"/>`) },
  ],
};
