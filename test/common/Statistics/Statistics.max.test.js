import { Statistics } from '../../../src/static/common/Statistics.js';

test('Statistics.max (not array)', () => {
  expect(Statistics.max('hoge')).toStrictEqual(null);
});

test('Statistics.max (empty)', () => {
  expect(Statistics.max([])).toStrictEqual(null);
});

test('Statistics.max (sorted)', () => {
  expect(Statistics.max([3, 2, 1])).toStrictEqual(3);
});

test('Statistics.max (not sorted)', () => {
  expect(Statistics.max([1, 3, 2])).toStrictEqual(3);
});

test('Statistics.max (not destructive)', () => {
  const before = [1, 3, 2];
  let after = before.slice();
  Statistics.max(after);
  expect(after).toStrictEqual(before);
});
