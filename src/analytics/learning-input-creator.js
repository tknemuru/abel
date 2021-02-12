'use strict'

const fileHelper = require('@h/file-helper')

/**
 * @module 学習用情報の作成機能を提供します。
 */
module.exports = {
  /**
   * @description レースの処理単位
   */
  RaceUnit: 1000,
  /**
   * @description 入力情報ファイルディレクトリ
   */
  InputFileDir: 'resources/params/learnings',
  /**
   * @description 入力情報カラムリストファイルパス
   */
  InputColsFilePath: 'resources/learnings/input-cols.json',
  /**
   * @description 学習用情報を作成します。
   * @param {Object} config - 設定情報
   * @returns {void}
   */
  async create (config) {
    const validator = require('@h/validation-helper')
    validator.required(config)
    const towardPost = !!config.towardPost
    if (towardPost) {
      console.log('***** toward post *****')
    }

    // 既存ファイルを削除する
    module.exports._clearFile()

    // 対象カラム情報を読み込む
    const fs = require('fs')
    const targetsSrc = JSON.parse(fs.readFileSync(`resources/defs/${config.columns()}.json`, { encoding: 'utf-8' }))
    const targets = module.exports._extractAllTargets(targetsSrc)
    let validationCols = JSON.parse(fs.readFileSync('resources/defs/learning-input-validation-columns.json', { encoding: 'utf-8' }))
    validationCols = module.exports._extractValidationCols(validationCols)

    // 正解情報を読み込む
    const answers = {}
    for (const type of require('@h/purchase-helper').getPurchasingTicketType()) {
      answers[type] = JSON.parse(fs.readFileSync(`resources/params/pred-result-${type}-key.json`, { encoding: 'utf-8' }))
    }

    const params = {
      targets,
      validationCols,
      answers,
      towardPost,
      keyRels: [],
      earningMoneys: {}
    }

    // 作成処理
    if (config.fromDb) {
      await module.exports._createFromDb(config, params)
    } else {
      module.exports._createFromFile(config, params)
    }

    // キー紐付き情報を書き込む
    if (towardPost) {
      module.exports._writeKeyRelation(params.keyRels)
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
        return []
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

      i++
      fromIdx = toIdx + 1
      toIdx += module.exports.RaceUnit
      // break
    }
  },
  /**
   * @description ファイルから学習用情報を作成します。
   * @param {Object} config 設定情報
   * @param {Object} params パラメータ
   * @returns {void}
   */
  _createFromFile (config, params) {
    const fs = require('fs')
    const path = require('path')
    const files = fs.readdirSync(module.exports.InputFileDir)
      .map(f => path.join(module.exports.InputFileDir, f))

    for (const file of files) {
      console.log(file)
      const hists = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }))
      // ファイルに結果を書き込む
      module.exports._writeFiles(hists, config, params)
      // break
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
      params.earningMoneys = module.exports._createEarningMoneys(hists)
      if (params.towardPost) {
        module.exports._createAnswer(hists, params, config)
      } else {
        // module.exports._createPostAnswers(hists, validationCols, config, answers)
        module.exports._createAnswer(hists, params, config)
      }
    }

    // 紐付きデータを作成
    if (config.relation) {
      module.exports._createRelation(hists, params.alidationCols, config)
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
    for (const hist of hists) {
      if (!config.validation(hist, validationCols)) {
        continue
      }
      const data = []
      const cols = Object.keys(hist)
      const targetCols = []
      for (const col of cols) {
        if (targets.includes(col)) {
          targetCols.push(col)
          data.push(module.exports._toNum(hist[col]))
        }
      }
      // 学習データのキーを記録しておく
      if (!fileHelper.existsFile(module.exports.InputColsFilePath)) {
        const fs = require('fs')
        fs.appendFileSync(module.exports.InputColsFilePath
          , JSON.stringify(targetCols)
          , { encoding: 'utf-8' }
        )
      }
      // 付加情報
      // module.exports._addInfo(data, hist, scoreParams)
      // 特徴情報
      // module.exports._addFeatures(data, hist)
      dataList.push(data)
      if (i % 1000 === 0) {
        console.log(i)
        // データを書き込む
        module.exports._writeInput(dataList)
        dataList = []
      }
      i++
    }
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
    let ansListSet = {}
    let i = 1
    for (const hist of hists) {
      if (!config.validation(hist, params.validationCols)) {
        continue
      }
      // 正解情報
      const money = params.earningMoneys[hist.ret0_race_id]
      const ansSet = config.createAnswer(hist, { money })
      for (const key in ansSet) {
        if (!ansListSet[key]) {
          ansListSet[key] = []
        }
        const ans = []
        ans.push(ansSet[key])
        ansListSet[key].push(ans)
      }
      if (i % 1000 === 0) {
        console.log(i)
        // データを書き込む
        module.exports._writeAnswer(ansListSet)
        ansListSet = {}
      }
      i++
    }
    // データを書き込む
    module.exports._writeAnswer(ansListSet)
  },
  /**
   * @description 学習用正解情報を作成します。
   * @param {Array} hists - 履歴情報
   * @param {Array} validationCols - 検証対象のカラム
   * @param {Object} config - 設定情報
   * @param {Object} answers - 正解情報
   * @returns {void}
   */
  _createPostAnswers (hists, validationCols, config, answers) {
    let ansListSet = {}
    let i = 1
    for (const hist of hists) {
      if (!config.validation(hist, validationCols)) {
        continue
      }
      // 正解情報
      const ansKey = `${hist.ret0_race_id}-${hist.ret0_horse_number}`
      const ansSet = {}
      for (const type of require('@h/purchase-helper').getPurchasingTicketType()) {
        const ans = answers[type][ansKey]
        ansSet[type] = ans
      }
      for (const key in ansSet) {
        if (!ansListSet[key]) {
          ansListSet[key] = []
        }
        const ans = []
        ans.push(ansSet[key])
        ansListSet[key].push(ans)
      }
      if (i % 1000 === 0) {
        console.log(i)
        // データを書き込む
        module.exports._writeAnswer(ansListSet)
        ansListSet = {}
      }
      i++
    }
    // データを書き込む
    module.exports._writeAnswer(ansListSet)
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
    for (const hist of hists) {
      if (!config.validation(hist, validationCols)) {
        continue
      }
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
      if (i % 1000 === 0) {
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
   * @description レースごとの獲得賞金リストを作成します。
   * @param {Array} hists レース履歴リスト
   */
  _createEarningMoneys (hists) {
    const earningMoneys = {}
    const tops = hists.filter(h => h.ret0_order_of_finish === 1)
    for (const top of tops) {
      earningMoneys[top.ret0_race_id] = top.ret0_earning_money
    }
    return earningMoneys
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
        const columnKey = `ret${i}_${key}_id`
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
   * @description 特徴情報を追加します。
   * @param {Array} data - 学習用データ
   * @param {Array} hist - 履歴データ
   */
  _addFeatures (data, hist) {
    const feature = require('@an/feature-extractor')
    feature.attachOrderOfFinishScore(hist)
    data.push(feature.extractSimilarExperienceCount(hist, 'distance'))
    data.push(feature.extractSimilarExperienceCount(hist, 'race_start'))
    data.push(feature.extractSimilarExperienceCount(hist, 'direction_digit'))
    data.push(feature.extractSimilarExperienceCount(hist, 'weather_digit'))
    data.push(feature.extractSimilarExperienceCount(hist, 'race_date_month'))
    data.push(feature.extractSimilarExperienceCount(hist, 'race_date_day'))
    data.push(feature.extractSimilarExperienceCount(hist, 'race_number'))
    data.push(feature.extractSimilarExperienceCount(hist, 'horse_count'))
    data.push(feature.extractSimilarExperienceCount(hist, 'horse_number'))
    data.push(feature.extractSimilarExperienceCount(hist, 'frame_number'))
    data.push(feature.extractSimilarExperienceCount(hist, 'basis_weight'))
    data.push(feature.extractSimilarSurfaceExperienceCount(hist))

    data.push(feature.extractSimilarExperienceScore(hist, 'distance'))
    data.push(feature.extractSimilarExperienceScore(hist, 'race_start'))
    data.push(feature.extractSimilarExperienceScore(hist, 'direction_digit'))
    data.push(feature.extractSimilarExperienceScore(hist, 'weather_digit'))
    data.push(feature.extractSimilarExperienceScore(hist, 'race_date_month'))
    data.push(feature.extractSimilarExperienceScore(hist, 'race_date_day'))
    data.push(feature.extractSimilarExperienceScore(hist, 'race_number'))
    data.push(feature.extractSimilarExperienceScore(hist, 'horse_count'))
    data.push(feature.extractSimilarExperienceScore(hist, 'horse_number'))
    data.push(feature.extractSimilarExperienceScore(hist, 'frame_number'))
    data.push(feature.extractSimilarExperienceScore(hist, 'basis_weight'))
    data.push(feature.extractSimilarSurfaceExperienceScore(hist))
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
    const files = fs.readdirSync('resources/learnings/')
      .map(f => path.join('resources/learnings/', f))

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
    for (const key in data) {
      module.exports._write(data[key], `answer-${key}`)
    }
  },
  /**
   * @description 紐付きデータの書き込みを行います。
   * @param {Array} data - 紐付きデータ
   */
  _writeRelation (data) {
    const fs = require('fs')
    fs.appendFileSync('resources/learnings/relation.json'
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
    fs.appendFileSync('resources/learnings/key-relation.json'
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
    fs.appendFileSync(`resources/learnings/${prefix}.csv`
      , dataCsv
      , { encoding: 'utf-8' }
    )
  }
}
