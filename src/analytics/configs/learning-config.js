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
  select: 'select_range_race_result_history',
  /**
   * @description 出力対象のカラム定義を取得します。
   * @returns {String} 出力対象のカラム定義名
   */
  colums () {
    let def = ''
    switch (module.exports.version) {
      case 2:
        def = 'learning-input-colums-v3'
        break
      default:
        def = 'learning-input-colums-v1'
    }
    return def
  },
  /**
   * @description 学習情報の検証を行います。
   * @param {Object} data - 学習情報
   * @param {Array} validationCols - 検証対象のカラムリスト
   */
  validation (data, validationCols) {
    let err = false
    switch (module.exports.version) {
      case 2:
        err = validationCols.some(key => {
          // 4レース揃っていないデータは一旦除外する
          // if (!data[key]) {
          //   return false
          // }
          return Number.isNaN(Number(data[key])) ||
            Number(data[key]) <= 0 ||
            data.inf_pre0_race_name.includes('新馬') ||
            data.inf_pre0_race_name.includes('障害')
        })
        break
      default:
        err = validationCols.some(key => {
          // 4レース揃っていないデータは一旦除外する
          // return data[key] && Number(data[key]) <= 0
          return Number.isNaN(Number(data[key])) || Number(data[key]) <= 0
        }) ||
          // 4位未満は除外
          Number(data.ret_pre0_order_of_finish) > 4
    }
    return !err
  },
  /**
   * @description 正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswer (data) {
    const creator = require('@an/learning-answer-creator')
    let answer = -1
    switch (module.exports.version) {
      case 2:
        answer = creator.createAnswerByRecoveryRate(data)
        break
      default:
        answer = creator.createAnswerByTopOrder(data)
    }
    return answer
  }
}
