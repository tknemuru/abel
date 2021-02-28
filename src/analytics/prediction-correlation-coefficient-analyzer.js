/* eslint-disable no-unused-vars */
'use strict'

const _ = require('lodash')
const adjuster = require('@s/race-adjuster')
const ansDefManager = require('@an/answer-def-manager')
const calcHelper = require('@h/calc-helper')
const configManager = require('@/config-manager')
const fileHelper = require('@h/file-helper')
const log = require('@h/log-helper')
const logicHelper = require('@h/logic-helper')
const purchaseConfig = require('@p/purchase-config')
const purchaseHelper = require('@h/purchase-helper')
const ss = require('simple-statistics')

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
    const config = configManager.get()
    // 分析対象の情報を読み込む
    const collegials = fileHelper.readJson(config.predCollegialFilePath)
    let inputs = purchaseConfig.readAllPredResults()
      .map((p, i) => {
        p.collegialEval = collegials[i].eval
        // p.ss = calcHelper.standardScore(collegials
        //   .filter(c => c.raceId === p.raceId)
        //   .map(c => c.eval)
        // )
        return p
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
    const defs = ansDefManager.getAllAnswerDefs()
    for (const inp of inputs) {
      let evalInfo = `recvRate:${inp.recoveryRate} order:${inp.orderOfFinish} odds:${inp.odds} coll:${inp.collegialEval}`
      for (const def of defs) {
        evalInfo += ` ${def.shortName}:${inp[def.evalName]}`
      }
      log.info(evalInfo)
    }
    log.info('===============')
    // 相関係数を求める
    log.info('●馬の強さ')
    const aDefs = ansDefManager.getAbilityAnswerDefs()
    let targets = ['odds', 'collegialEval']
    targets = _.union(targets, aDefs.map(d => d.evalName))
    calc(inputs, 'orderOfFinish', targets)
    log.info('●回収率')
    calc(inputs, 'recoveryRate', targets)
    log.info('●レースの荒れ指数')
    inputs = inputs.filter(inp => inp.orderOfFinish <= 3)
    targets = ansDefManager.getRageAnswerDefs().map(d => d.evalName)
    calc(inputs, 'recoveryRate', targets)
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
