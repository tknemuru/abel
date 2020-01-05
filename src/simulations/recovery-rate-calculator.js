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
        const ticketNum = p.ticketNum || 1
        const placeTicketNum = p.placeTicketNum || 0
        let odds = 0
        odds += ticketNum * -1
        if (p.orderOfFinish <= 3) {
          odds += Math.max(p.odds * 0.3, 1.0) * placeTicketNum
        }
        if (p.orderOfFinish === 1) {
          odds += p.odds * ticketNum
        }
        // 払い戻し率を考慮
        return odds * 0.8
      })
    return rates
  }
}
