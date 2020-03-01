'use strict'

/**
 * @module 学習用正解データの作成機能を提供します。
 */
module.exports = {
  /**
   * @description 上位の順位から正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByTopOrder (data) {
    const validator = require('@h/validation-helper')
    const order = data.ret0_order_of_finish
    const odds = data.ret0_odds
    validator.required(order)
    validator.required(odds)
    const _order = Number(order)
    return _order - 1
  },
  /**
   * @description オッズのランクによって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByOddsRank (data) {
    const validator = require('@h/validation-helper')
    const order = data.ret0_order_of_finish
    const odds = data.ret0_odds
    validator.required(order)
    validator.required(odds)
    const _order = Number(order)
    const answer = ((_order === 1) ? odds : 0) * 100
    let label = 0
    if (answer <= 0) {
      label = 3
    } else if (answer < 500) {
      label = 2
    } else if (answer < 3000) {
      label = 0
    } else {
      label = 1
    }
    return label
  },
  /**
   * @description オッズによって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByOdds (data) {
    const validator = require('@h/validation-helper')
    const odds = data.ret0_odds
    validator.required(odds)
    return odds
  },
  /**
   * @description オッズと順位によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByOddsAndOrder (data) {
    const validator = require('@h/validation-helper')
    const odds = data.ret0_odds
    const order = data.ret0_order_of_finish
    validator.required(odds)
    validator.required(order)
    const _order = Number(order)
    return Math.round((odds * _order) * 10) / 10
  },
  /**
   * @description 回収率によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByRecoveryRate (data) {
    const validator = require('@h/validation-helper')
    const odds = data.ret0_odds
    const order = data.ret0_order_of_finish
    validator.required(odds)
    validator.required(order)
    const _order = Number(order)
    return (_order === 1) ? odds : 0
  },
  /**
   * @description 単勝の払い戻し金額によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByTanPay (data) {
    const horseNo = data.ret0_horse_number
    const tanHorseNo = data.ret0_tan_horse_number
    const pay = data.ret0_tan_pay
    return horseNo === tanHorseNo ? pay : 0
  },
  /**
   * @description 複勝の払い戻し金額によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByFukuPay (data) {
    const horseNo = data.ret0_horse_number
    let ret = 0
    for (let i = 0; i < 3; i++) {
      const no = data[`ret0_fuku_horse_number_${i + 1}`]
      const pay = data[`ret0_fuku_pay_${i + 1}`]
      if (horseNo === no) {
        ret = pay
        break
      }
    }
    return ret
  },
  /**
   * @description 枠連の払い戻し金額によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByWakuPay (data) {
    const frameNo = data.ret0_frame_number
    let ret = 0
    for (let i = 0; i < 2; i++) {
      const no = data[`ret0_waku_horse_number_${i + 1}`]
      const pay = data.ret0_waku_pay
      if (frameNo === no) {
        ret = pay
        break
      }
    }
    return ret
  },
  /**
   * @description 馬連の払い戻し金額によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByUrenPay (data) {
    return module.exports._createAnswerByCombinationPay(data, 'uren', 2)
  },
  /**
   * @description ワイドの払い戻し金額によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByWidePay (data) {
    const horseNo = data.ret0_horse_number
    const ret = []
    for (let i = 0; i < 3; i++) {
      for (let h = 0; h < 2; h++) {
        const no = data[`ret0_wide_horse_number_${i + 1}${h + 1}`]
        const pay = data[`ret0_wide_pay_${i + 1}`]
        if (horseNo === no) {
          ret.push(pay)
          break
        }
      }
    }
    const len = ret.length
    let sum = 0
    for (let i = 0; i < len; i++) {
      sum += ret[i]
    }
    return len > 0 ? sum / len : 0
  },
  /**
   * @description 三連複の払い戻し金額によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerBySanfukuPay (data) {
    return module.exports._createAnswerByCombinationPay(data, 'sanfuku', 3)
  },
  /**
   * @description 馬単の払い戻し金額によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByUtanPay (data) {
    return module.exports._createAnswerByCombinationPay(data, 'utan', 2)
  },
  /**
   * @description 三連単の払い戻し金額によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerBySantanPay (data) {
    return module.exports._createAnswerByCombinationPay(data, 'santan', 3)
  },
  /**
   * @description ペア馬券の払い戻し金額によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  _createAnswerByCombinationPay (data, type, combNum) {
    const horseNo = data.ret0_horse_number
    let ret = 0
    for (let i = 0; i < combNum; i++) {
      const no = data[`ret0_${type}_horse_number_${i + 1}`]
      const pay = data[`ret0_${type}_pay`]
      if (horseNo === no) {
        ret = pay
        break
      }
    }
    return ret
  },
  /**
   * @description 順位と獲得賞金から正解データを作成します。
   * @param {Object} data 学習用データ
   * @param {Number} money 獲得賞金
   * @returns {Number} 正解データ
   */
  createAnswerByOrderAndEarningMoney (data, money) {
    const order = data.ret0_order_of_finish
    const count = data.ret0_horse_count
    const ret = (count - order) * money
    return ret
  }
}
