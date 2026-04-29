import { MusicList } from '../../../src/static/common/MusicList.js';
// mock chrome API
global.chrome = {
  runtime: {
    sendMessage: () => {},
  },
};

test('MusicList.encodedString roundtrip with 14-element string', async () => {
  // format: musicId \t type \t isDeleted \t diff[0..8] \t containedVersion \t title
  const musicList = new MusicList();
  const string = '91qD6DbDqi96qbIO66oboliPD8IPP6io\t0\t1\t3\t7\t11\t13\t16\t7\t11\t13\t16\t15\t輪廻転生';
  musicList.applyEncodedString(string);
  expect(musicList.encodedString).toBe(string);
});

test('MusicList.encodedString from legacy 13-element string outputs 14-element new format', async () => {
  const musicList = new MusicList();
  const legacyString = '91qD6DbDqi96qbIO66oboliPD8IPP6io\t0\t1\t3\t7\t11\t13\t16\t7\t11\t13\t16\t輪廻転生';
  musicList.applyEncodedString(legacyString);
  expect(musicList.encodedString).toBe('91qD6DbDqi96qbIO66oboliPD8IPP6io\t0\t1\t3\t7\t11\t13\t16\t7\t11\t13\t16\t\t輪廻転生');
});
