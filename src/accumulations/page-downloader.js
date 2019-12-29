'use strict'

/**
 * @module ページダウンロード機能を提供します。
 */
module.exports = {
  /**
   * @description ページをダウンロードします。
   * @param {Object} params - パラメータ
   * @param {Array} params.urls - URLリスト
   * @param {Object} params.urlParams - URLに付与するパラメータ
   * @returns {void}
   */
  async download (params) {
    const fs = require('fs')
    const puppeteer = require('puppeteer')
    for (const url of params.urls) {
      const browser = await puppeteer.launch({
        args: ['--lang=ja,en-US,en']
      })
      const page = await browser.newPage()
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'ja-JP'
      })
      console.log('page goto start')
      await page.goto(url, { waitUntil: 'networkidle0' })
      console.log('page goto end')
      const outerHTML = await page.evaluate(() => {
        return document.documentElement.outerHTML
      })
      fs.writeFileSync('resources/htmls/test.html'
        , outerHTML
        , { encoding: 'utf-8' }
      )
      console.log('write end')
    }
  }
}
