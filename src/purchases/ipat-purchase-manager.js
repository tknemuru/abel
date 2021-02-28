'use strict'

const _ = require('lodash')
const ansDefManager = require('@an/answer-def-manager')
const config = require('@/config-manager').get()
const futureDownloader = require('@ac/future-race-page-downloader')
const futurePageClearer = require('@ac/future-page-clearer')
const futureRegister = require('@ac/future-race-register')
const futureScraper = require('@ac/future-race-scraper')
const futureSimulator = require('@s/future-multi-ticket-type-purchase-simulator')
const ipatPurchaser = require('@p/ipat-connect-purchaser')
const learningCollegialInputCreator = require('@an/learning-collegial-input-creator')
const logicHelper = require('@h/logic-helper')
const predAdjuster = require('@an/prediction-result-adjuster')
const predictor = require('@s/predictor')
const purchaseConfig = require('@p/purchase-config')
const sleep = require('thread-sleep')
const watcher = require('@p/race-time-watcher')
const fileHelper = require('@h/file-helper')
const purchaseHelper = require('@h/purchase-helper')

/**
 * @description IPAT連携チケット購入の管理機能を提供します。
 */
module.exports = {
  /**
   * @description IPAT連携チケット購入を実行します。
   * @returns {void}
   */
  async execute () {
    if (config.ipat.init) {
      // 購入時の予測結果ファイルをクリア
      clearPredResults()
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
  let retryCount = 0
  while (retryCount < config.ipat.maxRetryCount) {
    try {
      const targetRaceIds = await watch()
      // const targetRaceIds = ['202106020212']
      // レースページをダウンロード
      await futureDownloader.download({
        raceIds: targetRaceIds
      })
      // スクレイピング実行
      await futureScraper.scrape()
      // レースデータ登録
      await futureRegister.register()
      // 予測情報作成
      await learningCollegialInputCreator.create({
        mode: 'future'
      })
      // 予測実施
      await predictor.predict({
        target: 'collegial'
      })
      // 予測結果整形
      predAdjuster.adjust({
        target: 'collegial'
      })
      // 予測結果の退避（後で結果確認に使用する）
      copyToPurchasePredDir()
      // 購入計画作成
      futureSimulator.simulate(purchaseConfig)
      // IPAT連携購入実行
      await ipatPurchaser.purchase({
        raceIds: targetRaceIds
      })
      break
    } catch (ex) {
      console.error(ex)
      console.error('purchase retry')
      retryCount++
    }
  }
}

/**
 * @description 購入タイミングの監視を行います。
 * @returns {Array} 購入対象レースIDリスト
 */
async function watch () {
  let targetRaceIds = []
  while (targetRaceIds.length <= 0) {
    targetRaceIds = await watcher.watch()
    if (targetRaceIds.length > 0) {
      console.log('start purchase')
    } else {
      console.log('still watch...')
      sleep(config.ipat.watchSpanTime * 60000)
    }
  }
  return targetRaceIds
}

/**
 * @description 購入予測評価値ファイルを規定の場所にコピーします。
 * @returns {void}
 */
function copyToPurchasePredDir () {
  const dir = config.predCollegialPurchaseFileDir
  fileHelper.mkdir(dir)
  mergePredResultsIfExists(
    config.predCollegialPurchaseFilePath,
    config.predCollegialFilePath
  )
  const destPathSet = purchaseHelper.generatePurchasePredPathSet()
  const allDefs = ansDefManager.getAllAnswerDefs()
  for (const def of allDefs) {
    mergePredResultsIfExists(
      destPathSet[def.shortPathKey],
      def.predPath
    )
  }
}

/**
 * @description 予測結果ファイルが存在する場合はマージを行います。
 * @returns {void}
 */
function mergePredResultsIfExists (purchasedPath, newPredPath) {
  if (fileHelper.existsFile(purchasedPath)) {
    const x = fileHelper.readJson(purchasedPath)
    const y = fileHelper.readJson(newPredPath)
    const merged = mergePredResults(x, y)
    fileHelper.writeJson(merged, purchasedPath)
  } else {
    fileHelper.copy(
      newPredPath,
      purchasedPath
    )
  }
}

/**
 * @description 予測結果のマージを行います。
 * @param {Array} xResults マージ対象結果
 * @param {Array} yResults マージ対象結果
 */
function mergePredResults (xResults, yResults) {
  // 新しいyの方を正とする
  const addResults = xResults.filter(
    x => yResults.every(
      y => y.raceId !== x.raceId && y.horseId !== x.horseId
    )
  )
  let mergedResults = _.union(yResults, addResults)
  mergedResults = logicHelper.sort(mergedResults, 'raceId')
  return mergedResults
}

/**
 * @description 購入時の予測ファイルを削除します。
 * @returns {void}
 */
function clearPredResults () {
  fileHelper.deleteAll(config.learningCollegialPurchaseDir)
}
