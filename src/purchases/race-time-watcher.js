'use strict'

const _ = require('lodash')
const accessor = require('@d/db-accessor')
const config = require('@/config-manager')
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
    const config = getConfig()
    // 未来のレース情報を取得
    const sql = reader.read('select_all_future_race_datetime')
    const futureRaces = await accessor.all(sql)
    if (!Array.isArray(futureRaces) || futureRaces.length <= 0) {
      throw new Error('future race is empty')
    }

    // 現在時刻と比較して購入対象のレースを取得
    let result = futureRaces
      .filter(r => {
        const required = r.raceDateYear && r.raceDateMonth && r.raceDateDay && r.raceStart
        if (!required) {
          console.warn('raceDateTime is invalid', r)
        }
        return required
      })
      .map(r => {
        const raceStartStr = `${r.raceDateYear}${logic.padZero(r.raceDateMonth, 2)}${logic.padZero(r.raceDateDay, 2)}${logic.padZero(r.raceStart, 4)}`
        const raceStart = moment(raceStartStr, 'YYYYMMDDhhmm')
        const now = moment()
        r.raceStartDateTime = raceStart.format()
        r.diff = raceStart.diff(now, 'minutes')
        return r
      })
    result = _.sortBy(result, 'diff')
    result = result
      .filter(r => {
        const required = r.diff > 0 && r.diff <= config.purchaseDiffTime
        const mark = required ? '★★★★★' : ''
        console.log(`${mark}${r.raceId} ${r.raceName} ${r.raceStartDateTime} ${r.diff}`)
        return required
      })
      .map(r => r.raceId)
    return result
  }
}

/**
 * @description 設定情報を取得します。
 * @returns {Object} パラメータ
 */
function getConfig () {
  return config.get().ipat
}
