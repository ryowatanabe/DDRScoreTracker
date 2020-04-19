import { MusicData } from './MusicData.js';
import { ScoreData } from './ScoreData.js';
import { ScoreDetail } from './ScoreDetail.js';
import { Constants } from './Constants.js';

export function parseMusicList(rootElement) {
  const res = {
    hasNext: false,
    nextUrl: '',
    musics: [],
  };
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
  return res;
}

export function parseMusicDetail(rootElement) {
  const res = {
    musics: [],
  };
  const musicInfo = rootElement.querySelectorAll('#music_info td');
  if (musicInfo.length != 2) {
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
  return res;
}

export function parseScoreList(rootElement) {
  const res = {
    hasNext: false,
    nextUrl: '',
    scores: [],
  };
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
  return res;
}

function parseScoreDetail() {
  const res = {
    scores: [],
  };

  const detail = $('#music_detail_table td, #course_detail_table td')
    .get()
    .map((element) => {
      return element.innerText;
    });
  if (detail.length > 0) {
    const musicInfo = $('#music_info td').get();
    const regexpForMusicId = /^.*img=([0-9a-zA-Z]+).*$/;
    const src = $('img', $(musicInfo[0])).get()[0].src;
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
  return res;
}
