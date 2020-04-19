import { parseScoreDetail } from '../../../src/static/common/Parser.js';
const fs = require('fs');
const path = require('path');

test('Parser.ParseScoreDetail (noLogin)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/no-login.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = parseScoreDetail(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseScoreDetail (noPlay)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/score-detail-noplay.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = parseScoreDetail(rootElement);
  expect(res).toMatchSnapshot();
});
