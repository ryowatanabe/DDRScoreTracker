import { MusicList } from './MusicList.js';
import { MusicData } from './MusicData.js';
import { ScoreList } from './ScoreList.js';
import { ScoreDiff } from './ScoreDiff.js';
import { ChartList } from './ChartList.js';
import { ChartData } from './ChartData.js';
import { SkillAttackExporter } from './SkillAttackExporter.js';
import { DataFetchController } from './DataFetchController.js';
import { Constants } from './Constants.js';
import { Logger } from './Logger.js';
import { Storage } from './Storage.js';
import { BrowserController } from './BrowserController.js';
import { Parser } from './Parser.js';
import { I18n } from './I18n.js';
import { Util } from './Util.js';

import { STATE, CHANGE_STATE_MESSAGE_TYPE } from './AppState.js';

export class App {
  constructor() {
    this.storage = new Storage({
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
      differences: [],
    });

    this.state = STATE.INITIALIZE;

    this.musicList = null; // 曲リスト。1曲1エントリ。
    this.scoreList = null; // スコアリスト。1曲1エントリ。
    this.chartList = new ChartList(); // 曲リストとスコアリストを結合したもの。1譜面1エントリ。
    this.savedConditions = null;
    this.conditions = null;
    this.saSettings = null;
    this.options = null;
    this.internalStatus = null;

    this.dataFetchController = new DataFetchController({
      getMusicList: () => this.musicList,
      getScoreList: () => this.scoreList,
      onSaveStorage: () => this.saveStorage(),
      onUpdateCharts: () => this.updateCharts(),
      onNavigateTo: (url) => this.navigateTo(url),
      onFinishAction: () => this.finishAction(),
      onHandleError: (res) => this.handleError(res),
    });

    this.browserController = new BrowserController(chrome.windows.WINDOW_ID_CURRENT, this.onUpdateTab.bind(this));
    this.browserController.delay = Constants.LOAD_INTERVAL;

    this.messageListeners = [];
  }

  async init() {
    const data = await this.storage.ready;
    this.musicList = MusicList.createFromStorage(data.musics);
    this.scoreList = ScoreList.createFromStorage(data.scores);
    this.savedConditions = data.savedConditions;
    this.conditions = data.conditions;
    this.saSettings = data.saSettings;
    this.options = data.options;
    this.internalStatus = data.internalStatus;
    this.dataFetchController.differences = ScoreDiff.createMultiFromStorage(data.differences);
    this.updateCharts();
    this.changeState(STATE.IDLE);
  }

  abortAction() {
    switch (this.state) {
      case STATE.UPDATE_MUSIC_LIST:
      case STATE.UPDATE_SCORE_LIST:
      case STATE.UPDATE_MUSIC_DETAIL:
      case STATE.UPDATE_SCORE_DETAIL:
        Logger.info(I18n.getMessage('log_message_aborting'));
        setTimeout(async () => {
          try {
            await this.closeTab(true);
          } catch (e) {
            Logger.debug(e);
          }
          this.changeState(STATE.IDLE);
          Logger.info(I18n.getMessage('log_message_aborted'));
        }, 0);
        this.changeState(STATE.ABORTING);
        break;
      default:
        Logger.debug(`abortAction: state unmatch (current state: ${this.state})`);
        break;
    }
  }

  echo(message) {
    Logger.debug(message);
  }

  getState() {
    return this.state;
  }

  async saveStorage() {
    await this.storage.saveStorage({
      scores: this.scoreList.toStorageData(),
      musics: this.musicList.toStorageData(),
      savedConditions: this.savedConditions,
      conditions: this.conditions,
      saSettings: this.saSettings,
      options: this.options,
      internalStatus: this.internalStatus,
      differences: this.dataFetchController.differences.map((d) => d.toStorageData()),
    });
  }

  async resetStorage() {
    await this.storage.resetStorage();
  }

  getBytesInUse() {
    return this.storage.bytesInUse;
  }

  getSavedConditions() {
    return this.savedConditions;
  }

  getConditions() {
    return this.conditions;
  }

  getInternalStatus() {
    return this.internalStatus;
  }

  getSaSettings() {
    return this.saSettings;
  }

  getOptions() {
    return this.options;
  }

