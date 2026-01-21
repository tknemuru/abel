# abel 設計書 (arch.md)

## コンポーネント責務

### ディレクトリ構成と責務

| ディレクトリ | 責務 | ファイル数 |
|-------------|------|-----------|
| `src/accumulations/` | データ収集・スクレイピング | 16 |
| `src/analytics/` | 学習データ作成・分析 | 14 + configs/ |
| `src/dbs/` | SQLite アクセス | 4 |
| `src/helpers/` | 共通ユーティリティ | 11 |
| `src/purchases/` | 馬券購入・通知 | 7 |
| `src/simulations/` | 予測・シミュレーション | 7 |

### 各コンポーネントの詳細

#### accumulations（データ収集）

- netkeiba.com からレース情報・結果をスクレイピング
- HTML ダウンロード、パース、DB 登録
- 主要ファイル:
  - `future-race-extractor.js` - 開催予定レース情報抽出
  - `result-race-extractor.js` - レース結果抽出
  - `page-downloader.js` - HTML ダウンロード共通処理

#### analytics（学習データ作成）

- DB のレース結果から学習用データを生成
- 特徴量作成、正解データ作成
- 主要ファイル:
  - `learning-input-creator.js` - 学習入力データ作成
  - `learning-answer-creator.js` - 正解データ作成
  - `feature-extractor.js` - 特徴量抽出

#### dbs（データベースアクセス）

- SQLite への CRUD 操作
- SQL ファイルの読み込み・実行
- 主要ファイル:
  - `db-accessor.js` - SQL 実行
  - `db-provider.js` - DB 接続管理
  - `sql-reader.js` - SQL ファイル読み込み

#### helpers（共通ユーティリティ）

- ファイル操作、データ変換、計算処理
- 他コンポーネントから利用される
- 主要ファイル:
  - `file-helper.js` - ファイル操作
  - `convert-helper.js` - データ変換
  - `html-helper.js` - HTML/puppeteer 操作

#### purchases（購入・通知）

- IPAT 連携馬券購入
- メール通知
- 主要ファイル:
  - `ipat-purchase-manager.js` - 購入フロー管理
  - `ipat-connect-purchaser.js` - IPAT 操作
  - `mailer.js` - メール送信
  - `purchase-result-checker.js` - 結果確認

#### simulations（予測・シミュレーション）

- Jupyter Notebook 経由の予測実行
- 購入シミュレーション、回収率計算
- 主要ファイル:
  - `predictor.js` - 予測実行
  - `purchaser.js` - 購入シミュレーション
  - `recovery-rate-calculator.js` - 回収率計算

## データフロー

```mermaid
graph TD
    subgraph External["外部サービス"]
        NK[netkeiba.com]
        IPAT[IPAT]
        JP[Jupyter/abel-learning]
        SMTP[SMTP]
    end

    subgraph Storage["データストア"]
        DB[(SQLite)]
        CSV[CSV/JSON Files]
    end

    subgraph Components["abel コンポーネント"]
        AC[accumulations]
        AN[analytics]
        SIM[simulations]
        PUR[purchases]
    end

    NK -->|スクレイピング| AC
    AC -->|登録| DB
    DB -->|読み込み| AN
    AN -->|出力| CSV
    CSV -->|入力| JP
    JP -->|予測結果| SIM
    SIM -->|購入計画| PUR
    PUR -->|購入| IPAT
    PUR -->|通知| SMTP
    NK -->|結果取得| PUR
```

### データの入出力形式

| データ | 形式 | 場所 |
|--------|------|------|
| レース情報 | SQLite テーブル | `db/` |
| 学習入力 | CSV | `resources/learnings/` |
| 正解データ | CSV | `resources/learnings/` |
| 予測結果 | JSON | `resources/simulations/` |
| 購入計画 | JSON | `resources/simulations/sim-result.json` |

## 学習データ生成パイプライン

```mermaid
graph LR
    subgraph Input["入力"]
        DB[(SQLite<br>race_result<br>horse_race_history)]
    end

    subgraph Process["加工"]
        LIC[learning-input-creator.js]
        LAC[learning-answer-creator.js]
        FE[feature-extractor.js]
    end

    subgraph Output["出力"]
        CSV1[input.csv]
        CSV2[answer.csv]
        JSON1[input-cols.json]
    end

    DB --> LIC
    LIC --> FE
    FE --> CSV1
    FE --> JSON1
    DB --> LAC
    LAC --> CSV2
```

### 責務境界

- **abel**: 学習データ生成まで
- **abel-learning**: 学習データを受け取り、モデル学習・予測を実行
- インターフェース: CSV ファイル（詳細は [learning-data-contract.md](./learning-data-contract.md)）

