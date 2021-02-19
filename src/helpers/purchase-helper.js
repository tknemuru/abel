'use strict'

const adjuster = require('@s/race-adjuster')
const configManager = require('@/config-manager')
const fileHelper = require('@h/file-helper')

/**
 * @module 馬券購入の補助機能を提供します。
 */
module.exports = {
  /**
   * @description 購入対象のチケット種別を取得します。
   * @returns {Array} 購入対象のチケット種別リスト
   */
  getPurchasingTicketType () {
    return [
      // 'tan'
      // 'tan',
      // 'fuku',
      // 'waku',
      'uren',
      'wide',
      'sanfuku',
      'utan',
      'santan'
    ]
  },
  /**
   * @description 購入用のパラメータを取得します。
   * @param {Number} add 加算値
   */
  getPurchaseParams (add = 0) {
    // const tan = 90
    const fuku = 6
    const params = {
      tan: {
        minScore: fuku + add
      },
      fuku: {
        minScore: fuku + add
      },
      waku: {
        minScore: fuku + add
      },
      uren: {
        minScore: fuku + add
      },
      wide: {
        minScore: fuku + add
      },
      sanfuku: {
        minScore: fuku + add
      },
      utan: {
        minScore: fuku + add
      },
      santan: {
        minScore: fuku + add
      },
      minRageVal: 10,
      upperRageVal: 99 + add
    }
    return params
  },
  /**
   * @description 全ての予測評価値結果を読み込みます。
   * @returns {Array} 全ての予測評価値結果
   */
  readAllPredResults () {
    // 分析対象の情報を読み込む
    const config = configManager.get()
    const abilityMoneys = fileHelper.readJson(config.predAbilityMoneyFilePath)
    const abilityRecoverys = fileHelper.readJson(config.predAbilityRecoveryFilePath)
    const rageOdds = adjuster.adjust(fileHelper.readJson(config.predRageOddsFilePath))
    const rageOrders = adjuster.adjust(fileHelper.readJson(config.predRageOrderFilePath))
    // マージする
    const results = abilityMoneys.map((a, i) => {
      a.abilityMoneyEval = a.eval
      a.abilityRecoveryEval = abilityRecoverys[i].eval
      a.rageOddsEval = rageOdds[a.raceId][0].eval
      a.rageOrderEval = rageOrders[a.raceId][0].eval
      a.recoveryRate = a.orderOfFinish <= 3 ? a.odds : 0
      return a
    })
    return results
  }
}
