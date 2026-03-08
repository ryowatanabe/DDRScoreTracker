import { MusicData } from '../../../src/static/common/MusicData.js';
import { Constants } from '../../../src/static/common/Constants.js';

test('MusicData.createFromString with valid string', () => {
  // format: musicId \t type \t isDeleted \t diff[0..8] \t title  (13 elements)
  const encodedString = '91qD6DbDqi96qbIO66oboliPD8IPP6io\t0\t0\t3\t7\t11\t13\t16\t7\t11\t13\t16\t輪廻転生';
  const musicData = MusicData.createFromString(encodedString);
  expect(musicData).not.toBeNull();
  expect(musicData.musicId).toBe('91qD6DbDqi96qbIO66oboliPD8IPP6io');
  expect(musicData.type).toBe(Constants.MUSIC_TYPE.NORMAL);
  expect(musicData.isDeleted).toBe(0);
  expect(musicData.difficulty).toStrictEqual([3, 7, 11, 13, 16, 7, 11, 13, 16]);
  expect(musicData.title).toBe('輪廻転生');
});

test('MusicData.createFromString with empty string returns null', () => {
  expect(MusicData.createFromString('')).toBeNull();
});

test('MusicData.createFromString with whitespace-only string returns null', () => {
  expect(MusicData.createFromString('   ')).toBeNull();
});

test('MusicData.createFromString with wrong element count returns null', () => {
  const shortString = 'id\t0\t0\t1\t2';
  expect(MusicData.createFromString(shortString)).toBeNull();
});

test('MusicData.createFromString with isDeleted=1', () => {
  const encodedString = 'musicId001\t0\t1\t3\t7\t11\t13\t16\t7\t11\t13\t16\tSong Title';
  const musicData = MusicData.createFromString(encodedString);
  expect(musicData).not.toBeNull();
  expect(musicData.isDeleted).toBe(1);
});
