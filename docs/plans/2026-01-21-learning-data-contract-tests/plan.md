# Learning Data Contract Tests - 実装計画

## 概要

学習データ生成（learn-pre）の出力が「学習データ契約（learning-data-contract.md）」に適合していることを、テストで機械的に検証できる状態にする。

## 実装方針

### テスト基盤の選択

- **既存の mocha + chai を使用**（新規導入なし）
- `npm test` で `mocha --recursive` が既に設定済み
- 既存テスト `test/helpers/convert-helper-test.js` のパターンを踏襲

### テストディレクトリ戦略

- **本番 `resources/learnings/` を直接検証**
- 理由: learn-pre 実行後の生成物を検証するテストなので、本番ディレクトリを読み取り専用で検証するのが最も簡潔
- テストは生成物を変更・削除しない（読み取り検証のみ）

### 契約テストの実行条件（採用案: 条件付き実行）

**採用案**: (b) 条件付き実行

契約テストは環境変数 `RUN_CONTRACT_TESTS=1` が設定されている場合のみ実行する。

**理由**:
- Phase 1 の目的は「壊れたらすぐ気づく」ための可観測性確保
- 通常の開発中に `npm test` を実行しても契約テストはスキップされ、既存ユニットテストに影響しない
- learn-pre 実行後に明示的に契約テストを走らせることで、意図した検証タイミングで確実に実行できる

**実装方法**:
```javascript
const RUN_CONTRACT_TESTS = process.env.RUN_CONTRACT_TESTS === '1'

describe('学習データ契約テスト', function() {
  before(function() {
    if (!RUN_CONTRACT_TESTS) {
      this.skip() // 環境変数未設定時はスキップ
    }
  })
  // ... テスト本体
})
```

**実行コマンド**:
- 通常開発: `npm test`（契約テストはスキップ）
- 契約検証: `RUN_CONTRACT_TESTS=1 npm test`（契約テストを実行）

### 前提条件（契約テスト実行時）

契約テストを実行する場合、以下が満たされていることが前提:

1. `resources/learnings/` ディレクトリが存在すること
2. `npm run learn-pre` が正常完了していること
3. DB（`db/race.db`）が存在し、データが投入されていること

テストでは、これらの前提条件が満たされていない場合に「何が不足しているか」を明確なメッセージで示す。

### 既存ユニットテストへの影響

- 契約テストは外部ネットワークアクセスなし
- タイムアウトは mocha デフォルト（2000ms）で十分（ファイル読み取りのみ）
- 条件付き実行のため、通常の `npm test` では契約テストはスキップされる

## 実装手順

### Step 1: 契約テストファイル作成

**ファイル**: `test/analytics/learning-data-contract-test.js`

**検証項目（instruction.md Deliverables 2.1〜2.6 に対応）**:

#### 1. ファイル存在検証

| ファイル | 種別 | 期待 |
|---------|------|------|
| `resources/learnings/input.csv` | 実行時生成 | 存在・非空 |
| `resources/learnings/input-cols.json` | 実行時生成 | 存在・非空 |
| `resources/learnings/relation.json` | 実行時生成 | 存在・非空 |
| `resources/learnings/answer-*.csv` | 実行時生成 | 1つ以上存在 |

#### 2. input.csv 基本形式検証

| 検証項目 | 内容 | 厳密度（Phase 1） |
|---------|------|------------------|
| BOM | UTF-8 BOM（0xEF 0xBB 0xBF）がないこと | **必須**（先頭3バイトを確認） |
| 改行コード | LF のみ使用 | **必須**（CRLF を検出したら失敗） |
| CSV 形式 | カンマ区切り | 最低限チェック（1行目にカンマが含まれること） |
| ヘッダなし | 1行目がデータ行 | 検証困難（数値データが並ぶことを期待） |

**LF/BOM 検証の実装方針**:
- BOM: ファイル先頭3バイトが `0xEF 0xBB 0xBF` でないことを確認
- LF: ファイル全体で `\r\n` が存在しないことを確認
- Windows 環境での生成でも Node.js デフォルトは LF のため、通常は問題なし
- 環境差分で誤検知するリスクは低いと判断

#### 3. input.csv 行数検証

- 行数が 1 以上であること（ゼロ件検知）
- 空行のみのファイルは契約違反

#### 4. input-cols.json 構造検証（実行時生成）

**対象**: `resources/learnings/input-cols.json`

| 検証項目 | 期待 |
|---------|------|
| JSON パース | 正常にパースできること |
| 型 | **配列**であること（展開後のカラム名リスト） |
| 要素数 | 1 以上であること |
| 要素型 | 各要素が文字列であること |

**注**: 契約書の記述に基づき、`input-cols.json` は「実行時に生成される展開後のカラム名リスト」であり、配列形式である。設計時の SoT（`resources/defs/learning-input-columns.json`）が `pre/others` 構造を持つが、今回のテスト対象は実行時生成物のみとする。

