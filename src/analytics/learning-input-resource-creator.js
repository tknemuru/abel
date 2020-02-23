'use strict'

/**
 * @module 学習用情報の作成機能を提供します。
 */
module.exports = {
  /**
   * @description レースの処理単位
   */
  RaceUnit: 100,
  /**
   * @description 入力情報ファイルディレクトリ
   */
  InputFileDir: 'resources/params/learnings',
  /**
   * @description 学習用情報を作成します。
   * @param {Object} config - 設定情報
   * @returns {void}
   */
  async create (config) {
    const validator = require('@h/validation-helper')
    validator.required(config)
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')
    const towardPost = !!config.towardPost
    if (towardPost) {
      console.log('***** toward post *****')
    }

    // 既存ファイルを削除する
    module.exports._clearFile()

    // 全レースIDを取得
    let sql = reader.read(config.preSelect)
    const raceIds = await accessor.all(sql)
    let fromIdx = 0
    let toIdx = module.exports.RaceUnit - 1
    let end = false
    let i = 0
    while (!end) {
      if (toIdx >= raceIds.length) {
        toIdx = raceIds.length - 1
        end = true
      }

      // スキップ判定
      if (config.salt && i % config.salt !== 0) {
        console.log('skip')
        i++
        fromIdx = toIdx + 1
        toIdx += module.exports.RaceUnit
        continue
      }

      let param = {}

      if (config.isInQuery) {
        const ids = raceIds.map(r => r.raceId)
        sql = reader.read(config.select())
        sql = sql.replace('?#', ids.map(() => '?').join(','))
        param = [ids]
      } else {
        param = {
          $from: raceIds[fromIdx].raceId,
          $to: raceIds[toIdx].raceId
        }
        sql = reader.read(config.select())
      }
      // レース結果を取得
      console.log(param)
      console.log(sql)
      const hists = await accessor.all(sql, param)
      console.log(hists.length)

      // ファイルに書き込む
      module.exports._write(hists, `${param.$from}-${param.$to}`)

      i++
      fromIdx = toIdx + 1
      toIdx += module.exports.RaceUnit
      // break
    }
  },
  /**
   * @description ファイルを削除します。
   */
  _clearFile () {
    const fs = require('fs')
    const path = require('path')
    const files = fs.readdirSync(module.exports.InputFileDir)
      .map(f => path.join(module.exports.InputFileDir, f))

    // 削除
    for (const file of files) {
      if (!require('@h/file-helper').existsFile(file)) {
        continue
      }
      fs.unlinkSync(file)
    }
  },
  /**
   * @description データの書き込みを行います。
   * @param {Array} data - データ
   * @param {String} prefix - ファイル名のプレフィックス
   */
  _write (data, prefix) {
    const fs = require('fs')
    const json = JSON.stringify(data)
    fs.appendFileSync(`${module.exports.InputFileDir}/${prefix}.json`
      , json
      , { encoding: 'utf-8' }
    )
  }
}
