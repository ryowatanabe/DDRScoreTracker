function saveOptions() {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    const options = {
      enableDebugLog: document.querySelector('[name=enableDebugLog]').checked,
      openTabAsActive: document.querySelector('[name=openTabAsActive]').checked,
      notCloseTabAfterUse: document.querySelector('[name=notCloseTabAfterUse]').checked,
      notSendDataToSkillAttack: document.querySelector('[name=notSendDataToSkillAttack]').checked,
      musicListReloadInterval: parseInt(document.querySelector('[name=musicListReloadInterval]').value, 10),
    };
    backgroundPage.saveOptions(options);
  });
}

(function () {
  /* ToDo: オプション定義を設定に切り出す */
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    const options = backgroundPage.getOptions();
    document.querySelector('[name=enableDebugLog]').checked = options.enableDebugLog;
    document.querySelector('[name=openTabAsActive]').checked = options.openTabAsActive;
    document.querySelector('[name=notCloseTabAfterUse]').checked = options.notCloseTabAfterUse;
    document.querySelector('[name=notSendDataToSkillAttack]').checked = options.notSendDataToSkillAttack;
    document.querySelector('[name=musicListReloadInterval]').value = options.musicListReloadInterval;
  });
  document.querySelector('[name=enableDebugLog]').addEventListener('click', saveOptions);
  document.querySelector('[name=openTabAsActive]').addEventListener('click', saveOptions);
  document.querySelector('[name=notCloseTabAfterUse]').addEventListener('click', saveOptions);
  document.querySelector('[name=notSendDataToSkillAttack]').addEventListener('click', saveOptions);
  document.querySelector('[name=musicListReloadInterval]').addEventListener('change', saveOptions);
})();
