// @ts-check
/**
 * Playwright E2E tests for DDRScoreTracker Chrome Extension.
 *
 * 検証対象は「実 Chrome + 実 chrome.* API + 実ビルド成果物でしか壊れ方が出ない部分」に絞る。
 * 描画ロジックそのものは test/browser_action/*.test.js (jsdom + @vue/test-utils) が担保しており、
 * そちらは I18n や Constants をモックに差し替えているため、実 API を通る経路は E2E でしか検証できない。
 *
 *   - chrome.storage.local の実データが popup に描画されること
 *   - フィルタ操作が chrome.storage.local に永続化され、再読み込み後も復元されること
 *   - chrome.i18n がロケールごとに _locales の文言を解決すること
 *   - options_ui での設定変更が popup の挙動に効くこと
 *
 * Prerequisites:
 *   Run `yarn build:dev` before executing these tests.
 *   The built extension must exist in ./dist/.
 *
 * Usage:
 *   yarn test:e2e
 *   HEADED=1 yarn test:e2e   (ブラウザを目視する場合)
 */

const { chromium, test, expect } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { createStorageFixture, SCORED_CHART, EXPECTED_SINGLE_CHARTS, EXPECTED_DOUBLE_CHARTS } = require('./fixtures/test-data.js');
const enMessages = require('../src/static/_locales/en/messages.json');
const jaMessages = require('../src/static/_locales/ja/messages.json');

const pathToExtension = path.join(__dirname, '..', 'dist');

/**
 * popup は起動時に曲リストを外部から取得することがある (Constants.PARSED_MUSIC_LIST_URL)。
 * テストを外部ネットワークに依存させないため、全コンテキストでスタブに差し替える。
 */
const MUSIC_LIST_URL_PATTERN = '**/DDRScoreTracker/musics/*';
const STUB_MUSIC_LIST = ['stubremote0000000000000000000000', '0', '0', '3', '7', '12', '15', '17', '8', '13', '16', '18', '19', 'Stub Remote Song'].join('\t');

/** chart-list.vue が 1 譜面あたりに描画する div の class → 読み出し用のキー */
const CHART_FIELD_BY_CLASS = {
  level: 'level',
  title: 'title',
  clear_count: 'clearCount',
  play_count: 'playCount',
  flare_rank: 'flareRank',
  flare_skill: 'flareSkill',
  score_rank: 'scoreRank',
  full_combo_type: 'fullCombo',
  score: 'score',
  max_combo: 'maxCombo',
};

/**
 * Launch a persistent Chromium context with the extension loaded.
 * Returns { context, userDataDir, extensionId, musicListRequests }.
 *
 * MV3 の Service Worker を検出するには chromium 本体が必要で、
 * headless の既定である chrome-headless-shell では検出できない。
 * channel: 'chromium' が本体を選ばせる（生の --headless* 引数は渡さないこと。
 * Chrome 側の headless 実装変更に巻き込まれて起動ごと落ちた前例がある → #692）。
 *
 * uiLanguage を渡すとロケールを切り替える。_locales のどのメッセージが使われるかは
 * 環境変数 LANGUAGE でしか変わらず (--lang 引数では変わらない)、
 * chrome.i18n.getUILanguage() の戻り値は locale オプションでしか変わらないため、両方を渡す。
 */
async function launchExtensionContext({ uiLanguage } = {}) {
  // プロファイルを使い回すと chrome.storage.local が実行を跨いで残り、
  // まっさらな CI と状態が食い違うため、起動ごとに捨てる
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ddrst-e2e-'));

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: process.env.HEADED !== '1',
    channel: 'chromium',
    args: [`--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`, '--no-sandbox', '--disable-setuid-sandbox'],
    ...(uiLanguage ? { locale: uiLanguage.locale, env: { ...process.env, LANGUAGE: uiLanguage.language } } : {}),
  });

  const musicListRequests = { count: 0 };
  await context.route(MUSIC_LIST_URL_PATTERN, async (route) => {
    musicListRequests.count += 1;
    await route.fulfill({ status: 200, contentType: 'text/plain', body: STUB_MUSIC_LIST });
  });

  // Wait for the service worker to start and get the extension ID
  let [background] = context.serviceWorkers();
  if (!background) {
    background = await context.waitForEvent('serviceworker', { timeout: 10000 });
  }

  const extensionId = background.url().split('/')[2];
  return { context, userDataDir, extensionId, background, musicListRequests };
}

/**
 * Close the context and remove its throwaway user data directory.
 */
