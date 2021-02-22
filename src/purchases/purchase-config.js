'use strict'

const adjuster = require('@s/race-adjuster')
const config = require('@/config-manager').get()
const fileHelper = require('@h/file-helper')

/**
 * @module 馬券購入の設定情報を提供します。
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
    const base = 6
    const params = {
      tan: {
        minScore: base + add
      },
      fuku: {
        minScore: base + add
      },
      waku: {
        minScore: base + add
      },
      uren: {
        minScore: base + add
      },
      wide: {
        minScore: base + add
      },
      sanfuku: {
        minScore: base + add
      },
      utan: {
        minScore: base + add
      },
      santan: {
        minScore: base + add
      }
    }
    return params
  },
  /**
   * @description 購入パラメータを生成します。
   * @param {Object} params パラメータ
   * @param {Array} scores 評価値リスト
   */
  createPurchaseParam (params, scores) {
    const minOdds = 0
    const maxOdds = 999
    const minSs = null
    const minRageVal = 90
    let scoreOrder = [1, 2, 3]
    const rageVal = scores[0].rageOddsEval + scores[0].rageOrderEval
    if (rageVal < minRageVal) {
      scoreOrder = []
    }
    return {
      minOdds,
      maxOdds,
      minSs,
      scoreOrder
    }
  },
  /**
   * @description 合議制評価値を読み込みます。
   * @returns {Array} 合議制評価値
   */
  readPredCollegials () {
    return fileHelper.readJson(config.predCollegialFilePath)
  },
  /**
   * @description 全ての予測評価値結果を読み込みます。
   * @returns {Array} 全ての予測評価値結果
   */
  readAllPredResults () {
    // 分析対象の情報を読み込む
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
