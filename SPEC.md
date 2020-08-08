# 仕様情報

## 楽曲リスト

[musics.txt](https://ryowatanabe.github.io/DDRScoreTracker/musics.txt)

UTF-8/LF の TSV 形式。カラムは先頭から順に

 - 楽曲ID
 - 楽曲種別
   - 0 : 通常楽曲
   - 1 : NONSTOP
   - 2 : 段位(A20)
   - 3 : 段位(A20 PLUS)
 - レベル
   - 順に bSP, BSP, DSP, ESP, CSP, BDP, DDP, EDP, CDP
   - 譜面が存在しない場合は 0
 - 曲名

### 楽曲IDについて

楽曲IDは公式が振り出した文字列です。段位認定は同一段位でもSPとDPで楽曲IDが異なっています。

## スコアリストの取り扱い

スコアリストは楽曲IDをキーにして管理しています。楽曲リストにデータが存在しない場合にも、スコアの取得・保存・閲覧を行うことができます。

## クリア種別の自動判別

 - スコア詳細 (クリア回数/プレイ回数/最大コンボ数) を取得済みか否かで判別方法が異なります。
 - LIFE4 は公式サイトから情報が提供されないため、判別できません。
 - AssistClear は公式サイトの情報から推定することが可能ですが、後述のとおり課題があります。

### スコア詳細未取得の場合

上から順に判定されます。

 - フルコンボ済みの場合は MFC / PFC / FC / GFC
 - スコアランクが E の場合は Failed
 - スコアランクが D以上 の場合は Clear

### スコア詳細取得済みの場合

上から順に判定されます。

 - フルコンボ済みの場合は MFC / PFC / FC / GFC
 - クリア回数が 1以上 の場合は Clear
 - クリア回数が 0 の場合
   - スコアランクが D以上 の場合は AssistClear
   - そうでない場合は Failed

### こんなときは

#### クリア済み楽曲 (スコア詳細未取得) をE判定更新した

 - スコア情報のみ取得すると Failed 扱いとなります (誤)
 - スコア詳細を取得すると Clear 扱いとなります (正)

#### Failed 状態 (スコア詳細取得済) をクリアした

 - スコア情報のみ取得すると AssistClear 扱いとなります (誤)
 - スコア詳細を取得すると Clear 扱いとなります (正)

#### AssistClear 状態 (スコア詳細取得済) の楽曲をE判定更新した

 - スコア情報のみ取得した場合・スコア詳細を取得した場合とも Failed 扱いとなります (誤)
 - これは現時点の実装上の課題です。