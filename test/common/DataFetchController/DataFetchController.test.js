import { DataFetchController } from '../../../src/static/common/DataFetchController.js';

jest.mock('../../../src/static/common/Logger.js', () => ({
  Logger: { info: jest.fn(), debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));
jest.mock('../../../src/static/common/I18n.js', () => ({
  I18n: { getMessage: jest.fn().mockReturnValue('') },
}));
jest.mock('../../../src/static/common/Parser.js', () => ({
  Parser: { STATUS: { SUCCESS: 'SUCCESS', UNKNOWN_ERROR: 'UNKNOWN_ERROR', LOGIN_REQUIRED: 'LOGIN_REQUIRED', RIVAL_DATA_NOT_PUBLIC: 'RIVAL_DATA_NOT_PUBLIC' } },
}));
jest.mock('../../../src/static/common/Constants.js', () => ({
  Constants: {
    hasNextMusicType: jest.fn().mockReturnValue(false),
    getNextMusicType: jest.fn(),
    SCORE_LIST_URL: {},
    PLAY_MODE_AND_DIFFICULTY_STRING: {},
    PLAY_MODE: { SINGLE: 0, DOUBLE: 1 },
    GAME_VERSION: { WORLD: 2 },
    MUSIC_TYPE: { NORMAL: 0 },
    RIVAL_MUSIC_DATA_URL: {
      2: {
        0: 'https://p.eagate.573.jp/game/ddr/ddrworld/rival/music_data_single.html?rival_id=[rivalId]',
        1: 'https://p.eagate.573.jp/game/ddr/ddrworld/rival/music_data_double.html?rival_id=[rivalId]',
      },
    },
  },
}));
jest.mock('../../../src/static/common/MusicData.js', () => {
  const MusicDataMock = jest.fn().mockImplementation(() => ({ encodedString: 'encoded' }));
  MusicDataMock.createFromStorage = jest.fn().mockReturnValue({ encodedString: 'encoded' });
  return { MusicData: MusicDataMock };
});

import { Parser } from '../../../src/static/common/Parser.js';
import { Constants } from '../../../src/static/common/Constants.js';
import { MusicData } from '../../../src/static/common/MusicData.js';

function makeController(overrides = {}) {
  const musicList = { applyObject: jest.fn(), applyMusicData: jest.fn().mockReturnValue(false), hasMusic: jest.fn().mockReturnValue(false), getMusicDataById: jest.fn() };
  const scoreList = { applyObject: jest.fn().mockReturnValue([]) };
  const callbacks = {
    getMusicList: jest.fn().mockReturnValue(musicList),
    getScoreList: jest.fn().mockReturnValue(scoreList),
    onSaveStorage: jest.fn(),
    onUpdateCharts: jest.fn(),
    onNavigateTo: jest.fn(),
    onFinishAction: jest.fn(),
    onHandleError: jest.fn(),
    ...overrides,
  };
  const controller = new DataFetchController(callbacks);
  return { controller, musicList, scoreList, callbacks };
}

describe('DataFetchController.handleMusicListResponse', () => {
  afterEach(() => jest.clearAllMocks());

  test('ステータスが SUCCESS でない場合は onHandleError を呼ぶ', async () => {
    const { controller, callbacks } = makeController();
    const res = { status: Parser.STATUS.LOGIN_REQUIRED };

    await controller.handleMusicListResponse(res);

    expect(callbacks.onHandleError).toHaveBeenCalledWith(res);
    expect(callbacks.onSaveStorage).not.toHaveBeenCalled();
  });

  test('成功時に曲リストを更新してストレージを保存する', async () => {
    const { controller, musicList, callbacks } = makeController();
    const res = { status: Parser.STATUS.SUCCESS, musics: [{ id: '1' }], hasNext: false };

    await controller.handleMusicListResponse(res);

    expect(musicList.applyObject).toHaveBeenCalledWith({ id: '1' });
    expect(callbacks.onSaveStorage).toHaveBeenCalled();
    expect(callbacks.onUpdateCharts).toHaveBeenCalled();
    expect(callbacks.onFinishAction).toHaveBeenCalled();
  });

  test('hasNext=true の場合は次のページに遷移する', async () => {
    const { controller, callbacks } = makeController();
    const res = { status: Parser.STATUS.SUCCESS, musics: [], hasNext: true, currentPage: 1, maxPage: 3, nextUrl: 'http://next' };

    await controller.handleMusicListResponse(res);

    expect(callbacks.onNavigateTo).toHaveBeenCalledWith('http://next');
    expect(callbacks.onFinishAction).not.toHaveBeenCalled();
  });
});

describe('DataFetchController.handleMusicDetailResponse', () => {
  afterEach(() => jest.clearAllMocks());

  test('UNKNOWN_ERROR 以外の失敗は onHandleError を呼ぶ', async () => {
    const { controller, callbacks } = makeController();
    const res = { status: Parser.STATUS.LOGIN_REQUIRED };

    await controller.handleMusicDetailResponse(res);

    expect(callbacks.onHandleError).toHaveBeenCalledWith(res);
  });

  test('UNKNOWN_ERROR の場合はエラーを無視して次へ進む', async () => {
    const { controller, callbacks } = makeController();
    controller.targetMusics = [];
    const res = { status: Parser.STATUS.UNKNOWN_ERROR };

    await controller.handleMusicDetailResponse(res);

    expect(callbacks.onHandleError).not.toHaveBeenCalled();
    expect(callbacks.onFinishAction).toHaveBeenCalled();
  });

  test('成功時に曲データを適用してストレージを保存する', async () => {
    const { controller, musicList, callbacks } = makeController();
    controller.targetMusic = { type: 1 };
    controller.targetMusics = [];
    const res = { status: Parser.STATUS.SUCCESS, musics: [{ id: '1' }] };

    await controller.handleMusicDetailResponse(res);

    expect(MusicData.createFromStorage).toHaveBeenCalled();
    expect(musicList.applyMusicData).toHaveBeenCalled();
    expect(callbacks.onSaveStorage).toHaveBeenCalled();
    expect(callbacks.onUpdateCharts).toHaveBeenCalled();
    expect(callbacks.onFinishAction).toHaveBeenCalled();
  });

  test('targetMusics が残っている場合は次の曲へ遷移する', async () => {
    const { controller, callbacks } = makeController();
    controller.targetMusic = { type: 1 };
    controller.targetMusics = [{ musicId: '2', url: 'http://music2' }];
    const res = { status: Parser.STATUS.SUCCESS, musics: [] };

    await controller.handleMusicDetailResponse(res);

    expect(callbacks.onNavigateTo).toHaveBeenCalledWith('http://music2');
    expect(callbacks.onFinishAction).not.toHaveBeenCalled();
  });
});

describe('DataFetchController.handleScoreListResponse', () => {
  afterEach(() => jest.clearAllMocks());

  test('ステータスが SUCCESS でない場合は onHandleError を呼ぶ', async () => {
    const { controller, callbacks } = makeController();
    const res = { status: Parser.STATUS.LOGIN_REQUIRED };

    await controller.handleScoreListResponse(res);

    expect(callbacks.onHandleError).toHaveBeenCalledWith(res);
  });

  test('成功時にスコアを蓄積してストレージを保存する', async () => {
    const { controller, scoreList, callbacks } = makeController();
    scoreList.applyObject.mockReturnValue([{ diff: true }]);
    controller.targetMusicType = 0;
    const res = { status: Parser.STATUS.SUCCESS, scores: [{ musicId: '1' }], hasNext: false };
    Constants.hasNextMusicType.mockReturnValue(false);

    await controller.handleScoreListResponse(res);

    expect(scoreList.applyObject).toHaveBeenCalledWith({ musicId: '1', musicType: 0 });
    expect(controller.differences).toEqual([{ diff: true }]);
    expect(callbacks.onSaveStorage).toHaveBeenCalled();
    expect(callbacks.onFinishAction).toHaveBeenCalled();
  });

  test('hasNext=true の場合は次のページに遷移する', async () => {
    const { controller, callbacks } = makeController();
    controller.targetMusicType = 0;
    controller.targetPlayMode = 0;
    const res = { status: Parser.STATUS.SUCCESS, scores: [], hasNext: true, currentPage: 0, maxPage: 2, nextUrl: 'http://next' };

    await controller.handleScoreListResponse(res);

    expect(callbacks.onNavigateTo).toHaveBeenCalledWith('http://next');
  });

  test('次のmusicTypeがある場合はそちらへ遷移する', async () => {
    const { controller, callbacks } = makeController();
    controller.targetGameVersion = 2;
    controller.targetPlayMode = 0;
    controller.targetMusicType = 0;
    Constants.hasNextMusicType.mockReturnValue(true);
    Constants.getNextMusicType.mockReturnValue({ playMode: 0, musicType: 1 });
    Constants.SCORE_LIST_URL[2] = { 0: { 1: 'http://nonstop' } };
    const res = { status: Parser.STATUS.SUCCESS, scores: [], hasNext: false };

    await controller.handleScoreListResponse(res);

    expect(controller.targetMusicType).toBe(1);
    expect(callbacks.onNavigateTo).toHaveBeenCalledWith('http://nonstop');
  });
});

describe('DataFetchController.handleScoreDetailResponse', () => {
  afterEach(() => jest.clearAllMocks());

  test('UNKNOWN_ERROR 以外の失敗は onHandleError を呼ぶ', async () => {
    const { controller, callbacks } = makeController();
    const res = { status: Parser.STATUS.LOGIN_REQUIRED };

    await controller.handleScoreDetailResponse(res);

    expect(callbacks.onHandleError).toHaveBeenCalledWith(res);
  });

  test('UNKNOWN_ERROR の場合はエラーを無視して次へ進む', async () => {
    const { controller, callbacks } = makeController();
    controller.targetMusics = [];
    const res = { status: Parser.STATUS.UNKNOWN_ERROR };

    await controller.handleScoreDetailResponse(res);

    expect(callbacks.onHandleError).not.toHaveBeenCalled();
    expect(callbacks.onFinishAction).toHaveBeenCalled();
  });

  test('成功時にスコアを適用してストレージを保存する', async () => {
    const { controller, scoreList, callbacks } = makeController();
    controller.targetMusics = [];
    const res = { status: Parser.STATUS.SUCCESS, scores: [{ musicId: '1', difficulty: 3 }] };

    await controller.handleScoreDetailResponse(res);

    expect(scoreList.applyObject).toHaveBeenCalledWith({ musicId: '1', difficulty: 3 });
    expect(callbacks.onSaveStorage).toHaveBeenCalled();
    expect(callbacks.onFinishAction).toHaveBeenCalled();
  });

  test('targetMusics が残っている場合は次の曲へ遷移する', async () => {
    const { controller, musicList, callbacks } = makeController();
    musicList.hasMusic.mockReturnValue(false);
    controller.targetMusics = [{ musicId: '2', difficulty: 3, url: 'http://score2' }];
    const res = { status: Parser.STATUS.SUCCESS, scores: [] };

    await controller.handleScoreDetailResponse(res);

    expect(callbacks.onNavigateTo).toHaveBeenCalledWith('http://score2');
    expect(callbacks.onFinishAction).not.toHaveBeenCalled();
  });
});

describe('DataFetchController.handleRivalMusicListResponse', () => {
  afterEach(() => jest.clearAllMocks());

  test('ステータスが SUCCESS でない場合は onHandleError を呼ぶ', async () => {
    const { controller, callbacks } = makeController();
    const res = { status: Parser.STATUS.LOGIN_REQUIRED };

    await controller.handleRivalMusicListResponse(res);

    expect(callbacks.onHandleError).toHaveBeenCalledWith(res);
    expect(callbacks.onSaveStorage).not.toHaveBeenCalled();
  });

  test('RIVAL_DATA_NOT_PUBLIC の場合は onHandleError を呼ぶ', async () => {
    const { controller, callbacks } = makeController();
    const res = { status: Parser.STATUS.RIVAL_DATA_NOT_PUBLIC };

    await controller.handleRivalMusicListResponse(res);

    expect(callbacks.onHandleError).toHaveBeenCalledWith(res);
    expect(callbacks.onSaveStorage).not.toHaveBeenCalled();
  });

  test('成功時に楽曲を musicList に追加してストレージを保存する', async () => {
    const { controller, musicList, callbacks } = makeController();
    controller.targetPlayMode = Constants.PLAY_MODE.SINGLE;
    controller.targetRivalId = '12345';
    const res = {
      status: Parser.STATUS.SUCCESS,
      musics: [
        { musicId: 'abc', title: 'Song A' },
        { musicId: 'def', title: 'Song B' },
      ],
      hasNext: false,
    };

    await controller.handleRivalMusicListResponse(res);

    expect(MusicData).toHaveBeenCalledTimes(2);
    expect(MusicData).toHaveBeenCalledWith('abc', 0, 'Song A', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
    expect(MusicData).toHaveBeenCalledWith('def', 0, 'Song B', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
    expect(musicList.applyMusicData).toHaveBeenCalledTimes(2);
    expect(callbacks.onSaveStorage).toHaveBeenCalled();
    expect(callbacks.onUpdateCharts).toHaveBeenCalled();
  });

  test('hasNext=true の場合は次のページに遷移する', async () => {
    const { controller, callbacks } = makeController();
    controller.targetPlayMode = Constants.PLAY_MODE.SINGLE;
    controller.targetRivalId = '12345';
    const res = { status: Parser.STATUS.SUCCESS, musics: [], hasNext: true, currentPage: 0, maxPage: 3, nextUrl: 'http://next?rival_id=12345' };

    await controller.handleRivalMusicListResponse(res);

    expect(callbacks.onNavigateTo).toHaveBeenCalledWith('http://next?rival_id=12345');
    expect(callbacks.onFinishAction).not.toHaveBeenCalled();
  });

  test('SINGLE 完了後は DOUBLE に切り替えて遷移する', async () => {
    const { controller, callbacks } = makeController();
    controller.targetPlayMode = Constants.PLAY_MODE.SINGLE;
    controller.targetRivalId = '12345';
    const res = { status: Parser.STATUS.SUCCESS, musics: [], hasNext: false };

    await controller.handleRivalMusicListResponse(res);

    expect(controller.targetPlayMode).toBe(Constants.PLAY_MODE.DOUBLE);
    expect(callbacks.onNavigateTo).toHaveBeenCalledWith('https://p.eagate.573.jp/game/ddr/ddrworld/rival/music_data_double.html?rival_id=12345');
    expect(callbacks.onFinishAction).not.toHaveBeenCalled();
  });

  test('DOUBLE 完了後は onFinishAction を呼ぶ', async () => {
    const { controller, callbacks } = makeController();
    controller.targetPlayMode = Constants.PLAY_MODE.DOUBLE;
    controller.targetRivalId = '12345';
    const res = { status: Parser.STATUS.SUCCESS, musics: [], hasNext: false };

    await controller.handleRivalMusicListResponse(res);

    expect(callbacks.onFinishAction).toHaveBeenCalled();
    expect(callbacks.onNavigateTo).not.toHaveBeenCalled();
  });
});
