// Pets: cat, dog, bunny, hamster, fox — sitting, front-facing, same cute style as the kids.
// renderPet(look) returns a full <svg>; it uses the same .head/.body/.open/.closed hooks so animate() works.
import { darker, lighter } from './avatar.js';

const INK = '#4A3B5C';
const O = 'class="o"';

export const PET_PARTS = {
  type: [['cat', 'Cat'], ['dog', 'Dog'], ['bunny', 'Bunny'], ['hamster', 'Hamster'], ['fox', 'Fox']],
  pattern: [['none', 'Plain'], ['spots', 'Spots'], ['patch', 'Eye patch'], ['stripes', 'Stripes'], ['socks', 'White socks']],
  acc: [['none', 'None'], ['collar', 'Collar'], ['bow', 'Bow'], ['scarf', 'Scarf']],
};
export const PET_PALETTE = {
  fur: ['#FBF7EF', '#F3D9A8', '#F0A060', '#A87A5A', '#A9AEC2', '#3E3A4A', '#C9B8F2', '#9EDDD4'],
  eyes: ['#4E9B5A', '#36A7B5', '#8D6CC9', '#8B6450', '#D6A43A', '#4F86C6'],
  acc: ['#E58F6A', '#3CC7B8', '#B79CF0', '#F5DE7A', '#8FC3F0', '#4D5C9A'],
};
export const PET_PRESET = { type: 'cat', fur: '#F0A060', pattern: 'stripes', eyes: '#4E9B5A', acc: 'collar', accColor: '#3CC7B8', glasses: 'none', hat: 'none' };

export function randomPet() {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  return {
    type: pick(PET_PARTS.type)[0], fur: pick(PET_PALETTE.fur), pattern: pick(PET_PARTS.pattern)[0],
    eyes: pick(PET_PALETTE.eyes), acc: pick(PET_PARTS.acc)[0], accColor: pick(PET_PALETTE.acc), glasses: 'none', hat: 'none',
  };
}

function ears(t, fur, inner) {
  switch (t) {
    case 'dog': return `<path ${O} d="M78 74 Q34 86 46 154 Q74 146 96 96 Z" fill="${darker(fur, 0.12)}"/><path ${O} d="M222 74 Q266 86 254 154 Q226 146 204 96 Z" fill="${darker(fur, 0.12)}"/>`;
    case 'bunny': return `<path ${O} d="M112 56 Q92 -66 126 -66 Q150 -48 136 50 Z" fill="${fur}"/><path d="M118 40 Q106 -40 124 -46 Q136 -30 128 40 Z" fill="${inner}"/>
      <path ${O} d="M188 56 Q208 -66 174 -66 Q150 -48 164 50 Z" fill="${fur}"/><path d="M182 40 Q194 -40 176 -46 Q164 -30 172 40 Z" fill="${inner}"/>`;
    case 'hamster': return `<circle ${O} cx="90" cy="50" r="22" fill="${fur}"/><circle cx="90" cy="52" r="11" fill="${inner}"/><circle ${O} cx="210" cy="50" r="22" fill="${fur}"/><circle cx="210" cy="52" r="11" fill="${inner}"/>`;
    case 'fox': return `<path ${O} d="M80 76 L66 -6 L132 44 Z" fill="${fur}"/><path d="M84 62 L76 14 L114 44 Z" fill="${INK}" opacity=".75"/>
      <path ${O} d="M220 76 L234 -6 L168 44 Z" fill="${fur}"/><path d="M216 62 L224 14 L186 44 Z" fill="${INK}" opacity=".75"/>`;
    default: return `<path ${O} d="M84 74 L76 6 L128 44 Z" fill="${fur}"/><path d="M88 60 L84 22 L114 44 Z" fill="${inner}"/>
      <path ${O} d="M216 74 L224 6 L172 44 Z" fill="${fur}"/><path d="M212 60 L216 22 L186 44 Z" fill="${inner}"/>`;
  }
}

function tail(t, fur) {
  switch (t) {
    case 'dog': return `<g class="tail"><path d="M214 206 Q262 190 262 150" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M214 206 Q262 190 262 150" fill="none" stroke="${fur}" stroke-width="16" stroke-linecap="round"/></g>`;
    case 'bunny': return `<g class="tail"><circle ${O} cx="228" cy="226" r="22" fill="#FBF7EF"/></g>`;
    case 'hamster': return '';
    case 'fox': return `<g class="tail"><path ${O} d="M210 230 Q300 230 286 140 Q270 96 246 120 Q262 170 210 196 Z" fill="${fur}"/><path d="M286 140 Q270 96 246 120 Q256 140 272 150 Z" fill="#FBF7EF"/></g>`;
    default: return `<g class="tail"><path d="M212 220 Q286 222 270 150 Q262 118 240 126" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M212 220 Q286 222 270 150 Q262 118 240 126" fill="none" stroke="${fur}" stroke-width="14" stroke-linecap="round"/></g>`;
  }
}

