let Logger;
let MusicData;
let ScoreData;
let ScoreDetail;
let Constants;

async function loadModules() {
  const logger = await import(chrome.extension.getURL('common/Logger.js'));
  Logger = logger.Logger;
  const musicData = await import(chrome.extension.getURL('common/MusicData.js'));
  MusicData = musicData.MusicData;
  const scoreData = await import(chrome.extension.getURL('common/ScoreData.js'));
  ScoreData = scoreData.ScoreData;
  const scoreDetail = await import(chrome.extension.getURL('common/ScoreDetail.js'));
  ScoreDetail = scoreDetail.ScoreDetail;
  const constants = await import(chrome.extension.getURL('common/Constants.js'));
  Constants = constants.Constants;
  console.log("modules loaded.");
};

function onMessage(message, sender, sendResponse) {
  loadModules().then((value) => {
    if (message.type == 'PARSE_MUSIC_LIST') {
      console.log("parsing music list ...");
      sendResponse(parseMusicList());
      return;
    }
    if (message.type == 'PARSE_MUSIC_DETAIL') {
      console.log("parsing music detail ...");
      sendResponse(parseMusicDetail());
      return;
    }
    if (message.type == 'PARSE_SCORE_LIST') {
      console.log("parsing score list ...");
      sendResponse(parseScoreList());
      return;
    }
    if (message.type == 'PARSE_SCORE_DETAIL') {
      console.log("parsing score detail ...");
      sendResponse(parseScoreDetail());
      return;
    }
    console.log("received unknown message");
    console.log(message);
  }, (reason) => {
    Logger.error(reason);
  });
  return true;
}
chrome.runtime.onMessage.addListener(onMessage);

function parseMusicList(){
  const res = {
    hasNext: false,
    nextUrl: "",
    musics: {}
  };
  const next = $('#next.arrow').get();
  if (next.length > 0) {
    res.hasNext = true;
    res.nextUrl = $('a', $(next[0]))[0].href;
  }
  const musics = $('tr.data').get();
  musics.forEach (function(music){

    const regexp = /^.*img=([0-9a-zA-Z]+).*$/;
    const src = $('td img', $(music))[0].src;
    const musicId = src.replace(regexp, '$1')
    const title = $('.music_tit', $(music))[0].innerText;
    const difficulty = $('.difficult', $(music)).get().map(function(element){
      const value = parseInt(element.innerText);
      return value ? value : 0;
    });
    const musicData = new MusicData(musicId, title, difficulty);
    res.musics[musicId] = musicData;
  });
  return res;
}

function parseMusicDetail(){
  const res = {
    musics: {}
  };
  const musicInfo = $('#music_info td').get();
  const regexpForMusicId = /^.*img=([0-9a-zA-Z]+).*$/;
  const src = $('img', $(musicInfo[0])).get()[0].src;
  const musicId = src.replace(regexpForMusicId, '$1');
  const title = musicInfo[1].innerHTML.split('<br>')[0];
  const regexpForDifficulties = /^.*songdetails_level_([0-9]*).png$/
  const difficulties = $('li.step img').get();
  const difficulty = difficulties.map(element => {
    const value = parseInt(element.src.replace(regexpForDifficulties, '$1'));
    return value ? value : 0;
  });
  const musicData = new MusicData(musicId, title, difficulty);
  res.musics[musicId] = musicData;
  return res;
}

function parseScoreList(){
  const res = {
    hasNext: false,
    nextUrl: "",
    scores: []
  };
  const next = $('#next.arrow').get();
  if (next.length > 0) {
    res.hasNext = true;
    res.nextUrl = $('a', $(next[0]))[0].href;
  }
  const isDouble = ($('#t_double.game_type .select').get().length > 0);
  const scores = $('tr.data').get();
  scores.forEach (function(score){
    const regexp = /^.*img=([0-9a-zA-Z]+).*$/;
    const src = $('td img.jk', $(score))[0].src;
    const musicId = src.replace(regexp, '$1')
    const scoreData = new ScoreData(musicId);
    Object.keys(Constants.DIFFICULTY_NAME_MAP).forEach (function (difficultyName){
      const difficulty = Constants.DIFFICULTY_NAME_MAP[difficultyName] + (isDouble ? Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE : 0);

      const detail = $('#' + difficultyName + '.rank', $(score)).get();
      if (detail.length == 0) {
        return;
      }

      const scoreDetail = new ScoreDetail();
      const value = parseInt($('.data_score', $(detail[0]))[0].innerText);
      scoreDetail.score = value ? value : 0;
      const regexp = /^.*\/([^\/]+)$/;
      const scoreRankFileName     = $('div.data_rank img', $(detail[0]))[0].src.replace(regexp, '$1');
      const clearTypeFileName = $('div.data_rank img', $(detail[0]))[1].src.replace(regexp, '$1')
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
    scores: []
  };

  const detail = $('#music_detail_table td').get().map(element => { return element.innerText; });
  if (detail.length > 0) {
    const musicInfo = $('#music_info td').get();
    const regexpForMusicId = /^.*img=([0-9a-zA-Z]+).*$/;
    const src = $('img', $(musicInfo[0])).get()[0].src;
    const musicId = src.replace(regexpForMusicId, '$1');

    const params = (new URL(document.location)).searchParams;
    const difficulty = params.get("diff");

    const scoreData = new ScoreData(musicId);
    const scoreDetail = new ScoreDetail();
    scoreDetail.score      = parseInt(detail[2]) ? parseInt(detail[2]) : 0;
    scoreDetail.scoreRank  = Constants.SCORE_RANK_NAME_MAP[detail[1]];
    scoreDetail.clearType  = Constants.CLEAR_TYPE_NAME_MAP[detail[7]];
    scoreDetail.playCount  = parseInt(detail[4]) ? parseInt(detail[4]) : 0;
    scoreDetail.clearCount = parseInt(detail[8]) ? parseInt(detail[8]) : 0;
    scoreDetail.maxCombo   = parseInt(detail[3]) ? parseInt(detail[3]) : 0;
    scoreData.applyScoreDetail(difficulty, scoreDetail);
    res.scores.push(scoreData);
  }
  return res;
}
