// Phone helpers: no accidental zooming, full screen, and an "add to Home Screen" tip.
import { state, save } from './state.js';
import { el } from './ui.js';

const standalone = () => window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || navigator.standalone === true;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const touch = window.matchMedia('(pointer: coarse)').matches;

export function setupMobile() {
  // iOS ignores user-scalable=no; stop pinch zoom (double-tap zoom is off via touch-action: manipulation).
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  // No "save image / copy" menu on long-press.
  document.addEventListener('contextmenu', (e) => { if (touch) e.preventDefault(); });
  // Keep the page from scrolling under the game.
  document.addEventListener('touchmove', (e) => { if (!e.target.closest('.body, .roster-grid, .modal-card')) e.preventDefault(); }, { passive: false });
}

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });

async function goFullscreen() {
  try {
    await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    await screen.orientation?.lock?.('landscape');
  } catch { /* not supported */ }
}

// A small banner on the galaxy screen for phones that aren't playing full screen yet.
export function installTip() {
  if (!touch || standalone() || state.hideInstallTip) return null;
  const canFull = !!document.documentElement.requestFullscreen && !isIOS;
  const tip = el('div', 'install-tip');
  const text = isIOS
    ? 'Play full screen: tap <b>Share</b> <span class="ios-share">⬆︎</span> then <b>Add to Home Screen</b>'
    : 'Play full screen for the best fun!';
  tip.innerHTML = `<span>${text}</span>`;
  if (!isIOS) {
    const b = el('button', 'btn small', deferredPrompt ? '📲 Install' : '⛶ Full screen');
    b.onclick = async () => {
      if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; }
      else if (canFull) await goFullscreen();
      tip.remove();
    };
    tip.append(b);
  }
  const x = el('button', 'tip-x', '✕');
  x.setAttribute('aria-label', 'Hide tip');
  x.onclick = () => { state.hideInstallTip = true; save(); tip.remove(); };
  tip.append(x);
  return tip;
}
