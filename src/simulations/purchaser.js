'use strict'

/**
 * @module 購入機能を提供します。
 */
module.exports = {
  /**
   * @description 購入します。
   * @param {Array} horses - 出馬リスト
   * @param {Array} scores - 評価値リスト
   * @param {Object} config - 設定情報
   * @param {Object} params - パラメータ
   * @param {Number} params.minScore - 最小スコア
   * @param {Number} params.maxPopularity - 最大人気順
   * @returns {Array} 購入リスト
   */
  purchase (horses, scores, config, params) {
    const validator = require('@h/validation-helper')
    validator.required(params)
    validator.required(params.ticketType)
    const type = params.ticketType
    validator.required(params[type])
    let ret = {}
    switch (type) {
      case 'fuku':
        ret = module.exports._calcFukuTicketNum(horses, scores, config, params)
        break
      case 'uren':
        ret = module.exports._calcURenTicketNum(horses, scores, config, params)
        break
      case 'wide':
        ret = module.exports._calcWideTicketNum(horses, scores, config, params)
        break
      case 'sanfuku':
        ret = module.exports._calcSanfukuTicketNum(horses, scores, config, params)
        break
      case 'utan':
        ret = module.exports._calcUtanTicketNum(horses, scores, config, params)
        break
      case 'santan':
        ret = module.exports._calcSantanTicketNum(horses, scores, config, params)
        break
      default:
        ret = module.exports._calcTanTicketNum(horses, scores, config, params)
    }
    return ret
  },
  /**
   * @description 単勝の購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Object} params パラメータ
   * @param {Object} filterParams フィルタ用パラメータ
   * @returns {Object} 購入結果
   */
  _calcTanTicketNum (horses, scores, config, params, filterParams = {}) {
    return module.exports._calcSingleTicketNum(
      horses,
      scores,
      params,
      config.createPurchaseParam(params, scores)
    )
  },
  /**
   * @description 複勝の購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Object} params パラメータ
   * @param {Object} filterParams フィルタ用パラメータ
   * @returns {Object} 購入結果
   */
  _calcFukuTicketNum (horses, scores, config, params, filterParams = {}) {
    return module.exports._calcSingleTicketNum(
      horses,
      scores,
      params,
      config.createPurchaseParam(params, scores)
    )
  },
  /**
   * @description 単一馬方式のチケット購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Object} params パラメータ
   * @param {Object} filterParams フィルタ用パラメータ
   * @returns {Object} 購入結果
   */
  _calcSingleTicketNum (horses, scores, params, filterParams = {}) {
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
        return h
      })
    _horses = require('@h/logic-helper')
      .sortReverse(_horses, 'score')
      .map((h, i) => {
        h.scoreOrder = i + 1
        return h
      })
    const purchases = _horses
      .filter(p => {
        return p.ticketNum > 0 &&
          (!filterParams.minOdds || filterParams.minOdds <= p.odds) &&
          (!filterParams.maxOdds || p.odds <= filterParams.maxOdds) &&
          (!filterParams.scoreOrder || filterParams.scoreOrder.includes(p.scoreOrder)) &&
          (!filterParams.minSs || filterParams.minSs <= p.ss) &&
          !p.raceName.includes('3歳') &&
          !p.raceName.includes('2歳')
      })
    return {
      horses: _horses,
      purchases
    }
  },
  /**
   * @description ペア馬券の購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Number} minScore 下限スコア
   * @param {Object} filterParams フィルタ用パラメータ
   * @returns {Object} 購入結果
   */
  _calcCombinationTicketNum (horses, scores, params, combNum, requiredOrder, filterParams = {}) {
    const _ = require('lodash')
    const type = params.ticketType
    let _horses = horses
      .map((h, i) => {
        const p = _.cloneDeep(h)
        p.score = scores[i].score
        return p
      })
    // 偏差値
    const calc = require('@h/calc-helper')
    const ss = calc.standardScore(_horses.map(h => h.score))
    _horses = _horses
      .map((h, i) => {
        h.ss = ss[i]
        return h
      })
    _horses = require('@h/logic-helper')
      .sortReverse(_horses, 'score')
      .map((h, i) => {
        h.scoreOrder = i + 1
        return h
      })
      .filter(h => {
        return params[type].minScore <= h.score &&
          (!filterParams.minOdds || filterParams.minOdds <= h.odds) &&
          (!filterParams.maxOdds || h.odds <= filterParams.maxOdds) &&
          (!filterParams.scoreOrder || filterParams.scoreOrder.includes(h.scoreOrder)) &&
          (!filterParams.minSs || filterParams.minSs <= h.ss)
          // !h.raceName.includes('3歳') &&
          // !h.raceName.includes('2歳')
      })
    if (_horses.length < combNum) {
      return {
        horses: [{ horses: [] }],
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
        const _h = {}
        _h.horses = h
        _h.score = require('@h/calc-helper').averageByKey(h, 'score')
        _h.odds = require('@h/calc-helper').averageByKey(h, 'odds')
        _h.ticketNum = 1
        return _h
      })
    const purchases = require('@h/logic-helper')
      .sortReverse(combHorses, 'score')
      .map((h, i) => {
        h.scoreOrder = i
        return h
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
  _calcURenTicketNum (horses, scores, config, params) {
    return module.exports._calcCombinationTicketNum(
      horses,
      scores,
      params,
      2,
      false,
      config.createPurchaseParam(params, scores)
    )
  },
  /**
   * @description ワイドの購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Number} minScore 下限スコア
   * @returns {Object} 購入結果
   */
  _calcWideTicketNum (horses, scores, config, params) {
    return module.exports._calcCombinationTicketNum(
      horses,
      scores,
      params,
      2,
      false,
      config.createPurchaseParam(params, scores)
    )
  },
  /**
   * @description 三連複の購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Number} minScore 下限スコア
   * @returns {Object} 購入結果
   */
  _calcSanfukuTicketNum (horses, scores, config, params) {
    return module.exports._calcCombinationTicketNum(
      horses,
      scores,
      params,
      3,
      false,
      config.createPurchaseParam(params, scores)
    )
  },
  /**
   * @description 馬単の購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Number} minScore 下限スコア
   * @returns {Object} 購入結果
   */
  _calcUtanTicketNum (horses, scores, config, params) {
    return module.exports._calcCombinationTicketNum(
      horses,
      scores,
      params,
      2,
      true,
      config.createPurchaseParam(params, scores)
    )
  },
  /**
   * @description 三連単の購入枚数を算出します。
   * @param {Number} score スコア
   * @param {Number} minScore 下限スコア
   * @returns {Object} 購入結果
   */
  _calcSantanTicketNum (horses, scores, config, params) {
    return module.exports._calcCombinationTicketNum(
      horses,
      scores,
      params,
      3,
      true,
      config.createPurchaseParam(params, scores)
    )
  }
}
