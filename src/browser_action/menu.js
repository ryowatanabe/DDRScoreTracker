import { refreshList } from './filter.js';
import { Constants } from '../static/common/Constants.js';
import { Logger } from '../static/common/Logger.js';

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
    backgroundPage
      .updateScoreList(chrome.windows.WINDOW_ID_CURRENT, playMode, musicType)
      .then((value) => {
        Logger.debug(`updateScoreList success : ${value}`);
      })
      .catch((error) => {
        Logger.debug(`updateScoreList failed : ${JSON.stringify(error.message)}`);
      });
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

document.getElementById('exportScoreToSkillAttackButton').addEventListener('click', () => {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    backgroundPage
      .exportScoreToSkillAttack(document.getElementById('exportScoreToSkillAttackDdrCode').value, document.getElementById('exportScoreToSkillAttackPassword').value)
      .then((value) => {
        Logger.debug(`exportScoreToSkillAttack success : ${value}`);
      })
      .catch((error) => {
        Logger.debug(`exportScoreToSkillAttack failed : ${JSON.stringify(error.message)}`);
      });
  });
});
document.getElementById('openSkillAttackPageButton').addEventListener('click', () => {
  window.open('http://skillattack.com/sa4/');
});
document.getElementById('openSkillAttackUserPageButton').addEventListener('click', () => {
  const ddrcode = document.getElementById('exportScoreToSkillAttackDdrCode').value;
  window.open('http://skillattack.com/sa4/dancer_profile.php?ddrcode=' + ddrcode);
});

export function initialize() {
  document.getElementById('menuContainer').classList.remove('not-initialized');
  document.getElementById('menuBackground').classList.remove('not-initialized');
  document.getElementById('menuContainer').classList.add('initialized');
  document.getElementById('menuBackground').classList.add('initialized');
}

export function openMenu() {
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

(function () {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    const saSettings = backgroundPage.getSaSettings();
    document.querySelector(`#exportScoreToSkillAttackDdrCode`).value = saSettings.ddrcode;
  });
})();
