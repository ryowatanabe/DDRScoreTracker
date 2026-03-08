jest.mock('../../../src/static/common/Logger.js', () => ({
  Logger: { info: jest.fn(), debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import { SkillAttackDataElement } from '../../../src/static/common/SkillAttackDataElement.js';
import { Constants } from '../../../src/static/common/Constants.js';

// Sample line format: index \t playMode \t difficulty \t ? \t updatedAt \t score \t clearType \t ?
const sampleLine = '1\t0\t3\t0\t1234567890\t900000\t0\t0';
const sampleLineFC = '2\t1\t2\t0\t1234567891\t850000\t1\t0';
const sampleLinePFC = '3\t0\t4\t0\t1234567892\t990000\t2\t0';
const sampleLineMFC = '4\t0\t3\t0\t1234567893\t1000000\t3\t0';

test('SkillAttackDataElement.createFromString parses valid string', () => {
  const element = SkillAttackDataElement.createFromString(sampleLine);
  expect(element).not.toBeNull();
  expect(element.index).toBe(1);
  expect(element.playMode).toBe(0);
  expect(element.difficulty).toBe(3);
  expect(element.updatedAt).toBe(1234567890);
  expect(element.score).toBe(900000);
  expect(element.clearType).toBe(0);
});

test('SkillAttackDataElement.createFromString returns null for empty string', () => {
  expect(SkillAttackDataElement.createFromString('')).toBeNull();
});

test('SkillAttackDataElement.createFromString returns null for whitespace-only string', () => {
  expect(SkillAttackDataElement.createFromString('   ')).toBeNull();
});

test('SkillAttackDataElement.createFromString returns null for too-short string', () => {
  expect(SkillAttackDataElement.createFromString('1\t0\t3')).toBeNull();
});

test('SkillAttackDataElement.difficultyValue for SINGLE player', () => {
  const element = SkillAttackDataElement.createFromString(sampleLine);
  // playMode=0 (SINGLE), difficulty=3 => difficultyValue=3
  expect(element.difficultyValue).toBe(3);
});

test('SkillAttackDataElement.difficultyValue for DOUBLE player', () => {
  const element = SkillAttackDataElement.createFromString(sampleLineFC);
  // playMode=1 (DOUBLE), difficulty=2 => difficultyValue = 2 + 4 = 6
  expect(element.difficultyValue).toBe(6);
});

test('SkillAttackDataElement.formString with clearType=0 returns score only', () => {
  const element = SkillAttackDataElement.createFromString(sampleLine);
  expect(element.formString).toBe('900000');
});

test('SkillAttackDataElement.formString with clearType=1 appends *', () => {
  const element = SkillAttackDataElement.createFromString(sampleLineFC);
  expect(element.formString).toBe('850000*');
});

test('SkillAttackDataElement.formString with clearType=2 appends **', () => {
  const element = SkillAttackDataElement.createFromString(sampleLinePFC);
  expect(element.formString).toBe('990000**');
});

test('SkillAttackDataElement.formString with clearType=3 returns score only (no suffix)', () => {
  const element = SkillAttackDataElement.createFromString(sampleLineMFC);
  expect(element.formString).toBe('1000000');
});

test('SkillAttackDataElement.scoreString with clearType=0 returns score only', () => {
  const element = SkillAttackDataElement.createFromString(sampleLine);
  expect(element.scoreString).toBe((900000).toLocaleString());
});

test('SkillAttackDataElement.scoreString with clearType=1 includes FC', () => {
  const element = SkillAttackDataElement.createFromString(sampleLineFC);
  expect(element.scoreString).toContain('FC');
});

test('SkillAttackDataElement.merge returns false for mismatched index', () => {
  const el1 = SkillAttackDataElement.createFromString(sampleLine);
  const el2 = SkillAttackDataElement.createFromString('99\t0\t3\t0\t1234567891\t950000\t0\t0');
  expect(el1.merge(el2)).toBe(false);
});

test('SkillAttackDataElement.merge updates score when other is newer', () => {
  const el1 = SkillAttackDataElement.createFromString(sampleLine); // updatedAt=1234567890
  const el2 = SkillAttackDataElement.createFromString('1\t0\t3\t0\t1234567999\t950000\t0\t0'); // newer
  el1.merge(el2);
  expect(el1.score).toBe(950000);
  expect(el1.updatedAt).toBe(1234567999);
});

test('SkillAttackDataElement.merge does not update score when other is older', () => {
  const el1 = SkillAttackDataElement.createFromString(sampleLine); // updatedAt=1234567890
  const el2 = SkillAttackDataElement.createFromString('1\t0\t3\t0\t1000000000\t999999\t0\t0'); // older
  el1.merge(el2);
  expect(el1.score).toBe(900000);
});

test('SkillAttackDataElement.merge returns true for valid same-key elements', () => {
  const el1 = SkillAttackDataElement.createFromString(sampleLine);
  const el2 = SkillAttackDataElement.createFromString('1\t0\t3\t0\t1234567999\t950000\t0\t0');
  expect(el1.merge(el2)).toBe(true);
});
