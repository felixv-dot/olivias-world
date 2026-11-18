// Olivia's World — anime avatar renderer.
// render(look) returns a complete <svg> string. Every part is chosen by a key in `look`,
// colors are passed as CSS variables so recoloring never needs a redraw.

const INK = '#4A3B5C';
const v = (name) => `var(--${name})`;
const fill = (name) => `style="fill:${v(name)}"`;

// ---------- options shown in the editor ----------
export const PALETTE = {
  skin: ['#FFF0E6', '#FCE5D6', '#F3D2B8', '#E9C3A3', '#C99772', '#9A6B4C', '#6E4A35'],
  eyes: ['#8D6CC9', '#36A7B5', '#4F86C6', '#4E9B5A', '#8B6450', '#D6A43A', '#5A5A6E'],
  hair: ['#A88DE2', '#4D5C9A', '#5FC9C0', '#8FC3F0', '#F2D27A', '#8B6450', '#2E2A3A', '#E58F6A', '#E8E4F2'],
  cloth: ['#FBEFB4', '#F5DE7A', '#C9B8F2', '#B79CF0', '#AFD6F7', '#8FC3F0', '#9EDDD4', '#3CC7B8', '#4D5C9A', '#7A64B0', '#E58F6A', '#FFFFFF', '#2E2A3A'],
};

export const PARTS = {
  face: [['girl', 'Cute'], ['boy', 'Boyish']],
  hairStyle: [['bobBuns', 'Bob + buns'], ['bob', 'Bob'], ['long', 'Long'], ['pigtails', 'Pigtails'], ['fluffy', 'Short fluffy']],
  hairAcc: [['none', 'None'], ['star', 'Star clip'], ['bow', 'Bow']],
  glasses: [['none', 'None'], ['round', 'Round'], ['sun', 'Sunglasses']],
  hat: [['none', 'None'], ['straw', 'Straw hat'], ['cap', 'Cap'], ['beanie', 'Beanie'], ['earmuffs', 'Earmuffs']],
  top: [['hoodie', 'Hoodie'], ['sweater', 'Sweater'], ['tee', 'T-shirt'], ['puffer', 'Puffer jacket']],
  collar: [['sailor', 'Sailor'], ['hood', 'Hood'], ['round', 'Round']],
  neck: [['ribbon', 'Ribbon'], ['bow', 'Bow'], ['tie', 'Tie'], ['scarf', 'Scarf'], ['none', 'None']],
  bottom: [['shorts', 'Shorts'], ['skirt', 'Skirt'], ['widePants', 'Wide pants']],
  socks: [['knee', 'Knee socks'], ['ankle', 'Ankle socks'], ['none', 'None']],
  shoes: [['boots', 'Boots'], ['sneakers', 'Sneakers']],
};

// The two characters from Olivia's drawings.
export const PRESETS = {
  girl: {
    face: 'girl', skin: '#FCE5D6', eyes: '#8D6CC9',
    hairStyle: 'bobBuns', hair: '#A88DE2', hairAcc: 'star', glasses: 'none', hat: 'none',
    top: 'hoodie', topColor: '#FBEFB4', collar: 'sailor', collarColor: '#3CC7B8', neck: 'ribbon', neckColor: '#8FC3F0', badge: true,
    bottom: 'shorts', bottomColor: '#8FC3F0', socks: 'knee', socksColor: '#FFFFFF', shoes: 'boots', shoesColor: '#7A64B0',
  },
  boy: {
    face: 'boy', skin: '#FCE5D6', eyes: '#36A7B5',
    hairStyle: 'fluffy', hair: '#4D5C9A', hairAcc: 'none', glasses: 'none', hat: 'none',
    top: 'sweater', topColor: '#9EDDD4', collar: 'round', collarColor: '#3CC7B8', neck: 'none', neckColor: '#8FC3F0', badge: false,
    bottom: 'widePants', bottomColor: '#C9B8F2', socks: 'none', socksColor: '#FFFFFF', shoes: 'sneakers', shoesColor: '#FFFFFF',
  },
};

// ---------- helpers ----------
export function mixHex(hex, target, k) {
  const a = parseInt(hex.slice(1), 16), b = parseInt(target.slice(1), 16);
  const ch = (n, s) => (n >> s) & 255;
  const m = (s) => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * k);
  return '#' + ((1 << 24) | (m(16) << 16) | (m(8) << 8) | m(0)).toString(16).slice(1);
}
export const darker = (hex, k) => mixHex(hex, '#1E1830', k);
export const lighter = (hex, k) => mixHex(hex, '#FFFFFF', k);

// Mirror an absolute path left↔right around the center line (x = 210).
export const mirror = (d) => d.replace(/(-?\d*\.?\d+)[ ,]+(-?\d*\.?\d+)/g, (m, x, y) => `${(420 - parseFloat(x)).toFixed(1)} ${y}`);
const mirrorPts = (pts) => pts.map(([x, y]) => [420 - x, y]);

// Fabric outline: a smooth spline through key points with a gentle, uneven wave on top.
function wavy(pts, { amp = 1.4, seed = 1 } = {}) {
  const P = [pts[pts.length - 1], ...pts, pts[0], pts[1]];
  const out = [];
  let s = 0;
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const n = Math.max(2, Math.ceil(len / 4));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      const x = cr(p0[0], p1[0], p2[0], p3[0]), y = cr(p0[1], p1[1], p2[1], p3[1]);
      const dx = p2[0] - p1[0], dy = p2[1] - p1[1], L = Math.hypot(dx, dy) || 1;
      const w = amp * Math.sin(s * 0.32 + seed) * (0.55 + 0.45 * Math.sin(s * 0.11 + seed * 2));
      out.push([x + (-dy / L) * w, y + (dx / L) * w]);
      s += len / n;
    }
  }
  return 'M' + out.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L') + ' Z';
}

