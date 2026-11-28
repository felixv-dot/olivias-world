// 📖 The album: stamps for places you've visited, stickers of friends you've met, stars per place and your photos.
import { state, save } from './state.js';
import { el, coinBadge } from './ui.js';
import { render } from './avatar.js';
import { renderPet } from './pets.js';
import { SCENES } from './scenes/index.js';

const TABS = [['stamps', '🗺️ Places'], ['friends', '🧑‍🤝‍🧑 Friends'], ['stars', '⭐ Stars'], ['photos', '📷 Photos']];
const planetOf = (d) => (d.back?.[1]?.id === 'winter' || d.weather?.key === 'winterWeather' ? 'Winter Planet' : 'Sunny Planet');
const places = () => Object.values(SCENES).filter((d) => !d.isMap);
// Name: from a line like "I'm Grandpa Ole", else from the id.
const nameOf = (c) => c.name || (c.say || []).map((l) => l.match(/I'm ((?:[A-Z][a-z]+ ?){1,2})/)?.[1]?.trim()).find(Boolean) || c.id.replace(/\d+$/, '').replace(/^./, (m) => m.toUpperCase());
const emojiOf = (title) => (title.match(/(\p{Extended_Pictographic}[️‍\p{Extended_Pictographic}]*)\s*$/u) || [])[1] || '📍';
const plain = (title) => title.replace(/\s*(\p{Extended_Pictographic}[️‍\p{Extended_Pictographic}]*)\s*$/u, '');

export function albumScreen(app, ctx) {
  const back = ctx.params.back || ['galaxy'];
  const root = el('div', 'screen album-screen');
  const head = el('div', 'shop-head');
  const backBtn = el('button', 'tb-btn back', '◀<span class="lbl"> Back</span>');
  backBtn.onclick = () => ctx.go(...back);
  const count = el('div', 'album-count');
  head.append(backBtn, el('h1', '', 'My Album 📖'), el('div', 'grow'), count, coinBadge(() => ctx.go('shop', { back: ['album', { back }] })));
  const tabs = el('div', 'shop-tabs');
  const body = el('div', 'album-body');
  root.append(head, tabs, body);
  app.append(root);
  let tab = ctx.params.tab || 'stamps';

  function drawTabs() {
    tabs.innerHTML = '';
    for (const [id, label] of TABS) {
      const b = el('button', 'chip' + (id === tab ? ' on' : ''), label);
      b.onclick = () => { tab = id; drawTabs(); draw(); };
      tabs.append(b);
    }
  }

  function section(title) { const s = el('div', 'album-section'); s.append(el('h2', '', title)); const g = el('div', 'album-grid'); s.append(g); body.append(s); return g; }

  function draw() {
    body.innerHTML = '';
    body.scrollTop = 0;
    if (tab === 'stamps') {
      const all = places();
      count.textContent = `${all.filter((d) => state.stamps.includes(d.id)).length}/${all.length} stamps`;
      for (const planet of ['Sunny Planet', 'Winter Planet']) {
        const g = section(planet === 'Sunny Planet' ? '☀️ Sunny Planet' : '❄️ Winter Planet');
        for (const d of all.filter((x) => planetOf(x) === planet)) {
          const got = state.stamps.includes(d.id);
          const s = el('div', 'stamp' + (got ? ' got' : ''), `<div class="stamp-emoji">${got ? emojiOf(d.title) : '?'}</div><div class="stamp-name">${got ? plain(d.title) : '???'}</div>`);
          s.title = got ? 'Visited!' : 'Visit this place to get its stamp';
          g.append(s);
        }
      }
    } else if (tab === 'friends') {
      const all = places().flatMap((d) => (d.characters || []).filter((c) => c.say).map((c) => ({ key: d.id + ':' + c.id, c, d })));
      count.textContent = `${all.filter((f) => state.friends.includes(f.key)).length}/${all.length} friends`;
      const g = section('Say hi to everyone you meet! Tap them in their place.');
      for (const { key, c, d } of all) {
        const got = state.friends.includes(key);
        const pic = got ? (c.kind === 'pet' ? renderPet(c.look) : render(c.look)) : '<div class="mystery">?</div>';
        g.append(el('div', 'sticker' + (got ? ' got' : ''), `<div class="sticker-pic">${pic}</div><div class="stamp-name">${got ? nameOf(c) : '???'}</div><div class="sticker-where">${plain(d.title)}</div>`));
      }
    } else if (tab === 'stars') {
      const all = places().filter((d) => starIds(d).length);
      const found = state.stars.length;
      count.textContent = `${found}/${all.reduce((n, d) => n + starIds(d).length, 0)} stars`;
      const g = section('Hidden stars in every place');
      for (const d of all) {
        const ids = starIds(d);
        const n = ids.filter((id) => state.stars.includes(id)).length;
        g.append(el('div', 'stamp star-row' + (n === ids.length ? ' got' : ''), `<div class="stamp-emoji">${emojiOf(d.title)}</div><div class="stamp-name">${plain(d.title)}</div><div class="star-dots">${ids.map((id) => (state.stars.includes(id) ? '⭐' : '☆')).join('')}</div>`));
      }
    } else {
      count.textContent = `${state.photos.length} photos`;
      if (!state.photos.length) { body.append(el('div', 'album-empty', 'No photos yet. Tap 📷 in any place to take one!')); return; }
      const g = section('Your photos (the newest 12 are kept)');
      state.photos.forEach((p, i) => {
        const card = el('button', 'photo-card', `<img src="${p.src}" alt=""><div class="stamp-name">${p.place || ''}</div>`);
        card.onclick = () => viewPhoto(i);
        g.append(card);
      });
    }
  }

  function viewPhoto(i) {
    const p = state.photos[i];
    const ov = el('div', 'modal photo-view');
    const card = el('div', 'modal-card');
    card.innerHTML = `<img src="${p.src}" alt=""><div class="photo-cap">${p.place || ''} · ${new Date(p.t).toLocaleDateString()}</div>`;
    const row = el('div', 'opt-row');
    const del = el('button', 'btn alt', '🗑️ Delete');
    del.onclick = () => {
      if (del.dataset.sure) { state.photos.splice(i, 1); save(); ov.remove(); draw(); return; }
      del.dataset.sure = '1'; del.textContent = 'Tap again to delete';
    };
    const close = el('button', 'btn', 'Close');
    close.onclick = () => ov.remove();
    row.append(del, close);
    card.append(row);
    ov.append(card);
    ov.onclick = (e) => { if (e.target === ov) ov.remove(); };
    root.append(ov);
  }

  drawTabs();
  draw();
  return {};
}

// Star ids that belong to a place: its fixed stars plus any star id the place's code can spawn (same prefix).
const STAR_TOTALS = {};
function starIds(d) {
  if (STAR_TOTALS[d.id]) return STAR_TOTALS[d.id];
  const fixed = (d.stars || []).map((s) => s.id);
  const known = KNOWN_STARS.filter((id) => id.startsWith(d.id + '-'));
  return (STAR_TOTALS[d.id] = [...new Set([...fixed, ...known])]);
}
const KNOWN_STARS = ['home-toybox', 'home-cushion', 'cafe-plant', 'cafe-chair', 'beach-castle', 'beach-shell', 'park-nest', 'park-bench',
  'boutique-fitting', 'boutique-box', 'gym-locker', 'gym-mat', 'games-ttt', 'games-memory', 'salon-style', 'salon-towels',
  'petshop-tank', 'petshop-sack', 'studio-painting', 'studio-canvases', 'funfair-cans', 'funfair-hay', 'cabin-chair', 'cabin-present',
  'market-crate', 'market-cookie', 'rink-bench', 'rink-goals', 'hill-snowman', 'hill-tree', 'lookout-sky', 'lookout-blanket',
  'bakery-sack', 'bakery-cake', 'workshop-crate', 'workshop-robot', 'springs-sled', 'springs-soak'];
