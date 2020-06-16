import { MusicList } from '../static/common/MusicList.js';
import { ScoreList } from '../static/common/ScoreList.js';
import { ScoreDetail } from '../static/common/ScoreDetail.js';
import { ChartList } from '../static/common/ChartList.js';
import { ChartData } from '../static/common/ChartData.js';
import { SkillAttackIndexMap } from '../static/common/SkillAttackIndexMap.js';
import { SkillAttackDataList } from '../static/common/SkillAttackDataList.js';
import { Constants } from '../static/common/Constants.js';
import { Logger } from '../static/common/Logger.js';
import { Storage } from '../static/common/Storage.js';
import { BrowserController } from '../static/common/BrowserController.js';
import { Parser } from '../static/common/Parser.js';
import { I18n } from '../static/common/I18n.js';

import { STATE, CHANGE_STATE_MESSAGE_TYPE } from '../static/background/state.js';

const storage = new Storage(
  {
    scores: {},
    musics: {},
    conditions: {
      summary: { clearType: true },
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
    changeState(STATE.IDLE);
  }
);

let state = STATE.INITIALIZE;
let targetMusics = [];

let musicList; // 曲リスト。1曲1エントリ。
let scoreList; // スコアリスト。1曲1エントリ。
let chartList = new ChartList(); // 曲リストとスコアリストを結合したもの。1譜面1エントリ。
let conditions;
let options;

function abortAction() {
  switch (state) {
    case STATE.UPDATE_MUSIC_LIST:
    case STATE.UPDATE_SCORE_LIST:
    case STATE.UPDATE_MUSIC_DETAIL:
    case STATE.UPDATE_SCORE_DETAIL:
      Logger.info(I18n.getMessage('log_message_aborting'));
      state = STATE.ABORTING;
      break;
    default:
      Logger.debug(`abortAction: state unmatch (current state: ${state})`);
      break;
  }
}

function echo(message) {
  Logger.debug(message);
}

function getState() {
  return state;
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

function saveConditions(summarySettings, filterConditions, sortConditions) {
  conditions = {
    summary: summarySettings,
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
        Logger.info(I18n.getMessage('log_message_done'));
      });
    })
    .catch((reason) => {
      Logger.info(I18n.getMessage('log_message_network_error'));
      Logger.debug(reason);
      Logger.info(I18n.getMessage('log_message_aborted'));
    });
}

/*
公式の曲一覧から曲情報を取得し、ローカルの曲リストを更新する
*/
async function updateMusicList(windowId) {
  if (state != STATE.IDLE) {
    const message = `updateMusicList: state unmatch (current state: ${state})`;
    Logger.debug(message);
    throw new Error(message);
  }
  Logger.info(I18n.getMessage('log_message_update_music_list_begin'));
  changeState(STATE.UPDATE_MUSIC_LIST);
  try {
    Logger.info(I18n.getMessage('log_message_update_music_list_progress', [1, '?']));
    await browserController.createTab(Constants.MUSIC_LIST_URL);
  } catch (error) {
    browserController.reset();
    Logger.error(error);
    changeState(STATE.IDLE);
    throw error;
  }
}

