import { Constants } from '../../../src/static/common/Constants.js';

test('Constants.getNextMusicType (A20PLUS, SINGLE, NONSTOP)', () => {
  expect(Constants.getNextMusicType(Constants.GAME_VERSION.A20PLUS, Constants.PLAY_MODE.SINGLE, Constants.MUSIC_TYPE.NONSTOP)).toStrictEqual({
    playMode: Constants.PLAY_MODE.SINGLE,
    musicType: Constants.MUSIC_TYPE.GRADE,
  });
});

test('Constants.getNextMusicType (A3, SINGLE, NONSTOP)', () => {
  expect(Constants.getNextMusicType(Constants.GAME_VERSION.A3, Constants.PLAY_MODE.SINGLE, Constants.MUSIC_TYPE.NONSTOP)).toStrictEqual({
    playMode: Constants.PLAY_MODE.SINGLE,
    musicType: Constants.MUSIC_TYPE.GRADE_A3,
  });
});

test('Constants.getNextMusicType (A20PLUS, SINGLE, GRADE_PLUS)', () => {
  expect(Constants.getNextMusicType(Constants.GAME_VERSION.A20PLUS, Constants.PLAY_MODE.SINGLE, Constants.MUSIC_TYPE.GRADE_PLUS)).toStrictEqual({
    playMode: Constants.PLAY_MODE.DOUBLE,
    musicType: Constants.MUSIC_TYPE.NORMAL,
  });
});

test('Constants.getNextMusicType (A3, SINGLE, GRADE_A3)', () => {
  expect(Constants.getNextMusicType(Constants.GAME_VERSION.A3, Constants.PLAY_MODE.SINGLE, Constants.MUSIC_TYPE.GRADE_A3)).toStrictEqual({
    playMode: Constants.PLAY_MODE.DOUBLE,
    musicType: Constants.MUSIC_TYPE.NORMAL,
  });
});

test('Constants.getNextMusicType (A20PLUS, DOUBLE, GRADE_PLUS)', () => {
  expect(Constants.getNextMusicType(Constants.GAME_VERSION.A20PLUS, Constants.PLAY_MODE.DOUBLE, Constants.MUSIC_TYPE.GRADE_PLUS)).toStrictEqual({
    playMode: Constants.PLAY_MODE.UNKNOWN,
    musicType: Constants.MUSIC_TYPE.UNKNOWN,
  });
});

test('Constants.getNextMusicType (A3, DOUBLE, GRADE_A3)', () => {
  expect(Constants.getNextMusicType(Constants.GAME_VERSION.A3, Constants.PLAY_MODE.DOUBLE, Constants.MUSIC_TYPE.GRADE_A3)).toStrictEqual({
    playMode: Constants.PLAY_MODE.UNKNOWN,
    musicType: Constants.MUSIC_TYPE.UNKNOWN,
  });
});
