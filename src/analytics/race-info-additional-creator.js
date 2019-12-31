'use strict'

/**
 * @module レースの追加情報の作成機能を提供します。
 */
module.exports = {
  /**
   * @description レースの追加情報を作成します。
   * @returns {void}
   */
  async create () {
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')

    // 全レース情報を取得
    let sql = reader.read('select_all_race_info')
    const races = await accessor.all(sql)
    console.log(races.length)

    const converter = require('@h/convert-helper')
    sql = reader.read('insert_race_info_additional')
    let i = 1
    let sqls = []
    let params = []
    for (const race of races) {
      const surface = converter.convRaceSurface(race.surface)
      const param = {
        $raceId: race.raceId,
        $surface: surface.surface,
        $direction: surface.direction,
        $weather: converter.convWeather(race.weather),
        $surfaceState: converter.convSurfaceState(race.surfaceState)
      }
      sqls.push(sql)
      params.push(param)
      if (i % 1000 === 0) {
        console.log(i)
        await accessor.run(sqls, params)
        sqls = []
        params = []
      }
      i++
    }
    await accessor.run(sqls, params)
  }
}
