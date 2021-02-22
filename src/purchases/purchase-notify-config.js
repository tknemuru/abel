'use strict'

const adjuster = require('@s/race-adjuster')
const base = require('@p/purchase-config')
const config = require('@/config-manager').get()
const fileHelper = require('@h/file-helper')
const purchaseHelper = require('@h/purchase-helper')

/**
 * @module 馬券購入の設定情報を提供します。
 */
module.exports = {
  /**
   * @description 購入対象のチケット種別を取得します。
   * @returns {Array} 購入対象のチケット種別リスト
   */
  getPurchasingTicketType () {
    return base.getPurchasingTicketType()
  },
  /**
   * @description 購入用のパラメータを取得します。
   * @param {Number} add 加算値
   */
  getPurchaseParams (add = 0) {
    return base.getPurchaseParams(add)
  },
  /**
   * @description 購入パラメータを生成します。
   * @param {Object} params パラメータ
   * @param {Array} scores 評価値リスト
   */
  createPurchaseParam (params, scores) {
    return base.createPurchaseParam(params, scores)
  },
  /**
   * @description 合議制評価値を読み込みます。
   * @returns {Array} 合議制評価値
   */
  readPredCollegials () {
    return fileHelper.readJson(config.predCollegialPurchaseFilePath)
  },
  /**
   * @description 全ての予測評価値結果を読み込みます。
   * @returns {Array} 全ての予測評価値結果
   */
  readAllPredResults () {
    // 分析対象の情報を読み込む
    const predPathSet = purchaseHelper.generatePurchasePredPathSet()
    const abilityMoneys = fileHelper.readJson(predPathSet.abiMoPath)
    const abilityRecoverys = fileHelper.readJson(predPathSet.abiRePath)
    const rageOdds = adjuster.adjust(fileHelper.readJson(predPathSet.rageOddsPath))
    const rageOrders = adjuster.adjust(fileHelper.readJson(predPathSet.rageOrderPath))
    const collegials = module.exports.readPredCollegials()
    // マージする
    const results = collegials.map((c, i) => {
      c.abilityMoneyEval = abilityMoneys[i].eval
      c.abilityRecoveryEval = abilityRecoverys[i].eval
      c.rageOddsEval = rageOdds[c.raceId][0].eval
      c.rageOrderEval = rageOrders[c.raceId][0].eval
      c.recoveryRate = c.orderOfFinish <= 3 ? c.odds : 0
      c.collegialEval = c.eval
      return c
    })
    return results
  }
}
