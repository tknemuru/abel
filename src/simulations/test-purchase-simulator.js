'use strict'

/**
 * @module 購入の検証機能を提供します。
 */
module.exports = {
  /**
   * @description 購入の検証を行います。
   * @returns {void}
   */
  async simulate () {
    // 購入対象を取得
    const sims = require('@s/future-purchase-simulator').simulate()

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
    console.log(avg)
  }
}