function pattern(p, t, fur, uid) {
  const dark = darker(fur, fur === '#3E3A4A' ? -0.4 : 0.28);
  if (p === 'spots') return `<g clip-path="url(#${uid}-clip)" fill="${dark}"><circle cx="110" cy="190" r="14"/><circle cx="186" cy="210" r="18"/><circle cx="166" cy="168" r="9"/><circle cx="196" cy="70" r="13"/><circle cx="96" cy="92" r="9"/></g>`;
  if (p === 'patch') return `<ellipse cx="114" cy="106" rx="34" ry="30" fill="${dark}" clip-path="url(#${uid}-clip)"/>`;
  if (p === 'stripes') return `<g clip-path="url(#${uid}-clip)" stroke="${dark}" stroke-width="8" stroke-linecap="round" fill="none"><path d="M130 42 L136 64 M150 38 V62 M170 42 L164 64"/><path d="M76 170 Q92 176 96 190 M224 170 Q208 176 204 190 M80 206 Q96 210 100 222 M220 206 Q204 210 200 222"/></g>`;
  return '';
}

export function renderPet(look, { className = '' } = {}) {
  const uid = 'pet' + Math.random().toString(36).slice(2, 7);
  const t = look.type || 'cat', fur = look.fur || '#F0A060';
  const shade = darker(fur, 0.12), belly = lighter(fur, 0.55), inner = '#F0B39A';
  const roundHead = t === 'hamster' ? 'M150 22 C230 22 250 80 248 120 C246 166 204 178 150 178 C96 178 54 166 52 120 C50 80 70 22 150 22 Z' : 'M150 30 C222 30 240 80 238 116 C236 160 198 176 150 176 C102 176 64 160 62 116 C60 80 78 30 150 30 Z';
  const accent = look.accColor || '#3CC7B8';
  const muzzle = t === 'dog' || t === 'fox';
  const glasses = look.glasses && look.glasses !== 'none'
    ? (look.glasses === 'sun'
      ? `<path ${O} d="M88 94 H140 Q142 128 114 130 Q86 128 88 94 Z M160 94 H212 Q214 128 186 130 Q158 128 160 94 Z" fill="#2E2448" fill-opacity=".9" style="stroke-width:3.5"/><path class="ln" stroke-width="3.5" d="M140 100 Q150 94 160 100"/>`
      : `<circle ${O} cx="116" cy="108" r="24" fill="#fff" fill-opacity=".2" style="stroke-width:3.5"/><circle ${O} cx="184" cy="108" r="24" fill="#fff" fill-opacity=".2" style="stroke-width:3.5"/><path class="ln" stroke-width="3.5" d="M140 104 Q150 98 160 104"/>`)
    : '';
  const hatY = t === 'bunny' ? 44 : 38;
  const hat = {
    beanie: `<path ${O} d="M100 ${hatY + 22} C96 ${hatY - 34} 204 ${hatY - 34} 200 ${hatY + 22} Z" fill="${accent}"/><path ${O} d="M94 ${hatY + 18} Q150 ${hatY + 6} 206 ${hatY + 18} L204 ${hatY + 34} Q150 ${hatY + 22} 96 ${hatY + 34} Z" fill="${darker(accent, 0.1)}"/><circle ${O} cx="150" cy="${hatY - 26}" r="14" fill="#FBF7EF"/>`,
    cap: `<path ${O} d="M104 ${hatY + 24} C100 ${hatY - 26} 200 ${hatY - 26} 196 ${hatY + 24} Z" fill="${accent}"/><path ${O} d="M100 ${hatY + 22} Q150 ${hatY + 10} 200 ${hatY + 22} Q206 ${hatY + 38} 150 ${hatY + 40} Q94 ${hatY + 38} 100 ${hatY + 22} Z" fill="${darker(accent, 0.12)}"/>`,
    straw: `<ellipse ${O} cx="150" cy="${hatY + 18}" rx="92" ry="20" fill="#EBCB86"/><path ${O} d="M112 ${hatY + 16} C110 ${hatY - 28} 190 ${hatY - 28} 188 ${hatY + 16} Z" fill="#F2D9A0"/><path d="M113 ${hatY + 6} Q150 ${hatY} 187 ${hatY + 6}" stroke="${accent}" stroke-width="8"/>`,
    earmuffs: `<path d="M74 110 C66 20 234 20 226 110" fill="none" stroke="${accent}" stroke-width="9" stroke-linecap="round"/><circle ${O} cx="70" cy="114" r="22" fill="#FBF7EF"/><circle ${O} cx="230" cy="114" r="22" fill="#FBF7EF"/>`,
  }[look.hat] || '';
  const acc = {
    collar: `<path ${O} d="M100 162 Q150 186 200 162 L200 176 Q150 200 100 176 Z" fill="${accent}"/><circle ${O} cx="150" cy="192" r="10" fill="#F5DE7A"/><path d="M144 194 H156" stroke="${INK}" stroke-width="2"/>`,
    bow: `<path ${O} d="M214 50 C196 30 180 40 188 56 C196 70 208 62 214 58 Z M214 50 C232 30 248 40 240 56 C232 70 220 62 214 58 Z" fill="${accent}"/><circle ${O} cx="214" cy="54" r="7" fill="${accent}"/>`,
    scarf: `<path ${O} d="M170 176 L184 230 L164 232 L156 182 Z" fill="${accent}"/><path ${O} d="M96 160 Q150 190 204 160 L206 180 Q150 210 94 180 Z" fill="${accent}"/><path d="M104 172 Q150 196 196 172" stroke="#fff" stroke-width="5" opacity=".5" fill="none"/>`,
  }[look.acc] || '';
  const eye = (cx) => `<g class="open">
      <ellipse cx="${cx}" cy="108" rx="17" ry="20" fill="#2A2038"/>
      <ellipse cx="${cx}" cy="112" rx="12" ry="14" fill="${look.eyes || '#4E9B5A'}"/>
      <ellipse cx="${cx}" cy="114" rx="6" ry="8" fill="#2A2038"/>
      <circle cx="${cx - 6}" cy="100" r="6" fill="#fff"/><circle cx="${cx + 6}" cy="118" r="2.6" fill="#fff"/></g>
    <path class="closed ln" stroke-width="4.5" d="M${cx - 16} 112 Q${cx} 96 ${cx + 16} 112"/>`;
  return `<svg class="avatar pet ${className}" viewBox="0 0 300 260" role="img" aria-label="Pet ${t}">
  <defs><clipPath id="${uid}-clip"><path d="${roundHead}"/><ellipse cx="150" cy="196" rx="76" ry="60"/></clipPath></defs>
  <ellipse cx="150" cy="254" rx="96" ry="9" fill="${INK}" opacity=".12"/>
  <g class="body">
    ${tail(t, fur)}
    <ellipse ${O} cx="150" cy="196" rx="76" ry="60" fill="${fur}"/>
    <ellipse cx="150" cy="210" rx="44" ry="40" fill="${belly}"/>
    ${pattern(look.pattern, t, fur, uid)}
    <ellipse ${O} cx="116" cy="248" rx="24" ry="12" fill="${look.pattern === 'socks' ? '#FBF7EF' : shade}"/>
    <ellipse ${O} cx="184" cy="248" rx="24" ry="12" fill="${look.pattern === 'socks' ? '#FBF7EF' : shade}"/>
    ${look.acc === 'scarf' || look.acc === 'collar' ? acc : ''}
  </g>
  <g class="head">
    ${ears(t, fur, inner)}
    <path ${O} d="${roundHead}" fill="${fur}"/>
    ${t === 'hamster' ? `<ellipse cx="96" cy="140" rx="30" ry="24" fill="${belly}"/><ellipse cx="204" cy="140" rx="30" ry="24" fill="${belly}"/>` : ''}
    ${look.pattern === 'patch' || look.pattern === 'stripes' || look.pattern === 'spots' ? pattern(look.pattern, t, fur, uid) : ''}
    ${muzzle ? `<ellipse cx="150" cy="142" rx="38" ry="28" fill="${belly}"/>` : ''}
    ${t === 'fox' ? `<path d="M64 120 Q100 150 150 150 Q200 150 236 120 Q230 168 150 176 Q70 168 64 120 Z" fill="#FBF7EF"/>` : ''}
    <ellipse cx="96" cy="136" rx="14" ry="8" fill="#FF9A86" opacity=".45"/><ellipse cx="204" cy="136" rx="14" ry="8" fill="#FF9A86" opacity=".45"/>
    ${eye(116)}${eye(184)}
    <path ${O} d="M141 128 H159 Q158 138 150 140 Q142 138 141 128 Z" fill="${t === 'dog' || t === 'fox' ? '#2A2038' : '#F08C7E'}" style="stroke-width:2"/>
    <g class="open"><path class="ln" stroke-width="3" d="M150 140 V146 M138 146 Q144 154 150 146 Q156 154 162 146"/></g>
    <path class="closed o" style="stroke-width:2.4" fill="#C95F5E" d="M136 144 Q150 148 164 144 Q160 162 150 162 Q140 162 136 144 Z"/>
    ${t === 'cat' || t === 'bunny' || t === 'hamster' || t === 'fox' ? `<path class="ln" stroke-width="2" opacity=".6" d="M100 132 L66 126 M100 140 L68 144 M200 132 L234 126 M200 140 L232 144"/>` : ''}
    ${look.acc === 'bow' ? acc : ''}
    ${glasses}${hat}
  </g>
</svg>`;
}

export const PET_ANIM = { pivot: [150, 176], hop: 24 };
