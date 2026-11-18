// Beach: sand castle, ice cream cart, picnic, crab, sailboat, dolphins in the sea, sunglasses and a straw hat to wear.
import { INK, O, svg, text, sky, starPath, food, wearable, NPC } from './common.js';

const bg = (w) => {
  const sun = w.weather === 'sun';
  return svg(1600, 900, `
  ${sky(w, 560, 'beachSky')}
  <g class="drift" style="animation-duration:22s"><path class="ln" stroke-width="3" d="M300 200 q12 -10 24 0 q12 -10 24 0 M380 170 q9 -8 18 0 q9 -8 18 0"/></g>
  <rect y="380" width="1600" height="190" fill="${sun ? '#6FD0DE' : '#7E9EAE'}"/>
  <rect y="380" width="1600" height="24" fill="#fff" opacity=".25"/>
  <path d="M0 404 H1600" stroke="#5BBFCF" stroke-width="3" opacity=".6"/>
  <g class="sail"><g transform="translate(200 330)"><path ${O} d="M0 50 H110 L92 72 H18 Z" fill="#fff"/><path d="M55 48 V-30" stroke="${INK}" stroke-width="3"/><path ${O} d="M58 -28 L100 40 H58 Z" fill="#C9B8F2"/><path ${O} d="M52 -16 L16 40 H52 Z" fill="#9EDDD4"/></g></g>
  <g class="waves" stroke="#fff" stroke-width="6" fill="none" opacity=".75" stroke-linecap="round">
    <path d="M60 450 q40 -16 80 0 t80 0 M520 480 q40 -16 80 0 t80 0 M1020 440 q40 -16 80 0 t80 0 M1340 500 q40 -16 80 0 t80 0"/></g>
  <path ${O} d="M-10 560 Q200 520 420 548 T860 540 T1300 552 T1620 538 V910 H-10 Z" fill="${sun ? '#F7E3A9' : '#E3D3A8'}" style="stroke-width:4"/>
  <path d="M-10 574 Q200 536 420 562 T860 556 T1300 566 T1620 552" fill="none" stroke="#fff" stroke-width="10" opacity=".5"/>
  <g fill="#E8C98A">${Array.from({ length: 46 }, (_, i) => `<circle cx="${(i * 137) % 1600}" cy="${600 + ((i * 89) % 290)}" r="${3 + (i % 3)}"/>`).join('')}</g>
  <g transform="translate(20 330)"><path d="M70 330 Q86 180 60 40" stroke="#8B6450" stroke-width="22" fill="none" stroke-linecap="round"/>
    <path d="M60 44 Q10 10 -40 40 M60 44 Q120 0 170 30 M60 44 Q30 -30 -10 -40 M60 44 Q100 -34 140 -36 M60 44 Q60 -20 66 -50" stroke="#4E9B5A" stroke-width="24" fill="none" stroke-linecap="round"/>
    <circle ${O} cx="52" cy="58" r="12" fill="#8B6450"/><circle ${O} cx="72" cy="62" r="12" fill="#8B6450"/></g>
  <g transform="translate(1400 230)">
    <path ${O} d="M30 420 L60 140 M170 420 L140 140 M44 300 H156 M50 230 H150" fill="none" style="stroke-width:6;stroke:#C9A57C"/>
    <path ${O} d="M30 420 L60 140 M170 420 L140 140" fill="none" style="stroke-width:2"/>
    <rect ${O} x="40" y="100" width="120" height="56" rx="6" fill="#FBF7EF"/><path ${O} d="M30 100 L100 50 L170 100 Z" fill="#E58F6A"/>
    ${text(100, 140, 'LIFEGUARD', 18, '#E58F6A')}</g>`);
};

const shellArt = (it) => svg(64, 50, it.data.open
  ? `<path ${O} d="M4 30 Q32 -6 60 30 Z" fill="#F6C9B4"/><path ${O} d="M6 32 Q32 54 58 32 Z" fill="#F0B39A"/><circle ${O} cx="32" cy="30" r="8" fill="#fff"/>`
  : `<path ${O} d="M6 40 Q32 -8 58 40 Q32 50 6 40 Z" fill="${it.data.color}"/><path class="ln" stroke-width="2" opacity=".5" d="M32 8 V44 M18 16 L22 44 M46 16 L42 44"/>`);
