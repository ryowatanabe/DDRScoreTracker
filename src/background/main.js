(function () {
  const extension_id = chrome.i18n.getMessage('@@extension_id');
  chrome.action.onClicked.addListener(() => {
    // 二重起動抑止
    chrome.tabs.query({ url: `chrome-extension://${extension_id}/browser_action/*` }, (tabs) => {
      if (tabs.length == 0) {
        chrome.tabs.create({ url: `chrome-extension://${extension_id}/browser_action/index.html` }, function (_tab) {});
      } else {
        const windowId = tabs[0].windowId;
        const tabIndex = tabs[0].index;
        chrome.windows.update(windowId, { focused: true });
        chrome.tabs.highlight({ windowId: windowId, tabs: tabIndex });
      }
    });
  });
})();
