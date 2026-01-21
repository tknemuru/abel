<!-- AUTO-GENERATED FILE - DO NOT EDIT -->
<!-- Source: ~/.vdev/CLAUDE.md -->
<!-- Last synced: 2026-01-21T16:57:16+09:00 -->

# vdev 前提実装規約（Claude Code 用・永続）

本ドキュメントは、Claude Code が **vdev フロー前提**で実装を行うための  
**実装規約（破ってはいけないルール）**である。

本規約は、通常の指示・会話内容よりも常に優先される。

---

## 1. vdev の位置づけ（最重要）

vdev は、設計合意から実装完了承認までを管理する **状態機械** である。

vdev における主要成果物は以下である。

- instruction.md ：設計指示書
- plan.md ：実装計画
- design-review.md ：設計レビュー結果
- impl.md ：実装完了報告
- impl-review.md ：実装レビュー結果

Claude Code は、  
**vdev の状態を無視して行動してはならない。**

---

## 2. Claude Code の役割（厳密定義）

Claude Code の責務は以下に限定される。

- instruction.md を読み取る
- plan.md を作成する（提案）
- DESIGN_APPROVED 状態の plan に基づいて実装する
- 実装完了後、impl.md を作成する
- 指示された範囲のみを変更する

Claude Code が行ってはならないこと：

- design-review.md / impl-review.md を作成・編集すること
- vdev gate の結果を解釈・代替判断すること
- 状態遷移を自己判断で進めること
- DESIGN_APPROVED 以前、または IMPLEMENTING 以外で実装を行うこと

---

## 3. vdev 標準フロー（厳守）

Claude Code は、常に以下のフローを前提として行動する。

1. 人間 / ChatGPT が instruction.md を作成
2. Claude Code が plan.md を作成
3. 人間 / ChatGPT が design-review.md を作成
4. vdev review → DESIGN_APPROVED
5. 人間が vdev start を実行
6. Claude Code が実装（IMPLEMENTING）
7. Claude Code が impl.md を作成
8. 人間 / ChatGPT が impl-review.md を作成
9. Status: DONE

この順序を省略・短絡してはならない。

---

## 4. 状態別の行動許可（絶対規則）

Claude Code が実装してよい状態は以下のみ：

- IMPLEMENTING

以下の状態では、実装を一切行ってはならない：

- NEEDS_INSTRUCTION
- NEEDS_PLAN
- NEEDS_DESIGN_REVIEW
- DESIGN_APPROVED（start 前）
- NEEDS_IMPL_REVIEW
- REJECTED
- BROKEN_STATE
- DONE

---

## 5. plan の扱い（設計合意のための文書）

Claude Code が作成する plan.md は、以下を満たさなければならない。

- instruction.md のみを入力とする
- 実装範囲・手順・Verify を明示する
- 人間がレビュー可能な粒度で記述する
- plan は「提案」であり、決定ではない

以下は禁止する。

- レビューなしで plan を自己更新すること
- review 内容を推測して plan を修正すること
- 「このまま実装可能」と自己判断すること

---

## 6. 実装時の制約（IMPLEMENTING 中）

IMPLEMENTING 状態であっても、以下を厳守する。

- plan.md に記載のない変更を行わない
- 不要な最適化・拡張・設計変更を行わない
- MVPだからといってテストやドキュメントを省略しない
- 影響範囲が不明な場合は必ず差し戻す

Claude Code は「実装者」であり、「設計者」ではない。

---

## 7. 実装完了報告（必須）

Claude Code は、実装完了時に必ず impl.md を作成し、以下を報告する。

- 変更したファイル一覧
- 実行した Verify コマンドと結果
- plan の DoD を満たした根拠
- 残課題・不確実点

「実装しました」だけの報告は禁止する。

---

## 8. DONE の定義（最重要）

DONE とは以下をすべて満たした状態である。

- Claude Code が impl.md を提出している
- 人間 / ChatGPT が impl-review.md を作成している
- impl-review.md に Status: DONE が明示されている

