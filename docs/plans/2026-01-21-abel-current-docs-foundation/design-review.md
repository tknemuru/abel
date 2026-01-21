Status: DESIGN_APPROVED

# Summary
前回の Plan（spec/ops/arch + learning-data-contract 追加）からさらに改善され、学習データ仕様の根拠についても「列定義ファイルの実在確認」を (A) 事実側に取り込み、学習データ出力先の特定も「経路追跡（コマンド→到達関数→書き込み）」として具体化されています。
Verify も learning-data-contract の必須見出しを全項目に拡張し、scripts 整合チェックを “失敗で落ちる” 形に強化できています。
基礎要件（事実/仮説分離、断定の根拠、確認方法、現状実態と将来指針の分離）を満たし、Claude Code が迷わず実行できる粒度です。

# Must Fix (for approval)
- なし（本 Plan は DESIGN_APPROVED）

# Should Fix / Minor Improvements
## 1) Step 0-1 の依存抽出コマンドのノイズ低減
- `grep -RohE "(require\\(|from\\s+)..."` は import 先だけでなく周辺文字列も拾い、ノイズが出る可能性があります。
- arch.md 用の“依存方向”を確実に抽出するために、最終的に「ディレクトリ間依存（accumulations→dbs 等）」へ集約する方針（集約ルール）を Plan に 1 行足すと、出力がブレにくいです。

## 2) Verify: ops.md と scripts の「逆方向チェック」が未実装
- 現状は「package.json の scripts が ops.md に全部載っているか」は落とせますが、
  ops.md に余計なコマンドが書かれていても検出できません。
- 任意ですが、ops.md の “コマンド一覧” セクションを機械抽出できる形式（例：箇条書きに限定）にする、または逆方向チェックの簡易ルールを追加するとさらに堅いです。

## 3) 学習データ生成物の検証（サンプル）の具体化
- `resources/learnings/input.csv` は例示として良いですが、実際の出力ファイル名が異なる可能性があります。
- Step 0-4 で確定した出力先・ファイル名規則を使って、Verify のサンプルを “実態に合わせて更新する” 旨を明記すると、Verify が形骸化しにくいです。

# Non-blocking Notes
- 列定義ファイルの実在確認を (A) に入れたことで、learning-data-contract の根拠が強くなりました。
- 学習データ契約を「勝率改善の最重要情報」として別ドキュメント化し、spec/ops/arch との役割分担も明確で良いです。

# Decision
- 本 Plan は DESIGN_APPROVED。
- 実装（= ドキュメント作成）の段階へ進めます。
