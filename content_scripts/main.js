chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type == 'PARSE_MUSIC_LIST') {
    console.log("parsing music list ...");
    sendResponse(parseMusicList());
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
    data.difficulty = $('.difficult', $(music)).get().map(function(element){return parseInt(element.innerText)});
    res.musics[musicId] = data;
  });
  return res;
}

function parseScoreList(){
  const res = {
    hasNext: false,
    nextUrl: "",
    scores: {}
  };
  const difficulties = [ 'beginner', 'basic', 'difficult', 'expert', 'challenge' ];
  const next = $('#next.arrow').get();
  if (next.length > 0) {
    res.hasNext = true;
    res.nextUrl = $('a', $(next[0]))[0].href;
  }
  const scores = $('tr.data').get();
  scores.forEach (function(score){
    const data = {
    };
    difficulties.forEach (function (difficulty){
      const scoreDetail = $('#' + difficulty + '.rank', $(score)).get();
      if (scoreDetail.length == 0) {
        return;
      }
      data[difficulty] = {
        fullComboType: FULL_COMBO_TYPE.NO_FC,
        scoreRank: SCORE_RANK.NO_PLAY,
        score: 0
      };
      data[difficulty].score = parseInt($('.data_score', $(scoreDetail[0]))[0].innerText);
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
