'use strict'

/**
 * @module SQLファイルの読み込み機能を提供します。
 */
module.exports = {
  /**
   * @description SQLファイルを読み込みます。
   * @returns {String} SQLファイルの文字列
   */
  read (fileName) {
    const fs = require('fs')
    const sql = fs.readFileSync(`resources/sqls/${fileName}.sql`, { encoding: 'utf-8' })
    return sql
  }
}
