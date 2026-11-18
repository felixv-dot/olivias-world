// Snow Hill: sled down the slope, build a snowman, throw snowballs, shake snow off a pine, a bunny.
import { INK, O, svg, text, winterSky, pine, NPC_WINTER } from './common.js';
import { CLIMATES } from '../ui.js';

const bg = (w) => svg(1600, 900, `
  ${winterSky(w, 600, 'hill')}
  <path d="M-10 420 Q300 360 700 420 T1620 400 V910 H-10 Z" fill="#E9EFFA"/>
  ${pine(1080, 250, 0.55)}${pine(1200, 270, 0.45)}${pine(820, 300, 0.4)}
  <path d="M-10 280 Q200 250 380 300 Q700 400 980 560 Q1200 680 1620 700 V910 H-10 Z" fill="#F7FAFF" stroke="${INK}" stroke-width="3"/>
  <path d="M120 320 Q420 380 700 500 Q900 590 1180 700 M160 340 Q460 400 740 520 Q940 610 1220 720" stroke="#DCE6F5" stroke-width="8" fill="none"/>
  <g fill="#E3EBF8">${Array.from({ length: 30 }, (_, i) => `<ellipse cx="${(i * 173) % 1600}" cy="${560 + ((i * 89) % 320)}" rx="${18 + (i % 3) * 8}" ry="6"/>`).join('')}</g>
  ${pine(60, 150, 0.8)}${pine(260, 180, 0.6)}`);

const snowmanArt = (it) => {
  const s = it.data.stage;
  return svg(240, 320, `
    <ellipse cx="120" cy="306" rx="100" ry="14" fill="${INK}" opacity=".1"/>
    ${s === 0 ? `<path ${O} d="M40 306 Q120 230 200 306 Z" fill="#fff"/><path d="M80 290 Q120 270 160 290" stroke="#DCE6F5" stroke-width="6" fill="none"/>
      <rect ${O} x="40" y="180" width="160" height="40" rx="14" fill="#fff"/>${text(120, 207, 'Tap to build ⛄', 20, '#7A64B0')}` : ''}
    ${s >= 1 ? `<circle ${O} cx="120" cy="240" r="72" fill="#fff"/><path d="M76 220 Q90 200 112 196" stroke="#DCE6F5" stroke-width="8" fill="none"/>` : ''}
    ${s >= 2 ? `<circle ${O} cx="120" cy="134" r="52" fill="#fff"/><circle cx="120" cy="124" r="5" fill="${INK}"/><circle cx="120" cy="146" r="5" fill="${INK}"/>
      <path ${O} d="M72 134 L18 100 M168 134 L222 100 M30 108 L18 92 M210 108 L222 92" fill="none" style="stroke-width:5;stroke:#8B6450"/>` : ''}
    ${s >= 3 ? `<circle ${O} cx="120" cy="56" r="38" fill="#fff"/><circle cx="106" cy="48" r="5" fill="${INK}"/><circle cx="134" cy="48" r="5" fill="${INK}"/>
      <path ${O} d="M120 58 L156 66 L120 70 Z" fill="#F0A060" style="stroke-width:2"/><path class="ln" stroke-width="3" d="M104 74 Q120 84 136 74"/>` : ''}
    ${s >= 4 ? `<path ${O} d="M84 30 C80 -6 160 -6 156 30 Z" fill="#B79CF0"/><circle ${O} cx="120" cy="-4" r="12" fill="#FBF7EF"/>
      <path ${O} d="M78 92 Q120 112 162 92 L164 108 Q120 128 76 108 Z" fill="#3CC7B8"/><path ${O} d="M140 108 L150 160 L132 162 L128 112 Z" fill="#3CC7B8"/>` : ''}`);
};

const snowball = (api, x, y) => api.add({
  id: api.uid('snowball'), x, y, w: 56, h: 56, cls: 'food',
  onGive: (it, a, who) => { a.remove(it); a.sfx.boing(); a.sparkle(who.x + who.w / 2, who.y + 60, ['❄️', '💨', '❄️']); a.react(who, ['Splat! 😆', 'Hey! Snowball fight! ❄️', 'Brrr! 😂'][Math.floor(Math.random() * 3)], ['❄️', '✨']); },
  art: () => svg(56, 56, `<circle ${O} cx="28" cy="28" r="24" fill="#fff"/><path d="M14 22 Q20 12 30 10" stroke="#DCE6F5" stroke-width="5" fill="none"/>`),
}, { spawned: true });

