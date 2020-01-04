'use strict'

/**
 * @module 購入の検証機能を提供します。
 */
module.exports = {
  async simulate () {
    for (let i = 119; i < 120; i++) {
      for (let p = 104; p < 105; p++) {
        for (let o = 9000; o < 9001; o++) {
          for (let s = 9000; s < 9001; s++) {
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

    const calculator = require('@s/recovery-rate-calculator')
    let allRates = []
    let allCount = 0
    let winCount = 0
    let winRate = 0
    for (const sim of sims) {
      allCount += sim.purchases.length
      winCount += sim.purchases.filter(p => Number(p.orderOfFinish === 1)).length
      winRate = Math.round((winCount / allCount) * 1000) / 10
      // 購入した馬券から回収率を算出
      const rates = calculator.calc(sim.purchases)
      allRates = allRates.concat(rates)
    }

    // 結果を表示
    const _ = require('lodash')
    const sum = _.reduce(allRates, (sum, rate) => sum + rate)
    const avg = (sum / allRates.length) * 100
    console.log(`minS: ${params.minScore} maxP: ${params.maxPopularity} maxO: ${params.maxOdds} maxS: ${params.maxScore} avg: ${avg} allC: ${allCount} winC: ${winCount} winR: ${winRate}%`)
  }
}
