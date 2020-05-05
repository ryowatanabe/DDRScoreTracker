import { Statistics } from '../../../src/static/common/Statistics.js';

test('Statistics.median (not array)', () => {
  expect(Statistics.median('hoge')).toStrictEqual(null);
});

test('Statistics.median (empty)', () => {
  expect(Statistics.median([])).toStrictEqual(null);
});

test('Statistics.median (odd number of elements / sorted)', () => {
  expect(Statistics.median([1, 10, 100, 1000, 10000])).toStrictEqual(100);
});

test('Statistics.median (odd number of elements / not sorted)', () => {
  expect(Statistics.median([1000, 10, 100, 10000, 1])).toStrictEqual(100);
});

test('Statistics.median (even number of elements / sorted)', () => {
  expect(Statistics.median([10, 100, 1000, 10000])).toStrictEqual(550);
});

test('Statistics.median (even number of elements / not sorted)', () => {
  expect(Statistics.median([1000, 10, 10000, 100])).toStrictEqual(550);
});
