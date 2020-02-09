'use strict'

/**
 * @module 開催済レース情報の登録機能を提供します。
 */
module.exports = {
  /**
   * @description レース情報配置ディレクトリ
   */
  RaceDataDir: 'resources/races/result-races',
  /**
   * @description 開催予定レース情報を登録します。
   * @param {Object} params パラメータ
   * @param {Boolean} params.clear データをクリアするかどうか
   * @returns {void}
   */
  async register (params = {}) {
    const fs = require('fs')
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')
    const path = require('path')
    const clear = !!params.clear

    if (clear) {
      // DBの開催済レース情報を全クリア
      const sql = reader.read('delete_all_race_result')
      await accessor.run(sql)
    }

    // レース情報を取得
    const files = fs.readdirSync(module.exports.RaceDataDir)
      .map(f => path.join(module.exports.RaceDataDir, f))

    // 情報を登録
    for (const file of files) {
      console.log(file)
      await module.exports._register(file)
    }
  },
  /**
   * @description 開催予定レース情報を登録します。
   * @param {String} file ファイル名
   */
  async _register (file) {
    const fs = require('fs')
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')
    const sqlHelper = require('@h/sql-helper')
    const sql = reader.read('insert_race_result')

    // レース
    const raceAndHorses = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
    const { race } = raceAndHorses
    const raceParam = sqlHelper.toParam(race)

    // 馬
    const { horses } = raceAndHorses
    const sqls = []
    const params = []
    for (const horse of horses) {
      const horseParam = sqlHelper.toParam(horse)
      const param = Object.assign(
        {},
        raceParam,
        horseParam
      )
      sqls.push(sql)
      params.push(param)
    }
    await accessor.run(sqls, params)
  }
}
