import { parseMusicList } from '../../../src/static/common/Parser.js';
const fs = require('fs');
const path = require('path');

test('Parser.ParseMusicList', async() => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, "fixtures/music-list-1.html")), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = parseMusicList(rootElement);
  expect(res).toMatchSnapshot();
});
