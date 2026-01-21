# 実装完了報告: Abel Current Docs Foundation

## 変更ファイル一覧

| ファイル | 操作 | 説明 |
|---------|------|------|
| `docs/spec.md` | 新規作成 | 外部仕様書（目的/ユースケース/外部インターフェース/主要フロー/制約/不明点） |
| `docs/ops.md` | 新規作成 | 運用手順書（セットアップ/コマンド一覧/日常運用/学習データ生成/トラブルシューティング/バックアップ） |
| `docs/arch.md` | 新規作成 | 設計書（コンポーネント責務/データフロー/学習データパイプライン/依存方向/設計判断/失敗時方針/DBスキーマ概要） |
| `docs/learning-data-contract.md` | 新規作成 | 学習データ契約書（データ形式/粒度/キー/カラム定義/特徴量/ラベル/リーク防止/スキーマバージョン） |

**第2回 impl-review 対応で追加変更**:
| ファイル | 操作 | 説明 |
|---------|------|------|
| `docs/ops.md` | 更新 | 学習データ生成の「前提条件」セクションを追加（ディレクトリ作成要件） |

## Verify 実行結果

### 1. ドキュメントファイル存在確認

```bash
test -f docs/spec.md && test -f docs/ops.md && test -f docs/arch.md && test -f docs/learning-data-contract.md && echo "All docs exist: OK"
```

**結果**: `All docs exist: OK`

### 2. 基本ドキュメント必須見出し確認

```bash
grep -q "## 目的" docs/spec.md && \
grep -q "## ユースケース" docs/spec.md && \
grep -q "## 外部インターフェース" docs/spec.md && \
grep -q "## セットアップ" docs/ops.md && \
grep -q "## 日常運用" docs/ops.md && \
grep -q "## コンポーネント責務" docs/arch.md && \
grep -q "## データフロー" docs/arch.md && \
echo "Required sections in base docs: OK"
```

**結果**: `Required sections in base docs: OK`

### 3. learning-data-contract.md 必須見出し確認

```bash
grep -q "## データ形式" docs/learning-data-contract.md && \
grep -q "## データ粒度とキー" docs/learning-data-contract.md && \
grep -q "## ラベル定義" docs/learning-data-contract.md && \
grep -q "### 特徴量一覧（現行定義）" docs/learning-data-contract.md && \
grep -q "## 未来情報リーク防止" docs/learning-data-contract.md && \
grep -q "## スキーマバージョン" docs/learning-data-contract.md && \
echo "Required sections in learning-data-contract: OK"
```

**結果**: `Required sections in learning-data-contract: OK`

**注**: Plan の Verify では `## 特徴量一覧` だが、実際の docs 構造では `### 特徴量一覧（現行定義）`（カラム定義の子セクション）が論理的に適切なため、Verify を実態に完全一致させて `### 特徴量一覧（現行定義）` に修正。

### 4. package.json scripts 整合性確認（順方向）

```bash
for cmd in $(node -e "const p=require('./package.json'); console.log(Object.keys(p.scripts).join(' '))"); do
  if grep -q "$cmd" docs/ops.md; then
    echo "Found in ops.md: $cmd"
  else
    echo "MISSING in ops.md: $cmd"
  fi
done
```

**結果**: 14 scripts すべて Found（全スクリプトが ops.md に記載済み）

**発見した問題と対応**:
- `create-result-additional` が当初 ops.md に未記載 → 追記（未実装スクリプトである旨も記載）

### 5. ops.md コマンド整合性確認（逆方向）

```bash
for cmd in $(grep -oE "npm run [a-z-]+" docs/ops.md | sed 's/npm run //' | sort | uniq); do
  node -e "const p=require('./package.json'); process.exit(p.scripts['$cmd'] ? 0 : 1)" && \
    echo "Valid: $cmd" || echo "EXTRA: $cmd"
done
```

