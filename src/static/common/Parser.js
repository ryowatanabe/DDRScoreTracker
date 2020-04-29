import { MusicData } from './MusicData.js';
import { ScoreData } from './ScoreData.js';
import { ScoreDetail } from './ScoreDetail.js';
import { Constants } from './Constants.js';

export class Parser {
  static get STATUS() {
    return {
      SUCCESS: 0,
      UNKNOWN_ERROR: 1,
      LOGIN_REQUIRED: 2,
    };
  }

  static getResultStatus(rootElement) {
    if (rootElement.querySelector('#login.errinfo_btn') !== null) {
      return this.STATUS.LOGIN_REQUIRED;
    }
    if (rootElement.querySelector('#error') !== null) {
      return this.STATUS.UNKNOWN_ERROR;
    }
    return this.STATUS.SUCCESS;
  }

  static parseMusicList(rootElement) {
    const res = {
      hasNext: false,
      nextUrl: '',
      musics: [],
      status: this.getResultStatus(rootElement),
    };
    if (res.status != this.STATUS.SUCCESS) {
      return res;
    }
    const next = rootElement.querySelectorAll('#next.arrow');
    if (next.length > 0) {
      res.hasNext = true;
      res.nextUrl = next[0].querySelector('a').href;
    }
    const musics = rootElement.querySelectorAll('tr.data');
    musics.forEach(function (music) {
      const regexp = /^.*img=([0-9a-zA-Z]+).*$/;
      const src = music.querySelector('td img').src;
      const musicId = src.replace(regexp, '$1');
      const title = music.querySelector('.music_tit').innerHTML;
      const difficulty = Array.from(music.querySelectorAll('.difficult')).map(function (element) {
        const value = parseInt(element.innerHTML);
        return value ? value : 0;
      });
      const musicData = new MusicData(musicId, Constants.MUSIC_TYPE.NORMAL, title, difficulty);
      res.musics.push(musicData);
    });
    res.status = this.STATUS.SUCCESS;
    return res;
  }

  static parseMusicDetail(rootElement) {
    const res = {
      musics: [],
      status: this.getResultStatus(rootElement),
    };
    if (res.status != this.STATUS.SUCCESS) {
      return res;
    }
    const musicInfo = rootElement.querySelectorAll('#music_info td');
    if (musicInfo.length != 2) {
      res.status = this.STATUS.UNKNOWN_ERROR;
      return res;
    }
    const regexpForMusicId = /^.*img=([0-9a-zA-Z]+).*$/;
    const src = musicInfo[0].querySelector('img').src;
    const musicId = src.replace(regexpForMusicId, '$1');
    const title = musicInfo[1].innerHTML.split('<br>')[0];
    const regexpForDifficulties = /^.*songdetails_level_([0-9]*).png$/;
    const difficulties = Array.from(rootElement.querySelectorAll('li.step img'));
    const difficulty = difficulties.map((element) => {
      const value = parseInt(element.src.replace(regexpForDifficulties, '$1'));
      return value ? value : 0;
    });
    const musicData = new MusicData(musicId, Constants.MUSIC_TYPE.NORMAL, title, difficulty);
    res.musics.push(musicData);
    res.status = this.STATUS.SUCCESS;
    return res;
  }

  static parseScoreList(rootElement) {
    const res = {
      hasNext: false,
      nextUrl: '',
      scores: [],
      status: this.getResultStatus(rootElement),
    };
    if (res.status != this.STATUS.SUCCESS) {
      return res;
    }
    const next = rootElement.querySelectorAll('#next.arrow');
    if (next.length > 0) {
      res.hasNext = true;
      res.nextUrl = next[0].querySelector('a').href;
    }
    const isDouble = rootElement.querySelectorAll('#t_double.game_type .select').length > 0;
    const scores = Array.from(rootElement.querySelectorAll('tr.data'));
    scores.forEach(function (score) {
      const regexp = /^.*img=([0-9a-zA-Z]+).*$/;
      const src = score.querySelector('td img.jk, td img.jk2').src;
      const musicId = src.replace(regexp, '$1');
      const scoreData = new ScoreData(musicId);
      Object.keys(Constants.DIFFICULTY_NAME_MAP).forEach(function (difficultyName) {
        const difficulty = Constants.DIFFICULTY_NAME_MAP[difficultyName] + (isDouble ? Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE : 0);

        const detail = score.querySelectorAll('#' + difficultyName + '.rank');
        if (detail.length == 0) {
          return;
        }

        const scoreDetail = new ScoreDetail();
        const value = parseInt(detail[0].querySelector('.data_score').innerHTML);
        scoreDetail.score = value ? value : 0;
        const regexp = /^.*\/([^\/]+)$/;
        const scoreRankFileName = detail[0].querySelectorAll('div.data_rank img')[0].src.replace(regexp, '$1');
        const clearTypeFileName = detail[0].querySelectorAll('div.data_rank img')[1].src.replace(regexp, '$1');
        scoreDetail.scoreRank = Constants.SCORE_RANK_FILE_MAP[scoreRankFileName];
        scoreDetail.clearType = Constants.CLEAR_TYPE_FILE_MAP[clearTypeFileName];

        if (scoreDetail.scoreRank == Constants.SCORE_RANK.NO_PLAY) {
          return;
        }
        scoreData.applyScoreDetail(difficulty, scoreDetail);
      });
      res.scores.push(scoreData);
    });
    res.status = this.STATUS.SUCCESS;
    return res;
  }

  static parseScoreDetail(rootElement) {
    const res = {
      scores: [],
      status: this.getResultStatus(rootElement),
    };
    if (res.status != this.STATUS.SUCCESS) {
      return res;
    }
    const detail = Array.from(rootElement.querySelectorAll('#music_detail_table td, #course_detail_table td')).map((element) => {
      return element.innerHTML;
    });
    if (detail.length > 0) {
      const musicInfo = rootElement.querySelector('#music_info td');
      const regexpForMusicId = /^.*img=([0-9a-zA-Z]+).*$/;
      const src = musicInfo.querySelector('img').src;
      const musicId = src.replace(regexpForMusicId, '$1');

      const params = new URL(document.location).searchParams;
      const difficulty = params.get('diff');

      const scoreData = new ScoreData(musicId);
      const scoreDetail = new ScoreDetail();
      scoreDetail.score = parseInt(detail[2]) ? parseInt(detail[2]) : 0;
      scoreDetail.scoreRank = Constants.SCORE_RANK_NAME_MAP[detail[1]];
      scoreDetail.clearType = Constants.CLEAR_TYPE_NAME_MAP[detail[7]];
      scoreDetail.playCount = parseInt(detail[4]) ? parseInt(detail[4]) : 0;
      scoreDetail.clearCount = parseInt(detail[8]) ? parseInt(detail[8]) : 0;
      scoreDetail.maxCombo = parseInt(detail[3]) ? parseInt(detail[3]) : 0;
      scoreData.applyScoreDetail(difficulty, scoreDetail);
      res.scores.push(scoreData);
    }
    res.status = this.STATUS.SUCCESS;
    return res;
  }
}
