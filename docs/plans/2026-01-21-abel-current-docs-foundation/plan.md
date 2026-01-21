# Plan: Abel Current Docs Foundation

## 概要

abel リポジトリの現行実装を調査し、必須ドキュメント（spec.md, ops.md, arch.md, learning-data-contract.md）を新規作成する。
実装改修は行わず、ドキュメント作成のみを行う。

## 対象範囲

- abel リポジトリ本体（競馬予測・自動購入システム）
- abel-learning は同一ワークスペースに存在しないため、abel 側から見たインターフェースとして記述
- **学習用データ仕様**: abel が生成し abel-learning が消費するデータの契約を明文化

## 成果物と役割分担

| ドキュメント | 役割 |
|-------------|------|
| docs/spec.md | 外部仕様（What）、学習データインターフェースの概要＋ learning-data-contract.md へのリンク |
| docs/ops.md | 運用手順（How）、学習データ生成の運用手順（生成コマンド、生成物の確認、失敗時切り分け） |
| docs/arch.md | 設計境界・判断、学習データ生成パイプライン（入力→加工→出力）と責務境界 |
| docs/learning-data-contract.md | 学習用データ契約（スキーマ/粒度/キー/ラベル/特徴量/型/欠損/品質/バージョニング）本体 |

## 調査結果サマリ

### (A) 事実（確認済み・根拠付き）

#### 技術スタック

| 項目 | 内容 | 根拠 |
|------|------|------|
| 言語 | JavaScript (Node.js) | `package.json` の構成 |
| DB | SQLite3 | `package.json` dependencies: `"sqlite3": "^4.1.1"` |
| スクレイピング | cheerio, puppeteer | `package.json` dependencies: `"cheerio": "^1.0.0-rc.3"`, `"puppeteer": "^7.1.0"` |
| 学習連携 | @jupyterlab/services | `package.json` dependencies: `"@jupyterlab/services": "^6.0.3"` |
| メール | nodemailer | `package.json` dependencies: `"nodemailer": "^6.4.18"` |

#### 外部依存

| 依存先 | 用途 | 根拠 |
|--------|------|------|
| netkeiba.com | レース情報取得 | `src/accumulations/future-race-extractor.js:10` の `BaseUrl: 'https://db.netkeiba.com'`、`src/purchases/purchase-result-checker.js:181` の URL |
| IPAT | 馬券購入 | `src/purchases/ipat-connect-purchaser.js` 全体、特に L36 `BaseUrl`、L152-159 のログインフォーム操作 |
| Jupyter Notebook | 予測実行 | `src/simulations/predictor.js:30-32` の `baseUrl` + `jupyter.token` による接続 |
| SMTP | メール通知 | `src/purchases/mailer.js:17` の `nodemailer.createTransport` |

#### ディレクトリ構成（確認済み）

```
src/
├── index.js              # CLI エントリポイント（確認: L40-208 の switch 文）
├── config-manager.js     # 設定管理（確認: L10 で resources/configs/index.yml を読込）
├── consts.js             # 定数定義（確認: PurchaseStatus 等）
├── accumulations/        # データ収集・スクレイピング（16 ファイル）
├── analytics/            # 学習データ作成・分析（14 ファイル + configs/）
├── dbs/                  # SQLite アクセス（4 ファイル）
├── helpers/              # ユーティリティ（11 ファイル）
├── purchases/            # 馬券購入・通知（7 ファイル）
└── simulations/          # 予測・シミュレーション（7 ファイル）
```

#### 主要コマンド

以下は `package.json` の `scripts` セクションから抽出:

| コマンド | 用途 | 根拠（package.json scripts） |
|---------|------|------------------------------|
| init-db | DB 初期化 | `"init-db": "node ./src/index.js -t init-db"` |
| gen-race-sql | SQL 生成 | `"gen-race-sql": "node ./src/index.js -t gen-race-sql"` |
| create-feature | 特徴量作成 | `"create-feature": "node ./src/index.js -t create-feature"` |
| learn-pre | 学習データ作成 | `"learn-pre": "node ./src/index.js -t learn-pre"` |
| learn-rage-pre | Rage学習データ作成 | `"learn-rage-pre": "node ./src/index.js -t learn-rage-pre"` |
| learn-collegial-pre | 合議制学習データ作成 | `"learn-collegial-pre": "node ./src/index.js -t learn-collegial-pre"` |
| test-pred | 予測テスト | `"test-pred": "node ./src/index.js -t test-pred"` |
| result-set-register | 過去レース結果登録 | `"result-set-register": "node ./src/index.js -t result-set-register"` |
| purchase-ipat | IPAT 連携馬券購入 | `"purchase-ipat": "node ./src/index.js -t purchase-ipat"` |
| check-purchase | 購入結果確認 | `"check-purchase": "node ./src/index.js -t check-purchase"` |

