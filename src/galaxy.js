// Galaxy: every world is a planet. Sunny Planet is open, the others are coming soon.
import { render, animate } from './avatar.js';
import { getLook, activeChar } from './state.js';
import { el, starBadge, rotateHint } from './ui.js';
import { installTip } from './mobile.js';
import { openSettings } from './settings.js';

const INK = '#4A3B5C';

function planetSvg(id, base, light, dark, extra, ring) {
  return `<svg viewBox="0 0 200 200" aria-hidden="true">
    <defs>
      <radialGradient id="pg-${id}" cx="35%" cy="30%" r="75%">
        <stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${base}"/><stop offset="1" stop-color="${dark}"/>
      </radialGradient>
      <clipPath id="pc-${id}"><circle cx="100" cy="100" r="78"/></clipPath>
    </defs>
    <circle cx="100" cy="100" r="92" fill="${light}" opacity=".18"/>
    ${ring ? `<ellipse cx="100" cy="104" rx="98" ry="22" fill="none" stroke="${ring}" stroke-width="8" opacity=".9" transform="rotate(-14 100 100)"/>` : ''}
    <circle cx="100" cy="100" r="78" fill="url(#pg-${id})" stroke="${INK}" stroke-width="3"/>
    <g clip-path="url(#pc-${id})">${extra}</g>
    <ellipse cx="72" cy="62" rx="20" ry="12" fill="#fff" opacity=".35" transform="rotate(-30 72 62)"/>
    ${ring ? `<path d="M6 118 Q100 150 194 92" fill="none" stroke="${ring}" stroke-width="8" opacity=".9" transform="rotate(-14 100 100)" stroke-linecap="round"/>` : ''}
  </svg>`;
}

const PLANETS = [
  {
    id: 'sunny', name: 'Sunny Planet', open: true, x: 36, y: 54, size: 36,
    svg: planetSvg('sunny', '#7FD8D2', '#FFF6C2', '#3CA8A6', `
      <path d="M30 120 C50 96 90 100 108 116 C126 132 160 126 180 140 L180 200 L20 200 Z" fill="#F7E3A1" stroke="${INK}" stroke-width="2.5"/>
      <path d="M44 128 C62 112 86 114 100 124 C84 136 60 138 44 128 Z" fill="#8FD88A"/>
      <path d="M60 70 C76 58 104 60 116 74 C100 84 74 84 60 70 Z" fill="#F7E3A1" stroke="${INK}" stroke-width="2.5"/>
      <path d="M128 120 L128 100" stroke="#8B6450" stroke-width="4" stroke-linecap="round"/>
      <path d="M128 100 Q116 92 108 98 M128 100 Q140 90 150 96 M128 100 Q122 86 112 84 M128 100 Q136 86 146 84" stroke="#4E9B5A" stroke-width="5" fill="none" stroke-linecap="round"/>
      <rect x="150" y="128" width="16" height="12" fill="#C9B8F2" stroke="${INK}" stroke-width="2"/><path d="M147 129 L158 120 L169 129 Z" fill="#3CC7B8" stroke="${INK}" stroke-width="2"/>`, '#F5DE7A'),
  },
  {
    id: 'winter', name: 'Winter Planet', open: true, x: 72, y: 32, size: 24,
    svg: planetSvg('winter', '#BFE3F7', '#FFFFFF', '#7FB2D9', `
      <path d="M20 80 Q100 60 180 82 L180 96 Q100 76 20 96 Z" fill="#fff" opacity=".8"/>
      <path d="M100 110 v40 M82 120 l36 20 M118 120 l-36 20" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`),
  },
  {
    id: 'magic', name: 'Magic Academy', x: 80, y: 74, size: 18,
    svg: planetSvg('magic', '#9B7FD4', '#E0D2FF', '#5A4596', `
      <path d="M70 150 V110 L80 96 L90 110 V150 Z M110 150 V100 L122 82 L134 100 V150 Z" fill="#4B3A7A" stroke="${INK}" stroke-width="2"/>
      <circle cx="60" cy="70" r="3" fill="#FFF3B0"/><circle cx="140" cy="60" r="4" fill="#FFF3B0"/><circle cx="100" cy="50" r="2.5" fill="#FFF3B0"/>`, '#C9B8F2'),
  },
  {
    id: 'frost', name: 'Grandfather Frost', x: 13, y: 24, size: 15,
    svg: planetSvg('frost', '#F1F4FF', '#FFFFFF', '#AFC4EC', `
      <path d="M60 150 L100 90 L140 150 Z" fill="#4E9B5A" stroke="${INK}" stroke-width="2"/>
      <circle cx="100" cy="88" r="6" fill="#F5DE7A"/><circle cx="88" cy="128" r="4" fill="#E58F6A"/><circle cx="112" cy="118" r="4" fill="#3CC7B8"/>`),
  },
  {
    id: 'carpets', name: 'Flying Carpets', x: 58, y: 84, size: 14,
    svg: planetSvg('carpets', '#F5C96A', '#FFF0C4', '#C9913A', `
      <path d="M50 110 Q100 92 150 110 L140 128 Q100 112 60 128 Z" fill="#B79CF0" stroke="${INK}" stroke-width="2.5"/>
      <path d="M70 70 Q80 50 90 70 Z M120 76 Q132 52 144 76 Z" fill="#fff" opacity=".7"/>`),
  },
  {
    id: 'heroes', name: 'Hero City', x: 91, y: 46, size: 13,
    svg: planetSvg('heroes', '#8FC3F0', '#E2F1FF', '#4F7FC0', `
      <path d="M40 160 V120 H60 V100 H80 V130 H100 V90 H122 V124 H140 V110 H160 V160 Z" fill="#4D5C9A" stroke="${INK}" stroke-width="2"/>
      <path d="M100 52 l6 12 13 2 -10 9 3 13 -12 -7 -12 7 3 -13 -10 -9 13 -2z" fill="#F5DE7A" stroke="${INK}" stroke-width="2"/>`),
  },
  {
    id: 'stage', name: 'Star Stage', x: 52, y: 15, size: 12,
    svg: planetSvg('stage', '#C9B8F2', '#F6F0FF', '#8D71CF', `
      <path d="M80 80 V130 M80 80 L120 70 V120" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="72" cy="132" r="10" fill="${INK}"/><circle cx="112" cy="122" r="10" fill="${INK}"/>`, '#3CC7B8'),
  },
];

