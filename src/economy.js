// Coins, the things you own, and the album (place stamps, friend stickers, photos).
// All of it lives in the player's saved state, so accounts and Start over just work.
import { state, save } from './state.js';

export const COIN = '🪙';
export const PHOTO_LIMIT = 12;

// Defaults are filled in by state.js when a save is loaded; this is just a safety net.
export function ensureEconomy() {
  state.inv ||= {}; state.walls ||= ['default']; state.floors ||= ['default'];
  state.home ||= { wall: 'default', floor: 'default', placed: [] };
  state.stamps ||= []; state.friends ||= []; state.photos ||= []; state.daily ||= { day: '', fed: 0 };
  if (typeof state.coins !== 'number') state.coins = 100;
}

export function refreshCoins() {
  document.querySelectorAll('.coin-count').forEach((n) => { n.textContent = state.coins; });
}

// Add coins. Returns the amount actually given (feeding is capped per day).
export function earn(n) {
  ensureEconomy();
  state.coins += n;
  save();
  refreshCoins();
  document.querySelectorAll('.coin-badge').forEach((b) => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
  return n;
}

export function spend(n) {
  ensureEconomy();
  if (state.coins < n) return false;
  state.coins -= n;
  save();
  refreshCoins();
  return true;
}

const today = () => new Date().toISOString().slice(0, 10);
// A few coins for feeding someone, at most 10 times a day.
export function feedReward() {
  ensureEconomy();
  if (state.daily.day !== today()) state.daily = { day: today(), fed: 0, gift: state.daily.gift };
  if (state.daily.fed >= 10) return 0;
  state.daily.fed++;
  return earn(2);
}
// One daily gift per day: returns the coins given, or 0 if already opened today.
export function dailyGift() {
  ensureEconomy();
  if (state.daily.gift === today()) return 0;
  state.daily.gift = today();
  return earn(25);
}

// First visit to a place: a stamp and 10 coins.
export function stampPlace(id) {
  ensureEconomy();
  if (state.stamps.includes(id)) return false;
  state.stamps.push(id);
  earn(10);
  return true;
}
// First hello to a character: a sticker and 5 coins.
export function befriend(key) {
  ensureEconomy();
  if (state.friends.includes(key)) return false;
  state.friends.push(key);
  earn(5);
  return true;
}

export function addPhoto(src, place) {
  ensureEconomy();
  state.photos.unshift({ src, place, t: Date.now() });
  state.photos.length = Math.min(state.photos.length, PHOTO_LIMIT);
  save();
}

// ---------- owning & placing furniture ----------
export const owned = (id) => state.inv?.[id] || 0;
export const placedCount = (id) => (state.home?.placed || []).filter((p) => p.id === id).length;
export const spare = (id) => owned(id) - placedCount(id);
export function buy(kind, entry) {
  ensureEconomy();
  if (kind === 'wallpaper' && state.walls.includes(entry.id)) return false;
  if (kind === 'floor' && state.floors.includes(entry.id)) return false;
  if (!spend(entry.price)) return false;
  if (kind === 'furniture') state.inv[entry.id] = owned(entry.id) + 1;
  else if (kind === 'wallpaper') state.walls.push(entry.id);
  else state.floors.push(entry.id);
  save();
  return true;
}
