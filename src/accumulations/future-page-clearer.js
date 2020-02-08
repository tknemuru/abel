'use strict'

/**
 * @module 開催予定レースページHTMLの削除機能を提供します。
 */
module.exports = {
  /**
   * @description HTMLファイル配置ディレクトリ
   */
  HtmlDir: 'resources/htmls/future-races',
  JsonDir: 'resources/races/future-races',
  /**
   * @description 開催予定レースのスクレイピングを行います。
   * @returns {void}
   */
  clear () {
    const fs = require('fs')
    const path = require('path')

    // HTMLファイルリストを取得
    const htmls = fs.readdirSync(module.exports.HtmlDir)
      .map(f => path.join(module.exports.HtmlDir, f))

    // 削除
    for (const html of htmls) {
      fs.unlinkSync(html)
    }

    // Jsonファイルリストを取得
    const jsons = fs.readdirSync(module.exports.JsonDir)
      .map(f => path.join(module.exports.JsonDir, f))

    // 削除
    for (const json of jsons) {
      fs.unlinkSync(json)
    }
  }
}
