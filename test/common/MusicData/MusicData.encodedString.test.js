import { MusicData } from '../../../src/static/common/MusicData.js';
import { Constants } from '../../../src/static/common/Constants.js';

test('MusicData.encodedString produces tab-separated string matching createFromString input', () => {
  const encodedString = '91qD6DbDqi96qbIO66oboliPD8IPP6io\t0\t0\t3\t7\t11\t13\t16\t7\t11\t13\t16\t輪廻転生';
  const musicData = MusicData.createFromString(encodedString);
  expect(musicData.encodedString).toBe(encodedString);
});

test('MusicData.encodedString includes musicId, type, isDeleted, difficulty, title in order', () => {
  const musicData = new MusicData('testId', Constants.MUSIC_TYPE.NORMAL, 'Test Song', [0, 5, 8, 12, 0, 0, 0, 0, 0], 0);
  const parts = musicData.encodedString.split('\t');
  expect(parts[0]).toBe('testId');
  expect(parts[1]).toBe('0'); // NORMAL
  expect(parts[2]).toBe('0'); // isDeleted
  expect(parts[3]).toBe('0');
  expect(parts[4]).toBe('5');
  expect(parts[5]).toBe('8');
  expect(parts[6]).toBe('12');
  expect(parts[7]).toBe('0');
  expect(parts[8]).toBe('0');
  expect(parts[9]).toBe('0');
  expect(parts[10]).toBe('0');
  expect(parts[11]).toBe('0');
  expect(parts[12]).toBe('Test Song');
});
