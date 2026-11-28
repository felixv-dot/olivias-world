// 🛋️ Decorate your own room: place furniture you bought, put things away, switch wallpaper and floor.
import { state, save } from './state.js';
import { el } from './ui.js';
import { isoDef } from './iso.js';
import { FURNITURE, WALLPAPERS, FLOORS, thumb } from './catalog.js';
import { spare } from './economy.js';

const byId = (id) => FURNITURE.find((f) => f.id === id);
export const currentWall = () => WALLPAPERS.find((w) => w.id === state.home?.wall) || WALLPAPERS[0];
export const currentFloor = () => FLOORS.find((f) => f.id === state.home?.floor) || FLOORS[0];

let putAwayMode = false;

// The item definition for one placed piece of furniture.
function homeDef(p) {
  const c = byId(p.id);
  if (!c) return null;
  return isoDef('h-' + p.uid, p.gx, p.gy, c.fw, c.fd, (it) => c.art(it), {
    data: { ...(c.data || {}) }, surface: c.surface, small: c.small, floor: c.floor, gz: p.gz || 0, cls: 'home-item',
    onTap: (it, api) => { if (putAwayMode && document.querySelector('.decor-panel')) return putAway(it, api); c.onTap?.(it, api); },
  });
}

// Room init: add everything the player has placed (their saved positions are applied by the engine).
export function addHomeItems(api) {
  for (const p of state.home?.placed || []) { const d = homeDef(p); if (d) api.add(d); }
}

// A free spot for a new piece: scan the floor from the middle outwards for a footprint that overlaps nothing.
function freeSpot(api, R, c) {
  const solid = [...api.items.values()].filter((i) => i.iso && !i.def.floor && !i.def.star && !(i.gz > 0));
  const pad = 0.3; // leave a little room around things
  const hits = (gx, gy) => solid.some((o) => gx < o.gx + o.fw + pad && gx + c.fw + pad > o.gx && gy < o.gy + o.fd + pad && gy + c.fd + pad > o.gy);
  const cands = [];
  for (let gx = 0; gx <= R.cols - c.fw; gx += 0.5) for (let gy = 0; gy <= R.rows - c.fd; gy += 0.5) cands.push([gx, gy]);
  const mx = (R.cols - c.fw) / 2, my = (R.rows - c.fd) / 2;
  cands.sort((a, b) => Math.hypot(a[0] - mx, a[1] - my) - Math.hypot(b[0] - mx, b[1] - my));
  return cands.find(([gx, gy]) => c.floor || !hits(gx, gy)) || [mx, my];
}

function place(api, R, posKey, id) {
  const c = byId(id);
  if (!c || spare(id) <= 0) return null;
  const [gx, gy] = freeSpot(api, R, c);
  const p = { uid: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), id, gx, gy };
  state.home.placed.push(p);
  (state.pos[posKey] ||= {})['h-' + p.uid] = [gx, gy, 0];
  save();
  const it = api.add(homeDef(p));
  it.el.classList.add('pop');
  api.sfx.pop();
  api.sparkle(it.x + it.w / 2, it.y + it.h / 2);
  return it;
}

let refreshPanel = null;
function putAway(it, api) {
  const uid = it.id.slice(2);
  // things standing on top of it fall to the floor
  for (const o of api.items.values()) if (o.on === it) { o.on = null; o.gz = 0; api.place(o); }
  api.remove(it);
  state.home.placed = state.home.placed.filter((p) => p.uid !== uid);
  for (const k of Object.keys(state.pos)) delete state.pos[k][it.id];
  save();
  api.sfx.click();
  api.bubble(it.x + it.w / 2, it.y, 'Put away 📦');
  refreshPanel?.();
}

