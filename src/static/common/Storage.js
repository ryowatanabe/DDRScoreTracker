import { Logger } from './Logger.js';
import { I18n } from './I18n.js';

export class Storage {
  constructor(defaultData = {}) {
    this.storageData = {};
    this.defaultData = defaultData;
    this.bytesInUse = 0;
    this.ready = this.loadStorage();
  }

  async loadStorage() {
    const data = await chrome.storage.local.get(this.defaultData);
    this.storageData = data;
    await this.updateBytesInUse();
    return data;
  }

  async saveStorage(data = {}) {
    await chrome.storage.local.set(data);
    this.storageData = data;
    await this.updateBytesInUse();
  }

  async resetStorage() {
    Logger.info(I18n.getMessage('log_message_reset_local_storage_begin'));
    await chrome.storage.local.clear();
    Logger.info(I18n.getMessage('log_message_done'));
    await this.loadStorage();
  }

  async updateBytesInUse() {
    const bytesInUse = await chrome.storage.local.getBytesInUse(null);
    this.bytesInUse = bytesInUse;
    return bytesInUse;
  }
}
