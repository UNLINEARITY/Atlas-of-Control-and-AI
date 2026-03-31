export function initReferences() {
  const currentHash = window.location.hash.slice(1);
  if (currentHash) {
    document.getElementById(currentHash)?.classList.add('referred');
  }

  if (!document.body.dataset.referenceHashBound) {
    window.addEventListener(
      'hashchange',
      (event) => {
        const oldHash = new URL(event.oldURL).hash.slice(1);
        const newHash = new URL(event.newURL).hash.slice(1);

        if (oldHash) {
          document.getElementById(oldHash)?.classList.remove('referred');
        }
        if (newHash) {
          document.getElementById(newHash)?.classList.add('referred');
        }
      },
      false
    );
    document.body.dataset.referenceHashBound = 'true';
  }

  document.querySelectorAll('.cm-s-obsidian > *[id]').forEach((element) => {
    if (element.dataset.referenceCopyBound) {
      return;
    }

    element.addEventListener('dblclick', async (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLElement) || !target.id || !navigator.clipboard) {
        return;
      }

      try {
        await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${target.id}`);
      } catch (error) {
        console.warn('Unable to copy heading link.', error);
      }
    });

    element.dataset.referenceCopyBound = 'true';
  });
}
