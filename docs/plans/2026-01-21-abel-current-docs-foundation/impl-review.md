Status: DONE

# Summary
前回までの Must Fix を解消し、impl.md 内の自己矛盾（パス規約 vs 実在、列定義 SoT の揺れ）と根拠表記の不統一（ファイルパス省略）も解決されています。
Verify も見出し検査を docs 実態に完全一致させ、scripts 整合性の順方向/逆方向チェック、学習データ生成の前提（ディレクトリ作成要件）まで含めており、Plan の意図（第三者が迷わず運用・検証できる）を満たしています。

# Evidence of Fixes
- 学習データ出力パス規約の根拠が `src/analytics/learning-input-creator.js:549` 等の **ファイルパス:行番号** 形式に統一された
- 列定義 SoT が `resources/defs/learning-input-columns.json`、実行時生成が `resources/learnings/input-cols.json` として整理され、両者の関係と実装根拠（`src/analytics/learning-input-creator.js:40`, `:203-209`）が明記された
- learning-data-contract.md の必須見出し検査が `### 特徴量一覧（現行定義）` に完全一致し、Verify の品質が上がった
- ops.md に学習データ生成の前提条件（`mkdir -p resources/learnings` 要否）を追記し、運用手順としての欠落を解消した

# Notes (non-blocking)
- `create-result-additional` の未実装スクリプトについて、switch に case が無いことと default で例外になる根拠が揃っており、ドキュメント化として適切です。
