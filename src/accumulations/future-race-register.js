'use strict'

/**
 * @module 開催予定レース情報の登録機能を提供します。
 */
module.exports = {
  /**
   * @description HTMLファイル配置ディレクトリ
   */
  RaceDataDir: 'resources/races/future-races',
  /**
   * @description レース情報テンプレート配置ディレクトリ
   */
  RaceDataTemplateDir: 'resources/races/result-races/template',
  /**
   * @description 開催予定レース情報を登録します。
   * @returns {void}
   */
  async register () {
    const fs = require('fs')
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')
    const path = require('path')

    // DBの開催予定レース情報を全クリア
    let sql = reader.read('delete_all_race_future')
    await accessor.run(sql)

    // パラメータのテンプレートを生成
    const template = await module.exports._generateTemplate()

    // レース情報を取得
    const files = fs.readdirSync(module.exports.RaceDataDir)
      .map(f => path.join(module.exports.RaceDataDir, f))

    // 情報を登録
    sql = reader.read('insert_race_future')
    let sqls = []
    let sqlParams = []
    for (const file of files) {
      const sqlAndParams = await module.exports._generateSqlAndParams(file, sql)
      const _sqls = sqlAndParams.sqls
      const _params = sqlAndParams.params.map(p => {
        // TODO: あとでちゃんとやる
        delete p.$raceClass
        return Object.assign(
          {},
          template,
          p
        )
      })
      sqls = sqls.concat(_sqls)
      sqlParams = sqlParams.concat(_params)
    }
    await accessor.run(sqls, sqlParams)
  },
  /**
   * @description 前回のレース情報を取得します。
   * @param {String} horseId 馬ID
   */
  async _selectPreRaceHistory (horseId) {
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')

    // レース履歴を取得
    const sql = reader.read('select_race_result_by_horse_id_desc')
    const histories = await accessor.all(sql, {
      $horseId: horseId
    })
    const hist = {
      preRaceId: null,
      preHorseNumber: null
    }
    if (histories.length <= 0) {
      return hist
    }
    hist.preRaceId = histories[0].raceId
    hist.preHorseNumber = histories[0].horseNumber
    return hist
  },
  /**
   * @description パラメータのテンプレートを生成します。
   * @returns {Object} テンプレートパラメータ
   */
  async _generateTemplate () {
    const fs = require('fs')
    const path = require('path')
    const file = fs.readdirSync(module.exports.RaceDataTemplateDir)
      .map(f => path.join(module.exports.RaceDataTemplateDir, f))[0]
    const sqlAndParams = await module.exports._generateSqlAndParams(file)
    const param = sqlAndParams.params[0]
    const template = {}
    for (const key in param) {
      if (typeof param[key] === 'number') {
        template[key] = 0
      } else {
        template[key] = ''
      }
    }
    return template
  },
  /**
   * @description ファイルの情報からSQLとパラメータを生成します。
   * @param {String} file ファイル名
   * @param {String} sql SQL
   * @returns {Object} SQLとパラメータ
   */
  async _generateSqlAndParams (file, sql) {
    const fs = require('fs')
    const reader = require('@d/sql-reader')
    const sqlHelper = require('@h/sql-helper')
    const _sql = sql || reader.read('insert_race_future')
    // レース
    const raceAndHorses = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
    const { race } = raceAndHorses
    const raceParam = sqlHelper.toParam(race)

    // 馬
    const { horses } = raceAndHorses
    const sqls = []
    const params = []
    for (const horse of horses) {
      // 前回レースとの紐付ける
      const preHist = await module.exports._selectPreRaceHistory(horse.horseId)
      horse.preRaceId = preHist.preRaceId
      horse.preHorseNumber = preHist.preHorseNumber

      const horseParam = sqlHelper.toParam(horse)
      const param = Object.assign(
        {},
        raceParam,
        horseParam
      )
      sqls.push(_sql)
      params.push(param)
    }

    return {
      sqls,
      params
    }
  }
}
