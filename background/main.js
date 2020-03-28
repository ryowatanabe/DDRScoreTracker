const STATE = {
    INITIALIZE: 0,
    IDLE: 1,
    UPDATE_MUSIC_LIST: 2,
    UPDATE_SCORE_LIST: 3,
    UPDATE_MUSIC_DETAIL: 4,
    UPDATE_SCORE_DETAIL: 5
};

let state = STATE.INITIALIZE;
let tabId = 0;
let targetUrls = [];

let storage = {};
let storageBytesInUse = 0;

let musicList;   // 曲リスト。1曲1エントリ。
let scoreList;   // スコアリスト。1極1エントリ。
let chartList = new ChartList(); // 曲リストとスコアリストを結合したもの。1譜面1エントリ。

function loadStorage() {
  chrome.storage.local.get(
      getDefaults(),
      function(data) {
        storage = data;
        musicList = MusicList.createFromStorage(storage.musics);
        scoreList = ScoreList.createFromStorage(storage.scores);
        updateCharts();
        getBytesInUse();
        state = STATE.IDLE;
      }
  );
}
loadStorage();

function saveStorage() {
  chrome.storage.local.set(
      {
        scores: scoreList.musics,
        musics: musicList.musics,
        filterConditions: storage.filterConditions,
        sortConditions: storage.sortConditions
      },
      function() {
        getBytesInUse();
      }
  );
}

function resetStorage() {
  LOGGER.info("端末上に保存しているデータを削除します.");
  chrome.storage.local.clear(function(){
    LOGGER.info("完了しました.");
    loadStorage();
  });
}

function getBytesInUse(){
  chrome.storage.local.getBytesInUse(null, function(bytesInUse){
    storageBytesInUse = bytesInUse;
  });
}

function getFilterConditions() {
  return storage.filterConditions;
}
function getSortConditions() {
  if (!Array.isArray(storage.sortConditions)) {
    storage.sortConditions = [];
  }
  return storage.sortConditions;
}
function saveFilterConditions(filterConditions, sortConditions) {
    storage.filterConditions = filterConditions;
    storage.sortConditions   = sortConditions;
    saveStorage();
}

function getMusicList() {
  return musicList;
}

function getScoreList() {
  return scoreList;
}

function getChartList() {
  return chartList;
}

function getDefaults() {
  return {
    scores: {},
    musics: {},
    filterConditions: [],
    sortConditions: []
  }
}

function restoreScoreList(object) {
  scoreList = ScoreList.createFromStorage(object);
  updateCharts();
}

/*
gh pagesから曲リストを取得し、ローカルの曲リストを更新する
*/

function fetchParsedMusicList()
{
    LOGGER.info("github pagesより楽曲リストを取得...");
    $.ajax({
      url: PARSED_MUSIC_LIST_URL,
      dataType: 'text',
      success: function( result ) {
        LOGGER.info("取得成功.");
        const lines = result.split("\n");
        LOGGER.info(`${lines.length} 件のデータがあります.`);
        lines.forEach(function(line){
          musicList.applyEncodedString(line);
        });
        saveStorage();
        updateCharts();
        LOGGER.info([
          "処理を完了しました.",
          ""
        ]);
      },
      error: function( jqXHR, textStatus, errorThrown ) {
        LOGGER.info("通信エラーが発生しました.");
        LOGGER.debug([
          `textStatus: ${textStatus}`,
          `errorThrown: ${errorThrown}`
        ]);
        LOGGER.info([
          "処理を終了しました. 通信環境のよいところでやり直してください.",
          ""
        ]);
      }
    });
}

/*
公式の曲一覧から曲情報を取得し、ローカルの曲リストを更新する
*/
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
    LOGGER.debug("tab is created (tabId:" + tab.id + ")");
    chrome.tabs.update(tabId, { url: MUSIC_LIST_URL }, function(tab){
      LOGGER.debug('navigate to: ' + MUSIC_LIST_URL);
    });
  });
}

/*
ローカルの曲リストと成績リストを比較し、曲情報が欠けている曲について
その情報を取得する
*/
function fetchMissingMusicInfo(windowId)
{
  if (state != STATE.IDLE){
    //return false;
  }
  /* 曲情報が欠けている曲と、曲情報そのものはあるが、譜面情報が欠けている (追加鬼譜面など) 曲を列挙する */
  const targetMusicIDs = scoreList.musicIds.filter(musicId => {
    if (!musicList.hasMusic(musicId)) {
      return true;
    }
    const missing = scoreList.getScoreDataByMusicId(musicId).difficulties.find(difficulty => {
      if (musicList.getMusicDataById(musicId).difficulty[difficulty] == 0) {
        return true;
      }
    });
    return missing;
  });
  targetUrls = targetMusicIDs.map(musicId => {
    return MUSIC_DETAIL_URL.replace('[musicId]', musicId);
  });

  if (targetUrls.length == 0){
    return false;
  }
  state = STATE.UPDATE_MUSIC_DETAIL;
  chrome.tabs.query({ windowId: windowId, index: 0 }, function(tabs) {
    tab = tabs[0];
// TODO: 最終的には "作業用のタブを新規作成して使い、終わったら破棄する" 挙動にする
//       現時点ではデバッグの利便性のため固定のタブを利用
//  chrome.tabs.create({ windowId: windowId, active: false }, function(tab){
    tabId = tab.id;
    console.log("tab is created (tabId:" + tab.id + ")");
    const targetUrl = targetUrls.shift();
    chrome.tabs.update(tabId, { url: targetUrl }, function(tab){
      console.log('navigate to: ' + targetUrl);
    });
  });
}

