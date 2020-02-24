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
   * @description データベースの情報から作成するかどうか
   */
  fromDb: true,
  /**
   * @description データセレクト文ファイル名
   */
  select: () => {
    if (module.exports.towardPost) {
      return 'select_in_result_post_history'
    } else {
      return 'select_in_result_race_history'
    }
  },
  /**
   * @description 未来に向かう入力情報を作成するかどうか
   */
  towardPost: false,
  /**
   * @description 出力対象のカラム定義を取得します。
   * @returns {String} 出力対象のカラム定義名
   */
  columns () {
    return require('@an/configs/learning-config').columns()
  },
  /**
   * @description ソルト
   */
  salt: 0,
  /**
   * @description 取得SQLがIN句でのレースID指定クエリかどうか
   */
  isInQuery: true,
  /**
   * @description 学習情報の検証を行います。
   * @param {Object} data - 学習情報
   * @param {Array} validationCols - 検証対象のカラムリスト
   */
  validation (data, validationCols) {
    let err = false
    // err = validationCols.some(key => {
    //   // 4レース揃っていないデータは一旦除外する
    //   // if (!data[key]) {
    //   //   return false
    //   // }
    //   return Number.isNaN(Number(data[key])) ||
    //     Number(data[key]) <= 0
    // }) ||
    err = data.ret0_race_name.includes('新馬') ||
      data.ret0_race_name.includes('障害') ||
      data.ret0_distance !== 1800 ||
      data.ret0_surface_digit !== 1
    return !err
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
