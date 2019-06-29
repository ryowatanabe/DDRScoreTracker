chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  chrome.runtime.sendMessage("from content script", function (response){
  	console.log(response)
  });
  if (message.type == 'PARSE_MUSIC_LIST') {
    console.log("parsing music list ...");
    sendResponse(parseMusicList());
    return true;
  }
  if (message.type == 'PARSE_SCORE_LIST') {
    console.log("parsing score list ...");
    sendResponse({ pos: 2 });
    return true;
  }
  if (message.type == 'PARSE_SCORE_DETAIL') {
    console.log("parsing score detail ...");
    sendResponse({ foo: 3 });
    return true;
  }
  console.log("received message");
  console.log(message);
  sendResponse({ hoge: 1 });
  return true;
});

function parseMusicList(){
  const res = {
    hasNext: false,
    nextUrl: "",
    musics: []
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
    data.id = src.replace(regexp, '$1')
    data.title = $('.music_tit', $(music))[0].innerText;
    data.difficulty = $('.difficult', $(music)).get().map(function(element){return parseInt(element.innerText)});
    res.musics.push(data);
  });
  return res;
}
