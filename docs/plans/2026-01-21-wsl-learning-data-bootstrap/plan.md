# Plan: WSL上で学習データ生成（learn-pre）までを復活

## 概要

WSL(Ubuntu)環境で、Windows側の既存SQLite DBと設定ファイルを使用して、`npm run learn-pre` がエラーなく完了し、学習データが生成される状態を確立する。

## 前提条件の確認結果

### Windows側に存在するリソース
- **SQLite DB**: `/mnt/c/work/abel/race.db` (約370MB)
- **設定ファイル**: `/mnt/c/work/abel/resources/configs/index.yml`
- **resources**: `/mnt/c/work/abel/resources/` 配下に各種ディレクトリ（defs, params 等）

### WSL側の現状
- **Node.js**: v20.19.6（インストール済み）
- **db/**: 存在しない（作成が必要）
- **resources/configs/**: 存在しない（取り込みが必要）
- **resources/learnings/**: 存在しない（作成が必要）
- **resources/defs/**: リポジトリにコミット済み（追加コピー不要）

### コードの参照箇所
- **DBパス**: `src/dbs/db-provider.js:18` → `db/race.db`（ハードコード）
- **設定ファイル**: `src/config-manager.js:10` → `resources/configs/index.yml`
- **学習データ出力先**: `src/analytics/learning-input-creator.js:20-21` → `resources/learnings/`
- **カラム定義（SoT）**: `resources/defs/learning-input-columns.json`（リポジトリにコミット済み）
- **中間パラメータ**: `resources/params/learnings/`（learn-pre の fromDb=true 時は不要）

## 実装計画

### Task 1: 必要ディレクトリの作成

```bash
mkdir -p db
mkdir -p resources/configs
mkdir -p resources/learnings
```

### Task 2: DB の取り込み（コピー方式）

instruction.md の Constraints に従い、元DBを破壊しないようコピー方式で取り込む。

```bash
# バックアップの意味も込めて、コピーで取り込む
cp /mnt/c/work/abel/race.db db/race.db
```

**理由**: `learn-pre` は DB への書き込みは行わない（SELECT のみ）と想定されるが、安全のためコピーを使用。

**重要**: `npm run init-db` は実行しない。既存DBを使用するため、init-db を実行すると既存データが失われる。

### Task 3: 設定ファイルの取り込み（コピー方式）

```bash
cp /mnt/c/work/abel/resources/configs/index.yml resources/configs/index.yml
```

**秘匿情報の扱い**: index.yml には IPAT 認証情報、メール認証情報等の秘匿情報が含まれる。
- docs/ops.md には index.yml の実値は記載しない（手順のみ記載）
- index.yml は .gitignore 対象のためリポジトリにはコミットされない

### Task 4: resources の追加取り込み（必要に応じて）

**resources/defs/**: リポジトリにコミット済みのため追加コピー不要。

**resources/params/learnings/**: learn-pre は `fromDb: true` 設定（`learning-config.js:46`）のため、DB から直接読み込む。このディレクトリは通常不要だが、エラーが発生した場合は以下でコピー:

```bash
# エラー時のみ実行
mkdir -p resources/params
cp -r /mnt/c/work/abel/resources/params/learnings resources/params/
```

### Task 5: npm install の実行

```bash
npm install
```

**想定される問題と対処**:
- `sqlite3` のネイティブビルド失敗 → `build-essential`, `python3` の導入で解決
- `canvas` のネイティブビルド失敗 → `libcairo2-dev`, `libpango1.0-dev`, `libjpeg-dev`, `libgif-dev`, `librsvg2-dev` の導入

### Task 6: npm run learn-pre の実行

**重要**: `npm run init-db` は実行しない（既存DBを破壊する）。

```bash
npm run learn-pre
```

**期待される出力**:
- `resources/learnings/input.csv`
- `resources/learnings/input-cols.json`
- `resources/learnings/answer-earning-money.csv`
- `resources/learnings/answer-recovery-rate.csv`
- `resources/learnings/relation.json`

### Task 7: 生成物の検証

```bash
# ファイル存在・非空確認
test -s resources/learnings/input.csv && echo "input.csv: OK (non-empty)"
test -f resources/learnings/input-cols.json && echo "input-cols.json: OK"

# answer ファイルが1つ以上存在することを確認
ANSWER_COUNT=$(ls resources/learnings/answer-*.csv 2>/dev/null | wc -l)
[ "$ANSWER_COUNT" -ge 1 ] && echo "answer files: OK ($ANSWER_COUNT files)"

# データ件数確認
wc -l resources/learnings/input.csv
```

### Task 8: docs/ops.md の更新

以下の内容を追記する（秘匿情報の実値は含めない）:

```markdown
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
```

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|----------|
| `docs/ops.md` | WSL環境での学習データ生成手順を追記 |

**注**: コード変更は行わない。ディレクトリ作成とファイルコピーのみ。

## 必須ドキュメント更新要否

| ドキュメント | 更新要否 | 理由 |
|-------------|---------|------|
| `docs/spec.md` | 不要 | 外部仕様の変更なし |
| `docs/ops.md` | **要** | WSL環境での運用手順を追記 |
| `docs/arch.md` | 不要 | 設計変更なし |

## DBスキーマ

- スキーマ変更: **なし**
- 既存DBをそのまま使用
- **init-db は実行しない**（既存データ保護）

## DoD（Definition of Done）

1. ✅ WSL上で `npm install` が成功する
2. ✅ WSL上で `npm run learn-pre` が成功する
3. ✅ `resources/learnings/input.csv` が存在し、0バイトより大きい（`test -s`）
4. ✅ `resources/learnings/input-cols.json` が存在する
5. ✅ `resources/learnings/answer-*.csv` が1つ以上存在する
6. ✅ `docs/ops.md` にWSL手順が追記されている
7. ✅ docs/ops.md に index.yml の実値が含まれていない

## リスクと対策

| リスク | 対策 |
|-------|------|
| DB破壊 | コピー方式を採用。元DB（/mnt/c/work/abel/race.db）は変更しない。init-db は実行しない |
| ネイティブ依存のビルド失敗 | 失敗時のエラーメッセージに応じて必要パッケージを導入 |
| 設定ファイルの秘匿情報漏洩 | index.yml は .gitignore 対象。docs/ops.md には実値を記載しない |

## Verify

```bash
# 1. npm install 成功
npm install && echo "npm install: OK"

# 2. npm run learn-pre 成功
npm run learn-pre && echo "learn-pre: OK"

# 3. 生成物確認（契約観点のチェック）
test -s resources/learnings/input.csv && echo "input.csv: OK (non-empty)"
test -f resources/learnings/input-cols.json && echo "input-cols.json: OK"
ANSWER_COUNT=$(ls resources/learnings/answer-*.csv 2>/dev/null | wc -l)
[ "$ANSWER_COUNT" -ge 1 ] && echo "answer files: OK ($ANSWER_COUNT files)" || echo "answer files: FAILED"
```
