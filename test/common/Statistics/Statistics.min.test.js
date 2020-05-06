import { Statistics } from '../../../src/static/common/Statistics.js';

test('Statistics.min (not array)', () => {
  expect(Statistics.min('hoge')).toStrictEqual(null);
});

test('Statistics.min (empty)', () => {
  expect(Statistics.min([])).toStrictEqual(null);
});

test('Statistics.min (sorted)', () => {
  expect(Statistics.min([1, 2, 3])).toStrictEqual(1);
});

test('Statistics.min (not sorted)', () => {
  expect(Statistics.min([3, 1, 2])).toStrictEqual(1);
});

test('Statistics.min (not destructive)', () => {
  const before = [3, 1, 2];
  let after = before.slice();
  Statistics.min(after);
  expect(after).toStrictEqual(before);
});
