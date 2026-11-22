// Isometric (2:1) drawing kit for "dollhouse from above" rooms, Unpacking-style.
// Floor grid: gx runs along the right back wall, gy along the left back wall. One tile = 128×64 px.
export const TW = 128, TH = 64;
const HW = TW / 2, HH = TH / 2;
const LINE = 'stroke="#3E3252" stroke-opacity=".55" stroke-width="1.6" stroke-linejoin="round"';

export function room({ cols, rows, ox, oy, wallH }) {
  return { cols, rows, ox, oy, wallH };
}
export const proj = (r, gx, gy, gz = 0) => [r.ox + (gx - gy) * HW, r.oy + (gx + gy) * HH - gz];
export const unproj = (r, sx, sy) => {
  const a = (sx - r.ox) / HW, b = (sy - r.oy) / HH;
  return [(a + b) / 2, (b - a) / 2];
};

const pts = (arr) => arr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

// One box part inside an item. u,v = offset on the item's footprint (tiles), z = height above floor (px).
function boxPart(p) {
  const { u = 0, v = 0, z = 0, w, d, h, top, left, right, topDecor = '', leftDecor = '', rightDecor = '', round = false, line = true } = p;
  const bx = (u - v) * HW, by = (u + v) * HH - z; // back-bottom corner (relative to item back corner)
  const B = [bx, by], R = [bx + w * HW, by + w * HH], F = [bx + (w - d) * HW, by + (w + d) * HH], L = [bx - d * HW, by + d * HH];
  const up = ([x, y]) => [x, y - h];
  const ln = line ? LINE : '';
  let s = '';
  if (h > 0) {
    s += `<polygon points="${pts([L, F, up(F), up(L)])}" fill="${left}" ${ln}/>`;
    if (leftDecor) s += `<g transform="matrix(1,0.5,0,1,${L[0]},${L[1] - h})">${leftDecor}</g>`;
    s += `<polygon points="${pts([F, R, up(R), up(F)])}" fill="${right}" ${ln}/>`;
    if (rightDecor) s += `<g transform="matrix(1,-0.5,0,1,${F[0]},${F[1] - h})">${rightDecor}</g>`;
  }
  if (round) {
    const c = [(B[0] + F[0]) / 2, (B[1] + F[1]) / 2 - h];
    s += `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${(w + d) * HW / 2}" ry="${(w + d) * HH / 2}" fill="${top}" ${ln}/>`;
  } else {
    s += `<polygon points="${pts([up(B), up(R), up(F), up(L)])}" fill="${top}" ${ln}/>`;
  }
  if (topDecor) s += `<g transform="matrix(${HW},${HH},${-HW},${HH},${B[0]},${B[1] - h})">${topDecor}</g>`;
  return s;
}

// A piece of furniture made of box parts. Returns sizes and the anchor (where its back floor corner sits).
// `extra(x0, y0)` can add free-form SVG drawn relative to the back floor corner.
export function isoItem(fw, fd, height, parts, extra = '') {
  const w = (fw + fd) * HW, h = height + (fw + fd) * HH;
  const ax = fd * HW, ay = height;
  const sorted = [...parts].sort((a, b) => ((a.u || 0) + (a.v || 0) + (a.w + a.d) / 2) - ((b.u || 0) + (b.v || 0) + (b.w + b.d) / 2) || (a.z || 0) - (b.z || 0));
  const body = sorted.map((p) => (p.svg ? p.svg : boxPart(p))).join('');
  return {
    w, h, ax, ay,
    svg: `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" overflow="visible"><g transform="translate(${ax} ${ay})">${body}${typeof extra === 'function' ? extra() : extra}</g></svg>`,
  };
}

// Screen position of a point on an item's footprint (relative to its back floor corner).
export const at = (u, v, z = 0) => [(u - v) * HW, (u + v) * HH - z];

// Shade helpers: one base colour → top / left / right faces lit from the front-left.
export function shades(hex, k = 1) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (t) => {
    const c = (s) => {
      const v = (n >> s) & 255;
      return Math.round(t >= 0 ? v + (255 - v) * t : v * (1 + t));
    };
    return '#' + ((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1);
  };
  return { top: mix(0.12 * k), left: hex, right: mix(-0.14 * k) };
}

