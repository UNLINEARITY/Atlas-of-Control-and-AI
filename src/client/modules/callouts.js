import { refreshIcons } from './icons.js';

export function initCallouts() {
  document.querySelectorAll('.callout').forEach((callout) => {
    const icon = getComputedStyle(callout).getPropertyValue('--callout-icon');
    const iconName = icon && icon.trim().replace(/^lucide-/, '');
    const title = callout.querySelector('.callout-title');

    if (iconName && title && !title.querySelector('.callout-icon')) {
      const iconContainer = document.createElement('div');
      const iconElement = document.createElement('i');

      iconElement.setAttribute('icon-name', iconName);
      iconContainer.className = 'callout-icon';
      iconContainer.appendChild(iconElement);
      title.insertBefore(iconContainer, title.firstChild);
    }

    if (callout.classList.contains('is-collapsible') && !callout.dataset.calloutBound) {
      title?.addEventListener('click', () => {
        callout.classList.toggle('is-collapsed');
      });
      callout.dataset.calloutBound = 'true';
    }
  });

  refreshIcons();
}
