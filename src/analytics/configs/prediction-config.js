'use strict'

/**
 * @module 予測用設定情報を提供します。
 */
module.exports = {
  /**
   * @description インプット情報を作成するかどうか
   */
  input: true,
  /**
   * @description 正解情報を作成するかどうか
   */
  answer: false,
  /**
   * @description 紐付き情報を作成するかどうか
   */
  relation: true,
  /**
   * @description 前準備のセレクト文ファイル名
   */
  preSelect: 'select_all_future_race_id',
  /**
   * @description データベースの情報から作成するかどうか
   */
  fromDb: true,
  /**
   * @description データセレクト文ファイル名
   */
  select: () => 'select_range_future_race_history',
  /**
   * @description 出力対象のカラム定義を取得します。
   * @returns {String} 出力対象のカラム定義名
   */
  columns () {
    return require('@an/configs/learning-config').columns()
  },
  /**
   * @description 学習情報の検証を行います。
   * @param {Object} data - 学習情報
   * @param {Array} validationCols - 検証対象のカラムリスト
   */
  validation (data, validationCols) {
    let err = false
    err = data.ret0_race_name.includes('新馬') ||
        data.ret0_race_name.includes('障害')
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
