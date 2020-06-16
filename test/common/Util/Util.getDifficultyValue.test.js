import { Util } from '../../../src/static/common/Util.js';

test('Util.getDifficultyValue (bSP)', () => {
  expect(Util.getDifficultyValue(0, 0)).toBe(0);
});
test('Util.getDifficultyValue (BSP)', () => {
  expect(Util.getDifficultyValue(0, 1)).toBe(1);
});
test('Util.getDifficultyValue (DSP)', () => {
  expect(Util.getDifficultyValue(0, 2)).toBe(2);
});
test('Util.getDifficultyValue (ESP)', () => {
  expect(Util.getDifficultyValue(0, 3)).toBe(3);
});
test('Util.getDifficultyValue (CSP)', () => {
  expect(Util.getDifficultyValue(0, 4)).toBe(4);
});
test('Util.getDifficultyValue (BDP)', () => {
  expect(Util.getDifficultyValue(1, 1)).toBe(5);
});
test('Util.getDifficultyValue (DDP)', () => {
  expect(Util.getDifficultyValue(1, 2)).toBe(6);
});
test('Util.getDifficultyValue (EDP)', () => {
  expect(Util.getDifficultyValue(1, 3)).toBe(7);
});
test('Util.getDifficultyValue (CDP)', () => {
  expect(Util.getDifficultyValue(1, 4)).toBe(8);
});
