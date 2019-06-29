var appCharts = new Vue({
  el: '#app-charts',
  data: {
    charts: [
      {
        mId: "0000000000000000",
        difficulty: 0,
        status: 0,
        score: 0,
        combo: 0,
        playCount: 0,
        clearCount: 0
      }
    ]
  }
})

var appLog = new Vue({
  el: '#app-log',
  data: {
    log: []
  }
})

appLog.log.push("Initialized.");
appCharts.charts.push({
  mId: "0000000000000000",
  difficulty: 0,
  status: 0,
  score: 0,
  combo: 0,
  playCount: 0,
  clearCount: 0
});


function updateMusicList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateMusicList(chrome.windows.WINDOW_ID_CURRENT);
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

document.getElementById('updateMusicListButton').addEventListener("click", updateMusicList);
document.getElementById('updateSingleScoreListButton').addEventListener("click", updateSingleScoreList);
document.getElementById('updateDoubleScoreListButton').addEventListener("click", updateDoubleScoreList);
document.getElementById('updateScoreDetailButton').addEventListener("click", updateScoreDetail);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("received message");
  console.log(message);
  sendResponse({ hoge: 1 });
  return true;
});
