import { BrowserController } from '../../common/BrowserController.js';
import { Logger } from '../../common/Logger.js';

const windowId = chrome.windows.WINDOW_ID_CURRENT;
$('#windowId').val(windowId);
const browserController = new BrowserController(windowId);

async function createTab() {
  try {
    await browserController.createTab();
  } catch (error) {
    Logger.error(error);
  }
}
document.getElementById('createTabButton').addEventListener("click", createTab);

async function updateTab() {
  try {
    const url = $('#targetURL').val()
    await browserController.updateTab(url);
    Logger.debug(`navigate to: ${url}`);
  } catch (error) {
    Logger.error(error);
  }
}
document.getElementById('updateTabButton').addEventListener("click", updateTab);

async function closeTab() {
  try {
    await browserController.closeTab();
  } catch (error) {
    Logger.error(error);
  }
}
document.getElementById('closeTabButton').addEventListener("click", closeTab);

function sendMessageToTab() {
  try {
    browserController.sendMessageToTab({ hoge: "pos" }, (response) => {
      if (typeof(chrome.runtime.lastError) !== 'undefined') {
        Logger.error(chrome.runtime.lastError.message);
        return;
      }
      Logger.debug("message sent");
    });
  } catch (error) {
    Logger.error(error);
  }
}
document.getElementById('sendMessageToTabButton').addEventListener("click", sendMessageToTab);
