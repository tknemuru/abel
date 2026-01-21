# abel 学習データ契約書 (learning-data-contract.md)

本ドキュメントは、abel（データ生成側）と abel-learning（モデル学習・予測側）間の学習データインターフェースを定義する。

## データ形式

### ファイル形式

| 項目 | 仕様 | 根拠 |
|-----|------|------|
| 形式 | CSV（カンマ区切り） | `src/analytics/learning-input-creator.js:545-552` |
| 文字コード | UTF-8 | `fs.appendFileSync` のデフォルト |
| ヘッダ行 | なし（別途カラム定義ファイルで管理） | `src/analytics/learning-input-creator.js:203-209` |
| 改行コード | LF（Node.js デフォルト） | - |

### 出力先・ファイル命名規則（パス規約）

以下は実装コードから読み取れる **出力パス規約** である。実際のファイルは `npm run learn-pre` 等の実行後に生成される。

| ファイル種別 | 出力パス規約 | 命名規則 |
|-------------|-------------|----------|
| 入力データ | `resources/learnings/input.csv` | 固定名 |
| 正解データ | `resources/learnings/answer-{key}.csv` | `{key}` は正解定義キー（後述） |
| 実行時カラムリスト | `resources/learnings/input-cols.json` | 固定名（実行時に生成） |
| 紐付きデータ | `resources/learnings/relation.json` | 固定名 |
| キー紐付き | `resources/learnings/key-relation.json` | 固定名（towardPost 時のみ） |

根拠: `src/analytics/learning-input-creator.js:17-21`, `:506-527`, `:549`

**注**: 生成物の実在確認は `npm run learn-pre` 実行後に `ls resources/learnings/` で行う。

### 中間パラメータファイル

| パス | 用途 |
|-----|------|
| `resources/params/learnings/` | DB から抽出した JSON 形式の中間データ |

根拠: `src/analytics/learning-input-creator.js:17`

## データ粒度とキー

### 粒度

- **1行 = 1馬 × 1レース**（馬の出走単位）
- 同一レースに出走する馬は複数行として出力される

### 主キー（input.csv）

input.csv の各行は以下のカラムで一意に特定される:

| カラム | 説明 | 根拠 |
|-----|------|------|
| `ret0_race_id` | レースID（カラム定義参照） | `src/analytics/learning-input-creator.js:279` |
| `ret0_horse_number` | 馬番（カラム定義参照） | `src/analytics/learning-input-creator.js:281` |

### relation.json のキー

紐付きデータ（relation.json）は以下のキーを持つ:

| キー | 説明 | 根拠 |
|-----|------|------|
| `raceId` | レースID | `src/analytics/learning-input-creator.js:506-527` |
| `horseNumber` | 馬番 | `src/analytics/learning-input-creator.js:506-527` |
| `raceName` | レース名 | `src/analytics/learning-input-creator.js:506-527` |
| `horseId` | 馬ID | `src/analytics/learning-input-creator.js:506-527` |
| `horseName` | 馬名 | `src/analytics/learning-input-creator.js:506-527` |
| `orderOfFinish` | 着順 | `src/analytics/learning-input-creator.js:506-527` |
| `popularity` | 人気順 | `src/analytics/learning-input-creator.js:506-527` |
| `odds` | オッズ | `src/analytics/learning-input-creator.js:506-527` |

**注**: relation.json のキー名は camelCase 形式であり、input.csv のカラム名（snake_case + ret0_ prefix）とは命名規則が異なる。

## カラム定義

### 定義ファイル（SoT）

カラム定義の **SoT（Source of Truth）** は `resources/defs/learning-input-columns.json` である。

- **設計時定義**: `resources/defs/learning-input-columns.json`（リポジトリにコミット済み）
- **実行時生成**: `resources/learnings/input-cols.json`（実行時に生成、実際に使用されたカラム名リスト）

実装では `src/analytics/learning-input-creator.js:40` で `resources/defs/${config.columns()}.json` を読み込み、展開後のカラム名リストを `resources/learnings/input-cols.json` に書き出す（`src/analytics/learning-input-creator.js:203-209`）。

根拠: `src/analytics/learning-input-creator.js:40`, `:203-209`

### カラム構造

```json
{
  "pre": ["カラム名", ...],
  "others": ["カラム名", ...]
}
```

- **pre**: 予定レース（ret0）のみに適用されるカラム
- **others**: 過去レース（ret1〜ret4）に適用されるカラム

### 実際のカラム展開ルール

1. `ret0_{pre のカラム名}` - 予定レースの pre カラム
2. `ret{1-4}_{pre のカラム名}` - 過去レース 1〜4 の pre カラム
3. `ret{1-4}_{others のカラム名}` - 過去レース 1〜4 の others カラム

根拠: `src/analytics/learning-input-creator.js:354-393`

### 特徴量一覧（現行定義）

根拠: `resources/defs/learning-input-columns.json`

