import { ScoreData } from './ScoreData.js';
import { ScoreDiff } from './ScoreDiff.js';

export class ScoreList {
  musics: Record<string, ScoreData>;

  constructor() {
    this.musics = {};
  }

  static createFromStorage(storageData: Record<string, unknown>): ScoreList {
    const instance = new ScoreList();
    Object.getOwnPropertyNames(storageData).forEach((musicId) => {
      const scoreData = ScoreData.createFromStorage(storageData[musicId] as Record<string, unknown>);
      instance.applyScoreData(scoreData);
    });
    return instance;
  }

  applyScoreData(scoreData: ScoreData): ScoreDiff[] {
    if (!this.hasMusic(scoreData.musicId)) {
      this.musics[scoreData.musicId] = scoreData;
      return ScoreDiff.createMultiFromScoreData(scoreData);
    }
    return this.getScoreDataByMusicId(scoreData.musicId).merge(scoreData);
  }

  applyObject(object: Record<string, unknown>): ScoreDiff[] {
    const scoreData = ScoreData.createFromStorage(object);
    if (scoreData === null) {
      return [];
    }
    return this.applyScoreData(scoreData);
  }

  getScoreDataByMusicId(musicId: string): ScoreData {
    return this.musics[musicId];
  }

  hasMusic(musicId: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.musics, musicId);
  }

  get musicIds(): string[] {
    return Object.getOwnPropertyNames(this.musics);
  }

  toStorageData(): Record<string, ScoreData> {
    return this.musics;
  }
}
