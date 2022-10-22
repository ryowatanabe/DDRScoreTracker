import { refreshList } from './filter.js';
import { Constants } from '../static/common/Constants.js';
import { Logger } from '../static/common/Logger.js';

let app;

function fetchParsedMusicList() {
  app.fetchParsedMusicList();
}
document.getElementById('fetchParsedMusicListButton').addEventListener('click', fetchParsedMusicList);

function fetchMissingMusicInfo(gameVersion) {
  app.fetchMissingMusicInfo(gameVersion);
}
document.getElementById('fetchMissingMusicInfoButton').addEventListener('click', fetchMissingMusicInfo.bind(null, Constants.GAME_VERSION.A3));

function updateScoreList(gameVersion) {
  app
    .updateScoreList(gameVersion)
    .then((value) => {
      Logger.debug(`updateScoreList success : ${value}`);
    })
    .catch((error) => {
      Logger.debug(`updateScoreList failed : ${JSON.stringify(error.message)}`);
    });
}
document.getElementById('updateScoreListButton').addEventListener('click', updateScoreList.bind(null, Constants.GAME_VERSION.A3));

function updateScoreDetail(gameVersion) {
  const targetMusics = [];
  window.getCharts().forEach(function (chartData) {
    targetMusics.push({
      musicId: chartData.musicId,
      difficulty: chartData.difficulty + (chartData.playMode == Constants.PLAY_MODE.DOUBLE ? Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE : 0),
    });
  });
  app.updateScoreDetail(targetMusics, gameVersion);
}
document.getElementById('updateScoreDetailButton').addEventListener('click', updateScoreDetail.bind(null, Constants.GAME_VERSION.A3));

document.getElementById('exportScoreToSkillAttackButton').addEventListener('click', () => {
  app
    .exportScoreToSkillAttack(document.getElementById('exportScoreToSkillAttackDdrCode').value, document.getElementById('exportScoreToSkillAttackPassword').value)
    .then((value) => {
      Logger.debug(`exportScoreToSkillAttack success : ${value}`);
    })
    .catch((error) => {
      Logger.debug(`exportScoreToSkillAttack failed : ${JSON.stringify(error.message)}`);
    });
});
document.getElementById('openSkillAttackPageButton').addEventListener('click', () => {
  window.open('http://skillattack.com/sa4/');
});
document.getElementById('openSkillAttackUserPageButton').addEventListener('click', () => {
  const ddrcode = document.getElementById('exportScoreToSkillAttackDdrCode').value;
  window.open('http://skillattack.com/sa4/dancer_profile.php?ddrcode=' + ddrcode);
});

export function initialize(a) {
  app = a;
  document.getElementById('menuContainer').classList.remove('not-initialized');
  document.getElementById('menuBackground').classList.remove('not-initialized');
  document.getElementById('menuContainer').classList.add('initialized');
  document.getElementById('menuBackground').classList.add('initialized');

  const saSettings = app.getSaSettings();
  document.querySelector(`#exportScoreToSkillAttackDdrCode`).value = saSettings.ddrcode;
}

export function openMenu() {
  document.getElementById('menuContainer').scrollTo(0, 0);
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

function openDiff() {
  window.openDiff();
}
document.getElementById('openScoreDiffButton').addEventListener('click', openDiff);
