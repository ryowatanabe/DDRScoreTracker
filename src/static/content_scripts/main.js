let Logger;
let Parser;

async function loadModules() {
  const logger = await import(chrome.runtime.getURL('common/Logger.js'));
  Logger = logger.Logger;
  const parser = await import(chrome.runtime.getURL('common/Parser.js'));
  Parser = parser.Parser;
  Logger.debug('modules loaded.');
}

function onMessage(message, sender, sendResponse) {
  loadModules().then(
    (_value) => {
      try {
        if (message.type === 'PARSE_MUSIC_LIST') {
          Logger.debug('parsing music list ...');
          sendResponse(Parser.parseMusicList(document.body, message.gameVersion));
          return;
        }
        if (message.type === 'PARSE_MUSIC_DETAIL') {
          Logger.debug('parsing music detail ...');
          sendResponse(Parser.parseMusicDetail(document.body, message.gameVersion));
          return;
        }
        if (message.type === 'PARSE_SCORE_LIST') {
          Logger.debug('parsing score list ...');
          sendResponse(Parser.parseScoreList(document.body, message.gameVersion));
          return;
        }
        if (message.type === 'PARSE_SCORE_DETAIL') {
          Logger.debug('parsing score detail ...');
          sendResponse(Parser.parseScoreDetail(document.body, message.gameVersion));
          return;
        }
        Logger.debug('received unknown message');
        Logger.debug(message);
      } catch (e) {
        Logger.error(e);
        sendResponse({ status: Parser.STATUS.UNKNOWN_ERROR });
      }
    },
    (reason) => {
      // Logger may not be available if loadModules() failed before loading Logger
      console.error(reason);
      const PARSER_STATUS_UNKNOWN_ERROR = 1; // Parser.STATUS.UNKNOWN_ERROR
      sendResponse({ status: PARSER_STATUS_UNKNOWN_ERROR });
    }
  );
  return true;
}
chrome.runtime.onMessage.addListener(onMessage);
