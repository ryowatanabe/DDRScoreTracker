/**
 * @jest-environment jsdom
 */

import { mount } from '@vue/test-utils';
import ChartList from '../../src/browser_action/chart-list.vue';

jest.mock('../../src/static/common/I18n.js', () => ({
  I18n: { getMessage: jest.fn((key) => `[${key}]`) },
}));

// Use a small page size for pagination tests
jest.mock('../../src/static/common/Constants.js', () => ({
  Constants: { PAGE_LENGTH: 3 },
}));

function createMockChart(overrides = {}) {
  return {
    musicId: 'music001',
    playMode: 0,
    difficulty: 3,
    difficultyClassString: 'expert',
    levelString: '15',
    playModeSymbol: "'",
    title: 'Test Song',
    clearCount: 10,
    playCount: 15,
    flareRankClassString: 'flare_5',
    flareRankSymbol: 'Ⅴ',
    flareSkill: '1234',
    scoreRankClassString: 'rank_aaa',
    scoreRankString: 'AAA',
    clearTypeClassString: 'marvelous_fc',
    fullComboSymbol: '○',
    scoreString: '1000000',
    maxCombo: 300,
    ...overrides,
  };
}

function createMockChartList(charts = []) {
  return {
    charts,
    statistics: {
      clearType: [],
      flareRank: [],
      scoreRank: [],
      score: { order: [] },
    },
  };
}

describe('chart-list.vue', () => {
  test('初期状態ではスコアリストが空', () => {
    const wrapper = mount(ChartList);
    expect(wrapper.findAll('.score_list .title').length).toBe(0);
  });

  test('初期状態では charts が空配列', () => {
    const wrapper = mount(ChartList);
    expect(wrapper.vm.charts).toEqual([]);
  });

  test('setData() 後にチャートが表示される', async () => {
    const wrapper = mount(ChartList);
    const charts = [createMockChart({ title: 'Song A' }), createMockChart({ musicId: 'music002', title: 'Song B' })];
    await wrapper.vm.setData(createMockChartList(charts));
    await wrapper.vm.$nextTick();
    const titles = wrapper.findAll('.score_list .title');
    expect(titles.length).toBe(2);
    expect(titles[0].text()).toBe('Song A');
    expect(titles[1].text()).toBe('Song B');
  });

  test('setData() 後に charts プロパティが設定される', async () => {
    const wrapper = mount(ChartList);
    const charts = [createMockChart(), createMockChart({ musicId: 'music002' })];
    await wrapper.vm.setData(createMockChartList(charts));
    expect(wrapper.vm.charts.length).toBe(2);
  });

  test('PAGE_LENGTH 以内のチャートではページャーが表示されない', async () => {
    const wrapper = mount(ChartList);
    const charts = [createMockChart()];
    await wrapper.vm.setData(createMockChartList(charts));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.pager').exists()).toBe(false);
  });

  test('PAGE_LENGTH を超えるチャートではページャーが表示される', async () => {
    const wrapper = mount(ChartList);
    // PAGE_LENGTH is mocked to 3, so 4 charts should show pager
    const charts = [
      createMockChart({ musicId: 'music001' }),
      createMockChart({ musicId: 'music002' }),
      createMockChart({ musicId: 'music003' }),
      createMockChart({ musicId: 'music004' }),
    ];
    await wrapper.vm.setData(createMockChartList(charts));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.pager').exists()).toBe(true);
  });

  test('maxPage が正しく計算される（PAGE_LENGTH=3 で 4 チャート → 2 ページ）', async () => {
    const wrapper = mount(ChartList);
    const charts = Array.from({ length: 4 }, (_, i) => createMockChart({ musicId: `music${i}` }));
    await wrapper.vm.setData(createMockChartList(charts));
    expect(wrapper.vm.maxPage).toBe(2);
  });

  test('gotoPage() でページが切り替わる', async () => {
    const wrapper = mount(ChartList);
    const charts = Array.from({ length: 4 }, (_, i) => createMockChart({ musicId: `music${i}`, title: `Song ${i}` }));
    await wrapper.vm.setData(createMockChartList(charts));
    await wrapper.vm.$nextTick();

    // Page 1: should show first 3 songs
    expect(wrapper.vm.currentPage).toBe(1);
    expect(wrapper.vm.pageCharts.length).toBe(3);

    // Go to page 2
    wrapper.vm.gotoPage(2);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.currentPage).toBe(2);
    expect(wrapper.vm.pageCharts.length).toBe(1);
  });

  test('setData() は常にページ 1 から表示する', async () => {
    const wrapper = mount(ChartList);
    const charts = Array.from({ length: 6 }, (_, i) => createMockChart({ musicId: `music${i}` }));
    await wrapper.vm.setData(createMockChartList(charts));
    wrapper.vm.gotoPage(2);
    // Call setData again
    const newCharts = [createMockChart({ musicId: 'new001' })];
    await wrapper.vm.setData(createMockChartList(newCharts));
    expect(wrapper.vm.currentPage).toBe(1);
  });

  test('スコア文字列が表示される', async () => {
    const wrapper = mount(ChartList);
    const charts = [createMockChart({ scoreString: '999990', title: 'High Score Song' })];
    await wrapper.vm.setData(createMockChartList(charts));
    await wrapper.vm.$nextTick();
    const scoreEl = wrapper.find('.score_list .score');
    expect(scoreEl.text()).toBe('999990');
  });

  test('難易度クラス文字列が適用される', async () => {
    const wrapper = mount(ChartList);
    const charts = [createMockChart({ difficultyClassString: 'expert' })];
    await wrapper.vm.setData(createMockChartList(charts));
    await wrapper.vm.$nextTick();
    const levelEl = wrapper.find('.score_list .level');
    expect(levelEl.classes()).toContain('expert');
  });
});
