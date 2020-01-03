'use strict'

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
  async scrape () {
    const fs = require('fs')
    const path = require('path')

    // レースページのURLリストを取得
    const files = fs.readdirSync(module.exports.HtmlDir)
      .map(f => path.join(module.exports.HtmlDir, f))

    // 抽出
    for (const file of files) {
      module.exports._extract(file)
    }
  },
  /**
   * @description HTMLファイルから必要な情報を抽出します。
   * @param {String} file ファイル名
   */
  _extract (file) {
    const fs = require('fs')

    // dom化
    const dom = require('@h/html-helper').toDom(file)

    // 情報を抽出
    const extractor = require('@ac/future-race-extractor')
    const data = extractor.extract(dom)
    console.log(data)

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