// ---------- face ----------
function eye(uid, side, cx, cy, mirrored, { flick = true, sy = 1, lash = 5.5 } = {}) {
  const s = mirrored ? -1 : 1;
  const X = (dx) => (cx + s * dx).toFixed(1);
  const Y = (dy) => (cy + dy).toFixed(1);
  const white = `M${X(-25)} ${Y(-6)} C${X(-25)} ${Y(-30)} ${X(-11)} ${Y(-38)} ${X(1)} ${Y(-38)} C${X(15)} ${Y(-38)} ${X(25)} ${Y(-28)} ${X(25)} ${Y(-4)} C${X(25)} ${Y(24)} ${X(15)} ${Y(36)} ${X(0)} ${Y(36)} C${X(-15)} ${Y(36)} ${X(-25)} ${Y(22)} ${X(-25)} ${Y(-6)} Z`;
  const clip = `${uid}-eye${side}`;
  return `<g transform="translate(${cx} ${cy}) scale(1 ${sy}) translate(${-cx} ${-cy})">
  <clipPath id="${clip}"><path d="${white}"/></clipPath>
  <g class="open">
    <path d="${white}" fill="#fff"/>
    <g clip-path="url(#${clip})">
      <ellipse cx="${X(2)}" cy="${Y(4)}" rx="21" ry="29" fill="url(#${uid}-iris)"/>
      <ellipse cx="${X(2)}" cy="${Y(4)}" rx="21" ry="29" fill="none" stroke="${INK}" stroke-width="1.5" opacity=".5"/>
      <ellipse cx="${X(2)}" cy="${Y(8)}" rx="8.5" ry="12.5" fill="#2A2038"/>
      <ellipse cx="${X(2)}" cy="${Y(-26)}" rx="30" ry="15" fill="#2A2038" opacity=".35"/>
      <ellipse cx="${X(4)}" cy="${Y(24)}" rx="12" ry="6" fill="#fff" opacity=".35"/>
    </g>
    <path d="${white}" fill="none" stroke="${INK}" stroke-width="1.4" opacity=".35"/>
    <path class="ln" stroke-width="${lash}" d="M${X(-29)} ${Y(-2)} C${X(-26)} ${Y(-32)} ${X(-4)} ${Y(-44)} ${X(16)} ${Y(-38)} C${X(24)} ${Y(-35)} ${X(28)} ${Y(-30)} ${X(30)} ${Y(-24)}"/>
    ${flick ? `<path class="ln" stroke-width="3" d="M${X(-27)} ${Y(-9)} L${X(-37)} ${Y(-15)} M${X(-23)} ${Y(-21)} L${X(-31)} ${Y(-29)}"/>
    <path class="ln" stroke-width="1.8" opacity=".55" d="M${X(-13)} ${Y(34)} Q${X(0)} ${Y(40)} ${X(13)} ${Y(33)}"/>` : ''}
    <ellipse cx="${(cx - 9).toFixed(1)}" cy="${Y(-15)}" rx="8" ry="10" fill="#fff"/>
    <circle cx="${(cx + 10).toFixed(1)}" cy="${Y(17)}" r="4" fill="#fff"/>
    <circle cx="${(cx + 12).toFixed(1)}" cy="${Y(-6)}" r="2.2" fill="#fff"/>
  </g>
  <path class="closed ln" stroke-width="5" d="M${X(-24)} ${Y(4)} Q${X(0)} ${Y(-20)} ${X(24)} ${Y(4)}"/>
  </g>`;
}

const NOSE = `
  <path d="M213 264 Q219 276 214 285 Q210 285 207 283 Z" fill="${INK}" opacity=".1"/>
  <path class="ln" stroke-width="1.9" opacity=".6" d="M213 270 Q216 278 213 283"/>
  <path class="ln" stroke-width="1.9" opacity=".55" d="M205 284 Q209 287 214 284"/>`;

