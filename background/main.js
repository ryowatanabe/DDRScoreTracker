import { MusicList } from '../common/MusicList.js';
import { ScoreList } from '../common/ScoreList.js';
import { ScoreDetail } from '../common/ScoreDetail.js';
import { ChartList } from '../common/ChartList.js';
import { ChartData } from '../common/ChartData.js';
import { Constants } from '../common/Constants.js';
import { Logger } from '../common/Logger.js';
import { Storage } from '../common/Storage.js';
import { BrowserController } from '../common/BrowserController.js';

const browserController = new BrowserController(chrome.windows.WINDOW_ID_CURRENT);
const storage = new Storage(
  {
    scores: {},
    musics: {},
    conditions: {
      filter: [],
      sort: []
    }
  },
  (data) => {
    musicList = MusicList.createFromStorage(data.musics);
    scoreList = ScoreList.createFromStorage(data.scores);
    conditions = data.conditions;
    updateCharts();
    state = STATE.IDLE;
  }
);

const STATE = {
    INITIALIZE: 0,
    IDLE: 1,
    UPDATE_MUSIC_LIST: 2,
    UPDATE_SCORE_LIST: 3,
    UPDATE_MUSIC_DETAIL: 4,
    UPDATE_SCORE_DETAIL: 5
};

let state = STATE.INITIALIZE;
let targetMusics = [];
let targetUrls = [];

let musicList; // 曲リスト。1曲1エントリ。
let scoreList; // スコアリスト。1極1エントリ。
let chartList = new ChartList(); // 曲リストとスコアリストを結合したもの。1譜面1エントリ。
let conditions;

function saveStorage() {
  storage.saveStorage({
    scores: scoreList.musics,
    musics: musicList.musics,
    conditions: conditions
  });
}

function resetStorage() {
  storage.resetStorage();
}

function getBytesInUse(){
  return storage.bytesInUse;
}

function getConditions() {
  return conditions;
}

function saveConditions(filterConditions, sortConditions) {
    conditions = {
      filter: filterConditions,
      sort:   sortConditions
    }
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

function restoreMusicList(string) {
  const lines = string.split("\n");
  Logger.info(`${lines.length} 件のデータがあります.`);
  lines.forEach(function(line){
    musicList.applyEncodedString(line);
  });
  saveStorage();
  updateCharts();
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
    Logger.info("github pagesより楽曲リストを取得...");
    $.ajax({
      url: Constants.PARSED_MUSIC_LIST_URL,
      dataType: 'text',
      success: function( result ) {
        Logger.info("取得成功.");
        restoreMusicList(result);
        Logger.info([
          "処理を完了しました.",
          ""
        ]);
      },
      error: function( jqXHR, textStatus, errorThrown ) {
        Logger.info("通信エラーが発生しました.");
        Logger.debug([
          `textStatus: ${textStatus}`,
          `errorThrown: ${errorThrown}`
        ]);
        Logger.info([
          "処理を終了しました. 通信環境のよいところでやり直してください.",
          ""
        ]);
      }
    });
}

/*
公式の曲一覧から曲情報を取得し、ローカルの曲リストを更新する
*/
async function updateMusicList(windowId)
{
  if (state != STATE.IDLE){
    return false;
  }
  state = STATE.UPDATE_MUSIC_LIST;
  try {
    await browserController.createTab();
    await browserController.updateTab(Constants.MUSIC_LIST_URL);
  } catch (error) {
    browserController.reset();
    Logger.error(error);
  }
}

/*
ローカルの曲リストと成績リストを比較し、曲情報が欠けている曲について
その情報を取得する
*/
async function fetchMissingMusicInfo(windowId)
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
    return Constants.MUSIC_DETAIL_URL[Constants.MUSIC_TYPE.NORMAL].replace('[musicId]', musicId);
  });

  if (targetUrls.length == 0){
    return false;
  }
  state = STATE.UPDATE_MUSIC_DETAIL;
  try {
    const targetUrl = targetUrls.shift();
    await browserController.createTab();
    await browserController.updateTab(targetUrl);
  } catch (error) {
    browserController.reset();
    Logger.error(error);
  }
}

/*
公式の成績一覧ページから成績情報を取得し、ローカルのスコアリストを更新する
*/
async function updateScoreList(windowId, playMode, musicType)
{
  if (state != STATE.IDLE){
    //return false;
  }
  state = STATE.UPDATE_SCORE_LIST;
  try {
    await browserController.createTab();
    await browserController.updateTab(Constants.SCORE_LIST_URL[playMode][musicType]);
  } catch (error) {
    browserController.reset();
    Logger.error(error);
  }
}

