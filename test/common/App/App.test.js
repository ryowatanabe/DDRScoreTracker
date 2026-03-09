import { App } from '../../../src/static/common/App.js';
import { STATE, CHANGE_STATE_MESSAGE_TYPE } from '../../../src/static/common/AppState.js';

// ---- Mocks ----

jest.mock('../../../src/static/common/Logger.js', () => ({
  Logger: { info: jest.fn(), debug: jest.fn(), error: jest.fn(), warn: jest.fn(), addListener: jest.fn() },
}));

jest.mock('../../../src/static/common/I18n.js', () => ({
  I18n: { getMessage: jest.fn().mockReturnValue('') },
}));

jest.mock('../../../src/static/common/Parser.js', () => ({
  Parser: { STATUS: { UNKNOWN_ERROR: 'UNKNOWN_ERROR', LOGIN_REQUIRED: 'LOGIN_REQUIRED' } },
}));

jest.mock('../../../src/static/common/Storage.js', () => ({ Storage: jest.fn() }));
jest.mock('../../../src/static/common/BrowserController.js', () => ({ BrowserController: jest.fn() }));
jest.mock('../../../src/static/common/DataFetchController.js', () => ({ DataFetchController: jest.fn() }));
jest.mock('../../../src/static/common/SkillAttackExporter.js', () => ({ SkillAttackExporter: jest.fn() }));

import { Storage } from '../../../src/static/common/Storage.js';
import { BrowserController } from '../../../src/static/common/BrowserController.js';
import { DataFetchController } from '../../../src/static/common/DataFetchController.js';
import { SkillAttackExporter } from '../../../src/static/common/SkillAttackExporter.js';
import { Logger } from '../../../src/static/common/Logger.js';
import { Constants } from '../../../src/static/common/Constants.js';

// ---- Helpers ----

function makeDefaultStorageData(overrides = {}) {
  return {
    musics: {},
    scores: {},
    savedConditions: [],
    conditions: { summary: { clearType: true }, filter: [], sort: [] },
    saSettings: { ddrcode: '' },
    options: { musicListReloadInterval: 3600000, openTabAsActive: false },
    internalStatus: { musicListUpdatedAt: 0 },
    differences: [],
    ...overrides,
  };
}

let storageMock;
let browserControllerMock;
let dataFetchControllerMock;

function makeStorageMock(dataOverrides = {}) {
  return {
    ready: Promise.resolve(makeDefaultStorageData(dataOverrides)),
    saveStorage: jest.fn().mockResolvedValue(undefined),
    resetStorage: jest.fn().mockResolvedValue(undefined),
    bytesInUse: 1024,
  };
}

function makeBrowserControllerMock() {
  return {
    delay: 0,
    createTab: jest.fn().mockResolvedValue('tab created'),
    updateTab: jest.fn().mockResolvedValue('tab updated'),
    closeTab: jest.fn().mockResolvedValue('tab closed'),
    sendMessageToTab: jest.fn(),
    reset: jest.fn(),
  };
}

function makeDataFetchControllerMock() {
  return {
    differences: [],
    targetGameVersion: null,
    targetPlayMode: null,
    targetMusicType: null,
    targetMusics: [],
    targetMusic: null,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  global.chrome = { windows: { WINDOW_ID_CURRENT: -2 } };
  storageMock = makeStorageMock();
  browserControllerMock = makeBrowserControllerMock();
  dataFetchControllerMock = makeDataFetchControllerMock();
  Storage.mockImplementation(() => storageMock);
  BrowserController.mockImplementation(() => browserControllerMock);
  DataFetchController.mockImplementation(() => dataFetchControllerMock);
});

async function makeInitializedApp() {
  const app = new App();
  await app.init();
  return app;
}

// ================================================================
// Phase 1: Getter / Setter / State Management
// ================================================================

// ---- constructor ----

describe('App constructor', () => {
  test('初期状態は STATE.INITIALIZE', () => {
    const app = new App();
    expect(app.getState()).toBe(STATE.INITIALIZE);
  });

  test('chartList は空のリスト（chart 0 件）', () => {
    const app = new App();
    expect(app.getChartCount()).toBe(0);
  });

  test('messageListeners は空配列', () => {
    const app = new App();
    expect(app.messageListeners).toEqual([]);
  });
});

// ---- getState ----

describe('App.getState', () => {
  test('現在の state を返す', () => {
    const app = new App();
    expect(app.getState()).toBe(STATE.INITIALIZE);
  });
});