## 依存方向（現行実装の実態）

### ディレクトリ間依存

Step 0 の require 抽出結果を集約:

```
accumulations → dbs, helpers
analytics     → dbs, helpers, simulations
purchases     → dbs, helpers, accumulations, analytics, simulations
simulations   → helpers, analytics
dbs           → (外部依存のみ)
helpers       → (外部依存のみ)
```

### 依存関係図

```mermaid
graph TD
    PUR[purchases] --> AC[accumulations]
    PUR --> AN[analytics]
    PUR --> SIM[simulations]
    PUR --> DB[dbs]
    PUR --> H[helpers]

    AN --> SIM
    AN --> DB
    AN --> H

    AC --> DB
    AC --> H

    SIM --> H
    SIM --> AN

    DB --> |sqlite3| EXT[外部ライブラリ]
    H --> |fs, lodash| EXT
```

**注**: これは「現行の実態」であり、「あるべき姿」ではない。

## 設計判断とトレードオフ

### 1. Puppeteer によるブラウザ自動操作

- **判断**: IPAT 連携を puppeteer でブラウザ自動操作
- **根拠**: `src/purchases/ipat-connect-purchaser.js` 全体
- **理由**: IPAT に API がないため、ブラウザ操作が必須
- **トレードオフ**:
  - メリット: 人間と同じ操作が可能
  - デメリット: UI 変更に弱い、実行速度が遅い

### 2. Jupyter Notebook 経由の予測実行

- **判断**: 予測処理を Jupyter Notebook 経由で実行
- **根拠**: `src/simulations/predictor.js:30-32`
- **理由**: Python の機械学習ライブラリを活用
- **トレードオフ**:
  - メリット: Python の ML エコシステムを活用可能
  - デメリット: Jupyter の起動・接続管理が必要

### 3. SQLite によるローカル DB

- **判断**: データストアとして SQLite を採用
- **根拠**: `package.json` dependencies
- **理由**: 単体で動作可能、セットアップ不要
- **トレードオフ**:
  - メリット: 依存が少ない、バックアップが容易
  - デメリット: 並行書き込みに制限あり

## 失敗時方針

### リトライ機構

- `config.ipat.maxRetryCount` によるリトライ
- 根拠: `src/purchases/ipat-purchase-manager.js:59`, `src/purchases/purchase-result-checker.js:50`
- 対象: 購入処理、結果確認処理

### 購入状態管理

```javascript
// src/consts.js:10-23
PurchaseStatus: {
  NotPurchased: 0,  // 未購入
  Purchased: 1,     // 購入完了
  RaceFinished: 2   // レース終了
}
```

- 状態遷移: `NotPurchased → Purchased → RaceFinished`
- 購入処理の冪等性: 同一レースの二重購入を防止（`hasPurchased` チェック）

### 部分失敗時の扱い

- 複数レースの購入で一部失敗した場合、成功分は DB に記録
- 失敗分はリトライ後、手動確認が必要

## DB スキーマ概要

### 主要テーブル

| テーブル名 | 用途 | 主キー |
|-----------|------|--------|
| `race_result` | レース結果 | `race_id` |
| `race_future` | 開催予定レース | `race_id` |
| `horse_race_history` | 馬の出走履歴 | `horse_id`, `race_id` |
| `simulation_result` | シミュレーション結果 | - |
| `purchase` | 購入状態管理 | `race_id` |

### 主要ビュー

| ビュー名 | 用途 |
|---------|------|
| `view_result_race_history` | 結果レースと履歴の結合 |
| `view_future_race_history` | 予定レースと履歴の結合 |
| `view_result_post_history` | 事後分析用ビュー |

### DDL 参照

詳細は `resources/sqls/create_*.sql` を参照:

- [create_race_result.sql](../resources/sqls/create_race_result.sql)
- [create_race_future.sql](../resources/sqls/create_race_future.sql)
- [create_horse_race_history.sql](../resources/sqls/create_horse_race_history.sql)
- [create_simulation_result.sql](../resources/sqls/create_simulation_result.sql)
- [create_purchase.sql](../resources/sqls/create_purchase.sql)

## 将来の改善余地

**注**: 以下は現状の事実ではなく、将来の改善提案。

1. **依存方向の整理**: purchases が analytics/simulations に直接依存している構造を、イベント駆動やサービス層で分離
2. **設定管理の改善**: 環境変数や .env ファイルへの対応
3. **エラーハンドリングの強化**: 構造化ログ、エラー通知の自動化
4. **テストカバレッジの向上**: 現状 `test/helpers/` のみ
