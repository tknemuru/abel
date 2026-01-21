Status: DESIGN_APPROVED

Summary:
WSL上でlearn-preまで到達するための手順が、ディレクトリ作成→DBコピー→config配置→npm install→learn-pre→生成物検証→ops追記の順で具体化されており妥当。
前回指摘した、秘匿情報の扱い、init-db非実行の明確化、最低限の契約観点（input.csv非空・answerファイル1つ以上）をPlanに取り込めている。

Requests:
なし

Verify:
WSL上で以下を実行し、すべて成功すること。
1) npm install
2) npm run learn-pre
3) test -s resources/learnings/input.csv
4) test -f resources/learnings/input-cols.json
5) ls resources/learnings/answer-*.csv が1つ以上存在

Rollback:
WSL側に取り込んだ db/race.db と resources/configs/index.yml を削除し、docs/ops.md 変更はgit revertで直前コミットへ戻す。
