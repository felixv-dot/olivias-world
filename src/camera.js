// 📷 Take a photo of the place you're in: the background and every item are stitched into one SVG,
// drawn onto a canvas and saved (small JPEG) into the album.
import { addPhoto, PHOTO_LIMIT } from './economy.js';
import { state } from './state.js';
import { sfx } from './sfx.js';

const OUT_W = 720, OUT_H = 405; // saved photo size (16:9)
let cssCache = null;

// The game's own stylesheet rules, so class-styled lines and fills look right inside the photo.
function pageCss() {
  if (cssCache !== null) return cssCache;
  let css = '';
  for (const sheet of document.styleSheets) {
    try { for (const r of sheet.cssRules) if (!(r instanceof CSSKeyframesRule) && !(r instanceof CSSFontFaceRule)) css += r.cssText + '\n'; } catch { /* other-origin sheet (fonts) */ }
  }
  // Freeze animations: the photo is a still moment.
  cssCache = css.replace(/animation[^;{}]*;/g, '') + '\n*{animation:none!important;transition:none!important}';
  return cssCache;
}

const esc = (s) => s.replace(/]]>/g, ']]&gt;');

function compose({ bg, items, W, H, viewX }) {
  const x0 = W > 1600 ? Math.max(0, Math.min(W - 1600, viewX)) : 0;
  const list = [...items.values()].filter((it) => it.el?.isConnected && it.el.style.display !== 'none').sort((a, b) => (a.z || 0) - (b.z || 0));
  const parts = list.map((it) => {
    const inner = it.el.innerHTML;
    if (!inner.includes('<svg')) return '';
    const flip = getComputedStyle(it.el).transform;
    const mirrored = flip && flip.startsWith('matrix(-1');
    const t = mirrored ? ` transform="translate(${it.x * 2 + it.w} 0) scale(-1 1)"` : '';
    return `<g${t}><svg x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" overflow="visible">${inner}</svg></g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1600" height="${H}" viewBox="${x0} 0 1600 ${H}">
    <style><![CDATA[${esc(pageCss())}]]></style>
    <rect x="${x0}" width="1600" height="${H}" fill="#EFE9FF"/>
    ${bg.innerHTML}${parts}</svg>`;
}

function rasterize(svgText) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' }));
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = OUT_W; c.height = OUT_H;
      const g = c.getContext('2d');
      g.fillStyle = '#EFE9FF'; g.fillRect(0, 0, OUT_W, OUT_H);
      g.drawImage(img, 0, 0, OUT_W, OUT_H);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

export async function takePhoto(api, def, env) {
  const flash = document.createElement('div');
  flash.className = 'cam-flash';
  env.flashIn.append(flash);
  setTimeout(() => flash.remove(), 600);
  sfx.click?.();
  try {
    const src = await rasterize(compose({ ...env, viewX: env.view() - 800 }));
    const full = state.photos?.length >= PHOTO_LIMIT;
    addPhoto(src, def.title);
    api.bubble(env.view(), 170, full ? 'Photo saved! (your oldest photo made room) 📖' : 'Photo saved in your album! 📖');
    return src;
  } catch (e) {
    console.warn('photo failed', e);
    api.bubble(env.view(), 170, "Oops, the camera didn't work 📷");
    return null;
  }
}

// For tests: the raw SVG of the current scene.
export const _compose = compose;