async function closeExtensionContext(context, userDataDir) {
  await context.close();
  fs.rmSync(userDataDir, { recursive: true, force: true });
}

/**
 * popup を開く。
 * browser_action/index.ts は同じ popup が 2 枚開いていると window.close() するため、
 * 同時に開くページは 1 枚までにすること。
 */
async function openPopup(context, extensionId) {
  const page = await context.newPage();
  // 1024px 以上ではフィルタが常時表示の 2 ペイン表示になり、開閉ボタンが消える。
  // 実際の popup に近いドロワー表示側で検証するため、幅を固定する
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto(`chrome-extension://${extensionId}/browser_action/index.html`);
  return page;
}

async function openOptions(context, extensionId) {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/options_ui/index.html`);
  return page;
}

/**
 * chrome.storage.local に書き込む。
 *
 * popup ではなく Service Worker から書くこと。popup を開いた時点で App が
 * 曲リストの自動取得を始めることがあり、その非同期な保存が後から
 * 投入データを上書きしてしまうため (browser_action/index.ts の refresh-chart-list)。
 */
async function seedStorage(background, data) {
  await background.evaluate(async (payload) => {
    await chrome.storage.local.set(payload);
  }, data);
}

/** chrome.storage.local から読み出す */
async function readStorage(background, defaults) {
  return background.evaluate(async (query) => chrome.storage.local.get(query), defaults);
}

/** 描画されている譜面一覧を、1 譜面 1 オブジェクトに組み立てて返す */
async function readCharts(page) {
  return page.$$eval(
    '#app-charts .score_list > div',
    (elements, fieldByClass) => {
      const charts = [];
      let current = null;
      elements.forEach((element) => {
        const [className, modifier] = element.className.split(' ');
        const field = fieldByClass[className];
        if (field === undefined) {
          return;
        }
        if (field === 'level') {
          current = {};
          charts.push(current);
        }
        if (current === null) {
          return;
        }
        current[field] = (element.textContent ?? '').trim();
        if (modifier !== undefined) {
          current[`${field}Class`] = modifier;
        }
      });
      return charts;
    },
    CHART_FIELD_BY_CLASS
  );
}

/** フィルタのドロワーを開く (閉じたままだと input を操作できない) */
async function openFilterDrawer(page) {
  await page.locator('#openFilterButton').click();
  await expect(page.locator('#filterContainer')).toHaveClass(/active/);
}

/** 描画完了を待つ。title は 1 譜面につき 1 つ描画される */
async function expectChartCount(page, count) {
  await expect(page.locator('#app-charts .score_list > div.title')).toHaveCount(count);
}

test.describe('拡張機能のロード', () => {
  let context;
  let userDataDir;
  let extensionId;

  test.beforeAll(async () => {
    ({ context, userDataDir, extensionId } = await launchExtensionContext());
  });

  test.afterAll(async () => {
    await closeExtensionContext(context, userDataDir);
  });

  test('MV3 の Service Worker が起動し、拡張機能 ID が取得できる', () => {
    expect(extensionId).toMatch(/^[a-z]{32}$/);
  });

  test('Service Worker が background/main.js として動いている', () => {
    const [background] = context.serviceWorkers();
    expect(background.url()).toBe(`chrome-extension://${extensionId}/background/main.js`);
  });
});

