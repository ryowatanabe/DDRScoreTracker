var LOGGER = LOGGER || {};

LOGGER.LOG_LEVEL = {
  DEBUG: 0,
  INFO:  1
};

LOGGER.log = function (content, level = LOG_LEVEL.INFO) {
  console.log(`log (${level}) ${content}`);
  chrome.runtime.sendMessage({ type: 'LOG', level: level, content: content });
}

LOGGER.info = function (content) {
  this.log(content, this.LOG_LEVEL.INFO);
}

LOGGER.debug = function (content) {
  this.log(content, this.LOG_LEVEL.DEBUG);
}
