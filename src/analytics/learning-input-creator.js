'use strict'

/**
 * @module 学習用インプット情報の作成機能を提供します。
 */
module.exports = {
  /**
   * @description レースの処理単位
   */
  RaceUnit: 1000,
  /**
   * @description 学習用インプット情報を作成します。
   * @returns {void}
   */
  async create () {
    const moment = require('moment')
    const timestamp = moment().format('YYYYMMDDHHmmss')
    console.log(timestamp)
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')

    // 全レースIDを取得
    let sql = reader.read('select_all_race_id')
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
      sql = reader.read('select_range_race_result_history')
      const hists = await accessor.all(sql, param)
      console.log(hists.length)

      // 学習データを作成
      module.exports._create(hists, timestamp)

      fromIdx = toIdx + 1
      toIdx += module.exports.RaceUnit
    }
  },
  /**
   * @description 学習用インプット情報を作成します。
   * @param {Array} hists - 履歴情報
   * @param {String} timestamp - タイムスタンプ
   * @returns {void}
   */
  async _create (hists, timestamp) {
    // 対象カラム情報を読み込む
    const fs = require('fs')
    const targetsSrc = JSON.parse(fs.readFileSync('resources/defs/learning-input-colums.json', { encoding: 'utf-8' }))
    const targets = module.exports._extractAllTargets(targetsSrc)
    let validationCols = JSON.parse(fs.readFileSync('resources/defs/learning-input-validation-colums.json', { encoding: 'utf-8' }))
    validationCols = module.exports._extractValidationCols(validationCols)
    const scoreParams = module.exports._createScoreParams()
    let dataList = []
    let ansList = []
    let i = 1
    for (const hist of hists) {
      if (!module.exports._validation(hist, validationCols)) {
        // console.log('validation error')
        // console.log(hist)
        continue
      }
      const data = []
      const ans = []
      const cols = Object.keys(hist)
      for (const col of cols) {
        if (targets.includes(col)) {
          data.push(module.exports._toNum(hist[col]))
        }
      }
      // 付加情報
      module.exports._addInfo(data, hist, scoreParams)
      // 正解情報
      ans.push(module.exports._createAnswer(hist))
      dataList.push(data)
      ansList.push(ans)
      if (i % 1000 === 0) {
        console.log(i)
        // データを書き込む
        module.exports._write(dataList, ansList, timestamp)
        dataList = []
        ansList = []
      }
      i++
    }
    // データを書き込む
    module.exports._write(dataList, ansList, timestamp)
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
   * @description 履歴情報のバリデーションを行います。
   * @param {Object} hist - 履歴情報
   * @param {Array} validationCols - バリデーション対象のカラムリスト
   */
  _validation (hist, validationCols) {
    const err = validationCols.some(key => {
      // 4レース揃っていないデータは一旦除外する
      // return hist[key] && Number(hist[key]) <= 0
      return Number.isNaN(Number(hist[key])) || Number(hist[key]) <= 0
    }) ||
      // 4位未満は除外
      Number(hist.ret_pre0_order_of_finish) > 4
    return !err
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
   * @description 正解データを作成します。
   * @param {Object} data 学習用データ
   * @returns {Number} 正解データ
   */
  _createAnswer (data) {
    const order = data.ret_pre0_order_of_finish
    const odds = data.ret_pre0_odds
    if (!order || !odds) {
      throw new Error(`order or odds is empty. order: ${order} odds: ${odds}`)
    }
    const _order = Number(order)
    if (!_order) {
      console.log(order)
      console.log(_order)
    }
    if (_order > 4) {
      throw new Error('unexpected order')
    }
    return _order - 1
    // if (_order <= 1) {
    //   label = 3
    // } else if (_order <= 6) {
    //   label = 2
    // } else {
    //   label = 1
    // }
    // return (label * odds * 100)
    // const answer = ((_order === 1) ? odds : 0) * 100
    // let label = 0
    // if (answer <= 0) {
    //   label = 3
    // } else if (answer < 500) {
    //   label = 2
    // } else if (answer < 3000) {
    //   label = 0
    // } else {
    //   label = 1
    // }
    // return label

    // const answer = (_order === 1) ? 1 : 0
    // return answer
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
   * @description データの書き込みを行います。
   * @param {Array} dataList - 学習データ
   * @param {Array} ansList - 正解データ
   * @param {String} timestamp - タイムスタンプ
   */
  _write (dataList, ansList, timestamp) {
    const csvHelper = require('@h/csv-helper')
    const fs = require('fs')
    const dataCsv = csvHelper.toCsv(dataList)
    const ansCsv = csvHelper.toCsv(ansList)
    fs.appendFileSync(`resources/learnings/input_${timestamp}.csv`
      , dataCsv
      , { encoding: 'utf-8' }
    )
    fs.appendFileSync(`resources/learnings/answer_${timestamp}.csv`
      , ansCsv
      , { encoding: 'utf-8' }
    )
  }
}
