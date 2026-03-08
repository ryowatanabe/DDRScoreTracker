/**
 * @jest-environment jsdom
 */

import { mount } from '@vue/test-utils';
import FilterEditor from '../../src/browser_action/filter-editor.vue';

jest.mock('../../src/static/common/I18n.js', () => ({
  I18n: { getMessage: jest.fn((key) => `[${key}]`) },
}));

function createMockApp(conditions = []) {
  let _conditions = [...conditions];
  return {
    getSavedConditions: jest.fn(() => _conditions),
    saveSavedConditions: jest.fn((updated) => {
      _conditions = updated;
    }),
  };
}

describe('filter-editor.vue', () => {
  test('初期状態では savedConditions が空配列', () => {
    const wrapper = mount(FilterEditor);
    expect(wrapper.vm.savedConditions).toEqual([]);
    wrapper.unmount();
  });

  test('initialize() で app がセットされる', () => {
    const wrapper = mount(FilterEditor);
    const mockApp = createMockApp([]);
    wrapper.vm.initialize(mockApp);
    // load() を呼んで savedConditions が取得できるか確認
    wrapper.vm.load();
    expect(mockApp.getSavedConditions).toHaveBeenCalled();
    wrapper.unmount();
  });

  test('load() 後に savedConditions が設定される', () => {
    const wrapper = mount(FilterEditor);
    const conditions = [
      { name: 'Filter A', data: {} },
      { name: 'Filter B', data: {} },
    ];
    const mockApp = createMockApp(conditions);
    wrapper.vm.initialize(mockApp);
    wrapper.vm.load();
    expect(wrapper.vm.savedConditions.length).toBe(2);
    expect(wrapper.vm.savedConditions[0].name).toBe('Filter A');
    wrapper.unmount();
  });

  test('load() 後に savedConditions が DOM に描画される', async () => {
    const wrapper = mount(FilterEditor, { attachTo: document.body });
    const conditions = [
      { name: 'Filter A', data: {} },
      { name: 'Filter B', data: {} },
    ];
    const mockApp = createMockApp(conditions);
    wrapper.vm.initialize(mockApp);
    wrapper.vm.load();
    await wrapper.vm.$nextTick();
    const inputs = wrapper.findAll('input[type="text"]');
    expect(inputs.length).toBe(2);
    wrapper.unmount();
  });

  test('movePrevious() で要素が前に移動する', () => {
    const wrapper = mount(FilterEditor);
    const conditions = [{ name: 'Filter A' }, { name: 'Filter B' }, { name: 'Filter C' }];
    const mockApp = createMockApp(conditions);
    wrapper.vm.initialize(mockApp);
    wrapper.vm.load();

    // Move index 1 (Filter B) to index 0
    wrapper.vm.movePrevious(1);

    expect(mockApp.saveSavedConditions).toHaveBeenCalled();
    expect(wrapper.vm.savedConditions[0].name).toBe('Filter B');
    expect(wrapper.vm.savedConditions[1].name).toBe('Filter A');
    wrapper.unmount();
  });

  test('moveNext() で要素が後ろに移動する', () => {
    const wrapper = mount(FilterEditor);
    const conditions = [{ name: 'Filter A' }, { name: 'Filter B' }, { name: 'Filter C' }];
    const mockApp = createMockApp(conditions);
    wrapper.vm.initialize(mockApp);
    wrapper.vm.load();

    // Move index 0 (Filter A) to index 1
    wrapper.vm.moveNext(0);

    expect(mockApp.saveSavedConditions).toHaveBeenCalled();
    expect(wrapper.vm.savedConditions[0].name).toBe('Filter B');
    expect(wrapper.vm.savedConditions[1].name).toBe('Filter A');
    wrapper.unmount();
  });

  test('deleteSavedCondition() で要素が削除される', () => {
    const wrapper = mount(FilterEditor);
    const conditions = [{ name: 'Filter A' }, { name: 'Filter B' }, { name: 'Filter C' }];
    const mockApp = createMockApp(conditions);
    wrapper.vm.initialize(mockApp);
    wrapper.vm.load();

    // Delete index 1 (Filter B)
    wrapper.vm.deleteSavedCondition(1);

    expect(mockApp.saveSavedConditions).toHaveBeenCalled();
    expect(wrapper.vm.savedConditions.length).toBe(2);
    expect(wrapper.vm.savedConditions[0].name).toBe('Filter A');
    expect(wrapper.vm.savedConditions[1].name).toBe('Filter C');
    wrapper.unmount();
  });

  test('save() 後に savedConditions が更新される', () => {
    const wrapper = mount(FilterEditor);
    const conditions = [{ name: 'Filter A' }, { name: 'Filter B' }];
    const mockApp = createMockApp(conditions);
    wrapper.vm.initialize(mockApp);
    wrapper.vm.load();

    const initialLength = wrapper.vm.savedConditions.length;
    wrapper.vm.deleteSavedCondition(0);

    expect(wrapper.vm.savedConditions.length).toBe(initialLength - 1);
    wrapper.unmount();
  });

  test('先頭要素の movePrevious ボタンは disabled', async () => {
    const wrapper = mount(FilterEditor, { attachTo: document.body });
    const conditions = [{ name: 'Filter A' }, { name: 'Filter B' }];
    const mockApp = createMockApp(conditions);
    wrapper.vm.initialize(mockApp);
    wrapper.vm.load();
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll('div > div');
    const firstRowButtons = rows[0].findAll('button');
    // First button is "↑" (movePrevious), should be disabled for index 0
    expect(firstRowButtons[0].element.disabled).toBe(true);
    wrapper.unmount();
  });

  test('末尾要素の moveNext ボタンは disabled', async () => {
    const wrapper = mount(FilterEditor, { attachTo: document.body });
    const conditions = [{ name: 'Filter A' }, { name: 'Filter B' }];
    const mockApp = createMockApp(conditions);
    wrapper.vm.initialize(mockApp);
    wrapper.vm.load();
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll('div > div');
    const lastRowButtons = rows[rows.length - 1].findAll('button');
    // Second button is "↓" (moveNext), should be disabled for last index
    expect(lastRowButtons[1].element.disabled).toBe(true);
    wrapper.unmount();
  });
});
