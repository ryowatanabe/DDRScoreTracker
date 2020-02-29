function updateMusicList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateMusicList(chrome.windows.WINDOW_ID_CURRENT);
  });
}

function updateMusicList2()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.fetchMissingMusicInfo(chrome.windows.WINDOW_ID_CURRENT);
  });
}

function updateSingleScoreList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateScoreList(chrome.windows.WINDOW_ID_CURRENT, PLAY_MODE.SINGLE);
  });
}
function updateDoubleScoreList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateScoreList(chrome.windows.WINDOW_ID_CURRENT, PLAY_MODE.DOUBLE);
  });
}

function updateScoreDetail()
{

}

function updateCharts()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateCharts();
  });
}

function resetStorage()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.resetStorage();
  });
}

function dumpMusicList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    const musics = backgroundPage.getMusics();
    const encodedMusicList = Object.keys(musics).map(musicId => {
      return [musicId, musics[musicId].difficulty, musics[musicId].title].flat().join("\t")
    }).sort().join("\n");

    $('#textarea').get()[0].innerHTML = encodedMusicList;
    var copyText = document.querySelector("#textarea");
    copyText.select();
    if(document.execCommand("copy")){
      alert('クリップボードにコピーしました。');
    } else{
      alert('クリップボードにコピーできませんでした。');
    }
  });
}

function updateParsedMusicList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateParsedMusicList();
  });
}

document.getElementById('dumpMusicListButton').addEventListener("click", dumpMusicList);
document.getElementById('updateParsedMusicListButton').addEventListener("click", updateParsedMusicList);

function openLog() {
  $("#logContainer").attr('class', 'log active');
}
function closeLog() {
  $("#logContainer").attr('class', 'log');
}
function flushLog() {
  LOG_RECEIVER.flush();
}

const appLog = new Vue({
  el: '#app-log',
  data: {
    log: LOG_RECEIVER.data
  }
});
LOG_RECEIVER.callback = openLog;
document.getElementById('closeLogButton').addEventListener("click", closeLog);
document.getElementById('flushLogButton').addEventListener("click", flushLog);

document.getElementById('updateMusicListButton').addEventListener("click", updateMusicList);
document.getElementById('updateMusicList2Button').addEventListener("click", updateMusicList2);
document.getElementById('updateSingleScoreListButton').addEventListener("click", updateSingleScoreList);
document.getElementById('updateDoubleScoreListButton').addEventListener("click", updateDoubleScoreList);
document.getElementById('updateScoreDetailButton').addEventListener("click", updateScoreDetail);
document.getElementById('updateChartsButton').addEventListener("click", updateCharts);
document.getElementById('resetStorageButton').addEventListener("click", resetStorage);
