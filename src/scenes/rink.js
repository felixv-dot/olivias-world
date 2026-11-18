// Ice Rink: drop a character on the ice to skate, tap them to spin; shoot the puck into the goal; a penguin.
import { INK, O, svg, text, winterSky, pine, stringLights, food, NPC_WINTER } from './common.js';
import { CLIMATES } from '../ui.js';

const ICE = { cx: 800, cy: 690, rx: 700, ry: 190 };
const onIce = (it) => {
  const x = it.x + it.w / 2, y = it.y + it.h * 0.92;
  return ((x - ICE.cx) / ICE.rx) ** 2 + ((y - ICE.cy) / ICE.ry) ** 2 < 1;
};

const bg = (w) => svg(1600, 900, `
  ${winterSky(w, 520, 'rink')}
  ${pine(80, 260, 0.9)}${pine(260, 300, 0.7)}${pine(1340, 280, 0.8)}${pine(1520, 250, 0.9)}${pine(700, 330, 0.5)}
  <rect y="460" width="1600" height="440" fill="#F4F8FF"/>
  <ellipse cx="${ICE.cx}" cy="${ICE.cy}" rx="${ICE.rx + 20}" ry="${ICE.ry + 20}" fill="#FBF7EF" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="${ICE.cx}" cy="${ICE.cy}" rx="${ICE.rx}" ry="${ICE.ry}" fill="#D6EEF9" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="${ICE.cx}" cy="${ICE.cy}" rx="160" ry="50" fill="none" stroke="#B79CF0" stroke-width="5" opacity=".6"/>
  <path d="M800 500 V880" stroke="#B79CF0" stroke-width="5" opacity=".5"/>
  <path d="M260 640 Q400 600 540 650 M960 720 Q1100 680 1260 730 M520 780 Q640 760 760 800" stroke="#fff" stroke-width="6" fill="none" opacity=".9" stroke-linecap="round"/>
  <g stroke="#fff" stroke-width="3" opacity=".7" fill="none"><path d="M320 700 q60 -30 120 0 t120 0"/><path d="M1000 620 q50 -24 100 0"/></g>
  ${[200, 520, 1080, 1400].map((x) => `<path d="M${x} 520 V330" stroke="${INK}" stroke-width="6"/><circle ${O} cx="${x}" cy="326" r="10" fill="#F5DE7A"/>`).join('')}
  ${stringLights(200, 520, 340, 30)}${stringLights(520, 1080, 340, 36)}${stringLights(1080, 1400, 340, 30)}
  <path d="M-10 470 Q800 440 1610 470" fill="none" stroke="#DDE6F5" stroke-width="20"/>`);

