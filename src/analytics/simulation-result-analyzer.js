
'use strict'

/**
 * @module シミューレーション結果の分析機能を提供します。
 */
module.exports = {
  /**
   * @description シミューレーション結果を分析します。
   * @returns {void}
   */
  analyze () {
    const fs = require('fs')
    const simResults = JSON.parse(fs.readFileSync('resources/simulations/sim-result.json', { encoding: 'utf-8' }))
    const popularitys = {}
    const oddses = {}
    const scores = {}
    for (const ret of simResults) {
      const { purchases } = ret
      for (const purchase of purchases) {
        const p = purchase.popularity
        const o = Math.floor(purchase.odds / 100) * 100
        const s = Math.floor(purchase.score / 100) * 100
        module.exports._add(popularitys, p, purchase)
        module.exports._add(oddses, o, purchase)
        module.exports._add(scores, s, purchase)
      }
    }
    const pRet = module.exports._sort(popularitys)
    const oRet = module.exports._sort(oddses)
    const sRet = module.exports._sort(scores)
    const ret = {
      popularitys: pRet,
      oddses: oRet,
      scores: sRet
    }

    fs.writeFileSync('resources/analyzes/sim-result-analyze.json'
      , JSON.stringify(ret, null, '  ')
      , { encoding: 'utf-8' }
    )
  },
  _add (data, key, purchase) {
    if (!data[key]) {
      data[key] = {
        win: 0,
        all: 0,
        rate: 0
      }
    }
    if (purchase.orderOfFinish === 1) {
      data[key].win++
    }
    data[key].all++
    data[key].rate = Math.round((data[key].win / data[key].all) * 1000) / 10
  },
  _sort (data) {
    const keys = Object.keys(data)
      // .filter(key => data[key].win > 0)
      .sort((a, b) => {
        const _a = Number(a)
        const _b = Number(b)
        if (_a < _b) return -1
        if (_a > _b) return 1
        return 0
      })
    const ret = keys.map(key => {
      return {
        val: key,
        count: data[key]
      }
    })
    return ret
  }
}
