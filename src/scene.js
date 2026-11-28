// Scene engine: a 1600×900 "dollhouse box" scaled to the screen.
// Items can be dragged, tapped and dropped onto each other or onto characters.
// Characters can be fed and can wear things; positions are remembered; hidden stars can be found;
// the weather is shared across the planet; mini-games open in a popup.
import { render, animate } from './avatar.js';
import { state, session, save, activeChar, getChar, putChar, companions } from './state.js';
import { renderPet, PET_ANIM } from './pets.js';
import { proj, unproj } from './iso.js';
import { el, topBar, rainLayer, snowLayer, refreshStars, CLIMATES, rotateHint } from './ui.js';
import { sfx } from './sfx.js';
import { earn, stampPlace, befriend, feedReward } from './economy.js';
import { takePhoto } from './camera.js';

const H = 900;

export function sceneScreen(app, ctx, def) {
  const W = def.width || 1600; // wide scenes (maps, fun fair…) scroll left and right
  const climate = def.weather === true ? CLIMATES.sunny : def.weather || null;
  const wkey = climate?.key || 'weather';
  const root = el('div', 'screen scene-screen');
  root.append(topBar({
    title: def.title,
    backLabel: def.backLabel || 'Map',
    onBack: () => (def.back ? ctx.go(...def.back) : ctx.go('scene', { id: 'sunny' })),
    onWeather: climate ? () => onWeather() : null,
    climate: climate || undefined,
    onChars: () => ctx.go('roster', { back: ['scene', { id: def.id }] }),
    onShop: () => ctx.go('shop', { back: ['scene', { id: def.id }] }),
    onAlbum: () => ctx.go('album', { back: ['scene', { id: def.id }] }),
    onCamera: () => takePhoto(api, def, { scene, bg, items, W, H, flashIn: wrap, view: viewCenter }),
  }));
  const wrap = el('div', 'scene-wrap');
  const scene = el('div', 'scene');
  const bg = el('div', 'scene-bg');
  const fx = el('div', 'scene-fx');
  const light = el('div', 'scene-light ' + (def.light || (def.outdoor ? 'outdoor' : 'indoor')));
  scene.append(bg, light, fx);
  scene.style.width = W + 'px';
  const panL = el('button', 'pan pan-l', '‹'), panR = el('button', 'pan pan-r', '›');
  panL.setAttribute('aria-label', 'Look left');
  panR.setAttribute('aria-label', 'Look right');
  wrap.append(scene, panL, panR);
  root.append(wrap, rotateHint());
  app.append(root);

  // ---------- scaling ----------
  let scale = 1, offX = 0, offY = 0, camX = null, maxCam = 0;
  function fit() {
    const r = wrap.getBoundingClientRect();
    // Normal places fit the whole 1600×900 box; wide ones fill the height and scroll sideways.
    scale = W > 1600 ? Math.min(r.height / H, (r.width / 1600) * 1.35) : Math.min(r.width / W, r.height / H);
    offY = (r.height - H * scale) / 2;
    maxCam = Math.max(0, W * scale - r.width);
    if (camX === null) {
      const start = session.cam?.[def.id];
      const focus = def.avatar ? def.avatar[0] + 85 : def.startX ?? 0;
      camX = start !== undefined ? start * scale : focus * scale - r.width / 2;
    }
    camX = Math.max(0, Math.min(maxCam, camX));
    offX = maxCam > 0 ? -camX : (r.width - W * scale) / 2;
    scene.style.transform = `translate(${offX}px, ${offY}px) scale(${scale})`;
    panL.classList.toggle('show', maxCam > 0 && camX > 4);
    panR.classList.toggle('show', maxCam > 0 && camX < maxCam - 4);
    wrap.classList.toggle('scrolls', maxCam > 0);
    (session.cam ||= {})[def.id] = camX / scale;
  }
  const panBy = (dx) => { camX += dx; fit(); };
  const viewCenter = () => (maxCam > 0 ? (camX + wrap.clientWidth / 2) / scale : W / 2);
  let glide = null;
  const panSmooth = (dx) => {
    cancelAnimationFrame(glide);
    const from = camX, t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / 350); camX = from + dx * (1 - (1 - k) ** 3); fit(); if (k < 1) glide = requestAnimationFrame(step); };
    glide = requestAnimationFrame(step);
  };
  panL.onclick = () => panSmooth(-wrap.clientWidth * 0.6);
  panR.onclick = () => panSmooth(wrap.clientWidth * 0.6);
  wrap.addEventListener('wheel', (e) => { if (maxCam > 0) { e.preventDefault(); panBy(Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY); } }, { passive: false });
  // Drag the empty background to look around.
  wrap.addEventListener('pointerdown', (e) => {
    if (maxCam <= 0 || e.target.closest('.item, .pan, .modal')) return;
    const sx = e.clientX, c0 = camX;
    let lastX = e.clientX, lastT = performance.now(), vel = 0;
    wrap.setPointerCapture(e.pointerId);
    wrap.classList.add('panning');
    const move = (ev) => {
      const now = performance.now();
      vel = (lastX - ev.clientX) / Math.max(1, now - lastT);
      lastX = ev.clientX; lastT = now;
      camX = c0 - (ev.clientX - sx); fit();
    };
    const up = () => {
      wrap.removeEventListener('pointermove', move);
      wrap.removeEventListener('pointerup', up);
      wrap.removeEventListener('pointercancel', up);
      wrap.classList.remove('panning');
      if (Math.abs(vel) > 0.3) panSmooth(vel * 260);
    };
    wrap.addEventListener('pointermove', move);
    wrap.addEventListener('pointerup', up);
    wrap.addEventListener('pointercancel', up);
  });
  const ro = new ResizeObserver(fit);
  ro.observe(wrap);
  fit();
  const toScene = (e) => {
    const r = wrap.getBoundingClientRect();
    return [(e.clientX - r.left - offX) / scale, (e.clientY - r.top - offY) / scale];
  };

  // ---------- weather ----------
  let particles = null, particleKind = null;
  function drawBg() {
    const w = state[wkey];
    bg.innerHTML = def.bg({ weather: w, rainbow: wkey === 'weather' && performance.now() < session.rainbowUntil });
    if (def.frame) wrap.style.background = typeof def.frame === 'function' ? def.frame(w) : def.frame;
    const want = def.outdoor && (w === 'rain' || w === 'snow') ? w : null;
    if (want !== particleKind) {
      particles?.remove();
      particles = want ? (want === 'rain' ? rainLayer() : snowLayer()) : null;
      if (particles) wrap.append(particles);
      particleKind = want;
    }
  }
  let rainbowTimer = null;
  function onWeather() {
    drawBg();
    def.onWeather?.(api);
    clearTimeout(rainbowTimer);
    if (performance.now() < session.rainbowUntil) rainbowTimer = setTimeout(drawBg, session.rainbowUntil - performance.now() + 50);
    const w = state[wkey];
    if (w === 'rain') api.bubble(viewCenter(), 160, def.outdoor ? "It's raining! 🌧️" : 'Rain outside! ☔');
    else if (w === 'snow') api.bubble(viewCenter(), 160, 'Let it snow! ❄️');
    else if (w === 'clear') api.bubble(viewCenter(), 160, 'Clear blue sky! ☀️');
    else if (performance.now() < session.rainbowUntil) api.bubble(viewCenter(), 160, 'A rainbow! 🌈');
  }
  drawBg();
  if (performance.now() < session.rainbowUntil) rainbowTimer = setTimeout(drawBg, session.rainbowUntil - performance.now() + 50);

  // ---------- items ----------
  const items = new Map();
  const timers = new Set();
  let topZ = 100;
  const posKey = def.posKey || def.id;
  const saved = state.pos[posKey] || (state.pos[posKey] = {});
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

  // Isometric rooms: items stand on a floor grid (gx, gy), may sit on a surface (gz) and are sorted by depth.
  const R = def.iso || null;
  const depthOf = (it) => {
    if (it.def.floor) return 5;
    if (it.on) return depthOf(it.on) + 1 + (it.def.zBias || 0);
    return 100 + Math.round((it.gx + it.fw + it.gy + it.fd) * 20) + (it.def.zBias || 0);
  };
  function place(it) {
    if (it.iso) {
      const [sx, sy] = proj(R, it.gx, it.gy, it.gz || 0);
      it.x = sx - it.ax; it.y = sy - it.ay;
      if (!it.lifted) it.z = depthOf(it);
    }
    it.el.style.left = it.x + 'px';
    it.el.style.top = it.y + 'px';
    it.el.style.zIndex = it.z;
  }
  function setArt(it) { it.el.innerHTML = it.def.art(it, api); }

  function add(d, { spawned = false } = {}) {
    const it = {
      def: d, id: d.id, x: d.x, y: d.y, w: d.w, h: d.h,
      z: d.z ?? (spawned ? ++topZ : d.floor ? 5 : 20 + items.size), data: { ...(d.data || {}) }, spawned,
    };
    if (R && d.gx !== undefined) {
      Object.assign(it, { iso: true, gx: d.gx, gy: d.gy, gz: d.gz || 0, fw: d.fw || 1, fd: d.fd || 1, ax: d.ax ?? d.w / 2, ay: d.ay ?? d.h });
      if (!spawned && d.drag !== false && saved[d.id]) [it.gx, it.gy, it.gz = 0] = saved[d.id];
    } else if (!spawned && d.drag !== false && saved[d.id]) [it.x, it.y] = saved[d.id];
    it.el = el('div', 'item' + (d.drag === false ? ' fixed' : '') + (d.cls ? ' ' + d.cls : '') + (d.w <= 130 && d.h <= 130 && !d.floor ? ' small' : ''));
    it.el.style.width = d.w + 'px';
    it.el.style.height = d.h + 'px';
    setArt(it);
    items.set(it.id, it);
    if (it.iso && it.gz) it.on = surfaceUnder(it);
    place(it);
    scene.insertBefore(it.el, fx);
    attach(it);
    if (spawned) { it.el.classList.add('pop'); sfx.pop(); }
    return it;
  }
  function remove(it) { it.anim?.stop(); it.el.remove(); items.delete(it.id); }

  const center = (it) => [it.x + it.w / 2, it.y + it.h / 2];
  const inside = ([px, py], it, pad = 0) => px > it.x - pad && px < it.x + it.w + pad && py > it.y - pad && py < it.y + it.h + pad;
  const characters = () => [...items.values()].filter((i) => i.def.character);
  // Furniture with `surface: height` can hold small things (def.small) placed on top of it.
  function surfaceUnder(it) {
    const cx = it.gx + it.fw / 2, cy = it.gy + it.fd / 2;
    let best = null;
    for (const o of items.values()) {
      if (o === it || !o.iso || !o.def.surface) continue;
      if (cx > o.gx && cx < o.gx + o.fw && cy > o.gy && cy < o.gy + o.fd && (!best || o.def.surface > best.def.surface)) best = o;
    }
    return best;
  }

  // ---------- drag & tap ----------
  function attach(it) {
    it.el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const [sx, sy] = toScene(e);
      const start = { sx, sy, x: it.x, y: it.y, gx: it.gx, gy: it.gy, moved: false };
      it.el.setPointerCapture(e.pointerId);
      const canDrag = it.def.drag !== false;
      if (canDrag && !it.def.floor) { it.lifted = true; it.z = 9000 + (++topZ % 900); place(it); }
      const move = (ev) => {
        const [mx, my] = toScene(ev);
        if (!start.moved && Math.hypot(mx - sx, my - sy) > 8) {
          start.moved = true;
          if (canDrag) { it.el.classList.add('dragging'); sfx.pick(); }
        }
        if (start.moved && canDrag && maxCam > 0) {
          const r = wrap.getBoundingClientRect();
          if (ev.clientX < r.left + 60 && camX > 0) { panBy(-14); }
          else if (ev.clientX > r.right - 60 && camX < maxCam) { panBy(14); }
        }
        if (start.moved && canDrag && it.iso) {
          const [ax0, ay0] = unproj(R, sx, sy), [ax1, ay1] = unproj(R, mx, my);
          const step = it.def.character || it.def.small ? 0 : 0.25;
          const snap = (v) => (step ? Math.round(v / step) * step : v);
          it.gz = 0; it.on = null;
          it.gx = Math.max(0, Math.min(R.cols - it.fw, snap(start.gx + ax1 - ax0)));
          it.gy = Math.max(0, Math.min(R.rows - it.fd, snap(start.gy + ay1 - ay0)));
          place(it);
        } else if (start.moved && canDrag) {
          it.x = Math.max(-it.w * 0.3, Math.min(W - it.w * 0.7, start.x + mx - sx));
          it.y = Math.max(-it.h * 0.2, Math.min(H - it.h * 0.4, start.y + my - sy));
          place(it);
        }
      };
      const up = () => {
        it.el.removeEventListener('pointermove', move);
        it.el.removeEventListener('pointerup', up);
        it.el.removeEventListener('pointercancel', up);
        it.el.classList.remove('dragging');
        if (it.lifted) {
          it.lifted = false;
          if (it.iso && start.moved && it.def.small) { const s2 = surfaceUnder(it); if (s2) { it.on = s2; it.gz = s2.def.surface; } }
          place(it);
        }
        if (!start.moved) { if (it.def.onTap) { sfx.tap(); it.def.onTap(it, api); } return; }
        if (!canDrag) return;
        sfx.drop();
        if (!it.spawned && !it.def.star && !it.def.wear) { saved[it.id] = it.iso ? [+it.gx.toFixed(2), +it.gy.toFixed(2), it.gz || 0] : [Math.round(it.x), Math.round(it.y)]; save(); }
        if (it.def.character) { def.onCharacterDrop?.(api, it); return; }
        if (it.def.onGive || it.def.wear) {
          const who = characters().find((c) => inside(center(it), c, 10));
          if (who) { it.def.wear ? wear(it, who) : it.def.onGive(it, api, who); return; }
        }
        it.def.onDrop?.(it, api);
      };
      it.el.addEventListener('pointermove', move);
      it.el.addEventListener('pointerup', up);
      it.el.addEventListener('pointercancel', up);
    });
  }

  // ---------- characters ----------
  // Characters are either island friends (look in the scene file) or your own saved characters (charId).
  const lookOf = (i) => (i.def.charId ? getChar(i.def.charId)?.look : i.def.look) || {};
  function addCharacter(c) {
    const s = c.s || (R ? R.charScale : 1);
    const pet = c.kind === 'pet';
    const it = add({
      id: c.id, x: c.x, y: c.y, w: (pet ? 170 : 170) * s, h: (pet ? 147 : 332) * s, z: c.z ?? 60,
      ...(R ? { gx: c.gx, gy: c.gy, fw: 0.45, fd: 0.45, ax: 85 * s, ay: (pet ? 140 : 322) * s, zBias: 6 } : {}),
      cls: 'avatar-item' + (pet ? ' pet-item' : ''), character: true, kind: c.kind || 'kid', charId: c.charId,
      look: c.look, drag: c.drag,
      art: (i) => (i.def.kind === 'pet' ? renderPet(lookOf(i)) : render(lookOf(i))),
      onTap: (i) => {
        if (def.onCharacterTap?.(api, i)) return;
        i.anim.happy();
        if (c.say && befriend(def.id + ':' + c.id)) { bubble(i.x + i.w / 2, i.y - 6, 'New friend sticker! 📖'); coinFloat(5, i.x + i.w / 2, i.y - 70); }
        else if (c.say) bubble(i.x + i.w / 2, i.y - 6, c.say[Math.floor(Math.random() * c.say.length)]);
        else if (c.charId) {
          const ch = getChar(c.charId);
          if (pet) { sfx.boing(); bubble(i.x + i.w / 2, i.y - 6, `${ch?.name || 'Pet'} ${{ cat: '🐱 Meow!', dog: '🐶 Woof!', bunny: '🐰 *hop*', hamster: '🐹 Squeak!', fox: '🦊 Yip!' }[ch?.look.type] || '💜'}`); }
          else bubble(i.x + i.w / 2, i.y - 6, `Hi! I'm ${ch?.name || 'me'} 💜`);
        }
      },
    });
    it.anim = animate(() => it.el.firstElementChild, pet ? PET_ANIM : undefined);
    return it;
  }
  function setLook(who, patch) {
    const look = { ...lookOf(who), ...patch };
    if (who.def.charId) { const ch = getChar(who.def.charId); if (ch) putChar({ ...ch, look }); } else who.def.look = look;
    setArt(who);
    who.anim.happy();
  }
  function react(who, text, glyphs = ['💜', '✨', '💫']) {
    who.anim?.happy();
    bubble(who.x + who.w / 2, who.y - 6, text);
    sparkle(who.x + who.w / 2, who.y + who.h * 0.35, glyphs);
  }
  function wear(it, who) {
    const [key, value] = it.def.wear;
    setLook(who, who.def.kind === 'pet' && key === 'neck' ? { acc: 'scarf' } : { [key]: value });
    sfx.wear();
    react(who, it.def.wearText || 'So stylish! ✨', ['✨', '😎', '💫']);
    remove(it);
  }
  function eat(it, who, text, glyphs) {
    remove(it);
    sfx.yum();
    react(who, text, glyphs);
    const got = feedReward();
    if (got) coinFloat(got, who.x + who.w / 2, who.y - 60);
  }

  // ---------- effects ----------
  function bubble(x, y, text) {
    const b = el('div', 'bubble', text);
    b.style.top = Math.max(90, y) + 'px';
    fx.append(b);
    const half = b.offsetWidth / 2;
    b.style.left = Math.max(half + 12, Math.min(W - half - 12, x)) + 'px';
    later(() => b.remove(), 1700);
  }
  function sparkle(x, y, glyphs = ['✨', '⭐', '✨', '💫']) {
    for (let i = 0; i < 7; i++) {
      const s = el('div', 'spark', glyphs[i % glyphs.length]);
      const a = (i / 7) * Math.PI * 2;
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--dx', Math.cos(a) * 90 + 'px');
      s.style.setProperty('--dy', Math.sin(a) * 90 + 'px');
      fx.append(s);
      later(() => s.remove(), 900);
    }
  }
  // Floating "+10 🪙" over the scene. coins() also adds them to your purse.
  function coinFloat(n, x, y) { effect(x, Math.max(60, y), 'coin-float', `+${n} 🪙`, 1400); }
  function coins(n, x = viewCenter(), y = 200) { earn(n); coinFloat(n, x, y); sfx.star?.(); }
  function effect(x, y, cls, html, ms = 1200) {
    const e = el('div', 'fx ' + cls, html);
    e.style.left = x + 'px';
    e.style.top = y + 'px';
    fx.append(e);
    later(() => e.remove(), ms);
    return e;
  }

  // ---------- stars ----------
  const starArt = () => `<svg viewBox="0 0 64 64"><path class="o" d="M32 4 L40 23 L60 24 L44 37 L50 58 L32 46 L14 58 L20 37 L4 24 L24 23 Z" fill="#F7D24A" style="stroke-width:3"/>
    <path d="M32 12 L36 24 L48 25" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/></svg>`;
  function addStar(id, x, y, { spawned = false, z, gx, gy, gz } = {}) {
    if (state.stars.includes(id) || items.has(id)) return;
    const isoPart = R && gx !== undefined ? { gx, gy, gz: gz || 0, fw: 0.4, fd: 0.4, ax: 32, ay: 56, zBias: spawned ? 400 : -60 } : {};
    add({ id, x, y, w: 64, h: 64, z: z ?? (spawned ? ++topZ : 8), drag: false, star: true, cls: 'star', art: starArt, onTap: collect, ...isoPart }, { spawned });
  }
  function collect(it) {
    state.stars.push(it.id);
    save();
    refreshStars();
    const [cx, cy] = center(it);
    sfx.star();
    sparkle(cx, cy);
    bubble(cx, cy - 50, 'You found a star! ⭐');
    coins(20, cx, cy - 120);
    it.el.classList.add('collect');
    later(() => remove(it), 600);
  }

  // ---------- popup for mini-games ----------
  function modal(build) {
    const ov = el('div', 'modal');
    const card = el('div', 'modal-card');
    const x = el('button', 'modal-x', '✕');
    x.setAttribute('aria-label', 'Close');
    const close = () => ov.remove();
    x.onclick = close;
    ov.onclick = (e) => { if (e.target === ov) close(); };
    ov.append(card);
    root.append(ov);
    build(card, close);
    card.append(x);
    return close;
  }

  // ---------- api for scene definitions ----------
  let spawnN = 0;
  const api = {
    get: (id) => items.get(id), items, add, remove, setArt, place, bubble, sparkle, effect, center, inside, later,
    addStar, starFound: (id) => state.stars.includes(id),
    earn: coins, redrawBg: drawBg, scale: () => scale,
    react, eat, setLook, modal, sfx, characters,
    avatar: () => items.get('avatar'),
    uid: (p) => `${p}-${++spawnN}`,
    count: (prefix) => [...items.keys()].filter((k) => k.startsWith(prefix + '-')).length,
    go: ctx.go, state, save,
    snap: (it, x, y) => { it.x = x; it.y = y; place(it); },
  };

  for (const d of def.items) add(d);
  for (const s of def.stars || []) addStar(s.id, s.x, s.y, { z: s.z, gx: s.gx, gy: s.gy, gz: s.gz });
  for (const c of def.characters || []) addCharacter(c);
  if (!def.noAvatar && activeChar()) {
    const [ax, ay] = def.avatar;
    addCharacter({ id: 'avatar', charId: activeChar().id, kind: 'kid', x: ax, y: ay, gx: ax, gy: ay, s: R ? R.charScale : 1, z: 60 });
    // Your other characters that come along stand next to you (kids at full size, pets in front).
    companions().forEach((c, n) => {
      const pet = c.kind === 'pet';
      const dx = [150, -150, 290][n];
      if (R) {
        const [ox, oy] = [[1, 0.4], [-0.6, 1], [1.4, 1.4]][n];
        addCharacter({ id: 'pc-' + c.id, charId: c.id, kind: c.kind, gx: Math.min(R.cols - 0.5, Math.max(0, ax + ox)), gy: Math.min(R.rows - 0.5, Math.max(0, ay + oy)), s: R.charScale, z: 60 });
        return;
      }
      addCharacter({ id: 'pc-' + c.id, charId: c.id, kind: c.kind, x: Math.max(10, Math.min(W - 180, ax + dx + (pet ? 10 : 0))), y: pet ? ay + 332 - 147 + 14 : ay + 6, z: pet ? 62 : 58 });
    });
  }
  def.init?.(api);
  window.__owApi = api;
  // First visit to a real place (not a planet map): a stamp for the album.
  if (!def.isMap && stampPlace(def.id)) later(() => { bubble(viewCenter(), 170, 'New stamp in your album! 📖'); coinFloat(10, viewCenter(), 120); }, 700);
  // Extra buttons a place can offer (e.g. Decorate in your room).
  if (def.tools?.length) {
    const bar = el('div', 'scene-tools');
    for (const t of def.tools) {
      const b = el('button', 'btn tool-btn', t.label);
      b.onclick = () => t.onClick(api, { root, wrap, ctx });
      bar.append(b);
      if (t.param && ctx.params[t.param]) later(() => t.onClick(api, { root, wrap, ctx }), 300);
    }
    wrap.append(bar);
  } // handy for testing in the console

  return {
    destroy: () => {
      for (const it of items.values()) it.anim?.stop();
      ro.disconnect();
      clearTimeout(rainbowTimer);
      timers.forEach(clearTimeout);
    },
  };
}
