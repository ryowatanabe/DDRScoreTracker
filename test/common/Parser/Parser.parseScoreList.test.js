/**
 * @jest-environment jsdom
 */

import { Constants } from '../../../src/static/common/Constants.js';
import { Parser } from '../../../src/static/common/Parser.js';
const fs = require('fs');
const path = require('path');

test('Parser.ParseScoreList (error)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/error.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreList(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreList (noLogin)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/no-login.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreList(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreList (hasNext:true)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/score-list-1.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreList(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreList (hasNext:false)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/score-list-18.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreList(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreList (nonstop)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/score-list-nonstop-1.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreList(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreList (grade dp)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/score-list-grade-dp-1.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreList(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreList (grade dp plus)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/score-list-grade-dp-plus-1.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreList(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreList (ddrworld/error)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/ddrworld/error.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreList(rootElement, Constants.GAME_VERSION.WORLD);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreList (ddrworld/noLogin)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/ddrworld/no-login.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreList(rootElement, Constants.GAME_VERSION.WORLD);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreList (ddrworld/hasNext:true)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/ddrworld/score-list-1.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreList(rootElement, Constants.GAME_VERSION.WORLD);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreList (ddrworld/hasNext:false)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/ddrworld/score-list-25.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreList(rootElement, Constants.GAME_VERSION.WORLD);
  expect(res).toMatchSnapshot();
});
