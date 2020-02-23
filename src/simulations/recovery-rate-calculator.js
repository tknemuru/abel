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
          if (ticket.ticketNum === 0) {
            continue
          }
          const payMoneys = module.exports._calcPayMoneys(ticket, type)
          results[type].profit += payMoneys * ticket.ticketNum
          results[type].loss -= 100 * ticket.ticketNum
          results[type].allTicketNum += ticket.ticketNum
          results[type].winTicketNum += payMoneys > 0 ? ticket.ticketNum : 0
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
   * @param {Object} ticket チケット情報
   * @param {Object} ticket.pays 払い戻し情報
   * @param {String} type チケット種別
   * @returns {Object} 払い戻し金額
   */
  _calcPayMoneys (ticket, type) {
    const creator = require('@an/learning-answer-creator')
    let payMoneys = 0
    switch (type) {
      case 'tan':
        payMoneys = creator.createAnswerByTanPay(ticket.pays)
        break
      case 'fuku':
        payMoneys = creator.createAnswerByFukuPay(ticket.pays)
        break
      case 'waku':
        payMoneys = creator.createAnswerByWakuPay(ticket.pays)
        break
      case 'uren':
        payMoneys = module.exports._calcUrenPay(ticket)
        break
      case 'wide':
        payMoneys = module.exports._calcWidePay(ticket)
        break
      case 'sanfuku':
        payMoneys = module.exports._calcSanfukuPay(ticket)
        break
      case 'utan':
        payMoneys = module.exports._calcUtanPay(ticket)
        break
      case 'santan':
        payMoneys = module.exports._calcSantanPay(ticket)
        break
    }
    return payMoneys
  },
  /**
   * @description ペア馬券の払い戻し金額を算出します。
   * @param {Array} data 学習用データ
   * @param {String} type 学習用データ
   * @param {Number} combNum ペアの要素数
   * @param {Boolean} requiredOrder 順番が必要か
   * @returns {Number} 正解データ
   */
  _calcCombinationPay (data, type, combNum, requiredOrder) {
    const validator = require('@h/validation-helper')
    validator.requiredContainsArray(data)
    validator.expect(data.length === combNum)
    const horseNos = data.map(d => d.pays.ret0_horse_number)
    let ret = 0
    const pay = data[0].pays[`ret0_${type}_pay`]
    const wins = []
    for (let i = 0; i < combNum; i++) {
      wins.push(false)
    }
    for (let hIdx = 0; hIdx < combNum; hIdx++) {
      if (requiredOrder) {
        const no = data[0].pays[`ret0_${type}_horse_number_${hIdx + 1}`]
        if (horseNos[hIdx] === no) {
          wins[hIdx] = true
        }
      } else {
        for (let i = 0; i < combNum; i++) {
          const no = data[0].pays[`ret0_${type}_horse_number_${i + 1}`]
          if (horseNos[hIdx] === no) {
            wins[hIdx] = true
            break
          }
        }
      }
    }
    ret = wins.every(w => w) ? pay : 0
    return ret
  },
  /**
   * @description ワイドの払い戻し金額を算出します。
   * @param {Array} data 学習用データ
   * @param {String} type 学習用データ
   * @param {Number} combNum ペアの要素数
   * @param {Boolean} requiredOrder 順番が必要か
   * @returns {Number} 正解データ
   */
  _calcWidePay (data) {
    const validator = require('@h/validation-helper')
    validator.requiredContainsArray(data)
    validator.expect(data.length === 2)
    const horseNos = data.map(d => d.pays.ret0_horse_number)
    let ret = 0
    for (let unitIdx = 0; unitIdx < 3; unitIdx++) {
      const pay = data[0].pays[`ret0_wide_pay_${unitIdx + 1}`]
      const wins = []
      for (let i = 0; i < 2; i++) {
        wins.push(false)
      }
      for (let hIdx = 0; hIdx < 2; hIdx++) {
        for (let i = 0; i < 2; i++) {
          const no = data[0].pays[`ret0_wide_horse_number_${unitIdx + 1}${i + 1}`]
          if (horseNos[hIdx] === no) {
            wins[hIdx] = true
            break
          }
        }
      }
      ret = wins.every(w => w) ? pay : 0
      if (ret > 0) {
        break
      }
    }
    return ret
  },
  /**
   * @description 馬連の払い戻し金額を算出します。
   * @param {Array} data 学習用データ
   * @returns {Number} 正解データ
   */
  _calcUrenPay (data) {
    return module.exports._calcCombinationPay(data, 'uren', 2, false)
  },
  /**
   * @description 三連複の払い戻し金額を算出します。
   * @param {Array} data 学習用データ
   * @returns {Number} 正解データ
   */
  _calcSanfukuPay (data) {
    return module.exports._calcCombinationPay(data, 'sanfuku', 3, false)
  },
  /**
   * @description 馬単の払い戻し金額を算出します。
   * @param {Array} data 学習用データ
   * @returns {Number} 正解データ
   */
  _calcUtanPay (data) {
    return module.exports._calcCombinationPay(data, 'utan', 2, true)
  },
  /**
   * @description 三連単の払い戻し金額を算出します。
   * @param {Array} data 学習用データ
   * @returns {Number} 正解データ
   */
  _calcSantanPay (data) {
    return module.exports._calcCombinationPay(data, 'santan', 3, true)
  }
}
