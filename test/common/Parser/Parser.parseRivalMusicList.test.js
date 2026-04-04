/**
 * @jest-environment jsdom
 */

import { Parser } from '../../../src/static/common/Parser.js';
const fs = require('fs');
const path = require('path');

test('Parser.parseRivalMusicList (noLogin)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/ddrworld/no-login.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseRivalMusicList(rootElement);
  expect(res.status).toBe(Parser.STATUS.LOGIN_REQUIRED);
  expect(res.musics).toHaveLength(0);
});

test('Parser.parseRivalMusicList (error)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/ddrworld/error.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseRivalMusicList(rootElement);
  expect(res.status).toBe(Parser.STATUS.UNKNOWN_ERROR);
  expect(res.musics).toHaveLength(0);
});

test('Parser.parseRivalMusicList (rival data not public)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/ddrworld/rival-not-public.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseRivalMusicList(rootElement);
  expect(res.status).toBe(Parser.STATUS.RIVAL_DATA_NOT_PUBLIC);
  expect(res.musics).toHaveLength(0);
});

test('Parser.parseRivalMusicList (hasNext:true)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/ddrworld/rival-music-list-1.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseRivalMusicList(rootElement);
  expect(res.status).toBe(Parser.STATUS.SUCCESS);
  expect(res.hasNext).toBe(true);
  expect(res.nextUrl).toBeTruthy();
  expect(res.musics.length).toBeGreaterThan(0);
  res.musics.forEach((music) => {
    expect(music.musicId).toBeTruthy();
    expect(music.title).toBeTruthy();
  });
  expect(res).toMatchSnapshot();
});

test('Parser.parseRivalMusicList (hasNext:false)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/ddrworld/rival-music-list-last.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseRivalMusicList(rootElement);
  expect(res.status).toBe(Parser.STATUS.SUCCESS);
  expect(res.hasNext).toBe(false);
  expect(res.musics.length).toBeGreaterThan(0);
  res.musics.forEach((music) => {
    expect(music.musicId).toBeTruthy();
    expect(music.title).toBeTruthy();
  });
  expect(res).toMatchSnapshot();
});
