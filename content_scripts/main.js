chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type == 'PARSE_MUSIC_LIST') {
    console.log("parsing music list ...");
    sendResponse(parseMusicList());
    return true;
  }
  if (message.type == 'PARSE_MUSIC_DETAIL') {
    console.log("parsing music detail ...");
    sendResponse(parseMusicDetail());
    return true;
  }
  if (message.type == 'PARSE_SCORE_LIST') {
    console.log("parsing score list ...");
    sendResponse(parseScoreList());
    return true;
  }
  if (message.type == 'PARSE_SCORE_DETAIL') {
    console.log("parsing score detail ...");
    sendResponse({ foo: 3 });
    return true;
  }
  console.log("received unknown message");
  console.log(message);
});

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
    const data = {
    };
    const regexp = /^.*img=([0-9a-zA-Z]+).*$/;
    const src = $('td img', $(music))[0].src;
    const musicId = src.replace(regexp, '$1')
    data.title = $('.music_tit', $(music))[0].innerText;
    data.difficulty = $('.difficult', $(music)).get().map(function(element){
      const value = parseInt(element.innerText);
      return value ? value : 0;
    });
    res.musics[musicId] = data;
  });
  return res;
}

function parseMusicDetail(){
  const res = {
    musics: {}
  };
  data = {
  }
  const musicInfo = $('#music_info td').get();
  const regexpForMusicId = /^.*img=([0-9a-zA-Z]+).*$/;
  const src = $('img', $(musicInfo[0])).get()[0].src;
  const musicId = src.replace(regexpForMusicId, '$1');
  data.title = musicInfo[1].innerHTML.split('<br>')[0];
  const regexpForDifficulties = /^.*songdetails_level_([0-9]*).png$/
  const difficulties = $('li.step img').get();
  data.difficulty = difficulties.map(element => {
    const value = parseInt(element.src.replace(regexpForDifficulties, '$1'));
    return value ? value : 0;
  });
  res.musics[musicId] =  data;
  return res;
}

function parseScoreList(){
  const res = {
    hasNext: false,
    nextUrl: "",
    scores: {}
  };
  const next = $('#next.arrow').get();
  if (next.length > 0) {
    res.hasNext = true;
    res.nextUrl = $('a', $(next[0]))[0].href;
  }
  const isDouble = ($('#t_double.game_type .select').get().length > 0);
  const scores = $('tr.data').get();
  scores.forEach (function(score){
    const data = {
    };
    Object.keys(DIFFICULTY_NAME_MAP).forEach (function (difficultyName){
      const difficulty = DIFFICULTY_NAME_MAP[difficultyName] + (isDouble ? DIFFICULTIES_OFFSET_FOR_DOUBLE : 0);

      const scoreDetail = $('#' + difficultyName + '.rank', $(score)).get();
      if (scoreDetail.length == 0) {
        return;
      }
      data[difficulty] = {
        fullComboType: FULL_COMBO_TYPE.NO_FC,
        scoreRank: SCORE_RANK.NO_PLAY,
        score: 0
      };
      const value = parseInt($('.data_score', $(scoreDetail[0]))[0].innerText);
      data[difficulty].score = value ? value : 0;
      const regexp = /^.*\/([^\/]+)$/;
      const scoreRankFileName     = $('div.data_rank img', $(scoreDetail[0]))[0].src.replace(regexp, '$1');
      const fullComboTypeFileName = $('div.data_rank img', $(scoreDetail[0]))[1].src.replace(regexp, '$1')
      data[difficulty].scoreRank = SCORE_RANK_FILE_MAP[scoreRankFileName];
      data[difficulty].fullComboType = FULL_COMBO_TYPE_FILE_MAP[fullComboTypeFileName];
    });
    const regexp = /^.*img=([0-9a-zA-Z]+).*$/;
    const src = $('td img.jk', $(score))[0].src;
    const musicId = src.replace(regexp, '$1')
    res.scores[musicId] = data;
  });
  return res;
}
