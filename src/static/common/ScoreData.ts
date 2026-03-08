import { Constants, type MusicType } from './Constants.js';
import { ScoreDetail } from './ScoreDetail.js';
import { ScoreDiff } from './ScoreDiff.js';

export class ScoreData {
  musicId: string;
  musicType: MusicType;
  difficulty: Record<string, ScoreDetail>;

  constructor(musicId: string) {
    this.musicId = musicId;
    this.musicType = Constants.MUSIC_TYPE.UNKNOWN as MusicType;
    this.difficulty = {};
  }

  static createFromStorage(storageData: Record<string, unknown>): ScoreData {
    const instance = new ScoreData(storageData['musicId'] as string);
    if (typeof storageData['musicType'] !== 'undefined') {
      instance.musicType = storageData['musicType'] as MusicType;
    }
    Object.getOwnPropertyNames(storageData['difficulty'] as Record<string, unknown>).forEach(function (index) {
      instance.difficulty[index] = ScoreDetail.createFromStorage((storageData['difficulty'] as Record<string, unknown>)[index] as Record<string, unknown>);
    });
    return instance;
  }

  applyScoreDetail(difficultyValue: string, scoreDetail: ScoreDetail): ScoreDiff | null {
    if (!this.hasDifficulty(difficultyValue)) {
      this.difficulty[difficultyValue] = scoreDetail;
      const diff = ScoreDiff.createFromScoreDetail(null, scoreDetail);
      diff.musicId = this.musicId;
      diff.difficultyValue = Number(difficultyValue) as import('./Constants.js').DifficultyValue;
      return diff;
    }
    const diff = this.getScoreDetailByDifficulty(difficultyValue).merge(scoreDetail);
    if (diff !== null) {
      diff.musicId = this.musicId;
      diff.difficultyValue = Number(difficultyValue) as import('./Constants.js').DifficultyValue;
    }
    return diff;
  }

  merge(scoreData: ScoreData): ScoreDiff[] {
    if (scoreData.musicType !== Constants.MUSIC_TYPE.UNKNOWN) {
      this.musicType = scoreData.musicType;
    }
    const differences: ScoreDiff[] = [];
    scoreData.difficulties.forEach((difficultyValue) => {
      const diff = this.applyScoreDetail(difficultyValue, scoreData.getScoreDetailByDifficulty(difficultyValue));
      if (diff !== null) {
        differences.push(diff);
      }
    });
    return differences;
  }

  getScoreDetailByDifficulty(difficultyValue: string): ScoreDetail {
    return this.difficulty[difficultyValue];
  }

  hasDifficulty(difficultyValue: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.difficulty, difficultyValue);
  }

  get difficulties(): string[] {
    return Object.getOwnPropertyNames(this.difficulty);
  }
}