function face(look, uid) {
  if (look.face === 'boy') {
    return `
  <path class="o" ${fill('skin')} d="M120 198 C120 130 160 102 210 102 C260 102 300 130 300 198 C300 250 292 286 270 310 C252 328 232 334 210 334 C188 334 168 328 150 310 C128 286 120 250 120 198 Z"/>
  <ellipse cx="150" cy="292" rx="18" ry="8" fill="url(#${uid}-blush)" opacity=".55"/>
  <ellipse cx="270" cy="292" rx="18" ry="8" fill="url(#${uid}-blush)" opacity=".55"/>
  ${eye(uid, 'L', 170, 256, false, { flick: false, sy: 0.8, lash: 4.5 })}
  ${eye(uid, 'R', 250, 256, true, { flick: false, sy: 0.8, lash: 4.5 })}
  ${NOSE}
  <g class="open"><path class="o" style="stroke-width:2.2" fill="#C95F5E" d="M198 300 Q210 303 222 300 Q220 312 210 312 Q200 312 198 300 Z"/></g>
  <path class="closed o" style="stroke-width:2.2" fill="#C95F5E" d="M194 298 Q210 302 226 298 Q223 318 210 318 Q197 318 194 298 Z"/>`;
  }
  return `
  <path class="o" ${fill('skin')} d="M118 200 C118 130 160 100 210 100 C260 100 302 130 302 200 C302 255 285 292 255 318 C238 332 224 338 210 338 C196 338 182 332 165 318 C135 292 118 255 118 200 Z"/>
  <ellipse cx="146" cy="290" rx="22" ry="11" fill="url(#${uid}-blush)"/>
  <ellipse cx="274" cy="290" rx="22" ry="11" fill="url(#${uid}-blush)"/>
  <path class="ln" stroke-width="1.6" opacity=".5" d="M136 292 L141 285 M144 293 L149 286 M152 293 L157 286 M264 292 L269 285 M272 293 L277 286 M280 293 L285 286"/>
  ${eye(uid, 'L', 168, 252, false)}
  ${eye(uid, 'R', 252, 252, true)}
  ${NOSE}
  <g class="open"><path class="o" style="stroke-width:2.2" fill="#C95F5E" d="M196 300 Q210 302 224 300 Q222 318 210 318 Q198 318 196 300 Z"/>
  <path d="M202 312 Q210 306 218 312 Q214 317 210 317 Q206 317 202 312 Z" fill="#F08C7E"/></g>
  <path class="closed o" style="stroke-width:2.2" fill="#C95F5E" d="M192 298 Q210 302 228 298 Q225 322 210 322 Q195 322 192 298 Z"/>`;
}

// ---------- hair ----------
const BOB_BACK = 'M102 220 C96 128 150 80 210 80 C270 80 324 128 318 220 C320 268 316 306 304 334 Q284 342 266 330 L154 330 Q136 342 116 334 C104 306 100 268 102 220 Z';
const LONG_BACK = 'M102 220 C96 128 150 80 210 80 C270 80 324 128 318 220 C324 300 332 400 324 492 Q318 512 306 500 Q298 520 286 504 Q276 520 266 506 L154 506 Q144 520 134 504 Q122 520 114 500 Q102 512 96 492 C88 400 96 300 102 220 Z';
const TAIL = 'M122 238 C82 258 70 330 78 400 C84 452 98 482 88 516 C116 490 128 444 126 384 C124 330 132 290 144 258 Z';
const GIRL_BANGS = 'M122 348 C106 300 100 232 110 182 C122 122 160 92 210 92 C260 92 298 122 310 182 C320 232 314 300 298 348 C292 318 289 282 290 250 Q294 212 286 180 Q284 200 270 212 Q262 188 250 172 Q250 192 236 208 Q228 186 214 168 Q214 190 198 206 Q190 186 180 170 Q178 192 162 210 Q156 190 148 176 Q144 200 134 214 Q126 232 130 250 C131 282 128 318 122 348 Z';
const BOY_BANGS = 'M116 232 C108 156 146 90 210 88 C274 90 312 156 304 232 Q300 206 292 186 Q288 196 278 200 Q272 184 262 172 Q260 186 248 194 Q240 176 228 166 Q226 182 214 192 Q206 176 194 166 Q192 182 180 192 Q172 178 160 172 Q158 188 146 198 Q140 190 132 186 Q122 206 116 232 Z';
const SIDELOCK = 'M116 236 C108 280 110 314 122 346 C130 320 134 286 132 244 Z';
const SHINE = '<path class="ln" style="stroke:#fff" stroke-width="7" opacity=".45" d="M150 134 Q176 118 200 115 M222 115 Q248 118 272 134"/>';

function fluffyBack() {
  let seed = 8;
  const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const cx = 210, cy = 196, N = 10;
  const a0 = Math.PI * 0.93, a1 = Math.PI * 2.07;
  const P = (a, R) => `${(cx + Math.cos(a) * R * 1.02).toFixed(1)} ${(cy + Math.sin(a) * R).toFixed(1)}`;
  let d = `M${P(a0, 100)} `;
  for (let i = 0; i < N; i++) {
    const aV = a0 + ((a1 - a0) * i) / N, aN = a0 + ((a1 - a0) * (i + 1)) / N;
    const aT = aV + (aN - aV) * (0.7 + r() * 0.15);
    const RT = 114 + r() * 6;
    d += `C${P(aV + (aT - aV) * 0.15, 113)} ${P(aV + (aT - aV) * 0.55, RT + 4)} ${P(aT, RT)} Q${P(aT + (aN - aT) * 0.15, 106)} ${P(aN, 101 + r() * 3)} `;
  }
  return d + `L${cx} ${cy + 40} Z`;
}
const FLUFFY_BACK = fluffyBack();

function hairBack(look) {
  const hs = fill('hairShade');
  switch (look.hairStyle) {
    case 'bobBuns':
      return `<circle class="o" ${hs} cx="110" cy="268" r="40"/><circle class="o" ${hs} cx="310" cy="268" r="40"/>
        <path class="ln" style="stroke:#fff" stroke-width="2.4" opacity=".4" d="M94 262 Q108 242 126 258 Q120 282 100 276 M326 262 Q312 242 294 258 Q300 282 320 276"/>
        <path class="o" ${hs} d="${BOB_BACK}"/>`;
    case 'bob': return `<path class="o" ${hs} d="${BOB_BACK}"/>`;
    case 'long':
      return `<path class="o" ${hs} d="${LONG_BACK}"/>
        <path class="ln" stroke-width="1.6" opacity=".3" d="M110 330 Q104 400 112 480 M310 330 Q316 400 308 480"/>`;
    case 'pigtails':
      return `<path class="o" ${fill('hair')} d="${TAIL}"/><path class="o" ${fill('hair')} d="${mirror(TAIL)}"/>
        <path class="ln" stroke-width="1.6" opacity=".35" d="M100 300 Q92 380 98 470 M320 300 Q328 380 322 470"/>
        <path class="o" ${hs} d="${BOB_BACK}"/>
        <circle class="o" ${fill('accent2')} cx="126" cy="250" r="10"/><circle class="o" ${fill('accent2')} cx="294" cy="250" r="10"/>`;
    case 'fluffy': default:
      return `<path class="o" ${hs} d="${FLUFFY_BACK}"/>`;
  }
}

