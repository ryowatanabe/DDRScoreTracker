chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type == 'PARSE_MUSIC_LIST') {
    console.log("parsing music list ...");
    sendResponse({ hoge: 1 });
    return true;
  }
  if (message.type == 'PARSE_SCORE_LIST') {
    console.log("parsing score list ...");
    sendResponse({ pos: 2 });
    return true;
  }
  if (message.type == 'PARSE_SCORE_DETAIL') {
    console.log("parsing score detail ...");
    sendResponse({ foo: 3 });
    return true;
  }
});