const shell = (id, x, y, color, special) => ({
  id, x, y, w: 64, h: 50, data: { color, open: false, special },
  onTap: (it, api) => {
    if (it.data.special) {
      it.data.open = true; api.setArt(it);
      if (!api.starFound('beach-shell')) api.addStar('beach-shell', it.x, it.y - 80, { spawned: true });
      else api.bubble(it.x + 32, it.y - 10, 'A pearl! ✨');
    } else api.bubble(it.x + 32, it.y - 10, ['Shhh... the sea! 🌊', 'Just a shell 🐚', 'So pretty!'][Math.floor(Math.random() * 3)]);
  },
  art: shellArt,
});

const castleArt = (it) => {
  const s = it.data.stage, sand = '#EBCB86';
  return svg(210, 190, `
    ${s === 0 ? `<path ${O} d="M30 180 Q105 110 180 180 Z" fill="${sand}"/>` : `<rect ${O} x="30" y="120" width="150" height="60" rx="6" fill="${sand}"/>
      <path class="ln" stroke-width="2.4" d="M30 120 v-10 h20 v10 h20 v-10 h20 v10 h20 v-10 h20 v10 h20 v-10 h20 v10" /><rect ${O} x="92" y="146" width="26" height="34" rx="13" fill="#C9A57C"/>`}
    ${s >= 2 ? `<rect ${O} x="80" y="60" width="50" height="64" fill="${sand}"/><path class="ln" stroke-width="2.4" d="M80 60 v-10 h12 v10 h12 v-10 h12 v10 h14 v-10"/>` : ''}
    ${s >= 3 ? `<rect ${O} x="32" y="80" width="34" height="44" fill="${sand}"/><rect ${O} x="144" y="80" width="34" height="44" fill="${sand}"/>
      <path ${O} d="M105 50 V6" style="stroke-width:3"/><path ${O} d="M105 8 L136 18 L105 28 Z" fill="#B79CF0"/>` : ''}
    <ellipse cx="105" cy="182" rx="90" ry="8" fill="${INK}" opacity=".1"/>`);
};

const iceCream = (api, x, y) => api.add({
  id: api.uid('icecream'), x, y, w: 62, h: 116, cls: 'food',
  onGive: (it, a, who) => a.eat(it, who, 'Yum! So cold! 🍦', ['💙', '✨', '🍦']),
  art: () => svg(62, 116, `
    <path ${O} d="M12 50 L31 112 L50 50 Z" fill="#F0C27A"/><path class="ln" stroke-width="2" opacity=".5" d="M18 62 L40 90 M44 62 L24 90"/>
    <circle ${O} cx="31" cy="44" r="20" fill="#9EDDD4"/><circle ${O} cx="20" cy="30" r="16" fill="#C9B8F2"/><circle ${O} cx="42" cy="28" r="16" fill="#FBEFB4"/>
    <circle ${O} cx="31" cy="10" r="7" fill="#E58F6A"/>`),
}, { spawned: true });

const beachChair = (id, x, color) => ({ id, x, y: 724, w: 170, h: 170, art: () => svg(170, 170, `
  <path ${O} d="M30 160 L70 40 M140 160 L110 100" fill="none" style="stroke-width:6;stroke:#C9A57C"/>
  <path ${O} d="M40 160 L70 40 L104 46 L120 112 L150 112 L150 126 L60 126 Z" fill="${color}"/>
  <path d="M60 60 L92 64 M54 84 L100 90" stroke="#fff" stroke-width="8" opacity=".8"/>`) });

