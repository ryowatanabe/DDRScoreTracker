import { Logger } from './Logger.js';

export class BrowserController {
  static get STATE() {
    return {
      INITIALIZED: 1,
      CREATING: 2,
      IDLE: 3,
      CLOSING: 4,
      WAITING: 5,
      NAVIGATING: 6,
    };
  }

  constructor(windowId, callback = () => {}) {
    this.tabId = null;
    this.windowId = windowId;
    this.state = this.constructor.STATE.INITIALIZED;
    this.delay = 0;
    this.onUpdateTab = callback;
    this.onUpdateTabInternal = this.onUpdateTabInternalImpl.bind(this);
  }

  onUpdateTabInternalImpl(tid, changeInfo, tab) {
    console.log(`${tid}, ${JSON.stringify(changeInfo)}, ${JSON.stringify(tab)}`);
    if (this.tabId === null) {
      console.error(`BrowserController.onUpdateTabInternalImpl: called when tabId is null`);
      return;
    }
    if (tid != this.tabId) {
      return;
    }
    if (changeInfo.status == 'complete') {
      switch (this.state) {
        case this.constructor.STATE.NAVIGATING:
          this.state = this.constructor.STATE.IDLE;
          this.onUpdateTab();
          break;
        default:
          console.error(`BrowserController.onUpdateTabInternalImpl: state unmatch (current state: ${this.state})`);
          break;
      }
    }
  }

  reset() {
    this.tabId = null;
    this.state = this.constructor.STATE.INITIALIZED;
  }

  createTab(url, active = false) {
    return new Promise((resolve, reject) => {
      if (this.state != this.constructor.STATE.INITIALIZED) {
        reject(new Error(`state unmatch (current state: ${this.state})`));
        return;
      }
      this.state = this.constructor.STATE.CREATING;
      chrome.tabs.onUpdated.addListener(this.onUpdateTabInternal);
      chrome.tabs.create({ windowId: this.windowId, url: url, active: active }, (tab) => {
        console.log(`BrowserController.createTab: tab created (id: ${tab.id}, url: ${url})`);
        this.tabId = tab.id;
        this.state = this.constructor.STATE.NAVIGATING;
        resolve(`tab created (id: ${this.tabId})`);
      });
    });
  }

  updateTab(url, delay = this.delay) {
    return new Promise((resolve, reject) => {
      if (this.state != this.constructor.STATE.IDLE) {
        reject(new Error(`state unmatch (current state: ${this.state})`));
        return;
      }
      this.state = this.constructor.STATE.WAITING;
      setTimeout(() => {
        chrome.tabs.update(this.tabId, { url: url }, (tab) => {
          console.log(`BrowserController.updateTab: navigate to ${url})`);
          if (typeof chrome.runtime.lastError !== 'undefined') {
            this.reset();
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          this.state = this.constructor.STATE.NAVIGATING;
          resolve(`navigate to: ${url}`);
        });
      }, delay);
    });
  }

  closeTab() {
    return new Promise((resolve, reject) => {
      if (this.state != this.constructor.STATE.IDLE) {
        reject(new Error(`state unmatch (current state: ${this.state})`));
        return;
      }
      this.state = this.constructor.STATE.CLOSING;
      chrome.tabs.onUpdated.removeListener(this.onUpdateTabInternal);
      chrome.tabs.remove(this.tabId, () => {
        this.reset();
        if (typeof chrome.runtime.lastError !== 'undefined') {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve('tab closed');
      });
    });
  }

  sendMessageToTab(message, callback) {
    if (this.state != this.constructor.STATE.IDLE) {
      throw new Error(`state unmatch (current state: ${this.state})`);
      return;
    }
    chrome.tabs.sendMessage(this.tabId, message, {}, callback);
  }
}
