'use strict'

const clearer = require('@ac/result-page-clearer')
const config = require('@/config-manager').get()
const fileHelper = require('@h/file-helper')

/**
 * @module 開催済レースページのダウンロード機能を提供します。
 */
module.exports = {
  /**
   * @description 開催済レースのスクレイピング対象のURLを抽出します。
   * @param {Object} param パラメータ
   * @returns {void}
   */
  async download (params = {}) {
    // レースID指定がされているかどうか
    const specificRaceId = Array.isArray(params.raceIds) && params.raceIds.length > 0
    let urls = []
    if (specificRaceId) {
    // レースIDが指定されている場合は、ファイルをクリアし、直接対象レースのページをダウンロードする
      clearer.clear()
      urls = generateUrlsFromRaceId(params.raceIds)
    } else {
      // レースID未指定時はURLリストファイルからダウンロードする
      urls = readUrlsFromFile()
    }
    for (const url of urls) {
      let fileName = url.split('/')
      fileName = fileName[fileName.length - 2]
      const path = require('path')
      const pageFilePath = path.join(config.resultRaceHtmlDir, `${fileName}.html`)
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
  }
}

/**
 * @description ダウンロード対象のURLをファイルから読み込みます。
 * @returns {Array} ダウンロード対象のURL
 */
function readUrlsFromFile () {
  if (!fileHelper.existsFile(config.resultRaceUrlFilePath)) {
    return []
  }
  const fs = require('fs')
  const urls = fs.readFileSync(
    config.resultRaceUrlFilePath,
    { encoding: 'utf-8' })
    .split('\n')
    .filter(url => url)
  return urls
}

/**
 * @description ダウンロード対象のURLをレースIDから生成します。
 * @returns {Array} ダウンロード対象のURL
 */
function generateUrlsFromRaceId (raceIds) {
  const urls = raceIds.map(raceId => {
    const url = `${config.netkeibaRaceBaseUrl}${config.racePageUrl}${raceId}`
    return url
  })
  return urls
}
