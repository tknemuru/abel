'use strict'

const fs = require('fs')

/**
 * @module ファイル操作に関する補助機能を提供します。
 */
module.exports = {
  /**
   * @description ファイルが存在するかどうか。
   * @param {String} fileName - ファイル名
   * @returns {Boolean} ファイルが存在するかどうか
   */
  existsFile (fileName) {
    try {
      const fs = require('fs')
      const ret = fs.statSync(fileName)
      if (ret.isDirectory()) return false
      return true
    } catch (err) {
      if (err.code === 'ENOENT') return false
    }
  },
  /**
   * @description ディレクトリかどうか。
   * @param {String} fileName - ファイル名
   * @returns {Boolean} ディレクトリかどうか
   */
  isDirectory (fileName) {
    try {
      const fs = require('fs')
      const ret = fs.statSync(fileName)
      return ret.isDirectory()
    } catch (err) {
      if (err.code === 'ENOENT') return false
    }
  },
  /**
   * @description jsonファイルを読み込みます。
   * @param {String} path パス
   * @returns {Object} オブジェクト
   */
  read (path) {
    return fs.readFileSync(
      path,
      { encoding: 'utf-8' })
  },
  /**
   * @description jsonファイルを読み込みます。
   * @param {String} path パス
   * @returns {Object} オブジェクト
   */
  readJson (path) {
    return JSON.parse(fs.readFileSync(
      path,
      { encoding: 'utf-8' }))
  },
  /**
   * @description json形式としてファイルに書き込みます。
   * @param {Object} data データ
   * @param {String} path パス
   * @returns {void}
   */
  writeJson (data, path) {
    fs.writeFileSync(path
      , JSON.stringify(data, null, '  ')
      , { encoding: 'utf-8' }
    )
  }
}
