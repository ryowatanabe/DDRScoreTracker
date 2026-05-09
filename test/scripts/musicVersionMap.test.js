/**
 * @jest-environment node
 */

const { MUSIC_VERSION } = require('../../scripts/musicVersionMap.cjs');
const { Constants } = require('../../src/static/common/Constants');

test('musicVersionMap.MUSIC_VERSION は Constants.MUSIC_VERSION と完全一致する', () => {
  expect(MUSIC_VERSION).toEqual(Constants.MUSIC_VERSION);
});
