const OFFLINE_INDICATOR_SELECTOR = '.offline-indicator';

function ensureOfflineIndicator() {
  if (navigator.onLine || document.querySelector(OFFLINE_INDICATOR_SELECTOR)) {
    return;
  }

  const indicator = document.createElement('div');
  indicator.className = 'offline-indicator';
  indicator.textContent = 'Offline mode';
  document.body.appendChild(indicator);

  window.setTimeout(() => {
    indicator.remove();
  }, 3000);
}

function updateNetworkStatus() {
  document.body.classList.toggle('offline', !navigator.onLine);

  if (navigator.onLine) {
    document.querySelector(OFFLINE_INDICATOR_SELECTOR)?.remove();
  } else {
    ensureOfflineIndicator();
  }
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service worker registration failed.', error);
    });
  });
}

function setupInstallPrompt() {
  let deferredPrompt = null;
  const originalTitle = document.title;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;

    const siteNameMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (siteNameMeta?.content) {
      document.title = siteNameMeta.content;
    }

    window.dispatchEvent(
      new CustomEvent('pwa_prompt_available', {
        detail: deferredPrompt,
      })
    );

    deferredPrompt.userChoice.finally(() => {
      document.title = originalTitle;
      deferredPrompt = null;
    });
  });
}

export function initPwa() {
  if (document.body.dataset.pwaInitialized) {
    return;
  }

  registerServiceWorker();
  setupInstallPrompt();
  updateNetworkStatus();
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  document.body.dataset.pwaInitialized = 'true';
}
