
'use strict'

const config = require('@/config-manager')
const htmlHelper = require('@h/html-helper')

/**
 * @description 馬の強さ予測実行URL
 */
const AbilityPredUrl = 'http://localhost:8888/notebooks/dev/tknemuru/abel-learning/pred_v4.ipynb?token='

/**
 * @description レースの荒れ予測実行URL
 */
const RagePredUrl = 'http://localhost:8888/notebooks/dev/tknemuru/abel-learning/pred-rage_v1.ipynb?token='

/**
 * @description 予測機能を提供します。
 */
module.exports = {
  /**
   * @description レース結果を予測します。
   * @param {Object} param パラメータ
   * @param {String} param.target 予測対象
   * @returns {void}
   */
  async predict (param = { target: 'ability' }) {
    let baseUrl
    switch (param.target) {
      case 'rage':
        baseUrl = RagePredUrl
        break
      default:
        baseUrl = AbilityPredUrl
    }
    const config = getConfig()
    const url = `${baseUrl}${config.token}`
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
 * @description 設定情報を取得します。
 * @returns {Object} 設定情報
 */
function getConfig () {
  return config.get().jupyter
}
