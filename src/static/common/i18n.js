document.querySelectorAll('[data-i18n-text]').forEach((element) => {
  const key = element.getAttribute('data-i18n-key');
  const value = chrome.i18n.getMessage(key);
  if (value == '') {
    element.textContent = key;
  } else {
    element.textContent = value;
  }
});
