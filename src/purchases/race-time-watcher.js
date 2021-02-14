'use strict'

const _ = require('lodash')
const accessor = require('@d/db-accessor')
const logic = require('@h/logic-helper')
const moment = require('moment')
const reader = require('@d/sql-reader')

/**
 * @description レースの開始時間を監視します。
 */
module.exports = {
  /**
   * @description レースの開始時間を監視します。
   * @returns {Array} チケット購入時間に達したレースIDリスト
   */
  async watch () {
    // 未来のレース情報を取得
    const sql = reader.read('select_all_future_race_datetime')
    const futureRaces = await accessor.all(sql)
    if (!Array.isArray(futureRaces) || futureRaces.length <= 0) {
      throw new Error('future race is empty')
    }

    // 現在時刻と比較して購入対象のレースを取得
    let result = futureRaces
      .filter(r => {
        const required = r.raceDateYear && r.raceDateMonth && r.raceDay && r.raceStart
        if (!required) {
          console.warn('raceDateTime is invalid', r)
        }
        return required
      })
      .map(r => {
        const raceStart = moment(`${r.raceDateYear}${logic.padZero(r.raceDateMonth, 2)}${logic.padZero(r.raceDateDay, 2)}${logic.padZero(r.raceStart, 4)}`, 'YYYYMMDDhhmm')
        const now = moment()
        r.raceStartDateTime = raceStart.format()
        r.diff = raceStart.diff(now, 'minutes')
      })
    result = _.sortBy(result, 'diff')
    result = result.filter(r => {
      const required = r.diff > 0 && r.diff <= 15
      const mark = required ? '★' : ''
      console.log(`${mark}${r.raceId} ${r.raceName} ${r.raceStartDateTime} ${r.diff}`)
      return required
    })
    return result
  }
}
