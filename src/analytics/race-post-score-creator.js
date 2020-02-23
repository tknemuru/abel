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
    const sql = reader.read('select_all_race_post_score')
    const horses = await accessor.all(sql)
    console.log(horses.length)

    const ret = {}
    for (const horse of horses) {
      ret[`${horse.raceId}-${horse.horseNumber}`] = horse.score
    }
    const fs = require('fs')
    fs.writeFileSync('resources/params/race_post_score.json'
      , JSON.stringify(ret, null, '  ')
      , { encoding: 'utf-8' }
    )
  }
}
