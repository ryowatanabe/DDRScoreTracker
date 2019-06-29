const STATE = {
    IDLE: 0,
    UPDATE_MUSIC_LIST: 1,
};

let state = STATE.IDLE;
let tabId = 0;

function updateMusicList(windowId)
{
  if (state != STATE.IDLE){
    // return false;
  }
  state = STATE.UPDATE_MUSIC_LIST;
  chrome.tabs.query({ windowId: windowId, index: 0 }, function(tabs) {
    tab = tabs[0];
// TODO: 最終的には "作業用のタブを新規作成して使い、終わったら破棄する" 挙動にする
//       現時点ではデバッグの利便性のため固定のタブを利用
//  chrome.tabs.create({ windowId: windowId, active: false }, function(tab){
    tabId = tab.id;
    console.log("tab is created (tabId:" + tab.id + ")");
    chrome.tabs.update(tabId, { url: MUSIC_LIST_URL }, function(tab){
      console.log('navigate to: ' + MUSIC_LIST_URL);
    });
  });
}

chrome.tabs.onUpdated.addListener(function(tid, changeInfo, tab){
  if (tabId != tid){
    return;
  }
  switch (state){
    case STATE.UPDATE_MUSIC_LIST:
      if (changeInfo.status == "complete"){
        chrome.tabs.sendMessage(tabId, { type: 'PARSE_MUSIC_LIST' }, function(res) {
          console.log(res);
        });
      }
      break;
    default:
      break;
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("received message");
  console.log(message);
  //chrome.runtime.sendMessage("from background page", function (response){
  //	console.log(response)
  //});
  sendResponse({ hoge: 1 });
  return true;
});
