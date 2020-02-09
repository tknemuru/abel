'use strict'

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
  }
}
