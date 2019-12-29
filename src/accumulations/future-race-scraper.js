'use strict'

/**
 * @module 開催予定レースのスクレイピング機能を提供します。
 */
module.exports = {
  /**
   * @description 開催予定レースのスクレイピングを行います。
   * @returns {void}
   */
  async scrape () {
    // ページをダウンロード
    const downloader = require('@ac/page-downloader')
    await downloader.download({
      urls: [
        // 'https://racev3.netkeiba.com/race/shutuba.html?race_id=202006010109&rf=race_list'
        // 'https://racev3.netkeiba.com/race/shutuba.html?race_id=202006010110&rf=race_list'
        // 'https://racev3.netkeiba.com/race/shutuba.html?race_id=202006010111&rf=race_list'
        // 'https://racev3.netkeiba.com/race/shutuba.html?race_id=202008010109&rf=race_list'
        // 'https://racev3.netkeiba.com/race/shutuba.html?race_id=202008010110&rf=race_list'
        'https://racev3.netkeiba.com/race/shutuba.html?race_id=202008010111&rf=race_list'
      ]
    })

    // dom化
    const fs = require('fs')
    const html = fs.readFileSync('resources/htmls/test.html', { encoding: 'utf-8' })
    const jsdom = require('jsdom')
    const { JSDOM } = jsdom
    const dom = new JSDOM(html)
    console.log('gen dom end')

    // 情報を抽出
    const extractor = require('@ac/future-race-extractor')
    const data = extractor.extract(dom)
    console.log(data)

    // 結果を出力
    fs.writeFileSync('resources/races/test.json'
      , JSON.stringify(data, null, '  ')
      , { encoding: 'utf-8' }
    )

    return dom
  }
}
