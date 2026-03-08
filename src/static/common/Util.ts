import { Constants, type DifficultyValue, type PlayMode, type Difficulty } from './Constants.js';

export class Util {
  static getPlayMode(difficultyValue: DifficultyValue): PlayMode {
    return (difficultyValue > Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE ? 1 : 0) as PlayMode;
  }
  static getDifficulty(difficultyValue: DifficultyValue): Difficulty {
    return (this.getPlayMode(difficultyValue) === 1 ? difficultyValue - Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE : difficultyValue) as Difficulty;
  }
  static getDifficultyValue(playMode: PlayMode, difficulty: Difficulty): DifficultyValue {
    return (difficulty + (playMode === Constants.PLAY_MODE.DOUBLE ? Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE : 0)) as DifficultyValue;
  }
}
