(function () {
  const extension_id = chrome.i18n.getMessage('@@extension_id');
  chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: `chrome-extension://${extension_id}/browser_action/index.html` }, function (_tab) {});
  });
})();
