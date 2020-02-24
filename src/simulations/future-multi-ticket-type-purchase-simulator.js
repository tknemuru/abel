'use strict'

/**
 * @module 開催予定レース複数チケット種別購入のシミュレーション機能を提供します。
 */
module.exports = {
  /**
   * @description ファイルディレクトリ
   */
  FileDir: 'resources/learnings',
  /**
   * @description 開催予定レース購入のシミュレーションを行います。
   * @param {Object} params - パラメータ
   * @param {Number} params.minScore - 最小スコア
   * @returns {void}
   */
  async simulate (params = {}) {
    const fs = require('fs')
    const path = require('path')
    const ticketTypes = require('@h/purchase-helper').getPurchasingTicketType()

    const results = {}
    const scoreHorses = {}
    for (const type of ticketTypes) {
      params.ticketType = type
      const preds = JSON.parse(fs.readFileSync(
        path.join(module.exports.FileDir, `pred-result-${type}.json`),
        { encoding: 'utf-8' }))

      // シミュレーション結果を整形
      const adjuster = require('@s/race-adjuster')
      const races = Object.values(adjuster.adjust(preds))

      // 購入対象を決める
      const evaluator = require('@s/score-evaluator')
      const purchaser = require('@s/purchaser')
      for (const horses of races) {
        if (horses.length <= 0) {
          continue
        }
        const { raceId } = horses[0]
        const { raceName } = horses[0]
        if (!results[raceId]) {
          results[raceId] = {
            raceId,
            raceName,
            purchases: {}
          }
          scoreHorses[raceId] = {
            raceId,
            raceName,
            purchases: {}
          }
        }
        const scores = evaluator.evaluate(horses)
        const purchasesSet = purchaser.purchase(horses, scores, params)
        results[raceId].purchases[type] = purchasesSet.purchases
        scoreHorses[raceId].purchases[type] = purchasesSet.horses
      }
    }

    // ファイルに書き出し
    module.exports._writeResutls(results)
    module.exports._writeHorses(scoreHorses)

    // DBに書き出し
    // await module.exports._writeHorsesToDb(scoreHorses)

    return results
  },
  /**
   * @description ファイルに結果を書き込みます。
   * @param {Object} data 結果情報
   */
  _writeResutls (results) {
    module.exports._writeFile(results, 'result')
  },
  /**
   * @description ファイルに馬情報を書き込みます。
   * @param {Object} horses 馬情報
   */
  _writeHorses (horses) {
    module.exports._writeFile(horses, 'horses')
  },
  /**
   * @description ファイルに結果を書き込みます。
   * @param {Object} data 結果情報
   * @param {String} fileKey ファイルキー
   */
  _writeFile (data, fileKey) {
    const _ = require('lodash')
    const ret = _.cloneDeep(data)
    const retkeys = Object.keys(ret)
    for (const raceId of retkeys) {
      const purchasesKeys = Object.keys(ret[raceId].purchases)
      for (const type of purchasesKeys) {
        for (const ticket of ret[raceId].purchases[type]) {
          delete ticket.raceId
          delete ticket.raceName
          delete ticket.pays
          if (ticket.horses) {
            for (const h of ticket.horses) {
              delete h.raceId
              delete h.raceName
              delete h.pays
            }
          }
        }
      }
    }
    const fs = require('fs')
    fs.writeFileSync(`resources/simulations/sim-${fileKey}.json`
      , JSON.stringify(ret, null, '  ')
      , { encoding: 'utf-8' }
    )
  },
  /**
   * @description 馬情報をDBに書き込みます。
   * @param {Object} horses 馬情報
   */
  async _writeHorsesToDb (horses) {
    const reader = require('@d/sql-reader')
    const accessor = require('@d/db-accessor')

    // 全クリア
    const sql = reader.read('delete_all_simulation_result')
    await accessor.run(sql)

    const sqls = []
    const sqlParams = []
    const races = Object.values(horses)
    for (const race of races) {
      const param = {
        $raceId: race.raceId,
        $raceName: race.raceName
      }
      const types = Object.keys(race.purchases)
      for (const type of types) {
        // 今は単勝だけ
        // if (type !== 'tan') {
        //   continue
        // }
        let scoreOrder = 1
        let seqNo = 1
        for (const ticket of race.purchases[type]) {
          let seqSubNo = 1
          if (type === 'tan' || type === 'fuku') {
            ticket.ticketType = type
            ticket.seqNo = seqNo
            ticket.seqSubNo = seqSubNo
            ticket.scoreOrder = scoreOrder
            module.exports._addSqlParam(ticket, param, sqls, sqlParams)
          } else {
            for (const horse of ticket.horses) {
              horse.score = ticket.score
              horse.ticketNum = ticket.ticketNum
              horse.odds = ticket.odds

              horse.ticketType = type
              horse.seqNo = seqNo
              horse.seqSubNo = seqSubNo
              horse.scoreOrder = scoreOrder
              module.exports._addSqlParam(horse, param, sqls, sqlParams)
              seqSubNo++
            }
          }
          scoreOrder++
          seqNo++
        }
      }
    }
    await accessor.run(sqls, sqlParams)
  },
  /**
   * @description SQLパラメータを追加します。
   * @param {Object} horse 馬情報
   * @param {Object} param パラメータ
   * @param {Array} sqls SQL
   * @param {Array} sqlParams SQLパラメータ
   */
  _addSqlParam (horse, param, sqls, sqlParams) {
    const reader = require('@d/sql-reader')
    const sql = reader.read('insert_simulation_result')
    const _ = require('lodash')
    const horseParam = Object.assign(
      _.cloneDeep(param),
      require('@h/sql-helper').toParam(horse)
    )
    delete horseParam.$pays
    delete horseParam.$eval
    sqls.push(sql)
    sqlParams.push(horseParam)
  }
}
