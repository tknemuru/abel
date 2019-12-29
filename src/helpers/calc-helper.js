'use strict'

/**
 * @module 計算補助機能を提供します。
 */
module.exports = {
  /**
   * @description 平均値を求めます。
   * @param {Array} vals - 値のリスト
   * @returns {Number} 平均値
   */
  average (vals) {
    const _ = require('lodash')
    const sum = _.reduce(vals, (sum, val) => sum + val)
    const avg = sum / vals.length
    return avg
  },
  /**
   * @description 偏差値を求めます。
   * @param {Array} vals - 値のリスト
   * @returns {Number} 偏差値
   */
  standardScore (vals) {
    const avg = module.exports.average(vals)
    const sd = Math.sqrt(
      vals
        .map((current) => {
          const difference = current - avg
          return difference ** 2
        })
        .reduce((previous, current) =>
          previous + current
        ) / vals.length
    )
    const ss = vals.map(val => (10 * (val - avg) / sd) + 50)
    return ss
  }
}
