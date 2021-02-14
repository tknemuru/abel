'use strict'

const answerCreator = require('@an/learning-answer-creator')

/**
 * @module 特徴データの作成機能を提供します。
 */
module.exports = {
  /**
   * @description 順位スコアを抽出します。
   * @param {Object} data 学習用データ
   * @returns {Number} 順位スコア
   */
  extractOrderOfFinishScore (data) {
    let score = 0
    for (let i = 1; i <= 4; i++) {
      score += (data[`ret${i}_horse_count`] || 0) - (data[`ret${i}_order_of_finish`] || 0)
    }
    return score
  },
  /**
   * @description 順位と獲得賞金からスコアを抽出します。
   * @param {Object} data 学習用データ
   * @param {Number} index インデックス
   * @returns {Number} 順位と獲得賞金から算出したスコア
   */
  extractOrderAndEarningMoneyScore (data, index) {
    const order = data[`ret${index}_order_of_finish`] || 0
    const count = data[`ret${index}_horse_count`] || 0
    const money = data[`ret${index}_top_earning_money`] || 0
    const score = (count - order) * money
    return score
  },
  /**
   * @description 順位と獲得賞金からスコア合計を抽出します。
   * @param {Object} data 学習用データ
   * @param {Number} index インデックス
   * @param {Array} targetCols 対象カラムリスト
   * @returns {Number} 順位と獲得賞金から算出したスコア合計
   */
  extractOrderAndEarningMoneyScoreSum (data, targetCols) {
    let score = 0
    for (let i = 1; i <= 4; i++) {
      score += module.exports.extractSingleSimilarExperienceScore(data, i)
    }
    if (Array.isArray(targetCols)) {
      targetCols.push('order_and_earning_score')
    }
    return score
  },
  /**
   * @description 順位と獲得賞金からスコアを抽出します。
   * @param {Object} data 学習用データ
   * @param {Number} index インデックス
   * @returns {Number} 順位と獲得賞金から算出したスコア
   */
  extractSingleSimilarExperienceScore (data, index) {
    const score = answerCreator.createAnswerByRecoveryRateReduce(data, index)
    return score
  },
  /**
   * @description 順位スコアを付与します。
   * @param {Object} data 学習用データ
   * @returns {void}
   */
  attachOrderOfFinishScore (data) {
    const score = module.exports.extractOrderOfFinishScore(data)
    data.orderOfFinishScore = score
  },
  /**
   * @description 類似経験数を抽出します。
   * @param {Object} data 学習用データ
   * @param {String} key キー
   * @param {Array} targetCols 対象カラムリスト
   * @returns {Number} 類似経験数
   */
  extractSimilarExperienceCount (data, key, targetCols) {
    let count = 0
    for (let i = 1; i <= 4; i++) {
      count += (data[`ret0_${key}`] === data[`ret${i}_${key}`]) ? 1 : 0
    }
    if (Array.isArray(targetCols)) {
      targetCols.push(`feature_count_${key}`)
    }
    return count
  },
  /**
   * @description 類似馬場経験数を抽出します。
   * @param {Object} data 学習用データ
   * @param {String} key キー
   * @param {Array} targetCols 対象カラムリスト
   * @returns {Number} 類似経験数
   */
  extractSimilarSurfaceExperienceCount (data, targetCols) {
    let count = 0
    for (let i = 1; i <= 4; i++) {
      count += (data.ret0_surface_digit === data[`ret${i}_surface_digit`]) && (data.ret0_surface_state_digit === data[`ret${i}_surface_state_digit`]) ? 1 : 0
    }
    if (Array.isArray(targetCols)) {
      targetCols.push('feature_count_surface')
    }
    return count
  },
  /**
   * @description 類似経験スコアを抽出します。
   * @param {Object} data 学習用データ
   * @param {String} key キー
   * @param {Array} targetCols 対象カラムリスト
   * @returns {Number} 類似経験スコア
   */
  extractSimilarExperienceScore (data, key, targetCols) {
    let score = 0
    for (let i = 1; i <= 4; i++) {
      score += (data[`ret0_${key}`] === data[`ret${i}_${key}`]) ? module.exports.extractSingleSimilarExperienceScore(data, i) : 0
    }
    if (Array.isArray(targetCols)) {
      targetCols.push(`feature_${key}`)
    }
    return score
  },
  /**
   * @description 類似馬場経験スコアを抽出します。
   * @param {Object} data 学習用データ
   * @param {String} key キー
   * @param {Array} targetCols 対象カラムリスト
   * @returns {Number} 類似馬場経験スコア
   */
  extractSimilarSurfaceExperienceScore (data, targetCols) {
    let score = 0
    for (let i = 1; i <= 4; i++) {
      score += (data.ret0_surface_digit === data[`ret${i}_surface_digit`]) && (data.ret0_surface_state_digit === data[`ret${i}_surface_state_digit`]) ? module.exports.extractSingleSimilarExperienceScore(data, i) : 0
    }
    if (Array.isArray(targetCols)) {
      targetCols.push('feature_surface')
    }
    return score
  }
}
