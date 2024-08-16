/**
 * @jest-environment jsdom
 */

import { Constants } from '../../../src/static/common/Constants.js';
import { Parser } from '../../../src/static/common/Parser.js';
const fs = require('fs');
const path = require('path');

test('Parser.ParseMusicDetail (error)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/error.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseMusicDetail(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseMusicDetail (noLogin)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/no-login.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseMusicDetail(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseMusicDetail (normal)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/music-detail.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseMusicDetail(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseMusicDetail (nonstop)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/music-detail-nonstop.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseMusicDetail(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseMusicDetail (grade)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/music-detail-grade.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseMusicDetail(rootElement);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseMusicDetail (ddrworld/error)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/ddrworld/error.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseMusicDetail(rootElement, Constants.GAME_VERSION.WORLD);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseMusicDetail (ddrworld/noLogin)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/ddrworld/no-login.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseMusicDetail(rootElement, Constants.GAME_VERSION.WORLD);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseMusicDetail (ddrworld/normal)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/ddrworld/music-detail.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseMusicDetail(rootElement, Constants.GAME_VERSION.WORLD);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseMusicDetail (ddrworld/no-challenge-chart)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/ddrworld/music-detail-no-challenge.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseMusicDetail(rootElement, Constants.GAME_VERSION.WORLD);
  expect(res).toMatchSnapshot();
});

test('Parser.ParseMusicDetail (ddrworld/hidden-song)', async () => {
  const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/ddrworld/music-detail-hidden-song.html')), 'utf8');
  const rootElement = document.createElement('body');
  rootElement.innerHTML = html;
  const res = Parser.parseMusicDetail(rootElement, Constants.GAME_VERSION.WORLD);
  expect(res).toMatchSnapshot();
});