export function galaxyScreen(app, ctx) {
  const root = el('div', 'screen galaxy');
  const sky = el('div', 'space');
  for (let i = 0; i < 70; i++) {
    const s = el('i', 'twinkle');
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    const size = 1 + Math.random() * 3;
    s.style.width = s.style.height = size + 'px';
    s.style.animationDelay = (-Math.random() * 3).toFixed(2) + 's';
    s.style.animationDuration = (1.8 + Math.random() * 2.5).toFixed(2) + 's';
    sky.append(s);
  }
  root.append(sky);

  const head = el('div', 'galaxy-head');
  const charsBtn = el('button', 'btn chars-btn', '👥 My characters');
  charsBtn.onclick = () => ctx.go('roster');
  const headRight = el('div', 'galaxy-head-right');
  const gear = el('button', 'btn alt gear-btn', '⚙️');
  gear.setAttribute('aria-label', 'Account and settings');
  gear.onclick = () => openSettings(root, ctx);
  headRight.append(charsBtn, starBadge(), gear);
  head.append(el('div', 'logo', "Olivia's World"), headRight);
  root.append(head, el('div', 'galaxy-title', 'Choose a planet'));

  for (const p of PLANETS) {
    const b = el('button', 'planet' + (p.open ? ' open' : ' locked'));
    b.style.left = p.x + '%';
    b.style.top = p.y + '%';
    b.style.setProperty('--size', p.size + 'vmin');
    b.style.animationDelay = (-p.x / 10).toFixed(2) + 's';
    b.innerHTML = `<div class="planet-art">${p.svg}</div>${p.open ? '' : '<div class="lock">🔒</div>'}<div class="planet-name">${p.name}</div>`;
    b.setAttribute('aria-label', p.name + (p.open ? '' : ' (coming soon)'));
    b.onclick = () => {
      if (!p.open) {
        b.classList.remove('nope');
        void b.offsetWidth;
        b.classList.add('nope');
        const tip = el('div', 'soon', 'Coming soon! ✨');
        b.append(tip);
        setTimeout(() => tip.remove(), 1400);
        return;
      }
      root.classList.add('leaving');
      b.classList.add('zoom');
      setTimeout(() => ctx.go('scene', { id: p.id }), 650);
    };
    root.append(b);
  }

  const me = el('div', 'me');
  const meAvatar = el('div', 'me-avatar', render(getLook()));
  const side = el('div', 'me-side');
  side.append(el('div', 'me-name', activeChar()?.name || ''));
  const edit = el('button', 'btn small', '👥 My characters');
  edit.onclick = () => ctx.go('roster');
  side.append(edit);
  me.append(meAvatar, side);
  root.append(me);
  const anim = animate(() => meAvatar.firstElementChild);
  meAvatar.onclick = () => anim.happy();

  root.append(el('div', 'version', 'v1.6'));
  root.append(rotateHint());
  const tip = installTip();
  if (tip) root.append(tip);
  app.append(root);
  return { destroy: () => anim.stop() };
}