test.describe('browser_action: chrome.storage.local のデータ描画', () => {
  let context;
  let userDataDir;
  let extensionId;
  let background;
  let page;

  test.beforeAll(async () => {
    ({ context, userDataDir, extensionId, background } = await launchExtensionContext());
    await seedStorage(background, createStorageFixture());
    page = await openPopup(context, extensionId);
    await expectChartCount(page, EXPECTED_SINGLE_CHARTS.length);
  });

  test.afterAll(async () => {
    await closeExtensionContext(context, userDataDir);
  });

  test('投入した楽曲の SP 譜面がすべて描画される', async () => {
    const charts = await readCharts(page);
    const rendered = charts.map((chart) => ({ title: chart.title, level: chart.level })).sort((a, b) => (a.title + a.level).localeCompare(b.title + b.level));
    const expected = [...EXPECTED_SINGLE_CHARTS].sort((a, b) => (a.title + a.level).localeCompare(b.title + b.level));
    expect(rendered).toEqual(expected);
  });

  test('削除済みでスコアのない楽曲は既定の availability フィルタで除外される', async () => {
    const charts = await readCharts(page);
    expect(charts.map((chart) => chart.title)).not.toContain('E2E Deleted');
  });

  test('スコアを持つ譜面がスコア・ランク・プレー回数を実値で描画する', async () => {
    const charts = await readCharts(page);
    const scored = charts.find((chart) => chart.level === SCORED_CHART.level);
    expect(scored).toMatchObject({
      title: SCORED_CHART.title,
      score: SCORED_CHART.score,
      scoreRank: SCORED_CHART.scoreRank,
      scoreRankClass: SCORED_CHART.scoreRankClass,
      clearCount: SCORED_CHART.clearCount,
      playCount: SCORED_CHART.playCount,
      maxCombo: SCORED_CHART.maxCombo,
      flareRank: SCORED_CHART.flareRank,
      flareRankClass: SCORED_CHART.flareRankClass,
      flareSkill: SCORED_CHART.flareSkill,
      fullCombo: SCORED_CHART.fullCombo,
      fullComboClass: SCORED_CHART.fullComboClass,
    });
  });

  test('既定のソート (スコア降順) によりスコアを持つ譜面が先頭に来る', async () => {
    const charts = await readCharts(page);
    expect(charts[0].level).toBe(SCORED_CHART.level);
    expect(charts[0].score).toBe(SCORED_CHART.score);
  });

  test('スコアのない譜面はスコア関連の欄が空で描画される', async () => {
    const charts = await readCharts(page);
    const notPlayed = charts.find((chart) => chart.title === 'E2E Beta' && chart.level === "13'");
    expect(notPlayed).toMatchObject({ score: '', scoreRank: '', clearCount: '', playCount: '', maxCombo: '' });
  });
});

test.describe('browser_action: フィルタ', () => {
  let context;
  let userDataDir;
  let extensionId;
  let background;
  let page;

  test.beforeEach(async () => {
    ({ context, userDataDir, extensionId, background } = await launchExtensionContext());
    await seedStorage(background, createStorageFixture());
    page = await openPopup(context, extensionId);
    await expectChartCount(page, EXPECTED_SINGLE_CHARTS.length);
  });

  test.afterEach(async () => {
    await closeExtensionContext(context, userDataDir);
  });

  test('playMode を DP に切り替えると DP 譜面だけが描画される', async () => {
    await openFilterDrawer(page);
    await page.locator('#filterCondition_playMode_1').check();

    await expectChartCount(page, EXPECTED_DOUBLE_CHARTS.length);
    const charts = await readCharts(page);
    const rendered = charts.map((chart) => ({ title: chart.title, level: chart.level })).sort((a, b) => (a.title + a.level).localeCompare(b.title + b.level));
    const expected = [...EXPECTED_DOUBLE_CHARTS].sort((a, b) => (a.title + a.level).localeCompare(b.title + b.level));
    expect(rendered).toEqual(expected);
  });

  test('level フィルタで絞り込むと該当する譜面だけが残る', async () => {
    await openFilterDrawer(page);
    await page.locator('#filterCondition_level_15').check();

    await expectChartCount(page, 1);
    const charts = await readCharts(page);
    expect(charts[0]).toMatchObject({ title: 'E2E Alpha', level: "15'" });
  });

  test('フィルタ条件が chrome.storage.local に永続化され、再読み込み後も復元される', async () => {
    await openFilterDrawer(page);
    await page.locator('#filterCondition_level_15').check();
    await expectChartCount(page, 1);

    const { conditions } = await readStorage(background, { conditions: null });
    expect(conditions.filter).toContainEqual({ attribute: 'level', values: [15] });

    await page.reload();

    // 再読み込み後もチェック状態と絞り込み結果が維持されている
    await expect(page.locator('#filterCondition_level_15')).toBeChecked();
    await expectChartCount(page, 1);
    const charts = await readCharts(page);
    expect(charts[0]).toMatchObject({ title: 'E2E Alpha', level: "15'" });
  });
});

