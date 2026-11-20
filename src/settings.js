// Settings popup: who is playing, log in / out, and "Start over".
import { player, logOut, cloudEnabled } from './accounts.js';
import { resetGame, state, save } from './state.js';
import { el } from './ui.js';

export function openSettings(root, ctx) {
  const ov = el('div', 'modal');
  const card = el('div', 'modal-card settings');
  ov.append(card);
  ov.onclick = (e) => { if (e.target === ov) ov.remove(); };
  root.append(ov);

  function draw(confirming = false) {
    card.innerHTML = `
      <button class="modal-x" aria-label="Close">✕</button>
      <h2>Settings</h2>
      <div class="set-who">${player.guest
        ? '👤 Playing without an account<br><small>Your game is saved on this device only.</small>'
        : `👤 Logged in as <b></b><br><small>${cloudEnabled() ? 'Your game is saved in your account.' : 'Your game is saved on this device.'}</small>`}</div>
      <div class="set-row">
        ${player.guest ? '<button class="btn set-login">Log in or create account</button>' : '<button class="btn alt set-logout">Log out</button>'}
        <button class="btn alt set-sound">${state.muted ? '🔇 Sound off' : '🔊 Sound on'}</button>
      </div>
      <div class="set-danger">
        ${confirming
          ? '<p><b>Start over?</b> All characters, pets, stars and everything you moved will be erased. This can\'t be undone.</p><div class="set-row"><button class="btn danger set-yes">Yes, start over</button><button class="btn alt set-no">Keep my game</button></div>'
          : '<button class="btn alt set-reset">🔄 Start the game over</button>'}
      </div>`;
    const who = card.querySelector('.set-who b');
    if (who) who.textContent = player.name;
    card.querySelector('.modal-x').onclick = () => ov.remove();
    card.querySelector('.set-sound').onclick = () => { state.muted = !state.muted; save(); draw(confirming); };
    card.querySelector('.set-login')?.addEventListener('click', () => { ov.remove(); ctx.go('welcome', { mode: 'login' }); });
    card.querySelector('.set-logout')?.addEventListener('click', async () => { await logOut(); ov.remove(); ctx.go('welcome', { mode: 'login' }); });
    card.querySelector('.set-reset')?.addEventListener('click', () => draw(true));
    card.querySelector('.set-no')?.addEventListener('click', () => draw(false));
    card.querySelector('.set-yes')?.addEventListener('click', () => { resetGame(); ov.remove(); ctx.go('editor', { newKind: 'kid', first: true }); });
  }
  draw();
}
