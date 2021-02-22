'use strict'

const config = require('@/config-manager').get()
const clearer = require('@ac/future-page-clearer')
const downloader = require('@ac/page-downloader')
const fileHelper = require('@h/file-helper')
const htmlHelper = require('@h/html-helper')

/**
 * @module 開催予定レースのスクレイピング対象URL抽出機能を提供します。
 */
module.exports = {
  /**
   * @description 開催予定レースのスクレイピング対象のURLを抽出します。
   * @param {Object} param パラメータ
   * @param {Array} param.raceIds ダウンロード対象のレースIDリスト
   * @returns {void}
   */
  async download (params = {}) {
    // レースID指定がされているかどうか
    const specificRaceId = Array.isArray(params.raceIds) && params.raceIds.length > 0
    let urls = []
    if (specificRaceId) {
    // レースIDが指定されている場合は、ファイルをクリアし、直接対象レースのページをダウンロードする
      clearer.clear()
      urls = generateUrlFromRaceId(params.raceIds)
    } else {
      // レースID未指定時はトップページからダウンロードする
      urls = extractUrlFromTopPage()
    }
    console.log(urls)
    // レースページをダウンロード
    await downloader.downloadWithPuppeteer({
      urls,
      fileNameGen: module.exports._getRaceFileName
    })
  },
  /**
   * @description 一覧ページのファイル名を生成します。
   * @returns {String} ファイル名
   */
  _genListFileName () {
    return 'resources/htmls/future-race-list/race-list.html'
  },
  /**
   * @description レースページのファイル名を生成します。
   * @param {String} url - ファイル名
   */
  _getRaceFileName (url) {
    const _url = new URL(url)
    const raceId = _url.searchParams.get('race_id')
    return `resources/htmls/future-races/${raceId}.html`
  },
  /**
   * @description レースのURLを抽出します。
   * @param {Object} dom - DOM
   * @returns {Array} レースのURLリスト
   */
  _extractRaceUrls (dom) {
    const tags = dom.window.document.querySelectorAll('.RaceList_DataItem a')
    const urls = [].slice.call(tags)
      .filter(tag => tag.href.includes('shutuba'))
      .map(tag => tag.href.replace('..', config.netkeibaRaceBaseUrl))
    return urls
  }
}

/**
 * @description ダウンロード対象URLをトップページから抽出します。
 */
async function extractUrlFromTopPage () {
  // レースのトップページをダウンロード
  const fs = require('fs')
  if (fileHelper.existsFile(module.exports._genListFileName())) {
    fs.unlinkSync(module.exports._genListFileName())
  }
  const listPageFileName = await downloader.downloadWithPuppeteer({
    urls: [
      `${config.netkeibaRaceBaseUrl}/top/index.html`
    ],
    fileNameGen: module.exports._genListFileName
  })
  // dom化
  const dom = htmlHelper.toDom(listPageFileName[0])
  // レースのURLを抽出
  const urls = module.exports._extractRaceUrls(dom)
  return urls
}

/**
 * @description レースIDからURLを生成します。
 * @param {Array} raceIds レースIDリスト
 * @returns {Array} URLリスト
 */
function generateUrlFromRaceId (raceIds) {
  const urls = raceIds.map(raceId => {
    const url = `${config.netkeibaRaceBaseUrl}${config.racePageUrl}${raceId}`
    return url
  })
  return urls
}
