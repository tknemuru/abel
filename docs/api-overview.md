# abel インターフェース概要

## CLI エントリポイント

abel は CLI ベースのシステムであり、npm scripts を通じて各機能を実行する。

### ユーザー操作（日次運用）

| コマンド | 用途 |
|---------|------|
| `npm run purchase-ipat` | 購入監視を開始（購入タイミングまで待機し、自動購入を実行） |
| `npm run check-purchase` | 結果確認監視を開始（レース終了後に結果を取得し通知） |

### 全コマンド一覧

| コマンド | 用途 | 実行タイミング |
|---------|------|---------------|
| `npm run init-db` | DB 初期化 | 初回セットアップ時 |
| `npm run gen-race-sql` | SQL 生成 | 開発時 |
| `npm run create-feature` | 特徴量作成 | 学習データ準備時 |
| `npm run create-horse-hist` | 馬履歴データ作成 | データ更新時 |
| `npm run create-result-additional` | 結果追加データ作成 | 未実装（package.json のみ定義） |
| `npm run learn-pre` | 学習データ作成（ability） | 学習前 |
| `npm run learn-rage-pre` | 学習データ作成（rage） | 学習前 |
| `npm run learn-collegial-pre` | 学習データ作成（collegial） | 学習前 |
| `npm run test-pred` | 予測テスト | テスト時 |
| `npm run result-set-register` | 過去レース結果登録 | データ収集時 |
| `npm run purchase-ipat` | IPAT 連携馬券購入 | **日次運用** |
| `npm run check-purchase` | 購入結果確認 | **日次運用** |
| `npm run sandbox` | テスト用 | 開発時 |
| `npm test` | ユニットテスト | 開発時 |

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

## 外部サービス連携

| サービス | 用途 | 接続方式 | 根拠 |
|---------|------|---------|------|
| netkeiba.com | レース情報・結果のスクレイピング | HTTP (cheerio/puppeteer) | `src/accumulations/future-race-extractor.js:10` |
| IPAT | 馬券購入 | ブラウザ自動操作 (puppeteer) | `src/purchases/ipat-connect-purchaser.js:36` |
| Jupyter Notebook | 機械学習モデル実行 | HTTP API (@jupyterlab/services) | `src/simulations/predictor.js:30-32` |
| SMTP | メール通知 | nodemailer | `src/purchases/mailer.js:17` |

## システム間インターフェース

### abel ↔ abel-learning 間のデータ連携

- **abel** が学習データ（CSV）を生成し、**abel-learning** がそれを消費してモデル学習・予測を実行する
- abel-learning の予測結果は Jupyter Notebook API 経由で abel に返却される
- データ形式の詳細は [learning-data-contract.md](./learning-data-contract.md) を参照
