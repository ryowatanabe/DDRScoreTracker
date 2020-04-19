import { parseMusicDetail } from '../../../src/static/common/Parser.js';
const fs = require('fs');
const path = require('path');

test('Parser.ParseMusicDetail (noLogin)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/no-login.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = parseMusicDetail(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseMusicDetail (normal)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/music-detail.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = parseMusicDetail(rootElement);
  expect(res).toMatchSnapshot();
});

/*
test('Parser.ParseMusicDetail (nonstop)', async() => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, "fixtures/music-detail-nonstop.html")), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = parseMusicDetail(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseMusicDetail (grade)', async() => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, "fixtures/music-detail-grade.html")), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = parseMusicDetail(rootElement);
  expect(res).toMatchSnapshot();
});
*/
