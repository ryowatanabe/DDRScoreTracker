import LogContainer from './LogContainer.vue';

document.addEventListener('DOMContentLoaded', () => {
  const logContainer = new LogContainer();
  logContainer.$mount('#log-container');
});
