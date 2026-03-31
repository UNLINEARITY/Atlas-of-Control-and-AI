import '../site/scripts/animate-stats.js';
import '../site/scripts/copy-code.js';
import '../site/scripts/lazy-loading.js';
import '../site/scripts/mobile-enhancements.js';
import '../site/scripts/sidebar-toggle.js';
import { initCallouts } from './modules/callouts.js';
import { refreshIcons } from './modules/icons.js';
import { initImageOverlay } from './modules/image-overlay.js';
import { initPwa } from './modules/pwa.js';
import { initReferences } from './modules/references.js';
import { initSearch } from './modules/search.js';
import { initTimestamps } from './modules/timestamps.js';

document.addEventListener('DOMContentLoaded', () => {
  initCallouts();
  initImageOverlay();
  initPwa();
  initReferences();
  initSearch();
  initTimestamps();
  refreshIcons();
});
