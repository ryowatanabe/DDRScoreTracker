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

  constructor(windowId, onUpdateTab = () => {}) {
    this.tabId = null;
    this.windowId = windowId;
    this.state = this.constructor.STATE.INITIALIZED;
    this.delay = 0;
    this.onUpdateTab = onUpdateTab;
    this.onUpdateTabInternal = this.onUpdateTabInternalImpl.bind(this);
  }

  onUpdateTabInternalImpl(tid, changeInfo, tab) {
    if (this.tabId === null) {
      Logger.error(`BrowserController.onUpdateTabInternalImpl: called when tabId is null`);
      return;
    }
    if (tid != this.tabId) {
      return;
    }
    Logger.debug(`${tid}, ${JSON.stringify(changeInfo)}, ${JSON.stringify(tab)}`);
    if (changeInfo.status == 'complete') {
      switch (this.state) {
        case this.constructor.STATE.NAVIGATING:
          this.changeState(this.constructor.STATE.IDLE);
          this.onUpdateTab();
          break;
        default:
          Logger.error(`BrowserController.onUpdateTabInternalImpl: state unmatch (current state: ${this.state})`);
          break;
      }
    }
  }

  reset() {
    chrome.tabs.onUpdated.removeListener(this.onUpdateTabInternal);
    this.tabId = null;
    this.changeState(this.constructor.STATE.INITIALIZED);
  }

  createTab(url, active = false) {
    return new Promise((resolve, reject) => {
      if (this.state != this.constructor.STATE.INITIALIZED) {
        reject(new Error(`BrowserController.createTab: state unmatch (current state: ${this.state})`));
        return;
      }
      this.changeState(this.constructor.STATE.CREATING);
      chrome.tabs.onUpdated.addListener(this.onUpdateTabInternal);
      chrome.tabs.create({ windowId: this.windowId, url: url, active: active }, (tab) => {
        Logger.debug(`BrowserController.createTab: tab created (id: ${tab.id}, url: ${url})`);
        this.tabId = tab.id;
        this.changeState(this.constructor.STATE.NAVIGATING);
        resolve(`tab created (id: ${this.tabId})`);
      });
    });
  }

  updateTab(url, delay = this.delay) {
    return new Promise((resolve, reject) => {
      if (this.state != this.constructor.STATE.IDLE) {
        reject(new Error(`BrowserController.updateTab: state unmatch (current state: ${this.state})`));
        return;
      }
      this.changeState(this.constructor.STATE.WAITING);
      setTimeout(() => {
        if (this.state == this.constructor.STATE.WAITING) {
          chrome.tabs.update(this.tabId, { url: url }, (tab) => {
            Logger.debug(`BrowserController.updateTab: navigate to ${url})`);
            if (typeof chrome.runtime.lastError !== 'undefined') {
              this.reset();
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            this.changeState(this.constructor.STATE.NAVIGATING);
            resolve(`navigate to: ${url}`);
          });
        }
      }, delay);
    });
  }

  closeTab(force = false) {
    return new Promise((resolve, reject) => {
      if (!force && this.state != this.constructor.STATE.IDLE) {
        reject(new Error(`BrowserController.closeTab: state unmatch (current state: ${this.state})`));
        return;
      }
      this.changeState(this.constructor.STATE.CLOSING);
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
      throw new Error(`BrowserController.sendMessageToTab: state unmatch (current state: ${this.state})`);
      return;
    }
    chrome.tabs.sendMessage(this.tabId, message, {}, callback);
  }

  changeState(nextState) {
    Logger.debug(`BrowserController.changeState: ${this.state} -> ${nextState}`);
    this.state = nextState;
  }
}