**結果**: 13 コマンドすべて Valid（余計なコマンドなし）

### 6. 学習データ出力パス規約の確認

```bash
ls -la resources/learnings/ 2>/dev/null || echo "directory does not exist"
```

**結果**: `resources/learnings/` ディレクトリは存在しない

**解釈**: これは正常。パス規約（実装上のデフォルト出力先）と生成物の実在は別である:
- **パス規約**: `src/analytics/learning-input-creator.js` のコードから読み取れる出力先
- **生成物の実在**: `npm run learn-pre` 等の実行後に確認

確認方法: `npm run learn-pre` 実行後に `ls resources/learnings/` で確認可能。

## DoD 充足根拠

| DoD 項目 | 充足状況 | 根拠 |
|---------|---------|------|
| docs/spec.md が存在し、最低限項目を網羅 | OK | Verify 1, 2 で確認 |
| docs/ops.md が存在し、第三者が作業できる具体性 | OK | Verify 1, 2, 4, 5 で確認、必須キー一覧・全コマンド記載 |
| docs/arch.md が存在し、コンポーネント責務・データフローを明示 | OK | Verify 1, 2 で確認、Mermaid 図あり |
| docs/learning-data-contract.md が存在し、必須項目が埋まっている | OK | Verify 1, 3 で確認 |
| 主要フロー（収集/学習/推論/購入/通知/結果）が spec と arch で一貫 | OK | spec.md と arch.md の両方で同一フローを記述 |
| 不明点に確認方法が明記 | OK | 各ドキュメントの「不明点/要確認」セクションに確認方法を併記 |
| ドキュメント内リンクが壊れていない | OK | learning-data-contract.md への相対リンクを確認 |
| 断定事項すべてに根拠（ファイルパス:行番号）が付与 | OK | 下記「根拠付き記述の例」参照 |

## 根拠付き記述の例（各 docs から抜粋）

各ドキュメントで採用している根拠の付け方:

### spec.md より
```
| netkeiba.com | レース情報・結果のスクレイピング | HTTP (cheerio/puppeteer) | `src/accumulations/future-race-extractor.js:10` |
```

### ops.md より
```
- `config.ipat.maxRetryCount` 分ごとに購入タイミングをチェック
  根拠: `src/purchases/ipat-purchase-manager.js:59`, `src/purchases/purchase-result-checker.js:50`
```

### arch.md より
```
- **判断**: IPAT 連携を puppeteer でブラウザ自動操作
- **根拠**: `src/purchases/ipat-connect-purchaser.js` 全体
```

### learning-data-contract.md より
```
カラム定義の **SoT（Source of Truth）** は `resources/defs/learning-input-columns.json` である。
根拠: `src/analytics/learning-input-creator.js:40`, `:203-209`
```

## 残課題・不確実点

### 残課題

1. **`create-result-additional` スクリプト**: package.json に定義されているが src/index.js に実装がない。
   - **根拠**: `src/index.js` の switch 文（L40-209）に `case 'create-result-additional':` が存在しない
   - 実行すると default ケース（L207-208）に到達し `throw new Error('unexpected target.')` となる
   - ops.md に「未実装（package.json のみ定義）」として注記済み

### 不確実点（各ドキュメントの「不明点/要確認」に記載済み）

| 項目 | 仮説 | 確認方法 |
|------|------|----------|
| abel-learning との連携方法 | Jupyter Notebook 経由でモデル実行 | `src/simulations/predictor.js` の URL 設定を確認 |
| resources/configs/index.yml の必須キー | `ipat.*`, `mail.*`, `jupyter.*`, `pred*Url` 等 | `grep -r "config\." src/` で参照箇所を網羅的に抽出 |
| cron/スケジューラ設定 | 外部で設定されている可能性 | 運用者へのヒアリング |
| abel-learning 側のカラム定義との整合性 | abel-learning が `input-cols.json` を読み込む | abel-learning リポジトリの実装を確認 |
| スキーマバージョンの互換性チェック | バージョン不一致時は警告/エラー | abel-learning 側の実装を確認 |

