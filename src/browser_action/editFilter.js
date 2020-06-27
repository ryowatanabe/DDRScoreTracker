import { Constants } from '../static/common/Constants.js';
import FilterEditor from './filter-editor.vue';

const filterEditor = new FilterEditor();

document.addEventListener('DOMContentLoaded', () => {
  filterEditor.$mount('#filter-editor');
});

window.addEventListener('load', () => {
  filterEditor.load();
});
window.addEventListener('unload', () => {});
