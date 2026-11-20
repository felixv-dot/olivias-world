// Welcome screen: log in, create an account, or play without one.
import { signUp, logIn, playAsGuest, checkName, checkPassword, cloudEnabled } from './accounts.js';
import { hasGuestProgress, state } from './state.js';
import { el } from './ui.js';

export function welcomeScreen(app, ctx) {
  let mode = ctx.params.mode || 'signup';
  const root = el('div', 'screen welcome');
  const sky = el('div', 'space');
  for (let i = 0; i < 50; i++) {
    const s = el('i', 'twinkle');
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.width = s.style.height = 1 + Math.random() * 3 + 'px';
    s.style.animationDelay = (-Math.random() * 3).toFixed(2) + 's';
    sky.append(s);
  }
  const card = el('div', 'welcome-card');
  root.append(sky, card);
  app.append(root);

  function draw(error = '') {
    const guestHasSave = hasGuestProgress();
    card.innerHTML = `
      <img class="welcome-icon" src="icons/icon-192.png" alt="">
      <h1>Olivia's World</h1>
      <div class="w-tabs">
        <button class="w-tab ${mode === 'signup' ? 'on' : ''}" data-m="signup">Create account</button>
        <button class="w-tab ${mode === 'login' ? 'on' : ''}" data-m="login">Log in</button>
      </div>
      <form class="w-form" autocomplete="on">
        <label>Your name<input name="username" autocomplete="username" maxlength="16" placeholder="e.g. Olivia" required></label>
        <label>Password<input name="password" type="password" autocomplete="${mode === 'signup' ? 'new-password' : 'current-password'}" placeholder="at least 6 characters" required></label>
        ${mode === 'signup' && guestHasSave ? '<label class="w-check"><input type="checkbox" name="bring" checked> Keep the characters I already made</label>' : ''}
        <div class="w-error" role="alert">${error}</div>
        <button class="btn w-go" type="submit">${mode === 'signup' ? 'Create my account ✨' : 'Log in ▶'}</button>
      </form>
      <p class="w-note">${cloudEnabled()
        ? (mode === 'signup' ? 'Your characters and stars are saved in your account — play on any device!' : 'Welcome back!')
        : 'Accounts are saved on this device for now.'}
        ${mode === 'signup' ? '<br>Write your password down somewhere safe 🔒' : ''}</p>
      <button class="w-guest">Play without an account →</button>`;
    card.querySelectorAll('.w-tab').forEach((b) => { b.onclick = () => { mode = b.dataset.m; draw(); }; });
    const form = card.querySelector('form');
    const go = card.querySelector('.w-go');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = form.username.value, pass = form.password.value;
      const problem = checkName(name) || checkPassword(pass);
      if (problem) { card.querySelector('.w-error').textContent = problem; return; }
      go.disabled = true;
      go.textContent = 'One moment…';
      try {
        if (mode === 'signup') await signUp(name, pass, { bringGuest: !!form.bring?.checked });
        else await logIn(name, pass);
        next();
      } catch (err) {
        const keepName = name;
        draw(err.message || 'Something went wrong.');
        card.querySelector('[name=username]').value = keepName;
      }
    };
    card.querySelector('.w-guest').onclick = () => { playAsGuest(); next(); };
    setTimeout(() => card.querySelector('[name=username]')?.focus({ preventScroll: true }), 200);
  }
  const next = () => (state.chars.length ? ctx.go('galaxy') : ctx.go('editor', { newKind: 'kid', first: true }));
  draw();
  return {};
}
