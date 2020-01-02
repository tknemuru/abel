'use strict'

/**
 * @module 結果情報の補正機能を提供します。
 */
module.exports = {
  /**
   * @description 結果情報を補正します。
   * @returns {void}
   */
  async create () {
    // 全結果情報を取得
    // const fs = require('fs')

    // const races = await accessor.all(sql)
    // console.log(races.length)

    // const converter = require('@h/convert-helper')
    // sql = reader.read('insert_race_info_additional')
    // let i = 1
    // let sqls = []
    // let params = []
    // for (const race of races) {
    //   const surface = converter.convRaceSurface(race.surface)
    //   const param = {
    //     $raceId: race.raceId,
    //     $surface: surface.surface,
    //     $direction: surface.direction,
    //     $weather: converter.convWeather(race.weather),
    //     $surfaceState: converter.convSurfaceState(race.surfaceState)
    //   }
    //   sqls.push(sql)
    //   params.push(param)
    //   if (i % 1000 === 0) {
    //     console.log(i)
    //     await accessor.run(sqls, params)
    //     sqls = []
    //     params = []
    //   }
    //   i++
    // }
    // await accessor.run(sqls, params)
  }
}
