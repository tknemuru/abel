'use strict'

const _ = require('lodash')

/**
 * @module 学習用正解データの作成機能を提供します。
 */
module.exports = {
  /**
   * @description チケット単価
   */
  TicketUnitPay: 100,
  /**
   * @description 順位から正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByOrder (data) {
    const validator = require('@h/validation-helper')
    const order = data.ret0_order_of_finish
    validator.required(order)
    return Number(order)
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
   * @param {Number} index インデックス
   * @returns {Number} 正解データ
   */
  createAnswerByRecoveryRate (data, index = 0) {
    const validator = require('@h/validation-helper')
    const odds = data[`ret${index}_odds`]
    const order = data[`ret${index}_order_of_finish`]
    validator.required(odds)
    validator.required(order)
    const _order = Number(order)
    return (_order === 1) ? odds : 0
  },
  /**
   * @description 順位に応じた回収率によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @param {Number} index インデックス
   * @returns {Number} 正解データ
   */
  createAnswerByRecoveryRateReduce (data, index = 0) {
    const odds = data[`ret${index}_odds`] || 0
    const order = data[`ret${index}_order_of_finish`] || 0
    const _order = Number(order)
    let ret = 0
    if (_order === 1) {
      ret = odds
    } else if (_order === 2 || _order === 3) {
      ret = Number((odds / _order).toFixed(2))
    }
    return ret
  },
  /**
   * @description 上位3位の回収率によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @param {Number} index インデックス
   * @returns {Number} 正解データ
   */
  createAnswerByTopThreeRecoveryRate (data, index = 0) {
    const odds = data[`ret${index}_odds`] || 0
    const order = data[`ret${index}_order_of_finish`] || 0
    const _order = Number(order)
    let ret = 0
    if (_order <= 3) {
      ret = odds
    }
    return ret
  },
  /**
   * @description 単勝の払い戻し金額によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByTanPay (data) {
    const horseNo = data.ret0_horse_number
    const tanHorseNo = data.ret0_tan_horse_number
    const pay = data.ret0_tan_pay - module.exports.TicketUnitPay
    return horseNo === tanHorseNo ? pay : module.exports.TicketUnitPay * -1
  },
  /**
   * @description 複勝の払い戻し金額によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByFukuPay (data) {
    const horseNo = data.ret0_horse_number
    let ret = module.exports.TicketUnitPay * -1
    for (let i = 0; i < 3; i++) {
      const no = data[`ret0_fuku_horse_number_${i + 1}`]
      const pay = data[`ret0_fuku_pay_${i + 1}`] - module.exports.TicketUnitPay
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
    let ret = module.exports.TicketUnitPay * -1
    for (let i = 0; i < 2; i++) {
      const no = data[`ret0_waku_horse_number_${i + 1}`]
      const pay = data.ret0_waku_pay - module.exports.TicketUnitPay
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
        const pay = data[`ret0_wide_pay_${i + 1}`] - module.exports.TicketUnitPay
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
    return len > 0 ? sum / len : module.exports.TicketUnitPay * -1
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
    return module.exports._createAnswerByCombinationPay(data, 'utan', 2, true)
  },
  /**
   * @description 三連単の払い戻し金額によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerBySantanPay (data) {
    return module.exports._createAnswerByCombinationPay(data, 'santan', 3, true)
  },
  /**
   * @description ペア馬券の払い戻し金額によって正解データを作成します。
   * @param {Object} data 学習用データ
   * @param {String} type 馬券種別
   * @param {Number} combNum ペア数
   * @param {Boolean} isTan 着順通りかどうか
   * @returns {Number} 正解データ
   */
  _createAnswerByCombinationPay (data, type, combNum, isTan) {
    const horseNo = data.ret0_horse_number
    let ret = module.exports.TicketUnitPay * -1
    for (let i = 0; i < combNum; i++) {
      const no = data[`ret0_${type}_horse_number_${i + 1}`]
      const pay = data[`ret0_${type}_pay`] - module.exports.TicketUnitPay
      const order = data.ret0_order_of_finish
      if (horseNo === no) {
        ret = pay
        if (isTan) {
          const ratio = (combNum - Number(order) + 1) / combNum
          ret = ret * ratio
        }
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
  },
  /**
   * @description 1位のオッズから正解データを作成します。
   * @param {Array} hists 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByTopOdds (hists) {
    const topOdds = {}
    const tops = hists.filter(h => h.ret0_order_of_finish === 1)
    for (const top of tops) {
      topOdds[top.ret0_race_id] = top.ret0_odds
    }
    return topOdds
  },
  /**
   * @description 上位3位のオッズから正解データを作成します。
   * @param {Array} hists 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByTopThreeOdds (hists) {
    const topOdds = {}
    const tops = hists
      .filter(h => h.ret0_order_of_finish >= 1 && h.ret0_order_of_finish <= 3)
    for (const top of tops) {
      if (topOdds[top.ret0_race_id]) {
        continue
      }
      const sum = _.sum(
        tops
          .filter(t => t.ret0_race_id === top.ret0_race_id)
          .map(t => t.ret0_odds)
      )
      topOdds[top.ret0_race_id] = Number((sum / 3).toFixed(2))
    }
    return topOdds
  },
  /**
   * @description 順位と人気順の差異から正解データを作成します。
   * @param {Array} hists 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswerByOrderPopularityDiff (hists) {
    const sumDiffs = {}
    const raceIds = _.uniq(hists.map(h => h.ret0_race_id))
    for (const raceId of raceIds) {
      const sumDiff = hists
        .filter(h => h.ret0_race_id === raceId)
        .reduce((prev, curr) => {
          const diff = Math.abs(curr.ret0_order_of_finish - curr.ret0_popularity)
          return prev + diff
        }, 0)
      sumDiffs[raceId] = sumDiff
    }
    return sumDiffs
  }
}
