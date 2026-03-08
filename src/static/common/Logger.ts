type LogLevel = 0 | 1 | 2 | 3;

type LogMessage = {
  type: string;
  level: LogLevel;
  content: unknown;
};

type LogListener = (message: LogMessage) => void;

export class Logger {
  static #listeners: LogListener[] = [];

  static get LOG_LEVEL() {
    return {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
    };
  }

  static get MESSAGE_TYPE(): string {
    return 'LOG';
  }

  static addListener(listener: LogListener): void {
    this.#listeners.push(listener);
  }

  static clearListeners(): void {
    this.#listeners = [];
  }

  static log(content: unknown, level: LogLevel = this.LOG_LEVEL.INFO as LogLevel): void {
    this.#listeners.forEach((listener) => {
      listener({ type: this.MESSAGE_TYPE, level: level, content: content });
    }, this);
  }

  static error(content: unknown): void {
    console.error(content);
    this.log(content, this.LOG_LEVEL.ERROR as LogLevel);
  }

  static warn(content: unknown): void {
    console.warn(content);
    this.log(content, this.LOG_LEVEL.WARN as LogLevel);
  }

  static info(content: unknown): void {
    console.info(content);
    this.log(content, this.LOG_LEVEL.INFO as LogLevel);
  }

  static debug(content: unknown): void {
    console.debug(content);
    this.log(content, this.LOG_LEVEL.DEBUG as LogLevel);
  }
}
