import { MusicList } from '../../../src/static/common/MusicList.js';
import { MusicData } from '../../../src/static/common/MusicData.js';
import { Constants } from '../../../src/static/common/Constants.js';

// mock chrome API
global.chrome = {
  runtime: {
    sendMessage: () => {},
  },
};

function createMusicList(ids) {
  const musicList = new MusicList();
  ids.forEach((id) => {
    musicList.applyMusicData(new MusicData(id, Constants.MUSIC_TYPE.NORMAL, `Title ${id}`, [0, 5, 8, 12, 0, 0, 0, 0, 0], 0));
  });
  return musicList;
}

test('MusicList.hasMusic returns true for existing music', () => {
  const musicList = createMusicList(['music001']);
  expect(musicList.hasMusic('music001')).toBe(true);
});

test('MusicList.hasMusic returns false for non-existing music', () => {
  const musicList = createMusicList(['music001']);
  expect(musicList.hasMusic('music999')).toBe(false);
});

test('MusicList.removeMusic removes existing music and returns true', () => {
  const musicList = createMusicList(['music001']);
  const result = musicList.removeMusic('music001');
  expect(result).toBe(true);
  expect(musicList.hasMusic('music001')).toBe(false);
});

test('MusicList.removeMusic returns false for non-existing music', () => {
  const musicList = new MusicList();
  const result = musicList.removeMusic('nonexistent');
  expect(result).toBe(false);
});

test('MusicList.musicIds returns all music IDs', () => {
  const musicList = createMusicList(['music001', 'music002', 'music003']);
  expect(musicList.musicIds).toHaveLength(3);
  expect(musicList.musicIds).toContain('music001');
  expect(musicList.musicIds).toContain('music002');
  expect(musicList.musicIds).toContain('music003');
});

test('MusicList.musicIds returns empty array for empty list', () => {
  const musicList = new MusicList();
  expect(musicList.musicIds).toHaveLength(0);
});

test('MusicList.toStorageData returns musics object', () => {
  const musicList = createMusicList(['music001', 'music002']);
  const storageData = musicList.toStorageData();
  expect(Object.prototype.hasOwnProperty.call(storageData, 'music001')).toBe(true);
  expect(Object.prototype.hasOwnProperty.call(storageData, 'music002')).toBe(true);
});

test('MusicList.getMusicDataById returns correct MusicData', () => {
  const musicList = createMusicList(['music001']);
  const musicData = musicList.getMusicDataById('music001');
  expect(musicData).not.toBeNull();
  expect(musicData.musicId).toBe('music001');
  expect(musicData.title).toBe('Title music001');
});
