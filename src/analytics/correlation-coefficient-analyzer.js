/* eslint-disable no-unused-vars */
'use strict'

const _ = require('lodash')
const csvHelper = require('@h/csv-helper')
const fileHelper = require('@h/file-helper')
const logicHelper = require('@h/logic-helper')
const ss = require('simple-statistics')

/**
 * @description 入力情報ファイルパス
 */
const InputFilePath = 'resources/learnings/input.csv'
/**
 * @description 正解情報ファイルパス
 */
const AnswerFilePath = 'resources/learnings/answer-uren.csv'
/**
 * @description 入力情報カラムリストファイルパス
 */
const InputColsFilePath = 'resources/learnings/input-cols.json'

/**
 * @description 相関係数の分析機能を提供します。
 */
module.exports = {
  /**
   * @description 相関係数の分析を行います。
   * @param {Object} params - 設定情報
   * @returns {void}
   */
  analyze (params) {
    const colsPath = params.colsPath || InputColsFilePath
    const inputsPath = params.inputsPath || InputFilePath
    const answersPath = params.answersPath || AnswerFilePath
    // 学習データのカラム情報を読み込む
    const cols = fileHelper.readJson(colsPath)
    // 学習データを読み込む
    const inputs = csvHelper.toArray(fileHelper.read(inputsPath))
    // 正解データを読み込む
    const answers = fileHelper.read(answersPath)
      .split('\n')
      // .filter((a, i) => i < 1000)
      .map(a => {
        if (!Number(a)) {
          return 0
        } else {
          return Number(a)
        }
      })
    // 相関係数を求める
    let i = 0
    let corres = []
    for (const col of cols) {
      const targetVals = inputs.map(input => {
        if (!Number(input[i])) {
          return 0
        } else {
          return Number(input[i])
        }
      })
      const value = Number(ss.sampleCorrelation(targetVals, answers).toFixed(5))
      const corre = {
        key: col,
        value,
        absValue: Math.abs(value)
      }
      corres.push(corre)
      i++
    }
    corres = logicHelper.sortReverse(corres, 'absValue', true)
    for (const corre of corres) {
      console.log(`${corre.key}:${corre.value}`)
    }
    // 相関係数によりフィルタしたカラムリストを作成
    createFilterdLearningInputColumns(corres)
    console.log('done!')
  }
}

/**
 * @description 相関係数によってフィルタされたカラムリストを作成します。
 * @returns {void}
 */
function createFilterdLearningInputColumns (corres) {
  const filterdCols = corres
    .filter(c => c.absValue >= 0.1)
    .map(c => c.key)
  fileHelper.writeJson(filterdCols, 'resources/defs/filterd-learning-input-columns.json')
}
