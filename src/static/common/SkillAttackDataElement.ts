import { Constants, type PlayMode, type Difficulty, type DifficultyValue } from './Constants.js';
import { Logger } from './Logger.js';

export class SkillAttackDataElement {
  index: number;
  playMode: PlayMode;
  difficulty: Difficulty;
  updatedAt: number;
  score: number;
  clearType: number;

  get clearTypeString(): Record<number, string> {
    return {
      0: '',
      1: 'FC',
      2: 'PFC',
      3: 'MFC',
    };
  }

  get scoreString(): string {
    let string = this.score.toLocaleString();
    if (this.clearType !== 0) {
      string = string + ' ' + this.clearTypeString[this.clearType];
    }
    return string;
  }

  constructor(index: number, playMode: PlayMode, difficulty: Difficulty, updatedAt: number, score: number, clearType: number) {
    this.index = index;
    this.playMode = playMode;
    this.difficulty = difficulty;
    this.updatedAt = updatedAt;
    this.score = score;
    this.clearType = clearType;
  }

  static createFromString(encodedString: string): SkillAttackDataElement | null {
    if (encodedString.trim() === '') {
      return null;
    }
    const elements = encodedString.split('\t');
    if (elements.length < 8) {
      Logger.error(`SkillAttackDataElement.createFromString invalid string: ${encodedString}`);
      return null;
    }
    return new SkillAttackDataElement(
      parseInt(elements[0], 10), // index
      parseInt(elements[1], 10) as PlayMode, // playMode
      parseInt(elements[2], 10) as Difficulty, // difficulty
      parseInt(elements[4], 10), // updatedAt
      parseInt(elements[5], 10), // score
      parseInt(elements[6], 10) // clearType
    );
  }

  get difficultyValue(): DifficultyValue {
    return (Number(this.difficulty) + (this.playMode === Constants.PLAY_MODE.DOUBLE ? Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE : 0)) as DifficultyValue;
  }

  get formString(): string {
    switch (this.clearType) {
      case 1:
        return `${this.score}*`;
      case 2:
        return `${this.score}**`;
    }
    return `${this.score}`;
  }

  merge(skillAttackDataElement: SkillAttackDataElement): boolean {
    if (this.index !== skillAttackDataElement.index || this.playMode !== skillAttackDataElement.playMode || this.difficulty !== skillAttackDataElement.difficulty) {
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
