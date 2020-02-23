'use strict'

/**
 * @module 購入機能を提供します。
 */
module.exports = {
  /**
   * バージョン
   */
  version: 4,
  /**
   * @description 購入します。
   * @param {Array} horses - 出馬リスト
   * @param {Array} scores - 評価値リスト
   * @param {Object} params - パラメータ
   * @param {Number} params.minScore - 最小スコア
   * @param {Number} params.maxPopularity - 最大人気順
   * @returns {Array} 購入リスト
   */
  purchase (horses, scores, params) {
    let purchases = []
    switch (module.exports.version) {
      case 2:
        purchases = module.exports.purchaseV2(horses, scores, params)
        break
      case 3:
        purchases = module.exports.purchaseV3(horses, scores, params)
        break
      case 4:
        purchases = module.exports.purchaseV4(horses, scores, params)
        break
      default:
        purchases = module.exports.purchaseV1(horses, scores)
    }
    return purchases
  },
  /**
   * @description 購入します。
   * @param {Array} horses - 出馬リスト
   * @param {Array} scores - 評価値リスト
   * @returns {Array} 購入リスト
   */
  purchaseV1 (horses, scores) {
    const purchases = horses
      .map((h, i) => {
        h.oddsSs = scores[i].oddsSs
        h.evalSs = scores[i].evalSs
        h.score = scores[i].score
        return h
      })
      .filter(h => {
        return h.score > 10
      })
    return purchases
  },
  /**
   * @description 購入します。
   * @param {Array} horses - 出馬リスト
   * @param {Array} scores - 評価値リスト
   * @param {Object} params - パラメータ
   * @param {Number} params.minScore - 最小スコア
   * @param {Number} params.maxPopularity - 最大人気順
   * @returns {Array} 購入リスト
   */
  purchaseV2 (horses, scores, params) {
    const validator = require('@h/validation-helper')
    validator.required(params)
    validator.required(params.minScore)
    const purchases = horses
      .map((h, i) => {
        h.score = scores[i].score
        return h
      })
      .filter(h => {
        return h.score > params.minScore &&
          (!params.maxPopularity || h.popularity < params.maxPopularity) &&
          (!params.maxOdds || h.odds < params.maxOdds) &&
          (!params.maxScore || h.score < params.maxScore)
      })
    return purchases
  },
  /**
   * @description 購入します。
   * @param {Array} horses - 出馬リスト
   * @param {Array} scores - 評価値リスト
   * @param {Object} params - パラメータ
   * @param {Number} params.minScore - 最小スコア
   * @param {Number} params.maxPopularity - 最大人気順
   * @returns {Array} 購入リスト
   */
  purchaseV3 (horses, scores, params) {
    const validator = require('@h/validation-helper')
    validator.required(params)
    validator.required(params.minScore)
    const purchases = horses
      .map((h, i) => {
        h.score = scores[i].score
        let ticketNum = 1
        switch (h.popularity) {
          case 1:
            ticketNum = 10
            break
          case 2:
            ticketNum = 7
            break
          case 3:
          case 4:
          case 5:
          case 6:
          case 7:
          case 8:
          case 9:
            ticketNum = 2
            break
          default:
            ticketNum = 1
        }
        h.ticketNum = ticketNum
        return h
      })
      .filter(h => {
        return h.score > params.minScore &&
          (!params.maxPopularity || h.popularity < params.maxPopularity) &&
          (!params.maxOdds || h.odds < params.maxOdds) &&
          (!params.maxScore || h.score < params.maxScore)
      })
    return purchases
  },
  /**
   * @description 購入します。
   * @param {Array} horses - 出馬リスト
   * @param {Array} scores - 評価値リスト
   * @param {Object} params - パラメータ
   * @returns {Array} 購入リスト
   */
  purchaseV4 (horses, scores, params) {
    const validator = require('@h/validation-helper')
    validator.required(params)
    validator.required(params.ticketType)
    const type = params.ticketType
    validator.required(params[type])
    validator.required(params[type].minScore)
    let ret = {}
    switch (type) {
      case 'uren':
        ret = module.exports._calcURenTicketNum(horses, scores, params)
        break
      case 'wide':
        ret = module.exports._calcWideTicketNum(horses, scores, params)
        break
      case 'sanfuku':
        ret = module.exports._calcSanfukuTicketNum(horses, scores, params)
        break
      case 'utan':
        ret = module.exports._calcUtanTicketNum(horses, scores, params)
        break
      case 'santan':
        ret = module.exports._calcSantanTicketNum(horses, scores, params)
        break
      default:
        ret = module.exports._calcTanTicketNum(horses, scores, params)
    }
    return ret
  },
  /**
   * @description 単勝の購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Number} minScore 下限スコア
   * @returns {Object} 購入結果
   */
  _calcTanTicketNum (horses, scores, params) {
    const _ = require('lodash')
    const type = params.ticketType
    let _horses = horses
      .map((h, i) => {
        const p = _.cloneDeep(h)
        p.score = scores[i].score
        p.ticketNum = 0
        if (params[type].minScore <= p.score) {
          p.ticketNum = 1
        }
        return p
      })
    // 偏差値
    const calc = require('@h/calc-helper')
    const ss = calc.standardScore(_horses.map(h => h.score))
    _horses = _horses
      .map((h, i) => {
        h.ss = ss[i]
        // おためし
        // h.score = ss[i]
        return h
      })
    _horses = require('@h/logic-helper').sortReverse(_horses, 'score')
    const purchases = _horses
      .filter(p => p.ticketNum > 0)
    // const loss = calc.sum(purchases.map(p => p.ticketNum * 100))
    // const overLoss = purchases.every(p => p.score * p.ticketNum < loss)
    // const highRisk = purchases.length >= 4
    // purchases = overLoss || highRisk ? [] : purchases
    // purchases = highRisk ? [] : purchases
    return {
      horses: _horses,
      purchases
    }
  },
  /**
   * @description ペア馬券の購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Number} minScore 下限スコア
   * @returns {Object} 購入結果
   */
  _calcCombinationTicketNum (horses, scores, params, combNum, requiredOrder) {
    const _ = require('lodash')
    const type = params.ticketType
    const _horses = horses
      .map((h, i) => {
        const p = _.cloneDeep(h)
        p.score = scores[i].score
        return p
      })
      .filter(h => params[type].minScore <= h.score)
    if (_horses.length < combNum) {
      return {
        horses: [[]],
        purchases: [{
          ticketNum: 0
        }]
      }
    }
    const combHorses = require('@h/logic-helper').genCombination(_horses, combNum)
      .toArray()
      .map(h => {
        if (requiredOrder) {
          h = require('@h/logic-helper').sortReverse(h, 'score')
        }
        h.score = require('@h/calc-helper').averageByKey(h, 'score')
        return h
      })
    const purchases = require('@h/logic-helper')
      .sortReverse(combHorses, 'score')
      .filter((p, i) => i <= 8)
      .map(p => {
        p.ticketNum = 1
        return p
      })
    return {
      horses: combHorses,
      purchases
    }
  },
  /**
   * @description 馬連の購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Number} minScore 下限スコア
   * @returns {Object} 購入結果
   */
  _calcURenTicketNum (horses, scores, params) {
    return module.exports._calcCombinationTicketNum(horses, scores, params, 2, false)
  },
  /**
   * @description ワイドの購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Number} minScore 下限スコア
   * @returns {Object} 購入結果
   */
  _calcWideTicketNum (horses, scores, params) {
    return module.exports._calcCombinationTicketNum(horses, scores, params, 2, false)
  },
  /**
   * @description 三連複の購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Number} minScore 下限スコア
   * @returns {Object} 購入結果
   */
  _calcSanfukuTicketNum (horses, scores, params) {
    return module.exports._calcCombinationTicketNum(horses, scores, params, 3, false)
  },
  /**
   * @description 馬単の購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Number} minScore 下限スコア
   * @returns {Object} 購入結果
   */
  _calcUtanTicketNum (horses, scores, params) {
    return module.exports._calcCombinationTicketNum(horses, scores, params, 2, true)
  },
  /**
   * @description 三連単の購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Number} minScore 下限スコア
   * @returns {Object} 購入結果
   */
  _calcSantanTicketNum (horses, scores, params) {
    return module.exports._calcCombinationTicketNum(horses, scores, params, 3, true)
  }
}
