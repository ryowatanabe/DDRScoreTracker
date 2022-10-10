export class Logger {
  static get LOG_LEVEL() {
    return {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
    };
  }

  static get MESSAGE_TYPE() {
    return 'LOG';
  }

  static log(content, level = this.LOG_LEVEL.INFO) {
    chrome.runtime.sendMessage({ type: this.MESSAGE_TYPE, level: level, content: content }, () => {
      if (chrome.runtime.lastError != '') {
        // メッセージ受信側がコールバックを呼び出さなかった場合
        // "The message port closed before a response was received." が
        // chrome.runtime.lastError.message にセットされた状態でコールバックが呼び出される
        // セットされた chrome.runtime.lastError に触らないと怒られるので、一度参照だけしておく
        // see: https://developer.chrome.com/docs/extensions/reference/runtime/#method-sendMessage
      }
    });
  }

  static error(content) {
    console.error(content);
    this.log(content, this.LOG_LEVEL.ERROR);
  }

  static warn(content) {
    console.warn(content);
    this.log(content, this.LOG_LEVEL.WARN);
  }

  static info(content) {
    console.info(content);
    this.log(content, this.LOG_LEVEL.INFO);
  }

  static debug(content) {
    console.log(content);
    this.log(content, this.LOG_LEVEL.DEBUG);
  }
}
