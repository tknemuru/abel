# abel 運用手順書 (ops.md)

## セットアップ

### 必要ソフトウェア

| ソフトウェア | 用途 | 備考 |
|-------------|------|------|
| Node.js | アプリケーション実行 | package.json 参照 |
| Python + Jupyter Notebook | 機械学習モデル実行 | abel-learning と連携 |
| SQLite3 | データベース | npm install 時に自動インストール |
| Chromium | IPAT 連携 (puppeteer) | puppeteer が自動ダウンロード |

### インストール手順

```bash
# 1. リポジトリクローン
git clone https://github.com/tknemuru/abel.git
cd abel

# 2. 依存パッケージインストール
npm install

# 3. 設定ファイル作成
cp resources/configs/index.yml.example resources/configs/index.yml
# → 設定ファイルを編集（下記「設定ファイル」参照）

# 4. データベース初期化
npm run init-db
```

### 設定ファイル

`resources/configs/index.yml` に以下のキーを設定する（gitignore 対象）。

#### 必須キー一覧

| カテゴリ | キー | 説明 |
|---------|------|------|
| **IPAT** | `ipat.ipatNum` | IPAT 加入者番号 |
| | `ipat.password` | IPAT パスワード |
| | `ipat.parsNum` | IPAT P-ARS 番号 |
| | `ipat.init` | 初期化フラグ |
| | `ipat.dev` | 開発モード（true で購入をスキップ） |
| | `ipat.maxRetryCount` | 最大リトライ回数 |
| | `ipat.watchSpanTime` | 監視間隔（分） |
| **メール** | `mail.service` | メールサービス（例: gmail） |
| | `mail.user` | 送信元メールアドレス |
| | `mail.pass` | メールパスワード/アプリパスワード |
| | `mail.from` | 送信元表示名 |
| | `mail.to` | 送信先メールアドレス |
| **Jupyter** | `jupyter.token` | Jupyter Notebook アクセストークン |
| **予測URL** | `predAbilityUrl` | 能力予測 Notebook URL |
| | `predRageUrl` | Rage予測 Notebook URL |
| | `predCollegialUrl` | 合議制予測 Notebook URL |
| **パス** | `learningAbilityDir` | 能力学習データディレクトリ |
| | `learningRageDir` | Rage学習データディレクトリ |
| | `learningCollegialDir` | 合議制学習データディレクトリ |
| | その他 `*FilePath`, `*Dir` | 各種ファイルパス |

## コマンド一覧

package.json scripts から抽出した全コマンド:

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

## 日常運用

### 購入監視の開始

```bash
# 購入監視を開始（購入タイミングまで待機し、自動購入を実行）
npm run purchase-ipat
```

- `config.ipat.watchSpanTime` 分ごとに購入タイミングをチェック
- 購入対象レースが見つかると自動で予測→購入を実行
- 購入完了時にメール通知

### 結果確認監視の開始

```bash
# 結果確認監視を開始
npm run check-purchase
```

- 購入済みレースの終了を監視
- レース終了後、結果を取得し的中判定
- 結果通知メールを送信

### ログ確認方法

- コンソール出力を確認（標準出力）
- 主要なログポイント:
  - `start purchase` - 購入処理開始
  - `still watch...` - 監視継続中
  - `start check result` - 結果確認開始
  - `send mail start` - メール送信開始

## 学習データ生成の運用手順

### 前提条件

出力先ディレクトリは **事前に作成が必要**（実装に自動作成処理がないため）。

```bash
# 初回のみ実行
mkdir -p resources/learnings resources/learnings-rage
```

根拠: `src/analytics/learning-input-creator.js` は `fs.appendFileSync` を使用しており、ディレクトリが存在しない場合はエラーになる。

### 生成コマンド

```bash
# 能力学習データ作成
npm run learn-pre

# Rage学習データ作成
npm run learn-rage-pre

# 合議制学習データ作成
npm run learn-collegial-pre
```

### 生成物の確認方法

```bash
# 出力ファイルの存在確認
ls -la resources/learnings/

# 行数確認（データ件数）
wc -l resources/learnings/*.csv

# 列数確認（ヘッダ行から）
head -1 resources/learnings/input-cols.json
```

### 失敗時の切り分け手順

1. **DB 接続エラー**: `db/` ディレクトリの存在と権限を確認
2. **データ不足エラー**: `npm run result-set-register` でデータを追加
3. **Jupyter 接続エラー**: `jupyter.token` と URL 設定を確認

