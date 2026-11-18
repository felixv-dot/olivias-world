// Gym: treadmill, punching bag, dumbbells, water, basketball hoop with a score, lockers.
import { INK, O, svg, text, plantArt, NPC } from './common.js';

const bg = () => svg(1600, 900, `
  <defs><pattern id="gfl" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="#C9C3DD"/><path d="M0 99 H100 M99 0 V100" stroke="#B7B0CE" stroke-width="3"/></pattern></defs>
  <rect width="1600" height="640" fill="#DDF3EF"/>
  <rect y="250" width="1600" height="60" fill="#3CC7B8" opacity=".85"/><rect y="310" width="1600" height="16" fill="#F5DE7A"/>
  <rect ${O} x="620" y="80" width="460" height="380" rx="10" fill="#D8ECFA" style="stroke-width:4"/>
  <path d="M660 140 L740 90 M650 220 L820 100 M900 440 L1060 300" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity=".7"/>
  <rect y="640" width="1600" height="260" fill="url(#gfl)"/>
  <rect ${O} x="-10" y="626" width="1620" height="22" fill="#FBF7EF"/>
  <g transform="translate(120 70)"><rect ${O} width="300" height="130" rx="14" fill="#fff" style="stroke-width:3"/>${text(150, 56, 'You can do it!', 30, '#E58F6A')}${text(150, 98, '💪 Sunny Gym', 26, '#3CC7B8')}</g>
  <g transform="translate(640 560)"><rect ${O} width="420" height="20" rx="6" fill="#4D5C9A"/><path ${O} d="M30 20 V70 M390 20 V70" fill="none" style="stroke-width:8;stroke:#4D5C9A"/>
    ${[60, 120, 180, 240, 300, 360].map((x, i) => `<rect ${O} x="${x - 14}" y="-34" width="28" height="34" rx="6" fill="${['#E58F6A', '#F5DE7A', '#9EDDD4', '#C9B8F2', '#8FC3F0', '#E58F6A'][i]}"/>`).join('')}</g>`);

const hoopArt = (it) => svg(180, 230, `
  <rect ${O} x="10" y="6" width="160" height="110" rx="8" fill="#fff" style="stroke-width:3"/>
  <rect x="58" y="44" width="64" height="48" fill="none" stroke="#E58F6A" stroke-width="4"/>
  ${text(90, 34, 'SCORE ' + it.data.score, 20, '#E58F6A')}
  <ellipse ${O} cx="90" cy="118" rx="44" ry="10" fill="none" style="stroke-width:6;stroke:#E58F6A"/>
  <path d="M50 120 L64 190 M70 124 L76 194 M90 126 V196 M110 124 L104 194 M130 120 L116 190 M58 150 H122 M64 176 H116" stroke="#fff" stroke-width="3"/>
  <path d="M50 120 L64 190 M130 120 L116 190" stroke="${INK}" stroke-width="1.5" opacity=".4"/>`);

