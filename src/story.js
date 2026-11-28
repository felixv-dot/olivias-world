// Story engine: quests, dialogue box, riddles, code lock, map pieces. Quest data lives in quests.js.
import { state, save } from './state.js';
import { el } from './ui.js';
import { render } from './avatar.js';
import { renderPet } from './pets.js';
import { earn } from './economy.js';
import { QUESTS, PIECES } from './quests.js';

// state.story = { q: { questId: stepIndex | 'done' }, pieces: ['p1', …], notes: { digit } }
export function story() {
  state.story ||= { q: {}, pieces: [], notes: [] };
  state.story.notes ||= [];
  return state.story;
}
const isDone = (id) => story().q[id] === 'done';
export const unlocked = (q) => (q.after || []).every(isDone);
export const activeQuests = () => QUESTS.filter((q) => unlocked(q) && !isDone(q.id));
export const doneQuests = () => QUESTS.filter((q) => isDone(q.id));
const stepOf = (q) => q.steps[story().q[q.id] || 0];
export const currentStep = stepOf;

// Steps waiting in this scene right now.
const stepsHere = (sceneId) => activeQuests().map((q) => ({ q, s: stepOf(q) })).filter(({ s }) => s.scene === sceneId);

// ---------- art for story things ----------
const LINE = 'stroke="#3E3252" stroke-opacity=".6" stroke-width="2" stroke-linejoin="round"';
const ART = {
  letter: { w: 80, h: 60, svg: `<svg viewBox="0 0 80 60" width="100%" height="100%"><g transform="translate(40 34) skewY(8)"><rect x="-30" y="-18" width="60" height="38" rx="4" fill="#FBF7EF" ${LINE}/><path d="M-30 -18 L0 6 L30 -18" fill="none" ${LINE}/><circle cx="0" cy="4" r="8" fill="#F5DE7A" ${LINE}/><path d="M0 -1 l1.6 3.4 3.6.4-2.7 2.4.8 3.6L0 7l-3.3 1.8.8-3.6-2.7-2.4 3.6-.4z" fill="#E0A82E"/></g></svg>` },
  note: { w: 64, h: 52, svg: `<svg viewBox="0 0 64 52" width="100%" height="100%"><g transform="translate(32 30) rotate(-8)"><path d="M-24 -16 H18 L24 -10 L20 -4 L24 2 L19 8 L24 16 H-24 Z" fill="#FFF6D6" ${LINE}/><path d="M-16 -7 H10 M-16 0 H6 M-16 7 H12" stroke="#B79CF0" stroke-width="2.5" stroke-linecap="round"/><text x="-4" y="5" font-family="Fredoka, sans-serif" font-weight="700" font-size="20" fill="#7A64B0" text-anchor="middle" opacity=".0">?</text></g></svg>` },
  kitten: { w: 96, h: 84, pet: { type: 'cat', color: '#F0B35A', belly: '#FBF7EF', eyes: '#3CC7B8', acc: 'bow', accColor: '#B79CF0' } },
};

function addThing(api, q, s) {
  const id = `story-${q.id}-${q.steps.indexOf(s)}`;
  if (api.get(id)) return;
  const a = ART[s.art];
  const svg = a.pet ? renderPet(a.pet) : a.svg;
  const [gx, gy, gz = 0] = s.at;
  api.add({ id, x: 0, y: 0, w: a.w, h: a.h, gx, gy, gz, fw: 0.4, fd: 0.4, ax: a.w / 2, ay: a.h - 6, zBias: 300, drag: false, cls: 'story-thing',
    art: () => svg, storyFind: true }, { spawned: true });
}

// Little "!" over characters who have something for you, a glow on items to tap.
export function refreshMarks(api, sceneId) {
  for (const it of api.items.values()) { it.el.querySelector('.quest-mark')?.remove(); it.el.classList.remove('quest-glow'); }
  for (const { s } of stepsHere(sceneId)) {
    if (s.type === 'talk' || s.type === 'give') {
      const c = api.get(s.npc);
      if (c) c.el.append(el('div', 'quest-mark', '!'));
    } else if (s.type === 'tap') api.get(s.item)?.el.classList.add('quest-glow');
    else if (s.type === 'find') addThingFor(api, s);
  }
}
function addThingFor(api, s) { const q = QUESTS.find((x) => x.steps.includes(s)); addThing(api, q, s); }

// Called by the scene engine when you enter a place.
export function enterScene(api, def) {
  if (def.isMap) return;
  refreshMarks(api, def.id);
  announceNew(api);
}

