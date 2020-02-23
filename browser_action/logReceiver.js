var LOG_RECEIVER = LOG_RECEIVER || {};

LOG_RECEIVER.data = [];

LOG_RECEIVER.flush = function () {
  this.data.splice(0);
};

LOG_RECEIVER.push = function (content) {
  this.data.push(content);
  if (typeof(Vue) !== 'undefined') {
    Vue.nextTick(this.callback);
  }
};

LOG_RECEIVER.callback = function () {
};

(function()
{
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type == 'LOG') {
      LOG_RECEIVER.push(message.content);
    }
  });
})();
