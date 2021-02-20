'use strict'

const fileHelper = require('@h/file-helper')

/**
 * @module レースデータペースページのスクレイピング機能を提供します。
 */
module.exports = {
  /**
   * @description ベースURL
   */
  BaseUrl: 'https://db.netkeiba.com',
  /**
   * @description URLリストテキストファイルのパス
   */
  UrlsPath: 'resources/urls/race-database.txt',
  /**
   * @description レースデータペースページのスクレイピングを実行します。
   * @param {Object} params パラメータ
   * @param {String} params.endDate 遡る最過去の日付（YYYYMM）
   * @param {Boolean} params.append 追記かどうか
   * @returns {void}
   */
  async extract (params = {}) {
    const fs = require('fs')
    const endDate = params.endDate
    const append = !!params.append
    console.log(`endDate: ${endDate}`)
    console.log(`append: ${append}`)
    if (!append) {
      fileHelper.delete(module.exports.UrlsPath)
      fileHelper.delete('resources/htmls/race-database/top.html')
    }
    let urls = module.exports._readUrls()

    // トップページをスクレイピング
    let prevPath = await module.exports._extractRaceDatabasePageUrl('/?pid=race_top', 'top', urls)
    let fileName = module.exports._genFileName(prevPath)

    // スクレイピングしていく
    while (Number(endDate) <= Number(fileName)) {
      console.log(fileName)
      prevPath = await module.exports._extractRaceDatabasePageUrl(prevPath, fileName, urls)
      fileName = module.exports._genFileName(prevPath)
    }

    // 重複を排除して保存する
    const _ = require('lodash')
    urls = _.uniq(module.exports._readUrls())
    fs.writeFileSync(module.exports.UrlsPath
      , module.exports._toRows(urls)
      , { encoding: 'utf-8' }
    )
  },
  /**
   * @description レースデータペースページのURLを抽出します。
   * @param {String} path 抽出対象のパス
   * @param {String} fileName ページファイルの保存名
   * @param {Array} urls URLリスト
   * @returns {String} 前月のパス
   */
  async _extractRaceDatabasePageUrl (path, fileName, urls) {
    const downloader = require('@ac/page-downloader')
    const pageFilePath = await downloader.download({
      urls: [
        `${module.exports.BaseUrl}${path}`
      ],
      fileNameGen: () => `resources/htmls/race-database/${fileName}.html`
    })
    console.log(pageFilePath)

    // dom化
    const dom = require('@h/html-helper').toDom(pageFilePath[0])

    // URLを取得
    const _urls = [].slice.call(dom.window.document.querySelectorAll('.race_calendar dd a'))
      .map(tag => `${module.exports.BaseUrl}${tag.href}`)
    const fs = require('fs')
    fs.appendFileSync(module.exports.UrlsPath
      , module.exports._toRows(_urls)
      , { encoding: 'utf-8' }
    )
    urls = urls.concat(_urls)

    // 前月のパスを取得
    const prevPagePath = module.exports._extractPrevPagePath(dom)
    return prevPagePath
  },
  /**
   * @description レースデータベースページのファイル名を生成します。
   * @param {String} url - ファイル名
   */
  _genFileName (url) {
    const name = url.split('&')[1]
      .replace('date=', '')
      .substring(0, 6)
    return name
  },
  /**
   * @description 前月のパスを抽出します。
   * @param {Object} dom - DOM
   * @returns {Array} 前月のURL
   */
  _extractPrevPagePath (dom) {
    const tag = dom.window.document.querySelectorAll('.race_calendar dt .rev a')[1]
    return tag.href
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
