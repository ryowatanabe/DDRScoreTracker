const STATE = {
    INITIALIZE: 0,
    IDLE: 1,
    UPDATE_MUSIC_LIST: 2,
    UPDATE_SCORE_LIST: 3
};

let state = STATE.INITIALIZE;
let tabId = 0;
let storage = {};

chrome.storage.local.get(
    getDefaults(),
    function(data) {
      storage = data;
      state = STATE.IDLE;
    }
);

function saveStorage() {
  chrome.storage.local.set(
      storage,
      function() { }
  );
}

function getDefaults() {
  return {
    scores: {},
    musics: {}
  }
}

function updateMusicList(windowId)
{
  if (state != STATE.IDLE){
   return false;
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

function updateScoreList(windowId, type)
{
  if (state != STATE.IDLE){
   //return false;
  }
  state = STATE.UPDATE_SCORE_LIST;
  chrome.tabs.query({ windowId: windowId, index: 0 }, function(tabs) {
    tab = tabs[0];
// TODO: 最終的には "作業用のタブを新規作成して使い、終わったら破棄する" 挙動にする
//       現時点ではデバッグの利便性のため固定のタブを利用
//  chrome.tabs.create({ windowId: windowId, active: false }, function(tab){
    tabId = tab.id;
    console.log("tab is created (tabId:" + tab.id + ")");
    chrome.tabs.update(tabId, { url: SCORE_LIST_URL[type] }, function(tab){
      console.log('navigate to: ' + SCORE_LIST_URL[type]);
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
          Object.keys(res.musics).forEach(function(musicId){
            storage.musics[musicId] = res.musics[musicId];
          });
          saveStorage();
          if (res.hasNext) {
            setTimeout(function(){
              chrome.tabs.update(tabId, { url: res.nextUrl }, function(tab){})
            }, LOAD_INTERVAL);
          } else {
            state = STATE.IDLE;
          }
        });
      }
      break;
    case STATE.UPDATE_SCORE_LIST:
      if (changeInfo.status == "complete"){
        chrome.tabs.sendMessage(tabId, { type: 'PARSE_SCORE_LIST' }, function(res) {
          console.log(res);
/*
          Object.keys(res.musics).forEach(function(musicId){
            storage.musics[musicId] = res.musics[musicId];
          });
          if (res.hasNext) {
            setTimeout(function(){
              chrome.tabs.update(tabId, { url: res.nextUrl }, function(tab){})
            }, LOAD_INTERVAL);
          } else {
            state = STATE.IDLE;
          }
          */
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
  //sendResponse({});
  //return true;
});
