let Logger;
let MusicData;
let ScoreData;
let ScoreDetail;
let Constants;
let parseMusicList;
let parseMusicDetail;
let parseScoreList;
let parseScoreDetail;

async function loadModules() {
  const logger = await import(chrome.extension.getURL('common/Logger.js'));
  Logger = logger.Logger;
  const musicData = await import(chrome.extension.getURL('common/MusicData.js'));
  MusicData = musicData.MusicData;
  const scoreData = await import(chrome.extension.getURL('common/ScoreData.js'));
  ScoreData = scoreData.ScoreData;
  const scoreDetail = await import(chrome.extension.getURL('common/ScoreDetail.js'));
  ScoreDetail = scoreDetail.ScoreDetail;
  const constants = await import(chrome.extension.getURL('common/Constants.js'));
  Constants = constants.Constants;
  const parser = await import(chrome.extension.getURL('common/Parser.js'));
  parseMusicList = parser.parseMusicList;
  parseMusicDetail = parser.parseMusicDetail;
  parseScoreList = parser.parseScoreList;
  parseScoreDetail = parser.parseScoreDetail;
  console.log('modules loaded.');
}

function onMessage(message, sender, sendResponse) {
  loadModules().then(
    (value) => {
      if (message.type == 'PARSE_MUSIC_LIST') {
        console.log('parsing music list ...');
        sendResponse(parseMusicList(document.body));
        return;
      }
      if (message.type == 'PARSE_MUSIC_DETAIL') {
        console.log('parsing music detail ...');
        sendResponse(parseMusicDetail(document.body));
        return;
      }
      if (message.type == 'PARSE_SCORE_LIST') {
        console.log('parsing score list ...');
        sendResponse(parseScoreList(document.body));
        return;
      }
      if (message.type == 'PARSE_SCORE_DETAIL') {
        console.log('parsing score detail ...');
        sendResponse(parseScoreDetail(document.body));
        return;
      }
      console.log('received unknown message');
      console.log(message);
    },
    (reason) => {
      Logger.error(reason);
    }
  );
  return true;
}
chrome.runtime.onMessage.addListener(onMessage);