// ---- changeState ----

describe('App.changeState', () => {
  test('state が指定した値に変更される', () => {
    const app = new App();
    app.changeState(STATE.IDLE);
    expect(app.getState()).toBe(STATE.IDLE);
  });

  test('CHANGE_STATE_MESSAGE_TYPE メッセージがリスナーに通知される', () => {
    const app = new App();
    const listener = jest.fn();
    app.messageListeners.push(listener);
    app.changeState(STATE.IDLE);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: CHANGE_STATE_MESSAGE_TYPE }));
  });

  test('通知メッセージに oldState と新しい state が含まれる', () => {
    const app = new App();
    const listener = jest.fn();
    app.messageListeners.push(listener);
    app.changeState(STATE.IDLE);
    expect(listener).toHaveBeenCalledWith({ type: CHANGE_STATE_MESSAGE_TYPE, oldState: STATE.INITIALIZE, state: STATE.IDLE });
  });

  test('複数のリスナーがすべて通知される', () => {
    const app = new App();
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    app.messageListeners.push(listener1);
    app.messageListeners.push(listener2);
    app.changeState(STATE.IDLE);
    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });
});

// ---- addMessageListener ----

describe('App.addMessageListener', () => {
  test('リスナーが messageListeners に追加される', () => {
    const app = new App();
    const listener = jest.fn();
    app.addMessageListener(listener);
    expect(app.messageListeners).toContain(listener);
  });

  test('Logger.addListener が呼ばれる', () => {
    const app = new App();
    const listener = jest.fn();
    app.addMessageListener(listener);
    expect(Logger.addListener).toHaveBeenCalledWith(listener);
  });
});

// ---- getDifferences / getBytesInUse ----

describe('App.getDifferences', () => {
  test('dataFetchController.differences を返す', () => {
    dataFetchControllerMock.differences = ['diff1', 'diff2'];
    const app = new App();
    expect(app.getDifferences()).toBe(dataFetchControllerMock.differences);
  });
});

describe('App.getBytesInUse', () => {
  test('storage.bytesInUse を返す', () => {
    const app = new App();
    expect(app.getBytesInUse()).toBe(1024);
  });
});

// ---- getChartList / getChartCount ----

describe('App.getChartList / getChartCount', () => {
  test('getChartList は null でない値を返す', () => {
    const app = new App();
    expect(app.getChartList()).not.toBeNull();
  });

  test('getChartCount は chart の件数を返す', () => {
    const app = new App();
    expect(app.getChartCount()).toBe(0);
  });
});

// ---- Storage data getters (after init) ----

describe('App storage data getters (init 後)', () => {
  test('getMusicList は MusicList インスタンスを返す', async () => {
    const app = await makeInitializedApp();
    const musicList = app.getMusicList();
    expect(musicList).not.toBeNull();
    expect(Array.isArray(musicList.musicIds)).toBe(true);
  });

  test('getScoreList は ScoreList インスタンスを返す', async () => {
    const app = await makeInitializedApp();
    expect(app.getScoreList()).not.toBeNull();
  });

  test('getSavedConditions は savedConditions を返す', async () => {
    const app = await makeInitializedApp();
    expect(app.getSavedConditions()).toEqual([]);
  });

  test('getConditions は conditions を返す', async () => {
    const app = await makeInitializedApp();
    expect(app.getConditions()).toEqual({ summary: { clearType: true }, filter: [], sort: [] });
  });

  test('getSaSettings は saSettings を返す', async () => {
    const app = await makeInitializedApp();
    expect(app.getSaSettings()).toEqual({ ddrcode: '' });
  });

  test('getOptions は options を返す', async () => {
    const app = await makeInitializedApp();
    expect(app.getOptions()).toEqual(expect.objectContaining({ musicListReloadInterval: 3600000 }));
  });

  test('getInternalStatus は internalStatus を返す', async () => {
    const app = await makeInitializedApp();
    expect(app.getInternalStatus()).toEqual({ musicListUpdatedAt: 0 });
  });
});

// ---- saveConditions ----

describe('App.saveConditions', () => {
  test('conditions が新しい値で更新される', async () => {
    const app = await makeInitializedApp();
    const summary = { clearType: false };
    const filter = [{ type: 'difficulty' }];
    const sort = [{ key: 'score' }];
    app.saveConditions(summary, filter, sort);
    expect(app.getConditions()).toEqual({ summary, filter, sort });
  });

  test('saveStorage が呼ばれる', async () => {
    const app = await makeInitializedApp();
    app.saveConditions({}, [], []);
    expect(storageMock.saveStorage).toHaveBeenCalled();
  });
});

