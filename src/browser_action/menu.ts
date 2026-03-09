import { refreshList } from './filter.js';
import { Constants, type GameVersion } from '../static/common/Constants.js';
import { Logger } from '../static/common/Logger.js';
import { App } from '../static/common/App.js';

let app: App;
let chartList: any;

function fetchParsedMusicList() {
  app.fetchParsedMusicList();
}
document.getElementById('fetchParsedMusicListButton')!.addEventListener('click', fetchParsedMusicList);

function fetchMissingMusicInfo(gameVersion: GameVersion) {
  app.fetchMissingMusicInfo(gameVersion);
}
document.getElementById('fetchMissingMusicInfoButton')!.addEventListener('click', fetchMissingMusicInfo.bind(null, Constants.GAME_VERSION.A20PLUS as GameVersion));
document.getElementById('fetchMissingMusicInfoButtonA3')!.addEventListener('click', fetchMissingMusicInfo.bind(null, Constants.GAME_VERSION.A3 as GameVersion));
document.getElementById('fetchMissingMusicInfoButtonWorld')!.addEventListener('click', fetchMissingMusicInfo.bind(null, Constants.GAME_VERSION.WORLD as GameVersion));

function updateScoreList(gameVersion: GameVersion) {
  app
    .updateScoreList(gameVersion)
    .then((value) => {
      Logger.debug(`updateScoreList success : ${value}`);
    })
    .catch((error) => {
      Logger.debug(`updateScoreList failed : ${JSON.stringify(error.message)}`);
    });
}
document.getElementById('updateScoreListButton')!.addEventListener('click', updateScoreList.bind(null, Constants.GAME_VERSION.A20PLUS as GameVersion));
document.getElementById('updateScoreListButtonA3')!.addEventListener('click', updateScoreList.bind(null, Constants.GAME_VERSION.A3 as GameVersion));
document.getElementById('updateScoreListButtonWorld')!.addEventListener('click', updateScoreList.bind(null, Constants.GAME_VERSION.WORLD as GameVersion));

function updateScoreDetail(gameVersion: GameVersion) {
  const targetMusics: { musicId: string; difficulty: number }[] = [];
  chartList.charts.forEach(function (chartData: any) {
    targetMusics.push({
      musicId: chartData.musicId,
      difficulty: chartData.difficulty + (chartData.playMode === Constants.PLAY_MODE.DOUBLE ? Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE : 0),
    });
  });
  app.updateScoreDetail(targetMusics, gameVersion);
}
document.getElementById('updateScoreDetailButton')!.addEventListener('click', updateScoreDetail.bind(null, Constants.GAME_VERSION.A20PLUS as GameVersion));
document.getElementById('updateScoreDetailButtonA3')!.addEventListener('click', updateScoreDetail.bind(null, Constants.GAME_VERSION.A3 as GameVersion));
document.getElementById('updateScoreDetailButtonWorld')!.addEventListener('click', updateScoreDetail.bind(null, Constants.GAME_VERSION.WORLD as GameVersion));

document.getElementById('exportScoreToSkillAttackButton')!.addEventListener('click', () => {
  app
    .exportScoreToSkillAttack(
      (document.getElementById('exportScoreToSkillAttackDdrCode') as HTMLInputElement).value,
      (document.getElementById('exportScoreToSkillAttackPassword') as HTMLInputElement).value,
    )
    .then((value) => {
      Logger.debug(`exportScoreToSkillAttack success : ${value}`);
    })
    .catch((error) => {
      Logger.debug(`exportScoreToSkillAttack failed : ${JSON.stringify(error.message)}`);
    });
});
document.getElementById('openSkillAttackPageButton')!.addEventListener('click', () => {
  window.open('http://skillattack.com/sa4/');
});
document.getElementById('openSkillAttackUserPageButton')!.addEventListener('click', () => {
  const ddrcode = (document.getElementById('exportScoreToSkillAttackDdrCode') as HTMLInputElement).value;
  window.open('http://skillattack.com/sa4/dancer_profile.php?ddrcode=' + ddrcode);
});

export function initialize(a: App, cl: any) {
  app = a;
  chartList = cl;
  document.getElementById('menuContainer')!.classList.remove('not-initialized');
  document.getElementById('menuBackground')!.classList.remove('not-initialized');
  document.getElementById('menuContainer')!.classList.add('initialized');
  document.getElementById('menuBackground')!.classList.add('initialized');

  const saSettings = app.getSaSettings();
  (document.querySelector(`#exportScoreToSkillAttackDdrCode`) as HTMLInputElement).value = saSettings!['ddrcode'] as string;

  const options = app.getOptions();
  if (!options!['enableA20PlusSiteAccess']) {
    document.getElementById('fetchMissingMusicInfoButton')!.style.display = 'none';
    document.getElementById('updateScoreListButton')!.style.display = 'none';
    document.getElementById('updateScoreDetailButton')!.style.display = 'none';
  }
}

export function openMenu() {
  document.getElementById('menuContainer')!.scrollTo(0, 0);
  document.getElementById('menuContainer')!.classList.add('active');
  document.getElementById('menuBackground')!.classList.add('active');
}
function closeMenu() {
  document.getElementById('menuContainer')!.classList.remove('active');
  document.getElementById('menuBackground')!.classList.remove('active');
  setTimeout(refreshList, 300);
}
document.getElementById('openMenuButton')!.addEventListener('click', openMenu);
document.getElementById('closeMenuButton')!.addEventListener('click', closeMenu);

function openDiff() {
  document.dispatchEvent(new CustomEvent('open-diff'));
}
document.getElementById('openScoreDiffButton')!.addEventListener('click', openDiff);
