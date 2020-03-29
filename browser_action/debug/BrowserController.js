import { BrowserController } from '../../common/BrowserController.js';
import { Logger } from '../../common/Logger.js';

const windowId = chrome.windows.WINDOW_ID_CURRENT;
$('#windowId').val(windowId);
const browserController = new BrowserController(windowId);

async function createTab() {
  try {
    await browserController.createTab();
  } catch (error) {
    Logger.debug(error);
  }
}
document.getElementById('createTabButton').addEventListener("click", createTab);

async function updateTab() {
  try {
    await browserController.updateTab($('#targetURL').val());
  } catch (error) {
    Logger.debug(error);
  }
}
document.getElementById('updateTabButton').addEventListener("click", updateTab);

async function closeTab() {
  try {
    await browserController.closeTab();
  } catch (error) {
    Logger.debug(error);
  }
}
document.getElementById('closeTabButton').addEventListener("click", closeTab);
