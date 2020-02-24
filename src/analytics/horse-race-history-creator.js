'use strict'

/**
 * @module 馬別レース履歴の作成機能を提供します。
 */
module.exports = {
  /**
   * @description 馬別レース履歴データを作成します。
   * @returns {void}
   */
  async create (param = {}) {
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')

    // 馬の一覧を取得
    let sql
    let sqlParam
    if (param.isFuture) {
      sql = reader.read('select_all_future_horse')
    } else {
      sql = reader.read('select_all_horse')
      sqlParam = {
        $minYear: param.minYear,
        $minMonth: param.minMonth
      }
      console.log(sqlParam)
    }
    const horses = await accessor.all(sql, sqlParam)
    console.log(horses.length)

    for (const horse of horses) {
      console.log(horse.horseId)
      // レース履歴を取得
      sql = reader.read('select_race_result_by_horse_id')
      const histories = await accessor.all(sql, {
        $horseId: horse.horseId
      })

      // 履歴を登録していく
      sql = reader.read('insert_horse_race_history')
      const sqls = []
      const sqlParams = []
      const len = histories.length
      for (let i = 0; i < len; i++) {
        const sqlParam = {
          $raceId: histories[i].raceId,
          $horseNumber: histories[i].horseNumber,
          $horseId: histories[i].horseId,
          $postRaceId: (i < len - 1) ? histories[i + 1].raceId : null,
          $postHorseNumber: (i < len - 1) ? histories[i + 1].horseNumber : null,
          $preRaceId: (i > 0) ? histories[i - 1].raceId : null,
          $preHorseNumber: (i > 0) ? histories[i - 1].horseNumber : null
        }
        sqls.push(sql)
        sqlParams.push(sqlParam)
      }
      await accessor.run(sqls, sqlParams)
    }
  }
}
