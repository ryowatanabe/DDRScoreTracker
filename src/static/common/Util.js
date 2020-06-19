import { Constants } from './Constants.js';

export class Util {
  static getPlayMode(difficultyValue) {
    return difficultyValue > Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE ? 1 : 0;
  }
  static getDifficulty(difficultyValue) {
    return this.getPlayMode(difficultyValue) == 1 ? difficultyValue - Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE : difficultyValue;
  }
  static getDifficultyValue(playMode, difficulty) {
    return difficulty + (playMode == Constants.PLAY_MODE.DOUBLE ? Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE : 0);
  }
}