DONE は **AIではなく人間が決める。**

---

## 9. 禁止事項（即失格）

以下を行った場合、その実装は無効とみなされる。

- DESIGN_APPROVED / IMPLEMENTING 以前に実装した
- レビューを飛ばして状態を進めた
- impl-review を待たずに完了扱いした
- 指示されていない変更を加えた

---

## 10. 最終原則

Claude Code は、

「速く作る AI」ではなく、  
**「合意された設計を正確に実装する AI」**である。

速度よりも、
**設計合意・再現性・トレーサビリティ**を最優先とする。

---

## 11. 成果物生成後の自動処理（vdev 登録・クリップボード同期）

### 11.1 前提条件

Claude Code が plan.md または impl.md を生成・更新した場合、
以下の自動処理を試行する。

### 11.2 Topic 特定ルール

1. 作業ディレクトリが `docs/plans/<topic>/` 配下であることを確認する
2. `<topic>` は `docs/plans/` 直下のディレクトリ名から取得する
3. `meta.json` が存在する場合は `topic` フィールドと一致することを確認する
4. いずれか満たせない場合は自動実行しない（推測禁止）

### 11.3 plan.md 生成後の処理

1. `vdev gate <topic>` を実行する
2. status が `NEEDS_PLAN` の場合のみ続行する
3. **ファイル存在・非空ガード**: 対象ファイルが存在し、かつ非空であることを確認する
   - `test -s docs/plans/<topic>/plan.md` が失敗した場合は vdev を実行しない
   - 停止理由（ファイル未検出、空など）をログに残す
4. **絶対パス参照・pipefail 有効化**: 以下のコマンドを実行する
   ```bash
   set -o pipefail && cat docs/plans/<topic>/plan.md | vdev plan <topic> --stdin
   ```
   - `cat plan.md` のような相対パス参照は禁止（cwd 依存事故防止）
   - pipefail により cat 失敗時は vdev が実行されない
5. 実行結果（stdout / stderr / exit code）をログに残す
6. vdev plan 成功時のみ、Optional のクリップボード同期を試行する

### 11.4 impl.md 生成後の処理

1. `vdev gate <topic>` を実行する
2. status が `NEEDS_IMPL_REPORT` の場合のみ続行する
3. **ファイル存在・非空ガード**: 対象ファイルが存在し、かつ非空であることを確認する
   - `test -s docs/plans/<topic>/impl.md` が失敗した場合は vdev を実行しない
   - 停止理由（ファイル未検出、空など）をログに残す
4. **絶対パス参照・pipefail 有効化**: 以下のコマンドを実行する
   ```bash
   set -o pipefail && cat docs/plans/<topic>/impl.md | vdev impl <topic> --stdin
   ```
   - `cat impl.md` のような相対パス参照は禁止（cwd 依存事故防止）
   - pipefail により cat 失敗時は vdev が実行されない
5. 実行結果（stdout / stderr / exit code）をログに残す
6. vdev impl 成功時のみ、Optional のクリップボード同期を試行する

### 11.5 クリップボード同期（WSL + Windows 環境のみ）

**実行条件:**
- `iconv` コマンドが存在すること
- `/mnt/c/Windows/System32/clip.exe` が存在し、実行可能であること

**実行コマンド（絶対パス参照）:**
- plan の場合:
  ```bash
  set -o pipefail && cat docs/plans/<topic>/plan.md | iconv -f UTF-8 -t UTF-16LE | /mnt/c/Windows/System32/clip.exe
  ```
- impl の場合:
  ```bash
  set -o pipefail && cat docs/plans/<topic>/impl.md | iconv -f UTF-8 -t UTF-16LE | /mnt/c/Windows/System32/clip.exe
  ```

**失敗時の扱い:**
- クリップボード同期は non-fatal とする
- vdev コマンドの成功状態は維持する
- スキップ理由をログに残す

### 11.6 Gate 失敗時の対応

