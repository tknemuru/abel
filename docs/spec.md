# abel 外部仕様書 (spec.md)

## 目的

競馬レースの予測と馬券自動購入を行うシステム。

### 目的
- netkeiba.com からレース情報を収集し、機械学習モデルで勝馬を予測する
- IPAT（JRA インターネット投票）連携で馬券を自動購入する
- 購入結果・的中結果をメールで通知する

### 非目的
- 機械学習モデル自体の開発（abel-learning リポジトリの責務）
- レース映像の分析
- 他の公営競技（競輪・競艇等）への対応

## ユースケース

### 日次運用フロー

1. **予測フェーズ**: 当日のレース情報を取得し、機械学習モデルで予測を実行
2. **購入フェーズ**: 予測結果に基づき、条件を満たすレースの馬券を IPAT 経由で購入
3. **結果確認フェーズ**: レース終了後、結果を取得し的中判定・収支計算を行う
4. **通知フェーズ**: 購入時・結果確認時にメールで通知

### ユーザー操作

- `npm run purchase-ipat`: 購入監視を開始（購入タイミングまで待機し、自動購入を実行）
- `npm run check-purchase`: 結果確認監視を開始（レース終了後に結果を取得し通知）

## 外部インターフェース

### 外部サービス

| サービス | 用途 | 接続方式 | 根拠 |
|---------|------|---------|------|
| netkeiba.com | レース情報・結果のスクレイピング | HTTP (cheerio/puppeteer) | `src/accumulations/future-race-extractor.js:10` |
| IPAT | 馬券購入 | ブラウザ自動操作 (puppeteer) | `src/purchases/ipat-connect-purchaser.js:36` |
| Jupyter Notebook | 機械学習モデル実行 | HTTP API (@jupyterlab/services) | `src/simulations/predictor.js:30-32` |
| SMTP | メール通知 | nodemailer | `src/purchases/mailer.js:17` |

### データストア

| 種別 | 用途 | 根拠 |
|-----|------|------|
| SQLite | レース情報・結果・購入状態の永続化 | `package.json` dependencies: sqlite3 |
| ファイル (JSON/CSV) | 学習データ・予測結果の中間ファイル | `resources/learnings/`, `resources/simulations/` |

### 学習データインターフェース

abel が生成し abel-learning が消費する学習データの仕様は、[docs/learning-data-contract.md](./learning-data-contract.md) を参照。

## 主要フロー仕様

### 1. データ収集フロー

**エントリポイント**: `npm run result-set-register` (`src/index.js:154-181`)

```
入力: 対象期間（endDate）
処理:
  1. resultClearer.clear() - 既存結果ページをクリア
  2. databaseUrlExtractor.extract() - レースURL一覧を取得
  3. race-database-downloader.extract() - レースDBページをダウンロード
  4. result-race-page-downloader.download() - 結果ページをダウンロード
  5. resultScraper.scrape() - HTMLからデータ抽出
  6. result-race-register.register() - DBに登録
  7. horseHistCreator.create() - 馬の履歴データを作成
出力: SQLite DB にレース結果が登録される
```

### 2. 学習データ準備フロー

**エントリポイント**: `npm run learn-pre` (`src/index.js:70-89`)

```
入力: DB内のレース結果
処理:
  1. learningInputCreator.create() - 学習用入力データ作成
  2. correlationAnalyzer.analyze() - 相関係数分析
出力: resources/learnings/ 配下に CSV ファイル
```

### 3. 推論フロー

**エントリポイント**: `npm run test-pred` (`src/index.js:129-151`)

```
入力: 学習データ（CSV）
処理:
  1. learningCollegialInputCreator.create() - 予測用入力作成
  2. predictor.predict() - Jupyter Notebook 経由で予測実行
  3. predAdjuster.adjust() - 予測結果整形
  4. testSimulator.simulate() - シミュレーション
  5. predAnalyzer.analyze() - 予測結果分析
出力: 予測結果 JSON
```

### 4. 購入フロー

**エントリポイント**: `npm run purchase-ipat` (`src/index.js:184-193`)

```
入力: 予測結果、購入条件設定
処理:
  1. ipatPurchaseManager.execute()
     - futureDownloader.download() - 当日レースページ取得
     - futureScraper.scrape() - スクレイピング
     - futureRegister.register() - DB登録
     - predictor.predict() - 予測実行
     - futureSimulator.simulate() - 購入計画作成
     - ipatPurchaser.purchase() - IPAT連携購入
出力: 馬券購入完了、購入通知メール送信
```

### 5. 通知フロー

**実装**: `src/purchases/mailer.js:14-40`

```
入力: 件名、本文
処理: nodemailer で SMTP 経由送信
出力: メール送信
```

送信タイミング:
- 馬券購入完了時（`ipat-connect-purchaser.js:182-185`）
- 結果確認完了時（`purchase-result-checker.js:134-137`）

### 6. 結果確認フロー

**エントリポイント**: `npm run check-purchase` (`src/index.js:196-205`)

```
入力: 購入済みレースID
処理:
  1. purchaseChecker.check()
     - 購入済みレースを監視
     - 結果ページをダウンロード・スクレイピング
     - 的中判定・収支計算
     - 結果通知メール送信
出力: 結果通知メール
```

## 制約・不変条件

### 購入に関する制約

- 購入は IPAT 連携のみ（現金購入・他サービス非対応）
- 購入状態は 3 段階で管理（根拠: `src/consts.js:10-23`）:
  - `NotPurchased (0)`: 未購入
  - `Purchased (1)`: 購入完了
  - `RaceFinished (2)`: レース終了

### リトライに関する制約

- 購入・結果確認処理には `maxRetryCount` によるリトライ機構あり
- 根拠: `src/purchases/ipat-purchase-manager.js:59`, `src/purchases/purchase-result-checker.js:50`

### 予測に関する制約

- 予測は Jupyter Notebook 経由でのみ実行
- 予測モデルは abel-learning で事前に学習済みであることが前提

## 不明点/要確認リスト

| 項目 | 仮説 | 確認方法 |
|------|------|----------|
| abel-learning との連携方法 | Jupyter Notebook 経由でモデル実行、ファイル受け渡しは不明 | `src/simulations/predictor.js` の `predRageUrl`, `predCollegialUrl` 等の設定値を `resources/configs/index.yml` で確認 |
| resources/configs/index.yml の必須キー | `ipat.*`, `mail.*`, `jupyter.*`, `pred*Url` 等が必要と推測 | `grep -r "config\." src/` で参照箇所を網羅的に抽出 |
| cron/スケジューラ設定 | 外部で設定されている可能性（リポジトリ内に設定なし） | `find . -name "*.cron*" -o -name "crontab*"` および運用者へのヒアリング |
| DB ファイルの保存場所 | `db/` ディレクトリ（gitignore 対象） | `.gitignore` L2 に `db/` 記載、`src/dbs/db-provider.js` を確認 |
