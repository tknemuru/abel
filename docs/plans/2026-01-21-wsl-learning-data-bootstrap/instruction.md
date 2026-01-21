[Title]
WSL上で学習データ生成（learn-pre）までを復活（Jupyter不要）

[Goal]
WSL(Ubuntu)環境で、既存のSQLite DBと最低限のresourcesを用いて、学習データ生成コマンド（少なくとも npm run learn-pre）がエラーなく完了し、生成物が所定パスに出力される状態を再現可能にする。

[Out of Scope]
Jupyter連携（Notebook URL / token を使う予測呼び出し）
IPAT連携・購入（購入実行、購入監視、結果確認）
メール通知
netkeibaスクレイピング（DB作成・更新のための取得は本トピックでは行わない）

[Inputs Provided]
Windows側に以下が存在する前提：
1) SQLite DB
  Path: C:\work\abel\race.db
  WSL path: /mnt/c/work/abel/race.db
2) resources（最低限）
  Path: C:\work\abel\resources
  WSL path: /mnt/c/work/abel/resources

[Constraints]
1) 既存DB（race.db）を破壊しないこと。初期化で上書きされる可能性がある操作は避けるか、必要なら必ずバックアップを取ってから実施すること。
2) 学習データ契約（出力パス・形式・キー等）を変更しないこと。生成物の場所・形式は現行仕様を維持すること。
3) 追加の機能実装はしない。WSLでの再現性確立に必要な最小限の修正と、手順のドキュメント化のみ行うこと。
4) スクレイピングや外部サービスへのアクセスが不要な範囲で完結させること。

[Plan of Attack]
Task 1: 現状把握（DBパスとresources参照点の特定）
1. リポジトリ内でSQLite DBの参照箇所を特定する（設定ファイル、db-provider、db-accessor等）。
2. learn-pre 実行時に参照される resources 配下（defs, params, learnings 等）の実パス・必要ファイルを特定する。
3. npm scripts から learn-pre の実行エントリポイントを追い、前提となるディレクトリ作成要否を確認する。

Task 2: WSL環境の準備（依存解決）
1. WSL上でNode.js/npmの前提を確認し、npm install が通る状態にする。
2. sqlite3等のネイティブ依存で失敗する場合は、WSL上で必要なビルド依存を最小限導入して解消する。
3. このトピックではJupyter/puppeteer/IPATは対象外なので、不要な依存の追加や環境構築はしない（既存依存の解決に留める）。

Task 3: DB/resources の取り込み（安全優先）
1. 作業用ディレクトリ（WSL側のrepo）に対して、Windows側の DB と resources を取り込む。
2. 取り込み方法は以下の優先で検討する：
  2.1 書き込みが発生しないならシンボリックリンクでも良い
  2.2 書き込みが発生しうる場合はコピーを推奨（DB破壊防止）
3. いずれの場合も、元の /mnt/c/work/abel/race.db を上書きしない。

Task 4: 実行検証（learn-preまで）
1. npm install を実行し成功させる。
2. init-db は「既存DBを壊さない」方針で扱う。
  2.1 learn-pre が既存DB前提で動くなら init-db を実行しない
  2.2 どうしても必要な場合は、先にDBバックアップを取り、上書きが起きない方法で実行する
3. npm run learn-pre を実行し成功させる。
4. 生成物を確認する（例：resources/learnings 配下の input.csv、answer-*.csv、input-cols.json 等）。
5. 生成物の存在だけでなく、最低限以下の妥当性チェックを行う：
  5.1 input-cols.json が生成されている
  5.2 input.csv が生成され、0行ではない（ヘッダなしの可能性があるため、行数/列数で確認）
  5.3 異常終了や例外ログがない

Task 5: 手順のドキュメント化（再現性）
1. WSLでの再現手順を docs/ops.md に追記する。追記内容は以下：
  1.1 前提（Windows側のDB/resources配置場所）
  1.2 WSL側での取り込み手順（/mnt/c からのコピー or link）
  1.3 実行コマンド（npm install, npm run learn-pre）
  1.4 よくある失敗（ディレクトリ不足、権限、sqlite3ビルド等）と対処
  1.5 Verify（生成物確認コマンド）

[Verify]
1. WSLで以下が成功すること：
  1.1 npm install
  1.2 npm run learn-pre
2. 以下の確認が取れること：
  2.1 resources/learnings/ に input.csv が存在する
  2.2 resources/learnings/ に input-cols.json が存在する
  2.3 resources/learnings/ に answer-*.csv が存在する（生成されるキーに応じて）
3. 推奨確認コマンド例（実際のパスはrepoに合わせて調整）：
  ls -la resources/learnings/
  wc -l resources/learnings/input.csv
  head -n 1 resources/learnings/input-cols.json

[Deliverables]
1. WSLでlearn-preまで到達できる状態（エラーなく完走）
2. docs/ops.md の更新（WSL復活手順とVerify）
3. 変更ファイル一覧と、実行ログ要点（何で詰まり、どう解消したか）

[Rollback]
1. コード変更はgitで管理し、問題があれば直前コミットへgit revertで戻せること。
2. DBは必ず元ファイル（/mnt/c/work/abel/race.db）を保持し、作業用コピーを破棄すれば元に戻せること。
