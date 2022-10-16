let Logger;
let Parser;

async function loadModules() {
  const logger = await import(chrome.runtime.getURL('common/Logger.js'));
  Logger = logger.Logger;
  const parser = await import(chrome.runtime.getURL('common/Parser.js'));
  Parser = parser.Parser;
  console.log('modules loaded.');
}

function onMessage(message, sender, sendResponse) {
  loadModules().then(
    (_value) => {
      if (message.type == 'PARSE_MUSIC_LIST') {
        console.log('parsing music list ...');
        sendResponse(Parser.parseMusicList(document.body));
        return;
      }
      if (message.type == 'PARSE_MUSIC_DETAIL') {
        console.log('parsing music detail ...');
        sendResponse(Parser.parseMusicDetail(document.body));
        return;
      }
      if (message.type == 'PARSE_SCORE_LIST') {
        console.log('parsing score list ...');
        sendResponse(Parser.parseScoreList(document.body));
        return;
      }
      if (message.type == 'PARSE_SCORE_DETAIL') {
        console.log('parsing score detail ...');
        sendResponse(Parser.parseScoreDetail(document.body));
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
