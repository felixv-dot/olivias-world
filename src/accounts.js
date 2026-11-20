// Player accounts: a simple username + password (no email, kid-friendly).
// Cloud mode (Firebase) keeps each player's game in their account on every device.
// Until Firebase is configured, accounts live on this device (still separate saves per player).
import { firebaseConfig } from './firebase-config.js';
import { usePlayer, guestKey, hasGuestProgress, guestData } from './state.js';

const SESSION_KEY = 'ow-session';
const LOCAL_USERS = 'ow-accounts';
const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';

export const player = { id: null, name: null, guest: true };
export const cloudEnabled = () => !!firebaseConfig;

const cleanName = (u) => (u || '').trim();
const nameKey = (u) => cleanName(u).toLowerCase();
export function checkName(u) {
  const n = cleanName(u);
  if (n.length < 3) return 'Your name needs at least 3 letters.';
  if (n.length > 16) return 'Please use 16 letters or fewer.';
  if (!/^[A-Za-z0-9_\-. ]+$/.test(n)) return 'Use only letters, numbers, spaces, - or _.';
  return null;
}
export function checkPassword(p) {
  if ((p || '').length < 6) return 'The password needs at least 6 characters.';
  return null;
}

// ---------- device-only accounts ----------
async function hash(text) {
  // crypto.subtle only exists on https/localhost; on a plain LAN address fall back to a simple hash.
  if (!globalThis.crypto?.subtle) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < text.length; i++) { const c = text.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
    return 'f' + ((h2 >>> 0).toString(16) + (h1 >>> 0).toString(16));
  }
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const readUsers = () => { try { return JSON.parse(localStorage.getItem(LOCAL_USERS) || '{}'); } catch { return {}; } };
const writeUsers = (u) => { try { localStorage.setItem(LOCAL_USERS, JSON.stringify(u)); } catch { /* storage unavailable */ } };

const local = {
  async signUp(name, password) {
    const users = readUsers();
    if (users[nameKey(name)]) throw new Error('That name is taken on this device. Try another one!');
    const salt = Math.random().toString(36).slice(2);
    const id = 'u' + Date.now().toString(36);
    users[nameKey(name)] = { id, name: cleanName(name), salt, hash: await hash(salt + password) };
    writeUsers(users);
    return { id, name: cleanName(name) };
  },
  async logIn(name, password) {
    const u = readUsers()[nameKey(name)];
    if (!u || u.hash !== (await hash(u.salt + password))) throw new Error('Name or password is not right. Try again!');
    return { id: u.id, name: u.name };
  },
  async load() { return null; },
  save() {},
  async logOut() {},
};

// ---------- cloud accounts (Firebase Auth + Firestore) ----------
let fb = null;
async function firebase() {
  if (fb) return fb;
  const [{ initializeApp }, auth, store] = await Promise.all([
    import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js'),
  ]);
  const app = initializeApp(firebaseConfig);
  fb = { auth, store, a: auth.getAuth(app), db: store.getFirestore(app) };
  return fb;
}
const emailFor = (name) => `${nameKey(name).replace(/[^a-z0-9]/g, '_')}@players.olivias-world.app`;
const friendly = (e) => {
  const c = e?.code || '';
  if (c.includes('email-already-in-use')) return 'That name is already taken. Try another one!';
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found')) return 'Name or password is not right. Try again!';
  if (c.includes('network')) return 'No internet connection. Try again in a moment.';
  if (c.includes('too-many-requests')) return 'Too many tries. Wait a minute and try again.';
  return 'Something went wrong. Please try again.';
};
let saveTimer = null;
const cloud = {
  async signUp(name, password) {
    const { auth, a } = await firebase();
    try {
      const cred = await auth.createUserWithEmailAndPassword(a, emailFor(name), password);
      await auth.updateProfile(cred.user, { displayName: cleanName(name) });
      return { id: cred.user.uid, name: cleanName(name) };
    } catch (e) { throw new Error(friendly(e)); }
  },
  async logIn(name, password) {
    const { auth, a } = await firebase();
    try {
      const cred = await auth.signInWithEmailAndPassword(a, emailFor(name), password);
      return { id: cred.user.uid, name: cred.user.displayName || cleanName(name) };
    } catch (e) { throw new Error(friendly(e)); }
  },
  async load(id) {
    const { store, db } = await firebase();
    try {
      const snap = await store.getDoc(store.doc(db, 'players', id));
      return snap.exists() ? JSON.parse(snap.data().state || 'null') : null;
    } catch { return null; }
  },
  save(id, name, data) {
    clearTimeout(saveTimer);
    const json = JSON.stringify(data);
    saveTimer = setTimeout(async () => {
      const { store, db } = await firebase();
      try { await store.setDoc(store.doc(db, 'players', id), { name, state: json, updatedAt: store.serverTimestamp() }); } catch { /* retried on next save */ }
    }, 1200);
  },
  async logOut() { const { auth, a } = await firebase(); await auth.signOut(a); },
  async current() {
    const { auth, a } = await firebase();
    await a.authStateReady();
    const u = a.currentUser;
    return u ? { id: u.uid, name: u.displayName || 'Player' } : null;
  },
};
const backend = () => (cloudEnabled() ? cloud : local);

async function enter(user, { bringGuest = false } = {}) {
  const b = backend();
  let data = await b.load(user.id);
  const slot = `ow-state-v1:${user.id}`;
  if (!data && bringGuest && hasGuestProgress()) data = guestData();
  player.id = user.id; player.name = user.name; player.guest = false;
  usePlayer(slot, data, cloudEnabled() ? (s) => cloud.save(user.id, user.name, s) : null);
  if (cloudEnabled() && data) cloud.save(user.id, user.name, data);
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, name: user.name })); } catch { /* storage unavailable */ }
}

export async function signUp(name, password, opts) { const u = await backend().signUp(name, password); await enter(u, opts); }
export async function logIn(name, password) { const u = await backend().logIn(name, password); await enter(u); }
export function playAsGuest() {
  player.id = null; player.name = null; player.guest = true;
  usePlayer(guestKey, null);
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ guest: true })); } catch { /* storage unavailable */ }
}
export async function logOut() {
  await backend().logOut();
  try { localStorage.removeItem(SESSION_KEY); } catch { /* storage unavailable */ }
  player.id = null; player.name = null; player.guest = true;
}

// On start: resume the last session. Returns false if the player still needs to log in or choose guest.
export async function resume() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { s = null; }
  if (!s) return false;
  if (s.guest) { playAsGuest(); return true; }
  if (cloudEnabled()) {
    try {
      const u = await cloud.current();
      if (!u) return false;
      await enter(u);
      return true;
    } catch {
      // Offline: keep playing from this device's copy; it syncs on the next save when back online.
      player.id = s.id; player.name = s.name; player.guest = false;
      usePlayer(`ow-state-v1:${s.id}`, null, (st) => cloud.save(s.id, s.name, st));
      return true;
    }
  }
  if (!s.id) return false;
  player.id = s.id; player.name = s.name; player.guest = false;
  usePlayer(`ow-state-v1:${s.id}`, null);
  return true;
}
