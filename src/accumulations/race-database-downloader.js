'use strict'

const configManager = require('@/config-manager')

/**
 * @module 開催レースページのスクレイピング機能を提供します。
 */
module.exports = {
  /**
   * @description 開催済レースページのスクレイピングを実行します。
   * @param {Object} params パラメータ
   * @param {String} params.endDate 遡る最過去の日付（YYYYMM）
   * @param {Boolean} params.append 追記かどうか
   * @returns {void}
   */
  async extract (params = {}) {
    const config = configManager.get()
    const fs = require('fs')
    const endDate = params.endDate
    const append = !!params.append
    console.log(`endDate: ${endDate}`)
    console.log(`append: ${append}`)
    if (!append && require('@h/file-helper').existsFile(config.resultRaceUrlFilePath)) {
      fs.unlinkSync(config.resultRaceUrlFilePath)
    }

    const urls = module.exports._readUrls()
    for (const url of urls) {
      let fileName = url.split('/')
      fileName = fileName[fileName.length - 2].substring(0, 8)
      const yyyymm = fileName.substring(0, 6)
      console.log(fileName)
      console.log(yyyymm)
      if (Number(yyyymm) < Number(params.endDate)) {
        console.log('skip')
        continue
      }
      const raceUrls = await module.exports._extractPageUrl(url, fileName)
      fs.appendFileSync(config.resultRaceUrlFilePath
        , module.exports._toRows(raceUrls)
        , { encoding: 'utf-8' }
      )
    }
  },
  /**
   * @description レースデータペースページのURLを抽出します。
   * @param {String} url URL
   * @param {String} fileName ページファイルの保存名
   */
  async _extractPageUrl (url, fileName) {
    const config = configManager.get()
    const downloader = require('@ac/page-downloader')
    const pageFilePath = await downloader.download({
      urls: [url],
      fileNameGen: () => `resources/htmls/result-race-list/${fileName}.html`
    })
    console.log(pageFilePath[0])

    // dom化
    const dom = require('@h/html-helper').toDom(pageFilePath[0])

    // URLを取得
    const urls = [].slice.call(dom.window.document.querySelectorAll('.race_top_data_info>dd>a'))
      .map(tag => `${config.netkeibaDbBaseUrl}${tag.href}`)
    return urls
  },
  /**
   * @description URLを読み込みます。
   * @returns {Array} 前月のURL
   */
  _readUrls () {
    const config = configManager.get()
    if (!require('@h/file-helper').existsFile(config.resultRaceListUrlFilePath)) {
      return []
    }
    const fs = require('fs')
    const urls = fs.readFileSync(
      config.resultRaceListUrlFilePath,
      { encoding: 'utf-8' })
      .split('\n')
      .filter(url => url)
    return urls
  },
  /**
   * @description 配列を改行コードで分割した行の文字列に変換します。
   * @param {Array} urls - URLリスト
   * @returns {String}} 改行コードで分割した行の文字列
   */
  _toRows (urls) {
    const length = urls.length
    let rows = ''
    for (let i = 0; i < length; i++) {
      rows += `${urls[i]}\n`
    }
    return rows
  }
}
