// Character editor: name your character and pick face, hair and clothes (kids) or type, fur and
// accessories (pets). Every change is saved to the character right away.
import { render, animate, PALETTE, PARTS, PRESETS } from './avatar.js';
import { renderPet, randomPet, PET_PARTS, PET_PALETTE, PET_PRESET, PET_ANIM } from './pets.js';
import { getChar, putChar, setActive, newId } from './state.js';
import { el } from './ui.js';

const KID_TABS = [
  { id: 'face', label: 'Face', rows: [
    { title: 'Face', key: 'face', chips: PARTS.face },
    { title: 'Skin', key: 'skin', colors: PALETTE.skin },
    { title: 'Eyes', key: 'eyes', colors: PALETTE.eyes },
  ] },
  { id: 'hair', label: 'Hair', rows: [
    { title: 'Style', key: 'hairStyle', chips: PARTS.hairStyle },
    { title: 'Color', key: 'hair', colors: PALETTE.hair },
    { title: 'Accessory', key: 'hairAcc', chips: PARTS.hairAcc, when: (l) => !l.hat || l.hat === 'none' },
    { title: 'Glasses', key: 'glasses', chips: PARTS.glasses },
    { title: 'Hat', key: 'hat', chips: PARTS.hat },
    { title: 'Hat color', key: 'neckColor', colors: PALETTE.cloth, when: (l) => l.hat && l.hat !== 'none' },
  ] },
  { id: 'top', label: 'Top', rows: [
    { title: 'Top', key: 'top', chips: PARTS.top },
    { title: 'Color', key: 'topColor', colors: PALETTE.cloth },
    { title: 'Collar', key: 'collar', chips: PARTS.collar, when: (l) => l.top !== 'tee' && l.top !== 'puffer' },
    { title: 'Collar color', key: 'collarColor', colors: PALETTE.cloth, when: (l) => l.top !== 'tee' && l.top !== 'puffer' && l.collar === 'sailor' },
    { title: 'Neck', key: 'neck', chips: PARTS.neck },
    { title: 'Accessory color', key: 'neckColor', colors: PALETTE.cloth, when: (l) => l.neck !== 'none' || l.hairAcc === 'bow' || l.hairStyle === 'pigtails' || l.collar === 'hood' },
    { title: 'Cat badge', key: 'badge', chips: [[true, 'On'], [false, 'Off']] },
  ] },
  { id: 'bottom', label: 'Bottom', rows: [
    { title: 'Bottom', key: 'bottom', chips: PARTS.bottom },
    { title: 'Color', key: 'bottomColor', colors: PALETTE.cloth },
    { title: 'Socks', key: 'socks', chips: PARTS.socks, when: (l) => l.bottom !== 'widePants' },
    { title: 'Socks color', key: 'socksColor', colors: PALETTE.cloth, when: (l) => l.bottom !== 'widePants' && l.socks !== 'none' },
    { title: 'Shoes', key: 'shoes', chips: PARTS.shoes },
    { title: 'Shoes color', key: 'shoesColor', colors: PALETTE.cloth },
  ] },
];


const PET_TABS = [
  { id: 'type', label: 'Pet', rows: [
    { title: 'Animal', key: 'type', chips: PET_PARTS.type },
    { title: 'Fur', key: 'fur', colors: PET_PALETTE.fur },
    { title: 'Pattern', key: 'pattern', chips: PET_PARTS.pattern },
    { title: 'Eyes', key: 'eyes', colors: PET_PALETTE.eyes },
  ] },
  { id: 'style', label: 'Style', rows: [
    { title: 'Accessory', key: 'acc', chips: PET_PARTS.acc },
    { title: 'Color', key: 'accColor', colors: PET_PALETTE.acc },
    { title: 'Glasses', key: 'glasses', chips: PARTS.glasses },
    { title: 'Hat', key: 'hat', chips: PARTS.hat },
  ] },
];

function randomKid() {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const part = (k) => pick(PARTS[k])[0];
  return {
    face: part('face'), skin: pick(PALETTE.skin), eyes: pick(PALETTE.eyes),
    hairStyle: part('hairStyle'), hair: pick(PALETTE.hair), hairAcc: part('hairAcc'),
    glasses: Math.random() < 0.75 ? 'none' : part('glasses'), hat: Math.random() < 0.75 ? 'none' : part('hat'),
    top: part('top'), topColor: pick(PALETTE.cloth), collar: part('collar'), collarColor: pick(PALETTE.cloth),
    neck: part('neck'), neckColor: pick(PALETTE.cloth), badge: Math.random() < 0.4,
    bottom: part('bottom'), bottomColor: pick(PALETTE.cloth), socks: part('socks'), socksColor: pick(PALETTE.cloth),
    shoes: part('shoes'), shoesColor: pick(PALETTE.cloth),
  };
}

