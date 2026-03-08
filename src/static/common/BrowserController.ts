import { Logger } from './Logger.js';

export class BrowserController {
  tabId: number | null;
  windowId: number;
  state: number;
  delay: number;
  onUpdateTab: () => void;
  onUpdateTabInternal: (tid: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => void;

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

  constructor(windowId: number, onUpdateTab: () => void = () => {}) {
    this.tabId = null;
    this.windowId = windowId;
    this.state = BrowserController.STATE.INITIALIZED;
    this.delay = 0;
    this.onUpdateTab = onUpdateTab;
    this.onUpdateTabInternal = this.onUpdateTabInternalImpl.bind(this);
  }

  onUpdateTabInternalImpl(tid: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void {
    if (this.tabId === null) {
      Logger.error(`BrowserController.onUpdateTabInternalImpl: called when tabId is null`);
      return;
    }
    if (tid !== this.tabId) {
      return;
    }
    Logger.debug(`${tid}, ${JSON.stringify(changeInfo)}, ${JSON.stringify(tab)}`);
    if (changeInfo.status === 'complete') {
      switch (this.state) {
        case BrowserController.STATE.NAVIGATING:
          this.changeState(BrowserController.STATE.IDLE);
          this.onUpdateTab();
          break;
        default:
          Logger.error(`BrowserController.onUpdateTabInternalImpl: state unmatch (current state: ${this.state})`);
          break;
      }
    }
  }

  reset(): void {
    chrome.tabs.onUpdated.removeListener(this.onUpdateTabInternal);
    this.tabId = null;
    this.changeState(BrowserController.STATE.INITIALIZED);
  }

  createTab(url: string, active: boolean = false): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.state !== BrowserController.STATE.INITIALIZED) {
        reject(new Error(`BrowserController.createTab: state unmatch (current state: ${this.state})`));
        return;
      }
      this.changeState(BrowserController.STATE.CREATING);
      chrome.tabs.onUpdated.addListener(this.onUpdateTabInternal);
      chrome.tabs.create({ windowId: this.windowId, url: url, active: active }, (tab) => {
        Logger.debug(`BrowserController.createTab: tab created (id: ${tab.id}, url: ${url})`);
        this.tabId = tab.id ?? null;
        this.changeState(BrowserController.STATE.NAVIGATING);
        resolve(`tab created (id: ${this.tabId})`);
      });
    });
  }

  updateTab(url: string, delay: number = this.delay): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.state !== BrowserController.STATE.IDLE) {
        reject(new Error(`BrowserController.updateTab: state unmatch (current state: ${this.state})`));
        return;
      }
      this.changeState(BrowserController.STATE.WAITING);
      setTimeout(() => {
        if (this.state === BrowserController.STATE.WAITING) {
          chrome.tabs.update(this.tabId as number, { url: url }, (_tab) => {
            Logger.debug(`BrowserController.updateTab: navigate to ${url})`);
            if (typeof chrome.runtime.lastError !== 'undefined') {
              this.reset();
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            this.changeState(BrowserController.STATE.NAVIGATING);
            resolve(`navigate to: ${url}`);
          });
        }
      }, delay);
    });
  }

  closeTab(force: boolean = false): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!force && this.state !== BrowserController.STATE.IDLE) {
        reject(new Error(`BrowserController.closeTab: state unmatch (current state: ${this.state})`));
        return;
      }
      this.changeState(BrowserController.STATE.CLOSING);
      chrome.tabs.onUpdated.removeListener(this.onUpdateTabInternal);
      chrome.tabs.remove(this.tabId as number, () => {
        this.reset();
        if (typeof chrome.runtime.lastError !== 'undefined') {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve('tab closed');
      });
    });
  }

  sendMessageToTab(message: unknown, callback: (response: unknown) => void): void {
    if (this.state !== BrowserController.STATE.IDLE) {
      throw new Error(`BrowserController.sendMessageToTab: state unmatch (current state: ${this.state})`);
    }
    chrome.tabs.sendMessage(this.tabId as number, message, {}, callback);
  }

  changeState(nextState: number): void {
    Logger.debug(`BrowserController.changeState: ${this.state} -> ${nextState}`);
    this.state = nextState;
  }
}
