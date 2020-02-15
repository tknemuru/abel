'use strict'

/**
 * @module 開催済レースページのダウンロード機能を提供します。
 */
module.exports = {
  /**
   * @description URLリストテキストファイルのパス
   */
  UrlsPath: 'resources/urls/result-race.txt',
  /**
   * @description 出力先パス
   */
  OutputPath: 'resources/htmls/result-races',
  /**
   * @description 開催予定レースのスクレイピング対象のURLを抽出します。
   * @param {Object} param パラメータ
   * @returns {void}
   */
  async download (params = {}) {
    const urls = module.exports._readUrls()
    for (const url of urls) {
      let fileName = url.split('/')
      fileName = fileName[fileName.length - 2]
      const path = require('path')
      const pageFilePath = path.join(module.exports.OutputPath, `${fileName}.html`)
      console.log(pageFilePath)
      if (require('@h/file-helper').existsFile(pageFilePath)) {
        console.log('file exists skip')
        continue
      }
      const downloader = require('@ac/page-downloader')
      await downloader.download({
        urls: [
          url
        ],
        fileNameGen: () => pageFilePath
      })
    }
  },
  /**
   * @description 前月のパスを抽出します。
   * @param {Object} dom - DOM
   * @returns {Array} 前月のURL
   */
  _readUrls () {
    if (!require('@h/file-helper').existsFile(module.exports.UrlsPath)) {
      return []
    }
    const fs = require('fs')
    const urls = fs.readFileSync(
      module.exports.UrlsPath,
      { encoding: 'utf-8' })
      .split('\n')
      .filter(url => url)
    return urls
  }
}
