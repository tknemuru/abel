'use strict'

/**
 * @module レース結果の整形機能を提供します。
 */
module.exports = {
  /**
   * @description レース結果を整形します。
   * @param {Array} races - 整形前のレース結果
   * @returns {Object} 整形したレース結果
   */
  adjust (races) {
    const _races = {}
    for (const race of races) {
      if (!_races[race.raceId]) {
        _races[race.raceId] = []
      }
      _races[race.raceId].push(race)
    }
    return _races
  }
}