**SoT 検証（今回は対象外）**:
- `resources/defs/learning-input-columns.json` の `pre/others` 構造検証は今回のスコープ外
- 理由: instruction.md で「learn-pre の出力検証に集中する」と明記されているため
- 将来的に必要であれば別トピックで追加可能

#### 5. relation.json 構造検証

| 検証項目 | 期待 |
|---------|------|
| JSON パース | 正常にパースできること |
| 型 | 配列であること |
| 要素数 | 1 以上であること |
| 主キー存在 | 各要素が `ret0_race_id` と `ret0_horse_number` を持つこと |

#### 6. データ整合性検証

| 検証項目 | 期待 |
|---------|------|
| input.csv vs relation.json | 行数と要素数が一致すること |
| input.csv vs answer-*.csv | 各 answer ファイルの行数が input.csv と一致すること |

### Step 2: 前提条件チェックとエラーメッセージ

契約違反時に「何が契約違反か」を明確にするため、各検証でわかりやすいエラーメッセージを出力する。

```javascript
// 例: ディレクトリ不存在
it('resources/learnings ディレクトリが存在すること', function() {
  const exists = fs.existsSync(LEARNINGS_DIR)
  expect(exists,
    'resources/learnings が存在しません。npm run learn-pre を実行してください'
  ).to.be.true
})

// 例: 行数ゼロ検知
expect(lineCount,
  'input.csv は 1 行以上のデータが必要（ゼロ件は契約違反）'
).to.be.greaterThan(0)

// 例: BOM 検出
expect(hasBOM,
  'input.csv に UTF-8 BOM が含まれています（契約違反: BOMなしが期待）'
).to.be.false
```

### Step 3: ドキュメント更新

**docs/ops.md に追記する内容**:

#### 追記する節タイトル

`## テスト実行`

#### 追記内容（箇条書き）

- **前提条件**:
  - `mkdir -p resources/learnings`（初回のみ）
  - `npm run learn-pre` が正常完了していること
  - DB（`db/race.db`）が存在し、データが投入されていること

- **ユニットテスト実行**:
  ```bash
  npm test
  ```
  - 契約テストはスキップされる（通常開発用）

- **契約テスト実行**:
  ```bash
  RUN_CONTRACT_TESTS=1 npm test
  ```
  - learn-pre 実行後に使用
  - 学習データ生成物が契約に適合しているか検証

- **契約テスト失敗時の切り分け**:
  - ディレクトリ不存在 → `mkdir -p resources/learnings` を実行
  - ファイル不存在 → `npm run learn-pre` を再実行
  - BOM/CRLF 検出 → 生成元コードを確認（通常は発生しない）
  - 行数不一致 → learn-pre 実行中にエラーがなかったか確認

## 変更対象ファイル

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `test/analytics/learning-data-contract-test.js` | 新規作成 | 契約テスト本体 |
| `docs/ops.md` | 更新 | テスト実行セクションの追記 |

## 必須ドキュメント更新要否

| ドキュメント | 更新要否 | 理由 |
|-------------|---------|------|
| docs/spec.md | 不要 | 外部仕様に変更なし（テスト追加のみ） |
| docs/ops.md | **要** | テスト実行方法・前提条件を追記 |
| docs/arch.md | 不要 | 設計境界に変更なし |
| docs/learning-data-contract.md | 不要 | 契約自体は変更なし（テストは契約の追認） |

## Verify

1. **通常開発時**: `npm test` を実行し、既存テスト（convert-helper-test.js）が成功し、契約テストがスキップされること
2. **契約検証時**: `npm run learn-pre` 実行後に `RUN_CONTRACT_TESTS=1 npm test` を実行して成功すること
3. **契約違反検出**: 意図的に `resources/learnings/input.csv` を空にして `RUN_CONTRACT_TESTS=1 npm test` を実行し、契約違反として失敗し、メッセージで原因が分かること
4. **BOM 検出**: `resources/learnings/input.csv` の先頭に BOM を追加して `RUN_CONTRACT_TESTS=1 npm test` を実行し、BOM 検出で失敗すること
5. **契約書との整合性**: input-cols.json が配列形式であることの検証が契約書の記述と一致していることを確認

## DoD（Definition of Done）

- [ ] `npm test` がローカルで成功する（契約テストはスキップ）
- [ ] `RUN_CONTRACT_TESTS=1 npm test` が learn-pre 実行後に成功する
- [ ] learn-pre の生成物が契約に反する場合、テストが失敗し、原因がメッセージで分かる
- [ ] テスト実行でリポジトリが過度に汚れない（読み取り検証のみで生成物を変更しない）
- [ ] 追加したテストと設定は最小で、他領域（購入・スクレイピング・予測）に影響を与えない
- [ ] docs/ops.md にテスト実行セクションが追記されている

## Rollback

このトピックで追加したファイルを削除すれば元に戻る:
- `git rm test/analytics/learning-data-contract-test.js`
- `git checkout HEAD -- docs/ops.md`
