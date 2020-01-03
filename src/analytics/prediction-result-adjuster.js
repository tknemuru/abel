'use strict'

/**
 * @module 予測結果の整形機能を提供します。
 */
module.exports = {
  /**
   * @description 予測結果を整形します。
   * @returns {void}
   */
  async adjust () {
    const validator = require('@h/validation-helper')
    const fs = require('fs')
    const orgRelations = fs.readFileSync('resources/learnings/relation.json', { encoding: 'utf-8' })
    // 分割して書き込んでいるため不正な箇所が出てしまうので修正しておく
    let relations = orgRelations.replace(/\]\[/g, ',')
    relations = JSON.parse(relations)
    let predResults = fs.readFileSync('resources/learnings/pred-result.txt', { encoding: 'utf-8' })
    predResults = predResults
      .split(/\n/)
      .map(p => p.split(' '))
    // 結果の方は最後に空行が入っている
    validator.expect(relations.length === predResults.length - 1)
    const ret = relations.map((r, i) => {
      r.eval = Math.round(Number(predResults[i][0]) * 1000) / 10
      return r
    })
    fs.writeFileSync('resources/learnings/pred-result.json'
      , JSON.stringify(ret, null, '  ')
      , { encoding: 'utf-8' }
    )
  }
}
