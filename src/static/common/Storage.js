import { Logger } from './Logger.js';

export class Storage {
  storageData = {};
  defaultData = {};
  loadCallback = function () {};
  bytesInUse = 0;

  constructor(defaultData = {}, loadCallback = function () {}) {
    this.defaultData = defaultData;
    this.loadCallback = loadCallback;
    this.loadStorage();
  }

  loadStorage(callback = this.loadCallback) {
    chrome.storage.local.get(this.defaultData, (data) => {
      this.storageData = data;
      this.updateBytesInUse();
      callback(data);
    });
  }

  saveStorage(data = {}, callback = function () {}) {
    chrome.storage.local.set(data, () => {
      this.storageData = data;
      this.updateBytesInUse();
      callback();
    });
  }

  resetStorage(callback = function () {}) {
    Logger.info('端末上に保存しているデータを削除します.');
    chrome.storage.local.clear(() => {
      Logger.info('完了しました.');
      this.loadStorage();
      callback();
    });
  }

  updateBytesInUse(callback = function () {}) {
    chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
      this.bytesInUse = bytesInUse;
      callback(bytesInUse);
    });
  }
}
