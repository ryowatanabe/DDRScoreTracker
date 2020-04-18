import { refreshList } from './filter.js';
import { Constants } from '../common/Constants.js';

function fetchParsedMusicList() {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    backgroundPage.fetchParsedMusicList();
  });
}
document.getElementById('fetchParsedMusicListButton').addEventListener('click', fetchParsedMusicList);

function fetchMissingMusicInfo() {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    backgroundPage.fetchMissingMusicInfo(chrome.windows.WINDOW_ID_CURRENT);
  });
}
document.getElementById('fetchMissingMusicInfoButton').addEventListener('click', fetchMissingMusicInfo);

function updateScoreList(playMode, musicType) {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    backgroundPage.updateScoreList(chrome.windows.WINDOW_ID_CURRENT, playMode, musicType);
  });
}
document.getElementById('updateSingleScoreListButton').addEventListener('click', updateScoreList.bind(this, Constants.PLAY_MODE.SINGLE, Constants.MUSIC_TYPE.NORMAL));
document.getElementById('updateSingleNonstopScoreListButton').addEventListener('click', updateScoreList.bind(this, Constants.PLAY_MODE.SINGLE, Constants.MUSIC_TYPE.NONSTOP));
document.getElementById('updateSingleGradeScoreListButton').addEventListener('click', updateScoreList.bind(this, Constants.PLAY_MODE.SINGLE, Constants.MUSIC_TYPE.GRADE));
document.getElementById('updateDoubleScoreListButton').addEventListener('click', updateScoreList.bind(this, Constants.PLAY_MODE.DOUBLE, Constants.MUSIC_TYPE.NORMAL));
document.getElementById('updateDoubleNonstopScoreListButton').addEventListener('click', updateScoreList.bind(this, Constants.PLAY_MODE.DOUBLE, Constants.MUSIC_TYPE.NONSTOP));
document.getElementById('updateDoubleGradeScoreListButton').addEventListener('click', updateScoreList.bind(this, Constants.PLAY_MODE.DOUBLE, Constants.MUSIC_TYPE.GRADE));

function updateScoreDetail() {
  const targetMusics = [];
  window.getCharts().forEach(function (chartData) {
    targetMusics.push({
      musicId: chartData.musicId,
      difficulty: chartData.difficulty + (chartData.playMode == Constants.PLAY_MODE.DOUBLE ? Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE : 0),
    });
  });
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    backgroundPage.updateScoreDetail(chrome.windows.WINDOW_ID_CURRENT, targetMusics);
  });
}
document.getElementById('updateScoreDetailButton').addEventListener('click', updateScoreDetail);

function openMenu() {
  document.getElementById('menuContainer').classList.add('active');
  document.getElementById('menuBackground').classList.add('active');
}
function closeMenu() {
  document.getElementById('menuContainer').classList.remove('active');
  document.getElementById('menuBackground').classList.remove('active');
  setTimeout(refreshList, 300);
}
document.getElementById('openMenuButton').addEventListener('click', openMenu);
document.getElementById('closeMenuButton').addEventListener('click', closeMenu);
