import { BrowserController } from '../../../src/static/common/BrowserController.js';

jest.mock('../../../src/static/common/Logger.js', () => ({
  Logger: { debug: jest.fn(), error: jest.fn() },
}));

function makeChromeMock() {
  return {
    tabs: {
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      sendMessage: jest.fn(),
      onUpdated: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
    runtime: {},
  };
}

beforeEach(() => {
  global.chrome = makeChromeMock();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// IDLE 状態の BrowserController を返すヘルパー (tabId = 42)
function makeIdleController(windowId = 1, onUpdateTab = () => {}) {
  chrome.tabs.create.mockImplementation((_options, cb) => cb({ id: 42 }));
  const bc = new BrowserController(windowId, onUpdateTab);
  bc.createTab('https://example.com');
  bc.onUpdateTabInternalImpl(42, { status: 'complete' }, {});
  return bc;
}

// ---- constructor ----

describe('BrowserController constructor', () => {
  test('初期状態は INITIALIZED', () => {
    const bc = new BrowserController(1);
    expect(bc.state).toBe(BrowserController.STATE.INITIALIZED);
  });

  test('初期 tabId は null', () => {
    const bc = new BrowserController(1);
    expect(bc.tabId).toBeNull();
  });

  test('初期 delay は 0', () => {
    const bc = new BrowserController(1);
    expect(bc.delay).toBe(0);
  });
});

// ---- createTab ----

describe('BrowserController.createTab', () => {
  test('正常時: Promise が解決し tabId がセットされる', async () => {
    chrome.tabs.create.mockImplementation((_options, cb) => cb({ id: 10 }));
    const bc = new BrowserController(1);
    await expect(bc.createTab('https://example.com')).resolves.toContain('tab created');
    expect(bc.tabId).toBe(10);
  });

  test('正常時: 状態が NAVIGATING に遷移する', () => {
    chrome.tabs.create.mockImplementation((_options, cb) => cb({ id: 10 }));
    const bc = new BrowserController(1);
    bc.createTab('https://example.com');
    expect(bc.state).toBe(BrowserController.STATE.NAVIGATING);
  });

  test('正常時: chrome.tabs.onUpdated にリスナーが追加される', () => {
    chrome.tabs.create.mockImplementation((_options, cb) => cb({ id: 10 }));
    const bc = new BrowserController(1);
    bc.createTab('https://example.com');
    expect(chrome.tabs.onUpdated.addListener).toHaveBeenCalled();
  });

  test('INITIALIZED 以外の状態では reject される', async () => {
    chrome.tabs.create.mockImplementation((_options, cb) => cb({ id: 10 }));
    const bc = new BrowserController(1);
    bc.createTab('https://example.com'); // → NAVIGATING
    await expect(bc.createTab('https://other.com')).rejects.toThrow('state unmatch');
  });
});

// ---- updateTab ----

describe('BrowserController.updateTab', () => {
  test('正常時: Promise が解決し状態が NAVIGATING に遷移する', async () => {
    chrome.tabs.update.mockImplementation((_tabId, _options, cb) => {
      delete chrome.runtime.lastError;
      cb({});
    });
    const bc = makeIdleController();
    const promise = bc.updateTab('https://example.com', 0);
    jest.runAllTimers();
    await expect(promise).resolves.toContain('navigate to');
    expect(bc.state).toBe(BrowserController.STATE.NAVIGATING);
  });

  test('IDLE 以外の状態では reject される', async () => {
    const bc = new BrowserController(1);
    await expect(bc.updateTab('https://example.com')).rejects.toThrow('state unmatch');
  });

  test('chrome.runtime.lastError がある場合は reject され reset される', async () => {
    chrome.tabs.update.mockImplementation((_tabId, _options, cb) => {
      chrome.runtime.lastError = { message: 'tab not found' };
      cb({});
    });
    const bc = makeIdleController();
    const promise = bc.updateTab('https://example.com', 0);
    jest.runAllTimers();
    await expect(promise).rejects.toThrow('tab not found');
    expect(bc.state).toBe(BrowserController.STATE.INITIALIZED);
    expect(bc.tabId).toBeNull();
  });
});

// ---- closeTab ----

describe('BrowserController.closeTab', () => {
  test('正常時: Promise が解決し状態が INITIALIZED にリセットされる', async () => {
    chrome.tabs.remove.mockImplementation((_tabId, cb) => {
      delete chrome.runtime.lastError;
      cb();
    });
    const bc = makeIdleController();
    await expect(bc.closeTab()).resolves.toBe('tab closed');
    expect(bc.state).toBe(BrowserController.STATE.INITIALIZED);
    expect(bc.tabId).toBeNull();
  });

  test('IDLE 以外の状態では reject される (force=false)', async () => {
    const bc = new BrowserController(1);
    await expect(bc.closeTab()).rejects.toThrow('state unmatch');
  });

  test('force=true の場合は IDLE 以外でも成功する', async () => {
    chrome.tabs.remove.mockImplementation((_tabId, cb) => {
      delete chrome.runtime.lastError;
      cb();
    });
    const bc = new BrowserController(1);
    await expect(bc.closeTab(true)).resolves.toBe('tab closed');
  });

  test('chrome.runtime.lastError がある場合は reject される', async () => {
    chrome.tabs.remove.mockImplementation((_tabId, cb) => {
      chrome.runtime.lastError = { message: 'remove failed' };
      cb();
    });
    const bc = makeIdleController();
    await expect(bc.closeTab()).rejects.toThrow('remove failed');
  });

  test('正常時: chrome.tabs.onUpdated のリスナーが削除される', async () => {
    chrome.tabs.remove.mockImplementation((_tabId, cb) => {
      delete chrome.runtime.lastError;
      cb();
    });
    const bc = makeIdleController();
    await bc.closeTab();
    expect(chrome.tabs.onUpdated.removeListener).toHaveBeenCalled();
  });
});

// ---- sendMessageToTab ----

describe('BrowserController.sendMessageToTab', () => {
  test('IDLE 状態で chrome.tabs.sendMessage が呼ばれる', () => {
    const bc = makeIdleController();
    const cb = jest.fn();
    bc.sendMessageToTab({ type: 'TEST' }, cb);
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(42, { type: 'TEST' }, {}, cb);
  });

  test('IDLE 以外の状態では例外がスローされる', () => {
    const bc = new BrowserController(1);
    expect(() => bc.sendMessageToTab({ type: 'TEST' }, jest.fn())).toThrow('state unmatch');
  });
});

// ---- onUpdateTabInternalImpl ----

describe('BrowserController.onUpdateTabInternalImpl', () => {
  test('tabId が null のときは何もしない', () => {
    const onUpdateTab = jest.fn();
    const bc = new BrowserController(1, onUpdateTab);
    bc.onUpdateTabInternalImpl(1, { status: 'complete' }, {});
    expect(onUpdateTab).not.toHaveBeenCalled();
  });

  test('tid が tabId と一致しない場合は何もしない', () => {
    chrome.tabs.create.mockImplementation((_options, cb) => cb({ id: 42 }));
    const onUpdateTab = jest.fn();
    const bc = new BrowserController(1, onUpdateTab);
    bc.createTab('https://example.com');
    bc.onUpdateTabInternalImpl(99, { status: 'complete' }, {});
    expect(onUpdateTab).not.toHaveBeenCalled();
  });

  test('status が complete かつ NAVIGATING のとき IDLE に遷移し onUpdateTab を呼ぶ', () => {
    chrome.tabs.create.mockImplementation((_options, cb) => cb({ id: 42 }));
    const onUpdateTab = jest.fn();
    const bc = new BrowserController(1, onUpdateTab);
    bc.createTab('https://example.com');
    expect(bc.state).toBe(BrowserController.STATE.NAVIGATING);
    bc.onUpdateTabInternalImpl(42, { status: 'complete' }, {});
    expect(bc.state).toBe(BrowserController.STATE.IDLE);
    expect(onUpdateTab).toHaveBeenCalled();
  });

  test('status が complete 以外のときは状態遷移しない', () => {
    chrome.tabs.create.mockImplementation((_options, cb) => cb({ id: 42 }));
    const onUpdateTab = jest.fn();
    const bc = new BrowserController(1, onUpdateTab);
    bc.createTab('https://example.com');
    bc.onUpdateTabInternalImpl(42, { status: 'loading' }, {});
    expect(bc.state).toBe(BrowserController.STATE.NAVIGATING);
    expect(onUpdateTab).not.toHaveBeenCalled();
  });
});

// ---- reset ----

describe('BrowserController.reset', () => {
  test('tabId が null にリセットされる', () => {
    chrome.tabs.create.mockImplementation((_options, cb) => cb({ id: 42 }));
    const bc = new BrowserController(1);
    bc.createTab('https://example.com');
    bc.reset();
    expect(bc.tabId).toBeNull();
  });

  test('状態が INITIALIZED にリセットされる', () => {
    chrome.tabs.create.mockImplementation((_options, cb) => cb({ id: 42 }));
    const bc = new BrowserController(1);
    bc.createTab('https://example.com');
    bc.reset();
    expect(bc.state).toBe(BrowserController.STATE.INITIALIZED);
  });

  test('chrome.tabs.onUpdated のリスナーが削除される', () => {
    const bc = new BrowserController(1);
    bc.reset();
    expect(chrome.tabs.onUpdated.removeListener).toHaveBeenCalled();
  });
});
