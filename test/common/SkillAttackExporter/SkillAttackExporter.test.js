import { SkillAttackExporter } from '../../../src/static/common/SkillAttackExporter.js';

jest.mock('../../../src/static/common/Logger.js', () => ({
  Logger: { info: jest.fn(), debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));
jest.mock('../../../src/static/common/I18n.js', () => ({
  I18n: { getMessage: jest.fn().mockReturnValue('') },
}));
jest.mock('../../../src/static/common/SkillAttackIndexMap.js', () => ({
  SkillAttackIndexMap: { createFromText: jest.fn() },
}));
jest.mock('../../../src/static/common/SkillAttackDataList.js', () => ({
  SkillAttackDataList: jest.fn(),
}));

import { SkillAttackIndexMap } from '../../../src/static/common/SkillAttackIndexMap.js';
import { SkillAttackDataList } from '../../../src/static/common/SkillAttackDataList.js';

function makeResponse(ok, text = '') {
  return Promise.resolve({ ok, status: ok ? 200 : 500, text: () => Promise.resolve(text) });
}

describe('SkillAttackExporter.export', () => {
  let musicList, scoreList, options, exporter;
  let mockIndexMap, mockDiff, mockDataListInstance;

  beforeEach(() => {
    musicList = {};
    scoreList = {};
    options = {};
    exporter = new SkillAttackExporter(musicList, scoreList, options);

    mockIndexMap = {};
    SkillAttackIndexMap.createFromText.mockReturnValue(mockIndexMap);

    mockDiff = { count: 0, urlSearchParams: jest.fn(() => new URLSearchParams()) };
    mockDataListInstance = { applyText: jest.fn(), getDiff: jest.fn(() => mockDiff) };
    SkillAttackDataList.mockImplementation(() => mockDataListInstance);

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('ログインレスポンスに "Password invalid" が含まれる場合は中断する', async () => {
    global.fetch.mockReturnValueOnce(makeResponse(true, 'Password invalid'));

    await exporter.export('1234567890', 'wrongpassword');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('http://skillattack.com/sa4/dancer_input.php', expect.objectContaining({ method: 'POST' }));
  });

  test('ログイン時にHTTPエラーが発生した場合はネットワークエラーとして処理する', async () => {
    global.fetch.mockReturnValueOnce(makeResponse(false));

    await exporter.export('1234567890', 'password');

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('楽曲マスター取得時にHTTPエラーが発生した場合はネットワークエラーとして処理する', async () => {
    global.fetch.mockReturnValueOnce(makeResponse(true, '')).mockReturnValueOnce(makeResponse(false));

    await exporter.export('1234567890', 'password');

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('スコアデータ取得時にHTTPエラーが発生した場合はネットワークエラーとして処理する', async () => {
    global.fetch.mockReturnValueOnce(makeResponse(true, '')).mockReturnValueOnce(makeResponse(true, '')).mockReturnValueOnce(makeResponse(false));

    await exporter.export('1234567890', 'password');

    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  test('差分がない場合はスコアを送信しない', async () => {
    global.fetch.mockReturnValueOnce(makeResponse(true, '')).mockReturnValueOnce(makeResponse(true, '')).mockReturnValueOnce(makeResponse(true, ''));
    mockDiff.count = 0;

    await exporter.export('1234567890', 'password');

    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  test('notSendDataToSkillAttack=true の場合は差分ありでもスコアを送信しない', async () => {
    global.fetch.mockReturnValueOnce(makeResponse(true, '')).mockReturnValueOnce(makeResponse(true, '')).mockReturnValueOnce(makeResponse(true, ''));
    mockDiff.count = 1;
    exporter.options = { notSendDataToSkillAttack: true };

    await exporter.export('1234567890', 'password');

    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  test('差分ありかつ送信許可の場合はスコアを送信する', async () => {
    global.fetch
      .mockReturnValueOnce(makeResponse(true, ''))
      .mockReturnValueOnce(makeResponse(true, ''))
      .mockReturnValueOnce(makeResponse(true, ''))
      .mockReturnValueOnce(makeResponse(true, ''));
    mockDiff.count = 1;

    await exporter.export('1234567890', 'password');

    expect(global.fetch).toHaveBeenCalledTimes(4);
    expect(global.fetch).toHaveBeenLastCalledWith('http://skillattack.com/sa4/dancer_input.php', expect.objectContaining({ method: 'POST' }));
  });

  test('スコア送信時にHTTPエラーが発生した場合はネットワークエラーとして処理する', async () => {
    global.fetch
      .mockReturnValueOnce(makeResponse(true, ''))
      .mockReturnValueOnce(makeResponse(true, ''))
      .mockReturnValueOnce(makeResponse(true, ''))
      .mockReturnValueOnce(makeResponse(false));
    mockDiff.count = 1;

    await exporter.export('1234567890', 'password');

    expect(global.fetch).toHaveBeenCalledTimes(4);
  });

  test('正しいddrcode でスコアデータURLが構築される', async () => {
    global.fetch.mockReturnValueOnce(makeResponse(true, '')).mockReturnValueOnce(makeResponse(true, '')).mockReturnValueOnce(makeResponse(true, ''));
    mockDiff.count = 0;

    await exporter.export('9876543210', 'password');

    expect(global.fetch).toHaveBeenNthCalledWith(3, 'http://skillattack.com/sa4/data/dancer/9876543210/score_9876543210.txt', expect.objectContaining({ cache: 'no-store' }));
  });
});