export const BEACH = {
  id: 'beach', posKey: 'beach-v2', title: 'Beach 🏖️', weather: true, outdoor: true, avatar: [640, 500],
  frame: 'linear-gradient(#A9DCFF 40%, #F7E3A9 40%)',
  bg,
  characters: [{ id: 'leo', look: NPC.leo, x: 410, y: 500, s: 0.9, say: ["I'm Leo! Let's build a castle! 🏰", 'The water is warm! 🌊', 'I want ice cream... 🍦'] }],
  init: (api) => { const c = api.get('castle'); c.data.stage = api.state.castle || 0; api.setArt(c); },
  items: [
    { id: 'sea', x: 140, y: 400, w: 1240, h: 140, drag: false, z: 2, cls: 'sea',
      onTap: (it, api, e) => {
        const x = 260 + Math.random() * 1000;
        api.effect(x, 420, 'dolphin', `<svg viewBox="0 0 140 90" width="140" height="90"><path class="o" d="M10 70 Q40 10 100 20 Q120 22 130 34 Q116 34 108 40 Q96 60 70 64 L60 80 L48 66 Q30 70 10 70 Z" fill="#8FC3F0"/><circle cx="104" cy="32" r="3.5" fill="#4A3B5C"/><path class="ln" stroke-width="2" d="M110 40 Q116 42 120 40"/></svg>`, 1300);
        api.later(() => api.sparkle(x + 70, 470, ['💧', '💦', '✨']), 900);
        api.sfx.boing();
      },
      art: () => '' },
    { id: 'towel', x: 840, y: 740, w: 320, h: 110, floor: true, art: () => svg(320, 110, `
      <rect ${O} x="6" y="10" width="308" height="92" rx="14" fill="#FBEFB4"/>
      <path d="M60 12 V100 M120 12 V100 M200 12 V100 M260 12 V100" stroke="#B79CF0" stroke-width="16"/>
      <rect ${O} x="6" y="10" width="308" height="92" rx="14" fill="none"/>`) },
    { id: 'umbrella', x: 880, y: 300, w: 260, h: 450, art: () => svg(260, 450, `
      <path d="M130 120 L124 440" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      <path ${O} d="M6 140 Q130 -20 254 140 Q222 124 192 140 Q160 122 130 140 Q100 122 68 140 Q38 124 6 140 Z" fill="#B79CF0" style="stroke-width:3"/>
      <path d="M130 22 Q100 70 92 134 Q110 126 130 140 Z M130 22 Q170 70 196 136 Q178 126 160 134 Z" fill="#fff" opacity=".9"/>
      <circle ${O} cx="130" cy="20" r="8" fill="#F5DE7A"/>`) },
    beachChair('chair1', 1200, '#9EDDD4'),
    { id: 'castle', x: 190, y: 640, w: 210, h: 190, data: { stage: 0 },
      onTap: (it, api) => {
        it.data.stage = (it.data.stage + 1) % 4; api.state.castle = it.data.stage; api.save(); api.setArt(it);
        api.sparkle(it.x + 105, it.y + 100, ['✨', '🏖️', '✨']);
        if (it.data.stage === 3) {
          api.bubble(it.x + 105, it.y - 20, 'A sand castle! 🏰');
          if (!api.starFound('beach-castle')) api.addStar('beach-castle', it.x + 74, it.y - 100, { spawned: true });
        }
      },
      art: castleArt },
    { id: 'bucket', x: 30, y: 760, w: 92, h: 96, art: () => svg(92, 96, `
      <path ${O} d="M20 30 Q46 -10 72 30" fill="none" style="stroke-width:3"/>
      <path ${O} d="M10 30 H82 L72 92 H20 Z" fill="#3CC7B8"/><rect ${O} x="6" y="24" width="80" height="14" rx="6" fill="#9EDDD4"/>
      ${starPath(46, 64, 12, '#fff')}`) },
    { id: 'ball', x: 560, y: 760, w: 100, h: 100,
      onTap: (it, api) => { it.el.classList.remove('bounce'); void it.el.offsetWidth; it.el.classList.add('bounce'); api.sfx.boing(); },
      art: () => svg(104, 104, `
        <circle ${O} cx="52" cy="52" r="48" fill="#fff" style="stroke-width:3"/>
        <path d="M52 4 Q20 30 22 92 L52 52 Z" fill="#F5DE7A"/><path d="M52 4 Q86 30 84 92 L52 52 Z" fill="#8FC3F0"/>
        <path d="M22 92 Q52 104 84 92 L52 52 Z" fill="#B79CF0"/><circle ${O} cx="52" cy="52" r="48" fill="none" style="stroke-width:3"/>
        <ellipse cx="36" cy="28" rx="10" ry="6" fill="#fff" opacity=".7"/>`) },
    { id: 'basket', x: 960, y: 690, w: 120, h: 96, drag: false, data: { n: 0 },
      onTap: (it, api) => {
        if (api.count('sandwich') + api.count('watermelon') + api.count('juice') >= 3) { api.bubble(it.x + 60, it.y - 10, 'Share the snacks first! 🧺'); return; }
        const kind = ['watermelon', 'sandwich', 'juice'][it.data.n++ % 3];
        food(api, kind, it.x - 80 - (it.data.n % 3) * 40, it.y + 40);
      },
      art: () => svg(120, 96, `
        <path ${O} d="M24 40 Q60 -10 96 40" fill="none" style="stroke-width:6;stroke:#C99772"/>
        <path ${O} d="M10 36 H110 L98 92 H22 Z" fill="#E0B07A"/>
        <path d="M14 52 H106 M18 70 H102" stroke="#C99772" stroke-width="4"/>
        <path ${O} d="M10 36 H110 V48 H10 Z" fill="#F08C7E"/><path d="M26 36 V48 M46 36 V48 M66 36 V48 M86 36 V48" stroke="#fff" stroke-width="5"/>`) },
    { id: 'crab', x: 760, y: 830, w: 96, h: 60, cls: 'crab',
      onTap: (it, api) => { api.bubble(it.x + 48, it.y - 6, 'Snip snap! 🦀'); it.el.classList.remove('boing'); void it.el.offsetWidth; it.el.classList.add('boing'); },
      art: () => svg(96, 60, `
        <path ${O} d="M14 26 Q2 14 10 4 Q16 14 22 16 M82 26 Q94 14 86 4 Q80 14 74 16" fill="#F08C7E" style="stroke-width:2.4"/>
        <path class="ln" stroke-width="3" d="M24 44 L10 54 M30 48 L20 58 M72 44 L86 54 M66 48 L76 58"/>
        <ellipse ${O} cx="48" cy="38" rx="30" ry="18" fill="#F08C7E"/>
        <circle ${O} cx="38" cy="18" r="6" fill="#fff" style="stroke-width:2"/><circle ${O} cx="58" cy="18" r="6" fill="#fff" style="stroke-width:2"/>
        <circle cx="38" cy="18" r="2.5" fill="${INK}"/><circle cx="58" cy="18" r="2.5" fill="${INK}"/><path class="ln" stroke-width="2" d="M42 42 Q48 46 54 42"/>`) },
    { id: 'surfboard', x: 1330, y: 470, w: 90, h: 320, art: () => svg(90, 320, `
      <path ${O} d="M45 6 Q86 80 80 200 Q76 300 45 314 Q14 300 10 200 Q4 80 45 6 Z" fill="#9EDDD4" style="stroke-width:3"/>
      <path d="M45 20 V300" stroke="#fff" stroke-width="10" opacity=".85"/><path d="M45 20 V300" stroke="#F5DE7A" stroke-width="4"/>`) },
    wearable('sun', 690, 836),
    wearable('straw', 990, 772),
    shell('shell1', 140, 818, '#F6C9B4'),
    shell('shell2', 470, 832, '#C9B8F2', true),
    shell('shell3', 1440, 826, '#FBEFB4'),
    { id: 'cart', x: 1120, y: 470, w: 250, h: 290, drag: false,
      onTap: (it, api) => {
        if (api.count('icecream') >= 2) { api.bubble(it.x + 125, it.y - 20, 'Give your ice cream to someone!'); return; }
        iceCream(api, it.x - 40 - api.count('icecream') * 60, it.y + 150);
        api.bubble(it.x + 125, it.y - 20, 'Here you go! 🍦');
      },
      art: () => svg(250, 290, `
        <path d="M125 20 V130" stroke="${INK}" stroke-width="6"/>
        <path ${O} d="M20 70 Q125 -24 230 70 Z" fill="#9EDDD4" style="stroke-width:3"/><path d="M125 6 L96 70 L154 70 Z" fill="#fff" opacity=".9"/>
        <rect ${O} x="30" y="130" width="190" height="110" rx="16" fill="#fff"/>
        <path d="M30 170 H220 M30 200 H220" stroke="#C9B8F2" stroke-width="12"/>
        <rect ${O} x="30" y="130" width="190" height="110" rx="16" fill="none"/>
        <rect ${O} x="50" y="96" width="150" height="40" rx="14" fill="#F5DE7A"/>${text(125, 124, 'ICE CREAM', 22)}
        <circle ${O} cx="70" cy="252" r="26" fill="#B79CF0"/><circle ${O} cx="180" cy="252" r="26" fill="#B79CF0"/>
        <circle cx="70" cy="252" r="8" fill="#fff"/><circle cx="180" cy="252" r="8" fill="#fff"/>`) },
  ],
};
