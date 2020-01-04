'use strict'

/**
 * @module 検証用設定情報を提供します。
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
   * @description 出力対象のカラム定義を取得します。
   * @returns {String} 出力対象のカラム定義名
   */
  colums () {
    return require('@an/configs/learning-config').colums()
  },
  /**
   * @description ソルト
   */
  salt: null,
  /**
   * @description 学習情報の検証を行います。
   * @param {Object} data - 学習情報
   * @param {Array} validationCols - 検証対象のカラムリスト
   */
  validation (data, validationCols) {
    if (!module.exports.salt) {
      // module.exports.salt = Math.floor(Math.random() * 50) + 50
      module.exports.salt = 3
      console.log(module.exports.salt)
    }
    const err = validationCols.some(key => {
      // if (!data[key]) {
      //   return false
      // }
      return Number.isNaN(Number(data[key])) ||
        Number(data[key]) <= 0 ||
        data.inf_pre0_race_name.includes('2歳') ||
        data.inf_pre0_race_name.includes('3歳') ||
        data.inf_pre0_race_name.includes('4歳')
    })
    return !err && data.inf_pre0_race_id % module.exports.salt === 0
  },
  /**
   * @description 正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  createAnswer (data) {
    return require('@an/configs/learning-config').createAnswer(data)
  }
}
