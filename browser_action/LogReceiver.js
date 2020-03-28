export class LogReceiver {
  static data = [];
  static callback = function(){};

  static flush() {
    this.data.splice(0);
  };

  static push(content) {
    if (!Array.isArray(content)) {
      content = [ content ];
    }
    content.forEach (function(line){
      this.data.push(line);
    }, this);
    if (typeof(Vue) !== 'undefined') {
      Vue.nextTick(this.callback);
    }
  }
}

(function()
{
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type == 'LOG') {
      LogReceiver.push(message.content);
    }
  });
})();
