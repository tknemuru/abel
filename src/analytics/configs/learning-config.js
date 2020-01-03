'use strict'

/**
 * @module 学習用設定情報を提供します。
 */
module.exports = {
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
   * @description 学習情報の検証を行います。
   * @param {Object} data - 学習情報
   * @param {Array} validationCols - 検証対象のカラムリスト
   */
  validation (data, validationCols) {
    const err = validationCols.some(key => {
      // 4レース揃っていないデータは一旦除外する
      // return data[key] && Number(data[key]) <= 0
      return Number.isNaN(Number(data[key])) || Number(data[key]) <= 0
    }) ||
      // 4位未満は除外
      Number(data.ret_pre0_order_of_finish) > 4
    return !err
  },
  /**
   * @description 正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswer (data) {
    const creator = require('@an/learning-answer-creator')
    return creator.createAnswerByTopOrder(data)
  }
}
