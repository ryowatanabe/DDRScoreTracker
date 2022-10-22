import { App } from '../static/common/App.js';
import { STATE as APP_STATE, CHANGE_STATE_MESSAGE_TYPE as CHANGE_APP_STATE_MESSAGE_TYPE } from '../static/common/AppState.js';
import ChartList from './chart-list.vue';
import ChartDiffList from './chart-diff-list.vue';
import LogContainer from './log-container.vue';

import { initialize as initializeFilter } from './filter.js';
import { initialize as initializeMenu } from './menu.js';

const app = new App();

const chartList = new ChartList();
const chartDiffList = new ChartDiffList();
const logContainer = new LogContainer();

document.addEventListener('DOMContentLoaded', () => {
  chartList.$mount('#chart-list');
  chartDiffList.$mount('#chart-diff-list');
  logContainer.$mount('#log-container');
});

function onInitialized() {
  chartDiffList.initialize(app);
  logContainer.initialize(app);
  initializeFilter(app);
  initializeMenu(app);

  if (app.getState() != APP_STATE.IDLE) {
    logContainer.disableButtons();
    logContainer.open();
  } else {
    logContainer.enableButtons();
  }

  app.addMessageListener((message) => {
    if (message.type == CHANGE_APP_STATE_MESSAGE_TYPE) {
      console.log(`change app state ${message.oldState} -> ${message.state}`);
      if (message.state == APP_STATE.IDLE) {
        logContainer.enableButtons();
        if (message.oldState == APP_STATE.UPDATE_SCORE_LIST) {
          chartDiffList.loadAndOpen();
        }
      } else {
        logContainer.disableButtons();
      }
    }
  });
}

function initialize() {
  if (app.getState() == APP_STATE.INITIALIZE) {
    setTimeout(initialize, 100);
  } else {
    onInitialized();
  }
}

window.addEventListener('load', () => {
  const extension_id = chrome.i18n.getMessage('@@extension_id');
  // 二重起動抑止
  chrome.tabs.query({ url: `chrome-extension://${extension_id}/browser_action/*` }, (tabs) => {
    if (tabs.length > 1) {
      window.close();
    } else {
      initialize();
    }
  });
});
window.addEventListener('unload', () => {});

window.getCharts = () => {
  return chartList.charts;
};

window.openDiff = () => {
  chartDiffList.loadAndOpen();
};

window.refreshList = async (summarySettings, filterConditions, sortConditions) => {
  const internalStatus = app.getInternalStatus();
  const options = app.getOptions();
  if (options.musicListReloadInterval > 0 && internalStatus.musicListUpdatedAt + options.musicListReloadInterval < Date.now()) {
    try {
      await app.fetchParsedMusicList();
    } catch (error) {
      console.log(error);
    }
  }
  const newChartList = app.getChartList().getFilteredAndSorted(filterConditions, sortConditions);
  chartList.summarySettings = summarySettings;
  chartList.setData(newChartList);
};
