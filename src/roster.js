// My Characters: every saved kid and pet. Make new ones, edit, choose who you play as,
// choose who comes along into places, delete.
import { render } from './avatar.js';
import { renderPet } from './pets.js';
import { state, setActive, putChar, deleteChar, companions } from './state.js';
import { el } from './ui.js';

export function rosterScreen(app, ctx) {
  const root = el('div', 'screen roster');
  const head = el('div', 'roster-head');
  const backTo = ctx.params.back;
  const back = el('button', 'tb-btn', backTo ? '◀ Back' : '◀ Galaxy');
  back.onclick = () => (backTo ? ctx.go(...backTo) : ctx.go('galaxy'));
  head.append(back, el('h1', null, 'My Characters'), el('div', 'roster-tip', 'Tap ⭐ to play as someone, 🎒 to take them along'));
  const grid = el('div', 'roster-grid');
  root.append(head, grid);
  app.append(root);

  let confirmDelete = null;

  function draw() {
    grid.innerHTML = '';
    const along = new Set(companions().map((c) => c.id));
    for (const c of state.chars) {
      const playing = c.id === state.activeId;
      const card = el('div', 'char-card' + (playing ? ' playing' : '') + (c.kind === 'pet' ? ' is-pet' : ''));
      const pic = el('div', 'char-pic', c.kind === 'pet' ? renderPet(c.look) : render(c.look));
      pic.onclick = () => ctx.go('editor', { id: c.id, back: ['roster', ctx.params] });
      const name = el('div', 'char-name', c.name || (c.kind === 'pet' ? 'My pet' : 'Me'));
      const badges = el('div', 'char-badges');
      if (playing) badges.append(el('span', 'badge-on', '⭐ Playing'));
      else if (along.has(c.id)) badges.append(el('span', 'badge-along', '🎒 Comes along'));
      const actions = el('div', 'char-actions');
      const edit = el('button', 'mini', '✏️');
      edit.setAttribute('aria-label', 'Edit ' + c.name);
      edit.onclick = () => ctx.go('editor', { id: c.id, back: ['roster', ctx.params] });
      actions.append(edit);
      if (c.kind === 'kid' && !playing) {
        const play = el('button', 'mini', '⭐');
        play.setAttribute('aria-label', 'Play as ' + c.name);
        play.onclick = () => { setActive(c.id); draw(); };
        actions.append(play);
      }
      if (!playing) {
        const take = el('button', 'mini' + (c.travel ? ' on' : ''), '🎒');
        take.setAttribute('aria-label', (c.travel ? 'Leave ' : 'Take along ') + c.name);
        take.onclick = () => {
          if (!c.travel && companions().length >= 3) { take.classList.add('nope'); setTimeout(() => take.classList.remove('nope'), 400); return; }
          putChar({ ...c, travel: !c.travel }); draw();
        };
        actions.append(take);
        const del = el('button', 'mini danger' + (confirmDelete === c.id ? ' sure' : ''), confirmDelete === c.id ? 'Sure?' : '🗑️');
        del.setAttribute('aria-label', 'Delete ' + c.name);
        del.onclick = () => {
          if (confirmDelete === c.id) { deleteChar(c.id); confirmDelete = null; }
          else { confirmDelete = c.id; setTimeout(() => { if (confirmDelete === c.id) { confirmDelete = null; draw(); } }, 3000); }
          draw();
        };
        actions.append(del);
      }
      card.append(pic, name, badges, actions);
      grid.append(card);
    }
    const addKid = el('button', 'char-card add', '<div class="plus">＋</div><div>New kid</div>');
    addKid.onclick = () => ctx.go('editor', { newKind: 'kid', back: ['roster', ctx.params] });
    const addPet = el('button', 'char-card add', '<div class="plus">🐾</div><div>New pet</div>');
    addPet.onclick = () => ctx.go('editor', { newKind: 'pet', back: ['roster', ctx.params] });
    grid.append(addKid, addPet);
  }
  draw();
  return {};
}
