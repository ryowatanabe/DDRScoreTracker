jest.mock('../../../src/static/common/Logger.js', () => ({
  Logger: { info: jest.fn(), debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import { SkillAttackIndexMap } from '../../../src/static/common/SkillAttackIndexMap.js';

const sampleText = '1\tabc123\n2\tdef456\n3\tghi789\n';

test('SkillAttackIndexMap.createFromText parses tab-separated lines', () => {
  const map = SkillAttackIndexMap.createFromText(sampleText);
  expect(map.getMusicIdByIndex(1)).toBe('abc123');
  expect(map.getMusicIdByIndex(2)).toBe('def456');
  expect(map.getMusicIdByIndex(3)).toBe('ghi789');
});

test('SkillAttackIndexMap.createFromText ignores blank lines', () => {
  const map = SkillAttackIndexMap.createFromText('\n1\tabc123\n\n2\tdef456\n');
  expect(map.getMusicIdByIndex(1)).toBe('abc123');
  expect(map.getMusicIdByIndex(2)).toBe('def456');
});

test('SkillAttackIndexMap.getIndexByMusicId returns correct index', () => {
  const map = SkillAttackIndexMap.createFromText(sampleText);
  expect(map.getIndexByMusicId('abc123')).toBe(1);
  expect(map.getIndexByMusicId('def456')).toBe(2);
});

test('SkillAttackIndexMap.hasIndex returns true for existing index', () => {
  const map = SkillAttackIndexMap.createFromText(sampleText);
  expect(map.hasIndex(1)).toBe(true);
});

test('SkillAttackIndexMap.hasIndex returns false for missing index', () => {
  const map = SkillAttackIndexMap.createFromText(sampleText);
  expect(map.hasIndex(999)).toBe(false);
});

test('SkillAttackIndexMap.hasMusicId returns true for existing musicId', () => {
  const map = SkillAttackIndexMap.createFromText(sampleText);
  expect(map.hasMusicId('abc123')).toBe(true);
});

test('SkillAttackIndexMap.hasMusicId returns false for missing musicId', () => {
  const map = SkillAttackIndexMap.createFromText(sampleText);
  expect(map.hasMusicId('notexist')).toBe(false);
});

test('SkillAttackIndexMap.createFromText with empty string creates empty map', () => {
  const map = SkillAttackIndexMap.createFromText('');
  expect(map.hasIndex(1)).toBe(false);
});
