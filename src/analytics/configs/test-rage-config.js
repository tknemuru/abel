'use strict'

const base = require('@an/configs/learning-rage-config')

/**
 * @module 検証用設定情報を提供します。
 */
module.exports = {
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
  preSelect: 'select_all_race_id',
  /**
   * @description データベースの情報から作成するかどうか
   */
  fromDb: base.fromDb,
  /**
   * @description データセレクト文ファイル名
   */
  select: () => 'select_in_result_race_history',
  /**
   * @description 未来に向かう入力情報を作成するかどうか
   */
  towardPost: base.towardPost,
  /**
   * @description 出力対象のカラム定義を取得します。
   * @returns {String} 出力対象のカラム定義名
   */
  columns () {
    return base.columns()
  },
  /**
   * @description ソルト
   */
  salt: base.salt,
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
    return base.validation(data, validationCols)
  },
  /**
   * @description 正解データを作成します。
   * @param {Object} data 学習用データ
   * @param {Object} params パラメータ
   * @returns {Number} 正解データ
   */
  createAnswer (data, params) {
    return base.createAnswer(data, params)
  }
}
