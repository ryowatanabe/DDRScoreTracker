import { MusicList } from '../common/MusicList.js';
import { ScoreList } from '../common/ScoreList.js';
import { ScoreDetail } from '../common/ScoreDetail.js';
import { ChartList } from '../common/ChartList.js';
import { ChartData } from '../common/ChartData.js';
import { Constants } from '../common/Constants.js';
import { Logger } from '../common/Logger.js';
import { Storage } from '../common/Storage.js';
import { BrowserController } from '../common/BrowserController.js';
import { I18n } from '../common/I18n.js';

const storage = new Storage(
  {
    scores: {},
    musics: {},
    conditions: {
      filter: [],
      sort: [],
    },
    options: {},
  },
  (data) => {
    musicList = MusicList.createFromStorage(data.musics);
    scoreList = ScoreList.createFromStorage(data.scores);
    conditions = data.conditions;
    options = data.options;
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
  UPDATE_SCORE_DETAIL: 5,
};

let state = STATE.INITIALIZE;
let targetMusics = [];

let musicList; // 曲リスト。1曲1エントリ。
let scoreList; // スコアリスト。1曲1エントリ。
let chartList = new ChartList(); // 曲リストとスコアリストを結合したもの。1譜面1エントリ。
let conditions;
let options;

function echo(message) {
  Logger.debug(message);
}

function saveStorage() {
  storage.saveStorage({
    scores: scoreList.musics,
    musics: musicList.musics,
    conditions: conditions,
    options: options,
  });
}

function resetStorage() {
  storage.resetStorage();
}

function getBytesInUse() {
  return storage.bytesInUse;
}

function getConditions() {
  return conditions;
}

function getOptions() {
  return options;
}

function saveConditions(filterConditions, sortConditions) {
  conditions = {
    filter: filterConditions,
    sort: sortConditions,
  };
  saveStorage();
}

function saveOptions(newOptions) {
  options = newOptions;
  saveStorage();
}

function getMusicList() {
  return musicList;
}

function getScoreList() {
  return scoreList;
}

function getChartCount() {
  return chartList.charts.length;
}

function getChartList() {
  return chartList;
}

function restoreMusicList(string) {
  const lines = string.split('\n');
  Logger.info(I18n.getMessage('log_message_restore_music_list_count', lines.length));
  lines.forEach(function (line) {
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

function fetchParsedMusicList() {
  Logger.info(I18n.getMessage('log_message_fetch_parsed_music_list_begin'));
  fetch(Constants.PARSED_MUSIC_LIST_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
      Logger.info(I18n.getMessage('log_message_fetch_parsed_music_list_fetch_success'));
      response.text().then((text) => {
        restoreMusicList(text);
        Logger.info([I18n.getMessage('log_message_done'), '']);
      });
    })
    .catch((reason) => {
      Logger.info(I18n.getMessage('log_message_network_error'));
      Logger.debug(reason);
      Logger.info([I18n.getMessage('log_message_network_error_please_retry'), '']);
    });
}

/*
公式の曲一覧から曲情報を取得し、ローカルの曲リストを更新する
*/
async function updateMusicList(windowId) {
  if (state != STATE.IDLE) {
    return false;
  }
  state = STATE.UPDATE_MUSIC_LIST;
  try {
    await browserController.createTab(Constants.MUSIC_LIST_URL);
  } catch (error) {
    browserController.reset();
    Logger.error(error);
  }
}

/*
ローカルの曲リストと成績リストを比較し、曲情報が欠けている曲について
その情報を取得する
*/
async function fetchMissingMusicInfo(windowId) {
  if (state != STATE.IDLE) {
    //return false;
  }
  Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_begin'));
  /* 曲情報が欠けている曲と、曲情報そのものはあるが、譜面情報が欠けている (追加鬼譜面など) 曲を列挙する */
  const targetMusicIDs = scoreList.musicIds.filter((musicId) => {
    if (!musicList.hasMusic(musicId)) {
      return true;
    }
    const missing = scoreList.getScoreDataByMusicId(musicId).difficulties.find((difficulty) => {
      if (musicList.getMusicDataById(musicId).difficulty[difficulty] == 0) {
        return true;
      }
    });
    return missing;
  });
  targetMusics = targetMusicIDs.map((musicId) => {
    return {
      musicId: musicId,
      url: Constants.MUSIC_DETAIL_URL[Constants.MUSIC_TYPE.NORMAL].replace('[musicId]', musicId),
    };
  });
  if (targetMusics.length == 0) {
    Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_no_target'));
    return false;
  }
  Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_target_found', targetMusics.length));
  state = STATE.UPDATE_MUSIC_DETAIL;
  try {
    const targetMusic = targetMusics.shift();
    Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_progress', [targetMusic.musicId, targetMusics.length]));
    await browserController.createTab(targetMusic.url);
  } catch (error) {
    browserController.reset();
    Logger.error(error);
  }
}

/*
公式の成績一覧ページから成績情報を取得し、ローカルのスコアリストを更新する
*/
async function updateScoreList(windowId, playMode, musicType) {
  if (state != STATE.IDLE) {
    //return false;
  }
  state = STATE.UPDATE_SCORE_LIST;
  try {
    await browserController.createTab(Constants.SCORE_LIST_URL[playMode][musicType]);
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
async function updateScoreDetail(windowId, targets) {
  if (state != STATE.IDLE) {
    //return false;
  }
  Logger.info(I18n.getMessage('log_message_update_score_detail_begin'));
  /* 巡回対象のURL一覧を生成 */
  targetMusics = targets.map((music) => {
    music.url = Constants.SCORE_DETAIL_URL[musicList.getMusicDataById(music.musicId).type].replace('[musicId]', music.musicId).replace('[difficulty]', music.difficulty);
    return music;
  });
  if (targetMusics.length == 0) {
    Logger.info(I18n.getMessage('log_message_update_score_detail_no_target'));
    return false;
  }
  Logger.info(I18n.getMessage('log_message_update_score_detail_target_found', targetMusics.length));
  state = STATE.UPDATE_SCORE_DETAIL;
  try {
    const targetMusic = targetMusics.shift();
    Logger.info(
      I18n.getMessage('log_message_update_score_detail_progress', [
        musicList.getMusicDataById(targetMusic.musicId).title,
        Constants.PLAY_MODE_AND_DIFFICULTY_STRING[targetMusic.difficulty],
        targetMusics.length,
      ])
    );
    await browserController.createTab(targetMusic.url);
  } catch (error) {
    browserController.reset();
    Logger.error(error);
  }
}

function updateCharts() {
  chartList.reset();
  musicList.musicIds.forEach(function (musicId) {
    Object.values(Constants.PLAY_MODE).forEach(function (playMode) {
      Object.values(Constants.DIFFICULTIES).forEach(function (difficulty) {
        if (playMode == Constants.PLAY_MODE.DOUBLE && difficulty == Constants.DIFFICULTIES.BEGINNER) {
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
        } else {
          chartData.scoreDetail = new ScoreDetail();
        }

        chartList.addChartData(chartData);
      });
    });
  });
}

function onUpdateTab() {
  switch (state) {
    case STATE.UPDATE_MUSIC_LIST:
      browserController.sendMessageToTab({ type: 'PARSE_MUSIC_LIST' }, async (res) => {
        console.log(res);
        res.musics.forEach(function (music) {
          musicList.applyObject(music);
        });
        saveStorage();
        updateCharts();
        if (res.hasNext) {
          try {
            await browserController.updateTab(res.nextUrl);
          } catch (error) {
            browserController.reset();
            Logger.error(error);
          }
        } else {
          await browserController.closeTab();
          state = STATE.IDLE;
        }
      });
      break;
    case STATE.UPDATE_MUSIC_DETAIL:
      browserController.sendMessageToTab({ type: 'PARSE_MUSIC_DETAIL' }, async (res) => {
        console.log(res);
        res.musics.forEach(function (music) {
          musicList.applyObject(music);
        });
        saveStorage();
        updateCharts();
        if (targetMusics.length > 0) {
          try {
            const targetMusic = targetMusics.shift();
            Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_progress', [targetMusic.musicId, targetMusics.length]));
            await browserController.updateTab(targetMusic.url);
          } catch (error) {
            browserController.reset();
            Logger.error(error);
          }
        } else {
          await browserController.closeTab();
          state = STATE.IDLE;
        }
      });
      break;
    case STATE.UPDATE_SCORE_LIST:
      browserController.sendMessageToTab({ type: 'PARSE_SCORE_LIST' }, async (res) => {
        console.log(res);
        res.scores.forEach(function (score) {
          scoreList.applyObject(score);
        });
        saveStorage();
        updateCharts();
        if (res.hasNext) {
          try {
            await browserController.updateTab(res.nextUrl);
          } catch (error) {
            browserController.reset();
            Logger.error(error);
          }
        } else {
          await browserController.closeTab();
          state = STATE.IDLE;
        }
      });
      break;
    case STATE.UPDATE_SCORE_DETAIL:
      browserController.sendMessageToTab({ type: 'PARSE_SCORE_DETAIL' }, async (res) => {
        console.log(res);
        res.scores.forEach(function (score) {
          scoreList.applyObject(score);
        });
        saveStorage();
        updateCharts();
        if (targetMusics.length > 0) {
          try {
            const targetMusic = targetMusics.shift();
            Logger.info(
              I18n.getMessage('log_message_update_score_detail_progress', [
                musicList.getMusicDataById(targetMusic.musicId).title,
                Constants.PLAY_MODE_AND_DIFFICULTY_STRING[targetMusic.difficulty],
                targetMusics.length,
              ])
            );
            await browserController.updateTab(targetMusic.url);
          } catch (error) {
            browserController.reset();
            Logger.error(error);
          }
        } else {
          await browserController.closeTab();
          state = STATE.IDLE;
          Logger.info([I18n.getMessage('log_message_done'), '']);
        }
      });
      break;
    default:
      break;
  }
}

const browserController = new BrowserController(chrome.windows.WINDOW_ID_CURRENT, onUpdateTab);

(function () {
  browserController.delay = Constants.LOAD_INTERVAL;

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    //sendResponse({});
    //return true;
  });

  const extension_id = chrome.i18n.getMessage('@@extension_id');
  chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.create({ url: `chrome-extension://${extension_id}/browser_action/index.html` }, function (tab) {});
  });

  window.echo = echo;
  window.fetchMissingMusicInfo = fetchMissingMusicInfo;
  window.fetchParsedMusicList = fetchParsedMusicList;
  window.getChartCount = getChartCount;
  window.getChartList = getChartList;
  window.getConditions = getConditions;
  window.getOptions = getOptions;
  window.getMusicList = getMusicList;
  window.getScoreList = getScoreList;
  window.resetStorage = resetStorage;
  window.restoreMusicList = restoreMusicList;
  window.restoreScoreList = restoreScoreList;
  window.saveConditions = saveConditions;
  window.saveOptions = saveOptions;
  window.updateCharts = updateCharts;
  window.updateMusicList = updateMusicList;
  window.updateScoreDetail = updateScoreDetail;
  window.updateScoreList = updateScoreList;
})();