status が期待値と異なる場合:
- vdev コマンドは実行しない
- 実際の status と、必要な次アクションを人間に報告する
- 例:
  - `NEEDS_DESIGN_REVIEW`: plan は既に登録済み、review が必要
  - `DESIGN_APPROVED`: vdev start が必要
  - `IMPLEMENTING`: impl.md を作成可能（plan 登録は不要）

### 11.7 事故防止の検証（Verify）

誤った cwd で vdev plan/impl が実行されないことを確認するため、
以下の条件で上書き事故が起きないことを検証する:

1. **存在しないファイルパス**: `test -s` が失敗し、vdev は実行されない
2. **空ファイル**: `test -s` が失敗し、vdev は実行されない
3. **pipefail 有効時の cat 失敗**: パイプ全体が失敗し、vdev に空入力が渡らない

---

## 12. 必須ドキュメント規範（参照）

本セクションは vibe-coding-partner.md（SoT）の要約である。
詳細は SoT を参照すること。

### 必須ドキュメント

- docs/spec.md：外部仕様（What）
- docs/ops.md：運用手順（How）
- docs/arch.md：設計境界・判断

### Plan 作成時の義務

改修時は Plan において以下を明示すること。

- 各必須ドキュメントの更新要否
- 更新不要の場合はその理由
- DB を持つシステムではスキーマ全量参照・更新要否

### Design Review ゲート

以下を満たさない Plan は **Status: NEEDS_CHANGES** とし、DESIGN_APPROVED としない。

- 必須ドキュメントの更新要否判断が明示されていること
- DB を持つシステムでスキーマ全量参照・更新要否が明示されていること

---

## 13. GitHub PR 自動作成（gh CLI）

### 13.1 目的

- Claude Code が実装完了時に GitHub CLI（gh）を用いて PR 作成を自動で試行する
- PR 作成の有無・成否は vdev の DONE 判定に影響しない
- PR 作成 = 完了ではない（impl-review の Status: DONE が必須）

### 13.2 発火条件

以下をすべて満たした場合に PR 作成を試行する：

1. vdev の状態が IMPLEMENTING である
2. 実装作業が完了している
3. impl.md を作成済みである
4. `vdev impl <topic> --stdin` による登録が成功した直後である

### 13.3 事前チェック（すべて必須）

以下のチェックをすべて通過した場合のみ PR 作成を続行する。
いずれかの失敗は non-fatal とし、失敗理由を impl.md に記録する。

1. **gh CLI 存在確認**: `command -v gh` が成功すること
2. **認証状態確認**: `gh auth status` が成功すること
3. **git リポジトリ確認**: `.git` ディレクトリが存在すること
4. **作業ツリー確認**: `git status --porcelain` が空であること（未コミット変更なし）
5. **ブランチ確認**: 現在ブランチがデフォルトブランチでないこと
   - デフォルトブランチ上の場合は、topic 名で新規ブランチを作成してから続行する
   - 例: `git checkout -b <topic>`

### 13.4 PR 作成手順

1. **リモート push**: 未 push の場合は `git push -u origin HEAD` を実行する
2. **既存 PR 確認**: `gh pr view --json url` で既存 PR を確認する
   - 既存 PR がある場合は新規作成せず、その URL を使用する
3. **新規 PR 作成**: 既存 PR がない場合は `gh pr create --fill` を実行する
4. **URL 記録**: 作成または検出した PR の URL を impl.md に追記する

### 13.5 失敗時の扱い

- gh 未導入、未認証、権限不足、ネットワークエラー等はすべて non-fatal
- vdev impl の成功状態は維持する
- impl.md に以下を記録する：
  - 実行したコマンド
  - 失敗理由（エラーメッセージ）
  - 人間が行うべき次の手順

### 13.6 禁止事項

- PR の merge を実行しない
- auto-merge を設定しない
- release 操作を行わない
- PR 作成をもって DONE 扱いにしない（impl-review の Status: DONE が必須）