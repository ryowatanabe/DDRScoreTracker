export class I18n {
  static getMessage(key, substitutions, options) {
    if (!Array.isArray(substitutions)) {
      substitutions = [substitutions];
    }
    const value = chrome.i18n.getMessage(key, substitutions, options);
    if (value == '') {
      return `[[${key}]]`;
    }
    return value;
  }
}
