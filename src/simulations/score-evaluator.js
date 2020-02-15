'use strict'

/**
 * @module 評価機能を提供します。
 */
module.exports = {
  /**
   * @description バージョン
   */
  version: 0,
  /**
   * @description 評価を行います。
   * @param {Array} horses - 出馬情報
   * @returns {Array} 評価値
   */
  evaluate (horses) {
    let evals = []
    evals = horses.map(h => {
      return {
        score: h.eval
      }
    })
    return evals
  }
}
