export class I18n {
  static getMessage(key: string, substitutions?: string | string[]): string {
    if (!Array.isArray(substitutions)) {
      substitutions = [substitutions as string];
    }
    const value = chrome.i18n.getMessage(key, substitutions);
    if (value === '') {
      return `[[${key}]]`;
    }
    return value;
  }
}
