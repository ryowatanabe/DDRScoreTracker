import { BrowserController } from '../../common/BrowserController.js';
import { Logger } from '../../common/Logger.js';

const windowId = chrome.windows.WINDOW_ID_CURRENT;
document.getElementById('windowId').value = windowId;
const browserController = new BrowserController(windowId, () => {
  Logger.debug('page loaded');
});

async function createTab() {
  try {
    const url = document.getElementById('targetURL').value;
    await browserController.createTab(url);
    Logger.debug(`tab created`);
  } catch (error) {
    Logger.error(error);
  }
}
document.getElementById('createTabButton').addEventListener('click', createTab);

async function updateTab() {
  try {
    const url = document.getElementById('targetURL').value;
    const delay = document.getElementById('delay').value;
    await browserController.updateTab(url, delay);
    Logger.debug(`navigate to: ${url}`);
  } catch (error) {
    Logger.error(error);
  }
}
document.getElementById('updateTabButton').addEventListener('click', updateTab);

async function closeTab() {
  try {
    await browserController.closeTab();
    Logger.debug(`tab closed`);
  } catch (error) {
    Logger.error(error);
  }
}
document.getElementById('closeTabButton').addEventListener('click', closeTab);

function sendMessageToTab() {
  try {
    browserController.sendMessageToTab({ hoge: 'pos' }, (response) => {
      if (typeof chrome.runtime.lastError !== 'undefined') {
        Logger.error(chrome.runtime.lastError.message);
        return;
      }
      Logger.debug('message sent');
    });
  } catch (error) {
    Logger.error(error);
  }
}
document.getElementById('sendMessageToTabButton').addEventListener('click', sendMessageToTab);
