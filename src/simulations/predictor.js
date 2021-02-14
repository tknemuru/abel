
'use strict'

const config = require('@/config-manager')
const htmlHelper = require('@h/html-helper')

/**
 * @description 予測実行URL
 */
const PredUrl = 'http://localhost:8888/notebooks/dev/tknemuru/abel-learning/pred_v4.ipynb?token='

/**
 * @description 予測機能を提供します。
 */
module.exports = {
  /**
   * @description レース結果を予測します。
   * @returns {void}
   */
  async predict () {
    const param = getParam()
    const url = `${PredUrl}${param.token}`
    await htmlHelper.openPuppeteerPage(url, onOpenPage)
  }
}

/**
 * @description ページを開いたときに実行します。
 * @param {Object} browser ブラウザ
 * @param {Object} page ページ
 * @param {Object} params パラメータ
 * @returns {void}
 */
async function onOpenPage (browser, page, params) {
  await page.click('#run_int button')
  await page.waitForTimeout(8000)
}

/**
 * @description パラメータを取得します。
 * @returns {Object} パラメータ
 */
function getParam () {
  return config.get().jupyter
}
