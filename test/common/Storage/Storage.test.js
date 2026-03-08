import { Storage } from '../../../src/static/common/Storage.js';

jest.mock('../../../src/static/common/Logger.js', () => ({
  Logger: { info: jest.fn(), debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));
jest.mock('../../../src/static/common/I18n.js', () => ({
  I18n: { getMessage: jest.fn().mockReturnValue('') },
}));

function makeChromeMock() {
  return {
    storage: {
      local: {
        get: jest.fn(),
        set: jest.fn(),
        clear: jest.fn(),
        getBytesInUse: jest.fn(),
      },
    },
  };
}

beforeEach(() => {
  global.chrome = makeChromeMock();
  // デフォルト: 各メソッドを Promise で動作させる
  chrome.storage.local.get.mockResolvedValue({});
  chrome.storage.local.set.mockResolvedValue(undefined);
  chrome.storage.local.clear.mockResolvedValue(undefined);
  chrome.storage.local.getBytesInUse.mockResolvedValue(0);
});

// ---- constructor ----

describe('Storage constructor', () => {
  test('コンストラクタで loadStorage が呼ばれる', async () => {
    const storage = new Storage();
    await storage.ready;
    expect(chrome.storage.local.get).toHaveBeenCalledTimes(1);
  });

  test('ロードされたデータが storageData に格納される', async () => {
    chrome.storage.local.get.mockResolvedValue({ key: 'value' });
    const storage = new Storage();
    await storage.ready;
    expect(storage.storageData).toStrictEqual({ key: 'value' });
  });

  test('getBytesInUse の結果が bytesInUse に格納される', async () => {
    chrome.storage.local.getBytesInUse.mockResolvedValue(1234);
    const storage = new Storage();
    await storage.ready;
    expect(storage.bytesInUse).toBe(1234);
  });

  test('defaultData が chrome.storage.local.get に渡される', async () => {
    const defaults = { score: 0 };
    const storage = new Storage(defaults);
    await storage.ready;
    expect(chrome.storage.local.get).toHaveBeenCalledWith(defaults);
  });
});

// ---- loadStorage ----

describe('Storage.loadStorage', () => {
  test('ロードしたデータで storageData が更新される', async () => {
    const storage = new Storage();
    await storage.ready;
    const newData = { score: 100 };
    chrome.storage.local.get.mockResolvedValue(newData);
    await storage.loadStorage();
    expect(storage.storageData).toStrictEqual(newData);
  });

  test('ロードしたデータが返り値として返される', async () => {
    const storage = new Storage();
    await storage.ready;
    const newData = { score: 300 };
    chrome.storage.local.get.mockResolvedValue(newData);
    const result = await storage.loadStorage();
    expect(result).toStrictEqual(newData);
  });
});

// ---- saveStorage ----

describe('Storage.saveStorage', () => {
  test('chrome.storage.local.set にデータが渡される', async () => {
    const storage = new Storage();
    await storage.ready;
    const newData = { score: 999 };
    await storage.saveStorage(newData);
    expect(chrome.storage.local.set).toHaveBeenCalledWith(newData);
  });

  test('保存後に storageData が更新される', async () => {
    const storage = new Storage();
    await storage.ready;
    const newData = { score: 999 };
    await storage.saveStorage(newData);
    expect(storage.storageData).toStrictEqual(newData);
  });

  test('保存後に bytesInUse が更新される', async () => {
    const storage = new Storage();
    await storage.ready;
    chrome.storage.local.getBytesInUse.mockResolvedValue(2048);
    await storage.saveStorage({});
    expect(storage.bytesInUse).toBe(2048);
  });
});

// ---- resetStorage ----

describe('Storage.resetStorage', () => {
  test('chrome.storage.local.clear が呼ばれる', async () => {
    const storage = new Storage();
    await storage.ready;
    await storage.resetStorage();
    expect(chrome.storage.local.clear).toHaveBeenCalled();
  });

  test('clear 後に loadStorage が再実行される', async () => {
    const storage = new Storage();
    await storage.ready;
    const getCallsBefore = chrome.storage.local.get.mock.calls.length;
    await storage.resetStorage();
    expect(chrome.storage.local.get.mock.calls.length).toBe(getCallsBefore + 1);
  });
});

// ---- updateBytesInUse ----

describe('Storage.updateBytesInUse', () => {
  test('bytesInUse プロパティが更新される', async () => {
    const storage = new Storage();
    await storage.ready;
    chrome.storage.local.getBytesInUse.mockResolvedValue(5000);
    await storage.updateBytesInUse();
    expect(storage.bytesInUse).toBe(5000);
  });

  test('戻り値としてバイト数が返される', async () => {
    const storage = new Storage();
    await storage.ready;
    chrome.storage.local.getBytesInUse.mockResolvedValue(7500);
    const result = await storage.updateBytesInUse();
    expect(result).toBe(7500);
  });
});
