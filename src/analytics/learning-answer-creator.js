'use strict'

/**
 * @module 学習用正解データの作成機能を提供します。
 */
module.exports = {
  /**
   * @description 上位の順位から正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByTopOrder (data) {
    const validator = require('@h/validation-helper')
    const order = data.ret_pre0_order_of_finish
    const odds = data.ret_pre0_odds
    validator.required(order)
    validator.required(odds)
    const _order = Number(order)
    return _order - 1
  },
  /**
   * @description オッズのランクによって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByOddsRank (data) {
    const validator = require('@h/validation-helper')
    const order = data.ret_pre0_order_of_finish
    const odds = data.ret_pre0_odds
    validator.required(order)
    validator.required(odds)
    const _order = Number(order)
    const answer = ((_order === 1) ? odds : 0) * 100
    let label = 0
    if (answer <= 0) {
      label = 3
    } else if (answer < 500) {
      label = 2
    } else if (answer < 3000) {
      label = 0
    } else {
      label = 1
    }
    return label
  }
}
