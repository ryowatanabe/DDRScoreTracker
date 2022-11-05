import { App } from '../common/App.js';
import { STATE } from '../common/AppState.js';
const app = new App();

function saveOptions() {
  const options = {
    enableDebugLog: document.querySelector('[name=enableDebugLog]').checked,
    openTabAsActive: document.querySelector('[name=openTabAsActive]').checked,
    notCloseTabAfterUse: document.querySelector('[name=notCloseTabAfterUse]').checked,
    notSendDataToSkillAttack: document.querySelector('[name=notSendDataToSkillAttack]').checked,
    enableA20PlusSiteAccess: document.querySelector('[name=enableA20PlusSiteAccess]').checked,
    musicListReloadInterval: parseInt(document.querySelector('[name=musicListReloadInterval]').value, 10),
  };
  app.saveOptions(options);
}

function onInitialized() {
  // ToDo: オプション定義を設定に切り出す

  const options = app.getOptions();
  document.querySelector('[name=enableDebugLog]').checked = options.enableDebugLog;
  document.querySelector('[name=openTabAsActive]').checked = options.openTabAsActive;
  document.querySelector('[name=notCloseTabAfterUse]').checked = options.notCloseTabAfterUse;
  document.querySelector('[name=notSendDataToSkillAttack]').checked = options.notSendDataToSkillAttack;
  document.querySelector('[name=enableA20PlusSiteAccess]').checked = options.enableA20PlusSiteAccess;
  document.querySelector('[name=musicListReloadInterval]').value = options.musicListReloadInterval;

  document.querySelector('[name=enableDebugLog]').addEventListener('click', saveOptions);
  document.querySelector('[name=openTabAsActive]').addEventListener('click', saveOptions);
  document.querySelector('[name=notCloseTabAfterUse]').addEventListener('click', saveOptions);
  document.querySelector('[name=notSendDataToSkillAttack]').addEventListener('click', saveOptions);
  document.querySelector('[name=enableA20PlusSiteAccess]').addEventListener('click', saveOptions);
  document.querySelector('[name=musicListReloadInterval]').addEventListener('change', saveOptions);

  const extension_id = chrome.i18n.getMessage('@@extension_id');
  document.getElementById('options_openDebugPage').href = `chrome-extension://${extension_id}/browser_action/debug/index.html`;
}

function initialize() {
  if (app.getState() == STATE.INITIALIZE) {
    setTimeout(initialize, 100);
  } else {
    onInitialized();
  }
}

(function () {
  initialize();
})();
