const appCharts = new Vue({
  el: '#app-charts',
  data: {
    maxPage: 1,
    currentPage: 1,
    statistics: {
    },
    pageCharts: [],
    charts: []
  },
  methods: {
    gotoPage: function(page) {
      gotoPage(page);
    }
  }
})

function gotoPage(page) {
  appCharts.pageCharts  = appCharts.charts.slice((page - 1) * PAGE_LENGTH, page * PAGE_LENGTH);
  appCharts.currentPage = page;
}

function refreshListImpl(filterConditions, sortConditions)
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    const chartList = backgroundPage.getChartList().getFilteredAndSorted(filterConditions, sortConditions);
    appCharts.statistics  = chartList.statistics;
    appCharts.charts      = chartList.charts;
    appCharts.maxPage     = Math.ceil(chartList.charts.length / PAGE_LENGTH);
    appCharts.currentPage = 1
    gotoPage(appCharts.currentPage);
  });
}

function updateScoreDetail()
{
  const targetMusics = [];
  appCharts.charts.forEach(function(chartData){
    targetMusics.push({
      musicId: chartData.musicId,
      difficulty: chartData.difficulty + (chartData.playMode == PLAY_MODE.DOUBLE ? DIFFICULTIES_OFFSET_FOR_DOUBLE : 0)
    });
  });
  closeFilter();
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateScoreDetail(chrome.windows.WINDOW_ID_CURRENT, targetMusics);
  });
}

document.getElementById('updateScoreDetailButton').addEventListener("click", updateScoreDetail);
