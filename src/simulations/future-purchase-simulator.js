'use strict'

/**
 * @module 開催予定レース購入のシミュレーション機能を提供します。
 */
module.exports = {
  /**
   * @description 開催予定レース購入のシミュレーションを行います。
   * @returns {void}
   */
  async simulate () {
    const fs = require('fs')
    const races = JSON.parse(fs.readFileSync('resources/races/test.json', { encoding: 'utf-8' }))
    const simlator = require('@s/purchase-simulator')
    const result = await simlator.simulate({
      races,
      requiredReturnResult: true
    })
    console.log(result)
  }
}
