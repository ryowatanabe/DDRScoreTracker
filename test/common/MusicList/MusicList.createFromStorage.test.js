import { MusicList } from '../../../src/static/common/MusicList.js';
import { MusicData } from '../../../src/static/common/MusicData.js';
import { Constants } from '../../../src/static/common/Constants.js';

// mock chrome API
global.chrome = {
  runtime: {
    sendMessage: () => {},
  },
};

test('MusicList.createFromStorage creates MusicList from storage data', () => {
  const storageData = {
    music001: {
      musicId: 'music001',
      type: Constants.MUSIC_TYPE.NORMAL,
      title: 'Song A',
      difficulty: [0, 5, 8, 12, 0, 0, 0, 0, 0],
      isDeleted: 0,
    },
    music002: {
      musicId: 'music002',
      type: Constants.MUSIC_TYPE.NORMAL,
      title: 'Song B',
      difficulty: [0, 7, 10, 14, 0, 0, 0, 0, 0],
      isDeleted: 0,
    },
  };
  const musicList = MusicList.createFromStorage(storageData);
  expect(musicList.hasMusic('music001')).toBe(true);
  expect(musicList.hasMusic('music002')).toBe(true);
  expect(musicList.getMusicDataById('music001').title).toBe('Song A');
  expect(musicList.getMusicDataById('music002').title).toBe('Song B');
});

test('MusicList.createFromStorage with empty storage creates empty MusicList', () => {
  const musicList = MusicList.createFromStorage({});
  expect(musicList.musicIds).toHaveLength(0);
});
