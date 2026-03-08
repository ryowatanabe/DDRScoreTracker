import { MusicData } from './MusicData.js';
import { ScoreData } from './ScoreData.js';
import { ScoreDetail } from './ScoreDetail.js';
import { Constants, type GameVersion, type MusicType, type ScoreRank, type ClearType, type FlareRank } from './Constants.js';

type ParseStatus = 0 | 1 | 2;

type MusicListResult = {
  hasNext: boolean;
  nextUrl: string;
  currentPage: number | null;
  maxPage: number | null;
  musics: MusicData[];
  status: ParseStatus;
};

type MusicDetailResult = {
  musics: MusicData[];
  status: ParseStatus;
};

type ScoreListResult = {
  hasNext: boolean;
  nextUrl: string;
  currentPage: number | null;
  maxPage: number | null;
  scores: ScoreData[];
  status: ParseStatus;
};

type ScoreDetailResult = {
  scores: ScoreData[];
  status: ParseStatus;
};

export class Parser {
  static get STATUS() {
    return {
      SUCCESS: 0,
      UNKNOWN_ERROR: 1,
      LOGIN_REQUIRED: 2,
    };
  }

  static getResultStatus(rootElement: Element): ParseStatus {
    if (rootElement.querySelector('#login.errinfo_btn') !== null || rootElement.querySelector('#basic.errinfo_btn') !== null) {
      return this.STATUS.LOGIN_REQUIRED as ParseStatus;
    }
    if (rootElement.querySelector('#error') !== null) {
      return this.STATUS.UNKNOWN_ERROR as ParseStatus;
    }
    return this.STATUS.SUCCESS as ParseStatus;
  }

  static parseMusicList(rootElement: Element, _gameVersion?: GameVersion): MusicListResult {
    const res: MusicListResult = {
      hasNext: false,
      nextUrl: '',
      currentPage: null,
      maxPage: null,
      musics: [],
      status: this.getResultStatus(rootElement),
    };
    if (res.status !== this.STATUS.SUCCESS) {
      return res;
    }
    const next = rootElement.querySelectorAll('#next.arrow');
    if (next.length > 0) {
      res.hasNext = true;
      res.nextUrl = (next[0].querySelector('a') as HTMLAnchorElement).href;
    }

    res.currentPage = parseInt((rootElement.querySelector('#thispage') as Element).querySelector('a').innerHTML, 10);
    const pages = rootElement.querySelectorAll('#paging_box')[0].querySelectorAll('.page_num');
    res.maxPage = parseInt(pages[pages.length - 1].querySelector('a').innerHTML, 10);

    const musics = rootElement.querySelectorAll('tr.data');
    musics.forEach(function (music) {
      const regexp = /^.*img=([0-9a-zA-Z]+).*$/;
      const src = (music.querySelector('td img') as HTMLImageElement).src;
      const musicId = src.replace(regexp, '$1');
      const title = music.querySelector('.music_tit').innerHTML;
      const difficulty = Array.from(music.querySelectorAll('.difficult')).map(function (element) {
        const value = parseInt(element.innerHTML, 10);
        return value ? value : 0;
      });
      const musicData = new MusicData(musicId, Constants.MUSIC_TYPE.NORMAL as MusicType, title, difficulty, 0);
      res.musics.push(musicData);
    });
    res.status = this.STATUS.SUCCESS as ParseStatus;
    return res;
  }

  // getDifficulties: (rootElement: Element) => number[]
  static parseMusicDetailCore(rootElement: Element, getDifficulties: (root: Element) => number[]): MusicDetailResult {
    const res: MusicDetailResult = {
      musics: [],
      status: this.getResultStatus(rootElement),
    };
    if (res.status !== this.STATUS.SUCCESS) {
      return res;
    }
    const musicInfo = rootElement.querySelectorAll('#music_info td');
    if (musicInfo.length < 1) {
      res.status = this.STATUS.UNKNOWN_ERROR as ParseStatus;
      return res;
    }
    const regexpForMusicId = /^.*img=([0-9a-zA-Z]+).*$/;
    const musicId = (musicInfo[0].querySelector('img') as HTMLImageElement).src.replace(regexpForMusicId, '$1');
    const title = musicInfo.length > 1 ? musicInfo[1].innerHTML.split('<br>')[0] : '';
    const difficulty = getDifficulties(rootElement);
    res.musics.push(new MusicData(musicId, Constants.MUSIC_TYPE.NORMAL as MusicType, title, difficulty, 0));
    res.status = this.STATUS.SUCCESS as ParseStatus;
    return res;
  }

