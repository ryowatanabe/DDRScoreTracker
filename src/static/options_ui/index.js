function saveOptions() {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    const options = {
      enableDebugLog: document.querySelector('[name=enableDebugLog]').checked,
    };
    backgroundPage.saveOptions(options);
  });
}

(function () {
  /* ToDo: オプション定義を設定に切り出す */
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    const options = backgroundPage.getOptions();
    document.querySelector('[name=enableDebugLog]').checked = options.enableDebugLog;
  });
  document.querySelector('[name=enableDebugLog]').addEventListener('click', saveOptions);
})();
