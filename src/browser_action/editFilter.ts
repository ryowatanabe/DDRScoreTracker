import '../styles/tailwind.css';
import { createApp } from 'vue';
import { App } from '../static/common/App.js';
import FilterEditor from './filter-editor.vue';

const app = new App();
let filterEditor: InstanceType<typeof FilterEditor>;

document.addEventListener('DOMContentLoaded', () => {
  filterEditor = createApp(FilterEditor).mount('#filter-editor') as InstanceType<typeof FilterEditor>;
});

function onInitialized() {
  filterEditor.initialize(app);
  filterEditor.load();
}

window.addEventListener('load', async () => {
  await app.init();
  onInitialized();
});
window.addEventListener('unload', () => {});
