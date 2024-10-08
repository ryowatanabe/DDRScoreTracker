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
    if (rootElement.querySelector('#login.errinfo_btn') !== null || rootElement.querySelector('#basic.errinfo_btn') !== null) {
      return this.STATUS.LOGIN_REQUIRED;
    }
    if (rootElement.querySelector('#error') !== null) {
      return this.STATUS.UNKNOWN_ERROR;
    }
    return this.STATUS.SUCCESS;
  }

  static parseMusicList(rootElement, _gameVersion) {
    const res = {
      hasNext: false,
      nextUrl: '',
      currentPage: null,
      maxPage: null,
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

    res.currentPage = parseInt(rootElement.querySelector('#thispage').querySelector('a').innerHTML, 10);
    const pages = rootElement.querySelectorAll('#paging_box')[0].querySelectorAll('.page_num');
    res.maxPage = parseInt(pages[pages.length - 1].querySelector('a').innerHTML, 10);

    const musics = rootElement.querySelectorAll('tr.data');
    musics.forEach(function (music) {
      const regexp = /^.*img=([0-9a-zA-Z]+).*$/;
      const src = music.querySelector('td img').src;
      const musicId = src.replace(regexp, '$1');
      const title = music.querySelector('.music_tit').innerHTML;
      const difficulty = Array.from(music.querySelectorAll('.difficult')).map(function (element) {
        const value = parseInt(element.innerHTML, 10);
        return value ? value : 0;
      });
      const musicData = new MusicData(musicId, Constants.MUSIC_TYPE.NORMAL, title, difficulty, 0);
      res.musics.push(musicData);
    });
    res.status = this.STATUS.SUCCESS;
    return res;
  }

  static parseMusicDetailBase(rootElement) {
    const res = {
      musics: [],
      status: this.getResultStatus(rootElement),
    };
    if (res.status != this.STATUS.SUCCESS) {
      return res;
    }
    const musicInfo = rootElement.querySelectorAll('#music_info td');
    if (musicInfo.length < 1) {
      res.status = this.STATUS.UNKNOWN_ERROR;
      return res;
    }
    const regexpForMusicId = /^.*img=([0-9a-zA-Z]+).*$/;
    const src = musicInfo[0].querySelector('img').src;
    const musicId = src.replace(regexpForMusicId, '$1');
    const title = musicInfo.length > 1 ? musicInfo[1].innerHTML.split('<br>')[0] : '';
    const regexpForDifficulties = /^.*songdetails_level_([0-9]*).png$/;
    const difficulties = Array.from(rootElement.querySelectorAll('li.step img'));
    const difficulty = difficulties.map((element) => {
      const value = parseInt(element.src.replace(regexpForDifficulties, '$1'), 10);
      return value ? value : 0;
    });
    const musicData = new MusicData(musicId, Constants.MUSIC_TYPE.NORMAL, title, difficulty, 0);
    res.musics.push(musicData);
    res.status = this.STATUS.SUCCESS;
    return res;
  }

  static parseMusicDetailDDRWorld(rootElement) {
    const res = {
      musics: [],
      status: this.getResultStatus(rootElement),
    };
    if (res.status != this.STATUS.SUCCESS) {
      return res;
    }
    const musicInfo = rootElement.querySelectorAll('#music_info td');
    if (musicInfo.length < 1) {
      res.status = this.STATUS.UNKNOWN_ERROR;
      return res;
    }
    const regexpForMusicId = /^.*img=([0-9a-zA-Z]+).*$/;
    const src = musicInfo[0].querySelector('img').src;
    const musicId = src.replace(regexpForMusicId, '$1');
    const title = musicInfo.length > 1 ? musicInfo[1].innerHTML.split('<br>')[0] : '';
    const regexpForDifficulties = /^.*songdetails_level_([0-9]*).png$/;
    const difficulties = Array.from(rootElement.querySelectorAll('li.step'));
    const difficulty = difficulties.map((element) => {
      const img = element.querySelector('img');
      if (img === null) {
        return 0;
      }
      const value = parseInt(img.src.replace(regexpForDifficulties, '$1'), 10);
      return value ? value : 0;
    });
    const musicData = new MusicData(musicId, Constants.MUSIC_TYPE.NORMAL, title, difficulty, 0);
    res.musics.push(musicData);
    res.status = this.STATUS.SUCCESS;
    return res;
  }

  static parseMusicDetail(rootElement, gameVersion) {
    if (gameVersion == Constants.GAME_VERSION.WORLD) {
      return this.parseMusicDetailDDRWorld(rootElement);
    }
    return this.parseMusicDetailBase(rootElement);
  }

  static parseScoreListBase(rootElement) {
    const res = {
      hasNext: false,
      nextUrl: '',
      currentPage: null,
      maxPage: null,
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

    res.currentPage = parseInt(rootElement.querySelector('#thispage').querySelector('a').innerHTML, 10);
    const pages = rootElement.querySelectorAll('#paging_box')[0].querySelectorAll('.page_num');
    res.maxPage = parseInt(pages[pages.length - 1].querySelector('a').innerHTML, 10);

    const isDouble = rootElement.querySelectorAll('#t_double.game_type .select, #t_double.grade_type .select, #t_double_p.grade_type .select').length > 0;
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
        const value = parseInt(detail[0].querySelector('.data_score').innerHTML, 10);
        scoreDetail.score = value ? value : 0;
        const regexp = /^.*\/([^/]+)$/;
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

  static parseScoreListDDRWorld(rootElement) {
    const res = {
      hasNext: false,
      nextUrl: '',
      currentPage: null,
      maxPage: null,
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

    res.currentPage = parseInt(rootElement.querySelector('#thispage').querySelector('a').innerHTML, 10);
    const pages = rootElement.querySelectorAll('#paging_box')[0].querySelectorAll('.page_num');
    res.maxPage = parseInt(pages[pages.length - 1].querySelector('a').innerHTML, 10);

    const isDouble = rootElement.querySelectorAll('#t_double.game_type .select, #t_double.grade_type .select, #t_double_p.grade_type .select').length > 0;
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
        const scoreValue = parseInt(detail[0].querySelector('.data_score').innerHTML, 10);
        scoreDetail.score = scoreValue ? scoreValue : 0;
        const flareSkill = parseInt(detail[0].querySelector('.data_flareskill').innerHTML, 10);
        scoreDetail.flareSkill = flareSkill ? flareSkill : null;
        const regexp = /^.*\/([^/]+)$/;
        const scoreRankFileName = detail[0].querySelectorAll('div.data_rank img')[0].src.replace(regexp, '$1');
        const clearTypeFileName = detail[0].querySelectorAll('div.data_clearkind img')[0].src.replace(regexp, '$1');
        const flareRankFileName = detail[0].querySelectorAll('div.data_flarerank img')[0].src.replace(regexp, '$1');
        scoreDetail.scoreRank = Constants.SCORE_RANK_FILE_MAP_DDRWORLD[scoreRankFileName];
        scoreDetail.clearType = Constants.CLEAR_TYPE_FILE_MAP_DDRWORLD[clearTypeFileName];
        scoreDetail.flareRank = Constants.FLARE_RANK_FILE_MAP_DDRWORLD[flareRankFileName];

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

  static parseScoreList(rootElement, gameVersion) {
    if (gameVersion == Constants.GAME_VERSION.WORLD) {
      return this.parseScoreListDDRWorld(rootElement);
    }
    return this.parseScoreListBase(rootElement);
  }

  static parseScoreDetailBase(rootElement) {
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
      scoreDetail.score = parseInt(detail[2], 10) ? parseInt(detail[2], 10) : 0;
      scoreDetail.scoreRank = Constants.SCORE_RANK_NAME_MAP[detail[1]];
      scoreDetail.clearType = Constants.CLEAR_TYPE_NAME_MAP[detail[7]];
      scoreDetail.playCount = parseInt(detail[4], 10) ? parseInt(detail[4], 10) : 0;
      scoreDetail.clearCount = parseInt(detail[8], 10) ? parseInt(detail[8], 10) : 0;
      scoreDetail.maxCombo = parseInt(detail[3], 10) ? parseInt(detail[3], 10) : 0;
      scoreData.applyScoreDetail(difficulty, scoreDetail);
      res.scores.push(scoreData);
    }
    res.status = this.STATUS.SUCCESS;
    return res;
  }

  static parseScoreDetailDDRWorld(rootElement) {
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
      scoreDetail.playCount = parseInt(detail[6], 10) ? parseInt(detail[6], 10) : 0;
      scoreDetail.clearCount = parseInt(detail[7], 10) ? parseInt(detail[7], 10) : 0;
      scoreDetail.maxCombo = parseInt(detail[8], 10) ? parseInt(detail[8], 10) : 0;
      scoreData.applyScoreDetail(difficulty, scoreDetail);
      res.scores.push(scoreData);
    }
    res.status = this.STATUS.SUCCESS;
    return res;
  }

  static parseScoreDetail(rootElement, gameVersion) {
    if (gameVersion == Constants.GAME_VERSION.WORLD) {
      return this.parseScoreDetailDDRWorld(rootElement);
    }
    return this.parseScoreDetailBase(rootElement);
  }
}