/*
公式の成績詳細ページから成績情報を取得し、ローカルのスコアリストを更新する
targets: [
  { musicId:xxx, difficulty:yy }, ...
]
*/
async function updateScoreDetail(windowId, targets)
{
  Logger.info("スコア詳細を取得...");
  if (state != STATE.IDLE){
    //return false;
  }
  /* 巡回対象のURL一覧を生成 */
  targets.forEach((music) => {
    music.url = Constants.SCORE_DETAIL_URL[musicList.getMusicDataById(music.musicId).type].replace('[musicId]', music.musicId).replace('[difficulty]', music.difficulty);
    targetMusics.push(music);
  });
  if (targetMusics.length == 0){
    Logger.info("データ取得対象の楽曲がありません.");
    return false;
  }
  Logger.info(`取得対象は ${targetMusics.length} 件あります.`);
  state = STATE.UPDATE_SCORE_DETAIL;
  try {
    const targetMusic = targetMusics.shift();
    Logger.info(`${musicList.getMusicDataById(targetMusic.musicId).title} [${Constants.PLAY_MODE_AND_DIFFICULTY_STRING[targetMusic.difficulty]}] (あと ${targetMusics.length} 件)`);
    await browserController.createTab();
    await browserController.updateTab(targetMusic.url);
  } catch (error) {
    browserController.reset();
    Logger.error(error);
  }
}

function updateCharts(){
  chartList.reset();
  musicList.musicIds.forEach(function(musicId){
    Object.values(Constants.PLAY_MODE).forEach(function(playMode){
      Object.values(Constants.DIFFICULTIES).forEach(function(difficulty){
        if (playMode == Constants.PLAY_MODE.DOUBLE && difficulty == Constants.DIFFICULTIES.BEGINNER){
          return;
        }
        const musicData = musicList.getMusicDataById(musicId);
        const difficultyValue = difficulty + (playMode == Constants.PLAY_MODE.DOUBLE ? Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE : 0);
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
  // Logger.debug(`chrome.tabs.onUpdated(tabId: ${tid})`);
  if (browserController.tabId != tid){
    return;
  }
  switch (state){
    case STATE.UPDATE_MUSIC_LIST:
      if (changeInfo.status == "complete"){
        browserController.sendMessageToTab({ type: 'PARSE_MUSIC_LIST' }, async (res) => {
          console.log(res);
          Object.keys(res.musics).forEach(function(musicId){
            musicList.applyObject(res.musics[musicId]);
          });
          saveStorage();
          updateCharts();
          if (res.hasNext) {
            try {
              await browserController.updateTab(res.nextUrl, Constants.LOAD_INTERVAL);
            } catch (error) {
              browserController.reset();
              Logger.error(error);
            }
          } else {
            await browserController.closeTab();
            state = STATE.IDLE;
          }
        });
      }
      break;
    case STATE.UPDATE_MUSIC_DETAIL:
      if (changeInfo.status == "complete"){
        browserController.sendMessageToTab({ type: 'PARSE_MUSIC_DETAIL' }, async (res) => {
          console.log(res);
          Object.keys(res.musics).forEach(function(musicId){
            musicList.applyObject(res.musics[musicId]);
          });
          saveStorage();
          updateCharts();
          if (targetUrls.length > 0) {
            try {
              const targetUrl = targetUrls.shift();
              await browserController.updateTab(targetUrl, Constants.LOAD_INTERVAL);
            } catch (error) {
              browserController.reset();
              Logger.error(error);
            }
          } else {
            await browserController.closeTab();
            state = STATE.IDLE;
          }
        });
      }
      break;
    case STATE.UPDATE_SCORE_LIST:
      if (changeInfo.status == "complete"){
        browserController.sendMessageToTab({ type: 'PARSE_SCORE_LIST' }, async (res) => {
          console.log(res);
          res.scores.forEach(function(score){
            scoreList.applyObject(score);
          });
          saveStorage();
          updateCharts();
          if (res.hasNext) {
            try {
              await browserController.updateTab(res.nextUrl, Constants.LOAD_INTERVAL);
            } catch (error) {
              browserController.reset();
              Logger.error(error);
            }
          } else {
            await browserController.closeTab();
            state = STATE.IDLE;
          }
        });
      }
      break;
    case STATE.UPDATE_SCORE_DETAIL:
      if (changeInfo.status == "complete"){
        browserController.sendMessageToTab({ type: 'PARSE_SCORE_DETAIL' }, async (res) => {
          console.log(res);
          res.scores.forEach(function(score){
            scoreList.applyObject(score);
          });
          saveStorage();
          updateCharts();
          if (targetMusics.length > 0) {
            try {
              const targetMusic = targetMusics.shift();
              Logger.info(`${musicList.getMusicDataById(targetMusic.musicId).title} [${Constants.PLAY_MODE_AND_DIFFICULTY_STRING[targetMusic.difficulty]}] (あと ${targetMusics.length} 件)`);
              await browserController.updateTab(targetMusic.url, Constants.LOAD_INTERVAL);
            } catch (error) {
              browserController.reset();
              Logger.error(error);
            }
          } else {
            await browserController.closeTab();
            state = STATE.IDLE;
            Logger.info([
              "処理を完了しました.",
              ""
            ]);
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

  window.fetchMissingMusicInfo = fetchMissingMusicInfo;
  window.fetchParsedMusicList  = fetchParsedMusicList;
  window.getChartList          = getChartList;
  window.getConditions         = getConditions;
  window.getMusicList          = getMusicList;
  window.getScoreList          = getScoreList;
  window.resetStorage          = resetStorage;
  window.restoreMusicList      = restoreMusicList;
  window.restoreScoreList      = restoreScoreList;
  window.saveConditions        = saveConditions;
  window.updateCharts          = updateCharts;
  window.updateScoreDetail     = updateScoreDetail;
  window.updateScoreList       = updateScoreList;
})();
