import { MusicList } from '../static/common/MusicList.js';
import { MusicData } from '../static/common/MusicData.js';
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
import { Util } from '../static/common/Util.js';

import { STATE, CHANGE_STATE_MESSAGE_TYPE } from '../static/background/state.js';

const storage = new Storage(
  {
    scores: {},
    musics: {},
    savedConditions: [],
    conditions: {
      summary: { clearType: true },
      filter: [],
      sort: [],
    },
    saSettings: {
      ddrcode: '',
    },
    options: {
      musicListReloadInterval: Constants.MUSIC_LIST_RELOAD_INTERVAL,
    },
    internalStatus: {
      musicListUpdatedAt: 0,
    },
  },
  (data) => {
    musicList = MusicList.createFromStorage(data.musics);
    scoreList = ScoreList.createFromStorage(data.scores);
    savedConditions = data.savedConditions;
    conditions = data.conditions;
    saSettings = data.saSettings;
    options = data.options;
    internalStatus = data.internalStatus;
    updateCharts();
    changeState(STATE.IDLE);
  }
);

let state = STATE.INITIALIZE;
let targetPlayMode;
let targetMusicType;
let targetMusics = [];
let targetMusic;

let musicList; // 曲リスト。1曲1エントリ。
let scoreList; // スコアリスト。1曲1エントリ。
let chartList = new ChartList(); // 曲リストとスコアリストを結合したもの。1譜面1エントリ。
let differences = []; // スコア差分リスト。
let savedConditions;
let conditions;
let saSettings;
let options;
let internalStatus;

function abortAction() {
  switch (state) {
    case STATE.UPDATE_MUSIC_LIST:
    case STATE.UPDATE_SCORE_LIST:
    case STATE.UPDATE_MUSIC_DETAIL:
    case STATE.UPDATE_SCORE_DETAIL:
      Logger.info(I18n.getMessage('log_message_aborting'));
      setTimeout(async () => {
        try {
          await closeTab(true);
        } catch (e) {
          Logger.debug(e);
        }
        changeState(STATE.IDLE);
        Logger.info(I18n.getMessage('log_message_aborted'));
      }, 0);
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
    savedConditions: savedConditions,
    conditions: conditions,
    saSettings: saSettings,
    options: options,
    internalStatus: internalStatus,
  });
}

function resetStorage() {
  storage.resetStorage();
}

function getBytesInUse() {
  return storage.bytesInUse;
}

function getSavedConditions() {
  return savedConditions;
}

function getConditions() {
  return conditions;
}

function getInternalStatus() {
  return internalStatus;
}

function getSaSettings() {
  return saSettings;
}

function getOptions() {
  return options;
}

function saveSavedCondition(newSavedCondition) {
  let isUpdated = false;
  savedConditions.forEach((savedCondition) => {
    if (savedCondition.name == newSavedCondition.name) {
      savedCondition.summary = newSavedCondition.summary;
      savedCondition.filter = newSavedCondition.filter;
      savedCondition.sort = newSavedCondition.sort;
      isUpdated = true;
    }
  });
  if (!isUpdated) {
    savedConditions.push(newSavedCondition);
  }
  saveStorage();
  return savedConditions;
}

function saveSavedConditions(newSavedConditions) {
  savedConditions = newSavedConditions;
  saveStorage();
  return savedConditions;
}

function saveConditions(summarySettings, filterConditions, sortConditions) {
  conditions = {
    summary: summarySettings,
    filter: filterConditions,
    sort: sortConditions,
  };
  saveStorage();
}

