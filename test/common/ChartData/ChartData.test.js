import { ChartData } from '../../../src/static/common/ChartData.js';
import { MusicData } from '../../../src/static/common/MusicData.js';
import { ScoreDetail } from '../../../src/static/common/ScoreDetail.js';
import { Constants } from '../../../src/static/common/Constants.js';

function makeChartData(playMode, difficulty, musicData = null, scoreDetail = null) {
  const chartData = new ChartData('music001', playMode, difficulty);
  chartData.musicData = musicData;
  chartData.scoreDetail = scoreDetail;
  return chartData;
}

test('ChartData.musicType returns UNKNOWN when musicData is null', () => {
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT);
  expect(chartData.musicType).toBe(Constants.MUSIC_TYPE.UNKNOWN);
});

test('ChartData.musicType returns musicData.type when musicData is set', () => {
  const musicData = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, 'Title', [0, 5, 8, 12, 0, 0, 0, 0, 0], 0);
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT, musicData);
  expect(chartData.musicType).toBe(Constants.MUSIC_TYPE.NORMAL);
});

test('ChartData.title returns musicId when musicData is null', () => {
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT);
  expect(chartData.title).toBe('music001');
});

test('ChartData.title returns musicData.title when set', () => {
  const musicData = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, 'Song Title', [0, 5, 8, 12, 0, 0, 0, 0, 0], 0);
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT, musicData);
  expect(chartData.title).toBe('Song Title');
});

test('ChartData.title returns musicId when musicData.title is empty', () => {
  const musicData = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, '', [0, 5, 8, 12, 0, 0, 0, 0, 0], 0);
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT, musicData);
  expect(chartData.title).toBe('music001');
});

test('ChartData.level returns 0 when musicData is null', () => {
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT);
  expect(chartData.level).toBe(0);
});

test('ChartData.level returns correct level for given difficulty', () => {
  const musicData = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, 'Title', [0, 5, 8, 12, 16, 0, 0, 0, 0], 0);
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT, musicData);
  expect(chartData.level).toBe(12);
});

test('ChartData.levelString returns "?" when level is 0', () => {
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT);
  expect(chartData.levelString).toBe('?');
});

test('ChartData.levelString returns level string when non-zero', () => {
  const musicData = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, 'Title', [0, 5, 8, 12, 16, 0, 0, 0, 0], 0);
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT, musicData);
  expect(chartData.levelString).toBe('12');
});

test('ChartData.availability returns 0 when musicData is null', () => {
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT);
  expect(chartData.availability).toBe(0);
});

test('ChartData.availability returns 0 when music is not deleted', () => {
  const musicData = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, 'Title', [0, 5, 8, 12, 0, 0, 0, 0, 0], 0);
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT, musicData);
  expect(chartData.availability).toBe(0);
});

test('ChartData.availability returns 2 when music is deleted without score', () => {
  const musicData = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, 'Title', [0, 5, 8, 12, 0, 0, 0, 0, 0], 1);
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT, musicData, null);
  expect(chartData.availability).toBe(2);
});

test('ChartData.availability returns 1 when music is deleted with score', () => {
  const musicData = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, 'Title', [0, 5, 8, 12, 0, 0, 0, 0, 0], 1);
  const scoreDetail = ScoreDetail.createFromStorage({ score: 900000 });
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT, musicData, scoreDetail);
  expect(chartData.availability).toBe(1);
});

test('ChartData.score returns null when scoreDetail is null', () => {
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT);
  expect(chartData.score).toBeNull();
});

test('ChartData.score returns scoreDetail.score when set', () => {
  const scoreDetail = ScoreDetail.createFromStorage({ score: 900000 });
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT, null, scoreDetail);
  expect(chartData.score).toBe(900000);
});

test('ChartData.clearType returns NO_PLAY when scoreDetail is null', () => {
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT);
  expect(chartData.clearType).toBe(Constants.CLEAR_TYPE.NO_PLAY);
});

test('ChartData.flareRank returns NONE when scoreDetail is null', () => {
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT);
  expect(chartData.flareRank).toBe(Constants.FLARE_RANK.NONE);
});

test('ChartData.flareRank returns actualFlareRank from scoreDetail', () => {
  const scoreDetail = ScoreDetail.createFromStorage({ flareRank: Constants.FLARE_RANK.FLARE_EX });
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT, null, scoreDetail);
  expect(chartData.flareRank).toBe(Constants.FLARE_RANK.FLARE_EX);
});

test('ChartData.scoreString returns empty when scoreDetail is null', () => {
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT);
  expect(chartData.scoreString).toBe('');
});

test('ChartData.scoreString returns formatted score when set', () => {
  const scoreDetail = ScoreDetail.createFromStorage({ score: 1000000 });
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT, null, scoreDetail);
  expect(chartData.scoreString).toBe((1000000).toLocaleString());
});

test('ChartData.difficultyClassString returns correct class string', () => {
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT);
  expect(chartData.difficultyClassString).toBe(Constants.DIFFICULTY_CLASS_STRING[Constants.DIFFICULTIES.EXPERT]);
});

test('ChartData.playModeSymbol returns correct symbol for SINGLE', () => {
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT);
  expect(chartData.playModeSymbol).toBe(Constants.PLAY_MODE_SYMBOL[Constants.PLAY_MODE.SINGLE]);
});

test('ChartData.playModeSymbol returns correct symbol for DOUBLE', () => {
  const chartData = makeChartData(Constants.PLAY_MODE.DOUBLE, Constants.DIFFICULTIES.EXPERT);
  expect(chartData.playModeSymbol).toBe(Constants.PLAY_MODE_SYMBOL[Constants.PLAY_MODE.DOUBLE]);
});

test('ChartData.playCount returns null when scoreDetail is null', () => {
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT);
  expect(chartData.playCount).toBeNull();
});

test('ChartData.clearCount returns null when scoreDetail is null', () => {
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT);
  expect(chartData.clearCount).toBeNull();
});

test('ChartData.maxCombo returns null when scoreDetail is null', () => {
  const chartData = makeChartData(Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT);
  expect(chartData.maxCombo).toBeNull();
});
