'use strict'

/**
 * @module 購入のシミュレーション機能を提供します。
 */
module.exports = {
  /**
   * @description 購入のシミュレーションを行います。
   * @param {Object} params - パラメータ
   * @param {Array} races - レース情報
   * @param {Boolean} requiredReturnResult - 結果を返すかどうか
   * @returns {Array} シミュレーション結果
   */
  async simulate (params = {}) {
    // シミュレーション対象のレース情報を取得
    const selector = require('@s/race-selector')
    let orgRaces = []
    if (params.races) {
      orgRaces = params.races
    } else {
      orgRaces = await selector.select()
    }

    // レース情報を整形
    const adjuster = require('@s/race-adjuster')
    const races = Object.values(adjuster.adjust(orgRaces))

    // 購入判断の域値を算出
    const fs = require('fs')
    const cols = JSON.parse(fs.readFileSync('resources/defs/identity-eval-param-colums.json', { encoding: 'utf-8' }))
    const minEval = cols.length * 60

    let allRates = []
    const result = []
    for (const race of races) {
      // 評価値を算出
      const evaluator = require('@s/score-evaluator')
      const evals = evaluator.evaluate(race)

      // 評価値を元に馬券を購入
      const purchaser = require('@s/purchaser')
      const horses = purchaser.purchase({
        evals,
        minEval
      })

      // 購入した馬券から回収率を算出
      const calculator = require('@s/recovery-rate-calculator')
      const rates = calculator.calc(race, horses)
      console.log(rates)
      allRates = allRates.concat(rates)

      // 結果を記録
      if (params.requiredReturnResult) {
        const ret = {
          horses: race
            .map((r, i) => {
              return Object.assign(
                {},
                r,
                {
                  eval: evals[i].eval
                }
              )
            })
            .sort((a, b) => {
              if (a.eval < b.eval) return 1
              if (a.eval > b.eval) return -1
              return 0
            }),
          purchase: horses
        }
        result.push(ret)
      }
    }

    // 結果を表示
    const _ = require('lodash')
    const sum = _.reduce(allRates, (sum, rate) => sum + rate)
    const avg = (sum / allRates.length) * 100
    console.log(avg)

    return result
  }
}
