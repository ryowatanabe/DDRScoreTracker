import { MusicData } from './MusicData.js';
import { Constants, type GameVersion, type PlayMode, type MusicType } from './Constants.js';
import { Logger } from './Logger.js';
import { Parser } from './Parser.js';
import { I18n } from './I18n.js';
import type { MusicList } from './MusicList.js';
import type { ScoreList } from './ScoreList.js';
import type { ScoreDiff } from './ScoreDiff.js';

type TargetMusic = {
  musicId: string;
  type?: MusicType;
  url: string;
  difficulty?: number;
};

type ParseResponse = {
  status: number;
  musics?: Record<string, unknown>[];
  scores?: Record<string, unknown>[];
  hasNext?: boolean;
  currentPage?: number;
  maxPage?: number;
  nextUrl?: string;
};

type DataFetchControllerOptions = {
  getMusicList: () => MusicList;
  getScoreList: () => ScoreList;
  onSaveStorage: () => void;
  onUpdateCharts: () => void;
  onNavigateTo: (url: string) => Promise<void>;
  onFinishAction: () => Promise<void>;
  onHandleError: (res: ParseResponse) => Promise<void>;
};

/*
データ取得フローに関する状態管理とレスポンス処理を担うクラス。
App.js の onUpdateTab() から呼び出される4つのレスポンスハンドラーと、
それらが参照するフェッチ状態を管理する。
*/
export class DataFetchController {
  getMusicList: () => MusicList;
  getScoreList: () => ScoreList;
  onSaveStorage: () => void;
  onUpdateCharts: () => void;
  onNavigateTo: (url: string) => Promise<void>;
  onFinishAction: () => Promise<void>;
  onHandleError: (res: ParseResponse) => Promise<void>;

  targetGameVersion: GameVersion | null;
  targetPlayMode: PlayMode | null;
  targetMusicType: MusicType | null;
  targetMusics: TargetMusic[];
  targetMusic: TargetMusic | null;
  differences: ScoreDiff[];

  constructor({ getMusicList, getScoreList, onSaveStorage, onUpdateCharts, onNavigateTo, onFinishAction, onHandleError }: DataFetchControllerOptions) {
    this.getMusicList = getMusicList;
    this.getScoreList = getScoreList;
    this.onSaveStorage = onSaveStorage;
    this.onUpdateCharts = onUpdateCharts;
    this.onNavigateTo = onNavigateTo;
    this.onFinishAction = onFinishAction;
    this.onHandleError = onHandleError;

    this.targetGameVersion = null;
    this.targetPlayMode = null;
    this.targetMusicType = null;
    this.targetMusics = [];
    this.targetMusic = null;
    this.differences = [];
  }

  get musicList(): MusicList {
    return this.getMusicList();
  }

  get scoreList(): ScoreList {
    return this.getScoreList();
  }

  async handleMusicListResponse(res: ParseResponse): Promise<void> {
    Logger.debug(res);
    if (res.status !== Parser.STATUS.SUCCESS) {
      await this.onHandleError(res);
      return;
    }
    res.musics!.forEach((music) => {
      this.musicList.applyObject(music);
    });
    this.onSaveStorage();
    this.onUpdateCharts();
    if (res.hasNext) {
      Logger.info(I18n.getMessage('log_message_update_music_list_progress', [String(res.currentPage! + 1), String(res.maxPage)]));
      await this.onNavigateTo(res.nextUrl!);
    } else {
      await this.onFinishAction();
    }
  }

