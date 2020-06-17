import { Logger } from './Logger.js';
import { I18n } from './I18n.js';

export class Storage {
  constructor(defaultData = {}, loadCallback = function () {}) {
    this.storageData = {};
    this.defaultData = defaultData;
    this.loadCallback = loadCallback;
    this.bytesInUse = 0;
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
    Logger.info(I18n.getMessage('log_message_reset_local_storage_begin'));
    chrome.storage.local.clear(() => {
      Logger.info(I18n.getMessage('log_message_done'));
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
