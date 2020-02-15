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
    const _ = require('lodash')
    const validator = require('@h/validation-helper')
    validator.required(params)
    validator.required(params.ticketType)
    const type = params.ticketType
    validator.required(params[type])
    validator.required(params[type].minScore)
    let _horses = horses
      .map((h, i) => {
        const p = _.cloneDeep(h)
        p.score = scores[i].score
        p.ticketNum = module.exports._calcTanTicketNum(p.score, params[type].minScore)
        // p.ticketNum = 1
        return p
      })
    _horses = require('@h/logic-helper').sortReverse(_horses, 'score')
    let purchases = _horses
      .filter(p => params[type].minScore <= p.score)
    const calc = require('@h/calc-helper')
    const loss = calc.sum(purchases.map(p => p.ticketNum * 100))
    const overLoss = purchases.every(p => p.score * p.ticketNum < loss)
    const highRisk = purchases.length >= 4
    purchases = overLoss || highRisk ? [] : purchases
    purchases = highRisk ? [] : purchases
    return {
      horses: _horses,
      purchases
    }
  },
  /**
   * @description 単勝の購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Number} minScore 下限スコア
   */
  _calcTanTicketNum (score, minScore) {
    // const num = 1
    let num = 1
    if (score >= 200) {
      num = 20
    }
    return num
  }
}
