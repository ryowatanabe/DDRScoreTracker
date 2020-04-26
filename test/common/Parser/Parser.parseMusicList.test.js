import { Parser } from '../../../src/static/common/Parser.js';
const fs = require('fs');
const path = require('path');

test('Parser.ParseMusicList (hasNext:true)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/music-list-1.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseMusicList(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseMusicList (hasNext:false)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/music-list-17.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseMusicList(rootElement);
  expect(res).toMatchSnapshot();
});
