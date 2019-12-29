'use strict'

/**
 * @module 購入のシミュレーション機能を提供します。
 */
module.exports = {
  /**
   * @description 購入のシミュレーションを行います。
   * @returns {void}
   */
  async simulate () {
    // シミュレーション対象のレース情報を取得
    const selector = require('@s/race-selector')
    const orgRaces = await selector.select()
    // console.log(orgRaces)

    // レース情報を整形
    const adjuster = require('@s/race-adjuster')
    const races = Object.values(adjuster.adjust(orgRaces))

    // 購入判断の域値を算出
    const fs = require('fs')
    const cols = JSON.parse(fs.readFileSync('resources/defs/identity-eval-param-colums.json', { encoding: 'utf-8' }))
    const minEval = cols.length * 60

    let allRates = []
    for (const race of races) {
      // 評価値を算出
      const evaluator = require('@s/score-evaluator')
      const evals = evaluator.evaluate(race)
      // console.log(evals)

      // 評価値を元に馬券を購入
      const purchaser = require('@s/purchaser')
      const horses = purchaser.purchase({
        evals,
        minEval
      })

      // 購入した馬券から回収率を算出
      const calculator = require('@s/recovery-rate-calculator')
      const rates = calculator.calc(race, horses)
      // console.log(rates)
      allRates = allRates.concat(rates)
    }

    // 結果を表示
    const _ = require('lodash')
    const sum = _.reduce(allRates, (sum, rate) => sum + rate)
    const avg = (sum / allRates.length) * 100
    console.log(avg)
  }
}
