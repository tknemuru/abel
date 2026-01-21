Status: DESIGN_APPROVED

Summary:
契約テストの実行条件を「RUN_CONTRACT_TESTS=1 のときのみ実行」に一意に確定し、通常の npm test を汚さずに可観測性を担保する設計になった。input-cols.json の形式（実行時生成は配列）も契約記述に整合し、前提条件・Verify・ops 追記内容も具体化されているため、Phase 1 の土台として十分に実装へ進める。

Requests:
なし

Verify:
1. 通常開発: npm test を実行し、既存テストが成功し、契約テストがスキップされること。
2. 契約検証: npm run learn-pre 実行後に RUN_CONTRACT_TESTS=1 npm test を実行して成功すること。
3. 契約違反検出: input.csv を空にして RUN_CONTRACT_TESTS=1 npm test が契約違反として失敗し、メッセージで原因が分かること。
4. BOM 検出: input.csv の先頭に BOM を付与して RUN_CONTRACT_TESTS=1 npm test が BOM 検出で失敗すること。

Rollback:
このトピックで追加したテストファイルと docs/ops.md の変更を git revert で巻き戻す。
