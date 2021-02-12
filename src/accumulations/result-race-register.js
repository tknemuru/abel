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
   * @description レース情報テンプレート配置ディレクトリ
   */
  RaceDataTemplateDir: 'resources/races/result-races/template',
  /**
   * @description 開催予定レース情報を登録します。
   * @param {Object} params パラメータ
   * @param {Boolean} params.clear データをクリアするかどうか
   * @param {Number} params.minDate 遡る最過去日付
   * @returns {void}
   */
  async register (params = {}) {
    const fs = require('fs')
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')
    const path = require('path')
    const clear = !!params.clear
    const minDate = params.minDate

    if (clear) {
      // DBの開催済レース情報を全クリア
      const sql = reader.read('delete_all_race_result')
      await accessor.run(sql)
    }

    // パラメータのテンプレートを生成
    const template = module.exports._generateTemplate()

    // レース情報を取得
    const files = fs.readdirSync(module.exports.RaceDataDir)
      .map(f => path.join(module.exports.RaceDataDir, f))

    // 情報を登録
    const sql = reader.read('insert_race_result')
    let i = 1
    let sqls = []
    let sqlParams = []
    for (const file of files) {
      console.log(file)
      if (module.exports._skip(file, minDate)) {
        console.log('skip')
        continue
      }
      const sqlAndParams = module.exports._generateSqlAndParams(file, sql)
      const _sqls = sqlAndParams.sqls
      const _params = sqlAndParams.params.map(p => {
        return Object.assign(
          {},
          template,
          // テンプレートに存在しないパラメータを除外する
          // 例えば同着の場合三連複が２パターンになる
          // 【例】https://db.netkeiba.com/race/201001020101/
          module.exports._filterParam(p, template)
        )
      })
      sqls = sqls.concat(_sqls)
      sqlParams = sqlParams.concat(_params)
      if (i % 100 === 0) {
        console.log(i)
        // データを書き込む
        await accessor.run(sqls, sqlParams)
        sqls = []
        sqlParams = []
      }
      i++
      // if (i > 3) {
      //   break
      // }
    }
    await accessor.run(sqls, sqlParams)
  },
  /**
   * @description パラメータのテンプレートを生成します。
   * @returns {Object} テンプレートパラメータ
   */
  _generateTemplate () {
    const fs = require('fs')
    const path = require('path')
    const file = fs.readdirSync(module.exports.RaceDataTemplateDir)
      .map(f => path.join(module.exports.RaceDataTemplateDir, f))[0]
    const sqlAndParams = module.exports._generateSqlAndParams(file)
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
   * @description 登録処理をスキップするかどうか
   * @param {String} file ファイル名
   * @param {Number} minDate 遡る最過去日付
   */
  _skip (file, minDate) {
    if (!minDate) {
      return false
    }
    if (require('@h/file-helper').isDirectory(file)) {
      console.log('this is directory')
      return true
    }
    const fs = require('fs')
    const raceAndHorses = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
    const { race } = raceAndHorses
    const date = Number(`${race.raceDateYear}${('0' + race.raceDateMonth).slice(-2)}`)
    console.log(date)
    const skip = date < minDate
    return skip
  },
  /**
   * @description ファイルの情報からSQLとパラメータを生成します。
   * @param {String} file ファイル名
   * @param {String} sql SQL
   * @returns {Object} SQLとパラメータ
   */
  _generateSqlAndParams (file, sql) {
    const fs = require('fs')
    const reader = require('@d/sql-reader')
    const sqlHelper = require('@h/sql-helper')
    const _sql = sql || reader.read('insert_race_result')
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
      sqls.push(_sql)
      params.push(param)
    }

    return {
      sqls,
      params
    }
  },
  /**
   * テンプレートに存在しないパラメータを除外します。
   * @param {Object} param パラメータ
   * @param {Object} template テンプレートパラメータ
   * @returns {Object} フィルタされたパラメータ
   */
  _filterParam (param, template) {
    const pKey = Object.keys(param)
    let filterd = false
    for (const key of pKey) {
      // eslint-disable-next-line no-prototype-builtins
      if (!template.hasOwnProperty(key)) {
        delete param[key]
        filterd = true
      }
    }
    if (filterd) {
      console.log(`filterd ${param.$raceId}`)
    }
    return param
  }
}
