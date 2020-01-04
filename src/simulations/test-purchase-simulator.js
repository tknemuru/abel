'use strict'

/**
 * @module 購入の検証機能を提供します。
 */
module.exports = {
  async simulate () {
    for (let i = 216; i < 217; i++) {
      for (let p = 14; p < 15; p++) {
        for (let o = 600; o < 601; o++) {
          for (let s = 600; s < 601; s++) {
            module.exports._simulate({
              minScore: i,
              maxPopularity: p,
              maxOdds: o,
              maxScore: s
            })
          }
        }
      }
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
    const sims = require('@s/future-purchase-simulator').simulate(params)

    let allRates = []
    for (const sim of sims) {
      // 購入した馬券から回収率を算出
      const rates = sim.purchases.map(s => s.orderOfFinish === 1 ? s.odds : 0)
      allRates = allRates.concat(rates)
    }

    // 結果を表示
    const _ = require('lodash')
    const sum = _.reduce(allRates, (sum, rate) => sum + rate)
    const avg = (sum / allRates.length) * 100
    console.log(`minS: ${params.minScore} maxP: ${params.maxPopularity} maxO: ${params.maxOdds} maxS: ${params.maxScore} avg: ${avg}`)
  }
}
