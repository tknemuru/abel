'use strict'

/**
 * @module 回収率の算出機能を提供します。
 */
module.exports = {
  /**
   * @description 回収率を算出します。
   * @param {Array} race - レース情報
   * @param {Array} horses - 購入対象の馬情報
   * @returns {Array} 回収率
   */
  calc (race, horses) {
    const rates = race
      .filter(r => horses.some(h => h === r.frameNumber))
      .map(r => r.orderOfFinish === 1 ? r.odds : 0)
    return rates
  }
}