// ---- saveSaSettings ----

describe('App.saveSaSettings', () => {
  test('saSettings.ddrcode が更新される', async () => {
    const app = await makeInitializedApp();
    app.saveSaSettings('1234567890');
    expect(app.getSaSettings().ddrcode).toBe('1234567890');
  });

  test('saveStorage が呼ばれる', async () => {
    const app = await makeInitializedApp();
    app.saveSaSettings('1234567890');
    expect(storageMock.saveStorage).toHaveBeenCalled();
  });
});

// ---- saveOptions ----

describe('App.saveOptions', () => {
  test('options が新しいオブジェクトで置き換えられる', async () => {
    const app = await makeInitializedApp();
    const newOptions = { musicListReloadInterval: 7200000, openTabAsActive: true };
    app.saveOptions(newOptions);
    expect(app.getOptions()).toBe(newOptions);
  });

  test('saveStorage が呼ばれる', async () => {
    const app = await makeInitializedApp();
    app.saveOptions({});
    expect(storageMock.saveStorage).toHaveBeenCalled();
  });
});

// ---- saveSavedCondition ----

describe('App.saveSavedCondition', () => {
  test('新しい条件が savedConditions に追加される', async () => {
    const app = await makeInitializedApp();
    const condition = { name: 'test', summary: {}, filter: [], sort: [] };
    const result = app.saveSavedCondition(condition);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(condition);
  });

  test('同名の条件が存在する場合は更新される（追加されない）', async () => {
    const app = await makeInitializedApp();
    app.saveSavedCondition({ name: 'test', summary: { clearType: true }, filter: [], sort: [] });
    app.saveSavedCondition({ name: 'test', summary: { clearType: false }, filter: [1], sort: [2] });
    const saved = app.getSavedConditions();
    expect(saved).toHaveLength(1);
    expect(saved[0].summary).toEqual({ clearType: false });
    expect(saved[0].filter).toEqual([1]);
  });

  test('saveStorage が呼ばれる', async () => {
    const app = await makeInitializedApp();
    app.saveSavedCondition({ name: 'test', summary: {}, filter: [], sort: [] });
    expect(storageMock.saveStorage).toHaveBeenCalled();
  });
});

// ---- saveSavedConditions ----

describe('App.saveSavedConditions', () => {
  test('savedConditions が新しい配列で置き換えられる', async () => {
    const app = await makeInitializedApp();
    const newConditions = [{ name: 'a' }, { name: 'b' }];
    const result = app.saveSavedConditions(newConditions);
    expect(result).toBe(newConditions);
    expect(app.getSavedConditions()).toBe(newConditions);
  });

  test('saveStorage が呼ばれる', async () => {
    const app = await makeInitializedApp();
    app.saveSavedConditions([]);
    expect(storageMock.saveStorage).toHaveBeenCalled();
  });
});

// ---- echo ----

describe('App.echo', () => {
  test('Logger.debug が呼ばれる', () => {
    const app = new App();
    app.echo('test message');
    expect(Logger.debug).toHaveBeenCalledWith('test message');
  });
});

// ================================================================
// Phase 2: Logic
// ================================================================

// ---- init ----

describe('App.init', () => {
  test('init 完了後、state が IDLE になる', async () => {
    const app = new App();
    await app.init();
    expect(app.getState()).toBe(STATE.IDLE);
  });

  test('musicList が null でなくなる', async () => {
    const app = new App();
    await app.init();
    expect(app.getMusicList()).not.toBeNull();
  });

  test('scoreList が null でなくなる', async () => {
    const app = new App();
    await app.init();
    expect(app.getScoreList()).not.toBeNull();
  });

  test('savedConditions がストレージデータから設定される', async () => {
    storageMock.ready = Promise.resolve(makeDefaultStorageData({ savedConditions: [{ name: 'saved' }] }));
    const app = new App();
    await app.init();
    expect(app.getSavedConditions()).toEqual([{ name: 'saved' }]);
  });

  test('internalStatus がストレージデータから設定される', async () => {
    storageMock.ready = Promise.resolve(makeDefaultStorageData({ internalStatus: { musicListUpdatedAt: 9999 } }));
    const app = new App();
    await app.init();
    expect(app.getInternalStatus()).toEqual({ musicListUpdatedAt: 9999 });
  });

  test('init 完了後、chartList が更新される（updateCharts が呼ばれる）', async () => {
    const app = new App();
    await app.init();
    // chartCount は 0（空データ）でも updateCharts が完走して例外が出ないことを確認
    expect(app.getChartCount()).toBe(0);
  });
});

