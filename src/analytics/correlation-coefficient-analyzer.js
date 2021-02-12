/* eslint-disable no-unused-vars */
'use strict'

const _ = require('lodash')
const csvHelper = require('@h/csv-helper')
const fileHelper = require('@h/file-helper')
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
   * @param {Object} config - 設定情報
   * @returns {void}
   */
  analyze (config) {
    // 学習データのカラム情報を読み込む
    const cols = fileHelper.readJson(InputColsFilePath)
    // 学習データを読み込む
    const inputs = csvHelper.toArray(fileHelper.read(InputFilePath))
    // .filter((input, i) => i < 1000)
    // 正解データを読み込む
    const answers = fileHelper.read(AnswerFilePath)
      .split('\n')
      // .filter((a, i) => i < 1000)
      .map(a => {
        if (!Number(a)) {
          // console.log(`invalid value! ${a}`)
          return 0
        } else {
          return Number(a)
        }
      })
    // 相関係数を求める
    // for (let i = 0; i < 10; i++) {
    //   console.log(answers[i])
    // }
    // for (let i = 0; i < 10; i++) {
    //   console.log(targetVals[i])
    // }
    let i = 0
    let corres = []
    for (const col of cols) {
      const targetVals = inputs.map(input => {
        if (!Number(input[i])) {
          // console.log(`invalid value! ${input[0]}`)
          return 0
        } else {
          return Number(input[i])
        }
      })
      // console.log(`answers:${answers.length}, targetVals:${targetVals.length}`)
      const corre = {
        key: col,
        value: ss.sampleCorrelation(targetVals, answers).toFixed(5)
      }
      corres.push(corre)
      i++
    }
    corres = _.orderBy(corres, 'value', 'desc')
    for (const corre of corres) {
      console.log(`${corre.key}:${corre.value}`)
    }
    console.log('done!')
  }
}
