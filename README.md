# DDR Score Tracker

<img alt="DP LV15 sample screenshot" src="https://ryowatanabe.github.io/DDRScoreTracker/images/screenshot_dplv15.png" width="45%"> <img alt="DP Grades sample screenshot" src="https://ryowatanabe.github.io/DDRScoreTracker/images/screenshot_dpgrades.png" width="45%">

## Abstract / 概要

This is a Google Chrome Extension which enables you collecting score data from [DanceDanceRevolution World official website](https://p.eagate.573.jp/game/ddr/ddrworld/top/), organizing and viewing those data.

[DanceDanceRevolution World の公式サイト](https://p.eagate.573.jp/game/ddr/ddrworld/top/)で閲覧可能なスコアデータを収集し, 整理して閲覧することができるGoogle Chrome拡張機能です.

This software is not `Score Manager` but `Score Tracker`. Core concept of this software is to collect and utilize data on official website, without taking time and effort. It is unexpected that users enter data manually. (Though it is possible to consider it in future development, it will have low priority.)

本ソフトウェアは `Score Manager` ではなく `Score Tracker` です. 公式サイトのデータを手間なく収集し扱うことがコンセプトの中核にあり, 利用者が情報を手入力して運用することは想定していません. (今後の開発において考慮する可能性はありますが, 優先度は低いです.)

You have to subscribe e-amusement basic course for using this software.

本ソフトウェアの利用には, e-amusement ベーシックコースへの加入が必要です.

## Disclaimer / 免責事項

This software is currently alpha. It may behave unexpectedly in some edge cases. In the future, it is subject to change without data compatibility.

現在の本ソフトウェアはα版です. 状況によって予想外の挙動をとることがありますし, 将来データの互換性を失うような変更の可能性があります.

## Important notes / 注意事項

This software opens official website on Google Chrome which it works on, then it retrieves data from contents shown on the browser. It may access many pages sequentially, especially when it retrieves detailed score data. Though it takes interval when it retrieves multiple pages, please use it with care not to request too much than you need.

本ソフトウェアは, それが動作しているGoogle Chrome上で公式サイトを開き, 表示したページの内容からスコア情報を取得しています. 特にスコア詳細を取得する場合など, 多くのページに連続してアクセスを行う場合があります. サーバに負荷をかけることのないように, 人間が操作している状況に近くなるよう一定の時間を空けてアクセスしていますが, 必要以上のアクセスが生じないよう利用にはご配慮ください.

## How to use / 利用方法

### Setup / セットアップ

#### Install from Chrome web store / Chrome ウェブストアからインストール

https://chromewebstore.google.com/detail/ddr-score-tracker/kecflehdfdgjkmfbhhhjdfijfaghfipk

#### Build from source / ソースコードからビルド

```
$ git clone git@github.com:ryowatanabe/DDRScoreTracker
$ cd DDRScoreTracker
$ yarn
$ yarn build
```

The extension will be placed in `dist/` directory.

`dist/` ディレクトリに拡張機能が出力されます。

Choose `Window` > `Extensions` > `Load unpacked` in the Google Chrome's menu, then select `dist/` directory which has `manifest.json` in it.

Google Chromeのメニュー `ウィンドウ` → `拡張機能` → `パッケージ化されていない拡張機能を読み込む` で, `manifest.json` のある `dist/` ディレクトリを選択してください.

### Launching DDR Score Tracker / DDR Score Trackerを開く

After the extension is loaded, a button representing DDR Score Tracker is added into Google Chrome's toolbar. Click this button to launch DDR Score Tracker on new tab.

拡張機能が読み込まれると, Google ChromeのツールバーにDDR Score Trackerのボタンが追加されます. このボタンをクリックすると, 新規タブでDDR Score Trackerが開きます.

### Retrieving music list / 楽曲リストの読み込み

The latest music list is automatically retrieved daily. If you want to update music list manually, open DDR Score Tracker's menu, then click `Get music list` button.

最新の楽曲リストは毎日自動的に取得されます. 手動で楽曲リストを更新したい場合には, DDR Score Trackerのメニューを開き `楽曲リストを取得` ボタンをクリックしてください.

### Retrieving score data / スコア情報を取得

Open DDR Score Tracker's menu, then click each button in `Get score data` section. Score and full combo type will be retrieved for each music and difficulty.

DDR Score Trackerのメニューを開き `スコア情報を取得` の各ボタンをクリックしてください.
各楽曲・譜面のスコアとフルコンボタイプを取得します.

### Retrieving detailed score data / スコア詳細を取得

Open DDR Score Tracker's menu, then click `Get detailed score data` button. Detailed score data includes play count, clear count, max combo etc. will be retrieved for each music and difficulty shown in the list at that time.

DDR Score Trackerのメニューを開き「スコア詳細を取得」ボタンをクリックしてください. そのときリストに表示中の楽曲・譜面について, プレイ回数・クリア回数・最大コンボ数といった情報を含むスコア詳細を取得します.

## Troubleshooting / こんなときは

### When you want to backup your score data / スコアデータのバックアップを行いたい場合

In debug page, you can export and restore your score list.

デバッグページにて, スコアリストのバックアップとリストアを行うことができます.

### When you want to forcibly stop the process / 強制的に処理を止めたい場合

By pressing `■Abort` button, you can stop the data retrieving process.

`■中止` ボタンを押すことによって, データ取得処理を停止することができます.

If it doesn't work, close tab on which DDR Score Tracker runs.

もしそれが機能しない場合には, DDR Score Tracker のタブを閉じてください. 

## Regarding the handling of data / データの取り扱いについて

This software saves retrieved personal data on the PC which operates the browser. Once you retrieve data, you can browse them without internet connection. It does not send personal data to remote server.

本ソフトウェアで取得した個人データは, ブラウザが動作しているPC上に保存されます. 一度取得したデータの閲覧は, インターネット接続がオフラインの状態でも可能です. また, 個人データを外部のサーバに送信することはありません.

This software retrieves music list from [github pages](https://ryowatanabe.github.io/DDRScoreTracker/musics/2.txt). It retrieves any other data from [official website](https://p.eagate.573.jp/game/ddr/ddrworld/top/).

楽曲リストの取得は[github pages](https://ryowatanabe.github.io/DDRScoreTracker/musics/2.txt)から行っています. それ以外のデータの取得は[公式サイト](https://p.eagate.573.jp/game/ddr/ddrworld/top/)から行います.

## Changelog / 変更履歴

[CHANGELOG.md (English only)](https://github.com/ryowatanabe/DDRScoreTracker/blob/master/CHANGELOG.md)

## Internal Specifications / 内部仕様

[SPEC.md (Japanese only)](https://github.com/ryowatanabe/DDRScoreTracker/blob/master/SPEC.md)

## License / ライセンス

[MIT](https://github.com/ryowatanabe/DDRScoreTracker/blob/master/LICENSE)