// The Decorate panel (a drawer at the bottom of the room).
export function decorateTool(R, posKey) {
  return {
    label: '🛋️ Decorate', param: 'decorate',
    onClick: (api, { root, ctx }) => {
      if (root.querySelector('.decor-panel')) return;
      const panel = el('div', 'decor-panel');
      const head = el('div', 'decor-head');
      const tabs = el('div', 'decor-tabs');
      const list = el('div', 'decor-list');
      const hint = el('div', 'decor-hint');
      const away = el('button', 'chip', '📦 Put away');
      const shop = el('button', 'btn small alt', '🛍️ Shop');
      const done = el('button', 'btn small', 'Done ✓');
      head.append(el('b', '', 'Decorate'), tabs, el('div', 'grow'), away, shop, done);
      panel.append(head, list, hint);
      root.append(panel);
      // shrink the room so it sits above the panel
      const wrapEl = root.querySelector('.scene-wrap');
      const fitRoom = () => { if (wrapEl && panel.isConnected) wrapEl.style.marginBottom = panel.offsetHeight + 'px'; };
      requestAnimationFrame(fitRoom);
      new ResizeObserver(fitRoom).observe(panel);
      let tab = 'things';
      const setAway = (on) => { putAwayMode = on; away.classList.toggle('on', on); root.classList.toggle('putting-away', on); draw(); };
      away.onclick = () => setAway(!putAwayMode);
      shop.onclick = () => { putAwayMode = false; ctx.go('shop', { back: ['scene', { id: 'home', decorate: true }] }); };
      done.onclick = () => { setAway(false); panel.remove(); refreshPanel = null; if (wrapEl) wrapEl.style.marginBottom = ''; };

      function drawTabs() {
        tabs.innerHTML = '';
        for (const [id, label] of [['things', '🧸 My things'], ['walls', '🧱 Walls'], ['floors', '🟫 Floors']]) {
          const b = el('button', 'chip' + (tab === id ? ' on' : ''), label);
          b.onclick = () => { tab = id; drawTabs(); draw(); };
          tabs.append(b);
        }
      }
      function card(svg, name, sub, on, onTap) {
        const c = el('button', 'decor-card' + (on ? ' on' : ''), `<div class="decor-thumb">${svg}</div><div class="decor-name">${name}</div>${sub ? `<div class="decor-sub">${sub}</div>` : ''}`);
        c.onclick = onTap;
        list.append(c);
      }
      function draw() {
        list.innerHTML = '';
        if (putAwayMode) { hint.textContent = 'Tap something you placed to put it back in your box. Tap 📦 again when you are done.'; }
        else hint.textContent = tab === 'things' ? 'Tap a thing to put it in your room, then drag it where you like.' : 'Tap to change your room.';
        if (tab === 'things') {
          const mine = FURNITURE.filter((f) => spare(f.id) > 0);
          if (!mine.length) { list.append(el('div', 'decor-empty', 'Your box is empty. Buy furniture in the 🛍️ Shop with your coins!')); return; }
          for (const f of mine) card(thumb('furniture', f), f.name, `×${spare(f.id)}`, false, () => { if (putAwayMode) setAway(false); place(api, R, posKey, f.id); draw(); });
        } else if (tab === 'walls') {
          for (const w of WALLPAPERS.filter((x) => state.walls.includes(x.id))) card(thumb('wallpaper', w), w.name, '', state.home.wall === w.id, () => { state.home.wall = w.id; save(); api.redrawBg(); api.sfx.click(); draw(); });
          card('<div class="decor-more">＋</div>', 'More walls', 'in the shop', false, () => ctx.go('shop', { back: ['scene', { id: 'home', decorate: true }], tab: 'wallpaper' }));
        } else {
          for (const f of FLOORS.filter((x) => state.floors.includes(x.id))) card(thumb('floor', f), f.name, '', state.home.floor === f.id, () => { state.home.floor = f.id; save(); api.redrawBg(); api.sfx.click(); draw(); });
          card('<div class="decor-more">＋</div>', 'More floors', 'in the shop', false, () => ctx.go('shop', { back: ['scene', { id: 'home', decorate: true }], tab: 'floor' }));
        }
      }
      refreshPanel = draw;
      drawTabs();
      draw();
    },
  };
}
