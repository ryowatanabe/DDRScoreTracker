import { Statistics } from '../../../src/static/common/Statistics.js';

test('Statistics.average (not array)', () => {
  expect(Statistics.average('hoge')).toStrictEqual(null);
});

test('Statistics.average (empty)', () => {
  expect(Statistics.average([])).toStrictEqual(null);
});

test('Statistics.average (sorted)', () => {
  expect(Statistics.average([10, 100, 1000])).toStrictEqual(370);
});

test('Statistics.average (not sorted)', () => {
  expect(Statistics.average([1000, 10, 100])).toStrictEqual(370);
});
