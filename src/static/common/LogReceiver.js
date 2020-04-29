import { Logger } from './Logger.js';

export class LogReceiver {
  constructor(callback = () => {}) {
    this.data = [];
    this.callback = callback;
    this.enableDebugLog = false;

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.level == Logger.LOG_LEVEL.DEBUG && this.enableDebugLog != true) {
        return;
      }
      if (message.type == Logger.MESSAGE_TYPE) {
        this.push(message.content);
      }
    });
  }

  flush() {
    this.data.splice(0);
  }

  push(content) {
    if (!Array.isArray(content)) {
      content = [content];
    }
    content.forEach((line) => {
      this.data.push(line);
    });
    this.callback();
  }
}