#### 設定ファイル

- `resources/configs/index.yml` が gitignore 対象
  - 根拠: `.gitignore` L4 に `resources/configs/` が記載

#### 列定義ファイル（実在確認済み）

- `resources/defs/` ディレクトリに以下のファイルが存在（`ls -la resources/defs/` で確認）:
  - `identity-survey-columns.json`
  - `identity-eval-param-columns.json`
  - `learning-input-columns.json`
  - `learning-input-validation-columns.json`
  - `filterd-learning-input-columns.json`

### (B) 仮説/要確認

| 項目 | 仮説 | 確認方法 |
|------|------|----------|
| abel-learning との連携方法 | Jupyter Notebook 経由でモデル実行、ファイル受け渡しは不明 | `src/simulations/predictor.js` の `predRageUrl`, `predCollegialUrl` 等の設定値を `resources/configs/index.yml` で確認 |
| resources/configs/index.yml の必須キー | `ipat.*`, `mail.*`, `jupyter.*`, `pred*Url` 等が必要と推測 | `grep -r "config\." src/` で参照箇所を網羅的に抽出 |
| cron/スケジューラ設定 | 外部で設定されている可能性（リポジトリ内に設定なし） | `find . -name "*.cron*" -o -name "crontab*"` および運用者へのヒアリング |
| DB ファイルの保存場所 | `db/` ディレクトリ（gitignore 対象） | `.gitignore` L2 に `db/` 記載、`src/dbs/db-provider.js` を確認 |
| 学習データの出力形式・スキーマ | CSV 形式と推測 | Step 0-4 の経路追跡で確定する |

## 調査手順（実装時に実行）

### Step 0: 依存関係の詳細抽出

1. **require/import 関係の抽出**（改善版：ESModule 含む）
   ```bash
   grep -RohE "(require\\(|from\\s+)['\"][^'\"]+['\"]" src/ | sort | uniq -c | sort -rn
   ```
   - 各モジュール間の依存方向を明確化
   - arch.md の依存方向記述の根拠とする
   - **集約ルール**: 抽出結果は「ディレクトリ間依存」に集約する（例: `purchases→dbs`, `analytics→helpers` 等）。ファイル単位の依存ではなく、ディレクトリ（コンポーネント）単位で整理し、arch.md に記載する

2. **設定キーの網羅的抽出**
   ```bash
   grep -roh "config\.[a-zA-Z.]*" src/ | sort | uniq
   ```
   - ops.md のセットアップ手順に必要なキー一覧を作成

3. **外部 URL の抽出**
   ```bash
   grep -rh "https\?://" src/ | grep -v node_modules
   ```
   - spec.md の外部インターフェース記述の根拠とする

4. **学習データ出力先の経路追跡**（コマンド→到達関数→書き込み処理）
   ```bash
   # Step 1: learn-pre コマンドの到達先を特定
   # src/index.js の learn-pre case → learningInputCreator.create()

   # Step 2: learningInputCreator から書き込み処理を追跡
   grep -n "write\|fs\.\|stream" src/analytics/learning-input-creator.js

   # Step 3: config から出力先パスを特定
   grep -roh "config\.[a-zA-Z]*FilePath\|config\.[a-zA-Z]*Dir" src/analytics/ | sort | uniq

   # Step 4: 実際の出力ファイル名規則を確認
   # 上記で得た config キーを resources/configs/index.yml で確認
   ```
   - learning-data-contract.md のデータ形式・出力先記述の根拠とする
   - **注**: キーワード依存の grep ではなく、コード経路から確定する

## 実装計画

### Step 1: docs/spec.md 作成

instruction.md の「docs/spec.md に書くこと」に従い、以下を記述:

1. **目的 / 非目的**
   - 競馬予測・自動馬券購入の自動化
   - 非目的: 学習モデル自体の開発（abel-learning の責務）

2. **ユースケース**
   - 日次運用フロー（予測→購入→結果通知）

3. **外部インターフェース**
   - 根拠付きで記述（調査結果サマリ (A) を参照）
   - **学習データインターフェース**: 概要と `docs/learning-data-contract.md` へのリンク

4. **主要フロー仕様**
   各フローについて `src/index.js` の switch 文から対応コードを参照:
   - 収集: `src/index.js:154-181` の `result-set-register` フロー
   - 学習準備: `src/index.js:70-89` の `learn-pre` フロー → `learningInputCreator.create()`
   - 推論: `src/index.js:129-151` の `test-pred` フロー → `predictor.predict()`
   - 購入: `src/index.js:184-193` の `purchase-ipat` フロー → `ipat-purchase-manager.execute()`
   - 通知: `src/purchases/mailer.js:14-40` の `send()` 関数（購入時・結果時に呼出）
   - 結果確認: `src/index.js:196-205` の `check-purchase` フロー → `purchaseChecker.check()`

