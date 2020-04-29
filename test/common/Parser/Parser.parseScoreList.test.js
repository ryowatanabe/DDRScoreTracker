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

test('Parser.ParseScoreList (grade)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/score-list-grade-1.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseScoreList(rootElement);
  expect(res).toMatchSnapshot();
});