function saveSaSettings(ddrcode) {
  saSettings.ddrcode = ddrcode;
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

function getDifferences() {
  differences.forEach((difference) => {
    if (musicList.hasMusic(difference.musicId)) {
      difference.musicData = musicList.getMusicDataById(difference.musicId);
    }
  });
  return differences;
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

async function fetchParsedMusicList() {
  Logger.info(I18n.getMessage('log_message_fetch_parsed_music_list_begin'));
  try {
    const response = await fetch(Constants.PARSED_MUSIC_LIST_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP status: ${response.status}`);
    }
    Logger.info(I18n.getMessage('log_message_fetch_parsed_music_list_fetch_success'));
    const text = await response.text();
    restoreMusicList(text);
    internalStatus.musicListUpdatedAt = Date.now();
    saveStorage();
    Logger.info(I18n.getMessage('log_message_done'));
  } catch (error) {
    Logger.info(I18n.getMessage('log_message_network_error'));
    Logger.debug(error);
    Logger.info(I18n.getMessage('log_message_aborted'));
    throw error;
  }
}

/*
公式の曲一覧から曲情報を取得し、ローカルの曲リストを更新する
*/
async function updateMusicList() {
  if (state != STATE.IDLE) {
    const message = `updateMusicList: state unmatch (current state: ${state})`;
    Logger.debug(message);
    throw new Error(message);
  }
  Logger.info(I18n.getMessage('log_message_update_music_list_begin'));
  changeState(STATE.UPDATE_MUSIC_LIST);
  try {
    Logger.info(I18n.getMessage('log_message_update_music_list_progress', [1, '?']));
    await browserController.createTab(Constants.MUSIC_LIST_URL, options.openTabAsActive);
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
async function fetchMissingMusicInfo() {
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
    let musicType = scoreList.getScoreDataByMusicId(musicId).musicType;
    if (musicType == Constants.MUSIC_TYPE.UNKNOWN) {
      musicType = Constants.MUSIC_TYPE.NORMAL;
    }
    return {
      musicId: musicId,
      type: musicType,
      url: Constants.MUSIC_DETAIL_URL[musicType].replace('[musicId]', musicId),
    };
  });
  if (targetMusics.length == 0) {
    Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_no_target'));
    return false;
  }
  Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_target_found', targetMusics.length));
  changeState(STATE.UPDATE_MUSIC_DETAIL);
  try {
    targetMusic = targetMusics.shift();
    Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_progress', [targetMusic.musicId, targetMusics.length]));
    await browserController.createTab(targetMusic.url, options.openTabAsActive);
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
async function updateScoreList() {
  if (state != STATE.IDLE) {
    const message = `updateScoreList: state unmatch (current state: ${state})`;
    Logger.debug(message);
    throw new Error(message);
  }
  Logger.info(I18n.getMessage('log_message_update_score_list_begin'));
  changeState(STATE.UPDATE_SCORE_LIST);
  differences = [];
  try {
    targetPlayMode = Constants.PLAY_MODE_FIRST;
    targetMusicType = Constants.MUSIC_TYPE_FIRST;
    Logger.info(
      I18n.getMessage('log_message_update_score_list_progress', [
        I18n.getMessage(`log_message_update_score_list_play_mode_${targetPlayMode}`),
        I18n.getMessage(`log_message_update_score_list_music_type_${targetMusicType}`),
        1,
        '?',
      ])
    );
    await browserController.createTab(Constants.SCORE_LIST_URL[targetPlayMode][targetMusicType], options.openTabAsActive);
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
async function updateScoreDetail(targets) {
  if (state != STATE.IDLE) {
    const message = `updateScoreDetail: state unmatch (current state: ${state})`;
    Logger.debug(message);
    throw new Error(message);
  }
  Logger.info(I18n.getMessage('log_message_update_score_detail_begin'));
  /* 巡回対象のURL一覧を生成 */
  targetMusics = targets.map((music) => {
    let musicType = Constants.MUSIC_TYPE.NORMAL;
    if (musicList.hasMusic(music.musicId)) {
      musicType = musicList.getMusicDataById(music.musicId).type;
    } else if (scoreList.hasMusic(music.musicId)) {
      musicType = scoreList.getScoreDataByMusicId(music.musicId).musicType;
    }
    if (musicType == Constants.MUSIC_TYPE.UNKNOWN) {
      musicType = Constants.MUSIC_TYPE.NORMAL;
    }
    music.url = Constants.SCORE_DETAIL_URL[musicType].replace('[musicId]', music.musicId).replace('[difficulty]', music.difficulty);
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
        musicList.hasMusic(targetMusic.musicId) ? musicList.getMusicDataById(targetMusic.musicId).title : targetMusic.musicId,
        Constants.PLAY_MODE_AND_DIFFICULTY_STRING[targetMusic.difficulty],
        targetMusics.length,
      ])
    );
    await browserController.createTab(targetMusic.url, options.openTabAsActive);
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
        const difficultyValue = Util.getDifficultyValue(playMode, difficulty);
        const scoreDataExists = scoreList.hasMusic(musicId) && scoreList.getScoreDataByMusicId(musicId).hasDifficulty(difficultyValue);
        if (!musicData.hasDifficulty(difficultyValue) && !scoreDataExists) {
          return;
        }

        const chartData = new ChartData(musicId, playMode, difficulty);
        chartData.musicData = musicData;

        if (scoreDataExists) {
          chartData.scoreDetail = scoreList.getScoreDataByMusicId(musicId).getScoreDetailByDifficulty(difficultyValue);
        } else {
          chartData.scoreDetail = new ScoreDetail();
        }

        chartList.addChartData(chartData);
      });
    });
  });
  scoreList.musicIds.forEach(function (musicId) {
    if (!musicList.hasMusic(musicId)) {
      Object.values(Constants.PLAY_MODE).forEach(function (playMode) {
        Object.values(Constants.DIFFICULTIES).forEach(function (difficulty) {
          const difficultyValue = Util.getDifficultyValue(playMode, difficulty);
          const scoreDataExists = scoreList.hasMusic(musicId) && scoreList.getScoreDataByMusicId(musicId).hasDifficulty(difficultyValue);
          if (!scoreDataExists) {
            return;
          }

          const chartData = new ChartData(musicId, playMode, difficulty);
          chartData.musicData = new MusicData(musicId, scoreList.getScoreDataByMusicId(musicId).musicType, '', [0, 0, 0, 0, 0, 0, 0, 0, 0]);
          chartData.scoreDetail = scoreList.getScoreDataByMusicId(musicId).getScoreDetailByDifficulty(difficultyValue);

          chartList.addChartData(chartData);
        });
      });
    }
  });
}

function onUpdateTab() {
  switch (state) {
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
          music.type = targetMusic.type;
          musicList.applyObject(music);
        });
        saveStorage();
        updateCharts();
        if (targetMusics.length > 0) {
          try {
            targetMusic = targetMusics.shift();
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
          score.musicType = targetMusicType;
          differences = differences.concat(scoreList.applyObject(score));
        });
        saveStorage();
        updateCharts();
        if (res.hasNext) {
          try {
            Logger.info(
              I18n.getMessage('log_message_update_score_list_progress', [
                I18n.getMessage(`log_message_update_score_list_play_mode_${targetPlayMode}`),
                I18n.getMessage(`log_message_update_score_list_music_type_${targetMusicType}`),
                res.currentPage + 1,
                res.maxPage,
              ])
            );
            await browserController.updateTab(res.nextUrl);
          } catch (error) {
            browserController.reset();
            Logger.error(error.message);
            changeState(STATE.IDLE);
            Logger.info(I18n.getMessage('log_message_aborted'));
          }
        } else {
          let hasNext = false;
          if (targetMusicType != Constants.MUSIC_TYPE_LAST) {
            hasNext = true;
            targetMusicType++;
          } else {
            if (targetPlayMode != Constants.PLAY_MODE_LAST) {
              hasNext = true;
              targetPlayMode++;
              targetMusicType = Constants.MUSIC_TYPE_FIRST;
            }
          }
          if (hasNext) {
            try {
              Logger.info(
                I18n.getMessage('log_message_update_score_list_progress', [
                  I18n.getMessage(`log_message_update_score_list_play_mode_${targetPlayMode}`),
                  I18n.getMessage(`log_message_update_score_list_music_type_${targetMusicType}`),
                  1,
                  '?',
                ])
              );
              await browserController.updateTab(Constants.SCORE_LIST_URL[targetPlayMode][targetMusicType]);
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
                musicList.hasMusic(targetMusic.musicId) ? musicList.getMusicDataById(targetMusic.musicId).title : targetMusic.musicId,
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
      Logger.debug('onUpdateTab: event was ignored.');
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

async function closeTab(force) {
  if (options.notCloseTabAfterUse != true) {
    await browserController.closeTab(force);
  }
}

async function exportScoreToSkillAttack(ddrcode, password) {
  if (ddrcode.trim() == '') {
    Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_password_invalid'));
    Logger.info(I18n.getMessage('log_message_aborted'));
    return;
  }
  saveSaSettings(ddrcode);

  let skillAttackIndexMap;
  let skillAttackDataList;
  const params = new URLSearchParams();
  params.append('_', '');
  params.append('password', password);
  params.append('ddrcode', ddrcode);
  Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_begin'));
  fetch('http://skillattack.com/sa4/dancer_input.php', {
    method: 'POST',
    body: params,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
      response.text().then((text) => {
        if (text.indexOf('Password invalid') >= 0) {
          Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_password_invalid'));
          Logger.info(I18n.getMessage('log_message_aborted'));
          return;
        }
        fetch('http://skillattack.com/sa4/data/master_music.txt', { cache: 'no-store' })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP status: ${response.status}`);
            }
            Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_fetch_music_master_success'));
            response.text().then((text) => {
              skillAttackIndexMap = SkillAttackIndexMap.createFromText(text);

              fetch(`http://skillattack.com/sa4/data/dancer/${ddrcode}/score_${ddrcode}.txt`, { cache: 'no-store' })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(`HTTP status: ${response.status}`);
                  }
                  Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_fetch_score_data_success'));
                  response.text().then((text) => {
                    skillAttackDataList = new SkillAttackDataList(skillAttackIndexMap);
                    skillAttackDataList.applyText(text);
                    const skillAttackDataListDiff = skillAttackDataList.getDiff(musicList, scoreList);
                    if (skillAttackDataListDiff.count == 0) {
                      Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_no_differences'));
                      return;
                    }
                    if (options.notSendDataToSkillAttack) {
                      Logger.info(I18n.getMessage('log_message_done'));
                      return;
                    }
                    Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_send_data'));
                    fetch('http://skillattack.com/sa4/dancer_input.php', {
                      method: 'POST',
                      body: skillAttackDataListDiff.urlSearchParams(ddrcode, password),
                    })
                      .then((response) => {
                        if (!response.ok) {
                          throw new Error(`HTTP status: ${response.status}`);
                        }
                        Logger.info(I18n.getMessage('log_message_done'));
                      })
                      .catch((reason) => {
                        Logger.info(I18n.getMessage('log_message_network_error'));
                        Logger.debug(reason);
                        Logger.info(I18n.getMessage('log_message_aborted'));
                      });
                  });
                })
                .catch((reason) => {
                  Logger.info(I18n.getMessage('log_message_network_error'));
                  Logger.debug(reason);
                  Logger.info(I18n.getMessage('log_message_aborted'));
                });
            });
          })
          .catch((reason) => {
            Logger.info(I18n.getMessage('log_message_network_error'));
            Logger.debug(reason);
            Logger.info(I18n.getMessage('log_message_aborted'));
          });
      });
    })
    .catch((reason) => {
      Logger.info(I18n.getMessage('log_message_network_error'));
      Logger.debug(reason);
      Logger.info(I18n.getMessage('log_message_aborted'));
    });
  return;
}

