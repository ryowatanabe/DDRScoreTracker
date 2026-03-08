import { MusicList } from './MusicList.js';
import { MusicData } from './MusicData.js';
import { ScoreList } from './ScoreList.js';
import { ScoreDiff } from './ScoreDiff.js';
import { ChartList } from './ChartList.js';
import { ChartData } from './ChartData.js';
import { SkillAttackExporter } from './SkillAttackExporter.js';
import { DataFetchController } from './DataFetchController.js';
import { Constants, type GameVersion, type PlayMode, type MusicType, type Difficulty } from './Constants.js';
import { Logger } from './Logger.js';
import { Storage } from './Storage.js';
import { BrowserController } from './BrowserController.js';
import { Parser } from './Parser.js';
import { I18n } from './I18n.js';
import { Util } from './Util.js';

import { STATE, CHANGE_STATE_MESSAGE_TYPE } from './AppState.js';

type MessageListener = (message: Record<string, unknown>) => void;

type ParseResponse = {
  status: number;
  musics?: Record<string, unknown>[];
  scores?: Record<string, unknown>[];
  hasNext?: boolean;
  currentPage?: number;
  maxPage?: number;
  nextUrl?: string;
};

type UpdateScoreDetailTarget = {
  musicId: string;
  difficulty: number;
  url?: string;
};

export class App {
  storage: Storage;
  state: number;
  musicList: MusicList | null;
  scoreList: ScoreList | null;
  chartList: ChartList;
  savedConditions: unknown[] | null;
  conditions: unknown | null;
  saSettings: Record<string, unknown> | null;
  options: Record<string, unknown> | null;
  internalStatus: Record<string, unknown> | null;
  dataFetchController: DataFetchController;
  browserController: BrowserController;
  messageListeners: MessageListener[];

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
      getMusicList: () => this.musicList!,
      getScoreList: () => this.scoreList!,
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

  async init(): Promise<void> {
    const data = await this.storage.ready;
    this.musicList = MusicList.createFromStorage(data['musics'] as Record<string, unknown>);
    this.scoreList = ScoreList.createFromStorage(data['scores'] as Record<string, unknown>);
    this.savedConditions = data['savedConditions'] as unknown[];
    this.conditions = data['conditions'];
    this.saSettings = data['saSettings'] as Record<string, unknown>;
    this.options = data['options'] as Record<string, unknown>;
    this.internalStatus = data['internalStatus'] as Record<string, unknown>;
    this.dataFetchController.differences = ScoreDiff.createMultiFromStorage(data['differences'] as Record<string, unknown>[]);
    this.updateCharts();
    this.changeState(STATE.IDLE);
  }