5. **制約・不変条件**
   - 実装から読み取れる制約のみを記述（推測は仮説として分離）

6. **不明点/要確認リスト**
   - 調査結果サマリ (B) の内容を転記し、確認方法を併記

### Step 2: docs/ops.md 作成

1. **セットアップ**
   - 必要ソフト: Node.js, Python + Jupyter, SQLite3
   - npm install
   - resources/configs/index.yml 作成
     - Step 0 で抽出した必須キー一覧を元にテンプレート例示
   - npm run init-db

2. **日常運用**
   - npm run purchase-ipat（購入監視開始）
   - npm run check-purchase（結果確認監視開始）
   - ログ確認方法
   - package.json scripts から抽出した一覧を明記

3. **学習データ生成の運用手順**
   - 生成コマンド: `npm run learn-pre`, `npm run learn-rage-pre`, `npm run learn-collegial-pre`
   - 生成物の確認方法（出力ファイルパス、行数、列数の検証）
   - 失敗時の切り分け手順

4. **監視・トラブルシューティング**
   - よくある失敗パターン（コードから読み取れる範囲）
   - リトライ機構: `config.ipat.maxRetryCount`（根拠: `src/purchases/ipat-purchase-manager.js:59`, `src/purchases/purchase-result-checker.js:50`）

5. **バックアップ・復旧**
   - db/ ディレクトリのバックアップ
   - 現状「未整備」の場合はその旨と最低限の方針案

### Step 3: docs/arch.md 作成

1. **コンポーネント責務**
   - 各ディレクトリの責務を実装から抽出

2. **データフロー**（Mermaid）
   - コンポーネント間のデータ受け渡しを明確化
   - 入出力形式を記述:
     - ファイル（JSON/CSV）: `resources/learnings/`, `resources/simulations/`
     - DB: `db/` 配下の SQLite
     - 外部サービス: netkeiba, IPAT, Jupyter, SMTP

3. **学習データ生成パイプライン**
   - 入力: DB（レース結果、馬情報）
   - 加工: `src/analytics/learning-input-creator.js` 等
   - 出力: CSV ファイル（`resources/learnings/` 配下）
   - 責務境界: abel が生成、abel-learning が消費

4. **依存方向（現行実装の実態）**
   - Step 0 の require 抽出結果に基づいて記述
   - **注**: これは「現行の実態」であり、「あるべき姿」ではない
   - 将来の指針は「将来の改善余地」セクションに分離

5. **設計判断とトレードオフ**
   - 現行実装から読み取れる判断のみを記述
   - 根拠（該当コード）を明記

6. **失敗時方針**
   - `maxRetryCount` によるリトライ（根拠付き）
   - 購入状態管理: `PurchaseStatus`（根拠: `src/consts.js:10-23`）

7. **DB スキーマ概要**
   - 主要テーブル名＋用途＋主キーを列挙
   - 詳細 DDL は `resources/sqls/create_*.sql` への参照リンク

### Step 4: docs/learning-data-contract.md 作成

学習用データ契約の単独ドキュメントとして以下を記述:

1. **データ形式**
   - ファイル形式（CSV/JSON 等）- Step 0-4 の経路追跡結果に基づく
   - エンコーディング
   - ヘッダ有無
   - 出力先ディレクトリ・命名規則
   - 生成タイミング

2. **データ粒度とキー**
   - 1行の粒度（race/horse 等）
   - 主キー相当（raceId, horseId 等）

3. **ラベル定義（目的変数）**
   - 学習に使用する正解データの定義
   - 根拠: `src/analytics/learning-answer-creator.js` の実装から抽出

4. **特徴量一覧**
   - 列名・型・意味・欠損許容・単位/範囲
   - 根拠: `resources/defs/` 配下の列定義ファイル（実在確認済み）から抽出

5. **未来情報リーク防止の不変条件**
   - 「レース前に確定している情報のみ」等の制約
   - 実装根拠付き（該当コードの参照）

6. **スキーマバージョンと互換性方針**
   - schema_version の定義
   - 列追加/変更/削除の扱い

7. **不明点/要確認**
   - abel-learning 不在前提での確認方法を併記

### Step 5: docs/README.md 作成（任意・推奨）

4 ドキュメントへの導線を簡潔に記述

## DoD（Definition of Done）

