Status: DONE

Summary:
学習データ契約テストが SoT（docs/learning-data-contract.md）に対して正しく機能する状態まで到達した。relation.json のキー名不整合は「実生成物を SoT に昇格」する方針で解消され、契約書・テスト・実データが一致している。
また、learn-pre の追記モード問題についても、再現性を壊さないための運用前提（クリーン→実行）を docs/ops.md に明示し、契約テストの安定実行条件が固定された。

Requests:
なし

Verify:
1. resources/learnings 配下をクリーンする。
2. npm run learn-pre を実行する。
3. RUN_CONTRACT_TESTS=1 npm test を実行し成功すること。
4. 通常の npm test が成功し、契約テストがスキップされること。
5. relation.json のキー名（raceId / horseNumber）が契約書・テスト・生成物で一致していること。

Rollback:
このトピックで追加・更新した以下のファイルを git revert で巻き戻す。
- test/analytics/learning-data-contract-test.js
- docs/ops.md
- docs/learning-data-contract.md
