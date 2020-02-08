'use strict'

/**
 * @module 開催済レース情報登録用SQLの生成機能を提供します。
 */
module.exports = {
  /**
   * @description 開催済レースデータ配置ディレクトリ
   */
  RaceDataDir: 'resources/races/result-races',
  /**
   * @description insert文ファイルパス
   */
  InsertFilePath: 'resources/sqls/insert_race_result.sql',
  /**
   * @description create文ファイルパス
   */
  CreateFilePath: 'resources/sqls/create_race_result.sql',
  /**
   * @description 小数項目
   */
  RealKeys: ['basis_weight', 'horse_weight', 'horse_weight_diff', 'earning_money'],
  /**
   * @description 開催済レース情報登録用SQLを生成します。
   * @returns {void}
   */
  generate () {
    const _ = require('lodash')
    const fs = require('fs')
    const path = require('path')

    // レース情報を取得
    const file = fs.readdirSync(module.exports.RaceDataDir)
      .map(f => path.join(module.exports.RaceDataDir, f))[0]

    // SQL生成
    const sqlHelper = require('@h/sql-helper')
    const raceAndHorses = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
    const { race } = raceAndHorses
    const { horses } = raceAndHorses
    const horse = horses[1]
    const raceParam = sqlHelper.toParam(race)
    const horseParam = sqlHelper.toParam(horse)

    // insert文
    let sql = 'insert or replace into race_result (\n'
    const raceKeys = Object.keys(race)
    const raceKeysLen = raceKeys.length
    for (let i = 0; i < raceKeysLen; i++) {
      sql += `  ${_.snakeCase(raceKeys[i])},\n`
    }
    const horseKeys = Object.keys(horse)
    const horseKeysLen = horseKeys.length
    for (let i = 0; i < horseKeysLen; i++) {
      const comma = i < horseKeysLen - 1 ? ',' : ''
      sql += `  ${_.snakeCase(horseKeys[i])}${comma}\n`
    }
    sql += ') values (\n'
    const raceParamKeys = Object.keys(raceParam)
    for (let i = 0; i < raceKeysLen; i++) {
      sql += `  ${raceParamKeys[i]},\n`
    }
    const horseParamKeys = Object.keys(horseParam)
    for (let i = 0; i < horseKeysLen; i++) {
      const comma = i < horseKeysLen - 1 ? ',' : ''
      sql += `  ${horseParamKeys[i]}${comma}\n`
    }
    sql += ')'
    fs.writeFileSync(module.exports.InsertFilePath
      , sql
      , { encoding: 'utf-8' }
    )

    // create文
    sql = 'create table if not exists race_result (\n'
    for (let i = 0; i < raceKeysLen; i++) {
      sql += `  ${_.snakeCase(raceKeys[i])} ${module.exports._getType(raceKeys[i], race[raceKeys[i]])} ${module.exports._getNotNull(raceKeys[i], race[raceKeys[i]])},\n`
    }
    for (let i = 0; i < horseKeysLen; i++) {
      const comma = i < horseKeysLen - 1 ? ',' : ''
      sql += `  ${_.snakeCase(horseKeys[i])} ${module.exports._getType(horseKeys[i], horse[horseKeys[i]])} ${module.exports._getNotNull(horseKeys[i], horse[horseKeys[i]])}${comma}\n`
    }
    sql += '  primary key (race_id, horse_number)\n'
    sql += ')'
    fs.writeFileSync(module.exports.CreateFilePath
      , sql
      , { encoding: 'utf-8' }
    )
  },
  /**
   * @description 型を取得します。
   * @param {String} key 項目キー
   * @param {String|Number} val 値
   * @returns {String} 型
   */
  _getType (key, val) {
    if (typeof val === 'string') {
      return 'text'
    }
    if (module.exports.RealKeys.includes(key)) {
      return 'real'
    }
    return 'integer'
  },
  /**
   * @description not null文字列を取得します。
   * @param {String} key 項目キー
   * @param {String|Number} val 値
   * @returns {String} not null文字列
   */
  _getNotNull (key, val) {
    let ret = ''
    if (module.exports._getType(key, val) === 'text') {
      ret = 'not null'
    }
    return ret
  }
}
