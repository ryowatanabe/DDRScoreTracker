import { Constants } from '../static/common/Constants.js';
import ChartList from './chart-list.vue';
import ChartDiffList from './chart-diff-list.vue';
import LogContainer from './log-container.vue';
import { STATE as BACKGROUND_STATE, CHANGE_STATE_MESSAGE_TYPE as CHANGE_BACKGROUND_STATE_MESSAGE_TYPE } from '../static/background/state.js';

import { initialize as initializeFilter, refreshList } from './filter.js';
import { initialize as initializeMenu, openMenu } from './menu.js';

const chartList = new ChartList();
const chartDiffList = new ChartDiffList();
const logContainer = new LogContainer();

document.addEventListener('DOMContentLoaded', () => {
  chartList.$mount('#chart-list');
  chartDiffList.$mount('#chart-diff-list');
  logContainer.$mount('#log-container');
});

window.addEventListener('load', () => {
  setTimeout(() => {
    chartDiffList.initialize();
    logContainer.initialize();
    initializeFilter();
    initializeMenu();
    chrome.runtime.getBackgroundPage(function (backgroundPage) {
      if (backgroundPage.getState() != BACKGROUND_STATE.IDLE) {
        logContainer.disableButtons();
        logContainer.open();
      } else {
        logContainer.enableButtons();
      }
    });
  }, 300);
});
window.addEventListener('unload', () => {});

window.getCharts = () => {
  return chartList.charts;
};

window.openDiff = () => {
  chartDiffList.loadAndOpen();
};

window.refreshList = (summarySettings, filterConditions, sortConditions) => {
  chrome.runtime.getBackgroundPage(async function (backgroundPage) {
    const internalStatus = backgroundPage.getInternalStatus();
    const options = backgroundPage.getOptions();
    if (options.musicListReloadInterval > 0 && internalStatus.musicListUpdatedAt + options.musicListReloadInterval < Date.now()) {
      try {
        await backgroundPage.fetchParsedMusicList();
      } catch (error) {}
    }
    const newChartList = backgroundPage.getChartList().getFilteredAndSorted(filterConditions, sortConditions);
    chartList.summarySettings = summarySettings;
    chartList.setData(newChartList);
  });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type == CHANGE_BACKGROUND_STATE_MESSAGE_TYPE) {
    console.log(`change background state ${message.oldState} -> ${message.state}`);
    if (message.state == BACKGROUND_STATE.IDLE) {
      logContainer.enableButtons();
      if (message.oldState == BACKGROUND_STATE.UPDATE_SCORE_LIST) {
        chartDiffList.loadAndOpen();
      }
    } else {
      logContainer.disableButtons();
    }
  }
});
