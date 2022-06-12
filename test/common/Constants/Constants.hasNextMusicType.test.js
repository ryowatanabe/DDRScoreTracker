import { Constants } from '../../../src/static/common/Constants.js';

test('Constants.hasNextMusicType (A20PLUS, SINGLE, NONSTOP)', () => {
  expect(Constants.hasNextMusicType(Constants.GAME_VERSION.A20PLUS, Constants.PLAY_MODE.SINGLE, Constants.MUSIC_TYPE.NONSTOP)).toBe(true);
});

test('Constants.hasNextMusicType (A3, SINGLE, NONSTOP)', () => {
  expect(Constants.hasNextMusicType(Constants.GAME_VERSION.A3, Constants.PLAY_MODE.SINGLE, Constants.MUSIC_TYPE.NONSTOP)).toBe(true);
});

test('Constants.hasNextMusicType (A20PLUS, SINGLE, GRADE_PLUS)', () => {
  expect(Constants.hasNextMusicType(Constants.GAME_VERSION.A20PLUS, Constants.PLAY_MODE.SINGLE, Constants.MUSIC_TYPE.GRADE_PLUS)).toBe(true);
});

test('Constants.hasNextMusicType (A3, SINGLE, GRADE_A3)', () => {
  expect(Constants.hasNextMusicType(Constants.GAME_VERSION.A3, Constants.PLAY_MODE.SINGLE, Constants.MUSIC_TYPE.GRADE_A3)).toBe(true);
});

test('Constants.hasNextMusicType (A20PLUS, DOUBLE, GRADE_PLUS)', () => {
  expect(Constants.hasNextMusicType(Constants.GAME_VERSION.A20PLUS, Constants.PLAY_MODE.DOUBLE, Constants.MUSIC_TYPE.GRADE_PLUS)).toBe(false);
});

test('Constants.hasNextMusicType (A3, DOUBLE, GRADE_A3)', () => {
  expect(Constants.hasNextMusicType(Constants.GAME_VERSION.A3, Constants.PLAY_MODE.DOUBLE, Constants.MUSIC_TYPE.GRADE_A3)).toBe(false);
});
