'use strict'

/**
 * @module 購入機能を提供します。
 */
module.exports = {
  /**
   * @description 購入します。
   * @param {Object} params - パラメータ
   * @param {Object} params.evals - 評価値
   * @param {Number} params.minEval - 最低評価値
   * @returns {Array} 購入する枠番
   */
  purchase (params) {
    const horses = params.evals
      .filter(e => e.eval >= params.minEval)
      .map(e => e.horseNumber)
    if (horses.length > 0) {
      console.log(params.evals)
      console.log(horses)
    }
    return horses
  }
}
