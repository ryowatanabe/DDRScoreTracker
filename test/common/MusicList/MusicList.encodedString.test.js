import { MusicList } from '../../../src/static/common/MusicList.js';
// mock chrome API
global.chrome = {
  runtime: {
    sendMessage: () => {},
  },
};

test('MusicList.encodedString roundtrip with 14-element string', async () => {
  const musicList = new MusicList();
  const string = '91qD6DbDqi96qbIO66oboliPD8IPP6io\t0\t1\t3\t7\t11\t13\t16\t7\t11\t13\t16\t輪廻転生\t15';
  musicList.applyEncodedString(string);
  expect(musicList.encodedString).toBe(string);
});

test('MusicList.encodedString from legacy 13-element string outputs 14 elements', async () => {
  const musicList = new MusicList();
  const legacyString = '91qD6DbDqi96qbIO66oboliPD8IPP6io\t0\t1\t3\t7\t11\t13\t16\t7\t11\t13\t16\t輪廻転生';
  musicList.applyEncodedString(legacyString);
  expect(musicList.encodedString).toBe(legacyString + '\t');
});
