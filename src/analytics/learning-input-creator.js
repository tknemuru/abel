'use strict'

/**
 * @module 学習用情報の作成機能を提供します。
 */
module.exports = {
  /**
   * @description レースの処理単位
   */
  RaceUnit: 1000,
  /**
   * @description 学習用情報を作成します。
   * @param {Object} config - 設定情報
   * @returns {void}
   */
  async create (config) {
    const validator = require('@h/validation-helper')
    validator.required(config)
    const moment = require('moment')
    const timestamp = moment().format('YYYYMMDDHHmmss')
    console.log(timestamp)
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')

    // 全レースIDを取得
    let sql = reader.read(config.preSelect)
    const raceIds = await accessor.all(sql)
    let fromIdx = 0
    let toIdx = module.exports.RaceUnit - 1
    let end = false
    while (!end) {
      if (toIdx >= raceIds.length) {
        toIdx = raceIds.length - 1
        end = true
      }
      const param = {
        $from: raceIds[fromIdx].raceId,
        $to: raceIds[toIdx].raceId
      }
      console.log(param)
      // レース結果を取得
      sql = reader.read(config.select)
      const hists = await accessor.all(sql, param)
      console.log(hists.length)

      // 学習データを作成
      if (config.input) {
        module.exports._createInput(hists, timestamp, config)
      }

      // 正解データを作成
      if (config.answer) {
        module.exports._createAnswer(hists, timestamp, config)
      }

      // 紐付きデータを作成
      if (config.relation) {
        module.exports._createRelation(hists, timestamp, config)
      }

      fromIdx = toIdx + 1
      toIdx += module.exports.RaceUnit
    }
  },
  /**
   * @description 学習用インプット情報を作成します。
   * @param {Array} hists - 履歴情報
   * @param {String} timestamp - タイムスタンプ
   * @param {Object} config - 設定情報
   * @returns {void}
   */
  async _createInput (hists, timestamp, config) {
    // 対象カラム情報を読み込む
    const fs = require('fs')
    const targetsSrc = JSON.parse(fs.readFileSync('resources/defs/learning-input-colums.json', { encoding: 'utf-8' }))
    const targets = module.exports._extractAllTargets(targetsSrc)
    let validationCols = JSON.parse(fs.readFileSync('resources/defs/learning-input-validation-colums.json', { encoding: 'utf-8' }))
    validationCols = module.exports._extractValidationCols(validationCols)
    const scoreParams = module.exports._createScoreParams()
    let dataList = []
    let i = 1
    for (const hist of hists) {
      if (!config.validation(hist, validationCols)) {
        continue
      }
      const data = []
      const cols = Object.keys(hist)
      for (const col of cols) {
        if (targets.includes(col)) {
          data.push(module.exports._toNum(hist[col]))
        }
      }
      // 付加情報
      module.exports._addInfo(data, hist, scoreParams)
      dataList.push(data)
      if (i % 1000 === 0) {
        console.log(i)
        // データを書き込む
        module.exports._writeInput(dataList, timestamp)
        dataList = []
      }
      i++
    }
    // データを書き込む
    module.exports._writeInput(dataList, timestamp)
  },
  /**
   * @description 学習用正解情報を作成します。
   * @param {Array} hists - 履歴情報
   * @param {String} timestamp - タイムスタンプ
   * @param {Object} config - 設定情報
   * @returns {void}
   */
  _createAnswer (hists, timestamp, config) {
    // 対象カラム情報を読み込む
    const fs = require('fs')
    let validationCols = JSON.parse(fs.readFileSync('resources/defs/learning-input-validation-colums.json', { encoding: 'utf-8' }))
    validationCols = module.exports._extractValidationCols(validationCols)
    let ansList = []
    let i = 1
    for (const hist of hists) {
      if (!config.validation(hist, validationCols)) {
        continue
      }
      const ans = []
      // 正解情報
      ans.push(config.createAnswer(hist))
      ansList.push(ans)
      if (i % 1000 === 0) {
        console.log(i)
        // データを書き込む
        module.exports._writeAnswer(ansList, timestamp)
        ansList = []
      }
      i++
    }
    // データを書き込む
    module.exports._writeAnswer(ansList, timestamp)
  },
  /**
   * @description 紐付き情報を作成します。
   * @param {Array} hists - 履歴情報
   * @param {String} timestamp - タイムスタンプ
   * @param {Object} config - 設定情報
   * @returns {void}
   */
  _createRelation (hists, timestamp, config) {
    // 対象カラム情報を読み込む
    const fs = require('fs')
    const conv = require('@h/convert-helper')
    let validationCols = JSON.parse(fs.readFileSync('resources/defs/learning-input-validation-colums.json', { encoding: 'utf-8' }))
    validationCols = module.exports._extractValidationCols(validationCols)
    let i = 1
    let rels = []
    for (const hist of hists) {
      if (!config.validation(hist, validationCols)) {
        continue
      }
      const rel = {
        raceId: hist.inf_pre0_race_id,
        raceName: hist.inf_pre0_race_name,
        horseNumber: hist.ret_pre0_horse_number,
        horseId: hist.ret_pre0_horse_id,
        horseName: hist.ret_pre0_horse_name || '',
        orderOfFinish: conv.convNum(hist.ret_pre0_order_of_finish),
        popularity: conv.convNum(hist.ret_pre0_popularity),
        odds: conv.convNum(hist.ret_pre0_odds)
      }
      rels.push(rel)
      if (i % 1000 === 0) {
        console.log(i)
        // データを書き込む
        module.exports._writeRelation(rels, timestamp)
        rels = []
      }
      i++
    }
    // データを書き込む
    module.exports._writeRelation(rels, timestamp)
  },
  /**
   * @description 全出力カラムリストを抽出します。
   * @param {Array} targets - 出力対象カラム定義
   * @returns 全出力カラムリスト
   */
  _extractAllTargets (targets) {
    return module.exports._extractPre0Targets(targets)
      .concat(module.exports._extractOthersTargets(targets))
  },
  /**
   * @description pre0の出力カラムリストを抽出します。
   * @param {Array} targets - 出力対象カラム定義
   * @returns pre0の出力カラムリスト
   */
  _extractPre0Targets (targets) {
    return module.exports._extractTargets(targets.pre0, 'pre0')
  },
  /**
   * @description pre0以外の出力カラムリストを抽出します。
   * @param {Array} targets - 出力対象カラム定義
   * @returns pre0以外の出力カラムリスト
   */
  _extractOthersTargets (targets) {
    let ret = []
    for (let i = 1; i <= 4; i++) {
      const pre0 = module.exports._extractTargets(targets.pre0, `pre${i}`)
      const others = module.exports._extractTargets(targets.others, `pre${i}`)
      ret = ret
        .concat(pre0)
        .concat(others)
    }
    return ret
  },
  /**
   * @description 出力カラムリストを抽出します。
   * @param {Array} targets - 出力対象カラム定義
   * @param {String} customPrefix - カスタムプレフィックス
   * @returns 出力カラムリスト
   */
  _extractTargets (targets, customPrefix) {
    const targetsPrefix = Object.keys(targets)
    let retTargets = []
    for (const prefix of targetsPrefix) {
      const _prefix = `${prefix}_${customPrefix}`
      const _targets = targets[prefix]
        .map(col => `${_prefix}_${col}`)
      retTargets = retTargets.concat(_targets)
    }
    return retTargets
  },
  /**
   * @description バリデーション対象のカラムを展開します。
   * @param {Array} cols バリデーション対象のカラム
   */
  _extractValidationCols (cols) {
    const retCols = [0, 1, 2, 3, 4]
      .map(i => cols.map(col => col.replace('$num', i)))
    return retCols.reduce((pre, cur) => pre.concat(cur))
  },
  /**
   * @description 評価パラメータを作成します。
   */
  _createScoreParams () {
    const fs = require('fs')
    const jockey = JSON.parse(fs.readFileSync('resources/params/jockey_id.json', { encoding: 'utf-8' }))
    const trainer = JSON.parse(fs.readFileSync('resources/params/trainer_id.json', { encoding: 'utf-8' }))
    return {
      jockey,
      trainer
    }
  },
  /**
   * @description 付加情報を追加します。
   * @param {Array} data - 学習用データ
   * @param {Array} hist - 履歴データ
   * @param {Object} params - 付加情報のパラメータ
   */
  _addInfo (data, hist, params) {
    for (let i = 0; i <= 4; i++) {
      const score = 50
      const keys = [
        'jockey',
        'trainer'
      ]
      for (const key of keys) {
        const columnKey = `ret_pre${i}_${key}_id`
        if (hist[columnKey] && params[`${key}`][hist[columnKey]]) {
          const val = Math.round(params[`${key}`][hist[columnKey]].recoveryRate)
          data.push(val)
        } else {
          data.push(score)
        }
      }
    }
  },
  /**
   * 値を数値に変換します。
   * @param {Any} val - 値
   */
  _toNum (val) {
    if (typeof val === 'number') {
      return val
    }
    return !val || !Number(val) ? 0 : Number(val)
  },
  /**
   * @description インプットデータの書き込みを行います。
   * @param {Array} data - 学習データ
   * @param {String} timestamp - タイムスタンプ
   */
  _writeInput (data, timestamp) {
    module.exports._write(data, timestamp, 'input')
  },
  /**
   * @description 正解データの書き込みを行います。
   * @param {Array} data - 正解データ
   * @param {String} timestamp - タイムスタンプ
   */
  _writeAnswer (data, timestamp) {
    module.exports._write(data, timestamp, 'answer')
  },
  /**
   * @description 紐付きデータの書き込みを行います。
   * @param {Array} data - 紐付きデータ
   * @param {String} timestamp - タイムスタンプ
   */
  _writeRelation (data, timestamp) {
    const fs = require('fs')
    fs.appendFileSync(`resources/learnings/relation_${timestamp}.json`
      , JSON.stringify(data, null, '  ')
      , { encoding: 'utf-8' }
    )
  },
  /**
   * @description データの書き込みを行います。
   * @param {Array} data - データ
   * @param {String} timestamp - タイムスタンプ
   * @param {String} prefix - ファイル名のプレフィックス
   */
  _write (data, timestamp, prefix) {
    const csvHelper = require('@h/csv-helper')
    const fs = require('fs')
    const dataCsv = csvHelper.toCsv(data)
    fs.appendFileSync(`resources/learnings/${prefix}_${timestamp}.csv`
      , dataCsv
      , { encoding: 'utf-8' }
    )
  }
}
