import { H as Hls } from './hls-vendor-dru42stk.js';

export function initMoviePlayer(source) {
  const video = document.querySelector('[data-player]');
  const overlay = document.querySelector('[data-play-overlay]');
  const button = document.querySelector('[data-play-button]');
  if (!video || !source) {
    return;
  }
  let attached = false;
  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }
    if (Hls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }
    video.src = source;
  }
  async function start() {
    attach();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    try {
      await video.play();
    } catch (error) {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    }
  }
  if (button) {
    button.addEventListener('click', start);
  }
  if (overlay) {
    overlay.addEventListener('click', start);
  }
  video.addEventListener('click', () => {
    if (video.paused) {
      start();
    }
  });
}
