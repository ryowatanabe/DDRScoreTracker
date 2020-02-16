var LOG_RECEIVER = LOG_RECEIVER || {};

LOG_RECEIVER.data = [];

LOG_RECEIVER.flush = function () {
  this.data = [];
};

LOG_RECEIVER.push = function (content) {
  this.data.push(content);
};

(function()
{
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type == 'LOG') {
      LOG_RECEIVER.push(message.content);
    }
  });
})();
