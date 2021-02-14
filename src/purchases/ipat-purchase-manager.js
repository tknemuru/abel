'use strict'

const config = require('@/config-manager')
const futureDownloader = require('@ac/future-race-page-downloader')
const futurePageClearer = require('@ac/future-page-clearer')
const futureRegister = require('@ac/future-race-register')
const futureScraper = require('@ac/future-race-scraper')
const futureSimulator = require('@s/future-multi-ticket-type-purchase-simulator')
const ipatPurchaser = require('@p/ipat-connect-purchaser')
const learningInputCreator = require('@an/learning-input-creator')
const predAdjuster = require('@an/prediction-result-adjuster')
const predictionConfig = require('@an/configs/prediction-config')
const predictor = require('@s/predictor')
const purchaseHelper = require('@h/purchase-helper')
const sleep = require('thread-sleep')
const watcher = require('@p/race-time-watcher')

/**
 * @description IPAT連携チケット購入の管理機能を提供します。
 */
module.exports = {
  /**
   * @description IPAT連携チケット購入を実行します。
   * @returns {void}
   */
  async execute () {
    const config = getConfig()
    if (config.init) {
      // レースページをクリア
      futurePageClearer.clear()
      // レースページをダウンロード
      await futureDownloader.download()
      // スクレイピング実行
      await futureScraper.scrape()
      // レースデータ登録
      await futureRegister.register({
        clear: true
      })
    }

    // 監視開始
    while (true) {
      await executeWithWatching()
    }
  }
}

/**
 * @description チケット購入を監視して行います。
 * @returns {void}
 */
async function executeWithWatching () {
  const targetRaceIds = await watch()
  // レースページをダウンロード
  await futureDownloader.download({
    raceIds: targetRaceIds
  })
  // スクレイピング実行
  await futureScraper.scrape()
  // レースデータ登録
  await futureRegister.register()
  // 予測向けデータ作成
  await learningInputCreator.create(predictionConfig)
  // 予測実施
  await predictor.predict()
  // 予測結果整形
  predAdjuster.adjust()
  // 購入計画作成
  const purchaseParams = purchaseHelper.getPurchaseParams()
  futureSimulator.simulate(purchaseParams)
  // IPAT連携購入実行
  await ipatPurchaser.purchase({
    raceIds: targetRaceIds
    // raceIds: [
    //   '202105010610'
    // ]
  })
}

/**
 * @description 購入タイミングの監視を行います。
 * @returns {Array} 購入対象レースIDリスト
 */
async function watch () {
  const config = getConfig()
  let targetRaceIds = []
  while (targetRaceIds.length <= 0) {
    targetRaceIds = await watcher.watch()
    if (targetRaceIds.length > 0) {
      console.log('start purchase')
    } else {
      console.log('still watch...')
      sleep(config.watchSpanTime * 10000)
    }
  }
  return targetRaceIds
}

/**
 * @description 設定情報を取得します。
 * @returns {Object} パラメータ
 */
function getConfig () {
  return config.get().ipat
}