// Tell the player about quests that just unlocked.
function announceNew(api) {
  const st = story();
  const fresh = activeQuests().filter((q) => st.q[q.id] === undefined);
  if (!fresh.length) return;
  for (const q of fresh) st.q[q.id] = 0;
  save();
  if (fresh.length === 1) toast(api.root, `📜 New quest: <b>${fresh[0].title}</b>`, stepOf(fresh[0]).hint);
  else toast(api.root, `📜 ${fresh.length} new quests!`, `${fresh.map((q) => q.title).join(' · ')} — see your 📜 journal`);
}

// ---------- dialogue box ----------
export function dialogue(root, { name, look, pet, icon = '📜', lines = [], riddles = [] }) {
  return new Promise((resolve) => {
    const box = el('div', 'dialog');
    const pic = el('div', 'dialog-pic', look ? (pet ? renderPet(look) : render(look)) : `<div class="dialog-icon">${icon}</div>`);
    const body = el('div', 'dialog-body');
    const who = el('div', 'dialog-name', name || '');
    const text = el('div', 'dialog-text');
    const opts = el('div', 'dialog-opts');
    const next = el('div', 'dialog-next', 'Tap to continue ▸');
    body.append(who, text, opts, next);
    box.append(pic, body);
    root.append(box);
    const queue = [...lines];
    let riddle = null, ri = 0;
    function show() {
      opts.innerHTML = '';
      if (queue.length) { text.innerHTML = queue.shift(); next.style.display = ''; return; }
      if (ri < riddles.length) {
        riddle = riddles[ri];
        text.innerHTML = `<b>Riddle ${ri + 1} of ${riddles.length}:</b> ${riddle.q}`;
        next.style.display = 'none';
        // answers in a random order, so the right one isn't always first
        riddle.options.map((o, i) => [o, i]).sort(() => Math.random() - 0.5).forEach(([o, i]) => {
          const b = el('button', 'btn small alt', o);
          b.onclick = (e) => {
            e.stopPropagation();
            if (i === riddle.answer) { ri++; riddle = null; text.innerHTML = ['Yes! That\'s right! 🎉', 'Correct! ✨', 'You got it! 🌟'][ri % 3]; opts.innerHTML = ''; next.style.display = ''; }
            else { b.disabled = true; b.classList.add('wrong'); text.innerHTML = `Hmm, not quite… try again! 💭<br><span class="dim">${riddle.q}</span>`; }
          };
          opts.append(b);
        });
        return;
      }
      box.remove();
      resolve(true);
    }
    box.onclick = () => { if (!riddle) show(); };
    show();
  });
}

function toast(root, html, sub = '') {
  if (!root) return;
  const t = el('div', 'quest-toast', `<div>${html}</div>${sub ? `<div class="qt-sub">${sub}</div>` : ''}`);
  root.append(t);
  setTimeout(() => t.classList.add('out'), 3600);
  setTimeout(() => t.remove(), 4200);
}

// ---------- code lock ----------
function codeLock(root, code) {
  return new Promise((resolve) => {
    const ov = el('div', 'modal');
    const card = el('div', 'modal-card code-card');
    const digits = code.split('').map(() => 0);
    card.innerHTML = '<h2>A secret lock 🔒</h2><p class="m-status">Dial the three numbers from the torn notes.</p>';
    const row = el('div', 'code-row');
    digits.forEach((_, i) => {
      const col = el('div', 'code-col');
      const up = el('button', 'btn alt small', '▲'), dn = el('button', 'btn alt small', '▼');
      const d = el('div', 'code-digit', '0');
      const set = (v) => { digits[i] = (v + 10) % 10; d.textContent = digits[i]; };
      up.onclick = () => set(digits[i] + 1);
      dn.onclick = () => set(digits[i] - 1);
      col.append(up, d, dn);
      row.append(col);
    });
    const status = card.querySelector('.m-status');
    const open = el('button', 'btn', 'Open 🔓');
    const x = el('button', 'modal-x', '✕');
    open.onclick = () => {
      if (digits.join('') === code) { ov.remove(); resolve(true); return; }
      card.classList.remove('nope'); void card.offsetWidth; card.classList.add('nope');
      const found = story().notes;
      status.textContent = found.length < 3 ? `Not quite. You have found ${found.length} of 3 notes — check your 📜 quest journal!` : 'Not quite… check the notes in your 📜 quest journal!';
    };
    x.onclick = () => { ov.remove(); resolve(false); };
    card.append(row, open, x);
    ov.append(card);
    root.append(ov);
  });
}

