'use strict'

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
   * @description 順位スコアを付与します。
   * @param {Object} data 学習用データ
   * @returns {void}
   */
  attachOrderOfFinishScore (data) {
    const score = module.exports.extractOrderOfFinishScore(data)
    data.orderOfFinishScore = score
  },
  extractSimilarExperienceCount (data, key) {
    let count = 0
    for (let i = 1; i <= 4; i++) {
      count += (data[`ret0_${key}`] === data[`ret${i}_${key}`]) ? 1 : 0
    }
    return count
  },
  extractSimilarSurfaceExperienceCount (data) {
    let count = 0
    for (let i = 1; i <= 4; i++) {
      count += (data.ret0_surface_digit === data[`ret${i}_surface_digit`]) && (data.ret0_surface_state_digit === data[`ret${i}_surface_state_digit`]) ? 1 : 0
    }
    return count
  },
  extractSimilarExperienceScore (data, key) {
    let score = 0
    for (let i = 1; i <= 4; i++) {
      score += (data[`ret0_${key}`] === data[`ret${i}_${key}`]) ? data.orderOfFinishScore : 0
    }
    return score
  },
  extractSimilarSurfaceExperienceScore (data) {
    let score = 0
    for (let i = 1; i <= 4; i++) {
      score += (data.ret0_surface_digit === data[`ret${i}_surface_digit`]) && (data.ret0_surface_state_digit === data[`ret${i}_surface_state_digit`]) ? data.orderOfFinishScore : 0
    }
    return score
  }
}
