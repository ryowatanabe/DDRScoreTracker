document.querySelectorAll('[data-i18n-text]').forEach((element) => {
  const key = element.getAttribute('data-i18n-key');
  element.textContent = chrome.i18n.getMessage(key);
});