// ---- saveStorage ----

describe('App.saveStorage', () => {
  test('storage.saveStorage が呼ばれる', async () => {
    const app = await makeInitializedApp();
    await app.saveStorage();
    expect(storageMock.saveStorage).toHaveBeenCalled();
  });

  test('storage.saveStorage に正しいキーが渡される', async () => {
    const app = await makeInitializedApp();
    await app.saveStorage();
    expect(storageMock.saveStorage).toHaveBeenCalledWith(
      expect.objectContaining({
        scores: expect.any(Object),
        musics: expect.any(Object),
        savedConditions: expect.any(Array),
        conditions: expect.any(Object),
        saSettings: expect.any(Object),
        options: expect.any(Object),
        internalStatus: expect.any(Object),
        differences: expect.any(Array),
      })
    );
  });
});

// ---- resetStorage ----

describe('App.resetStorage', () => {
  test('storage.resetStorage が呼ばれる', async () => {
    const app = await makeInitializedApp();
    await app.resetStorage();
    expect(storageMock.resetStorage).toHaveBeenCalled();
  });
});

// ---- abortAction ----

describe('App.abortAction', () => {
  test('UPDATE_MUSIC_LIST 状態では ABORTING に遷移する', async () => {
    const app = await makeInitializedApp();
    app.changeState(STATE.UPDATE_MUSIC_LIST);
    app.abortAction();
    expect(app.getState()).toBe(STATE.ABORTING);
  });

  test('UPDATE_SCORE_LIST 状態では ABORTING に遷移する', async () => {
    const app = await makeInitializedApp();
    app.changeState(STATE.UPDATE_SCORE_LIST);
    app.abortAction();
    expect(app.getState()).toBe(STATE.ABORTING);
  });

  test('UPDATE_MUSIC_DETAIL 状態では ABORTING に遷移する', async () => {
    const app = await makeInitializedApp();
    app.changeState(STATE.UPDATE_MUSIC_DETAIL);
    app.abortAction();
    expect(app.getState()).toBe(STATE.ABORTING);
  });

  test('UPDATE_SCORE_DETAIL 状態では ABORTING に遷移する', async () => {
    const app = await makeInitializedApp();
    app.changeState(STATE.UPDATE_SCORE_DETAIL);
    app.abortAction();
    expect(app.getState()).toBe(STATE.ABORTING);
  });

  test('IDLE 状態では state が変化しない', async () => {
    const app = await makeInitializedApp();
    expect(app.getState()).toBe(STATE.IDLE);
    app.abortAction();
    expect(app.getState()).toBe(STATE.IDLE);
  });

  test('setTimeout 後に IDLE に遷移する', async () => {
    const app = await makeInitializedApp();
    jest.useFakeTimers();
    app.changeState(STATE.UPDATE_MUSIC_LIST);
    app.abortAction();
    expect(app.getState()).toBe(STATE.ABORTING);
    await jest.runAllTimersAsync();
    jest.useRealTimers();
    expect(app.getState()).toBe(STATE.IDLE);
  });
});

// ---- updateCharts ----