test.describe('chrome.i18n によるロケール解決', () => {
  /**
   * data-i18n-key を持つ要素は i18n4html.js が chrome.i18n.getMessage で埋める。
   * 置換用のプレースホルダを含むメッセージは静的な比較ができないため対象外にする。
   */
  async function collectTranslations(page) {
    return page.$$eval('[data-i18n-key]', (elements) =>
      elements.map((element) => ({
        key: element.getAttribute('data-i18n-key'),
        text: (element.textContent ?? '').trim(),
      }))
    );
  }

  function assertTranslated(translations, messages, locale) {
    const targets = translations.filter(({ key }) => messages[key] !== undefined && !messages[key].message.includes('$'));
    // 比較対象が消えてしまうと素通りしてしまうため、十分な数を見ていることを担保する
    expect(targets.length).toBeGreaterThan(10);
    targets.forEach(({ key, text }) => {
      expect(text, `${locale}: ${key}`).toBe(messages[key].message.trim());
    });
    translations.forEach(({ key, text }) => {
      expect(messages[key], `${locale} の messages.json に ${key} がない`).toBeDefined();
      expect(text, `${locale}: ${key} が未解決`).not.toBe('');
      expect(text, `${locale}: ${key} が未解決`).not.toBe(key);
    });
  }

  test('UI ロケールが en のとき en/messages.json の文言が描画される', async () => {
    const { context, userDataDir, extensionId } = await launchExtensionContext();
    try {
      const page = await openPopup(context, extensionId);
      expect(await page.evaluate(() => chrome.i18n.getUILanguage())).toMatch(/^en/);
      assertTranslated(await collectTranslations(page), enMessages, 'en');
    } finally {
      await closeExtensionContext(context, userDataDir);
    }
  });

  test('UI ロケールが ja のとき ja/messages.json の文言が描画される', async () => {
    const { context, userDataDir, extensionId } = await launchExtensionContext({ uiLanguage: { locale: 'ja-JP', language: 'ja' } });
    try {
      const page = await openPopup(context, extensionId);
      expect(await page.evaluate(() => chrome.i18n.getUILanguage())).toMatch(/^ja/);
      assertTranslated(await collectTranslations(page), jaMessages, 'ja');
    } finally {
      await closeExtensionContext(context, userDataDir);
    }
  });
});

test.describe('options_ui', () => {
  let context;
  let userDataDir;
  let extensionId;
  let background;
  let musicListRequests;

  test.beforeEach(async () => {
    ({ context, userDataDir, extensionId, background, musicListRequests } = await launchExtensionContext());
  });

  test.afterEach(async () => {
    await closeExtensionContext(context, userDataDir);
  });

  test('保存済みの options がフォームに反映される', async () => {
    await seedStorage(background, { options: { enableDebugLog: true, openTabAsActive: true, musicListReloadInterval: 3600000 } });
    const page = await openOptions(context, extensionId);

    await expect(page.locator('[name=enableDebugLog]')).toBeChecked();
    await expect(page.locator('[name=openTabAsActive]')).toBeChecked();
    await expect(page.locator('[name=notCloseTabAfterUse]')).not.toBeChecked();
    await expect(page.locator('[name=musicListReloadInterval]')).toHaveValue('3600000');
  });

  test('チェックボックスの変更が chrome.storage.local に保存され、再読み込み後も復元される', async () => {
    const page = await openOptions(context, extensionId);
    await expect(page.locator('[name=enableDebugLog]')).not.toBeChecked();

    await page.locator('[name=enableDebugLog]').check();

    await expect
      .poll(async () => {
        const { options } = await readStorage(background, { options: {} });
        return options.enableDebugLog;
      })
      .toBe(true);

    await page.reload();
    await expect(page.locator('[name=enableDebugLog]')).toBeChecked();
  });

  test('musicListReloadInterval を 0 にすると popup が曲リストを取得しなくなる', async () => {
    // 既定値 (86400000) では、未取得 (musicListUpdatedAt=0) の popup は曲リストを取りに行く
    await seedStorage(background, { internalStatus: { musicListUpdatedAt: 0 } });
    const popup = await openPopup(context, extensionId);
    await expect.poll(() => musicListRequests.count).toBeGreaterThan(0);
    await popup.close();

    // options 画面で自動取得を無効にする
    const options = await openOptions(context, extensionId);
    await options.locator('[name=musicListReloadInterval]').fill('0');
    await options.locator('[name=musicListReloadInterval]').press('Tab');
    await expect
      .poll(async () => {
        const { options: saved } = await readStorage(background, { options: {} });
        return saved.musicListReloadInterval;
      })
      .toBe(0);
    await options.close();
    // 取得に成功すると musicListUpdatedAt が「今」に更新され、
    // 次回は間隔に関係なく取得しなくなる。設定の効果だけを見るため 0 に戻す
    await seedStorage(background, { internalStatus: { musicListUpdatedAt: 0 } });

    const requestsBefore = musicListRequests.count;
    const popupAgain = await openPopup(context, extensionId);
    await expect(popupAgain.locator('#app-charts')).toBeAttached();
    expect(musicListRequests.count).toBe(requestsBefore);
  });
});
