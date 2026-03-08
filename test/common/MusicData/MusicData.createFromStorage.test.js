import { MusicData } from '../../../src/static/common/MusicData.js';
import { Constants } from '../../../src/static/common/Constants.js';

test('MusicData.createFromStorage creates correct instance', () => {
  const storageData = {
    musicId: 'abc123',
    type: Constants.MUSIC_TYPE.NORMAL,
    title: 'Test Song',
    difficulty: [0, 5, 8, 12, 0, 0, 0, 0, 0],
    isDeleted: 0,
  };
  const musicData = MusicData.createFromStorage(storageData);
  expect(musicData.musicId).toBe('abc123');
  expect(musicData.type).toBe(Constants.MUSIC_TYPE.NORMAL);
  expect(musicData.title).toBe('Test Song');
  expect(musicData.difficulty).toStrictEqual([0, 5, 8, 12, 0, 0, 0, 0, 0]);
  expect(musicData.isDeleted).toBe(0);
});

test('MusicData.createFromStorage with isDeleted=1', () => {
  const storageData = {
    musicId: 'deleted123',
    type: Constants.MUSIC_TYPE.NORMAL,
    title: 'Deleted Song',
    difficulty: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    isDeleted: 1,
  };
  const musicData = MusicData.createFromStorage(storageData);
  expect(musicData.isDeleted).toBe(1);
});
