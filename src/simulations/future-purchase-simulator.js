'use strict'

/**
 * @module 開催予定レース購入のシミュレーション機能を提供します。
 */
module.exports = {
  /**
   * @description 開催予定レース購入のシミュレーションを行います。
   * @returns {void}
   */
  simulate () {
    const fs = require('fs')
    const preds = JSON.parse(fs.readFileSync('resources/learnings/pred-result.json', { encoding: 'utf-8' }))

    // シミュレーション結果を整形
    const adjuster = require('@s/race-adjuster')
    const races = Object.values(adjuster.adjust(preds))

    // 購入対象を決める
    const results = []
    for (const horses of races) {
      if (horses.length <= 0) {
        continue
      }
      const purchases = horses.filter(h => h.eval > 30)
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
  }
}
