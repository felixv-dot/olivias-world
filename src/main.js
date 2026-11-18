// Olivia's World — screen navigation.
import { state } from './state.js';
import { editorScreen } from './editor.js';
import { rosterScreen } from './roster.js';
import { galaxyScreen } from './galaxy.js';
import { sceneScreen } from './scene.js';
import { SCENES } from './scenes/index.js';
import { setupMobile } from './mobile.js';

setupMobile();

const app = document.getElementById('app');
let current = null;

const SCREENS = {
  editor: editorScreen,
  roster: rosterScreen,
  galaxy: galaxyScreen,
  scene: (root, ctx) => sceneScreen(root, ctx, SCENES[ctx.params.id]),
};

function go(name, params = {}) {
  current?.destroy?.();
  app.innerHTML = '';
  current = SCREENS[name](app, { go, params });
}

go(state.chars.length ? 'galaxy' : 'editor', state.chars.length ? {} : { newKind: 'kid', first: true });

// Handy for testing from the browser console: __ow.go('scene', { id: 'park' })
window.__ow = { go };