  addMessageListener(messageListener = (_message) => {}) {
    this.messageListeners.push(messageListener);
    Logger.addListener(messageListener);
  }

  saveSavedCondition(newSavedCondition) {
    let isUpdated = false;
    this.savedConditions.forEach((savedCondition) => {
      if (savedCondition.name === newSavedCondition.name) {
        savedCondition.summary = newSavedCondition.summary;
        savedCondition.filter = newSavedCondition.filter;
        savedCondition.sort = newSavedCondition.sort;
        isUpdated = true;
      }
    }, this);
    if (!isUpdated) {
      this.savedConditions.push(newSavedCondition);
    }
    this.saveStorage();
    return this.savedConditions;
  }

  saveSavedConditions(newSavedConditions) {
    this.savedConditions = newSavedConditions;
    this.saveStorage();
    return this.savedConditions;
  }

  saveConditions(summarySettings, filterConditions, sortConditions) {
    this.conditions = {
      summary: summarySettings,
      filter: filterConditions,
      sort: sortConditions,
    };
    this.saveStorage();
  }

  saveSaSettings(ddrcode) {
    this.saSettings.ddrcode = ddrcode;
    this.saveStorage();
  }

  saveOptions(newOptions) {
    this.options = newOptions;
    this.saveStorage();
  }

  getMusicList() {
    return this.musicList;
  }

  getScoreList() {
    return this.scoreList;
  }

  getDifferences() {
    return this.dataFetchController.differences;
  }

  getChartCount() {
    return this.chartList.charts.length;
  }

  getChartList() {
    return this.chartList;
  }

  restoreMusicList(string) {
    const lines = string.split('\n');
    Logger.info(I18n.getMessage('log_message_restore_music_list_count', lines.length));
    lines.forEach(function (line) {
      this.musicList.applyEncodedString(line);
    }, this);
    this.saveStorage();
    this.updateCharts();
  }

  restoreScoreList(object) {
    this.scoreList = ScoreList.createFromStorage(object);
    this.saveStorage();
    this.updateCharts();
  }