  static parseMusicDetail(rootElement: Element, gameVersion: GameVersion): MusicDetailResult {
    const regexpForDifficulties = /^.*songdetails_level_([0-9]*).png$/;
    if (gameVersion === Constants.GAME_VERSION.WORLD) {
      return this.parseMusicDetailCore(rootElement, (root) => {
        return Array.from(root.querySelectorAll('li.step')).map((element) => {
          const img = element.querySelector('img') as HTMLImageElement | null;
          if (img === null) {
            return 0;
          }
          const value = parseInt(img.src.replace(regexpForDifficulties, '$1'), 10);
          return value ? value : 0;
        });
      });
    }
    return this.parseMusicDetailCore(rootElement, (root) => {
      return Array.from(root.querySelectorAll('li.step img')).map((element) => {
        const value = parseInt((element as HTMLImageElement).src.replace(regexpForDifficulties, '$1'), 10);
        return value ? value : 0;
      });
    });
  }

  // buildScoreDetail: (detailElement: Element) => ScoreDetail | null (null means NO_PLAY, skip)
  static parseScoreListCore(rootElement: Element, buildScoreDetail: (detail: Element) => ScoreDetail | null): ScoreListResult {
    const res: ScoreListResult = {
      hasNext: false,
      nextUrl: '',
      currentPage: null,
      maxPage: null,
      scores: [],
      status: this.getResultStatus(rootElement),
    };
    if (res.status !== this.STATUS.SUCCESS) {
      return res;
    }
    const next = rootElement.querySelectorAll('#next.arrow');
    if (next.length > 0) {
      res.hasNext = true;
      res.nextUrl = (next[0].querySelector('a') as HTMLAnchorElement).href;
    }

    res.currentPage = parseInt((rootElement.querySelector('#thispage') as Element).querySelector('a').innerHTML, 10);
    const pages = rootElement.querySelectorAll('#paging_box')[0].querySelectorAll('.page_num');
    res.maxPage = parseInt(pages[pages.length - 1].querySelector('a').innerHTML, 10);

    const isDouble = rootElement.querySelectorAll('#t_double.game_type .select, #t_double.grade_type .select, #t_double_p.grade_type .select').length > 0;
    const scores = Array.from(rootElement.querySelectorAll('tr.data'));
    scores.forEach(function (score) {
      const regexp = /^.*img=([0-9a-zA-Z]+).*$/;
      const musicId = (score.querySelector('td img.jk, td img.jk2') as HTMLImageElement).src.replace(regexp, '$1');
      const scoreData = new ScoreData(musicId);
      Object.keys(Constants.DIFFICULTY_NAME_MAP).forEach(function (difficultyName) {
        const difficulty = Constants.DIFFICULTY_NAME_MAP[difficultyName] + (isDouble ? Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE : 0);

        const detail = score.querySelectorAll('#' + difficultyName + '.rank');
        if (detail.length === 0) {
          return;
        }

        const scoreDetail = buildScoreDetail(detail[0]);
        if (scoreDetail === null) {
          return;
        }
        scoreData.applyScoreDetail(String(difficulty), scoreDetail);
      });
      res.scores.push(scoreData);
    });
    res.status = this.STATUS.SUCCESS as ParseStatus;
    return res;
  }