function hairFront(look) {
  const h = fill('hair');
  let out;
  if (look.hairStyle === 'fluffy') {
    out = `<path class="o" ${h} d="${BOY_BANGS}"/>
      <path class="ln" stroke-width="1.6" opacity=".35" d="M196 102 Q190 136 194 164 M232 102 Q238 136 248 192 M164 120 Q154 146 160 170 M262 122 Q274 150 278 198"/>`;
  } else {
    out = `<path class="o" ${h} d="${GIRL_BANGS}"/>
      <path class="ln" stroke-width="1.6" opacity=".35" d="M117 200 Q112 270 123 336 M303 200 Q308 270 297 336"/>
      <path class="ln" stroke-width="1.6" opacity=".35" d="M196 104 Q186 140 180 168 M232 104 Q240 140 250 170 M164 122 Q152 150 148 174 M262 124 Q276 150 286 178"/>`;
  }
  out += SHINE;
  if (look.face === 'boy') out += '<path class="ln" stroke-width="4.5" opacity=".9" d="M146 214 Q166 205 190 210 M274 214 Q254 205 230 210"/>';
  const hat = look.hat && look.hat !== 'none';
  if (hat) return out;
  if (look.hairAcc === 'star') {
    out += `<path class="o" fill="#F7D96A" style="stroke-width:2.2" d="M146 150 L151 162 L164 163 L154 171 L157 184 L146 177 L135 184 L138 171 L128 163 L141 162 Z"/><circle cx="143" cy="164" r="2" fill="#fff" opacity=".8"/>`;
  } else if (look.hairAcc === 'bow') {
    out += `<path class="o" ${fill('accent2')} d="M146 160 C134 146 116 150 120 164 C124 178 140 174 146 166 Z M146 160 C158 146 176 150 172 164 C168 178 152 174 146 166 Z"/><circle class="o" ${fill('accent2')} cx="146" cy="163" r="5.5"/>`;
  }
  return out;
}

// ---------- wearables: glasses and hats ----------
function glasses(look) {
  if (!look.glasses || look.glasses === 'none') return '';
  const boy = look.face === 'boy';
  const y = boy ? 256 : 252, lx = boy ? 170 : 168, rx = boy ? 250 : 252;
  const sun = look.glasses === 'sun';
  const lens = sun ? 'fill="#2E2448" fill-opacity=".9"' : 'fill="#fff" fill-opacity=".18"';
  const shape = (cx) => sun
    ? `<path class="o" ${lens} style="stroke-width:4" d="M${cx - 37} ${y - 24} H${cx + 37} Q${cx + 39} ${y + 20} ${cx} ${y + 28} Q${cx - 39} ${y + 20} ${cx - 37} ${y - 24} Z"/>`
    : `<circle class="o" ${lens} style="stroke-width:4" cx="${cx}" cy="${y}" r="34"/>`;
  return `${shape(lx)}${shape(rx)}
    <path class="ln" stroke-width="4" d="M${lx + 34} ${y - 8} Q210 ${y - 18} ${rx - 34} ${y - 8} M${lx - 36} ${y - 12} L${lx - 56} ${y - 20} M${rx + 36} ${y - 12} L${rx + 56} ${y - 20}"/>
    <path class="ln" style="stroke:#fff" stroke-width="4" opacity="${sun ? 0.55 : 0.7}" d="M${lx - 20} ${y - 12} L${lx - 8} ${y - 18} M${rx - 20} ${y - 12} L${rx - 8} ${y - 18}"/>`;
}

