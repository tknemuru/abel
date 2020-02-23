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
    // 紐付きキー情報
    const keyRelations = JSON.parse(
      fs.readFileSync(
        path.join(module.exports.FileDir, 'key-relation.json'),
        { encoding: 'utf-8' }))

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
      validator.expect(keyRelations.length === predResults.length - 1)

      // 紐付きキー情報
      const keyRet = {}
      const length = keyRelations.length
      for (let i = 0; i < length; i++) {
        const score = Math.round(Number(predResults[i][0]) * 1000) / 1000
        keyRet[keyRelations[i].key] = score
      }
      fs.writeFileSync(file.replace('.txt', '-key.json')
        , JSON.stringify(keyRet, null, '  ')
        , { encoding: 'utf-8' }
      )
    }
  }
}
