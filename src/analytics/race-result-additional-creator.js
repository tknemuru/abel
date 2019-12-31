'use strict'

/**
 * @module レース結果の追加情報の作成機能を提供します。
 */
module.exports = {
  /**
   * @description レース結果の追加情報を作成します。
   * @returns {void}
   */
  async create () {
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')

    // 全レース結果を取得
    let sql = reader.read('select_all_race_result')
    const races = await accessor.all(sql)
    console.log(races.length)

    const converter = require('@h/convert-helper')
    sql = reader.read('insert_race_result_additional')
    let i = 1
    let sqls = []
    let params = []
    for (const race of races) {
      const horseWeight = converter.convHorseWeight(race.horseWeight)
      const param = {
        $raceId: race.raceId,
        $horseNumber: race.horseNumber,
        $horseId: race.horseId,
        $sex: converter.convSex(race.sex),
        $finishingTime: converter.convFinishingTime(race.finishingTime),
        $length: converter.convLength(race.margin),
        $horseWeight: horseWeight.weight,
        $horseWeightDiff: horseWeight.diff
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
