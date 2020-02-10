'use strict'

/**
 * @module 開催済レースのスクレイピング機能を提供します。
 */
module.exports = {
  /**
   * @description HTMLファイル配置ディレクトリ
   */
  HtmlDir: 'resources/htmls/result-races',
  /**
   * @description 除外リスト
   */
  ExcludeRases: [
    '201310010809'
  ],
  /**
   * @description 開催予定レースのスクレイピングを行います。
   * @returns {void}
   */
  scrape () {
    const fs = require('fs')
    const path = require('path')

    // レースページのURLリストを取得
    const files = fs.readdirSync(module.exports.HtmlDir)
      .filter(f => module.exports.ExcludeRases.every(ex => f.indexOf(ex) < 0))
      .map(f => path.join(module.exports.HtmlDir, f))

    // 抽出
    for (const file of files) {
      const retFile = module.exports._genResultFileName(file)
      if (require('@h/file-helper').existsFile(retFile)) {
        console.log(`already exists ${retFile}`)
        continue
      }
      console.log(`scraping start ${file}`)
      module.exports._extract(file)
    }
  },
  /**
   * @description HTMLファイルから必要な情報を抽出します。
   * @param {String} file ファイル名
   */
  _extract (file) {
    const fs = require('fs')
    const path = require('path')

    // dom化
    // const dom = require('@h/html-helper').toDom(file)
    const $ = require('@h/html-helper').toJQueryObj(file)

    // 情報を抽出
    const extractor = require('@ac/result-race-extractor')
    const data = extractor.extract($, path.basename(file, path.extname(file)))
    // dataが空なら対象外
    if (!data) {
      return
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
