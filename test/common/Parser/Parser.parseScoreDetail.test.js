/**
 * @jest-environment jsdom
 */

import { Parser } from '../../../src/static/common/Parser.js';
const fs = require('fs');
const path = require('path');

test('Parser.ParseScoreDetail (error)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/error.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreDetail(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreDetail (noLogin)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/no-login.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreDetail(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreDetail (noPlay)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/score-detail-noplay.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreDetail(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreDetail (normal)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/score-detail.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreDetail(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreDetail (fullcombo)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/score-detail-gfc.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreDetail(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreDetail (nonstop)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/score-detail-nonstop.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreDetail(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreDetail (grade)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/score-detail-grade.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreDetail(rootElement);
  expect(res).toMatchSnapshot();
});
