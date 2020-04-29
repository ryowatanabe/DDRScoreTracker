import { I18n } from '../common/I18n.js';

document.querySelectorAll('[data-i18n-text]').forEach((element) => {
  const key = element.getAttribute('data-i18n-key');
  element.textContent = I18n.getMessage(key);
});