// The room shell: floor diamond, two back walls with baseboards. Patterns are given as SVG <pattern> ids.
export function roomShell(r, { floor, floorLines, wallL, wallR, base = '#FBF7EF', floorPattern = '', wallPatternL = '', wallPatternR = '', backdrop }) {
  const B = proj(r, 0, 0), Rr = proj(r, r.cols, 0), F = proj(r, r.cols, r.rows), Ll = proj(r, 0, r.rows);
  const up = ([x, y], hh = r.wallH) => [x, y - hh];
  const T = 16; // wall thickness drawn on the cut edges
  let lines = '';
  for (let i = 1; i < r.cols; i++) { const a = proj(r, i, 0), b = proj(r, i, r.rows); lines += `M${a[0]} ${a[1]} L${b[0]} ${b[1]} `; }
  const planks = floorLines === 'planks'
    ? Array.from({ length: r.cols * 3 - 1 }, (_, i) => { const g = (i + 1) / 3; const a = proj(r, g, 0), b = proj(r, g, r.rows); return `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`; }).join(' ')
      + ' ' + Array.from({ length: 40 }, (_, i) => { const g = ((i * 7) % (r.cols * 3)) / 3, v = ((i * 13) % (r.rows * 2)) / 2; const a = proj(r, g, v), b = proj(r, g + 1 / 3, v); return `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`; }).join(' ')
    : lines + Array.from({ length: r.rows - 1 }, (_, j) => { const a = proj(r, 0, j + 1), b = proj(r, r.cols, j + 1); return `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`; }).join(' ');
  return `
    ${backdrop || ''}
    <polygon points="${pts([up(Ll), up(B), [up(B)[0], up(B)[1] - T * 0.5], [up(Ll)[0] - T, up(Ll)[1] - T * 0.5 + T * 0.5]])}" fill="#FBF7EF" ${LINE}/>
    <polygon points="${pts([Ll, B, up(B), up(Ll)])}" fill="${wallL}" ${LINE}/>
    ${wallPatternL ? `<polygon points="${pts([Ll, B, up(B), up(Ll)])}" fill="url(#${wallPatternL})"/>` : ''}
    <polygon points="${pts([B, Rr, up(Rr), up(B)])}" fill="${wallR}" ${LINE}/>
    ${wallPatternR ? `<polygon points="${pts([B, Rr, up(Rr), up(B)])}" fill="url(#${wallPatternR})"/>` : ''}
    <polygon points="${pts([up(Ll), up(B), up(Rr), [up(Rr)[0] + T, up(Rr)[1] - T * 0.5], [up(B)[0], up(B)[1] - T], [up(Ll)[0] - T, up(Ll)[1] - T * 0.5]])}" fill="#FBF7EF" ${LINE}/>
    <polygon points="${pts([Ll, [Ll[0] - T, Ll[1] - T * 0.5], [Ll[0] - T, up(Ll)[1] - T * 0.5], up(Ll)])}" fill="#E8DFF2" ${LINE}/>
    <polygon points="${pts([Rr, [Rr[0] + T, Rr[1] - T * 0.5], [Rr[0] + T, up(Rr)[1] - T * 0.5], up(Rr)])}" fill="#D9CDEA" ${LINE}/>
    <polygon points="${pts([B, Rr, F, Ll])}" fill="${floor}" ${LINE}/>
    ${floorPattern ? `<polygon points="${pts([B, Rr, F, Ll])}" fill="url(#${floorPattern})"/>` : ''}
    <path d="${planks}" stroke="#000" stroke-opacity=".07" stroke-width="2"/>
    <polygon points="${pts([Ll, B, [B[0], B[1] - 18], [Ll[0], Ll[1] - 18]])}" fill="${base}" ${LINE}/>
    <polygon points="${pts([B, Rr, [Rr[0], Rr[1] - 18], [B[0], B[1] - 18]])}" fill="${base}" ${LINE} style="filter:brightness(.94)"/>
    <polygon points="${pts([Ll, B, Rr, proj(r, r.cols, 0.6), proj(r, 0.6, 0.6), proj(r, 0.6, r.rows)])}" fill="#3E3252" opacity=".07"/>
    <polygon points="${pts([Ll, F, Rr, [Rr[0] + T, Rr[1] - T * 0.5 + T * 0.5], [F[0], F[1] + T], [Ll[0] - T, Ll[1] - T * 0.5 + T * 0.5]])}" fill="#E9E0F3" ${LINE}/>`;
}

// Something flat on a back wall (frame, window, poster). side 'L' (left wall, t along gy) or 'R' (right wall, t along gx).
// t0 = start along the wall (tiles), up = height of the TOP edge above the floor (px), wTiles = width in tiles, hPx = height.
export function wallSpot(r, side, t0, up, wTiles, hPx) {
  const len = wTiles * HW;
  if (side === 'L') {
    // left wall: content x runs from the front end (t0 + wTiles) towards the back corner.
    const [sx, sy] = proj(r, 0, t0 + wTiles, up);
    return { x: sx, y: sy - len * 0.5, w: len, h: hPx + len * 0.5, matrix: `matrix(1,-0.5,0,1,0,${len * 0.5})`, len };
  }
  const [sx, sy] = proj(r, t0, 0, up);
  return { x: sx, y: sy, w: len, h: hPx + len * 0.5, matrix: 'matrix(1,0.5,0,1,0,0)', len };
}
export function wallArt(spot, body) {
  return `<svg viewBox="0 0 ${spot.w} ${spot.h}" width="100%" height="100%" overflow="visible"><g transform="${spot.matrix}">${body}</g></svg>`;
}
