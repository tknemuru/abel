
'use strict'

const configManager = require('@/config-manager')
const htmlHelper = require('@h/html-helper')

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
    const config = configManager.get()
    let baseUrl
    switch (param.target) {
      case 'rage':
        baseUrl = config.predRageUrl
        break
      case 'collegial':
        baseUrl = config.predCollegialUrl
        break
      default:
        baseUrl = config.predAbilityUrl
    }
    const url = `${baseUrl}${config.jupyter.token}`
    console.log(url)
    await htmlHelper.openPuppeteerPage(url, onOpenPage, param)
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
  const waitTime = params.waitTime || 8000
  await page.click('#run_int button')
  await page.waitForTimeout(waitTime)
}