  /*
  gh pagesから曲リストを取得し、ローカルの曲リストを更新する
  */
  async fetchParsedMusicList() {
    Logger.info(I18n.getMessage('log_message_fetch_parsed_music_list_begin'));
    try {
      const response = await fetch(Constants.PARSED_MUSIC_LIST_URL.replace('[version]', Constants.MUSIC_LIST_VERSION), { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
      Logger.info(I18n.getMessage('log_message_fetch_parsed_music_list_fetch_success'));
      const text = await response.text();
      this.restoreMusicList(text);
      this.internalStatus.musicListUpdatedAt = Date.now();
      this.saveStorage();
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
  async updateMusicList() {
    if (this.state !== STATE.IDLE) {
      const message = `updateMusicList: state unmatch (current state: ${this.state})`;
      Logger.debug(message);
      throw new Error(message);
    }
    Logger.info(I18n.getMessage('log_message_update_music_list_begin'));
    this.changeState(STATE.UPDATE_MUSIC_LIST);
    try {
      Logger.info(I18n.getMessage('log_message_update_music_list_progress', [1, '?']));
      await this.browserController.createTab(Constants.MUSIC_LIST_URL, this.options.openTabAsActive);
    } catch (error) {
      this.browserController.reset();
      Logger.error(error);
      this.changeState(STATE.IDLE);
      throw error;
    }
  }

  /*
  曲リストに現存する全曲の曲情報を再取得する
  難易度更新検知に使えるが、未解禁曲の情報は取得できない場合があるため注意
  */
  async refreshAllMusicInfo(musicIdForFilter, gameVersion) {
    if (this.state !== STATE.IDLE) {
      const message = `refreshAllMusicInfo: state unmatch (current state: ${this.state})`;
      Logger.debug(message);
      throw new Error(message);
    }
    Logger.info(I18n.getMessage('log_message_refresh_all_music_info_begin'));
    this.dataFetchController.targetGameVersion = gameVersion;
    this.dataFetchController.targetMusics = [];
    this.musicList.musicIds
      .sort()
      .filter((musicId) => {
        return musicId >= musicIdForFilter;
      })
      .forEach((musicId) => {
        let musicType = this.musicList.getMusicDataById(musicId).type;
        if (musicType === Constants.MUSIC_TYPE.UNKNOWN) {
          musicType = Constants.MUSIC_TYPE.NORMAL;
        }
        if (Constants.MUSIC_DETAIL_URL[gameVersion][musicType] !== '') {
          this.dataFetchController.targetMusics.push({
            musicId: musicId,
            type: musicType,
            url: Constants.MUSIC_DETAIL_URL[gameVersion][musicType].replace('[musicId]', musicId),
          });
        }
      }, this);
    if (this.dataFetchController.targetMusics.length === 0) {
      Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_no_target'));
      return false;
    }
    Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_target_found', this.dataFetchController.targetMusics.length));
    this.changeState(STATE.UPDATE_MUSIC_DETAIL);
    try {
      this.dataFetchController.targetMusic = this.dataFetchController.targetMusics.shift();
      Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_progress', [this.dataFetchController.targetMusic.musicId, this.dataFetchController.targetMusics.length]));
      await this.browserController.createTab(this.dataFetchController.targetMusic.url, this.options.openTabAsActive);
    } catch (error) {
      this.browserController.reset();
      Logger.error(error);
      this.changeState(STATE.IDLE);
      throw error;
    }
  }

  /*
  ローカルの曲リストと成績リストを比較し、曲情報が欠けている曲について
  その情報を取得する
  */
  async fetchMissingMusicInfo(gameVersion) {
    if (this.state !== STATE.IDLE) {
      const message = `fetchMissingMusicInfo: state unmatch (current state: ${this.state})`;
      Logger.debug(message);
      throw new Error(message);
    }
    Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_begin'));
    // 曲情報が欠けている曲と、曲情報そのものはあるが、譜面情報が欠けている (追加鬼譜面など) 曲を列挙する
    const targetMusicIDs = this.scoreList.musicIds.filter((musicId) => {
      if (!this.musicList.hasMusic(musicId)) {
        return true;
      }
      const missing = this.scoreList.getScoreDataByMusicId(musicId).difficulties.find((difficulty) => {
        if (this.musicList.getMusicDataById(musicId).difficulty[difficulty] === 0) {
          return true;
        }
      });
      return missing;
    });
    this.dataFetchController.targetGameVersion = gameVersion;
    this.dataFetchController.targetMusics = targetMusicIDs.map((musicId) => {
      let musicType = this.scoreList.getScoreDataByMusicId(musicId).musicType;
      if (musicType === Constants.MUSIC_TYPE.UNKNOWN) {
        musicType = Constants.MUSIC_TYPE.NORMAL;
      }
      return {
        musicId: musicId,
        type: musicType,
        url: Constants.MUSIC_DETAIL_URL[gameVersion][musicType].replace('[musicId]', musicId),
      };
    });
    if (this.dataFetchController.targetMusics.length === 0) {
      Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_no_target'));
      return false;
    }
    Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_target_found', this.dataFetchController.targetMusics.length));
    this.changeState(STATE.UPDATE_MUSIC_DETAIL);
    try {
      this.dataFetchController.targetMusic = this.dataFetchController.targetMusics.shift();
      Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_progress', [this.dataFetchController.targetMusic.musicId, this.dataFetchController.targetMusics.length]));
      await this.browserController.createTab(this.dataFetchController.targetMusic.url, this.options.openTabAsActive);
    } catch (error) {
      this.browserController.reset();
      Logger.error(error);
      this.changeState(STATE.IDLE);
      throw error;
    }
  }

  /*
  公式の成績一覧ページから成績情報を取得し、ローカルのスコアリストを更新する
  */
  async updateScoreList(gameVersion) {
    if (this.state !== STATE.IDLE) {
      const message = `updateScoreList: state unmatch (current state: ${this.state})`;
      Logger.debug(message);
      throw new Error(message);
    }
    Logger.info(I18n.getMessage('log_message_update_score_list_begin'));
    this.changeState(STATE.UPDATE_SCORE_LIST);
    this.dataFetchController.differences = [];
    try {
      this.dataFetchController.targetGameVersion = gameVersion;
      this.dataFetchController.targetPlayMode = Constants.PLAY_MODE_FIRST;
      this.dataFetchController.targetMusicType = Constants.MUSIC_TYPE_FIRST;
      Logger.info(
        I18n.getMessage('log_message_update_score_list_progress', [
          I18n.getMessage(`log_message_update_score_list_play_mode_${this.dataFetchController.targetPlayMode}`),
          I18n.getMessage(`log_message_update_score_list_music_type_${this.dataFetchController.targetMusicType}`),
          1,
          '?',
        ])
      );
      await this.browserController.createTab(
        Constants.SCORE_LIST_URL[this.dataFetchController.targetGameVersion][this.dataFetchController.targetPlayMode][this.dataFetchController.targetMusicType],
        this.options.openTabAsActive
      );
    } catch (error) {
      this.browserController.reset();
      Logger.error(error);
      this.changeState(STATE.IDLE);
      throw error;
    }
  }

  /*
  公式の成績詳細ページから成績情報を取得し、ローカルのスコアリストを更新する
  targets: [
    { musicId:xxx, difficulty:yy }, ...
  ]
  */
  async updateScoreDetail(targets, gameVersion) {
    if (this.state !== STATE.IDLE) {
      const message = `updateScoreDetail: state unmatch (current state: ${this.state})`;
      Logger.debug(message);
      throw new Error(message);
    }
    Logger.info(I18n.getMessage('log_message_update_score_detail_begin'));
    // 巡回対象のURL一覧を生成
    this.dataFetchController.targetMusics = [];
    targets.forEach((music) => {
      let musicType = Constants.MUSIC_TYPE.NORMAL;
      if (this.musicList.hasMusic(music.musicId)) {
        musicType = this.musicList.getMusicDataById(music.musicId).type;
      } else if (this.scoreList.hasMusic(music.musicId)) {
        musicType = this.scoreList.getScoreDataByMusicId(music.musicId).musicType;
      }
      if (musicType === Constants.MUSIC_TYPE.UNKNOWN) {
        musicType = Constants.MUSIC_TYPE.NORMAL;
      }
      if (Constants.SCORE_DETAIL_URL[gameVersion][musicType] !== '') {
        music.url = Constants.SCORE_DETAIL_URL[gameVersion][musicType].replace('[musicId]', music.musicId).replace('[difficulty]', music.difficulty);
        this.dataFetchController.targetMusics.push(music);
      }
    }, this);
    if (this.dataFetchController.targetMusics.length === 0) {
      Logger.info(I18n.getMessage('log_message_update_score_detail_no_target'));
      return false;
    }
    Logger.info(I18n.getMessage('log_message_update_score_detail_target_found', this.dataFetchController.targetMusics.length));
    this.changeState(STATE.UPDATE_SCORE_DETAIL);
    try {
      const targetMusic = this.dataFetchController.targetMusics.shift();
      Logger.info(
        I18n.getMessage('log_message_update_score_detail_progress', [
          this.musicList.hasMusic(targetMusic.musicId) ? this.musicList.getMusicDataById(targetMusic.musicId).title : targetMusic.musicId,
          Constants.PLAY_MODE_AND_DIFFICULTY_STRING[targetMusic.difficulty],
          this.dataFetchController.targetMusics.length,
        ])
      );
      await this.browserController.createTab(targetMusic.url, this.options.openTabAsActive);
    } catch (error) {
      this.browserController.reset();
      Logger.error(error);
      this.changeState(STATE.IDLE);
      throw error;
    }
  }

  updateCharts() {
    this.chartList.reset();
    this.musicList.musicIds.forEach(function (musicId) {
      Object.values(Constants.PLAY_MODE).forEach(function (playMode) {
        Object.values(Constants.DIFFICULTIES).forEach(function (difficulty) {
          if (playMode === Constants.PLAY_MODE.DOUBLE && difficulty === Constants.DIFFICULTIES.BEGINNER) {
            return;
          }
          const musicData = this.musicList.getMusicDataById(musicId);
          const difficultyValue = Util.getDifficultyValue(playMode, difficulty);
          const scoreDataExists = this.scoreList.hasMusic(musicId) && this.scoreList.getScoreDataByMusicId(musicId).hasDifficulty(difficultyValue);
          if (!musicData.hasDifficulty(difficultyValue) && !scoreDataExists) {
            return;
          }

          const chartData = new ChartData(musicId, playMode, difficulty);
          chartData.musicData = musicData;

          if (scoreDataExists) {
            chartData.scoreDetail = this.scoreList.getScoreDataByMusicId(musicId).getScoreDetailByDifficulty(difficultyValue);
          }

          this.chartList.addChartData(chartData);
        }, this);
      }, this);
    }, this);
    this.scoreList.musicIds.forEach(function (musicId) {
      if (!this.musicList.hasMusic(musicId)) {
        Object.values(Constants.PLAY_MODE).forEach(function (playMode) {
          Object.values(Constants.DIFFICULTIES).forEach(function (difficulty) {
            const difficultyValue = Util.getDifficultyValue(playMode, difficulty);
            const scoreDataExists = this.scoreList.hasMusic(musicId) && this.scoreList.getScoreDataByMusicId(musicId).hasDifficulty(difficultyValue);
            if (!scoreDataExists) {
              return;
            }

            const chartData = new ChartData(musicId, playMode, difficulty);
            chartData.musicData = MusicData.createEmptyData(musicId, this.scoreList.getScoreDataByMusicId(musicId).musicType);
            chartData.scoreDetail = this.scoreList.getScoreDataByMusicId(musicId).getScoreDetailByDifficulty(difficultyValue);

            this.chartList.addChartData(chartData);
          }, this);
        }, this);
      }
    }, this);
  }

  onUpdateTab() {
    switch (this.state) {
      case STATE.UPDATE_MUSIC_LIST:
        this.browserController.sendMessageToTab({ type: 'PARSE_MUSIC_LIST', gameVersion: this.dataFetchController.targetGameVersion }, (res) =>
          this.dataFetchController.handleMusicListResponse(res)
        );
        break;
      case STATE.UPDATE_MUSIC_DETAIL:
        this.browserController.sendMessageToTab({ type: 'PARSE_MUSIC_DETAIL', gameVersion: this.dataFetchController.targetGameVersion }, (res) =>
          this.dataFetchController.handleMusicDetailResponse(res)
        );
        break;
      case STATE.UPDATE_SCORE_LIST:
        this.browserController.sendMessageToTab({ type: 'PARSE_SCORE_LIST', gameVersion: this.dataFetchController.targetGameVersion }, (res) =>
          this.dataFetchController.handleScoreListResponse(res)
        );
        break;
      case STATE.UPDATE_SCORE_DETAIL:
        this.browserController.sendMessageToTab({ type: 'PARSE_SCORE_DETAIL', gameVersion: this.dataFetchController.targetGameVersion }, (res) =>
          this.dataFetchController.handleScoreDetailResponse(res)
        );
        break;
      default:
        Logger.debug('onUpdateTab: event was ignored.');
        break;
    }
  }

  // updateTab を呼び出し、失敗時は reset してアボートする
  async navigateTo(url) {
    try {
      await this.browserController.updateTab(url);
    } catch (error) {
      this.browserController.reset();
      Logger.error(error.message);
      this.changeState(STATE.IDLE);
      Logger.info(I18n.getMessage('log_message_aborted'));
    }
  }

  // タブを閉じて IDLE に戻り、完了ログを出す
  async finishAction() {
    await this.closeTab();
    this.changeState(STATE.IDLE);
    Logger.info(I18n.getMessage('log_message_done'));
  }

  changeState(nextState) {
    this.messageListeners.forEach((listener) => {
      listener({ type: CHANGE_STATE_MESSAGE_TYPE, oldState: this.state, state: nextState });
    }, this);
    Logger.debug(`App.changeState ${this.state} -> ${nextState}`);
    this.state = nextState;
  }

  async handleError(res) {
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
    this.browserController.reset();
    this.changeState(STATE.IDLE);
    Logger.info(I18n.getMessage('log_message_aborted'));
  }

  async closeTab(force) {
    if (this.options.notCloseTabAfterUse !== true) {
      await this.browserController.closeTab(force);
    }
  }

  async exportScoreToSkillAttack(ddrcode, password) {
    if (ddrcode.trim() === '') {
      Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_password_invalid'));
      Logger.info(I18n.getMessage('log_message_aborted'));
      return;
    }
    this.saveSaSettings(ddrcode);
    const exporter = new SkillAttackExporter(this.musicList, this.scoreList, this.options);
    await exporter.export(ddrcode, password);
  }
}
