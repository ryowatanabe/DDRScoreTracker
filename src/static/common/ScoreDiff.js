import { ScoreDetail } from './ScoreDetail.js';

export class ScoreDiff {
  constructor() {
    this.musicId = null;
    this.difficulty = null;
    this.before = null;
    this.after = null;
  }

  static createMultiFromScoreData(scoreData) {
    const differences = [];
    scoreData.difficulties.forEach((difficultyValue) => {
      const diff = new ScoreDiff();
      diff.musicId = scoreData.musicId;
      diff.difficulty = difficultyValue;
      diff.after = scoreData.getScoreDetailByDifficulty(difficultyValue).clone();
      differences.push(diff);
    });
    return differences;
  }

  static createFromScoreDetail(before, after) {
    const diff = new ScoreDiff();
    if (before !== null) {
      diff.before = before.clone();
    }
    if (after !== null) {
      diff.after = after.clone();
    }
    return diff;
  }
}
