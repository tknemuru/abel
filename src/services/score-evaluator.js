'use strict'

/**
 * @module 評価機能を提供します。
 */
module.exports = {
  /**
   * @description 評価を行います。
   * @param {Array} race - レース情報
   * @returns {Array} 評価値
   */
  evaluate (race) {
    const evals = race.map(r => {
      const val = Math.round(Math.random() * 100)
      return {
        frameNumber: r.frameNumber,
        eval: val
      }
    })
    return evals
  }
}
