import { SkillAttackDataElement } from './SkillAttackDataElement.js';
import { Logger } from './Logger.js';

export class SkillAttackDataList {
  constructor() {
    this.elements = {};
  }

  static createFromText(text) {
    const lines = text.split('\n');
    const instance = new SkillAttackDataList();
    Logger.debug(`SkillAttackDataList.createFromText: text contains ${lines.length} elements.`);
    lines.forEach((line) => {
      if (line.trim() == '') {
        return;
      }
      const skillAttackDataElement = SkillAttackDataElement.createFromString(line);
      instance.applyElement(skillAttackDataElement);
    });
    return instance;
  }

  hasIndex(index) {
    if (this.elements.hasOwnProperty(index)) {
      return true;
    }
    return false;
  }

  hasElement(index, difficultyValue) {
    if (this.elements.hasOwnProperty(index)) {
      if (this.elements[index].hasOwnProperty(difficultyValue)) {
        return true;
      }
    }
    return false;
  }

  getElement(index, difficultyValue) {
    if (this.hasElement(index, difficultyValue)) {
      return this.elements[index][difficultyValue];
    }
    return null;
  }

  applyElement(element) {
    if (element === null) {
      return false;
    }
    const currentElement = this.getElement(element.index, element.difficultyValue);
    if (currentElement !== null) {
      currentElement.merge(element);
    } else {
      if (!this.hasIndex(element.index)) {
        this.elements[element.index] = {};
      }
      this.elements[element.index][element.difficultyValue] = element;
    }
  }
}
