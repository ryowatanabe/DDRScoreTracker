export class I18n {
  static getMessage(key) {
    const value = chrome.i18n.getMessage(key);
    if (value == '') {
      return key;
    }
    return value;
  }
}
