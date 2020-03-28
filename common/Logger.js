export class Logger {
  static get LOG_LEVEL() {
    return {
      DEBUG: 0,
      INFO:  1,
      WARN:  2,
      ERROR: 3
    }
  }

  static log(content, level = this.LOG_LEVEL.INFO) {
    chrome.runtime.sendMessage({ type: 'LOG', level: level, content: content });
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