- [ ] docs/spec.md が存在し、instruction.md 記載の最低限項目を網羅
- [ ] docs/ops.md が存在し、第三者が作業できる具体性を満たす
- [ ] docs/arch.md が存在し、コンポーネント責務・データフローを明示
- [ ] docs/learning-data-contract.md が存在し、必須項目（データ形式/粒度/キー/ラベル/特徴量/リーク防止/バージョン）が埋まっている
- [ ] 主要フロー（収集/学習/推論/購入/通知/結果）が spec と arch で一貫
- [ ] 不明点に確認方法が明記されている
- [ ] ドキュメント内リンクが壊れていない
- [ ] 調査結果サマリの断定事項すべてに根拠（ファイルパス:行番号 または コマンド）が付与されている

## Verify

```bash
# ドキュメントファイルの存在確認
test -f docs/spec.md && \
test -f docs/ops.md && \
test -f docs/arch.md && \
test -f docs/learning-data-contract.md && \
echo "All docs exist: OK"

# 必須見出しの存在確認（grep）
grep -q "## 目的" docs/spec.md && \
grep -q "## ユースケース" docs/spec.md && \
grep -q "## 外部インターフェース" docs/spec.md && \
grep -q "## セットアップ" docs/ops.md && \
grep -q "## 日常運用" docs/ops.md && \
grep -q "## コンポーネント責務" docs/arch.md && \
grep -q "## データフロー" docs/arch.md && \
echo "Required sections in base docs: OK"

# learning-data-contract.md 必須見出しの存在確認（全項目）
grep -q "## データ形式" docs/learning-data-contract.md && \
grep -q "## データ粒度とキー" docs/learning-data-contract.md && \
grep -q "## ラベル定義" docs/learning-data-contract.md && \
grep -q "## 特徴量一覧" docs/learning-data-contract.md && \
grep -q "## 未来情報リーク防止" docs/learning-data-contract.md && \
grep -q "## スキーマバージョン" docs/learning-data-contract.md && \
echo "Required sections in learning-data-contract: OK"

# package.json scripts との双方向整合性確認（失敗時は非ゼロ終了）
echo "=== scripts in package.json ===" && \
MISSING_COUNT=0 && \
for cmd in $(node -e "const p=require('./package.json'); console.log(Object.keys(p.scripts).join(' '))"); do
  if grep -q "$cmd" docs/ops.md; then
    echo "Found in ops.md: $cmd"
  else
    echo "MISSING in ops.md: $cmd"
    MISSING_COUNT=$((MISSING_COUNT + 1))
  fi
done && \
if [ $MISSING_COUNT -gt 0 ]; then
  echo "ERROR: $MISSING_COUNT scripts missing in ops.md"
  exit 1
else
  echo "All scripts documented: OK"
fi

# 逆方向チェック: ops.md のコマンド一覧に余計なコマンドがないか確認
# ops.md の「## コマンド一覧」セクションは箇条書き形式（`- npm run xxx`）で統一し、
# 以下のコマンドで逆方向チェックを行う
echo "=== commands in ops.md ===" && \
EXTRA_COUNT=0 && \
for cmd in $(grep -oE "npm run [a-z-]+" docs/ops.md | sed 's/npm run //' | sort | uniq); do
  if node -e "const p=require('./package.json'); process.exit(p.scripts['$cmd'] ? 0 : 1)"; then
    echo "Valid in package.json: $cmd"
  else
    echo "EXTRA in ops.md (not in package.json): $cmd"
    EXTRA_COUNT=$((EXTRA_COUNT + 1))
  fi
done && \
if [ $EXTRA_COUNT -gt 0 ]; then
  echo "WARNING: $EXTRA_COUNT extra commands in ops.md"
fi

# 学習データ生成物の検証（サンプル）
# **注**: 以下のファイルパスは例示。Step 0-4 で確定した実際の出力先・ファイル名規則に
# 合わせて更新すること（Verify の形骸化防止）
# 実行後に出力ファイルのヘッダ/列数を確認
# head -1 resources/learnings/input.csv | tr ',' '\n' | wc -l
```

## 必須ドキュメント更新要否

| ドキュメント | 更新要否 | 理由 |
|-------------|---------|------|
| docs/spec.md | 新規作成 | 存在しないため |
| docs/ops.md | 新規作成 | 存在しないため |
| docs/arch.md | 新規作成 | 存在しないため |
| docs/learning-data-contract.md | 新規作成 | 学習データ仕様の明文化（design-review Follow-ups） |

## DB スキーマ

本トピックでは DB スキーマの変更は行わない。
現行スキーマは `resources/sqls/create_*.sql` に定義されている。

arch.md には以下の粒度で記述:
- 主要テーブル名
- 各テーブルの用途（1行説明）
- 主キー/外部キーの関係
- 詳細 DDL へのリンク（`resources/sqls/` への相対パス）

## 備考

- 実装改修は行わない（ドキュメント作成のみ）
- 事実と仮説を分離し、断定には根拠を明記
- 将来の改善余地は arch.md の別セクションに分離
- 学習データ契約は勝率改善の最重要情報として別ドキュメント化
