/**
 * @jest-environment jsdom
 */

import { mount } from '@vue/test-utils';
import LogContainer from '../../src/browser_action/log-container.vue';

jest.mock('../../src/static/common/I18n.js', () => ({
  I18n: { getMessage: jest.fn((key) => `[${key}]`) },
}));

jest.mock('../../src/static/common/Logger.js', () => ({
  Logger: {
    MESSAGE_TYPE: 'LOG',
    LOG_LEVEL: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 },
  },
}));

// nextTick から open() を切り離すためのモック
jest.mock('vue', () => {
  const actual = jest.requireActual('vue');
  return {
    ...actual,
    nextTick: jest.fn(() => Promise.resolve()),
  };
});

describe('log-container.vue', () => {
  test('初期状態ではログが空', () => {
    const wrapper = mount(LogContainer, { attachTo: document.body });
    expect(wrapper.vm.log).toEqual([]);
    wrapper.unmount();
  });

  test('初期状態では enableDebugLog が false', () => {
    const wrapper = mount(LogContainer, { attachTo: document.body });
    expect(wrapper.vm.enableDebugLog).toBe(false);
    wrapper.unmount();
  });

  test('pushLog() でメッセージが log に追加される（INFO レベル）', async () => {
    const wrapper = mount(LogContainer, { attachTo: document.body });
    wrapper.vm.pushLog({ type: 'LOG', level: 1, content: 'Test message' });
    expect(wrapper.vm.log).toContain('Test message');
    wrapper.unmount();
  });

  test('pushLog() でメッセージが log に追加される（WARN レベル）', () => {
    const wrapper = mount(LogContainer, { attachTo: document.body });
    wrapper.vm.pushLog({ type: 'LOG', level: 2, content: 'Warn message' });
    expect(wrapper.vm.log).toContain('Warn message');
    wrapper.unmount();
  });

  test('pushLog() で DEBUG メッセージは enableDebugLog=false のとき無視される', () => {
    const wrapper = mount(LogContainer, { attachTo: document.body });
    wrapper.vm.enableDebugLog = false;
    wrapper.vm.pushLog({ type: 'LOG', level: 0, content: 'Debug message' });
    expect(wrapper.vm.log).not.toContain('Debug message');
    wrapper.unmount();
  });

  test('pushLog() で DEBUG メッセージは enableDebugLog=true のとき追加される', () => {
    const wrapper = mount(LogContainer, { attachTo: document.body });
    wrapper.vm.enableDebugLog = true;
    wrapper.vm.pushLog({ type: 'LOG', level: 0, content: 'Debug message' });
    expect(wrapper.vm.log).toContain('Debug message');
    wrapper.unmount();
  });

  test('pushLog() で type が MESSAGE_TYPE でないメッセージは無視される', () => {
    const wrapper = mount(LogContainer, { attachTo: document.body });
    wrapper.vm.pushLog({ type: 'OTHER', level: 1, content: 'Other message' });
    expect(wrapper.vm.log).toEqual([]);
    wrapper.unmount();
  });

  test('flush() でログがクリアされる', () => {
    const wrapper = mount(LogContainer, { attachTo: document.body });
    wrapper.vm.pushLog({ type: 'LOG', level: 1, content: 'Message 1' });
    wrapper.vm.pushLog({ type: 'LOG', level: 1, content: 'Message 2' });
    expect(wrapper.vm.log.length).toBe(2);
    wrapper.vm.flush();
    expect(wrapper.vm.log).toEqual([]);
    wrapper.unmount();
  });

  test('複数のメッセージが順番に追加される', () => {
    const wrapper = mount(LogContainer, { attachTo: document.body });
    wrapper.vm.pushLog({ type: 'LOG', level: 1, content: 'First' });
    wrapper.vm.pushLog({ type: 'LOG', level: 1, content: 'Second' });
    wrapper.vm.pushLog({ type: 'LOG', level: 1, content: 'Third' });
    expect(wrapper.vm.log).toEqual(['First', 'Second', 'Third']);
    wrapper.unmount();
  });

  test('ログが DOM に描画される', async () => {
    const wrapper = mount(LogContainer, { attachTo: document.body });
    wrapper.vm.pushLog({ type: 'LOG', level: 1, content: 'Rendered log' });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.log-data').text()).toContain('Rendered log');
    wrapper.unmount();
  });
});
