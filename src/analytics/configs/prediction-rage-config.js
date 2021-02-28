'use strict'

const base = require('@an/configs/learning-rage-config')

/**
 * @module 学習用設定情報を提供します。
 */
module.exports = {
  /**
   * @description 学習バージョン
   */
  version: base.version,
  /**
   * @description インプット情報を作成するかどうか
   */
  input: base.input,
  /**
   * @description 正解情報を作成するかどうか
   */
  answer: base.answer,
  /**
   * @description 紐付き情報を作成するかどうか
   */
  relation: base.relation,
  /**
   * @description 前準備のセレクト文ファイル名
   */
  preSelect: 'select_all_future_race_id',
  /**
   * @description データベースの情報から作成するかどうか
   */
  fromDb: base.fromDb,
  /**
   * @description データセレクト文ファイル名
   */
  select: () => 'select_range_future_race_history',
  /**
   * @description 未来に向かう入力情報を作成するかどうか
   */
  towardPost: base.towardPost,
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
    return base.validation(data, validationCols)
  },
  /**
   * @description 正解データを作成します。
   * @param {Object} hists 履歴データ
   * @returns {Number} 正解データ
   */
  createAnswer (hists) {
    return base.createAnswer(hists)
  }
}
