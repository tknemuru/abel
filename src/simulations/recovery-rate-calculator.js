'use strict'

/**
 * @module 回収率の算出機能を提供します。
 */
module.exports = {
  /**
   * @description 回収率を算出します。
   * @param {Array} purchases - 購入情報
   * @returns {Array} 回収率
   */
  calc (purchases) {
    const rates = purchases
      .map(p => {
        if (p.orderOfFinish !== 1) {
          return 0
        }
        const ticketNum = p.ticketNum || 1
        // return p.orgOdds * ticketNum
        return p.odds * ticketNum
      })
    return rates
  }
}
