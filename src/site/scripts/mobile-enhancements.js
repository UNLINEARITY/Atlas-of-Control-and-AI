document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const isTouch = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  const isNarrowViewport = window.matchMedia('(max-width: 768px)').matches;

  if (isTouch) {
    const togglePressState = (event, pressed) => {
      const target = event.target.closest('a, button, [role="button"]');
      if (!target) {
        return;
      }

      target.classList.toggle('is-touch-active', pressed);
    };

    document.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'touch') {
        return;
      }
      togglePressState(event, true);
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach((type) => {
      document.addEventListener(type, (event) => {
        if (event.pointerType !== 'touch') {
          return;
        }
        togglePressState(event, false);
      });
    });
  }

  if (isNarrowViewport) {
    document.querySelectorAll('input, textarea, select').forEach((input) => {
      if (input.dataset.mobileScrollBound) {
        return;
      }

      input.addEventListener('focus', function () {
        window.setTimeout(() => {
          this.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 200);
      });

      input.dataset.mobileScrollBound = 'true';
    });
  }
});