export const RINK = {
  id: 'rink', title: 'Ice Rink ⛸️', back: ['scene', { id: 'winter' }], weather: CLIMATES.winter, outdoor: true, avatar: [480, 460],
  frame: (w) => `linear-gradient(${w === 'snow' ? '#B0B8D0' : '#A6D4F4'} 52%, #F4F8FF 52%)`,
  bg,
  stars: [{ id: 'rink-bench', x: 1440, y: 402 }],
  characters: [{ id: 'leo', look: NPC_WINTER.leo, x: 900, y: 470, s: 0.95, say: ['Drag me onto the ice! ⛸️', 'Can you score 3 goals? 🏒', 'Brrr... I need cocoa!'] }],
  onCharacterDrop: (api, who) => {
    if (!onIce(who)) return;
    who.el.classList.remove('glide'); void who.el.offsetWidth; who.el.classList.add('glide');
    api.sfx.pick(); api.bubble(who.x + who.w / 2, who.y - 6, 'Wheee! ⛸️');
  },
  onCharacterTap: (api, who) => {
    if (!onIce(who)) return false;
    const s = who.el.firstElementChild;
    who.el.classList.remove('spin'); void who.el.offsetWidth; who.el.classList.add('spin');
    who.anim.happy(); api.sfx.wear(); api.bubble(who.x + who.w / 2, who.y - 6, 'Twirl! 💫');
    return true;
  },
  items: [
    { id: 'goal', x: 1300, y: 560, w: 200, h: 150, drag: false, data: { goals: 0 },
      art: (it) => svg(200, 150, `
        <path ${O} d="M20 140 V30 H180 V140" fill="none" style="stroke-width:8;stroke:#E58F6A"/>
        <path d="M30 40 L170 140 M60 40 L170 110 M100 40 L170 80 M30 70 L120 140 M30 100 L80 140 M30 40 H170 M30 70 H170 M30 100 H170 M60 30 V140 M100 30 V140 M140 30 V140" stroke="${INK}" stroke-width="1.5" opacity=".3"/>
        <rect ${O} x="40" y="-20" width="120" height="36" rx="10" fill="#fff"/>${text(100, 6, 'GOALS ' + it.data.goals, 18, '#E58F6A')}`) },
    { id: 'puck', x: 1050, y: 720, w: 70, h: 40, data: { busy: false },
      onTap: (it, api) => {
        if (it.data.busy) return;
        it.data.busy = true;
        const g = api.get('goal');
        it.el.style.setProperty('--dx', (g.x + 70 - it.x) + 'px');
        it.el.style.setProperty('--dy', (g.y + 90 - it.y) + 'px');
        it.el.classList.add('puck-shot'); api.sfx.click();
        const scored = Math.random() < 0.75;
        api.later(() => {
          if (scored) {
            g.data.goals++; api.setArt(g); api.sfx.win();
            api.sparkle(g.x + 100, g.y + 80, ['🏒', '✨', '⭐']);
            api.bubble(g.x + 100, g.y - 30, g.data.goals === 3 ? 'Hat trick! 🎉' : 'GOAL! 🏒');
            if (g.data.goals === 3 && !api.starFound('rink-goals')) api.addStar('rink-goals', g.x + 66, g.y - 110, { spawned: true });
          } else api.bubble(g.x + 100, g.y - 30, 'Missed! Try again!');
        }, 450);
        api.later(() => { it.el.classList.remove('puck-shot'); it.data.busy = false; }, 900);
      },
      art: () => svg(70, 40, `<ellipse ${O} cx="35" cy="24" rx="32" ry="12" fill="#2E2A3A"/><ellipse ${O} cx="35" cy="18" rx="32" ry="12" fill="#3E3A4A"/>`) },
    { id: 'stick', x: 1110, y: 640, w: 60, h: 160, art: () => svg(60, 160, `
      <path ${O} d="M40 4 L22 130 Q20 150 4 152 L4 140 Q12 136 14 126 L30 4 Z" fill="#C99772"/><path d="M8 138 L22 140" stroke="#fff" stroke-width="5"/>`) },
    { id: 'penguin', x: 640, y: 690, w: 110, h: 140, cls: 'squish',
      onTap: (it, api) => { it.el.classList.remove('waddle'); void it.el.offsetWidth; it.el.classList.add('waddle'); api.sfx.boing(); api.bubble(it.x + 55, it.y - 6, ['Honk honk! 🐧', '*slides on tummy*', 'Wanna race?'][Math.floor(Math.random() * 3)]); },
      art: () => svg(110, 140, `
        <ellipse ${O} cx="55" cy="84" rx="44" ry="52" fill="#3E3F5E"/><ellipse cx="55" cy="92" rx="30" ry="40" fill="#fff"/>
        <circle ${O} cx="55" cy="36" r="30" fill="#3E3F5E"/><ellipse cx="55" cy="42" rx="20" ry="16" fill="#fff"/>
        <circle cx="46" cy="36" r="4" fill="${INK}"/><circle cx="64" cy="36" r="4" fill="${INK}"/><path ${O} d="M48 46 L62 46 L55 56 Z" fill="#F0A060" style="stroke-width:2"/>
        <path ${O} d="M12 76 Q0 100 14 116 Q20 96 22 82 Z M98 76 Q110 100 96 116 Q90 96 88 82 Z" fill="#3E3F5E"/>
        <path ${O} d="M30 132 h20 l-4 6 h-14 z M60 132 h20 l-4 6 h-14 z" fill="#F0A060" style="stroke-width:2"/>
        <rect ${O} x="28" y="58" width="54" height="12" rx="6" fill="#E58F6A"/>`) },
    { id: 'bench', x: 1360, y: 400, w: 220, h: 120, art: () => svg(220, 120, `
      <rect ${O} x="6" y="8" width="208" height="20" rx="6" fill="#C99772"/><rect ${O} x="6" y="34" width="208" height="20" rx="6" fill="#C99772"/>
      <rect ${O} x="0" y="60" width="220" height="22" rx="6" fill="#D9AC86"/><path d="M4 60 Q110 50 216 60" stroke="#fff" stroke-width="10" stroke-linecap="round"/>
      <path ${O} d="M24 82 V118 M196 82 V118 M24 26 V60 M196 26 V60" fill="none" style="stroke-width:7;stroke:#4D5C9A"/>`) },
    { id: 'cocoacart', x: 30, y: 400, w: 220, h: 260, drag: false,
      onTap: (it, api) => {
        if (api.count('cocoa') >= 2) { api.bubble(it.x + 110, it.y - 10, 'Share the cocoa first! ☕'); return; }
        api.sfx.pour(); food(api, 'cocoa', it.x + 230 + api.count('cocoa') * 60, it.y + 170); api.bubble(it.x + 110, it.y - 10, 'One hot cocoa! ☕');
      },
      art: () => svg(220, 260, `
        <path d="M110 20 V120" stroke="${INK}" stroke-width="6"/>
        <path ${O} d="M14 70 Q110 -20 206 70 Z" fill="#E58F6A" style="stroke-width:3"/><path d="M110 6 L84 70 L136 70 Z" fill="#fff" opacity=".9"/>
        <rect ${O} x="20" y="120" width="180" height="100" rx="14" fill="#FBF7EF"/>
        <rect ${O} x="40" y="88" width="140" height="38" rx="12" fill="#F5DE7A"/>${text(110, 115, 'HOT COCOA', 20)}
        <path ${O} d="M80 150 h40 v30 q0 12 -12 12 h-16 q-12 0 -12 -12 z" fill="#B79CF0" style="stroke-width:2"/>
        <circle ${O} cx="60" cy="234" r="22" fill="#4D5C9A"/><circle ${O} cx="160" cy="234" r="22" fill="#4D5C9A"/>`) },
  ],
};
