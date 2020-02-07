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
        odds += (ticketNum + placeTicketNum) * -1
        if (p.orderOfFinish <= 3) {
          let rate = 0
          if (p.popularity <= 4) {
            rate = 0.4
          } else if (p.popularity <= 7) {
            rate = 0.3
          } else if (p.popularity <= 11) {
            rate = 0.2
          } else {
            rate = 0.1
          }
          odds += Math.max(p.odds * rate, 1.0) * placeTicketNum
        }
        if (p.orderOfFinish === 1) {
          odds += p.odds * ticketNum
        }
        // 払い戻し率を考慮
        // return odds * 0.8
        return odds
      })
    return rates
  }
}
