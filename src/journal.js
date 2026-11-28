// 📜 Quest journal: the Star Map so far, what to do next, and finished quests.
import { el, coinBadge } from './ui.js';
import { story, activeQuests, doneQuests, currentStep } from './story.js';
import { QUESTS, PIECES } from './quests.js';

export function journalScreen(app, ctx) {
  const back = ctx.params.back || ['galaxy'];
  const root = el('div', 'screen album-screen journal-screen');
  const head = el('div', 'shop-head');
  const backBtn = el('button', 'tb-btn back', '◀<span class="lbl"> Back</span>');
  backBtn.onclick = () => ctx.go(...back);
  head.append(backBtn, el('h1', '', 'Quest Journal 📜'), el('div', 'grow'), el('div', 'album-count', `🗺️ ${story().pieces.length}/${PIECES} pieces`), coinBadge());
  const body = el('div', 'journal-body');
  const mapBox = el('div', 'journal-map');
  const list = el('div', 'journal-list');
  body.append(mapBox, list);
  root.append(head, body);
  app.append(root);

  import('./scenes/attic.js').then((m) => { mapBox.innerHTML = `<h2>The Star Map</h2>${m.starMapSvg?.(story().pieces, 420, 280) || ''}`; })
    .catch(() => { mapBox.innerHTML = `<h2>The Star Map</h2><div class="dim">${story().pieces.length} of ${PIECES} pieces</div>`; });

  const act = activeQuests();
  list.append(el('h2', '', act.length ? 'To do' : (doneQuests().length === QUESTS.length ? 'Chapter 1 complete! 🌟' : 'To do')));
  if (!act.length && !doneQuests().length) list.append(el('div', 'dim', 'Explore your room — something is waiting for you there… ✉️'));
  for (const q of act) {
    const s = currentStep(q);
    const i = q.steps.indexOf(s);
    const card = el('div', 'quest-card active', `<div class="qc-title">${q.title}</div><div class="qc-hint">${s.hint}</div>
      <div class="qc-meta"><span>📍 ${s.place || ''}</span><span>${q.steps.length > 1 ? `Step ${i + 1} of ${q.steps.length}` : ''}</span><span>🗺️ + ${q.coins} 🪙</span></div>`);
    card.onclick = () => s.scene && ctx.go('scene', { id: s.scene });
    card.title = 'Go there';
    list.append(card);
  }
  const notes = story().notes;
  if (notes.length) {
    list.append(el('h2', '', 'Torn notes'));
    list.append(el('div', 'notes-row', notes.map((n) => `<div class="note-chip">📝 ${n.order}: <b>${n.digit}</b></div>`).join('')));
  }
  const done = doneQuests();
  if (done.length) {
    list.append(el('h2', '', 'Finished'));
    for (const q of done) list.append(el('div', 'quest-card done', `<div class="qc-title">✓ ${q.title}</div>`));
  }
  const locked = QUESTS.filter((q) => !act.includes(q) && !done.includes(q));
  if (locked.length) list.append(el('div', 'dim locked-note', `🔒 ${locked.length} more quest${locked.length > 1 ? 's' : ''} will appear as you go…`));
  return {};
}
