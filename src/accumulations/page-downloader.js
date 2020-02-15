'use strict'

/**
 * @module ページダウンロード機能を提供します。
 */
module.exports = {
  /**
   * @description リトライ回数
   */
  RetryLimit: 3,
  /**
   * @description ページをダウンロードします。
   * @param {Object} params - パラメータ
   * @param {Array} params.urls - URLリスト
   * @param {Boolean} params.override - 既に存在しているファイルを上書きするかどうか。デフォルト:false
   * @returns {Array} ファイル名リスト
   */
  async downloadWithPuppeteer (params) {
    const validator = require('@h/validation-helper')
    validator.requiredContainsArray(params.urls)
    const fs = require('fs')
    const puppeteer = require('puppeteer')
    const uuid = require('uuid/v4')
    const sleep = require('thread-sleep')
    const file = require('@h/file-helper')

    const fileNames = []
    for (const url of params.urls) {
      let fileName = `resources/htmls/${uuid()}.html`
      if (params.fileNameGen) {
        fileName = params.fileNameGen(url)
      }
      if (!params.override) {
        if (file.existsFile(fileName)) {
          console.log(`file already exists ${fileName}`)
          fileNames.push(fileName)
          continue
        }
      }
      let count = 0
      let success = true
      let page = {}
      while (count < module.exports.RetryLimit) {
        let browser
        try {
          console.log('start sleep...')
          sleep(3000)
          console.log('end sleep')
          browser = await puppeteer.launch({
            args: ['--lang=ja,en-US,en']
          })
          page = await browser.newPage()
          await page.setExtraHTTPHeaders({
            'Accept-Language': 'ja-JP'
          })
          console.log('page goto start')
          // await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
          // await page.goto(url)
          console.log('page goto end')
          success = true
        } catch (e) {
          console.log(e)
          success = false
        } finally {
          if (browser) {
            browser.close()
          }
          count++
        }
        if (success) break
      }
      if (!success) {
        console.log('failed')
        continue
      }
      // console.log('manual update button click start')
      // await page.click('#act-manual_update')
      // console.log('manual update button click end')
      const outerHTML = await page.evaluate(() => {
        return document.documentElement.outerHTML
      })
      fs.writeFileSync(fileName
        , outerHTML
        , { encoding: 'utf-8' }
      )
      fileNames.push(fileName)
      console.log('write end')
    }
    return fileNames
  },
  /**
   * @description ページをダウンロードします。
   * @param {Object} params - パラメータ
   * @param {Array} params.urls - URLリスト
   * @param {Boolean} params.override - 既に存在しているファイルを上書きするかどうか。デフォルト:false
   * @returns {Array} ファイル名リスト
   */
  async downloadWithCheerioCli (params) {
    const fs = require('fs')
    const uuid = require('uuid/v4')
    const client = require('cheerio-httpcli')
    const sleep = require('thread-sleep')
    const file = require('@h/file-helper')
    const fileNames = []
    for (const url of params.urls) {
      let fileName = `resources/htmls/${uuid()}.html`
      if (params.fileNameGen) {
        fileName = params.fileNameGen(url)
      }
      if (!params.override) {
        if (file.existsFile(fileName)) {
          console.log(`file already exists ${fileName}`)
          fileNames.push(fileName)
          continue
        }
      }
      console.log('start sleep...')
      sleep(3000)
      console.log('end sleep')
      await client.fetch(url)
        .then((result) => {
          fs.writeFileSync(fileName
            , result.$.html()
            , { encoding: 'utf-8' }
          )
          fileNames.push(fileName)
          console.log('write end')
        })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {
          console.log('fetch end')
        })
    }
    return fileNames
  },
  /**
   * @description ページをダウンロードします。
   * @param {Object} params - パラメータ
   * @param {Array} params.urls - URLリスト
   * @param {Boolean} params.override - 既に存在しているファイルを上書きするかどうか。デフォルト:false
   * @returns {Array} ファイル名リスト
   */
  async download (params) {
    const fs = require('fs')
    const uuid = require('uuid/v4')
    const sleep = require('thread-sleep')
    const file = require('@h/file-helper')
    const rp = require('request-promise')
    const cheerio = require('cheerio')
    const fileNames = []
    for (const url of params.urls) {
      let fileName = `resources/htmls/${uuid()}.html`
      if (params.fileNameGen) {
        fileName = params.fileNameGen(url)
      }
      if (!params.override) {
        if (file.existsFile(fileName)) {
          console.log(`file already exists ${fileName}`)
          fileNames.push(fileName)
          continue
        }
      }
      console.log('start sleep...')
      sleep(3000)
      console.log('end sleep')
      const options = {
        transform: (body) => {
          return cheerio.load(body)
        }
      }
      await rp.get(url, options)
        .then(($) => {
          fs.writeFileSync(fileName
            , $.html()
            , { encoding: 'utf-8' }
          )
          fileNames.push(fileName)
          console.log('write end')
        }).catch((error) => {
          console.error('error:', error)
        })
    }
    return fileNames
  }
}
