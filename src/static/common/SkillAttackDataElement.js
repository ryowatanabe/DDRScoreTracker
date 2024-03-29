import { Constants } from './Constants.js';
import { Logger } from './Logger.js';

export class SkillAttackDataElement {
  get clearTypeString() {
    return {
      0: '',
      1: 'FC',
      2: 'PFC',
      3: 'MFC',
    };
  }

  get scoreString() {
    let string = this.score.toLocaleString();
    if (this.clearType != 0) {
      string = string + ' ' + this.clearTypeString[this.clearType];
    }
    return string;
  }

  constructor(index, playMode, difficulty, updatedAt, score, clearType) {
    this.index = index;
    this.playMode = playMode;
    this.difficulty = difficulty;
    this.updatedAt = updatedAt;
    this.score = score;
    this.clearType = clearType;
  }

  static createFromString(encodedString) {
    if (encodedString.trim() == '') {
      return null;
    }
    const elements = encodedString.split('\t');
    if (elements.length < 8) {
      Logger.error(`SkillAttackDataElement.createFromString invalid string: ${encodedString}`);
      return null;
    }
    return new SkillAttackDataElement(
      parseInt(elements[0], 10), // index
      parseInt(elements[1], 10), // playMode
      parseInt(elements[2], 10), // difficulty
      parseInt(elements[4], 10), // updatedAt
      parseInt(elements[5], 10), // score
      parseInt(elements[6], 10) // clearType
    );
  }

  get difficultyValue() {
    return Number(this.difficulty) + (this.playMode == Constants.PLAY_MODE.DOUBLE ? Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE : 0);
  }

  get formString() {
    switch (this.clearType) {
      case 1:
        return `${this.score}*`;
      case 2:
        return `${this.score}**`;
    }
    return `${this.score}`;
  }

  merge(skillAttackDataElement) {
    if (this.index != skillAttackDataElement.index || this.playMode != skillAttackDataElement.playMode || this.difficulty != skillAttackDataElement.difficulty) {
      return false;
    }
    if (this.updatedAt < skillAttackDataElement.updatedAt) {
      this.updatedAt = skillAttackDataElement.updatedAt;
      this.score = skillAttackDataElement.score;
      this.clearType = skillAttackDataElement.clearType;
    }
    return true;
  }
}
