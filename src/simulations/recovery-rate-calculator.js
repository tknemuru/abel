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
  calc (sims) {
    const results = {}
    const _sims = Object.values(sims)
    for (const sim of _sims) {
      for (const type in sim.purchases) {
        if (!results[type]) {
          results[type] = {
            profit: 0,
            loss: 0,
            allTicketNum: 0,
            winTicketNum: 0
          }
        }
        for (const ticket of sim.purchases[type]) {
          const payMoneys = module.exports._calcPayMoneys(ticket.pays)
          results[type].profit += payMoneys[type] * ticket.ticketNum
          results[type].loss -= 100 * ticket.ticketNum
          results[type].allTicketNum += ticket.ticketNum
          results[type].winTicketNum += payMoneys[type] > 0 ? ticket.ticketNum : 0
        }
      }
    }
    const sum = {
      profit: 0,
      loss: 0,
      allTicketNum: 0,
      winTicketNum: 0
    }
    for (const type in results) {
      sum.profit += results[type].profit
      sum.loss += results[type].loss
      sum.allTicketNum += results[type].allTicketNum
      sum.winTicketNum += results[type].winTicketNum
    }
    results.sum = sum
    return results
  },
  /**
   * @description 払い戻し金額を算出します。
   * @param {Object} pays 払い戻し情報
   * @returns {Object} 払い戻し金額
   */
  _calcPayMoneys (pays) {
    const creator = require('@an/learning-answer-creator')
    const payMoneys = {
      tan: creator.createAnswerByTanPay(pays),
      fuku: creator.createAnswerByFukuPay(pays),
      waku: creator.createAnswerByWakuPay(pays),
      uren: creator.createAnswerByUrenPay(pays),
      wide: creator.createAnswerByWidePay(pays),
      sanfuku: creator.createAnswerBySanfukuPay(pays)
    }
    return payMoneys
  }
}