#### pre カラム（予定・過去レース共通）

| カラム名 | 説明 | 型 |
|---------|------|-----|
| `distance` | 距離（メートル） | 数値 |
| `race_start` | 発走時刻 | 数値 |
| `surface_digit` | 馬場種別（芝/ダート等） | 数値（カテゴリ） |
| `direction_digit` | 回り（右/左） | 数値（カテゴリ） |
| `weather_digit` | 天候 | 数値（カテゴリ） |
| `surface_state_digit` | 馬場状態（良/稍重等） | 数値（カテゴリ） |
| `race_date_month` | 開催月 | 数値 |
| `race_date_day` | 開催日 | 数値 |
| `race_number` | レース番号 | 数値 |
| `horse_count` | 出走頭数 | 数値 |
| `horse_number` | 馬番 | 数値 |
| `frame_number` | 枠番 | 数値 |
| `age` | 馬齢 | 数値 |
| `basis_weight` | 斤量 | 数値 |
| `horse_weight` | 馬体重 | 数値 |
| `horse_weight_diff` | 馬体重増減 | 数値 |
| `sex_digit` | 性別 | 数値（カテゴリ） |

#### others カラム（過去レースのみ）

| カラム名 | 説明 | 型 |
|---------|------|-----|
| `order_of_finish` | 着順 | 数値 |
| `pass_1` | 通過順位1 | 数値 |
| `pass_2` | 通過順位2 | 数値 |
| `pass_3` | 通過順位3 | 数値 |
| `pass_4` | 通過順位4 | 数値 |
| `last_phase` | 上がりタイム | 数値 |
| `odds` | オッズ | 数値 |
| `popularity` | 人気順 | 数値 |
| `earning_money` | 獲得賞金 | 数値 |
| `finishing_time_digit` | タイム（数値化） | 数値 |
| `length_diff_digit` | 着差（数値化） | 数値 |

## ラベル定義（正解データ）

### 正解定義キー

根拠: `src/analytics/answer-def-manager.js:49-93`

#### ability（馬能力）タイプ

| キー | 出力ファイル | 説明 | 計算式 |
|-----|-------------|------|--------|
| `earning-money` | `answer-earning-money.csv` | 順位×獲得賞金スコア | `(horse_count - order) * earning_money` |
| `recovery-rate` | `answer-recovery-rate.csv` | 上位3着の回収率 | 3着以内なら odds、それ以外は 0 |

#### rage（荒れ指標）タイプ

| キー | 出力ファイル | 説明 | 計算式 |
|-----|-------------|------|--------|
| `rage-odds` | `answer-rage-odds.csv` | 上位3着オッズ平均 | `sum(top3_odds) / 3` |
| `rage-order` | `answer-rage-order.csv` | 順位と人気順の乖離 | `sum(abs(order - popularity))` |

### 正解データ形式

- 1行1値（入力データと同じ行数・順序）
- CSV 形式（カンマ区切り）

## 未来情報リーク防止

### 設計方針

1. **カラム分離**: `pre` と `others` を分離し、予定レース（ret0）には結果情報（others）を含めない
2. **バリデーション**: 新馬戦・障害レースを除外（過去履歴がないため）
3. **時系列順序**: ret0 が予定レース、ret1〜ret4 が過去レース（時系列順）

根拠:
- `src/analytics/learning-input-creator.js:363-381` - カラム展開ルール
- `src/analytics/configs/learning-config.js:63-67` - バリデーション

### 注意事項

- `ret0_odds`, `ret0_popularity` は予測時点で既知の情報（発走前オッズ）として扱う
- 過去レースの結果情報（others）は学習時には既知であるが、予測時の ret0 には含まれない

## スキーマバージョン

### 現行バージョン

- **バージョン**: 2
- 根拠: `src/analytics/configs/learning-config.js:12`

### バージョン管理方針

- カラム定義ファイル（`resources/defs/learning-input-columns.json`）の変更時はバージョンを更新
- abel-learning 側でもバージョン整合性チェックを行う（推奨）

## 生成コマンド

| コマンド | 設定ファイル | 用途 |
|---------|-------------|------|
| `npm run learn-pre` | `learning-config.js` | 能力学習データ生成 |
| `npm run learn-rage-pre` | `learning-rage-config.js` | 荒れ指標学習データ生成 |
| `npm run learn-collegial-pre` | `learning-collegial-config.js` | 合議制学習データ生成 |

## 不明点/要確認

| 項目 | 仮説 | 確認方法 |
|------|------|----------|
| abel-learning 側のカラム定義との整合性 | abel-learning が `input-cols.json` を読み込んで使用 | abel-learning リポジトリの読み込み処理を確認 |
| スキーマバージョンの互換性チェック | バージョン不一致時は警告またはエラー | abel-learning 側の実装を確認 |
| 特徴量追加時の手順 | カラム定義ファイル変更 → バージョン更新 → 両リポジトリ同期 | 運用者へのヒアリング |
