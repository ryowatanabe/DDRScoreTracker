import { MusicList } from '../../../src/static/common/MusicList.js';
// mock chrome API
global.chrome = {
  runtime: {
    sendMessage: () => {},
  },
};

test('MusicList.encodedString', async () => {
  const musicList = new MusicList();
  const string = '91qD6DbDqi96qbIO66oboliPD8IPP6io	0	1	3	7	11	13	16	7	11	13	16	輪廻転生';
  musicList.applyEncodedString(string);
  expect(musicList.encodedString).toBe(string);
});
