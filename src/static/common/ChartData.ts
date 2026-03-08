import { Constants, type PlayMode, type Difficulty, type ClearType, type ScoreRank, type FlareRank } from './Constants.js';
import { Util } from './Util.js';
import { NullScoreDetail, ScoreDetail } from './ScoreDetail.js';
import type { MusicData } from './MusicData.js';

export class ChartData {
  musicId: string;
  playMode: PlayMode;
  difficulty: Difficulty;
  musicData: MusicData | null;
  scoreDetail: ScoreDetail | NullScoreDetail;

  constructor(musicId: string, playMode: PlayMode, difficulty: Difficulty) {
    this.musicId = musicId;
    this.playMode = playMode;
    this.difficulty = difficulty;
    this.musicData = null;
    this.scoreDetail = new NullScoreDetail();
  }

  get musicType() {
    if (this.musicData === null) {
      return Constants.MUSIC_TYPE.UNKNOWN;
    }
    return this.musicData.type;
  }

  get title(): string {
    if (this.musicData === null) {
      return this.musicId;
    }
    if (this.musicData.title === '') {
      return this.musicId;
    }
    return this.musicData.title;
  }

  get levelString(): string {
    if (this.level === 0) {
      return '?';
    }
    return String(this.level);
  }

  get level(): number {
    if (this.musicData === null) {
      return 0;
    }
    return this.musicData.getLevel(Util.getDifficultyValue(this.playMode, this.difficulty));
  }

  get availability(): number {
    // 0: available
    // 1: deleted music with score
    // 2: deleted music without score
    if (this.musicData === null) {
      return 0;
    }
    if (this.musicData.isDeleted) {
      if (this.scoreDetail.score === null) {
        return 2;
      }
      return 1;
    }
    return 0;
  }

  get score(): number | null {
    return this.scoreDetail.score;
  }

  get scoreRank(): ScoreRank {
    return this.scoreDetail.actualScoreRank;
  }

  get clearType(): ClearType {
    return this.scoreDetail.actualClearType;
  }

  get flareRank(): FlareRank {
    return this.scoreDetail.actualFlareRank;
  }

  get flareSkill(): number | null {
    return this.scoreDetail.flareSkill;
  }

  get playCount(): number | null {
    return this.scoreDetail.playCount;
  }

  get clearCount(): number | null {
    return this.scoreDetail.clearCount;
  }

  get maxCombo(): number | null {
    return this.scoreDetail.maxCombo;
  }

  get scoreString(): string {
    if (this.scoreDetail.score === null) {
      return '';
    }
    return this.scoreDetail.score.toLocaleString();
  }

  get clearTypeString(): string {
    if (this.scoreDetail.clearType === null) {
      return '';
    }
    return Constants.CLEAR_TYPE_STRING[this.scoreDetail.clearType];
  }

  get fullComboSymbol(): string {
    if (this.scoreDetail.clearType === null) {
      return '';
    }
    return Constants.FULL_COMBO_SYMBOL[this.scoreDetail.clearType];
  }

  get clearTypeClassString(): string {
    if (this.scoreDetail.clearType === null) {
      return '';
    }
    return Constants.CLEAR_TYPE_CLASS_STRING[this.scoreDetail.clearType];
  }

  get scoreRankString(): string {
    if (this.scoreDetail.scoreRank === null) {
      return '';
    }
    return Constants.SCORE_RANK_STRING[this.scoreDetail.scoreRank];
  }

  get scoreRankClassString(): string {
    if (this.scoreDetail.scoreRank === null) {
      return '';
    }
    return Constants.SCORE_RANK_CLASS_STRING[this.scoreDetail.scoreRank];
  }

  get flareRankSymbol(): string {
    if (this.scoreDetail.flareRank === null) {
      return '';
    }
    return Constants.FLARE_RANK_SYMBOL[this.scoreDetail.flareRank];
  }

  get flareRankString(): string {
    if (this.scoreDetail.flareRank === null) {
      return '';
    }
    return Constants.FLARE_RANK_STRING[this.scoreDetail.flareRank];
  }

  get flareRankClassString(): string {
    if (this.scoreDetail.flareRank === null) {
      return '';
    }
    return Constants.FLARE_RANK_CLASS_STRING[this.scoreDetail.flareRank];
  }

  get difficultyClassString(): string {
    if (this.difficulty === null) {
      return '';
    }
    return Constants.DIFFICULTY_CLASS_STRING[this.difficulty];
  }

  get playModeSymbol(): string {
    if (this.playMode === null) {
      return '';
    }
    return Constants.PLAY_MODE_SYMBOL[this.playMode];
  }
}