export function editorScreen(app, ctx) {
  const p = ctx.params;
  // The character being edited: an existing one, or a brand new kid/pet.
  let c = p.id && getChar(p.id) ? structuredClone(getChar(p.id)) : null;
  if (!c) {
    const kind = p.newKind || 'kid';
    c = { id: newId(), name: '', kind, travel: kind === 'pet', look: kind === 'pet' ? { ...PET_PRESET, ...randomPet() } : { ...PRESETS.girl } };
  }
  const isPet = c.kind === 'pet';
  const TABS = isPet ? PET_TABS : KID_TABS;
  let activeTab = TABS[0].id;
  const commit = () => { if (!c.name.trim()) c.name = ''; putChar({ ...c, name: c.name.trim() || (isPet ? 'My pet' : 'Me') }); };

  const root = el('div', 'screen editor' + (isPet ? ' pet-editor' : ''));
  const stage = el('div', 'stage');
  stage.append(el('div', 'logo', "Olivia's World"), el('div', 'sparkles'));
  const avatarEl = el('div', 'editor-avatar' + (isPet ? ' pet' : ''));
  const go = el('button', 'btn go-btn', p.first ? "Let's go! 🚀" : 'Done ✓');
  go.onclick = () => {
    commit();
    if (p.first) { setActive(c.id); ctx.go('galaxy'); }
    else if (p.back) ctx.go(...p.back);
    else ctx.go('roster');
  };
  stage.append(avatarEl, go);
  const panel = el('aside', 'panel');
  root.append(stage, panel);
  app.append(root);

  const anim = animate(() => avatarEl.firstElementChild, isPet ? PET_ANIM : undefined);
  avatarEl.addEventListener('click', () => anim.happy());
  const draw = () => { avatarEl.innerHTML = isPet ? renderPet(c.look) : render(c.look); };

  function set(key, value) {
    c.look = { ...c.look, [key]: value };
    commit();
    draw();
    renderPanel();
  }

  // Name field lives above the tabs and is never re-created while typing.
  const nameRow = el('div', 'name-row');
  const nameInput = el('input', 'name-input');
  nameInput.type = 'text';
  nameInput.maxLength = 16;
  nameInput.placeholder = isPet ? "Pet's name" : 'Name';
  nameInput.value = c.name;
  nameInput.setAttribute('aria-label', 'Character name');
  nameInput.oninput = () => { c.name = nameInput.value; commit(); };
  nameInput.onkeydown = (e) => { if (e.key === 'Enter') nameInput.blur(); };
  nameRow.append(el('span', 'name-label', isPet ? '🐾' : '✏️'), nameInput);
  const tabsEl = el('div', 'tabs');
  const body = el('div', 'body');
  const foot = el('div', 'foot');
  panel.append(nameRow, tabsEl, body, foot);

  function renderPanel() {
    const scroll = body.scrollTop;
    tabsEl.innerHTML = '';
    for (const t of TABS) {
      const b = el('button', 'tab' + (t.id === activeTab ? ' on' : ''), t.label);
      b.onclick = () => { activeTab = t.id; renderPanel(); body.scrollTop = 0; };
      tabsEl.append(b);
    }
    body.innerHTML = '';
    for (const row of TABS.find((t) => t.id === activeTab).rows) {
      if (row.when && !row.when(c.look)) continue;
      const r = el('div', 'row');
      r.append(el('h3', null, row.title));
      if (row.colors) {
        const sw = el('div', 'sw');
        for (const col of row.colors) {
          const d = el('button', 'dot' + (c.look[row.key] === col ? ' on' : ''));
          d.style.background = col;
          d.setAttribute('aria-label', `${row.title} ${col}`);
          d.onclick = () => set(row.key, col);
          sw.append(d);
        }
        r.append(sw);
      } else {
        const chips = el('div', 'chips');
        for (const [val, label] of row.chips) {
          const ch = el('button', 'chip' + (c.look[row.key] === val ? ' on' : ''), label);
          ch.onclick = () => set(row.key, val);
          chips.append(ch);
        }
        r.append(chips);
      }
      body.append(r);
    }
    body.scrollTop = scroll;

    foot.innerHTML = '';
    const replace = (look) => () => { c.look = look; commit(); draw(); renderPanel(); anim.happy(); };
    if (isPet) {
      const surprise = el('button', 'btn', 'Surprise me! 🎲');
      surprise.onclick = replace(randomPet());
      surprise.onclick = () => replace(randomPet())();
      foot.append(surprise);
    } else {
      const girl = el('button', 'btn alt', 'Girl');
      girl.onclick = replace({ ...PRESETS.girl });
      const boy = el('button', 'btn alt', 'Boy');
      boy.onclick = replace({ ...PRESETS.boy });
      const surprise = el('button', 'btn', 'Surprise me!');
      surprise.style.flex = '1.6';
      surprise.onclick = () => replace(randomKid())();
      foot.append(girl, boy, surprise);
    }
  }

  commit();
  draw();
  renderPanel();
  if (!c.name && !p.id) setTimeout(() => nameInput.focus({ preventScroll: true }), 300);
  return { destroy: () => anim.stop() };
}
