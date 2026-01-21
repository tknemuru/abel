# 実装完了報告: WSL上で学習データ生成（learn-pre）までを復活

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|----------|
| `docs/ops.md` | WSL環境での学習データ生成手順を追記、Node.js バージョン要件を明記 |
| `package.json` | sqlite3 を v4.1.1 → v5.1.7 に更新（Node.js v20 互換性のため） |
| `package-lock.json` | sqlite3 更新に伴う依存関係の更新 |

## 実行した作業

### Task 1: 必要ディレクトリの作成
```bash
mkdir -p db resources/configs resources/learnings
```
結果: 成功

### Task 2: DB の取り込み
```bash
cp /mnt/c/work/abel/race.db db/race.db
```
結果: 成功（388MB）

### Task 3: 設定ファイルの取り込み
```bash
cp /mnt/c/work/abel/resources/configs/index.yml resources/configs/index.yml
```
結果: 成功

### Task 5: npm install の実行
初回実行時、sqlite3 v4.1.1 が Node.js v20 と非互換でビルド失敗。
対処: `npm install sqlite3@5 --save` で sqlite3 v5.1.7 に更新し、解決。

```
npm install sqlite3@5 --save
npm install
```
結果: 成功（警告あり、脆弱性報告あり、動作には影響なし）

### Task 6: npm run learn-pre の実行
```bash
npm run learn-pre
```
結果: 成功
- 処理件数: 15,629件（13,925 + 1,704）
- 相関係数分析も完了

### Task 7: 生成物の検証

```
=== File listing ===
total 8492
-rw-r--r-- 1 tk tk   86105 Jan 21 15:37 answer-earning-money.csv
-rw-r--r-- 1 tk tk   36071 Jan 21 15:37 answer-recovery-rate.csv
-rw-r--r-- 1 tk tk    2510 Jan 21 15:37 input-cols.json
-rw-r--r-- 1 tk tk 5144167 Jan 21 15:37 input.csv
-rw-r--r-- 1 tk tk 3411608 Jan 21 15:37 relation.json

=== Verify Results ===
input.csv: OK (non-empty)
input-cols.json: OK
answer files: OK (2 files)
Data count: 14613 lines
```

### Task 8: docs/ops.md の更新
WSL環境での学習データ生成手順を追記。
- 秘匿情報（index.yml の実値）は記載していない
- init-db 実行禁止の注意を明記
- sqlite3 v5 への更新手順を追加

## Verify コマンド実行結果

```bash
# 1. npm install 成功
npm install && echo "npm install: OK"
# → npm install: OK

# 2. npm run learn-pre 成功
npm run learn-pre && echo "learn-pre: OK"
# → learn-pre: OK

# 3. 生成物確認
test -s resources/learnings/input.csv && echo "input.csv: OK (non-empty)"
# → input.csv: OK (non-empty)

test -f resources/learnings/input-cols.json && echo "input-cols.json: OK"
# → input-cols.json: OK

ANSWER_COUNT=$(ls resources/learnings/answer-*.csv 2>/dev/null | wc -l)
[ "$ANSWER_COUNT" -ge 1 ] && echo "answer files: OK ($ANSWER_COUNT files)"
# → answer files: OK (2 files)
```

## DoD 達成状況

| # | 条件 | 状態 |
|---|------|------|
| 1 | WSL上で `npm install` が成功する | ✅ 達成 |
| 2 | WSL上で `npm run learn-pre` が成功する | ✅ 達成 |
| 3 | `resources/learnings/input.csv` が存在し、0バイトより大きい | ✅ 達成（5.1MB、14,613行） |
| 4 | `resources/learnings/input-cols.json` が存在する | ✅ 達成 |
| 5 | `resources/learnings/answer-*.csv` が1つ以上存在する | ✅ 達成（2ファイル） |
| 6 | `docs/ops.md` にWSL手順が追記されている | ✅ 達成 |
| 7 | `docs/ops.md` に index.yml の実値が含まれていない | ✅ 達成 |

## 詰まった点と解消方法

| 問題 | 原因 | 解決策 |
|-----|------|--------|
| sqlite3 ビルド失敗 | sqlite3 v4.1.1 が Node.js v20 と非互換（node-gyp の module_name 未定義エラー） | `npm install sqlite3@5 --save` で v5.1.7 に更新 |

## sqlite3 更新の影響範囲

- **変更理由**: WSL 上の Node.js v20 で sqlite3 v4.1.1 のネイティブビルドが失敗するため、v5.1.7 に更新
- **最低サポート Node.js バージョン**: v12 以上（sqlite3 v5 の要件）
- **既存環境への影響**: sqlite3 v5 は Node.js v12+ で動作するため、既存の Windows 環境（Node.js v12 以上を使用している場合）との互換性に問題なし
- **docs/ops.md への反映**: 必要ソフトウェアに「Node.js v12+」を明記済み

## 残課題・不確実点

- npm audit で脆弱性が報告されている（34件）。learn-pre の動作には影響しないが、将来的に依存関係の更新を検討すべき。

## 元DBの安全性確認

- 元DB（`/mnt/c/work/abel/race.db`）は変更していない
- `npm run init-db` は実行していない
- WSL側の `db/race.db` はコピーであり、元DBへの影響なし

## Pull Request

https://github.com/tknemuru/abel/pull/17
