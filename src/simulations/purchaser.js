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
   * @param {Number} params.minScore - 最小スコア
   * @param {Number} params.maxPopularity - 最大人気順
   * @returns {Array} 購入リスト
   */
  purchaseV4 (horses, scores, params) {
    const validator = require('@h/validation-helper')
    validator.required(params)
    validator.required(params.minScore)
    validator.required(params.minPlaceScore)
    const purchases = horses
      .map((h, i) => {
        h.score = scores[i].score
        let ticketNum = 0
        let placeTicketNum = 0
        if (h.score > params.minScore) {
          ticketNum = module.exports._purchaseWinTicket(h)
        }
        if (h.popularity < 12) {
          placeTicketNum = module.exports._purchasePalceTicket(h, params.minPlaceScore)
        }
        h.ticketNum = ticketNum
        h.placeTicketNum = placeTicketNum
        return h
      })
      .filter(h => {
        return h.score > params.minPlaceScore
      })
    return purchases
  },
  /**
   * @description 単勝チケットを購入します。
   * @param {Object} horse 購入馬
   */
  _purchaseWinTicket (horse) {
    let ticketNum = 1
    switch (horse.popularity) {
      case 1:
        ticketNum = 3
        break
      case 2:
        ticketNum = 2
        break
      default:
        ticketNum = 1
    }
    return ticketNum
  },
  /**
   * @description 複勝チケットを購入します。
   * @param {Object} horse 購入馬
   */
  _purchasePalceTicket (horse, minPlaceScore) {
    // let ticketNum = 1
    // if (horse.score >= minPlaceScore + 50) {
    //   ticketNum = 3
    // } else if (horse.score >= minPlaceScore + 30) {
    //   ticketNum = 2
    // }
    // return ticketNum
    return 1
  }
}
