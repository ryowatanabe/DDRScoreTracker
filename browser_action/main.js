const appCharts = new Vue({
  el: '#app-charts',
  data: {
    charts: []
  }
})

const appLog = new Vue({
  el: '#app-log',
  data: {
    log: []
  }
})

appLog.log.push("Initialized.");

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

function updateCharts()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateCharts();
  });
}

function refreshList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    const allCharts = backgroundPage.getCharts();
    // filter
    const conditions = [
      { attribute: 'playMode', values: [ PLAY_MODE.DOUBLE ] },
      { attribute: 'level', values: [ 13, 14 ] },
    ];
    let charts = allCharts.filter(chart => {
      let found = true;
      conditions.forEach(condition => {
        if(!condition.values.find(value => {
          return value == chart[condition.attribute];
        })){
          found = false;
        }
      });
      return found;
    });
    // sort
    // TODO ソート方法を定義できるようにする
    charts.sort(function(a, b){
      if (a.score > b.score){
        return -1;
      } else if (a.score < b.score){
        return 1;
      } else {
        return 0;
      }
    });

    appCharts.charts = charts;
  });
}



document.getElementById('updateMusicListButton').addEventListener("click", updateMusicList);
document.getElementById('updateSingleScoreListButton').addEventListener("click", updateSingleScoreList);
document.getElementById('updateDoubleScoreListButton').addEventListener("click", updateDoubleScoreList);
document.getElementById('updateScoreDetailButton').addEventListener("click", updateScoreDetail);
document.getElementById('updateChartsButton').addEventListener("click", updateCharts);
document.getElementById('refreshListButton').addEventListener("click", refreshList);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("received message");
  console.log(message);
  sendResponse({ hoge: 1 });
  return true;
});
