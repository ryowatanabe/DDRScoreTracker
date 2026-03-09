import { Logger } from '../static/common/Logger.js';
import { Parser } from '../static/common/Parser.js';

function onMessage(message, sender, sendResponse) {
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
  return true;
}
chrome.runtime.onMessage.addListener(onMessage);
