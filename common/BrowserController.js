import { Logger } from './Logger.js';

export class BrowserController {
  static get STATE() {
    return {
      INITIALIZED: 1,
      CREATING: 2,
      CREATED: 3,
      CLOSING: 4,
      WAITING: 5
    };
  }

  tabId = null;
  windowId = null;
  state = null;

  constructor(windowId) {
    this.windowId = windowId;
    this.state = this.constructor.STATE.INITIALIZED;
  }

  reset() {
    this.tabId = null;
    this.state = this.constructor.STATE.INITIALIZED;
  }

  createTab(active = false) {
    return new Promise((resolve, reject) => {
      if (this.state != this.constructor.STATE.INITIALIZED) {
        reject(new Error(`state unmatch (current state: ${this.state})`));
        return;
      }
      this.state = this.constructor.STATE.CREATING;
      chrome.tabs.create({ windowId: this.windowId, active: active }, (tab) => {
        this.tabId = tab.id;
        this.state = this.constructor.STATE.CREATED;
        resolve(`tab created (id: ${this.tabId})`);
      });
    });
  }

  updateTab(url, delay = 0) {
    return new Promise((resolve, reject) => {
      if (this.state != this.constructor.STATE.CREATED) {
        reject(new Error(`state unmatch (current state: ${this.state})`));
        return;
      }
      this.state = this.constructor.STATE.WAITING;
      setTimeout(() => {
        chrome.tabs.update(this.tabId, { url: url }, (tab) => {
          if (typeof(chrome.runtime.lastError) !== 'undefined') {
            this.reset();
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          this.state = this.constructor.STATE.CREATED;
          resolve(`navigate to: ${url}`);
        });
      }, delay);
    });
  }

  closeTab() {
    return new Promise((resolve, reject) => {
      if (this.state != this.constructor.STATE.CREATED) {
        reject(new Error(`state unmatch (current state: ${this.state})`));
        return;
      }
      this.state = this.constructor.STATE.CLOSING;
      chrome.tabs.remove(this.tabId, () => {
        this.reset();
        if (typeof(chrome.runtime.lastError) !== 'undefined') {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve('tab closed');
      });
    });
  }

  sendMessageToTab(message, callback) {
    if (this.state != this.constructor.STATE.CREATED) {
      throw(new Error(`state unmatch (current state: ${this.state})`));
      return;
    }
    chrome.tabs.sendMessage(this.tabId, message, {}, callback);
  }
}
