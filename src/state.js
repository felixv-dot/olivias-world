// Everything the game remembers. Each player (account or guest) has their own copy.
import { PRESETS } from './avatar.js';

const GUEST_KEY = 'ow-state-v1';
const OLD_LOOK_KEY = 'ow-anime-avatar-v1';

// A character: { id, name, kind: 'kid' | 'pet', look, travel }.
// `activeId` is the kid you play as; others with `travel: true` come along into places.
const fresh = () => ({ chars: [], activeId: null, stars: [], weather: 'sun', winterWeather: 'snow', pos: {}, castle: 0, snowman: 0 });

function normalize(raw) {
  const s = { ...fresh(), ...(raw || {}) };
  if (!s.chars.length && s.look) {
    s.chars = [{ id: 'c1', name: 'Me', kind: 'kid', look: { ...PRESETS.girl, ...s.look }, travel: true }];
    s.activeId = 'c1';
  }
  delete s.look;
  return s;
}

function readLocal(key) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || 'null');
    if (!raw && key === GUEST_KEY) {
      const old = JSON.parse(localStorage.getItem(OLD_LOOK_KEY) || 'null');
      if (old) return normalize({ look: old });
    }
    return normalize(raw);
  } catch {
    return fresh();
  }
}

export const state = readLocal(GUEST_KEY);
// Not saved: the rainbow only shows for a little while after the rain stops.
export const session = { rainbowUntil: 0 };

let storageKey = GUEST_KEY;
let onSave = null;

// Switch whose game we're playing: `key` is the local storage slot, `data` (optional) comes from the cloud.
export function usePlayer(key, data, saveHook = null) {
  storageKey = key;
  onSave = saveHook;
  const next = data ? normalize(data) : readLocal(key);
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, next);
  try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* storage unavailable */ }
}
export const guestKey = GUEST_KEY;
export const hasGuestProgress = () => readLocal(GUEST_KEY).chars.length > 0;
export const guestData = () => readLocal(GUEST_KEY);

export function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* storage unavailable */ }
  onSave?.(state);
}

// Start over: wipe characters, stars and everything placed in the world for this player.
export function resetGame() {
  const keep = { muted: state.muted, hideInstallTip: state.hideInstallTip };
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, fresh(), keep);
  save();
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
