const STATE = {
    INITIALIZE: 0,
    IDLE: 1,
    UPDATE_MUSIC_LIST: 2,
    UPDATE_SCORE_LIST: 3
};

let state = STATE.INITIALIZE;
let tabId = 0;
let storage = {};
let charts = [];

chrome.storage.local.get(
    getDefaults(),
    function(data) {
      storage = data;
      updateCharts();
      state = STATE.IDLE;
    }
);

function saveStorage() {
  chrome.storage.local.set(
      storage,
      function() { }
  );
}

function getCharts() {
  return charts;
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

function updateScoreList(windowId, playMode)
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
    chrome.tabs.update(tabId, { url: SCORE_LIST_URL[playMode] }, function(tab){
    });
  });
}

function updateCharts(){
  charts = [];
  Object.keys(storage.musics).forEach(function(musicId){
    Object.values(PLAY_MODE).forEach(function(playMode){
      Object.values(DIFFICULTIES).forEach(function(difficulty){
        if (playMode == PLAY_MODE.DOUBLE && difficulty == DIFFICULTIES.BEGINNER){
          return;
        }
        const chart = {
          musicId: "",
          title: "",
          playMode: playMode,
          difficulty: difficulty,
          level: 0,
          fullComboType: FULL_COMBO_TYPE.NO_FC,
          scoreRank: SCORE_RANK.NO_PLAY,
          score: 0,
        };
        const difficultyValue = difficulty + (playMode == PLAY_MODE.DOUBLE ? DIFFICULTIES_OFFSET_FOR_DOUBLE : 0);
        chart.level = storage.musics[musicId]['difficulty'][difficultyValue];
        if (chart.level == 0){
          return;
        }
        chart.musicId = musicId;
        chart.title = storage.musics[musicId]['title'];
        if(musicId in storage.scores && difficultyValue in storage.scores[musicId]){
          chart.fullComboType = storage.scores[musicId][difficultyValue]['fullComboType'];
          chart.scoreRank = storage.scores[musicId][difficultyValue]['scoreRank'];
          chart.score = storage.scores[musicId][difficultyValue]['score'];
        }
        charts.push(chart);
      });
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
          Object.keys(res.scores).forEach(function(musicId){
            if (musicId in storage.scores){
              Object.keys(res.scores[musicId]).forEach(function(difficulty){
                storage.scores[musicId][difficulty] = res.scores[musicId][difficulty];
              });
            } else{
              storage.scores[musicId] = res.scores[musicId];
            }
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
