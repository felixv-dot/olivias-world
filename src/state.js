// Everything the game remembers on this device.
import { PRESETS } from './avatar.js';

const KEY = 'ow-state-v1';
const OLD_LOOK_KEY = 'ow-anime-avatar-v1';

// A character: { id, name, kind: 'kid' | 'pet', look, travel }.
// `activeId` is the kid you play as; others with `travel: true` come along into places.
function load() {
  const base = { chars: [], activeId: null, stars: [], weather: 'sun', winterWeather: 'snow', pos: {}, castle: 0, snowman: 0 };
  try {
    const s = { ...base, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
    if (!s.look) {
      const old = JSON.parse(localStorage.getItem(OLD_LOOK_KEY) || 'null');
      if (old) s.look = { ...PRESETS.girl, ...old };
    }
    // Older saves had a single `look`: turn it into the first saved character.
    if (!s.chars.length && s.look) {
      s.chars = [{ id: 'c1', name: 'Me', kind: 'kid', look: s.look, travel: true }];
      s.activeId = 'c1';
    }
    delete s.look;
    return s;
  } catch {
    return base;
  }
}

export const state = load();
// Not saved: the rainbow only shows for a little while after the rain stops.
export const session = { rainbowUntil: 0 };

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
}

export const newId = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
export const getChar = (id) => state.chars.find((c) => c.id === id);
export function activeChar() {
  return getChar(state.activeId) || state.chars.find((c) => c.kind === 'kid') || null;
}
export function getLook() {
  return activeChar()?.look || PRESETS.girl;
}
export function putChar(c) {
  const i = state.chars.findIndex((x) => x.id === c.id);
  if (i < 0) state.chars.push(c); else state.chars[i] = c;
  if (!activeChar() && c.kind === 'kid') state.activeId = c.id;
  save();
}
export function deleteChar(id) {
  state.chars = state.chars.filter((c) => c.id !== id);
  if (state.activeId === id) state.activeId = state.chars.find((c) => c.kind === 'kid')?.id || null;
  save();
}
export function setActive(id) {
  state.activeId = id;
  save();
}
// Characters that come along into places (not the one you play as), at most 3.
export function companions() {
  return state.chars.filter((c) => c.travel && c.id !== state.activeId).slice(0, 3);
}
