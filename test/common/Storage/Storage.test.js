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
  // デフォルト: get/getBytesInUse を同期コールバックで動作させる
  chrome.storage.local.get.mockImplementation((_defaults, cb) => cb({}));
  chrome.storage.local.getBytesInUse.mockImplementation((_key, cb) => cb(0));
});

// ---- constructor ----

describe('Storage constructor', () => {
  test('コンストラクタで loadStorage が呼ばれる', () => {
    new Storage();
    expect(chrome.storage.local.get).toHaveBeenCalledTimes(1);
  });

  test('ロードされたデータが storageData に格納される', () => {
    chrome.storage.local.get.mockImplementation((_defaults, cb) => cb({ key: 'value' }));
    const storage = new Storage();
    expect(storage.storageData).toStrictEqual({ key: 'value' });
  });

  test('getBytesInUse の結果が bytesInUse に格納される', () => {
    chrome.storage.local.getBytesInUse.mockImplementation((_key, cb) => cb(1234));
    const storage = new Storage();
    expect(storage.bytesInUse).toBe(1234);
  });

  test('loadCallback がロードデータとともに呼ばれる', () => {
    const mockData = { foo: 'bar' };
    chrome.storage.local.get.mockImplementation((_defaults, cb) => cb(mockData));
    const callback = jest.fn();
    new Storage({}, callback);
    expect(callback).toHaveBeenCalledWith(mockData);
  });

  test('defaultData が chrome.storage.local.get に渡される', () => {
    const defaults = { score: 0 };
    new Storage(defaults);
    expect(chrome.storage.local.get).toHaveBeenCalledWith(defaults, expect.any(Function));
  });
});

// ---- loadStorage ----

describe('Storage.loadStorage', () => {
  test('ロードしたデータで storageData が更新される', () => {
    const storage = new Storage();
    const newData = { score: 100 };
    chrome.storage.local.get.mockImplementation((_defaults, cb) => cb(newData));
    storage.loadStorage();
    expect(storage.storageData).toStrictEqual(newData);
  });

  test('指定したコールバックがロードデータとともに呼ばれる', () => {
    const storage = new Storage();
    const newData = { score: 200 };
    chrome.storage.local.get.mockImplementation((_defaults, cb) => cb(newData));
    const callback = jest.fn();
    storage.loadStorage(callback);
    expect(callback).toHaveBeenCalledWith(newData);
  });

  test('コールバック省略時はデフォルト loadCallback が使われる', () => {
    const callback = jest.fn();
    const storage = new Storage({}, callback);
    callback.mockClear();
    storage.loadStorage();
    expect(callback).toHaveBeenCalled();
  });
});

// ---- saveStorage ----

describe('Storage.saveStorage', () => {
  test('chrome.storage.local.set にデータが渡される', () => {
    chrome.storage.local.set.mockImplementation((_data, cb) => cb());
    const storage = new Storage();
    const newData = { score: 999 };
    storage.saveStorage(newData);
    expect(chrome.storage.local.set).toHaveBeenCalledWith(newData, expect.any(Function));
  });

  test('保存後に storageData が更新される', () => {
    chrome.storage.local.set.mockImplementation((_data, cb) => cb());
    const storage = new Storage();
    const newData = { score: 999 };
    storage.saveStorage(newData);
    expect(storage.storageData).toStrictEqual(newData);
  });

  test('保存後にコールバックが呼ばれる', () => {
    chrome.storage.local.set.mockImplementation((_data, cb) => cb());
    const storage = new Storage();
    const callback = jest.fn();
    storage.saveStorage({}, callback);
    expect(callback).toHaveBeenCalled();
  });
});

// ---- resetStorage ----

describe('Storage.resetStorage', () => {
  test('chrome.storage.local.clear が呼ばれる', () => {
    chrome.storage.local.clear.mockImplementation((cb) => cb());
    const storage = new Storage();
    storage.resetStorage();
    expect(chrome.storage.local.clear).toHaveBeenCalled();
  });

  test('clear 後に loadStorage が再実行される', () => {
    chrome.storage.local.clear.mockImplementation((cb) => cb());
    const storage = new Storage();
    const getCallsBefore = chrome.storage.local.get.mock.calls.length;
    storage.resetStorage();
    expect(chrome.storage.local.get.mock.calls.length).toBe(getCallsBefore + 1);
  });

  test('完了後にコールバックが呼ばれる', () => {
    chrome.storage.local.clear.mockImplementation((cb) => cb());
    const storage = new Storage();
    const callback = jest.fn();
    storage.resetStorage(callback);
    expect(callback).toHaveBeenCalled();
  });
});

// ---- updateBytesInUse ----

describe('Storage.updateBytesInUse', () => {
  test('bytesInUse プロパティが更新される', () => {
    const storage = new Storage();
    chrome.storage.local.getBytesInUse.mockImplementation((_key, cb) => cb(5000));
    storage.updateBytesInUse();
    expect(storage.bytesInUse).toBe(5000);
  });

  test('コールバックにバイト数が渡される', () => {
    const storage = new Storage();
    chrome.storage.local.getBytesInUse.mockImplementation((_key, cb) => cb(7500));
    const callback = jest.fn();
    storage.updateBytesInUse(callback);
    expect(callback).toHaveBeenCalledWith(7500);
  });
});
