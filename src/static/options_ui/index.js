function saveOptions() {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    const options = {
      enableDebugLog: document.querySelector('[name=enableDebugLog]').checked,
      notCloseTabAfterUse: document.querySelector('[name=notCloseTabAfterUse]').checked,
    };
    backgroundPage.saveOptions(options);
  });
}

(function () {
  /* ToDo: オプション定義を設定に切り出す */
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    const options = backgroundPage.getOptions();
    document.querySelector('[name=enableDebugLog]').checked = options.enableDebugLog;
    document.querySelector('[name=notCloseTabAfterUse]').checked = options.notCloseTabAfterUse;
  });
  document.querySelector('[name=enableDebugLog]').addEventListener('click', saveOptions);
  document.querySelector('[name=notCloseTabAfterUse]').addEventListener('click', saveOptions);
})();
