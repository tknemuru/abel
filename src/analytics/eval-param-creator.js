'use strict'

/**
 * @module 評価パラメータの作成機能を提供します。
 */
module.exports = {
  /**
   * @description 評価パラメータを作成します。
   * @returns {void}
   */
  async create () {
    // 対象のカラムを取得
    const fs = require('fs')
    const columns = JSON.parse(fs.readFileSync('resources/defs/identity-eval-param-columns.json', { encoding: 'utf-8' }))
    console.log(columns)

    // テンプレートのSQLを取得
    const reader = require('@d/sql-reader')
    const sql = reader.read('select_identity_survey')

    for (const col of columns) {
      // テンプレートからSQLを組み立てる
      const _sql = sql
        .replace(/\$\$columnName/g, col.name)
        .replace(/\$\$columnAlias/g, col.alias)
        .replace(/\$\$countName/g, 'countNum')
        .replace(/\$\$recoveryRateName/g, 'recoveryRate')

      // SQLを実行
      const accessor = require('@d/db-accessor')
      let identity = await accessor.all(_sql)

      // 特殊な変換
      // TODO: あとでちゃんとやる
      if (col.name === 'sex') {
        const conv = require('@h/convert-helper')
        identity = identity.map(idt => {
          idt.sex = conv.convSex(idt.sex)
          return idt
        })
      }

      // 偏差値を算出
      const calc = require('@h/calc-helper')
      const ss = calc.standardScore(identity.map(idt => idt.recoveryRate))
      const idtAndSs = identity.map((idt, i) => Object.assign(idt, { score: ss[i] }))

      // 出力する形に整形
      const result = {}
      for (const idtss of idtAndSs) {
        result[idtss[col.alias]] = idtss
      }
      // ファイルに出力
      console.log(result)
      fs.writeFileSync(`resources/params/${col.name}.json`
        , JSON.stringify(result, null, '  ')
        , { encoding: 'utf-8' }
      )
    }
  }
}
