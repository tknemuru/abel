'use strict'

/**
 * @module 評価機能を提供します。
 */
module.exports = {
  /**
   * @description 評価を行います。
   * @param {Array} race - レース情報
   * @returns {Array} 評価値
   */
  evaluate (race) {
    const fs = require('fs')
    const cols = JSON.parse(fs.readFileSync('resources/defs/identity-eval-param-colums.json', { encoding: 'utf-8' }))
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
  }
}
