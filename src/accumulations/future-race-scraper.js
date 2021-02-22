'use strict'

const futureExtractor = require('@ac/future-race-extractor')
const htmlHelper = require('@h/html-helper')
const payoutExtractor = require('@ac/result-payout-race-extractor')

/**
 * @module 開催予定レースのスクレイピング機能を提供します。
 */
module.exports = {
  /**
   * @description HTMLファイル配置ディレクトリ
   */
  HtmlDir: 'resources/htmls/future-races',
  /**
   * @description 開催予定レースのスクレイピングを行います。
   * @returns {void}
   */
  async scrape (param = {}) {
    const htmlDir = param.htmlDir || module.exports.HtmlDir
    const fs = require('fs')
    const path = require('path')

    // レースページのURLリストを取得
    const files = fs.readdirSync(htmlDir)
      .map(f => path.join(htmlDir, f))

    // 抽出
    for (const file of files) {
      module.exports._extract(file, param.requiredResult)
    }
  },
  /**
   * @description HTMLファイルから必要な情報を抽出します。
   * @param {String} file ファイル名
   * @param {Boolean} requiredResult レース結果の抽出を要求するかどうか
   */
  _extract (file, requiredResult) {
    const fs = require('fs')
    const path = require('path')

    // dom化
    const dom = htmlHelper.toDom(file)
    // jQueryオブジェクト化
    const $ = htmlHelper.toJQueryObj(file)

    // 情報を抽出
    console.log(file)
    let data
    if (requiredResult) {
      data = payoutExtractor.extract(dom, $, path.basename(file, path.extname(file)))
    } else {
      data = futureExtractor.extract(dom, path.basename(file, path.extname(file)))
    }

    // 結果を出力
    fs.writeFileSync(module.exports._genResultFileName(file)
      , JSON.stringify(data, null, '  ')
      , { encoding: 'utf-8' }
    )
  },
  /**
   * @description スクレイピング結果のファイル名を生成します。
   * @param {String} htmlFile HTMLファイル名
   */
  _genResultFileName (htmlFile) {
    return htmlFile
      .replace('/htmls/', '/races/')
      .replace('.html', '.json')
  }
}
