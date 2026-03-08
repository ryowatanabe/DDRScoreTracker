import { MusicData } from '../../../src/static/common/MusicData.js';
import { Constants } from '../../../src/static/common/Constants.js';

test('MusicData.createEmptyData creates an instance with expected defaults', () => {
  const musicData = MusicData.createEmptyData('testId', Constants.MUSIC_TYPE.NORMAL);
  expect(musicData.musicId).toBe('testId');
  expect(musicData.type).toBe(Constants.MUSIC_TYPE.NORMAL);
  expect(musicData.title).toBe('');
  expect(musicData.difficulty).toStrictEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  expect(musicData.isDeleted).toBe(0);
});

test('MusicData.createEmptyData with NONSTOP type', () => {
  const musicData = MusicData.createEmptyData('nonstopId', Constants.MUSIC_TYPE.NONSTOP);
  expect(musicData.musicId).toBe('nonstopId');
  expect(musicData.type).toBe(Constants.MUSIC_TYPE.NONSTOP);
});
