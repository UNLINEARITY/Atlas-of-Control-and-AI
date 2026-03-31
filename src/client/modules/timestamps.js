export function initTimestamps() {
  const format = document.body.dataset.timestampFormat;
  if (!format || !window.luxon?.DateTime) {
    return;
  }

  document.querySelectorAll('.human-date').forEach((element) => {
    const value = element.getAttribute('data-date') || element.innerText;
    let parsed = window.luxon.DateTime.fromISO(value);

    if (parsed.invalid != null) {
      parsed = window.luxon.DateTime.fromSQL(value);
    }
    if (parsed.invalid != null) {
      parsed = window.luxon.DateTime.fromHTTP(value);
    }
    if (parsed.invalid != null) {
      return;
    }

    element.innerHTML = parsed.toFormat(format);
  });
}