  static parseScoreList(rootElement: Element, gameVersion: GameVersion): ScoreListResult {
    const fileNameRegexp = /^.*\/([^/]+)$/;
    if (gameVersion === Constants.GAME_VERSION.WORLD) {
      return this.parseScoreListCore(rootElement, (detail) => {
        const scoreDetail = new ScoreDetail();
        const scoreValue = parseInt((detail.querySelector('.data_score') as Element).innerHTML, 10);
        scoreDetail.score = scoreValue ? scoreValue : 0;
        const flareSkill = parseInt((detail.querySelector('.data_flareskill') as Element).innerHTML, 10);
        scoreDetail.flareSkill = flareSkill ? flareSkill : null;
        const scoreRankFileName = (detail.querySelectorAll('div.data_rank img')[0] as HTMLImageElement).src.replace(fileNameRegexp, '$1');
        const clearTypeFileName = (detail.querySelectorAll('div.data_clearkind img')[0] as HTMLImageElement).src.replace(fileNameRegexp, '$1');
        const flareRankFileName = (detail.querySelectorAll('div.data_flarerank img')[0] as HTMLImageElement).src.replace(fileNameRegexp, '$1');
        scoreDetail.scoreRank = Constants.SCORE_RANK_FILE_MAP_DDRWORLD[scoreRankFileName] as ScoreRank;
        scoreDetail.clearType = Constants.CLEAR_TYPE_FILE_MAP_DDRWORLD[clearTypeFileName] as ClearType;
        scoreDetail.flareRank = Constants.FLARE_RANK_FILE_MAP_DDRWORLD[flareRankFileName] as FlareRank;
        if (scoreDetail.scoreRank === Constants.SCORE_RANK.NO_PLAY) {
          return null;
        }
        return scoreDetail;
      });
    }
    return this.parseScoreListCore(rootElement, (detail) => {
      const scoreDetail = new ScoreDetail();
      const value = parseInt((detail.querySelector('.data_score') as Element).innerHTML, 10);
      scoreDetail.score = value ? value : 0;
      const scoreRankFileName = (detail.querySelectorAll('div.data_rank img')[0] as HTMLImageElement).src.replace(fileNameRegexp, '$1');
      const clearTypeFileName = (detail.querySelectorAll('div.data_rank img')[1] as HTMLImageElement).src.replace(fileNameRegexp, '$1');
      scoreDetail.scoreRank = Constants.SCORE_RANK_FILE_MAP[scoreRankFileName] as ScoreRank;
      scoreDetail.clearType = Constants.CLEAR_TYPE_FILE_MAP[clearTypeFileName] as ClearType;
      if (scoreDetail.scoreRank === Constants.SCORE_RANK.NO_PLAY) {
        return null;
      }
      return scoreDetail;
    });
  }

  // fillScoreDetail: (detail: string[], scoreDetail: ScoreDetail) => void
  static parseScoreDetailCore(rootElement: Element, fillScoreDetail: (detail: string[], scoreDetail: ScoreDetail) => void): ScoreDetailResult {
    const res: ScoreDetailResult = {
      scores: [],
      status: this.getResultStatus(rootElement),
    };
    if (res.status !== this.STATUS.SUCCESS) {
      return res;
    }
    const detail = Array.from(rootElement.querySelectorAll('#music_detail_table td, #course_detail_table td')).map((element) => {
      return element.innerHTML;
    });
    if (detail.length > 0) {
      const musicInfo = rootElement.querySelector('#music_info td') as Element;
      const regexpForMusicId = /^.*img=([0-9a-zA-Z]+).*$/;
      const musicId = (musicInfo.querySelector('img') as HTMLImageElement).src.replace(regexpForMusicId, '$1');

      const params = new URL(document.location.href).searchParams;
      const difficulty = params.get('diff');

      const scoreData = new ScoreData(musicId);
      const scoreDetail = new ScoreDetail();
      fillScoreDetail(detail, scoreDetail);
      scoreData.applyScoreDetail(difficulty, scoreDetail);
      res.scores.push(scoreData);
    }
    res.status = this.STATUS.SUCCESS as ParseStatus;
    return res;
  }

  static parseScoreDetail(rootElement: Element, gameVersion: GameVersion): ScoreDetailResult {
    if (gameVersion === Constants.GAME_VERSION.WORLD) {
      return this.parseScoreDetailCore(rootElement, (detail, scoreDetail) => {
        scoreDetail.playCount = parseInt(detail[6], 10) ? parseInt(detail[6], 10) : 0;
        scoreDetail.clearCount = parseInt(detail[7], 10) ? parseInt(detail[7], 10) : 0;
        scoreDetail.maxCombo = parseInt(detail[8], 10) ? parseInt(detail[8], 10) : 0;
      });
    }
    return this.parseScoreDetailCore(rootElement, (detail, scoreDetail) => {
      scoreDetail.score = parseInt(detail[2], 10) ? parseInt(detail[2], 10) : 0;
      scoreDetail.scoreRank = Constants.SCORE_RANK_NAME_MAP[detail[1]] as ScoreRank;
      scoreDetail.clearType = Constants.CLEAR_TYPE_NAME_MAP[detail[7]] as ClearType;
      scoreDetail.playCount = parseInt(detail[4], 10) ? parseInt(detail[4], 10) : 0;
      scoreDetail.clearCount = parseInt(detail[8], 10) ? parseInt(detail[8], 10) : 0;
      scoreDetail.maxCombo = parseInt(detail[3], 10) ? parseInt(detail[3], 10) : 0;
    });
  }
}
