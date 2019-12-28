'use strict'

/**
 * @module 購入機能を提供します。
 */
module.exports = {
  /**
   * @description 購入します。
   * @param {Object} evals - 評価値
   * @returns {Array} 購入する枠番
   */
  purchase (evals) {
    const horses = evals
      .filter(e => e.eval >= 0)
      .map(e => e.frameNumber)
    return horses
  }
}
