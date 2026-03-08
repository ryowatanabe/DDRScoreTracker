import { MusicData } from '../../../src/static/common/MusicData.js';
import { Constants } from '../../../src/static/common/Constants.js';

test('MusicData.getLevel returns correct level for given index', () => {
  const musicData = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, 'Title', [0, 5, 8, 12, 0, 0, 7, 11, 0], 0);
  expect(musicData.getLevel(1)).toBe(5);
  expect(musicData.getLevel(2)).toBe(8);
  expect(musicData.getLevel(3)).toBe(12);
});

test('MusicData.getLevel returns 0 for absent difficulty', () => {
  const musicData = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, 'Title', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  expect(musicData.getLevel(0)).toBe(0);
});

test('MusicData.hasDifficulty returns true when difficulty is non-zero', () => {
  const musicData = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, 'Title', [0, 5, 8, 12, 0, 0, 0, 0, 0], 0);
  expect(musicData.hasDifficulty(1)).toBe(true);
  expect(musicData.hasDifficulty(2)).toBe(true);
});

test('MusicData.hasDifficulty returns false when difficulty is zero', () => {
  const musicData = new MusicData('id', Constants.MUSIC_TYPE.NORMAL, 'Title', [0, 5, 8, 12, 0, 0, 0, 0, 0], 0);
  expect(musicData.hasDifficulty(0)).toBe(false);
  expect(musicData.hasDifficulty(4)).toBe(false);
});
