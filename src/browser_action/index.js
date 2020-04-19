import { Constants } from '../static/common/Constants.js';
import ChartList from './chart-list.vue';
import LogContainer from './log-container.vue';

const chartList = new ChartList();
const logContainer = new LogContainer();

document.addEventListener('DOMContentLoaded', () => {
  chartList.$mount('#chart-list');
  logContainer.$mount('#log-container');
});

window.gotoPage = (page) => {
  chartList.pageCharts = chartList.charts.slice((page - 1) * Constants.PAGE_LENGTH, page * Constants.PAGE_LENGTH);
  chartList.currentPage = page;
};

window.getCharts = () => {
  return chartList.charts;
};

window.refreshList = (filterConditions, sortConditions) => {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    const newChartList = backgroundPage.getChartList().getFilteredAndSorted(filterConditions, sortConditions);
    chartList.statistics = newChartList.statistics;
    chartList.charts = newChartList.charts;
    chartList.maxPage = Math.ceil(newChartList.charts.length / Constants.PAGE_LENGTH);
    chartList.currentPage = 1;
    gotoPage(chartList.currentPage);
  });
};