## 実装時に発見した事実

### 1. `create-result-additional` の未実装

- **事実**: package.json に定義あり、src/index.js に case 文なし
- **根拠**: `src/index.js:207-208` の default ケースに到達するため、`unexpected target` エラーとなる

### 2. 学習データ出力パス規約

`src/analytics/learning-input-creator.js` のコード分析により、以下の **出力パス規約** を確定:

| ファイル種別 | 出力パス規約 | 根拠 |
|-------------|-------------|------|
| 入力データ | `resources/learnings/input.csv` | `src/analytics/learning-input-creator.js:549` の `_write` 関数 |
| 正解データ | `resources/learnings/answer-{key}.csv` | `src/analytics/learning-input-creator.js:514-516` の `_writeAnswer` 関数 |
| 実行時カラムリスト | `resources/learnings/input-cols.json` | `src/analytics/learning-input-creator.js:19-21` の定数定義 |
| 紐付きデータ | `resources/learnings/relation.json` | `src/analytics/learning-input-creator.js:522-527` の `_writeRelation` 関数 |

**注**: これは「パス規約」であり、生成物の実在確認は `npm run learn-pre` 実行後に行う。

### 3. 列定義 SoT の整理

- **SoT（設計時定義）**: `resources/defs/learning-input-columns.json` - カラム名の定義（リポジトリにコミット済み）
- **実行時生成**: `resources/learnings/input-cols.json` - 実際に使用されたカラム名リスト（実行時に生成）

関係:
1. 実装は `src/analytics/learning-input-creator.js:40` で `resources/defs/${config.columns()}.json` を読み込む
2. 展開後のカラム名リストを `resources/learnings/input-cols.json` に書き出す（`src/analytics/learning-input-creator.js:203-209`）

learning-data-contract.md にこの関係を明記済み。

### 4. 正解定義

`src/analytics/answer-def-manager.js:49-93` により 4 種類の正解定義を確認:
- ability タイプ: `earning-money`, `recovery-rate`
- rage タイプ: `rage-odds`, `rage-order`

### 5. スキーマバージョン

`src/analytics/configs/learning-config.js:12` に `version: 2` として定義。

## impl-review 指摘への対応

### 第1回 impl-review (NEEDS_CHANGES)

| 指摘 | 対応内容 |
|------|----------|
| Must Fix 1: パス規約 vs 生成物実在の混在 | 「出力パス規約」と「生成物の実在」を明確に分離。learning-data-contract.md も「パス規約」として記述し、実在確認方法を併記 |
| Must Fix 2: 列定義 SoT の不整合 | SoT を `resources/defs/learning-input-columns.json` と明確化。`resources/learnings/input-cols.json` は「実行時生成」と位置づけ |
| Must Fix 3: Verify 見出し検査の不一致 | 実態に合わせて `### 特徴量一覧` を検査（Plan の `## 特徴量一覧` から変更、理由を明記） |
| Should Fix 4: 根拠例示の不足 | 「根拠付き記述の例」セクションを追加 |
| Should Fix 5: create-result-additional の根拠 | `src/index.js` に case 文が存在しない根拠を明記 |

### 第2回 impl-review (NEEDS_CHANGES)

| 指摘 | 対応内容 |
|------|----------|
| Must Fix 1: 根拠表のファイルパス省略 | 学習データ出力パス規約の根拠表を `src/analytics/learning-input-creator.js:549` のように完全修飾に統一 |
| Should Fix 2: ディレクトリ生成挙動の明記 | ops.md に「前提条件」セクションを追加し、`mkdir -p resources/learnings` が必要である旨を根拠付きで記載 |
| Should Fix 3: Verify 見出しの完全一致 | `### 特徴量一覧（現行定義）` を完全一致で検査するよう修正 |
