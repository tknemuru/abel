'use strict'

/**
 * @module 開催予定レース複数チケット種別購入のシミュレーション機能を提供します。
 */
module.exports = {
  /**
   * @description ファイルディレクトリ
   */
  FileDir: 'resources/learnings',
  /**
   * @description 開催予定レース購入のシミュレーションを行います。
   * @param {Object} params - パラメータ
   * @param {Number} params.minScore - 最小スコア
   * @returns {void}
   */
  simulate (params = {}) {
    const fs = require('fs')
    const path = require('path')
    const ticketTypes = require('@h/purchase-helper').getPurchasingTicketType()

    const results = {}
    for (const type of ticketTypes) {
      params.ticketType = type
      const preds = JSON.parse(fs.readFileSync(
        path.join(module.exports.FileDir, `pred-result-${type}.json`),
        { encoding: 'utf-8' }))

      // シミュレーション結果を整形
      const adjuster = require('@s/race-adjuster')
      const races = Object.values(adjuster.adjust(preds))

      // 購入対象を決める
      const evaluator = require('@s/score-evaluator')
      const purchaser = require('@s/purchaser')
      for (const horses of races) {
        if (horses.length <= 0) {
          continue
        }
        const { raceId } = horses[0]
        const { raceName } = horses[0]
        if (!results[raceId]) {
          results[raceId] = {
            raceId,
            raceName,
            purchases: {}
          }
        }
        const scores = evaluator.evaluate(horses)
        const purchases = purchaser.purchase(horses, scores, params)
        results[raceId].purchases[type] = purchases
      }
    }

    // ファイルに書き出し
    module.exports._writeFile(results)

    return results
  },
  /**
   * @description ファイルに結果を書き込みます。
   * @param {Object} results シミュレーション結果
   */
  _writeFile (results) {
    const _ = require('lodash')
    const ret = _.cloneDeep(results)
    const retkeys = Object.keys(ret)
    for (const raceId of retkeys) {
      const purchasesKeys = Object.keys(ret[raceId].purchases)
      for (const type of purchasesKeys) {
        for (const ticket of ret[raceId].purchases[type]) {
          delete ticket.raceId
          delete ticket.raceName
          delete ticket.pays
        }
      }
    }
    const fs = require('fs')
    fs.writeFileSync('resources/simulations/sim-result.json'
      , JSON.stringify(ret, null, '  ')
      , { encoding: 'utf-8' }
    )
  }
}
