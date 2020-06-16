import { Util } from '../../../src/static/common/Util.js';

test('Util.getDifficulty (bSP)', () => {
  expect(Util.getDifficulty(0)).toBe(0);
});
test('Util.getDifficulty (BSP)', () => {
  expect(Util.getDifficulty(1)).toBe(1);
});
test('Util.getDifficulty (DSP)', () => {
  expect(Util.getDifficulty(2)).toBe(2);
});
test('Util.getDifficulty (ESP)', () => {
  expect(Util.getDifficulty(3)).toBe(3);
});
test('Util.getDifficulty (CSP)', () => {
  expect(Util.getDifficulty(4)).toBe(4);
});
test('Util.getDifficulty (BDP)', () => {
  expect(Util.getDifficulty(5)).toBe(1);
});
test('Util.getDifficulty (DDP)', () => {
  expect(Util.getDifficulty(6)).toBe(2);
});
test('Util.getDifficulty (EDP)', () => {
  expect(Util.getDifficulty(7)).toBe(3);
});
test('Util.getDifficulty (CDP)', () => {
  expect(Util.getDifficulty(8)).toBe(4);
});
