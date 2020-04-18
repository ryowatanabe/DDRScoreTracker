import { Logger } from './Logger.js';

export class LogReceiver {
  constructor(callback = () => {}) {
    this.data = [];
    this.callback = callback;

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