describe('App.updateCharts', () => {
  test('musicList と scoreList が空のとき chart は 0 件', async () => {
    const app = await makeInitializedApp();
    expect(app.getChartCount()).toBe(0);
  });

  test('musicList の曲に SINGLE EXPERT の難易度がある場合 1 件の chart が生成される', async () => {
    const app = await makeInitializedApp();
    // difficultyValue: SINGLE(0) + EXPERT(3) = 3
    app.musicList = {
      musicIds: ['001'],
      getMusicDataById: jest.fn().mockReturnValue({
        hasDifficulty: (diffValue) => diffValue === 3,
        type: 0,
        title: 'Test Music',
      }),
    };
    app.scoreList = {
      musicIds: [],
      hasMusic: jest.fn().mockReturnValue(false),
    };
    app.updateCharts();
    expect(app.getChartCount()).toBe(1);
  });

  test('scoreList のみに存在する曲の chart も生成される', async () => {
    const app = await makeInitializedApp();
    const mockScoreData = {
      hasDifficulty: (diffValue) => diffValue === '3', // SINGLE EXPERT
      getScoreDetailByDifficulty: jest.fn().mockReturnValue({}),
      musicType: 0,
    };
    app.musicList = {
      musicIds: [],
      hasMusic: jest.fn().mockReturnValue(false),
      getMusicDataById: jest.fn(),
    };
    app.scoreList = {
      musicIds: ['002'],
      hasMusic: jest.fn().mockReturnValue(true),
      getScoreDataByMusicId: jest.fn().mockReturnValue(mockScoreData),
    };
    app.updateCharts();
    expect(app.getChartCount()).toBe(1);
  });

  test('updateCharts 再呼び出しで chartList がリセットされる', async () => {
    const app = await makeInitializedApp();
    app.musicList = {
      musicIds: ['001'],
      getMusicDataById: jest.fn().mockReturnValue({
        hasDifficulty: (diffValue) => diffValue === 3,
        type: 0,
        title: 'Test',
      }),
    };
    app.scoreList = {
      musicIds: [],
      hasMusic: jest.fn().mockReturnValue(false),
    };
    app.updateCharts();
    expect(app.getChartCount()).toBe(1);

    // 2回目: 空の musicList で呼び出すとリセットされる
    app.musicList = { musicIds: [], getMusicDataById: jest.fn() };
    app.scoreList = { musicIds: [], hasMusic: jest.fn().mockReturnValue(false) };
    app.updateCharts();
    expect(app.getChartCount()).toBe(0);
  });

  test('musicList に曲があってもその難易度がなければ chart は生成されない', async () => {
    const app = await makeInitializedApp();
    app.musicList = {
      musicIds: ['001'],
      getMusicDataById: jest.fn().mockReturnValue({
        hasDifficulty: jest.fn().mockReturnValue(false),
        type: 0,
        title: 'Test',
      }),
    };
    app.scoreList = {
      musicIds: [],
      hasMusic: jest.fn().mockReturnValue(false),
    };
    app.updateCharts();
    expect(app.getChartCount()).toBe(0);
  });
});

// ---- restoreMusicList ----

describe('App.restoreMusicList', () => {
  test('各行に対して musicList.applyEncodedString が呼ばれる', async () => {
    const app = await makeInitializedApp();
    const spy = jest.spyOn(app.musicList, 'applyEncodedString');
    app.restoreMusicList('line1\nline2\nline3');
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenCalledWith('line1');
    expect(spy).toHaveBeenCalledWith('line2');
    expect(spy).toHaveBeenCalledWith('line3');
  });

  test('saveStorage が呼ばれる', async () => {
    const app = await makeInitializedApp();
    app.restoreMusicList('');
    expect(storageMock.saveStorage).toHaveBeenCalled();
  });

  test('chartList が更新される（updateCharts が呼ばれる）', async () => {
    const app = await makeInitializedApp();
    const spy = jest.spyOn(app, 'updateCharts');
    app.restoreMusicList('');
    expect(spy).toHaveBeenCalled();
  });
});

// ---- restoreScoreList ----

describe('App.restoreScoreList', () => {
  test('scoreList が新しい ScoreList インスタンスで置き換えられる', async () => {
    const app = await makeInitializedApp();
    const oldScoreList = app.getScoreList();
    app.restoreScoreList({});
    expect(app.getScoreList()).not.toBe(oldScoreList);
  });

  test('saveStorage が呼ばれる', async () => {
    const app = await makeInitializedApp();
    app.restoreScoreList({});
    expect(storageMock.saveStorage).toHaveBeenCalled();
  });

  test('chartList が更新される（updateCharts が呼ばれる）', async () => {
    const app = await makeInitializedApp();
    const spy = jest.spyOn(app, 'updateCharts');
    app.restoreScoreList({});
    expect(spy).toHaveBeenCalled();
  });
});

// ================================================================
// Phase 3: Async Flow
// ================================================================

// ---- updateMusicList ----

