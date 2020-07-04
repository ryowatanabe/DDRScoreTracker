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

  getDiff(musicList, scoreList) {
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
        const clearType = scoreDetail.clearType > 5 ? scoreDetail.clearType - 5 : scoreDetail.clearType == 5 ? 1 : 0;
        const musicTitle = musicList.hasMusic(musicId) ? musicList.getMusicDataById(musicId).title : '???';
        const difficultyString = Constants.PLAY_MODE_AND_DIFFICULTY_STRING[difficultyValue];
        const data = new SkillAttackDataElement(index, Util.getPlayMode(difficultyValue), Util.getDifficulty(difficultyValue), 0, score, clearType);
        if (currentData !== null) {
          // 更新チェック
          if (score > currentData.score || clearType > currentData.clearType) {
            Logger.info(`${musicTitle} (${difficultyString}) : ${currentData.scoreString} → ${data.scoreString}`);
            diff.applyElement(data);
          }
        } else {
          // 新規
          Logger.info(`${musicTitle} (${difficultyString}) : ${data.scoreString}`);
          diff.applyElement(data);
        }
      });
    });
    return diff;
  }

  urlSearchParams(ddrcode, password) {
    const difficultyNames = ['gsp', 'bsp', 'dsp', 'esp', 'csp', 'bdp', 'ddp', 'edp', 'cdp'];
    const params = new URLSearchParams();
    params.append('_', 'score_submit');
    params.append('password', password);
    params.append('ddrcode', ddrcode);
    Object.getOwnPropertyNames(this.elements).forEach((index) => {
      params.append('index[]', `${index}`);
      for (let difficultyValue = 0; difficultyValue < difficultyNames.length; difficultyValue++) {
        const element = this.getElement(index, difficultyValue);
        if (element !== null) {
          params.append(`${difficultyNames[difficultyValue]}[]`, element.formString);
        } else {
          params.append(`${difficultyNames[difficultyValue]}[]`, '');
        }
      }
    });
    return params;
  }

  get count() {
    return Object.getOwnPropertyNames(this.elements).length;
  }
}
