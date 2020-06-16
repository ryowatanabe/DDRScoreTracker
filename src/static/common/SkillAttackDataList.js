import { SkillAttackDataElement } from './SkillAttackDataElement.js';
import { Constants } from './Constants.js';
import { Logger } from './Logger.js';
import { Util } from './Util.js';

export class SkillAttackDataList {
  constructor(skillAttackIndexMap) {
    this.elements = {};
    this.skillAttackIndexMap = skillAttackIndexMap;
  }

  applyText(text) {
    const lines = text.split('\n');
    Logger.debug(`SkillAttackDataList.createFromText: text contains ${lines.length} elements.`);
    lines.forEach((line) => {
      if (line.trim() == '') {
        return;
      }
      const skillAttackDataElement = SkillAttackDataElement.createFromString(line);
      this.applyElement(skillAttackDataElement);
    });
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

  getDiff(scoreList) {
    const diff = new SkillAttackDataList(this.skillAttackIndexMap);
    scoreList.musicIds.forEach((musicId) => {
      const scoreData = scoreList.getScoreDataByMusicId(musicId);
      const index = this.skillAttackIndexMap.getIndexByMusicId(musicId);
      if (typeof index == 'undefined') {
        return;
      }
      scoreData.difficulties.forEach((difficultyValue) => {
        const scoreDetail = scoreData.getScoreDetailByDifficulty(difficultyValue);
        const currentData = this.getElement(index, difficultyValue);
        const score = scoreDetail.score;
        const clearType = scoreDetail.clearType > 5 ? scoreDetail.clearType - 5 : 0;
        if(currentData !== null) {
          // 更新チェック
          if (score > currentData.score || clearType > currentData.clearType) {
            diff.applyElement(new SkillAttackDataElement(
              index,
              Util.getPlayMode(difficultyValue),
              Util.getDifficulty(difficultyValue),
              0,
              score,
              clearType
            ));
          }
        } else {
          // 新規
          diff.applyElement(new SkillAttackDataElement(
            index,
            Util.getPlayMode(difficultyValue),
            Util.getDifficulty(difficultyValue),
            0,
            score,
            clearType
          ));
        }
      });
    });
    return diff;
  }
}
