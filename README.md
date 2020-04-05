# DDR Score Tracker

<img alt="DP LV15 sample screenshot" src="https://ryowatanabe.github.io/DDRScoreTracker/images/screenshot_dplv15.png" width="45%"> <img alt="DP Grades sample screenshot" src="https://ryowatanabe.github.io/DDRScoreTracker/images/screenshot_dpgrades.png" width="45%">

## 概要

[DanceDanceRevolution A20の公式サイト](https://p.eagate.573.jp/game/ddr/ddra20/p/)で閲覧可能なスコアデータを収集し、整理して閲覧することができるGoogle Chrome向け拡張機能です。

本ソフトウェアは `Score Manager` ではなく `Score Tracker` です。公式サイトのデータを手間なく収集し扱うことがコンセプトの中核にあり、利用者が情報を手入力して運用することは想定していません。(今後の開発において考慮する可能性はありますが、優先度は低いです)

本ソフトウェアの利用には、e-amusement ベーシックコースへの加入が必要です。

## 利用上の注意

現在の本ソフトウェアはα版です。通信周りの異常系を中心に、未考慮未実装の事項があるため、状況によって予想外の挙動を示す場合があります。また、データの互換性を失うような大幅な変更の可能性があります。

本ソフトウェアは、それが動作しているGoogle Chrome上で公式サイトを開き、表示したページの内容からスコア情報を取得しています。特にスコア詳細を取得する場合など、多くのページに連続してアクセスを行う場合があります。サーバに負荷をかけることのないように、人間が操作している状況に近くなるよう一定の時間を空けてアクセスしていますが、必要以上のアクセスが生じないよう利用にはご配慮ください。

## 利用方法

### 拡張機能の読み込み

Google Chromeのメニュー「ウィンドウ」→「拡張機能」→「パッケージ化されていない拡張機能を読み込む」で、manifest.jsonのあるディレクトリを選択してください。

### DDR Score Trackerを開く

拡張機能が読み込まれると、Google ChromeのツールバーにDDR Score Trackerのボタンが追加されます。このボタンをクリックすると、新規タブでDDR Score Trackerが開きます。

### 楽曲リストの読み込み

DDR Score Trackerのメニューを開き「楽曲リストを取得」ボタンをクリックしてください。

### スコア情報を取得

DDR Score Trackerのメニューを開き「スコア情報を取得」の各ボタンをクリックしてください。
各楽曲・譜面のスコアとフルコンボタイプを取得します。

### スコア詳細を取得

DDR Score Trackerのメニューを開き「スコア詳細を取得」ボタンをクリックしてください。
そのときリストに表示中の楽曲・譜面について、プレイ回数・クリア回数・最大コンボ数といった情報を含むスコア詳細を取得します。

## データの取り扱いについて

本ソフトウェアで取得したデータは、ブラウザが動作しているPC上に保存されます。一度取得したデータの閲覧は、インターネット接続がオフラインの状態でも可能です。  
また、取得したデータを外部のサーバに送信・保存することはありません。

楽曲リストの取得は[github pages](https://ryowatanabe.github.io/DDRScoreTracker/musics.txt)から行っています。  
それ以外のデータの取得は[公式サイト](https://p.eagate.573.jp/game/ddr/ddra20/p/)から行います。

## for developers

```
$ git clone git@github.com:ryowatanabe/DDRScoreTracker
$ cd DDRScoreTracker
$ yarn install

$ yarn test
```

## License

[MIT](https://github.com/ryowatanabe/DDRScoreTracker/blob/master/LICENSE)
