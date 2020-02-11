'use strict'

/**
 * @module 予測結果の整形機能を提供します。
 */
module.exports = {
  /**
   * @description ファイルディレクトリ
   */
  FileDir: 'resources/learnings',
  /**
   * @description 予測結果を整形します。
   * @returns {void}
   */
  async adjust () {
    const validator = require('@h/validation-helper')
    const fs = require('fs')
    const path = require('path')
    const orgRelations = fs.readFileSync(
      path.join(module.exports.FileDir, 'relation.json'),
      { encoding: 'utf-8' })
    // 分割して書き込んでいるため不正な箇所が出てしまうので修正しておく
    let relations = orgRelations.replace(/\]\[/g, ',')
    relations = JSON.parse(relations)

    // 予測結果の読み込み
    const predFiles = fs.readdirSync(module.exports.FileDir)
      .filter(f => /.*\.txt$/.test(f))
      .map(f => path.join(module.exports.FileDir, f))
    for (const file of predFiles) {
      let predResults = fs.readFileSync(file, { encoding: 'utf-8' })
      predResults = predResults
        .split(/\n/)
        .map(p => p.split(' '))
      // 結果の方は最後に空行が入っている
      validator.expect(relations.length === predResults.length - 1)

      const ret = relations.map((r, i) => {
        // r.eval = Math.round(Number(predResults[i][0]) * 1000) / 10
        r.eval = Math.round(Number(predResults[i][0]) * 1000) / 1000
        return r
      })
      fs.writeFileSync(file.replace('.txt', '.json')
        , JSON.stringify(ret, null, '  ')
        , { encoding: 'utf-8' }
      )
    }
  }
}
