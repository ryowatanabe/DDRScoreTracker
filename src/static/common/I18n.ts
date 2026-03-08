export class I18n {
  static getMessage(key: string, substitutions?: string | string[], options?: chrome.i18n.LanguageHeaderParamOptions): string {
    if (!Array.isArray(substitutions)) {
      substitutions = [substitutions as string];
    }
    const value = chrome.i18n.getMessage(key, substitutions, options);
    if (value === '') {
      return `[[${key}]]`;
    }
    return value;
  }
}