describe('App.updateMusicList', () => {
  test('IDLE 状態では UPDATE_MUSIC_LIST に遷移する', async () => {
    const app = await makeInitializedApp();
    await app.updateMusicList();
    expect(app.getState()).toBe(STATE.UPDATE_MUSIC_LIST);
  });

  test('browserController.createTab が MUSIC_LIST_URL で呼ばれる', async () => {
    const app = await makeInitializedApp();
    await app.updateMusicList();
    expect(browserControllerMock.createTab).toHaveBeenCalledWith(Constants.MUSIC_LIST_URL, expect.anything());
  });

  test('IDLE 以外の状態では例外をスローする', async () => {
    const app = await makeInitializedApp();
    app.changeState(STATE.UPDATE_SCORE_LIST);
    await expect(app.updateMusicList()).rejects.toThrow();
  });

  test('createTab が失敗した場合、state が IDLE に戻り例外が再スローされる', async () => {
    browserControllerMock.createTab.mockRejectedValue(new Error('tab error'));
    const app = await makeInitializedApp();
    await expect(app.updateMusicList()).rejects.toThrow('tab error');
    expect(app.getState()).toBe(STATE.IDLE);
    expect(browserControllerMock.reset).toHaveBeenCalled();
  });
});

// ---- updateScoreList ----

describe('App.updateScoreList', () => {
  test('IDLE 状態では UPDATE_SCORE_LIST に遷移する', async () => {
    const app = await makeInitializedApp();
    await app.updateScoreList(Constants.GAME_VERSION.WORLD);
    expect(app.getState()).toBe(STATE.UPDATE_SCORE_LIST);
  });

  test('browserController.createTab が呼ばれる', async () => {
    const app = await makeInitializedApp();
    await app.updateScoreList(Constants.GAME_VERSION.WORLD);
    expect(browserControllerMock.createTab).toHaveBeenCalled();
  });

  test('IDLE 以外の状態では例外をスローする', async () => {
    const app = await makeInitializedApp();
    app.changeState(STATE.UPDATE_MUSIC_LIST);
    await expect(app.updateScoreList(Constants.GAME_VERSION.WORLD)).rejects.toThrow();
  });

  test('createTab が失敗した場合、state が IDLE に戻り例外が再スローされる', async () => {
    browserControllerMock.createTab.mockRejectedValue(new Error('tab error'));
    const app = await makeInitializedApp();
    await expect(app.updateScoreList(Constants.GAME_VERSION.WORLD)).rejects.toThrow('tab error');
    expect(app.getState()).toBe(STATE.IDLE);
    expect(browserControllerMock.reset).toHaveBeenCalled();
  });

  test('differences がリセットされる', async () => {
    dataFetchControllerMock.differences = [{ dummy: true }];
    const app = await makeInitializedApp();
    await app.updateScoreList(Constants.GAME_VERSION.WORLD);
    expect(dataFetchControllerMock.differences).toEqual([]);
  });
});

// ---- updateScoreDetail ----

describe('App.updateScoreDetail', () => {
  test('targets が空の場合、false を返す', async () => {
    const app = await makeInitializedApp();
    const result = await app.updateScoreDetail([], Constants.GAME_VERSION.A20PLUS);
    expect(result).toBe(false);
  });

  test('有効な targets がある場合、UPDATE_SCORE_DETAIL に遷移する', async () => {
    const app = await makeInitializedApp();
    app.musicList = {
      musicIds: [],
      hasMusic: jest.fn().mockReturnValue(false),
      getMusicDataById: jest.fn(),
    };
    app.scoreList = {
      musicIds: [],
      hasMusic: jest.fn().mockReturnValue(false),
      getScoreDataByMusicId: jest.fn(),
    };
    const targets = [{ musicId: '001', difficulty: 3 }];
    await app.updateScoreDetail(targets, Constants.GAME_VERSION.A20PLUS);
    expect(app.getState()).toBe(STATE.UPDATE_SCORE_DETAIL);
  });

  test('有効な targets がある場合、browserController.createTab が呼ばれる', async () => {
    const app = await makeInitializedApp();
    app.musicList = {
      musicIds: [],
      hasMusic: jest.fn().mockReturnValue(false),
      getMusicDataById: jest.fn(),
    };
    app.scoreList = {
      musicIds: [],
      hasMusic: jest.fn().mockReturnValue(false),
      getScoreDataByMusicId: jest.fn(),
    };
    const targets = [{ musicId: '001', difficulty: 3 }];
    await app.updateScoreDetail(targets, Constants.GAME_VERSION.A20PLUS);
    expect(browserControllerMock.createTab).toHaveBeenCalled();
  });

  test('IDLE 以外の状態では例外をスローする', async () => {
    const app = await makeInitializedApp();
    app.changeState(STATE.UPDATE_MUSIC_LIST);
    await expect(app.updateScoreDetail([{ musicId: '001', difficulty: 3 }], Constants.GAME_VERSION.A20PLUS)).rejects.toThrow();
  });

  test('createTab が失敗した場合、state が IDLE に戻り例外が再スローされる', async () => {
    browserControllerMock.createTab.mockRejectedValue(new Error('tab error'));
    const app = await makeInitializedApp();
    app.musicList = {
      musicIds: [],
      hasMusic: jest.fn().mockReturnValue(false),
      getMusicDataById: jest.fn(),
    };
    app.scoreList = {
      musicIds: [],
      hasMusic: jest.fn().mockReturnValue(false),
      getScoreDataByMusicId: jest.fn(),
    };
    const targets = [{ musicId: '001', difficulty: 3 }];
    await expect(app.updateScoreDetail(targets, Constants.GAME_VERSION.A20PLUS)).rejects.toThrow('tab error');
    expect(app.getState()).toBe(STATE.IDLE);
    expect(browserControllerMock.reset).toHaveBeenCalled();
  });
});

