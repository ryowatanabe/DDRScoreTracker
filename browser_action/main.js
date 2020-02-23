const appCharts = new Vue({
  el: '#app-charts',
  data: {
    statistics: {
    },
    charts: []
  }
})

function refreshListDebug(){
  const conditions = eval($('#filterConditions').get()[0].value);
  refreshListImpl(conditions)
}

function refreshListImpl(conditions)
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    const allCharts = backgroundPage.getCharts();
    // filter
    let charts = allCharts.filter(chart => {
      let found = true;
      conditions.forEach(condition => {
        if(!condition.values.includes(chart[condition.attribute])){
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
        if (a.title < b.title){
          return -1;
        } else if (a.title > b.title){
          return 1;
        }
      }
      return 0;
    });
    appCharts.charts = charts;
    // statistics
    appCharts.statistics['clearType'] = {
      marvelous_fc: charts.filter(chart => { return chart.clearType == CLEAR_TYPE.MARVELOUS_FC }).length,
      perfect_fc:   charts.filter(chart => { return chart.clearType == CLEAR_TYPE.PERFECT_FC }).length,
      great_fc:     charts.filter(chart => { return chart.clearType == CLEAR_TYPE.GREAT_FC }).length,
      good_fc:      charts.filter(chart => { return chart.clearType == CLEAR_TYPE.GOOD_FC }).length,
      life4:        charts.filter(chart => { return chart.clearType == CLEAR_TYPE.LIFE4 }).length,
      clear:        charts.filter(chart => { return chart.clearType == CLEAR_TYPE.CLEAR }).length,
      assist_clear: charts.filter(chart => { return chart.clearType == CLEAR_TYPE.ASSIST_CLEAR }).length,
      failed:       charts.filter(chart => { return chart.clearType == CLEAR_TYPE.FAILED }).length,
      no_play:      charts.filter(chart => { return chart.clearType == CLEAR_TYPE.NO_PLAY }).length
    };
  });
}
