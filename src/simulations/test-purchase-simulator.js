'use strict'

const purchaseConfig = require('@p/purchase-config')
const purchaseHelper = require('@h/purchase-helper')

/**
 * @module 購入の検証機能を提供します。
 */
module.exports = {
  async simulate () {
    for (let i = -2; i < 5; i++) {
      const params = purchaseConfig.getPurchaseParams(i)
      console.log(params)
      await module.exports._simulate(purchaseConfig, params)
    }
  },
  /**
   * @description 購入の検証を行います。
   * @param {Object} params - パラメータ
   * @param {Number} params.minScore - 最小スコア
   * @param {Number} params.maxPopularity - 最大人気順
   * @param {Number} params.maxOdds - 最大オッズ
   * @param {Number} params.maxScore - 最大スコア
   * @returns {void}
   */
  async _simulate (params) {
    // 購入対象を取得
    const sims = await require('@s/future-multi-ticket-type-purchase-simulator').simulate(params)

    // 購入した馬券から回収率を算出
    const calculator = require('@s/recovery-rate-calculator')
    const results = calculator.calc(sims)

    // 結果を表示
    console.log(purchaseHelper.createDispSimlationResult(results))
  }
}
