'use strict'

/**
 * @module SQL組み立ての補助機能を提供します。
 */
module.exports = {
  /**
   * @description オブジェクトをパラメータ形式に変換します。
   * @param {Object} obj - オブジェクト
   * @returns {Object} パラメータ
   */
  toParam (data) {
    const param = {}
    const keys = Object.keys(data)
    for (const key of keys) {
      param[`$${key}`] = data[key]
    }
    return param
  }
}
