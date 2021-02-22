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
  },
  /**
   * @description SQLにIN句向けのプレイスホルダーを作成します。
   * @param {String} sql SQL
   * @param {Array} inParams IN句にセットするパラメータ
   */
  makeInPlaceHolder (sql, inParams) {
    return sql.replace('?#', inParams.map(() => '?').join(','))
  }
}
