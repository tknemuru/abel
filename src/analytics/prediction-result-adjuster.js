'use strict'

const fileHelper = require('@h/file-helper')

/**
 * @description 馬の強さ評価値ファイルディレクトリ
 */
const AbilityFileDir = 'resources/learnings'

/**
 * @description レースの荒れ指数ファイルディレクトリ
 */
const RageFileDir = 'resources/learnings-rage'

/**
 * @module 予測結果の整形機能を提供します。
 */
module.exports = {
  /**
   * @description 予測結果を整形します。
   * @param {Object} param パラメータ
   * @param {String} param.target 整形対象
   * @returns {void}
   */
  async adjust (param = { target: 'ability' }) {
    let fileDir
    switch (param.target) {
      case 'rage':
        fileDir = RageFileDir
        break
      default:
        fileDir = AbilityFileDir
    }
    const validator = require('@h/validation-helper')
    const fs = require('fs')
    const path = require('path')
    const orgRelations = fileHelper.read(path.join(fileDir, 'relation.json'))
    // 分割して書き込んでいるため不正な箇所が出てしまうので修正しておく
    let relations = orgRelations.replace(/\]\[/g, ',')
    relations = JSON.parse(relations)

    // 予測結果の読み込み
    const predFiles = fs.readdirSync(fileDir)
      .filter(f => /.*\.txt$/.test(f))
      .map(f => path.join(fileDir, f))
    for (const file of predFiles) {
      let predResults = fileHelper.read(file)
      predResults = predResults
        .split(/\n/)
        .map(p => p.split(' '))
      // 結果の方は最後に空行が入っている
      validator.expect(relations.length === predResults.length - 1)
      const ret = relations.map((r, i) => {
        r.eval = Math.round(Number(predResults[i][0]) * 1000) / 1000
        return r
      })
      fileHelper.writeJson(ret, file.replace('.txt', '.json'))
    }
  }
}
