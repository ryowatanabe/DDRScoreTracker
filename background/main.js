const STATE = {
    INITIALIZE: 0,
    IDLE: 1,
    UPDATE_MUSIC_LIST: 2,
    UPDATE_SCORE_LIST: 3,
    UPDATE_MUSIC_DETAIL: 4
};

let state = STATE.INITIALIZE;
let tabId = 0;
let targetUrls = [];
/*
 storage.musics: 曲リスト。1曲1エントリ。
 storage.scores: スコアリスト。1曲1エントリ。
*/
let storage = {};
let storageBytesInUse = 0;

let musicList;   // 曲リスト。1曲1エントリ。
let scoreList;   // スコアリスト。1極1エントリ。
let charts = []; // 曲リストとスコアリストを結合したもの。1譜面1エントリ。

function loadStorage() {
  chrome.storage.local.get(
      getDefaults(),
      function(data) {
        storage = data;
        musicList = MusicList.createFromStorage(storage.musics);
        //scoreList = ScoreList.createFromStorage(storage.scores);
        updateCharts();
        getBytesInUse();
        state = STATE.IDLE;
      }
  );
}
loadStorage();

function saveStorage() {
  chrome.storage.local.set(
      storage,
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
function saveFilterConditions(conditions) {
    storage.filterConditions = conditions;
    saveStorage();
}

function getMusics() {
  return storage.musics;
}

function getCharts() {
  return charts;
}

function getDefaults() {
  return {
    scores: {},
    musics: {},
    filterConditions: []
  }
}

/*
gh pagesから曲リストを取得し、ローカルの曲リストを更新する
*/

function updateParsedMusicList()
{
    LOGGER.info("github pagesより楽曲リストを取得...");
    $.ajax({
      url: PARSED_MUSIC_LIST_URL,
      dataType: 'text',
      success: function( result ) {
        LOGGER.info("取得成功.");
        var musics = {};
        const lines = result.split("\n");
        LOGGER.info(`${lines.length} 件のデータがあります.`);
        lines.forEach(function(line){
          const elements = line.split("\t");
          if (elements.length <= 1) {
            return;
          }
          musics[elements[0]] = {
            difficulty: elements.slice(1,10).map(element => parseInt(element, 10)),
            title: elements[10]
          }
        });
        Object.keys(musics).forEach(function(musicId){
          if(storage.musics.hasOwnProperty(musicId)){
            var isUpdated = false;
            const iterator = musics[musicId].difficulty.keys();
            for (let index in iterator) {
              if (musics[musicId].difficulty[index] != 0 && storage.musics[musicId].difficulty[index] == 0){
                isUpdated = true;
                storage.musics[musicId].difficulty[index] = musics[musicId].difficulty[index];
              }
            }
            if (isUpdated) {
              LOGGER.info(`更新: ${[musicId, musics[musicId].difficulty, musics[musicId].title].flat().join("\t")}`);
            }
          } else {
            LOGGER.info(`追加: ${[musicId, musics[musicId].difficulty, musics[musicId].title].flat().join("\t")}`);
            storage.musics[musicId] = musics[musicId];
          }
        });
        saveStorage();
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
  const targetMusicIDs = Object.keys(storage.scores).filter(musicId => {
    if (!(musicId in storage.musics)) {
      return true;
    }
    const missing = Object.keys(storage.scores[musicId]).find(difficulty => {
      if (storage.musics[musicId].difficulty[difficulty] == 0 && storage.scores[musicId][difficulty].scoreRank > 0) {
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
    const targetUrl = targetUrls.pop();
    chrome.tabs.update(tabId, { url: targetUrl }, function(tab){
      console.log('navigate to: ' + targetUrl);
    });
  });
}

/*
公式の成績一覧から成績情報を取得し、ローカルの曲リストを更新する
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
          clearType: CLEAR_TYPE.NO_PLAY,
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
          /* TODO: アシストクリアとE判定クリアが未考慮 */
          if (chart.fullComboType != FULL_COMBO_TYPE.NO_FC) {
            chart.clearType = chart.fullComboType + CLEAR_TYPE_OFFSET_FOR_FULLCOMBO;
          } else {
            switch (chart.scoreRank) {
              case SCORE_RANK.NO_PLAY:
                chart.clearType = CLEAR_TYPE.NO_PLAY;
                break;
              case SCORE_RANK.E:
                chart.clearType = CLEAR_TYPE.FAILED;
                break;
              default:
                chart.clearType = CLEAR_TYPE.CLEAR;
                break;
            }
          }
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
    case STATE.UPDATE_MUSIC_DETAIL:
      if (changeInfo.status == "complete"){
        chrome.tabs.sendMessage(tabId, { type: 'PARSE_MUSIC_DETAIL' }, function(res) {
          console.log(res);
          Object.keys(res.musics).forEach(function(musicId){
            storage.musics[musicId] = res.musics[musicId];
          });
          saveStorage();
          if (targetUrls.length > 0) {
            const targetUrl = targetUrls.pop();
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
