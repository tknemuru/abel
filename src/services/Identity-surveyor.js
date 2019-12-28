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
    const reader = require('@/services/sql-reader')
    const sql = reader.read('select_identity_survey')

    // テンプレートからSQLを組み立てる
    const sqls = columns.map(col => {
      return sql
        .replace(/\$\$columnName/g, col.name)
        .replace(/\$\$columnJpName/g, col.jpName)
    })

    // パラメータを作成
    // SQLを実行
    const accessor = require('@/services/db-accessor')
    const results = await accessor.all(sqls)
    console.log(results)
    for (const ret of results) {
      console.log(ret)
    }
  }
}