// ---------- progress ----------
async function advance(api, q, sceneId) {
  const st = story();
  const i = (st.q[q.id] || 0) + 1;
  if (i < q.steps.length) {
    st.q[q.id] = i;
    save();
    refreshMarks(api, sceneId);
    const next = q.steps[i];
    if (next.scene !== sceneId) toast(api.root, `📜 ${q.title}`, next.hint);
    return;
  }
  st.q[q.id] = 'done';
  if (q.piece && !st.pieces.includes(q.piece)) st.pieces.push(q.piece);
  save();
  earn(q.coins || 0);
  api.sfx.win?.();
  refreshMarks(api, sceneId);
  const sm = api.get('starmap');
  if (sm) api.setArt(sm);
  await pieceReward(api.root, st.pieces.length, q.coins || 0);
  if (q.finale) await dialogue(api.root, { icon: '🌟', name: 'The Star Map', lines: q.finale });
  announceNew(api);
}

async function pieceReward(root, n, coins) {
  let map = '';
  try { const m = await import('./scenes/attic.js'); map = m.starMapSvg?.(story().pieces, 360, 240) || ''; } catch { /* attic not loaded */ }
  return new Promise((resolve) => {
    const ov = el('div', 'modal piece-modal');
    const card = el('div', 'modal-card');
    card.innerHTML = `<h2>A piece of the Star Map! 🗺️</h2><div class="piece-map">${map}</div><p class="m-status"><b>${n} of ${PIECES}</b> pieces found · +${coins} 🪙</p>`;
    const ok = el('button', 'btn', n >= PIECES ? 'The map is complete! ✨' : 'Keep exploring! ✨');
    ok.onclick = () => { ov.remove(); resolve(); };
    card.append(ok);
    ov.append(card);
    root.append(ov);
  });
}

const npcInfo = (api, id) => { const c = api.get(id); return { name: nameOf(c), look: c?.def.look, pet: c?.def.kind === 'pet' }; };
function nameOf(c) {
  if (!c) return '';
  const fromSay = (c.def.say || []).map((l) => l.match(/I'm ((?:[A-Z][a-z]+ ?){1,2})/)?.[1]?.trim()).find(Boolean);
  return c.def.name || fromSay || c.id.replace(/\d+$/, '').replace(/^./, (m) => m.toUpperCase());
}

let busy = false; // one conversation at a time

// Tapped a character. Returns true when the story took over.
export function onTalk(api, sceneId, npcId) {
  if (busy) return true;
  const hit = stepsHere(sceneId).find(({ s }) => (s.type === 'talk' || s.type === 'give') && s.npc === npcId);
  if (!hit) return false;
  const { q, s } = hit;
  busy = true;
  const info = npcInfo(api, npcId);
  const run = s.type === 'talk'
    ? dialogue(api.root, { ...info, lines: s.intro || [], riddles: s.riddles || [] }).then(() => dialogue(api.root, { ...info, lines: s.say })).then(() => advance(api, q, sceneId))
    : dialogue(api.root, { ...info, lines: s.ask || [] });
  run.finally(() => { busy = false; });
  return true;
}

// Gave something to a character (after the normal eat/wear reaction).
export function onGive(api, sceneId, npcId, kind) {
  const hit = stepsHere(sceneId).find(({ s }) => s.type === 'give' && s.npc === npcId && s.kind === kind);
  if (!hit || busy) return;
  busy = true;
  api.later(() => dialogue(api.root, { ...npcInfo(api, npcId), lines: hit.s.say }).then(() => advance(api, hit.q, sceneId)).finally(() => { busy = false; }), 700);
}

// Tapped an item. Returns true when the story took over.
export function onItemTap(api, sceneId, it) {
  if (busy) return true;
  if (it.def.storyFind) {
    const [, qid, si] = it.id.split('-');
    const q = QUESTS.find((x) => x.id === qid);
    const s = q?.steps[+si];
    if (!q || stepOf(q) !== s) return true;
    busy = true;
    api.remove(it);
    api.sparkle(it.x + it.w / 2, it.y + it.h / 2);
    api.sfx.star?.();
    if (s.digit) { story().notes.push({ order: s.order, digit: s.digit }); save(); }
    dialogue(api.root, { icon: s.art === 'kitten' ? '🐱' : s.art === 'note' ? '📝' : '✉️', name: s.art === 'kitten' ? 'Pip' : 'You found something!', lines: s.say })
      .then(() => advance(api, q, sceneId)).finally(() => { busy = false; });
    return true;
  }
  const hit = stepsHere(sceneId).find(({ s }) => s.type === 'tap' && s.item === it.id);
  if (!hit) return false;
  busy = true;
  const { q, s } = hit;
  (s.code ? codeLock(api.root, s.code) : Promise.resolve(true)).then(async (ok) => {
    if (!ok) return;
    if (it.data && 'open' in it.data) { it.data.open = true; api.setArt(it); api.sparkle(it.x + it.w / 2, it.y + it.h / 3); }
    await dialogue(api.root, { icon: '✨', name: q.title, lines: s.say });
    await advance(api, q, sceneId);
    if (s.go) api.go('scene', { id: s.go });
  }).finally(() => { busy = false; });
  return true;
}
