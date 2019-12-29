'use strict'

module.exports = {
  /**
   * @description 素性の調査を行います。
   * @returns {void}
   */
  async survey () {
    // 調査対象のカラムを取得
    const fs = require('fs')
    const columns = JSON.parse(fs.readFileSync('resources/defs/identity-survey-columns.json', { encoding: 'utf-8' }))
    console.log(columns)

    // テンプレートのSQLを取得
    const reader = require('@d/sql-reader')
    const sql = reader.read('select_identity_survey')

    // テンプレートからSQLを組み立てる
    const sqls = columns.map(col => {
      return sql
        .replace(/\$\$columnName/g, col.name)
        .replace(/\$\$columnAlias/g, col.alias)
        .replace(/\$\$countName/g, '買い目数')
        .replace(/\$\$recoveryRateName/g, '回収率')
    })

    // パラメータを作成
    // SQLを実行
    const accessor = require('@d/db-accessor')
    const results = await accessor.all(sqls)
    console.log(results)
    for (const ret of results) {
      console.log(ret)
    }
  }
}
