Status: DONE

Summary:
WSL上で npm install と npm run learn-pre が完走し、生成物（input.csv / input-cols.json / answer-*.csv / relation.json）の存在・非空が確認できている。
また、Node.js v20 環境での sqlite3 ビルド失敗に対して sqlite3 v5.1.7 へ更新し、package-lock.json も含めて変更管理できている。ops.md には秘匿情報の実値を含めず、Node要件も明記しており、再現性・運用性の観点で要件を満たす。

Requests:
なし

Verify:
1) git status がクリーンであること（未コミット差分なし）
2) npm ci（推奨。lockfile準拠）または npm install が成功する
3) npm run learn-pre が成功する
4) test -s resources/learnings/input.csv
5) test -f resources/learnings/input-cols.json
6) ls resources/learnings/answer-*.csv が1つ以上存在

Rollback:
直前コミットへgit revertし、WSL側の db/race.db と resources/configs/index.yml を削除して作業コピーを破棄する。
