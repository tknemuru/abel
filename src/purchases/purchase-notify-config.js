'use strict'

const adjuster = require('@s/race-adjuster')
const ansDefManager = require('@an/answer-def-manager')
const base = require('@p/purchase-config')
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
    const collegials = module.exports.readPredCollegials()
    const allDefs = ansDefManager.getAllAnswerDefs()
    const preds = {}
    for (const def of allDefs) {
      let pred = fileHelper.readJson(def.predPath)
      if (def.type === 'rage') {
        pred = adjuster.adjust(pred)
      }
      preds[def.key] = pred
    }
    // マージする
    const results = collegials.map((a, i) => {
      for (const def of allDefs) {
        if (def.type === 'ability') {
          a[def.evalName] = preds[def.key][i].eval
        } else {
          a[def.evalName] = preds[def.key][a.raceId][0].eval
        }
      }
      a.recoveryRate = a.orderOfFinish <= 3 ? a.odds : 0
      a.collegialEval = a.eval
      return a
    })
    return results
  }
}
