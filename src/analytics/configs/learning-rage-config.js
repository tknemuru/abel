'use strict'

/**
 * @module 学習用設定情報を提供します。
 */
module.exports = {
  /**
   * @description 学習バージョン
   */
  version: 1,
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
    return 'select_range_result_race_history_for_rage'
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
    err = data.ret0_race_name.includes('新馬') ||
      data.ret0_race_name.includes('障害')
    return !err
  },
  /**
   * @description 正解データを作成します。
   * @param {Object} hists 履歴データ
   * @returns {Number} 正解データ
   */
  createAnswer (hists) {
    const creator = require('@an/learning-answer-creator')
    const ansSet = {}
    ansSet['rage-odds'] = creator.createAnswerByTopThreeOdds(hists)
    ansSet['rage-order'] = creator.createAnswerByOrderPopularityDiff(hists)
    return ansSet
  }
}
