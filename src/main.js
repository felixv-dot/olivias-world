// Olivia's World — screen navigation.
import { state } from './state.js';
import { resume } from './accounts.js';
import { welcomeScreen } from './welcome.js';
import { editorScreen } from './editor.js';
import { rosterScreen } from './roster.js';
import { galaxyScreen } from './galaxy.js';
import { sceneScreen } from './scene.js';
import { SCENES } from './scenes/index.js';
import { setupMobile } from './mobile.js';
import { shopScreen } from './shop.js';
import { albumScreen } from './album.js';
import { journalScreen } from './journal.js';

setupMobile();

const app = document.getElementById('app');
let current = null;

const SCREENS = {
  welcome: welcomeScreen,
  editor: editorScreen,
  roster: rosterScreen,
  galaxy: galaxyScreen,
  shop: shopScreen,
  album: albumScreen,
  journal: journalScreen,
  scene: (root, ctx) => sceneScreen(root, ctx, SCENES[ctx.params.id]),
};

function go(name, params = {}) {
  current?.destroy?.();
  app.innerHTML = '';
  current = SCREENS[name](app, { go, params });
}

// Resume the last player (account or guest); otherwise show the welcome screen.
app.innerHTML = '<div class="loading">✨ Loading…</div>';
resume().then((ok) => {
  if (!ok) go('welcome');
  else if (state.chars.length) go('galaxy');
  else go('editor', { newKind: 'kid', first: true });
}).catch(() => go('welcome'));

// Handy for testing from the browser console: __ow.go('scene', { id: 'park' })
window.__ow = { go };
