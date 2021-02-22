'use strict'

/**
 * @module 開催予定レース購入のシミュレーション機能を提供します。
 */
module.exports = {
  /**
   * @description 開催予定レース購入のシミュレーションを行います。
   * @param {Object} config - 設定情報
   * @returns {void}
   */
  simulate (config = {}) {
    const fs = require('fs')
    const preds = JSON.parse(fs.readFileSync('resources/learnings/pred-result.json', { encoding: 'utf-8' }))

    // シミュレーション結果を整形
    const adjuster = require('@s/race-adjuster')
    const races = Object.values(adjuster.adjust(preds))

    // 購入対象を決める
    const evaluator = require('@s/score-evaluator')
    const purchaser = require('@s/purchaser')
    const results = []
    for (const horses of races) {
      if (horses.length <= 0) {
        continue
      }
      const scores = evaluator.evaluate(horses)
      const purchases = purchaser.purchase(horses, scores, config, config.getPurchaseParams())
      const ret = {
        raceId: horses[0].raceId,
        raceName: horses[0].raceName,
        purchases
      }
      results.push(ret)
    }

    // ファイルに書き出し
    fs.writeFileSync('resources/simulations/sim-result.json'
      , JSON.stringify(results, null, '  ')
      , { encoding: 'utf-8' }
    )

    return results
  }
}