// ---- fetchParsedMusicList ----

describe('App.fetchParsedMusicList', () => {
  test('fetch が成功した場合、restoreMusicList が呼ばれる', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, text: jest.fn().mockResolvedValue('line1\nline2') });
    const app = await makeInitializedApp();
    const spy = jest.spyOn(app, 'restoreMusicList');
    await app.fetchParsedMusicList();
    expect(spy).toHaveBeenCalledWith('line1\nline2');
  });

  test('fetch 成功後、internalStatus.musicListUpdatedAt が更新される', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, text: jest.fn().mockResolvedValue('') });
    const app = await makeInitializedApp();
    const before = app.getInternalStatus().musicListUpdatedAt;
    await app.fetchParsedMusicList();
    expect(app.getInternalStatus().musicListUpdatedAt).toBeGreaterThan(before);
  });

  test('fetch 成功後、saveStorage が呼ばれる', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, text: jest.fn().mockResolvedValue('') });
    const app = await makeInitializedApp();
    await app.fetchParsedMusicList();
    expect(storageMock.saveStorage).toHaveBeenCalled();
  });

  test('HTTP エラーの場合、例外をスローする', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    const app = await makeInitializedApp();
    await expect(app.fetchParsedMusicList()).rejects.toThrow('HTTP status: 500');
  });

  test('ネットワークエラーの場合、例外をスローする', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network error'));
    const app = await makeInitializedApp();
    await expect(app.fetchParsedMusicList()).rejects.toThrow('network error');
  });
});

// ---- exportScoreToSkillAttack ----

describe('App.exportScoreToSkillAttack', () => {
  let skillAttackExporterMock;

  beforeEach(() => {
    skillAttackExporterMock = { export: jest.fn().mockResolvedValue(undefined) };
    SkillAttackExporter.mockImplementation(() => skillAttackExporterMock);
  });

  test('ddrcode が空文字の場合、SkillAttackExporter は生成されない', async () => {
    const app = await makeInitializedApp();
    await app.exportScoreToSkillAttack('', 'password');
    expect(SkillAttackExporter).not.toHaveBeenCalled();
  });

  test('ddrcode がスペースのみの場合、SkillAttackExporter は生成されない', async () => {
    const app = await makeInitializedApp();
    await app.exportScoreToSkillAttack('   ', 'password');
    expect(SkillAttackExporter).not.toHaveBeenCalled();
  });

  test('有効な ddrcode の場合、SkillAttackExporter が生成される', async () => {
    const app = await makeInitializedApp();
    await app.exportScoreToSkillAttack('1234567890', 'password');
    expect(SkillAttackExporter).toHaveBeenCalled();
  });

  test('有効な ddrcode の場合、exporter.export が呼ばれる', async () => {
    const app = await makeInitializedApp();
    await app.exportScoreToSkillAttack('1234567890', 'password');
    expect(skillAttackExporterMock.export).toHaveBeenCalledWith('1234567890', 'password');
  });

  test('saveSaSettings が呼ばれて ddrcode が更新される', async () => {
    const app = await makeInitializedApp();
    await app.exportScoreToSkillAttack('1234567890', 'password');
    expect(app.getSaSettings().ddrcode).toBe('1234567890');
  });
});

// ---- handleError ----

