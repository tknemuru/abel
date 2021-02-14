'use strict'

/**
 * @module 学習用設定情報を提供します。
 */
module.exports = {
  /**
   * @description 学習バージョン
   */
  version: 2,
  /**
   * @description インプット情報を作成するかどうか
   */
  input: true,
  /**
   * @description 正解情報を作成するかどうか
   */
  answer: true,
  /**
   * @description 紐付き情報を作成するかどうか
   */
  relation: true,
  /**
   * @description 前準備のセレクト文ファイル名
   */
  preSelect: 'select_all_race_id',
  /**
   * @description データセレクト文ファイル名
   */
  select: () => {
    if (module.exports.towardPost) {
      return 'select_range_result_post_history'
    } else {
      return 'select_range_result_race_history'
    }
  },
  /**
   * @description 未来に向かう入力情報を作成するかどうか
   */
  towardPost: false,
  /**
   * @description データベースの情報から作成するかどうか
   */
  fromDb: true,
  /**
   * @description 出力対象のカラム定義を取得します。
   * @returns {String} 出力対象のカラム定義名
   */
  columns () {
    return 'learning-input-columns'
  },
  /**
   * @description 学習情報の検証を行います。
   * @param {Object} data - 学習情報
   * @param {Array} validationCols - 検証対象のカラムリスト
   */
  validation (data, validationCols) {
    let err = false
    // err = validationCols.some(key => {
    //   return Number.isNaN(Number(data[key])) ||
    //     Number(data[key]) <= 0
    // }) ||
    // data.ret0_race_name.includes('新馬') ||
    //   data.ret0_race_name.includes('障害')
    err = data.ret0_race_name.includes('新馬') ||
      data.ret0_race_name.includes('障害')
    return !err
  },
  /**
   * @description 正解データを作成します。
   * @param {Object} data 学習用データ
   * @param {Object} params パラメータ
   * @returns {Number} 正解データ
   */
  createAnswer (data, params) {
    const creator = require('@an/learning-answer-creator')
    const ansSet = {}
    for (const type of require('@h/purchase-helper').getPurchasingTicketType()) {
      let ans = 0
      // switch (type) {
      //   case 'tan':
      //     ans = creator.createAnswerByTanPay(data)
      //     break
      //   case 'fuku':
      //     ans = creator.createAnswerByFukuPay(data)
      //     break
      //   case 'waku':
      //     ans = creator.createAnswerByWakuPay(data)
      //     break
      //   case 'uren':
      //     ans = creator.createAnswerByUrenPay(data)
      //     break
      //   case 'wide':
      //     ans = creator.createAnswerByWidePay(data)
      //     break
      //   case 'sanfuku':
      //     ans = creator.createAnswerBySanfukuPay(data)
      //     break
      //   case 'utan':
      //     ans = creator.createAnswerByUtanPay(data)
      //     break
      //   case 'santan':
      //     ans = creator.createAnswerBySantanPay(data)
      //     break
      // }
      ans = creator.createAnswerByOrderAndEarningMoney(data, params.money)
      // ans = creator.createAnswerByOrder(data)
      // ans = creator.createAnswerByRecoveryRate(data)
      // ans = creator.createAnswerByRecoveryRateReduce(data)
      ansSet[type] = ans
    }
    return ansSet
  }
}