const browserController = new BrowserController(chrome.windows.WINDOW_ID_CURRENT, onUpdateTab);

(function () {
  browserController.delay = Constants.LOAD_INTERVAL;

  chrome.runtime.onMessage.addListener(function (_message, _sender, _sendResponse) {
    //sendResponse({});
    //return true;
  });

  const extension_id = chrome.i18n.getMessage('@@extension_id');
  chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.create({ url: `chrome-extension://${extension_id}/browser_action/index.html` }, function (_tab) {});
  });

  window.abortAction = abortAction;
  window.echo = echo;
  window.exportScoreToSkillAttack = exportScoreToSkillAttack;
  window.fetchMissingMusicInfo = fetchMissingMusicInfo;
  window.fetchParsedMusicList = fetchParsedMusicList;
  window.getBytesInUse = getBytesInUse;
  window.getChartCount = getChartCount;
  window.getChartList = getChartList;
  window.getConditions = getConditions;
  window.getDifferences = getDifferences;
  window.getInternalStatus = getInternalStatus;
  window.getOptions = getOptions;
  window.getMusicList = getMusicList;
  window.getSaSettings = getSaSettings;
  window.getSavedConditions = getSavedConditions;
  window.getScoreList = getScoreList;
  window.getState = getState;
  window.resetStorage = resetStorage;
  window.restoreMusicList = restoreMusicList;
  window.restoreScoreList = restoreScoreList;
  window.saveConditions = saveConditions;
  window.saveOptions = saveOptions;
  window.saveSavedCondition = saveSavedCondition;
  window.saveSavedConditions = saveSavedConditions;
  window.updateCharts = updateCharts;
  window.updateMusicList = updateMusicList;
  window.updateScoreDetail = updateScoreDetail;
  window.updateScoreList = updateScoreList;
})();
