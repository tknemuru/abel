/* eslint-disable no-unused-vars */
'use strict'

const _ = require('lodash')
const adjuster = require('@s/race-adjuster')
const fileHelper = require('@h/file-helper')
const log = require('@h/log-helper')
const logicHelper = require('@h/logic-helper')
const ss = require('simple-statistics')

/**
 * @description 馬の強さ評価結果ファイルパス
 */
const AbilityFilePath = 'resources/learnings/pred-result-uren.json'
/**
 * @description レースの荒れ指数情報ファイルパス
 */
const RageFilePath = 'resources/learnings-rage/pred-result.json'

/**
 * @description 相関係数の分析機能を提供します。
 */
module.exports = {
  /**
   * @description 相関係数の分析を行います。
   * @param {Object} params - 設定情報
   * @returns {void}
   */
  analyze (params = {}) {
    // 分析対象の情報を読み込む
    const abilitys = fileHelper.readJson(AbilityFilePath)
    const rages = adjuster.adjust(fileHelper.readJson(RageFilePath))
    // マージする
    let inputs = abilitys.map(a => {
      a.abilityEval = a.eval
      a.rageEval = rages[a.raceId][0].eval
      a.recoveryRate = a.orderOfFinish <= 3 ? a.odds : 0
      return a
    })
    // 強さ評価値の順位付けをする
    const orders = {}
    inputs = logicHelper
      .sortReverse(inputs, 'abilityEval')
      .map(inp => {
        if (orders[inp.raceId] == null) {
          orders[inp.raceId] = 1
        } else {
          orders[inp.raceId]++
        }
        inp.abilityEvalOrder = orders[inp.raceId]
        return inp
      })
    // ソートする
    inputs = logicHelper.sortReverse(inputs, 'recoveryRate')
    // 情報を出力する
    for (const inp of inputs) {
      log.info(`recvRate:${inp.recoveryRate} order:${inp.orderOfFinish} odds:${inp.odds} ability:${inp.abilityEval} abilityOrder:${inp.abilityEvalOrder} rage:${inp.rageEval}`)
    }
    log.info('===============')
    // 相関係数を求める
    log.info('●馬の強さ')
    calc(inputs, 'orderOfFinish', ['abilityEval', 'abilityEvalOrder', 'odds'])
    log.info('===============')
    log.info('●レースの荒れ指数')
    inputs = inputs.filter(inp => inp.orderOfFinish <= 3)
    calc(inputs, 'recoveryRate', ['rageEval'])
    console.log('done!')
  }
}

function calc (inputs, ansKey, targetKeys) {
  let corres = []
  const keys = Object.keys(inputs[0])
  let targetVals = []
  const answers = inputs.map(input => {
    if (!Number(input[ansKey])) {
      return 0
    } else {
      return Number(input[ansKey])
    }
  })
  for (const key of keys) {
    if (!targetKeys.includes(key)) {
      continue
    }
    targetVals = inputs.map(input => {
      if (!Number(input[key])) {
        return 0
      } else {
        return Number(input[key])
      }
    })
    const value = Number(ss.sampleCorrelation(targetVals, answers).toFixed(5))
    const corre = {
      key,
      value,
      absValue: Math.abs(value)
    }
    corres.push(corre)
  }
  corres = logicHelper.sortReverse(corres, 'absValue', true)
  for (const corre of corres) {
    log.info(`${corre.key}:${corre.value}`)
  }
}
