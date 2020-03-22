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
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateScoreDetail(chrome.windows.WINDOW_ID_CURRENT, [
      { musicId: "qOP1qP69o6id061o9bo8l6P11P1PQI1O", difficulty: 7 }
    ]);
  });
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
    const musics = backgroundPage.getMusicList();
    $('#textarea').get()[0].innerHTML = musics.encodedString;
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

document.getElementById('updateMusicListButton').addEventListener("click", updateMusicList);
document.getElementById('updateMusicList2Button').addEventListener("click", updateMusicList2);
document.getElementById('updateSingleScoreListButton').addEventListener("click", updateSingleScoreList);
document.getElementById('updateDoubleScoreListButton').addEventListener("click", updateDoubleScoreList);
document.getElementById('updateScoreDetailButton').addEventListener("click", updateScoreDetail);
document.getElementById('updateChartsButton').addEventListener("click", updateCharts);
document.getElementById('resetStorageButton').addEventListener("click", resetStorage);
