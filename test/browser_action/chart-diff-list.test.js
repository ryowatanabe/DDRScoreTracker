/**
 * @jest-environment jsdom
 */

import { mount } from '@vue/test-utils';
import ChartDiffList from '../../src/browser_action/chart-diff-list.vue';

jest.mock('../../src/static/common/I18n.js', () => ({
  I18n: { getMessage: jest.fn((key) => `[${key}]`) },
}));

jest.mock('../../src/static/common/Constants.js', () => ({
  Constants: { PAGE_LENGTH: 3 },
}));

function createMockDifference(overrides = {}) {
  return {
    musicId: 'music001',
    playMode: 0,
    difficulty: 3,
    difficultyClassString: 'expert',
    levelString: '15',
    playModeSymbol: "'",
    title: 'Test Song',
    beforeFlareRankClassString: 'flare_none',
    beforeFlareRankSymbol: '',
    beforeFlareSkill: '0',
    beforeScoreRankClassString: 'rank_a',
    beforeScoreRankString: 'A',
    beforeClearTypeClassString: 'clear',
    beforeFullComboSymbol: '',
    beforeScoreString: '800000',
    afterFlareRankClassString: 'flare_5',
    afterFlareRankSymbol: 'Ⅴ',
    afterFlareSkill: '1234',
    afterScoreRankClassString: 'rank_aaa',
    afterScoreRankString: 'AAA',
    afterClearTypeClassString: 'marvelous_fc',
    afterFullComboSymbol: '○',
    afterScoreString: '1000000',
    ...overrides,
  };
}

describe('chart-diff-list.vue', () => {
  test('初期状態では differences が空配列', () => {
    const wrapper = mount(ChartDiffList, { attachTo: document.body });
    expect(wrapper.vm.differences).toEqual([]);
    wrapper.unmount();
  });

  test('setData([]) で differences が空になる', () => {
    const wrapper = mount(ChartDiffList, { attachTo: document.body });
    wrapper.vm.setData([]);
    expect(wrapper.vm.differences).toEqual([]);
    wrapper.unmount();
  });

  test('setData(differences) で differences が設定される', () => {
    const wrapper = mount(ChartDiffList, { attachTo: document.body });
    const diffs = [createMockDifference(), createMockDifference({ musicId: 'music002', title: 'Song 2' })];
    wrapper.vm.setData(diffs);
    expect(wrapper.vm.differences.length).toBe(2);
    wrapper.unmount();
  });

  test('setData() 後に maxPage が計算される', () => {
    const wrapper = mount(ChartDiffList, { attachTo: document.body });
    const diffs = Array.from({ length: 5 }, (_, i) => createMockDifference({ musicId: `music${i}` }));
    wrapper.vm.setData(diffs);
    // PAGE_LENGTH=3, 5 diffs → 2 pages
    expect(wrapper.vm.maxPage).toBe(2);
    wrapper.unmount();
  });

  test('gotoPage() で pageDifferences が更新される', () => {
    const wrapper = mount(ChartDiffList, { attachTo: document.body });
    const diffs = Array.from({ length: 5 }, (_, i) => createMockDifference({ musicId: `music${i}` }));
    wrapper.vm.setData(diffs);
    expect(wrapper.vm.pageDifferences.length).toBe(3);
    wrapper.vm.gotoPage(2);
    expect(wrapper.vm.pageDifferences.length).toBe(2);
    expect(wrapper.vm.currentPage).toBe(2);
    wrapper.unmount();
  });

  test('differences が 0 件のとき "no update" メッセージが表示される', async () => {
    const wrapper = mount(ChartDiffList, { attachTo: document.body });
    wrapper.vm.setData([]);
    await wrapper.vm.$nextTick();
    // The "no update" message div should be present
    const text = wrapper.html();
    expect(text).toContain('[diff_container_no_update]');
    wrapper.unmount();
  });

  test('differences が 1 件以上のとき score_list が表示される', async () => {
    const wrapper = mount(ChartDiffList, { attachTo: document.body });
    const diffs = [createMockDifference()];
    wrapper.vm.setData(diffs);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.score_list').exists()).toBe(true);
    wrapper.unmount();
  });

  test('setData() は常にページ 1 から開始する', () => {
    const wrapper = mount(ChartDiffList, { attachTo: document.body });
    const diffs = Array.from({ length: 5 }, (_, i) => createMockDifference({ musicId: `music${i}` }));
    wrapper.vm.setData(diffs);
    wrapper.vm.gotoPage(2);
    // New setData call resets to page 1
    wrapper.vm.setData([createMockDifference({ musicId: 'new001' })]);
    expect(wrapper.vm.currentPage).toBe(1);
    wrapper.unmount();
  });
});