/*
ローカルの曲リストと成績リストを比較し、曲情報が欠けている曲について
その情報を取得する
*/
async function fetchMissingMusicInfo(windowId) {
  if (state != STATE.IDLE) {
    const message = `fetchMissingMusicInfo: state unmatch (current state: ${state})`;
    Logger.debug(message);
    throw new Error(message);
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
  changeState(STATE.UPDATE_MUSIC_DETAIL);
  try {
    const targetMusic = targetMusics.shift();
    Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_progress', [targetMusic.musicId, targetMusics.length]));
    await browserController.createTab(targetMusic.url);
  } catch (error) {
    browserController.reset();
    Logger.error(error);
    changeState(STATE.IDLE);
    throw error;
  }
}

/*
公式の成績一覧ページから成績情報を取得し、ローカルのスコアリストを更新する
*/
async function updateScoreList(windowId, playMode, musicType) {
  if (state != STATE.IDLE) {
    const message = `updateScoreList: state unmatch (current state: ${state})`;
    Logger.debug(message);
    throw new Error(message);
  }
  Logger.info(I18n.getMessage('log_message_update_score_list_begin'));
  changeState(STATE.UPDATE_SCORE_LIST);
  try {
    Logger.info(I18n.getMessage('log_message_update_score_list_progress', [1, '?']));
    await browserController.createTab(Constants.SCORE_LIST_URL[playMode][musicType]);
  } catch (error) {
    browserController.reset();
    Logger.error(error);
    changeState(STATE.IDLE);
    throw error;
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
    const message = `updateScoreDetail: state unmatch (current state: ${state})`;
    Logger.debug(message);
    throw new Error(message);
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
  changeState(STATE.UPDATE_SCORE_DETAIL);
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
    changeState(STATE.IDLE);
    throw error;
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
    case STATE.ABORTING:
      setTimeout(async () => {
        try {
          await closeTab();
        } catch (e) {}
        changeState(STATE.IDLE);
        Logger.info(I18n.getMessage('log_message_aborted'));
      }, 0);
      break;
    case STATE.UPDATE_MUSIC_LIST:
      browserController.sendMessageToTab({ type: 'PARSE_MUSIC_LIST' }, async (res) => {
        console.log(res);
        if (res.status != Parser.STATUS.SUCCESS) {
          await handleError(res);
          return;
        }
        res.musics.forEach(function (music) {
          musicList.applyObject(music);
        });
        saveStorage();
        updateCharts();
        if (res.hasNext) {
          try {
            Logger.info(I18n.getMessage('log_message_update_music_list_progress', [res.currentPage + 1, res.maxPage]));
            await browserController.updateTab(res.nextUrl);
          } catch (error) {
            browserController.reset();
            Logger.error(error.message);
            changeState(STATE.IDLE);
            Logger.info(I18n.getMessage('log_message_aborted'));
          }
        } else {
          await closeTab();
          changeState(STATE.IDLE);
          Logger.info(I18n.getMessage('log_message_done'));
        }
      });
      break;
    case STATE.UPDATE_MUSIC_DETAIL:
      browserController.sendMessageToTab({ type: 'PARSE_MUSIC_DETAIL' }, async (res) => {
        console.log(res);
        if (res.status != Parser.STATUS.SUCCESS) {
          await handleError(res);
          return;
        }
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
            Logger.error(error.message);
            changeState(STATE.IDLE);
            Logger.info(I18n.getMessage('log_message_aborted'));
          }
        } else {
          await closeTab();
          changeState(STATE.IDLE);
          Logger.info(I18n.getMessage('log_message_done'));
        }
      });
      break;
    case STATE.UPDATE_SCORE_LIST:
      browserController.sendMessageToTab({ type: 'PARSE_SCORE_LIST' }, async (res) => {
        console.log(res);
        if (res.status != Parser.STATUS.SUCCESS) {
          await handleError(res);
          return;
        }
        res.scores.forEach(function (score) {
          scoreList.applyObject(score);
        });
        saveStorage();
        updateCharts();
        if (res.hasNext) {
          try {
            Logger.info(I18n.getMessage('log_message_update_score_list_progress', [res.currentPage + 1, res.maxPage]));
            await browserController.updateTab(res.nextUrl);
          } catch (error) {
            browserController.reset();
            Logger.error(error.message);
            changeState(STATE.IDLE);
            Logger.info(I18n.getMessage('log_message_aborted'));
          }
        } else {
          await closeTab();
          changeState(STATE.IDLE);
          Logger.info(I18n.getMessage('log_message_done'));
        }
      });
      break;
    case STATE.UPDATE_SCORE_DETAIL:
      browserController.sendMessageToTab({ type: 'PARSE_SCORE_DETAIL' }, async (res) => {
        console.log(res);
        if (res.status != Parser.STATUS.SUCCESS) {
          await handleError(res);
          return;
        }
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
            Logger.error(error.message);
            changeState(STATE.IDLE);
            Logger.info(I18n.getMessage('log_message_aborted'));
          }
        } else {
          await closeTab();
          changeState(STATE.IDLE);
          Logger.info(I18n.getMessage('log_message_done'));
        }
      });
      break;
    default:
      break;
  }
}

function changeState(nextState) {
  chrome.runtime.sendMessage({ type: CHANGE_STATE_MESSAGE_TYPE, oldState: state, state: nextState });
  state = nextState;
}

async function handleError(res) {
  switch (res.status) {
    case Parser.STATUS.UNKNOWN_ERROR:
      Logger.info(I18n.getMessage('log_message_unknown_error'));
      break;
    case Parser.STATUS.LOGIN_REQUIRED:
      Logger.info(I18n.getMessage('log_message_login_required'));
      break;
    default:
      throw new Error(`unknown Parser.STATUS (${res.status})`);
  }
  await closeTab();
  changeState(STATE.IDLE);
  Logger.info(I18n.getMessage('log_message_aborted'));
}

async function closeTab() {
  if (options.notcloseTabAfterUse != true) {
    await browserController.closeTab();
  }
}

async function exportScoreToSkillAttack(ddrcode, password) {
  let skillAttackIndexMap;
  let skillAttackDataList;

  Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_begin'));
  fetch('http://skillattack.com/sa4/data/master_music.txt')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
      Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_fetch_music_master_success'));
      response.text().then((text) => {
        skillAttackIndexMap = SkillAttackIndexMap.createFromText(text);

        fetch(`http://skillattack.com/sa4/data/dancer/${ddrcode}/score_${ddrcode}.txt`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP status: ${response.status}`);
            }
            response.text().then((text) => {
              skillAttackDataList = new SkillAttackDataList(skillAttackIndexMap);
              skillAttackDataList.applyText(text);
              const skillAttackDataListDiff = skillAttackDataList.getDiff(scoreList);
              Logger.debug(skillAttackDataListDiff);
            });
          })
          .catch((reason) => {});
      });
    })
    .catch((reason) => {
      Logger.info(I18n.getMessage('log_message_network_error'));
      Logger.debug(reason);
      Logger.info(I18n.getMessage('log_message_aborted'));
    });
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

  window.abortAction = abortAction;
  window.echo = echo;
  window.exportScoreToSkillAttack = exportScoreToSkillAttack;
  window.fetchMissingMusicInfo = fetchMissingMusicInfo;
  window.fetchParsedMusicList = fetchParsedMusicList;
  window.getChartCount = getChartCount;
  window.getChartList = getChartList;
  window.getConditions = getConditions;
  window.getOptions = getOptions;
  window.getMusicList = getMusicList;
  window.getScoreList = getScoreList;
  window.getState = getState;
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
