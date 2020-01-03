'use strict'

/**
 * @module ページダウンロード機能を提供します。
 */
module.exports = {
  /**
   * @description ページをダウンロードします。
   * @param {Object} params - パラメータ
   * @param {Array} params.urls - URLリスト
   * @param {Boolean} params.override - 既に存在しているファイルを上書きするかどうか。デフォルト:false
   * @returns {Array} ファイル名リスト
   */
  async download (params) {
    const validator = require('@h/validation-helper')
    validator.requiredContainsArray(params.urls)
    const fs = require('fs')
    const puppeteer = require('puppeteer')
    const uuid = require('uuid/v4')
    const sleep = require('thread-sleep')
    const html = require('@h/html-helper')

    const fileNames = []
    let i = 0
    for (const url of params.urls) {
      let fileName = `resources/htmls/${uuid()}.html`
      if (params.fileNameGen) {
        fileName = params.fileNameGen(url)
      }
      if (!params.override) {
        if (html.existsFile(fileName)) {
          console.log(`file already exists ${fileName}`)
          fileNames.push(fileName)
          continue
        }
      }
      if (i > 0) {
        console.log('start sleep...')
        sleep(5000)
        console.log('end sleep')
      }
      const browser = await puppeteer.launch({
        args: ['--lang=ja,en-US,en']
      })
      const page = await browser.newPage()
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'ja-JP'
      })
      console.log('page goto start')
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
      console.log('page goto end')
      const outerHTML = await page.evaluate(() => {
        return document.documentElement.outerHTML
      })
      fs.writeFileSync(fileName
        , outerHTML
        , { encoding: 'utf-8' }
      )
      fileNames.push(fileName)
      console.log('write end')
      i++
    }
    return fileNames
  }
}