function hat(look) {
  if (look.hat === 'straw') {
    return `<ellipse class="o" cx="210" cy="124" rx="168" ry="36" fill="#EBCB86"/>
      <path class="o" d="M136 122 C134 46 286 46 284 122 Z" fill="#F2D9A0"/>
      <path class="o" ${fill('accent2')} d="M137 104 Q210 92 283 104 L284 122 Q210 110 136 122 Z"/>
      <path class="ln" stroke-width="1.6" opacity=".35" d="M160 70 Q210 60 260 70 M150 90 Q210 80 270 90 M70 120 Q210 150 350 120"/>`;
  }
  if (look.hat === 'cap') {
    return `<path class="o" ${fill('accent2')} d="M118 156 C112 64 308 64 302 156 Z"/>
      <path class="ln" stroke-width="2" opacity=".35" d="M210 74 V154 M160 90 Q150 120 152 154 M260 90 Q270 120 268 154"/>
      <path class="o" fill="${INK}" fill-opacity=".18" d="M112 152 Q210 132 308 152 Q314 176 210 180 Q106 176 112 152 Z"/>
      <path class="o" ${fill('accent2')} d="M112 152 Q210 132 308 152 Q314 172 210 176 Q106 172 112 152 Z"/>
      <circle class="o" ${fill('accent2')} cx="210" cy="72" r="8"/>`;
  }
  if (look.hat === 'beanie') {
    return `<path class="o" ${fill('accent2')} d="M120 170 C112 58 308 58 300 170 Z"/>
      <path class="ln" stroke-width="2" opacity=".3" d="M160 84 Q150 120 152 160 M210 70 V160 M260 84 Q270 120 268 160"/>
      <path class="o" ${fill('accent2')} d="M112 166 Q210 142 308 166 L306 198 Q210 174 114 198 Z"/>
      <path d="M112 166 Q210 142 308 166 L306 198 Q210 174 114 198 Z" fill="${INK}" opacity=".12"/>
      <path class="ln" stroke-width="2" opacity=".35" d="M134 166 L134 192 M158 160 L158 186 M184 156 L184 182 M210 154 V180 M236 156 L236 182 M262 160 L262 186 M286 166 L286 192"/>
      <circle class="o" cx="210" cy="62" r="26" fill="#FBF7EF"/><path class="ln" stroke-width="2" opacity=".3" d="M196 56 Q210 48 224 56 M198 70 Q210 76 222 70"/>`;
  }
  if (look.hat === 'earmuffs') {
    return `<path d="M120 252 C110 84 310 84 300 252" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
      <path d="M120 252 C110 84 310 84 300 252" fill="none" style="stroke:${v('accent2')}" stroke-width="10" stroke-linecap="round"/>
      <circle class="o" cx="112" cy="262" r="34" fill="#FBF7EF"/><circle class="o" ${fill('accent2')} cx="112" cy="262" r="20"/>
      <circle class="o" cx="308" cy="262" r="34" fill="#FBF7EF"/><circle class="o" ${fill('accent2')} cx="308" cy="262" r="20"/>`;
  }
  return '';
}

// ---------- tops ----------
const TOPS = {
  hoodie: {
    body: [[160, 362], [185, 354], [210, 352], [235, 354], [260, 362], [269, 408], [279, 478], [289, 548], [250, 556], [210, 558], [170, 556], [131, 548], [141, 478], [151, 408]],
    sleeve: [[160, 362], [136, 372], [117, 400], [107, 445], [104, 492], [108, 520], [118, 538], [137, 543], [155, 538], [152, 500], [155, 440], [164, 402], [172, 380]],
    amp: 1.5,
    hem: [[130, 544], [170, 551], [210, 553], [250, 551], [290, 544], [292, 566], [250, 573], [210, 575], [170, 573], [128, 566]],
    shade: 'M236 360 C252 358 258 362 260 362 C270 420 280 490 288 548 Q262 554 242 556 C252 480 250 410 236 360 Z',
    folds: 'M158 420 Q170 452 165 500 M262 420 Q250 452 255 500 M172 536 Q178 544 174 552 M248 536 Q242 544 246 552 M196 470 Q204 476 212 474',
  },
  sweater: {
    body: [[156, 364], [183, 356], [210, 354], [237, 356], [264, 364], [270, 410], [274, 460], [276, 508], [210, 512], [144, 508], [146, 460], [150, 410]],
    sleeve: [[156, 364], [136, 374], [123, 404], [117, 450], [115, 498], [118, 522], [122, 538], [139, 542], [156, 538], [156, 498], [158, 450], [161, 412], [168, 386]],
    amp: 1.0,
    hem: [[142, 502], [176, 508], [210, 510], [244, 508], [278, 502], [279, 524], [244, 530], [210, 532], [176, 530], [141, 524]],
    shade: 'M238 360 C254 358 262 362 264 364 C270 410 276 460 276 506 L244 508 C250 450 250 400 238 360 Z',
    folds: 'M176 420 Q186 430 198 426 M226 452 Q236 460 248 456',
  },
  puffer: {
    body: [[156, 358], [183, 348], [210, 346], [237, 348], [264, 358], [276, 410], [284, 470], [290, 540], [250, 548], [210, 550], [170, 548], [130, 540], [136, 470], [144, 410]],
    sleeve: [[156, 362], [130, 372], [112, 404], [103, 450], [101, 496], [106, 522], [116, 538], [137, 544], [158, 538], [156, 498], [158, 446], [164, 404], [172, 382]],
    amp: 2.2,
    hem: [[132, 534], [170, 542], [210, 544], [250, 542], [288, 534], [290, 556], [250, 564], [210, 566], [170, 564], [130, 556]],
    shade: 'M238 356 C256 354 262 358 264 360 C276 420 284 480 290 538 Q262 546 244 548 C254 480 252 410 238 356 Z',
    folds: 'M142 412 Q210 426 278 412 M137 462 Q210 476 283 462 M133 510 Q210 524 287 510 M210 352 V542 M113 430 Q132 438 154 432 M108 480 Q130 488 156 482 M307 430 Q288 438 266 432 M312 480 Q290 488 264 482',
  },
  tee: {
    body: [[158, 364], [184, 356], [210, 354], [236, 356], [262, 364], [268, 420], [272, 470], [274, 520], [210, 524], [146, 520], [148, 470], [152, 420]],
    sleeve: [[158, 364], [138, 372], [124, 392], [117, 424], [148, 432], [153, 414], [162, 396]],
    amp: 0.8,
    hem: null,
    shade: 'M238 360 C254 358 260 362 262 364 C268 420 272 470 274 518 L246 520 C252 450 250 400 238 360 Z',
    folds: 'M180 440 Q190 448 200 444 M222 482 Q232 488 244 484',
  },
};

