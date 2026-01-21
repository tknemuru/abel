Status: NEEDS_CHANGES

Summary:
WSL上で npm install と npm run learn-pre が完走し、生成物（input.csv / input-cols.json / answer-*.csv / relation.json）の存在・非空を確認できている点は良い。
また、sqlite3 を Node.js v20 互換のために更新した判断も妥当。

Requests:
1. 変更ファイル一覧の正確性を担保すること。
   1.1 sqlite3 を更新して npm install しているため、通常 package-lock.json（または npm-shrinkwrap.json）が更新される。更新がある場合は変更ファイル一覧に含め、コミットに含めること。
   1.2 もし lockfile を意図的に更新しない方針なら、その理由と再現手順（CI/他環境でのnpm install再現性）を impl.md に明記すること。
2. sqlite3 更新の影響範囲を最小限に説明すること。
   2.1 「WSLでのNode v20対応のための変更」であることを明記し、既存運用（他OS/他Node版）での想定影響と、想定される最小サポート範囲（例：Nodeの最低バージョン）を docs/ops.md 追記または impl.md に1-2行で記載すること。
3. Verifyの再現性を強化すること。
   3.1 npm install 実行前提（Node/npmの前提バージョン、必要aptパッケージ）が docs/ops.md に揃っているか確認し、不足があれば追記すること（特に sqlite3 ビルド周り）。

Verify:
1) git status がクリーンであること（未コミットのlockfile等が残っていない）
2) npm ci（lockfile運用の場合）または npm install（現運用の場合）が成功する
3) npm run learn-pre が成功する
4) test -s resources/learnings/input.csv
5) test -f resources/learnings/input-cols.json
6) ls resources/learnings/answer-*.csv が1つ以上存在

Rollback:
直前コミットへgit revertし、WSL側の db/race.db と resources/configs/index.yml を削除して作業コピーを破棄する。
