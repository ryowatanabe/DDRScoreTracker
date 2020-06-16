import { Util } from '../../../src/static/common/Util.js';

test('Util.getPlayMode (bSP)', () => {
  expect(Util.getPlayMode(0)).toBe(0);
});
test('Util.getPlayMode (BSP)', () => {
  expect(Util.getPlayMode(1)).toBe(0);
});
test('Util.getPlayMode (DSP)', () => {
  expect(Util.getPlayMode(2)).toBe(0);
});
test('Util.getPlayMode (ESP)', () => {
  expect(Util.getPlayMode(3)).toBe(0);
});
test('Util.getPlayMode (CSP)', () => {
  expect(Util.getPlayMode(4)).toBe(0);
});
test('Util.getPlayMode (BDP)', () => {
  expect(Util.getPlayMode(5)).toBe(1);
});
test('Util.getPlayMode (DDP)', () => {
  expect(Util.getPlayMode(6)).toBe(1);
});
test('Util.getPlayMode (EDP)', () => {
  expect(Util.getPlayMode(7)).toBe(1);
});
test('Util.getPlayMode (CDP)', () => {
  expect(Util.getPlayMode(8)).toBe(1);
});
