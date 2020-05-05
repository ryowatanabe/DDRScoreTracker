import { Constants } from '../static/common/Constants.js';
import ChartList from './chart-list.vue';
import LogContainer from './log-container.vue';
import { STATE as BACKGROUND_STATE, CHANGE_STATE_MESSAGE_TYPE as CHANGE_BACKGROUND_STATE_MESSAGE_TYPE } from '../static/background/state.js';

import { initialize as initializeFilter, refreshList } from './filter.js';
import { initialize as initializeMenu, openMenu } from './menu.js';

const chartList = new ChartList();
const logContainer = new LogContainer();

document.addEventListener('DOMContentLoaded', () => {
  chartList.$mount('#chart-list');
  logContainer.$mount('#log-container');
});

window.addEventListener('load', () => {
  setTimeout(() => {
    logContainer.initialize();
    initializeFilter();
    initializeMenu();
    chrome.runtime.getBackgroundPage(function (backgroundPage) {
      if (backgroundPage.getState() != BACKGROUND_STATE.IDLE) {
        logContainer.disableButtons();
        logContainer.open();
      }
    });
  }, 300);
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
    if (backgroundPage.getChartCount() == 0) {
      openMenu();
    } else {
      const newChartList = backgroundPage.getChartList().getFilteredAndSorted(filterConditions, sortConditions);
      chartList.statistics = newChartList.statistics;
      chartList.charts = newChartList.charts;
      chartList.maxPage = Math.ceil(newChartList.charts.length / Constants.PAGE_LENGTH);
      chartList.currentPage = 1;
      gotoPage(chartList.currentPage);
    }
  });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type == CHANGE_BACKGROUND_STATE_MESSAGE_TYPE) {
    console.log(`change background state ${message.oldState} -> ${message.state}`);
    if (message.state == BACKGROUND_STATE.IDLE) {
      logContainer.enableButtons();
    } else {
      logContainer.disableButtons();
    }
  }
});