const CUFF_HAND = (look) => `
  <path class="o" ${fill('skin')} d="M123 562 C118 574 122 590 137 592 C152 592 157 576 152 562 Z"/>
  <path class="ln" stroke-width="1.6" opacity=".5" d="M128 568 Q126 578 131 584"/>`;

function sleeve(look, T, side) {
  const m = side > 0 ? (d) => d : mirror;
  const pts = side > 0 ? T.sleeve : mirrorPts(T.sleeve);
  if (look.top === 'tee') {
    return `
    <path class="o" ${fill('skin')} d="${m('M119 420 C113 462 114 520 121 564 L153 564 C151 520 150 470 150 426 Z')}"/>
    <path class="ln" stroke-width="1.4" opacity=".3" d="${m('M126 492 Q134 496 142 492')}"/>
    ${side > 0 ? CUFF_HAND(look) : `<g transform="translate(420 0) scale(-1 1)">${CUFF_HAND(look)}</g>`}
    <path class="o" ${fill('top')} d="${wavy(pts, { amp: T.amp, seed: side > 0 ? 2 : 5 })}"/>
    <path class="ln" stroke-width="1.5" opacity=".4" d="${m('M126 414 Q136 420 146 418')}"/>`;
  }
  return `
    ${side > 0 ? CUFF_HAND(look) : `<g transform="translate(420 0) scale(-1 1)">${CUFF_HAND(look)}</g>`}
    <path class="o" ${fill('top')} d="${wavy(pts, { amp: T.amp, seed: side > 0 ? 2 : 5 })}"/>
    <path class="ln" stroke-width="1.6" opacity=".45" d="${m('M113 468 Q123 476 133 470 M112 486 Q124 496 137 488 M124 527 L127 538 M136 526 L137 540 M148 527 L146 538')}"/>
    <path d="${m('M150 400 C146 440 145 490 151 536 L139 541 C141 490 141 440 150 400 Z')}" fill="${INK}" opacity=".07"/>
    <path class="o" ${fill('top')} d="${m('M119 536 Q137 531 156 536 L154 563 Q137 568 121 563 Z')}"/>
    <path class="ln" stroke-width="1.4" opacity=".45" d="${m('M126 538 L127 562 M133 537 L133 564 M140 537 L140 565 M147 537 L147 564')}"/>`;
}

const COLLARS = {
  sailor: () => `<path class="o" ${fill('accent')} d="M184 354 L210 380 L236 354 L258 366 L210 402 L162 366 Z"/>`,
  hood: (look) => `<path class="o" ${fill('topShade')} d="M160 368 C156 338 186 324 210 334 C234 324 264 338 260 368 C248 360 234 356 224 358 L210 380 L196 358 C186 356 172 360 160 368 Z"/>
    <path class="ln" stroke-width="1.6" opacity=".4" d="M176 350 Q192 340 204 344 M244 350 Q228 340 216 344"/>
    ${look.neck === 'none' ? `<path class="ln" style="stroke:${v('accent2')}" stroke-width="3.5" d="M201 372 Q198 398 197 424 M219 372 Q222 398 223 424"/>
    <rect class="o" style="fill:${v('accent2')};stroke-width:1.6" x="193" y="422" width="8" height="12" rx="3"/>
    <rect class="o" style="fill:${v('accent2')};stroke-width:1.6" x="219" y="422" width="8" height="12" rx="3"/>` : ''}`,
  funnel: () => `<path class="o" ${fill('top')} d="M174 354 Q210 338 246 354 L250 378 Q210 392 170 378 Z"/>
    <path class="ln" stroke-width="1.6" opacity=".4" d="M176 366 Q210 378 244 366 M210 360 V388"/>`,
  round: () => `<path class="o" ${fill('top')} d="M180 354 Q210 382 240 354 L247 362 Q210 394 173 362 Z"/>
    <path class="ln" stroke-width="1.4" opacity=".45" d="M184 360 L180 366 M194 366 L191 373 M205 369 L204 377 M216 369 L216 377 M227 366 L229 373 M237 360 L241 366"/>`,
};
const NECK_Y = { sailor: 398, hood: 380, round: 380, funnel: 390 };
const NECKS = {
  bow: (y) => `<path class="o" ${fill('accent2')} d="M210 ${y} C196 ${y - 16} 174 ${y - 14} 176 ${y + 2} C178 ${y + 18} 198 ${y + 16} 210 ${y + 6} Z"/>
    <path class="o" ${fill('accent2')} d="M210 ${y} C224 ${y - 16} 246 ${y - 14} 244 ${y + 2} C242 ${y + 18} 222 ${y + 16} 210 ${y + 6} Z"/>
    <path class="o" ${fill('accent2')} d="M205 ${y + 8} L194 ${y + 48} L203 ${y + 43} L209 ${y + 10} Z"/>
    <path class="o" ${fill('accent2')} d="M215 ${y + 8} L226 ${y + 48} L217 ${y + 43} L211 ${y + 10} Z"/>
    <circle class="o" ${fill('accent2')} cx="210" cy="${y + 3}" r="7"/>`,
  tie: (y) => `<path class="o" ${fill('accent2')} d="M202 ${y - 6} L218 ${y - 6} L215 ${y + 8} L205 ${y + 8} Z"/>
    <path class="o" ${fill('accent2')} d="M205 ${y + 8} L215 ${y + 8} L222 ${y + 66} L210 ${y + 80} L198 ${y + 66} Z"/>
    <path class="ln" stroke-width="1.5" opacity=".4" d="M204 ${y + 26} L216 ${y + 20} M202 ${y + 46} L219 ${y + 38}"/>`,
  ribbon: (y) => `<path class="o" ${fill('accent2')} d="M207 ${y + 2} L192 ${y + 72} L199 ${y + 74} L210 ${y + 8} Z"/>
    <path class="o" ${fill('accent2')} d="M213 ${y + 2} L228 ${y + 72} L221 ${y + 74} L210 ${y + 8} Z"/>
    <path class="ln" stroke-width="1.5" opacity=".5" d="M192 ${y + 72} L190 ${y + 80} M196 ${y + 73} L195 ${y + 81} M228 ${y + 72} L230 ${y + 80} M224 ${y + 73} L225 ${y + 81}"/>
    <ellipse class="o" ${fill('accent2')} cx="210" cy="${y + 3}" rx="10" ry="7"/>`,
  scarf: () => `<path class="o" ${fill('accent2')} d="M222 384 L240 474 L214 478 L203 394 Z"/>
    <path d="M226 410 L208 414 M231 434 L212 438 M235 456 L214 460" stroke="#fff" stroke-width="5" opacity=".55"/>
    <path class="ln" stroke-width="2" d="M216 478 L214 490 M224 477 L223 489 M232 476 L233 488"/>
    <path class="o" ${fill('accent2')} d="M170 356 Q210 386 250 356 L254 382 Q210 414 166 382 Z"/>
    <path d="M178 372 Q210 394 242 372" stroke="#fff" stroke-width="5" opacity=".5" fill="none"/>`,
  none: () => '',
};

