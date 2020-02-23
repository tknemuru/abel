'use strict'

/**
 * @module 開催済レース情報登録用SQLの生成機能を提供します。
 */
module.exports = {
  /**
   * @description 開催済レースデータ配置ディレクトリ
   */
  RaceDataDir: 'resources/races/result-races/template',
  /**
   * @description insert文ファイルパス
   */
  InsertFilePath: 'resources/sqls/insert_$tableName.sql',
  /**
   * @description create table文ファイルパス
   */
  CreateTableFilePath: 'resources/sqls/create_$tableName.sql',
  /**
   * @description create view文ファイルパス
   */
  CreateViewFilePath: 'resources/sqls/create_view_$viewName.sql',
  /**
   * @description 小数項目
   */
  RealKeys: ['basis_weight', 'horse_weight', 'horse_weight_diff', 'earning_money'],
  /**
   * @description 開催済レーステーブルでnot nullとする項目
   */
  ResultNotNullKeys: ['horse_number'],
  /**
   * @description 開催予定レーステーブルでnot nullとする項目
   */
  FutureNotNullKeys: ['race_id', 'horse_number', 'horse_id'],
  /**
   * @description 開催済レース情報登録用SQLを生成します。
   * @returns {void}
   */
  generate () {
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
    let horseParam = sqlHelper.toParam(horse)
    module.exports._generateSql(race, horse, raceParam, horseParam, true)
    // 開催予定専用項目を追加
    horse.preRaceId = ''
    horse.preHorseNumber = -1
    horseParam = sqlHelper.toParam(horse)
    module.exports._generateSql(race, horse, raceParam, horseParam, false)
  },
  /**
   * @description SQL文を生成します。
   * @param {*} race レース情報
   * @param {*} horse 馬情報
   * @param {*} raceParam レースパラメータ
   * @param {*} horseParam 馬パラメータ
   * @param {*} isResult 開催済レースが対象かどうか
   */
  _generateSql (race, horse, raceParam, horseParam, isResult) {
    const _ = require('lodash')
    const fs = require('fs')
    const tableName = isResult ? 'race_result' : 'race_future'
    let viewName = isResult ? 'result_race_history' : 'future_race_history'

    // insert文
    let sql = `insert or replace into ${tableName} (\n`
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
    fs.writeFileSync(module.exports.InsertFilePath.replace('$tableName', tableName)
      , sql
      , { encoding: 'utf-8' }
    )

    // create文
    sql = `create table if not exists ${tableName} (\n`
    for (let i = 0; i < raceKeysLen; i++) {
      sql += `  ${_.snakeCase(raceKeys[i])} ${module.exports._getType(_.snakeCase(raceKeys[i]), race[raceKeys[i]])} ${module.exports._getNotNull(_.snakeCase(raceKeys[i]), race[raceKeys[i]], isResult)},\n`
    }
    for (let i = 0; i < horseKeysLen; i++) {
      sql += `  ${_.snakeCase(horseKeys[i])} ${module.exports._getType(_.snakeCase(horseKeys[i]), horse[horseKeys[i]])} ${module.exports._getNotNull(_.snakeCase(horseKeys[i]), horse[horseKeys[i]], isResult)},\n`
    }
    sql += '  primary key (race_id, horse_number)\n'
    sql += ')'
    fs.writeFileSync(module.exports.CreateTableFilePath.replace('$tableName', tableName)
      , sql
      , { encoding: 'utf-8' }
    )

    // create view文(pre)
    sql = `create view if not exists ${viewName}\n`
    sql += 'as\n'
    sql += 'select\n'
    for (let hisIdx = 0; hisIdx <= 4; hisIdx++) {
      for (let i = 0; i < raceKeysLen; i++) {
        sql += `  ret${hisIdx}.${_.snakeCase(raceKeys[i])} as ret${hisIdx}_${_.snakeCase(raceKeys[i])},\n`
      }
      for (let i = 0; i < horseKeysLen; i++) {
        sql += `  ret${hisIdx}.${_.snakeCase(horseKeys[i])} as ret${hisIdx}_${_.snakeCase(horseKeys[i])},\n`
      }
    }
    sql += 'from\n'
    sql += `  ${tableName} ret0\n`
    for (let i = 0; i < 4; i++) {
      sql += `-- ret${i + 1}\n`
      if (!isResult && i <= 0) {
        sql += 'left join\n'
        sql += `  race_result ret${i + 1}\n`
        sql += 'on\n'
        sql += `  ret${i + 1}.race_id = ret${i}.pre_race_id\n`
        sql += `  and ret${i + 1}.horse_number = ret${i}.pre_horse_number\n`
      } else {
        sql += 'left join\n'
        sql += `  horse_race_history his${i}\n`
        sql += 'on\n'
        sql += `  ret${i}.race_id = his${i}.race_id\n`
        sql += `  and ret${i}.horse_number = his${i}.horse_number\n`
        sql += 'left join\n'
        sql += `  race_result ret${i + 1}\n`
        sql += 'on\n'
        sql += `  ret${i + 1}.race_id = his${i}.pre_race_id\n`
        sql += `  and ret${i + 1}.horse_number = his${i}.pre_horse_number\n`
      }
    }
    sql += 'order by\n'
    sql += '  ret0_race_id,\n'
    sql += '  ret0_horse_number'
    fs.writeFileSync(module.exports.CreateViewFilePath.replace('$viewName', viewName)
      , sql
      , { encoding: 'utf-8' }
    )

    // 未来の場合はここで処理終了
    if (!isResult) {
      return
    }

    viewName = 'result_post_history'
    // create view文(post)
    sql = `create view if not exists ${viewName}\n`
    sql += 'as\n'
    sql += 'select\n'
    for (let hisIdx = 0; hisIdx <= 4; hisIdx++) {
      for (let i = 0; i < raceKeysLen; i++) {
        sql += `  ret${hisIdx}.${_.snakeCase(raceKeys[i])} as ret${hisIdx}_${_.snakeCase(raceKeys[i])},\n`
      }
      for (let i = 0; i < horseKeysLen; i++) {
        const comma = hisIdx < 4 || i < horseKeysLen - 1 ? ',' : ''
        sql += `  ret${hisIdx}.${_.snakeCase(horseKeys[i])} as ret${hisIdx}_${_.snakeCase(horseKeys[i])}${comma}\n`
      }
    }
    sql += 'from\n'
    sql += `  ${tableName} ret0\n`
    for (let i = 0; i < 4; i++) {
      sql += `-- ret${i + 1}\n`
      sql += 'left join\n'
      sql += `  horse_race_history his${i}\n`
      sql += 'on\n'
      sql += `  ret${i}.race_id = his${i}.race_id\n`
      sql += `  and ret${i}.horse_number = his${i}.horse_number\n`
      sql += 'left join\n'
      sql += `  race_result ret${i + 1}\n`
      sql += 'on\n'
      sql += `  ret${i + 1}.race_id = his${i}.post_race_id\n`
      sql += `  and ret${i + 1}.horse_number = his${i}.post_horse_number\n`
    }
    sql += 'order by\n'
    sql += '  ret0.race_id,\n'
    sql += '  ret0.horse_number'
    fs.writeFileSync(module.exports.CreateViewFilePath.replace('$viewName', viewName)
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
   * @param {Boolean} isResult 開催済レースを追加するかどうか
   * @returns {String} not null文字列
   */
  _getNotNull (key, val, isResult) {
    let ret = ''
    if (isResult) {
      if (module.exports._getType(key, val) === 'text' ||
        module.exports.ResultNotNullKeys.includes(key)) {
        ret = 'not null'
      }
    } else {
      if (module.exports.FutureNotNullKeys.includes(key)) {
        ret = 'not null'
      }
    }

    return ret
  }
}
