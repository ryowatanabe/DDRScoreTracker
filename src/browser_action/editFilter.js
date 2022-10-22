import { App } from '../static/common/App.js';
import { STATE as APP_STATE } from '../static/common/AppState.js';
import FilterEditor from './filter-editor.vue';

const app = new App();
const filterEditor = new FilterEditor();

document.addEventListener('DOMContentLoaded', () => {
  filterEditor.$mount('#filter-editor');
});

function onInitialized() {
  filterEditor.initialize(app);
  filterEditor.load();
}

function initialize() {
  if (app.getState() == APP_STATE.INITIALIZE) {
    setTimeout(initialize, 100);
  } else {
    onInitialized();
  }
}

window.addEventListener('load', () => {
  initialize();
});
window.addEventListener('unload', () => {});
