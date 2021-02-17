'use strict'

/**
 * @module 購入の検証機能を提供します。
 */
module.exports = {
  async simulate () {
    for (let i = 0; i < 10; i++) {
      const params = require('@h/purchase-helper').getPurchaseParams(i)
      console.log('minScore:')
      console.log(params)
      await module.exports._simulate(params)
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
    console.log('-----------------')
    for (const type in results) {
      const typeName = module.exports._getTypeJpName(type)
      module.exports._dispResult(results[type], typeName)
    }
    console.log('-----------------')
  },
  /**
   * @description 馬券の種類の日本語名を取得します。
   * @param {String} type 馬券の種類
   */
  _getTypeJpName (type) {
    let name = ''
    switch (type) {
      case 'tan':
        name = '単勝'
        break
      case 'fuku':
        name = '複勝'
        break
      case 'waku':
        name = '枠連'
        break
      case 'uren':
        name = '馬連'
        break
      case 'wide':
        name = 'ワイド'
        break
      case 'sanfuku':
        name = '三連複'
        break
      case 'utan':
        name = '馬単'
        break
      case 'santan':
        name = '三連単'
        break
      case 'sum':
        name = '合計'
        break
      default:
        throw new Error(`unexpected ticket type: ${type}`)
    }
    return name
  },
  /**
   * @description シミュレーション結果を出力します。
   * @param {Object} ret シミュレーション結果
   * @param {String} typeName 馬券種類名
   */
  _dispResult (ret, typeName) {
    const profitDiff = ret.profit + ret.loss
    const profitRate = Math.round((ret.profit / (ret.loss * -1)) * 10000) / 100
    const winRate = Math.round((ret.winTicketNum / ret.allTicketNum) * 10000) / 100
    console.log(`[${typeName}] 収益: ${profitDiff} 収益率: ${profitRate}% 勝率: ${winRate}% 払い戻し金: ${ret.profit} 購入金: ${ret.loss} 購入枚数: ${ret.allTicketNum} 当たり枚数: ${ret.winTicketNum}`)
  }
}