describe('App.handleError', () => {
  test('UNKNOWN_ERROR の場合、state が IDLE に戻る', async () => {
    const app = await makeInitializedApp();
    app.changeState(STATE.UPDATE_MUSIC_LIST);
    await app.handleError({ status: 'UNKNOWN_ERROR' });
    expect(app.getState()).toBe(STATE.IDLE);
  });

  test('LOGIN_REQUIRED の場合、state が IDLE に戻る', async () => {
    const app = await makeInitializedApp();
    app.changeState(STATE.UPDATE_MUSIC_LIST);
    await app.handleError({ status: 'LOGIN_REQUIRED' });
    expect(app.getState()).toBe(STATE.IDLE);
  });

  test('エラー後、browserController.reset が呼ばれる', async () => {
    const app = await makeInitializedApp();
    await app.handleError({ status: 'UNKNOWN_ERROR' });
    expect(browserControllerMock.reset).toHaveBeenCalled();
  });

  test('不明な status の場合、例外をスローする', async () => {
    const app = await makeInitializedApp();
    await expect(app.handleError({ status: 'INVALID_STATUS' })).rejects.toThrow();
  });
});

// ---- navigateTo ----

describe('App.navigateTo', () => {
  test('browserController.updateTab が指定 URL で呼ばれる', async () => {
    const app = await makeInitializedApp();
    await app.navigateTo('https://example.com');
    expect(browserControllerMock.updateTab).toHaveBeenCalledWith('https://example.com');
  });

  test('updateTab が失敗した場合、state が IDLE に戻る', async () => {
    browserControllerMock.updateTab.mockRejectedValue(new Error('update error'));
    const app = await makeInitializedApp();
    app.changeState(STATE.UPDATE_MUSIC_LIST);
    await app.navigateTo('https://example.com');
    expect(app.getState()).toBe(STATE.IDLE);
    expect(browserControllerMock.reset).toHaveBeenCalled();
  });
});

// ---- finishAction ----

describe('App.finishAction', () => {
  test('browserController.closeTab が呼ばれる', async () => {
    const app = await makeInitializedApp();
    await app.finishAction();
    expect(browserControllerMock.closeTab).toHaveBeenCalled();
  });

  test('state が IDLE に遷移する', async () => {
    const app = await makeInitializedApp();
    app.changeState(STATE.UPDATE_MUSIC_LIST);
    await app.finishAction();
    expect(app.getState()).toBe(STATE.IDLE);
  });
});

// ---- onUpdateTab ----

describe('App.onUpdateTab', () => {
  test('UPDATE_MUSIC_LIST 状態では PARSE_MUSIC_LIST メッセージが送信される', async () => {
    const app = await makeInitializedApp();
    app.changeState(STATE.UPDATE_MUSIC_LIST);
    app.onUpdateTab();
    expect(browserControllerMock.sendMessageToTab).toHaveBeenCalledWith(expect.objectContaining({ type: 'PARSE_MUSIC_LIST' }), expect.any(Function));
  });

  test('UPDATE_MUSIC_DETAIL 状態では PARSE_MUSIC_DETAIL メッセージが送信される', async () => {
    const app = await makeInitializedApp();
    app.changeState(STATE.UPDATE_MUSIC_DETAIL);
    app.onUpdateTab();
    expect(browserControllerMock.sendMessageToTab).toHaveBeenCalledWith(expect.objectContaining({ type: 'PARSE_MUSIC_DETAIL' }), expect.any(Function));
  });

  test('UPDATE_SCORE_LIST 状態では PARSE_SCORE_LIST メッセージが送信される', async () => {
    const app = await makeInitializedApp();
    app.changeState(STATE.UPDATE_SCORE_LIST);
    app.onUpdateTab();
    expect(browserControllerMock.sendMessageToTab).toHaveBeenCalledWith(expect.objectContaining({ type: 'PARSE_SCORE_LIST' }), expect.any(Function));
  });

  test('UPDATE_SCORE_DETAIL 状態では PARSE_SCORE_DETAIL メッセージが送信される', async () => {
    const app = await makeInitializedApp();
    app.changeState(STATE.UPDATE_SCORE_DETAIL);
    app.onUpdateTab();
    expect(browserControllerMock.sendMessageToTab).toHaveBeenCalledWith(expect.objectContaining({ type: 'PARSE_SCORE_DETAIL' }), expect.any(Function));
  });

  test('IDLE 状態では sendMessageToTab は呼ばれない', async () => {
    const app = await makeInitializedApp();
    app.onUpdateTab();
    expect(browserControllerMock.sendMessageToTab).not.toHaveBeenCalled();
  });
});
