import { Constants, type DifficultyValue, type PlayMode, type Difficulty, type ClearType, type ScoreRank, type FlareRank } from './Constants.js';
import { ScoreDetail } from './ScoreDetail.js';
import { Util } from './Util.js';
import type { MusicData } from './MusicData.js';
import type { ScoreData } from './ScoreData.js';

export class ScoreDiff {
  musicId: string | null = null;
  musicData: MusicData | null = null;
  difficultyValue: DifficultyValue | null = null;
  before: ScoreDetail | null = null;
  after: ScoreDetail | null = null;

  static createFromStorage(storageData: Record<string, unknown>): ScoreDiff {
    const instance = new ScoreDiff();
    instance.musicId = storageData['musicId'] as string;
    instance.difficultyValue = storageData['difficultyValue'] as DifficultyValue;
    if (storageData['before'] !== null) {
      instance.before = ScoreDetail.createFromStorage(storageData['before'] as Record<string, unknown>);
    }
    if (storageData['after'] !== null) {
      instance.after = ScoreDetail.createFromStorage(storageData['after'] as Record<string, unknown>);
    }
    return instance;
  }

  static createMultiFromStorage(storageData: Record<string, unknown>[]): ScoreDiff[] {
    const instances: ScoreDiff[] = [];
    storageData.forEach((data) => {
      instances.push(this.createFromStorage(data));
    }, this);
    return instances;
  }

  static createMultiFromScoreData(scoreData: ScoreData): ScoreDiff[] {
    const differences: ScoreDiff[] = [];
    scoreData.difficulties.forEach((difficultyValue) => {
      const diff = new ScoreDiff();
      diff.musicId = scoreData.musicId;
      diff.difficultyValue = difficultyValue as unknown as DifficultyValue;
      diff.after = scoreData.getScoreDetailByDifficulty(difficultyValue).clone();
      differences.push(diff);
    });
    return differences;
  }

  static createFromScoreDetail(before: ScoreDetail | null, after: ScoreDetail | null): ScoreDiff {
    const diff = new ScoreDiff();
    if (before !== null) {
      diff.before = before.clone();
    }
    if (after !== null) {
      diff.after = after.clone();
    }
    return diff;
  }

  toStorageData(): Record<string, unknown> {
    return {
      musicId: this.musicId,
      difficultyValue: this.difficultyValue,
      before: this.before !== null ? Object.assign({}, this.before) : null,
      after: this.after !== null ? Object.assign({}, this.after) : null,
    };
  }

  _getDetailField<K extends keyof ScoreDetail>(detail: ScoreDetail | null, field: K): ScoreDetail[K] | null {
    return detail === null ? null : detail[field];
  }

  _lookupOrEmpty(value: number | null, table: Record<number, string>): string {
    return value === null ? '' : table[value];
  }

  get title(): string {
    if (this.musicData === null) {
      return this.musicId as string;
    }
    return this.musicData.title;
  }

  get playMode(): PlayMode | null {
    if (this.difficultyValue === null) return null;
    return Util.getPlayMode(this.difficultyValue);
  }

  get difficulty(): Difficulty | null {
    if (this.difficultyValue === null) return null;
    return Util.getDifficulty(this.difficultyValue);
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
    return this.musicData.getLevel(this.difficultyValue as number);
  }

  get beforeScore(): number | null {
    return this._getDetailField(this.before, 'score');
  }

  get beforeScoreRank(): ScoreRank | null {
    return this._getDetailField(this.before, 'actualScoreRank');
  }

  get beforeFlareRank(): FlareRank | null {
    return this._getDetailField(this.before, 'flareRank');
  }

  get beforeFlareSkill(): number | null {
    return this._getDetailField(this.before, 'flareSkill');
  }

  get beforeClearType(): ClearType | null {
    return this._getDetailField(this.before, 'actualClearType');
  }

  get beforeScoreString(): string {
    return this.beforeScore === null ? '' : this.beforeScore.toLocaleString();
  }

  get beforeClearTypeString(): string {
    return this._lookupOrEmpty(this.beforeClearType, Constants.CLEAR_TYPE_STRING);
  }

  get beforeFullComboSymbol(): string {
    return this._lookupOrEmpty(this.beforeClearType, Constants.FULL_COMBO_SYMBOL);
  }

  get beforeClearTypeClassString(): string {
    return this._lookupOrEmpty(this.beforeClearType, Constants.CLEAR_TYPE_CLASS_STRING);
  }

  get beforeFlareRankSymbol(): string {
    return this._lookupOrEmpty(this.beforeFlareRank, Constants.FLARE_RANK_SYMBOL);
  }

  get beforeFlareRankClassString(): string {
    return this._lookupOrEmpty(this.beforeFlareRank, Constants.FLARE_RANK_CLASS_STRING);
  }

  get beforeScoreRankString(): string {
    return this._lookupOrEmpty(this.beforeScoreRank, Constants.SCORE_RANK_STRING);
  }

  get beforeScoreRankClassString(): string {
    return this._lookupOrEmpty(this.beforeScoreRank, Constants.SCORE_RANK_CLASS_STRING);
  }

  get afterScore(): number | null {
    return this._getDetailField(this.after, 'score');
  }

  get afterScoreRank(): ScoreRank | null {
    return this._getDetailField(this.after, 'actualScoreRank');
  }

  get afterFlareRank(): FlareRank | null {
    return this._getDetailField(this.after, 'flareRank');
  }

  get afterFlareSkill(): number | null {
    return this._getDetailField(this.after, 'flareSkill');
  }

  get afterClearType(): ClearType | null {
    return this._getDetailField(this.after, 'actualClearType');
  }

  get afterScoreString(): string {
    return this.afterScore === null ? '' : this.afterScore.toLocaleString();
  }

  get afterClearTypeString(): string {
    return this._lookupOrEmpty(this.afterClearType, Constants.CLEAR_TYPE_STRING);
  }

  get afterFullComboSymbol(): string {
    return this._lookupOrEmpty(this.afterClearType, Constants.FULL_COMBO_SYMBOL);
  }

  get afterClearTypeClassString(): string {
    return this._lookupOrEmpty(this.afterClearType, Constants.CLEAR_TYPE_CLASS_STRING);
  }

  get afterFlareRankSymbol(): string {
    return this._lookupOrEmpty(this.afterFlareRank, Constants.FLARE_RANK_SYMBOL);
  }

  get afterFlareRankClassString(): string {
    return this._lookupOrEmpty(this.afterFlareRank, Constants.FLARE_RANK_CLASS_STRING);
  }

  get afterScoreRankString(): string {
    return this._lookupOrEmpty(this.afterScoreRank, Constants.SCORE_RANK_STRING);
  }

  get afterScoreRankClassString(): string {
    return this._lookupOrEmpty(this.afterScoreRank, Constants.SCORE_RANK_CLASS_STRING);
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