function top(look) {
  const T = TOPS[look.top];
  const collar = look.top === 'tee' ? 'round' : look.top === 'puffer' ? 'funnel' : look.collar;
  return `
    <path class="o" ${fill('top')} d="${wavy(T.body, { amp: T.amp, seed: 3 })}"/>
    <path d="${T.shade}" fill="${INK}" opacity=".08"/>
    <path class="ln" stroke-width="1.6" opacity=".42" d="${T.folds}"/>
    ${T.hem ? `<path class="o" ${fill('top')} d="${wavy(T.hem, { amp: 0.8, seed: 7 })}"/>
    <path class="ln" stroke-width="1.4" opacity=".45" d="${ribLines(T.hem)}"/>` : ''}
    ${COLLARS[collar](look)}
    ${NECKS[look.neck](NECK_Y[collar])}
    ${look.badge ? `<path class="o" fill="#FBF6EC" d="M238 452 L240 436 L249 445 L257 445 L266 436 L268 452 C272 464 264 476 253 476 C242 476 234 464 238 452 Z"/>
      <circle cx="247" cy="458" r="2.3" fill="${INK}"/><circle cx="259" cy="458" r="2.3" fill="${INK}"/>
      <path class="ln" stroke-width="1.6" d="M250 465 Q253 468 256 465"/>` : ''}
    ${sleeve(look, T, 1)}
    ${sleeve(look, T, -1)}`;
}

function ribLines(hem) {
  const x0 = hem[0][0] + 14, x1 = hem[4][0] - 14, yTop = hem[2][1] - 2, yBot = hem[7][1] - 3;
  let d = '';
  for (let x = x0; x <= x1; x += 18) d += `M${x} ${yTop - Math.abs(x - 210) * 0.05} L${x} ${yBot - Math.abs(x - 210) * 0.05} `;
  return d;
}

// ---------- bottoms, legs, socks, shoes ----------
function legs(look) {
  let out = `
    <path class="o" ${fill('skin')} d="M154 560 L190 560 L193 762 L151 762 Z"/>
    <path class="o" ${fill('skin')} d="M230 560 L266 560 L269 762 L227 762 Z"/>
    <path class="ln" stroke-width="1.4" opacity=".35" d="M154 650 Q172 656 190 650 M230 650 Q248 656 266 650"/>`;
  if (look.socks === 'knee') {
    out += `<path class="o" ${fill('socks')} d="M150 688 L194 688 L198 760 L146 760 Z"/><path class="o" ${fill('socks')} d="M226 688 L270 688 L274 760 L222 760 Z"/>
      <path class="ln" stroke-width="1.6" opacity=".5" d="M148 702 Q172 712 196 702 M224 702 Q248 712 272 702"/>`;
  } else if (look.socks === 'ankle') {
    out += `<path class="o" ${fill('socks')} d="M150 726 L194 726 L197 760 L147 760 Z"/><path class="o" ${fill('socks')} d="M226 726 L270 726 L273 760 L223 760 Z"/>
      <path class="ln" stroke-width="1.6" opacity=".5" d="M150 736 Q172 742 194 736 M226 736 Q248 742 270 736"/>`;
  }
  return out;
}

function shoes(look) {
  if (look.shoes === 'sneakers') {
    return `<path class="o" ${fill('shoes')} d="M138 802 C134 776 150 760 172 762 C194 764 206 782 205 802 Z"/>
      <path class="o" ${fill('shoes')} d="M215 802 C214 782 226 764 248 762 C270 760 286 776 282 802 Z"/>
      <path class="ln" stroke-width="3" style="stroke:${v('shoesLine')}" d="M139 792 L205 792 M215 792 L281 792"/>
      <path class="ln" stroke-width="1.6" opacity=".5" d="M166 770 L178 774 M164 778 L178 782 M254 770 L242 774 M256 778 L242 782"/>`;
  }
  return `<path class="o" ${fill('shoes')} d="M136 802 C130 772 146 752 172 752 C196 752 206 772 204 802 Z"/>
    <path class="o" ${fill('shoes')} d="M216 802 C214 772 224 752 248 752 C274 752 290 772 284 802 Z"/>
    <path class="ln" style="stroke:#fff" stroke-width="3.5" opacity=".55" d="M150 772 Q160 762 174 764 M232 768 Q244 760 258 764"/>`;
}

