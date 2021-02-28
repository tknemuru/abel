'use strict'

const accessor = require('@d/db-accessor')
const config = require('@/config-manager').get()
const fileHelper = require('@h/file-helper')
const reader = require('@d/sql-reader')

/**
 * @description 特徴データの作成機能提供します。
 */
module.exports = {
  /**
   * @description 特徴データを作成します。
   * @param {Object} param パラメータ
   * @returns {void}
   */
  create (param = {}) {
    switch (param.target) {
      case 'post-money':
        createPostMoney()
        break
      default:
    }
  }
}

/**
 * @description 未来の得られる賞金リストファイルを作成します。
 * @returns {void}
 */
async function createPostMoney () {
  const sql = reader.read('select_all_post_earning_money')
  const results = await accessor.all(sql)
  const output = {}
  for (const ret of results) {
    output[`${ret.raceId}-${ret.horseId}`] = ret.postMoneys
  }
  fileHelper.writeJson(output, config.featPostEarningMoneysFilePath)
}