export const HILL = {
  id: 'hill', title: 'Snow Hill 🛷', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, outdoor: true, avatar: [700, 380],
  frame: (w) => `linear-gradient(${w === 'snow' ? '#B0B8D0' : '#A6D4F4'} 40%, #F7FAFF 40%)`,
  bg,
  characters: [{ id: 'nora', look: NPC_WINTER.nora, x: 960, y: 520, s: 0.95, say: ["Let's build a snowman! ⛄", 'Throw a snowball at me! ❄️', 'The sled is super fast! 🛷'] }],
  init: (api) => { const s = api.get('snowman'); s.data.stage = api.state.snowman || 0; api.setArt(s); },
  items: [
    { id: 'sled', x: 220, y: 250, w: 200, h: 90,
      onTap: (it, api) => {
        if (it.el.classList.contains('sledding')) return;
        it.el.style.setProperty('--dx', (1180 - it.x) + 'px');
        it.el.style.setProperty('--dy', (650 - it.y) + 'px');
        it.el.classList.add('sledding'); api.sfx.pick(); api.bubble(it.x + 100, it.y - 10, 'Wheeeee! 🛷');
        api.later(() => it.el.classList.remove('sledding'), 2400);
      },
      art: () => svg(200, 90, `<g transform="rotate(16 100 45)">
        <rect ${O} x="20" y="16" width="150" height="34" rx="12" fill="#E58F6A"/><path d="M40 20 V46 M70 20 V46 M100 20 V46 M130 20 V46" stroke="#C96F4A" stroke-width="4"/>
        <path class="ln" stroke-width="6" d="M10 64 H170 Q196 64 194 40"/><path class="ln" stroke-width="5" d="M50 50 V64 M140 50 V64"/>
        <path class="ln" stroke-width="3" d="M24 30 Q0 20 6 6"/></g>`) },
    { id: 'snowman', x: 1150, y: 430, w: 240, h: 320, drag: false, data: { stage: 0 },
      onTap: (it, api) => {
        it.data.stage = (it.data.stage + 1) % 5; api.state.snowman = it.data.stage; api.save(); api.setArt(it);
        api.sparkle(it.x + 120, it.y + 160, ['❄️', '✨', '⛄']); api.sfx.pop();
        if (it.data.stage === 4) {
          api.bubble(it.x + 120, it.y - 40, 'A perfect snowman! ⛄');
          if (!api.starFound('hill-snowman')) api.addStar('hill-snowman', it.x + 220, it.y - 30, { spawned: true });
        } else if (it.data.stage === 0) api.bubble(it.x + 120, it.y + 200, 'Start again! Tap to roll snow.');
      },
      art: snowmanArt },
    { id: 'pile', x: 760, y: 760, w: 190, h: 100, drag: false,
      onTap: (it, api) => {
        if (api.count('snowball') >= 4) { api.bubble(it.x + 95, it.y - 10, 'Throw those first! ❄️'); return; }
        snowball(api, it.x + 200 + api.count('snowball') * 30, it.y + 20);
        api.bubble(it.x + 95, it.y - 10, 'Drag the snowball onto a friend!');
      },
      art: () => svg(190, 100, `<rect ${O} x="35" y="-34" width="120" height="34" rx="12" fill="#fff"/>${text(95, -10, 'Snowballs', 18, '#4F86C6')}<path ${O} d="M6 96 Q20 30 70 34 Q96 0 130 26 Q178 26 184 96 Z" fill="#fff"/>
        <circle ${O} cx="60" cy="74" r="18" fill="#fff"/><circle ${O} cx="96" cy="66" r="18" fill="#fff"/><circle ${O} cx="132" cy="76" r="18" fill="#fff"/>`) },
    { id: 'bigpine', x: 1360, y: 80, w: 220, h: 420, drag: false, data: { shook: false },
      onTap: (it, api) => {
        it.el.classList.remove('shake'); void it.el.offsetWidth; it.el.classList.add('shake');
        api.sparkle(it.x + 110, it.y + 200, ['❄️', '❄️', '✨']);
        if (!it.data.shook) { it.data.shook = true; if (!api.starFound('hill-tree')) { api.addStar('hill-tree', it.x + 30, it.y + 360, { spawned: true }); api.bubble(it.x + 110, it.y + 20, 'Something fell out! ✨'); } }
        else api.bubble(it.x + 110, it.y + 20, 'Poof! ❄️');
      },
      art: () => svg(220, 420, pine(110, 30, 2)) },
    { id: 'igloo', x: 40, y: 580, w: 300, h: 200, drag: false,
      onTap: (it, api) => { api.bubble(it.x + 150, it.y - 10, ['So cozy inside! ❄️', 'An igloo made of snow bricks!', 'Echo... echo... 🗣️'][Math.floor(Math.random() * 3)]); api.sparkle(it.x + 150, it.y + 100, ['❄️', '✨']); },
      art: () => svg(300, 200, `<path ${O} d="M20 190 Q20 30 150 30 Q280 30 280 190 Z" fill="#EEF4FF" style="stroke-width:3"/>
        <path d="M40 150 H260 M30 110 H270 M50 70 H250 M90 190 V150 M150 150 V110 M210 190 V150 M110 110 V70 M190 110 V70 M60 150 V110 M240 150 V110" stroke="#C9D6EC" stroke-width="3"/>
        <path ${O} d="M110 190 V150 Q110 120 150 120 Q190 120 190 150 V190 Z" fill="#3E4A6E"/>
        <path ${O} d="M100 190 V146 Q100 110 150 110 Q200 110 200 146 V190 H190 V150 Q190 120 150 120 Q110 120 110 150 V190 Z" fill="#fff"/>`) },
    { id: 'bunny', x: 520, y: 700, w: 100, h: 110, cls: 'squish',
      onTap: (it, api) => { it.el.classList.remove('hop'); void it.el.offsetWidth; it.el.classList.add('hop'); api.sfx.boing(); api.bubble(it.x + 50, it.y - 6, '*hop hop* 🐰'); },
      art: () => svg(100, 110, `
        <ellipse ${O} cx="36" cy="22" rx="10" ry="24" fill="#fff"/><ellipse ${O} cx="60" cy="20" rx="10" ry="24" fill="#fff"/>
        <ellipse cx="36" cy="22" rx="4" ry="14" fill="#F0B39A"/><ellipse cx="60" cy="20" rx="4" ry="14" fill="#F0B39A"/>
        <ellipse ${O} cx="56" cy="84" rx="36" ry="24" fill="#fff"/><circle ${O} cx="48" cy="58" r="22" fill="#fff"/>
        <circle cx="40" cy="54" r="3.5" fill="${INK}"/><circle cx="56" cy="54" r="3.5" fill="${INK}"/><path d="M46 62 L50 62 L48 65 Z" fill="#F08C7E"/>
        <circle ${O} cx="90" cy="82" r="10" fill="#fff"/>`) },
  ],
};