## 監視・トラブルシューティング

### よくある失敗パターン

| 症状 | 原因 | 対処 |
|-----|------|------|
| `ECONNREFUSED` | Jupyter Notebook 未起動 | Jupyter を起動し、token を確認 |
| IPAT ログイン失敗 | 認証情報誤り | `ipat.*` の設定を確認 |
| メール送信失敗 | SMTP 認証エラー | `mail.*` の設定を確認（Gmail はアプリパスワード必要） |
| スクレイピング失敗 | サイト構造変更 | HTML パーサーの更新が必要 |
| `maxRetryCount` 超過 | 一時的なネットワーク障害 | 手動で再実行 |

### リトライ機構

- 購入処理・結果確認処理は `config.ipat.maxRetryCount` 回までリトライ
- 根拠: `src/purchases/ipat-purchase-manager.js:59`, `src/purchases/purchase-result-checker.js:50`

### 手動介入が必要なケース

- IPAT のメンテナンス時間帯
- netkeiba.com のサイト構造変更時
- 購入処理が途中で失敗した場合（DB の購入状態を確認）

## バックアップ・復旧

### バックアップ対象

| 対象 | パス | 優先度 |
|-----|------|--------|
| データベース | `db/` | 高 |
| 設定ファイル | `resources/configs/` | 高 |
| 学習データ | `resources/learnings/` | 中 |
| 予測結果 | `resources/simulations/` | 低 |

### バックアップ手順

```bash
# DB バックアップ
cp -r db/ backup/db_$(date +%Y%m%d)/

# 設定バックアップ
cp resources/configs/index.yml backup/index.yml.$(date +%Y%m%d)
```

### 復旧手順

```bash
# DB 復旧
cp -r backup/db_YYYYMMDD/ db/

# 再初期化が必要な場合
npm run init-db
```

### 現状の課題

- 自動バックアップは未整備
- 最低限の方針案:
  - 日次で `db/` をバックアップ
  - 週次で `resources/learnings/` をバックアップ
  - TODO: cron またはスクリプトで自動化

## WSL環境での学習データ生成

### 前提条件

Windows側に以下が配置されていること:
- SQLite DB: `C:\work\abel\race.db`
- 設定ファイル: `C:\work\abel\resources\configs\index.yml`

### WSL側への取り込み手順

1. 必要ディレクトリの作成
   ```bash
   mkdir -p db resources/configs resources/learnings
   ```

2. DBのコピー（元DBを保護するためコピー方式）
   ```bash
   cp /mnt/c/work/abel/race.db db/race.db
   ```

3. 設定ファイルのコピー
   ```bash
   cp /mnt/c/work/abel/resources/configs/index.yml resources/configs/index.yml
   ```

**注意**: `npm run init-db` は実行しないこと。既存DBのデータが失われる。

### 依存パッケージのインストール

```bash
npm install
```

**よくある失敗と対処**:

| 症状 | 原因 | 対処 |
|-----|------|------|
| `sqlite3` ビルド失敗 | ビルドツール不足 | `sudo apt install build-essential python3` |
| `sqlite3` ビルド失敗（Node.js v20+） | sqlite3 v4 は非互換 | `npm install sqlite3@5 --save` で v5 に更新 |
| `canvas` ビルド失敗 | cairo等のライブラリ不足 | `sudo apt install libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev` |
| `ENOENT: resources/configs/index.yml` | 設定ファイル未配置 | 上記手順3を実行 |
| `ENOENT: resources/params/learnings` | 中間パラメータ不足 | `mkdir -p resources/params && cp -r /mnt/c/work/abel/resources/params/learnings resources/params/` |

### 学習データ生成

```bash
npm run learn-pre
```

### 生成物の確認（Verify）

```bash
# 必須ファイルの存在・非空確認
test -s resources/learnings/input.csv && echo "input.csv: OK"
test -f resources/learnings/input-cols.json && echo "input-cols.json: OK"

# answer ファイルが1つ以上存在
ls resources/learnings/answer-*.csv >/dev/null 2>&1 && echo "answer files: OK"

# データ件数確認
wc -l resources/learnings/input.csv
```

**期待される生成物**:
- `input.csv`: 学習入力データ（0バイトより大きい）
- `input-cols.json`: カラム定義（JSON配列）
- `answer-earning-money.csv`: 正解データ
- `answer-recovery-rate.csv`: 正解データ
- `relation.json`: 紐付きデータ
