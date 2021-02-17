'use strict'

const fileHelper = require('@h/file-helper')

/**
 * @description 最大出馬数
 */
const MaxHorseCount = 18

/**
 * @description 対象カラム数
 */
let targetColsLength

/**
 * @module 場の荒れ具合学習用情報の作成機能を提供します。
 */
module.exports = {
  /**
   * @description レースの処理単位
   */
  RaceUnit: 1000,
  /**
   * @description 入力情報カラムリストファイルパス
   */
  InputColsFilePath: 'resources/learnings-rage/input-cols.json',
  /**
   * @description 学習用情報を作成します。
   * @param {Object} config - 設定情報
   * @returns {void}
   */
  async create (config) {
    // 既存ファイルを削除する
    module.exports._clearFile()

    // 対象カラム情報を読み込む
    const fs = require('fs')
    const targetsSrc = JSON.parse(fs.readFileSync(`resources/defs/${config.columns()}.json`, { encoding: 'utf-8' }))
    const targets = module.exports._extractAllTargets(targetsSrc)
    let validationCols = JSON.parse(fs.readFileSync('resources/defs/learning-input-validation-columns.json', { encoding: 'utf-8' }))
    validationCols = module.exports._extractValidationCols(validationCols)

    const params = {
      targets,
      validationCols,
      keyRels: [],
      earningMoneys: {}
    }

    // 作成処理
    if (config.fromDb) {
      await module.exports._createFromDb(config, params)
    }
  },
  /**
   * @description DBから学習用情報を作成します。
   * @param {Object} config 設定情報
   * @param {Object} params パラメータ
   * @returns {void}
   */
  async _createFromDb (config, params) {
    // 全レースIDを取得
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')
    const sql = reader.read(config.preSelect)
    const raceIds = await accessor.all(sql)
    let fromIdx = 0
    let toIdx = module.exports.RaceUnit - 1
    let end = false
    while (!end) {
      if (toIdx >= raceIds.length) {
        toIdx = raceIds.length - 1
        end = true
      }

      let param = {}
      let sql
      const reader = require('@d/sql-reader')
      const accessor = require('@d/db-accessor')
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

      // ファイルに結果を書き込む
      module.exports._writeFiles(hists, config, params)

      fromIdx = toIdx + 1
      toIdx += module.exports.RaceUnit
    }
  },
  /**
   * @description ファイルに書き込みます。
   * @param {Array} hists レース履歴
   * @param {Object} config 設定情報
   * @param {Object} params パラメータ
   */
  _writeFiles (hists, config, params) {
    // 学習データを作成
    if (config.input) {
      module.exports._createInput(hists, params.targets, params.validationCols, config)
    }

    // 正解データを作成
    if (config.answer) {
      params.answers = config.createAnswer(hists)
      module.exports._createAnswer(hists, params, config)
    }

    // 紐付きデータを作成
    if (config.relation) {
      module.exports._createRelation(hists, params.validationCols, config)
      if (params.towardPost) {
        module.exports._createKeyRelation(hists, params.validationCols, config, params.keyRels)
      }
    }
  },
  /**
   * @description 学習用インプット情報を作成します。
   * @param {Array} hists - 履歴情報
   * @param {Array} targets - インプット対象のカラム
   * @param {Array} validationCols - 検証対象のカラム
   * @param {Object} config - 設定情報
   * @returns {void}
   */
  async _createInput (hists, targets, validationCols, config) {
    // const scoreParams = module.exports._createScoreParams()
    let dataList = []
    let i = 1
    let lastRaceId = null
    let data = []
    const targetCols = []
    for (const hist of hists) {
      if (!config.validation(hist, validationCols)) {
        continue
      }
      // レースIDが変わったらデータを初期化
      if (lastRaceId && lastRaceId !== hist.ret0_race_id) {
        // 最大出馬数と同一のカラム数になるまで埋める
        while (data.length < targetColsLength) {
          data.push(0.0)
        }
        dataList.push(data)
        data = []
        i++
        if (i % 500 === 0) {
          console.log(i)
          // データを書き込む
          module.exports._writeInput(dataList)
          dataList = []
        }
      }
      lastRaceId = hist.ret0_race_id
      const cols = Object.keys(hist)
      for (const col of cols) {
        if (targets.includes(col)) {
          data.push(module.exports._toNum(hist[col]))
        }
      }
      // 学習データのキーを記録しておく
      if (!fileHelper.existsFile(module.exports.InputColsFilePath)) {
        const fs = require('fs')
        for (let order = 1; order <= MaxHorseCount; order++) {
          for (const col of cols) {
            if (targets.includes(col)) {
              targetCols.push(`${order}_${col}`)
            }
          }
        }
        targetColsLength = targetCols.length
        fs.appendFileSync(module.exports.InputColsFilePath
          , JSON.stringify(targetCols)
          , { encoding: 'utf-8' }
        )
      }
    }
    // 最後のデータ
    // 最大出馬数と同一のカラム数になるまで埋める
    while (data.length < targetColsLength) {
      data.push(0.0)
    }
    dataList.push(data)
    // データを書き込む
    if (dataList.length > 0) {
      console.log(`param length: ${dataList[0].length}`)
    }
    module.exports._writeInput(dataList)
  },
  /**
   * @description 学習用正解情報を作成します。
   * @param {Array} hists - 履歴情報
   * @param {Object} params - パラメータ
   * @param {Object} config - 設定情報
   * @returns {void}
   */
  _createAnswer (hists, params, config) {
    let ansList = []
    let i = 1
    let lastRaceId
    for (const hist of hists) {
      if (!config.validation(hist, params.validationCols)) {
        continue
      }
      if (lastRaceId === hist.ret0_race_id) {
        continue
      }
      lastRaceId = hist.ret0_race_id
      // 正解情報
      const ans = params.answers[hist.ret0_race_id]
      ansList.push([ans])
      if (i % 500 === 0) {
        console.log(i)
        // データを書き込む
        module.exports._writeAnswer(ansList)
        ansList = []
      }
      i++
    }
    // データを書き込む
    module.exports._writeAnswer(ansList)
  },
  /**
   * @description 紐付き情報を作成します。
   * @param {Array} hists - 履歴情報
   * @param {Array} validationCols - 検証対象のカラム
   * @param {Object} config - 設定情報
   * @returns {void}
   */
  _createRelation (hists, validationCols, config) {
    const conv = require('@h/convert-helper')
    let i = 1
    let rels = []
    let lastRaceId
    for (const hist of hists) {
      if (!config.validation(hist, validationCols)) {
        continue
      }
      if (lastRaceId === hist.ret0_race_id) {
        continue
      }
      lastRaceId = hist.ret0_race_id
      const rel = {
        raceId: hist.ret0_race_id,
        raceName: hist.ret0_race_name,
        horseNumber: hist.ret0_horse_number,
        horseId: hist.ret0_horse_id,
        horseName: hist.ret0_horse_name || '',
        orderOfFinish: conv.convNum(hist.ret0_order_of_finish),
        popularity: conv.convNum(hist.ret0_popularity),
        odds: conv.convNum(hist.ret0_odds)
      }
      // 払い戻し情報の作成
      const pays = {}
      pays.ret0_horse_number = hist.ret0_horse_number
      pays.ret0_frame_number = hist.ret0_frame_number
      for (const key in hist) {
        if (key.startsWith('ret0_tan_') ||
        key.startsWith('ret0_fuku_') ||
        key.startsWith('ret0_waku_') ||
        key.startsWith('ret0_uren_') ||
        key.startsWith('ret0_wide_') ||
        key.startsWith('ret0_utan_') ||
        key.startsWith('ret0_sanfuku_') ||
        key.startsWith('ret0_santan_')) {
          pays[key] = hist[key]
        }
      }
      rel.pays = pays
      rels.push(rel)
      if (i % 500 === 0) {
        console.log(i)
        // データを書き込む
        module.exports._writeRelation(rels)
        rels = []
      }
      i++
    }
    // データを書き込む
    module.exports._writeRelation(rels)
  },
  /**
   * @description キー紐付き情報を作成します。
   * @param {Array} hists - 履歴情報
   * @param {Array} validationCols - 検証対象のカラム
   * @param {Object} config - 設定情報
   * @param {Array} keyRels - キー紐付き情報
   * @returns {void}
   */
  _createKeyRelation (hists, validationCols, config, keyRels) {
    for (const hist of hists) {
      if (!config.validation(hist, validationCols)) {
        continue
      }
      const rel = {
        key: `${hist.ret0_race_id}-${hist.ret0_horse_number}`
      }
      keyRels.push(rel)
    }
  },
  /**
   * @description 全出力カラムリストを抽出します。
   * @param {Array} targets - 出力対象カラム定義
   * @returns 全出力カラムリスト
   */
  _extractAllTargets (targets) {
    return module.exports._extractPreTargets(targets)
      .concat(module.exports._extractOthersTargets(targets))
  },
  /**
   * @description 予定レースの出力カラムリストを抽出します。
   * @param {Array} targets - 出力対象カラム定義
   * @returns 予定の出力カラムリスト
   */
  _extractPreTargets (targets) {
    return module.exports._extractTargets(targets.pre, 'ret0')
  },
  /**
   * @description 予定レース以外の出力カラムリストを抽出します。
   * @param {Array} targets - 出力対象カラム定義
   * @returns 予定レース以外の出力カラムリスト
   */
  _extractOthersTargets (targets) {
    let ret = []
    for (let i = 1; i <= 4; i++) {
      const pre = module.exports._extractTargets(targets.pre, `ret${i}`)
      const others = module.exports._extractTargets(targets.others, `ret${i}`)
      ret = ret
        .concat(pre)
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
    const _targets = targets
      .map(col => `${customPrefix}_${col}`)
    return _targets
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
   * @description ファイルを削除します。
   */
  _clearFile () {
    const fs = require('fs')
    const path = require('path')
    const files = fs.readdirSync('resources/learnings-rage/')
      .map(f => path.join('resources/learnings-rage/', f))

    // 削除
    for (const file of files) {
      if (!require('@h/file-helper').existsFile(file)) {
        continue
      }
      fs.unlinkSync(file)
    }
  },
  /**
   * @description インプットデータの書き込みを行います。
   * @param {Array} data - 学習データ
   */
  _writeInput (data) {
    module.exports._write(data, 'input')
  },
  /**
   * @description 正解データの書き込みを行います。
   * @param {Array} data - 正解データ
   */
  _writeAnswer (data) {
    module.exports._write(data, 'answer')
  },
  /**
   * @description 紐付きデータの書き込みを行います。
   * @param {Array} data - 紐付きデータ
   */
  _writeRelation (data) {
    const fs = require('fs')
    fs.appendFileSync('resources/learnings-rage/relation.json'
      , JSON.stringify(data, null, '  ')
      , { encoding: 'utf-8' }
    )
  },
  /**
   * @description キー紐付きデータの書き込みを行います。
   * @param {Array} data - キー紐付きデータ
   */
  _writeKeyRelation (data) {
    const fs = require('fs')
    fs.appendFileSync('resources/learnings-rage/key-relation.json'
      , JSON.stringify(data, null, '  ')
      , { encoding: 'utf-8' }
    )
  },
  /**
   * @description データの書き込みを行います。
   * @param {Array} data - データ
   * @param {String} prefix - ファイル名のプレフィックス
   */
  _write (data, prefix) {
    const csvHelper = require('@h/csv-helper')
    const fs = require('fs')
    const dataCsv = csvHelper.toCsv(data)
    fs.appendFileSync(`resources/learnings-rage/${prefix}.csv`
      , dataCsv
      , { encoding: 'utf-8' }
    )
  }
}
