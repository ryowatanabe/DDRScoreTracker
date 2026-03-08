import { MusicList } from '../../../src/static/common/MusicList.js';
import { MusicData } from '../../../src/static/common/MusicData.js';
import { Constants } from '../../../src/static/common/Constants.js';

// mock chrome API
global.chrome = {
  runtime: {
    sendMessage: () => {},
  },
};

test('MusicList.applyMusicData adds new music and returns true', () => {
  const musicList = new MusicList();
  const musicData = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, 'Song A', [0, 5, 8, 12, 0, 0, 0, 0, 0], 0);
  const result = musicList.applyMusicData(musicData);
  expect(result).toBe(true);
  expect(musicList.hasMusic('music001')).toBe(true);
});

test('MusicList.applyMusicData merges existing music when changed and returns true', () => {
  const musicList = new MusicList();
  const musicData1 = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, '', [0, 5, 8, 12, 0, 0, 0, 0, 0], 0);
  musicList.applyMusicData(musicData1);
  const musicData2 = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, 'Song A', [0, 5, 8, 12, 0, 0, 0, 0, 0], 0);
  const result = musicList.applyMusicData(musicData2);
  expect(result).toBe(true);
  expect(musicList.getMusicDataById('music001').title).toBe('Song A');
});

test('MusicList.applyMusicData returns false when no change occurs', () => {
  const musicList = new MusicList();
  const musicData1 = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, 'Song A', [0, 5, 8, 12, 0, 0, 0, 0, 0], 0);
  musicList.applyMusicData(musicData1);
  const musicData2 = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, 'Song A', [0, 5, 8, 12, 0, 0, 0, 0, 0], 0);
  const result = musicList.applyMusicData(musicData2);
  expect(result).toBe(false);
});

test('MusicList.applyMusicData removes music when isDeleted=2 and music exists, returns true', () => {
  const musicList = new MusicList();
  const musicData1 = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, 'Song A', [0, 5, 8, 12, 0, 0, 0, 0, 0], 0);
  musicList.applyMusicData(musicData1);
  const musicDataDeleted = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, 'Song A', [0, 5, 8, 12, 0, 0, 0, 0, 0], 2);
  const result = musicList.applyMusicData(musicDataDeleted);
  expect(result).toBe(true);
  expect(musicList.hasMusic('music001')).toBe(false);
});

test('MusicList.applyMusicData returns false when isDeleted=2 but music does not exist', () => {
  const musicList = new MusicList();
  const musicDataDeleted = new MusicData('nonexistent', Constants.MUSIC_TYPE.NORMAL, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 2);
  const result = musicList.applyMusicData(musicDataDeleted);
  expect(result).toBe(false);
});

test('MusicList.applyObject creates from storage object and applies', () => {
  const musicList = new MusicList();
  const object = {
    musicId: 'music001',
    type: Constants.MUSIC_TYPE.NORMAL,
    title: 'Song A',
    difficulty: [0, 5, 8, 12, 0, 0, 0, 0, 0],
    isDeleted: 0,
  };
  const result = musicList.applyObject(object);
  expect(result).toBe(true);
  expect(musicList.hasMusic('music001')).toBe(true);
});

test('MusicList.applyEncodedString applies from encoded string', () => {
  const musicList = new MusicList();
  const encodedString = '91qD6DbDqi96qbIO66oboliPD8IPP6io\t0\t0\t3\t7\t11\t13\t16\t7\t11\t13\t16\t輪廻転生';
  const result = musicList.applyEncodedString(encodedString);
  expect(result).toBe(true);
  expect(musicList.hasMusic('91qD6DbDqi96qbIO66oboliPD8IPP6io')).toBe(true);
});