export const GYM = {
  id: 'gym', title: 'Sunny Gym 💪', avatar: [520, 480],
  frame: 'linear-gradient(#DDF3EF 70%, #C9C3DD 70%)',
  bg,
  stars: [{ id: 'gym-mat', x: 960, y: 804, z: 3 }],
  characters: [{ id: 'coach', look: NPC.coach, x: 870, y: 470, s: 0.95, say: ["I'm Coach Sam! Let's train! 💪", 'Try the punching bag!', 'Drink water, champ! 💧', 'Can you score 5 baskets? 🏀'] }],
  items: [
    { id: 'treadmill', x: 40, y: 400, w: 380, h: 360, drag: false,
      onTap: (it, api) => { it.el.classList.add('running'); api.bubble(it.x + 190, it.y - 10, 'Run, run, run! 🏃'); api.avatar()?.anim.happy(); api.later(() => it.el.classList.remove('running'), 2400); },
      art: () => svg(380, 360, `
        <path ${O} d="M300 330 L290 60 M330 330 L320 60" fill="none" style="stroke-width:10;stroke:#4D5C9A"/>
        <rect ${O} x="250" y="30" width="110" height="60" rx="14" fill="#4D5C9A"/><rect x="266" y="44" width="78" height="32" rx="6" fill="#9EDDD4"/>
        ${text(305, 67, '3.5', 20, INK)}
        <path ${O} d="M10 290 L320 290 L346 330 L20 330 Z" fill="#5E6DAE"/>
        <g class="belt">${Array.from({ length: 12 }, (_, i) => `<path d="M${30 + i * 26} 296 L${40 + i * 26} 324" stroke="#C9C3DD" stroke-width="4"/>`).join('')}</g>
        <rect ${O} x="20" y="330" width="330" height="20" rx="8" fill="#4D5C9A"/>`) },
    { id: 'bag', x: 450, y: 60, w: 130, h: 470, drag: false,
      onTap: (it, api) => { it.el.classList.remove('punch'); void it.el.offsetWidth; it.el.classList.add('punch'); api.sfx.boing(); api.bubble(it.x + 65, it.y + 200, ['POW! 💥', 'Bam! 🥊', 'Strong! 💪'][Math.floor(Math.random() * 3)]); },
      art: () => svg(130, 470, `
        <path d="M65 0 V120" stroke="${INK}" stroke-width="4"/><path d="M40 130 L65 110 L90 130" stroke="${INK}" stroke-width="3" fill="none"/>
        <rect ${O} x="20" y="126" width="90" height="330" rx="40" fill="#E58F6A" style="stroke-width:3"/>
        <rect x="20" y="180" width="90" height="16" fill="#2E2A3A" opacity=".6"/><rect x="20" y="390" width="90" height="16" fill="#2E2A3A" opacity=".6"/>
        <path d="M44 220 Q40 300 46 370" stroke="#fff" stroke-width="8" opacity=".35" stroke-linecap="round"/>`) },
    { id: 'mat', x: 820, y: 790, w: 330, h: 90, floor: true, art: () => svg(330, 90, `
      <rect ${O} x="6" y="10" width="318" height="70" rx="14" fill="#C9B8F2"/><path d="M40 12 V78 M290 12 V78" stroke="#fff" stroke-width="6" opacity=".6"/>`) },
    { id: 'dumbbell', x: 650, y: 650, w: 130, h: 60,
      onGive: (it, api, who) => { api.sfx.boing(); api.react(who, 'Look how strong! 💪', ['💪', '✨', '⭐']); api.snap(it, who.x + who.w + 10, who.y + who.h - 60); },
      art: () => svg(130, 60, `<rect ${O} x="30" y="24" width="70" height="12" rx="6" fill="#B9C4D6"/>
        <rect ${O} x="6" y="6" width="28" height="48" rx="8" fill="#4D5C9A"/><rect ${O} x="96" y="6" width="28" height="48" rx="8" fill="#4D5C9A"/>`) },
    { id: 'bottle', x: 800, y: 640, w: 54, h: 110,
      onGive: (it, api, who) => { api.sfx.yum(); api.react(who, 'So refreshing! 💧', ['💧', '✨', '💙']); api.snap(it, who.x + who.w + 10, who.y + who.h - 110); },
      art: () => svg(54, 110, `<rect ${O} x="16" y="2" width="22" height="16" rx="4" fill="#4D5C9A"/>
        <path ${O} d="M10 24 Q10 16 18 16 H36 Q44 16 44 24 V100 Q44 108 36 108 H18 Q10 108 10 100 Z" fill="#AFD6F7" fill-opacity=".9"/>
        <path d="M10 56 H44 V100 Q44 108 36 108 H18 Q10 108 10 100 Z" fill="#8FC3F0"/><path d="M18 30 V96" stroke="#fff" stroke-width="5" opacity=".6"/>`) },
    { id: 'locker', x: 1170, y: 300, w: 220, h: 460, drag: false, data: { open: false },
      onTap: (it, api) => {
        it.data.open = !it.data.open; api.setArt(it); api.sfx.click();
        if (it.data.open && !api.starFound('gym-locker')) api.addStar('gym-locker', it.x + 22, it.y + 160, { spawned: true });
      },
      art: (it) => svg(220, 460, `
        <rect ${O} x="4" y="4" width="212" height="452" rx="8" fill="#8FC3F0" style="stroke-width:3"/>
        <path class="ln" stroke-width="3" d="M110 4 V456"/>
        ${[30, 140].map((x) => `<g transform="translate(${x} 30)">${[0, 12, 24].map((y) => `<rect x="0" y="${y}" width="50" height="6" rx="3" fill="${INK}" opacity=".3"/>`).join('')}</g>`).join('')}
        <rect ${O} x="150" y="200" width="10" height="44" rx="4" fill="#fff"/>
        ${it.data.open
          ? `<rect x="10" y="10" width="96" height="440" fill="#3E4A5E"/><path d="M14 120 H102" stroke="#C9C3DD" stroke-width="5"/>
             <path ${O} d="M30 128 l-10 16 v80 h40 v-80 l-10 -16 z" fill="#F5DE7A" style="stroke-width:2"/>
             <path ${O} d="M110 4 L30 30 V430 L110 456 Z" fill="#AFD6F7"/><rect ${O} x="44" y="210" width="10" height="44" rx="4" fill="#fff"/>`
          : '<rect ' + O + ' x="60" y="200" width="10" height="44" rx="4" fill="#fff"/>'}`) },
    { id: 'hoop', x: 1410, y: 100, w: 180, h: 230, drag: false, data: { score: 0 }, art: hoopArt },
    { id: 'ball', x: 1450, y: 760, w: 90, h: 90, data: { busy: false },
      onTap: (it, api) => {
        if (it.data.busy) return;
        it.data.busy = true;
        const hoop = api.get('hoop');
        const dx = hoop.x + 45 - it.x, dy = hoop.y + 60 - it.y;
        it.el.style.setProperty('--dx', dx + 'px');
        it.el.style.setProperty('--dy', dy + 'px');
        it.el.classList.add('shoot');
        const scored = Math.random() < 0.7;
        api.later(() => {
          if (scored) {
            hoop.data.score++; api.setArt(hoop); api.sfx.win();
            api.bubble(hoop.x + 90, hoop.y + 250, hoop.data.score === 5 ? 'FIVE baskets! Champion! 🏆' : 'Score! 🏀');
            api.sparkle(hoop.x + 90, hoop.y + 120, ['🏀', '✨', '⭐']);
          } else api.bubble(hoop.x + 90, hoop.y + 250, 'So close! Try again!');
        }, 500);
        api.later(() => { it.el.classList.remove('shoot'); it.data.busy = false; }, 1000);
      },
      art: () => svg(90, 90, `<circle ${O} cx="45" cy="45" r="41" fill="#F0A060" style="stroke-width:3"/>
        <path d="M4 45 H86 M45 4 V86 M16 16 Q40 45 16 74 M74 16 Q50 45 74 74" stroke="${INK}" stroke-width="2.5" fill="none"/>`) },
    { id: 'gplant', x: 1060, y: 660, w: 120, h: 190, art: () => plantArt() },
  ],
};