/*
公式の成績一覧ページから成績情報を取得し、ローカルのスコアリストを更新する
*/
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
    LOGGER.debug("tab is created (tabId:" + tab.id + ")");
    chrome.tabs.update(tabId, { url: SCORE_LIST_URL[playMode] }, function(tab){
    });
  });
}

/*
公式の成績詳細ページから成績情報を取得し、ローカルのスコアリストを更新する
targetMusics: [
  { musicId:xxx, difficulty:yy }, ...
]
*/
function updateScoreDetail(windowId, targetMusics)
{
  if (state != STATE.IDLE){
    //return false;
  }
  /* 巡回対象のURL一覧を生成 */
  targetUrls = targetMusics.map(music => {
    return SCORE_DETAIL_URL.replace('[musicId]', music.musicId).replace('[difficulty]', music.difficulty);
  });

  if (targetUrls.length == 0){
    return false;
  }
  state = STATE.UPDATE_SCORE_DETAIL;
  chrome.tabs.query({ windowId: windowId, index: 0 }, function(tabs) {
    tab = tabs[0];
// TODO: 最終的には "作業用のタブを新規作成して使い、終わったら破棄する" 挙動にする
//       現時点ではデバッグの利便性のため固定のタブを利用
//  chrome.tabs.create({ windowId: windowId, active: false }, function(tab){
    tabId = tab.id;
    console.log("tab is created (tabId:" + tab.id + ")");
    const targetUrl = targetUrls.shift();
    chrome.tabs.update(tabId, { url: targetUrl }, function(tab){
      console.log('navigate to: ' + targetUrl);
    });
  });
}

function updateCharts(){
  chartList.reset();
  musicList.musicIds.forEach(function(musicId){
    Object.values(PLAY_MODE).forEach(function(playMode){
      Object.values(DIFFICULTIES).forEach(function(difficulty){
        if (playMode == PLAY_MODE.DOUBLE && difficulty == DIFFICULTIES.BEGINNER){
          return;
        }
        const musicData = musicList.getMusicDataById(musicId);
        const difficultyValue = difficulty + (playMode == PLAY_MODE.DOUBLE ? DIFFICULTIES_OFFSET_FOR_DOUBLE : 0);
        if (!musicData.hasDifficulty(difficultyValue)) {
          return;
        }

        const chartData = new ChartData(musicId, playMode, difficulty);
        chartData.musicData = musicData;

        if (scoreList.hasMusic(musicId) && scoreList.getScoreDataByMusicId(musicId).hasDifficulty(difficultyValue)) {
          chartData.scoreDetail = scoreList.getScoreDataByMusicId(musicId).getScoreDetailByDifficulty(difficultyValue);
        } else{
          chartData.scoreDetail = new ScoreDetail();
        }

        chartList.addChartData(chartData);
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
            musicList.applyObject(res.musics[musicId]);
          });
          saveStorage();
          updateCharts();
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
    case STATE.UPDATE_MUSIC_DETAIL:
      if (changeInfo.status == "complete"){
        chrome.tabs.sendMessage(tabId, { type: 'PARSE_MUSIC_DETAIL' }, function(res) {
          console.log(res);
          Object.keys(res.musics).forEach(function(musicId){
            musicList.applyObject(res.musics[musicId]);
          });
          saveStorage();
          updateCharts();
          if (targetUrls.length > 0) {
            const targetUrl = targetUrls.shift();
            setTimeout(function(){
              chrome.tabs.update(tabId, { url: targetUrl }, function(tab){})
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
          res.scores.forEach(function(score){
            scoreList.applyObject(score);
          });
          saveStorage();
          updateCharts();
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
    case STATE.UPDATE_SCORE_DETAIL:
      if (changeInfo.status == "complete"){
        chrome.tabs.sendMessage(tabId, { type: 'PARSE_SCORE_DETAIL' }, function(res) {
          console.log(res);
          res.scores.forEach(function(score){
            scoreList.applyObject(score);
          });
          saveStorage();
          updateCharts();
          if (targetUrls.length > 0) {
            const targetUrl = targetUrls.shift();
            setTimeout(function(){
              chrome.tabs.update(tabId, { url: targetUrl }, function(tab){})
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

(function()
{
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    //sendResponse({});
    //return true;
  });

  const extension_id = chrome.i18n.getMessage('@@extension_id');
  chrome.browserAction.onClicked.addListener(function(){
    chrome.tabs.create({ url: `chrome-extension://${extension_id}/browser_action/index.html` }, function(tab){
    });
  });

})();