  async handleMusicDetailResponse(res: ParseResponse): Promise<void> {
    Logger.debug(res);
    // workaround:
    // A20PLUSのサイトには無い曲、A3のサイトには無い曲がそれぞれ存在するため
    // そのような曲のデータを取得しようとしてエラーになったときには
    // 処理を中断せずエラーを無視して次へ進む
    if (res.status !== Parser.STATUS.SUCCESS && res.status !== Parser.STATUS.UNKNOWN_ERROR) {
      await this.onHandleError(res);
      return;
    }
    if (res.status === Parser.STATUS.SUCCESS) {
      res.musics!.forEach((music) => {
        music['type'] = this.targetMusic!.type;
        const musicData = MusicData.createFromStorage(music);
        const body = JSON.stringify({ text: musicData.encodedString });
        if (this.musicList.applyMusicData(musicData)) {
          fetch('https://us-west1-blissful-mile-450603-h9.cloudfunctions.net/unregistered_music', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: body,
          })
            .then((response) => {
              Logger.debug(response);
            })
            .catch((reason) => {
              Logger.debug(reason);
            });
        }
      });
      this.onSaveStorage();
      this.onUpdateCharts();
    }
    if (this.targetMusics.length > 0) {
      this.targetMusic = this.targetMusics.shift()!;
      Logger.info(I18n.getMessage('log_message_fetch_missing_music_info_progress', [this.targetMusic.musicId, String(this.targetMusics.length)]));
      await this.onNavigateTo(this.targetMusic.url);
    } else {
      await this.onFinishAction();
    }
  }

  async handleScoreListResponse(res: ParseResponse): Promise<void> {
    Logger.debug(res);
    if (res.status !== Parser.STATUS.SUCCESS) {
      await this.onHandleError(res);
      return;
    }
    res.scores!.forEach((score) => {
      score['musicType'] = this.targetMusicType;
      this.differences = this.differences.concat(this.scoreList.applyObject(score));
    });
    this.onSaveStorage();
    this.onUpdateCharts();
    if (res.hasNext) {
      Logger.info(
        I18n.getMessage('log_message_update_score_list_progress', [
          I18n.getMessage(`log_message_update_score_list_play_mode_${this.targetPlayMode}`),
          I18n.getMessage(`log_message_update_score_list_music_type_${this.targetMusicType}`),
          String(res.currentPage! + 1),
          String(res.maxPage),
        ])
      );
      await this.onNavigateTo(res.nextUrl!);
    } else if (Constants.hasNextMusicType(this.targetGameVersion!, this.targetPlayMode!, this.targetMusicType!)) {
      const nextMusicType = Constants.getNextMusicType(this.targetGameVersion!, this.targetPlayMode!, this.targetMusicType!);
      this.targetPlayMode = nextMusicType.playMode as PlayMode;
      this.targetMusicType = nextMusicType.musicType as MusicType;
      Logger.info(
        I18n.getMessage('log_message_update_score_list_progress', [
          I18n.getMessage(`log_message_update_score_list_play_mode_${this.targetPlayMode}`),
          I18n.getMessage(`log_message_update_score_list_music_type_${this.targetMusicType}`),
          '1',
          '?',
        ])
      );
      await this.onNavigateTo(Constants.SCORE_LIST_URL[this.targetGameVersion!][this.targetPlayMode][this.targetMusicType]);
    } else {
      await this.onFinishAction();
    }
  }

  async handleScoreDetailResponse(res: ParseResponse): Promise<void> {
    Logger.debug(res);
    // workaround:
    // A20PLUSのサイトには無い曲、A3のサイトには無い曲がそれぞれ存在するため
    // そのような曲のデータを取得しようとしてエラーになったときには
    // 処理を中断せずエラーを無視して次へ進む
    if (res.status !== Parser.STATUS.SUCCESS && res.status !== Parser.STATUS.UNKNOWN_ERROR) {
      await this.onHandleError(res);
      return;
    }
    if (res.status === Parser.STATUS.SUCCESS) {
      res.scores!.forEach((score) => {
        this.scoreList.applyObject(score);
      });
      this.onSaveStorage();
      this.onUpdateCharts();
    }
    if (this.targetMusics.length > 0) {
      const targetMusic = this.targetMusics.shift()!;
      Logger.info(
        I18n.getMessage('log_message_update_score_detail_progress', [
          this.musicList.hasMusic(targetMusic.musicId) ? this.musicList.getMusicDataById(targetMusic.musicId).title : targetMusic.musicId,
          Constants.PLAY_MODE_AND_DIFFICULTY_STRING[targetMusic.difficulty!],
          String(this.targetMusics.length),
        ])
      );
      await this.onNavigateTo(targetMusic.url);
    } else {
      await this.onFinishAction();
    }
  }
}
