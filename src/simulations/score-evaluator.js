'use strict'

/**
 * @module 評価機能を提供します。
 */
module.exports = {
  /**
   * @description バージョン
   */
  version: 0,
  /**
   * @description 評価を行います。
   * @param {Array} horses - 出馬情報
   * @returns {Array} 評価値
   */
  evaluate (horses) {
    let evals = []
    switch (module.exports.version) {
      case 1:
        evals = module.exports.evaluateV1(horses)
        break
      case 2:
        evals = module.exports.evaluateV2(horses)
        break
      case 3:
        evals = module.exports.evaluateV3(horses)
        break
      default:
        evals = horses.map(h => {
          return {
            score: h.eval
          }
        })
    }
    return evals
  },
  /**
   * @description 評価を行います。
   * @param {Array} race - レース情報
   * @returns {Array} 評価値
   */
  evaluateV1 (race) {
    const fs = require('fs')
    const cols = JSON.parse(fs.readFileSync('resources/defs/identity-eval-param-columns.json', { encoding: 'utf-8' }))
    const dic = {}
    for (const col of cols) {
      dic[col.alias] = JSON.parse(fs.readFileSync(`resources/params/${col.name}.json`, { encoding: 'utf-8' }))
    }
    const conv = require('@h/convert-helper')
    const evals = race.map(r => {
      let score = 0
      for (const col of cols) {
        const val = col.alias === 'sex' ? conv.convSex(r[col.alias]) : r[col.alias]
        if (dic[col.alias] &&
            val &&
            dic[col.alias][val] &&
            dic[col.alias][val].score) {
          // console.log(`param hit => name: ${col.alias} score: ${dic[col.alias][val].score}`)
          score += dic[col.alias][val].score
        } else {
          score += 50
        }
      }
      return {
        horseNumber: r.horseNumber,
        eval: score
      }
    })
    return evals
  },
  /**
   * @description 評価を行います。
   * @param {Array} horses - 出馬情報
   * @returns {Array} 評価値
   */
  evaluateV2 (horses) {
    const calc = require('@h/calc-helper')
    // オッズの偏差値を求める
    const oddsSs = calc.standardScore(horses.map(h => h.orgOdds))
    // 評価値の偏差値を求める
    const evalSs = calc.standardScore(horses.map(h => h.eval))
    // 偏差値の差を求める
    const diffs = oddsSs.map((o, i) => o - evalSs[i])
    return diffs.map((d, i) => {
      return {
        oddsSs: oddsSs[i],
        evalSs: evalSs[i],
        score: d
      }
    })
  },
  /**
   * @description 評価を行います。
   * @param {Array} horses - 出馬情報
   * @returns {Array} 評価値
   */
  evaluateV3 (horses) {
    // 差を求める
    const diffs = horses.map((h, i) => h.odds - h.eval)
    return diffs.map((d, i) => {
      return {
        score: Math.round(Number(d) * 10) / 10
      }
    })
  }
}
