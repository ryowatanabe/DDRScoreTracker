import { Constants } from '../../../src/static/common/Constants.js';
import { MusicData } from '../../../src/static/common/MusicData.js';

test(`MusicData.merge should throw exception when id mismatch occurs`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const target = new MusicData('id2', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  expect(() => {
    base.merge(target);
  }).toThrow();
});

test(`MusicData.merge merge value onto empty (title)`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, 'test', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const expected = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, 'test', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  base.merge(target);
  expect(base).toStrictEqual(expected);
});

test(`MusicData.merge merge value onto another value (title)`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, 'test', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, 'test2', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const expected = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, 'test2', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  base.merge(target);
  expect(base).toStrictEqual(expected);
});

test(`MusicData.merge merge empty onto value (title)`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, 'test', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const expected = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, 'test', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  base.merge(target);
  expect(base).toStrictEqual(expected);
});

test(`MusicData.merge merge value onto empty (type)`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.UNKNOWN, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const expected = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  base.merge(target);
  expect(base).toStrictEqual(expected);
});

test(`MusicData.merge merge value onto another value (type)`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NONSTOP, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const expected = new MusicData('id', Constants.MUSIC_TYPE.NONSTOP, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  base.merge(target);
  expect(base).toStrictEqual(expected);
});

test(`MusicData.merge merge empty onto value (type)`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const target = new MusicData('id', Constants.MUSIC_TYPE.UNKNOWN, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const expected = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  base.merge(target);
  expect(base).toStrictEqual(expected);
});

test(`MusicData.merge merge value onto empty (difficulty)`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [1, 2, 3, 4, 5, 6, 7, 8, 9], 0);
  const expected = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [1, 2, 3, 4, 5, 6, 7, 8, 9], 0);
  base.merge(target);
  expect(base).toStrictEqual(expected);
});

test(`MusicData.merge merge value onto another value (difficulty)`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [1, 2, 3, 4, 5, 6, 7, 8, 9], 0);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [10, 0, 11, 0, 12, 0, 13, 0, 14], 0);
  const expected = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [10, 2, 11, 4, 12, 6, 13, 8, 14], 0);
  base.merge(target);
  expect(base).toStrictEqual(expected);
});

test(`MusicData.merge merge value onto another value (difficulty)`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [1, 2, 3, 4, 5, 6, 7, 8, 9], 0);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 10, 0, 11, 0, 12, 0, 13, 0], 0);
  const expected = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [1, 10, 3, 11, 5, 12, 7, 13, 9], 0);
  base.merge(target);
  expect(base).toStrictEqual(expected);
});

test(`MusicData.merge merge smaller value onto another value (difficulty)`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [11, 12, 13, 14, 15, 16, 17, 18, 19], 0);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 10, 0, 11, 0, 12, 0, 13, 0], 0);
  const expected = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [11, 10, 13, 11, 15, 12, 17, 13, 19], 0);
  base.merge(target);
  expect(base).toStrictEqual(expected);
});

test(`MusicData.merge merge empty onto value (difficulty)`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [1, 2, 3, 4, 5, 6, 7, 8, 9], 0);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const expected = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [1, 2, 3, 4, 5, 6, 7, 8, 9], 0);
  base.merge(target);
  expect(base).toStrictEqual(expected);
});

test(`MusicData.merge merge value onto empty (isDeleted)`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 1);
  const expected = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 1);
  base.merge(target);
  expect(base).toStrictEqual(expected);
});

test(`MusicData.merge merge empty onto value (isDeleted)`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 1);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const expected = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 1);
  const result = base.merge(target);
  expect(base).toStrictEqual(expected);
  expect(result).toBe(false);
});

test(`MusicData.merge merge value onto empty (isDeleted) returns true`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 1);
  const result = base.merge(target);
  expect(base.isDeleted).toBe(1);
  expect(result).toBe(true);
});

test(`MusicData.merge same isDeleted value does not update`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 1);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 1);
  const result = base.merge(target);
  expect(base.isDeleted).toBe(1);
  expect(result).toBe(false);
});

test(`MusicData.merge sets containedVersion when target has value and base is null`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0, null);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0, 15);
  const result = base.merge(target);
  expect(base.containedVersion).toBe(15);
  expect(result).toBe(true);
});

test(`MusicData.merge does not overwrite containedVersion when target is null`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0, 15);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0, null);
  const result = base.merge(target);
  expect(base.containedVersion).toBe(15);
  expect(result).toBe(false);
});

test(`MusicData.merge updates containedVersion when target has different non-null value`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0, 15);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0, 19);
  const result = base.merge(target);
  expect(base.containedVersion).toBe(19);
  expect(result).toBe(true);
});

test(`MusicData.merge does not update when containedVersion values are equal`, () => {
  const base = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0, 15);
  const target = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0, 15);
  const result = base.merge(target);
  expect(base.containedVersion).toBe(15);
  expect(result).toBe(false);
});
