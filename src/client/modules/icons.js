export function refreshIcons() {
  if (!window.lucide || typeof window.lucide.createIcons !== 'function') {
    return;
  }

  window.lucide.createIcons({
    attrs: {
      class: ['svg-icon'],
    },
  });
}
