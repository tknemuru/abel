'use strict'

/**
 * @module 購入機能を提供します。
 */
module.exports = {
  /**
   * バージョン
   */
  version: 2,
  /**
   * @description 購入します。
   * @param {Array} horses - 出馬リスト
   * @param {Array} scores - 評価値リスト
   * @returns {Array} 購入リスト
   */
  purchase (horses, scores) {
    let purchases = []
    switch (module.exports.version) {
      case 2:
        purchases = module.exports.purchaseV2(horses, scores)
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
   * @returns {Array} 購入リスト
   */
  purchaseV2 (horses, scores) {
    const purchases = horses
      .map((h, i) => {
        h.score = scores[i].score
        return h
      })
      .filter(h => {
        return h.score > 32
      })
    return purchases
  }
}
