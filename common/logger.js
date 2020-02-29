var LOGGER = LOGGER || {};

LOGGER.LOG_LEVEL = {
  DEBUG: 0,
  INFO:  1,
  WARN:  2,
  ERROR: 3
};

LOGGER.log = function (content, level = LOG_LEVEL.INFO) {
  chrome.runtime.sendMessage({ type: 'LOG', level: level, content: content });
}

LOGGER.error = function (content) {
  console.error(content);
  this.log(content, this.LOG_LEVEL.ERROR);
}

LOGGER.warn = function (content) {
  console.warn(content);
  this.log(content, this.LOG_LEVEL.WARN);
}

LOGGER.info = function (content) {
  console.info(content);
  this.log(content, this.LOG_LEVEL.INFO);
}

LOGGER.debug = function (content) {
  console.log(content);
  this.log(content, this.LOG_LEVEL.DEBUG);
}
