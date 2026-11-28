// 🛍️ The shop: spend coins on furniture, decor, wallpapers and floors for your room.
import { state } from './state.js';
import { el, coinBadge } from './ui.js';
import { FURNITURE, WALLPAPERS, FLOORS, CATS, thumb } from './catalog.js';
import { buy, owned } from './economy.js';
import { sfx } from './sfx.js';

const TABS = [...CATS.map(([id, name, icon]) => ({ id, name, icon, kind: 'furniture' })),
  { id: 'wallpaper', name: 'Walls', icon: '🧱', kind: 'wallpaper' }, { id: 'floor', name: 'Floors', icon: '🟫', kind: 'floor' }];

export function shopScreen(app, ctx) {
  const back = ctx.params.back || ['galaxy'];
  const root = el('div', 'screen shop-screen');
  const head = el('div', 'shop-head');
  const backBtn = el('button', 'tb-btn back', '◀<span class="lbl"> Back</span>');
  backBtn.onclick = () => ctx.go(...back);
  const home = el('button', 'btn small', '🏠 Decorate my room');
  home.onclick = () => ctx.go('scene', { id: 'home', decorate: true });
  head.append(backBtn, el('h1', '', 'Shop 🛍️'), el('div', 'grow'), home, coinBadge());
  const tabs = el('div', 'shop-tabs');
  const grid = el('div', 'shop-grid');
  const toast = el('div', 'shop-toast');
  root.append(head, tabs, grid, toast);
  app.append(root);

  let tab = ctx.params.tab || 'furniture';
  let toastT = null;
  const say = (msg) => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 2200); };

  function drawTabs() {
    tabs.innerHTML = '';
    for (const t of TABS) {
      const b = el('button', 'chip' + (t.id === tab ? ' on' : ''), `${t.icon} ${t.name}`);
      b.onclick = () => { tab = t.id; drawTabs(); drawGrid(); grid.scrollTop = 0; };
      tabs.append(b);
    }
  }

  function drawGrid() {
    const t = TABS.find((x) => x.id === tab);
    const list = t.kind === 'furniture' ? FURNITURE.filter((f) => f.cat === tab) : t.kind === 'wallpaper' ? WALLPAPERS : FLOORS;
    grid.innerHTML = '';
    for (const entry of list) {
      const card = el('div', 'shop-card');
      const have = t.kind === 'furniture' ? owned(entry.id) : (t.kind === 'wallpaper' ? state.walls : state.floors).includes(entry.id);
      card.append(el('div', 'shop-thumb', thumb(t.kind, entry)), el('div', 'shop-name', entry.name));
      const btn = el('button', 'btn small buy');
      const once = t.kind !== 'furniture';
      if (once && have) { btn.textContent = 'Owned ✓'; btn.disabled = true; btn.classList.add('alt'); }
      else btn.innerHTML = entry.price ? `🪙 ${entry.price}` : 'Free';
      if (!once && have) card.append(el('div', 'shop-owned', `You have ${have}`));
      btn.onclick = () => {
        if (state.coins < entry.price) {
          card.classList.remove('nope'); void card.offsetWidth; card.classList.add('nope');
          sfx.drop?.();
          say(`You need ${entry.price - state.coins} more coins. Find stars, play games and make friends! ⭐`);
          return;
        }
        if (!buy(t.kind, entry)) return;
        sfx.win?.();
        say(t.kind === 'furniture' ? `${entry.name} is yours! Place it with 🛋️ Decorate in your room.` : `${entry.name} is yours! Switch to it with 🛋️ Decorate in your room.`);
        drawGrid();
      };
      card.append(btn);
      grid.append(card);
    }
  }
  drawTabs();
  drawGrid();
  return {};
}