function bottom(look) {
  if (look.bottom === 'skirt') {
    return `<path class="o" ${fill('bottom')} d="M146 534 L274 534 L302 642 Q210 658 118 642 Z"/>
      <path class="ln" stroke-width="1.6" opacity=".45" d="M170 540 L150 646 M190 540 L182 650 M210 540 L210 652 M230 540 L238 650 M250 540 L270 646"/>
      <path class="ln" style="stroke:${v('bottomDark')}" stroke-width="3.5" d="M122 636 Q210 652 298 636"/>`;
  }
  if (look.bottom === 'widePants') {
    return `<path class="o" ${fill('bottom')} d="M150 520 L270 520 C276 600 292 690 306 774 Q262 782 216 774 L212 580 L208 774 Q158 782 114 774 C128 690 144 600 150 520 Z"/>
      <path d="M238 530 L270 520 C276 600 292 690 306 774 Q280 778 258 776 C256 680 246 600 238 530 Z" fill="${INK}" opacity=".08"/>
      <path class="ln" stroke-width="1.6" opacity=".4" d="M178 560 Q172 650 160 762 M244 560 Q250 650 262 762"/>`;
  }
  return `<path class="o" ${fill('bottom')} d="M142 548 L278 548 L284 612 Q248 618 214 612 L210 592 L206 612 Q172 618 136 612 Z"/>
    <path class="ln" style="stroke:${v('bottomDark')}" stroke-width="4" d="M138 606 Q172 612 206 606 M214 606 Q248 612 282 606"/>`;
}

// ---------- full character ----------
let uidCounter = 0;
export function render(look, { className = '' } = {}) {
  const uid = 'av' + (++uidCounter);
  const vars = {
    skin: look.skin, hair: look.hair, hairShade: darker(look.hair, 0.16),
    iris: look.eyes, irisDark: darker(look.eyes, 0.5), irisLight: lighter(look.eyes, 0.6),
    top: look.topColor, topShade: darker(look.topColor, 0.1), accent: look.collarColor, accent2: look.neckColor,
    bottom: look.bottomColor, bottomDark: darker(look.bottomColor, 0.3), socks: look.socksColor,
    shoes: look.shoesColor, shoesLine: darker(look.shoesColor, 0.25),
  };
  const style = Object.entries(vars).map(([k, val]) => `--${k}:${val}`).join(';');
  const wide = look.bottom === 'widePants';
  return `<svg class="avatar ${className}" viewBox="0 0 420 820" style="${style}" role="img" aria-label="Your character">
  <defs>
    <linearGradient id="${uid}-iris" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color:${v('irisDark')}"/><stop offset=".55" style="stop-color:${v('iris')}"/><stop offset="1" style="stop-color:${v('irisLight')}"/>
    </linearGradient>
    <radialGradient id="${uid}-blush"><stop offset="0" stop-color="#FF9A86" stop-opacity=".55"/><stop offset="1" stop-color="#FF9A86" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="210" cy="804" rx="110" ry="12" fill="${INK}" opacity=".12"/>
  <g class="headBack">${hairBack(look)}</g>
  <g class="body">
    ${wide ? '' : legs(look)}
    ${shoes(look)}
    ${bottom(look)}
    <path class="o" ${fill('skin')} d="M199 322 L221 322 L223 362 L197 362 Z"/>
    <path d="M199 328 Q210 340 221 328 L222 342 Q210 350 198 342 Z" fill="${INK}" opacity=".12"/>
    ${top(look)}
  </g>
  <g class="head">
    ${face(look, uid)}
    ${hairFront(look)}
    ${glasses(look)}
    ${hat(look)}
  </g>
</svg>`;
}

// ---------- idle animation: breathing, head tilt, blinking; call happy() on tap ----------
export function animate(getSvg, { pivot = [210, 330], hop: hopH = 30 } = {}) {
  const st = { hop: -10, nextBlink: 1.5, blinkEnd: 0, alive: true };
  function tick() {
    if (!st.alive) return;
    const svg = getSvg();
    if (svg) {
      const t = performance.now() / 1000;
      const h = t - st.hop;
      const hop = h >= 0 && h < 0.6 ? -Math.sin((h / 0.6) * Math.PI) * hopH : 0;
      const breathe = Math.sin(t * 2) * 1.5;
      const headT = `translate(0 ${(hop + breathe).toFixed(2)}) rotate(${(Math.sin(t * 0.8) * 2.5).toFixed(2)} ${pivot[0]} ${pivot[1]})`;
      svg.querySelector('.body')?.setAttribute('transform', `translate(0 ${(hop + breathe * 0.3).toFixed(2)})`);
      svg.querySelector('.head')?.setAttribute('transform', headT);
      svg.querySelector('.headBack')?.setAttribute('transform', headT);
      if (t > st.nextBlink) { st.blinkEnd = t + 0.14; st.nextBlink = t + 2.4 + Math.random() * 3; }
      svg.classList.toggle('happy', t < st.blinkEnd || (h >= 0 && h < 1.3));
    }
    requestAnimationFrame(tick);
  }
  tick();
  return { happy: () => { st.hop = performance.now() / 1000; }, stop: () => { st.alive = false; } };
}
