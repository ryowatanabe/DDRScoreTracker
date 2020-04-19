import { ScoreDetail } from '../../../src/static/common/ScoreDetail.js';

const attributes = ['score', 'scoreRank', 'clearType', 'playCount', 'clearCount', 'maxCombo'];
attributes.forEach(
  function (attributeName) {
    test(`ScoreDetail.merge merge value onto null (overwritten) (${attributeName})`, () => {
      const base = ScoreDetail.createFromStorage({});
      base[attributeName] = null;
      const target = ScoreDetail.createFromStorage({});
      target[attributeName] = 0;
      const expected = ScoreDetail.createFromStorage({});
      expected[attributeName] = 0;
      base.merge(target);
      expect(base).toStrictEqual(expected);
    });

    test(`ScoreDetail.merge merge null onto value (not overwritten) (${attributeName})`, () => {
      const base = ScoreDetail.createFromStorage({});
      base[attributeName] = 0;
      const target = ScoreDetail.createFromStorage({});
      target[attributeName] = null;
      const expected = ScoreDetail.createFromStorage({});
      expected[attributeName] = 0;
      base.merge(target);
      expect(base).toStrictEqual(expected);
    });

    test(`ScoreDetail.merge merge compare value (overwritten) (${attributeName})`, () => {
      const base = ScoreDetail.createFromStorage({});
      base[attributeName] = 0;
      const target = ScoreDetail.createFromStorage({});
      target[attributeName] = 1;
      const expected = ScoreDetail.createFromStorage({});
      expected[attributeName] = 1;
      base.merge(target);
      expect(base).toStrictEqual(expected);
    });

    test(`ScoreDetail.merge merge compare value (not overwritten) (${attributeName})`, () => {
      const base = ScoreDetail.createFromStorage({});
      base[attributeName] = 1;
      const target = ScoreDetail.createFromStorage({});
      target[attributeName] = 0;
      const expected = ScoreDetail.createFromStorage({});
      expected[attributeName] = 1;
      base.merge(target);
      expect(base).toStrictEqual(expected);
    });
  }.bind(this)
);
