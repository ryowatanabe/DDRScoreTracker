import LogContainer from './log-container.vue';

document.addEventListener('DOMContentLoaded', () => {
  const logContainer = new LogContainer();
  logContainer.$mount('#log-container');
});
