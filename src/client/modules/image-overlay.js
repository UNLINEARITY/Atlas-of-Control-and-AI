function buildOverlay(image) {
  const overlay = document.createElement('div');
  const enlargedImage = document.createElement('img');

  overlay.className = 'image-overlay';
  enlargedImage.src = image.currentSrc || image.src;
  enlargedImage.alt = image.alt || '';
  overlay.appendChild(enlargedImage);

  let scale = 1;
  let panning = false;
  let pointX = 0;
  let pointY = 0;
  let start = { x: 0, y: 0 };

  const setTransform = () => {
    enlargedImage.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
  };

  enlargedImage.addEventListener('mousedown', (event) => {
    event.preventDefault();
    panning = true;
    start = { x: event.clientX - pointX, y: event.clientY - pointY };
    enlargedImage.style.cursor = 'grabbing';
  });

  overlay.addEventListener('mouseup', () => {
    panning = false;
    enlargedImage.style.cursor = 'grab';
  });

  overlay.addEventListener('mouseleave', () => {
    panning = false;
    enlargedImage.style.cursor = 'grab';
  });

  overlay.addEventListener('mousemove', (event) => {
    if (!panning) {
      return;
    }

    pointX = event.clientX - start.x;
    pointY = event.clientY - start.y;
    setTransform();
  });

  overlay.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const delta = event.wheelDelta ? event.wheelDelta : -event.deltaY;
      scale = delta > 0 ? scale * 1.2 : scale / 1.2;
      setTransform();
    },
    { passive: false }
  );

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      overlay.remove();
    }
  });

  return overlay;
}

export function initImageOverlay() {
  document.querySelectorAll('.content img').forEach((image) => {
    if (image.dataset.overlayBound) {
      return;
    }

    image.addEventListener('click', () => {
      const existing = document.querySelector('.image-overlay');
      existing?.remove();
      document.body.appendChild(buildOverlay(image));
    });

    image.dataset.overlayBound = 'true';
  });

  if (!document.body.dataset.imageOverlayEscapeBound) {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        document.querySelector('.image-overlay')?.remove();
      }
    });
    document.body.dataset.imageOverlayEscapeBound = 'true';
  }
}