  abortAction(): void {
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

  echo(message: unknown): void {
    Logger.debug(message);
  }

  getState(): number {
    return this.state;
  }

  async saveStorage(): Promise<void> {
    await this.storage.saveStorage({
      scores: this.scoreList!.toStorageData(),
      musics: this.musicList!.toStorageData(),
      savedConditions: this.savedConditions,
      conditions: this.conditions,
      saSettings: this.saSettings,
      options: this.options,
      internalStatus: this.internalStatus,
      differences: this.dataFetchController.differences.map((d) => d.toStorageData()),
    });
  }

  async resetStorage(): Promise<void> {
    await this.storage.resetStorage();
  }

  getBytesInUse(): number {
    return this.storage.bytesInUse;
  }

  getSavedConditions(): unknown[] | null {
    return this.savedConditions;
  }

  getConditions(): unknown {
    return this.conditions;
  }

  getInternalStatus(): Record<string, unknown> | null {
    return this.internalStatus;
  }

  getSaSettings(): Record<string, unknown> | null {
    return this.saSettings;
  }

  getOptions(): Record<string, unknown> | null {
    return this.options;
  }

  addMessageListener(messageListener: MessageListener = (_message) => {}): void {
    this.messageListeners.push(messageListener);
    Logger.addListener(messageListener);
  }

  saveSavedCondition(newSavedCondition: Record<string, unknown>): unknown[] {
    let isUpdated = false;
    (this.savedConditions as Record<string, unknown>[]).forEach((savedCondition) => {
      if (savedCondition['name'] === newSavedCondition['name']) {
        savedCondition['summary'] = newSavedCondition['summary'];
        savedCondition['filter'] = newSavedCondition['filter'];
        savedCondition['sort'] = newSavedCondition['sort'];
        isUpdated = true;
      }
    }, this);
    if (!isUpdated) {
      this.savedConditions!.push(newSavedCondition);
    }
    this.saveStorage();
    return this.savedConditions!;
  }

  saveSavedConditions(newSavedConditions: unknown[]): unknown[] {
    this.savedConditions = newSavedConditions;
    this.saveStorage();
    return this.savedConditions;
  }

  saveConditions(summarySettings: unknown, filterConditions: unknown, sortConditions: unknown): void {
    this.conditions = {
      summary: summarySettings,
      filter: filterConditions,
      sort: sortConditions,
    };
    this.saveStorage();
  }

  saveSaSettings(ddrcode: string): void {
    this.saSettings!['ddrcode'] = ddrcode;
    this.saveStorage();
  }

  saveOptions(newOptions: Record<string, unknown>): void {
    this.options = newOptions;
    this.saveStorage();
  }

  getMusicList(): MusicList | null {
    return this.musicList;
  }

  getScoreList(): ScoreList | null {
    return this.scoreList;
  }

  getDifferences(): ScoreDiff[] {
    return this.dataFetchController.differences;
  }

  getChartCount(): number {
    return this.chartList.charts.length;
  }

  getChartList(): ChartList {
    return this.chartList;
  }

  restoreMusicList(string: string): void {
    const lines = string.split('\n');
    Logger.info(I18n.getMessage('log_message_restore_music_list_count', String(lines.length)));
    lines.forEach(function (line) {
      this.musicList!.applyEncodedString(line);
    }, this);
    this.saveStorage();
    this.updateCharts();
  }

  restoreScoreList(object: Record<string, unknown>): void {
    this.scoreList = ScoreList.createFromStorage(object);
    this.saveStorage();
    this.updateCharts();
  }

  /*
  gh pagesから曲リストを取得し、ローカルの曲リストを更新する
  */
  async fetchParsedMusicList(): Promise<void> {
    Logger.info(I18n.getMessage('log_message_fetch_parsed_music_list_begin'));
    try {
      const response = await fetch(Constants.PARSED_MUSIC_LIST_URL.replace('[version]', String(Constants.MUSIC_LIST_VERSION)), { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
      Logger.info(I18n.getMessage('log_message_fetch_parsed_music_list_fetch_success'));
      const text = await response.text();
      this.restoreMusicList(text);
      this.internalStatus!['musicListUpdatedAt'] = Date.now();
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
  async updateMusicList(): Promise<void> {
    if (this.state !== STATE.IDLE) {
      const message = `updateMusicList: state unmatch (current state: ${this.state})`;
      Logger.debug(message);
      throw new Error(message);
    }
    Logger.info(I18n.getMessage('log_message_update_music_list_begin'));
    this.changeState(STATE.UPDATE_MUSIC_LIST);
    try {
      Logger.info(I18n.getMessage('log_message_update_music_list_progress', ['1', '?']));
      await this.browserController.createTab(Constants.MUSIC_LIST_URL, this.options!['openTabAsActive'] as boolean);
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
  async refreshAllMusicInfo(musicIdForFilter: string, gameVersion: GameVersion): Promise<boolean | void> {
    if (this.state !== STATE.IDLE) {
      const message = `refreshAllMusicInfo: state unmatch (current state: ${this.state})`;
      Logger.debug(message);
      throw new Error(message);
    }
    Logger.info(I18n.getMessage('log_message_refresh_all_music_info_begin'));
    this.dataFetchController.targetGameVersion = gameVersion;
    this.dataFetchController.targetMusics = [];
    this.musicList!.musicIds
      .sort()
      .filter((musicId) => {
        return musicId >= musicIdForFilter;
      })
      .forEach((musicId) => {
        let musicType = this.musicList!.getMusicDataById(musicId).type;
        if (musicType === Constants.MUSIC_TYPE.UNKNOWN) {
          musicType = Constants.MUSIC_TYPE.NORMAL as MusicType;
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
    Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_target_found', String(this.dataFetchController.targetMusics.length)));
    this.changeState(STATE.UPDATE_MUSIC_DETAIL);
    try {
      this.dataFetchController.targetMusic = this.dataFetchController.targetMusics.shift()!;
      Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_progress', [this.dataFetchController.targetMusic.musicId, String(this.dataFetchController.targetMusics.length)]));
      await this.browserController.createTab(this.dataFetchController.targetMusic.url, this.options!['openTabAsActive'] as boolean);
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
  async fetchMissingMusicInfo(gameVersion: GameVersion): Promise<boolean | void> {
    if (this.state !== STATE.IDLE) {
      const message = `fetchMissingMusicInfo: state unmatch (current state: ${this.state})`;
      Logger.debug(message);
      throw new Error(message);
    }
    Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_begin'));
    // 曲情報が欠けている曲と、曲情報そのものはあるが、譜面情報が欠けている (追加鬼譜面など) 曲を列挙する
    const targetMusicIDs = this.scoreList!.musicIds.filter((musicId) => {
      if (!this.musicList!.hasMusic(musicId)) {
        return true;
      }
      const missing = this.scoreList!.getScoreDataByMusicId(musicId).difficulties.find((difficulty) => {
        if (this.musicList!.getMusicDataById(musicId).difficulty[difficulty] === 0) {
          return true;
        }
      });
      return missing;
    });
    this.dataFetchController.targetGameVersion = gameVersion;
    this.dataFetchController.targetMusics = targetMusicIDs.map((musicId) => {
      let musicType = this.scoreList!.getScoreDataByMusicId(musicId).musicType;
      if (musicType === Constants.MUSIC_TYPE.UNKNOWN) {
        musicType = Constants.MUSIC_TYPE.NORMAL as MusicType;
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
    Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_target_found', String(this.dataFetchController.targetMusics.length)));
    this.changeState(STATE.UPDATE_MUSIC_DETAIL);
    try {
      this.dataFetchController.targetMusic = this.dataFetchController.targetMusics.shift()!;
      Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_progress', [this.dataFetchController.targetMusic.musicId, String(this.dataFetchController.targetMusics.length)]));
      await this.browserController.createTab(this.dataFetchController.targetMusic.url, this.options!['openTabAsActive'] as boolean);
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
  async updateScoreList(gameVersion: GameVersion): Promise<void> {
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
      this.dataFetchController.targetPlayMode = Constants.PLAY_MODE_FIRST as PlayMode;
      this.dataFetchController.targetMusicType = Constants.MUSIC_TYPE_FIRST as MusicType;
      Logger.info(
        I18n.getMessage('log_message_update_score_list_progress', [
          I18n.getMessage(`log_message_update_score_list_play_mode_${this.dataFetchController.targetPlayMode}`),
          I18n.getMessage(`log_message_update_score_list_music_type_${this.dataFetchController.targetMusicType}`),
          '1',
          '?',
        ])
      );
      await this.browserController.createTab(
        Constants.SCORE_LIST_URL[this.dataFetchController.targetGameVersion!][this.dataFetchController.targetPlayMode!][this.dataFetchController.targetMusicType!],
        this.options!['openTabAsActive'] as boolean
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
  async updateScoreDetail(targets: UpdateScoreDetailTarget[], gameVersion: GameVersion): Promise<boolean | void> {
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
      if (this.musicList!.hasMusic(music.musicId)) {
        musicType = this.musicList!.getMusicDataById(music.musicId).type;
      } else if (this.scoreList!.hasMusic(music.musicId)) {
        musicType = this.scoreList!.getScoreDataByMusicId(music.musicId).musicType;
      }
      if (musicType === Constants.MUSIC_TYPE.UNKNOWN) {
        musicType = Constants.MUSIC_TYPE.NORMAL;
      }
      if (Constants.SCORE_DETAIL_URL[gameVersion][musicType] !== '') {
        music.url = Constants.SCORE_DETAIL_URL[gameVersion][musicType].replace('[musicId]', music.musicId).replace('[difficulty]', String(music.difficulty));
        this.dataFetchController.targetMusics.push(music as UpdateScoreDetailTarget & { url: string });
      }
    }, this);
    if (this.dataFetchController.targetMusics.length === 0) {
      Logger.info(I18n.getMessage('log_message_update_score_detail_no_target'));
      return false;
    }
    Logger.info(I18n.getMessage('log_message_update_score_detail_target_found', String(this.dataFetchController.targetMusics.length)));
    this.changeState(STATE.UPDATE_SCORE_DETAIL);
    try {
      const targetMusic = this.dataFetchController.targetMusics.shift()!;
      Logger.info(
        I18n.getMessage('log_message_update_score_detail_progress', [
          this.musicList!.hasMusic(targetMusic.musicId) ? this.musicList!.getMusicDataById(targetMusic.musicId).title : targetMusic.musicId,
          Constants.PLAY_MODE_AND_DIFFICULTY_STRING[targetMusic.difficulty!],
          String(this.dataFetchController.targetMusics.length),
        ])
      );
      await this.browserController.createTab(targetMusic.url!, this.options!['openTabAsActive'] as boolean);
    } catch (error) {
      this.browserController.reset();
      Logger.error(error);
      this.changeState(STATE.IDLE);
      throw error;
    }
  }

  updateCharts(): void {
    this.chartList.reset();
    this.musicList!.musicIds.forEach(function (musicId) {
      Object.values(Constants.PLAY_MODE).forEach(function (playMode) {
        Object.values(Constants.DIFFICULTIES).forEach(function (difficulty) {
          if (playMode === Constants.PLAY_MODE.DOUBLE && difficulty === Constants.DIFFICULTIES.BEGINNER) {
            return;
          }
          const musicData = this.musicList!.getMusicDataById(musicId);
          const difficultyValue = Util.getDifficultyValue(playMode as PlayMode, difficulty as Difficulty);
          const scoreDataExists = this.scoreList!.hasMusic(musicId) && this.scoreList!.getScoreDataByMusicId(musicId).hasDifficulty(difficultyValue);
          if (!musicData.hasDifficulty(difficultyValue) && !scoreDataExists) {
            return;
          }

          const chartData = new ChartData(musicId, playMode as PlayMode, difficulty as Difficulty);
          chartData.musicData = musicData;

          if (scoreDataExists) {
            chartData.scoreDetail = this.scoreList!.getScoreDataByMusicId(musicId).getScoreDetailByDifficulty(difficultyValue);
          }

          this.chartList.addChartData(chartData);
        }, this);
      }, this);
    }, this);
    this.scoreList!.musicIds.forEach(function (musicId) {
      if (!this.musicList!.hasMusic(musicId)) {
        Object.values(Constants.PLAY_MODE).forEach(function (playMode) {
          Object.values(Constants.DIFFICULTIES).forEach(function (difficulty) {
            const difficultyValue = Util.getDifficultyValue(playMode as PlayMode, difficulty as Difficulty);
            const scoreDataExists = this.scoreList!.hasMusic(musicId) && this.scoreList!.getScoreDataByMusicId(musicId).hasDifficulty(difficultyValue);
            if (!scoreDataExists) {
              return;
            }

            const chartData = new ChartData(musicId, playMode as PlayMode, difficulty as Difficulty);
            chartData.musicData = MusicData.createEmptyData(musicId, this.scoreList!.getScoreDataByMusicId(musicId).musicType);
            chartData.scoreDetail = this.scoreList!.getScoreDataByMusicId(musicId).getScoreDetailByDifficulty(difficultyValue);

            this.chartList.addChartData(chartData);
          }, this);
        }, this);
      }
    }, this);
  }

  onUpdateTab(): void {
    switch (this.state) {
      case STATE.UPDATE_MUSIC_LIST:
        this.browserController.sendMessageToTab({ type: 'PARSE_MUSIC_LIST', gameVersion: this.dataFetchController.targetGameVersion }, (res) =>
          this.dataFetchController.handleMusicListResponse(res as ParseResponse)
        );
        break;
      case STATE.UPDATE_MUSIC_DETAIL:
        this.browserController.sendMessageToTab({ type: 'PARSE_MUSIC_DETAIL', gameVersion: this.dataFetchController.targetGameVersion }, (res) =>
          this.dataFetchController.handleMusicDetailResponse(res as ParseResponse)
        );
        break;
      case STATE.UPDATE_SCORE_LIST:
        this.browserController.sendMessageToTab({ type: 'PARSE_SCORE_LIST', gameVersion: this.dataFetchController.targetGameVersion }, (res) =>
          this.dataFetchController.handleScoreListResponse(res as ParseResponse)
        );
        break;
      case STATE.UPDATE_SCORE_DETAIL:
        this.browserController.sendMessageToTab({ type: 'PARSE_SCORE_DETAIL', gameVersion: this.dataFetchController.targetGameVersion }, (res) =>
          this.dataFetchController.handleScoreDetailResponse(res as ParseResponse)
        );
        break;
      default:
        Logger.debug('onUpdateTab: event was ignored.');
        break;
    }
  }

  // updateTab を呼び出し、失敗時は reset してアボートする
  async navigateTo(url: string): Promise<void> {
    try {
      await this.browserController.updateTab(url);
    } catch (error) {
      this.browserController.reset();
      Logger.error((error as Error).message);
      this.changeState(STATE.IDLE);
      Logger.info(I18n.getMessage('log_message_aborted'));
    }
  }

  // タブを閉じて IDLE に戻り、完了ログを出す
  async finishAction(): Promise<void> {
    await this.closeTab();
    this.changeState(STATE.IDLE);
    Logger.info(I18n.getMessage('log_message_done'));
  }

  changeState(nextState: number): void {
    this.messageListeners.forEach((listener) => {
      listener({ type: CHANGE_STATE_MESSAGE_TYPE, oldState: this.state, state: nextState } as unknown as Record<string, unknown>);
    }, this);
    Logger.debug(`App.changeState ${this.state} -> ${nextState}`);
    this.state = nextState;
  }

  async handleError(res: ParseResponse): Promise<void> {
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

  async closeTab(force?: boolean): Promise<void> {
    if (this.options!['notCloseTabAfterUse'] !== true) {
      await this.browserController.closeTab(force);
    }
  }

  async exportScoreToSkillAttack(ddrcode: string, password: string): Promise<void> {
    if (ddrcode.trim() === '') {
      Logger.info(I18n.getMessage('log_message_export_score_to_skill_attack_password_invalid'));
      Logger.info(I18n.getMessage('log_message_aborted'));
      return;
    }
    this.saveSaSettings(ddrcode);
    const exporter = new SkillAttackExporter(this.musicList!, this.scoreList!, this.options!);
    await exporter.export(ddrcode, password);
  }
}
